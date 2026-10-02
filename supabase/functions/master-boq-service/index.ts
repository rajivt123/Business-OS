import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function uuidLike(v: unknown): boolean {
  return typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const admin = createClient(supabaseUrl, serviceRoleKey);

async function authenticate(req: Request) {
  const header = req.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) throw new Error("Missing authorization");
  const token = header.slice(7).trim();
  const { data, error } = await admin.auth.getClaims(token);
  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string" || !uuidLike(sub)) {
    throw new Error("Invalid or expired session");
  }
  return { id: sub };
}

async function companyAccess(userId: string, tenantCompanyId: string, permission: "view" | "edit") {
  if (!uuidLike(tenantCompanyId)) throw new Error("Invalid tenant_company_id format");

  const { data: company, error: companyError } = await admin
    .from("tenant_companies")
    .select("tenant_id,status")
    .eq("id", tenantCompanyId)
    .maybeSingle();

  if (companyError || !company?.tenant_id || company.status !== "active") {
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
      return { tenantId: company.tenant_id, role, canView: true, canEdit: true };
    }

    const { data: access, error: accessError } = await admin
      .from("user_company_access")
      .select("can_view,can_edit")
      .eq("membership_id", membership.id)
      .eq("tenant_company_id", tenantCompanyId)
      .maybeSingle();

    if (accessError) throw new Error("Unable to verify company access");

    const canView = Boolean(access?.can_view);
    const canEdit = Boolean(access?.can_edit);
    if (
      (permission === "view" && (canView || canEdit)) ||
      (permission === "edit" && canEdit)
    ) {
      return { tenantId: company.tenant_id, role, canView, canEdit };
    }
  }

  throw new Error("User does not have required company access");
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getBoqContext(boqId: string, userId: string, permission: "view" | "edit") {
  if (!uuidLike(boqId)) throw new Error("Invalid master_boq_id");

  const { data: boq, error } = await admin
    .from("master_boqs")
    .select("*")
    .eq("id", boqId)
    .maybeSingle();

  if (error || !boq) throw new Error("Master BOQ not found");

  const access = await companyAccess(userId, boq.tenant_company_id, permission);
  if (access.tenantId !== boq.tenant_id) throw new Error("Tenant mismatch");

  return { boq, access };
}

