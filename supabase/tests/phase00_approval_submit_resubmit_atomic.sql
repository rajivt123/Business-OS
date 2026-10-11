-- Disposable PostgreSQL regression for approval submit/resubmit RPCs.
-- Never run against production.
CREATE SCHEMA auth;
CREATE SCHEMA private;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('test.uid',true),'')::uuid $$;
CREATE FUNCTION private.is_tenant_member(uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT true $$;
CREATE FUNCTION private.has_company_access(uuid,uuid) RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT true $$;
CREATE TABLE public.tenant_companies(id uuid PRIMARY KEY,tenant_id uuid NOT NULL,status text NOT NULL);
CREATE TABLE public.approval_workflows(
 id uuid PRIMARY KEY,tenant_id uuid NOT NULL,tenant_company_id uuid NOT NULL,request_type text NOT NULL,
 status text NOT NULL,created_at timestamptz DEFAULT now()
);
CREATE TABLE public.approval_workflow_steps(
 id uuid PRIMARY KEY,tenant_id uuid NOT NULL,approval_workflow_id uuid NOT NULL,step_order integer NOT NULL,
 approver_type text NOT NULL,approver_role text,required boolean NOT NULL DEFAULT true,
 created_at timestamptz DEFAULT now(),updated_at timestamptz
);
CREATE TABLE public.approval_requests(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,tenant_company_id uuid NOT NULL,
 request_type text NOT NULL,request_number text,requested_by uuid NOT NULL,subject_employee_id uuid,
 entity_type text,entity_id uuid,title text NOT NULL,description text,payload jsonb NOT NULL,
 current_snapshot jsonb,status text NOT NULL,priority text NOT NULL,workflow_id uuid,current_step_order integer,
 submitted_at timestamptz,approved_at timestamptz,rejected_at timestamptz,cancelled_at timestamptz,
 created_at timestamptz,updated_at timestamptz
);
CREATE TABLE public.approval_request_steps(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,tenant_company_id uuid NOT NULL,
 request_id uuid NOT NULL,workflow_step_id uuid,step_order integer NOT NULL,approver_type text NOT NULL,
 approver_role text,assigned_user_id uuid,assigned_employee_id uuid,status text NOT NULL,
 acted_at timestamptz,acted_by uuid,comments text,created_at timestamptz,updated_at timestamptz
);
CREATE TABLE public.approval_request_actions(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,tenant_company_id uuid NOT NULL,
 request_id uuid NOT NULL,request_step_id uuid,actor_id uuid,action text NOT NULL,comments text,
 from_status text,to_status text,metadata jsonb NOT NULL DEFAULT '{}'::jsonb,created_at timestamptz NOT NULL DEFAULT now()
);
\i supabase/migrations/20261012130000_phase00_approval_submit_resubmit_atomic.sql
DO $test$
DECLARE
 t constant uuid:='10000000-0000-0000-0000-000000000001';
 c constant uuid:='20000000-0000-0000-0000-000000000001';
 u constant uuid:='30000000-0000-0000-0000-000000000001';
 result jsonb;
 req uuid;
 step_status text;
 req_status text;
BEGIN
 PERFORM set_config('test.uid',u::text,false);
 INSERT INTO public.tenant_companies VALUES(c,t,'active');
 result:=public.submit_approval_request_atomic(jsonb_build_object(
   'tenant_id',t,'tenant_company_id',c,'request_type','general','title','Test request',
   'payload',jsonb_build_object('version',1),'priority','normal'
 ));
 req:=(result->>'request_id')::uuid;
 IF result->>'status'<>'pending_approval' OR req IS NULL THEN RAISE EXCEPTION 'Submit failed: %',result; END IF;
 IF (SELECT count(*) FROM public.approval_request_steps WHERE request_id=req)<>1 THEN RAISE EXCEPTION 'Fallback approval step missing'; END IF;
 IF (SELECT count(*) FROM public.approval_request_actions WHERE request_id=req AND action='submitted')<>1 THEN RAISE EXCEPTION 'Submission action missing'; END IF;
 UPDATE public.approval_requests SET status='returned' WHERE id=req;
 UPDATE public.approval_request_steps SET status='returned',comments='Fix this' WHERE request_id=req;
 result:=public.resubmit_approval_request_atomic(req,jsonb_build_object('version',2));
 IF result->>'status'<>'pending_approval' THEN RAISE EXCEPTION 'Resubmit failed: %',result; END IF;
 SELECT status INTO req_status FROM public.approval_requests WHERE id=req;
 SELECT status INTO step_status FROM public.approval_request_steps WHERE request_id=req;
 IF req_status<>'pending_approval' OR step_status<>'pending' THEN RAISE EXCEPTION 'Resubmit did not reset state'; END IF;
 IF (SELECT payload->>'version' FROM public.approval_requests WHERE id=req)<>'2' THEN RAISE EXCEPTION 'Resubmit payload not updated'; END IF;
 IF (SELECT count(*) FROM public.approval_request_actions WHERE request_id=req AND action='resubmitted')<>1 THEN RAISE EXCEPTION 'Resubmission action missing'; END IF;
END;
$test$;
DROP FUNCTION public.submit_approval_request_atomic(jsonb);
DROP FUNCTION public.resubmit_approval_request_atomic(uuid,jsonb);
DROP TABLE public.approval_request_actions CASCADE;
DROP TABLE public.approval_request_steps CASCADE;
DROP TABLE public.approval_requests CASCADE;
DROP TABLE public.approval_workflow_steps CASCADE;
DROP TABLE public.approval_workflows CASCADE;
DROP TABLE public.tenant_companies CASCADE;
DROP FUNCTION private.has_company_access(uuid,uuid);
DROP FUNCTION private.is_tenant_member(uuid);
DROP FUNCTION auth.uid();
DROP SCHEMA private;
DROP SCHEMA auth;
