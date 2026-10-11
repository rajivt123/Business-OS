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

## Journal reversal: source-only hardening implemented; broader tests still required

The live `public.reverse_journal_entry_atomic(jsonb)` previously returned any existing row matching company and idempotency key without validating the request. The source-only replacement now compares the original entry, source type, date and supplied narration/reason; it serializes requests for the same original entry before looking up the key and checks the unique-conflict path. It retains the existing authenticated/service-role execution model.

Regression file: `supabase/tests/phase00_journal_reversal_idempotency.sql`. It covers an exact retry and rejects changed date/reason using disposable PostgreSQL. It does **not** yet prove simultaneous multi-session concurrency or every legacy-row case. Because older production reversals may have ignored the caller's `reversal_reason`, ambiguous legacy retries should fail closed rather than be assumed equivalent.

## Approval RPC batch: source-only implementation

Added:
- `public.process_approval_request_action_atomic(uuid,text,text)`: row-locks the request and current step; checks tenant/company scope, manager or explicit assignment, maker-checker, comments for reject/return, valid status, multi-step advancement and action-history insertion in one transaction. Final employee-change application is invoked inside the same transaction and failure rolls back the approval transition.
- `public.submit_approval_request_atomic(jsonb)`: checks caller tenant/company scope, selects an active company/request-type workflow, snapshots its ordered steps or creates a fallback manager step, and writes the submission history atomically.
- `public.resubmit_approval_request_atomic(uuid,jsonb)`: permits only the original requester to resubmit a returned request, resets steps and records the action atomically.

Disposable PostgreSQL regressions:
- `supabase/tests/phase00_approval_action_atomic.sql`: maker-checker denial, unassigned-actor denial, valid multi-step advancement and action-history write.
- `supabase/tests/phase00_approval_submit_resubmit_atomic.sql`: fallback submission, request/step state, history and resubmission reset.

**Important rollout gap:** `src/context/ApprovalContext.jsx` still performs direct table writes. These RPCs are not yet integrated into the UI, and direct table-write privileges/policies have intentionally not been revoked. Do not treat approval writes as secured end-to-end until Antigravity switches all submit/action/resubmit/withdraw paths to these RPCs, UI integration tests pass, and direct DML is restricted afterward.

## Current validation state

The isolated PostgreSQL CI suite includes the journal reversal and approval RPC regressions. See the current GitHub Actions run for the exact commit status. These tests are useful contract/regression checks, not a substitute for an isolated Supabase Auth/RLS integration environment or the complete frontend workflow.

## Release and safety constraints

- No production DDL, data changes, function deployment, or privilege changes were made during this audit.
- Do not repair the 129-migration history gap with placeholders, rename guessed historical files, or replay reconstructed migrations.
- Keep the current security PR draft and unmerged. Validate source-only migrations in isolated PostgreSQL CI and review the resulting diff before considering deployment.
- No paid Supabase branch or recurring resource should be introduced.
