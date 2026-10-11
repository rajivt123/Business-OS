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

## Release guardrails

- Keep changes on this branch and in a reviewable pull request.
- Do not apply unvalidated migrations or deploy functions to production.
- Do not merge until the function contracts, authorization checks, tests, and frontend integration are reviewed.
- Treat previously exposed credentials as compromised; source cleanup alone does not rotate them or remove them from Git history.
