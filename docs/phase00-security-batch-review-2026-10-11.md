# Phase 00 — Security Batch Review (2026-10-11)

## Current release state

- GitHub PR: https://github.com/rajivt123/Business-OS/pull/1
- Branch: `security/phase00-remove-hardcoded-qa-credential`
- Reviewed head before this batch: `b7ff8713d3e7345fa4e8247b045d8d2f9dd62107`
- Latest Vercel status on that head: **success**. This is a frontend/Vercel check only; it does not type-check or execute Supabase Edge Functions.
- PR is still **draft** and was reported mergeable after the branch-history reconciliation.
- Production Supabase project is healthy, but its only listed development branch reports `MIGRATIONS_FAILED`. Do not treat that branch as a valid isolated test environment until the failure is diagnosed.
- Production Edge Function inventory does **not** contain `admin-invite-user` or `crm-ai`. Their checked-in code is not deployed or runtime-tested.
- No production migration or Edge Function deployment was performed in this batch.

## Code review and source changes

### `crm-ai`

The source already verifies the caller JWT, requires an active membership in the requested tenant, validates an active tenant-owned company, checks `user_company_access.can_view` for non-elevated roles, and explicitly scopes service-role CRM queries by tenant and selected company. The project-summary path scopes the work to the selected company when one is supplied.

This batch added:
- A 16 KiB Content-Length rejection guard (413) before JSON parsing when the header is present and valid.
- Per-field limits for project metadata, stages, issue titles, log content, and reminder text before context is serialized to Gemini.
- A 15-second timeout on the outbound Gemini request.
- A limit of eight open issue titles per project and 60 pending reminders in the final AI context.

These are source-level changes only. They have **not** been Deno type-checked or runtime-tested. The Content-Length check is not a complete streamed-body limit when clients omit the header. Server-side rate limiting is still missing and remains a release blocker for broad use. The current service-role query strategy and company/tenant isolation still require tests with real JWTs in an isolated project.

### `admin-invite-user`

Source review confirms bearer-token validation, active tenant-scoped OWNER/ADMIN authorization, an allowlist of TEAM/MANAGER/VIEWER, and active same-tenant company validation before creating the invitation. It then creates a profile, active tenant membership, and company-view grant. Rollback is best-effort; an invitation email already sent cannot be unsent.

Not yet tested: Auth invite/SMTP/redirect behavior, duplicate email, profile triggers/constraints, role mapping, grant flags, failure rollback, and behavior under the deployed Edge Runtime. Do not deploy before these checks pass.

## Production security evidence

Latest read-only Security Advisor findings:
- 7 RLS-enabled tables/views without policies, including `master_boq_outputs` (expected to be inaccessible to client roles pending a verified trusted path; confirm whether the remaining six are internal-only).
- 2 functions with mutable search_path: `apply_canonical_master_item_to_boq_line` and `derive_canonical_master_code`. The proposed migration pins these, but behavior must be tested before applying.
- 1 anon-executable SECURITY DEFINER RPC: `submit_recruitment_application`. Its public token-based workflow may be intentional; inspect the complete authorization/token/expiry/limit path before revoking access.
- 89 SECURITY DEFINER functions executable by authenticated users. This is an inventory signal, not a blanket-revoke list: each function's authorization and intended caller must be reviewed individually.
- Leaked-password protection is disabled in Supabase Auth; enable after reviewing the expected user sign-in impact.
- The CRM company-access audit remains a hard blocker: 67 active memberships (1 OWNER, 66 TEAM), only 2 TEAM users with any company-view grant, and 64 without grants. Do not remove broad policies until the authoritative access roster is reconciled and regression-tested.
- `rajivk@metrixengineers.co.in` has six active assignment rows associated with Rajiv Fire Systems Pvt Ltd, but no view grant for that company. Review the assignments; do not automatically grant or delete.
- The Supabase development branch currently reports `MIGRATIONS_FAILED`, so it is not evidence of successful isolated migration/test execution.

## Required next batch gates

1. Diagnose and restore a clean disposable Supabase branch/project. Do not use production for write tests.
2. Deno type-check/lint both new Edge Functions; run request/authorization/error tests with synthetic users and a bounded/fake Gemini endpoint.
3. Add durable server-side rate limiting and a hard streamed request-body cap to `crm-ai`, then test timeout/429/5xx paths.
4. Verify the invitation role/profile mapping and SMTP/redirect configuration in isolation.
5. Build the two-tenant, two-company RLS regression matrix for SELECT/INSERT/UPDATE/DELETE, profile visibility, child tables, inactive memberships, and cross-tenant IDs.
6. Obtain an authoritative company-access roster; resolve the 64 missing TEAM grants and the Rajiv Fire Systems assignment mismatch without bulk-granting access.
7. Only after the above, consider the three security migrations in isolation. Do not blindly replay the two restored October 4 migrations; they are source reconciliation snapshots.
8. Antigravity frontend integration is still pending: remove the shared-password account creation flow and browser-side Gemini calls using `docs/phase00-antigravity-frontend-handoff.md`. Validate browser behavior after backend tests, not before.

## What was and was not done

Done in this batch:
- Rechecked PR mergeability and current-head Vercel status.
- Rechecked production Edge Function inventory, Security Advisor, migration inventory, and development branch state.
- Reviewed the full `crm-ai` and `admin-invite-user` source files.
- Added bounded context fields, a best-effort request-size guard, and a Gemini timeout to `crm-ai`.

Not done:
- No production database writes, migrations, or function deployments.
- No user/company grants changed and no accounts deleted.
- No isolated test passed; tests remain pending.
- No PR merge and no frontend changes.
