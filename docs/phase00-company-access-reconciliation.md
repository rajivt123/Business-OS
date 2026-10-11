# Phase 00 — CRM Company Access Reconciliation

Audit date: 2026-10-11  
Environment: production Supabase, read-only inspection only  
Status: **not safe to remove legacy permissive policies yet**

## Executive result

The active tenant has 67 active memberships: one OWNER and 66 TEAM. Only two TEAM memberships have any user_company_access.can_view = true grant. The OWNER has three company grants. Sixty-four TEAM memberships have no company-view grant.

A read-only cross-check of assignment tables found:
- project_assignments: 36 active rows across 3 users.
- stage_assignments: 55 active rows across 3 users.
- task_assignees: 100 active rows across 3 users.
- employee_company_assignments: 0 active rows.

Only three users have active project/stage/task assignments. Two are current TEAM accounts (misbha@metrixengineers.co.in and rajivk@metrixengineers.co.in) and one is the OWNER account. Assignment tables are useful corroborating evidence for those users, but they are not a complete access roster for all staff.

## Non-synthetic-looking accounts requiring an explicit access decision

The following rows have no view grant and no project/stage/task assignments. Email naming alone does not prove whether an account is genuine, obsolete, or a test account; do not automatically grant or delete these accounts.

| Account | Membership role | Existing view grants | Assignment evidence |
|---|---|---:|---|
| admin@businessos.internal | TEAM | 0 | None found |
| admin@metrixengineers.co.in | TEAM | 0 | None found |
| manager@businessos.internal | TEAM | 0 | None found |
| manager@metrixengineers.co.in | TEAM | 0 | None found |
| owner@businessos.internal | TEAM | 0 | None found |
| owner@metrixengineers.co.in | TEAM | 0 | None found |
| rajiv.owner2026@gmail.com | TEAM | 0 | None found |

These accounts also use TEAM membership roles despite labels that suggest admin/manager/owner. That is a role-quality issue requiring review, not proof that they should be promoted.

## Accounts with assignment evidence

| Account | Membership role | View grants | Companies with active project assignments | Note |
|---|---|---:|---:|---|
| misbha@metrixengineers.co.in | TEAM | 2 | 2 | Grant count matches distinct assigned-company count; validate exact IDs before rollout |
| rajivk@metrixengineers.co.in | TEAM | 2 | 3 | **Mismatch:** active assignment data spans more companies than current view grants |
| Owner account | OWNER | 3 | 2 | OWNER authorization helper allows all active companies in the tenant; assignment rows are not the full access basis |

Exact assignment cross-check:
- misbha has active assignments in Metrix Engineering Services and Metrix Industrial Solutions; both have matching view grants.
- rajivk has assignments in those same two companies, plus Rajiv Fire Systems Pvt Ltd (company ID 11111111-1111-1111-1111-111111111111). That third company is active, but rajivk has no view grant for it.
- Three active assignment rows point to the Rajiv Fire Systems Pvt Ltd company across assignment sources. This may be legitimate work or stale/default test data; it must be reviewed, not auto-granted.
- Owner has grants for three companies, including the active Rajiv Fire Systems company.

Do not infer that a TEAM user should gain access to every company found in their assignments without checking active assignment IDs and intended policy. In particular, the rajivk mismatch needs an explicit review.

### Exact Rajiv Fire Systems assignment evidence

Read-only inspection found six active assignment rows for rajivk@metrixengineers.co.in under tenant_company_id `11111111-1111-1111-1111-111111111111`, all created/assigned between 2026-09-19 and 2026-09-25 UTC:

| Source | Assignment ID | Work | Role | Assigned at (UTC) |
|---|---|---|---|---|
| project_assignments | `8a981175-78a6-4ffe-b534-e4fab176e3d9` | Security Block | member | 2026-09-19 19:25:45 |
| project_assignments | `4ce6136f-f063-4ed1-8c26-fecd98e172e8` | Hydrant System_Phase 2 | member | 2026-09-20 15:43:05 |
| stage_assignments | `79ff656a-bbc3-4501-8de8-386e42575032` | Hydrant System_Phase 2 | responsible | 2026-09-20 15:43:20 |
| project_assignments | `1f208a11-2e51-42eb-9b19-96490f84a21d` | Test_PO_1 | member | 2026-09-25 19:25:51 |
| task_assignees | `9df4e3c6-3249-4aac-9548-18e9d31bf6db` | Task row (no work_id column) | assignee | 2026-09-25 17:33:40 |
| task_assignees | `fb7f805a-99a1-48d1-b961-d2a99554419b` | Task row (no work_id column) | assignee | 2026-09-25 19:26:21 |

The work names include `Test_PO_1`, which is a signal to inspect data provenance, but the two other named works and the active assignment statuses mean these records cannot safely be dismissed as test data from naming alone. Task assignee rows do not carry a work_id in this schema, so their parent task relationship needs a separate read-only join before concluding which work they relate to. No grant or assignment was changed.

## Likely test-account contamination

A naming-pattern-only heuristic flags 57 of 66 TEAM accounts as probable test accounts (for example, generated @example.com/@test.com addresses and qa_, test_, inspector_, or dev_test prefixes). This is a heuristic, not a deletion list. Preserve these accounts and data until account owners and test-data retention are confirmed.

The 9 accounts outside that heuristic include the seven listed above plus the two assigned TEAM accounts. There may be legitimate accounts using test-like names or test accounts using real-looking addresses; the heuristic is not authoritative.

## Policy impact

Live broad permissive policies were confirmed on companies, units, works, issues, logs, reminders, and global profile readers. Since permissive PostgreSQL RLS policies are OR-combined, they can override the practical restrictions intended by narrower company-scoped policies.

The branch migration 20261011180000_phase00_remove_legacy_permissive_crm_policies.sql now covers the identified broad CRM policies. It remains review-only and must not be applied to production until:
1. A trusted owner confirms the intended active-user/company access matrix.
2. The assignment mismatch above is resolved.
3. Every active membership receives an explicit decision: assigned company grants, owner/admin tenant-wide authority where intended, or deactivation where formally approved.
4. Two-company and two-tenant RLS regression tests pass for SELECT, INSERT, UPDATE, DELETE and profile peer visibility.
5. Frontend flows are tested after removing the legacy policy bypasses.

## Safe next steps

1. Use the active operating-company assignments UI/records and the business owner’s roster to reconcile the seven unresolved real-looking accounts.
2. Review the six assignment rows associated with Rajiv Fire Systems Pvt Ltd; inspect task parent relationships and confirm whether they are valid assignments or legacy/default records.
3. Inspect project_assignments, stage_assignments, and task_assignees by exact company UUID for the three assigned users; compare to user_company_access UUIDs.
4. Review probable test users for retirement in a separate cleanup plan; do not bundle account deletion with RLS hardening.
5. Build isolated test fixtures for the access matrix; do not create fake business transactions in production.
6. Apply the lockdown migration only after review and regression tests.

## Change record

No production data was modified by this audit. Only read-only SQL queries were executed. No company grants were inserted, no accounts were deleted, and no production migration or Edge Function was deployed.
