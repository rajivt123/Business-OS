# Administrator Settings — Phase 1

## Confirmed decisions
- Sleeping partner: all modules in explicitly assigned companies, read-only by default. Read is granted; create/update/delete/approve/export/manage-permissions remain false unless separately and explicitly granted.
- Tenant-wide destructive actions may be delegated. A delegate can re-delegate only when their own grant includes can_delegate for that exact action.
- OWNER retains tenant-wide authority. Every non-owner, including ADMIN, needs explicit company assignment.
- Backend enforcement is authoritative; UI hiding is not security.

## Phase 1 migration scope
The additive migrations create company_module_permissions, tenant_admin_action_delegations and permission_change_audit, plus private authorization predicates, controlled audited mutation RPCs and RLS. They do not rewrite existing helpers, remove legacy policies, backfill users, or change existing access. They are preparation only and must not be run against production yet.

## Permission vocabulary
Actions: read, create, update, delete, approve, export, manage_permissions.
Stable module keys: hr, payroll, accounts, inventory, procurement, crm, documents, administration.
Role labels are UI presets only. Persist explicit grants.

## Delegated tenant actions
Initial action keys: tenant_delete, ownership_transfer, tenant_settings_manage, membership_manage, company_create, company_archive.
A holder can grant/revoke only the exact action they hold and only if can_delegate=true. Owner can delegate. A controlled grant/revoke RPC with immutable audit logging is required before UI writes are enabled.

## Grant mutation implementation status
- Added SECURITY DEFINER RPCs for module grants and tenant-action delegation. They validate active actor/target memberships, tenant/company identity, explicit target company assignment, prevent self-grants, enforce grantor ceilings, and write before/after audit events.
- Added a tenant-scoped workspace read RPC. It requires an explicit tenant ID and owner or delegated membership-management authority; non-owners receive company-scoped access/permission rows only within their own company visibility.
- Direct authenticated INSERT/UPDATE/DELETE on permission tables is revoked; only the RPCs can mutate them. Read access remains subject to RLS.
- These RPCs are committed but not runtime-tested. They are not yet wired into the Administrator Settings UI.

## Follow-on implementation required
1. Run all three migrations and fixture tests against a disposable Supabase database; correct any SQL/runtime errors before production consideration.
2. Connect the Permissions UI to `admin_get_permission_workspace(p_tenant_id)` for reads and the two audited mutation RPCs for writes. Remove all mock people/companies and local-only permission drafts before enabling this screen.
3. Replace legacy has_company_access and has_action_permission call sites only after grant reconciliation; preserve owner access and remove implicit ADMIN-wide company access.
4. Add module/action checks to every SECURITY DEFINER RPC across HR, payroll, accounts, procurement/inventory, CRM, company settings and reports.
5. Update Edge Functions to use the same authorization predicates and verify exact entity-to-company identity, especially upload finalization.
6. Remove frontend first-company fallback and require explicit active company.
7. Replace broad legacy RLS policies only after mapping callers. Public MEP reference catalog policies require a separate product decision.
8. Split company settings into safe profile read and sensitive settings write/read permissions. Sleeping partners see assigned modules read-only, subject to sensitive submodule grants.
9. Reconcile the live 70 memberships and 7 company-access rows with the owner before backfill. Never auto-grant.

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
