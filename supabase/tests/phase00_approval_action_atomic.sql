-- Disposable PostgreSQL regression for atomic approval actions.
-- Never run against production; uses only minimal schema stubs.
CREATE SCHEMA auth;
CREATE SCHEMA private;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
CREATE FUNCTION private.is_tenant_member(uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT true $$;
CREATE FUNCTION private.has_company_access(uuid,uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT true $$;
CREATE FUNCTION private.has_action_permission(uuid,text) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT coalesce(current_setting('test.manager',true),'false')='true' $$;
CREATE TABLE public.approval_requests(
 id uuid PRIMARY KEY,tenant_id uuid NOT NULL,tenant_company_id uuid NOT NULL,request_type text NOT NULL,
 requested_by uuid NOT NULL,subject_employee_id uuid,title text NOT NULL,payload jsonb NOT NULL,
 current_snapshot jsonb,status text NOT NULL,current_step_order integer,approved_at timestamptz,
 rejected_at timestamptz,cancelled_at timestamptz,updated_at timestamptz
);
CREATE TABLE public.approval_request_steps(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,tenant_company_id uuid NOT NULL,
 request_id uuid NOT NULL,step_order integer NOT NULL,assigned_user_id uuid,assigned_employee_id uuid,
 status text NOT NULL,comments text,acted_by uuid,acted_at timestamptz,updated_at timestamptz
);
CREATE TABLE public.approval_request_actions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,tenant_company_id uuid NOT NULL,
 request_id uuid NOT NULL,request_step_id uuid,actor_id uuid,action text NOT NULL,
 from_status text,to_status text,comments text,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.employees(id uuid PRIMARY KEY,tenant_id uuid NOT NULL,tenant_company_id uuid NOT NULL,linked_user_id uuid);
CREATE FUNCTION public.apply_employee_change_request_atomic(p_approval_request_id uuid) RETURNS jsonb
LANGUAGE plpgsql AS $
BEGIN
 IF coalesce(current_setting('test.snapshot_conflict',true),'false')='true' THEN
  UPDATE public.approval_requests SET status='failed',updated_at=now() WHERE id=p_approval_request_id;
  INSERT INTO public.approval_request_actions(tenant_id,tenant_company_id,request_id,actor_id,action,from_status,to_status,comments,metadata,created_at)
  SELECT tenant_id,tenant_company_id,id,auth.uid(),'failed','approved','failed',
    'Snapshot conflict during atomic Employee Master application. Conflicting fields: mobile',
    jsonb_build_object('conflicts',jsonb_build_array('mobile')),now()
  FROM public.approval_requests WHERE id=p_approval_request_id;
  RETURN jsonb_build_object('success',false,'code','SNAPSHOT_CONFLICT',
    'error','Employee Master changed after the request was submitted.','conflicts',jsonb_build_array('mobile'));
 END IF;
 RETURN jsonb_build_object('success',true);
END;
$;
\i supabase/migrations/20261012120000_phase00_approval_action_atomic.sql
DO $test$
DECLARE
 t constant uuid:='10000000-0000-0000-0000-000000000001';
 c constant uuid:='20000000-0000-0000-0000-000000000001';
 maker constant uuid:='30000000-0000-0000-0000-000000000001';
 manager constant uuid:='30000000-0000-0000-0000-000000000002';
 req constant uuid:='40000000-0000-0000-0000-000000000001';
 s1 constant uuid:='50000000-0000-0000-0000-000000000001';
 s2 constant uuid:='50000000-0000-0000-0000-000000000002';
 got jsonb;
 st text;
BEGIN
 PERFORM set_config('test.uid',maker::text,false);
 PERFORM set_config('test.manager','false',false);
 INSERT INTO public.approval_requests(id,tenant_id,tenant_company_id,request_type,requested_by,title,payload,status,current_step_order)
 VALUES(req,t,c,'other',maker,'Test','{}','pending_approval',1);
 INSERT INTO public.approval_request_steps(id,tenant_id,tenant_company_id,request_id,step_order,status)
 VALUES(s1,t,c,req,1,'pending'),(s2,t,c,req,2,'queued');
 BEGIN
  PERFORM public.process_approval_request_action_atomic(req,'approve',NULL);
  RAISE EXCEPTION 'Expected maker-checker denial';
 EXCEPTION WHEN SQLSTATE '42501' THEN
  IF SQLERRM NOT LIKE 'MAKER_CHECKER_VIOLATION:%' THEN RAISE; END IF;
 END;
 SELECT status INTO st FROM public.approval_requests WHERE id=req;
 IF st<>'pending_approval' THEN RAISE EXCEPTION 'Denied action changed request'; END IF;
 -- An unrelated user must not approve a step with no assignment.
 PERFORM set_config('test.uid','30000000-0000-0000-0000-000000000099',false);
 BEGIN
  PERFORM public.process_approval_request_action_atomic(req,'approve',NULL);
  RAISE EXCEPTION 'Expected unassigned user denial';
 EXCEPTION WHEN SQLSTATE '42501' THEN
  IF SQLERRM<>'Current approver or manager permission required' THEN RAISE; END IF;
 END;
 PERFORM set_config('test.uid',manager::text,false);
 PERFORM set_config('test.manager','true',false);
 got:=public.process_approval_request_action_atomic(req,'approve','reviewed');
 IF got->>'status'<>'pending_approval' OR got->>'advanced'<>'true' THEN RAISE EXCEPTION 'Expected next step activation: %',got; END IF;
 SELECT status INTO st FROM public.approval_request_steps WHERE id=s2;
 IF st<>'pending' THEN RAISE EXCEPTION 'Next step did not become pending'; END IF;
 IF (SELECT count(*) FROM public.approval_request_actions WHERE request_id=req)<>1 THEN RAISE EXCEPTION 'Action history was not written atomically'; END IF;
 -- Snapshot conflict must be a durable domain result, not an exception that rolls back audit.
 DECLARE
  req_conflict constant uuid:='40000000-0000-0000-0000-000000000002';
  s_conflict constant uuid:='50000000-0000-0000-0000-000000000003';
  emp constant uuid:='60000000-0000-0000-0000-000000000001';
  conflict_result jsonb;
  conflict_status text;
  conflict_audit_count integer;
  conflict_step_comments text;
 BEGIN
  INSERT INTO public.employees(id,tenant_id,tenant_company_id,linked_user_id)
  VALUES(emp,t,c,maker);
  INSERT INTO public.approval_requests(id,tenant_id,tenant_company_id,request_type,requested_by,subject_employee_id,title,payload,status,current_step_order)
  VALUES(req_conflict,t,c,'employee_change',maker,emp,'Employee contact change','{"mobile":"999"}','pending_approval',1);
  INSERT INTO public.approval_request_steps(id,tenant_id,tenant_company_id,request_id,step_order,status)
  VALUES(s_conflict,t,c,req_conflict,1,'pending');
  PERFORM set_config('test.snapshot_conflict','true',false);
  conflict_result:=public.process_approval_request_action_atomic(req_conflict,'approve',NULL);
  SELECT status INTO conflict_status FROM public.approval_requests WHERE id=req_conflict;
  SELECT count(*) INTO conflict_audit_count FROM public.approval_request_actions
    WHERE request_id=req_conflict AND action='failed' AND to_status='failed';
  SELECT comments INTO conflict_step_comments FROM public.approval_request_steps WHERE id=s_conflict;
  IF conflict_result->>'success'<>'false' OR conflict_result->>'code'<>'SNAPSHOT_CONFLICT'
     OR conflict_result->'conflicts'<>jsonb_build_array('mobile') THEN
    RAISE EXCEPTION 'Snapshot conflict details not returned: %',conflict_result;
  END IF;
  IF conflict_status<>'failed' THEN RAISE EXCEPTION 'Snapshot conflict status was rolled back: %',conflict_status; END IF;
  IF conflict_audit_count<>1 THEN RAISE EXCEPTION 'Snapshot conflict audit was rolled back or duplicated: %',conflict_audit_count; END IF;
  IF conflict_step_comments NOT LIKE '%Snapshot conflict%' OR conflict_step_comments NOT LIKE '%mobile%' THEN
    RAISE EXCEPTION 'Approval step does not explain application conflict: %',conflict_step_comments;
  END IF;
  PERFORM set_config('test.snapshot_conflict','false',false);
 END;
END;
$test$;
DROP FUNCTION public.process_approval_request_action_atomic(uuid,text,text);
DROP FUNCTION public.apply_employee_change_request_atomic(uuid);
DROP TABLE public.approval_request_actions CASCADE;
DROP TABLE public.approval_request_steps CASCADE;
DROP TABLE public.approval_requests CASCADE;
DROP TABLE public.employees CASCADE;
DROP FUNCTION private.has_action_permission(uuid,text);
DROP FUNCTION private.has_company_access(uuid,uuid);
DROP FUNCTION private.is_tenant_member(uuid);
DROP FUNCTION auth.uid();
DROP SCHEMA private;
DROP SCHEMA auth;