async function createBoq(body: any, userId: string) {
  const tenantCompanyId = body.tenant_company_id;
  const workId = body.work_id;
  if (!tenantCompanyId || !workId || !body.title) {
    throw new Error("tenant_company_id, work_id and title are required");
  }

  const access = await companyAccess(userId, tenantCompanyId, "edit");

  const { data: work, error: workError } = await admin
    .from("works")
    .select("id,tenant_id,tenant_company_id,title")
    .eq("id", workId)
    .maybeSingle();

  if (workError || !work) throw new Error("Work not found");
  if (work.tenant_id !== access.tenantId || work.tenant_company_id !== tenantCompanyId) {
    throw new Error("Work does not belong to the selected operating company");
  }

  // source_document_id must reference public.documents, not a file_attachments id.
  // AI Entry may originate from a work attachment, so ignore attachment UUIDs here
  // instead of allowing a foreign-key failure later.
  let sourceDocumentId: string | null = null;
  if (uuidLike(body.source_document_id)) {
    const { data: sourceDocument } = await admin
      .from("documents")
      .select("id,tenant_id,tenant_company_id")
      .eq("id", body.source_document_id)
      .maybeSingle();
    if (sourceDocument &&
        sourceDocument.tenant_id === access.tenantId &&
        sourceDocument.tenant_company_id === tenantCompanyId) {
      sourceDocumentId = sourceDocument.id;
    }
  }

  let sourceExtractionId: string | null = null;
  if (uuidLike(body.source_extraction_id)) {
    const { data: sourceExtraction } = await admin
      .from("mep_document_extractions")
      .select("id,tenant_id,tenant_company_id,status")
      .eq("id", body.source_extraction_id)
      .maybeSingle();
    if (sourceExtraction &&
        sourceExtraction.tenant_id === access.tenantId &&
        sourceExtraction.tenant_company_id === tenantCompanyId) {
      sourceExtractionId = sourceExtraction.id;
    }
  }

  let lines = Array.isArray(body.lines) ? body.lines : [];

  if (!lines.length && sourceExtractionId) {
    const { data: extractionLines, error: extractionError } = await admin
      .from("mep_extraction_lines")
      .select("id,line_no,raw_description,normalized_description,quantity,uom_code,parsed_attributes,source_page,source_section")
      .eq("extraction_id", sourceExtractionId)
      .order("line_no", { ascending: true });

    if (extractionError) throw new Error(`Unable to load extraction lines: ${extractionError.message}`);
    lines = extractionLines || [];
  }

  const hasRequestedVersion = body.version !== undefined && body.version !== null && String(body.version).trim() !== "";
  let requestedVersion = hasRequestedVersion
    ? (Number.parseInt(String(body.version), 10) || 1)
    : 1;

  if (!hasRequestedVersion) {
    const { data: latestVersionRow, error: latestVersionError } = await admin
      .from("master_boqs")
      .select("version")
      .eq("tenant_id", access.tenantId)
      .eq("tenant_company_id", tenantCompanyId)
      .eq("work_id", workId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestVersionError) {
      throw new Error(`Unable to determine next Master BOQ version: ${latestVersionError.message}`);
    }

    requestedVersion = Number(latestVersionRow?.version || 0) + 1;
  }

  const { data: boq, error: boqError } = await admin
    .from("master_boqs")
    .insert({
      tenant_id: access.tenantId,
      tenant_company_id: tenantCompanyId,
      work_id: workId,
      boq_code: body.boq_code || null,
      title: String(body.title),
      version: requestedVersion,
      status: "draft",
      is_current: false,
      source_document_id: sourceDocumentId,
      source_extraction_id: sourceExtractionId,
      notes: body.notes || null,
      created_by: userId,
    })
    .select()
    .single();

  if (boqError) throw new Error(`Unable to create Master BOQ: ${boqError.message}`);

  if (lines.length) {
    const sourceLineMap = new Map<string, any>();
    const sourceIds = [...new Set(
      lines.map((line:any) => uuidLike(line.source_extraction_line_id)
        ? line.source_extraction_line_id
        : (uuidLike(line.id) && sourceExtractionId ? line.id : null)
      ).filter(Boolean)
    )];

    if (sourceIds.length) {
      const { data: sourceRows, error: sourceRowsError } = await admin
        .from("mep_extraction_lines")
        .select("id,raw_description,normalized_description,uom_code,parsed_attributes,line_type,procurement_scope")
        .in("id", sourceIds)
        .eq("tenant_id", access.tenantId)
        .eq("tenant_company_id", tenantCompanyId);
      if (sourceRowsError) throw new Error("Unable to restore extraction context: " + sourceRowsError.message);
      for (const row of sourceRows || []) sourceLineMap.set(row.id, row);
    }

    const lineRows = lines.map((line: any, index: number) => {
      const sourceId = uuidLike(line.source_extraction_line_id)
        ? line.source_extraction_line_id
        : (uuidLike(line.id) && sourceExtractionId ? line.id : null);
      const source = sourceId ? sourceLineMap.get(sourceId) : null;
      const sourceAttrs = source?.parsed_attributes && typeof source.parsed_attributes === "object"
        ? source.parsed_attributes : {};
      const lineSpec = line.specification && typeof line.specification === "object"
        ? line.specification
        : (line.parsed_attributes && typeof line.parsed_attributes === "object" ? line.parsed_attributes : {});
      const mergedSpec = { ...sourceAttrs, ...lineSpec };
      const rawDescription = String(line.original_description ?? line.raw_description ?? source?.raw_description ?? "").trim();
      const parentDescription = String(
        mergedSpec.parent_description || mergedSpec.parent_context?.description || ""
      ).trim();
      const normalizeText = (t: string) => t.normalize("NFKC").toUpperCase().replace(/\s+/g," ").trim();
      
      const persistedDescription = parentDescription && !normalizeText(rawDescription).includes(normalizeText(parentDescription))
        ? parentDescription + " — " + rawDescription
        : rawDescription;

      return {
      tenant_id: access.tenantId,
      tenant_company_id: tenantCompanyId,
      work_id: workId,
      master_boq_id: boq.id,
      line_no: Number.parseInt(String(line.line_no ?? index + 1), 10) || index + 1,
      original_description: persistedDescription || `Line ${index + 1}`,
      normalized_description: line.normalized_description || null,
      inventory_item_id: uuidLike(line.inventory_item_id) ? line.inventory_item_id : null,
      specification: mergedSpec,
      make: line.make || null,
      model: line.model || null,
      quantity: Number(line.quantity ?? 0) || 0,
      uom_code: line.uom_code || null,
      remarks: line.remarks || null,
      match_status: line.inventory_item_id ? "matched" : "unmatched",
      match_method: line.match_method || null,
      match_confidence: line.match_confidence == null ? null : Number(line.match_confidence),
      match_explanation: line.match_explanation && typeof line.match_explanation === "object"
        ? line.match_explanation
        : {},
      source_extraction_line_id: uuidLike(line.source_extraction_line_id)
        ? line.source_extraction_line_id
        : (uuidLike(line.id) && sourceExtractionId ? line.id : null),
      parent_line_no: line.parent_line_no || line.parent_line_ref || null,
      line_type: ["SECTION","ITEM","NOTE"].includes(String(line.line_type || "").toUpperCase())
        ? String(line.line_type).toUpperCase()
        : "ITEM",
      procurement_scope: ["SUPPLY","INSTALLATION","BOTH"].includes(String(line.procurement_scope || "").toUpperCase())
        ? String(line.procurement_scope).toUpperCase()
        : "BOTH",
      supply_quantity: line.supply_quantity == null ? null : Number(line.supply_quantity),
      supply_uom_code: line.supply_uom_code || null,
      supply_rate: line.supply_rate == null ? null : Number(line.supply_rate),
      supply_amount: line.supply_amount == null ? null : Number(line.supply_amount),
      installation_quantity: line.installation_quantity == null ? null : Number(line.installation_quantity),
      installation_uom_code: line.installation_uom_code || null,
      installation_rate: line.installation_rate == null ? null : Number(line.installation_rate),
      installation_amount: line.installation_amount == null ? null : Number(line.installation_amount),
      line_total_amount: line.line_total_amount == null ? null : Number(line.line_total_amount),
      source_line_ref: line.source_line_ref || null,
      source_po_number: line.source_po_number || null,
      source_wo_number: line.source_wo_number || null,
      source_raw_data: line.source_raw_data && typeof line.source_raw_data === "object" ? line.source_raw_data : {},
      source_document_id: sourceDocumentId,
      source_page_number: Number.isFinite(Number(line.source_page))
        ? Number(line.source_page)
        : null,
      source_row_number: Number.isFinite(Number(line.row_number))
        ? Number(line.row_number)
        : null,
      created_by: userId,
      };
    });

    const { error: linesError } = await admin
      .from("master_boq_lines")
      .insert(lineRows);

    if (linesError) {
      await admin.from("master_boqs").delete().eq("id", boq.id);
      throw new Error(`Unable to create Master BOQ lines: ${linesError.message}`);
    }
  }

  return { boq_id: boq.id, master_boq_id: boq.id, line_count: lines.length, status: boq.status };
}

