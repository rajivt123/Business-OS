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
