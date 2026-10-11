# Phase 00 — Isolated Security Validation Matrix

Status: TEST SPECIFICATION ONLY; no production changes authorized. No isolated tests have passed yet. Production has 131 recorded migration versions but GitHub main contains only 7 matching SQL files; 129 versions are missing locally and 5 tracked files are not recorded as applied remotely. Supabase branch automation reports `Remote migration versions not found in local migrations directory`.

## Safety boundary
- Run only against a disposable Supabase branch/project with synthetic users and records.
- Never run write tests against production.
- Do not apply the CRM policy-removal migration to production while the access roster is unresolved.
- Do not merge or deploy either new Edge Function until tests pass.
- Capture setup, request/SQL, expected result, actual result and timestamp for every test.

## A. RLS company/tenant isolation

Create tenants T1/T2, companies T1-A/T1-B/T2-A/T2-B and synthetic users: OWNER-T1, ADMIN-T1, MANAGER-T1-A, TEAM-T1-A, VIEWER-T1-A, TEAM-T1-no-grant, TEAM-T2-A, plus inactive-member and inactive-company cases. Create records for companies, units, works, issues, logs, reminders, profiles, tasks and assignments.

Test before/after legacy permissive policy removal:
1. T1 owner/admin reads T1-A and T1-B only if the established helper grants tenant-wide authority; never T2-A.
2. T1-A member can read assigned-company rows, but cannot read T1-B or T2-A.
3. Active tenant member without a company grant cannot read company rows.
4. Viewer can read assigned-company rows but cannot insert/update/delete protected business rows.
5. Manager/team write behavior matches an explicitly approved per-table permission matrix.
6. Inactive membership/company is denied.
7. Profile self-read and peer-read match intended policies; no global profile reader remains.
8. Direct child-table queries for another company's work (logs, issues, reminders, tasks) are denied.
9. Cross-company UPDATE/DELETE affects zero rows or is denied.
10. Cross-tenant ID/foreign-key substitution is denied without leaking protected row existence.

Test SELECT, INSERT, UPDATE and DELETE independently for each affected table. Verify with real JWT claims; service-role SQL alone does not test RLS.

## B. admin-invite-user

Use a disposable Auth project, test SMTP/inbox and known redirect URLs only.
1. OPTIONS, non-POST, missing/malformed/expired/revoked bearer token.
2. TEAM/VIEWER caller, inactive membership and wrong-tenant admin.
3. OWNER/ADMIN may invite only TEAM, MANAGER or VIEWER; OWNER/ADMIN role requests are rejected.
4. Malformed tenant/company UUID, inactive company and cross-tenant company are rejected before invitation.
5. Invalid JSON/email, whitespace and overlong email are rejected.
6. Valid invitation creates exactly one Auth user, profile, active tenant membership and matching company grant.
7. Verify grant flags for TEAM/MANAGER/VIEWER against the approved permission model.
8. Duplicate email does not create an extra membership or grant.
9. Force profile, membership and grant insert failures; confirm rollback and record that email may already have been sent before rollback.
10. Check profile role mapping against real profile constraints and frontend expectations; legacy profiles.role is not the same as tenant_memberships.role.
11. Confirm verify_jwt is enabled and service-role key never reaches browser/logs.

## C. crm-ai

Use a fake Gemini endpoint or disposable key with strict cost limits.
1. OPTIONS, non-POST, missing/invalid/expired JWT, invalid JSON and missing secrets.
2. Unsupported action; missing chat message; invalid tenant/company/work UUID.
3. No/inactive membership, cross-tenant/inactive company and non-admin without company selection are denied.
4. Non-admin without user_company_access.can_view=true grant is denied.
5. T1-A member cannot obtain T1-B/T2 data by changing work, company or tenant IDs.
6. Summary uses only the selected authorized work and its logs.
7. Chat context contains only authorized-company records; issues/logs/reminders are constrained to the same scope.
8. Global reminders without a work are included only if explicitly approved; validate their tenant/company fields.
9. Prompt-injection text in titles/logs/issues/reminders/user messages cannot override rules or expose other data.
10. Gemini 429/5xx/timeout/empty response returns bounded safe errors; no secrets/raw provider payloads.
11. Add and test server-side rate limiting and request/output limits before broad use; these are current release gaps.
12. Audit every service-role query for explicit tenant/company scope and safe joins.

13. crm-ai actual-body-size guard rejects a body larger than 16 KiB even without Content-Length; malformed JSON returns 400.
14. crm-ai durable limiter allows 10 calls in a 60-second window, rejects the 11th with 429, resets after the window, handles concurrent calls atomically, and fails closed with 503 if the limiter RPC is unavailable.

## D. Migration checks

### master_boq_outputs lockdown
- In isolated DB, confirm RLS and privileges before/after.
- Browser roles cannot directly SELECT/INSERT/UPDATE/DELETE.
- Intended trusted server-side path still works.
- No frontend code relies on direct reads.

### Function search_path pinning
- Compare definitions and behavior before/after.
- Test valid and invalid inputs.
- Confirm referenced objects resolve to intended schemas and behavior is unchanged.

### Legacy CRM policy removal
- Inventory policies before/after in isolated DB.
- Verify remaining narrow policies cover each command/table.
- Run all RLS cases before production rollout.

## E. Git/release gates
- PR #1 remains draft.
- PR branch history was reconciled without force-push/reset; PR #1 currently reports mergeable=true and remains draft.
- Vercel succeeded for commit b7ff8713d3e7345fa4e8247b045d8d2f9dd62107. A later CRM AI source-hardening commit and this matrix/doc update require fresh checks on the newest head.
- The only listed Supabase development branch currently reports MIGRATIONS_FAILED; it is not a valid isolated test environment until diagnosed.
- Production Edge Function inventory does not include admin-invite-user or crm-ai; source-only functions are not deployed/runtime-tested.
- crm-ai source now has field/context bounds, a Content-Length guard, and a 15-second Gemini timeout, but lacks durable server-side rate limiting and a complete streamed-body cap. Deno type-check and runtime tests remain required.
- Run formatting/type checks and Deno type checks for both Edge Functions in a reproducible environment.
- Do not report tests passed without execution evidence.
- Resolve authoritative user/company roster and rajivk assignment mismatch before policy removal.
- Antigravity integrates after backend contracts are validated, then tests invitation, company selection, chat and project summary in isolated environment.

## Current blocker
Production has 67 active memberships (1 OWNER, 66 TEAM); only 2 TEAM memberships have any company view grant. rajivk@metrixengineers.co.in has active assignments under Rajiv Fire Systems Pvt Ltd and test-like work/task names. This requires owner review; it does not authorize granting access or deleting data.

## Evidence log
No tests in this document have been executed. This is a test plan, not a test report.