function learningAlias(value: unknown): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let core = raw
    .replace(/^\s*(?:SUPPLY\s*(?:,|AND)?\s*)?(?:INSTALLATION\s*(?:,|AND)?\s*)?(?:TESTING\s*(?:AND\s*)?)?(?:COMMISSIONING\s*(?:OF)?\s*)?/i, "")
    .replace(/^\s*(?:PROVIDING|PROVIDING\s+AND\s+FIXING)\s+/i, "")
    .split(/\s+(?:INCLUDING|COMPLETE\s+AS\s+PER|ALONG\s+WITH|THE\s+PRICE|PRICE\s+(?:SHALL|IS)|WHEREVER\s+REQUIRED|AS\s+PER\s+THE\s+DIRECTION)\b/i)[0]
    .replace(/\b(?:SUPPLY|INSTALLATION|INSTALLING|TESTING|COMMISSIONING|PROVIDING|FIXING|ERECTION|FABRICATION)\b/gi, " ")
    .replace(/\s+/g, " ").trim();
  return core.normalize("NFKC").toUpperCase().replace(/[^A-Z0-9.]+/g, " ").replace(/\s+/g, " ").trim();
}

async function updateLine(body: any, userId: string) {
  const lineId = body.master_boq_line_id;
  if (!uuidLike(lineId)) throw new Error("master_boq_line_id is required");

  const { data: line, error: lineError } = await admin
    .from("master_boq_lines")
    .select("*")
    .eq("id", lineId)
    .maybeSingle();

  if (lineError || !line) throw new Error("Master BOQ line not found");

  const { boq, access } = await getBoqContext(line.master_boq_id, userId, "edit");

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.inventory_item_id !== undefined) {
    if (body.inventory_item_id !== null && !uuidLike(body.inventory_item_id)) {
      throw new Error("Invalid inventory_item_id");
    }
    updates.inventory_item_id = body.inventory_item_id || null;
    updates.match_status = body.match_status || (body.inventory_item_id ? "verified" : "unmatched");
    updates.match_method = body.match_method || "human";
    updates.match_confidence = body.match_confidence == null ? null : Number(body.match_confidence);
    updates.match_explanation = body.match_explanation == null
      ? {}
      : (typeof body.match_explanation === "object" ? body.match_explanation : { text: String(body.match_explanation) });
  }

  if (body.normalized_description !== undefined) updates.normalized_description = body.normalized_description;
  if (body.specification !== undefined) updates.specification = body.specification;
  if (body.make !== undefined) updates.make = body.make;
  if (body.model !== undefined) updates.model = body.model;
  if (body.quantity !== undefined) updates.quantity = Number(body.quantity);
  if (body.uom_code !== undefined) updates.uom_code = body.uom_code;
  if (body.remarks !== undefined) updates.remarks = body.remarks;

  const decision = body.decision ? String(body.decision) : null;
  if (decision === "verify") {
    if (!updates.inventory_item_id && !line.inventory_item_id) {
      throw new Error("A Master Item must be selected before verification");
    }
    updates.match_status = "verified";
    updates.verified_by = userId;
    updates.verified_at = new Date().toISOString();
  } else if (decision === "reject") {
    updates.match_status = "rejected";
    updates.verified_by = userId;
    updates.verified_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await admin
    .from("master_boq_lines")
    .update(updates)
    .eq("id", lineId)
    .select()
    .single();

  if (updateError) throw new Error(`Unable to update Master BOQ line: ${updateError.message}`);

  if (decision === "verify" || decision === "reject") {
    await admin.from("inventory_item_match_feedback").insert({
      tenant_id: access.tenantId,
      tenant_company_id: boq.tenant_company_id,
      raw_description: line.original_description,
      normalized_description: updated.normalized_description,
      parsed_attributes: updated.specification || {},
      proposed_inventory_item_id: line.inventory_item_id,
      final_inventory_item_id: updated.inventory_item_id,
      match_method: updated.match_method || "human",
      confidence_score: updated.match_confidence,
      decision: decision === "verify" ? "accepted" : "rejected",
      source_type: "master_boq",
      source_id: boq.id,
      source_line_id: lineId,
      reviewer_user_id: userId,
      reviewed_at: new Date().toISOString(),
      created_by: userId,
    });

    const aliasText = String(line.original_description || updated.normalized_description || "").trim();
    const normalizedAlias = learningAlias(aliasText);
    if (normalizedAlias && updated.inventory_item_id) {
      const aliasPayload = {
        tenant_id: access.tenantId,
        tenant_company_id: boq.tenant_company_id,
        inventory_item_id: updated.inventory_item_id,
        alias_text: aliasText,
        normalized_alias: normalizedAlias,
        alias_type: "description",
        source_type: "master_boq_verification",
        source_id: boq.id,
        source_line_id: lineId,
        confidence_score: 1,
        is_verified: true,
        verified_by: userId,
        verified_at: new Date().toISOString(),
        created_by: userId,
        updated_at: new Date().toISOString(),
      };
      const { data: existingAlias } = await admin.from("inventory_item_aliases")
        .select("id")
        .eq("tenant_company_id", boq.tenant_company_id)
        .eq("normalized_alias", normalizedAlias)
        .eq("alias_type", "description")
        .is("party_type", null)
        .is("party_id", null)
        .maybeSingle();
      const aliasWrite = existingAlias
        ? await admin.from("inventory_item_aliases").update(aliasPayload).eq("id", existingAlias.id)
        : await admin.from("inventory_item_aliases").insert({ id: crypto.randomUUID(), ...aliasPayload });
      if (aliasWrite.error) throw new Error(`Unable to persist verified Master Item alias: ${aliasWrite.error.message}`);
    }
  }

  return { line: updated };
}

