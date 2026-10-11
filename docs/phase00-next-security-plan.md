# Phase 00 — Next Security Work

Status: planning and source-only remediation. This document does not authorize production changes.

## 1. Replace shared-password account creation

- Remove the fixed shared password from the account-creation flow.
- Use a server-side Supabase Edge Function with JWT verification enabled.
- Validate the caller's identity and current tenant/company administrator permissions before creating or inviting an account.
- Never accept tenant/company membership or privileged role assignments solely from untrusted client input.
- Define the invite, profile, tenant membership, role, expiry, and rollback behavior before frontend integration.
- Verify the configured Supabase Auth email delivery and redirect URLs before enabling invitations.

## 2. Move Gemini calls server-side

- Remove browser-side use of `VITE_GEMINI_API_KEY`.
- Add an authenticated Edge Function for project summaries and AI chat.
- Keep the Gemini key in server-side secrets only.
- Authorize every request against the caller's tenant and operating-company access.
- Build project context server-side from authorized rows; do not trust client-supplied portfolio data.
- Add input/output size limits, request timeouts, rate limits, and safe error messages.
- Update `.env.example` to remove the Vite Gemini key once the client migration is ready.

## 3. Database security review

- Review privileged financial, payroll, inventory, approval, and account-management SECURITY DEFINER functions for authorization, tenant/company isolation, maker-checker controls, and safe search paths.
- Do not blanket-revoke authenticated execution from legitimate RPCs.
- Preserve intentional public recruitment submissions only after validating token scoping, expiry, submission limits, and data exposure.
- Recheck Supabase Security Advisor after reviewed changes.

### Financial RPC audit — live read-only inspection (2026-10-11)

- `post_journal_entry_atomic(jsonb)` requires authenticated manager + company access, an open fiscal period, active same-company accounts, at least two nonzero-sided lines, and equal positive debit/credit totals. Remaining checks: validate party/project references against the same tenant/company, define a maximum line count and monetary precision policy, and validate source-type/source-id relationships where intended to be authoritative.
- `reverse_journal_entry_atomic(jsonb)` scopes the original journal to tenant/company and reverses its lines, but an existing idempotency key is returned without checking that its stored `request_hash` matches the requested original entry/date/narration. This can return a different pre-existing entry as if it were this reversal. The original entry row is locked and status-checked; review lock ordering before changing concurrency logic.
- `create_payroll_payment_batch_atomic(jsonb)` calculates the batch total from posted payroll run items and validates the bank account and employee ownership. Its idempotency hash excludes an item snapshot; follow-up review must ensure payroll run items and verified employee bank accounts cannot change after posting/approval and before payment.
- `process_payroll_payment_batch_atomic(uuid,text)` is ADMIN-only and checks approved status, approved request, pending-item total vs batch total, bank account, salary payable mapping, and open fiscal period. Remaining checks: ensure the approval snapshot matches immutable payment items, and confirm payment item/header direct DML permissions cannot bypass approval.
- `create_purchase_bill_with_accounting_atomic(jsonb,jsonb)` uses an idempotency lock, validates the PO and GRN, checks remaining accepted quantities and GRNI availability, and posts a journal through the journal RPC. The live `create_purchase_bill_atomic(jsonb,jsonb)` is separately executable by authenticated clients and creates a bill in `verified` status without its accounting journal. Repository caller search found the frontend uses the accounting wrapper, not the inner creator. A source-only privilege migration removes direct anon/authenticated execution of the inner RPC while preserving service-role execution; the wrapper's security-definer owner can still call it. This must pass isolated regression and full procurement integration checks before production use.
- These are audit observations, not a declaration that production has been changed. The new privilege migration remains source-only.

## 4. CRM company-access rollout blocker (verified 2026-10-11)

Read-only production audit found 67 active memberships in one tenant: 1 OWNER and 66 TEAM. Only 2 TEAM memberships have any `user_company_access.can_view=true` grant; 64 TEAM memberships have no company-view grant. The legacy `profiles.role` values are 1 `admin`, 65 `guest`, and 2 `Team`, so that legacy role field is not a reliable source for inferring operating-company assignments.

Live permissive policies exist on `companies`, `units`, `works`, `issues`, `logs`, `reminders`, and global profile readers. PostgreSQL permissive policies are OR-combined, so these policies can bypass narrower tenant/company checks. The lockdown migration has been expanded to include the verified broad CRM policies, but remains review-only.

Before applying the policy-removal migration:
- Establish authoritative user-to-operating-company assignments from a trustworthy source; do not grant all users access to all companies as a blanket backfill.
- Check every active membership and each active tenant-company; produce an explicit unmatched/ambiguous assignment report.
- Test owner/admin, manager, team, and viewer read/write behavior across two companies and two tenants using isolated test data.
- Verify all affected UI flows and related tables, including companies, units, works, issues, logs, reminders, and profile peer visibility.
- Confirm the intended meaning of `TEAM` membership vs legacy profile roles and role permissions.

## 5. Git/release status (rechecked 2026-10-11)

- Security work stays on `security/phase00-remove-hardcoded-qa-credential` and draft PR #1: https://github.com/rajivt123/Business-OS/pull/1
- Latest Vercel deployment for the current reviewed head is **READY**. An earlier deployment at commit `0d35e9fa7d9cbb150267efeac28f9f20bb8b329c` failed with `git_info_fail` (Vercel source metadata retrieval), while subsequent commits deployed successfully.
- GitHub Actions run 72: Deno type-checks for `crm-ai` and `admin-invite-user`, bounded request-body tests, invite parser tests, purchase-bill integrity SQL regression, inventory adjustment maker-checker SQL regression, Form 16 access-control regression, and CRM AI rate-limit regression. Run 72 passed after correcting the Form 16 test to catch the function's explicit SQLSTATE 42501 authorization error.
- New source-only procurement guard validates purchase-bill item tenant/company linkage, PO/GRN linkage, quantity × unit price, tax total and line total.
- New source-only inventory adjustment guard prevents the request maker from approving their own pending adjustment. Independent approver path is covered by isolated PostgreSQL regression.
- New source-only Form 16 access guard permits payroll managers with company access or the employee linked to the authenticated user; ordinary company members cannot generate another employee's tax preparation output. The negative authorization path is covered by isolated PostgreSQL regression.
- The bounded request reader stops at 16 KiB while reading the stream; both AI and invitation functions use it. Invitation cleanup reports incomplete rollback honestly. The rate-limit counter is capped at limit + 1.
- Supabase's only listed development branch is `main`, status `MIGRATIONS_FAILED`; it is not a valid isolated Supabase environment.
- Read-only production verification confirms `public.consume_crm_ai_rate_limit(uuid,integer,integer)` and `private.crm_ai_rate_limits` do **not** exist in production. All new migrations remain source-only.
- No paid development branch, production migration, production Edge Function deployment, membership/grant change, or PR merge was made.

## Release guardrails

- Keep changes on this branch and in a reviewable pull request.
- Do not apply unvalidated migrations or deploy functions to production.
- Do not merge until the function contracts, authorization checks, tests, and frontend integration are reviewed.
- Treat previously exposed credentials as compromised; source cleanup alone does not rotate them or remove them from Git history.
