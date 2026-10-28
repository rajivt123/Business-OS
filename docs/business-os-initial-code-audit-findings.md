# Business OS — Initial Code Audit Findings

Audit date: 2026-10-28
Repository: rajivt123/Business-OS
Baseline reviewed: main at 0afb163604e173954f3212c460ac3b45e5ac9c58 unless noted.
Scope: source inspection only. No production database writes.

## Confirmed findings

### F-001 — Admin role change is not reliably persisted as one operation (P0)
Files:
- src/components/crm/Modals.jsx — AdminControlPanelModal role dropdown calls handleUpdateUserRole without awaiting/displaying a save result.
- src/context/CrmContext.jsx — handleUpdateUserRole directly updates public.profiles.role, then separately attempts to synchronize public.tenant_memberships.role/status.
Evidence:
- Profile update uses `supabase.from('profiles').update({ role: newRole }).eq('id', userId).select()`.
- Tenant membership SELECT/UPDATE/INSERT results are not checked for `error`; only thrown exceptions are caught. Supabase query errors are returned as values, not normally thrown. Thus the UI can report no failure while tenant role synchronization failed.
- The handler updates local profile state after the profile update, even if tenant-membership synchronization fails.
- Role mapping collapses values into ADMIN/MANAGER/TEAM/VIEWER, while the UI also exposes legacy strings such as Team, admin, member, guest, and custom roles. These role vocabularies need one authoritative contract.
- The role dropdown displays `profile.role`, not the authoritative membership role. This can disagree with access checks that use `tenant_memberships`.
Impact: a selected role can appear saved but revert after reload, or UI role can disagree with actual tenant authorization. Screenshot evidence from the owner shows role reverting to a guest/normal role.
Required remediation:
1. Define canonical tenant roles and allowed transitions; do not accept arbitrary custom roles for authorization.
2. Replace direct client-side privileged role writes with a server-authoritative, tenant-scoped RPC or Edge Function requiring an authenticated OWNER/ADMIN and enforcing an allowlist.
3. Update profile/membership state transactionally or make one table authoritative with a documented compatibility mapping.
4. Return explicit success/error to UI; disable control while saving; refresh from authoritative membership after success; revert optimistic state and show the error on failure.
5. Add regression tests: change role, reload, role remains; denied unauthorized change; cross-tenant change denied; membership write failure surfaces; pending count correct.
Status: Confirmed source defect; fix not yet applied.

### F-002 — Add-user path contains a hard-coded shared password (P0 security)
File: src/context/CrmContext.jsx — handleAdminCreateUser.
Evidence: calls `supabase.auth.signUp({ email: cleanEmail, password: 'crm12345' })` and displays that default password in the UI.
Impact: shared/default credential exposure and unsafe provisioning. PR #1 proposes a server-side invitation flow, but the baseline main branch still contains this code. Verify candidate branch actually removes all references and uses the secure invite function before release.
Status: Confirmed on main baseline; PR #1 must be reviewed and tested before merge.

### F-003 — Pending count is based on legacy profile role strings (P1)
File: src/components/crm/Modals.jsx — AdminControlPanelModal.
Evidence: `pendingProfiles = profiles.filter(p => !p.role || p.role.toLowerCase() === 'guest' || p.role.toLowerCase() === 'pending')`.
Impact: the badge counts profile records whose role strings match this legacy list, not necessarily pending tenant membership/invitation status. Screenshot shows the count changing between screenshots (64 then 65); that may be data changes, filtering, or the wrong source of truth. Must reconcile against authoritative invitation/membership status before deciding which records are actually pending.
Status: Confirmed logic mismatch risk; exact count root cause requires runtime/data inspection.

### F-004 — Role changes lack reliable user feedback and concurrency control (P1)
File: src/components/crm/Modals.jsx — handleRoleChangeSelect.
Evidence: calls handleUpdateUserRole without awaiting it, no row-level saving state, and no visible success/failure feedback.
Impact: the user cannot distinguish saved role from a local/failed update and can trigger overlapping updates.
Status: Confirmed source behavior.


