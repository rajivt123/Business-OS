-- Atomic approval action engine (source-only until frontend is migrated and integration tests pass).
-- Do not revoke direct table writes in this migration; the current UI still uses them.
CREATE OR REPLACE FUNCTION public.process_approval_request_action_atomic(
  p_request_id uuid,
  p_action text,
  p_comments text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_request public.approval_requests%ROWTYPE;
  v_step public.approval_request_steps%ROWTYPE;
  v_next public.approval_request_steps%ROWTYPE;
  v_employee_user uuid;
  v_from_status text;
  v_to_status text;
  v_action text := lower(trim(coalesce(p_action,'')));
  v_comments text := nullif(trim(coalesce(p_comments,'')),'');
  v_is_manager boolean;
  v_is_assigned boolean;
  v_is_last boolean;
  v_apply jsonb;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  IF p_request_id IS NULL OR v_action NOT IN ('approve','reject','return','withdraw') THEN
    RAISE EXCEPTION 'Invalid request id or action' USING ERRCODE='22023';
  END IF;
  IF v_action IN ('reject','return') AND v_comments IS NULL THEN
    RAISE EXCEPTION 'Comments are required for rejection and return' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_request FROM public.approval_requests WHERE id=p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Approval request not found' USING ERRCODE='P0002'; END IF;
  IF NOT private.is_tenant_member(v_request.tenant_id)
     OR NOT private.has_company_access(v_request.tenant_id,v_request.tenant_company_id) THEN
    RAISE EXCEPTION 'Company access denied' USING ERRCODE='42501';
  END IF;
  v_is_manager := private.has_action_permission(v_request.tenant_id,'MANAGER');
  v_from_status := v_request.status;

  IF v_action='withdraw' THEN
    IF v_request.requested_by IS DISTINCT FROM v_uid AND NOT v_is_manager THEN
      RAISE EXCEPTION 'Only the requester or a manager may withdraw' USING ERRCODE='42501';
    END IF;
    IF v_from_status NOT IN ('pending_approval','submitted','returned') THEN
      RAISE EXCEPTION 'Request cannot be withdrawn from status %',v_from_status USING ERRCODE='22023';
    END IF;
    UPDATE public.approval_requests
      SET status='cancelled',cancelled_at=now(),updated_at=now()
      WHERE id=v_request.id;
    UPDATE public.approval_request_steps
      SET status='cancelled',updated_at=now()
      WHERE request_id=v_request.id AND status IN ('pending','queued');
    INSERT INTO public.approval_request_actions(
      tenant_id,tenant_company_id,request_id,actor_id,action,from_status,to_status,comments,metadata,created_at
    ) VALUES (v_request.tenant_id,v_request.tenant_company_id,v_request.id,v_uid,'withdrawn',
      v_from_status,'cancelled',coalesce(v_comments,'Withdrawn by requester.'),'{}'::jsonb,now());
    RETURN jsonb_build_object('success',true,'request_id',v_request.id,'status','cancelled');
  END IF;

  IF v_from_status NOT IN ('pending_approval','submitted') THEN
    RAISE EXCEPTION 'Request cannot be processed from status %',v_from_status USING ERRCODE='22023';
  END IF;
  IF v_request.requested_by=v_uid THEN
    RAISE EXCEPTION 'MAKER_CHECKER_VIOLATION: requester cannot approve own request' USING ERRCODE='42501';
  END IF;
  IF v_request.subject_employee_id IS NOT NULL THEN
    SELECT linked_user_id INTO v_employee_user FROM public.employees
    WHERE id=v_request.subject_employee_id
      AND tenant_id=v_request.tenant_id
      AND tenant_company_id=v_request.tenant_company_id;
    IF v_employee_user=v_uid THEN
      RAISE EXCEPTION 'MAKER_CHECKER_VIOLATION: employee cannot approve own change' USING ERRCODE='42501';
    END IF;
  END IF;

  SELECT * INTO v_step
  FROM public.approval_request_steps
  WHERE request_id=v_request.id
    AND step_order=coalesce(v_request.current_step_order,1)
    AND status='pending'
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'No active pending approval step' USING ERRCODE='22023'; END IF;

  v_is_assigned := coalesce(v_step.assigned_user_id=v_uid,false);
  IF NOT v_is_assigned AND v_step.assigned_employee_id IS NOT NULL THEN
    SELECT linked_user_id INTO v_employee_user FROM public.employees
    WHERE id=v_step.assigned_employee_id
      AND tenant_id=v_request.tenant_id
      AND tenant_company_id=v_request.tenant_company_id;
    v_is_assigned := v_employee_user=v_uid;
  END IF;
  IF NOT v_is_manager AND NOT v_is_assigned THEN
    RAISE EXCEPTION 'Current approver or manager permission required' USING ERRCODE='42501';
  END IF;

  IF v_action='reject' THEN
    v_to_status := 'rejected';
    UPDATE public.approval_request_steps SET status='rejected',comments=v_comments,acted_by=v_uid,acted_at=now(),updated_at=now() WHERE id=v_step.id;
    UPDATE public.approval_requests SET status='rejected',rejected_at=now(),updated_at=now() WHERE id=v_request.id;
  ELSIF v_action='return' THEN
    v_to_status := 'returned';
    UPDATE public.approval_request_steps SET status='returned',comments=v_comments,acted_by=v_uid,acted_at=now(),updated_at=now() WHERE id=v_step.id;
    UPDATE public.approval_requests SET status='returned',updated_at=now() WHERE id=v_request.id;
  ELSE
    UPDATE public.approval_request_steps SET status='approved',comments=v_comments,acted_by=v_uid,acted_at=now(),updated_at=now() WHERE id=v_step.id;
    SELECT * INTO v_next FROM public.approval_request_steps
    WHERE request_id=v_request.id AND step_order>v_step.step_order AND status='queued'
    ORDER BY step_order LIMIT 1 FOR UPDATE;
    IF FOUND THEN
      UPDATE public.approval_request_steps SET status='pending',updated_at=now() WHERE id=v_next.id;
      UPDATE public.approval_requests SET current_step_order=v_next.step_order,updated_at=now() WHERE id=v_request.id;
      v_to_status := 'pending_approval';
    ELSE
      UPDATE public.approval_requests SET status='approved',approved_at=now(),updated_at=now() WHERE id=v_request.id;
      v_to_status := 'approved';
      IF v_request.request_type='employee_change' THEN
        v_apply := public.apply_employee_change_request_atomic(v_request.id);
        IF coalesce((v_apply->>'success')::boolean,false) IS NOT TRUE THEN
          -- Snapshot conflicts are expected domain outcomes, not SQL exceptions.
          -- Raising here would roll back the failed status and conflict audit written
          -- by apply_employee_change_request_atomic in this same transaction.
          IF v_apply->>'code' = 'SNAPSHOT_CONFLICT' THEN
            UPDATE public.approval_request_steps
              SET comments = concat_ws(E'\n', nullif(comments,''), coalesce(v_apply->>'error','Snapshot conflict'),
                'Conflicting fields: ' || coalesce(v_apply->'conflicts','[]'::jsonb)::text),
                  updated_at = now()
              WHERE id = v_step.id;
            RETURN jsonb_build_object(
              'success', false,
              'request_id', v_request.id,
              'status', 'failed',
              'code', 'SNAPSHOT_CONFLICT',
              'error', coalesce(v_apply->>'error','Employee Master changed after the request was submitted.'),
              'conflicts', coalesce(v_apply->'conflicts','[]'::jsonb)
            );
          END IF;
          RAISE EXCEPTION 'Employee change application failed: %',coalesce(v_apply->>'error','unknown error') USING ERRCODE='P0001';
        END IF;
      END IF;
    END IF;
  END IF;

  INSERT INTO public.approval_request_actions(
    tenant_id,tenant_company_id,request_id,request_step_id,actor_id,action,
    from_status,to_status,comments,metadata,created_at
  ) VALUES (
    v_request.tenant_id,v_request.tenant_company_id,v_request.id,v_step.id,v_uid,
    CASE WHEN v_action='approve' AND v_to_status='pending_approval' THEN 'approved_step'
         WHEN v_action='approve' THEN 'approved' ELSE v_action||'ed' END,
    v_from_status,v_to_status,v_comments,'{}'::jsonb,now()
  );
  RETURN jsonb_build_object('success',true,'request_id',v_request.id,'status',v_to_status,
    'advanced',v_action='approve' AND v_to_status='pending_approval',
    'final_approved',v_action='approve' AND v_to_status='approved');
END;
$function$;

REVOKE ALL ON FUNCTION public.process_approval_request_action_atomic(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_approval_request_action_atomic(uuid,text,text) TO authenticated, service_role;
