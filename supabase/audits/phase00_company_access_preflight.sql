-- READ-ONLY preflight for the Phase 00 RLS policy lockdown.
-- Run and review before applying 20261011180000_phase00_remove_legacy_permissive_crm_policies.sql.
-- Do not expose user emails in reports shared outside the authorized admin team.

-- 1. Active memberships by role and company-access coverage.
SELECT
  tm.role,
  COUNT(*) AS active_memberships,
  COUNT(*) FILTER (WHERE access.membership_id IS NOT NULL) AS memberships_with_any_company_access,
  COUNT(*) FILTER (WHERE access.membership_id IS NULL) AS memberships_without_company_access
FROM public.tenant_memberships tm
LEFT JOIN (
  SELECT DISTINCT membership_id
  FROM public.user_company_access
  WHERE can_view = TRUE
) access ON access.membership_id = tm.id
WHERE tm.status = 'active'
GROUP BY tm.role
ORDER BY tm.role;

-- 2. Active non-elevated memberships without a view grant.
-- These users may lose access to all operating-company records when broad policies are removed.
SELECT tm.tenant_id, tm.id AS membership_id, tm.role
FROM public.tenant_memberships tm
WHERE tm.status = 'active'
  AND tm.role NOT IN ('OWNER', 'ADMIN')
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_company_access uca
    WHERE uca.membership_id = tm.id
      AND uca.tenant_id = tm.tenant_id
      AND uca.can_view = TRUE
  )
ORDER BY tm.tenant_id, tm.role;

-- 3. Grants pointing to inactive/mismatched tenant companies.
SELECT uca.tenant_id, uca.membership_id, uca.tenant_company_id, uca.can_view, uca.can_edit
FROM public.user_company_access uca
LEFT JOIN public.tenant_companies tc
  ON tc.id = uca.tenant_company_id
 AND tc.tenant_id = uca.tenant_id
WHERE tc.id IS NULL OR tc.status <> 'active';
