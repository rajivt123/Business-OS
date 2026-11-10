-- Keep permission history append-only for authenticated application roles.
CREATE OR REPLACE FUNCTION private.prevent_permission_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path=''
AS $$
BEGIN
  RAISE EXCEPTION 'Permission audit records are immutable' USING ERRCODE='42501';
END;
$$;

REVOKE ALL ON FUNCTION private.prevent_permission_audit_mutation() FROM PUBLIC,anon,authenticated;

DROP TRIGGER IF EXISTS permission_change_audit_no_update ON public.permission_change_audit;
CREATE TRIGGER permission_change_audit_no_update
BEFORE UPDATE OR DELETE ON public.permission_change_audit
FOR EACH ROW EXECUTE FUNCTION private.prevent_permission_audit_mutation();

DROP TRIGGER IF EXISTS permission_change_audit_no_truncate ON public.permission_change_audit;
CREATE OR REPLACE FUNCTION private.prevent_permission_audit_truncate()
RETURNS trigger
LANGUAGE plpgsql
SET search_path=''
AS $$
BEGIN
  RAISE EXCEPTION 'Permission audit history cannot be truncated' USING ERRCODE='42501';
END;
$$;
REVOKE ALL ON FUNCTION private.prevent_permission_audit_truncate() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER permission_change_audit_no_truncate
BEFORE TRUNCATE ON public.permission_change_audit
FOR EACH STATEMENT EXECUTE FUNCTION private.prevent_permission_audit_truncate();
