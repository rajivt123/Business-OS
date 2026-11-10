-- Controlled, audited permission mutations. Apply only after disposable-DB tests.
CREATE TABLE IF NOT EXISTS public.permission_change_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  actor_user_id uuid NOT NULL REFERENCES auth.users(id),
  target_membership_id uuid NOT NULL REFERENCES public.tenant_memberships(id),
  tenant_company_id uuid REFERENCES public.tenant_companies(id),
  module_key text,
  action_key text,
  event_type text NOT NULL CHECK (event_type IN ('module_permissions_upsert','tenant_action_delegation_upsert')),
  old_values jsonb,
  new_values jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((module_key IS NOT NULL AND tenant_company_id IS NOT NULL AND action_key IS NULL)
      OR (action_key IS NOT NULL AND tenant_company_id IS NULL AND module_key IS NULL))
);
CREATE INDEX IF NOT EXISTS idx_permission_audit_tenant_created
  ON public.permission_change_audit(tenant_id,created_at DESC);
ALTER TABLE public.permission_change_audit ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.permission_change_audit FROM anon, authenticated;
GRANT SELECT ON public.permission_change_audit TO authenticated;
CREATE POLICY permission_change_audit_read ON public.permission_change_audit
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tenant_memberships tm
      WHERE tm.tenant_id=permission_change_audit.tenant_id
        AND tm.user_id=auth.uid() AND tm.status='active'
        AND (tm.role='OWNER' OR private.has_tenant_admin_action(tm.tenant_id,'tenant_settings_manage')))
  );

