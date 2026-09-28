import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function uuidLike(v: unknown): boolean {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const geminiKey = Deno.env.get("GEMINI_API_KEY") || "";
const admin = createClient(supabaseUrl, serviceRoleKey);

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function authenticate(req: Request) {
  const h = req.headers.get("Authorization") || "";
  if (!h.startsWith("Bearer ")) throw new Error("Missing authorization");
  const { data, error } = await admin.auth.getClaims(h.slice(7).trim());
  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string" || !uuidLike(sub)) throw new Error("Invalid or expired session");
  return { id: sub };
}

async function companyAccess(userId: string, tenantCompanyId: string) {
  const { data: company, error: companyError } = await admin.from("tenant_companies")
    .select("tenant_id,status").eq("id", tenantCompanyId).maybeSingle();
  if (companyError || !company || company.status !== "active") throw new Error("Tenant company not found or inactive");

  const { data: memberships, error: membershipError } = await admin.from("tenant_memberships")
    .select("id,role,status").eq("tenant_id", company.tenant_id).eq("user_id", userId).eq("status", "active");
  if (membershipError || !memberships?.length) throw new Error("Active tenant membership required");

  for (const membership of memberships) {
    const role = String(membership.role || "").toUpperCase();
    if (role === "OWNER" || role === "ADMIN") return { tenantId: company.tenant_id, role };

    const { data: access, error: accessError } = await admin.from("user_company_access")
      .select("can_view,can_edit").eq("membership_id", membership.id).eq("tenant_company_id", tenantCompanyId).maybeSingle();
    if (accessError) throw new Error("Unable to verify company access");
    if (access?.can_edit) return { tenantId: company.tenant_id, role };
  }
  throw new Error("User does not have edit access to this operating company");
}

function base64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  return btoa(binary);
}

function extension(name: string) {
  return (name.split(".").pop() || "").toLowerCase();
}

function numberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function callGemini(parts: any[]) {
  if (!geminiKey) throw new Error("Document AI is not configured: GEMINI_API_KEY is missing in Supabase Edge Function secrets.");

  const schema = {
    type: "OBJECT",
    properties: {
      document_title: { type: "STRING" },
      document_number: { type: "STRING", nullable: true },
      lines: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            line_no: { type: "INTEGER" },
            description: { type: "STRING" },
            quantity: { type: "NUMBER", nullable: true },
            uom: { type: "STRING", nullable: true },
            material_code: { type: "STRING", nullable: true },
            item_type: { type: "STRING", nullable: true },
            domain_code: { type: "STRING", nullable: true },
            make: { type: "STRING", nullable: true },
            model: { type: "STRING", nullable: true },
            hsn_code: { type: "STRING", nullable: true },
            specification: { type: "STRING", nullable: true },
            source_section: { type: "STRING", nullable: true }
          },
          required: ["line_no","description","quantity","uom","material_code","item_type","domain_code","make","model","hsn_code","specification","source_section"]
        }
      }
    },
    required: ["document_title","document_number","lines"]
  };

  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro:generateContent", {
    method: "POST",
    headers: { "x-goog-api-key": geminiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: schema
      }
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || ("Gemini HTTP " + res.status));
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p: any) => p?.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty extraction result.");
  try { return JSON.parse(text); } catch { throw new Error("Gemini returned invalid structured JSON."); }
}

async function extractSpreadsheet(bytes: Uint8Array, fileName: string) {
  const workbook = XLSX.read(bytes, { type: "array", cellDates: true });
  const sheets = workbook.SheetNames.map((name: string) => ({
    sheet: name,
    rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: null, raw: false })
  }));
  const prompt = "You are the Document AI extraction engine for a construction/fire-protection ERP. Extract every real BOQ/material line from every relevant sheet. Ignore titles, headings, subtotal/total rows, page headers, notes and empty rows. Preserve original descriptions. Do not invent missing values. Parse technical specifications into specification. File: " + fileName + "\\nWORKBOOK DATA:\\n" + JSON.stringify(sheets);
  return callGemini([{ text: prompt }]);
}

