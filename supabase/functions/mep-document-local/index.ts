import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const admin = createClient(supabaseUrl, serviceRoleKey);

function uuidLike(v: unknown): boolean {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function authenticate(req: Request) {
  const h = req.headers.get("Authorization") || "";
  if (!h.startsWith("Bearer ")) throw new Error("Missing authorization");
  const token = h.slice(7).trim();
  const { data, error } = await admin.auth.getClaims(token);
  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string" || !uuidLike(sub)) {
    throw new Error("Invalid or expired session");
  }
  return { id: sub };
}

async function companyAccess(userId: string, tenantCompanyId: string) {
  if (!uuidLike(tenantCompanyId)) throw new Error("Invalid tenant_company_id format");

  const { data: company, error: companyError } = await admin
    .from("tenant_companies")
    .select("tenant_id,status")
    .eq("id", tenantCompanyId)
    .maybeSingle();

  if (companyError || !company || company.status !== "active") {
    throw new Error("Tenant company not found or inactive");
  }

  const { data: memberships, error: membershipError } = await admin
    .from("tenant_memberships")
    .select("id,role,status")
    .eq("tenant_id", company.tenant_id)
    .eq("user_id", userId)
    .eq("status", "active");

  if (membershipError || !memberships?.length) {
    throw new Error("Active tenant membership required");
  }

  for (const membership of memberships) {
    const role = String(membership.role || "").toUpperCase();
    if (role === "OWNER" || role === "ADMIN") {
      return { tenantId: company.tenant_id, role };
    }

    const { data: access, error: accessError } = await admin
      .from("user_company_access")
      .select("can_view,can_edit")
      .eq("membership_id", membership.id)
      .eq("tenant_company_id", tenantCompanyId)
      .maybeSingle();

    if (accessError) throw new Error("Unable to verify company access");
    if (access?.can_edit) return { tenantId: company.tenant_id, role };
  }

  throw new Error("User does not have edit access to this operating company");
}

