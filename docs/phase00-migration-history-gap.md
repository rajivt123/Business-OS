# Phase 00 — Supabase Migration History Gap

Audit date: 2026-10-11  
Production project: `fire-crm` (`ppffvhqzlufuutazvbhx`)  
Supabase branch status: `MIGRATIONS_FAILED`

## Summary

- Remote migration history records **131** applied versions.
- GitHub `main` contains **7** migration SQL files.
- **129** applied remote versions have no matching SQL file in `main`.
- **5** tracked migration files do not appear in the remote applied list.
- Supabase workflow log error: `Remote migration versions not found in local migrations directory.`

The migration source-of-truth is incomplete. This explains the current Supabase branch automation failure and prevents reliable replay into an isolated environment. The two October 4 migrations restored in PR #1 are now present locally, but the remaining missing history is not solved.

## Safety decision

Do **not**:
- create empty placeholder files for missing versions;
- use `migration repair` to mark unknown versions applied on production;
- reset/rebase the failed branch as a blind retry;
- replay the restored historical migrations against production;
- assume a schema-only dump reproduces historical data transformations, function changes, grants, or migration side effects.

## Missing local SQL files

These versions are recorded as applied remotely but have no matching `supabase/migrations/<version>_*.sql` file on GitHub `main`.

| Version | Recorded migration name |
|---|---|
| `20260913110307` | `add_crm_contacts_enquiries_follow_ups` |
| `20260913114556` | `add_employee_foundation_and_configurable_records` |
| `20260913131959` | `add_hr_policy_foundation_p0` |
| `20260913134907` | `add_hr_recruitment_candidate_onboarding_p0` |
| `20260913140540` | `add_common_approval_request_runtime_p0` |
| `20260913144218` | `add_attendance_foundation_p0` |
| `20260913151151` | `add_leave_management_p0` |
| `20260913154627` | `add_leave_atomicity_runtime_p0` |
| `20260913154639` | `harden_leave_atomicity_execute_grants` |
| `20260913160458` | `add_employee_change_atomic_apply_p0` |
| `20260913160504` | `harden_employee_change_atomic_apply_execute_grants` |
| `20260913163539` | `add_payroll_foundation_p0` |
| `20260913164603` | `harden_payroll_foundation_authorization_p0` |
| `20260913165409` | `add_payroll_calculation_engine_p0` |
| `20260913165437` | `harden_payroll_calculation_engine_p0` |
| `20260913170537` | `harden_payroll_calculation_engine_p0` |
| `20260913170734` | `add_payroll_tds_declaration_foundation_p0` |
| `20260913170758` | `harden_payroll_tds_declaration_grants_p0` |
| `20260913171733` | `harden_payroll_tax_declaration_authorization_p0` |
| `20260913172428` | `add_tds_rule_engine_foundation` |
| `20260913172441` | `complete_tds_2026_27_old_regime_rules` |
| `20260913173237` | `implement_payroll_tds_calculation_engine_p0` |
| `20260913173323` | `integrate_payroll_tds_engine_p0_v2` |
| `20260913173345` | `harden_payroll_tds_engine_integration_guard` |
| `20260913173453` | `align_payroll_tds_rule_schema_p0` |
| `20260913173517` | `fix_payroll_tds_rule_code_resolution` |
| `20260913173526` | `seed_payroll_tds_rules_ty_2026_27_v4` |
| `20260913173533` | `fix_payroll_tds_nonresident_age_band` |
| `20260913174424` | `fix_tds_p0_marginal_relief_exit_projection` |
| `20260913174440` | `version_tds_p0_engine_after_projection_fix` |
| `20260913174618` | `fix_tds_default_regime_rule_type` |
| `20260913174653` | `fix_tds_cess_company_scope` |
| `20260913182353` | `fix_tds_hra_current_period_projection` |
| `20260913183306` | `fix_tds_total_periods_snapshot_v2` |
| `20260913194120` | `add_sales_p0_foundation` |
| `20260913195819` | `sales_p0_foundation_additive_v3` |
| `20260913195857` | `sales_p0_atomic_runtime` |
| `20260913201619` | `sales_p0_proforma_atomic_runtime_v2` |
| `20260913201634` | `sales_p0_rpc_execute_hardening` |
| `20260913203828` | `procurement_p0_foundation_additive_v1` |
| `20260913204000` | `procurement_p0_atomic_runtime_v1` |
| `20260913204019` | `procurement_p0_atomic_runtime_v2` |
| `20260913204040` | `procurement_p0_atomic_runtime_v3` |
| `20260914061050` | `procurement_grn_quantity_integrity_v1` |
| `20260914074940` | `inventory_core_foundation_v1` |
| `20260914075000` | `inventory_core_concurrency_hardening_v1` |
| `20260914075015` | `inventory_core_lock_key_fix_v1` |
| `20260914082248` | `accounts_core_foundation_p0` |
| `20260914082303` | `accounts_core_rpc_hardening_p0` |
| `20260914084506` | `accounts_core_read_access_idempotency_hardening_v1` |
| `20260914084552` | `accounts_core_atomic_workflows_p0_v1` |
| `20260914084654` | `accounts_core_rpc_execute_lockdown_v1c` |
| `20260914084749` | `accounts_core_reversal_guard_v1` |
| `20260914113855` | `inventory_core_fix_jsonb_loop_record_v1` |
| `20260914115027` | `procurement_accounts_atomic_matching_hardening_v3` |
| `20260914115053` | `procurement_accounts_atomic_matching_hardening_v4` |
| `20260914121606` | `payroll_p1_approval_accounting_atomic_v1` |
| `20260914121651` | `payroll_p1_accounting_balance_hardening_v2` |
| `20260914121738` | `payroll_p1_run_creation_security_v3` |
| `20260914123354` | `payroll_p1_mapping_write_hardening_v1` |
| `20260914124009` | `payroll_p1_finalize_accounting_balance_fix_v1` |
| `20260914125753` | `payroll_p2a_salary_payment_core_v1` |
| `20260914125822` | `payroll_p2a_salary_payment_core_security_v2` |
| `20260914130731` | `payroll_p2a_process_accounting_hardening_v2` |
| `20260914131318` | `payroll_p2b_bank_file_core_v1` |
| `20260914131348` | `payroll_p2b_bank_file_hash_qualification_v2` |
| `20260914132815` | `payroll_p2b_bank_file_lifecycle_hardening_v1` |
| `20260914132826` | `payroll_p2b_bank_file_result_submission_hardening_v1` |
| `20260914133653` | `payroll_p2c_reconciliation_v1` |
| `20260914133857` | `payroll_p2d_statutory_settlement_v2` |
| `20260914133921` | `payroll_p2e_p2f_p2g_documents_dashboard_v1` |
| `20260914133952` | `payroll_p2d_official_export_formats_v1` |
| `20260914134014` | `payroll_p2g_dashboard_hardening_v2` |
| `20260914134028` | `payroll_p2d_p2e_p2f_p2g_execute_hardening_v1` |
| `20260914134108` | `payroll_p2c_unmatch_guard_v1` |
| `20260914140719` | `sales_accounts_atomic_wrappers_v2` |
| `20260914150936` | `inventory_reservation_allocation_p1_v1` |
| `20260914153011` | `inventory_p1c_fulfilment_issue_v1` |
| `20260914153038` | `inventory_p1c_fulfilment_issue_hardening_v2` |
| `20260914153056` | `inventory_p1c_reservation_release_issue_compat_v3` |
| `20260914153926` | `inventory_p1c_issue_integrity_hardening_v2` |
| `20260914153949` | `inventory_p1c_issue_integrity_hardening_v3` |
| `20260914163534` | `inventory_p1c_authoritative_issue_integrity_v4` |
| `20260914164654` | `inventory_operational_control_read_layer_v1` |
| `20260914164737` | `inventory_control_adjustment_workflow_v1` |
| `20260914182713` | `attendance_face_enrollment_security_v1` |
| `20260914184022` | `harden_attendance_face_rpc_execute_grants_v2` |
| `20260914193717` | `payroll_leave_integration_v1` |
| `20260914200309` | `reporting_engine_v1` |
| `20260914201430` | `reporting_engine_detail_v1` |
| `20260914201441` | `reporting_engine_catalog_v1` |
| `20260914203905` | `reporting_engine_v2_financial_management` |
| `20260914203922` | `reporting_engine_v2_integrity_patch` |
| `20260914211609` | `accounts_authoritative_financial_engine_v1` |
| `20260914214249` | `accounts_ar_ap_integrity_v1` |
| `20260914214822` | `accounts_vendor_party_linkage_v1` |
| `20260914215339` | `accounts_fiscal_close_integrity_v1` |
| `20260914215354` | `accounts_reporting_rpc_execute_hardening_v1` |
| `20260914220010` | `payroll_accounting_e2e_integrity_v1` |
| `20260916025957` | `revoke_anon_payroll_accounting_e2e_integrity_execute` |
| `20260916030009` | `revoke_public_payroll_accounting_e2e_integrity_execute` |
| `20260916030144` | `harden_payroll_accounting_e2e_execute_grants` |
| `20260916043725` | `harden_secdef_internal_functions` |
| `20260916043751` | `harden_trigger_and_public_recruitment_secdef` |
| `20260919155801` | `owner_company_settings_v1` |
| `20260919163346` | `harden_owner_company_settings_anon_execute_v1` |
| `20260919170756` | `owner_company_settings_v1_contract_complete` |
| `20260919170819` | `owner_company_settings_v1_fix_save_audit` |
| `20260919173115` | `fix_owner_company_settings_audit_trigger_id_v2` |
| `20260919174310` | `owner_company_settings_details_atomic_v1` |
| `20260920051821` | `crm_customer_workspace_v1` |
| `20260920055906` | `user_profile_v1` |
| `20260925162334` | `business_file_attachments_r2_foundation_v1` |
| `20260925162410` | `business_file_attachments_allow_history_v1` |
| `20260927074516` | `mep_knowledge_ingestion_foundation_v1` |
| `20260927092350` | `mep_document_extractions_active_unique_index` |
| `20260928144452` | `create_master_boq_foundation` |
| `20260928144529` | `link_transactions_to_master_boq` |
| `20260928181921` | `add_local_mep_extraction_source_unique_index` |
| `20261001161222` | `mep_master_item_matching_foundation_v1` |
| `20261001161237` | `mep_master_item_matching_benchmark_rls_v1` |
| `20261002041226` | `master_item_canonical_identity_v1` |
| `20261002131335` | `canonical_master_code_helper_v1` |
| `20261002131341` | `canonical_boq_line_trigger_v1` |
| `20261002131420` | `canonical_master_code_helper_v2` |
| `20261003164248` | `replace_master_item_catalog_v1` |
| `20261004054940` | `procurement_grn_inventory_mapping_hardening_v1` |
| `20261004113757` | `procurement_vendor_architecture_correction_v1` |
| `20261004120141` | `procurement_purchase_bill_inventory_line_linkage_v1` |

