-- Structural checks for a disposable Supabase test database only. Never run on production.
DO $$
BEGIN
 ASSERT to_regclass('public.company_module_permissions') IS NOT NULL, 'permissions table missing';
 ASSERT to_regclass('public.tenant_admin_action_delegations') IS NOT NULL, 'delegations table missing';
 ASSERT (SELECT relrowsecurity FROM pg_class WHERE oid='public.company_module_permissions'::regclass), 'permissions RLS disabled';
 ASSERT (SELECT relrowsecurity FROM pg_class WHERE oid='public.tenant_admin_action_delegations'::regclass), 'delegations RLS disabled';
 ASSERT to_regprocedure('private.has_company_module_permission(uuid,uuid,text,text)') IS NOT NULL, 'module helper missing';
 ASSERT to_regprocedure('private.has_tenant_admin_action(uuid,text)') IS NOT NULL, 'tenant action helper missing';
END $$;

-- Fixture-driven integration tests (seed owner, assigned ADMIN, unassigned ADMIN,
-- sleeping partner, HR manager A+B, accountant A, delegate execute-only and
-- delegate execute+delegate; companies A/B in tenant X and C in tenant Y).
-- Set authenticated role and request.jwt.claim.sub for each fixture user.
-- Assert:
-- owner can access every valid module/action in tenant X;
-- assigned ADMIN with no module grant is denied; unassigned ADMIN is denied;
-- sleeping partner can read every granted module but cannot create/update/delete/approve/export/manage;
-- HR manager can read HR in A and B, not C, not Accounts;
-- accountant can read Accounts, not Payroll;
-- cross-tenant company is denied;
-- execute-only delegate cannot re-delegate;
-- execute+delegate delegate can delegate only the exact action granted;
-- unauthenticated helper calls return false.
