import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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

  let body: { email?: unknown; role?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
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
    .eq("user_id", callerId)
    .eq("status", "active");

  if (membershipError) return json({ error: "Unable to verify administrator access" }, 500);
  const adminMembership = (memberships || []).find((m) =>
    ["OWNER", "ADMIN"].includes(String(m.role || "").toUpperCase())
  );
  if (!adminMembership?.tenant_id) return json({ error: "Tenant administrator permission required" }, 403);

  const tenantId = adminMembership.tenant_id;
  const { data: existingMembership, error: existingError } = await admin
    .from("tenant_memberships")
    .select("id")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .limit(500);

  if (existingError) return json({ error: "Unable to verify existing tenant membership" }, 500);

  // Prevent creating duplicate active memberships for an existing Auth user/email.
  const { data: existingUserPage, error: usersError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (usersError) return json({ error: "Unable to verify account status" }, 500);
  const existingUser = existingUserPage.users.find((u) => (u.email || "").toLowerCase() === email);
  if (existingUser) {
    const { data: alreadyMember, error: alreadyMemberError } = await admin
      .from("tenant_memberships")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("user_id", existingUser.id)
      .maybeSingle();
    if (alreadyMemberError) return json({ error: "Unable to verify existing membership" }, 500);
    if (alreadyMember) return json({ error: "This email already has a membership in your tenant" }, 409);
    return json({ error: "An account already exists for this email. Ask the account owner to manage access." }, 409);
  }

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

  const { error: insertMembershipError } = await admin.from("tenant_memberships").insert({
    tenant_id: tenantId,
    user_id: userId,
    role: requestedRole,
    status: "active",
  });

  if (insertMembershipError) {
    await admin.auth.admin.deleteUser(userId);
    return json({ error: "Invitation setup failed while assigning tenant access; the pending account was rolled back." }, 500);
  }

  return json({ success: true, email, role: requestedRole });
});
