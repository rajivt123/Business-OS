import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function uuid(v: unknown): boolean {
  if (typeof v !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const admin = createClient(supabaseUrl, serviceRoleKey);

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

async function companyAccess(userId: string, tenantCompanyId: string) {
  if (!uuid(tenantCompanyId)) {
    throw new Error("Invalid tenant_company_id format");
  }

  const { data: opco, error: opcoErr } = await admin
    .from("tenant_companies")
    .select("tenant_id")
    .eq("id", tenantCompanyId)
    .maybeSingle();

  if (opcoErr || !opco?.tenant_id) {
    throw new Error("Tenant company not found");
  }

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

    const { tenantId } = await companyAccess(currentUser.id, tenant_company_id);

    if (action === "register-document") {
      const {
        document_id,
        title,
        document_type,
        document_number,
        document_date,
        source_file_name,
        is_authoritative,
        metadata
      } = body;

      if (!document_id || !title || !document_type || !source_file_name) {
        return new Response(JSON.stringify({ error: "Missing required document registration parameters" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const docPayload = {
        id: document_id,
        tenant_id: tenantId,
        tenant_company_id: tenant_company_id,
        title: title,
        document_type: document_type,
        document_number: document_number || null,
        document_date: document_date || null,
        source_file_name: source_file_name,
        ingestion_status: 'pending',
        is_authoritative: Boolean(is_authoritative),
        metadata: metadata || {},
        created_by: currentUser.id
      };

      const { data: newDocData, error: insertError } = await admin
        .from('mep_document_examples')
        .insert(docPayload)
        .select()
        .single();

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          document: newDocData,
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
