import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from "npm:@aws-sdk/client-s3@3.879.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.879.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const MAX_FILE_SIZE = 150 * 1024 * 1024;
const UPLOAD_EXPIRY = 600;
const DOWNLOAD_EXPIRY = 300;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const required = (v: unknown, n: string) => {
  const s = String(v ?? "").trim();
  if (!s) throw new Error(n + " is required");
  return s;
};

const uuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

const safeName = (v: string) =>
  ((v.trim().split(/[\\/]/).pop() || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 180) || "file");

const secret = (n: string) => {
  const v = Deno.env.get(n);
  if (!v) throw new Error("Missing server secret: " + n);
  return v;
};

const supabaseUrl = secret("SUPABASE_URL");
const secretKeys = JSON.parse(secret("SUPABASE_SECRET_KEYS"));
const admin = createClient(supabaseUrl, secretKeys.default, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const s3 = new S3Client({
  region: "auto",
  endpoint: secret("R2_ENDPOINT"),
  credentials: {
    accessKeyId: secret("R2_ACCESS_KEY_ID"),
    secretAccessKey: secret("R2_SECRET_ACCESS_KEY"),
  },
});

const bucket = secret("R2_BUCKET");

async function user(req: Request) {
  const h = req.headers.get("Authorization") || "";
  if (!h.startsWith("Bearer ")) throw new Error("Missing authorization");
  const token = h.slice(7).trim();
  if (!token) throw new Error("Missing authorization");

  const { data, error } = await admin.auth.getClaims(token);
  const sub = data?.claims?.sub;
  if (error || typeof sub !== "string" || !uuid(sub)) throw new Error("Invalid or expired session");
  return { id: sub };
}

async function owner(userId: string, companyId: string) {
  if (!uuid(companyId)) throw new Error("Invalid tenant_company_id");

  const { data: c, error: ce } = await admin
    .from("tenant_companies")
    .select("id,tenant_id,name,status")
    .eq("id", companyId)
    .maybeSingle();

  if (ce) throw ce;
  if (!c) throw new Error("Company not found");
  if (c.status === "archived") throw new Error("Company is archived");

  const { data: m, error: me } = await admin
    .from("tenant_memberships")
    .select("id,role,status")
    .eq("tenant_id", c.tenant_id)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (me) throw me;
  if (!m || String(m.role).toUpperCase() !== "OWNER") {
    throw new Error("Owner authorization required");
  }

  return c;
}

async function main(req: Request) {
  const u = await user(req);
  const b = await req.json();
  const action = required(b.action, "action");

  if (action === "create-upload-url") {
    const c = await owner(u.id, required(b.tenant_company_id, "tenant_company_id"));
    const name = required(b.file_name, "file_name");
    const mime = String(b.mime_type || "application/octet-stream");
    const size = Number(b.file_size_bytes ?? b.file_size ?? 0);

    if (!Number.isSafeInteger(size) || size <= 0 || size > MAX_FILE_SIZE) {
      throw new Error("File size must be between 1 byte and 150 MB");
    }

    const id = crypto.randomUUID();
    const key = `tenants/${c.tenant_id}/companies/${c.id}/documents/${id}/${safeName(name)}`;

    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: mime,
        ContentLength: size,
      }),
      { expiresIn: UPLOAD_EXPIRY },
    );

    return json({
      document_id: id,
      tenant_id: c.tenant_id,
      tenant_company_id: c.id,
      storage_provider: "r2",
      storage_bucket: bucket,
      storage_key: key,
      file_name: name,
      mime_type: mime,
      file_size_bytes: size,
      upload_url: url,
      expires_in: UPLOAD_EXPIRY,
      max_file_size_bytes: MAX_FILE_SIZE,
    });
  }

  if (action === "finalize-upload") {
    const companyId = required(b.tenant_company_id, "tenant_company_id");
    const id = required(b.document_id, "document_id");
    const key = required(b.storage_key, "storage_key");

    if (!uuid(id)) throw new Error("Invalid document_id");

    const c = await owner(u.id, companyId);
    const prefix = `tenants/${c.tenant_id}/companies/${c.id}/documents/${id}/`;

    if (!key.startsWith(prefix)) throw new Error("Invalid storage key");

    const head = await s3.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );

    const actual = Number(head.ContentLength || 0);
    const expected = Number(b.file_size_bytes ?? b.file_size ?? 0);

    if (!Number.isSafeInteger(expected) || expected <= 0 || expected > MAX_FILE_SIZE) {
      throw new Error("Invalid expected file size");
    }

    if (!actual || actual !== expected) {
      throw new Error("Uploaded file size could not be verified");
    }

    const { data: exists } = await admin
      .from("company_documents")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (exists) throw new Error("Document already finalized");

    const row = {
      id,
      tenant_id: c.tenant_id,
      tenant_company_id: c.id,
      document_type: required(b.document_type, "document_type"),
      document_name: String(b.document_name || b.file_name),
      document_number: b.document_number ? String(b.document_number) : null,
      issue_date: b.issue_date ? String(b.issue_date) : null,
      expiry_date: b.expiry_date ? String(b.expiry_date) : null,
      verification_status: "pending",
      storage_provider: "r2",
      storage_bucket: bucket,
      storage_key: key,
      file_url: null,
      file_name: required(b.file_name, "file_name"),
      mime_type: String(b.mime_type || "application/octet-stream"),
      file_size_bytes: actual,
      checksum: head.ETag ? String(head.ETag).replace(/"/g, "") : null,
      version: 1,
      is_current: true,
      is_archived: false,
      notes: b.notes ? String(b.notes) : null,
      uploaded_by: u.id,
    };

    const { data, error } = await admin
      .from("company_documents")
      .insert(row)
      .select("*")
      .single();

    if (error) {
      try {
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      } catch {}
      throw error;
    }

    return json({ document: data });
  }

  if (action === "create-download-url") {
    const companyId = required(b.tenant_company_id, "tenant_company_id");
    const id = required(b.document_id, "document_id");
    const c = await owner(u.id, companyId);

    if (!uuid(id)) throw new Error("Invalid document_id");

    const { data: d, error } = await admin
      .from("company_documents")
      .select("id,tenant_id,tenant_company_id,storage_bucket,storage_key,file_name,mime_type,is_archived")
      .eq("id", id)
      .eq("tenant_id", c.tenant_id)
      .eq("tenant_company_id", c.id)
      .maybeSingle();

    if (error) throw error;
    if (!d || d.is_archived) throw new Error("Document not found");
    if (d.storage_bucket !== bucket || !d.storage_key) {
      throw new Error("Document is not backed by R2");
    }

    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: bucket,
        Key: d.storage_key,
        ResponseContentType: d.mime_type || undefined,
        ResponseContentDisposition: `inline; filename="${safeName(d.file_name || "document")}"`,
      }),
      { expiresIn: DOWNLOAD_EXPIRY },
    );

    return json({
      document_id: id,
      file_name: d.file_name,
      download_url: url,
      expires_in: DOWNLOAD_EXPIRY,
    });
  }

  if (action === "archive-document") {
    const companyId = required(b.tenant_company_id, "tenant_company_id");
    const id = required(b.document_id, "document_id");
    const c = await owner(u.id, companyId);

    if (!uuid(id)) throw new Error("Invalid document_id");

    const { data: d, error } = await admin
      .from("company_documents")
      .select("id,tenant_id,tenant_company_id,storage_bucket,storage_key,is_archived")
      .eq("id", id)
      .eq("tenant_id", c.tenant_id)
      .eq("tenant_company_id", c.id)
      .maybeSingle();

    if (error) throw error;
    if (!d) throw new Error("Document not found");
    if (d.is_archived) return json({ archived: true });

    if (d.storage_bucket === bucket && d.storage_key) {
      await s3.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: d.storage_key,
      }));
    }

    const { error: ue } = await admin
      .from("company_documents")
      .update({
        is_archived: true,
        is_current: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("tenant_id", c.tenant_id)
      .eq("tenant_company_id", c.id);

    if (ue) throw ue;

    return json({ archived: true });
  }

  throw new Error("Unsupported action: " + action);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    return await main(req);
  } catch (e) {
    console.error("[company-document-storage]", e);
    return json(
      { error: e instanceof Error ? e.message : "Storage operation failed" },
      500,
    );
  }
});
