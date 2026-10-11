# Phase 00 — Backend handoff and validation status

Branch: `security/phase00-remove-hardcoded-qa-credential`

## Implemented in source control

- `supabase/functions/admin-invite-user/index.ts` adds an invitation endpoint using the Supabase service role on the server only.
- Requires a bearer token, validates the caller through Supabase Auth claims, checks an active ADMIN/OWNER membership in the specifically requested tenant, and allow-lists TEAM/MANAGER/VIEWER roles.
- It does not allow the caller to create an ADMIN/OWNER membership.
- It creates the Auth invitation, profile, and tenant membership; profile/membership failure triggers a best-effort Auth user rollback.
- `20261011170000_phase00_master_boq_outputs_client_access_lockdown.sql` records RLS enablement and revocation of direct client table privileges. This is a source reconciliation migration; do not blindly reapply it to production.
- `20261011173000_phase00_pin_helper_function_search_path.sql` pins search paths for the two functions previously flagged by Security Advisor.

## Validation still required before deployment

1. Run Deno type-check/lint and test the invitation endpoint against an isolated Supabase project.
2. Verify production Edge Function secrets include `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; do not print secret values.
3. Verify SMTP/invite delivery, redirect URLs, and confirmation settings. The checked-in `supabase/config.toml` is a local template and does not prove production Auth configuration.
4. Test no bearer token (401), invalid token (401), non-admin (403), admin in a different tenant (403), malformed tenant/email/role (400), duplicate email (safe failure), successful invitation, and rollback when profile/membership writes fail.
5. Verify schema constraints and existing profile trigger behavior before any production rollout. Invitation email may be sent before profile/membership persistence; rollback cannot unsend an email.
6. Frontend integration remains pending. Replace the fixed-password UI and call this function with the active tenant ID; remove the shared-password text. Do not call `auth.signUp` for admin-created accounts.
7. AI migration remains pending. Do not send all portfolio rows from the browser to an AI endpoint. First define and test server-side tenant/company scoping for works, logs, issues, reminders, and missing-data context. The Gemini key must be a server-side secret, and requests must use bounded input/output, timeout, and rate limiting.
8. No deployment, migration application, merge, or production data mutation is authorized by this document.

## Known source risks to fix in follow-up

- `fetch_funcs.mjs` has a formatting escape change that should be checked: it now logs a literal `\\n` marker rather than necessarily emitting a leading newline.
- The invitation function should be tested with the deployed Edge Runtime version and actual Supabase Auth behavior before frontend integration.
- The restored live Edge Function snapshots must be diffed against current deployed versions/configuration before any redeploy.
