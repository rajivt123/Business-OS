# Business OS — Core Release Master Checklist

**Plan decision (2026-10-28):** Finish the existing core app first; defer new features. Prioritize balanced security, core workflows, and delivery speed.

## Working rules
- This is the single release checklist. Update statuses only when backed by evidence; UI appearance alone is not proof of completion.
- Work on Git branches and Vercel previews. Do not merge PRs, deploy production, run production migrations, or mutate production data without Rajiv's explicit authorization.
- Antigravity owns most UI/UX implementation; ChatGPT owns backend/code audit, targeted fixes, test design, and release tracking.
- Every item ends with pass, fail/defect, blocked, or not yet tested.
- PR #4 includes Accounts changes from PR #3; do not merge #3 separately without reviewing overlap.
- PR #1 contains broader security/repository reconciliation work. PR #2 contains approval snapshot-conflict changes; review overlap with PR #1 before merge.

## Release gates
- [ ] **G0 — Baseline inventory:** record main SHA, open PR heads/bases, CI, latest preview, active modules, and environment blockers.
- [ ] **G1 — Tenant/company isolation:** test multiple authorized scopes and prove cross-tenant/company reads and writes are denied; verify role permissions.
- [ ] **G2 — Core workflows:** test create → update → submit/post → review/approve → report where applicable, including invalid input and duplicate retries.
- [ ] **G3 — Accounting integrity:** journals balance; ledger totals reconcile with reports; reversals/idempotency work; bank transactions and AR/AP control accounts reconcile.
- [ ] **G4 — Security and migration readiness:** review RLS/RPC grants, Edge Function auth/secrets, sensitive-document access, migration history and recovery plan. No blind migration replay or reset.
- [ ] **G5 — Automated checks:** build, lint where applicable, regression tests, Edge Function type checks, disposable PostgreSQL tests; record gaps where safe isolated infrastructure is unavailable.
- [ ] **G6 — Preview acceptance:** owner tests critical workflows on the exact candidate commit and records evidence.
- [ ] **G7 — Production release approval:** obtain explicit authorization before merge/release or production DB changes; deploy in dependency order and smoke-test.

## Current workstream tracker

Status meanings: **In progress** = active PR/work; **Needs validation** = code/UI exists but end-to-end acceptance is not evidenced; **Audit required** = inspect behavior before classification; **Release blocker** = known risk to safe release.