CREATE OR REPLACE FUNCTION public.admin_upsert_company_module_permissions(
  p_target_membership_id uuid,
  p_tenant_company_id uuid,
  p_module_key text,
  p_permissions jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE
  v_actor public.tenant_memberships%ROWTYPE;
  v_target public.tenant_memberships%ROWTYPE;
  v_company public.tenant_companies%ROWTYPE;
  v_old jsonb;
  v_new jsonb;
  v_owner boolean := false;
  v_key text;
  v_allowed text[] := ARRAY['can_read','can_create','can_update','can_delete','can_approve','can_export','can_manage_permissions'];
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  IF p_permissions IS NULL OR jsonb_typeof(p_permissions) <> 'object'
     OR EXISTS (SELECT 1 FROM jsonb_object_keys(p_permissions) k WHERE NOT (k = ANY(v_allowed)))
     OR EXISTS (SELECT 1 FROM jsonb_each(p_permissions) e WHERE jsonb_typeof(e.value) <> 'boolean') THEN
    RAISE EXCEPTION 'Invalid permission payload' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_actor FROM public.tenant_memberships
    WHERE user_id=auth.uid() AND status='active'
      AND tenant_id=(SELECT tenant_id FROM public.tenant_memberships WHERE id=p_target_membership_id);
  IF NOT FOUND THEN RAISE EXCEPTION 'Actor membership not found' USING ERRCODE='42501'; END IF;
  SELECT * INTO v_target FROM public.tenant_memberships
    WHERE id=p_target_membership_id AND tenant_id=v_actor.tenant_id AND status='active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Target membership is not active in this tenant' USING ERRCODE='22023'; END IF;
  SELECT * INTO v_company FROM public.tenant_companies
    WHERE id=p_tenant_company_id AND tenant_id=v_actor.tenant_id AND status='active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Company is not active in this tenant' USING ERRCODE='22023'; END IF;
  v_owner := v_actor.role='OWNER';
  IF NOT v_owner THEN
    IF v_actor.id=v_target.id THEN RAISE EXCEPTION 'Self-grant is prohibited' USING ERRCODE='42501'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.user_company_access a
      WHERE a.membership_id=v_actor.id AND a.tenant_id=v_actor.tenant_id
        AND a.tenant_company_id=p_tenant_company_id AND a.can_view=true)
      OR NOT private.can_manage_company_permissions(v_actor.tenant_id,p_tenant_company_id,p_module_key) THEN
      RAISE EXCEPTION 'Missing company/module permission-management authority' USING ERRCODE='42501';
    END IF;
    IF EXISTS (
      SELECT 1 FROM jsonb_each_text(p_permissions) e
      WHERE e.value='true'
        AND NOT COALESCE((SELECT CASE e.key
          WHEN 'can_read' THEN own.can_read
          WHEN 'can_create' THEN own.can_create
          WHEN 'can_update' THEN own.can_update
          WHEN 'can_delete' THEN own.can_delete
          WHEN 'can_approve' THEN own.can_approve
          WHEN 'can_export' THEN own.can_export
          WHEN 'can_manage_permissions' THEN own.can_manage_permissions
        END FROM public.company_module_permissions own
        WHERE own.membership_id=v_actor.id AND own.tenant_company_id=p_tenant_company_id
          AND own.module_key=p_module_key),false)
    ) THEN RAISE EXCEPTION 'Cannot delegate permissions beyond your own grant' USING ERRCODE='42501'; END IF;
  END IF;
  IF COALESCE((p_permissions->>'can_create')::boolean,false)
    OR COALESCE((p_permissions->>'can_update')::boolean,false)
    OR COALESCE((p_permissions->>'can_delete')::boolean,false)
    OR COALESCE((p_permissions->>'can_approve')::boolean,false)
    OR COALESCE((p_permissions->>'can_export')::boolean,false)
    OR COALESCE((p_permissions->>'can_manage_permissions')::boolean,false) THEN
    IF COALESCE((p_permissions->>'can_read')::boolean,false) IS NOT TRUE THEN
      RAISE EXCEPTION 'Read permission is required for every other action' USING ERRCODE='22023';
    END IF;
  END IF;
  SELECT jsonb_build_object(
    'can_read',can_read,'can_create',can_create,'can_update',can_update,
    'can_delete',can_delete,'can_approve',can_approve,'can_export',can_export,
    'can_manage_permissions',can_manage_permissions)
    INTO v_old FROM public.company_module_permissions
    WHERE membership_id=v_target.id AND tenant_company_id=p_tenant_company_id AND module_key=p_module_key;
  INSERT INTO public.company_module_permissions(
    tenant_id,membership_id,tenant_company_id,module_key,can_read,can_create,can_update,
    can_delete,can_approve,can_export,can_manage_permissions,granted_by,updated_at)
  VALUES(v_actor.tenant_id,v_target.id,p_tenant_company_id,p_module_key,
    COALESCE((p_permissions->>'can_read')::boolean,false),
    COALESCE((p_permissions->>'can_create')::boolean,false),
    COALESCE((p_permissions->>'can_update')::boolean,false),
    COALESCE((p_permissions->>'can_delete')::boolean,false),
    COALESCE((p_permissions->>'can_approve')::boolean,false),
    COALESCE((p_permissions->>'can_export')::boolean,false),
    COALESCE((p_permissions->>'can_manage_permissions')::boolean,false),auth.uid(),now())
  ON CONFLICT(membership_id,tenant_company_id,module_key) DO UPDATE SET
    can_read=EXCLUDED.can_read,can_create=EXCLUDED.can_create,can_update=EXCLUDED.can_update,
    can_delete=EXCLUDED.can_delete,can_approve=EXCLUDED.can_approve,can_export=EXCLUDED.can_export,
    can_manage_permissions=EXCLUDED.can_manage_permissions,granted_by=auth.uid(),updated_at=now();
  SELECT jsonb_build_object(
    'can_read',can_read,'can_create',can_create,'can_update',can_update,
    'can_delete',can_delete,'can_approve',can_approve,'can_export',can_export,
    'can_manage_permissions',can_manage_permissions)
    INTO v_new FROM public.company_module_permissions
    WHERE membership_id=v_target.id AND tenant_company_id=p_tenant_company_id AND module_key=p_module_key;
  INSERT INTO public.permission_change_audit(tenant_id,actor_user_id,target_membership_id,
    tenant_company_id,module_key,event_type,old_values,new_values)
  VALUES(v_actor.tenant_id,auth.uid(),v_target.id,p_tenant_company_id,p_module_key,
    'module_permissions_upsert',v_old,v_new);
  RETURN jsonb_build_object('success',true,'previous',v_old,'permissions',v_new);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_tenant_action_delegation(
  p_target_membership_id uuid,
  p_action_key text,
  p_can_execute boolean,
  p_can_delegate boolean
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE
  v_actor public.tenant_memberships%ROWTYPE;
  v_target public.tenant_memberships%ROWTYPE;
  v_owner boolean := false;
  v_old jsonb;
  v_new jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  IF p_action_key NOT IN ('tenant_delete','ownership_transfer','tenant_settings_manage','membership_manage','company_create','company_archive')
    OR p_can_execute IS NULL OR p_can_delegate IS NULL OR (p_can_delegate AND NOT p_can_execute) THEN
    RAISE EXCEPTION 'Invalid tenant action delegation' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_target FROM public.tenant_memberships
    WHERE id=p_target_membership_id AND status='active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Target membership is not active' USING ERRCODE='22023'; END IF;
  SELECT * INTO v_actor FROM public.tenant_memberships
    WHERE user_id=auth.uid() AND tenant_id=v_target.tenant_id AND status='active';
  IF NOT FOUND THEN RAISE EXCEPTION 'Actor is not an active member of this tenant' USING ERRCODE='42501'; END IF;
  v_owner := v_actor.role='OWNER';
  IF NOT v_owner THEN
    IF v_actor.id=v_target.id THEN RAISE EXCEPTION 'Self-delegation is prohibited' USING ERRCODE='42501'; END IF;
    IF NOT private.can_delegate_tenant_admin_action(v_actor.tenant_id,p_action_key) THEN
      RAISE EXCEPTION 'You cannot delegate this tenant action' USING ERRCODE='42501';
    END IF;
    IF p_can_execute AND NOT EXISTS (
      SELECT 1 FROM public.tenant_admin_action_delegations d
      WHERE d.membership_id=v_actor.id AND d.tenant_id=v_actor.tenant_id
        AND d.action_key=p_action_key AND d.can_execute=true) THEN
      RAISE EXCEPTION 'Cannot delegate execution authority you do not hold' USING ERRCODE='42501';
    END IF;
    IF p_can_delegate AND NOT EXISTS (
      SELECT 1 FROM public.tenant_admin_action_delegations d
      WHERE d.membership_id=v_actor.id AND d.tenant_id=v_actor.tenant_id
        AND d.action_key=p_action_key AND d.can_delegate=true) THEN
      RAISE EXCEPTION 'Cannot delegate re-delegation authority you do not hold' USING ERRCODE='42501';
    END IF;
  END IF;
  SELECT jsonb_build_object('can_execute',can_execute,'can_delegate',can_delegate)
    INTO v_old FROM public.tenant_admin_action_delegations
    WHERE membership_id=v_target.id AND action_key=p_action_key;
  INSERT INTO public.tenant_admin_action_delegations(tenant_id,membership_id,action_key,
    can_execute,can_delegate,granted_by,updated_at)
  VALUES(v_actor.tenant_id,v_target.id,p_action_key,p_can_execute,p_can_delegate,auth.uid(),now())
  ON CONFLICT(membership_id,action_key) DO UPDATE SET
    can_execute=EXCLUDED.can_execute,can_delegate=EXCLUDED.can_delegate,
    granted_by=auth.uid(),updated_at=now();
  SELECT jsonb_build_object('can_execute',can_execute,'can_delegate',can_delegate)
    INTO v_new FROM public.tenant_admin_action_delegations
    WHERE membership_id=v_target.id AND action_key=p_action_key;
  INSERT INTO public.permission_change_audit(tenant_id,actor_user_id,target_membership_id,
    action_key,event_type,old_values,new_values)
  VALUES(v_actor.tenant_id,auth.uid(),v_target.id,p_action_key,
    'tenant_action_delegation_upsert',v_old,v_new);
  RETURN jsonb_build_object('success',true,'previous',v_old,'delegation',v_new);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_company_module_permissions(uuid,uuid,text,jsonb) FROM PUBLIC,anon;
REVOKE ALL ON FUNCTION public.admin_upsert_tenant_action_delegation(uuid,text,boolean,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_upsert_company_module_permissions(uuid,uuid,text,jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_tenant_action_delegation(uuid,text,boolean,boolean) TO authenticated;
