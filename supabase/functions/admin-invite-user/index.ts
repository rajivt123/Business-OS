import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { parseInviteRequestBody } from "../_shared/invite-request.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return json({ error: "Server configuration unavailable" }, 500);

  const authorization = req.headers.get("Authorization") || "";
  if (!authorization.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);
  const token = authorization.slice(7).trim();

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: claimsData, error: claimsError } = await admin.auth.getClaims(token);
  const callerId = claimsData?.claims?.sub;
  if (claimsError || typeof callerId !== "string") return json({ error: "Invalid or expired session" }, 401);

  // Enforce the body limit and reject non-object JSON before reading any fields.
  let rawBody: ArrayBuffer;
  try {
    rawBody = await req.arrayBuffer();
  } catch {
    return json({ error: "Unable to read request body" }, 400);
  }
  const parsed = parseInviteRequestBody(rawBody);
  if (!parsed.ok) return json({ error: parsed.error }, parsed.status);
  const body = parsed.body;

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const requestedTenantId = typeof body.tenant_id === "string" ? body.tenant_id.trim() : "";
  const requestedCompanyId = typeof body.tenant_company_id === "string" ? body.tenant_company_id.trim() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedTenantId)) {
    return json({ error: "A valid tenant_id is required" }, 400);
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestedCompanyId)) {
    return json({ error: "A valid tenant_company_id is required" }, 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ error: "Enter a valid email address" }, 400);
  }

  // Invitation roles are deliberately allow-listed. Elevated ADMIN/OWNER assignment
  // must be handled through a separate, explicitly reviewed owner-only workflow.
  const requestedRole = typeof body.role === "string" ? body.role.trim().toUpperCase() : "TEAM";
  const allowedRoles = new Set(["TEAM", "MANAGER", "VIEWER"]);
  if (!allowedRoles.has(requestedRole)) return json({ error: "Role must be TEAM, MANAGER, or VIEWER" }, 400);

  const { data: memberships, error: membershipError } = await admin
    .from("tenant_memberships")
    .select("tenant_id, role, status")
    .eq("tenant_id", requestedTenantId)
    .eq("user_id", callerId)
    .eq("status", "active");

  if (membershipError) return json({ error: "Unable to verify administrator access" }, 500);
  const adminMembership = (memberships || []).find((m) =>
    ["OWNER", "ADMIN"].includes(String(m.role || "").toUpperCase())
  );
  if (!adminMembership?.tenant_id) return json({ error: "Tenant administrator permission required" }, 403);

  const { data: company, error: companyError } = await admin.from("tenant_companies").select("id")
    .eq("id", requestedCompanyId).eq("tenant_id", requestedTenantId).eq("status", "active").maybeSingle();
  if (companyError) return json({ error: "Unable to verify operating company" }, 500);
  if (!company) return json({ error: "Operating company does not belong to this tenant or is inactive" }, 400);

  const tenantId = requestedTenantId;
  // Auth Admin API is the authoritative duplicate-account check. If an account already
  // exists, Supabase returns an error and no membership is granted by this endpoint.
  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email);
  if (inviteError || !inviteData.user) {
    return json({ error: "Invitation could not be sent. Check Supabase Auth email/SMTP configuration and try again." }, 502);
  }

  const userId = inviteData.user.id;
  const profileRole = requestedRole === "MANAGER" ? "Team" : requestedRole === "VIEWER" ? "Viewer" : "Team";
  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email,
    role: profileRole,
  }, { onConflict: "id" });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return json({ error: "Invitation setup failed while creating the user profile; the pending account was rolled back." }, 500);
  }

  const { data: membership, error: insertMembershipError } = await admin.from("tenant_memberships").insert({
    tenant_id: tenantId,
    user_id: userId,
    role: requestedRole,
    status: "active",
  }).select("id").single();

  if (insertMembershipError || !membership) {
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
    return json({ error: "Invitation setup failed while assigning tenant access; the pending account was rolled back." }, 500);
  }

  // A tenant membership alone does not grant access to operating companies for non-admin roles.
  const { error: accessError } = await admin.from("user_company_access").insert({
    tenant_id: tenantId,
    membership_id: membership.id,
    tenant_company_id: requestedCompanyId,
    can_view: true,
    can_edit: requestedRole === "MANAGER" || requestedRole === "TEAM",
  });
  if (accessError) {
    await admin.from("tenant_memberships").delete().eq("id", membership.id);
    await admin.from("profiles").delete().eq("id", userId);
    await admin.auth.admin.deleteUser(userId);
    return json({ error: "Invitation setup failed while assigning operating company access; the pending account was rolled back." }, 500);
  }

  return json({ success: true, email, role: requestedRole, tenant_company_id: requestedCompanyId });
});
