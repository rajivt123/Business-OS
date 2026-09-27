import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { determineExtractionStrategy } from "../../../src/lib/mep/extraction/documentStrategyRouter.js";
import { createRawExtractionEnvelope } from "../../../src/lib/mep/extraction/extractionEnvelope.js";

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

    if (!action || !tenant_company_id || !uuid(tenant_company_id)) {
      return new Response(JSON.stringify({ error: "action and valid tenant_company_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { tenantId } = await companyAccess(currentUser.id, tenant_company_id);

    // 1. PREPARE
    if (action === "prepare") {
      const { document_id } = body;
      if (!document_id) throw new Error("document_id required");

      const { data: doc, error: docErr } = await admin
        .from('mep_document_examples')
        .select('id, tenant_company_id')
        .eq('id', document_id)
        .eq('tenant_company_id', tenant_company_id)
        .maybeSingle();
      
      if (docErr || !doc) throw new Error("Document not found or unauthorized");

      // Check active job
      const { data: existing, error: existErr } = await admin
        .from('mep_document_extractions')
        .select('*')
        .eq('document_example_id', document_id)
        .eq('extraction_type', 'DOCUMENT_EXTRACTION')
        .in('status', ['pending', 'processing', 'in_progress', 'running'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ success: true, extraction: existing, already_existed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const extPayload = {
        tenant_id: tenantId,
        tenant_company_id: tenant_company_id,
        document_example_id: document_id,
        extraction_type: 'DOCUMENT_EXTRACTION',
        provider: 'pending',
        status: 'pending',
        created_by: currentUser.id
      };

      const { data: newJob, error: insertError } = await admin
        .from('mep_document_extractions')
        .insert(extPayload)
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505' || insertError.message?.toLowerCase().includes('unique')) {
           const { data: fallback } = await admin
            .from('mep_document_extractions')
            .select('*')
            .eq('document_example_id', document_id)
            .in('status', ['pending', 'processing', 'in_progress', 'running'])
            .maybeSingle();
           if (fallback) {
             return new Response(JSON.stringify({ success: true, extraction: fallback, already_existed: true }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
             });
           }
        }
        throw new Error(`Failed to initialize extraction job: ${insertError.message}`);
      }

      return new Response(JSON.stringify({ success: true, extraction: newJob, already_existed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. EXECUTE
    if (action === "execute") {
      const { job_id, worker_id } = body;
      if (!job_id) throw new Error("job_id required");

      const startedAt = new Date().toISOString();
      const workerId = worker_id || `worker_${crypto.randomUUID().slice(0, 8)}`;

      // Claim job
      const { data: claimedJob, error: claimErr } = await admin
        .from('mep_document_extractions')
        .update({ status: 'processing', started_at: startedAt })
        .eq('id', job_id)
        .eq('status', 'pending')
        .eq('tenant_company_id', tenant_company_id)
        .select()
        .single();
      
      if (claimErr || !claimedJob) {
        throw new Error("Job already claimed / not pending / not found");
      }

      try {
        const { data: document, error: docErr } = await admin
          .from('mep_document_examples')
          .select('*')
          .eq('id', claimedJob.document_example_id)
          .eq('tenant_company_id', tenant_company_id)
          .single();
        if (docErr || !document) throw new Error("Document not found");

        const strategyResolution = determineExtractionStrategy({
          documentType: document.document_type,
          fileName: document.source_file_name,
          mimeType: document.metadata?.mime_type
        });

        const warnings = [];
        if (strategyResolution.isDeferred) {
          warnings.push(`Extraction strategy "${strategyResolution.strategy}" is deferred.`);
        }

        const rawEnvelope = createRawExtractionEnvelope({
          document: {
            document_type: document.document_type || 'OTHER',
            document_number: document.document_number || null,
            document_date: document.document_date || null,
            title: document.title || 'Untitled Document'
          },
          lines: [],
          totals: { subtotal: null, tax_amount: null, grand_total: null, currency: 'INR' },
          metadata: {
            strategy: strategyResolution.strategy,
            provider: 'dry_run_contract',
            model_name: 'phase_4a_contract_worker',
            model_version: '1.0.0',
            worker_id: workerId,
            execution_mode: 'dry_run_contract_validation',
            source_attachment_id: document.metadata?.file_attachment_id || null,
            source_file_name: document.source_file_name || null,
            file_size_bytes: document.metadata?.file_size || null,
            is_deferred: strategyResolution.isDeferred,
            external_ai_called: false,
            processed_at: new Date().toISOString()
          },
          warnings
        });

        const updatePayload = {
          status: 'completed',
          completed_at: new Date().toISOString(),
          provider: 'dry_run_contract',
          model_name: 'phase_4a_contract_worker',
          model_version: '1.0.0',
          confidence_score: 1.0,
          raw_output: rawEnvelope,
          error_message: null
        };

        const { data: finalJob, error: updateErr } = await admin
          .from('mep_document_extractions')
          .update(updatePayload)
          .eq('id', job_id)
          .select()
          .single();
        
        if (updateErr) throw new Error(`Update failed: ${updateErr.message}`);

        return new Response(JSON.stringify({ success: true, job: finalJob, strategy: strategyResolution.strategy, provider: 'dry_run_contract' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } catch (err: any) {
        console.error("Execution failed", err);
        await admin
          .from('mep_document_extractions')
          .update({ status: 'failed', completed_at: new Date().toISOString(), error_message: err.message })
          .eq('id', job_id);
        throw err;
      }
    }

    // 3. CANCEL
    if (action === "cancel") {
      const { job_id } = body;
      if (!job_id) throw new Error("job_id required");

      const { data: updatedJob, error: updateErr } = await admin
        .from('mep_document_extractions')
        .update({ status: 'cancelled', completed_at: new Date().toISOString(), error_message: 'Cancelled by user' })
        .eq('id', job_id)
        .eq('tenant_company_id', tenant_company_id)
        .in('status', ['pending', 'processing', 'in_progress', 'running'])
        .select()
        .single();
      
      if (updateErr || !updatedJob) {
        throw new Error("Job not found or already terminal");
      }

      return new Response(JSON.stringify({ success: true, job: updatedJob }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. RETRY
    if (action === "retry") {
      const { job_id } = body;
      if (!job_id) throw new Error("job_id required");

      const { data: oldJob, error: oldErr } = await admin
        .from('mep_document_extractions')
        .select('*')
        .eq('id', job_id)
        .eq('tenant_company_id', tenant_company_id)
        .single();
      
      if (oldErr || !oldJob) throw new Error("Old job not found");
      if (!['failed', 'cancelled', 'completed'].includes(oldJob.status)) {
         throw new Error("Source job must be terminal");
      }

      // Check active
      const { data: existing, error: existErr } = await admin
        .from('mep_document_extractions')
        .select('*')
        .eq('document_example_id', oldJob.document_example_id)
        .eq('extraction_type', 'DOCUMENT_EXTRACTION')
        .in('status', ['pending', 'processing', 'in_progress', 'running'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ success: true, extraction: existing, already_existed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const extPayload = {
        tenant_id: tenantId,
        tenant_company_id: tenant_company_id,
        document_example_id: oldJob.document_example_id,
        extraction_type: 'DOCUMENT_EXTRACTION',
        provider: 'pending',
        status: 'pending',
        created_by: currentUser.id
      };

      const { data: newJob, error: insertError } = await admin
        .from('mep_document_extractions')
        .insert(extPayload)
        .select()
        .single();

      if (insertError) throw new Error(`Retry failed: ${insertError.message}`);

      return new Response(JSON.stringify({ success: true, extraction: newJob, already_existed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
