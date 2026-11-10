# Administrator Settings — Phase 1

## Confirmed decisions
- Sleeping partner: all modules in explicitly assigned companies, read-only by default. Read is granted; create/update/delete/approve/export/manage-permissions remain false unless separately and explicitly granted.
- Tenant-wide destructive actions may be delegated. A delegate can re-delegate only when their own grant includes can_delegate for that exact action.
- OWNER retains tenant-wide authority. Every non-owner, including ADMIN, needs explicit company assignment.
- Backend enforcement is authoritative; UI hiding is not security.

## Phase 1 migration scope
The additive migration creates company_module_permissions and tenant_admin_action_delegations, plus private authorization predicates and RLS on the new tables. It does not rewrite existing helpers, remove legacy policies, backfill users, or change existing access. It is a preparation migration and must not be run against production yet.

## Permission vocabulary
Actions: read, create, update, delete, approve, export, manage_permissions.
Stable module keys: hr, payroll, accounts, inventory, procurement, crm, documents, administration.
Role labels are UI presets only. Persist explicit grants.

## Delegated tenant actions
Initial action keys: tenant_delete, ownership_transfer, tenant_settings_manage, membership_manage, company_create, company_archive.
A holder can grant/revoke only the exact action they hold and only if can_delegate=true. Owner can delegate. A controlled grant/revoke RPC with immutable audit logging is required before UI writes are enabled.

## Follow-on implementation required
1. Build atomic grant/revoke RPCs; validate target membership and company tenant identity; ensure requested booleans are a subset of grantor rights; write audit events.
2. Replace legacy has_company_access and has_action_permission call sites only after grant reconciliation; preserve owner access and remove implicit ADMIN-wide company access.
3. Add module/action checks to every SECURITY DEFINER RPC across HR, payroll, accounts, procurement/inventory, CRM, company settings and reports.
4. Update Edge Functions to use the same authorization predicates and verify exact entity-to-company identity, especially upload finalization.
5. Remove frontend first-company fallback and require explicit active company.
6. Replace broad legacy RLS policies only after mapping callers. Public MEP reference catalog policies require a separate product decision.
7. Split company settings into safe profile read and sensitive settings write/read permissions. Sleeping partners see assigned modules read-only, subject to sensitive submodule grants.
8. Reconcile the live 70 memberships and 7 company-access rows with the owner before backfill. Never auto-grant.

## Rollout and rollback
- Branch-only preparation. No production SQL or deployment.
- Apply only to a disposable test database first.
- Validate cross-company and cross-tenant negative tests, RPCs, Edge Functions and existing HR/Accounts/Payroll workflows.
- Rollback this additive phase by removing its policies, functions and tables only after verifying no client depends on them. Never delete existing memberships or grants.

## Acceptance matrix
- Unassigned ADMIN: denied even if tenant role is ADMIN.
- Assigned partner: only explicitly granted modules/actions in assigned company.
- Sleeping partner preset: read true; all mutation/approval/export/manage flags false.
- HR manager A+B: HR access A+B, no C and no Accounts absent grant.
- Accountant: Accounts only; no Payroll absent grant.
- Delegated manager: permission management only in assigned company/module; cannot grant rights beyond own.
- Delegate execute-only: cannot re-delegate.
- Delegate with execute+delegate: can delegate exact action only.
- Owner: all companies.
- Cross-tenant or mismatched IDs: denied.
- Payroll maker-checker: requester cannot approve own run.
- Storage: upload/finalize/download/archive/delete enforce company and parent entity identity.
- Missing active company: fail closed, never choose first company.