async function approveBoq(body: any, userId: string) {
  const { boq, access } = await getBoqContext(body.master_boq_id, userId, "edit");

  const { data: lines, error: lineError } = await admin
    .from("master_boq_lines")
    .select("id,line_type,procurement_scope,supply_quantity,match_status,inventory_item_id")
    .eq("master_boq_id", boq.id);

  if (lineError) throw new Error(`Unable to load Master BOQ lines: ${lineError.message}`);
  if (!lines?.length) throw new Error("Cannot approve an empty Master BOQ");

  // Only rows that represent supplied material require a verified stock Master Item.
  // SECTION/NOTE rows and installation-only/service rows are valid without inventory identity.
  const materialLines = lines.filter((line: any) => {
    const type = String(line.line_type || "ITEM").toUpperCase();
    const scope = String(line.procurement_scope || "BOTH").toUpperCase();
    if (type !== "ITEM") return false;
    if (scope === "INSTALLATION") return false;
    return Number(line.supply_quantity ?? 0) > 0 || scope === "SUPPLY" || scope === "BOTH";
  });

  const unresolved = materialLines.filter((line: any) =>
    !line.inventory_item_id || String(line.match_status || "").toLowerCase() !== "verified"
  );

  if (unresolved.length) {
    throw new Error(`Master BOQ has ${unresolved.length} unresolved material line(s). Verify or resolve them before approval.`);
  }

  const now = new Date().toISOString();

  const { error: archiveError } = await admin
    .from("master_boqs")
    .update({ is_current: false, status: "archived", updated_at: now })
    .eq("work_id", boq.work_id)
    .neq("id", boq.id)
    .eq("is_current", true);

  if (archiveError) throw new Error(`Unable to archive previous Master BOQ: ${archiveError.message}`);

  const { data: approved, error: approveError } = await admin
    .from("master_boqs")
    .update({
      status: "approved",
      is_current: true,
      approved_at: now,
      verified_by: userId,
      verified_at: now,
      updated_at: now,
    })
    .eq("id", boq.id)
    .select()
    .single();

  if (approveError) throw new Error(`Unable to approve Master BOQ: ${approveError.message}`);

  return {
    boq: approved,
    approved_by: userId,
    tenant_id: access.tenantId,
  };
}

