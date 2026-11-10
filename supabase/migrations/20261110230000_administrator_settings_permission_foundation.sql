-- Additive permission foundation. No existing grants or policies are modified.
CREATE TABLE IF NOT EXISTS public.company_module_permissions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
 membership_id uuid NOT NULL REFERENCES public.tenant_memberships(id) ON DELETE CASCADE,
 tenant_company_id uuid NOT NULL REFERENCES public.tenant_companies(id) ON DELETE CASCADE,
 module_key text NOT NULL CHECK (module_key ~ '^[a-z][a-z0-9_]{1,47}$'),
 can_read boolean NOT NULL DEFAULT false,
 can_create boolean NOT NULL DEFAULT false,
 can_update boolean NOT NULL DEFAULT false,
 can_delete boolean NOT NULL DEFAULT false,
 can_approve boolean NOT NULL DEFAULT false,
 can_export boolean NOT NULL DEFAULT false,
 can_manage_permissions boolean NOT NULL DEFAULT false,
 granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT company_module_permissions_unique UNIQUE(membership_id,tenant_company_id,module_key),
 CONSTRAINT company_module_permissions_action_requires_read CHECK (
  NOT (can_create OR can_update OR can_delete OR can_approve OR can_export OR can_manage_permissions) OR can_read
 )
);
CREATE INDEX IF NOT EXISTS idx_cmp_tenant_company ON public.company_module_permissions(tenant_id,tenant_company_id);
CREATE INDEX IF NOT EXISTS idx_cmp_membership ON public.company_module_permissions(membership_id);

CREATE TABLE IF NOT EXISTS public.tenant_admin_action_delegations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
 membership_id uuid NOT NULL REFERENCES public.tenant_memberships(id) ON DELETE CASCADE,
 action_key text NOT NULL CHECK(action_key IN ('tenant_delete','ownership_transfer','tenant_settings_manage','membership_manage','company_create','company_archive')),
 can_execute boolean NOT NULL DEFAULT false,
 can_delegate boolean NOT NULL DEFAULT false,
 granted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT tenant_admin_action_delegations_unique UNIQUE(membership_id,action_key),
 CONSTRAINT delegation_requires_execution CHECK(NOT can_delegate OR can_execute)
);
CREATE INDEX IF NOT EXISTS idx_taad_tenant_membership ON public.tenant_admin_action_delegations(tenant_id,membership_id);