### F-005 — Admin-created user flow does not call the secure invitation function (P0)
Files:
- `src/context/CrmContext.jsx` — `handleAdminCreateUser`
- `src/components/crm/Modals.jsx` — Add User UI
- `supabase/functions/admin-invite-user/index.ts` — secure function exists in source, but repository search found no frontend invocation.
Evidence:
- The browser calls `supabase.auth.signUp` with the shared password `crm12345`.
- It then upserts `profiles` and inserts `tenant_memberships` directly from the client.
- Membership insert errors are not checked; the catch does not catch normal Supabase returned error objects.
- It does not create the `user_company_access` grant required by the new company-scoped authorization model.
- The secure `admin-invite-user` Edge Function has a constrained role allowlist and verifies caller membership/tenant/company, but the current Add User UI does not invoke it.
Impact: Add User can report success when tenant membership or company-access setup failed, may create an account without required operating-company access, and uses unsafe credential provisioning.
Status: Confirmed source/integration gap. The secure function's own runtime behavior and SMTP configuration remain untested.

### F-006 — Tenant context assumes a user has at most one active tenant membership (P1)
File: `src/context/CrmContext.jsx` — `initializeAuthAndTenantContext`.
Evidence: selects active memberships by `user_id` and `status='active'`, then calls `.maybeSingle()` without selecting a tenant or resolving multiple memberships.
Impact: if the intended multi-tenant model allows a user to belong to multiple tenants, the query can return a multiple-row error. The code logs the error but continues with no resolved tenant and no tenant role, potentially leaving the user in a partially initialized workspace. If the intended model truly allows only one active tenant per user, that invariant must be enforced by database constraints and documented; current code alone does not prove it.
Status: Conditional defect requiring schema/constraint confirmation and a multi-tenant acceptance test.

### F-007 — Global profile list is coupled to broad profile-read policies (P1 security/compatibility)
Files:
- `src/context/CrmContext.jsx` — `fetchProfiles` runs `profiles.select('*')` without tenant scoping.
- `src/components/crm/Modals.jsx` — Admin Control Panel builds All Teammates and Pending from that list.
- `supabase/migrations/20261011180000_phase00_remove_legacy_permissive_crm_policies.sql` on PR #1 removes global profile-reader policies.
Evidence:
- Frontend loads every profile it is allowed to read and uses the resulting rows for admin user management and pending counts; it does not derive the list from tenant memberships scoped to the active tenant.
- The Phase 00 migration explicitly proposes removing global profile readers. If the frontend remains unchanged, the Admin Control Panel may lose access to teammate profiles, or the broad list may expose profile metadata across tenant boundaries while the permissive policy remains.
Impact: a security hardening migration and the existing UI are not yet integrated. The correct design is a server/RLS-scoped tenant membership listing with only necessary profile fields.
Status: Confirmed source design gap; exact live exposure depends on current policies. Do not apply the migration until frontend/RLS integration and access tests are complete.

### F-008 — Authentication initialization has two competing role sources (P1)
Files: `src/App.jsx` and `src/context/CrmContext.jsx`.
Evidence:
- Root `App.jsx` fetches only `profiles.role` and defaults to `guest` on missing profile/error.
- `CrmContext.jsx` separately loads active `tenant_memberships`, then falls back to `profiles.role` through `normalizeRole`.
- Role mapping supports legacy profile strings and canonical tenant roles, but the Admin UI permits arbitrary custom role strings. The Edge Function only allows TEAM/MANAGER/VIEWER for invitations and deliberately excludes ADMIN/OWNER.
Impact: the app can display different role values across root initialization, CRM context and Admin Control Panel. A profile role must not be treated as the authorization source when tenant membership is authoritative.
Status: Confirmed duplicate-source design; define one canonical role contract and explicit compatibility rules.

