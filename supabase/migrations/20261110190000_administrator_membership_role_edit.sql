-- Audited tenant role editing. Only the tenant OWNER can change non-owner roles.
ALTER TABLE public.permission_change_audit
  DROP CONSTRAINT IF EXISTS permission_change_audit_event_type_check;
ALTER TABLE public.permission_change_audit
  ADD CONSTRAINT permission_change_audit_event_type_check
  CHECK (event_type IN (
    'module_permissions_upsert',
    'tenant_action_delegation_upsert',
    'company_assignment_upsert',
    'membership_role_update'
  ));

CREATE OR REPLACE FUNCTION public.admin_update_membership_role(
  p_target_membership_id uuid,
  p_new_role text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $$
DECLARE
  v_actor public.tenant_memberships%ROWTYPE;
  v_target public.tenant_memberships%ROWTYPE;
  v_old_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';
  END IF;
  IF p_new_role NOT IN ('ADMIN','MANAGER','TEAM','VIEWER') THEN
    RAISE EXCEPTION 'Invalid role. OWNER cannot be assigned through this operation.' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_target
  FROM public.tenant_memberships
  WHERE id=p_target_membership_id AND status='active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target membership is not active' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_actor
  FROM public.tenant_memberships
  WHERE user_id=auth.uid()
    AND tenant_id=v_target.tenant_id
    AND status='active';
  IF NOT FOUND OR v_actor.role <> 'OWNER' THEN
    RAISE EXCEPTION 'Only the tenant owner can change member roles' USING ERRCODE='42501';
  END IF;
  IF v_target.role='OWNER' THEN
    RAISE EXCEPTION 'Owner role is protected' USING ERRCODE='42501';
  END IF;
  IF v_target.id=v_actor.id THEN
    RAISE EXCEPTION 'Self role changes are prohibited' USING ERRCODE='42501';
  END IF;

  v_old_role := v_target.role;
  IF v_old_role = p_new_role THEN
    RETURN jsonb_build_object('success',true,'unchanged',true,'role',v_old_role);
  END IF;

  UPDATE public.tenant_memberships
  SET role=p_new_role, updated_at=now()
  WHERE id=v_target.id AND tenant_id=v_actor.tenant_id;

  INSERT INTO public.permission_change_audit(
    tenant_id,actor_user_id,target_membership_id,event_type,old_values,new_values
  ) VALUES (
    v_actor.tenant_id,auth.uid(),v_target.id,'membership_role_update',
    jsonb_build_object('role',v_old_role),
    jsonb_build_object('role',p_new_role)
  );

  RETURN jsonb_build_object('success',true,'previous_role',v_old_role,'role',p_new_role);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_membership_role(uuid,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_update_membership_role(uuid,text) TO authenticated;
