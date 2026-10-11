# Phase 00 — Security remediation batch (review required)

## Added in this branch
1. Removed hard-coded QA credential from the helper; runtime credentials are environment variables.
2. Restored deployed Edge Function and migration source files for source reconciliation only. These snapshots are not instructions to redeploy or reapply migrations.
3. Added a master_boq_outputs client-access lockdown migration.
4. Added search_path hardening for two helper functions.
5. Added an admin invitation endpoint with tenant-scoped admin authorization and a role allowlist. It has not been runtime-tested or deployed.
6. Added crm-ai Edge Function source. Contract: action is chat or summarize_project; tenant_id is required; tenant_company_id is optional; work_id is required for summaries; message is required for chat. The endpoint verifies the caller token, active tenant membership, company ownership within the tenant, and builds its context server-side with explicit tenant/company filters before calling GEMINI_API_KEY. It has not been runtime-tested or deployed. Frontend integration remains assigned to Antigravity.
7. Added a migration removing observed legacy permissive policies on companies, issues, logs, and global profile reading. This is a high-impact security change: do not apply to production until isolated regression tests prove authorized tenant users retain required CRUD access and cross-tenant/anonymous reads are denied.
8. Added a read-only company-access preflight at supabase/audits/phase00_company_access_preflight.sql. Live audit showed 68 active TEAM memberships but only 2 memberships with any can_view company grant (OWNER memberships are handled separately). Removing broad policies before reconciling access grants is likely to disrupt existing TEAM users; access mapping/backfill and testing are a prerequisite, not optional cleanup.
9. Hardened crm-ai company scoping: non-OWNER/ADMIN callers must provide an active operating company and have an explicit user_company_access can_view grant for it. Tenant-wide AI access is restricted to OWNER/ADMIN.
10. Hardened invitation setup to require a tenant-owned active operating company and create a matching user_company_access grant for the new membership.

## Required Edge Function secrets
- GEMINI_API_KEY — server-side only, never VITE-prefixed.
- SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY — supplied by the Edge Function runtime.

## Isolated tests before deployment

### crm-ai
- no bearer token -> 401
- invalid/expired JWT -> 401
- no active tenant membership -> 403
- active member can summarize an in-scope project
- project from another tenant -> 404
- company ID from another tenant -> 403
- company-filtered chat excludes other operating companies
- malformed action/UUID/message -> 400
- missing Gemini secret -> 503; upstream 429 -> 429
- prompt and result limits remain enforced

### RLS migration
- anonymous read of companies/issues/logs denied
- tenant A cannot read/write tenant B records
- tenant peers can read permitted profile data
- each existing role retains only intended CRUD permissions
- service-role workflows continue to work

### admin invitation
- no/invalid token -> 401
- non-admin and cross-tenant admin -> 403
- invalid payload -> 400
- duplicate email safe failure
- success sends invite and assigns only allowlisted role
- profile/membership failure rolls back pending Auth user
- verify SMTP, invite redirect URLs, and production Auth confirmation settings

## Release gate
Do not merge, deploy Edge Functions, or apply migrations to production based on source review alone. Run CI/build/lint and the isolated access matrix first. Confirm credential rotation and Git-history remediation for any previously exposed password separately; removing it from the current file does not erase Git history.


## Company access rollout gate
The current production state has a substantial company-access coverage gap. Run the read-only preflight and reconcile intended company grants before applying the legacy-policy removal migration. Do not auto-grant every active user access to every company; use an authoritative user-to-company mapping.