## Tracked local migrations absent from remote applied history

| Version | File |
|---|---|
| `20260914113600` | `20260914113600_inventory_core_fix_jsonb_loop_record_v1.sql` |
| `20260914113700` | `20260914113700_procurement_accounts_purchase_bill_matching_v3.sql` |
| `20260914113800` | `20260914113800_procurement_accounts_payment_normalization_v4.sql` |
| `20260915113700` | `20260915113700_procurement_purchase_bill_e2e_hardening_v4.sql` |
| `20260927142000` | `20260927142000_mep_document_extractions_active_unique_index.sql` |

## Recovery procedure

1. Preserve the live database and current migration history; this report is read-only.
2. Search trusted Git history, CI artifacts, developer workspaces, and deployment artifacts for the authentic SQL for each missing version. Do not infer historical SQL from names alone.
3. For each recovered file, compare its effects with current live schema and migration history before including it.
4. Where authentic historical SQL cannot be recovered, design a documented baseline strategy that captures the current schema, roles/grants, RLS policies, functions, triggers, extensions, and relevant non-schema migration effects. Baseline must be validated in a disposable database and must not falsely claim the missing migrations were replayed.
5. Use a separate branch/project only after the hourly branch cost is explicitly acknowledged. Run migration validation there; do not merge it to production.
6. Reconcile local and remote version sets and confirm the Supabase branch status is healthy before attempting the security migration or Edge Function tests.

