# Phase 00 — Next Security Work

Status: planning only. This document does not authorize production changes.

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

## 4. CRM company-access rollout blocker (verified 2026-10-11)

Read-only production audit found 67 active memberships in one tenant: 1 OWNER and 66 TEAM. Only 2 TEAM memberships have any `user_company_access.can_view=true` grant; 64 TEAM memberships have no company-view grant. The legacy `profiles.role` values are 1 `admin`, 65 `guest`, and 2 `Team`, so that legacy role field is not a reliable source for inferring operating-company assignments.

Live permissive policies exist on `companies`, `units`, `works`, `issues`, `logs`, `reminders`, and global profile readers. PostgreSQL permissive policies are OR-combined, so these policies can bypass narrower tenant/company checks. The lockdown migration has been expanded to include the verified broad CRM policies, but remains review-only.

Before applying the policy-removal migration:
- Establish authoritative user-to-operating-company assignments from a trustworthy source; do not grant all users access to all companies as a blanket backfill.
- Check every active membership and each active tenant-company; produce an explicit unmatched/ambiguous assignment report.
- Test owner/admin, manager, team, and viewer read/write behavior across two companies and two tenants using isolated test data.
- Verify all affected UI flows and related tables, including companies, units, works, issues, logs, reminders, and profile peer visibility.
- Confirm the intended meaning of `TEAM` membership vs legacy profile roles and role permissions.

## 5. Git/release status (rechecked 2026-10-11, latest validation batch)

- Security work stays on `security/phase00-remove-hardcoded-qa-credential` and draft PR #1: https://github.com/rajivt123/Business-OS/pull/1
- Latest compare: 72 commits ahead and 0 behind `main`; no rebase/reset/force-push is indicated.
- Vercel reported **success** for commit `d4770e95faebfe34aad04002c7d1674f39be7a28`.
- GitHub Actions run 44 passed: Deno type-checks for `crm-ai` and `admin-invite-user`; tests for the bounded streaming body reader and invitation JSON parser; and the rate-limit migration regression against disposable PostgreSQL 17.
- The bounded request reader now stops at 16 KiB while reading the stream, rather than buffering an arbitrarily large body first. Both AI and invitation functions use it.
- Invitation rollback now checks cleanup results; it does not claim cleanup succeeded if membership/profile/Auth-user cleanup returns an error.
- The rate-limit counter is capped at limit + 1 to avoid unbounded growth under repeated rejected requests. Regression test now repeats rejected requests and verifies the counter stays bounded.
- Supabase's only listed development branch is `main`, status `MIGRATIONS_FAILED`; it is not a valid isolated Supabase environment.
- Read-only production verification confirms `public.consume_crm_ai_rate_limit(uuid,integer,integer)` and `private.crm_ai_rate_limits` do **not** exist in production. The rate-limit migration is source-only.
- No paid development branch, production migration, production Edge Function deployment, membership/grant change, or PR merge was made.

## Release guardrails

- Keep changes on this branch and in a reviewable pull request.
- Do not apply unvalidated migrations or deploy functions to production.
- Do not merge until the function contracts, authorization checks, tests, and frontend integration are reviewed.
- Treat previously exposed credentials as compromised; source cleanup alone does not rotate them or remove them from Git history.
