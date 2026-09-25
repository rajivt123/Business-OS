import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { S3Client, PutObjectCommand, GetObjectCommand } from "npm:@aws-sdk/client-s3@3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function uuid(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

// Supabase Service Role Admin Client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const admin = createClient(supabaseUrl, serviceRoleKey);

// Cloudflare R2 Credentials
const r2AccountId = Deno.env.get("R2_ACCOUNT_ID") || "";
const r2AccessKeyId = Deno.env.get("R2_ACCESS_KEY_ID") || "";
const r2SecretAccessKey = Deno.env.get("R2_SECRET_ACCESS_KEY") || "";
const r2BucketName = Deno.env.get("R2_BUCKET_NAME") || "business-os-files";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
});

/**
 * Updated JWT verification helper using admin.auth.getClaims(token)
 * Handles asymmetric ES256 and symmetric HS256 tokens reliably.
 */
async function user(req: Request) {
  const h = req.headers.get("Authorization") || "";
  if (!h.startsWith("Bearer ")) throw new Error("Missing authorization");

  const token = h.slice(7).trim();
  if (!token) throw new Error("Missing authorization");

  const { data, error } = await admin.auth.getClaims(token);
  const sub = data?.claims?.sub;

  if (error || typeof sub !== "string" || !uuid(sub)) {
    throw new Error("Invalid or expired session");
  }

  return { id: sub };
}

/**
 * Verify user has membership access to tenant company
 */