### F-009 — Sign-up and password recovery need lifecycle acceptance tests (P1)
File: `src/App.jsx`.
Evidence:
- Self-sign-up uses `supabase.auth.signUp` and reports “Access requested” without verifying that a pending membership/invitation record exists.
- Password reset redirects to `${window.location.origin}/#reset-password`; success depends on Supabase Auth URL allowlists and recovery settings.
- The Auth listener can call `fetchRole` while the initial `getSession()` path also calls it; initialization ordering and loading/error state should be tested for race conditions.
Impact: sign-up may create an Auth user without an application membership/profile state, and reset behavior may differ by environment/configuration. No live test was performed.
Status: Needs isolated runtime tests; not yet confirmed as runtime failures.

### F-010 — User termination is implemented as a role string rather than a complete revocation workflow (P1)
Files: `src/context/CrmContext.jsx` — `handleTerminateUser` and `handleUpdateUserRole`.
Evidence:
- Termination routes through `handleUpdateUserRole(userId, 'terminated')`.
- The handler first updates `profiles.role`, then attempts to set the current tenant membership inactive; errors from the membership update are not checked.
- If no membership row exists, it skips insertion (correctly avoids re-activating a terminated user), but does not revoke company-access rows, invalidate existing sessions, or show a verified revocation result.
Impact: the UI may indicate termination while active membership/company grants or existing sessions remain usable depending on backend policy enforcement.
Status: Confirmed incomplete client workflow; actual session/access revocation behavior needs isolated authorization tests.

## Module 1 severity summary

- **P0 — Must fix before freeze:** F-001 role write is non-atomic and hides membership errors; F-002/F-005 hard-coded-password Add User path and missing secure invitation integration.
- **P1 — Must resolve or explicitly accept with evidence:** F-003 pending count source, F-004 missing save feedback, F-006 multi-tenant cardinality assumption, F-007 profile list/RLS integration, F-008 competing role sources, F-009 signup/recovery lifecycle, F-010 complete termination/revocation.
- These findings are based on source inspection and prior review-only policy/migration artifacts. They are not a substitute for a live authorization test matrix. No production data was modified.

## Cross-check questions for owner review

1. Can the same login belong to multiple tenants, and if so, should the user choose a tenant after sign-in?
2. Which roles are officially supported at tenant level: OWNER, ADMIN, MANAGER, TEAM, VIEWER only? Are custom labels display-only, never authorization roles?
3. Should Add User always send an invitation email and require the user to set their own password?
4. Does termination mean immediate tenant/company access revocation and session invalidation, or merely disabling one tenant membership?
5. Should Pending count invitation status, inactive/pending membership status, or an explicit approval request? It should not be inferred from a profile role string.
6. Which operating companies should an invited TEAM/MANAGER/VIEWER be granted access to by default? The secure invite function currently requires one explicit company.

## Repository-wide audit approach

Audit each feature across four layers:
1. UI event and state/loading/error behavior.
2. Context/service request and schema contract.
3. Supabase authorization: RLS, grants, RPC/Edge Function permissions, tenant/company scoping.
4. End-to-end tests: success, invalid input, duplicate retry, unauthorized access, cross-tenant denial, reload persistence, and reporting/reconciliation.

## Audit backlog (not yet fully inspected)

- Authentication, reset-password and invitation lifecycle.
- Tenant/company selection, memberships, role normalization, all RLS-sensitive queries.
- CRM/customer/contact/unit/work/task/issue/log/reminder flows and attachments.
- Sales, tax, invoices and receivables.
- Procurement, purchase bills, vendor/item integrity and tax.
- Inventory, adjustments, movement, approvals and stock reconciliation.
- HR, employee master, policies, recruitment, attendance and leave.
- Payroll, statutory deductions, payroll posting, payslips and Form 16.
- Approval Center and employee-change atomic RPC integration.
- Accounts, journals, bank transactions, transfers, reversals, AR/AP and financial reports.
- Documents/storage access, signed URLs and cross-company boundaries.
- Reports/exports, dashboard metrics, notifications, My Work and admin/company settings.
- RAJIV AI, MEP knowledge, Master BOQ parser, rate limits and Verify & Apply.
- CI coverage, migration reconciliation, deployment configuration, secrets and recovery process.

Do not describe the app as production-ready until critical flows and release gates have test evidence. Source presence, a green build, or a READY preview is not sufficient.