ALTER TABLE public.company_module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_admin_action_delegations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.has_company_module_permission(p_tenant_id uuid,p_tenant_company_id uuid,p_module_key text,p_action text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
 SELECT CASE
 WHEN auth.uid() IS NULL OR p_tenant_id IS NULL OR p_tenant_company_id IS NULL OR p_module_key IS NULL
   OR p_action NOT IN ('read','create','update','delete','approve','export','manage_permissions') THEN false
 WHEN NOT EXISTS(SELECT 1 FROM public.tenant_companies tc WHERE tc.id=p_tenant_company_id AND tc.tenant_id=p_tenant_id AND tc.status='active') THEN false
 ELSE EXISTS(
  SELECT 1 FROM public.tenant_memberships tm
  WHERE tm.user_id=auth.uid() AND tm.tenant_id=p_tenant_id AND tm.status='active'
  AND (tm.role='OWNER' OR (
   EXISTS(SELECT 1 FROM public.user_company_access uca
    WHERE uca.membership_id=tm.id AND uca.tenant_id=p_tenant_id
      AND uca.tenant_company_id=p_tenant_company_id AND uca.can_view=true)
   AND EXISTS(SELECT 1 FROM public.company_module_permissions cmp
    WHERE cmp.membership_id=tm.id AND cmp.tenant_id=p_tenant_id
      AND cmp.tenant_company_id=p_tenant_company_id AND cmp.module_key=p_module_key
      AND CASE p_action
       WHEN 'read' THEN cmp.can_read WHEN 'create' THEN cmp.can_create
       WHEN 'update' THEN cmp.can_update WHEN 'delete' THEN cmp.can_delete
       WHEN 'approve' THEN cmp.can_approve WHEN 'export' THEN cmp.can_export
       WHEN 'manage_permissions' THEN cmp.can_manage_permissions ELSE false END)
  ))
 )
 END;
$$;

CREATE OR REPLACE FUNCTION private.can_manage_company_permissions(p_tenant_id uuid,p_tenant_company_id uuid,p_module_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$ SELECT private.has_company_module_permission(p_tenant_id,p_tenant_company_id,p_module_key,'manage_permissions'); $$;

CREATE OR REPLACE FUNCTION private.has_tenant_admin_action(p_tenant_id uuid,p_action_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
 SELECT CASE WHEN auth.uid() IS NULL OR p_tenant_id IS NULL THEN false ELSE EXISTS(
  SELECT 1 FROM public.tenant_memberships tm
  WHERE tm.user_id=auth.uid() AND tm.tenant_id=p_tenant_id AND tm.status='active'
  AND (tm.role='OWNER' OR EXISTS(
   SELECT 1 FROM public.tenant_admin_action_delegations d
   WHERE d.tenant_id=tm.tenant_id AND d.membership_id=tm.id
    AND d.action_key=p_action_key AND d.can_execute=true))
 ) END;
$$;

CREATE OR REPLACE FUNCTION private.can_delegate_tenant_admin_action(p_tenant_id uuid,p_action_key text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $$
 SELECT CASE WHEN auth.uid() IS NULL OR p_tenant_id IS NULL THEN false ELSE EXISTS(
  SELECT 1 FROM public.tenant_memberships tm
  WHERE tm.user_id=auth.uid() AND tm.tenant_id=p_tenant_id AND tm.status='active'
  AND (tm.role='OWNER' OR EXISTS(
   SELECT 1 FROM public.tenant_admin_action_delegations d
   WHERE d.tenant_id=tm.tenant_id AND d.membership_id=tm.id
    AND d.action_key=p_action_key AND d.can_execute=true AND d.can_delegate=true))
 ) END;
$$;

REVOKE ALL ON FUNCTION private.has_company_module_permission(uuid,uuid,text,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.can_manage_company_permissions(uuid,uuid,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.has_tenant_admin_action(uuid,text) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION private.can_delegate_tenant_admin_action(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION private.has_company_module_permission(uuid,uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_manage_company_permissions(uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_tenant_admin_action(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION private.can_delegate_tenant_admin_action(uuid,text) TO authenticated;

CREATE POLICY company_module_permissions_select ON public.company_module_permissions FOR SELECT TO authenticated
USING (
 EXISTS(SELECT 1 FROM public.tenant_memberships tm WHERE tm.id=company_module_permissions.membership_id AND tm.user_id=auth.uid() AND tm.tenant_id=company_module_permissions.tenant_id AND tm.status='active')
 OR private.can_manage_company_permissions(tenant_id,tenant_company_id,module_key)
 OR EXISTS(SELECT 1 FROM public.tenant_memberships tm WHERE tm.user_id=auth.uid() AND tm.tenant_id=company_module_permissions.tenant_id AND tm.status='active' AND tm.role='OWNER')
);
CREATE POLICY company_module_permissions_insert ON public.company_module_permissions FOR INSERT TO authenticated
WITH CHECK (
 private.can_manage_company_permissions(tenant_id,tenant_company_id,module_key)
 AND EXISTS(SELECT 1 FROM public.tenant_memberships tm WHERE tm.id=company_module_permissions.membership_id AND tm.tenant_id=company_module_permissions.tenant_id AND tm.status='active')
 AND EXISTS(SELECT 1 FROM public.tenant_companies tc WHERE tc.id=tenant_company_id AND tc.tenant_id=tenant_id AND tc.status='active')
);
CREATE POLICY company_module_permissions_update ON public.company_module_permissions FOR UPDATE TO authenticated
USING(private.can_manage_company_permissions(tenant_id,tenant_company_id,module_key))
WITH CHECK(private.can_manage_company_permissions(tenant_id,tenant_company_id,module_key));
CREATE POLICY company_module_permissions_delete ON public.company_module_permissions FOR DELETE TO authenticated
USING(private.can_manage_company_permissions(tenant_id,tenant_company_id,module_key));

CREATE POLICY tenant_admin_action_delegations_select ON public.tenant_admin_action_delegations FOR SELECT TO authenticated
USING (
 EXISTS(SELECT 1 FROM public.tenant_memberships tm WHERE tm.id=tenant_admin_action_delegations.membership_id AND tm.user_id=auth.uid() AND tm.tenant_id=tenant_admin_action_delegations.tenant_id AND tm.status='active')
 OR private.can_delegate_tenant_admin_action(tenant_id,action_key)
);
CREATE POLICY tenant_admin_action_delegations_insert ON public.tenant_admin_action_delegations FOR INSERT TO authenticated
WITH CHECK (
 private.can_delegate_tenant_admin_action(tenant_id,action_key)
 AND EXISTS(SELECT 1 FROM public.tenant_memberships tm WHERE tm.id=tenant_admin_action_delegations.membership_id AND tm.tenant_id=tenant_admin_action_delegations.tenant_id AND tm.status='active')
);
CREATE POLICY tenant_admin_action_delegations_update ON public.tenant_admin_action_delegations FOR UPDATE TO authenticated
USING(private.can_delegate_tenant_admin_action(tenant_id,action_key))
WITH CHECK(private.can_delegate_tenant_admin_action(tenant_id,action_key));
CREATE POLICY tenant_admin_action_delegations_delete ON public.tenant_admin_action_delegations FOR DELETE TO authenticated
USING(private.can_delegate_tenant_admin_action(tenant_id,action_key));

COMMENT ON TABLE public.company_module_permissions IS 'Explicit company-scoped module/action grants; no automatic backfill.';
COMMENT ON TABLE public.tenant_admin_action_delegations IS 'Explicit tenant-wide administrative action delegation with controlled re-delegation.';

-- Explicit Data API privileges; RLS remains the row-level boundary.
REVOKE ALL ON TABLE public.company_module_permissions FROM anon;
REVOKE ALL ON TABLE public.tenant_admin_action_delegations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.company_module_permissions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tenant_admin_action_delegations TO authenticated;
