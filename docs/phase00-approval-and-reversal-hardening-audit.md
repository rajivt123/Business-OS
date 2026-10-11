# Phase 00 — Approval Workflow and Journal Reversal Hardening

Status: **read-only audit; no production changes made**

## Approval Engine findings

Live tables inspected:
- `public.approval_requests`
- `public.approval_request_steps`
- `public.approval_request_actions`
- `public.approval_workflows`
- `public.approval_workflow_steps`

Current RLS policies on each of the three request/action tables are `ALL` for `authenticated`, with both USING and WITH CHECK based on `private.has_company_access(tenant_id, tenant_company_id)`. This protects company boundaries only; it does not make approval history immutable or enforce the state machine.

The checked-in `src/context/ApprovalContext.jsx` directly:
- inserts the request row, then inserts step rows, then attempts an action-history insert as separate calls;
- directly updates request and step statuses for approve/reject/return/withdraw/resubmit;
- writes action history through a separate helper that catches and logs errors without failing the business operation;
- determines current/last step in client state before writing;
- resets a returned request's steps with a loop of independent writes.

These operations can partially succeed and can be bypassed by direct API requests from an authenticated user with company access. Frontend maker-checker checks are useful UX, but are not the authorization boundary.

### Safe implementation sequence

1. Add and test RPCs for submit, act on current step, resubmit returned request, and withdraw. Each RPC must derive the actor from `auth.uid()`, lock the request row, validate active tenant membership and company access, enforce MANAGER-or-assigned-approver authority, enforce maker-checker rules, validate the active step and transition, and write the request/step/action history in one transaction.
2. Ensure every action insert is part of the same transaction as the state transition; do not swallow action-history errors.
3. Treat `approval_request_actions` as append-only for clients. After frontend migration, remove direct client INSERT/UPDATE/DELETE privileges and replace broad ALL policies with read-only policies. Do not apply those revocations before the UI has switched to RPCs.
4. Keep request and step direct writes available only until all supported frontend paths use the new RPC contracts. Add tests for concurrency, cross-company IDs, self-approval, wrong approver, invalid transition, multi-step advancement, required comments, resubmission, and action-history rollback.
5. Preserve `apply_employee_change_request_atomic(uuid)` as the controlled final application path, but ensure only the final approved transition can invoke it and avoid a gap between approval and application.
6. Update `ApprovalContext.jsx` only after RPC signatures and response shapes are fixed and tested. Keep fetching reads, move all writes to RPC calls.

## Journal reversal: confirmed idempotency defect

Live `public.reverse_journal_entry_atomic(jsonb)` looks up an existing journal entry by `tenant_company_id` and `idempotency_key` and immediately returns its ID with `idempotent: true`. It does not compare the existing row's `request_hash` with the requested original journal entry, reversal date, narration, or voucher number. The unique-violation retry path has the same behavior. Reusing a key for a different reversal can therefore return an unrelated existing reversal as if it matched.

The current request hash includes a generated voucher number when the caller omits one, so retries need a canonical hash design that does not change because a server-generated default changes. Before replacing the function:
- inspect the exact unique index/constraint and current caller payload;
- define canonical request fields and stable defaults;
- reject a key collision when the stored request hash does not match;
- make the normal and unique-violation paths perform the same hash comparison;
- preserve legacy rows safely (do not assume their hash format matches a new format);
- add disposable-PostgreSQL tests for exact retry, changed original ID, changed date, changed narration, concurrent same-key requests, and legacy rows.

## Release and safety constraints

- No production DDL, data changes, function deployment, or privilege changes were made during this audit.
- Do not repair the 129-migration history gap with placeholders, rename guessed historical files, or replay reconstructed migrations.
- Keep the current security PR draft and unmerged. Validate source-only migrations in isolated PostgreSQL CI and review the resulting diff before considering deployment.
- No paid Supabase branch or recurring resource should be introduced.
