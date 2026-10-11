# Antigravity handoff — Phase 00 frontend integration

Use this as one cohesive frontend task after the backend branch is available in the workspace. Do not change backend SQL or deploy Edge Functions from Antigravity. Backend contracts are in supabase/functions/admin-invite-user/index.ts and supabase/functions/crm-ai/index.ts.

## A. Replace insecure default-password user creation
Current implementation is in src/context/CrmContext.jsx (handleAdminCreateUser) and src/components/crm/Modals.jsx (the admin user modal). It currently calls supabase.auth.signUp with a hard-coded default password and displays that password in the UI. Remove this entire flow.
- Keep existing role selector but only permit TEAM, MANAGER, VIEWER for this invite endpoint. Do not offer ADMIN/OWNER creation here.
- Call supabase.functions.invoke('admin-invite-user', { body: { email, role, tenant_id: activeTenantId } }) using the current authenticated Supabase client.
- Show a clear success state saying an invitation was requested/sent; never display or generate a shared password.
- Surface safe server error messages and preserve loading/disabled states.
- Refresh tenant members/profiles after success. Do not create profiles or tenant_memberships directly from the browser as part of this flow.
- Handle missing tenant_id and expired sessions gracefully.

## B. Move both AI features to crm-ai
Current code in src/context/CrmContext.jsx calls Gemini directly via VITE_GEMINI_API_KEY, fetches Google model lists from the browser, and sends browser-built portfolio context. Remove all direct Google Gemini calls and the VITE_GEMINI_API_KEY reference.
- Project summary: invoke crm-ai with { action: 'summarize_project', tenant_id, tenant_company_id: activeOperatingCompanyId || null, work_id: activeWorkId }.
- Chat: invoke crm-ai with { action: 'chat', tenant_id, tenant_company_id: activeOperatingCompanyId || null, message: trimmedMsg }.
- Read answer from response.data.answer. Handle functions.invoke errors and response.data.error without exposing secret/config details.
- Do not send logs, works, issues, reminders, company names, or portfolio context from the browser. The Edge Function owns context construction and tenant authorization.
- Preserve existing loading indicators, chat transcript behavior, summary display, clear-chat behavior, and useful user-facing errors.
- Remove unused Gemini helper functions and any now-unused imports/dependency references only when safe. Do not remove @google/generative-ai if other files still use it; search the entire repo first.
- Remove VITE_GEMINI_API_KEY from .env.example and any documentation only after all direct browser references are gone. Add GEMINI_API_KEY as a server-side Supabase Edge Function secret in deployment documentation; never put it in Vite env.

## C. Required validation
- Search entire repo for VITE_GEMINI_API_KEY, generativelanguage.googleapis.com, crm12345, and direct auth.signUp use in the admin user-creation flow. Only unrelated, justified matches may remain.
- npm run lint and npm run build must pass.
- Test in browser: create invitation for TEAM, MANAGER, VIEWER; verify no password is displayed; test invalid email, duplicate email, no tenant, expired session, non-admin.
- Test AI chat and project summary; verify no browser request goes directly to Google and no Gemini key is in built assets/source maps.
- Verify request payloads contain only the endpoint contract fields, not CRM records.
- Do not deploy production. Report changed files, tests, any blocker, and exact Supabase secret/config required.
