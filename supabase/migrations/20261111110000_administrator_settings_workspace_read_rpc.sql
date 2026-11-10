-- Read model for the Administrator Settings workspace.
-- Only owners or members with tenant membership-management authority can enumerate people.
CREATE OR REPLACE FUNCTION public.admin_get_permission_workspace(p_tenant_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_actor public.tenant_memberships%ROWTYPE;
  v_is_owner boolean;
  v_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;

  SELECT * INTO v_actor
  FROM public.tenant_memberships
  WHERE user_id=auth.uid() AND tenant_id=p_tenant_id AND status='active'
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Active tenant membership required' USING ERRCODE='42501';
  END IF;

  v_is_owner := v_actor.role='OWNER';
  IF NOT v_is_owner AND NOT private.has_tenant_admin_action(v_actor.tenant_id,'membership_manage') THEN
    RAISE EXCEPTION 'Membership-management authority required' USING ERRCODE='42501';
  END IF;

  SELECT jsonb_build_object(
    'tenant_id',v_actor.tenant_id,
    'actor_membership_id',v_actor.id,
    'is_owner',v_is_owner,
    'companies',COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id',tc.id,'name',tc.name,'code',tc.code)
        ORDER BY tc.name)
      FROM public.tenant_companies tc
      WHERE tc.tenant_id=v_actor.tenant_id AND tc.status='active'
        AND (v_is_owner OR EXISTS(
          SELECT 1 FROM public.user_company_access ua
          WHERE ua.membership_id=v_actor.id AND ua.tenant_company_id=tc.id AND ua.can_view=true
        ))
    ),'[]'::jsonb),
    'members',COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'membership_id',tm.id,
        'user_id',tm.user_id,
        'role',tm.role,
        'status',tm.status,
        'display_name',COALESCE(p.display_name,p.full_name,p.email,'Member'),
        'email',p.email,
        'company_access',COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'tenant_company_id',ua.tenant_company_id,
            'can_view',ua.can_view,
            'can_edit',ua.can_edit
          ))
          FROM public.user_company_access ua
          JOIN public.tenant_companies tc ON tc.id=ua.tenant_company_id
          WHERE ua.membership_id=tm.id AND ua.tenant_id=v_actor.tenant_id
            AND tc.status='active'
            AND (v_is_owner OR EXISTS(
              SELECT 1 FROM public.user_company_access own_access
              WHERE own_access.membership_id=v_actor.id
                AND own_access.tenant_company_id=ua.tenant_company_id
                AND own_access.can_view=true
            ))
        ),'[]'::jsonb),
        'module_permissions',COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'tenant_company_id',mp.tenant_company_id,
            'module_key',mp.module_key,
            'can_read',mp.can_read,
            'can_create',mp.can_create,
            'can_update',mp.can_update,
            'can_delete',mp.can_delete,
            'can_approve',mp.can_approve,
            'can_export',mp.can_export,
            'can_manage_permissions',mp.can_manage_permissions
          ))
          FROM public.company_module_permissions mp
          WHERE mp.membership_id=tm.id AND mp.tenant_id=v_actor.tenant_id
            AND (v_is_owner OR EXISTS(
              SELECT 1 FROM public.user_company_access own_access
              WHERE own_access.membership_id=v_actor.id
                AND own_access.tenant_company_id=mp.tenant_company_id
                AND own_access.can_view=true
            ))
        ),'[]'::jsonb),
        'tenant_action_delegations',COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'action_key',d.action_key,'can_execute',d.can_execute,'can_delegate',d.can_delegate
          ))
          FROM public.tenant_admin_action_delegations d
          WHERE d.membership_id=tm.id AND d.tenant_id=v_actor.tenant_id
            AND (v_is_owner OR d.action_key IN (
              SELECT own_d.action_key FROM public.tenant_admin_action_delegations own_d
              WHERE own_d.membership_id=v_actor.id AND own_d.can_delegate=true
            ))
        ),'[]'::jsonb)
      ) ORDER BY COALESCE(p.display_name,p.full_name,p.email,'Member'))
      FROM public.tenant_memberships tm
      LEFT JOIN public.profiles p ON p.id=tm.user_id
      WHERE tm.tenant_id=v_actor.tenant_id AND tm.status='active'
    ),'[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_permission_workspace(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_get_permission_workspace(uuid) TO authenticated;