async function extractBinary(bytes: Uint8Array, mimeType: string, fileName: string) {
  const prompt = "You are the Document AI extraction engine for a construction/fire-protection ERP. Extract every real BOQ/material line. Ignore titles, headings, subtotal/total rows and explanatory notes unless they are real material lines. Preserve original descriptions. Do not invent missing values. Parse technical specifications into specification. File: " + fileName;
  return callGemini([{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64(bytes) } }]);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const user = await authenticate(req);
    const body = await req.json();
    if (body.action !== "extract-master-boq") return response({ error: "Supported action: extract-master-boq" }, 400);

    const tenantCompanyId = String(body.tenant_company_id || "");
    const workId = String(body.work_id || "");
    const sourceUrl = String(body.source_url || "");
    const fileName = String(body.source_file_name || "BOQ");
    const mimeType = String(body.mime_type || "application/octet-stream");
    if (!tenantCompanyId || !workId || !sourceUrl) throw new Error("tenant_company_id, work_id and source_url are required");

    const access = await companyAccess(user.id, tenantCompanyId);
    const { data: work, error: workError } = await admin.from("works")
      .select("id,title,tenant_id,tenant_company_id").eq("id", workId).maybeSingle();
    if (workError || !work) throw new Error("Work not found");
    if (work.tenant_id !== access.tenantId || work.tenant_company_id !== tenantCompanyId) throw new Error("Work does not belong to selected company");

    const url = new URL(sourceUrl);
    const allowedHost = new URL(supabaseUrl).host;
    if (url.host !== allowedHost || !url.pathname.startsWith("/storage/v1/object/public/")) {
      throw new Error("Source document URL is not an approved project document source");
    }

    const fileRes = await fetch(sourceUrl);
    if (!fileRes.ok) throw new Error("Unable to fetch source document (HTTP " + fileRes.status + ")");
    const bytes = new Uint8Array(await fileRes.arrayBuffer());

    const ext = extension(fileName);
    const result = ["xlsx","xls","csv"].includes(ext)
      ? await extractSpreadsheet(bytes, fileName)
      : await extractBinary(bytes, mimeType, fileName);

    const documentId = crypto.randomUUID();
    const { data: document, error: documentError } = await admin.from("mep_document_examples").insert({
      id: documentId, tenant_id: access.tenantId, tenant_company_id: tenantCompanyId,
      title: result.document_title || fileName, document_type: "BOQ",
      document_number: result.document_number || null, source_file_name: fileName,
      ingestion_status: "completed", is_authoritative: false,
      metadata: { source_url: sourceUrl, work_id: workId, mime_type: mimeType, file_size: bytes.byteLength, provider: "gemini", model: "gemini-3.1-pro" },
      created_by: user.id
    }).select().single();
    if (documentError) throw new Error("Unable to register extracted document: " + documentError.message);

    const { data: extraction, error: extractionError } = await admin.from("mep_document_extractions").insert({
      tenant_id: access.tenantId, tenant_company_id: tenantCompanyId, document_example_id: documentId,
      extraction_type: "DOCUMENT_EXTRACTION", provider: "gemini", model_name: "gemini-3.1-pro",
      model_version: "3.1", status: "completed", raw_output: result, confidence_score: 0.8,
      completed_at: new Date().toISOString(), created_by: user.id
    }).select().single();
    if (extractionError) throw new Error("Unable to save extraction: " + extractionError.message);

    const lines = Array.isArray(result.lines) ? result.lines : [];
    const rows = lines.map((line: any, index: number) => ({
      tenant_id: access.tenantId, tenant_company_id: tenantCompanyId, extraction_id: extraction.id,
      line_no: Number.isInteger(line.line_no) ? line.line_no : index + 1,
      source_page: null, source_section: line.source_section || null,
      raw_description: String(line.description || "").trim() || ("Line " + (index + 1)),
      material_code: line.material_code || null, vendor_material_number: null,
      item_type: line.item_type || null, domain_code: line.domain_code || null, category_id: null,
      quantity: numberOrNull(line.quantity), uom_code: line.uom || null, unit_rate: null,
      discount_percent: null, tax_percent: null, hsn_code: line.hsn_code || null,
      tax_profile: {}, parsed_attributes: line.specification ? { raw_specification: line.specification } : {},
      normalized_description: null, candidate_inventory_item_id: null, match_confidence: null,
      match_method: null, match_reasons: [], review_status: "pending"
    }));

    if (rows.length) {
      const { error: lineError } = await admin.from("mep_extraction_lines").insert(rows);
      if (lineError) throw new Error("Unable to save extraction lines: " + lineError.message);
    }

    return response({ success: true, document_id: documentId, extraction_id: extraction.id, line_count: rows.length, provider: "gemini", model: "gemini-3.1-pro" });
  } catch (err: any) {
    return response({ error: err?.message || "Document AI extraction failed" }, 500);
  }
});