async function companyAccess(userId: string, tenantCompanyId: string) {
  if (!uuid(tenantCompanyId)) {
    throw new Error("Invalid tenant_company_id format");
  }

  // 1. Fetch tenant_id for tenant_company
  const { data: opco, error: opcoErr } = await admin
    .from("tenant_companies")
    .select("tenant_id")
    .eq("id", tenantCompanyId)
    .maybeSingle();

  if (opcoErr || !opco?.tenant_id) {
    throw new Error("Tenant company not found");
  }

  // 2. Verify active membership for user in that tenant
  const { data: member, error: memErr } = await admin
    .from("tenant_memberships")
    .select("id, role, status")
    .eq("tenant_id", opco.tenant_id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (memErr || !member) {
    throw new Error("Active tenant membership required");
  }

  return { tenantId: opco.tenant_id, role: member.role };
}

/**
 * Validate that entity_type and entity_id exist and match tenant
 */
async function validateEntity(entityType: string, entityId: string, tenantCompanyId: string) {
  if (!entityType || !entityId) {
    throw new Error("entity_type and entity_id are required");
  }

  // Specific entity type verification
  if (entityType === "work") {
    const { data: work, error } = await admin
      .from("works")
      .select("id, tenant_company_id")
      .eq("id", entityId)
      .maybeSingle();

    if (error || !work) {
      throw new Error(`Work with ID ${entityId} not found`);
    }
  } else if (entityType === "log") {
    const { data: log, error } = await admin
      .from("logs")
      .select("id")
      .eq("id", entityId)
      .maybeSingle();

    if (error || !log) {
      throw new Error(`Log with ID ${entityId} not found`);
    }
  } else if (entityType === "employee_document" || entityType === "employee") {
    if (entityType === "employee") {
      const { data: emp, error } = await admin
        .from("employees")
        .select("id")
        .eq("id", entityId)
        .maybeSingle();
      if (error || !emp) throw new Error(`Employee with ID ${entityId} not found`);
    }
  }

  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const currentUser = await user(req);
    const body = await req.json();
    const { action, tenant_company_id } = body;

    if (!action) {
      return new Response(JSON.stringify({ error: "Action is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!tenant_company_id || !uuid(tenant_company_id)) {
      return new Response(JSON.stringify({ error: "tenant_company_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify company access
    const { tenantId } = await companyAccess(currentUser.id, tenant_company_id);

    // 1. CREATE UPLOAD URL
    if (action === "create-upload-url") {
      const { entity_type, entity_id, field_key, file_name, mime_type, file_size_bytes } = body;
      if (!entity_type || !entity_id || !file_name || !file_size_bytes) {
        return new Response(JSON.stringify({ error: "Missing required upload parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await validateEntity(entity_type, entity_id, tenant_company_id);

      const attachmentId = crypto.randomUUID();
      const sanitizedName = file_name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storageKey = `attachments/${tenant_company_id}/${entity_type}/${entity_id}/${field_key || "file"}/${attachmentId}_${sanitizedName}`;

      const putCmd = new PutObjectCommand({
        Bucket: r2BucketName,
        Key: storageKey,
        ContentType: mime_type || "application/octet-stream",
        ContentLength: file_size_bytes,
      });

      const uploadUrl = await getSignedUrl(s3Client, putCmd, { expiresIn: 3600 });

      return new Response(
        JSON.stringify({
          success: true,
          attachment_id: attachmentId,
          id: attachmentId,
          storage_key: storageKey,
          upload_url: uploadUrl,
          expires_in: 3600,
          tenant_company_id,
          tenant_id: tenantId,
          entity_type,
          entity_id,
          field_key: fieldKey || "file",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. FINALIZE UPLOAD
    if (action === "finalize-upload") {
      const {
        attachment_id,
        entity_type,
        entity_id,
        field_key,
        storage_key,
        file_name,
        mime_type,
        file_size_bytes,
        version,
        metadata,
      } = body;

      if (!attachment_id || !storage_key || !entity_type || !entity_id) {
        return new Response(JSON.stringify({ error: "Missing required finalization parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const insertData = {
        id: attachment_id,
        tenant_id: tenantId,
        tenant_company_id,
        entity_type,
        entity_id: String(entity_id),
        field_key: field_key || "file",
        storage_provider: "r2",
        storage_bucket: r2BucketName,
        storage_key,
        file_name,
        mime_type: mime_type || "application/octet-stream",
        file_size_bytes: file_size_bytes || 0,
        version: version || "1.0",
        metadata: metadata || {},
        is_archived: false,
        created_by: currentUser.id,
      };

      const { data: attachmentRow, error: insertErr } = await admin
        .from("file_attachments")
        .upsert(insertData)
        .select()
        .single();

      if (insertErr) {
        return new Response(JSON.stringify({ error: insertErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          attachment: attachmentRow,
          attachment_id,
          storage_key,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. LIST ATTACHMENTS
    if (action === "list-attachments") {
      const { entity_type, entity_id, field_key, include_archived } = body;

      let query = admin
        .from("file_attachments")
        .select("*")
        .eq("tenant_company_id", tenant_company_id)
        .eq("entity_type", entity_type)
        .eq("entity_id", String(entity_id));

      if (field_key) {
        query = query.eq("field_key", field_key);
      }
      if (!include_archived) {
        query = query.eq("is_archived", false);
      }

      const { data: attachments, error: listErr } = await query.order("created_at", {
        ascending: false,
      });

      if (listErr) {
        return new Response(JSON.stringify({ error: listErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          attachments: attachments || [],
          data: attachments || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. CREATE DOWNLOAD URL
    if (action === "create-download-url") {
      const { attachment_id } = body;
      if (!attachment_id || !uuid(attachment_id)) {
        return new Response(JSON.stringify({ error: "Valid attachment_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: att, error: attErr } = await admin
        .from("file_attachments")
        .select("*")
        .eq("id", attachment_id)
        .eq("tenant_company_id", tenant_company_id)
        .single();

      if (attErr || !att) {
        return new Response(JSON.stringify({ error: "Attachment not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const getCmd = new GetObjectCommand({
        Bucket: att.storage_bucket || r2BucketName,
        Key: att.storage_key,
      });

      const downloadUrl = await getSignedUrl(s3Client, getCmd, { expiresIn: 3600 });

      return new Response(
        JSON.stringify({
          success: true,
          download_url: downloadUrl,
          file_name: att.file_name,
          mime_type: att.mime_type,
          file_size_bytes: att.file_size_bytes,
          expires_in: 3600,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. ARCHIVE ATTACHMENT
    if (action === "archive-attachment") {
      const { attachment_id } = body;
      if (!attachment_id || !uuid(attachment_id)) {
        return new Response(JSON.stringify({ error: "Valid attachment_id is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: updated, error: archiveErr } = await admin
        .from("file_attachments")
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq("id", attachment_id)
        .eq("tenant_company_id", tenant_company_id)
        .select()
        .single();

      if (archiveErr) {
        return new Response(JSON.stringify({ error: archiveErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          archived: updated,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