async function rebuildBoq(body: any, userId: string) {
  const { boq, access } = await getBoqContext(body.master_boq_id, userId, "edit");
  if (boq.status === "approved" || boq.status === "archived") throw new Error("Cannot rebuild an approved or archived BOQ.");

  const newExtractionId = body.source_extraction_id;
  if (!uuidLike(newExtractionId)) throw new Error("source_extraction_id is required for rebuild");

  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!lines.length) throw new Error("No lines provided for rebuild");

  const { data: existingLines, error: existingError } = await admin
    .from("master_boq_lines")
    .select("id,line_no,match_status,inventory_item_id,match_method,match_confidence,match_explanation")
    .eq("master_boq_id", boq.id);

  if (existingError) throw new Error(`Unable to load existing Master BOQ lines: ${existingError.message}`);

  const existingMap = new Map();
  for (const el of existingLines || []) {
    existingMap.set(String(el.line_no), el);
  }

  const normalizeText = (t: string) => t.normalize("NFKC").toUpperCase().replace(/\s+/g," ").trim();

  const lineRows = lines.map((line: any, index: number) => {
    const lineNo = Number.parseInt(String(line.line_no ?? index + 1), 10) || index + 1;
    const existing = existingMap.get(String(lineNo));

    const lineSpec = line.specification && typeof line.specification === "object"
      ? line.specification
      : (line.parsed_attributes && typeof line.parsed_attributes === "object" ? line.parsed_attributes : {});
    const mergedSpec = lineSpec;
    const rawDescription = String(line.original_description ?? line.raw_description ?? "").trim();
    const parentDescription = String(
      mergedSpec.parent_description || mergedSpec.parent_context?.description || ""
    ).trim();
    
    const persistedDescription = parentDescription && !normalizeText(rawDescription).includes(normalizeText(parentDescription))
      ? parentDescription + " — " + rawDescription
      : rawDescription;

    const rowId = existing ? existing.id : crypto.randomUUID();
    const isVerified = existing && (existing.match_status === "verified" || existing.match_status === "rejected");

    return {
      id: rowId,
      tenant_id: access.tenantId,
      tenant_company_id: boq.tenant_company_id,
      work_id: boq.work_id,
      master_boq_id: boq.id,
      line_no: lineNo,
      original_description: persistedDescription || `Line ${lineNo}`,
      normalized_description: line.normalized_description || null,
      inventory_item_id: isVerified ? existing.inventory_item_id : (uuidLike(line.inventory_item_id) ? line.inventory_item_id : null),
      specification: mergedSpec,
      make: line.make || null,
      model: line.model || null,
      quantity: Number(line.quantity ?? 0) || 0,
      uom_code: line.uom_code || null,
      remarks: line.remarks || null,
      match_status: isVerified ? existing.match_status : (line.inventory_item_id ? "matched" : "unmatched"),
      match_method: isVerified ? existing.match_method : (line.match_method || null),
      match_confidence: isVerified ? existing.match_confidence : (line.match_confidence == null ? null : Number(line.match_confidence)),
      match_explanation: isVerified ? existing.match_explanation : (line.match_explanation && typeof line.match_explanation === "object" ? line.match_explanation : {}),
      source_extraction_line_id: uuidLike(line.source_extraction_line_id) ? line.source_extraction_line_id : null,
      parent_line_no: line.parent_line_no || line.parent_line_ref || null,
      line_type: ["SECTION","ITEM","NOTE"].includes(String(line.line_type || "").toUpperCase()) ? String(line.line_type).toUpperCase() : "ITEM",
      procurement_scope: ["SUPPLY","INSTALLATION","BOTH"].includes(String(line.procurement_scope || "").toUpperCase()) ? String(line.procurement_scope).toUpperCase() : "BOTH",
      supply_quantity: line.supply_quantity == null ? null : Number(line.supply_quantity),
      supply_uom_code: line.supply_uom_code || null,
      supply_rate: line.supply_rate == null ? null : Number(line.supply_rate),
      supply_amount: line.supply_amount == null ? null : Number(line.supply_amount),
      installation_quantity: line.installation_quantity == null ? null : Number(line.installation_quantity),
      installation_uom_code: line.installation_uom_code || null,
      installation_rate: line.installation_rate == null ? null : Number(line.installation_rate),
      installation_amount: line.installation_amount == null ? null : Number(line.installation_amount),
      line_total_amount: line.line_total_amount == null ? null : Number(line.line_total_amount),
      source_line_ref: line.source_line_ref || null,
      source_po_number: line.source_po_number || null,
      source_wo_number: line.source_wo_number || null,
      source_raw_data: line.source_raw_data && typeof line.source_raw_data === "object" ? line.source_raw_data : {},
      source_document_id: boq.source_document_id,
      source_page_number: Number.isFinite(Number(line.source_page)) ? Number(line.source_page) : null,
      source_row_number: Number.isFinite(Number(line.row_number)) ? Number(line.row_number) : null,
      created_by: userId,
    };
  });

  const { error: upsertError } = await admin
    .from("master_boq_lines")
    .upsert(lineRows, { onConflict: "id" });

  if (upsertError) throw new Error(`Unable to rebuild Master BOQ lines: ${upsertError.message}`);

  await admin.from("master_boqs").update({ source_extraction_id: newExtractionId }).eq("id", boq.id);

  return { master_boq_id: boq.id, line_count: lineRows.length, status: boq.status };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const user = await authenticate(req);
    const body = await req.json();
    const action = String(body.action || "");

    if (action === "create") return response(await createBoq(body, user.id));

    if (action === "get") {
      const { boq, access } = await getBoqContext(body.master_boq_id, user.id, "view");
      const { data: lines, error } = await admin
        .from("master_boq_lines")
        .select("*")
        .eq("master_boq_id", boq.id)
        .order("line_no", { ascending: true });
      if (error) throw new Error(`Unable to load Master BOQ lines: ${error.message}`);
      return response({ boq, lines, tenant_id: access.tenantId, master_boq_id: boq.id });
    }

    if (action === "update-line") return response(await updateLine(body, user.id));

    if (action === "approve") return response(await approveBoq(body, user.id));

    if (action === "rebuild") return response(await rebuildBoq(body, user.id));

    return response({ error: "Supported actions: create, get, update-line, approve, rebuild" }, 400);
  } catch (err: any) {
    return response({ error: err?.message || "Internal server error" }, 500);
  }
});
