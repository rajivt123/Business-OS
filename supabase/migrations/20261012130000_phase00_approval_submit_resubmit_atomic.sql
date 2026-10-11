-- Atomic submit/resubmit RPCs for approval requests.
-- Source-only; current frontend must be migrated before direct table writes can be revoked.
CREATE OR REPLACE FUNCTION public.submit_approval_request_atomic(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_type text := nullif(trim(p_payload->>'request_type'),'');
  v_workflow uuid := nullif(p_payload->>'workflow_id','')::uuid;
  v_request_id uuid;
  v_request_number text := nullif(trim(p_payload->>'request_number'),'');
  v_title text := nullif(trim(p_payload->>'title'),'');
  v_payload jsonb;
  v_snapshot jsonb;
  v_step record;
  v_order integer := 0;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  IF v_tenant IS NULL OR v_company IS NULL OR v_type IS NULL THEN
    RAISE EXCEPTION 'Tenant, company and request_type are required' USING ERRCODE='22023';
  END IF;
  IF NOT private.is_tenant_member(v_tenant)
     OR NOT private.has_company_access(v_tenant,v_company) THEN
    RAISE EXCEPTION 'Company access denied' USING ERRCODE='42501';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.tenant_companies
    WHERE id=v_company AND tenant_id=v_tenant AND status='active') THEN
    RAISE EXCEPTION 'Active tenant company not found' USING ERRCODE='42501';
  END IF;

  IF v_workflow IS NULL THEN
    SELECT id INTO v_workflow FROM public.approval_workflows
    WHERE tenant_id=v_tenant AND tenant_company_id=v_company
      AND request_type=v_type AND status='ACTIVE'
    ORDER BY created_at DESC NULLS LAST LIMIT 1;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.approval_workflows
      WHERE id=v_workflow AND tenant_id=v_tenant AND tenant_company_id=v_company
        AND request_type=v_type AND status='ACTIVE') THEN
      RAISE EXCEPTION 'Workflow is not active for this company and request type' USING ERRCODE='22023';
    END IF;
  END IF;

  v_payload := CASE WHEN jsonb_typeof(p_payload->'payload')='object'
    OR jsonb_typeof(p_payload->'payload')='array' THEN p_payload->'payload'
    WHEN jsonb_typeof(p_payload->'payload')='string' THEN (p_payload->>'payload')::jsonb
    ELSE '{}'::jsonb END;
  v_snapshot := CASE WHEN jsonb_typeof(p_payload->'current_snapshot')='object'
    OR jsonb_typeof(p_payload->'current_snapshot')='array' THEN p_payload->'current_snapshot'
    WHEN jsonb_typeof(p_payload->'current_snapshot')='string' THEN (p_payload->>'current_snapshot')::jsonb
    ELSE NULL END;
  v_title := coalesce(v_title,'Request '||v_type);
  v_request_number := coalesce(v_request_number,
    CASE WHEN v_type='employee_change' THEN 'EMP-CHG-' ELSE 'REQ-' END||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)));

  INSERT INTO public.approval_requests(
    tenant_id,tenant_company_id,request_type,request_number,requested_by,subject_employee_id,
    entity_type,entity_id,title,description,payload,current_snapshot,status,priority,workflow_id,
    current_step_order,submitted_at,created_at,updated_at
  ) VALUES (
    v_tenant,v_company,v_type,v_request_number,v_uid,
    nullif(p_payload->>'subject_employee_id','')::uuid,
    nullif(p_payload->>'entity_type',''),
    nullif(p_payload->>'entity_id','')::uuid,
    v_title,nullif(p_payload->>'description',''),v_payload,v_snapshot,'pending_approval',
    coalesce(nullif(p_payload->>'priority',''),'normal'),v_workflow,1,now(),now(),now()
  ) RETURNING id INTO v_request_id;

  IF v_workflow IS NOT NULL THEN
    FOR v_step IN
      SELECT id,step_order,approver_type,approver_role
      FROM public.approval_workflow_steps
      WHERE approval_workflow_id=v_workflow AND tenant_id=v_tenant
      ORDER BY step_order
    LOOP
      v_order:=v_order+1;
      INSERT INTO public.approval_request_steps(
        tenant_id,tenant_company_id,request_id,workflow_step_id,step_order,
        approver_type,approver_role,status,created_at,updated_at
      ) VALUES (v_tenant,v_company,v_request_id,v_step.id,v_order,
        coalesce(v_step.approver_type,'Role'),coalesce(v_step.approver_role,'Manager'),
        CASE WHEN v_order=1 THEN 'pending' ELSE 'queued' END,now(),now());
    END LOOP;
  END IF;
  IF v_order=0 THEN
    INSERT INTO public.approval_request_steps(
      tenant_id,tenant_company_id,request_id,step_order,approver_type,approver_role,status,created_at,updated_at
    ) VALUES(v_tenant,v_company,v_request_id,1,'Role','Manager','pending',now(),now());
  END IF;

  INSERT INTO public.approval_request_actions(
    tenant_id,tenant_company_id,request_id,actor_id,action,from_status,to_status,comments,metadata,created_at
  ) VALUES(v_tenant,v_company,v_request_id,v_uid,'submitted','draft','pending_approval',NULL,'{}'::jsonb,now());
  RETURN jsonb_build_object('success',true,'request_id',v_request_id,'request_number',v_request_number,'status','pending_approval');
