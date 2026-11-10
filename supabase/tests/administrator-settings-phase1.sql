-- Structural checks for a disposable Supabase test database only. Never run on production.
DO $$
BEGIN
 ASSERT to_regclass('public.company_module_permissions') IS NOT NULL, 'permissions table missing';
 ASSERT to_regclass('public.tenant_admin_action_delegations') IS NOT NULL, 'delegations table missing';
 ASSERT (SELECT relrowsecurity FROM pg_class WHERE oid='public.company_module_permissions'::regclass), 'permissions RLS disabled';
 ASSERT (SELECT relrowsecurity FROM pg_class WHERE oid='public.tenant_admin_action_delegations'::regclass), 'delegations RLS disabled';
 ASSERT to_regprocedure('private.has_company_module_permission(uuid,uuid,text,text)') IS NOT NULL, 'module helper missing';
 ASSERT to_regprocedure('private.has_tenant_admin_action(uuid,text)') IS NOT NULL, 'tenant action helper missing';
 ASSERT to_regprocedure('public.admin_get_permission_workspace(uuid)') IS NOT NULL, 'workspace read RPC missing';
 ASSERT to_regprocedure('public.admin_upsert_company_module_permissions(uuid,uuid,text,jsonb)') IS NOT NULL, 'module grant RPC missing';
 ASSERT to_regprocedure('public.admin_upsert_tenant_action_delegation(uuid,text,boolean,boolean)') IS NOT NULL, 'tenant action delegation RPC missing';
 ASSERT to_regprocedure('public.admin_upsert_company_assignment(uuid,uuid,boolean,boolean)') IS NOT NULL, 'company assignment RPC missing';
 ASSERT to_regclass('public.permission_change_audit') IS NOT NULL, 'permission audit table missing';
 ASSERT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='public.permission_change_audit'::regclass AND tgname='permission_change_audit_no_update' AND NOT tgisinternal), 'audit immutability trigger missing';
 ASSERT has_function_privilege('authenticated','public.admin_get_permission_workspace(uuid)','EXECUTE'), 'workspace read RPC not executable by authenticated';
 ASSERT NOT has_table_privilege('authenticated','public.company_module_permissions','INSERT'), 'authenticated must not insert permission rows directly';
 ASSERT NOT has_table_privilege('authenticated','public.company_module_permissions','UPDATE'), 'authenticated must not update permission rows directly';
 ASSERT NOT has_table_privilege('authenticated','public.company_module_permissions','DELETE'), 'authenticated must not delete permission rows directly';
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


-- Negative authorization cases to execute with fixture JWT claims:
-- 1) admin_upsert_company_module_permissions called by non-owner without
--    can_manage_permissions for the exact company/module must raise 42501.
-- 2) A grantor attempting any true permission not present in their own
--    permission row must raise 42501.
-- 3) Any target lacking explicit user_company_access for that company must
--    be rejected, even when the actor is tenant OWNER.
-- 4) Non-owner self-grant/self-delegation must raise 42501.
-- 5) Tenant action can_delegate=true without can_execute=true must fail.
-- 6) Execute-only delegate must not be able to set can_delegate=true.
-- 7) A request using a target membership from another tenant must fail.
-- 8) UPDATE/DELETE/TRUNCATE on permission_change_audit must raise 42501.
-- 9) A read-only sleeping partner must get false for every action except read.