function extension(name: string) {
  return (name.split(".").pop() || "").toLowerCase();
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function key(value: unknown): string {
  return text(value)
    .toLowerCase()
    .replace(/[\n\r]+/g, " ")
    .replace(/[.:/()\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/,/g, "").replace(/[^0-9.\-]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function normalizeUom(value: unknown): { code: string | null; raw: string | null } {
  const raw = text(value);
  const v = key(value);
  if (!v) return { code: null, raw: null };

  const map: Record<string, string> = {
    nos: "NOS", no: "NOS", number: "NOS", numbers: "NOS", each: "NOS", ea: "NOS",
    pcs: "NOS", pc: "NOS", piece: "NOS", pieces: "NOS",
    m: "MTR", meter: "MTR", meters: "MTR", metre: "MTR", metres: "MTR", mtr: "MTR", mtrs: "MTR",
    rm: "MTR", rmt: "MTR", running: "MTR", "running meter": "MTR", "running metre": "MTR",
    mm: "MM", kg: "KG", kgs: "KG", kilogram: "KG", kilograms: "KG",
    set: "SET", sets: "SET", lot: "LOT",
    ltr: "LTR", liter: "LTR", litre: "LTR", liters: "LTR", litres: "LTR",
    sqm: "SQM", "sq m": "SQM", sqft: "SQFT", "sq ft": "SQFT",
    cm: "CM", ft: "FT", foot: "FT", feet: "FT",
    inch: "IN", inches: "IN", "in": "IN",
    mt: "MT", ton: "MT", tonne: "MT", tonnes: "MT",
  };

  const code = map[v] || null;
  return { code, raw };
}

const HEADER_ALIASES: Record<string, string[]> = {
  line_no: ["sl no", "sl no.", "s no", "s.no", "sr no", "sr no.", "item no", "item no.", "item", "line no", "line"],
  material_code: ["material code", "item code", "item id", "code", "part no", "part number"],
  description: ["description", "item description", "material description", "particulars", "item details", "scope of work", "details"],
  specification: ["specification", "spec", "technical specification", "remarks/specification", "description/specification"],
  quantity: ["qty", "quantity", "required qty", "required quantity", "total qty", "total quantity"],
  uom: ["uom", "unit", "units", "unit of measure", "uom code"],
  make: ["make", "manufacturer", "brand"],
  model: ["model", "model no", "model number"],
  hsn_code: ["hsn", "hsn code", "hsn/sac", "hsn sac", "sac"],
  unit_rate: ["rate", "unit rate", "basic rate", "price", "unit price"],
  amount: ["amount", "total", "value", "line amount", "basic amount"],
};

function matchesAlias(cell: string, alias: string): boolean {
  const c = key(cell);
  const a = key(alias);
  if (!c || !a) return false;
  return c === a || c.includes(a) || a.includes(c);
}

function scoreHeaderRow(row: unknown[]): { score: number; map: Record<string, number> } {
  const map: Record<string, number> = {};
  let score = 0;

  row.forEach((cell, index) => {
    const value = text(cell);
    if (!value) return;
    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (aliases.some((alias) => matchesAlias(value, alias))) {
        if (map[field] === undefined) {
          map[field] = index;
          score += field === "description" ? 4 : field === "quantity" ? 3 : 1;
        }
        break;
      }
    }
  });

  if (map.description === undefined) score -= 5;
  if (map.quantity !== undefined) score += 2;
  if (map.uom !== undefined) score += 1;
  return { score, map };
}

function findHeader(rows: unknown[][]): { rowIndex: number; map: Record<string, number> } | null {
  let best: { rowIndex: number; map: Record<string, number>; score: number } | null = null;
  const limit = Math.min(rows.length, 80);

  for (let i = 0; i < limit; i++) {
    const result = scoreHeaderRow(rows[i] || []);
    if (!result.map.description) continue;
    if (!best || result.score > best.score) {
      best = { rowIndex: i, map: result.map, score: result.score };
    }
  }

  if (!best) return null;
  return { rowIndex: best.rowIndex, map: best.map };
}

function rowValue(row: unknown[], map: Record<string, number>, field: string): string {
  const index = map[field];
  return index === undefined ? "" : text(row[index]);
}

function looksLikeNonItem(description: string): boolean {
  const d = key(description);
  if (!d) return true;

  const patterns = [
    /^total\b/, /^sub total\b/, /^subtotal\b/, /^grand total\b/,
    /^note\b/, /^notes\b/, /^remarks\b/, /^scope of work\b/,
    /^bill of quantities\b/, /^boq\b/, /^description\b/,
    /^page \d+/, /^continued\b/, /^say\b/,
  ];
  return patterns.some((pattern) => pattern.test(d));
}

function looksLikeCategory(description: string, row: unknown[], map: Record<string, number>): boolean {
  if (!description) return true;
  const qty = numberOrNull(row[map.quantity]);
  const uom = normalizeUom(rowValue(row, map, "uom")).code;
  const itemNo = rowValue(row, map, "line_no");
  const materialCode = rowValue(row, map, "material_code");
  const rate = numberOrNull(row[map.unit_rate]);

  if (qty !== null || uom || materialCode || itemNo || rate !== null) return false;
  return description.length < 120;
}


function findCommercialHeader(rows: unknown[][]): {
  rowIndex: number; lineNo: number; description: number; make: number; uom: number; quantity: number;
  supplyRate: number; supplyAmount: number; installationRate: number; installationAmount: number;
  grandTotal: number; reference: number; remarks: number;
} | null {
  for (let i = 0; i < Math.min(rows.length - 1, 60); i++) {
    const top = rows[i] || [];
    const sub = rows[i + 1] || [];
    const t = top.map((v) => key(v));
    const s = sub.map((v) => key(v));
    const find = (...names: string[]) => t.findIndex((v) => names.includes(v));
    const description = find("description");
    const lineNo = find("sr no", "sl no", "s no");
    const make = find("makes considered", "make", "makes");
    const uom = find("uom", "unit");
    const quantity = find("total qty", "total quantity", "qty", "quantity");
    const grandTotal = find("grand total", "total");
    const reference = t.findIndex((v) => v === "ref po wo num" || v.includes("ref po") || v.includes("po wo"));
    const remarks = find("remarks", "remark");
    if (description < 0 || quantity < 0 || grandTotal < 0) continue;

    const supplyParent = t.findIndex((v) => v === "supply" || v.startsWith("supply "));
    const installationParent = t.findIndex((v) => v === "installation" || v.startsWith("installation "));
    const rateCols = s.map((v,idx)=>({v,idx})).filter(x=>x.v==="rate").map(x=>x.idx);
    const amountCols = s.map((v,idx)=>({v,idx})).filter(x=>x.v==="amount").map(x=>x.idx);
    if (rateCols.length < 2 || amountCols.length < 2) continue;

    const supplyRate = supplyParent >= 0 ? (rateCols.find(c=>c>=supplyParent) ?? rateCols[0]) : rateCols[0];
    const installationRate = installationParent >= 0 ? (rateCols.find(c=>c>=installationParent) ?? rateCols[1]) : rateCols[1];
    const supplyAmount = amountCols.find(c=>c>supplyRate) ?? amountCols[0];
    const installationAmount = amountCols.find(c=>c>installationRate) ?? amountCols[1];

    return {rowIndex:i,lineNo:lineNo>=0?lineNo:0,description,make,uom,quantity,
      supplyRate,supplyAmount,installationRate,installationAmount,grandTotal,reference,remarks};
  }
  return null;
}
function parsePoWoReference(value: unknown): { po: string | null; wo: string | null } {
  const raw = text(value);
  if (!raw) return { po: null, wo: null };
  const po = raw.match(/PO\s*[:#\-\/]*\s*([A-Z0-9][A-Z0-9._\-/]*)/i)?.[1] || null;
  const wo = raw.match(/WO\s*[:#\-\/]*\s*([A-Z0-9][A-Z0-9._\-/]*)/i)?.[1] || null;
  return { po, wo };
}

function commercialScope(supplyAmount: number | null, installationAmount: number | null): "SUPPLY" | "INSTALLATION" | "BOTH" {
  const hasSupply = supplyAmount !== null;
  const hasInstallation = installationAmount !== null;
  if (hasSupply && hasInstallation) return "BOTH";
  if (hasSupply) return "SUPPLY";
  if (hasInstallation) return "INSTALLATION";
  return "BOTH";
}

function extractCommercialSheet(sheetName: string, rows: unknown[][]) {
  const header = findCommercialHeader(rows);
  if (!header) return null;

  const lines: any[] = [];
  let parent: { ref: string; description: string } | null = null;

  for (let i = header.rowIndex + 2; i < rows.length; i++) {
    const row = rows[i] || [];
    if (!row.some((cell) => text(cell))) continue;

    const lineRef = text(row[header.lineNo]);
    const description = text(row[header.description]);
    if (!description) continue;

    const qty = numberOrNull(row[header.quantity]);
    const supplyRate = numberOrNull(row[header.supplyRate]);
    const supplyAmount = numberOrNull(row[header.supplyAmount]);
    const installationRate = numberOrNull(row[header.installationRate]);
    const installationAmount = numberOrNull(row[header.installationAmount]);
    const grandTotal = numberOrNull(row[header.grandTotal]);
    const uomInfo = normalizeUom(row[header.uom]);
    const make = header.make >= 0 ? text(row[header.make]) || null : null;
    const remarks = header.remarks >= 0 ? text(row[header.remarks]) || null : null;
    const refValue = header.reference >= 0 ? row[header.reference] : null;
    const refs = parsePoWoReference(refValue);

    const descriptionKey = key(description);
    const isTotalRow = /^(grand total|total|subtotal|sub total|net total)$/.test(descriptionKey);
    const dimensionOnly = isDimensionOnlyDescription(description);
    const technicalParent = isTechnicalParentDescription(description) && !dimensionOnly;
    const hasCommercialValues =
      supplyRate !== null || supplyAmount !== null ||
      installationRate !== null || installationAmount !== null ||
      grandTotal !== null ||
      ((qty !== null && qty > 0) && (Boolean(uomInfo.code) || Boolean(make)));

    if (isTotalRow) continue;

    // Technical context is independent from commercial values.
    // A consultant parent may have rates/quantity, but it can still define the
    // following dimension children.
    if (technicalParent) {
      parent = {
        ref: lineRef || ("PARENT-" + (i + 1)),
        description,
      };
    } else if (!dimensionOnly && hasCommercialValues) {
      // A normal billable item starts a new context boundary. Do not let the
      // previous pipe/valve parent leak into an unrelated item.
      parent = null;
    }

    if (!hasCommercialValues) {
      // Preserve numeric hierarchy rows and technical parent rows as context.
      if (/^\d+(?:\.\d+)*$/.test(lineRef) && !technicalParent) {
        parent = { ref: lineRef, description };
        lines.push({
          line_no: lines.length + 1,
          source_line_ref: lineRef,
          parent_line_ref: null,
          line_type: "SECTION",
          raw_description: description,
          normalized_description: description,
          material_code: null,
          vendor_material_number: null,
          item_type: null,
          domain_code: null,
          category_id: null,
          quantity: null,
          uom_code: uomInfo.code,
          unit_rate: null,
          discount_percent: null,
          tax_percent: null,
          hsn_code: null,
          tax_profile: {},
          parsed_attributes: {
            make,
            model: null,
            raw_specification: null,
            source_uom: uomInfo.raw,
            source_sheet: sheetName,
            source_row: i + 1,
            source_description: description,
            parent_description: null,
            parent_context: null,
            remarks,
          },
          candidate_inventory_item_id: null,
          match_confidence: null,
          match_method: null,
          match_reasons: [],
          review_status: "pending",
          source_page: null,
          source_section: description,
          amount: null,
          procurement_scope: "BOTH",
          supply_quantity: null,
          supply_uom_code: null,
          supply_rate: null,
          supply_amount: null,
          installation_quantity: null,
          installation_uom_code: null,
          installation_rate: null,
          installation_amount: null,
          line_total_amount: null,
          source_po_number: null,
          source_wo_number: null,
          source_raw_data: {
            source_row: i + 1,
            source_line_ref: lineRef,
            description,
            section: true,
          },
        });
      }
      continue;
    }

    const isItem = hasCommercialValues;
    const sourceDescription = description;
    const fullDescription = dimensionOnly && parent
      ? parent.description + " — " + sourceDescription
      : sourceDescription;

    const lineNumber = lines.length + 1;
    lines.push({
      line_no: lineNumber,
      source_line_ref: lineRef || null,
      parent_line_ref: parent?.ref || null,
      line_type: isItem ? "ITEM" : "SECTION",
      raw_description: fullDescription,
      normalized_description: fullDescription,
      material_code: null,
      vendor_material_number: null,
      item_type: null,
      domain_code: null,
      category_id: null,
      quantity: qty,
      uom_code: uomInfo.code,
      unit_rate: supplyRate ?? installationRate,
      discount_percent: null,
      tax_percent: null,
      hsn_code: null,
      tax_profile: {},
      parsed_attributes: {
        make,
        model: null,
        raw_specification: null,
        source_uom: uomInfo.raw,
        source_sheet: sheetName,
        source_row: i + 1,
        source_description: sourceDescription,
        parent_description: parent?.description || null,
        parent_context: parent ? { ref: parent.ref, description: parent.description } : null,
        remarks,
      },
      candidate_inventory_item_id: null,
      match_confidence: null,
      match_method: null,
      match_reasons: [],
      review_status: "pending",
      source_page: null,
      source_section: (dimensionOnly && parent ? parent.description : sheetName),
      amount: grandTotal,
      procurement_scope: commercialScope(supplyAmount, installationAmount),
      supply_quantity: qty,
      supply_uom_code: uomInfo.code,
      supply_rate: supplyRate,
      supply_amount: supplyAmount,
      installation_quantity: qty,
      installation_uom_code: uomInfo.code,
      installation_rate: installationRate,
      installation_amount: installationAmount,
      line_total_amount: grandTotal,
      source_po_number: refs.po,
      source_wo_number: refs.wo,
      source_raw_data: {
        source_row: i + 1,
        source_line_ref: lineRef || null,
        description: sourceDescription,
        make,
        uom: uomInfo.raw,
        quantity: qty,
        supply_rate: supplyRate,
        supply_amount: supplyAmount,
        installation_rate: installationRate,
        installation_amount: installationAmount,
        grand_total: grandTotal,
        ref_po_wo: text(refValue),
        remarks,
      },
    });
  }

  return {
    sheet: sheetName,
    header_row: header.rowIndex + 1,
    header_map: header,
    commercial_mode: "SPLIT",
    extracted_lines: lines,
    extracted_line_count: lines.length,
  };
}


function isDimensionOnlyDescription(description: string): boolean {
  const d = text(description).normalize("NFKC").replace(/["']/g, "").replace(/\\s+/g, " ").trim();
  return /^(?:\\d{1,4}(?:\\.\\d+)?)\\s*(?:mm\\s+nominal\\s+dia|mm\\s+(?:dia|diameter)|nb|nominal\\s+(?:dia|diameter|bore))$/i.test(d)
    || /^(?:dia(?:meter)?\\s*)?\\d{1,4}(?:\\.\\d+)?\\s*(?:mm|nb)$/i.test(d);
}

function isTechnicalParentDescription(description: string): boolean {
  const d = text(description);
  if (!d || isDimensionOnlyDescription(d)) return false;
  if (d.length >= 100) return true;

  const lower = d.toLowerCase();
  const technicalSignals = [
    "supply", "installation", "testing", "commissioning", "pipe", "valve",
    "sprinkler", "hydrant", "pump", "flange", "fitting", "cable", "duct",
    "conduit", "equipment", "approved", "class", "schedule", "is:", "nfpa",
    "ul", "fm"
  ];
  return technicalSignals.filter((signal) => lower.includes(signal)).length >= 2;
}

function extractSheet(sheetName: string, rows: unknown[][]) {
  const header = findHeader(rows);
  if (!header) {
    return {
      sheet: sheetName,
      header_row: null,
      extracted_lines: [],
      ignored_reason: "No BOQ-style header row detected",
    };
  }

  const { rowIndex, map } = header;
  const lines: any[] = [];
  let activeParent: { ref: string; description: string; sourceRow: number } | null = null;

  for (let i = rowIndex + 1; i < rows.length; i++) {
    const row = rows[i] || [];
    if (!row.some((cell) => text(cell))) continue;

    const description = rowValue(row, map, "description");
    if (!description || looksLikeNonItem(description)) continue;

    const quantity = map.quantity === undefined ? null : numberOrNull(row[map.quantity]);
    const unitRate = map.unit_rate === undefined ? null : numberOrNull(row[map.unit_rate]);
    const amount = map.amount === undefined ? null : numberOrNull(row[map.amount]);
    const uomInfo = normalizeUom(rowValue(row, map, "uom"));
    const uom = uomInfo.code;
    const rawUom = uomInfo.raw;
    const lineNoRaw = rowValue(row, map, "line_no");
    const materialCode = rowValue(row, map, "material_code") || null;
    const make = rowValue(row, map, "make") || null;
    const model = rowValue(row, map, "model") || null;
    const specification = rowValue(row, map, "specification") || null;
    const hsnCode = rowValue(row, map, "hsn_code") || null;

    const hasCommercialSignal =
      quantity !== null || Boolean(uom) || Boolean(materialCode) ||
      unitRate !== null || amount !== null;

    const hasItemSignal = hasCommercialSignal || Boolean(lineNoRaw);

    const dimensionOnly = isDimensionOnlyDescription(description);
    const looksLikeParent =
      isTechnicalParentDescription(description) && !dimensionOnly && !hasCommercialSignal;

    if (looksLikeParent) {
      activeParent = {
        ref: lineNoRaw || ("PARENT-" + (i + 1)),
        description,
        sourceRow: i + 1,
      };
      continue;
    }

    // A technical parent remains active even when the parent row itself
    // contains quantity/UOM/rate/amount values. The following dimension rows
    // must inherit the parent description.
    if (!dimensionOnly && hasItemSignal && isTechnicalParentDescription(description) && !looksLikeParent) {
      activeParent = null;
    }

    const parent = dimensionOnly ? activeParent : null;
    const sourceDescription = description;
    const fullDescription = parent
      ? parent.description + " — " + sourceDescription
      : sourceDescription;

    if (!hasItemSignal) continue;

    const numericLine = Number.parseInt(lineNoRaw.replace(/[^0-9]/g, ""), 10);
    const lineNo = Number.isFinite(numericLine) ? numericLine : lines.length + 1;

    lines.push({
      line_no: lineNo,
      raw_description: fullDescription,
      normalized_description: fullDescription,
      material_code: materialCode,
      vendor_material_number: null,
      item_type: null,
      domain_code: null,
      category_id: null,
      quantity,
      uom_code: uom,
      unit_rate: unitRate,
      discount_percent: null,
      tax_percent: null,
      hsn_code: hsnCode,
      tax_profile: {},
      parsed_attributes: {
        make,
        model,
        raw_specification: specification,
        source_uom: rawUom,
        source_sheet: sheetName,
        source_row: i + 1,
        source_description: sourceDescription,
        parent_description: parent?.description || null,
        parent_context: parent ? { ref: parent.ref, description: parent.description } : null,
      },
      candidate_inventory_item_id: null,
      match_confidence: null,
      match_method: null,
      match_reasons: [],
      review_status: "pending",
      source_page: null,
      source_section: parent?.description || sheetName,
      amount,
      parent_line_ref: parent?.ref || null,
      line_type: "ITEM",
      procurement_scope: "BOTH",
      supply_quantity: quantity,
      supply_uom_code: uom,
      supply_rate: unitRate,
      supply_amount: amount,
      installation_quantity: null,
      installation_uom_code: null,
      installation_rate: null,
      installation_amount: null,
      line_total_amount: amount,
      source_po_number: null,
      source_wo_number: null,
    });
  }

  return {
    sheet: sheetName,
    header_row: rowIndex + 1,
    header_map: map,
    extracted_lines: lines,
  };
}

async function checksum(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeSourceUrl(sourceUrl: string) {
  const url = new URL(sourceUrl);
  const allowedHost = new URL(supabaseUrl).host;
  if (url.host !== allowedHost || !url.pathname.startsWith("/storage/v1/object/public/")) {
    throw new Error("Source document URL is not an approved project document source");
  }
  return url;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const currentUser = await authenticate(req);
    const body = await req.json();

    if (body.action !== "extract-master-boq-local") {
      return response({ error: "Supported action: extract-master-boq-local" }, 400);
    }

    const tenantCompanyId = String(body.tenant_company_id || "");
    const workId = String(body.work_id || "");
    const sourceUrl = String(body.source_url || "");
    const fileName = String(body.source_file_name || "BOQ.xlsx");
    const mimeType = String(body.mime_type || "application/octet-stream");

    if (!tenantCompanyId || !workId || !sourceUrl) {
      return response({ error: "tenant_company_id, work_id and source_url are required" }, 400);
    }

    const { tenantId } = await companyAccess(currentUser.id, tenantCompanyId);

    const { data: work, error: workError } = await admin
      .from("works")
      .select("id,title,tenant_id,tenant_company_id")
      .eq("id", workId)
      .maybeSingle();

    if (workError || !work) throw new Error("Work not found");
    if (work.tenant_id !== tenantId || work.tenant_company_id !== tenantCompanyId) {
      throw new Error("Work does not belong to selected company");
    }

    const ext = extension(fileName);
    if (!["xlsx", "xls", "csv"].includes(ext)) {
      throw new Error("Local BOQ extraction currently supports XLSX, XLS and CSV. PDF/OCR will use the next document engine.");
    }

    safeSourceUrl(sourceUrl);

    const fileRes = await fetch(sourceUrl);
    if (!fileRes.ok) throw new Error(`Unable to fetch source document (HTTP ${fileRes.status})`);
    const bytes = new Uint8Array(await fileRes.arrayBuffer());
    if (!bytes.length) throw new Error("Source document is empty");
    if (bytes.length > 25 * 1024 * 1024) throw new Error("Source spreadsheet exceeds the 25 MB local extraction limit");

    const sourceChecksum = await checksum(bytes);

    const { data: existingDocs } = await admin
      .from("mep_document_examples")
      .select("id")
      .eq("tenant_company_id", tenantCompanyId)
      .eq("work_id", workId)
      .eq("source_file_checksum", sourceChecksum)
      .eq("source_provider", "local_deterministic")
      .order("created_at", { ascending: false })
      .limit(1);

    if (existingDocs?.[0]?.id) {
      const { data: existingExtraction } = await admin
        .from("mep_document_extractions")
        .select("id,status")
        .eq("document_example_id", existingDocs[0].id)
        .eq("provider", "local_deterministic")
        .eq("model_name", "boq-spreadsheet-parser-v5-commercial")
        .eq("model_version", "3")
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingExtraction) {
        const { count } = await admin
          .from("mep_extraction_lines")
          .select("id", { count: "exact", head: true })
          .eq("extraction_id", existingExtraction.id);

        return response({
          success: true,
          already_existed: true,
          document_id: existingDocs[0].id,
          extraction_id: existingExtraction.id,
          line_count: count || 0,
          provider: "local_deterministic",
          model: "boq-spreadsheet-parser-v5-commercial",
        });
      }
    }

    const workbook = XLSX.read(bytes, {
      type: "array",
      cellDates: true,
      raw: false,
      dense: true,
    });

    const sheetResults = workbook.SheetNames.map((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        raw: false,
        blankrows: false,
      }) as unknown[][];
      return extractCommercialSheet(sheetName, rows) || extractSheet(sheetName, rows);
    });

    const lines = sheetResults.flatMap((sheet) => sheet.extracted_lines);
    if (!lines.length) {
      throw new Error("No BOQ item rows were detected. Check that the spreadsheet contains a description column and item/quantity/unit data.");
    }

    // Reuse the existing source document when the same file checksum already exists.
    // One source document can have multiple parser/extraction versions.
    let document: any = null;

    if (existingDocs?.[0]?.id) {
      const { data: existingDocument, error: existingDocumentError } = await admin
        .from("mep_document_examples")
        .select("id")
        .eq("id", existingDocs[0].id)
        .single();

      if (existingDocumentError || !existingDocument) {
        throw new Error("Unable to reuse existing local BOQ document: " + (existingDocumentError?.message || "unknown error"));
      }
      document = existingDocument;

      await admin.from("mep_document_examples").update({
        ingestion_status: "extracted",
        metadata: {
          mime_type: mimeType,
          file_size: bytes.byteLength,
          extraction_engine: "boq-spreadsheet-parser-v5-commercial",
          sheet_count: workbook.SheetNames.length,
          sheet_names: workbook.SheetNames,
          extracted_line_count: lines.length,
        },
        updated_at: new Date().toISOString(),
      }).eq("id", document.id);
    } else {
      const documentId = crypto.randomUUID();
      const { data: createdDocument, error: documentError } = await admin
        .from("mep_document_examples")
        .insert({
          id: documentId,
          tenant_id: tenantId,
          tenant_company_id: tenantCompanyId,
          document_type: "boq",
          title: work.title ? work.title + " - " + fileName : fileName,
          document_number: null,
          source_file_name: fileName,
          source_file_checksum: sourceChecksum,
          source_provider: "local_deterministic",
          source_reference: sourceUrl,
          work_id: workId,
          content_text: null,
          metadata: {
            mime_type: mimeType,
            file_size: bytes.byteLength,
            extraction_engine: "boq-spreadsheet-parser-v5-commercial",
            sheet_count: workbook.SheetNames.length,
            sheet_names: workbook.SheetNames,
            extracted_line_count: lines.length,
          },
          ingestion_status: "extracted",
          is_authoritative: false,
          created_by: currentUser.id,
        })
        .select("id")
        .single();

      if (documentError || !createdDocument) {
        throw new Error("Unable to register local BOQ document: " + (documentError?.message || "unknown error"));
      }
      document = createdDocument;
    }

    const rawOutput = {
      engine: "boq-spreadsheet-parser-v1",
      deterministic: true,
      external_ai_called: false,
      source_checksum: sourceChecksum,
      sheets: sheetResults.map((sheet) => ({
        sheet: sheet.sheet,
        header_row: sheet.header_row,
        header_map: sheet.header_map || null,
        extracted_line_count: sheet.extracted_lines.length,
        ignored_reason: sheet.ignored_reason || null,
      })),
      line_count: lines.length,
    };

    const { data: extraction, error: extractionError } = await admin
      .from("mep_document_extractions")
      .insert({
        tenant_id: tenantId,
        tenant_company_id: tenantCompanyId,
        document_example_id: document.id,
        extraction_type: "line_items",
        provider: "local_deterministic",
        model_name: "boq-spreadsheet-parser-v5-commercial",
        model_version: "5",
        status: "completed",
        raw_output: rawOutput,
        confidence_score: 1,
        completed_at: new Date().toISOString(),
        created_by: currentUser.id,
      })
      .select("id")
      .single();

    if (extractionError || !extraction) {
      await admin.from("mep_document_examples").delete().eq("id", document.id);
      throw new Error(`Unable to save local extraction: ${extractionError?.message || "unknown error"}`);
    }

    const lineRows = lines.map((line, index) => ({
      tenant_id: tenantId,
      tenant_company_id: tenantCompanyId,
      extraction_id: extraction.id,
      line_no: index + 1,
      source_page: line.source_page,
      source_section: line.source_section,
      raw_description: line.raw_description,
      material_code: line.material_code,
      vendor_material_number: line.vendor_material_number,
      item_type: line.item_type,
      domain_code: line.domain_code,
      category_id: line.category_id,
      quantity: line.quantity,
      uom_code: line.uom_code,
      unit_rate: line.unit_rate,
      discount_percent: line.discount_percent,
      tax_percent: line.tax_percent,
      hsn_code: line.hsn_code,
      tax_profile: line.tax_profile,
      parsed_attributes: line.parsed_attributes,
      normalized_description: line.normalized_description,
      candidate_inventory_item_id: line.candidate_inventory_item_id,
      match_confidence: line.match_confidence,
      match_method: line.match_method,
      match_reasons: line.match_reasons,
      review_status: line.review_status,
      parent_line_ref: line.parent_line_ref,
      line_type: ["SECTION","ITEM","NOTE"].includes(String(line.line_type || "").toUpperCase()) ? String(line.line_type).toUpperCase() : "ITEM",
      procurement_scope: ["SUPPLY","INSTALLATION","BOTH"].includes(String(line.procurement_scope || "").toUpperCase()) ? String(line.procurement_scope).toUpperCase() : "BOTH",
      supply_quantity: line.supply_quantity,
      supply_uom_code: line.supply_uom_code,
      supply_rate: line.supply_rate,
      supply_amount: line.supply_amount,
      installation_quantity: line.installation_quantity,
      installation_uom_code: line.installation_uom_code,
      installation_rate: line.installation_rate,
      installation_amount: line.installation_amount,
      line_total_amount: line.line_total_amount,
      source_line_ref: line.source_line_ref,
      source_po_number: line.source_po_number,
      source_wo_number: line.source_wo_number,
    }));

    const { error: lineError } = await admin.from("mep_extraction_lines").insert(lineRows);
    if (lineError) {
      await admin.from("mep_document_extractions").delete().eq("id", extraction.id);
      await admin.from("mep_document_examples").delete().eq("id", document.id);
      throw new Error(`Unable to save local extraction lines: ${lineError.message}`);
    }

    return response({
      success: true,
      already_existed: false,
      document_id: document.id,
      extraction_id: extraction.id,
      line_count: lineRows.length,
      provider: "local_deterministic",
      model: "boq-spreadsheet-parser-v5-commercial",
      external_ai_called: false,
      sheets: sheetResults.map((sheet) => ({
        sheet: sheet.sheet,
        header_row: sheet.header_row,
        extracted_line_count: sheet.extracted_lines.length,
      })),
    });
  } catch (err) {
    console.error("[mep-document-local] error:", err);
    return response({ error: err?.message || "Local BOQ extraction failed" }, 500);
  }
});