| Priority | Workstream | Evidence / status | Exit criteria |
|---|---|---|---|
| P0 | Accounts dashboard and general ledger | **In progress.** PR #4 includes PR #3's nested financial RPC mapping, actual journal statuses, ledger-derived bank closing balance, scoped queries, and RPC diagnostics. TEST — Accounts Validation preview now renders P&L, balance sheet, cash/bank movement, AR/AP and a Balanced check after selecting a specific company. | Test journal posting, ledger detail, date boundaries, trial balance, bank balance, receipt/payment, transfer/reconciliation, reversal, AR/AP controls and error states. No fabricated React totals. |
| P0 | PR/release dependency management | **Release blocker.** PR #3 and #4 overlap; PR #1 and #2 both include approval-related work. | Compare changed files, bases, CI and dependencies; define one merge order and resolve conflicts before any merge. |
| P0 | Supabase migration history/recovery | **Release blocker.** Prior audit reports 131 remote migration versions versus 7 SQL migration files on main; 129 remote versions lacked matching local files. | Reconcile authoritative history and source; document safe recovery and forward-only plan. No reset/repair/replay until proven safe. |
| P0 | Tenant/company access and RLS | **Audit required / release blocker.** PR #1 reports 67 active memberships and 64 TEAM memberships without company-view grants; authoritative roster and least-privilege behavior need verification before removing legacy policies. | Test owner/admin/manager/team/viewer across tenant and company scopes; reconcile grants against authoritative access roster. |
| P0 | Approval Center / employee change requests | **In progress, not end-to-end secured.** PR #1 says atomic approval RPCs are source-only and UI still needs integration; PR #2 covers snapshot conflict and submit/resubmit. | Move relevant frontend writes to atomic RPCs; verify action history, step state, snapshot conflict, resubmit and role/assignment policy; run integration tests. |
| P0 | Edge Functions / secrets | **Needs rollout validation.** PR #1 includes admin-invite-user, crm-ai, bounded request parsing, rate limiting and restored function snapshots. | Validate JWT, tenant/company scope, rate limits, timeout/input bounds, invite delivery/rollback, secrets/config and cross-tenant denial in isolation. |
| P1 | CRM, customers, contacts, units, works/projects, tasks/issues/logs | **Audit required.** Main contains CRM workspace and Business OS shell. Historical baseline had 4 companies, 4 units, 8 works, 14 logs, no issues/reminders/profiles in that snapshot; counts are historical only. | Verify CRUD, assignments, search, attachments, tenant scoping, task lifecycle, activity/audit history, missing-data alerts and permissions. |
| P1 | Sales and tax/commercial workflows | **Audit required.** Sales workspace exists; prior security notes flag tax calculations and financial workflows for wider end-to-end testing. | Verify quotation → order/invoice → posting/receivable, tax jurisdiction/split rules, rounding, duplicate protection and reports. |
| P1 | Procurement/vendor bills | **Security changes proposed in PR #1; workflow needs validation.** Includes purchase-bill line integrity and inner-RPC lockdown migrations/tests. | Verify request/RFQ/PO/GRN/bill lifecycle, vendor/item linkage, tax, inventory impact, authorization and regression tests. |
| P1 | Inventory and stock movement | **Security changes proposed in PR #1; workflow needs validation.** Includes inventory adjustment maker-checker. | Verify receipts/issues/transfers/adjustments, stock ledger, project allocation, negative-stock policy, approval, idempotency and tenant scoping. |
| P1 | HR, employees, policies, recruitment, attendance, leave | **Audit required.** Providers/workspaces are wired in App; source existence is not proof of completion. | Test employee lifecycle, role access, recruitment applications, attendance/leave, policy access and audit trails. |
| P1 | Payroll and Form 16 | **Security guard proposed in PR #1; workflow needs validation.** | Verify salary calculations, deductions, approvals, payslips, payroll posting, Form 16 access isolation and reports. |
| P1 | Documents/storage/attachments | **Audit required.** Storage service and document workspace exist; PR #1 includes a company-document storage function. | Verify upload/download/archive, signed URL expiry, authorization, cross-company access, file constraints and recovery behavior. |
| P1 | Reports and analytics | **Audit required.** Reports workspace exists; Accounts reports are under validation. | Validate reports against source records, date/company filters, empty/error states, export correctness and role restrictions. |
| P2 | RAJIV AI / MEP Knowledge / Master BOQ parser | **Audit required; no new scope.** Workspaces and mep-document-local exist. Prior parser work addressed deterministic parent/child BOQ matching and rate-limit behavior. | Regression-test current flows, unmatched lines, Verify & Apply, retry/throttling, source provenance and tenant authorization; fix release-blocking defects only. |
| P2 | Administration, company settings, profile, notifications, dashboard, My Work | **Audit required.** Navigation entries exist in BusinessOSWorkspace. | Verify company settings, memberships/roles, profile/password, notification links, dashboard counts, responsive behavior and permissions. |
| P2 | UI/UX and browser behavior | **Needs validation.** Antigravity is the primary frontend implementation partner. | Check critical desktop workflows, loading/empty/error states, modal accessibility, keyboard navigation, responsive layout and console errors. |

## Immediate execution queue
1. [ ] **A1 — Finish Accounts acceptance** on PR #4 preview using the specific operating company, not All Companies. Test journal posting and bank/AR/AP flows against ledger source records; record discrepancies.
2. [ ] **A2 — Verify CI/build** for PR #4's latest head and run missing tests; verify Vercel preview corresponds to the exact head.
3. [ ] **A3 — Review PR overlap/dependencies** for PRs #1–#4; establish safe merge order, but do not merge without authorization.
4. [ ] **A4 — Resolve migration-history release blocker** from authoritative evidence and produce a recovery/forward-only plan.
5. [ ] **A5 — Complete approval UI → atomic RPC integration** and regression tests on an isolated test path.
6. [ ] **A6 — Run security matrix** for tenant/company/role isolation, sensitive documents, AI, invitations, inventory, purchase bills and Form 16.
7. [ ] **A7 — Sweep existing modules** with consistent evidence for CRM, Sales, Projects, Procurement, Inventory, HR/Payroll, Reports, Documents and AI/BOQ.
8. [ ] **A8 — Candidate release checklist:** P0 gates pass, critical P1 workflows pass, residual risks documented, and explicit owner release authorization received.

## Estimate and planning assumptions
Planning estimate for an existing-core release: **2–4 weeks**, subject to findings. This is not a promise until baseline inventory, CI and migration/security blockers are quantified. New features are deferred. Decide explicitly whether unfinished modules are required for core release or can be deferred; do not silently expand scope.

## Evidence log
For each meaningful test, append date, branch/commit, environment, scenario, expected result, actual result and pass/fail. Never store secrets or personal data here.