## Additional notes

- Several representative missing migration paths were queried through GitHub commit history and returned no historical file revisions. This does not prove no copies exist in another workspace or artifact store.
- The new CRM AI rate-limit migration `20261011190000_phase00_crm_ai_durable_rate_limit.sql` is a new source migration and is not applied remotely.
- No production migration, user grant, account, or business record was modified during this audit.


## Repository recovery sweep (2026-10-11)

A follow-up read-only sweep checked the repository's available refs and Git history for authentic copies of missing migrations:

- Available branches are `main`, `backup/ui-experiment-before-recovery-2026-09-20`, and the current security branch.
- The backup branch contains only five migration SQL files: versions `20260914113414`, `20260914113537`, and three files named `20260914113600`, `20260914113700`, and `20260914113800`. The last three are not the matching names for the corresponding production migration versions in the remote ledger, so they must not be renamed or treated as exact historical replacements.
- A path-specific commit-history query for `20260913163539_add_payroll_foundation_p0.sql` returned no commits.
- GitHub code searches for `add_payroll_foundation_p0` and `20260913110307` returned no results in the default-branch index.
- The initial commit-history sweep is evidence that the checked repository refs do not contain an obvious recoverable copy, **not proof that no developer workspace, artifact, or other repository contains the SQL**.

### Result and next safe action

This sweep did not recover the missing 129 migration files. Do not infer migration bodies from names or rebuild historical migrations from the current schema alone. Continue checking user-controlled workspaces/artifacts and the repository's Git object history. In parallel, build a read-only inventory of current schema objects and dependencies, then design a reviewed baseline strategy that does not replay historical transformations or modify production migration records. Keep all database mutation and deployment blocked.
