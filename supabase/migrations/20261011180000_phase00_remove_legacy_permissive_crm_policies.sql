-- Phase 00: remove legacy permissive policies that bypass tenant-scoped CRM access.
-- Reviewed against live pg_policies on 2026-10-11. Review/test only; do not apply to production
-- until isolated regression tests confirm the intended access matrix and all memberships have
-- authoritative operating-company assignments. Permissive policies are OR-combined.
BEGIN;

DROP POLICY IF EXISTS "CRM Access Companies" ON public.companies;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.companies;

DROP POLICY IF EXISTS "CRM Access Units" ON public.units;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.units;

DROP POLICY IF EXISTS "CRM Access Works" ON public.works;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.works;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.issues;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.issues;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.logs;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.logs;

-- The broad reminder policy bypasses the narrower company and personal-owner policies.
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.reminders;

-- Narrow tenant-peer profile policy already exists; remove global profile readers.
DROP POLICY IF EXISTS "Allow all authenticated users to read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

COMMIT;