END;
$function$;

CREATE OR REPLACE FUNCTION public.resubmit_approval_request_atomic(
  p_request_id uuid,
  p_updated_payload jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_request public.approval_requests%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  IF p_request_id IS NULL OR jsonb_typeof(p_updated_payload) NOT IN ('object','array') THEN
    RAISE EXCEPTION 'Request id and JSON payload are required' USING ERRCODE='22023';
  END IF;
  SELECT * INTO v_request FROM public.approval_requests WHERE id=p_request_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Approval request not found' USING ERRCODE='P0002'; END IF;
  IF v_request.requested_by IS DISTINCT FROM v_uid THEN
    RAISE EXCEPTION 'Only the original requester may resubmit' USING ERRCODE='42501';
  END IF;
  IF NOT private.is_tenant_member(v_request.tenant_id)
     OR NOT private.has_company_access(v_request.tenant_id,v_request.tenant_company_id) THEN
    RAISE EXCEPTION 'Company access denied' USING ERRCODE='42501';
  END IF;
  IF v_request.status<>'returned' THEN
    RAISE EXCEPTION 'Only returned requests can be resubmitted' USING ERRCODE='22023';
  END IF;

  UPDATE public.approval_requests SET payload=p_updated_payload,status='pending_approval',
    current_step_order=1,submitted_at=now(),updated_at=now() WHERE id=v_request.id;
  UPDATE public.approval_request_steps SET status=CASE WHEN step_order=1 THEN 'pending' ELSE 'queued' END,
    comments=NULL,acted_by=NULL,acted_at=NULL,updated_at=now() WHERE request_id=v_request.id;
  INSERT INTO public.approval_request_actions(
    tenant_id,tenant_company_id,request_id,actor_id,action,from_status,to_status,comments,metadata,created_at
  ) VALUES(v_request.tenant_id,v_request.tenant_company_id,v_request.id,v_uid,'resubmitted',
    'returned','pending_approval','Resubmitted with updated values.','{}'::jsonb,now());
  RETURN jsonb_build_object('success',true,'request_id',v_request.id,'status','pending_approval');
END;
$function$;

REVOKE ALL ON FUNCTION public.submit_approval_request_atomic(jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.resubmit_approval_request_atomic(uuid,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_approval_request_atomic(jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resubmit_approval_request_atomic(uuid,jsonb) TO authenticated, service_role;
