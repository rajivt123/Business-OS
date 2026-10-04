-- SOURCE: live-schema-catalog.json
-- PROJECT ID: ppffvhqzlufuutazvbhx
-- EXTRACTION TIMESTAMP: 2026-10-04T14:05:36.189Z
-- CATALOG COUNTS: {"schemas":5,"extensions":5,"types":225,"sequences":2,"tables":204,"columns":3063,"constraints":1117,"indexes":652,"functions":213,"views":6,"materialized_views":0,"triggers":44,"rls_policies":310,"grants":6137,"dependencies":11241,"pks":203,"fks":520,"unique_constraints":103,"check_constraints":291,"rls_tables":188,"enums":12,"domains":0,"user_defined_composites":3}
-- GENERATOR VERSION: 1.4
-- GENERATION TIMESTAMP: (Deterministic Build)

-- ==========================================
-- SECTION 01: CREATE SCHEMAS
-- ==========================================
-- OMITTED SCHEMA auth: Supabase-managed schema
-- OMITTED SCHEMA extensions: Supabase-managed schema
CREATE SCHEMA IF NOT EXISTS private;
-- OMITTED SCHEMA storage: Supabase-managed schema

-- ==========================================
-- SECTION 02: CREATE EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA vault;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- ==========================================
-- SECTION 03: CREATE USER-DEFINED TYPES
-- ==========================================
-- OMITTED TYPE auth.aal_level: Supabase-managed schema
-- OMITTED TYPE auth.audit_log_entries: Supabase-managed schema
-- OMITTED TYPE auth.code_challenge_method: Supabase-managed schema
-- OMITTED TYPE auth.custom_oauth_providers: Supabase-managed schema
-- OMITTED TYPE auth.factor_status: Supabase-managed schema
-- OMITTED TYPE auth.factor_type: Supabase-managed schema
-- OMITTED TYPE auth.flow_state: Supabase-managed schema
-- OMITTED TYPE auth.identities: Supabase-managed schema
-- OMITTED TYPE auth.instances: Supabase-managed schema
-- OMITTED TYPE auth.mfa_amr_claims: Supabase-managed schema
-- OMITTED TYPE auth.mfa_challenges: Supabase-managed schema
-- OMITTED TYPE auth.mfa_factors: Supabase-managed schema
-- OMITTED TYPE auth.mfa_recovery_code_sets: Supabase-managed schema
-- OMITTED TYPE auth.mfa_recovery_codes: Supabase-managed schema
-- OMITTED TYPE auth.oauth_authorization_status: Supabase-managed schema
-- OMITTED TYPE auth.oauth_authorizations: Supabase-managed schema
-- OMITTED TYPE auth.oauth_client_states: Supabase-managed schema
-- OMITTED TYPE auth.oauth_client_type: Supabase-managed schema
-- OMITTED TYPE auth.oauth_clients: Supabase-managed schema
-- OMITTED TYPE auth.oauth_consents: Supabase-managed schema
-- OMITTED TYPE auth.oauth_registration_type: Supabase-managed schema
-- OMITTED TYPE auth.oauth_response_type: Supabase-managed schema
-- OMITTED TYPE auth.one_time_token_type: Supabase-managed schema
-- OMITTED TYPE auth.one_time_tokens: Supabase-managed schema
-- OMITTED TYPE auth.refresh_tokens: Supabase-managed schema
-- OMITTED TYPE auth.saml_providers: Supabase-managed schema
-- OMITTED TYPE auth.saml_relay_states: Supabase-managed schema
-- OMITTED TYPE auth.schema_migrations: Supabase-managed schema
-- OMITTED TYPE auth.scim_tokens: Supabase-managed schema
-- OMITTED TYPE auth.scim_users: Supabase-managed schema
-- OMITTED TYPE auth.sessions: Supabase-managed schema
-- OMITTED TYPE auth.sso_domains: Supabase-managed schema
-- OMITTED TYPE auth.sso_providers: Supabase-managed schema
-- OMITTED TYPE auth.users: Supabase-managed schema
-- OMITTED TYPE auth.webauthn_challenges: Supabase-managed schema
-- OMITTED TYPE auth.webauthn_credentials: Supabase-managed schema
-- OMITTED TYPE extensions.pg_stat_statements: Supabase-managed schema
-- OMITTED TYPE extensions.pg_stat_statements_info: Supabase-managed schema
-- OMITTED TYPE realtime.action: Supabase-managed schema
-- OMITTED TYPE realtime.equality_op: Supabase-managed schema
-- OMITTED TYPE realtime.messages: Supabase-managed schema
-- OMITTED TYPE realtime.schema_migrations: Supabase-managed schema
-- OMITTED TYPE realtime.subscription: Supabase-managed schema
-- OMITTED TYPE realtime.user_defined_filter: Supabase-managed schema
-- OMITTED TYPE realtime.wal_column: Supabase-managed schema
-- OMITTED TYPE realtime.wal_rls: Supabase-managed schema
-- OMITTED TYPE storage.buckets: Supabase-managed schema
-- OMITTED TYPE storage.buckets_analytics: Supabase-managed schema
-- OMITTED TYPE storage.buckets_vectors: Supabase-managed schema
-- OMITTED TYPE storage.buckettype: Supabase-managed schema
-- OMITTED TYPE storage.migrations: Supabase-managed schema
-- OMITTED TYPE storage.objects: Supabase-managed schema
-- OMITTED TYPE storage.s3_multipart_uploads: Supabase-managed schema
-- OMITTED TYPE storage.s3_multipart_uploads_parts: Supabase-managed schema
-- OMITTED TYPE storage.vector_indexes: Supabase-managed schema
-- OMITTED TYPE vault.decrypted_secrets: Supabase-managed schema
-- OMITTED TYPE vault.secrets: Supabase-managed schema

-- ==========================================
-- SECTION 04: CREATE SEQUENCES
-- ==========================================
-- OMITTED SEQUENCE auth.refresh_tokens_id_seq: Supabase-managed schema
-- OMITTED SEQUENCE realtime.subscription_id_seq: Supabase-managed schema

-- ==========================================
-- SECTION 05: CREATE TABLES
-- ==========================================
-- OMITTED TABLE auth.audit_log_entries: Supabase-managed schema
-- OMITTED COLUMN auth.audit_log_entries.instance_id: Supabase-managed schema
-- OMITTED COLUMN auth.audit_log_entries.id: Supabase-managed schema
-- OMITTED COLUMN auth.audit_log_entries.payload: Supabase-managed schema
-- OMITTED COLUMN auth.audit_log_entries.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.audit_log_entries.ip_address: Supabase-managed schema
-- OMITTED TABLE auth.custom_oauth_providers: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.id: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.provider_type: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.identifier: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.name: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.client_id: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.client_secret: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.acceptable_client_ids: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.scopes: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.pkce_enabled: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.attribute_mapping: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.authorization_params: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.enabled: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.email_optional: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.issuer: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.discovery_url: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.skip_nonce_check: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.cached_discovery: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.discovery_cached_at: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.authorization_url: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.token_url: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.userinfo_url: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.jwks_uri: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.custom_oauth_providers.custom_claims_allowlist: Supabase-managed schema
-- OMITTED TABLE auth.flow_state: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.id: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.auth_code: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.code_challenge_method: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.code_challenge: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.provider_type: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.provider_access_token: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.provider_refresh_token: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.authentication_method: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.auth_code_issued_at: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.invite_token: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.referrer: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.oauth_client_state_id: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.linking_target_id: Supabase-managed schema
-- OMITTED COLUMN auth.flow_state.email_optional: Supabase-managed schema
-- OMITTED TABLE auth.identities: Supabase-managed schema
-- OMITTED COLUMN auth.identities.provider_id: Supabase-managed schema
-- OMITTED COLUMN auth.identities.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.identities.identity_data: Supabase-managed schema
-- OMITTED COLUMN auth.identities.provider: Supabase-managed schema
-- OMITTED COLUMN auth.identities.last_sign_in_at: Supabase-managed schema
-- OMITTED COLUMN auth.identities.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.identities.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.identities.email: Supabase-managed schema
-- OMITTED COLUMN auth.identities.id: Supabase-managed schema
-- OMITTED TABLE auth.instances: Supabase-managed schema
-- OMITTED COLUMN auth.instances.id: Supabase-managed schema
-- OMITTED COLUMN auth.instances.uuid: Supabase-managed schema
-- OMITTED COLUMN auth.instances.raw_base_config: Supabase-managed schema
-- OMITTED COLUMN auth.instances.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.instances.updated_at: Supabase-managed schema
-- OMITTED TABLE auth.mfa_amr_claims: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_amr_claims.session_id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_amr_claims.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_amr_claims.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_amr_claims.authentication_method: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_amr_claims.id: Supabase-managed schema
-- OMITTED TABLE auth.mfa_challenges: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_challenges.id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_challenges.factor_id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_challenges.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_challenges.verified_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_challenges.ip_address: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_challenges.otp_code: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_challenges.web_authn_session_data: Supabase-managed schema
-- OMITTED TABLE auth.mfa_factors: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.friendly_name: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.factor_type: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.status: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.secret: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.phone: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.last_challenged_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.web_authn_credential: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.web_authn_aaguid: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_factors.last_webauthn_challenge_data: Supabase-managed schema
-- OMITTED TABLE auth.mfa_recovery_code_sets: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_code_sets.id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_code_sets.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_code_sets.mfa_factor_id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_code_sets.failed_verification_count: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_code_sets.verification_locked_until: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_code_sets.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_code_sets.updated_at: Supabase-managed schema
-- OMITTED TABLE auth.mfa_recovery_codes: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_codes.id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_codes.mfa_recovery_code_set_id: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_codes.code_hash: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_codes.consumed_at: Supabase-managed schema
-- OMITTED COLUMN auth.mfa_recovery_codes.created_at: Supabase-managed schema
-- OMITTED TABLE auth.oauth_authorizations: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.authorization_id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.client_id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.redirect_uri: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.scope: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.state: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.resource: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.code_challenge: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.code_challenge_method: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.response_type: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.status: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.authorization_code: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.expires_at: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.approved_at: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_authorizations.nonce: Supabase-managed schema
-- OMITTED TABLE auth.oauth_client_states: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_client_states.id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_client_states.provider_type: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_client_states.code_verifier: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_client_states.created_at: Supabase-managed schema
-- OMITTED TABLE auth.oauth_clients: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.client_secret_hash: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.registration_type: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.redirect_uris: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.grant_types: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.client_name: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.client_uri: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.logo_uri: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.deleted_at: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.client_type: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_clients.token_endpoint_auth_method: Supabase-managed schema
-- OMITTED TABLE auth.oauth_consents: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_consents.id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_consents.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_consents.client_id: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_consents.scopes: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_consents.granted_at: Supabase-managed schema
-- OMITTED COLUMN auth.oauth_consents.revoked_at: Supabase-managed schema
-- OMITTED TABLE auth.one_time_tokens: Supabase-managed schema
-- OMITTED COLUMN auth.one_time_tokens.id: Supabase-managed schema
-- OMITTED COLUMN auth.one_time_tokens.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.one_time_tokens.token_type: Supabase-managed schema
-- OMITTED COLUMN auth.one_time_tokens.token_hash: Supabase-managed schema
-- OMITTED COLUMN auth.one_time_tokens.relates_to: Supabase-managed schema
-- OMITTED COLUMN auth.one_time_tokens.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.one_time_tokens.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.one_time_tokens.expires_at: Supabase-managed schema
-- OMITTED TABLE auth.refresh_tokens: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.instance_id: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.id: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.token: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.revoked: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.parent: Supabase-managed schema
-- OMITTED COLUMN auth.refresh_tokens.session_id: Supabase-managed schema
-- OMITTED TABLE auth.saml_providers: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.id: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.sso_provider_id: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.entity_id: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.metadata_xml: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.metadata_url: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.attribute_mapping: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.saml_providers.name_id_format: Supabase-managed schema
-- OMITTED TABLE auth.saml_relay_states: Supabase-managed schema
-- OMITTED COLUMN auth.saml_relay_states.id: Supabase-managed schema
-- OMITTED COLUMN auth.saml_relay_states.sso_provider_id: Supabase-managed schema
-- OMITTED COLUMN auth.saml_relay_states.request_id: Supabase-managed schema
-- OMITTED COLUMN auth.saml_relay_states.for_email: Supabase-managed schema
-- OMITTED COLUMN auth.saml_relay_states.redirect_to: Supabase-managed schema
-- OMITTED COLUMN auth.saml_relay_states.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.saml_relay_states.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.saml_relay_states.flow_state_id: Supabase-managed schema
-- OMITTED TABLE auth.schema_migrations: Supabase-managed schema
-- OMITTED COLUMN auth.schema_migrations.version: Supabase-managed schema
-- OMITTED TABLE auth.scim_tokens: Supabase-managed schema
-- OMITTED COLUMN auth.scim_tokens.id: Supabase-managed schema
-- OMITTED COLUMN auth.scim_tokens.sso_provider_id: Supabase-managed schema
-- OMITTED COLUMN auth.scim_tokens.token_hash: Supabase-managed schema
-- OMITTED COLUMN auth.scim_tokens.prefix: Supabase-managed schema
-- OMITTED COLUMN auth.scim_tokens.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.scim_tokens.expires_at: Supabase-managed schema
-- OMITTED COLUMN auth.scim_tokens.revoked_at: Supabase-managed schema
-- OMITTED COLUMN auth.scim_tokens.last_used_at: Supabase-managed schema
-- OMITTED TABLE auth.scim_users: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.id: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.sso_provider_id: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.resource: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.user_name: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.external_id: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.active: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.scim_users.deleted_at: Supabase-managed schema
-- OMITTED TABLE auth.sessions: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.id: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.factor_id: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.aal: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.not_after: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.refreshed_at: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.user_agent: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.ip: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.tag: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.oauth_client_id: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.refresh_token_hmac_key: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.refresh_token_counter: Supabase-managed schema
-- OMITTED COLUMN auth.sessions.scopes: Supabase-managed schema
-- OMITTED TABLE auth.sso_domains: Supabase-managed schema
-- OMITTED COLUMN auth.sso_domains.id: Supabase-managed schema
-- OMITTED COLUMN auth.sso_domains.sso_provider_id: Supabase-managed schema
-- OMITTED COLUMN auth.sso_domains.domain: Supabase-managed schema
-- OMITTED COLUMN auth.sso_domains.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.sso_domains.updated_at: Supabase-managed schema
-- OMITTED TABLE auth.sso_providers: Supabase-managed schema
-- OMITTED COLUMN auth.sso_providers.id: Supabase-managed schema
-- OMITTED COLUMN auth.sso_providers.resource_id: Supabase-managed schema
-- OMITTED COLUMN auth.sso_providers.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.sso_providers.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.sso_providers.disabled: Supabase-managed schema
-- OMITTED TABLE auth.users: Supabase-managed schema
-- OMITTED COLUMN auth.users.instance_id: Supabase-managed schema
-- OMITTED COLUMN auth.users.id: Supabase-managed schema
-- OMITTED COLUMN auth.users.aud: Supabase-managed schema
-- OMITTED COLUMN auth.users.role: Supabase-managed schema
-- OMITTED COLUMN auth.users.email: Supabase-managed schema
-- OMITTED COLUMN auth.users.encrypted_password: Supabase-managed schema
-- OMITTED COLUMN auth.users.email_confirmed_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.invited_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.confirmation_token: Supabase-managed schema
-- OMITTED COLUMN auth.users.confirmation_sent_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.recovery_token: Supabase-managed schema
-- OMITTED COLUMN auth.users.recovery_sent_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.email_change_token_new: Supabase-managed schema
-- OMITTED COLUMN auth.users.email_change: Supabase-managed schema
-- OMITTED COLUMN auth.users.email_change_sent_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.last_sign_in_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.raw_app_meta_data: Supabase-managed schema
-- OMITTED COLUMN auth.users.raw_user_meta_data: Supabase-managed schema
-- OMITTED COLUMN auth.users.is_super_admin: Supabase-managed schema
-- OMITTED COLUMN auth.users.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.phone: Supabase-managed schema
-- OMITTED COLUMN auth.users.phone_confirmed_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.phone_change: Supabase-managed schema
-- OMITTED COLUMN auth.users.phone_change_token: Supabase-managed schema
-- OMITTED COLUMN auth.users.phone_change_sent_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.confirmed_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.email_change_token_current: Supabase-managed schema
-- OMITTED COLUMN auth.users.email_change_confirm_status: Supabase-managed schema
-- OMITTED COLUMN auth.users.banned_until: Supabase-managed schema
-- OMITTED COLUMN auth.users.reauthentication_token: Supabase-managed schema
-- OMITTED COLUMN auth.users.reauthentication_sent_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.is_sso_user: Supabase-managed schema
-- OMITTED COLUMN auth.users.deleted_at: Supabase-managed schema
-- OMITTED COLUMN auth.users.is_anonymous: Supabase-managed schema
-- OMITTED TABLE auth.webauthn_challenges: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_challenges.id: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_challenges.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_challenges.challenge_type: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_challenges.session_data: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_challenges.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_challenges.expires_at: Supabase-managed schema
-- OMITTED TABLE auth.webauthn_credentials: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.id: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.user_id: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.credential_id: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.public_key: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.attestation_type: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.aaguid: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.sign_count: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.transports: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.backup_eligible: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.backed_up: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.friendly_name: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.created_at: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.updated_at: Supabase-managed schema
-- OMITTED COLUMN auth.webauthn_credentials.last_used_at: Supabase-managed schema
CREATE TABLE IF NOT EXISTS public.accounting_bank_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  account_id uuid NOT NULL,
  bank_name text NOT NULL,
  account_name text NOT NULL,
  masked_account_number text,
  ifsc_code text,
  bank_type text NOT NULL DEFAULT 'bank'::text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.accounting_bank_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  bank_account_id uuid NOT NULL,
  transaction_date date NOT NULL,
  transaction_type text NOT NULL,
  reference_no text,
  description text,
  amount numeric(20,2) NOT NULL,
  journal_entry_id uuid,
  reconciliation_status text NOT NULL DEFAULT 'unreconciled'::text,
  reconciled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  idempotency_key text,
  payroll_payment_batch_id uuid,
  payroll_payment_item_id uuid
);
CREATE TABLE IF NOT EXISTS public.accounting_fiscal_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  period_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'open'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.accounting_journal_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  fiscal_period_id uuid NOT NULL,
  voucher_number text NOT NULL,
  voucher_type text NOT NULL,
  entry_date date NOT NULL,
  narration text,
  source_type text,
  source_id uuid,
  status text NOT NULL DEFAULT 'posted'::text,
  reversal_of_entry_id uuid,
  idempotency_key text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  request_hash text
);
CREATE TABLE IF NOT EXISTS public.accounting_journal_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL,
  account_id uuid NOT NULL,
  line_no integer NOT NULL,
  description text,
  debit numeric(20,2) NOT NULL DEFAULT 0,
  credit numeric(20,2) NOT NULL DEFAULT 0,
  party_type text,
  party_id uuid,
  project_id uuid,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.approval_request_actions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  request_id uuid NOT NULL,
  request_step_id uuid,
  actor_id uuid,
  action text NOT NULL,
  comments text,
  from_status text,
  to_status text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.approval_request_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  request_id uuid NOT NULL,
  workflow_step_id uuid,
  step_order integer NOT NULL,
  approver_type text NOT NULL,
  approver_role text,
  assigned_user_id uuid,
  assigned_employee_id uuid,
  status text NOT NULL DEFAULT 'pending'::text,
  acted_at timestamp with time zone,
  acted_by uuid,
  comments text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  request_type text NOT NULL,
  request_number text,
  requested_by uuid NOT NULL,
  subject_employee_id uuid,
  entity_type text,
  entity_id uuid,
  title text NOT NULL,
  description text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_snapshot jsonb,
  status text NOT NULL DEFAULT 'draft'::text,
  priority text NOT NULL DEFAULT 'medium'::text,
  workflow_id uuid,
  current_step_order integer,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.approval_workflow_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  approval_workflow_id uuid NOT NULL,
  step_order integer NOT NULL,
  approver_type text NOT NULL,
  approver_role text,
  required boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.approval_workflows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  request_type text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_authentication_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  device_id uuid,
  claimed_employee_id uuid,
  verified_employee_id uuid,
  identifier_type text,
  authentication_method text NOT NULL,
  authentication_result text NOT NULL,
  face_match_result text,
  liveness_result text,
  confidence_score numeric,
  provider_reference text,
  client_captured_at timestamp with time zone,
  server_received_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_daily_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  attendance_date date NOT NULL,
  first_check_in timestamp with time zone,
  last_check_out timestamp with time zone,
  worked_minutes integer NOT NULL DEFAULT 0,
  effective_work_minutes integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'not_applicable'::text,
  late_minutes integer NOT NULL DEFAULT 0,
  early_departure_minutes integer NOT NULL DEFAULT 0,
  is_half_day boolean NOT NULL DEFAULT false,
  is_full_day boolean NOT NULL DEFAULT false,
  holiday boolean NOT NULL DEFAULT false,
  weekly_off boolean NOT NULL DEFAULT false,
  leave boolean NOT NULL DEFAULT false,
  comp_off boolean NOT NULL DEFAULT false,
  policy_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculation_version text,
  calculated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  device_name text NOT NULL,
  device_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  device_identifier_hash text,
  restricted_mode boolean NOT NULL DEFAULT false,
  location_name text,
  latitude numeric,
  longitude numeric,
  location_radius_meters numeric,
  registered_by uuid,
  registered_at timestamp with time zone DEFAULT now(),
  last_seen_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_employee_shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  shift_id uuid NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  is_general boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  event_type text NOT NULL,
  event_source text NOT NULL,
  device_id uuid,
  authentication_event_id uuid,
  event_at timestamp with time zone NOT NULL DEFAULT now(),
  client_captured_at timestamp with time zone,
  server_received_at timestamp with time zone NOT NULL DEFAULT now(),
  latitude numeric,
  longitude numeric,
  location_accuracy_meters numeric,
  ip_address inet,
  user_agent text,
  verification_status text NOT NULL DEFAULT 'verified'::text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_face_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  verification_provider text NOT NULL,
  provider_subject_ref text NOT NULL,
  enrollment_status text NOT NULL DEFAULT 'pending'::text,
  enrolled_at timestamp with time zone,
  revoked_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_feature_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  attendance_enabled boolean NOT NULL DEFAULT true,
  shift_enabled boolean NOT NULL DEFAULT false,
  geofence_enabled boolean NOT NULL DEFAULT false,
  face_verification_enabled boolean NOT NULL DEFAULT false,
  correction_enabled boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  hr_policy_set_id uuid NOT NULL,
  name text NOT NULL,
  employee_category_id uuid,
  work_location_id uuid,
  minimum_work_hours numeric(5,2),
  late_grace_minutes integer DEFAULT 0,
  early_departure_grace_minutes integer DEFAULT 0,
  half_day_hours numeric(5,2),
  full_day_hours numeric(5,2),
  attendance_required boolean NOT NULL DEFAULT true,
  face_auth_allowed boolean NOT NULL DEFAULT true,
  mobile_attendance_allowed boolean NOT NULL DEFAULT true,
  tablet_attendance_allowed boolean NOT NULL DEFAULT true,
  correction_approval_required boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  cross_midnight boolean NOT NULL DEFAULT false,
  grace_minutes integer NOT NULL DEFAULT 0,
  minimum_work_hours numeric,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.calc_saves (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_id uuid,
  calc_type text NOT NULL,
  input_data jsonb NOT NULL,
  result_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.candidate_interviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  interviewer_employee_id uuid,
  scheduled_at timestamp with time zone,
  completed_at timestamp with time zone,
  round_name text,
  technical_rating numeric(3,1),
  communication_rating numeric(3,1),
  experience_rating numeric(3,1),
  overall_rating numeric(3,1),
  comments text,
  recommended_position text,
  recommended_salary numeric(14,2),
  recommendation text,
  status text NOT NULL DEFAULT 'scheduled'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.candidate_onboarding (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  candidate_id uuid NOT NULL,
  employee_id uuid,
  method text NOT NULL,
  status text NOT NULL DEFAULT 'onboarding_pending'::text,
  token_hash text,
  token_expires_at timestamp with time zone,
  submitted_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamp with time zone,
  verified_at timestamp with time zone,
  approved_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  account_code text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL,
  account_subtype text,
  parent_account_id uuid,
  is_control_account boolean NOT NULL DEFAULT false,
  is_system_account boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.comp_off_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  hr_policy_set_id uuid NOT NULL,
  name text NOT NULL,
  employee_category_id uuid,
  work_location_id uuid,
  enabled boolean NOT NULL DEFAULT false,
  eligible_on_weekly_off boolean NOT NULL DEFAULT false,
  eligible_on_holiday boolean NOT NULL DEFAULT false,
  minimum_work_hours numeric(5,2),
  expiry_days integer,
  approval_required boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS public.company_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  address_type text NOT NULL,
  label text,
  address_line_1 text NOT NULL,
  address_line_2 text,
  landmark text,
  city text,
  district text,
  state text,
  state_code text,
  postal_code text,
  country text NOT NULL DEFAULT 'India'::text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_bank_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  bank_name text NOT NULL,
  branch_name text,
  account_name text,
  masked_account_number text,
  ifsc_code text,
  account_type text,
  upi_id text,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_branding (
  tenant_company_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  logo_file_id uuid,
  logo_url text,
  favicon_file_id uuid,
  favicon_url text,
  primary_color text,
  secondary_color text,
  accent_color text,
  font_family text,
  login_template text,
  welcome_message text,
  contact_display_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  contact_type text NOT NULL,
  name text NOT NULL,
  designation text,
  department text,
  email text,
  phone text,
  alternate_phone text,
  is_primary boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  document_type text NOT NULL,
  document_name text NOT NULL,
  document_number text,
  issue_date date,
  expiry_date date,
  verification_status text NOT NULL DEFAULT 'pending'::text,
  storage_provider text,
  storage_bucket text,
  storage_key text,
  file_url text,
  file_name text,
  mime_type text,
  file_size_bytes bigint,
  checksum text,
  version integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  is_archived boolean NOT NULL DEFAULT false,
  notes text,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_profiles (
  tenant_company_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  legal_name text,
  display_name text,
  trading_name text,
  company_type text,
  business_type text,
  industry text,
  nature_of_business text,
  description text,
  website text,
  official_email text,
  official_phone text,
  alternate_phone text,
  incorporation_date date,
  commencement_date date,
  employee_count integer,
  financial_year_start_month smallint NOT NULL DEFAULT 4,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  timezone text NOT NULL DEFAULT 'Asia/Kolkata'::text,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  registration_type text NOT NULL,
  registration_number text NOT NULL,
  issuing_authority text,
  state_code text,
  issue_date date,
  expiry_date date,
  status text NOT NULL DEFAULT 'active'::text,
  is_primary boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_settings (
  tenant_company_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  date_format text NOT NULL DEFAULT 'DD-MM-YYYY'::text,
  number_format text NOT NULL DEFAULT 'en-IN'::text,
  default_address_id uuid,
  default_bank_profile_id uuid,
  gst_registration_type text,
  gst_filing_frequency text,
  tds_applicable boolean NOT NULL DEFAULT false,
  pf_applicable boolean NOT NULL DEFAULT false,
  esic_applicable boolean NOT NULL DEFAULT false,
  professional_tax_applicable boolean NOT NULL DEFAULT false,
  default_tax_region text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_settings_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  actor_user_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid,
  company_id uuid NOT NULL,
  unit_id uuid,
  name text NOT NULL,
  email text,
  phone text,
  designation text,
  department text,
  is_primary boolean NOT NULL DEFAULT false,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.crm_customer_profiles (
  company_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  legal_name text,
  display_name text,
  trading_name text,
  company_type text,
  business_type text,
  industry text,
  gstin text,
  pan text,
  cin text,
  website text,
  official_email text,
  official_phone text,
  billing_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  description text,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.designations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  grade text,
  description text,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  work_id uuid,
  title text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_bank_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  account_holder_name text,
  bank_name text,
  account_number text,
  ifsc_code text,
  branch_name text,
  account_type text,
  is_primary_salary_account boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'pending'::text,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  status text NOT NULL DEFAULT 'active'::text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_company_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  assignment_start_date date,
  assignment_end_date date,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_dependents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  name text NOT NULL,
  relationship text NOT NULL,
  date_of_birth date,
  gender text,
  is_dependent boolean NOT NULL DEFAULT true,
  mobile text,
  address text,
  optional_id_reference text,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  document_type text NOT NULL,
  document_name text NOT NULL,
  storage_path text,
  issue_date date,
  expiry_date date,
  verification_status text NOT NULL DEFAULT 'pending'::text,
  verified_by uuid,
  verified_at timestamp with time zone,
  notes text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_esi_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  esi_applicable boolean NOT NULL DEFAULT false,
  insurance_number text,
  registration_date date,
  exit_date date,
  dispensary_branch text,
  aadhaar_linked boolean,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_field_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  field_definition_id uuid NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  required boolean NOT NULL DEFAULT false,
  sensitive boolean NOT NULL DEFAULT false,
  editable_by_roles text[] NOT NULL DEFAULT ARRAY['OWNER'::text, 'ADMIN'::text],
  visible_to_roles text[] NOT NULL DEFAULT ARRAY['OWNER'::text, 'ADMIN'::text, 'MANAGER'::text, 'TEAM'::text, 'VIEWER'::text],
  display_order integer NOT NULL DEFAULT 100,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_field_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid,
  field_key text NOT NULL,
  label text NOT NULL,
  field_type text NOT NULL DEFAULT 'text'::text,
  description text,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_system boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_field_values (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  field_definition_id uuid NOT NULL,
  value jsonb,
  verification_status text NOT NULL DEFAULT 'unverified'::text,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_nominees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  nominee_name text NOT NULL,
  relationship text,
  percentage numeric(5,2),
  nomination_category text NOT NULL DEFAULT 'other'::text,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_pf_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  pf_applicable boolean NOT NULL DEFAULT false,
  uan text,
  pf_member_id text,
  previous_uan text,
  pf_joining_date date,
  pf_exit_date date,
  eps_applicable boolean,
  edli_applicable boolean,
  pf_wage numeric(14,2),
  nomination_status text,
  aadhaar_seeded_with_uan boolean,
  pan_seeded_with_uan boolean,
  bank_kyc_verified boolean,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_salary_structure_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  salary_structure_id uuid NOT NULL,
  payroll_component_id uuid NOT NULL,
  amount numeric(14,2),
  rate numeric(12,4),
  calculation_method text NOT NULL,
  formula_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_from date,
  effective_to date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_salary_structures (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  name text NOT NULL,
  effective_from date NOT NULL,
  effective_to date,
  annual_ctc numeric(16,2),
  monthly_ctc numeric(16,2),
  calculation_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employee_tax_details (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  pan text,
  professional_tax_applicable boolean NOT NULL DEFAULT false,
  professional_tax_state text,
  professional_tax_reference text,
  tax_regime text,
  tds_applicable boolean,
  previous_employer_name text,
  previous_employer_tan text,
  investment_declaration_status text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_code text NOT NULL,
  first_name text NOT NULL,
  middle_name text,
  last_name text,
  display_name text,
  date_of_birth date,
  gender text,
  marital_status text,
  blood_group text,
  personal_mobile text,
  personal_email text,
  official_email text,
  photo_url text,
  father_name text,
  mother_name text,
  spouse_name text,
  emergency_contact_name text,
  emergency_contact_phone text,
  emergency_contact_relation text,
  permanent_address text,
  permanent_city text,
  permanent_state text,
  permanent_pin text,
  permanent_country text DEFAULT 'India'::text,
  current_address text,
  current_city text,
  current_state text,
  current_pin text,
  current_country text DEFAULT 'India'::text,
  current_same_as_permanent boolean NOT NULL DEFAULT false,
  joining_date date,
  confirmation_date date,
  employment_status text NOT NULL DEFAULT 'active'::text,
  employment_type text NOT NULL DEFAULT 'permanent'::text,
  department_id uuid,
  designation_id uuid,
  reporting_manager_employee_id uuid,
  primary_unit_id uuid,
  grade text,
  cost_centre text,
  employee_category text,
  shift text,
  exit_date date,
  exit_reason text,
  linked_user_id uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.enquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid,
  company_id uuid NOT NULL,
  contact_id uuid,
  title text NOT NULL,
  description text,
  source text,
  status text NOT NULL DEFAULT 'new'::text,
  priority text NOT NULL DEFAULT 'medium'::text,
  assigned_to uuid,
  enquiry_date timestamp with time zone NOT NULL DEFAULT now(),
  next_followup_date timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.file_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  field_key text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL DEFAULT 'application/octet-stream'::text,
  file_size_bytes bigint NOT NULL,
  storage_provider text NOT NULL DEFAULT 'r2'::text,
  storage_bucket text NOT NULL,
  storage_key text NOT NULL,
  checksum text,
  version integer NOT NULL DEFAULT 1,
  is_current boolean NOT NULL DEFAULT true,
  is_archived boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid,
  company_id uuid NOT NULL,
  enquiry_id uuid,
  assigned_to uuid,
  activity_type text NOT NULL,
  due_date timestamp with time zone NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending'::text,
  completed_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.goods_received_note_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  grn_id uuid NOT NULL,
  purchase_order_item_id uuid,
  description text NOT NULL,
  ordered_quantity numeric(18,3) NOT NULL DEFAULT 0,
  received_quantity numeric(18,3) NOT NULL DEFAULT 0,
  accepted_quantity numeric(18,3) NOT NULL DEFAULT 0,
  rejected_quantity numeric(18,3) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.goods_received_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  company_id uuid NOT NULL,
  grn_no text NOT NULL,
  grn_date date NOT NULL DEFAULT CURRENT_DATE,
  purchase_order_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  work_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  received_by uuid,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.holiday_calendar_days (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  holiday_calendar_id uuid NOT NULL,
  holiday_date date NOT NULL,
  name text NOT NULL,
  holiday_type text NOT NULL DEFAULT 'public'::text,
  paid boolean NOT NULL DEFAULT true,
  optional boolean NOT NULL DEFAULT false,
  description text
);
CREATE TABLE IF NOT EXISTS public.holiday_calendars (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  year integer NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.hr_policy_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active'::text,
  effective_from date,
  effective_to date,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_adjustment_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  item_id uuid NOT NULL,
  location_id uuid NOT NULL,
  lot_number text,
  system_quantity numeric NOT NULL,
  physical_quantity numeric NOT NULL,
  variance_quantity numeric DEFAULT (physical_quantity - system_quantity) GENERATED ALWAYS AS (s) STORED,
  unit_cost numeric NOT NULL DEFAULT 0,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  requested_by uuid,
  approved_by uuid,
  rejected_by uuid,
  inventory_transaction_id uuid,
  approval_notes text,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_document_sequences (
  tenant_company_id uuid NOT NULL,
  document_type text NOT NULL,
  document_year integer NOT NULL,
  next_number bigint NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS public.inventory_fulfilment_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  sales_order_item_id uuid NOT NULL,
  inventory_item_id uuid NOT NULL,
  location_id uuid NOT NULL,
  lot_number text,
  ordered_quantity numeric NOT NULL,
  reserved_quantity numeric NOT NULL DEFAULT 0,
  issued_quantity numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  reservation_id uuid,
  reservation_line_id uuid,
  inventory_transaction_id uuid,
  last_inventory_transaction_id uuid
);
CREATE TABLE IF NOT EXISTS public.inventory_item_aliases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  inventory_item_id uuid NOT NULL,
  alias_text text NOT NULL,
  normalized_alias text NOT NULL,
  alias_type text NOT NULL DEFAULT 'description'::text,
  party_type text,
  party_id uuid,
  source_type text,
  source_id uuid,
  source_line_id uuid,
  confidence_score numeric(5,4),
  is_verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_item_match_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  raw_description text NOT NULL,
  normalized_description text,
  parsed_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  proposed_inventory_item_id uuid,
  final_inventory_item_id uuid,
  match_method text,
  confidence_score numeric(5,4),
  decision text NOT NULL DEFAULT 'pending'::text,
  source_type text,
  source_id uuid,
  source_line_id uuid,
  model_provider text,
  model_name text,
  model_version text,
  reviewer_user_id uuid,
  reviewed_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  item_code text NOT NULL,
  name text NOT NULL,
  description text,
  category text,
  item_type text NOT NULL DEFAULT 'stock'::text,
  base_uom_code text NOT NULL,
  hsn_sac_code text,
  reorder_level numeric(18,6) NOT NULL DEFAULT 0,
  reorder_quantity numeric(18,6) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  normalized_name text,
  domain_code text,
  identity_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  identity_version integer NOT NULL DEFAULT 1,
  identity_source text NOT NULL DEFAULT 'manual'::text,
  mep_category_id uuid,
  master_identity_key text
);
CREATE TABLE IF NOT EXISTS public.inventory_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  location_type text NOT NULL DEFAULT 'warehouse'::text,
  address text,
  parent_location_id uuid,
  is_stock_location boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_reservation_actions (
  id uuid NOT NULL DEFAULT extensions.gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  reservation_id uuid NOT NULL,
  action_type text NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_reservation_lines (
  id uuid NOT NULL DEFAULT extensions.gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  reservation_id uuid NOT NULL,
  sales_order_item_id uuid NOT NULL,
  inventory_item_id uuid NOT NULL,
  location_id uuid NOT NULL,
  lot_number text,
  requested_quantity numeric NOT NULL,
  reserved_quantity numeric NOT NULL,
  released_quantity numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active'::text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  issued_quantity numeric NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id uuid NOT NULL DEFAULT extensions.gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  sales_order_id uuid NOT NULL,
  reservation_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active'::text,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_stock_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  item_id uuid NOT NULL,
  location_id uuid NOT NULL,
  lot_number text,
  lot_key text DEFAULT COALESCE(lot_number, ''::text) GENERATED ALWAYS AS (s) STORED,
  quantity_on_hand numeric(18,6) NOT NULL DEFAULT 0,
  average_unit_cost numeric(18,6) NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.inventory_transaction_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  transaction_id uuid NOT NULL,
  item_id uuid NOT NULL,
  quantity numeric(18,6) NOT NULL,
  unit_cost numeric(18,6) NOT NULL DEFAULT 0,
  line_value numeric(20,6) NOT NULL DEFAULT 0,
  lot_number text,
  expiry_date date,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  transaction_no text NOT NULL,
  transaction_type text NOT NULL,
  transaction_date date NOT NULL DEFAULT CURRENT_DATE,
  from_location_id uuid,
  to_location_id uuid,
  work_id uuid,
  source_type text,
  source_id uuid,
  reference_no text,
  notes text,
  status text NOT NULL DEFAULT 'posted'::text,
  idempotency_key text,
  request_hash text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.issues (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_id uuid,
  title text NOT NULL,
  status text DEFAULT 'open'::text,
  created_at timestamp with time zone DEFAULT now(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS public.job_positions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  title text NOT NULL,
  department_id uuid,
  designation_id uuid,
  preferred_location text,
  employment_type text DEFAULT 'permanent'::text,
  openings integer NOT NULL DEFAULT 1,
  description text,
  minimum_experience_years numeric(5,2),
  maximum_experience_years numeric(5,2),
  salary_min numeric(14,2),
  salary_max numeric(14,2),
  status text NOT NULL DEFAULT 'open'::text,
  application_deadline date,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL,
  balance_period_start date NOT NULL,
  balance_period_end date NOT NULL,
  opening_balance numeric NOT NULL DEFAULT 0,
  accrued numeric NOT NULL DEFAULT 0,
  credited numeric NOT NULL DEFAULT 0,
  used numeric NOT NULL DEFAULT 0,
  pending numeric NOT NULL DEFAULT 0,
  adjusted numeric NOT NULL DEFAULT 0,
  encashed numeric NOT NULL DEFAULT 0,
  expired numeric NOT NULL DEFAULT 0,
  available_balance numeric NOT NULL DEFAULT 0,
  policy_rule_id uuid,
  calculation_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.leave_ledger (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL,
  leave_request_id uuid,
  leave_balance_id uuid,
  transaction_type text NOT NULL,
  quantity numeric NOT NULL,
  transaction_date date NOT NULL,
  reference_type text,
  reference_id uuid,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.leave_policy_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  hr_policy_set_id uuid NOT NULL,
  leave_type_id uuid NOT NULL,
  employee_category_id uuid,
  accrual_frequency text NOT NULL DEFAULT 'annual'::text,
  entitlement numeric(10,2) NOT NULL DEFAULT 0,
  carry_forward_allowed boolean NOT NULL DEFAULT false,
  carry_forward_limit numeric(10,2),
  encashable boolean NOT NULL DEFAULT false,
  half_day_allowed boolean NOT NULL DEFAULT true,
  advance_application_required boolean NOT NULL DEFAULT false,
  minimum_notice_days integer,
  maximum_consecutive_days numeric(10,2),
  sandwich_rule boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.leave_request_days (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  leave_request_id uuid NOT NULL,
  leave_date date NOT NULL,
  day_type text NOT NULL,
  requested_days numeric NOT NULL DEFAULT 0,
  approved_days numeric NOT NULL DEFAULT 0,
  holiday_calendar_day_id uuid,
  calculation_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  leave_type_id uuid NOT NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,
  total_days numeric NOT NULL DEFAULT 0,
  half_day boolean NOT NULL DEFAULT false,
  half_day_type text,
  reason text,
  status text NOT NULL DEFAULT 'draft'::text,
  requested_by uuid NOT NULL,
  approval_request_id uuid,
  submitted_at timestamp with time zone,
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.leave_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  paid boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active'::text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  work_id uuid,
  stage_name text NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  edit_count integer DEFAULT 0,
  previous_versions jsonb DEFAULT '[]'::jsonb,
  is_deleted boolean DEFAULT false,
  issue_id uuid,
  attachment_url text,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS public.master_boq_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  work_id uuid NOT NULL,
  master_boq_id uuid NOT NULL,
  line_no integer NOT NULL,
  original_description text NOT NULL,
  normalized_description text,
  inventory_item_id uuid,
  specification jsonb NOT NULL DEFAULT '{}'::jsonb,
  make text,
  model text,
  quantity numeric NOT NULL DEFAULT 0,
  uom_code text,
  remarks text,
  match_status text NOT NULL DEFAULT 'unmatched'::text,
  match_method text,
  match_confidence numeric,
  match_explanation jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_extraction_line_id uuid,
  source_document_id uuid,
  source_page_number integer,
  source_row_number integer,
  created_by uuid,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  parent_line_no text,
  line_type text NOT NULL DEFAULT 'ITEM'::text,
  procurement_scope text NOT NULL DEFAULT 'BOTH'::text,
  supply_quantity numeric,
  supply_uom_code text,
  supply_rate numeric,
  supply_amount numeric,
  installation_quantity numeric,
  installation_uom_code text,
  installation_rate numeric,
  installation_amount numeric,
  line_total_amount numeric,
  source_line_ref text,
  source_po_number text,
  source_wo_number text,
  source_raw_data jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS public.master_boq_outputs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  work_id uuid NOT NULL,
  master_boq_id uuid NOT NULL,
  output_type text NOT NULL,
  output_version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'DRAFT'::text,
  source_line_count integer NOT NULL DEFAULT 0,
  file_name text,
  storage_path text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.master_boqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  work_id uuid NOT NULL,
  boq_code text,
  title text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft'::text,
  is_current boolean NOT NULL DEFAULT false,
  source_document_id uuid,
  source_extraction_id uuid,
  notes text,
  created_by uuid,
  verified_by uuid,
  verified_at timestamp with time zone,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  commercial_mode text NOT NULL DEFAULT 'SPLIT'::text,
  source_document_kind text
);
CREATE TABLE IF NOT EXISTS public.mep_ai_corrections (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  extraction_line_id uuid NOT NULL,
  field_name text NOT NULL,
  previous_value jsonb,
  corrected_value jsonb,
  correction_reason text,
  reviewer_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_attribute_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  domain_code text,
  category_id uuid,
  code text NOT NULL,
  name text NOT NULL,
  data_type text NOT NULL,
  unit_dimension text,
  is_identity_attribute boolean NOT NULL DEFAULT true,
  is_required boolean NOT NULL DEFAULT false,
  allowed_values jsonb NOT NULL DEFAULT '[]'::jsonb,
  parser_hints jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_document_examples (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  document_type text NOT NULL,
  title text NOT NULL,
  document_number text,
  source_file_name text,
  source_file_checksum text,
  source_provider text,
  source_reference text,
  work_id uuid,
  document_date date,
  content_text text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ingestion_status text NOT NULL DEFAULT 'pending'::text,
  is_authoritative boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_document_extractions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  document_example_id uuid NOT NULL,
  extraction_type text NOT NULL,
  provider text,
  model_name text,
  model_version text,
  status text NOT NULL DEFAULT 'pending'::text,
  raw_output jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence_score numeric,
  error_message text,
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_domains (
  code text NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_extraction_lines (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  extraction_id uuid NOT NULL,
  line_no integer NOT NULL,
  source_page integer,
  source_section text,
  raw_description text NOT NULL,
  material_code text,
  vendor_material_number text,
  item_type text,
  domain_code text,
  category_id uuid,
  quantity numeric,
  uom_code text,
  unit_rate numeric,
  discount_percent numeric,
  tax_percent numeric,
  hsn_code text,
  tax_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  parsed_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_description text,
  candidate_inventory_item_id uuid,
  match_confidence numeric,
  match_method text,
  match_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'pending'::text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  parent_line_ref text,
  line_type text NOT NULL DEFAULT 'ITEM'::text,
  procurement_scope text NOT NULL DEFAULT 'BOTH'::text,
  supply_quantity numeric,
  supply_uom_code text,
  supply_rate numeric,
  supply_amount numeric,
  installation_quantity numeric,
  installation_uom_code text,
  installation_rate numeric,
  installation_amount numeric,
  line_total_amount numeric,
  source_line_ref text,
  source_po_number text,
  source_wo_number text
);
CREATE TABLE IF NOT EXISTS public.mep_hsn_tax_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  domain_code text,
  category_id uuid,
  hsn_code text NOT NULL,
  gst_rate numeric(7,3),
  tax_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_from date,
  effective_to date,
  source text,
  is_verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verified_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_item_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  domain_code text NOT NULL,
  parent_category_id uuid,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_item_match_candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  raw_description text NOT NULL,
  normalized_description text,
  parsed_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  candidate_inventory_item_id uuid,
  match_method text,
  confidence_score numeric(6,5),
  match_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_type text,
  source_id uuid,
  source_line_id uuid,
  model_provider text,
  model_name text,
  model_version text,
  status text NOT NULL DEFAULT 'pending'::text,
  reviewer_user_id uuid,
  reviewed_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_item_matching_benchmark_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  case_code text NOT NULL,
  description text NOT NULL,
  normalized_description text,
  parsed_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_inventory_item_id uuid,
  expected_decision text NOT NULL DEFAULT 'review'::text,
  source_type text,
  source_id uuid,
  source_line_id uuid,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_item_matching_benchmark_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  benchmark_version text NOT NULL,
  engine_version text NOT NULL,
  total_cases integer NOT NULL DEFAULT 0,
  top1_matches integer NOT NULL DEFAULT 0,
  top3_matches integer NOT NULL DEFAULT 0,
  hard_conflicts_rejected integer NOT NULL DEFAULT 0,
  human_review_cases integer NOT NULL DEFAULT 0,
  accuracy_top1 numeric(8,5),
  recall_top3 numeric(8,5),
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_item_specifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  inventory_item_id uuid NOT NULL,
  attribute_definition_id uuid NOT NULL,
  value_text text,
  value_numeric numeric,
  value_boolean boolean,
  value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  normalized_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_type text,
  source_id uuid,
  source_line_id uuid,
  confidence_score numeric(6,5),
  is_verified boolean NOT NULL DEFAULT false,
  verified_by uuid,
  verified_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_normalization_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  domain_code text,
  rule_code text NOT NULL,
  rule_type text NOT NULL,
  pattern text NOT NULL,
  replacement text NOT NULL,
  priority integer NOT NULL DEFAULT 100,
  applies_to text NOT NULL DEFAULT 'description'::text,
  source text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mep_units (
  code text NOT NULL,
  dimension text NOT NULL,
  canonical_name text NOT NULL,
  symbol text,
  conversion_to_base numeric NOT NULL DEFAULT 1,
  offset_to_base numeric NOT NULL DEFAULT 0,
  aliases jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid,
  recipient_id uuid NOT NULL,
  actor_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  entity_type text,
  entity_id uuid,
  link_url text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.overtime_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  hr_policy_set_id uuid NOT NULL,
  name text NOT NULL,
  employee_category_id uuid,
  work_location_id uuid,
  enabled boolean NOT NULL DEFAULT false,
  minimum_extra_minutes integer DEFAULT 0,
  rounding_minutes integer DEFAULT 1,
  weekday_allowed boolean NOT NULL DEFAULT false,
  weekly_off_allowed boolean NOT NULL DEFAULT false,
  holiday_allowed boolean NOT NULL DEFAULT false,
  approval_required boolean NOT NULL DEFAULT true,
  max_ot_hours numeric(6,2),
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_account_mappings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  mapping_key text NOT NULL,
  account_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_bank_file_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  profile_code text NOT NULL,
  bank_name text NOT NULL,
  format_code text NOT NULL DEFAULT 'CSV_SALARY_V1'::text,
  payment_mode text NOT NULL DEFAULT 'NEFT'::text,
  delimiter text NOT NULL DEFAULT ','::text,
  include_header boolean NOT NULL DEFAULT false,
  file_extension text NOT NULL DEFAULT 'csv'::text,
  naming_prefix text NOT NULL DEFAULT 'SALARY'::text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_bank_files (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_payment_batch_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'generated'::text,
  file_name text NOT NULL,
  mime_type text NOT NULL DEFAULT 'text/csv'::text,
  row_count integer NOT NULL DEFAULT 0,
  total_amount numeric(18,2) NOT NULL DEFAULT 0,
  file_hash text NOT NULL,
  generation_no integer NOT NULL DEFAULT 1,
  generated_by uuid,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  submitted_at timestamp with time zone,
  external_reference text,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_components (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  component_type text NOT NULL,
  taxable boolean NOT NULL DEFAULT false,
  pf_applicable boolean NOT NULL DEFAULT false,
  esi_applicable boolean NOT NULL DEFAULT false,
  pt_applicable boolean NOT NULL DEFAULT false,
  tds_applicable boolean NOT NULL DEFAULT false,
  recurring boolean NOT NULL DEFAULT true,
  calculation_method text NOT NULL DEFAULT 'fixed'::text,
  default_rate numeric(12,4),
  default_amount numeric(14,2),
  formula_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  employee_contribution boolean NOT NULL DEFAULT false,
  employer_contribution boolean NOT NULL DEFAULT false,
  effective_from date,
  effective_to date,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_payment_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_run_id uuid NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'draft'::text,
  payment_method text NOT NULL DEFAULT 'bank_transfer'::text,
  bank_account_id uuid,
  total_employees integer NOT NULL DEFAULT 0,
  total_amount numeric(18,2) NOT NULL DEFAULT 0,
  approval_request_id uuid,
  journal_entry_id uuid,
  bank_transaction_id uuid,
  idempotency_key text NOT NULL,
  request_hash text,
  processed_at timestamp with time zone,
  paid_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  failure_reason text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_payment_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payment_batch_id uuid NOT NULL,
  payroll_run_id uuid NOT NULL,
  payroll_run_item_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  employee_bank_account_id uuid NOT NULL,
  amount numeric(18,2) NOT NULL,
  payment_status text NOT NULL DEFAULT 'pending'::text,
  bank_reference_no text,
  failure_reason text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_payment_reconciliations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_payment_batch_id uuid NOT NULL,
  payroll_payment_item_id uuid NOT NULL,
  bank_transaction_id uuid NOT NULL,
  matched_amount numeric(18,2) NOT NULL,
  status text NOT NULL DEFAULT 'matched'::text,
  match_method text NOT NULL DEFAULT 'manual'::text,
  external_reference text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_payslips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_run_id uuid NOT NULL,
  payroll_run_item_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  period_code text NOT NULL,
  payslip_number text NOT NULL,
  content_hash text NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  generated_by uuid
);
CREATE TABLE IF NOT EXISTS public.payroll_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  period_code text NOT NULL,
  period_name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  pay_date date,
  status text NOT NULL DEFAULT 'open'::text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_run_accounting (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_run_id uuid NOT NULL,
  journal_entry_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  posted_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid
);
CREATE TABLE IF NOT EXISTS public.payroll_run_item_components (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_run_item_id uuid NOT NULL,
  payroll_component_id uuid NOT NULL,
  amount numeric(16,2) NOT NULL DEFAULT 0,
  quantity numeric(12,4),
  rate numeric(12,6),
  basis jsonb NOT NULL DEFAULT '{}'::jsonb,
  sequence integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_run_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_run_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  working_days numeric(8,2) NOT NULL DEFAULT 0,
  paid_days numeric(8,2) NOT NULL DEFAULT 0,
  lop_days numeric(8,2) NOT NULL DEFAULT 0,
  gross_earnings numeric(16,2) NOT NULL DEFAULT 0,
  total_deductions numeric(16,2) NOT NULL DEFAULT 0,
  employer_contributions numeric(16,2) NOT NULL DEFAULT 0,
  net_pay numeric(16,2) NOT NULL DEFAULT 0,
  calculation_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_period_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text,
  calculation_version text NOT NULL,
  calculated_at timestamp with time zone,
  approved_at timestamp with time zone,
  posted_at timestamp with time zone,
  calculation_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_enabled boolean NOT NULL DEFAULT false,
  payroll_frequency text NOT NULL DEFAULT 'monthly'::text,
  payroll_cutoff_day integer,
  pay_day integer,
  state_code text,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  rounding_mode text NOT NULL DEFAULT 'nearest'::text,
  attendance_integration_enabled boolean NOT NULL DEFAULT true,
  leave_integration_enabled boolean NOT NULL DEFAULT true,
  overtime_integration_enabled boolean NOT NULL DEFAULT false,
  comp_off_integration_enabled boolean NOT NULL DEFAULT false,
  pf_enabled boolean NOT NULL DEFAULT false,
  esi_enabled boolean NOT NULL DEFAULT false,
  pt_enabled boolean NOT NULL DEFAULT false,
  tds_enabled boolean NOT NULL DEFAULT false,
  default_tax_regime text,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  salary_proration_method text NOT NULL DEFAULT 'none'::text
);
CREATE TABLE IF NOT EXISTS public.payroll_statutory_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  rule_type text NOT NULL,
  rule_name text NOT NULL,
  jurisdiction_type text NOT NULL DEFAULT 'india'::text,
  state_code text,
  financial_year text,
  tax_year text,
  applicability_mode text NOT NULL DEFAULT 'configured'::text,
  wage_basis text,
  wage_ceiling numeric(14,2),
  employee_rate numeric(12,6),
  employer_rate numeric(12,6),
  fixed_amount numeric(14,2),
  slab_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  rule_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_from date NOT NULL,
  effective_to date,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_statutory_settlements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  payroll_period_id uuid NOT NULL,
  statutory_type text NOT NULL,
  settlement_date date NOT NULL DEFAULT CURRENT_DATE,
  total_amount numeric(18,2) NOT NULL,
  employee_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft'::text,
  bank_account_id uuid,
  bank_transaction_id uuid,
  journal_entry_id uuid,
  payment_reference text,
  export_generation integer NOT NULL DEFAULT 1,
  idempotency_key text NOT NULL,
  request_hash text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_tax_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  tax_year text NOT NULL,
  status text NOT NULL DEFAULT 'prepared'::text,
  gross_salary numeric(18,2) NOT NULL DEFAULT 0,
  taxable_salary numeric(18,2) NOT NULL DEFAULT 0,
  total_deductions numeric(18,2) NOT NULL DEFAULT 0,
  tds_deducted numeric(18,2) NOT NULL DEFAULT 0,
  previous_employer_income numeric(18,2) NOT NULL DEFAULT 0,
  previous_employer_tds numeric(18,2) NOT NULL DEFAULT 0,
  other_income numeric(18,2) NOT NULL DEFAULT 0,
  declaration_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  generated_by uuid
);
CREATE TABLE IF NOT EXISTS public.payroll_tax_declarations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  employee_id uuid NOT NULL,
  tax_year text NOT NULL,
  tax_regime text NOT NULL,
  residency_status text NOT NULL DEFAULT 'resident'::text,
  tds_applicable boolean NOT NULL DEFAULT true,
  declaration_status text NOT NULL DEFAULT 'draft'::text,
  projected_annual_salary numeric(16,2) NOT NULL DEFAULT 0,
  previous_employer_income numeric(16,2) NOT NULL DEFAULT 0,
  previous_employer_tds numeric(16,2) NOT NULL DEFAULT 0,
  other_income numeric(16,2) NOT NULL DEFAULT 0,
  home_loan_interest numeric(16,2) NOT NULL DEFAULT 0,
  hra_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  deduction_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  exemption_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  declaration_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamp with time zone,
  reviewed_at timestamp with time zone,
  created_by uuid,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_tax_previous_employers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  tax_declaration_id uuid NOT NULL,
  employer_name text NOT NULL,
  employer_tan text,
  salary_income numeric(16,2) NOT NULL DEFAULT 0,
  tds_deducted numeric(16,2) NOT NULL DEFAULT 0,
  other_taxable_income numeric(16,2) NOT NULL DEFAULT 0,
  evidence_status text NOT NULL DEFAULT 'declared'::text,
  evidence_reference text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payroll_tds_tax_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid,
  tax_year text NOT NULL,
  applicable_act text NOT NULL,
  rule_type text NOT NULL,
  tax_regime text,
  age_band text,
  rule_code text NOT NULL,
  rule_name text NOT NULL,
  rule_value numeric(18,6),
  rule_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_from date NOT NULL,
  effective_to date,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.procurement_accounting_idempotency (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  idempotency_key text NOT NULL,
  request_hash text NOT NULL,
  source_type text NOT NULL,
  source_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL,
  email text NOT NULL,
  role text DEFAULT 'guest'::text,
  created_at timestamp with time zone DEFAULT now(),
  display_name text,
  full_name text,
  phone text,
  job_title text,
  department text,
  timezone text DEFAULT 'Asia/Kolkata'::text,
  locale text DEFAULT 'en-IN'::text,
  avatar_url text
);
CREATE TABLE IF NOT EXISTS public.proforma_invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  proforma_invoice_id uuid NOT NULL,
  item_description text NOT NULL,
  hsn_sac_code text,
  quantity numeric(12,3) NOT NULL DEFAULT 1,
  unit_price numeric(15,2) NOT NULL DEFAULT 0,
  taxable_value numeric(15,2) NOT NULL DEFAULT 0,
  gst_rate_pct numeric(5,2) NOT NULL DEFAULT 0,
  cgst_rate numeric(5,2) NOT NULL DEFAULT 0,
  sgst_rate numeric(5,2) NOT NULL DEFAULT 0,
  igst_rate numeric(5,2) NOT NULL DEFAULT 0,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  igst_amount numeric(15,2) NOT NULL DEFAULT 0,
  line_total numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.proforma_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  proforma_no text NOT NULL,
  proforma_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL,
  sales_order_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  subtotal numeric(16,2) NOT NULL DEFAULT 0,
  tax_amount numeric(16,2) NOT NULL DEFAULT 0,
  total_amount numeric(16,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  quotation_id uuid,
  company_id uuid NOT NULL,
  enquiry_id uuid,
  work_id uuid,
  due_date date,
  customer_gstin text,
  place_of_supply text,
  reverse_charge boolean NOT NULL DEFAULT false,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  igst_amount numeric(15,2) NOT NULL DEFAULT 0,
  terms_and_conditions text
);
CREATE TABLE IF NOT EXISTS public.project_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  work_id uuid NOT NULL,
  user_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  project_role text NOT NULL DEFAULT 'member'::text,
  status text NOT NULL DEFAULT 'active'::text,
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.purchase_bill_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  purchase_bill_id uuid NOT NULL,
  description text NOT NULL,
  item_code text,
  quantity numeric(18,3) NOT NULL,
  unit text,
  unit_price numeric(18,2) NOT NULL DEFAULT 0,
  taxable_amount numeric(18,2) NOT NULL DEFAULT 0,
  tax_rate numeric(7,3) NOT NULL DEFAULT 0,
  cgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  igst_amount numeric(18,2) NOT NULL DEFAULT 0,
  line_total numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid,
  purchase_order_item_id uuid,
  goods_received_note_item_id uuid
);
CREATE TABLE IF NOT EXISTS public.purchase_bills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  company_id uuid NOT NULL,
  bill_no text NOT NULL,
  vendor_invoice_no text,
  bill_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date,
  vendor_id uuid NOT NULL,
  purchase_order_id uuid,
  grn_id uuid,
  work_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  vendor_gstin text,
  reverse_charge boolean NOT NULL DEFAULT false,
  subtotal numeric(18,2) NOT NULL DEFAULT 0,
  cgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  igst_amount numeric(18,2) NOT NULL DEFAULT 0,
  tax_amount numeric(18,2) NOT NULL DEFAULT 0,
  total_amount numeric(18,2) NOT NULL DEFAULT 0,
  amount_paid numeric(18,2) NOT NULL DEFAULT 0,
  balance_due numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.purchase_document_sequences (
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  doc_type text NOT NULL,
  fiscal_year text NOT NULL,
  next_number bigint NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  purchase_order_id uuid NOT NULL,
  description text NOT NULL,
  item_code text,
  quantity numeric(18,3) NOT NULL,
  unit text,
  unit_price numeric(18,2) NOT NULL DEFAULT 0,
  taxable_amount numeric(18,2) NOT NULL DEFAULT 0,
  tax_rate numeric(7,3) NOT NULL DEFAULT 0,
  cgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  igst_amount numeric(18,2) NOT NULL DEFAULT 0,
  line_total numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  company_id uuid NOT NULL,
  po_no text NOT NULL,
  po_date date NOT NULL DEFAULT CURRENT_DATE,
  vendor_id uuid NOT NULL,
  purchase_request_id uuid,
  rfq_id uuid,
  vendor_quotation_id uuid,
  work_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  expected_delivery_date date,
  payment_terms_days integer NOT NULL DEFAULT 0,
  vendor_gstin text,
  place_of_supply text,
  reverse_charge boolean NOT NULL DEFAULT false,
  subtotal numeric(18,2) NOT NULL DEFAULT 0,
  cgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  igst_amount numeric(18,2) NOT NULL DEFAULT 0,
  tax_amount numeric(18,2) NOT NULL DEFAULT 0,
  total_amount numeric(18,2) NOT NULL DEFAULT 0,
  terms_and_conditions text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.purchase_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  purchase_bill_id uuid NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(18,2) NOT NULL,
  payment_method text,
  reference_no text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.purchase_request_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  purchase_request_id uuid NOT NULL,
  description text NOT NULL,
  item_code text,
  quantity numeric(18,3) NOT NULL,
  unit text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.purchase_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  company_id uuid NOT NULL,
  pr_no text NOT NULL,
  request_date date NOT NULL DEFAULT CURRENT_DATE,
  required_date date,
  requested_by uuid,
  work_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  priority text NOT NULL DEFAULT 'normal'::text,
  purpose text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.recruitment_application_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  job_position_id uuid NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamp with time zone,
  max_submissions integer,
  submission_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active'::text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.recruitment_candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  job_position_id uuid,
  application_link_id uuid,
  first_name text NOT NULL,
  middle_name text,
  last_name text,
  display_name text,
  mobile text NOT NULL,
  email text,
  address text,
  city text,
  state text,
  pin text,
  position_applied text,
  department_id uuid,
  preferred_location text,
  total_experience_years numeric(5,2),
  relevant_experience_years numeric(5,2),
  current_company text,
  current_ctc numeric(14,2),
  expected_ctc numeric(14,2),
  notice_period_days integer,
  highest_qualification text,
  resume_url text,
  willing_to_relocate boolean,
  source text,
  availability_date date,
  consent_given boolean NOT NULL DEFAULT false,
  consent_at timestamp with time zone,
  status text NOT NULL DEFAULT 'applied'::text,
  notes text,
  employee_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  content text NOT NULL,
  is_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  target_date timestamp with time zone,
  company_id uuid,
  unit_id uuid,
  work_id uuid,
  is_deleted boolean DEFAULT false,
  log_id uuid,
  stage_name text,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  created_by uuid
);
CREATE TABLE IF NOT EXISTS public.rfqs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  company_id uuid NOT NULL,
  rfq_no text NOT NULL,
  rfq_date date NOT NULL DEFAULT CURRENT_DATE,
  purchase_request_id uuid,
  work_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  due_date date,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.sales_document_sequences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  doc_type text NOT NULL,
  fiscal_year text NOT NULL,
  current_val integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.sales_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  sales_order_id uuid NOT NULL,
  item_description text NOT NULL,
  hsn_sac_code text,
  quantity numeric(12,3) NOT NULL DEFAULT 1,
  unit_price numeric(15,2) NOT NULL DEFAULT 0,
  taxable_value numeric(15,2) NOT NULL DEFAULT 0,
  gst_rate_pct numeric(5,2) NOT NULL DEFAULT 0,
  cgst_rate numeric(5,2) NOT NULL DEFAULT 0,
  sgst_rate numeric(5,2) NOT NULL DEFAULT 0,
  igst_rate numeric(5,2) NOT NULL DEFAULT 0,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  igst_amount numeric(15,2) NOT NULL DEFAULT 0,
  line_total numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  order_no text NOT NULL,
  order_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL,
  quotation_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  subtotal numeric(16,2) NOT NULL DEFAULT 0,
  tax_amount numeric(16,2) NOT NULL DEFAULT 0,
  total_amount numeric(16,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  enquiry_id uuid,
  work_id uuid,
  delivery_date date,
  customer_gstin text,
  place_of_supply text,
  reverse_charge boolean NOT NULL DEFAULT false,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  igst_amount numeric(15,2) NOT NULL DEFAULT 0,
  terms_and_conditions text
);
CREATE TABLE IF NOT EXISTS public.sales_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  tax_invoice_id uuid NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_mode text NOT NULL DEFAULT 'bank_transfer'::text,
  reference_number text,
  amount numeric(15,2) NOT NULL,
  notes text,
  recorded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.sales_quotation_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  quotation_id uuid NOT NULL,
  item_description text NOT NULL,
  hsn_sac_code text,
  quantity numeric(12,3) NOT NULL DEFAULT 1,
  unit_price numeric(15,2) NOT NULL DEFAULT 0,
  taxable_value numeric(15,2) NOT NULL DEFAULT 0,
  gst_rate_pct numeric(5,2) NOT NULL DEFAULT 0,
  cgst_rate numeric(5,2) NOT NULL DEFAULT 0,
  sgst_rate numeric(5,2) NOT NULL DEFAULT 0,
  igst_rate numeric(5,2) NOT NULL DEFAULT 0,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  igst_amount numeric(15,2) NOT NULL DEFAULT 0,
  line_total numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.sales_quotations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  quotation_no text NOT NULL,
  quotation_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL,
  status text NOT NULL DEFAULT 'draft'::text,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  subtotal numeric(16,2) NOT NULL DEFAULT 0,
  tax_amount numeric(16,2) NOT NULL DEFAULT 0,
  total_amount numeric(16,2) NOT NULL DEFAULT 0,
  valid_until date,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  enquiry_id uuid,
  work_id uuid,
  customer_gstin text,
  place_of_supply text,
  reverse_charge boolean NOT NULL DEFAULT false,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  igst_amount numeric(15,2) NOT NULL DEFAULT 0,
  terms_and_conditions text
);
CREATE TABLE IF NOT EXISTS public.stage_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  work_id uuid NOT NULL,
  stage_id uuid NOT NULL,
  user_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  stage_role text NOT NULL DEFAULT 'responsible'::text,
  status text NOT NULL DEFAULT 'active'::text,
  ended_by uuid,
  ended_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.stage_definitions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  work_id uuid NOT NULL,
  name text NOT NULL,
  display_order integer NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  description text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.task_assignees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'assignee'::text,
  status text NOT NULL DEFAULT 'active'::text,
  assigned_by uuid,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_by uuid,
  ended_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  work_id uuid NOT NULL,
  stage_id uuid,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started'::text,
  priority text NOT NULL DEFAULT 'medium'::text,
  due_date timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.tax_invoice_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  tax_invoice_id uuid NOT NULL,
  item_description text NOT NULL,
  hsn_sac_code text,
  quantity numeric(12,3) NOT NULL DEFAULT 1,
  unit_price numeric(15,2) NOT NULL DEFAULT 0,
  taxable_value numeric(15,2) NOT NULL DEFAULT 0,
  gst_rate_pct numeric(5,2) NOT NULL DEFAULT 0,
  cgst_rate numeric(5,2) NOT NULL DEFAULT 0,
  sgst_rate numeric(5,2) NOT NULL DEFAULT 0,
  igst_rate numeric(5,2) NOT NULL DEFAULT 0,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  igst_amount numeric(15,2) NOT NULL DEFAULT 0,
  line_total numeric(15,2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.tax_invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  invoice_no text NOT NULL,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL,
  sales_order_id uuid,
  proforma_invoice_id uuid,
  status text NOT NULL DEFAULT 'draft'::text,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  subtotal numeric(16,2) NOT NULL DEFAULT 0,
  tax_amount numeric(16,2) NOT NULL DEFAULT 0,
  total_amount numeric(16,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  quotation_id uuid,
  company_id uuid NOT NULL,
  enquiry_id uuid,
  work_id uuid,
  due_date date,
  customer_gstin text,
  place_of_supply text,
  reverse_charge boolean NOT NULL DEFAULT false,
  cgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(15,2) NOT NULL DEFAULT 0,
  igst_amount numeric(15,2) NOT NULL DEFAULT 0,
  amount_paid numeric(15,2) NOT NULL DEFAULT 0,
  balance_due numeric(15,2) NOT NULL DEFAULT 0,
  terms_and_conditions text
);
CREATE TABLE IF NOT EXISTS public.tenant_companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.units (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid,
  name text NOT NULL,
  location text,
  created_at timestamp with time zone DEFAULT now(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS public.user_company_access (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  membership_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  can_view boolean NOT NULL DEFAULT true,
  can_edit boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.v_secdef_count (
  count bigint
);
CREATE TABLE IF NOT EXISTS public.vendor_quotation_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  vendor_quotation_id uuid NOT NULL,
  description text NOT NULL,
  item_code text,
  quantity numeric(18,3) NOT NULL,
  unit text,
  unit_price numeric(18,2) NOT NULL DEFAULT 0,
  taxable_amount numeric(18,2) NOT NULL DEFAULT 0,
  tax_rate numeric(7,3) NOT NULL DEFAULT 0,
  cgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  sgst_amount numeric(18,2) NOT NULL DEFAULT 0,
  igst_amount numeric(18,2) NOT NULL DEFAULT 0,
  line_total numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  inventory_item_id uuid,
  master_boq_line_id uuid
);
CREATE TABLE IF NOT EXISTS public.vendor_quotations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  company_id uuid NOT NULL,
  rfq_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  quotation_no text,
  quotation_date date,
  valid_until date,
  status text NOT NULL DEFAULT 'received'::text,
  currency_code text NOT NULL DEFAULT 'INR'::text,
  subtotal numeric(18,2) NOT NULL DEFAULT 0,
  tax_amount numeric(18,2) NOT NULL DEFAULT 0,
  total_amount numeric(18,2) NOT NULL DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  company_id uuid,
  vendor_code text NOT NULL,
  vendor_name text NOT NULL,
  legal_name text,
  gstin text,
  pan text,
  email text,
  phone text,
  address text,
  payment_terms_days integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active'::text,
  notes text,
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.weekly_off_policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  hr_policy_set_id uuid NOT NULL,
  name text NOT NULL,
  employee_category_id uuid,
  work_location_id uuid,
  monday boolean NOT NULL DEFAULT false,
  tuesday boolean NOT NULL DEFAULT false,
  wednesday boolean NOT NULL DEFAULT false,
  thursday boolean NOT NULL DEFAULT false,
  friday boolean NOT NULL DEFAULT false,
  saturday boolean NOT NULL DEFAULT false,
  sunday boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.work_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  location_type text NOT NULL DEFAULT 'other'::text,
  address text,
  unit_id uuid,
  status text NOT NULL DEFAULT 'active'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.works (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid,
  title text NOT NULL,
  stage_index integer DEFAULT 0,
  stages jsonb DEFAULT '["Enquiry", "Design", "Hydraulic Calc", "Approval", "Execution"]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  unit_id uuid,
  wo_number text,
  po_number text,
  boq_url text,
  tenant_id uuid NOT NULL,
  tenant_company_id uuid NOT NULL
);
-- OMITTED TABLE realtime.messages: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.topic: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.extension: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.payload: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.event: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.private: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.updated_at: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.inserted_at: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.id: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.binary_payload: Supabase-managed schema
-- OMITTED COLUMN realtime.messages.skip_broadcast: Supabase-managed schema
-- OMITTED TABLE realtime.schema_migrations: Supabase-managed schema
-- OMITTED COLUMN realtime.schema_migrations.version: Supabase-managed schema
-- OMITTED COLUMN realtime.schema_migrations.inserted_at: Supabase-managed schema
-- OMITTED TABLE realtime.subscription: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.id: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.subscription_id: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.entity: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.filters: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.claims: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.claims_role: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.created_at: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.action_filter: Supabase-managed schema
-- OMITTED COLUMN realtime.subscription.selected_columns: Supabase-managed schema
-- OMITTED TABLE storage.buckets: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.id: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.name: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.owner: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.created_at: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.updated_at: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.public: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.avif_autodetection: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.file_size_limit: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.allowed_mime_types: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.owner_id: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.type: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.versioning_status: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.lifecycle_configuration: Supabase-managed schema
-- OMITTED COLUMN storage.buckets.lifecycle_configuration_generation: Supabase-managed schema
-- OMITTED TABLE storage.buckets_analytics: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_analytics.name: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_analytics.type: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_analytics.format: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_analytics.created_at: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_analytics.updated_at: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_analytics.id: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_analytics.deleted_at: Supabase-managed schema
-- OMITTED TABLE storage.buckets_vectors: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_vectors.id: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_vectors.type: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_vectors.created_at: Supabase-managed schema
-- OMITTED COLUMN storage.buckets_vectors.updated_at: Supabase-managed schema
-- OMITTED TABLE storage.migrations: Supabase-managed schema
-- OMITTED COLUMN storage.migrations.id: Supabase-managed schema
-- OMITTED COLUMN storage.migrations.name: Supabase-managed schema
-- OMITTED COLUMN storage.migrations.hash: Supabase-managed schema
-- OMITTED COLUMN storage.migrations.executed_at: Supabase-managed schema
-- OMITTED TABLE storage.objects: Supabase-managed schema
-- OMITTED COLUMN storage.objects.id: Supabase-managed schema
-- OMITTED COLUMN storage.objects.bucket_id: Supabase-managed schema
-- OMITTED COLUMN storage.objects.name: Supabase-managed schema
-- OMITTED COLUMN storage.objects.owner: Supabase-managed schema
-- OMITTED COLUMN storage.objects.created_at: Supabase-managed schema
-- OMITTED COLUMN storage.objects.updated_at: Supabase-managed schema
-- OMITTED COLUMN storage.objects.last_accessed_at: Supabase-managed schema
-- OMITTED COLUMN storage.objects.metadata: Supabase-managed schema
-- OMITTED COLUMN storage.objects.path_tokens: Supabase-managed schema
-- OMITTED COLUMN storage.objects.version: Supabase-managed schema
-- OMITTED COLUMN storage.objects.owner_id: Supabase-managed schema
-- OMITTED COLUMN storage.objects.user_metadata: Supabase-managed schema
-- OMITTED COLUMN storage.objects.archived_at: Supabase-managed schema
-- OMITTED COLUMN storage.objects.is_delete_marker: Supabase-managed schema
-- OMITTED COLUMN storage.objects.is_versioned: Supabase-managed schema
-- OMITTED TABLE storage.s3_multipart_uploads: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.id: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.in_progress_size: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.upload_signature: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.bucket_id: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.key: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.version: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.owner_id: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.created_at: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.user_metadata: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads.metadata: Supabase-managed schema
-- OMITTED TABLE storage.s3_multipart_uploads_parts: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.id: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.upload_id: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.size: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.part_number: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.bucket_id: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.key: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.etag: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.owner_id: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.version: Supabase-managed schema
-- OMITTED COLUMN storage.s3_multipart_uploads_parts.created_at: Supabase-managed schema
-- OMITTED TABLE storage.vector_indexes: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.id: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.name: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.bucket_id: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.data_type: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.dimension: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.distance_metric: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.metadata_configuration: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.created_at: Supabase-managed schema
-- OMITTED COLUMN storage.vector_indexes.updated_at: Supabase-managed schema
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version text NOT NULL,
  statements text[],
  name text,
  created_by text,
  idempotency_key text,
  rollback text[]
);
-- OMITTED TABLE vault.secrets: Supabase-managed schema
-- OMITTED COLUMN vault.secrets.id: Supabase-managed schema
-- OMITTED COLUMN vault.secrets.name: Supabase-managed schema
-- OMITTED COLUMN vault.secrets.description: Supabase-managed schema
-- OMITTED COLUMN vault.secrets.secret: Supabase-managed schema
-- OMITTED COLUMN vault.secrets.key_id: Supabase-managed schema
-- OMITTED COLUMN vault.secrets.nonce: Supabase-managed schema
-- OMITTED COLUMN vault.secrets.created_at: Supabase-managed schema
-- OMITTED COLUMN vault.secrets.updated_at: Supabase-managed schema

-- ==========================================
-- SECTION 06: TABLE COMMENTS
-- ==========================================
-- (Not extracted or skipped)

-- ==========================================
-- SECTION 07: SEQUENCE OWNERSHIP
-- ==========================================
-- (Not extracted or skipped)

-- ==========================================
-- SECTION 08: PRIMARY KEYS / UNIQUE CONSTRAINTS
-- ==========================================
-- OMITTED CONSTRAINT auth.audit_log_entries.audit_log_entries_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_identifier_key: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.flow_state.flow_state_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.identities.identities_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.identities.identities_provider_id_provider_unique: Supabase-managed schema
-- OMITTED CONSTRAINT auth.instances.instances_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_amr_claims.amr_id_pk: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_amr_claims.mfa_amr_claims_session_id_authentication_method_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_challenges.mfa_challenges_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_factors.mfa_factors_last_challenged_at_key: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_factors.mfa_factors_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_recovery_code_sets.mfa_recovery_code_sets_mfa_factor_id_key: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_recovery_code_sets.mfa_recovery_code_sets_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_recovery_code_sets.mfa_recovery_code_sets_user_id_key: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_recovery_codes.mfa_recovery_codes_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_authorization_code_key: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_authorization_id_key: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_client_states.oauth_client_states_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_clients.oauth_clients_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_consents.oauth_consents_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_consents.oauth_consents_user_client_unique: Supabase-managed schema
-- OMITTED CONSTRAINT auth.one_time_tokens.one_time_tokens_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.refresh_tokens.refresh_tokens_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.refresh_tokens.refresh_tokens_token_unique: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_providers.saml_providers_entity_id_key: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_providers.saml_providers_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_relay_states.saml_relay_states_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.schema_migrations.schema_migrations_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.scim_tokens.scim_tokens_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.scim_users.scim_users_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sessions.sessions_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sso_domains.sso_domains_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sso_providers.sso_providers_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.users.users_phone_key: Supabase-managed schema
-- OMITTED CONSTRAINT auth.users.users_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.webauthn_challenges.webauthn_challenges_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.webauthn_credentials.webauthn_credentials_pkey: Supabase-managed schema
ALTER TABLE public.accounting_bank_accounts ADD CONSTRAINT accounting_bank_accounts_account_unique UNIQUE (tenant_company_id, account_id);
ALTER TABLE public.accounting_bank_accounts ADD CONSTRAINT accounting_bank_accounts_pkey PRIMARY KEY (id);
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.accounting_fiscal_periods ADD CONSTRAINT accounting_fiscal_periods_company_unique UNIQUE (tenant_company_id, period_start, period_end);
ALTER TABLE public.accounting_fiscal_periods ADD CONSTRAINT accounting_fiscal_periods_pkey PRIMARY KEY (id);
ALTER TABLE public.accounting_journal_entries ADD CONSTRAINT accounting_journal_entries_idempotency_unique UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.accounting_journal_entries ADD CONSTRAINT accounting_journal_entries_pkey PRIMARY KEY (id);
ALTER TABLE public.accounting_journal_entries ADD CONSTRAINT accounting_journal_entries_voucher_unique UNIQUE (tenant_company_id, voucher_number);
ALTER TABLE public.accounting_journal_lines ADD CONSTRAINT accounting_journal_lines_no_unique UNIQUE (journal_entry_id, line_no);
ALTER TABLE public.accounting_journal_lines ADD CONSTRAINT accounting_journal_lines_pkey PRIMARY KEY (id);
ALTER TABLE public.approval_request_actions ADD CONSTRAINT approval_request_actions_pkey PRIMARY KEY (id);
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_pkey PRIMARY KEY (id);
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.approval_workflow_steps ADD CONSTRAINT approval_workflow_steps_approval_workflow_id_step_order_key UNIQUE (approval_workflow_id, step_order);
ALTER TABLE public.approval_workflow_steps ADD CONSTRAINT approval_workflow_steps_pkey PRIMARY KEY (id);
ALTER TABLE public.approval_workflows ADD CONSTRAINT approval_workflows_pkey PRIMARY KEY (id);
ALTER TABLE public.approval_workflows ADD CONSTRAINT approval_workflows_tenant_id_tenant_company_id_name_request_key UNIQUE (tenant_id, tenant_company_id, name, request_type);
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_pkey PRIMARY KEY (id);
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_employee_date_unique UNIQUE (tenant_id, tenant_company_id, employee_id, attendance_date);
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_pkey PRIMARY KEY (id);
ALTER TABLE public.attendance_devices ADD CONSTRAINT attendance_devices_pkey PRIMARY KEY (id);
ALTER TABLE public.attendance_employee_shifts ADD CONSTRAINT attendance_employee_shifts_pkey PRIMARY KEY (id);
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_pkey PRIMARY KEY (id);
ALTER TABLE public.attendance_face_profiles ADD CONSTRAINT attendance_face_profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.attendance_feature_settings ADD CONSTRAINT attendance_feature_settings_company_unique UNIQUE (tenant_id, tenant_company_id);
ALTER TABLE public.attendance_feature_settings ADD CONSTRAINT attendance_feature_settings_pkey PRIMARY KEY (id);
ALTER TABLE public.attendance_policies ADD CONSTRAINT attendance_policies_pkey PRIMARY KEY (id);
ALTER TABLE public.attendance_shifts ADD CONSTRAINT attendance_shifts_company_name_unique UNIQUE (tenant_id, tenant_company_id, name);
ALTER TABLE public.attendance_shifts ADD CONSTRAINT attendance_shifts_pkey PRIMARY KEY (id);
ALTER TABLE public.calc_saves ADD CONSTRAINT calc_saves_pkey PRIMARY KEY (id);
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_pkey PRIMARY KEY (id);
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_candidate_id_key UNIQUE (candidate_id);
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_employee_id_key UNIQUE (employee_id);
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_pkey PRIMARY KEY (id);
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_token_hash_key UNIQUE (token_hash);
ALTER TABLE public.chart_of_accounts ADD CONSTRAINT chart_of_accounts_code_unique UNIQUE (tenant_company_id, account_code);
ALTER TABLE public.chart_of_accounts ADD CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id);
ALTER TABLE public.comp_off_policies ADD CONSTRAINT comp_off_policies_pkey PRIMARY KEY (id);
ALTER TABLE public.companies ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE public.companies ADD CONSTRAINT uq_companies_tenant_comp UNIQUE (tenant_company_id, id);
ALTER TABLE public.company_addresses ADD CONSTRAINT company_addresses_pkey PRIMARY KEY (id);
ALTER TABLE public.company_bank_profiles ADD CONSTRAINT company_bank_profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.company_branding ADD CONSTRAINT company_branding_pkey PRIMARY KEY (tenant_company_id);
ALTER TABLE public.company_contacts ADD CONSTRAINT company_contacts_pkey PRIMARY KEY (id);
ALTER TABLE public.company_documents ADD CONSTRAINT company_documents_pkey PRIMARY KEY (id);
ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_pkey PRIMARY KEY (tenant_company_id);
ALTER TABLE public.company_registrations ADD CONSTRAINT company_registrations_pkey PRIMARY KEY (id);
ALTER TABLE public.company_settings_audit ADD CONSTRAINT company_settings_audit_pkey PRIMARY KEY (id);
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_pkey PRIMARY KEY (tenant_company_id);
ALTER TABLE public.contacts ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);
ALTER TABLE public.crm_customer_profiles ADD CONSTRAINT crm_customer_profiles_pkey PRIMARY KEY (company_id);
ALTER TABLE public.departments ADD CONSTRAINT departments_pkey PRIMARY KEY (id);
ALTER TABLE public.departments ADD CONSTRAINT departments_tenant_company_id_name_key UNIQUE (tenant_company_id, name);
ALTER TABLE public.designations ADD CONSTRAINT designations_pkey PRIMARY KEY (id);
ALTER TABLE public.designations ADD CONSTRAINT designations_tenant_company_id_name_key UNIQUE (tenant_company_id, name);
ALTER TABLE public.documents ADD CONSTRAINT documents_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_bank_accounts ADD CONSTRAINT employee_bank_accounts_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_categories ADD CONSTRAINT employee_categories_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_categories ADD CONSTRAINT employee_categories_tenant_id_tenant_company_id_name_key UNIQUE (tenant_id, tenant_company_id, name);
ALTER TABLE public.employee_company_assignments ADD CONSTRAINT employee_company_assignments_employee_id_tenant_company_id_key UNIQUE (employee_id, tenant_company_id);
ALTER TABLE public.employee_company_assignments ADD CONSTRAINT employee_company_assignments_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_dependents ADD CONSTRAINT employee_dependents_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_documents ADD CONSTRAINT employee_documents_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_esi_details ADD CONSTRAINT employee_esi_details_employee_id_key UNIQUE (employee_id);
ALTER TABLE public.employee_esi_details ADD CONSTRAINT employee_esi_details_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_field_configurations ADD CONSTRAINT employee_field_configurations_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_field_configurations ADD CONSTRAINT employee_field_configurations_tenant_company_id_field_defin_key UNIQUE (tenant_company_id, field_definition_id);
ALTER TABLE public.employee_field_definitions ADD CONSTRAINT employee_field_definitions_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_field_definitions ADD CONSTRAINT employee_field_definitions_tenant_id_field_key_key UNIQUE (tenant_id, field_key);
ALTER TABLE public.employee_field_values ADD CONSTRAINT employee_field_values_employee_id_field_definition_id_key UNIQUE (employee_id, field_definition_id);
ALTER TABLE public.employee_field_values ADD CONSTRAINT employee_field_values_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_nominees ADD CONSTRAINT employee_nominees_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_pf_details ADD CONSTRAINT employee_pf_details_employee_id_key UNIQUE (employee_id);
ALTER TABLE public.employee_pf_details ADD CONSTRAINT employee_pf_details_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_salary_structure_items ADD CONSTRAINT employee_salary_structure_items_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_salary_structures ADD CONSTRAINT employee_salary_structures_pkey PRIMARY KEY (id);
ALTER TABLE public.employee_tax_details ADD CONSTRAINT employee_tax_details_employee_id_key UNIQUE (employee_id);
ALTER TABLE public.employee_tax_details ADD CONSTRAINT employee_tax_details_pkey PRIMARY KEY (id);
ALTER TABLE public.employees ADD CONSTRAINT employees_pkey PRIMARY KEY (id);
ALTER TABLE public.employees ADD CONSTRAINT employees_tenant_company_id_employee_code_key UNIQUE (tenant_company_id, employee_code);
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_pkey PRIMARY KEY (id);
ALTER TABLE public.file_attachments ADD CONSTRAINT file_attachments_pkey PRIMARY KEY (id);
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_pkey PRIMARY KEY (id);
ALTER TABLE public.goods_received_note_items ADD CONSTRAINT goods_received_note_items_pkey PRIMARY KEY (id);
ALTER TABLE public.goods_received_notes ADD CONSTRAINT goods_received_notes_pkey PRIMARY KEY (id);
ALTER TABLE public.goods_received_notes ADD CONSTRAINT goods_received_notes_tenant_id_tenant_company_id_grn_no_key UNIQUE (tenant_id, tenant_company_id, grn_no);
ALTER TABLE public.holiday_calendar_days ADD CONSTRAINT holiday_calendar_days_holiday_calendar_id_holiday_date_key UNIQUE (holiday_calendar_id, holiday_date);
ALTER TABLE public.holiday_calendar_days ADD CONSTRAINT holiday_calendar_days_pkey PRIMARY KEY (id);
ALTER TABLE public.holiday_calendars ADD CONSTRAINT holiday_calendars_pkey PRIMARY KEY (id);
ALTER TABLE public.holiday_calendars ADD CONSTRAINT holiday_calendars_tenant_id_tenant_company_id_name_year_key UNIQUE (tenant_id, tenant_company_id, name, year);
ALTER TABLE public.hr_policy_sets ADD CONSTRAINT hr_policy_sets_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_tenant_company_id_idempotency_key UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.inventory_document_sequences ADD CONSTRAINT inventory_document_sequences_pkey PRIMARY KEY (tenant_company_id, document_type, document_year);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_tenant_company_id_sales_order_it_key UNIQUE (tenant_company_id, sales_order_item_id, inventory_item_id, location_id, lot_number);
ALTER TABLE public.inventory_item_aliases ADD CONSTRAINT inventory_item_aliases_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_item_match_feedback ADD CONSTRAINT inventory_item_match_feedback_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_tenant_company_id_item_code_key UNIQUE (tenant_company_id, item_code);
ALTER TABLE public.inventory_locations ADD CONSTRAINT inventory_locations_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_locations ADD CONSTRAINT inventory_locations_tenant_company_id_code_key UNIQUE (tenant_company_id, code);
ALTER TABLE public.inventory_reservation_actions ADD CONSTRAINT inventory_reservation_actions_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_reservation_actions ADD CONSTRAINT inventory_reservation_actions_tenant_company_id_idempotency_key UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_reservations ADD CONSTRAINT inventory_reservations_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_reservations ADD CONSTRAINT inventory_reservations_tenant_company_id_idempotency_key_key UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.inventory_stock_balances ADD CONSTRAINT inventory_stock_balances_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_stock_balances ADD CONSTRAINT inventory_stock_balances_tenant_company_id_item_id_location_key UNIQUE (tenant_company_id, item_id, location_id, lot_key);
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_tenant_company_id_idempotency_key_key UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_tenant_company_id_transaction_no_key UNIQUE (tenant_company_id, transaction_no);
ALTER TABLE public.issues ADD CONSTRAINT issues_pkey PRIMARY KEY (id);
ALTER TABLE public.issues ADD CONSTRAINT uq_issues_tenant_comp UNIQUE (tenant_company_id, id);
ALTER TABLE public.job_positions ADD CONSTRAINT job_positions_pkey PRIMARY KEY (id);
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (id);
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_unique_p0 UNIQUE (tenant_id, tenant_company_id, employee_id, leave_type_id, balance_period_start, balance_period_end);
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_pkey PRIMARY KEY (id);
ALTER TABLE public.leave_policy_rules ADD CONSTRAINT leave_policy_rules_pkey PRIMARY KEY (id);
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_pkey PRIMARY KEY (id);
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_unique_p0 UNIQUE (leave_request_id, leave_date);
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.leave_types ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);
ALTER TABLE public.leave_types ADD CONSTRAINT leave_types_tenant_id_tenant_company_id_name_key UNIQUE (tenant_id, tenant_company_id, name);
ALTER TABLE public.logs ADD CONSTRAINT logs_pkey PRIMARY KEY (id);
ALTER TABLE public.logs ADD CONSTRAINT uq_logs_tenant_comp UNIQUE (tenant_company_id, id);
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_pkey PRIMARY KEY (id);
ALTER TABLE public.master_boq_outputs ADD CONSTRAINT master_boq_outputs_master_boq_id_output_type_output_version_key UNIQUE (master_boq_id, output_type, output_version);
ALTER TABLE public.master_boq_outputs ADD CONSTRAINT master_boq_outputs_pkey PRIMARY KEY (id);
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_ai_corrections ADD CONSTRAINT mep_ai_corrections_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_attribute_definitions ADD CONSTRAINT mep_attribute_definitions_domain_code_category_id_code_key UNIQUE (domain_code, category_id, code);
ALTER TABLE public.mep_attribute_definitions ADD CONSTRAINT mep_attribute_definitions_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_document_examples ADD CONSTRAINT mep_document_examples_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_document_extractions ADD CONSTRAINT mep_document_extractions_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_domains ADD CONSTRAINT mep_domains_pkey PRIMARY KEY (code);
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_extraction_id_line_no_key UNIQUE (extraction_id, line_no);
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_hsn_tax_mappings ADD CONSTRAINT mep_hsn_tax_mappings_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_item_categories ADD CONSTRAINT mep_item_categories_domain_code_code_key UNIQUE (domain_code, code);
ALTER TABLE public.mep_item_categories ADD CONSTRAINT mep_item_categories_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_item_match_candidates ADD CONSTRAINT mep_item_match_candidates_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_item_matching_benchmark_cases ADD CONSTRAINT mep_item_matching_benchmark_cas_tenant_company_id_case_code_key UNIQUE (tenant_company_id, case_code);
ALTER TABLE public.mep_item_matching_benchmark_cases ADD CONSTRAINT mep_item_matching_benchmark_cases_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_item_matching_benchmark_runs ADD CONSTRAINT mep_item_matching_benchmark_runs_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_item_specifications ADD CONSTRAINT mep_item_specifications_inventory_item_id_attribute_definit_key UNIQUE (inventory_item_id, attribute_definition_id);
ALTER TABLE public.mep_item_specifications ADD CONSTRAINT mep_item_specifications_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_normalization_rules ADD CONSTRAINT mep_normalization_rules_domain_code_rule_code_key UNIQUE (domain_code, rule_code);
ALTER TABLE public.mep_normalization_rules ADD CONSTRAINT mep_normalization_rules_pkey PRIMARY KEY (id);
ALTER TABLE public.mep_units ADD CONSTRAINT mep_units_pkey PRIMARY KEY (code);
ALTER TABLE public.notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE public.overtime_policies ADD CONSTRAINT overtime_policies_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_account_mappings ADD CONSTRAINT payroll_account_mappings_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_account_mappings ADD CONSTRAINT payroll_account_mappings_tenant_id_tenant_company_id_mappin_key UNIQUE (tenant_id, tenant_company_id, mapping_key);
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_unique UNIQUE (tenant_company_id, profile_code);
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_unique UNIQUE (tenant_company_id, payroll_payment_batch_id, profile_id);
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_tenant_id_tenant_company_id_code_key UNIQUE (tenant_id, tenant_company_id, code);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_tenant_company_id_idempotency_key_key UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_tenant_company_id_payroll_run_id_key UNIQUE (tenant_company_id, payroll_run_id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_payment_batch_id_employee_id_key UNIQUE (payment_batch_id, employee_id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_tenant_company_id_payroll_run_item_id_key UNIQUE (tenant_company_id, payroll_run_item_id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliatio_tenant_company_id_bank_transa_key UNIQUE (tenant_company_id, bank_transaction_id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliatio_tenant_company_id_payroll_pay_key UNIQUE (tenant_company_id, payroll_payment_item_id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_tenant_company_id_payroll_run_item_id_key UNIQUE (tenant_company_id, payroll_run_item_id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_tenant_company_id_payslip_number_key UNIQUE (tenant_company_id, payslip_number);
ALTER TABLE public.payroll_periods ADD CONSTRAINT payroll_periods_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_periods ADD CONSTRAINT payroll_periods_tenant_id_tenant_company_id_period_code_key UNIQUE (tenant_id, tenant_company_id, period_code);
ALTER TABLE public.payroll_run_accounting ADD CONSTRAINT payroll_run_accounting_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_run_accounting ADD CONSTRAINT payroll_run_accounting_tenant_company_id_idempotency_key_key UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.payroll_run_accounting ADD CONSTRAINT payroll_run_accounting_tenant_id_tenant_company_id_payroll__key UNIQUE (tenant_id, tenant_company_id, payroll_run_id);
ALTER TABLE public.payroll_run_item_components ADD CONSTRAINT payroll_run_item_components_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_run_item_components ADD CONSTRAINT payroll_run_item_components_tenant_id_tenant_company_id_pay_key UNIQUE (tenant_id, tenant_company_id, payroll_run_item_id, payroll_component_id, sequence);
ALTER TABLE public.payroll_run_items ADD CONSTRAINT payroll_run_items_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_run_items ADD CONSTRAINT payroll_run_items_tenant_id_tenant_company_id_payroll_run_i_key UNIQUE (tenant_id, tenant_company_id, payroll_run_id, employee_id);
ALTER TABLE public.payroll_runs ADD CONSTRAINT payroll_runs_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_runs ADD CONSTRAINT payroll_runs_tenant_id_tenant_company_id_payroll_period_id_key UNIQUE (tenant_id, tenant_company_id, payroll_period_id);
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_tenant_id_tenant_company_id_key UNIQUE (tenant_id, tenant_company_id);
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_tenant_company_id_idempotency_key UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_tenant_company_id_payroll_per_key UNIQUE (tenant_company_id, payroll_period_id, statutory_type);
ALTER TABLE public.payroll_tax_certificates ADD CONSTRAINT payroll_tax_certificates_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_tax_certificates ADD CONSTRAINT payroll_tax_certificates_tenant_company_id_employee_id_tax__key UNIQUE (tenant_company_id, employee_id, tax_year);
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_tenant_id_tenant_company_id_employ_key UNIQUE (tenant_id, tenant_company_id, employee_id, tax_year, declaration_snapshot);
ALTER TABLE public.payroll_tax_previous_employers ADD CONSTRAINT payroll_tax_previous_employers_pkey PRIMARY KEY (id);
ALTER TABLE public.payroll_tds_tax_rules ADD CONSTRAINT payroll_tds_tax_rules_pkey PRIMARY KEY (id);
ALTER TABLE public.procurement_accounting_idempotency ADD CONSTRAINT procurement_accounting_idem_uq UNIQUE (tenant_company_id, idempotency_key);
ALTER TABLE public.procurement_accounting_idempotency ADD CONSTRAINT procurement_accounting_idempotency_pkey PRIMARY KEY (id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.proforma_invoice_items ADD CONSTRAINT proforma_invoice_items_pkey PRIMARY KEY (id);
ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_pkey PRIMARY KEY (id);
ALTER TABLE public.project_assignments ADD CONSTRAINT project_assignments_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_bill_items ADD CONSTRAINT purchase_bill_items_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_bills ADD CONSTRAINT purchase_bills_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_bills ADD CONSTRAINT purchase_bills_tenant_id_tenant_company_id_bill_no_key UNIQUE (tenant_id, tenant_company_id, bill_no);
ALTER TABLE public.purchase_document_sequences ADD CONSTRAINT purchase_document_sequences_pkey PRIMARY KEY (tenant_id, tenant_company_id, doc_type, fiscal_year);
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_tenant_id_tenant_company_id_po_no_key UNIQUE (tenant_id, tenant_company_id, po_no);
ALTER TABLE public.purchase_payments ADD CONSTRAINT purchase_payments_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_request_items ADD CONSTRAINT purchase_request_items_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_requests ADD CONSTRAINT purchase_requests_pkey PRIMARY KEY (id);
ALTER TABLE public.purchase_requests ADD CONSTRAINT purchase_requests_tenant_id_tenant_company_id_pr_no_key UNIQUE (tenant_id, tenant_company_id, pr_no);
ALTER TABLE public.recruitment_application_links ADD CONSTRAINT recruitment_application_links_pkey PRIMARY KEY (id);
ALTER TABLE public.recruitment_application_links ADD CONSTRAINT recruitment_application_links_token_hash_key UNIQUE (token_hash);
ALTER TABLE public.recruitment_candidates ADD CONSTRAINT recruitment_candidates_pkey PRIMARY KEY (id);
ALTER TABLE public.reminders ADD CONSTRAINT reminders_pkey PRIMARY KEY (id);
ALTER TABLE public.rfqs ADD CONSTRAINT rfqs_pkey PRIMARY KEY (id);
ALTER TABLE public.rfqs ADD CONSTRAINT rfqs_tenant_id_tenant_company_id_rfq_no_key UNIQUE (tenant_id, tenant_company_id, rfq_no);
ALTER TABLE public.sales_document_sequences ADD CONSTRAINT sales_document_sequences_pkey PRIMARY KEY (id);
ALTER TABLE public.sales_document_sequences ADD CONSTRAINT uq_sales_doc_seq UNIQUE (tenant_id, tenant_company_id, doc_type, fiscal_year);
ALTER TABLE public.sales_order_items ADD CONSTRAINT sales_order_items_pkey PRIMARY KEY (id);
ALTER TABLE public.sales_orders ADD CONSTRAINT sales_orders_pkey PRIMARY KEY (id);
ALTER TABLE public.sales_payments ADD CONSTRAINT sales_payments_pkey PRIMARY KEY (id);
ALTER TABLE public.sales_quotation_items ADD CONSTRAINT sales_quotation_items_pkey PRIMARY KEY (id);
ALTER TABLE public.sales_quotations ADD CONSTRAINT sales_quotations_pkey PRIMARY KEY (id);
ALTER TABLE public.stage_assignments ADD CONSTRAINT stage_assignments_pkey PRIMARY KEY (id);
ALTER TABLE public.stage_definitions ADD CONSTRAINT stage_definitions_pkey PRIMARY KEY (id);
ALTER TABLE public.task_assignees ADD CONSTRAINT task_assignees_pkey PRIMARY KEY (id);
ALTER TABLE public.tasks ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
ALTER TABLE public.tax_invoice_items ADD CONSTRAINT tax_invoice_items_pkey PRIMARY KEY (id);
ALTER TABLE public.tax_invoices ADD CONSTRAINT tax_invoices_pkey PRIMARY KEY (id);
ALTER TABLE public.tenant_companies ADD CONSTRAINT tenant_companies_pkey PRIMARY KEY (id);
ALTER TABLE public.tenant_companies ADD CONSTRAINT uq_tenant_companies_tenant_id_id UNIQUE (tenant_id, id);
ALTER TABLE public.tenant_memberships ADD CONSTRAINT tenant_memberships_pkey PRIMARY KEY (id);
ALTER TABLE public.tenant_memberships ADD CONSTRAINT uq_tenant_memberships_tenant_id_id UNIQUE (tenant_id, id);
ALTER TABLE public.tenant_memberships ADD CONSTRAINT uq_tenant_memberships_tenant_user UNIQUE (tenant_id, user_id);
ALTER TABLE public.tenants ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);
ALTER TABLE public.tenants ADD CONSTRAINT tenants_slug_key UNIQUE (slug);
ALTER TABLE public.units ADD CONSTRAINT units_pkey PRIMARY KEY (id);
ALTER TABLE public.units ADD CONSTRAINT uq_units_tenant_comp UNIQUE (tenant_company_id, id);
ALTER TABLE public.user_company_access ADD CONSTRAINT uq_user_company_access_membership_comp UNIQUE (membership_id, tenant_company_id);
ALTER TABLE public.user_company_access ADD CONSTRAINT user_company_access_pkey PRIMARY KEY (id);
ALTER TABLE public.vendor_quotation_items ADD CONSTRAINT vendor_quotation_items_pkey PRIMARY KEY (id);
ALTER TABLE public.vendor_quotations ADD CONSTRAINT vendor_quotations_pkey PRIMARY KEY (id);
ALTER TABLE public.vendors ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);
ALTER TABLE public.vendors ADD CONSTRAINT vendors_tenant_id_tenant_company_id_vendor_code_key UNIQUE (tenant_id, tenant_company_id, vendor_code);
ALTER TABLE public.weekly_off_policies ADD CONSTRAINT weekly_off_policies_pkey PRIMARY KEY (id);
ALTER TABLE public.work_locations ADD CONSTRAINT work_locations_pkey PRIMARY KEY (id);
ALTER TABLE public.work_locations ADD CONSTRAINT work_locations_tenant_id_tenant_company_id_name_key UNIQUE (tenant_id, tenant_company_id, name);
ALTER TABLE public.works ADD CONSTRAINT uq_works_tenant_comp UNIQUE (tenant_company_id, id);
ALTER TABLE public.works ADD CONSTRAINT works_pkey PRIMARY KEY (id);
-- OMITTED CONSTRAINT realtime.messages.messages_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT realtime.schema_migrations.schema_migrations_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT realtime.subscription.pk_subscription: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets_analytics.buckets_analytics_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets_vectors.buckets_vectors_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets.buckets_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.migrations.migrations_name_key: Supabase-managed schema
-- OMITTED CONSTRAINT storage.migrations.migrations_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.objects.objects_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.s3_multipart_uploads_parts.s3_multipart_uploads_parts_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.s3_multipart_uploads.s3_multipart_uploads_pkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.vector_indexes.vector_indexes_pkey: Supabase-managed schema
ALTER TABLE supabase_migrations.schema_migrations ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);
ALTER TABLE supabase_migrations.schema_migrations ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
-- OMITTED CONSTRAINT vault.secrets.secrets_pkey: Supabase-managed schema

-- ==========================================
-- SECTION 09: CHECK CONSTRAINTS
-- ==========================================
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_authorization_url_https: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_authorization_url_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_client_id_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_discovery_url_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_identifier_format: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_issuer_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_jwks_uri_https: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_jwks_uri_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_name_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_oauth2_requires_endpoints: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_oidc_discovery_url_https: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_oidc_issuer_https: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_oidc_requires_issuer: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_provider_type_check: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_token_url_https: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_token_url_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_userinfo_url_https: Supabase-managed schema
-- OMITTED CONSTRAINT auth.custom_oauth_providers.custom_oauth_providers_userinfo_url_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_recovery_code_sets.mfa_recovery_code_sets_failed_verification_count_check: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_authorization_code_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_code_challenge_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_expires_at_future: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_nonce_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_redirect_uri_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_resource_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_scope_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_state_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_clients.oauth_clients_client_name_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_clients.oauth_clients_client_uri_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_clients.oauth_clients_logo_uri_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_clients.oauth_clients_token_endpoint_auth_method_check: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_consents.oauth_consents_revoked_after_granted: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_consents.oauth_consents_scopes_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_consents.oauth_consents_scopes_not_empty: Supabase-managed schema
-- OMITTED CONSTRAINT auth.one_time_tokens.one_time_tokens_token_hash_check: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_providers.entity_id not empty: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_providers.metadata_url not empty: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_providers.metadata_xml not empty: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_relay_states.request_id not empty: Supabase-managed schema
-- OMITTED CONSTRAINT auth.scim_tokens.scim_tokens_expires_at_future: Supabase-managed schema
-- OMITTED CONSTRAINT auth.scim_tokens.scim_tokens_revoked_after_created: Supabase-managed schema
-- OMITTED CONSTRAINT auth.scim_tokens.scim_tokens_token_hash_check: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sessions.sessions_scopes_length: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sso_domains.domain not empty: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sso_providers.resource_id not empty: Supabase-managed schema
-- OMITTED CONSTRAINT auth.users.users_email_change_confirm_status_check: Supabase-managed schema
-- OMITTED CONSTRAINT auth.webauthn_challenges.webauthn_challenges_challenge_type_check: Supabase-managed schema
ALTER TABLE public.accounting_bank_accounts ADD CONSTRAINT accounting_bank_accounts_bank_type_check CHECK ((bank_type = ANY (ARRAY['bank'::text, 'cash'::text])));
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_amount_check CHECK ((amount > (0)::numeric));
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_reconciliation_status_check CHECK ((reconciliation_status = ANY (ARRAY['unreconciled'::text, 'reconciled'::text, 'ignored'::text])));
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['receipt'::text, 'payment'::text, 'transfer_in'::text, 'transfer_out'::text, 'bank_charge'::text, 'bank_interest'::text, 'other'::text])));
ALTER TABLE public.accounting_fiscal_periods ADD CONSTRAINT accounting_fiscal_periods_dates_chk CHECK ((period_end >= period_start));
ALTER TABLE public.accounting_fiscal_periods ADD CONSTRAINT accounting_fiscal_periods_status_check CHECK ((status = ANY (ARRAY['open'::text, 'closed'::text, 'locked'::text])));
ALTER TABLE public.accounting_journal_entries ADD CONSTRAINT accounting_journal_entries_status_check CHECK ((status = ANY (ARRAY['posted'::text, 'reversed'::text])));
ALTER TABLE public.accounting_journal_lines ADD CONSTRAINT accounting_journal_lines_amount_chk CHECK (((debit >= (0)::numeric) AND (credit >= (0)::numeric) AND (NOT ((debit > (0)::numeric) AND (credit > (0)::numeric))) AND ((debit > (0)::numeric) OR (credit > (0)::numeric))));
ALTER TABLE public.approval_request_actions ADD CONSTRAINT approval_request_actions_metadata_object_chk CHECK ((jsonb_typeof(metadata) = 'object'::text));
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_approver_target_chk CHECK (((assigned_user_id IS NOT NULL) OR (assigned_employee_id IS NOT NULL) OR (approver_role IS NOT NULL)));
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_order_chk CHECK ((step_order > 0));
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_status_chk CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'returned'::text, 'skipped'::text, 'cancelled'::text])));
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_payload_object_chk CHECK ((jsonb_typeof(payload) = 'object'::text));
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_priority_chk CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])));
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_snapshot_object_chk CHECK (((current_snapshot IS NULL) OR (jsonb_typeof(current_snapshot) = 'object'::text)));
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_status_chk CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'pending_approval'::text, 'approved'::text, 'rejected'::text, 'returned'::text, 'cancelled'::text, 'applied'::text, 'failed'::text])));
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_authentication_method_check CHECK ((authentication_method = ANY (ARRAY['face'::text, 'face_liveness'::text, 'other'::text])));
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_authentication_result_check CHECK ((authentication_result = ANY (ARRAY['success'::text, 'failed'::text, 'rejected'::text])));
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_face_match_result_check CHECK ((face_match_result = ANY (ARRAY['match'::text, 'mismatch'::text, 'not_checked'::text])));
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_identifier_type_check CHECK ((identifier_type = ANY (ARRAY['mobile'::text, 'employee_code'::text, 'login_user'::text])));
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_liveness_result_check CHECK ((liveness_result = ANY (ARRAY['passed'::text, 'failed'::text, 'not_checked'::text])));
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_metadata_check CHECK ((jsonb_typeof(metadata) = 'object'::text));
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_early_departure_minutes_check CHECK ((early_departure_minutes >= 0));
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_effective_work_minutes_check CHECK ((effective_work_minutes >= 0));
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_late_minutes_check CHECK ((late_minutes >= 0));
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_policy_snapshot_check CHECK ((jsonb_typeof(policy_snapshot) = 'object'::text));
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_status_check CHECK ((status = ANY (ARRAY['present'::text, 'absent'::text, 'half_day'::text, 'weekly_off'::text, 'holiday'::text, 'leave'::text, 'comp_off'::text, 'on_duty'::text, 'not_applicable'::text, 'pending_correction'::text])));
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_worked_minutes_check CHECK ((worked_minutes >= 0));
ALTER TABLE public.attendance_devices ADD CONSTRAINT attendance_devices_device_type_check CHECK ((device_type = ANY (ARRAY['mobile'::text, 'tablet'::text, 'biometric'::text])));
ALTER TABLE public.attendance_devices ADD CONSTRAINT attendance_devices_latitude_check CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))));
ALTER TABLE public.attendance_devices ADD CONSTRAINT attendance_devices_location_radius_check CHECK (((location_radius_meters IS NULL) OR (location_radius_meters > (0)::numeric)));
ALTER TABLE public.attendance_devices ADD CONSTRAINT attendance_devices_longitude_check CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))));
ALTER TABLE public.attendance_devices ADD CONSTRAINT attendance_devices_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text, 'retired'::text])));
ALTER TABLE public.attendance_employee_shifts ADD CONSTRAINT attendance_employee_shifts_dates_check CHECK (((effective_to IS NULL) OR (effective_to >= effective_from)));
ALTER TABLE public.attendance_employee_shifts ADD CONSTRAINT attendance_employee_shifts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'ended'::text])));
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_event_source_check CHECK ((event_source = ANY (ARRAY['mobile'::text, 'tablet'::text, 'biometric'::text, 'manual'::text])));
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_event_type_check CHECK ((event_type = ANY (ARRAY['check_in'::text, 'check_out'::text])));
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_latitude_check CHECK (((latitude IS NULL) OR ((latitude >= ('-90'::integer)::numeric) AND (latitude <= (90)::numeric))));
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_location_accuracy_check CHECK (((location_accuracy_meters IS NULL) OR (location_accuracy_meters >= (0)::numeric)));
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_longitude_check CHECK (((longitude IS NULL) OR ((longitude >= ('-180'::integer)::numeric) AND (longitude <= (180)::numeric))));
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_metadata_check CHECK ((jsonb_typeof(metadata) = 'object'::text));
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_verification_status_check CHECK ((verification_status = ANY (ARRAY['verified'::text, 'unverified'::text, 'rejected'::text, 'pending_review'::text])));
ALTER TABLE public.attendance_face_profiles ADD CONSTRAINT attendance_face_profiles_enrollment_status_check CHECK ((enrollment_status = ANY (ARRAY['pending'::text, 'active'::text, 'suspended'::text, 'revoked'::text])));
ALTER TABLE public.attendance_shifts ADD CONSTRAINT attendance_shifts_grace_minutes_check CHECK ((grace_minutes >= 0));
ALTER TABLE public.attendance_shifts ADD CONSTRAINT attendance_shifts_minimum_work_hours_check CHECK (((minimum_work_hours IS NULL) OR (minimum_work_hours >= (0)::numeric)));
ALTER TABLE public.attendance_shifts ADD CONSTRAINT attendance_shifts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_communication_rating_check CHECK (((communication_rating >= (0)::numeric) AND (communication_rating <= (10)::numeric)));
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_experience_rating_check CHECK (((experience_rating >= (0)::numeric) AND (experience_rating <= (10)::numeric)));
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_overall_rating_check CHECK (((overall_rating >= (0)::numeric) AND (overall_rating <= (10)::numeric)));
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_recommendation_check CHECK ((recommendation = ANY (ARRAY['strong_yes'::text, 'yes'::text, 'hold'::text, 'no'::text, 'strong_no'::text])));
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'completed'::text, 'cancelled'::text])));
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_technical_rating_check CHECK (((technical_rating >= (0)::numeric) AND (technical_rating <= (10)::numeric)));
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_method_check CHECK ((method = ANY (ARRAY['manual'::text, 'onboarding_link'::text])));
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_status_check CHECK ((status = ANY (ARRAY['selected'::text, 'onboarding_pending'::text, 'in_progress'::text, 'submitted'::text, 'hr_verification'::text, 'approved'::text, 'employee_active'::text, 'cancelled'::text])));
ALTER TABLE public.chart_of_accounts ADD CONSTRAINT chart_of_accounts_account_type_check CHECK ((account_type = ANY (ARRAY['asset'::text, 'liability'::text, 'equity'::text, 'revenue'::text, 'expense'::text])));
ALTER TABLE public.company_documents ADD CONSTRAINT company_documents_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'expired'::text])));
ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_financial_year_start_month_check CHECK (((financial_year_start_month >= 1) AND (financial_year_start_month <= 12)));
ALTER TABLE public.company_registrations ADD CONSTRAINT company_registrations_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'expired'::text, 'pending'::text])));
ALTER TABLE public.crm_customer_profiles ADD CONSTRAINT crm_customer_profiles_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'archived'::text])));
ALTER TABLE public.departments ADD CONSTRAINT departments_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.designations ADD CONSTRAINT designations_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.employee_bank_accounts ADD CONSTRAINT employee_bank_accounts_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text])));
ALTER TABLE public.employee_company_assignments ADD CONSTRAINT employee_company_assignments_status_check CHECK ((status = ANY (ARRAY['active'::text, 'ended'::text])));
ALTER TABLE public.employee_dependents ADD CONSTRAINT employee_dependents_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.employee_documents ADD CONSTRAINT employee_documents_verification_status_check CHECK ((verification_status = ANY (ARRAY['pending'::text, 'verified'::text, 'rejected'::text, 'expired'::text])));
ALTER TABLE public.employee_field_definitions ADD CONSTRAINT employee_field_definitions_field_type_check CHECK ((field_type = ANY (ARRAY['text'::text, 'number'::text, 'date'::text, 'boolean'::text, 'select'::text, 'multiline'::text, 'file'::text])));
ALTER TABLE public.employee_field_values ADD CONSTRAINT employee_field_values_verification_status_check CHECK ((verification_status = ANY (ARRAY['unverified'::text, 'pending'::text, 'verified'::text, 'rejected'::text])));
ALTER TABLE public.employee_nominees ADD CONSTRAINT employee_nominees_nomination_category_check CHECK ((nomination_category = ANY (ARRAY['pf'::text, 'gratuity'::text, 'insurance'::text, 'other'::text])));
ALTER TABLE public.employee_nominees ADD CONSTRAINT employee_nominees_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.employee_salary_structure_items ADD CONSTRAINT employee_salary_structure_items_calculation_method_check CHECK ((calculation_method = ANY (ARRAY['fixed'::text, 'percentage'::text, 'formula'::text])));
ALTER TABLE public.employee_salary_structure_items ADD CONSTRAINT employee_salary_structure_items_check CHECK (((effective_to IS NULL) OR (effective_from IS NULL) OR (effective_to >= effective_from)));
ALTER TABLE public.employee_salary_structure_items ADD CONSTRAINT employee_salary_structure_items_formula_config_check CHECK ((jsonb_typeof(formula_config) = 'object'::text));
ALTER TABLE public.employee_salary_structures ADD CONSTRAINT employee_salary_structures_calculation_snapshot_check CHECK ((jsonb_typeof(calculation_snapshot) = 'object'::text));
ALTER TABLE public.employee_salary_structures ADD CONSTRAINT employee_salary_structures_check CHECK (((effective_to IS NULL) OR (effective_to >= effective_from)));
ALTER TABLE public.employee_salary_structures ADD CONSTRAINT employee_salary_structures_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'ended'::text])));
ALTER TABLE public.employees ADD CONSTRAINT employees_employment_status_check CHECK ((employment_status = ANY (ARRAY['active'::text, 'probation'::text, 'notice_period'::text, 'resigned'::text, 'terminated'::text, 'retired'::text, 'inactive'::text])));
ALTER TABLE public.employees ADD CONSTRAINT employees_employment_type_check CHECK ((employment_type = ANY (ARRAY['permanent'::text, 'contract'::text, 'temporary'::text, 'consultant'::text, 'apprentice'::text, 'intern'::text])));
ALTER TABLE public.file_attachments ADD CONSTRAINT file_attachments_entity_type_ck CHECK (((length(TRIM(BOTH FROM entity_type)) >= 1) AND (length(TRIM(BOTH FROM entity_type)) <= 80)));
ALTER TABLE public.file_attachments ADD CONSTRAINT file_attachments_field_key_ck CHECK (((length(TRIM(BOTH FROM field_key)) >= 1) AND (length(TRIM(BOTH FROM field_key)) <= 80)));
ALTER TABLE public.file_attachments ADD CONSTRAINT file_attachments_size_ck CHECK (((file_size_bytes > 0) AND (file_size_bytes <= 157286400)));
ALTER TABLE public.file_attachments ADD CONSTRAINT file_attachments_storage_provider_ck CHECK ((storage_provider = 'r2'::text));
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_physical_quantity_check CHECK ((physical_quantity >= (0)::numeric));
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text])));
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_system_quantity_check CHECK ((system_quantity >= (0)::numeric));
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_unit_cost_check CHECK ((unit_cost >= (0)::numeric));
ALTER TABLE public.inventory_document_sequences ADD CONSTRAINT inventory_document_sequences_next_number_check CHECK ((next_number > 0));
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_issued_quantity_check CHECK ((issued_quantity >= (0)::numeric));
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_ordered_quantity_check CHECK ((ordered_quantity > (0)::numeric));
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_reserved_quantity_check CHECK ((reserved_quantity >= (0)::numeric));
ALTER TABLE public.inventory_item_aliases ADD CONSTRAINT inventory_item_aliases_alias_text_ck CHECK ((length(TRIM(BOTH FROM alias_text)) > 0));
ALTER TABLE public.inventory_item_aliases ADD CONSTRAINT inventory_item_aliases_alias_type_ck CHECK ((alias_type = ANY (ARRAY['description'::text, 'abbreviation'::text, 'vendor_description'::text, 'customer_description'::text, 'external_code'::text, 'legacy_code'::text])));
ALTER TABLE public.inventory_item_aliases ADD CONSTRAINT inventory_item_aliases_confidence_ck CHECK (((confidence_score IS NULL) OR ((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric))));
ALTER TABLE public.inventory_item_aliases ADD CONSTRAINT inventory_item_aliases_normalized_ck CHECK ((length(TRIM(BOTH FROM normalized_alias)) > 0));
ALTER TABLE public.inventory_item_match_feedback ADD CONSTRAINT inventory_item_match_feedback_confidence_ck CHECK (((confidence_score IS NULL) OR ((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric))));
ALTER TABLE public.inventory_item_match_feedback ADD CONSTRAINT inventory_item_match_feedback_decision_ck CHECK ((decision = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'corrected'::text])));
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_item_type_check CHECK ((item_type = ANY (ARRAY['stock'::text, 'service'::text, 'asset'::text, 'consumable'::text])));
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_reorder_level_check CHECK ((reorder_level >= (0)::numeric));
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_reorder_quantity_check CHECK ((reorder_quantity >= (0)::numeric));
ALTER TABLE public.inventory_locations ADD CONSTRAINT inventory_locations_location_type_check CHECK ((location_type = ANY (ARRAY['warehouse'::text, 'store'::text, 'site'::text, 'virtual'::text])));
ALTER TABLE public.inventory_reservation_actions ADD CONSTRAINT inventory_reservation_actions_action_type_check CHECK ((action_type = ANY (ARRAY['release'::text, 'cancel'::text])));
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_check CHECK ((released_quantity <= reserved_quantity));
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_issue_bounds_check CHECK ((issued_quantity <= (reserved_quantity - released_quantity)));
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_issued_quantity_check CHECK ((issued_quantity >= (0)::numeric));
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_released_quantity_check CHECK ((released_quantity >= (0)::numeric));
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_requested_quantity_check CHECK ((requested_quantity > (0)::numeric));
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_reserved_quantity_check CHECK ((reserved_quantity > (0)::numeric));
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_status_check CHECK ((status = ANY (ARRAY['active'::text, 'partially_released'::text, 'released'::text, 'fulfilled'::text])));
ALTER TABLE public.inventory_reservations ADD CONSTRAINT inventory_reservations_status_check CHECK ((status = ANY (ARRAY['active'::text, 'partially_released'::text, 'released'::text, 'cancelled'::text, 'fulfilled'::text])));
ALTER TABLE public.inventory_stock_balances ADD CONSTRAINT inventory_stock_balances_average_unit_cost_check CHECK ((average_unit_cost >= (0)::numeric));
ALTER TABLE public.inventory_stock_balances ADD CONSTRAINT inventory_stock_balances_quantity_on_hand_check CHECK ((quantity_on_hand >= (0)::numeric));
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_line_value_check CHECK ((line_value >= (0)::numeric));
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_quantity_check CHECK ((quantity > (0)::numeric));
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_unit_cost_check CHECK ((unit_cost >= (0)::numeric));
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_status_check CHECK ((status = 'posted'::text));
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['opening'::text, 'receipt'::text, 'issue'::text, 'transfer'::text, 'adjustment_in'::text, 'adjustment_out'::text, 'return_in'::text, 'return_out'::text, 'consumption'::text])));
ALTER TABLE public.job_positions ADD CONSTRAINT job_positions_openings_check CHECK ((openings > 0));
ALTER TABLE public.job_positions ADD CONSTRAINT job_positions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'open'::text, 'on_hold'::text, 'closed'::text, 'cancelled'::text])));
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_calculation_snapshot_check CHECK ((jsonb_typeof(calculation_snapshot) = 'object'::text));
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_period_p0 CHECK ((balance_period_end >= balance_period_start));
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_metadata_check CHECK ((jsonb_typeof(metadata) = 'object'::text));
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_quantity_check CHECK ((quantity <> (0)::numeric));
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['opening'::text, 'accrual'::text, 'credit'::text, 'leave_used'::text, 'leave_reversal'::text, 'adjustment'::text, 'encashment'::text, 'expiry'::text, 'carry_forward'::text])));
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_approved_days_check CHECK ((approved_days >= (0)::numeric));
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_calculation_snapshot_check CHECK ((jsonb_typeof(calculation_snapshot) = 'object'::text));
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_day_type_check CHECK ((day_type = ANY (ARRAY['working_day'::text, 'weekly_off'::text, 'holiday'::text, 'leave'::text, 'half_day'::text, 'non_working'::text])));
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_requested_days_check CHECK ((requested_days >= (0)::numeric));
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_date_range_p0 CHECK ((to_date >= from_date));
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_half_day_type_p0 CHECK ((((half_day = true) AND (half_day_type = ANY (ARRAY['first_half'::text, 'second_half'::text]))) OR ((half_day = false) AND (half_day_type IS NULL))));
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'pending_approval'::text, 'approved'::text, 'rejected'::text, 'returned'::text, 'cancelled'::text, 'applied'::text, 'failed'::text])));
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_total_days_check CHECK ((total_days >= (0)::numeric));
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_confidence_check CHECK (((match_confidence IS NULL) OR ((match_confidence >= (0)::numeric) AND (match_confidence <= (1)::numeric))));
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_line_positive CHECK ((line_no > 0));
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_line_type_check CHECK ((line_type = ANY (ARRAY['SECTION'::text, 'ITEM'::text, 'NOTE'::text])));
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_match_status_check CHECK ((match_status = ANY (ARRAY['unmatched'::text, 'candidate'::text, 'matched'::text, 'verified'::text, 'rejected'::text])));
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_procurement_scope_check CHECK ((procurement_scope = ANY (ARRAY['SUPPLY'::text, 'INSTALLATION'::text, 'BOTH'::text])));
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_quantity_nonnegative CHECK ((quantity >= (0)::numeric));
ALTER TABLE public.master_boq_outputs ADD CONSTRAINT master_boq_outputs_output_type_check CHECK ((output_type = ANY (ARRAY['PO'::text, 'WO'::text, 'COMBINED'::text])));
ALTER TABLE public.master_boq_outputs ADD CONSTRAINT master_boq_outputs_status_check CHECK ((status = ANY (ARRAY['DRAFT'::text, 'GENERATED'::text, 'ISSUED'::text, 'CANCELLED'::text])));
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_commercial_mode_check CHECK ((commercial_mode = ANY (ARRAY['SPLIT'::text, 'COMBINED'::text])));
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_company_match_check CHECK (((tenant_id IS NOT NULL) AND (tenant_company_id IS NOT NULL)));
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_source_document_kind_check CHECK ((source_document_kind = ANY (ARRAY['PO'::text, 'WO'::text, 'COMBINED'::text, 'BOQ'::text, 'OTHER'::text])));
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'review'::text, 'approved'::text, 'archived'::text])));
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_version_positive CHECK ((version > 0));
ALTER TABLE public.mep_attribute_definitions ADD CONSTRAINT mep_attribute_definitions_data_type_check CHECK ((data_type = ANY (ARRAY['text'::text, 'number'::text, 'boolean'::text, 'enum'::text, 'dimension'::text])));
ALTER TABLE public.mep_document_examples ADD CONSTRAINT mep_document_examples_document_type_check CHECK ((document_type = ANY (ARRAY['boq'::text, 'purchase_order'::text, 'work_order'::text, 'vendor_quotation'::text, 'purchase_bill'::text, 'sales_quotation'::text, 'invoice'::text, 'dbr'::text, 'datasheet'::text, 'other'::text])));
ALTER TABLE public.mep_document_examples ADD CONSTRAINT mep_document_examples_ingestion_status_check CHECK ((ingestion_status = ANY (ARRAY['pending'::text, 'processing'::text, 'extracted'::text, 'reviewed'::text, 'failed'::text, 'archived'::text])));
ALTER TABLE public.mep_document_extractions ADD CONSTRAINT mep_document_extractions_extraction_type_check CHECK ((extraction_type = ANY (ARRAY['text'::text, 'document_structure'::text, 'line_items'::text, 'specifications'::text, 'metadata'::text, 'classification'::text])));
ALTER TABLE public.mep_document_extractions ADD CONSTRAINT mep_document_extractions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text, 'reviewed'::text])));
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_item_type_check CHECK ((item_type = ANY (ARRAY['stock'::text, 'service'::text, 'composite'::text, 'unknown'::text])));
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_line_type_check CHECK ((line_type = ANY (ARRAY['SECTION'::text, 'ITEM'::text, 'NOTE'::text])));
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_procurement_scope_check CHECK ((procurement_scope = ANY (ARRAY['SUPPLY'::text, 'INSTALLATION'::text, 'BOTH'::text])));
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_review_status_check CHECK ((review_status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'corrected'::text])));
ALTER TABLE public.mep_item_match_candidates ADD CONSTRAINT mep_item_match_candidates_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text, 'superseded'::text])));
ALTER TABLE public.mep_item_matching_benchmark_cases ADD CONSTRAINT mep_item_matching_benchmark_cases_expected_decision_check CHECK ((expected_decision = ANY (ARRAY['match'::text, 'no_match'::text, 'review'::text])));
ALTER TABLE public.mep_normalization_rules ADD CONSTRAINT mep_normalization_rules_rule_type_check CHECK ((rule_type = ANY (ARRAY['synonym'::text, 'abbreviation'::text, 'unit'::text, 'token'::text, 'pattern'::text, 'format'::text])));
ALTER TABLE public.payroll_account_mappings ADD CONSTRAINT payroll_account_mappings_mapping_key_check CHECK ((mapping_key = ANY (ARRAY['salary_expense'::text, 'employer_contribution_expense'::text, 'salary_payable'::text, 'pf_payable'::text, 'esi_payable'::text, 'pt_payable'::text, 'tds_payable'::text, 'other_deductions_payable'::text])));
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_delimiter_check CHECK ((length(delimiter) = 1));
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_ext_check CHECK ((file_extension ~ '^[A-Za-z0-9]{1,10}$'::text));
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_format_check CHECK ((format_code = 'CSV_SALARY_V1'::text));
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_payment_mode_check CHECK ((payment_mode = ANY (ARRAY['NEFT'::text, 'RTGS'::text, 'IMPS'::text, 'BANK_DEFINED'::text])));
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_row_count_check CHECK ((row_count >= 0));
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_status_check CHECK ((status = ANY (ARRAY['generated'::text, 'submitted'::text, 'accepted'::text, 'rejected'::text, 'cancelled'::text])));
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_total_check CHECK ((total_amount >= (0)::numeric));
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_calculation_method_check CHECK ((calculation_method = ANY (ARRAY['fixed'::text, 'percentage'::text, 'formula'::text])));
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_check CHECK (((effective_to IS NULL) OR (effective_from IS NULL) OR (effective_to >= effective_from)));
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_component_type_check CHECK ((component_type = ANY (ARRAY['earning'::text, 'deduction'::text, 'employer_contribution'::text])));
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_formula_config_check CHECK ((jsonb_typeof(formula_config) = 'object'::text));
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_payment_method_check CHECK ((payment_method = 'bank_transfer'::text));
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'pending_approval'::text, 'approved'::text, 'processing'::text, 'paid'::text, 'failed'::text, 'cancelled'::text])));
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_total_amount_check CHECK ((total_amount >= (0)::numeric));
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_total_employees_check CHECK ((total_employees >= 0));
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_amount_check CHECK ((amount >= (0)::numeric));
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_payment_status_check CHECK ((payment_status = ANY (ARRAY['pending'::text, 'processing'::text, 'paid'::text, 'failed'::text, 'cancelled'::text])));
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_match_method_check CHECK ((match_method = ANY (ARRAY['manual'::text, 'reference'::text, 'amount_date'::text, 'batch'::text])));
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_matched_amount_check CHECK ((matched_amount >= (0)::numeric));
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_status_check CHECK ((status = ANY (ARRAY['matched'::text, 'partial'::text, 'failed'::text, 'exception'::text])));
ALTER TABLE public.payroll_periods ADD CONSTRAINT payroll_periods_check CHECK ((period_end >= period_start));
ALTER TABLE public.payroll_periods ADD CONSTRAINT payroll_periods_status_check CHECK ((status = ANY (ARRAY['open'::text, 'processing'::text, 'calculated'::text, 'under_review'::text, 'approved'::text, 'posted'::text, 'paid'::text, 'closed'::text])));
ALTER TABLE public.payroll_run_item_components ADD CONSTRAINT payroll_run_item_components_basis_check CHECK ((jsonb_typeof(basis) = 'object'::text));
ALTER TABLE public.payroll_run_items ADD CONSTRAINT payroll_run_items_calculation_snapshot_check CHECK ((jsonb_typeof(calculation_snapshot) = 'object'::text));
ALTER TABLE public.payroll_runs ADD CONSTRAINT payroll_runs_calculation_snapshot_check CHECK ((jsonb_typeof(calculation_snapshot) = 'object'::text));
ALTER TABLE public.payroll_runs ADD CONSTRAINT payroll_runs_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'calculating'::text, 'calculated'::text, 'under_review'::text, 'approved'::text, 'posted'::text, 'paid'::text, 'failed'::text, 'cancelled'::text])));
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_default_tax_regime_check CHECK ((default_tax_regime = ANY (ARRAY['old'::text, 'new'::text])));
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_pay_day_check CHECK (((pay_day >= 1) AND (pay_day <= 31)));
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_payroll_cutoff_day_check CHECK (((payroll_cutoff_day >= 1) AND (payroll_cutoff_day <= 31)));
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_payroll_frequency_check CHECK ((payroll_frequency = ANY (ARRAY['monthly'::text, 'biweekly'::text, 'weekly'::text, 'custom'::text])));
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_rounding_mode_check CHECK ((rounding_mode = ANY (ARRAY['nearest'::text, 'up'::text, 'down'::text, 'none'::text])));
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_salary_proration_method_check CHECK ((salary_proration_method = ANY (ARRAY['none'::text, 'calendar_days'::text, 'working_days'::text])));
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_applicability_mode_check CHECK ((applicability_mode = ANY (ARRAY['configured'::text, 'automatic'::text, 'manual'::text])));
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_check CHECK (((effective_to IS NULL) OR (effective_to >= effective_from)));
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_check1 CHECK ((((jurisdiction_type = 'state'::text) AND (state_code IS NOT NULL)) OR (jurisdiction_type = 'india'::text)));
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_jurisdiction_type_check CHECK ((jurisdiction_type = ANY (ARRAY['india'::text, 'state'::text])));
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_rule_config_check CHECK ((jsonb_typeof(rule_config) = 'object'::text));
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_rule_type_check CHECK ((rule_type = ANY (ARRAY['PF'::text, 'ESI'::text, 'PT'::text, 'TDS'::text])));
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_slab_config_check CHECK ((jsonb_typeof(slab_config) = 'array'::text));
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_employee_count_check CHECK ((employee_count >= 0));
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'exported'::text, 'paid'::text, 'failed'::text, 'cancelled'::text])));
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_statutory_type_check CHECK ((statutory_type = ANY (ARRAY['PF'::text, 'ESI'::text, 'PT'::text, 'TDS'::text])));
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_total_amount_check CHECK ((total_amount >= (0)::numeric));
ALTER TABLE public.payroll_tax_certificates ADD CONSTRAINT payroll_tax_certificates_status_check CHECK ((status = ANY (ARRAY['prepared'::text, 'reviewed'::text, 'issued'::text, 'cancelled'::text])));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_check CHECK (((projected_annual_salary >= (0)::numeric) AND (previous_employer_income >= (0)::numeric) AND (previous_employer_tds >= (0)::numeric) AND (other_income >= (0)::numeric) AND (home_loan_interest >= (0)::numeric)));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_declaration_snapshot_check CHECK ((jsonb_typeof(declaration_snapshot) = 'object'::text));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_declaration_status_check CHECK ((declaration_status = ANY (ARRAY['draft'::text, 'submitted'::text, 'under_review'::text, 'approved'::text, 'rejected'::text, 'superseded'::text])));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_deduction_data_check CHECK ((jsonb_typeof(deduction_data) = 'object'::text));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_evidence_data_check CHECK ((jsonb_typeof(evidence_data) = 'object'::text));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_exemption_data_check CHECK ((jsonb_typeof(exemption_data) = 'object'::text));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_hra_data_check CHECK ((jsonb_typeof(hra_data) = 'object'::text));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_residency_status_check CHECK ((residency_status = ANY (ARRAY['resident'::text, 'non_resident'::text, 'resident_not_ordinary'::text])));
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_tax_regime_check CHECK ((tax_regime = ANY (ARRAY['old'::text, 'new'::text])));
ALTER TABLE public.payroll_tax_previous_employers ADD CONSTRAINT payroll_tax_previous_employers_check CHECK (((salary_income >= (0)::numeric) AND (tds_deducted >= (0)::numeric) AND (other_taxable_income >= (0)::numeric)));
ALTER TABLE public.payroll_tax_previous_employers ADD CONSTRAINT payroll_tax_previous_employers_evidence_status_check CHECK ((evidence_status = ANY (ARRAY['declared'::text, 'submitted'::text, 'verified'::text, 'rejected'::text])));
ALTER TABLE public.payroll_tds_tax_rules ADD CONSTRAINT payroll_tds_tax_rules_effective_chk CHECK (((effective_to IS NULL) OR (effective_to >= effective_from)));
ALTER TABLE public.payroll_tds_tax_rules ADD CONSTRAINT payroll_tds_tax_rules_regime_chk CHECK (((tax_regime IS NULL) OR (tax_regime = ANY (ARRAY['new'::text, 'old'::text]))));
ALTER TABLE public.payroll_tds_tax_rules ADD CONSTRAINT payroll_tds_tax_rules_type_chk CHECK ((rule_type = ANY (ARRAY['slab'::text, 'standard_deduction'::text, 'rebate'::text, 'surcharge'::text, 'cess'::text, 'deduction_limit'::text, 'exemption_limit'::text, 'calculation'::text])));
ALTER TABLE public.project_assignments ADD CONSTRAINT chk_project_assignments_ended_at CHECK ((((status = 'active'::text) AND (ended_at IS NULL)) OR ((status = 'ended'::text) AND (ended_at IS NOT NULL))));
ALTER TABLE public.project_assignments ADD CONSTRAINT project_assignments_project_role_check CHECK ((project_role = ANY (ARRAY['lead'::text, 'member'::text, 'reviewer'::text])));
ALTER TABLE public.project_assignments ADD CONSTRAINT project_assignments_status_check CHECK ((status = ANY (ARRAY['active'::text, 'ended'::text])));
ALTER TABLE public.recruitment_application_links ADD CONSTRAINT recruitment_application_links_status_check CHECK ((status = ANY (ARRAY['active'::text, 'expired'::text, 'disabled'::text])));
ALTER TABLE public.recruitment_application_links ADD CONSTRAINT recruitment_application_links_submission_count_check CHECK ((submission_count >= 0));
ALTER TABLE public.recruitment_candidates ADD CONSTRAINT recruitment_candidates_status_check CHECK ((status = ANY (ARRAY['applied'::text, 'shortlisted'::text, 'interview_scheduled'::text, 'interviewed'::text, 'selected'::text, 'rejected'::text, 'on_hold'::text, 'withdrawn'::text])));
ALTER TABLE public.sales_document_sequences ADD CONSTRAINT sales_doc_seq_value_nonnegative CHECK ((current_val >= 0));
ALTER TABLE public.sales_payments ADD CONSTRAINT sales_payments_amount_positive CHECK ((amount > (0)::numeric));
ALTER TABLE public.stage_assignments ADD CONSTRAINT chk_stage_assignments_ended CHECK ((((status = 'active'::text) AND (ended_at IS NULL) AND (ended_by IS NULL)) OR ((status = 'ended'::text) AND (ended_at IS NOT NULL) AND (ended_by IS NOT NULL))));
ALTER TABLE public.stage_assignments ADD CONSTRAINT chk_stage_assignments_role CHECK ((stage_role = ANY (ARRAY['lead'::text, 'responsible'::text, 'contributor'::text, 'reviewer'::text])));
ALTER TABLE public.stage_assignments ADD CONSTRAINT chk_stage_assignments_status CHECK ((status = ANY (ARRAY['active'::text, 'ended'::text])));
ALTER TABLE public.stage_definitions ADD CONSTRAINT chk_stage_definitions_order CHECK ((display_order > 0));
ALTER TABLE public.stage_definitions ADD CONSTRAINT chk_stage_definitions_status CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])));
ALTER TABLE public.task_assignees ADD CONSTRAINT task_assignees_role_check CHECK ((role = ANY (ARRAY['accountable'::text, 'assignee'::text, 'reviewer'::text])));
ALTER TABLE public.task_assignees ADD CONSTRAINT task_assignees_status_check CHECK ((status = ANY (ARRAY['active'::text, 'ended'::text])));
ALTER TABLE public.task_assignees ADD CONSTRAINT task_assignees_status_dates_check CHECK ((((status = 'active'::text) AND (ended_at IS NULL)) OR ((status = 'ended'::text) AND (ended_at IS NOT NULL))));
ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])));
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK ((status = ANY (ARRAY['not_started'::text, 'in_progress'::text, 'blocked'::text, 'completed'::text, 'cancelled'::text])));
ALTER TABLE public.tenant_memberships ADD CONSTRAINT tenant_memberships_role_check CHECK ((role = ANY (ARRAY['OWNER'::text, 'ADMIN'::text, 'MANAGER'::text, 'TEAM'::text, 'VIEWER'::text])));
-- OMITTED CONSTRAINT realtime.messages.messages_payload_exclusive: Supabase-managed schema
-- OMITTED CONSTRAINT realtime.subscription.subscription_action_filter_check: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets.buckets_lifecycle_configuration_pair_check: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets.buckets_lifecycle_configuration_shape_check: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets.buckets_lifecycle_configuration_standard_only_check: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets.buckets_versioning_dark_check: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets.buckets_versioning_standard_only_check: Supabase-managed schema
-- OMITTED CONSTRAINT storage.buckets.buckets_versioning_status_check: Supabase-managed schema

-- ==========================================
-- SECTION 10: FOREIGN KEYS
-- ==========================================
-- OMITTED CONSTRAINT auth.identities.identities_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_amr_claims.mfa_amr_claims_session_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_challenges.mfa_challenges_auth_factor_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_factors.mfa_factors_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_recovery_code_sets.mfa_recovery_code_sets_mfa_factor_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_recovery_code_sets.mfa_recovery_code_sets_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.mfa_recovery_codes.mfa_recovery_codes_mfa_recovery_code_set_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_client_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_authorizations.oauth_authorizations_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_consents.oauth_consents_client_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.oauth_consents.oauth_consents_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.one_time_tokens.one_time_tokens_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.refresh_tokens.refresh_tokens_session_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_providers.saml_providers_sso_provider_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_relay_states.saml_relay_states_flow_state_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.saml_relay_states.saml_relay_states_sso_provider_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.scim_tokens.scim_tokens_sso_provider_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.scim_users.scim_users_sso_provider_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.scim_users.scim_users_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sessions.sessions_oauth_client_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sessions.sessions_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.sso_domains.sso_domains_sso_provider_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.webauthn_challenges.webauthn_challenges_user_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT auth.webauthn_credentials.webauthn_credentials_user_id_fkey: Supabase-managed schema
ALTER TABLE public.accounting_bank_accounts ADD CONSTRAINT accounting_bank_accounts_account_id_fkey FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id);
ALTER TABLE public.accounting_bank_accounts ADD CONSTRAINT accounting_bank_accounts_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.accounting_bank_accounts ADD CONSTRAINT accounting_bank_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES accounting_bank_accounts(id);
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES accounting_journal_entries(id);
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_payroll_payment_batch_id_fkey FOREIGN KEY (payroll_payment_batch_id) REFERENCES payroll_payment_batches(id);
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_payroll_payment_item_id_fkey FOREIGN KEY (payroll_payment_item_id) REFERENCES payroll_payment_items(id);
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.accounting_bank_transactions ADD CONSTRAINT accounting_bank_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.accounting_fiscal_periods ADD CONSTRAINT accounting_fiscal_periods_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.accounting_fiscal_periods ADD CONSTRAINT accounting_fiscal_periods_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.accounting_journal_entries ADD CONSTRAINT accounting_journal_entries_fiscal_period_id_fkey FOREIGN KEY (fiscal_period_id) REFERENCES accounting_fiscal_periods(id);
ALTER TABLE public.accounting_journal_entries ADD CONSTRAINT accounting_journal_entries_reversal_of_entry_id_fkey FOREIGN KEY (reversal_of_entry_id) REFERENCES accounting_journal_entries(id);
ALTER TABLE public.accounting_journal_entries ADD CONSTRAINT accounting_journal_entries_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.accounting_journal_entries ADD CONSTRAINT accounting_journal_entries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.accounting_journal_lines ADD CONSTRAINT accounting_journal_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id);
ALTER TABLE public.accounting_journal_lines ADD CONSTRAINT accounting_journal_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES accounting_journal_entries(id);
ALTER TABLE public.approval_request_actions ADD CONSTRAINT approval_request_actions_request_id_fkey FOREIGN KEY (request_id) REFERENCES approval_requests(id) ON DELETE RESTRICT;
ALTER TABLE public.approval_request_actions ADD CONSTRAINT approval_request_actions_request_step_id_fkey FOREIGN KEY (request_step_id) REFERENCES approval_request_steps(id) ON DELETE RESTRICT;
ALTER TABLE public.approval_request_actions ADD CONSTRAINT approval_request_actions_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.approval_request_actions ADD CONSTRAINT approval_request_actions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_assigned_employee_id_fkey FOREIGN KEY (assigned_employee_id) REFERENCES employees(id);
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_request_id_fkey FOREIGN KEY (request_id) REFERENCES approval_requests(id) ON DELETE RESTRICT;
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.approval_request_steps ADD CONSTRAINT approval_request_steps_workflow_step_id_fkey FOREIGN KEY (workflow_step_id) REFERENCES approval_workflow_steps(id);
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_subject_employee_id_fkey FOREIGN KEY (subject_employee_id) REFERENCES employees(id);
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.approval_requests ADD CONSTRAINT approval_requests_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id);
ALTER TABLE public.approval_workflow_steps ADD CONSTRAINT approval_workflow_steps_approval_workflow_id_fkey FOREIGN KEY (approval_workflow_id) REFERENCES approval_workflows(id);
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_claimed_employee_id_fkey FOREIGN KEY (claimed_employee_id) REFERENCES employees(id);
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_device_id_fkey FOREIGN KEY (device_id) REFERENCES attendance_devices(id);
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.attendance_authentication_events ADD CONSTRAINT attendance_authentication_events_verified_employee_id_fkey FOREIGN KEY (verified_employee_id) REFERENCES employees(id);
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.attendance_daily_records ADD CONSTRAINT attendance_daily_records_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.attendance_devices ADD CONSTRAINT attendance_devices_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.attendance_devices ADD CONSTRAINT attendance_devices_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.attendance_employee_shifts ADD CONSTRAINT attendance_employee_shifts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.attendance_employee_shifts ADD CONSTRAINT attendance_employee_shifts_shift_id_fkey FOREIGN KEY (shift_id) REFERENCES attendance_shifts(id);
ALTER TABLE public.attendance_employee_shifts ADD CONSTRAINT attendance_employee_shifts_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.attendance_employee_shifts ADD CONSTRAINT attendance_employee_shifts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_authentication_event_id_fkey FOREIGN KEY (authentication_event_id) REFERENCES attendance_authentication_events(id);
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_device_id_fkey FOREIGN KEY (device_id) REFERENCES attendance_devices(id);
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.attendance_events ADD CONSTRAINT attendance_events_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.attendance_face_profiles ADD CONSTRAINT attendance_face_profiles_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.attendance_face_profiles ADD CONSTRAINT attendance_face_profiles_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.attendance_face_profiles ADD CONSTRAINT attendance_face_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.attendance_feature_settings ADD CONSTRAINT attendance_feature_settings_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.attendance_feature_settings ADD CONSTRAINT attendance_feature_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.attendance_policies ADD CONSTRAINT attendance_policies_employee_category_id_fkey FOREIGN KEY (employee_category_id) REFERENCES employee_categories(id);
ALTER TABLE public.attendance_policies ADD CONSTRAINT attendance_policies_hr_policy_set_id_fkey FOREIGN KEY (hr_policy_set_id) REFERENCES hr_policy_sets(id);
ALTER TABLE public.attendance_policies ADD CONSTRAINT attendance_policies_work_location_id_fkey FOREIGN KEY (work_location_id) REFERENCES work_locations(id);
ALTER TABLE public.attendance_shifts ADD CONSTRAINT attendance_shifts_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.attendance_shifts ADD CONSTRAINT attendance_shifts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.calc_saves ADD CONSTRAINT calc_saves_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES recruitment_candidates(id);
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_interviewer_employee_id_fkey FOREIGN KEY (interviewer_employee_id) REFERENCES employees(id);
ALTER TABLE public.candidate_interviews ADD CONSTRAINT candidate_interviews_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES recruitment_candidates(id);
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.candidate_onboarding ADD CONSTRAINT candidate_onboarding_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.chart_of_accounts ADD CONSTRAINT chart_of_accounts_parent_account_id_fkey FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(id);
ALTER TABLE public.chart_of_accounts ADD CONSTRAINT chart_of_accounts_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.chart_of_accounts ADD CONSTRAINT chart_of_accounts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.comp_off_policies ADD CONSTRAINT comp_off_policies_employee_category_id_fkey FOREIGN KEY (employee_category_id) REFERENCES employee_categories(id);
ALTER TABLE public.comp_off_policies ADD CONSTRAINT comp_off_policies_hr_policy_set_id_fkey FOREIGN KEY (hr_policy_set_id) REFERENCES hr_policy_sets(id);
ALTER TABLE public.comp_off_policies ADD CONSTRAINT comp_off_policies_work_location_id_fkey FOREIGN KEY (work_location_id) REFERENCES work_locations(id);
ALTER TABLE public.companies ADD CONSTRAINT companies_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.companies ADD CONSTRAINT companies_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.companies ADD CONSTRAINT fk_companies_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_addresses ADD CONSTRAINT company_addresses_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_addresses ADD CONSTRAINT company_addresses_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_addresses ADD CONSTRAINT company_addresses_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_bank_profiles ADD CONSTRAINT company_bank_profiles_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_bank_profiles ADD CONSTRAINT company_bank_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_bank_profiles ADD CONSTRAINT company_bank_profiles_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_branding ADD CONSTRAINT company_branding_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_branding ADD CONSTRAINT company_branding_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_branding ADD CONSTRAINT company_branding_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_contacts ADD CONSTRAINT company_contacts_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_contacts ADD CONSTRAINT company_contacts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_contacts ADD CONSTRAINT company_contacts_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_documents ADD CONSTRAINT company_documents_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_documents ADD CONSTRAINT company_documents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_documents ADD CONSTRAINT company_documents_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_profiles ADD CONSTRAINT company_profiles_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_registrations ADD CONSTRAINT company_registrations_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_registrations ADD CONSTRAINT company_registrations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_registrations ADD CONSTRAINT company_registrations_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_settings_audit ADD CONSTRAINT company_settings_audit_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_settings_audit ADD CONSTRAINT company_settings_audit_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_settings_audit ADD CONSTRAINT company_settings_audit_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.company_settings ADD CONSTRAINT company_settings_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.contacts ADD CONSTRAINT contacts_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE CASCADE;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.contacts ADD CONSTRAINT contacts_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE SET NULL;
ALTER TABLE public.crm_customer_profiles ADD CONSTRAINT crm_customer_profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE public.crm_customer_profiles ADD CONSTRAINT crm_customer_profiles_tenant_id_tenant_company_id_fkey FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id);
ALTER TABLE public.departments ADD CONSTRAINT departments_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.designations ADD CONSTRAINT designations_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.documents ADD CONSTRAINT documents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD CONSTRAINT documents_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;
ALTER TABLE public.documents ADD CONSTRAINT fk_documents_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.documents ADD CONSTRAINT fk_documents_work_scoped FOREIGN KEY (tenant_company_id, work_id) REFERENCES works(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.employee_bank_accounts ADD CONSTRAINT employee_bank_accounts_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_company_assignments ADD CONSTRAINT employee_company_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_company_assignments ADD CONSTRAINT employee_company_assignments_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.employee_dependents ADD CONSTRAINT employee_dependents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_documents ADD CONSTRAINT employee_documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_esi_details ADD CONSTRAINT employee_esi_details_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_field_configurations ADD CONSTRAINT employee_field_configurations_field_definition_id_fkey FOREIGN KEY (field_definition_id) REFERENCES employee_field_definitions(id);
ALTER TABLE public.employee_field_configurations ADD CONSTRAINT employee_field_configurations_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.employee_field_values ADD CONSTRAINT employee_field_values_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_field_values ADD CONSTRAINT employee_field_values_field_definition_id_fkey FOREIGN KEY (field_definition_id) REFERENCES employee_field_definitions(id);
ALTER TABLE public.employee_nominees ADD CONSTRAINT employee_nominees_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_pf_details ADD CONSTRAINT employee_pf_details_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_salary_structure_items ADD CONSTRAINT employee_salary_structure_items_payroll_component_id_fkey FOREIGN KEY (payroll_component_id) REFERENCES payroll_components(id) ON DELETE RESTRICT;
ALTER TABLE public.employee_salary_structure_items ADD CONSTRAINT employee_salary_structure_items_salary_structure_id_fkey FOREIGN KEY (salary_structure_id) REFERENCES employee_salary_structures(id) ON DELETE RESTRICT;
ALTER TABLE public.employee_salary_structure_items ADD CONSTRAINT employee_salary_structure_items_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.employee_salary_structure_items ADD CONSTRAINT employee_salary_structure_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.employee_salary_structures ADD CONSTRAINT employee_salary_structures_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employee_salary_structures ADD CONSTRAINT employee_salary_structures_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.employee_salary_structures ADD CONSTRAINT employee_salary_structures_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.employee_tax_details ADD CONSTRAINT employee_tax_details_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.employees ADD CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE public.employees ADD CONSTRAINT employees_designation_id_fkey FOREIGN KEY (designation_id) REFERENCES designations(id);
ALTER TABLE public.employees ADD CONSTRAINT employees_primary_unit_id_fkey FOREIGN KEY (primary_unit_id) REFERENCES units(id);
ALTER TABLE public.employees ADD CONSTRAINT employees_reporting_manager_employee_id_fkey FOREIGN KEY (reporting_manager_employee_id) REFERENCES employees(id);
ALTER TABLE public.employees ADD CONSTRAINT employees_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE CASCADE;
ALTER TABLE public.enquiries ADD CONSTRAINT enquiries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id);
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_enquiry_id_fkey FOREIGN KEY (enquiry_id) REFERENCES enquiries(id) ON DELETE CASCADE;
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE CASCADE;
ALTER TABLE public.follow_ups ADD CONSTRAINT follow_ups_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.goods_received_note_items ADD CONSTRAINT goods_received_note_items_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES goods_received_notes(id) ON DELETE RESTRICT;
ALTER TABLE public.goods_received_note_items ADD CONSTRAINT goods_received_note_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.goods_received_note_items ADD CONSTRAINT goods_received_note_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.goods_received_note_items ADD CONSTRAINT goods_received_note_items_purchase_order_item_id_fkey FOREIGN KEY (purchase_order_item_id) REFERENCES purchase_order_items(id) ON DELETE RESTRICT;
ALTER TABLE public.goods_received_notes ADD CONSTRAINT goods_received_notes_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT;
ALTER TABLE public.goods_received_notes ADD CONSTRAINT goods_received_notes_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT;
ALTER TABLE public.holiday_calendar_days ADD CONSTRAINT holiday_calendar_days_holiday_calendar_id_fkey FOREIGN KEY (holiday_calendar_id) REFERENCES holiday_calendars(id);
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_inventory_transaction_id_fkey FOREIGN KEY (inventory_transaction_id) REFERENCES inventory_transactions(id);
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory_items(id);
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory_locations(id);
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.inventory_adjustment_requests ADD CONSTRAINT inventory_adjustment_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.inventory_document_sequences ADD CONSTRAINT inventory_document_sequences_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_inventory_transaction_id_fkey FOREIGN KEY (inventory_transaction_id) REFERENCES inventory_transactions(id);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_last_inventory_transaction_id_fkey FOREIGN KEY (last_inventory_transaction_id) REFERENCES inventory_transactions(id);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory_locations(id);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES inventory_reservations(id);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_reservation_line_id_fkey FOREIGN KEY (reservation_line_id) REFERENCES inventory_reservation_lines(id);
ALTER TABLE public.inventory_fulfilment_lines ADD CONSTRAINT inventory_fulfilment_lines_sales_order_item_id_fkey FOREIGN KEY (sales_order_item_id) REFERENCES sales_order_items(id);
ALTER TABLE public.inventory_item_aliases ADD CONSTRAINT inventory_item_aliases_identity_scope_fk FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id);
ALTER TABLE public.inventory_item_aliases ADD CONSTRAINT inventory_item_aliases_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.inventory_item_match_feedback ADD CONSTRAINT inventory_item_match_feedback_final_inventory_item_id_fkey FOREIGN KEY (final_inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.inventory_item_match_feedback ADD CONSTRAINT inventory_item_match_feedback_proposed_inventory_item_id_fkey FOREIGN KEY (proposed_inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.inventory_item_match_feedback ADD CONSTRAINT inventory_item_match_feedback_scope_fk FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id);
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_domain_code_fkey FOREIGN KEY (domain_code) REFERENCES mep_domains(code) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_mep_category_id_fkey FOREIGN KEY (mep_category_id) REFERENCES mep_item_categories(id) ON DELETE RESTRICT;
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.inventory_items ADD CONSTRAINT inventory_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.inventory_locations ADD CONSTRAINT inventory_locations_parent_location_id_fkey FOREIGN KEY (parent_location_id) REFERENCES inventory_locations(id);
ALTER TABLE public.inventory_locations ADD CONSTRAINT inventory_locations_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.inventory_locations ADD CONSTRAINT inventory_locations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.inventory_reservation_actions ADD CONSTRAINT inventory_reservation_actions_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES inventory_reservations(id);
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory_locations(id);
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES inventory_reservations(id);
ALTER TABLE public.inventory_reservation_lines ADD CONSTRAINT inventory_reservation_lines_sales_order_item_id_fkey FOREIGN KEY (sales_order_item_id) REFERENCES sales_order_items(id);
ALTER TABLE public.inventory_reservations ADD CONSTRAINT inventory_reservations_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id);
ALTER TABLE public.inventory_stock_balances ADD CONSTRAINT inventory_stock_balances_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory_items(id);
ALTER TABLE public.inventory_stock_balances ADD CONSTRAINT inventory_stock_balances_location_id_fkey FOREIGN KEY (location_id) REFERENCES inventory_locations(id);
ALTER TABLE public.inventory_stock_balances ADD CONSTRAINT inventory_stock_balances_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.inventory_stock_balances ADD CONSTRAINT inventory_stock_balances_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_item_id_fkey FOREIGN KEY (item_id) REFERENCES inventory_items(id);
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.inventory_transaction_lines ADD CONSTRAINT inventory_transaction_lines_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES inventory_transactions(id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_from_location_id_fkey FOREIGN KEY (from_location_id) REFERENCES inventory_locations(id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_to_location_id_fkey FOREIGN KEY (to_location_id) REFERENCES inventory_locations(id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id);
ALTER TABLE public.issues ADD CONSTRAINT fk_issues_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.issues ADD CONSTRAINT fk_issues_work_scoped FOREIGN KEY (tenant_company_id, work_id) REFERENCES works(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.issues ADD CONSTRAINT issues_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.issues ADD CONSTRAINT issues_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.issues ADD CONSTRAINT issues_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;
ALTER TABLE public.job_positions ADD CONSTRAINT job_positions_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE public.job_positions ADD CONSTRAINT job_positions_designation_id_fkey FOREIGN KEY (designation_id) REFERENCES designations(id);
ALTER TABLE public.job_positions ADD CONSTRAINT job_positions_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES leave_types(id);
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_policy_rule_id_fkey FOREIGN KEY (policy_rule_id) REFERENCES leave_policy_rules(id);
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.leave_balances ADD CONSTRAINT leave_balances_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_leave_balance_id_fkey FOREIGN KEY (leave_balance_id) REFERENCES leave_balances(id) ON DELETE RESTRICT;
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE RESTRICT;
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES leave_types(id);
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.leave_ledger ADD CONSTRAINT leave_ledger_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.leave_policy_rules ADD CONSTRAINT leave_policy_rules_employee_category_id_fkey FOREIGN KEY (employee_category_id) REFERENCES employee_categories(id);
ALTER TABLE public.leave_policy_rules ADD CONSTRAINT leave_policy_rules_hr_policy_set_id_fkey FOREIGN KEY (hr_policy_set_id) REFERENCES hr_policy_sets(id);
ALTER TABLE public.leave_policy_rules ADD CONSTRAINT leave_policy_rules_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES leave_types(id);
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_holiday_calendar_day_id_fkey FOREIGN KEY (holiday_calendar_day_id) REFERENCES holiday_calendar_days(id);
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES leave_requests(id) ON DELETE RESTRICT;
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.leave_request_days ADD CONSTRAINT leave_request_days_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_approval_request_id_fkey FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id);
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES leave_types(id);
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.leave_requests ADD CONSTRAINT leave_requests_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.logs ADD CONSTRAINT fk_logs_issue_scoped FOREIGN KEY (tenant_company_id, issue_id) REFERENCES issues(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.logs ADD CONSTRAINT fk_logs_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.logs ADD CONSTRAINT fk_logs_work_scoped FOREIGN KEY (tenant_company_id, work_id) REFERENCES works(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.logs ADD CONSTRAINT logs_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE;
ALTER TABLE public.logs ADD CONSTRAINT logs_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.logs ADD CONSTRAINT logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.logs ADD CONSTRAINT logs_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL;
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_master_boq_id_fkey FOREIGN KEY (master_boq_id) REFERENCES master_boqs(id) ON DELETE CASCADE;
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_source_extraction_line_id_fkey FOREIGN KEY (source_extraction_line_id) REFERENCES mep_extraction_lines(id) ON DELETE SET NULL;
ALTER TABLE public.master_boq_lines ADD CONSTRAINT master_boq_lines_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;
ALTER TABLE public.master_boq_outputs ADD CONSTRAINT master_boq_outputs_master_boq_id_fkey FOREIGN KEY (master_boq_id) REFERENCES master_boqs(id) ON DELETE CASCADE;
ALTER TABLE public.master_boq_outputs ADD CONSTRAINT master_boq_outputs_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_source_document_id_fkey FOREIGN KEY (source_document_id) REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_source_extraction_id_fkey FOREIGN KEY (source_extraction_id) REFERENCES mep_document_extractions(id) ON DELETE SET NULL;
ALTER TABLE public.master_boqs ADD CONSTRAINT master_boqs_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;
ALTER TABLE public.mep_ai_corrections ADD CONSTRAINT mep_ai_corrections_extraction_line_id_fkey FOREIGN KEY (extraction_line_id) REFERENCES mep_extraction_lines(id) ON DELETE CASCADE;
ALTER TABLE public.mep_ai_corrections ADD CONSTRAINT mep_ai_corrections_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.mep_ai_corrections ADD CONSTRAINT mep_ai_corrections_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE CASCADE;
ALTER TABLE public.mep_ai_corrections ADD CONSTRAINT mep_ai_corrections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.mep_attribute_definitions ADD CONSTRAINT mep_attribute_definitions_category_id_fkey FOREIGN KEY (category_id) REFERENCES mep_item_categories(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_attribute_definitions ADD CONSTRAINT mep_attribute_definitions_domain_code_fkey FOREIGN KEY (domain_code) REFERENCES mep_domains(code) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.mep_document_examples ADD CONSTRAINT mep_document_examples_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.mep_document_examples ADD CONSTRAINT mep_document_examples_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE CASCADE;
ALTER TABLE public.mep_document_examples ADD CONSTRAINT mep_document_examples_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.mep_document_examples ADD CONSTRAINT mep_document_examples_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE SET NULL;
ALTER TABLE public.mep_document_extractions ADD CONSTRAINT mep_document_extractions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.mep_document_extractions ADD CONSTRAINT mep_document_extractions_document_example_id_fkey FOREIGN KEY (document_example_id) REFERENCES mep_document_examples(id) ON DELETE CASCADE;
ALTER TABLE public.mep_document_extractions ADD CONSTRAINT mep_document_extractions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.mep_document_extractions ADD CONSTRAINT mep_document_extractions_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE CASCADE;
ALTER TABLE public.mep_document_extractions ADD CONSTRAINT mep_document_extractions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_candidate_inventory_item_id_fkey FOREIGN KEY (candidate_inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL;
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_category_id_fkey FOREIGN KEY (category_id) REFERENCES mep_item_categories(id) ON DELETE SET NULL;
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_domain_code_fkey FOREIGN KEY (domain_code) REFERENCES mep_domains(code) ON DELETE SET NULL;
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_extraction_id_fkey FOREIGN KEY (extraction_id) REFERENCES mep_document_extractions(id) ON DELETE CASCADE;
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE CASCADE;
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.mep_extraction_lines ADD CONSTRAINT mep_extraction_lines_uom_code_fkey FOREIGN KEY (uom_code) REFERENCES mep_units(code) ON DELETE SET NULL;
ALTER TABLE public.mep_hsn_tax_mappings ADD CONSTRAINT mep_hsn_tax_mappings_category_id_fkey FOREIGN KEY (category_id) REFERENCES mep_item_categories(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_hsn_tax_mappings ADD CONSTRAINT mep_hsn_tax_mappings_domain_code_fkey FOREIGN KEY (domain_code) REFERENCES mep_domains(code) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.mep_item_categories ADD CONSTRAINT mep_item_categories_domain_code_fkey FOREIGN KEY (domain_code) REFERENCES mep_domains(code) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.mep_item_categories ADD CONSTRAINT mep_item_categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES mep_item_categories(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_item_match_candidates ADD CONSTRAINT mep_item_match_candidates_candidate_inventory_item_id_fkey FOREIGN KEY (candidate_inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_item_match_candidates ADD CONSTRAINT mep_item_match_candidates_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_item_match_candidates ADD CONSTRAINT mep_item_match_candidates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_item_matching_benchmark_cases ADD CONSTRAINT mep_item_matching_benchmark_cas_expected_inventory_item_id_fkey FOREIGN KEY (expected_inventory_item_id) REFERENCES inventory_items(id);
ALTER TABLE public.mep_item_matching_benchmark_cases ADD CONSTRAINT mep_item_matching_benchmark_cases_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.mep_item_matching_benchmark_cases ADD CONSTRAINT mep_item_matching_benchmark_cases_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.mep_item_matching_benchmark_runs ADD CONSTRAINT mep_item_matching_benchmark_runs_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.mep_item_matching_benchmark_runs ADD CONSTRAINT mep_item_matching_benchmark_runs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.mep_item_specifications ADD CONSTRAINT mep_item_specifications_attribute_definition_id_fkey FOREIGN KEY (attribute_definition_id) REFERENCES mep_attribute_definitions(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_item_specifications ADD CONSTRAINT mep_item_specifications_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_item_specifications ADD CONSTRAINT mep_item_specifications_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_item_specifications ADD CONSTRAINT mep_item_specifications_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE RESTRICT;
ALTER TABLE public.mep_normalization_rules ADD CONSTRAINT mep_normalization_rules_domain_code_fkey FOREIGN KEY (domain_code) REFERENCES mep_domains(code) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.overtime_policies ADD CONSTRAINT overtime_policies_employee_category_id_fkey FOREIGN KEY (employee_category_id) REFERENCES employee_categories(id);
ALTER TABLE public.overtime_policies ADD CONSTRAINT overtime_policies_hr_policy_set_id_fkey FOREIGN KEY (hr_policy_set_id) REFERENCES hr_policy_sets(id);
ALTER TABLE public.overtime_policies ADD CONSTRAINT overtime_policies_work_location_id_fkey FOREIGN KEY (work_location_id) REFERENCES work_locations(id);
ALTER TABLE public.payroll_account_mappings ADD CONSTRAINT payroll_account_mappings_account_id_fkey FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id);
ALTER TABLE public.payroll_account_mappings ADD CONSTRAINT payroll_account_mappings_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_account_mappings ADD CONSTRAINT payroll_account_mappings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_bank_file_profiles ADD CONSTRAINT payroll_bank_file_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES auth.users(id);
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_payroll_payment_batch_id_fkey FOREIGN KEY (payroll_payment_batch_id) REFERENCES payroll_payment_batches(id);
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES payroll_bank_file_profiles(id);
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_bank_files ADD CONSTRAINT payroll_bank_files_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_components ADD CONSTRAINT payroll_components_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_approval_request_id_fkey FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES accounting_bank_accounts(id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES accounting_bank_transactions(id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES accounting_journal_entries(id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_payment_batches ADD CONSTRAINT payroll_payment_batches_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_employee_bank_account_id_fkey FOREIGN KEY (employee_bank_account_id) REFERENCES employee_bank_accounts(id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_payment_batch_id_fkey FOREIGN KEY (payment_batch_id) REFERENCES payroll_payment_batches(id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_payroll_run_item_id_fkey FOREIGN KEY (payroll_run_item_id) REFERENCES payroll_run_items(id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_payment_items ADD CONSTRAINT payroll_payment_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES accounting_bank_transactions(id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_payroll_payment_batch_id_fkey FOREIGN KEY (payroll_payment_batch_id) REFERENCES payroll_payment_batches(id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_payroll_payment_item_id_fkey FOREIGN KEY (payroll_payment_item_id) REFERENCES payroll_payment_items(id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_payment_reconciliations ADD CONSTRAINT payroll_payment_reconciliations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES auth.users(id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_payroll_run_item_id_fkey FOREIGN KEY (payroll_run_item_id) REFERENCES payroll_run_items(id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_payslips ADD CONSTRAINT payroll_payslips_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_periods ADD CONSTRAINT payroll_periods_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_periods ADD CONSTRAINT payroll_periods_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_run_accounting ADD CONSTRAINT payroll_run_accounting_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES accounting_journal_entries(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_run_accounting ADD CONSTRAINT payroll_run_accounting_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_run_accounting ADD CONSTRAINT payroll_run_accounting_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_run_accounting ADD CONSTRAINT payroll_run_accounting_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_run_item_components ADD CONSTRAINT payroll_run_item_components_payroll_component_id_fkey FOREIGN KEY (payroll_component_id) REFERENCES payroll_components(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_run_item_components ADD CONSTRAINT payroll_run_item_components_payroll_run_item_id_fkey FOREIGN KEY (payroll_run_item_id) REFERENCES payroll_run_items(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_run_item_components ADD CONSTRAINT payroll_run_item_components_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_run_item_components ADD CONSTRAINT payroll_run_item_components_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_run_items ADD CONSTRAINT payroll_run_items_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_run_items ADD CONSTRAINT payroll_run_items_payroll_run_id_fkey FOREIGN KEY (payroll_run_id) REFERENCES payroll_runs(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_run_items ADD CONSTRAINT payroll_run_items_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_run_items ADD CONSTRAINT payroll_run_items_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_runs ADD CONSTRAINT payroll_runs_payroll_period_id_fkey FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_runs ADD CONSTRAINT payroll_runs_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_runs ADD CONSTRAINT payroll_runs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_settings ADD CONSTRAINT payroll_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_statutory_rules ADD CONSTRAINT payroll_statutory_rules_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES accounting_bank_accounts(id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_bank_transaction_id_fkey FOREIGN KEY (bank_transaction_id) REFERENCES accounting_bank_transactions(id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES accounting_journal_entries(id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_payroll_period_id_fkey FOREIGN KEY (payroll_period_id) REFERENCES payroll_periods(id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_statutory_settlements ADD CONSTRAINT payroll_statutory_settlements_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_tax_certificates ADD CONSTRAINT payroll_tax_certificates_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.payroll_tax_certificates ADD CONSTRAINT payroll_tax_certificates_generated_by_fkey FOREIGN KEY (generated_by) REFERENCES auth.users(id);
ALTER TABLE public.payroll_tax_certificates ADD CONSTRAINT payroll_tax_certificates_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_tax_certificates ADD CONSTRAINT payroll_tax_certificates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_tax_declarations ADD CONSTRAINT payroll_tax_declarations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.payroll_tax_previous_employers ADD CONSTRAINT payroll_tax_previous_employers_tax_declaration_id_fkey FOREIGN KEY (tax_declaration_id) REFERENCES payroll_tax_declarations(id) ON DELETE RESTRICT;
ALTER TABLE public.payroll_tax_previous_employers ADD CONSTRAINT payroll_tax_previous_employers_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.payroll_tax_previous_employers ADD CONSTRAINT payroll_tax_previous_employers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id);
ALTER TABLE public.proforma_invoice_items ADD CONSTRAINT proforma_invoice_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.proforma_invoice_items ADD CONSTRAINT proforma_invoice_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.proforma_invoice_items ADD CONSTRAINT proforma_invoice_items_proforma_invoice_id_fkey FOREIGN KEY (proforma_invoice_id) REFERENCES proforma_invoices(id) ON DELETE CASCADE;
ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_enquiry_id_fkey FOREIGN KEY (enquiry_id) REFERENCES enquiries(id);
ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES sales_quotations(id);
ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id);
ALTER TABLE public.proforma_invoices ADD CONSTRAINT proforma_invoices_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id);
ALTER TABLE public.project_assignments ADD CONSTRAINT fk_project_assignments_assigned_by_membership FOREIGN KEY (tenant_id, assigned_by) REFERENCES tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT;
ALTER TABLE public.project_assignments ADD CONSTRAINT fk_project_assignments_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.project_assignments ADD CONSTRAINT fk_project_assignments_user_membership FOREIGN KEY (tenant_id, user_id) REFERENCES tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT;
ALTER TABLE public.project_assignments ADD CONSTRAINT fk_project_assignments_work FOREIGN KEY (tenant_company_id, work_id) REFERENCES works(tenant_company_id, id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_bill_items ADD CONSTRAINT purchase_bill_items_grn_item_fk FOREIGN KEY (goods_received_note_item_id) REFERENCES goods_received_note_items(id);
ALTER TABLE public.purchase_bill_items ADD CONSTRAINT purchase_bill_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_bill_items ADD CONSTRAINT purchase_bill_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_bill_items ADD CONSTRAINT purchase_bill_items_po_item_fk FOREIGN KEY (purchase_order_item_id) REFERENCES purchase_order_items(id);
ALTER TABLE public.purchase_bill_items ADD CONSTRAINT purchase_bill_items_purchase_bill_id_fkey FOREIGN KEY (purchase_bill_id) REFERENCES purchase_bills(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_bills ADD CONSTRAINT purchase_bills_grn_id_fkey FOREIGN KEY (grn_id) REFERENCES goods_received_notes(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_bills ADD CONSTRAINT purchase_bills_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_bills ADD CONSTRAINT purchase_bills_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_order_items ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_purchase_request_id_fkey FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_orders ADD CONSTRAINT purchase_orders_vendor_quotation_id_fkey FOREIGN KEY (vendor_quotation_id) REFERENCES vendor_quotations(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_payments ADD CONSTRAINT purchase_payments_purchase_bill_id_fkey FOREIGN KEY (purchase_bill_id) REFERENCES purchase_bills(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_request_items ADD CONSTRAINT purchase_request_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.purchase_request_items ADD CONSTRAINT purchase_request_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.purchase_request_items ADD CONSTRAINT purchase_request_items_purchase_request_id_fkey FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE RESTRICT;
ALTER TABLE public.recruitment_application_links ADD CONSTRAINT recruitment_application_links_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES job_positions(id);
ALTER TABLE public.recruitment_application_links ADD CONSTRAINT recruitment_application_links_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.recruitment_candidates ADD CONSTRAINT recruitment_candidates_application_link_id_fkey FOREIGN KEY (application_link_id) REFERENCES recruitment_application_links(id);
ALTER TABLE public.recruitment_candidates ADD CONSTRAINT recruitment_candidates_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE public.recruitment_candidates ADD CONSTRAINT recruitment_candidates_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES employees(id);
ALTER TABLE public.recruitment_candidates ADD CONSTRAINT recruitment_candidates_job_position_id_fkey FOREIGN KEY (job_position_id) REFERENCES job_positions(id);
ALTER TABLE public.recruitment_candidates ADD CONSTRAINT recruitment_candidates_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.reminders ADD CONSTRAINT fk_reminders_company_scoped FOREIGN KEY (tenant_company_id, company_id) REFERENCES companies(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.reminders ADD CONSTRAINT fk_reminders_log_scoped FOREIGN KEY (tenant_company_id, log_id) REFERENCES logs(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.reminders ADD CONSTRAINT fk_reminders_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.reminders ADD CONSTRAINT fk_reminders_unit_scoped FOREIGN KEY (tenant_company_id, unit_id) REFERENCES units(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.reminders ADD CONSTRAINT fk_reminders_work_scoped FOREIGN KEY (tenant_company_id, work_id) REFERENCES works(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.reminders ADD CONSTRAINT reminders_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE public.reminders ADD CONSTRAINT reminders_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.reminders ADD CONSTRAINT reminders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.reminders ADD CONSTRAINT reminders_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;
ALTER TABLE public.reminders ADD CONSTRAINT reminders_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE;
ALTER TABLE public.rfqs ADD CONSTRAINT rfqs_purchase_request_id_fkey FOREIGN KEY (purchase_request_id) REFERENCES purchase_requests(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_order_items ADD CONSTRAINT sales_order_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_order_items ADD CONSTRAINT sales_order_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.sales_order_items ADD CONSTRAINT sales_order_items_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE CASCADE;
ALTER TABLE public.sales_orders ADD CONSTRAINT sales_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE public.sales_orders ADD CONSTRAINT sales_orders_enquiry_id_fkey FOREIGN KEY (enquiry_id) REFERENCES enquiries(id);
ALTER TABLE public.sales_orders ADD CONSTRAINT sales_orders_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES sales_quotations(id);
ALTER TABLE public.sales_orders ADD CONSTRAINT sales_orders_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id);
ALTER TABLE public.sales_payments ADD CONSTRAINT sales_payments_tax_invoice_id_fkey FOREIGN KEY (tax_invoice_id) REFERENCES tax_invoices(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_quotation_items ADD CONSTRAINT sales_quotation_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.sales_quotation_items ADD CONSTRAINT sales_quotation_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.sales_quotation_items ADD CONSTRAINT sales_quotation_items_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES sales_quotations(id) ON DELETE CASCADE;
ALTER TABLE public.sales_quotations ADD CONSTRAINT sales_quotations_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE public.sales_quotations ADD CONSTRAINT sales_quotations_enquiry_id_fkey FOREIGN KEY (enquiry_id) REFERENCES enquiries(id);
ALTER TABLE public.sales_quotations ADD CONSTRAINT sales_quotations_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id);
ALTER TABLE public.stage_assignments ADD CONSTRAINT fk_stage_assignments_assigned_by_membership FOREIGN KEY (tenant_id, assigned_by) REFERENCES tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT;
ALTER TABLE public.stage_assignments ADD CONSTRAINT fk_stage_assignments_ended_by_membership FOREIGN KEY (tenant_id, ended_by) REFERENCES tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT;
ALTER TABLE public.stage_assignments ADD CONSTRAINT fk_stage_assignments_stage FOREIGN KEY (work_id, stage_id) REFERENCES stage_definitions(work_id, id) ON DELETE RESTRICT;
ALTER TABLE public.stage_assignments ADD CONSTRAINT fk_stage_assignments_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.stage_assignments ADD CONSTRAINT fk_stage_assignments_user_membership FOREIGN KEY (tenant_id, user_id) REFERENCES tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT;
ALTER TABLE public.stage_assignments ADD CONSTRAINT fk_stage_assignments_work FOREIGN KEY (tenant_company_id, work_id) REFERENCES works(tenant_company_id, id) ON DELETE RESTRICT;
ALTER TABLE public.stage_definitions ADD CONSTRAINT fk_stage_definitions_created_by_membership FOREIGN KEY (tenant_id, created_by) REFERENCES tenant_memberships(tenant_id, user_id) ON DELETE RESTRICT;
ALTER TABLE public.stage_definitions ADD CONSTRAINT fk_stage_definitions_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.stage_definitions ADD CONSTRAINT fk_stage_definitions_work FOREIGN KEY (tenant_company_id, work_id) REFERENCES works(tenant_company_id, id) ON DELETE RESTRICT;
ALTER TABLE public.task_assignees ADD CONSTRAINT fk_task_assignees_assigned_by FOREIGN KEY (tenant_id, assigned_by) REFERENCES tenant_memberships(tenant_id, user_id);
ALTER TABLE public.task_assignees ADD CONSTRAINT fk_task_assignees_ended_by FOREIGN KEY (tenant_id, ended_by) REFERENCES tenant_memberships(tenant_id, user_id);
ALTER TABLE public.task_assignees ADD CONSTRAINT fk_task_assignees_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE public.task_assignees ADD CONSTRAINT fk_task_assignees_tenant_company FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id);
ALTER TABLE public.task_assignees ADD CONSTRAINT fk_task_assignees_user FOREIGN KEY (tenant_id, user_id) REFERENCES tenant_memberships(tenant_id, user_id);
ALTER TABLE public.tasks ADD CONSTRAINT fk_tasks_created_by FOREIGN KEY (tenant_id, created_by) REFERENCES tenant_memberships(tenant_id, user_id);
ALTER TABLE public.tasks ADD CONSTRAINT fk_tasks_tenant_company FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id);
ALTER TABLE public.tasks ADD CONSTRAINT fk_tasks_work FOREIGN KEY (work_id, tenant_company_id) REFERENCES works(id, tenant_company_id);
ALTER TABLE public.tax_invoice_items ADD CONSTRAINT tax_invoice_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.tax_invoice_items ADD CONSTRAINT tax_invoice_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.tax_invoice_items ADD CONSTRAINT tax_invoice_items_tax_invoice_id_fkey FOREIGN KEY (tax_invoice_id) REFERENCES tax_invoices(id) ON DELETE CASCADE;
ALTER TABLE public.tax_invoices ADD CONSTRAINT tax_invoices_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
ALTER TABLE public.tax_invoices ADD CONSTRAINT tax_invoices_enquiry_id_fkey FOREIGN KEY (enquiry_id) REFERENCES enquiries(id);
ALTER TABLE public.tax_invoices ADD CONSTRAINT tax_invoices_proforma_invoice_id_fkey FOREIGN KEY (proforma_invoice_id) REFERENCES proforma_invoices(id);
ALTER TABLE public.tax_invoices ADD CONSTRAINT tax_invoices_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES sales_quotations(id);
ALTER TABLE public.tax_invoices ADD CONSTRAINT tax_invoices_sales_order_id_fkey FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id);
ALTER TABLE public.tax_invoices ADD CONSTRAINT tax_invoices_work_id_fkey FOREIGN KEY (work_id) REFERENCES works(id);
ALTER TABLE public.tenant_companies ADD CONSTRAINT tenant_companies_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.tenant_memberships ADD CONSTRAINT tenant_memberships_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE public.units ADD CONSTRAINT fk_units_company_scoped FOREIGN KEY (tenant_company_id, company_id) REFERENCES companies(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.units ADD CONSTRAINT fk_units_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.units ADD CONSTRAINT units_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE public.units ADD CONSTRAINT units_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.units ADD CONSTRAINT units_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.user_company_access ADD CONSTRAINT fk_user_company_access_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.user_company_access ADD CONSTRAINT fk_user_company_access_membership_tenant FOREIGN KEY (tenant_id, membership_id) REFERENCES tenant_memberships(tenant_id, id) ON DELETE CASCADE;
ALTER TABLE public.user_company_access ADD CONSTRAINT user_company_access_membership_id_fkey FOREIGN KEY (membership_id) REFERENCES tenant_memberships(id) ON DELETE CASCADE;
ALTER TABLE public.vendor_quotation_items ADD CONSTRAINT vendor_quotation_items_inventory_item_id_fkey FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT;
ALTER TABLE public.vendor_quotation_items ADD CONSTRAINT vendor_quotation_items_master_boq_line_id_fkey FOREIGN KEY (master_boq_line_id) REFERENCES master_boq_lines(id) ON DELETE SET NULL;
ALTER TABLE public.vendor_quotation_items ADD CONSTRAINT vendor_quotation_items_vendor_quotation_id_fkey FOREIGN KEY (vendor_quotation_id) REFERENCES vendor_quotations(id) ON DELETE RESTRICT;
ALTER TABLE public.vendor_quotations ADD CONSTRAINT vendor_quotations_rfq_id_fkey FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE RESTRICT;
ALTER TABLE public.vendor_quotations ADD CONSTRAINT vendor_quotations_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE RESTRICT;
ALTER TABLE public.weekly_off_policies ADD CONSTRAINT weekly_off_policies_employee_category_id_fkey FOREIGN KEY (employee_category_id) REFERENCES employee_categories(id);
ALTER TABLE public.weekly_off_policies ADD CONSTRAINT weekly_off_policies_hr_policy_set_id_fkey FOREIGN KEY (hr_policy_set_id) REFERENCES hr_policy_sets(id);
ALTER TABLE public.weekly_off_policies ADD CONSTRAINT weekly_off_policies_work_location_id_fkey FOREIGN KEY (work_location_id) REFERENCES work_locations(id);
ALTER TABLE public.works ADD CONSTRAINT fk_works_company_scoped FOREIGN KEY (tenant_company_id, company_id) REFERENCES companies(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.works ADD CONSTRAINT fk_works_tenant_comp FOREIGN KEY (tenant_id, tenant_company_id) REFERENCES tenant_companies(tenant_id, id) ON DELETE RESTRICT;
ALTER TABLE public.works ADD CONSTRAINT fk_works_unit_scoped FOREIGN KEY (tenant_company_id, unit_id) REFERENCES units(tenant_company_id, id) ON DELETE CASCADE;
ALTER TABLE public.works ADD CONSTRAINT works_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE public.works ADD CONSTRAINT works_tenant_company_id_fkey FOREIGN KEY (tenant_company_id) REFERENCES tenant_companies(id);
ALTER TABLE public.works ADD CONSTRAINT works_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.works ADD CONSTRAINT works_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;
-- OMITTED CONSTRAINT storage.objects.objects_bucketId_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.s3_multipart_uploads_parts.s3_multipart_uploads_parts_bucket_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.s3_multipart_uploads_parts.s3_multipart_uploads_parts_upload_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.s3_multipart_uploads.s3_multipart_uploads_bucket_id_fkey: Supabase-managed schema
-- OMITTED CONSTRAINT storage.vector_indexes.vector_indexes_bucket_id_fkey: Supabase-managed schema

-- ==========================================
-- SECTION 11: INDEXES
-- ==========================================
-- OMITTED INDEX auth.audit_log_entries.audit_log_entries_pkey: Supabase-managed schema
-- OMITTED INDEX auth.audit_log_entries.audit_logs_instance_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.custom_oauth_providers.custom_oauth_providers_created_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.custom_oauth_providers.custom_oauth_providers_enabled_idx: Supabase-managed schema
-- OMITTED INDEX auth.custom_oauth_providers.custom_oauth_providers_identifier_idx: Supabase-managed schema
-- OMITTED INDEX auth.custom_oauth_providers.custom_oauth_providers_identifier_key: Supabase-managed schema
-- OMITTED INDEX auth.custom_oauth_providers.custom_oauth_providers_pkey: Supabase-managed schema
-- OMITTED INDEX auth.custom_oauth_providers.custom_oauth_providers_provider_type_idx: Supabase-managed schema
-- OMITTED INDEX auth.flow_state.flow_state_created_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.flow_state.flow_state_pkey: Supabase-managed schema
-- OMITTED INDEX auth.flow_state.idx_auth_code: Supabase-managed schema
-- OMITTED INDEX auth.flow_state.idx_user_id_auth_method: Supabase-managed schema
-- OMITTED INDEX auth.identities.identities_email_idx: Supabase-managed schema
-- OMITTED INDEX auth.identities.identities_pkey: Supabase-managed schema
-- OMITTED INDEX auth.identities.identities_provider_id_provider_unique: Supabase-managed schema
-- OMITTED INDEX auth.identities.identities_user_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.instances.instances_pkey: Supabase-managed schema
-- OMITTED INDEX auth.mfa_amr_claims.amr_id_pk: Supabase-managed schema
-- OMITTED INDEX auth.mfa_amr_claims.mfa_amr_claims_session_id_authentication_method_pkey: Supabase-managed schema
-- OMITTED INDEX auth.mfa_challenges.mfa_challenge_created_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.mfa_challenges.mfa_challenges_pkey: Supabase-managed schema
-- OMITTED INDEX auth.mfa_factors.factor_id_created_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.mfa_factors.mfa_factors_last_challenged_at_key: Supabase-managed schema
-- OMITTED INDEX auth.mfa_factors.mfa_factors_pkey: Supabase-managed schema
-- OMITTED INDEX auth.mfa_factors.mfa_factors_user_friendly_name_unique: Supabase-managed schema
-- OMITTED INDEX auth.mfa_factors.mfa_factors_user_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.mfa_factors.unique_phone_factor_per_user: Supabase-managed schema
-- OMITTED INDEX auth.mfa_recovery_code_sets.mfa_recovery_code_sets_mfa_factor_id_key: Supabase-managed schema
-- OMITTED INDEX auth.mfa_recovery_code_sets.mfa_recovery_code_sets_pkey: Supabase-managed schema
-- OMITTED INDEX auth.mfa_recovery_code_sets.mfa_recovery_code_sets_user_id_key: Supabase-managed schema
-- OMITTED INDEX auth.mfa_recovery_codes.mfa_recovery_codes_pkey: Supabase-managed schema
-- OMITTED INDEX auth.mfa_recovery_codes.mfa_recovery_codes_set_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.oauth_authorizations.oauth_auth_pending_exp_idx: Supabase-managed schema
-- OMITTED INDEX auth.oauth_authorizations.oauth_authorizations_authorization_code_key: Supabase-managed schema
-- OMITTED INDEX auth.oauth_authorizations.oauth_authorizations_authorization_id_key: Supabase-managed schema
-- OMITTED INDEX auth.oauth_authorizations.oauth_authorizations_pkey: Supabase-managed schema
-- OMITTED INDEX auth.oauth_client_states.idx_oauth_client_states_created_at: Supabase-managed schema
-- OMITTED INDEX auth.oauth_client_states.oauth_client_states_pkey: Supabase-managed schema
-- OMITTED INDEX auth.oauth_clients.oauth_clients_deleted_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.oauth_clients.oauth_clients_pkey: Supabase-managed schema
-- OMITTED INDEX auth.oauth_consents.oauth_consents_active_client_idx: Supabase-managed schema
-- OMITTED INDEX auth.oauth_consents.oauth_consents_active_user_client_idx: Supabase-managed schema
-- OMITTED INDEX auth.oauth_consents.oauth_consents_pkey: Supabase-managed schema
-- OMITTED INDEX auth.oauth_consents.oauth_consents_user_client_unique: Supabase-managed schema
-- OMITTED INDEX auth.oauth_consents.oauth_consents_user_order_idx: Supabase-managed schema
-- OMITTED INDEX auth.one_time_tokens.one_time_tokens_pkey: Supabase-managed schema
-- OMITTED INDEX auth.one_time_tokens.one_time_tokens_relates_to_hash_idx: Supabase-managed schema
-- OMITTED INDEX auth.one_time_tokens.one_time_tokens_token_hash_hash_idx: Supabase-managed schema
-- OMITTED INDEX auth.one_time_tokens.one_time_tokens_user_id_token_type_key: Supabase-managed schema
-- OMITTED INDEX auth.refresh_tokens.refresh_tokens_instance_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.refresh_tokens.refresh_tokens_instance_id_user_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.refresh_tokens.refresh_tokens_parent_idx: Supabase-managed schema
-- OMITTED INDEX auth.refresh_tokens.refresh_tokens_pkey: Supabase-managed schema
-- OMITTED INDEX auth.refresh_tokens.refresh_tokens_session_id_revoked_idx: Supabase-managed schema
-- OMITTED INDEX auth.refresh_tokens.refresh_tokens_token_unique: Supabase-managed schema
-- OMITTED INDEX auth.refresh_tokens.refresh_tokens_updated_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.saml_providers.saml_providers_entity_id_key: Supabase-managed schema
-- OMITTED INDEX auth.saml_providers.saml_providers_pkey: Supabase-managed schema
-- OMITTED INDEX auth.saml_providers.saml_providers_sso_provider_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.saml_relay_states.saml_relay_states_created_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.saml_relay_states.saml_relay_states_for_email_idx: Supabase-managed schema
-- OMITTED INDEX auth.saml_relay_states.saml_relay_states_pkey: Supabase-managed schema
-- OMITTED INDEX auth.saml_relay_states.saml_relay_states_sso_provider_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.schema_migrations.schema_migrations_pkey: Supabase-managed schema
-- OMITTED INDEX auth.scim_tokens.scim_tokens_expires_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_tokens.scim_tokens_pkey: Supabase-managed schema
-- OMITTED INDEX auth.scim_tokens.scim_tokens_revoked_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_tokens.scim_tokens_sso_provider_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_tokens.scim_tokens_token_hash_key: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_created_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_deleted_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_external_id_key: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_pkey: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_sso_provider_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_updated_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_user_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_user_name_idx: Supabase-managed schema
-- OMITTED INDEX auth.scim_users.scim_users_user_name_key: Supabase-managed schema
-- OMITTED INDEX auth.sessions.sessions_not_after_idx: Supabase-managed schema
-- OMITTED INDEX auth.sessions.sessions_oauth_client_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.sessions.sessions_pkey: Supabase-managed schema
-- OMITTED INDEX auth.sessions.sessions_user_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.sessions.user_id_created_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.sso_domains.sso_domains_domain_idx: Supabase-managed schema
-- OMITTED INDEX auth.sso_domains.sso_domains_pkey: Supabase-managed schema
-- OMITTED INDEX auth.sso_domains.sso_domains_sso_provider_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.sso_providers.sso_providers_pkey: Supabase-managed schema
-- OMITTED INDEX auth.sso_providers.sso_providers_resource_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.sso_providers.sso_providers_resource_id_pattern_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.confirmation_token_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.email_change_token_current_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.email_change_token_new_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.idx_users_created_at_desc: Supabase-managed schema
-- OMITTED INDEX auth.users.idx_users_email: Supabase-managed schema
-- OMITTED INDEX auth.users.idx_users_last_sign_in_at_desc: Supabase-managed schema
-- OMITTED INDEX auth.users.idx_users_name: Supabase-managed schema
-- OMITTED INDEX auth.users.reauthentication_token_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.recovery_token_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.users_email_partial_key: Supabase-managed schema
-- OMITTED INDEX auth.users.users_instance_id_email_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.users_instance_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.users_is_anonymous_idx: Supabase-managed schema
-- OMITTED INDEX auth.users.users_phone_key: Supabase-managed schema
-- OMITTED INDEX auth.users.users_pkey: Supabase-managed schema
-- OMITTED INDEX auth.webauthn_challenges.webauthn_challenges_expires_at_idx: Supabase-managed schema
-- OMITTED INDEX auth.webauthn_challenges.webauthn_challenges_pkey: Supabase-managed schema
-- OMITTED INDEX auth.webauthn_challenges.webauthn_challenges_user_id_idx: Supabase-managed schema
-- OMITTED INDEX auth.webauthn_credentials.webauthn_credentials_credential_id_key: Supabase-managed schema
-- OMITTED INDEX auth.webauthn_credentials.webauthn_credentials_pkey: Supabase-managed schema
-- OMITTED INDEX auth.webauthn_credentials.webauthn_credentials_user_id_idx: Supabase-managed schema
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
undefined;
-- OMITTED INDEX realtime.messages.messages_inserted_at_topic_index: Supabase-managed schema
-- OMITTED INDEX realtime.messages.messages_pkey: Supabase-managed schema
-- OMITTED INDEX realtime.schema_migrations.schema_migrations_pkey: Supabase-managed schema
-- OMITTED INDEX realtime.subscription.ix_realtime_subscription_entity: Supabase-managed schema
-- OMITTED INDEX realtime.subscription.pk_subscription: Supabase-managed schema
-- OMITTED INDEX realtime.subscription.subscription_subscription_id_entity_filters_action_filter_selec: Supabase-managed schema
-- OMITTED INDEX storage.buckets_analytics.buckets_analytics_pkey: Supabase-managed schema
-- OMITTED INDEX storage.buckets_analytics.buckets_analytics_unique_name_idx: Supabase-managed schema
-- OMITTED INDEX storage.buckets_vectors.buckets_vectors_pkey: Supabase-managed schema
-- OMITTED INDEX storage.buckets.bname: Supabase-managed schema
-- OMITTED INDEX storage.buckets.buckets_pkey: Supabase-managed schema
-- OMITTED INDEX storage.migrations.migrations_name_key: Supabase-managed schema
-- OMITTED INDEX storage.migrations.migrations_pkey: Supabase-managed schema
-- OMITTED INDEX storage.objects.idx_objects_bucket_id_name: Supabase-managed schema
-- OMITTED INDEX storage.objects.idx_objects_bucket_id_name_lower: Supabase-managed schema
-- OMITTED INDEX storage.objects.idx_objects_current_version: Supabase-managed schema
-- OMITTED INDEX storage.objects.idx_objects_delete_markers: Supabase-managed schema
-- OMITTED INDEX storage.objects.idx_objects_null_version: Supabase-managed schema
-- OMITTED INDEX storage.objects.name_prefix_search: Supabase-managed schema
-- OMITTED INDEX storage.objects.objects_bucket_id_name_version_key: Supabase-managed schema
-- OMITTED INDEX storage.objects.objects_pkey: Supabase-managed schema
-- OMITTED INDEX storage.s3_multipart_uploads_parts.s3_multipart_uploads_parts_pkey: Supabase-managed schema
-- OMITTED INDEX storage.s3_multipart_uploads.idx_multipart_uploads_list: Supabase-managed schema
-- OMITTED INDEX storage.s3_multipart_uploads.s3_multipart_uploads_pkey: Supabase-managed schema
-- OMITTED INDEX storage.vector_indexes.vector_indexes_name_bucket_id_idx: Supabase-managed schema
-- OMITTED INDEX storage.vector_indexes.vector_indexes_pkey: Supabase-managed schema
undefined;
undefined;
-- OMITTED INDEX vault.secrets.secrets_name_idx: Supabase-managed schema
-- OMITTED INDEX vault.secrets.secrets_pkey: Supabase-managed schema

-- ==========================================
-- SECTION 12: VIEWS
-- ==========================================
-- OMITTED VIEW extensions.pg_stat_statements: Supabase-managed schema
-- OMITTED VIEW extensions.pg_stat_statements_info: Supabase-managed schema
CREATE OR REPLACE VIEW public.inventory_control_stock_v AS
 SELECT sb.tenant_id,
    sb.tenant_company_id,
    sb.id AS stock_balance_id,
    sb.item_id,
    i.item_code,
    i.name AS item_name,
    i.base_uom_code,
    i.category,
    i.reorder_level,
    i.reorder_quantity,
    sb.location_id,
    l.code AS location_code,
    l.name AS location_name,
    sb.lot_number,
    sb.quantity_on_hand,
    sb.average_unit_cost,
    round(sb.quantity_on_hand * sb.average_unit_cost, 6) AS stock_value,
    COALESCE(r.reserved_quantity, 0::numeric) AS reserved_quantity,
    GREATEST(sb.quantity_on_hand - COALESCE(r.reserved_quantity, 0::numeric), 0::numeric) AS available_quantity,
    COALESCE(r.issued_quantity, 0::numeric) AS issued_quantity,
    GREATEST(COALESCE(i.reorder_level, 0::numeric) - sb.quantity_on_hand, 0::numeric) AS reorder_shortfall,
    sb.quantity_on_hand <= COALESCE(i.reorder_level, 0::numeric) AS is_low_stock,
    sb.updated_at
   FROM inventory_stock_balances sb
     JOIN inventory_items i ON i.id = sb.item_id
     JOIN inventory_locations l ON l.id = sb.location_id
     LEFT JOIN ( SELECT inventory_reservation_lines.tenant_company_id,
            inventory_reservation_lines.inventory_item_id,
            inventory_reservation_lines.location_id,
            inventory_reservation_lines.lot_number,
            sum(GREATEST(inventory_reservation_lines.reserved_quantity - inventory_reservation_lines.released_quantity - inventory_reservation_lines.issued_quantity, 0::numeric)) AS reserved_quantity,
            sum(inventory_reservation_lines.issued_quantity) AS issued_quantity
           FROM inventory_reservation_lines
          WHERE inventory_reservation_lines.status = ANY (ARRAY['active'::text, 'partially_released'::text, 'fulfilled'::text])
          GROUP BY inventory_reservation_lines.tenant_company_id, inventory_reservation_lines.inventory_item_id, inventory_reservation_lines.location_id, inventory_reservation_lines.lot_number) r ON r.tenant_company_id = sb.tenant_company_id AND r.inventory_item_id = sb.item_id AND r.location_id = sb.location_id AND NOT r.lot_number IS DISTINCT FROM sb.lot_number;;
CREATE OR REPLACE VIEW public.inventory_reconciliation_v AS
 WITH ledger AS (
         SELECT inventory_stock_ledger_v.tenant_company_id,
            inventory_stock_ledger_v.item_id,
            inventory_stock_ledger_v.location_id,
            inventory_stock_ledger_v.lot_number,
            sum(inventory_stock_ledger_v.signed_quantity) AS ledger_quantity
           FROM inventory_stock_ledger_v
          GROUP BY inventory_stock_ledger_v.tenant_company_id, inventory_stock_ledger_v.item_id, inventory_stock_ledger_v.location_id, inventory_stock_ledger_v.lot_number
        ), balances AS (
         SELECT inventory_stock_balances.tenant_company_id,
            inventory_stock_balances.item_id,
            inventory_stock_balances.location_id,
            inventory_stock_balances.lot_number,
            inventory_stock_balances.quantity_on_hand
           FROM inventory_stock_balances
        )
 SELECT COALESCE(b.tenant_company_id, l.tenant_company_id) AS tenant_company_id,
    COALESCE(b.item_id, l.item_id) AS item_id,
    i.item_code,
    i.name AS item_name,
    COALESCE(b.location_id, l.location_id) AS location_id,
    loc.code AS location_code,
    loc.name AS location_name,
    COALESCE(b.lot_number, l.lot_number) AS lot_number,
    COALESCE(b.quantity_on_hand, 0::numeric) AS system_quantity_on_hand,
    COALESCE(l.ledger_quantity, 0::numeric) AS ledger_quantity,
    round(COALESCE(b.quantity_on_hand, 0::numeric) - COALESCE(l.ledger_quantity, 0::numeric), 6) AS variance_quantity,
        CASE
            WHEN round(COALESCE(b.quantity_on_hand, 0::numeric) - COALESCE(l.ledger_quantity, 0::numeric), 6) = 0::numeric THEN 'matched'::text
            ELSE 'variance'::text
        END AS reconciliation_status
   FROM balances b
     FULL JOIN ledger l ON l.tenant_company_id = b.tenant_company_id AND l.item_id = b.item_id AND l.location_id = b.location_id AND NOT l.lot_number IS DISTINCT FROM b.lot_number
     LEFT JOIN inventory_items i ON i.id = COALESCE(b.item_id, l.item_id)
     LEFT JOIN inventory_locations loc ON loc.id = COALESCE(b.location_id, l.location_id);;
CREATE OR REPLACE VIEW public.inventory_stock_ledger_v AS
 WITH movement_rows AS (
         SELECT t.tenant_id,
            t.tenant_company_id,
            t.id AS transaction_id,
            t.transaction_no,
            t.transaction_date,
            t.transaction_type,
            t.from_location_id AS location_id,
            l.code AS location_code,
            l.name AS location_name,
            tl.item_id,
            i.item_code,
            i.name AS item_name,
            tl.lot_number,
            tl.expiry_date,
            tl.quantity,
            tl.unit_cost,
            tl.line_value,
            0::numeric AS quantity_in,
            tl.quantity AS quantity_out,
            - tl.quantity AS signed_quantity,
            t.reference_no,
            t.source_type,
            t.source_id,
            t.work_id,
            t.notes,
            t.created_at
           FROM inventory_transaction_lines tl
             JOIN inventory_transactions t ON t.id = tl.transaction_id
             JOIN inventory_items i ON i.id = tl.item_id
             JOIN inventory_locations l ON l.id = t.from_location_id
          WHERE t.from_location_id IS NOT NULL
        UNION ALL
         SELECT t.tenant_id,
            t.tenant_company_id,
            t.id,
            t.transaction_no,
            t.transaction_date,
            t.transaction_type,
            t.to_location_id,
            l.code,
            l.name,
            tl.item_id,
            i.item_code,
            i.name,
            tl.lot_number,
            tl.expiry_date,
            tl.quantity,
            tl.unit_cost,
            tl.line_value,
            tl.quantity,
            0::numeric AS "numeric",
            tl.quantity,
            t.reference_no,
            t.source_type,
            t.source_id,
            t.work_id,
            t.notes,
            t.created_at
           FROM inventory_transaction_lines tl
             JOIN inventory_transactions t ON t.id = tl.transaction_id
             JOIN inventory_items i ON i.id = tl.item_id
             JOIN inventory_locations l ON l.id = t.to_location_id
          WHERE t.to_location_id IS NOT NULL
        )
 SELECT tenant_id,
    tenant_company_id,
    transaction_id,
    transaction_no,
    transaction_date,
    transaction_type,
    location_id,
    location_code,
    location_name,
    item_id,
    item_code,
    item_name,
    lot_number,
    expiry_date,
    quantity,
    unit_cost,
    line_value,
    quantity_in,
    quantity_out,
    signed_quantity,
    reference_no,
    source_type,
    source_id,
    work_id,
    notes,
    created_at,
    sum(signed_quantity) OVER (PARTITION BY tenant_company_id, item_id, location_id, lot_number ORDER BY transaction_date, created_at, transaction_id, item_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_quantity
   FROM movement_rows m;;
-- OMITTED VIEW vault.decrypted_secrets: Supabase-managed schema

-- ==========================================
-- SECTION 13: MATERIALIZED VIEWS
-- ==========================================
-- (None captured)

-- ==========================================
-- SECTION 14: FUNCTIONS
-- ==========================================
-- OMITTED FUNCTION auth.email: Supabase-managed schema
-- OMITTED FUNCTION auth.jwt: Supabase-managed schema
-- OMITTED FUNCTION auth.role: Supabase-managed schema
-- OMITTED FUNCTION auth.uid: Supabase-managed schema
-- OMITTED FUNCTION extensions.armor: Supabase-managed schema
-- OMITTED FUNCTION extensions.armor: Supabase-managed schema
-- OMITTED FUNCTION extensions.crypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.dearmor: Supabase-managed schema
-- OMITTED FUNCTION extensions.decrypt_iv: Supabase-managed schema
-- OMITTED FUNCTION extensions.decrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.digest: Supabase-managed schema
-- OMITTED FUNCTION extensions.digest: Supabase-managed schema
-- OMITTED FUNCTION extensions.encrypt_iv: Supabase-managed schema
-- OMITTED FUNCTION extensions.encrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.gen_random_bytes: Supabase-managed schema
-- OMITTED FUNCTION extensions.gen_random_uuid: Supabase-managed schema
-- OMITTED FUNCTION extensions.gen_salt: Supabase-managed schema
-- OMITTED FUNCTION extensions.gen_salt: Supabase-managed schema
-- OMITTED FUNCTION extensions.grant_pg_cron_access: Supabase-managed schema
-- OMITTED FUNCTION extensions.grant_pg_graphql_access: Supabase-managed schema
-- OMITTED FUNCTION extensions.grant_pg_net_access: Supabase-managed schema
-- OMITTED FUNCTION extensions.hmac: Supabase-managed schema
-- OMITTED FUNCTION extensions.hmac: Supabase-managed schema
-- OMITTED FUNCTION extensions.pg_stat_statements_info: Supabase-managed schema
-- OMITTED FUNCTION extensions.pg_stat_statements_reset: Supabase-managed schema
-- OMITTED FUNCTION extensions.pg_stat_statements: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_armor_headers: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_key_id: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_decrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_decrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_decrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_decrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_decrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_decrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_encrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_encrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_encrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_pub_encrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_sym_decrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_sym_decrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_sym_decrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_sym_decrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_sym_encrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_sym_encrypt_bytea: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_sym_encrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgp_sym_encrypt: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgrst_ddl_watch: Supabase-managed schema
-- OMITTED FUNCTION extensions.pgrst_drop_watch: Supabase-managed schema
-- OMITTED FUNCTION extensions.set_graphql_placeholder: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_generate_v1: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_generate_v1mc: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_generate_v3: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_generate_v4: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_generate_v5: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_nil: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_ns_dns: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_ns_oid: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_ns_url: Supabase-managed schema
-- OMITTED FUNCTION extensions.uuid_ns_x500: Supabase-managed schema
-- OMITTED FUNCTION graphql_public.graphql: Supabase-managed schema
CREATE OR REPLACE FUNCTION private.calculate_employee_tds_internal(p_tenant_id uuid, p_tenant_company_id uuid, p_employee_id uuid, p_payroll_run_id uuid, p_payroll_run_item_id uuid, p_payroll_period_id uuid, p_tax_year text, p_current_gross numeric)
 RETURNS TABLE(monthly_tds numeric, snapshot_json jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_period public.payroll_periods%rowtype; v_emp public.employees%rowtype; v_dec public.payroll_tax_declarations%rowtype; v_tax_regime text; v_residency text:='resident'; v_age integer; v_age_band text; v_fy_start date; v_fy_end date; v_total_periods integer; v_remaining_periods integer; v_ytd_gross numeric:=0; v_ytd_tds numeric:=0; v_current_hra numeric:=0; v_ytd_hra numeric:=0; v_current_basic_da numeric:=0; v_ytd_basic_da numeric:=0; v_future_gross numeric:=0; v_future_hra numeric:=0; v_future_basic_da numeric:=0; v_future_periods integer:=0; v_salary_income numeric:=0; v_previous_income numeric:=0; v_previous_tds numeric:=0; v_other_income numeric:=0; v_total_income numeric:=0; v_standard_deduction numeric:=0; v_hra_exemption numeric:=0; v_chapter_via numeric:=0; v_home_loan numeric:=0; v_taxable_income numeric:=0; v_slab_tax numeric:=0; v_rebate numeric:=0; v_surcharge numeric:=0; v_marginal_relief numeric:=0; v_87a_marginal_relief numeric:=0; v_cess numeric:=0; v_annual_tax numeric:=0; v_remaining_tax numeric:=0; v_monthly_tds numeric:=0; v_rent numeric:=0; v_is_metro boolean:=false; v_80c numeric:=0; v_80d numeric:=0; v_80ccd1b numeric:=0; v_80e numeric:=0; v_80tta numeric:=0; v_80ttb numeric:=0; v_rule record; v_default_regime text; v_slabs jsonb; v_surcharge_slabs jsonb; v_rebate_config jsonb; v_cess_rate numeric; v_upper numeric; v_lower numeric; v_rate numeric; v_tax_at_threshold numeric; v_surcharge_at_threshold numeric; v_threshold numeric; v_best_relief numeric:=0; v_candidate numeric; v_component record; v_declaration_status text:='missing'; v_rule_version text; v_applicable_act text; v_tds_section text; begin if p_tax_year is null or p_tax_year !~ '^[0-9]{4}-[0-9]{4}$' then raise exception using errcode='P0301',message='INVALID_TAX_YEAR'; end if; select * into v_period from public.payroll_periods where id=p_payroll_period_id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id; if not found then raise exception using errcode='P0302',message='PAYROLL_PERIOD_NOT_FOUND_FOR_TDS'; end if; v_fy_start:=to_date(left(p_tax_year,4)||'-04-01','YYYY-MM-DD'); v_fy_end:=to_date(right(p_tax_year,4)||'-03-31','YYYY-MM-DD'); if v_period.pay_date<v_fy_start or v_period.pay_date>v_fy_end then raise exception using errcode='P0303',message='PAYROLL_PAYMENT_DATE_OUTSIDE_TAX_YEAR'; end if; if v_period.pay_date>=date '2026-04-01' then v_applicable_act:='Income Tax Act, 2025'; v_tds_section:='392(1)'; else v_applicable_act:='Income Tax Act, 1961'; v_tds_section:='192'; end if; select * into v_emp from public.employees where id=p_employee_id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id; if not found then raise exception using errcode='P0304',message='EMPLOYEE_NOT_FOUND_FOR_TDS'; end if; if v_emp.date_of_birth is not null then v_age:=extract(year from age(v_fy_end,v_emp.date_of_birth)); end if; if v_age is null or v_age<60 then v_age_band:='regular'; elsif v_age<80 then v_age_band:='senior'; else v_age_band:='super_senior'; end if; select d.* into v_dec from public.payroll_tax_declarations d where d.tenant_id=p_tenant_id and d.tenant_company_id=p_tenant_company_id and d.employee_id=p_employee_id and d.tax_year=p_tax_year and d.declaration_status='approved' order by d.updated_at desc,d.created_at desc limit 1; if found then v_declaration_status:=v_dec.declaration_status; v_tax_regime:=nullif(v_dec.tax_regime,''); v_residency:=coalesce(nullif(v_dec.residency_status,''),'resident'); v_other_income:=coalesce(v_dec.other_income,0); end if; if v_tax_regime is null then select r.rule_config->>'default_regime' into v_default_regime from public.payroll_tds_tax_rules r where r.tenant_id=p_tenant_id and (r.tenant_company_id=p_tenant_company_id or r.tenant_company_id is null) and r.tax_year=p_tax_year and r.rule_type='calculation' and r.rule_code='default_regime' and r.is_active and r.effective_from<=v_period.pay_date and (r.effective_to is null or r.effective_to>=v_period.pay_date) order by (r.tenant_company_id is not null) desc,r.effective_from desc,r.updated_at desc limit 1; if v_default_regime is null then raise exception using errcode='P0305',message='TDS_DEFAULT_REGIME_RULE_NOT_CONFIGURED'; end if; v_tax_regime:=case when v_default_regime in ('new','new_regime') then 'new' when v_default_regime in ('old','old_regime') then 'old' else v_default_regime end; end if; if v_tax_regime not in ('new','old') then raise exception using errcode='P0306',message='INVALID_TAX_REGIME'; end if; if v_tax_regime='old' and lower(v_residency)<>'resident' then v_age_band:='regular'; end if; select r.id::text into v_rule_version from public.payroll_tds_tax_rules r where r.tenant_id=p_tenant_id and (r.tenant_company_id=p_tenant_company_id or r.tenant_company_id is null) and r.tax_year=p_tax_year and r.tax_regime=v_tax_regime and r.rule_type='slab' and r.rule_code=(case when v_tax_regime='new' then 'income_tax_slabs_new' else 'income_tax_slabs_old_'||v_age_band end) and r.is_active and r.effective_from<=v_period.pay_date and (r.effective_to is null or r.effective_to>=v_period.pay_date) and (r.age_band is null or r.age_band=v_age_band) order by (r.tenant_company_id is not null) desc,(r.age_band is not null) desc,r.effective_from desc,r.updated_at desc limit 1; if v_rule_version is null then raise exception using errcode='P0307',message='TDS_INCOME_TAX_SLAB_RULE_NOT_CONFIGURED'; end if; select count(*) into v_total_periods from public.payroll_periods p where p.tenant_id=p_tenant_id and p.tenant_company_id=p_tenant_company_id and p.pay_date between v_fy_start and v_fy_end; if v_total_periods=0 then raise exception using errcode='P0308',message='NO_PAYROLL_PERIODS_CONFIGURED_FOR_TAX_YEAR'; end if; select count(*) into v_remaining_periods from public.payroll_periods p where p.tenant_id=p_tenant_id and p.tenant_company_id=p_tenant_company_id and p.pay_date between v_fy_start and v_fy_end and p.pay_date>=v_period.pay_date and p.pay_date>=v_emp.joining_date and (v_emp.exit_date is null or p.pay_date<=v_emp.exit_date); v_remaining_periods:=greatest(v_remaining_periods,1); with latest as (select distinct on(r.payroll_period_id) r.id from public.payroll_runs r join public.payroll_periods p on p.id=r.payroll_period_id where r.tenant_id=p_tenant_id and r.tenant_company_id=p_tenant_company_id and p.pay_date between v_fy_start and v_fy_end and p.pay_date<v_period.pay_date and r.id<>p_payroll_run_id and r.status in('calculated','approved','posted','paid') order by r.payroll_period_id,p.pay_date desc,r.calculated_at desc nulls last,r.created_at desc) select coalesce(sum(i.gross_earnings),0),coalesce(sum(coalesce((i.calculation_snapshot->>'tds_amount')::numeric,0)),0) into v_ytd_gross,v_ytd_tds from latest l join public.payroll_run_items i on i.payroll_run_id=l.id and i.employee_id=p_employee_id; select coalesce(sum(rc.amount) filter(where upper(c.code)='HRA'),0),coalesce(sum(rc.amount) filter(where upper(c.code) in('BASIC','DA')),0) into v_current_hra,v_current_basic_da from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=p_payroll_run_item_id; with latest as (select distinct on(r.payroll_period_id) r.id from public.payroll_runs r join public.payroll_periods p on p.id=r.payroll_period_id where r.tenant_id=p_tenant_id and r.tenant_company_id=p_tenant_company_id and p.pay_date between v_fy_start and v_fy_end and p.pay_date<v_period.pay_date and r.id<>p_payroll_run_id and r.status in('calculated','approved','posted','paid') order by r.payroll_period_id,p.pay_date desc,r.calculated_at desc nulls last,r.created_at desc) select coalesce(sum(rc.amount) filter(where upper(c.code)='HRA'),0),coalesce(sum(rc.amount) filter(where upper(c.code) in('BASIC','DA')),0) into v_ytd_hra,v_ytd_basic_da from latest l join public.payroll_run_items i on i.payroll_run_id=l.id and i.employee_id=p_employee_id join public.payroll_run_item_components rc on rc.payroll_run_item_id=i.id join public.payroll_components c on c.id=rc.payroll_component_id; select count(*) into v_future_periods from public.payroll_periods p where p.tenant_id=p_tenant_id and p.tenant_company_id=p_tenant_company_id and p.pay_date between v_fy_start and v_fy_end and p.pay_date>v_period.pay_date and p.pay_date>=v_emp.joining_date and (v_emp.exit_date is null or p.pay_date<=v_emp.exit_date); v_future_gross:=greatest(p_current_gross,0)*v_future_periods; v_future_hra:=greatest(v_current_hra,0)*v_future_periods; v_future_basic_da:=greatest(v_current_basic_da,0)*v_future_periods; v_salary_income:=greatest(v_ytd_gross,0)+greatest(p_current_gross,0)+v_future_gross; if v_dec.id is not null then select coalesce(sum(pe.salary_income),0),coalesce(sum(pe.tds_deducted),0) into v_previous_income,v_previous_tds from public.payroll_tax_previous_employers pe where pe.tenant_id=p_tenant_id and pe.tenant_company_id=p_tenant_company_id and pe.tax_declaration_id=v_dec.id; if v_previous_income=0 then v_previous_income:=coalesce(v_dec.previous_employer_income,0); end if; if v_previous_tds=0 then v_previous_tds:=coalesce(v_dec.previous_employer_tds,0); end if; v_rent:=coalesce(nullif(v_dec.hra_data->>'rent_paid','')::numeric,nullif(v_dec.hra_data->>'annual_rent','')::numeric,0); v_is_metro:=coalesce((v_dec.hra_data->>'is_metro')::boolean,(v_dec.hra_data->>'metro')::boolean,false); v_80c:=coalesce(nullif(v_dec.deduction_data->>'section_80c','')::numeric,0); v_80d:=coalesce(nullif(v_dec.deduction_data->>'section_80d','')::numeric,0); v_80ccd1b:=coalesce(nullif(v_dec.deduction_data->>'section_80ccd1b','')::numeric,0); v_80e:=coalesce(nullif(v_dec.deduction_data->>'section_80e','')::numeric,0); v_80tta:=coalesce(nullif(v_dec.deduction_data->>'section_80tta','')::numeric,0); v_80ttb:=coalesce(nullif(v_dec.deduction_data->>'section_80ttb','')::numeric,0); v_home_loan:=coalesce(v_dec.home_loan_interest,0); end if; v_total_income:=greatest(v_salary_income+v_previous_income+v_other_income,0); select coalesce(r.rule_value,0),r.id::text into v_standard_deduction,v_rule_version from public.payroll_tds_tax_rules r where r.tenant_id=p_tenant_id and (r.tenant_company_id=p_tenant_company_id or r.tenant_company_id is null) and r.tax_year=p_tax_year and r.tax_regime=v_tax_regime and r.rule_type='standard_deduction' and r.rule_code=('standard_deduction_'||v_tax_regime) and r.is_active and r.effective_from<=v_period.pay_date and (r.effective_to is null or r.effective_to>=v_period.pay_date) order by (r.tenant_company_id is not null) desc,r.effective_from desc,r.updated_at desc limit 1; if v_standard_deduction is null then raise exception using errcode='P0309',message='TDS_STANDARD_DEDUCTION_RULE_NOT_CONFIGURED'; end if; v_standard_deduction:=least(v_standard_deduction,v_salary_income+v_previous_income); if v_tax_regime='old' and v_declaration_status='approved' then v_hra_exemption:=greatest(least(v_ytd_hra+v_current_hra+v_future_hra,greatest(v_rent-0.10*(v_ytd_basic_da+v_current_basic_da+v_future_basic_da),0)),0); v_hra_exemption:=least(v_hra_exemption,(v_ytd_basic_da+v_current_basic_da+v_future_basic_da)*case when v_is_metro then 0.50 else 0.40 end); v_hra_exemption:=least(v_hra_exemption,v_ytd_hra+v_current_hra+v_future_hra); v_80c:=least(greatest(v_80c,0),150000); v_80ccd1b:=least(greatest(v_80ccd1b,0),50000); v_80d:=least(greatest(v_80d,0),100000); v_80tta:=least(greatest(v_80tta,0),10000); v_80ttb:=least(greatest(v_80ttb,0),50000); v_chapter_via:=v_80c+v_80d+v_80ccd1b+v_80e+v_80tta+v_80ttb; v_home_loan:=least(greatest(v_home_loan,0),200000); else v_hra_exemption:=0; v_chapter_via:=0; v_home_loan:=0; end if; v_taxable_income:=greatest(round(v_total_income-v_standard_deduction-v_hra_exemption-v_chapter_via-v_home_loan,0),0); select r.rule_config->'slabs',r.id::text into v_slabs,v_rule_version from public.payroll_tds_tax_rules r where r.tenant_id=p_tenant_id and (r.tenant_company_id=p_tenant_company_id or r.tenant_company_id is null) and r.tax_year=p_tax_year and r.tax_regime=v_tax_regime and r.rule_type='slab' and r.rule_code=(case when v_tax_regime='new' then 'income_tax_slabs_new' else 'income_tax_slabs_old_'||v_age_band end) and r.is_active and r.effective_from<=v_period.pay_date and (r.effective_to is null or r.effective_to>=v_period.pay_date) and (r.age_band is null or r.age_band=v_age_band) order by (r.tenant_company_id is not null) desc,(r.age_band is not null) desc,r.effective_from desc,r.updated_at desc limit 1; if v_slabs is null then raise exception using errcode='P0310',message='TDS_SLAB_CONFIGURATION_NOT_FOUND'; end if; v_lower:=0;v_slab_tax:=0; for v_rule in select value from jsonb_array_elements(v_slabs) loop v_upper:=nullif(v_rule.value->>'up_to','')::numeric;v_rate:=coalesce((v_rule.value->>'rate')::numeric,0)/100;if v_upper is null then v_slab_tax:=v_slab_tax+greatest(v_taxable_income-v_lower,0)*v_rate;exit;end if;v_slab_tax:=v_slab_tax+greatest(least(v_taxable_income,v_upper)-v_lower,0)*v_rate;v_lower:=v_upper;if v_taxable_income<=v_upper then exit;end if;end loop;v_slab_tax:=round(greatest(v_slab_tax,0),0); select r.rule_config into v_rebate_config from public.payroll_tds_tax_rules r where r.tenant_id=p_tenant_id and (r.tenant_company_id=p_tenant_company_id or r.tenant_company_id is null) and r.tax_year=p_tax_year and r.tax_regime=v_tax_regime and r.rule_type='rebate' and r.rule_code=('rebate_87a_'||v_tax_regime) and r.is_active and r.effective_from<=v_period.pay_date and (r.effective_to is null or r.effective_to>=v_period.pay_date) order by (r.tenant_company_id is not null) desc,r.effective_from desc,r.updated_at desc limit 1;if v_rebate_config is null then raise exception using errcode='P0311',message='TDS_REBATE_RULE_NOT_CONFIGURED';end if;if lower(v_residency)='resident' and v_taxable_income<=coalesce((v_rebate_config->>'income_limit')::numeric,0) then v_rebate:=least(v_slab_tax,coalesce((v_rebate_config->>'max_amount')::numeric,0));end if;v_slab_tax:=greatest(v_slab_tax-v_rebate,0);v_87a_marginal_relief:=0;if v_tax_regime='new' and lower(v_residency)='resident' and v_taxable_income>coalesce((v_rebate_config->>'income_limit')::numeric,1200000) then v_87a_marginal_relief:=greatest(v_slab_tax-(v_taxable_income-coalesce((v_rebate_config->>'income_limit')::numeric,1200000)),0);v_slab_tax:=greatest(v_slab_tax-v_87a_marginal_relief,0);end if; select r.rule_config into v_surcharge_slabs from public.payroll_tds_tax_rules r where r.tenant_id=p_tenant_id and (r.tenant_company_id=p_tenant_company_id or r.tenant_company_id is null) and r.tax_year=p_tax_year and r.tax_regime=v_tax_regime and r.rule_type='surcharge' and r.rule_code=('surcharge_'||v_tax_regime) and r.is_active and r.effective_from<=v_period.pay_date and (r.effective_to is null or r.effective_to>=v_period.pay_date) order by (r.tenant_company_id is not null) desc,r.effective_from desc,r.updated_at desc limit 1;if v_surcharge_slabs is null then raise exception using errcode='P0312',message='TDS_SURCHARGE_RULE_NOT_CONFIGURED';end if;select coalesce((x.value->>'rate')::numeric,0)/100 into v_rate from jsonb_array_elements(v_surcharge_slabs->'slabs') x where v_taxable_income>=coalesce((x.value->>'threshold')::numeric,0) order by (x.value->>'threshold')::numeric desc limit 1;v_surcharge:=round(v_slab_tax*coalesce(v_rate,0),0);for v_rule in select value from jsonb_array_elements(v_surcharge_slabs->'slabs') where (value->>'threshold')::numeric>0 order by (value->>'threshold')::numeric loop v_threshold:=(v_rule.value->>'threshold')::numeric;if v_taxable_income>v_threshold then v_lower:=0;v_tax_at_threshold:=0;for v_component in select value from jsonb_array_elements(v_slabs) loop v_upper:=nullif(v_component.value->>'up_to','')::numeric;v_rate:=coalesce((v_component.value->>'rate')::numeric,0)/100;if v_upper is null then v_tax_at_threshold:=v_tax_at_threshold+greatest(v_threshold-v_lower,0)*v_rate;exit;end if;v_tax_at_threshold:=v_tax_at_threshold+greatest(least(v_threshold,v_upper)-v_lower,0)*v_rate;v_lower:=v_upper;if v_threshold<=v_upper then exit;end if;end loop;select coalesce((x.value->>'rate')::numeric,0)/100 into v_rate from jsonb_array_elements(v_surcharge_slabs->'slabs') x where v_threshold>=coalesce((x.value->>'threshold')::numeric,0) order by (x.value->>'threshold')::numeric desc limit 1;v_surcharge_at_threshold:=v_tax_at_threshold*v_rate;v_candidate:=greatest((v_slab_tax+v_surcharge)-(v_tax_at_threshold+v_surcharge_at_threshold+(v_taxable_income-v_threshold)),0);if v_candidate>v_best_relief then v_best_relief:=v_candidate;end if;end if;end loop;v_marginal_relief:=round(v_best_relief,0);v_surcharge:=greatest(v_surcharge-v_marginal_relief,0);select coalesce(r.rule_value,0)/100 into v_cess_rate from public.payroll_tds_tax_rules r where r.tenant_id=p_tenant_id and (r.tenant_company_id=p_tenant_company_id or r.tenant_company_id is null) and r.tax_year=p_tax_year and r.rule_type='cess' and r.rule_code=('health_education_cess_'||v_tax_regime) and r.is_active and r.effective_from<=v_period.pay_date and (r.effective_to is null or r.effective_to>=v_period.pay_date) order by (r.tenant_company_id is not null) desc,r.effective_from desc,r.updated_at desc limit 1;if v_cess_rate is null then raise exception using errcode='P0313',message='TDS_CESS_RULE_NOT_CONFIGURED';end if;v_cess:=round((v_slab_tax+v_surcharge)*v_cess_rate,0);v_annual_tax:=greatest(round(v_slab_tax+v_surcharge+v_cess,0),0);v_remaining_tax:=greatest(v_annual_tax-v_ytd_tds-v_previous_tds,0);v_monthly_tds:=round(v_remaining_tax/greatest(v_remaining_periods,1),0);snapshot_json:=jsonb_build_object('tax_year',p_tax_year,'applicable_act',v_applicable_act,'tds_section',v_tds_section,'tax_regime',v_tax_regime,'rule_version_id',v_rule_version,'declaration_id',case when v_dec.id is null then null else v_dec.id end,'declaration_status',v_declaration_status,'residency_status',v_residency,'employee_age',v_age,'employee_age_band',v_age_band,'current_period_gross',round(p_current_gross,2),'ytd_gross_payroll',round(v_ytd_gross,2),'projected_future_gross',round(v_future_gross,2),'other_income',round(v_other_income,2),'previous_employer_income',round(v_previous_income,2),'total_projected_gross',round(v_total_income,2),'standard_deduction',round(v_standard_deduction,2),'hra_exemption',round(v_hra_exemption,2),'chapter_6a_deductions',round(v_chapter_via,2),'home_loan_interest_deduction',round(v_home_loan,2),'net_taxable_income',round(v_taxable_income,2),'slab_tax_amount',round(v_slab_tax+v_rebate+v_87a_marginal_relief,2),'slab_tax_after_rebate_and_marginal_relief',round(v_slab_tax,2),'marginal_relief_87a',round(v_87a_marginal_relief,2),'rebate_87a',round(v_rebate,2),'surcharge_amount',round(v_surcharge,2),'marginal_relief',round(v_marginal_relief,2),'health_education_cess',round(v_cess,2),'total_annual_tax_liability',round(v_annual_tax,2),'ytd_tds_deducted',round(v_ytd_tds,2),'previous_employer_tds',round(v_previous_tds,2),'remaining_tax_liability',round(v_remaining_tax,2),'total_pay_periods_in_tax_year',v_total_periods,'remaining_pay_periods',v_remaining_periods,'current_period_tds',round(v_monthly_tds,2),'tds_amount',round(v_monthly_tds,2),'engine_version','TDS-P0-2026.09.13.5');monthly_tds:=v_monthly_tds;return next;end;$function$
;

CREATE OR REPLACE FUNCTION private.can_manage_membership(check_tenant_id uuid, target_role text, existing_role text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    caller_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
    IF check_tenant_id IS NULL THEN RETURN FALSE; END IF;
    
    SELECT role INTO caller_role FROM public.tenant_memberships 
    WHERE user_id = auth.uid() AND tenant_id = check_tenant_id AND status = 'active';
    
    IF caller_role IS NULL THEN RETURN FALSE; END IF;
    IF caller_role = 'OWNER' THEN RETURN TRUE; END IF;
    
    -- ADMIN can manage memberships EXCEPT creating, modifying, or deleting OWNER roles
    IF caller_role = 'ADMIN' THEN
        IF target_role = 'OWNER' OR pg_catalog.coalesce(existing_role, '') = 'OWNER' THEN
            RETURN FALSE;
        END IF;
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.cascade_project_assignment_termination()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    v_ending_actor UUID;
BEGIN
    IF OLD.status = 'active' AND NEW.status = 'ended' THEN
        -- Resolve ending actor from auth.uid() context
        v_ending_actor := auth.uid();
        
        IF v_ending_actor IS NULL THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Cannot cascade project assignment termination without an authenticated ending actor (auth.uid() is NULL).';
        END IF;

        -- Automatically terminate all active stage assignments for same (work_id, user_id)
        -- Preserves the exact authenticated actor who terminated the project assignment!
        UPDATE public.stage_assignments
        SET status = 'ended',
            ended_by = v_ending_actor,
            ended_at = COALESCE(NEW.ended_at, now())
        WHERE work_id = NEW.work_id
          AND user_id = NEW.user_id
          AND status = 'active';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.enforce_last_owner_protection()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    active_owner_count INT;
BEGIN
    -- Handle DELETE of an active OWNER
    IF TG_OP = 'DELETE' THEN
        IF OLD.role = 'OWNER' AND OLD.status = 'active' THEN
            SELECT count(*) INTO active_owner_count
            FROM public.tenant_memberships
            WHERE tenant_id = OLD.tenant_id AND role = 'OWNER' AND status = 'active';

            IF active_owner_count <= 1 THEN
                RAISE EXCEPTION 'SECURITY VIOLATION: Cannot delete the last active OWNER of a tenant.';
            END IF;
        END IF;
        RETURN OLD;
    END IF;

    -- Handle UPDATE of an active OWNER where role is demoted or status is changed away from active
    IF TG_OP = 'UPDATE' THEN
        IF OLD.role = 'OWNER' AND OLD.status = 'active' THEN
            IF NEW.role <> 'OWNER' OR NEW.status <> 'active' THEN
                SELECT count(*) INTO active_owner_count
                FROM public.tenant_memberships
                WHERE tenant_id = OLD.tenant_id AND role = 'OWNER' AND status = 'active';

                IF active_owner_count <= 1 THEN
                    RAISE EXCEPTION 'SECURITY VIOLATION: Cannot demote or deactivate the last active OWNER of a tenant.';
                END IF;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.enforce_profiles_role_protection()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- For UPDATE: Prevent authenticated API callers (auth.uid() IS NOT NULL) from altering profiles.role
    IF TG_OP = 'UPDATE' THEN
        IF auth.uid() IS NOT NULL AND NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Direct modification of profiles.role is forbidden for authenticated users.';
        END IF;
    END IF;

    -- For INSERT: Force self-inserted profiles by authenticated API callers (auth.uid() IS NOT NULL) to safe default 'guest'
    IF TG_OP = 'INSERT' THEN
        IF auth.uid() IS NOT NULL THEN
            IF NEW.role IS NULL OR NEW.role <> 'guest' THEN
                NEW.role := 'guest';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.enforce_project_assignments_active_membership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- 1. Verify assigned user has an ACTIVE membership in the target Tenant at time of assignment creation
    IF NOT EXISTS (
        SELECT 1 FROM public.tenant_memberships
        WHERE tenant_id = NEW.tenant_id 
          AND user_id = NEW.user_id 
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: Assigned user (%) is not an active member of tenant (%).', NEW.user_id, NEW.tenant_id;
    END IF;

    -- 2. Verify assigned_by user (if non-null) has an ACTIVE membership in SAME target Tenant at time of assignment creation
    IF NEW.assigned_by IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.tenant_memberships
            WHERE tenant_id = NEW.tenant_id 
              AND user_id = NEW.assigned_by 
              AND status = 'active'
        ) THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Assigning user (assigned_by %) is not an active member of tenant (%).', NEW.assigned_by, NEW.tenant_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.enforce_project_assignments_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- 1. Prevent modification of core identity and creation fields on UPDATE
    IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: tenant_id is immutable on project_assignments.';
    END IF;
    IF NEW.tenant_company_id IS DISTINCT FROM OLD.tenant_company_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: tenant_company_id is immutable on project_assignments.';
    END IF;
    IF NEW.work_id IS DISTINCT FROM OLD.work_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: work_id is immutable on project_assignments.';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: user_id is immutable on project_assignments.';
    END IF;
    IF NEW.assigned_at IS DISTINCT FROM OLD.assigned_at THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: assigned_at is immutable on project_assignments.';
    END IF;
    IF NEW.assigned_by IS DISTINCT FROM OLD.assigned_by THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: assigned_by is immutable on project_assignments.';
    END IF;

    -- 2. Lifecycle State Machine & Role Locking Rules
    -- Rule A: REJECT reactivation (ended -> active)
    IF OLD.status = 'ended' AND NEW.status = 'active' THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: An ended project assignment cannot be reactivated. Create a new assignment row instead.';
    END IF;

    -- Rule B: Transition from active -> ended
    IF OLD.status = 'active' AND NEW.status = 'ended' THEN
        -- Auto-set ended_at timestamp if not explicitly provided
        IF NEW.ended_at IS NULL THEN
            NEW.ended_at := now();
        END IF;
    END IF;

    -- Rule C: Once ended, ended_at timestamp is immutable
    IF OLD.status = 'ended' AND NEW.ended_at IS DISTINCT FROM OLD.ended_at THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: ended_at timestamp is immutable once an assignment has ended.';
    END IF;

    -- Rule D: Once ended, project_role is immutable (prevents rewriting historical role attribution)
    IF OLD.status = 'ended' AND NEW.project_role IS DISTINCT FROM OLD.project_role THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: project_role is immutable once an assignment has ended.';
    END IF;

    -- Auto-update updated_at timestamp
    NEW.updated_at := now();

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.enforce_stage_assignments_active_membership()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- 1. Enforce assigned_by attribution integrity: For API calls, assigned_by MUST match auth.uid()
    IF auth.uid() IS NOT NULL THEN
        IF NEW.assigned_by IS NULL THEN
            NEW.assigned_by := auth.uid();
        ELSIF NEW.assigned_by IS DISTINCT FROM auth.uid() THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: assigned_by (%) must match authenticated user (%). False attribution is forbidden.', NEW.assigned_by, auth.uid();
        END IF;
    END IF;

    -- 2. Verify assigned user has an ACTIVE membership in target Tenant
    IF NOT EXISTS (
        SELECT 1 FROM public.tenant_memberships
        WHERE tenant_id = NEW.tenant_id 
          AND user_id = NEW.user_id 
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: Assigned user (%) is not an active member of tenant (%).', NEW.user_id, NEW.tenant_id;
    END IF;

    -- 3. Verify assigned_by user (if non-null) has an ACTIVE membership in target Tenant
    IF NEW.assigned_by IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.tenant_memberships
            WHERE tenant_id = NEW.tenant_id 
              AND user_id = NEW.assigned_by 
              AND status = 'active'
        ) THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Assigning user (assigned_by %) is not an active member of tenant (%).', NEW.assigned_by, NEW.tenant_id;
        END IF;
    END IF;

    -- 4. Verify assigned user has an ACTIVE project_assignment for target work OR assigned_by is a Manager/Admin
    IF NOT EXISTS (
        SELECT 1 FROM public.project_assignments
        WHERE work_id = NEW.work_id 
          AND user_id = NEW.user_id 
          AND status = 'active'
    ) AND NOT EXISTS (
        SELECT 1 FROM public.tenant_memberships
        WHERE tenant_id = NEW.tenant_id
          AND user_id = NEW.user_id
          AND role IN ('owner', 'admin')
          AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: User (%) must be assigned to project (%) before being assigned to a stage.', NEW.user_id, NEW.work_id;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.enforce_stage_assignments_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    -- 1. Prevent modification of core identity and creation fields on UPDATE
    IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: tenant_id is immutable on stage_assignments.';
    END IF;
    IF NEW.tenant_company_id IS DISTINCT FROM OLD.tenant_company_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: tenant_company_id is immutable on stage_assignments.';
    END IF;
    IF NEW.work_id IS DISTINCT FROM OLD.work_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: work_id is immutable on stage_assignments.';
    END IF;
    IF NEW.stage_id IS DISTINCT FROM OLD.stage_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: stage_id is immutable on stage_assignments.';
    END IF;
    IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: user_id is immutable on stage_assignments.';
    END IF;
    IF NEW.assigned_at IS DISTINCT FROM OLD.assigned_at THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: assigned_at is immutable on stage_assignments.';
    END IF;
    IF NEW.assigned_by IS DISTINCT FROM OLD.assigned_by THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: assigned_by is immutable on stage_assignments.';
    END IF;

    -- 2. Lifecycle State Machine & Protection Rules
    -- Rule A: REJECT reactivation (ended -> active)
    IF OLD.status = 'ended' AND NEW.status = 'active' THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: An ended stage assignment cannot be reactivated. Create a new assignment row instead.';
    END IF;

    -- Rule B: Transition active -> ended
    IF OLD.status = 'active' AND NEW.status = 'ended' THEN
        -- Ensure ended_by is provided or auto-resolved from auth context
        IF NEW.ended_by IS NULL THEN
            IF auth.uid() IS NOT NULL THEN
                NEW.ended_by := auth.uid();
            ELSE
                RAISE EXCEPTION 'SECURITY VIOLATION: ended_by must be specified when ending a stage assignment.';
            END IF;
        END IF;

        -- Verify ended_by user has active membership in target tenant
        IF NOT EXISTS (
            SELECT 1 FROM public.tenant_memberships
            WHERE tenant_id = NEW.tenant_id 
              AND user_id = NEW.ended_by 
              AND status = 'active'
        ) THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Ending actor (ended_by %) is not an active member of tenant (%).', NEW.ended_by, NEW.tenant_id;
        END IF;

        -- Auto-set ended_at timestamp if not explicitly provided
        IF NEW.ended_at IS NULL THEN
            NEW.ended_at := now();
        END IF;
    END IF;

    -- Rule C: Once ended, ended_by timestamp and actor are immutable
    IF OLD.status = 'ended' AND NEW.ended_by IS DISTINCT FROM OLD.ended_by THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: ended_by actor is immutable once an assignment has ended.';
    END IF;
    IF OLD.status = 'ended' AND NEW.ended_at IS DISTINCT FROM OLD.ended_at THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: ended_at timestamp is immutable once an assignment has ended.';
    END IF;

    -- Rule D: Once ended, stage_role is immutable (prevents rewriting historical role attribution)
    IF OLD.status = 'ended' AND NEW.stage_role IS DISTINCT FROM OLD.stage_role THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: stage_role is immutable once an assignment has ended.';
    END IF;

    -- Auto-update updated_at timestamp
    NEW.updated_at := now();

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.enforce_stage_definitions_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    IF OLD.tenant_id <> NEW.tenant_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: tenant_id is immutable on stage_definitions.';
    END IF;
    IF OLD.tenant_company_id <> NEW.tenant_company_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: tenant_company_id is immutable on stage_definitions.';
    END IF;
    IF OLD.work_id <> NEW.work_id THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: work_id is immutable on stage_definitions.';
    END IF;
    IF OLD.created_by IS NOT NULL AND OLD.created_by <> NEW.created_by THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: created_by is immutable on stage_definitions.';
    END IF;
    IF OLD.created_at <> NEW.created_at THEN
        RAISE EXCEPTION 'SECURITY VIOLATION: created_at is immutable on stage_definitions.';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.enforce_tenancy_immutability()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    IF TG_TABLE_NAME = 'tenant_memberships' THEN
        IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Membership identity (tenant_id, user_id) cannot be changed via UPDATE on tenant_memberships.';
        END IF;
    ELSIF TG_TABLE_NAME = 'tenant_companies' THEN
        IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: tenant_id cannot be changed via UPDATE on tenant_companies.';
        END IF;
    ELSE
        IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id OR NEW.tenant_company_id IS DISTINCT FROM OLD.tenant_company_id THEN
            RAISE EXCEPTION 'SECURITY VIOLATION: Tenancy ownership (tenant_id, tenant_company_id) cannot be changed via UPDATE on %.', TG_TABLE_NAME;
        END IF;
    END IF;

    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.get_next_inventory_doc_number(p_company_id uuid, p_document_type text, p_document_date date)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_year integer := extract(year from p_document_date)::integer;
  v_number bigint;
  v_prefix text;
begin
  v_prefix := case p_document_type
    when 'opening' then 'INV-OPN'
    when 'receipt' then 'INV-REC'
    when 'issue' then 'INV-ISS'
    when 'transfer' then 'INV-TRF'
    when 'adjustment_in' then 'INV-ADJ-IN'
    when 'adjustment_out' then 'INV-ADJ-OUT'
    when 'return_in' then 'INV-RET-IN'
    when 'return_out' then 'INV-RET-OUT'
    when 'consumption' then 'INV-CNS'
    else 'INV-TXN'
  end;

  insert into public.inventory_document_sequences(tenant_company_id, document_type, document_year, next_number)
  values (p_company_id, p_document_type, v_year, 2)
  on conflict (tenant_company_id, document_type, document_year)
  do update set next_number = public.inventory_document_sequences.next_number + 1
  returning next_number - 1 into v_number;

  return v_prefix || '-' || v_year::text || '-' || lpad(v_number::text, 6, '0');
end;
$function$
;

CREATE OR REPLACE FUNCTION private.get_next_purchase_doc_number(p_tenant_id uuid, p_tenant_company_id uuid, p_doc_type text, p_fiscal_year text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_next bigint; v_prefix text;
begin
 if p_doc_type not in ('PR','RFQ','PO','GRN','PB') then raise exception 'Invalid procurement document type'; end if;
 v_prefix:=case p_doc_type when 'PR' then 'PR' when 'RFQ' then 'RFQ' when 'PO' then 'PO' when 'GRN' then 'GRN' when 'PB' then 'PB' end;
 insert into public.purchase_document_sequences(tenant_id,tenant_company_id,doc_type,fiscal_year,next_number) values(p_tenant_id,p_tenant_company_id,p_doc_type,p_fiscal_year,2) on conflict (tenant_id,tenant_company_id,doc_type,fiscal_year) do update set next_number=public.purchase_document_sequences.next_number+1 returning next_number into v_next;
 if v_next=2 then return v_prefix||'-'||p_fiscal_year||'-0001'; end if;
 return v_prefix||'-'||p_fiscal_year||'-'||lpad((v_next-1)::text,4,'0');
end $function$
;

CREATE OR REPLACE FUNCTION private.get_next_sales_doc_number(p_tenant_id uuid, p_tenant_company_id uuid, p_doc_type text, p_fiscal_year text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_next integer;
  v_prefix text;
BEGIN
  IF p_tenant_id IS NULL OR p_tenant_company_id IS NULL OR p_doc_type IS NULL OR p_fiscal_year IS NULL THEN
    RAISE EXCEPTION 'Sales document sequence parameters are required';
  END IF;

  v_prefix := CASE upper(p_doc_type)
    WHEN 'QUOTATION' THEN 'QT'
    WHEN 'SALES_ORDER' THEN 'SO'
    WHEN 'PROFORMA' THEN 'PI'
    WHEN 'TAX_INVOICE' THEN 'INV'
    ELSE NULL
  END;
  IF v_prefix IS NULL THEN RAISE EXCEPTION 'Unsupported sales document type'; END IF;

  INSERT INTO public.sales_document_sequences(tenant_id, tenant_company_id, doc_type, fiscal_year, current_val)
  VALUES (p_tenant_id, p_tenant_company_id, upper(p_doc_type), p_fiscal_year, 0)
  ON CONFLICT (tenant_id, tenant_company_id, doc_type, fiscal_year) DO NOTHING;

  SELECT current_val + 1 INTO v_next
  FROM public.sales_document_sequences
  WHERE tenant_id = p_tenant_id AND tenant_company_id = p_tenant_company_id
    AND doc_type = upper(p_doc_type) AND fiscal_year = p_fiscal_year
  FOR UPDATE;

  UPDATE public.sales_document_sequences
  SET current_val = v_next, updated_at = now()
  WHERE tenant_id = p_tenant_id AND tenant_company_id = p_tenant_company_id
    AND doc_type = upper(p_doc_type) AND fiscal_year = p_fiscal_year;

  RETURN v_prefix || '-' || p_fiscal_year || '-' || lpad(v_next::text, 4, '0');
END;
$function$
;

CREATE OR REPLACE FUNCTION private.has_action_permission(check_tenant_id uuid, required_role_level text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    user_role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
    IF check_tenant_id IS NULL THEN RETURN FALSE; END IF;
    IF required_role_level NOT IN ('OWNER', 'ADMIN', 'MANAGER', 'TEAM', 'VIEWER') THEN
        RETURN FALSE;
    END IF;
    
    SELECT role INTO user_role FROM public.tenant_memberships 
    WHERE user_id = auth.uid() AND tenant_id = check_tenant_id AND status = 'active';
    
    IF user_role IS NULL THEN RETURN FALSE; END IF;
    IF user_role = 'OWNER' THEN RETURN TRUE; END IF;
    IF user_role = 'ADMIN' AND required_role_level IN ('ADMIN', 'MANAGER', 'TEAM', 'VIEWER') THEN RETURN TRUE; END IF;
    IF user_role = 'MANAGER' AND required_role_level IN ('MANAGER', 'TEAM', 'VIEWER') THEN RETURN TRUE; END IF;
    IF user_role = 'TEAM' AND required_role_level IN ('TEAM', 'VIEWER') THEN RETURN TRUE; END IF;
    IF user_role = 'VIEWER' AND required_role_level = 'VIEWER' THEN RETURN TRUE; END IF;
    
    RETURN FALSE;
END;
$function$
;

CREATE OR REPLACE FUNCTION private.has_company_access(check_tenant_id uuid, check_company_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
    IF check_tenant_id IS NULL OR check_company_id IS NULL THEN RETURN FALSE; END IF;
    
    -- Explicitly verify check_company_id belongs to check_tenant_id
    IF NOT EXISTS (
        SELECT 1 FROM public.tenant_companies 
        WHERE id = check_company_id AND tenant_id = check_tenant_id AND status = 'active'
    ) THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1 
        FROM public.tenant_memberships tm
        LEFT JOIN public.user_company_access uca ON uca.membership_id = tm.id
        WHERE tm.user_id = auth.uid() 
          AND tm.tenant_id = check_tenant_id
          AND tm.status = 'active'
          AND (
              tm.role IN ('OWNER', 'ADMIN') 
              OR (uca.tenant_company_id = check_company_id AND uca.can_view = TRUE)
          )
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION private.is_tenant_member(check_tenant_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    IF auth.uid() IS NULL THEN RETURN FALSE; END IF;
    IF check_tenant_id IS NULL THEN RETURN FALSE; END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM public.tenant_memberships 
        WHERE user_id = auth.uid() AND tenant_id = check_tenant_id AND status = 'active'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION private.resolve_procurement_account(p_tenant_id uuid, p_tenant_company_id uuid, p_key text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_id uuid;
  v_count integer;
begin
  select count(*) into v_count
  from public.chart_of_accounts a
  where a.tenant_id=p_tenant_id
    and a.tenant_company_id=p_tenant_company_id
    and a.is_active=true
    and (
      lower(coalesce(a.account_subtype,'')) = lower(p_key)
      or (p_key='inventory_asset' and lower(coalesce(a.account_subtype,'')) in ('inventory','stock','stock_asset','inventory_asset'))
      or (p_key='grni_clearing' and lower(coalesce(a.account_subtype,'')) in ('grni','grni_clearing','goods_received_not_invoiced'))
      or (p_key='accounts_payable' and lower(coalesce(a.account_subtype,'')) in ('accounts_payable','payable','trade_payables','trade_payable'))
      or (p_key='purchase_expense' and lower(coalesce(a.account_subtype,'')) in ('purchase','purchase_expense','purchases'))
      or (p_key='purchase_price_variance' and lower(coalesce(a.account_subtype,'')) in ('ppv','purchase_price_variance','variance'))
      or (p_key='input_cgst' and lower(coalesce(a.account_subtype,'')) in ('input_cgst','cgst_input'))
      or (p_key='input_sgst' and lower(coalesce(a.account_subtype,'')) in ('input_sgst','sgst_input'))
      or (p_key='input_igst' and lower(coalesce(a.account_subtype,'')) in ('input_igst','igst_input'))
      or (p_key='cash' and lower(coalesce(a.account_subtype,'')) in ('cash','cash_account'))
      or (p_key='inventory_asset' and lower(a.account_name) like '%inventory%')
      or (p_key='grni_clearing' and lower(a.account_name) like '%grni%')
      or (p_key='accounts_payable' and (lower(a.account_name) like '%accounts payable%' or lower(a.account_name) like '%trade payable%'))
      or (p_key='purchase_expense' and lower(a.account_name) like '%purchase%')
      or (p_key='purchase_price_variance' and lower(a.account_name) like '%purchase price variance%')
      or (p_key='input_cgst' and lower(a.account_name) like '%input%cgst%')
      or (p_key='input_sgst' and lower(a.account_name) like '%input%sgst%')
      or (p_key='input_igst' and lower(a.account_name) like '%input%igst%')
      or (p_key='cash' and lower(a.account_name) like '%cash%')
    );
  if v_count <> 1 then raise exception 'COA mapping for % is missing or ambiguous (found % active accounts)', p_key, v_count; end if;
  select a.id into v_id
  from public.chart_of_accounts a
  where a.tenant_id=p_tenant_id and a.tenant_company_id=p_tenant_company_id and a.is_active=true
    and (
      lower(coalesce(a.account_subtype,'')) = lower(p_key)
      or (p_key='inventory_asset' and lower(coalesce(a.account_subtype,'')) in ('inventory','stock','stock_asset','inventory_asset'))
      or (p_key='grni_clearing' and lower(coalesce(a.account_subtype,'')) in ('grni','grni_clearing','goods_received_not_invoiced'))
      or (p_key='accounts_payable' and lower(coalesce(a.account_subtype,'')) in ('accounts_payable','payable','trade_payables','trade_payable'))
      or (p_key='purchase_expense' and lower(coalesce(a.account_subtype,'')) in ('purchase','purchase_expense','purchases'))
      or (p_key='purchase_price_variance' and lower(coalesce(a.account_subtype,'')) in ('ppv','purchase_price_variance','variance'))
      or (p_key='input_cgst' and lower(coalesce(a.account_subtype,'')) in ('input_cgst','cgst_input'))
      or (p_key='input_sgst' and lower(coalesce(a.account_subtype,'')) in ('input_sgst','sgst_input'))
      or (p_key='input_igst' and lower(coalesce(a.account_subtype,'')) in ('input_igst','igst_input'))
      or (p_key='cash' and lower(coalesce(a.account_subtype,'')) in ('cash','cash_account'))
      or (p_key='inventory_asset' and lower(a.account_name) like '%inventory%')
      or (p_key='grni_clearing' and lower(a.account_name) like '%grni%')
      or (p_key='accounts_payable' and (lower(a.account_name) like '%accounts payable%' or lower(a.account_name) like '%trade payable%'))
      or (p_key='purchase_expense' and lower(a.account_name) like '%purchase%')
      or (p_key='purchase_price_variance' and lower(a.account_name) like '%purchase price variance%')
      or (p_key='input_cgst' and lower(a.account_name) like '%input%cgst%')
      or (p_key='input_sgst' and lower(a.account_name) like '%input%sgst%')
      or (p_key='input_igst' and lower(a.account_name) like '%input%igst%')
      or (p_key='cash' and lower(a.account_name) like '%cash%')
    )
  order by case when lower(coalesce(a.account_subtype,''))=lower(p_key) then 0 else 1 end, a.account_code
  limit 1;
  return v_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION private.update_stage_definitions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.apply_canonical_master_item_to_boq_line()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$ declare parent_text text; child_text text; canonical text; master_id uuid; begin if lower(coalesce(new.match_status,'')) in ('verified','rejected') or new.inventory_item_id is not null then return new; end if; parent_text:=coalesce(new.specification->>'parent_description',new.specification->'parent_context'->>'description',''); child_text:=coalesce(new.specification->>'source_description',''); canonical:=public.derive_canonical_master_code(parent_text,child_text,new.original_description); if canonical is null then return new; end if; select ii.id into master_id from public.inventory_items ii where ii.tenant_id=new.tenant_id and ii.tenant_company_id=new.tenant_company_id and ii.is_active=true and (ii.item_code=canonical or ii.master_identity_key='FIRE_FIGHTING|'||canonical or ii.identity_attributes->>'canonical_code'=canonical) order by case when ii.item_code=canonical then 1 when ii.master_identity_key='FIRE_FIGHTING|'||canonical then 2 else 3 end limit 1; if master_id is not null then new.inventory_item_id:=master_id; new.match_status:='matched'; new.match_method:='canonical_exact'; new.match_confidence:=1; new.match_explanation:=jsonb_build_array('exact canonical Master Item match: '||canonical); end if; return new; end; $function$
;

CREATE OR REPLACE FUNCTION public.apply_employee_change_request_atomic(p_approval_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_auth_user_id uuid;
  v_req public.approval_requests%ROWTYPE;
  v_emp public.employees%ROWTYPE;
  v_payload jsonb;
  v_snapshot jsonb;
  v_key text;
  v_expected text;
  v_live text;
  v_conflicts text[] := ARRAY[]::text[];
  v_unknown_keys text[] := ARRAY[]::text[];
  v_has_company_access boolean;
  v_emergency jsonb;
  v_new_mobile text;
  v_new_email text;
  v_new_address text;
  v_new_emergency_name text;
  v_new_emergency_phone text;
  v_new_emergency_relation text;
  v_new_marital_status text;
BEGIN
  v_auth_user_id := auth.uid();
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_req
  FROM public.approval_requests
  WHERE id = p_approval_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'NOT_FOUND', 'error', 'Approval request not found.');
  END IF;

  IF v_req.status = 'applied' THEN
    RETURN jsonb_build_object('success', true, 'status', 'already_applied', 'request_id', v_req.id, 'employee_id', v_req.subject_employee_id);
  END IF;

  IF v_req.request_type <> 'employee_change' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_TYPE', 'error', 'Invalid request type for Employee Change application.');
  END IF;

  IF v_req.status <> 'approved' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_STATUS', 'error', format('Request status is %s. Only approved requests can be applied.', v_req.status));
  END IF;

  v_has_company_access := private.has_company_access(v_req.tenant_id, v_req.tenant_company_id);
  IF NOT v_has_company_access OR NOT private.has_action_permission(v_req.tenant_id, 'MANAGER') THEN
    RETURN jsonb_build_object('success', false, 'code', 'UNAUTHORIZED', 'error', 'Management permission and company access are required to apply Employee Change requests.');
  END IF;

  IF v_req.requested_by = v_auth_user_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'MAKER_CHECKER_VIOLATION', 'error', 'Requester cannot apply their own Employee Change request.');
  END IF;

  IF v_req.subject_employee_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'code', 'EMPLOYEE_REQUIRED', 'error', 'Employee Change request has no subject employee.');
  END IF;

  SELECT * INTO v_emp
  FROM public.employees
  WHERE id = v_req.subject_employee_id
    AND tenant_id = v_req.tenant_id
    AND tenant_company_id = v_req.tenant_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'code', 'EMPLOYEE_NOT_FOUND', 'error', 'Target employee record was not found in the same tenant/company.');
  END IF;

  IF v_emp.linked_user_id IS NOT NULL AND v_emp.linked_user_id = v_auth_user_id THEN
    RETURN jsonb_build_object('success', false, 'code', 'MAKER_CHECKER_VIOLATION', 'error', 'Subject employee cannot apply a profile change concerning themselves.');
  END IF;

  v_payload := COALESCE(v_req.payload, '{}'::jsonb);
  v_snapshot := v_req.current_snapshot;

  IF jsonb_typeof(v_payload) <> 'object' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_PAYLOAD', 'error', 'Employee Change payload must be a JSON object.');
  END IF;

  SELECT COALESCE(array_agg(k ORDER BY k), ARRAY[]::text[])
  INTO v_unknown_keys
  FROM jsonb_object_keys(v_payload) AS k
  WHERE k NOT IN ('mobile', 'email', 'address', 'emergency_contact', 'marital_status');

  IF COALESCE(array_length(v_unknown_keys, 1), 0) > 0 THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_PAYLOAD_FIELDS', 'error', 'Payload contains unsupported Employee Change fields.', 'fields', v_unknown_keys);
  END IF;

  IF v_snapshot IS NOT NULL AND jsonb_typeof(v_snapshot) <> 'object' THEN
    RETURN jsonb_build_object('success', false, 'code', 'INVALID_SNAPSHOT', 'error', 'Current snapshot must be a JSON object.');
  END IF;

  IF v_snapshot IS NOT NULL THEN
    FOR v_key IN SELECT jsonb_object_keys(v_snapshot) LOOP
      IF v_key NOT IN ('mobile', 'email', 'address', 'emergency_contact', 'marital_status') THEN
        RETURN jsonb_build_object('success', false, 'code', 'INVALID_SNAPSHOT_FIELDS', 'error', 'Current snapshot contains unsupported fields.', 'field', v_key);
      END IF;

      CASE v_key
        WHEN 'mobile' THEN
          v_expected := v_snapshot->>'mobile';
          v_live := v_emp.personal_mobile;
        WHEN 'email' THEN
          v_expected := v_snapshot->>'email';
          v_live := v_emp.personal_email;
        WHEN 'address' THEN
          v_expected := v_snapshot->>'address';
          v_live := v_emp.current_address;
        WHEN 'marital_status' THEN
          v_expected := v_snapshot->>'marital_status';
          v_live := v_emp.marital_status;
        WHEN 'emergency_contact' THEN
          v_expected := v_snapshot->>'emergency_contact';
          v_live := concat_ws(' | ', v_emp.emergency_contact_name, v_emp.emergency_contact_phone, v_emp.emergency_contact_relation);
      END CASE;

      IF v_live IS DISTINCT FROM v_expected THEN
        v_conflicts := array_append(v_conflicts, v_key);
      END IF;
    END LOOP;
  END IF;

  IF COALESCE(array_length(v_conflicts, 1), 0) > 0 THEN
    UPDATE public.approval_requests
    SET status = 'failed', updated_at = now()
    WHERE id = v_req.id;

    INSERT INTO public.approval_request_actions (
      tenant_id, tenant_company_id, request_id, action, from_status, to_status, actor_id, comments, created_at
    ) VALUES (
      v_req.tenant_id, v_req.tenant_company_id, v_req.id, 'failed', 'approved', 'failed', v_auth_user_id,
      'Snapshot conflict during atomic Employee Master application. Conflicting fields: ' || array_to_string(v_conflicts, ', '), now()
    );

    RETURN jsonb_build_object('success', false, 'code', 'SNAPSHOT_CONFLICT', 'error', 'Employee Master changed after the request was submitted.', 'conflicts', v_conflicts);
  END IF;

  v_new_mobile := CASE WHEN v_payload ? 'mobile' THEN v_payload->>'mobile' ELSE v_emp.personal_mobile END;
  v_new_email := CASE WHEN v_payload ? 'email' THEN v_payload->>'email' ELSE v_emp.personal_email END;
  v_new_address := CASE WHEN v_payload ? 'address' THEN v_payload->>'address' ELSE v_emp.current_address END;
  v_new_marital_status := CASE WHEN v_payload ? 'marital_status' THEN v_payload->>'marital_status' ELSE v_emp.marital_status END;
  v_new_emergency_name := v_emp.emergency_contact_name;
  v_new_emergency_phone := v_emp.emergency_contact_phone;
  v_new_emergency_relation := v_emp.emergency_contact_relation;

  IF v_payload ? 'emergency_contact' THEN
    IF jsonb_typeof(v_payload->'emergency_contact') = 'object' THEN
      v_emergency := v_payload->'emergency_contact';
      v_new_emergency_name := CASE WHEN v_emergency ? 'name' THEN v_emergency->>'name' ELSE v_emp.emergency_contact_name END;
      v_new_emergency_phone := CASE WHEN v_emergency ? 'phone' THEN v_emergency->>'phone' ELSE v_emp.emergency_contact_phone END;
      v_new_emergency_relation := CASE WHEN v_emergency ? 'relation' THEN v_emergency->>'relation' ELSE v_emp.emergency_contact_relation END;
    ELSIF jsonb_typeof(v_payload->'emergency_contact') = 'string' THEN
      v_new_emergency_phone := v_payload->>'emergency_contact';
    ELSE
      RETURN jsonb_build_object('success', false, 'code', 'INVALID_EMERGENCY_CONTACT', 'error', 'Emergency contact must be an object or string.');
    END IF;
  END IF;

  IF NOT (v_payload ? 'mobile' OR v_payload ? 'email' OR v_payload ? 'address' OR v_payload ? 'emergency_contact' OR v_payload ? 'marital_status') THEN
    RETURN jsonb_build_object('success', false, 'code', 'EMPTY_PAYLOAD', 'error', 'No supported Employee Master fields were requested.');
  END IF;

  UPDATE public.employees
  SET personal_mobile = v_new_mobile,
      personal_email = v_new_email,
      current_address = v_new_address,
      emergency_contact_name = v_new_emergency_name,
      emergency_contact_phone = v_new_emergency_phone,
      emergency_contact_relation = v_new_emergency_relation,
      marital_status = v_new_marital_status,
      updated_at = now()
  WHERE id = v_emp.id;

  UPDATE public.approval_requests
  SET status = 'applied', updated_at = now()
  WHERE id = v_req.id;

  INSERT INTO public.approval_request_actions (
    tenant_id, tenant_company_id, request_id, action, from_status, to_status, actor_id, comments, created_at
  ) VALUES (
    v_req.tenant_id, v_req.tenant_company_id, v_req.id, 'applied', 'approved', 'applied', v_auth_user_id,
    'Employee Change applied atomically to Employee Master.', now()
  );

  RETURN jsonb_build_object('success', true, 'status', 'applied', 'request_id', v_req.id, 'employee_id', v_emp.id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_inventory_adjustment_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_request_id uuid:=nullif(p_payload->>'request_id','')::uuid;
  v_key text:=nullif(trim(p_payload->>'idempotency_key'),'');
  v_notes text:=nullif(trim(p_payload->>'approval_notes'),'');
  v_request record;
  v_tenant uuid;
  v_type text;
  v_tx jsonb;
  v_tx_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if v_request_id is null or v_key is null then raise exception 'request_id and idempotency_key are required'; end if;
  select * into v_request from public.inventory_adjustment_requests where id=v_request_id for update;
  if not found then raise exception 'Inventory adjustment request not found'; end if;
  select tenant_id into v_tenant from public.tenant_companies where id=v_request.tenant_company_id and status='active';
  if v_tenant is null then raise exception 'Active tenant company not found'; end if;
  if not private.has_company_access(v_tenant,v_request.tenant_company_id) then raise exception 'Company access denied'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') then raise exception 'Manager approval is required'; end if;
  if v_request.status='approved' then return jsonb_build_object('request_id',v_request.id,'status','approved','transaction_id',v_request.inventory_transaction_id,'idempotent_replay',true); end if;
  if v_request.status<>'pending' then raise exception 'Adjustment request is not pending'; end if;
  v_type:=case when v_request.variance_quantity>0 then 'adjustment_in' else 'adjustment_out' end;
  v_tx:=public.post_inventory_transaction_atomic(jsonb_build_object(
    'tenant_company_id',v_request.tenant_company_id,
    'transaction_type',v_type,
    'transaction_date',current_date,
    'from_location_id',case when v_type='adjustment_out' then v_request.location_id else null end,
    'to_location_id',case when v_type='adjustment_in' then v_request.location_id else null end,
    'source_type','inventory_adjustment_request',
    'source_id',v_request.id,
    'reference_no','ADJ-'||replace(v_request.id::text,'-',''),
    'notes',v_request.reason,
    'idempotency_key',v_key,
    'lines',jsonb_build_array(jsonb_build_object(
      'item_id',v_request.item_id,
      'quantity',abs(v_request.variance_quantity),
      'unit_cost',v_request.unit_cost,
      'lot_number',v_request.lot_number,
      'notes',v_request.reason
    ))
  ));
  v_tx_id:=(v_tx->>'id')::uuid;
  update public.inventory_adjustment_requests
  set status='approved',approved_by=v_uid,approved_at=now(),approval_notes=v_notes,inventory_transaction_id=v_tx_id,updated_at=now()
  where id=v_request.id;
  return jsonb_build_object('request_id',v_request.id,'status','approved','transaction_id',v_tx_id,'transaction_no',v_tx->>'transaction_no','idempotent_replay',false);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_payroll_payment_batch_atomic(p_payment_batch_id uuid, p_comments text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid(); v_batch public.payroll_payment_batches%rowtype; v_req public.approval_requests%rowtype; v_step public.approval_request_steps%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into v_batch from public.payroll_payment_batches where id=p_payment_batch_id for update;
  if not found then raise exception 'PAYROLL_PAYMENT_BATCH_NOT_FOUND'; end if;
  if not private.has_company_access(v_batch.tenant_id,v_batch.tenant_company_id) or not private.has_action_permission(v_batch.tenant_id,'ADMIN') then raise exception 'Not authorized'; end if;
  if v_batch.status<>'pending_approval' or v_batch.approval_request_id is null then raise exception 'PAYMENT_BATCH_NOT_PENDING_APPROVAL'; end if;
  select * into v_req from public.approval_requests where id=v_batch.approval_request_id and status='pending_approval' for update;
  if not found then raise exception 'PAYMENT_APPROVAL_REQUEST_NOT_FOUND'; end if;
  if v_req.requested_by=v_uid then raise exception 'MAKER_CANNOT_APPROVE_OWN_PAYMENT_BATCH'; end if;
  select * into v_step from public.approval_request_steps where request_id=v_req.id and step_order=v_req.current_step_order and status='pending' for update;
  if not found then raise exception 'PAYMENT_APPROVAL_STEP_NOT_PENDING'; end if;
  update public.approval_request_steps set status='approved',acted_at=now(),acted_by=v_uid,comments=p_comments,updated_at=now() where id=v_step.id;
  insert into public.approval_request_actions(tenant_id,tenant_company_id,request_id,request_step_id,actor_id,action,comments,from_status,to_status,metadata,created_at)
  values(v_batch.tenant_id,v_batch.tenant_company_id,v_req.id,v_step.id,v_uid,'approve',p_comments,'pending_approval','approved',jsonb_build_object('payment_batch_id',v_batch.id),now());
  update public.approval_requests set status='approved',approved_at=now(),updated_at=now() where id=v_req.id;
  update public.payroll_payment_batches set status='approved',updated_at=now() where id=v_batch.id;
  return jsonb_build_object('id',v_batch.id,'status','approved');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_payroll_run_atomic(p_payroll_run_id uuid, p_comments text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid(); v_run public.payroll_runs%rowtype; v_req public.approval_requests%rowtype; v_step public.approval_request_steps%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into v_run from public.payroll_runs where id=p_payroll_run_id for update;
  if not found then raise exception 'PAYROLL_RUN_NOT_FOUND'; end if;
  if not private.has_company_access(v_run.tenant_id,v_run.tenant_company_id) or not private.has_action_permission(v_run.tenant_id,'ADMIN') then raise exception 'Not authorized'; end if;
  select * into v_req from public.approval_requests where entity_type='payroll_run' and entity_id=v_run.id and status='pending_approval' order by created_at desc limit 1 for update;
  if not found then raise exception 'PAYROLL_APPROVAL_REQUEST_NOT_FOUND'; end if;
  if v_req.requested_by=v_uid then raise exception 'MAKER_CANNOT_APPROVE_OWN_PAYROLL'; end if;
  select * into v_step from public.approval_request_steps where request_id=v_req.id and step_order=v_req.current_step_order and status='pending' for update;
  if not found then raise exception 'PAYROLL_APPROVAL_STEP_NOT_PENDING'; end if;
  update public.approval_request_steps set status='approved',acted_at=now(),acted_by=v_uid,comments=p_comments,updated_at=now() where id=v_step.id;
  insert into public.approval_request_actions(tenant_id,tenant_company_id,request_id,request_step_id,actor_id,action,comments,from_status,to_status,metadata,created_at)
  values(v_req.tenant_id,v_req.tenant_company_id,v_req.id,v_step.id,v_uid,'approve',p_comments,'pending_approval','approved',jsonb_build_object('payroll_run_id',v_run.id),now());
  update public.approval_requests set status='approved',approved_at=now(),updated_at=now() where id=v_req.id;
  update public.payroll_runs set status='approved',approved_at=now(),updated_at=now() where id=v_run.id;
  return jsonb_build_object('payroll_run_id',v_run.id,'approval_request_id',v_req.id,'status','approved');
end;$function$
;

CREATE OR REPLACE FUNCTION public.approve_purchase_order_atomic(p_purchase_order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_po public.purchase_orders%rowtype;
  v_item record;
  v_boq public.master_boq_lines%rowtype;
  v_committed numeric;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_po from public.purchase_orders where id=p_purchase_order_id for update;
  if not found then raise exception 'Purchase order not found'; end if;

  if not private.has_action_permission(v_po.tenant_id,'MANAGER')
     or not private.has_company_access(v_po.tenant_id,v_po.tenant_company_id) then
    raise exception 'Not authorized';
  end if;

  if v_po.status not in ('draft','submitted') then
    raise exception 'Purchase order cannot be approved from status %',v_po.status;
  end if;

  for v_item in
    select * from public.purchase_order_items
    where purchase_order_id=p_purchase_order_id
      and master_boq_line_id is not null
    order by master_boq_line_id, id
  loop
    select * into v_boq
    from public.master_boq_lines
    where id=v_item.master_boq_line_id
      and tenant_id=v_po.tenant_id
      and tenant_company_id=v_po.tenant_company_id
    for update;

    if not found then raise exception 'Master BOQ line for PO item % not found',v_item.id; end if;
    if v_boq.match_status not in ('verified','matched') or v_boq.inventory_item_id is null then
      raise exception 'Master BOQ line % is not resolved to a Master Item',v_boq.line_no;
    end if;
    if not exists(
      select 1 from public.master_boqs b
      where b.id=v_boq.master_boq_id and b.tenant_id=v_po.tenant_id
        and b.tenant_company_id=v_po.tenant_company_id
        and b.status='approved' and b.is_current=true
    ) then
      raise exception 'PO references a Master BOQ line that is not from the current approved Master BOQ';
    end if;

    select coalesce(sum(poi.quantity),0) into v_committed
    from public.purchase_order_items poi
    join public.purchase_orders po on po.id=poi.purchase_order_id
    where poi.master_boq_line_id=v_boq.id
      and po.tenant_id=v_po.tenant_id
      and po.tenant_company_id=v_po.tenant_company_id
      and po.status not in ('cancelled','rejected','void');

    if v_committed > v_boq.quantity + 0.000001 then
      raise exception
        'PO approval blocked: committed quantity % exceeds Master BOQ quantity % for line %',
        v_committed,v_boq.quantity,v_boq.line_no;
    end if;
  end loop;

  update public.purchase_orders set status='approved',updated_at=now()
  where id=p_purchase_order_id;

  return (select to_jsonb(x) from public.purchase_orders x where x.id=p_purchase_order_id);
end $function$
;

CREATE OR REPLACE FUNCTION public.archive_owner_company_setting_item_atomic(p_tenant_company_id uuid, p_entity text, p_entity_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_tenant uuid;
  v_entity text := lower(trim(p_entity));
begin
  select tenant_id into v_tenant
  from public.tenant_companies
  where id=p_tenant_company_id and status<>'archived';

  if v_tenant is null or not private.has_action_permission(v_tenant,'OWNER') then
    raise exception 'not authorized';
  end if;

  if v_entity='registration' then
    update public.company_registrations set status='inactive',updated_at=now()
    where id=p_entity_id and tenant_company_id=p_tenant_company_id;
  elsif v_entity='address' then
    update public.company_addresses set is_active=false,updated_at=now()
    where id=p_entity_id and tenant_company_id=p_tenant_company_id;
  elsif v_entity='contact' then
    update public.company_contacts set is_active=false,updated_at=now()
    where id=p_entity_id and tenant_company_id=p_tenant_company_id;
  elsif v_entity='bank' then
    update public.company_bank_profiles set is_active=false,updated_at=now()
    where id=p_entity_id and tenant_company_id=p_tenant_company_id;
  elsif v_entity='document' then
    update public.company_documents set is_archived=true,is_current=false,updated_at=now()
    where id=p_entity_id and tenant_company_id=p_tenant_company_id;
  else
    raise exception 'unsupported entity type';
  end if;

  insert into public.company_settings_audit(
    tenant_id,tenant_company_id,actor_user_id,entity_type,entity_id,action
  ) values(v_tenant,p_tenant_company_id,auth.uid(),v_entity,p_entity_id,'archive');
end
$function$
;

CREATE OR REPLACE FUNCTION public.audit_company_settings_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_tenant uuid;
  v_company uuid;
  v_id uuid;
  v_old jsonb;
  v_new jsonb;
  v_action text;
begin
  if tg_op = 'DELETE' then
    v_tenant := (to_jsonb(old)->>'tenant_id')::uuid;
    v_company := (to_jsonb(old)->>'tenant_company_id')::uuid;
    v_id := case
      when tg_table_name in ('company_profiles','company_branding','company_settings')
        then (to_jsonb(old)->>'tenant_company_id')::uuid
      else (to_jsonb(old)->>'id')::uuid
    end;
    v_old := to_jsonb(old);
    v_action := 'delete';
  else
    v_tenant := (to_jsonb(new)->>'tenant_id')::uuid;
    v_company := (to_jsonb(new)->>'tenant_company_id')::uuid;
    v_id := case
      when tg_table_name in ('company_profiles','company_branding','company_settings')
        then (to_jsonb(new)->>'tenant_company_id')::uuid
      else (to_jsonb(new)->>'id')::uuid
    end;
    v_old := case when tg_op = 'UPDATE' then to_jsonb(old) end;
    v_new := to_jsonb(new);
    v_action := case when tg_op = 'INSERT' then 'create' else 'update' end;
  end if;

  insert into public.company_settings_audit(
    tenant_id, tenant_company_id, actor_user_id, entity_type, entity_id,
    action, old_data, new_data
  )
  values(
    v_tenant, v_company, auth.uid(), tg_table_name, v_id,
    v_action, v_old, v_new
  );

  return coalesce(new, old);
end
$function$
;

CREATE OR REPLACE FUNCTION public.bank_transfer_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_from uuid := nullif(p_payload->>'from_bank_account_id','')::uuid;
  v_to uuid := nullif(p_payload->>'to_bank_account_id','')::uuid;
  v_date date := coalesce(nullif(p_payload->>'transaction_date','')::date,current_date);
  v_amount numeric := nullif(p_payload->>'amount','')::numeric;
  v_idem text := nullif(trim(p_payload->>'idempotency_key'),'');
  v_period uuid;
  v_from_row public.accounting_bank_accounts%rowtype;
  v_to_row public.accounting_bank_accounts%rowtype;
  v_existing uuid;
  v_journal uuid;
  v_out uuid;
  v_in uuid;
  v_voucher text := coalesce(nullif(trim(p_payload->>'voucher_number'),''),'TRF-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'));
  v_journal_payload jsonb;
  v_journal_result jsonb;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_from is null or v_to is null or v_idem is null then raise exception 'Tenant, company, source bank, destination bank and idempotency key are required'; end if;
  if v_from=v_to then raise exception 'Source and destination bank accounts must be different'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  if v_amount is null or v_amount <= 0 then raise exception 'Amount must be greater than zero'; end if;

  select id into v_existing from public.accounting_bank_transactions where tenant_company_id=v_company and idempotency_key=v_idem||':out';
  if v_existing is not null then return jsonb_build_object('id',v_existing,'idempotent',true); end if;

  select * into v_from_row from public.accounting_bank_accounts b where b.id=v_from and b.tenant_id=v_tenant and b.tenant_company_id=v_company and b.is_active=true for update;
  select * into v_to_row from public.accounting_bank_accounts b where b.id=v_to and b.tenant_id=v_tenant and b.tenant_company_id=v_company and b.is_active=true for update;
  if v_from_row.id is null or v_to_row.id is null then raise exception 'Both bank accounts must be active and belong to the same company'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(least(v_from::text,v_to::text)||greatest(v_from::text,v_to::text),0));

  select id into v_period from public.accounting_fiscal_periods where tenant_id=v_tenant and tenant_company_id=v_company and v_date between period_start and period_end and status='open' limit 1;
  if v_period is null then raise exception 'No open fiscal period for transfer date'; end if;

  v_journal_payload := jsonb_build_object(
    'tenant_id',v_tenant,'tenant_company_id',v_company,'entry_date',v_date,
    'voucher_number',v_voucher,'voucher_type','CONTRA','narration',coalesce(p_payload->>'description','Bank transfer'),
    'source_type','bank_transfer','source_id',null,'idempotency_key','banktransfer:'||v_idem,
    'lines',jsonb_build_array(
      jsonb_build_object('account_id',v_to_row.account_id,'debit_amount',v_amount,'credit_amount',0,'description',coalesce(p_payload->>'description','Bank transfer')),
      jsonb_build_object('account_id',v_from_row.account_id,'debit_amount',0,'credit_amount',v_amount,'description',coalesce(p_payload->>'description','Bank transfer'))
    )
  );
  v_journal_result := public.post_journal_entry_atomic(v_journal_payload);
  v_journal := (v_journal_result->>'id')::uuid;

  insert into public.accounting_bank_transactions(
    tenant_id,tenant_company_id,bank_account_id,transaction_date,transaction_type,reference_no,description,amount,journal_entry_id,reconciliation_status,idempotency_key
  ) values(
    v_tenant,v_company,v_from,v_date,'transfer_out',nullif(trim(p_payload->>'reference_no'),''),p_payload->>'description',v_amount,v_journal,'unreconciled',v_idem||':out'
  ) returning id into v_out;

  insert into public.accounting_bank_transactions(
    tenant_id,tenant_company_id,bank_account_id,transaction_date,transaction_type,reference_no,description,amount,journal_entry_id,reconciliation_status,idempotency_key
  ) values(
    v_tenant,v_company,v_to,v_date,'transfer_in',nullif(trim(p_payload->>'reference_no'),''),p_payload->>'description',v_amount,v_journal,'unreconciled',v_idem||':in'
  ) returning id into v_in;

  return jsonb_build_object('journal_entry_id',v_journal,'transfer_out_id',v_out,'transfer_in_id',v_in,'status','posted');
exception when unique_violation then
  select id into v_existing from public.accounting_bank_transactions where tenant_company_id=v_company and idempotency_key=v_idem||':out';
  if v_existing is not null then return jsonb_build_object('id',v_existing,'idempotent',true); end if;
  raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_payroll_run_atomic(p_payroll_run_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_run public.payroll_runs%rowtype;
  v_period public.payroll_periods%rowtype;
  v_settings public.payroll_settings%rowtype;
  v_emp public.employees%rowtype;
  v_structure public.employee_salary_structures%rowtype;
  v_item public.employee_salary_structure_items%rowtype;
  v_component public.payroll_components%rowtype;
  v_rule public.payroll_statutory_rules%rowtype;
  v_pf public.employee_pf_details%rowtype;
  v_esi public.employee_esi_details%rowtype;
  v_tax public.employee_tax_details%rowtype;
  v_working_days numeric(12,2);
  v_paid_days numeric(12,2);
  v_lop_days numeric(12,2);
  v_proration numeric(12,8);
  v_amount numeric(16,2);
  v_base numeric(16,2);
  v_gross numeric(16,2);
  v_deductions numeric(16,2);
  v_employer numeric(16,2);
  v_net numeric(16,2);
  v_pf_wage numeric(16,2);
  v_esi_wage numeric(16,2);
  v_esi_coverage_wage numeric(16,2);
  v_esi_employee numeric(16,2);
  v_esi_employer numeric(16,2);
  v_pf_employee numeric(16,2);
  v_pf_employer numeric(16,2);
  v_eps numeric(16,2);
  v_epf numeric(16,2);
  v_edli numeric(16,2);
  v_pt numeric(16,2);
  v_codes text[];
  v_day_count integer;
  v_run_item_id uuid;
  v_result_count integer := 0;
  v_component_exists boolean;
  v_esi_daily_wage numeric(16,2);
  v_structure_from date;
  v_structure_to date;
  v_tds_amount numeric(16,2);
  v_tds_snapshot jsonb;
  v_tds_component_id uuid;
begin
  if v_uid is null then raise exception using errcode='P0001', message='AUTH_REQUIRED'; end if;

  select * into v_run from public.payroll_runs where id=p_payroll_run_id for update;
  if not found then raise exception using errcode='P0002', message='PAYROLL_RUN_NOT_FOUND'; end if;
  if not private.has_company_access(v_run.tenant_id,v_run.tenant_company_id) then raise exception using errcode='P0003', message='COMPANY_ACCESS_DENIED'; end if;
  if not private.has_action_permission(v_run.tenant_id,'MANAGER') then raise exception using errcode='P0004', message='MANAGEMENT_PERMISSION_REQUIRED'; end if;
  if v_run.status not in ('draft','failed') then raise exception using errcode='P0005', message='PAYROLL_RUN_NOT_CALCULABLE_IN_CURRENT_STATUS'; end if;

  select * into v_period from public.payroll_periods where id=v_run.payroll_period_id and tenant_id=v_run.tenant_id and tenant_company_id=v_run.tenant_company_id for update;
  if not found then raise exception using errcode='P0006', message='PAYROLL_PERIOD_NOT_FOUND'; end if;

  select * into v_settings from public.payroll_settings where tenant_id=v_run.tenant_id and tenant_company_id=v_run.tenant_company_id and status='active';
  if not found or not v_settings.payroll_enabled then raise exception using errcode='P0007', message='PAYROLL_DISABLED_OR_SETTINGS_MISSING'; end if;
  if v_settings.salary_proration_method not in ('none','calendar_days','working_days') then raise exception using errcode='P0007A', message='INVALID_SALARY_PRORATION_METHOD'; end if;

  if exists(select 1 from public.payroll_run_items where payroll_run_id=v_run.id) then
    raise exception using errcode='P0008', message='PAYROLL_RUN_ALREADY_HAS_ITEMS_CREATE_NEW_RUN_FOR_RECALCULATION';
  end if;

  update public.payroll_runs set status='calculating', calculated_at=null, updated_at=now() where id=v_run.id;

  for v_emp in
    select e.* from public.employees e
    where e.tenant_id=v_run.tenant_id and e.tenant_company_id=v_run.tenant_company_id
      and e.joining_date<=v_period.period_end and (e.exit_date is null or e.exit_date>=v_period.period_start)
      and exists (select 1 from public.employee_company_assignments a where a.tenant_id=v_run.tenant_id and a.employee_id=e.id and a.tenant_company_id=v_run.tenant_company_id and a.status='active' and a.assignment_start_date<=v_period.period_end and (a.assignment_end_date is null or a.assignment_end_date>=v_period.period_start))
  loop
    select s.* into v_structure from public.employee_salary_structures s
    where s.tenant_id=v_run.tenant_id and s.tenant_company_id=v_run.tenant_company_id and s.employee_id=v_emp.id and s.status='active'
      and s.effective_from<=v_period.period_end and (s.effective_to is null or s.effective_to>=v_period.period_start)
    order by s.effective_from desc,s.created_at desc limit 1;
    if not found then continue; end if;
    v_structure_from := greatest(v_structure.effective_from, v_period.period_start);
    v_structure_to := least(coalesce(v_structure.effective_to,v_period.period_end), v_period.period_end);
    if v_structure_from > v_structure_to then continue; end if;

    v_working_days:=0; v_lop_days:=0; v_paid_days:=0;
    if v_settings.attendance_integration_enabled then
      -- One payroll classification per calendar day. Approved leave overrides attendance for payroll.
      with payroll_days as (
        select d::date as attendance_date, adr.status as attendance_status,
               coalesce(adr.weekly_off,false) as weekly_off,
               coalesce(adr.holiday,false) as holiday,
               coalesce(adr.status='not_applicable',false) as not_applicable,
               coalesce(adr.is_half_day,false) as is_half_day,
               coalesce(lv.approved_leave_days,0)::numeric as approved_leave_days,
               coalesce(lv.unpaid_leave_days,0)::numeric as unpaid_leave_days
        from generate_series(v_period.period_start::timestamp,v_period.period_end::timestamp,interval '1 day') d
        left join public.attendance_daily_records adr
          on adr.tenant_id=v_run.tenant_id and adr.tenant_company_id=v_run.tenant_company_id
         and adr.employee_id=v_emp.id and adr.attendance_date=d::date
        left join lateral (
          select coalesce(sum(lrd.approved_days),0) as approved_leave_days,
                 coalesce(sum(case when not lt.paid then lrd.approved_days else 0 end),0) as unpaid_leave_days
          from public.leave_request_days lrd
          join public.leave_requests lr on lr.id=lrd.leave_request_id
          join public.leave_types lt on lt.id=lr.leave_type_id
          where lr.tenant_id=v_run.tenant_id and lr.tenant_company_id=v_run.tenant_company_id
            and lr.employee_id=v_emp.id and lr.status='applied'
            and lrd.tenant_id=v_run.tenant_id and lrd.tenant_company_id=v_run.tenant_company_id
            and lrd.leave_date=d::date and lrd.approved_days>0
        ) lv on true
      )
      select coalesce(sum(case when weekly_off or holiday or not_applicable then 0 when approved_leave_days>0 then 1 when attendance_status is not null then 1 else 0 end),0)::numeric,
             coalesce(sum(case when weekly_off or holiday or not_applicable then 0 when approved_leave_days>0 then unpaid_leave_days when attendance_status='absent' then 1 when attendance_status='half_day' or is_half_day then 0.5 else 0 end),0)::numeric
        into v_working_days,v_lop_days
      from payroll_days;

      if exists (select 1 from public.attendance_daily_records where tenant_id=v_run.tenant_id and tenant_company_id=v_run.tenant_company_id and employee_id=v_emp.id and attendance_date between v_period.period_start and v_period.period_end and status='pending_correction') then
        raise exception using errcode='P0010', message='ATTENDANCE_CORRECTION_PENDING_FOR_EMPLOYEE_'||v_emp.employee_code;
      end if;
    else
      v_working_days:=greatest(v_period.period_end-v_period.period_start+1,0); v_lop_days:=0;
    end if;
    v_paid_days:=greatest(v_working_days-v_lop_days,0);

    if v_settings.salary_proration_method='calendar_days' then
      v_day_count:=least(coalesce(v_emp.exit_date,v_period.period_end),v_period.period_end)-greatest(v_emp.joining_date,v_period.period_start)+1;
      v_day_count:=greatest(v_day_count,0);
      v_proration:=v_day_count::numeric/greatest(v_period.period_end-v_period.period_start+1,1)::numeric;
    elsif v_settings.salary_proration_method='working_days' then
      v_proration:=case when v_working_days>0 then v_paid_days/v_working_days else 0 end;
    else
      v_proration:=1;
    end if;

    insert into public.payroll_run_items(tenant_id,tenant_company_id,payroll_run_id,employee_id,working_days,paid_days,lop_days,gross_earnings,total_deductions,employer_contributions,net_pay,calculation_snapshot)
    values(v_run.tenant_id,v_run.tenant_company_id,v_run.id,v_emp.id,v_working_days,v_paid_days,v_lop_days,0,0,0,0,jsonb_build_object('engine_version',v_run.calculation_version,'salary_proration_method',v_settings.salary_proration_method,'working_days_source',case when v_settings.attendance_integration_enabled then 'attendance_daily_records' else 'calendar' end,'period_start',v_period.period_start,'period_end',v_period.period_end,'salary_structure_id',v_structure.id,'salary_structure_effective_from',v_structure_from,'salary_structure_effective_to',v_structure_to,'calculated_at',now())) returning id into v_run_item_id;

    for v_item in
      select i.* from public.employee_salary_structure_items i
      where i.tenant_id=v_run.tenant_id and i.tenant_company_id=v_run.tenant_company_id and i.salary_structure_id=v_structure.id
        and (i.effective_from is null or i.effective_from<=v_period.period_end) and (i.effective_to is null or i.effective_to>=v_period.period_start)
      order by case when i.calculation_method='fixed' then 1 else 2 end,i.created_at
    loop
      select * into v_component from public.payroll_components c where c.id=v_item.payroll_component_id and c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id;
      if not found or v_component.status<>'active' then raise exception using errcode='P0011', message='INVALID_OR_INACTIVE_PAYROLL_COMPONENT'; end if;
      if v_item.calculation_method='fixed' then
        v_amount:=coalesce(v_item.amount,0);
      elsif v_item.calculation_method='percentage' then
        v_codes:=array(select jsonb_array_elements_text(coalesce(v_item.formula_config->'base_component_codes','[]'::jsonb)));
        if coalesce(array_length(v_codes,1),0)=0 then raise exception using errcode='P0012', message='PERCENTAGE_COMPONENT_REQUIRES_BASE_COMPONENT_CODES'; end if;
        select coalesce(sum(rc.amount),0) into v_base from public.payroll_run_item_components rc join public.payroll_components bc on bc.id=rc.payroll_component_id where rc.payroll_run_item_id=v_run_item_id and bc.code=any(v_codes);
        if exists(select 1 from unnest(v_codes) x(code) where not exists(select 1 from public.payroll_run_item_components rc2 join public.payroll_components bc2 on bc2.id=rc2.payroll_component_id where rc2.payroll_run_item_id=v_run_item_id and bc2.code=x.code)) then raise exception using errcode='P0013', message='PERCENTAGE_COMPONENT_BASE_NOT_AVAILABLE_'||v_component.code; end if;
        v_amount:=v_base*coalesce(v_item.rate,0)/100;
      else
        raise exception using errcode='P0014', message='FORMULA_COMPONENTS_REQUIRE_EXPLICIT_SERVER_ENGINE_IMPLEMENTATION_'||v_component.code;
      end if;
      if coalesce((v_item.formula_config->>'prorate')::boolean,true) and v_settings.salary_proration_method<>'none' then v_amount:=v_amount*v_proration; end if;
      v_amount:=round(v_amount,2);
      insert into public.payroll_run_item_components(tenant_id,tenant_company_id,payroll_run_item_id,payroll_component_id,amount,quantity,rate,basis,sequence)
      values(v_run.tenant_id,v_run.tenant_company_id,v_run_item_id,v_component.id,v_amount,1,v_item.rate,jsonb_build_object('calculation_method',v_item.calculation_method,'formula_config',v_item.formula_config,'structure_id',v_structure.id,'proration',v_proration),1);
    end loop;

    select coalesce(sum(case when c.component_type='earning' then rc.amount else 0 end),0),coalesce(sum(case when c.component_type='deduction' then rc.amount else 0 end),0),coalesce(sum(case when c.component_type='employer_contribution' then rc.amount else 0 end),0)
      into v_gross,v_deductions,v_employer
    from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=v_run_item_id;

    if v_settings.pf_enabled then
      select * into v_pf from public.employee_pf_details where tenant_id=v_run.tenant_id and employee_id=v_emp.id limit 1;
      if found and coalesce(v_pf.pf_applicable,false) then
        select * into v_rule from public.payroll_statutory_rules r where r.tenant_id=v_run.tenant_id and r.tenant_company_id=v_run.tenant_company_id and r.rule_type='PF' and r.status='active' and r.effective_from<=v_period.period_end and (r.effective_to is null or r.effective_to>=v_period.period_start) order by r.effective_from desc,r.created_at desc limit 1;
        if not found then raise exception using errcode='P0015', message='PF_RULE_NOT_CONFIGURED'; end if;
        v_pf_wage:=coalesce(v_pf.pf_wage,0);
        if v_pf_wage<=0 then
          v_codes:=array(select jsonb_array_elements_text(coalesce(v_rule.rule_config->'wage_component_codes','["BASIC","DA"]'::jsonb)));
          select coalesce(sum(rc.amount),0) into v_pf_wage from public.payroll_run_item_components rc join public.payroll_components bc on bc.id=rc.payroll_component_id where rc.payroll_run_item_id=v_run_item_id and bc.code=any(v_codes);
        end if;
        if not coalesce((v_rule.rule_config->>'allow_higher_wage_contribution')::boolean,false) then v_pf_wage:=least(v_pf_wage,coalesce(v_rule.wage_ceiling,15000)); end if;
        v_pf_employee:=round(v_pf_wage*coalesce(v_rule.employee_rate,0.12),0);
        v_pf_employer:=round(v_pf_wage*coalesce(v_rule.employer_rate,0.12),0);
        if coalesce(v_pf.eps_applicable,false) and (v_emp.date_of_birth is null or age(v_period.period_end,v_emp.date_of_birth)<interval '58 years') then
          v_eps:=round(least(v_pf_wage,15000)*coalesce((v_rule.rule_config->>'eps_rate')::numeric,0.0833),0);
          v_eps:=least(v_eps,coalesce((v_rule.rule_config->>'eps_monthly_cap')::numeric,1250));
          v_epf:=greatest(v_pf_employer-v_eps,0);
        else
          v_eps:=0; v_epf:=v_pf_employer;
        end if;
        if coalesce(v_pf.edli_applicable,false) then v_edli:=round(least(v_pf_wage,15000)*coalesce((v_rule.rule_config->>'edli_rate')::numeric,0.005),0); else v_edli:=0; end if;
        select exists(select 1 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code) in ('PF_EMPLOYEE','PF_EMP')) into v_component_exists;
        if not v_component_exists then raise exception using errcode='P0018', message='PF_EMPLOYEE_COMPONENT_NOT_CONFIGURED'; end if;
        insert into public.payroll_run_item_components(tenant_id,tenant_company_id,payroll_run_item_id,payroll_component_id,amount,quantity,rate,basis,sequence)
        select v_run.tenant_id,v_run.tenant_company_id,v_run_item_id,c.id,v_pf_employee,1,coalesce(v_rule.employee_rate,0.12),jsonb_build_object('statutory','PF','wage',v_pf_wage,'rule_id',v_rule.id),10 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code) in ('PF_EMPLOYEE','PF_EMP');
        select exists(select 1 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code)='EPF_EMPLOYER') into v_component_exists;
        if not v_component_exists then raise exception using errcode='P0019', message='EPF_EMPLOYER_COMPONENT_NOT_CONFIGURED'; end if;
        insert into public.payroll_run_item_components(tenant_id,tenant_company_id,payroll_run_item_id,payroll_component_id,amount,quantity,rate,basis,sequence)
        select v_run.tenant_id,v_run.tenant_company_id,v_run_item_id,c.id,v_epf,1,coalesce((v_rule.rule_config->>'epf_rate')::numeric,0.0367),jsonb_build_object('statutory','EPF','wage',v_pf_wage,'rule_id',v_rule.id,'eps',v_eps),11 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code)='EPF_EMPLOYER';
        if v_eps>0 then
          select exists(select 1 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code)='EPS_EMPLOYER') into v_component_exists;
          if not v_component_exists then raise exception using errcode='P0020', message='EPS_EMPLOYER_COMPONENT_NOT_CONFIGURED'; end if;
          insert into public.payroll_run_item_components(tenant_id,tenant_company_id,payroll_run_item_id,payroll_component_id,amount,quantity,rate,basis,sequence)
          select v_run.tenant_id,v_run.tenant_company_id,v_run_item_id,c.id,v_eps,1,coalesce((v_rule.rule_config->>'eps_rate')::numeric,0.0833),jsonb_build_object('statutory','EPS','wage',least(v_pf_wage,15000),'rule_id',v_rule.id),12 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code)='EPS_EMPLOYER';
        end if;
        v_deductions:=v_deductions+v_pf_employee; v_employer:=v_employer+v_epf+v_eps+v_edli;
      end if;
    end if;

    if v_settings.esi_enabled then
      select * into v_esi from public.employee_esi_details where tenant_id=v_run.tenant_id and employee_id=v_emp.id limit 1;
      if found and coalesce(v_esi.esi_applicable,false) then
        select * into v_rule from public.payroll_statutory_rules r where r.tenant_id=v_run.tenant_id and r.tenant_company_id=v_run.tenant_company_id and r.rule_type='ESI' and r.status='active' and r.effective_from<=v_period.period_end and (r.effective_to is null or r.effective_to>=v_period.period_start) order by r.effective_from desc,r.created_at desc limit 1;
        if not found then raise exception using errcode='P0021', message='ESI_RULE_NOT_CONFIGURED'; end if;
        v_esi_coverage_wage:=v_gross;
        if v_esi_coverage_wage<=coalesce((v_rule.rule_config->>'coverage_ceiling')::numeric,v_rule.wage_ceiling,21000) then
          v_esi_wage:=v_esi_coverage_wage;
          v_esi_employee:=round(v_esi_wage*coalesce(v_rule.employee_rate,0.0075),0);
          v_esi_employer:=round(v_esi_wage*coalesce(v_rule.employer_rate,0.0325),0);
          if coalesce((v_rule.rule_config->>'employee_daily_wage_exemption_enabled')::boolean,false) then
            v_esi_daily_wage:=v_esi_wage/greatest(coalesce((v_rule.rule_config->>'daily_wage_divisor')::numeric,26),1);
            if v_esi_daily_wage<=coalesce((v_rule.rule_config->>'employee_daily_wage_exemption')::numeric,176) then v_esi_employee:=0; end if;
          end if;
          select exists(select 1 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code) in ('ESI_EMPLOYEE','ESI_EMP')) into v_component_exists;
          if not v_component_exists then raise exception using errcode='P0022', message='ESI_EMPLOYEE_COMPONENT_NOT_CONFIGURED'; end if;
          select exists(select 1 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code)='ESI_EMPLOYER') into v_component_exists;
          if not v_component_exists then raise exception using errcode='P0023', message='ESI_EMPLOYER_COMPONENT_NOT_CONFIGURED'; end if;
          insert into public.payroll_run_item_components(tenant_id,tenant_company_id,payroll_run_item_id,payroll_component_id,amount,quantity,rate,basis,sequence)
          select v_run.tenant_id,v_run.tenant_company_id,v_run_item_id,c.id,v_esi_employee,1,coalesce(v_rule.employee_rate,0.0075),jsonb_build_object('statutory','ESI','wage',v_esi_wage,'coverage_wage',v_esi_coverage_wage,'rule_id',v_rule.id),20 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code) in ('ESI_EMPLOYEE','ESI_EMP');
          insert into public.payroll_run_item_components(tenant_id,tenant_company_id,payroll_run_item_id,payroll_component_id,amount,quantity,rate,basis,sequence)
          select v_run.tenant_id,v_run.tenant_company_id,v_run_item_id,c.id,v_esi_employer,1,coalesce(v_rule.employer_rate,0.0325),jsonb_build_object('statutory','ESI','wage',v_esi_wage,'coverage_wage',v_esi_coverage_wage,'rule_id',v_rule.id),21 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code)='ESI_EMPLOYER';
          v_deductions:=v_deductions+v_esi_employee; v_employer:=v_employer+v_esi_employer;
        end if;
      end if;
    end if;

    if v_settings.pt_enabled then
      select * into v_tax from public.employee_tax_details where tenant_id=v_run.tenant_id and employee_id=v_emp.id limit 1;
      if found and coalesce(v_tax.professional_tax_applicable,false) then
        select * into v_rule from public.payroll_statutory_rules r where r.tenant_id=v_run.tenant_id and r.tenant_company_id=v_run.tenant_company_id and r.rule_type='PT' and r.status='active' and (r.state_code=coalesce(v_tax.professional_tax_state,v_settings.state_code) or (r.jurisdiction_type='india' and r.state_code is null)) and r.effective_from<=v_period.period_end and (r.effective_to is null or r.effective_to>=v_period.period_start) order by r.effective_from desc,r.created_at desc limit 1;
        if not found then raise exception using errcode='P0024', message='PT_RULE_NOT_CONFIGURED'; end if;
        select coalesce((s->>'amount')::numeric,0) into v_pt from jsonb_array_elements(v_rule.slab_config) s where v_gross>=coalesce((s->>'min')::numeric,0) and (s->>'max' is null or v_gross<=(s->>'max')::numeric) order by coalesce((s->>'min')::numeric,0) desc limit 1;
        v_pt:=coalesce(v_pt,coalesce(v_rule.fixed_amount,0));
        select exists(select 1 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code) in ('PROFESSIONAL_TAX','PT')) into v_component_exists;
        if not v_component_exists then raise exception using errcode='P0025', message='PT_COMPONENT_NOT_CONFIGURED'; end if;
        insert into public.payroll_run_item_components(tenant_id,tenant_company_id,payroll_run_item_id,payroll_component_id,amount,quantity,rate,basis,sequence)
        select v_run.tenant_id,v_run.tenant_company_id,v_run_item_id,c.id,v_pt,1,null,jsonb_build_object('statutory','PT','state',coalesce(v_tax.professional_tax_state,v_settings.state_code),'rule_id',v_rule.id),30 from public.payroll_components c where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and upper(c.code) in ('PROFESSIONAL_TAX','PT');
        v_deductions:=v_deductions+v_pt;
      end if;
    end if;

    if v_settings.tds_enabled then
      select x.monthly_tds,x.snapshot_json into v_tds_amount,v_tds_snapshot
      from private.calculate_employee_tds_internal(
        v_run.tenant_id,v_run.tenant_company_id,v_emp.id,v_run.id,v_run_item_id,v_run.payroll_period_id,
        case when v_period.pay_date>=date '2026-04-01' then
          (extract(year from v_period.pay_date)::integer)::text||'-'||(extract(year from v_period.pay_date)::integer+1)::text
        else
          (extract(year from v_period.pay_date)::integer-1)::text||'-'||extract(year from v_period.pay_date)::integer::text end,
        v_gross
      ) x;
      select c.id into v_tds_component_id
      from public.payroll_components c
      where c.tenant_id=v_run.tenant_id and c.tenant_company_id=v_run.tenant_company_id and c.status='active'
        and (upper(c.code)='TDS' or (coalesce(c.tds_applicable,false) and lower(c.component_type)='deduction'))
      order by (upper(c.code)='TDS') desc,c.created_at asc limit 1;
      if v_tds_component_id is null then raise exception using errcode='P0026',message='TDS_COMPONENT_NOT_CONFIGURED'; end if;
      insert into public.payroll_run_item_components(tenant_id,tenant_company_id,payroll_run_item_id,payroll_component_id,amount,quantity,rate,basis,sequence)
      values(v_run.tenant_id,v_run.tenant_company_id,v_run_item_id,v_tds_component_id,v_tds_amount,1,null,v_tds_snapshot,40);
      v_deductions:=v_deductions+v_tds_amount;
    end if;

    v_net:=greatest(v_gross-v_deductions,0);
    update public.payroll_run_items set gross_earnings=round(v_gross,2),total_deductions=round(v_deductions,2),employer_contributions=round(v_employer,2),net_pay=round(v_net,2),calculation_snapshot=calculation_snapshot||case when v_settings.tds_enabled then coalesce(v_tds_snapshot,'{}'::jsonb)||jsonb_build_object('tds_amount',round(v_tds_amount,2),'current_period_tds',round(v_tds_amount,2)) else '{}'::jsonb end||jsonb_build_object('statutory',jsonb_build_object('pf_enabled',v_settings.pf_enabled,'esi_enabled',v_settings.esi_enabled,'pt_enabled',v_settings.pt_enabled,'tds_enabled',v_settings.tds_enabled)) where id=v_run_item_id;
    v_result_count:=v_result_count+1;
  end loop;

  update public.payroll_runs set status='calculated',calculated_at=now(),updated_at=now(),calculation_snapshot=jsonb_build_object('engine_version',v_run.calculation_version,'employees_calculated',v_result_count,'tds_calculated',v_settings.tds_enabled,'tds_blocked_when_enabled',false,'attendance_integration_enabled',v_settings.attendance_integration_enabled,'leave_integration_enabled',v_settings.leave_integration_enabled,'salary_proration_method',v_settings.salary_proration_method,'calculated_at',now()) where id=v_run.id;
  return jsonb_build_object('success',true,'payroll_run_id',v_run.id,'employees_calculated',v_result_count,'status','calculated','tds_calculated',v_settings.tds_enabled);
exception when others then
  update public.payroll_runs set status='failed',updated_at=now(),calculation_snapshot=coalesce(calculation_snapshot,'{}'::jsonb)||jsonb_build_object('last_error',sqlerrm,'failed_at',now()) where id=p_payroll_run_id;
  raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.cancel_leave_atomic(p_leave_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_auth_user_id uuid := auth.uid();
  v_leave_req public.leave_requests%ROWTYPE;
  v_emp public.employees%ROWTYPE;
  v_emp_bal public.leave_balances%ROWTYPE;
  v_calculated_total numeric;
  v_requested_total numeric;
  v_approved_total numeric;
  v_balance_count integer;
  v_ledger_count integer;
  v_previous_status text;
  v_now timestamptz := pg_catalog.now();
BEGIN
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Active authentication session required';
  END IF;

  -- Lock order step 1: leave request.
  SELECT * INTO v_leave_req
  FROM public.leave_requests
  WHERE id = p_leave_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: Leave request record not found';
  END IF;

  IF NOT (SELECT private.has_company_access(v_leave_req.tenant_id, v_leave_req.tenant_company_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN: No access to the request operating company';
  END IF;

  SELECT * INTO v_emp
  FROM public.employees
  WHERE id = v_leave_req.employee_id
    AND tenant_id = v_leave_req.tenant_id
    AND tenant_company_id = v_leave_req.tenant_company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'CORRUPT_STATE: Subject employee not found in request company';
  END IF;

  IF v_leave_req.status = 'cancelled' THEN
    SELECT count(*) INTO v_ledger_count
    FROM public.leave_ledger
    WHERE leave_request_id = p_leave_request_id
      AND transaction_type = 'leave_reversal';

    IF v_ledger_count > 1 THEN
      RAISE EXCEPTION 'CORRUPT_STATE: Cancelled leave has multiple reversal ledger entries';
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Leave request is already cancelled (idempotent)');
  END IF;

  IF NOT (
    v_emp.linked_user_id = v_auth_user_id
    OR (SELECT private.has_action_permission(v_leave_req.tenant_id, 'MANAGER'))
  ) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only the subject employee or OWNER/ADMIN/MANAGER can cancel this leave request';
  END IF;

  v_previous_status := v_leave_req.status;

  IF v_previous_status NOT IN ('draft', 'submitted', 'pending_approval', 'approved', 'applied', 'returned') THEN
    RAISE EXCEPTION 'INVALID_STATUS: Cannot cancel leave request in % status', v_previous_status;
  END IF;

  SELECT
    COALESCE(sum(CASE
      WHEN day_type = 'half_day' THEN 0.5
      WHEN day_type = 'working_day' THEN 1.0
      ELSE 0.0
    END), 0),
    COALESCE(sum(requested_days), 0),
    COALESCE(sum(approved_days), 0)
  INTO v_calculated_total, v_requested_total, v_approved_total
  FROM public.leave_request_days
  WHERE leave_request_id = v_leave_req.id
    AND tenant_id = v_leave_req.tenant_id
    AND tenant_company_id = v_leave_req.tenant_company_id;

  IF v_previous_status IN ('pending_approval', 'approved', 'applied') THEN
    IF v_calculated_total <> v_leave_req.total_days
       OR v_requested_total <> v_leave_req.total_days
       OR v_approved_total <> v_leave_req.total_days
       OR v_calculated_total <= 0 THEN
      RAISE EXCEPTION 'TOTAL_DAYS_MISMATCH: Leave day breakdown is inconsistent with total_days';
    END IF;

    SELECT count(*) INTO v_balance_count
    FROM public.leave_balances
    WHERE tenant_id = v_leave_req.tenant_id
      AND tenant_company_id = v_leave_req.tenant_company_id
      AND employee_id = v_leave_req.employee_id
      AND leave_type_id = v_leave_req.leave_type_id
      AND balance_period_start <= v_leave_req.from_date
      AND balance_period_end >= v_leave_req.to_date;

    IF v_balance_count = 0 THEN
      RAISE EXCEPTION 'MISSING_BALANCE_PERIOD: No single leave balance period covers the complete leave request';
    ELSIF v_balance_count > 1 THEN
      RAISE EXCEPTION 'AMBIGUOUS_BALANCE_PERIOD: Multiple balance periods cover the leave request';
    END IF;

    SELECT * INTO v_emp_bal
    FROM public.leave_balances
    WHERE tenant_id = v_leave_req.tenant_id
      AND tenant_company_id = v_leave_req.tenant_company_id
      AND employee_id = v_leave_req.employee_id
      AND leave_type_id = v_leave_req.leave_type_id
      AND balance_period_start <= v_leave_req.from_date
      AND balance_period_end >= v_leave_req.to_date
    FOR UPDATE;

    IF v_previous_status IN ('pending_approval', 'approved') THEN
      IF v_emp_bal.pending < v_leave_req.total_days THEN
        RAISE EXCEPTION 'CORRUPT_BALANCE_STATE: Pending balance is less than cancellation days';
      END IF;

      UPDATE public.leave_balances
      SET pending = pending - v_leave_req.total_days,
          available_balance = available_balance + v_leave_req.total_days,
          updated_at = v_now
      WHERE id = v_emp_bal.id;

    ELSIF v_previous_status = 'applied' THEN
      IF v_emp_bal.used < v_leave_req.total_days THEN
        RAISE EXCEPTION 'CORRUPT_BALANCE_STATE: Used balance is less than cancellation days';
      END IF;

      SELECT count(*) INTO v_ledger_count
      FROM public.leave_ledger
      WHERE leave_request_id = p_leave_request_id
        AND transaction_type = 'leave_used';

      IF v_ledger_count <> 1 THEN
        RAISE EXCEPTION 'CORRUPT_STATE: Applied leave must have exactly one leave_used ledger entry before reversal';
      END IF;

      UPDATE public.leave_balances
      SET used = used - v_leave_req.total_days,
          available_balance = available_balance + v_leave_req.total_days,
          updated_at = v_now
      WHERE id = v_emp_bal.id;

      INSERT INTO public.leave_ledger (
        tenant_id, tenant_company_id, employee_id, leave_type_id,
        leave_request_id, leave_balance_id, transaction_type, quantity,
        transaction_date, reference_type, reference_id, reason,
        metadata, created_by, created_at
      ) VALUES (
        v_leave_req.tenant_id, v_leave_req.tenant_company_id,
        v_leave_req.employee_id, v_leave_req.leave_type_id,
        v_leave_req.id, v_emp_bal.id, 'leave_reversal', ABS(v_leave_req.total_days),
        pg_catalog.current_date, 'leave_request', v_leave_req.id,
        'Reversal of applied leave request',
        jsonb_build_object('previous_status', v_previous_status),
        v_auth_user_id, v_now
      );

      DELETE FROM public.attendance_daily_records
      WHERE employee_id = v_leave_req.employee_id
        AND tenant_id = v_leave_req.tenant_id
        AND tenant_company_id = v_leave_req.tenant_company_id
        AND status = 'leave'
        AND attendance_date IN (
          SELECT leave_date
          FROM public.leave_request_days
          WHERE leave_request_id = p_leave_request_id
        );
    END IF;
  END IF;

  UPDATE public.leave_requests
  SET status = 'cancelled', cancelled_at = v_now, updated_at = v_now
  WHERE id = p_leave_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'previous_status', v_previous_status,
    'status', 'cancelled'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.cancel_payroll_payment_batch_atomic(p_payment_batch_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid(); v_batch public.payroll_payment_batches%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into v_batch from public.payroll_payment_batches where id=p_payment_batch_id for update;
  if not found then raise exception 'PAYROLL_PAYMENT_BATCH_NOT_FOUND'; end if;
  if not private.has_company_access(v_batch.tenant_id,v_batch.tenant_company_id) or not private.has_action_permission(v_batch.tenant_id,'MANAGER') then raise exception 'Not authorized'; end if;
  if v_batch.status not in ('draft','pending_approval','approved') then raise exception 'PAYMENT_BATCH_CANNOT_BE_CANCELLED_IN_CURRENT_STATUS'; end if;
  if v_batch.journal_entry_id is not null or v_batch.bank_transaction_id is not null then raise exception 'POSTED_PAYMENT_CANNOT_BE_CANCELLED_USE_REVERSAL'; end if;
  update public.payroll_payment_items set payment_status='cancelled',failure_reason=coalesce(nullif(trim(p_reason),''),'Cancelled'),updated_at=now() where payment_batch_id=v_batch.id and payment_status in ('pending','processing');
  update public.payroll_payment_batches set status='cancelled',cancelled_at=now(),failure_reason=coalesce(nullif(trim(p_reason),''),'Cancelled'),updated_at=now() where id=v_batch.id;
  if v_batch.approval_request_id is not null then update public.approval_requests set status='cancelled',cancelled_at=now(),updated_at=now() where id=v_batch.approval_request_id and status in ('pending_approval','approved'); end if;
  return jsonb_build_object('id',v_batch.id,'status','cancelled');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.close_fiscal_period_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_tenant uuid:=nullif(p_payload->>'tenant_id','')::uuid; v_company uuid:=nullif(p_payload->>'tenant_company_id','')::uuid; v_id uuid:=nullif(p_payload->>'id','')::uuid; v_status text; v_start date; v_end date; v_unreconciled_bank integer:=0; v_bad_period_links integer:=0; v_unbalanced integer:=0;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if v_tenant is null or v_company is null or v_id is null then raise exception 'Tenant, operating company and fiscal period are required'; end if;
 if not private.has_action_permission(v_tenant,'ADMIN') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized' using errcode='42501'; end if;
 select status,period_start,period_end into v_status,v_start,v_end from public.accounting_fiscal_periods where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company for update;
 if not found then raise exception 'Fiscal period not found'; end if;
 if v_status <> 'open' then raise exception 'Only an open fiscal period can be closed'; end if;
 select count(*) into v_unreconciled_bank from public.accounting_bank_transactions bt where bt.tenant_id=v_tenant and bt.tenant_company_id=v_company and bt.transaction_date between v_start and v_end and coalesce(bt.reconciliation_status,'unreconciled')<>'reconciled';
 select count(*) into v_bad_period_links from public.accounting_journal_entries je where je.tenant_id=v_tenant and je.tenant_company_id=v_company and je.status='posted' and je.entry_date between v_start and v_end and je.fiscal_period_id is distinct from v_id;
 select count(*) into v_unbalanced from public.accounting_journal_entries je where je.tenant_id=v_tenant and je.tenant_company_id=v_company and je.status='posted' and je.entry_date between v_start and v_end and (select coalesce(sum(jl.debit),0) from public.accounting_journal_lines jl where jl.journal_entry_id=je.id)<>(select coalesce(sum(jl.credit),0) from public.accounting_journal_lines jl where jl.journal_entry_id=je.id);
 if v_unreconciled_bank>0 or v_bad_period_links>0 or v_unbalanced>0 then raise exception 'Fiscal period is not ready to close: unreconciled bank transactions %, wrong-period posted journals %, unbalanced posted journals %',v_unreconciled_bank,v_bad_period_links,v_unbalanced using errcode='P0001'; end if;
 update public.accounting_fiscal_periods set status='closed',updated_at=now() where id=v_id;
 return jsonb_build_object('id',v_id,'status','closed','close_readiness',jsonb_build_object('unreconciled_bank_transactions',0,'posted_journals_with_wrong_period',0,'unbalanced_posted_journals',0));
end;$function$
;

CREATE OR REPLACE FUNCTION public.convert_quotation_to_sales_order_atomic(p_quotation_id uuid, p_order_date date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE q public.sales_quotations%ROWTYPE; o public.sales_orders%ROWTYPE; v_no text; v_fy text := CASE WHEN EXTRACT(MONTH FROM COALESCE(p_order_date,CURRENT_DATE)) >= 4 THEN EXTRACT(YEAR FROM COALESCE(p_order_date,CURRENT_DATE))::int::text || '-' || (EXTRACT(YEAR FROM COALESCE(p_order_date,CURRENT_DATE))::int+1)::text ELSE (EXTRACT(YEAR FROM COALESCE(p_order_date,CURRENT_DATE))::int-1)::text || '-' || EXTRACT(YEAR FROM COALESCE(p_order_date,CURRENT_DATE))::int::text END;
BEGIN
  SELECT * INTO q FROM public.sales_quotations WHERE id=p_quotation_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quotation not found'; END IF;
  IF auth.uid() IS NULL OR NOT private.has_action_permission(q.tenant_id,'MANAGER') OR NOT private.has_company_access(q.tenant_id,q.tenant_company_id) THEN RAISE EXCEPTION 'Sales order conversion denied'; END IF;
  IF q.status IN ('converted','cancelled','rejected','expired') THEN RAISE EXCEPTION 'Quotation cannot be converted from status %', q.status; END IF;
  v_no := private.get_next_sales_doc_number(q.tenant_id,q.tenant_company_id,'SALES_ORDER',v_fy);
  INSERT INTO public.sales_orders(tenant_id,tenant_company_id,order_no,order_date,customer_name,quotation_id,status,currency_code,subtotal,tax_amount,total_amount,notes,created_by,company_id,enquiry_id,work_id,customer_gstin,place_of_supply,reverse_charge,cgst_amount,sgst_amount,igst_amount,terms_and_conditions)
  VALUES(q.tenant_id,q.tenant_company_id,v_no,COALESCE(p_order_date,CURRENT_DATE),q.customer_name,q.id,'draft',q.currency_code,q.subtotal,q.tax_amount,q.total_amount,q.notes,auth.uid(),q.company_id,q.enquiry_id,q.work_id,q.customer_gstin,q.place_of_supply,q.reverse_charge,q.cgst_amount,q.sgst_amount,q.igst_amount,q.terms_and_conditions) RETURNING * INTO o;
  INSERT INTO public.sales_order_items(tenant_id,tenant_company_id,sales_order_id,item_description,hsn_sac_code,quantity,unit_price,taxable_value,gst_rate_pct,cgst_rate,sgst_rate,igst_rate,cgst_amount,sgst_amount,igst_amount,line_total)
  SELECT tenant_id,tenant_company_id,o.id,item_description,hsn_sac_code,quantity,unit_price,taxable_value,gst_rate_pct,cgst_rate,sgst_rate,igst_rate,cgst_amount,sgst_amount,igst_amount,line_total FROM public.sales_quotation_items WHERE quotation_id=q.id;
  UPDATE public.sales_quotations SET status='converted',updated_at=now() WHERE id=q.id;
  RETURN to_jsonb(o);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_account_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_uid uuid:=auth.uid(); v_tenant uuid:=nullif(p_payload->>'tenant_id','')::uuid; v_company uuid:=nullif(p_payload->>'tenant_company_id','')::uuid; v_code text:=nullif(trim(p_payload->>'account_code'),''); v_name text:=nullif(trim(p_payload->>'account_name'),''); v_type text:=lower(nullif(trim(p_payload->>'account_type'),'')); v_id uuid;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if v_tenant is null or v_company is null then raise exception 'Tenant and operating company are required'; end if;
 if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
 if v_code is null or v_name is null or v_type is null then raise exception 'Account code, name and type are required'; end if;
 if v_type not in ('asset','liability','equity','revenue','expense') then raise exception 'Invalid account type'; end if;
 if not exists(select 1 from public.tenant_companies tc where tc.id=v_company and tc.tenant_id=v_tenant and tc.status='active') then raise exception 'Operating company not found'; end if;
 insert into public.chart_of_accounts(tenant_id,tenant_company_id,account_code,account_name,account_type,account_subtype,parent_account_id,is_control_account,is_system_account,is_active)
 values(v_tenant,v_company,v_code,v_name,v_type,nullif(p_payload->>'account_subtype',''),nullif(p_payload->>'parent_account_id','')::uuid,coalesce((p_payload->>'is_control_account')::boolean,false),coalesce((p_payload->>'is_system_account')::boolean,false),coalesce((p_payload->>'is_active')::boolean,true)) returning id into v_id;
 return jsonb_build_object('id',v_id,'account_code',v_code,'account_name',v_name);
exception when unique_violation then raise exception 'Account code already exists';
end; $function$
;

CREATE OR REPLACE FUNCTION public.create_bank_account_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_account uuid := nullif(p_payload->>'account_id','')::uuid;
  v_bank_type text := lower(coalesce(nullif(trim(p_payload->>'bank_type'),''),'bank'));
  v_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_account is null then raise exception 'Tenant, operating company and ledger account are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  if v_bank_type not in ('bank','cash') then raise exception 'Invalid bank type'; end if;
  if nullif(trim(p_payload->>'bank_name'),'') is null or nullif(trim(p_payload->>'account_name'),'') is null then raise exception 'Bank name and account name are required'; end if;
  if not exists (
    select 1 from public.chart_of_accounts a
    where a.id=v_account and a.tenant_id=v_tenant and a.tenant_company_id=v_company
      and a.account_type='asset' and a.is_active=true
  ) then raise exception 'Linked ledger account must be an active asset account in the same company'; end if;
  if not exists (select 1 from public.tenant_companies tc where tc.id=v_company and tc.tenant_id=v_tenant and tc.status='active') then raise exception 'Operating company not found'; end if;

  insert into public.accounting_bank_accounts(
    tenant_id,tenant_company_id,account_id,bank_name,account_name,masked_account_number,ifsc_code,bank_type,is_active
  ) values (
    v_tenant,v_company,v_account,trim(p_payload->>'bank_name'),trim(p_payload->>'account_name'),
    nullif(trim(p_payload->>'masked_account_number'),''),upper(nullif(trim(p_payload->>'ifsc_code'),'')),
    v_bank_type,coalesce((p_payload->>'is_active')::boolean,true)
  ) returning id into v_id;

  return jsonb_build_object('id',v_id);
exception when unique_violation then
  raise exception 'A bank or cash account is already linked to this ledger account';
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_fiscal_period_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_tenant uuid:=nullif(p_payload->>'tenant_id','')::uuid; v_company uuid:=nullif(p_payload->>'tenant_company_id','')::uuid; v_start date:=nullif(p_payload->>'period_start','')::date; v_end date:=nullif(p_payload->>'period_end','')::date; v_id uuid;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if v_tenant is null or v_company is null or v_start is null or v_end is null then raise exception 'Tenant, operating company and period dates are required'; end if;
 if v_end < v_start then raise exception 'Period end must be on or after period start'; end if;
 if not private.has_action_permission(v_tenant,'ADMIN') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
 if exists(select 1 from public.accounting_fiscal_periods p where p.tenant_company_id=v_company and p.period_start <= v_end and p.period_end >= v_start) then raise exception 'Fiscal period overlaps an existing period'; end if;
 insert into public.accounting_fiscal_periods(tenant_id,tenant_company_id,period_name,period_start,period_end,status) values(v_tenant,v_company,coalesce(nullif(trim(p_payload->>'period_name'),''),to_char(v_start,'YYYY')||'-'||to_char(v_end,'YYYY')),v_start,v_end,coalesce(nullif(p_payload->>'status',''),'open')) returning id into v_id;
 return jsonb_build_object('id',v_id);
exception when unique_violation then raise exception 'Fiscal period already exists'; end; $function$
;

CREATE OR REPLACE FUNCTION public.create_goods_received_note_atomic(p_header jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid;
  v_tc uuid;
  v_company uuid;
  v_po uuid;
  v_vendor uuid;
  v_id uuid;
  v_no text;
  v_item jsonb;
  v_po_item public.purchase_order_items%ROWTYPE;
  v_received numeric;
  v_accepted numeric;
  v_rejected numeric;
  v_already_received numeric;
  v_remaining numeric;
  v_fy text := to_char(coalesce((p_header->>'grn_date')::date,current_date),'YYYY');
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  v_tenant := (p_header->>'tenant_id')::uuid;
  v_tc := (p_header->>'tenant_company_id')::uuid;
  v_company := (p_header->>'company_id')::uuid;
  v_po := (p_header->>'purchase_order_id')::uuid;
  v_vendor := (p_header->>'vendor_id')::uuid;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then
    raise exception 'Not authorized';
  end if;

  if not exists (
    select 1 from public.companies c
    where c.id=v_company
      and c.tenant_id=v_tenant
      and c.tenant_company_id=v_tc
  ) then
    raise exception 'Invalid company';
  end if;

  -- Lock the PO for the entire GRN transaction so concurrent GRNs cannot
  -- both consume the same remaining quantity.
  if not exists (
    select 1 from public.purchase_orders p
    where p.id=v_po
      and p.tenant_id=v_tenant
      and p.tenant_company_id=v_tc
      and p.company_id=v_company
      and p.vendor_id=v_vendor
      and p.status='approved'
    for update
  ) then
    raise exception 'Purchase order must be approved and match company/vendor';
  end if;

  v_no := private.get_next_purchase_doc_number(v_tenant,v_tc,'GRN',v_fy);

  insert into public.goods_received_notes(
    tenant_id,tenant_company_id,company_id,grn_no,grn_date,purchase_order_id,
    vendor_id,work_id,status,received_by,notes,created_by
  ) values (
    v_tenant,v_tc,v_company,v_no,
    coalesce((p_header->>'grn_date')::date,current_date),
    v_po,v_vendor,(p_header->>'work_id')::uuid,'posted',v_uid,
    p_header->>'notes',v_uid
  ) returning id into v_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_received := coalesce((v_item->>'received_quantity')::numeric,0);
    v_accepted := coalesce((v_item->>'accepted_quantity')::numeric,0);
    v_rejected := coalesce((v_item->>'rejected_quantity')::numeric,0);

    if v_received <= 0 then
      raise exception 'GRN received quantity must be greater than zero';
    end if;
    if v_accepted < 0 or v_rejected < 0 then
      raise exception 'GRN quantities cannot be negative';
    end if;
    if v_accepted + v_rejected <> v_received then
      raise exception 'Accepted quantity plus rejected quantity must equal received quantity';
    end if;

    -- The client may only reference an item belonging to this PO.
    select * into v_po_item
    from public.purchase_order_items poi
    where poi.id=(v_item->>'purchase_order_item_id')::uuid
      and poi.purchase_order_id=v_po
      and poi.tenant_id=v_tenant
      and poi.tenant_company_id=v_tc
    for update;

    if not found then
      raise exception 'GRN item must belong to the selected purchase order';
    end if;

    -- Never trust ordered_quantity/description supplied by the client.
    -- Derive the ordered quantity from the locked PO item and enforce the
    -- cumulative received quantity across all previously posted GRNs.
    select coalesce(sum(gri.received_quantity),0)
      into v_already_received
    from public.goods_received_note_items gri
    join public.goods_received_notes grn on grn.id=gri.grn_id
    where grn.purchase_order_id=v_po
      and gri.purchase_order_item_id=v_po_item.id;

    v_remaining := v_po_item.quantity - v_already_received;

    if v_received > v_remaining then
      raise exception 'GRN quantity exceeds remaining purchase order quantity for item % (remaining: %)',
        v_po_item.description, v_remaining;
    end if;

    insert into public.goods_received_note_items(
      tenant_id,tenant_company_id,grn_id,purchase_order_item_id,description,
      ordered_quantity,received_quantity,accepted_quantity,rejected_quantity,notes
    ) values (
      v_tenant,v_tc,v_id,v_po_item.id,v_po_item.description,
      v_po_item.quantity,v_received,v_accepted,v_rejected,v_item->>'notes'
    );
  end loop;

  if not exists (
    select 1 from public.goods_received_note_items i where i.grn_id=v_id
  ) then
    raise exception 'At least one GRN item is required';
  end if;

  return jsonb_build_object(
    'grn',(select to_jsonb(x) from public.goods_received_notes x where x.id=v_id),
    'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb)
             from public.goods_received_note_items i where i.grn_id=v_id)
  );
end
$function$
;

CREATE OR REPLACE FUNCTION public.create_goods_received_note_with_accounting_atomic(p_header jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_header->>'tenant_id','')::uuid;
  v_tc uuid := nullif(p_header->>'tenant_company_id','')::uuid;
  v_company uuid := nullif(p_header->>'company_id','')::uuid;
  v_po uuid := nullif(p_header->>'purchase_order_id','')::uuid;
  v_idem text := nullif(trim(p_header->>'idempotency_key'),'');
  v_hash text := md5(jsonb_build_object('header',p_header,'items',coalesce(p_items,'[]'::jsonb))::text);
  v_existing public.procurement_accounting_idempotency%rowtype;
  v_grn_result jsonb;
  v_grn_id uuid;
  v_grn_no text;
  v_grn_date date;
  v_location uuid;
  v_location_count integer;
  v_inventory_result jsonb;
  v_inventory_lines jsonb := '[]'::jsonb;
  v_valuation numeric := 0;
  v_inventory_account uuid;
  v_grni_account uuid;
  v_journal_result jsonb;
  v_journal_lines jsonb := '[]'::jsonb;
  r record;
  v_item_id uuid;
  v_match_count integer;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF v_tenant IS NULL OR v_tc IS NULL OR v_company IS NULL OR v_po IS NULL OR v_idem IS NULL THEN
    RAISE EXCEPTION 'Tenant, company, operating company, purchase order and idempotency key are required';
  END IF;
  IF NOT private.has_action_permission(v_tenant,'MANAGER')
     OR NOT private.has_company_access(v_tenant,v_tc) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_tc::text || ':' || v_idem,0));

  SELECT * INTO v_existing
  FROM public.procurement_accounting_idempotency
  WHERE tenant_company_id=v_tc AND idempotency_key=v_idem;

  IF FOUND THEN
    IF v_existing.request_hash<>v_hash THEN
      RAISE EXCEPTION 'Idempotency key has already been used with a different payload';
    END IF;
    RETURN jsonb_build_object('grn_id',v_existing.source_id,'idempotent_replay',true);
  END IF;

  v_grn_result := public.create_goods_received_note_atomic(p_header,p_items);
  v_grn_id := (v_grn_result->'grn'->>'id')::uuid;
  v_grn_no := v_grn_result->'grn'->>'grn_no';
  v_grn_date := coalesce((v_grn_result->'grn'->>'grn_date')::date,current_date);

  v_location := nullif(p_header->>'to_location_id','')::uuid;
  IF v_location IS NULL THEN
    SELECT count(*) INTO v_location_count
    FROM public.inventory_locations l
    WHERE l.tenant_id=v_tenant AND l.tenant_company_id=v_tc AND l.is_active AND l.is_stock_location;
    IF v_location_count=1 THEN
      SELECT l.id INTO v_location
      FROM public.inventory_locations l
      WHERE l.tenant_id=v_tenant AND l.tenant_company_id=v_tc AND l.is_active AND l.is_stock_location
      LIMIT 1;
    ELSE
      RAISE EXCEPTION 'Inventory destination location is required; provide to_location_id when more than one stock location exists';
    END IF;
  END IF;

  IF NOT EXISTS(
    SELECT 1 FROM public.inventory_locations l
    WHERE l.id=v_location AND l.tenant_id=v_tenant AND l.tenant_company_id=v_tc
      AND l.is_active AND l.is_stock_location
  ) THEN
    RAISE EXCEPTION 'Invalid inventory destination location';
  END IF;

  FOR r IN
    SELECT gri.*, poi.item_code AS po_item_code, poi.unit_price AS po_unit_price,
           poi.inventory_item_id AS po_inventory_item_id
    FROM public.goods_received_note_items gri
    JOIN public.purchase_order_items poi ON poi.id=gri.purchase_order_item_id
    WHERE gri.grn_id=v_grn_id
  LOOP
    v_valuation := v_valuation + (r.accepted_quantity * r.po_unit_price);

    IF r.accepted_quantity > 0 THEN
      v_item_id := r.po_inventory_item_id;

      IF v_item_id IS NOT NULL THEN
        IF NOT EXISTS(
          SELECT 1 FROM public.inventory_items ii
          WHERE ii.id=v_item_id AND ii.tenant_id=v_tenant AND ii.tenant_company_id=v_tc AND ii.is_active
        ) THEN
          RAISE EXCEPTION 'PO item inventory mapping is invalid for item code %', r.po_item_code;
        END IF;
      ELSE
        SELECT count(*) INTO v_match_count
        FROM public.inventory_items ii
        WHERE ii.tenant_id=v_tenant AND ii.tenant_company_id=v_tc
          AND ii.item_code=r.po_item_code AND ii.is_active;

        IF v_match_count<>1 THEN
          RAISE EXCEPTION 'Accepted GRN item % must map to exactly one active inventory item by item_code; found %',
            r.po_item_code,v_match_count;
        END IF;

        SELECT ii.id INTO v_item_id
        FROM public.inventory_items ii
        WHERE ii.tenant_id=v_tenant AND ii.tenant_company_id=v_tc
          AND ii.item_code=r.po_item_code AND ii.is_active
        LIMIT 1;
      END IF;

      IF EXISTS(SELECT 1 FROM public.inventory_items ii WHERE ii.id=v_item_id AND ii.item_type='service') THEN
        RAISE EXCEPTION 'Service item % cannot be received into inventory',r.po_item_code;
      END IF;

      UPDATE public.goods_received_note_items
      SET inventory_item_id=v_item_id
      WHERE id=r.id;

      v_inventory_lines := v_inventory_lines || jsonb_build_array(
        jsonb_build_object('item_id',v_item_id,'quantity',r.accepted_quantity,'unit_cost',r.po_unit_price)
      );
    END IF;
  END LOOP;

  IF jsonb_array_length(v_inventory_lines)>0 THEN
    v_inventory_result := public.post_inventory_transaction_atomic(
      jsonb_build_object(
        'tenant_company_id',v_tc,'transaction_type','receipt','transaction_date',v_grn_date,
        'to_location_id',v_location,'source_type','grn','source_id',v_grn_id,
        'reference_no',v_grn_no,'notes','Inventory receipt for GRN ' || v_grn_no,
        'idempotency_key','procurement-grn-inventory:' || v_idem,'lines',v_inventory_lines
      )
    );
  END IF;

  IF v_valuation>0 THEN
    v_inventory_account := private.resolve_procurement_account(v_tenant,v_tc,'inventory_asset');
    v_grni_account := private.resolve_procurement_account(v_tenant,v_tc,'grni_clearing');

    v_journal_lines := jsonb_build_array(
      jsonb_build_object('account_id',v_inventory_account,'debit_amount',v_valuation,'credit_amount',0,'description','Inventory receipt - ' || v_grn_no),
      jsonb_build_object('account_id',v_grni_account,'debit_amount',0,'credit_amount',v_valuation,'description','GRNI accrued - ' || v_grn_no)
    );

    v_journal_result := public.post_journal_entry_atomic(
      jsonb_build_object(
        'tenant_id',v_tenant,'tenant_company_id',v_tc,'entry_date',v_grn_date,
        'voucher_type','GRN','narration','GRN accounting - ' || v_grn_no,
        'source_type','procurement_grn','source_id',v_grn_id,
        'idempotency_key','procurement-grn:' || v_idem,'lines',v_journal_lines
      )
    );
  END IF;

  INSERT INTO public.procurement_accounting_idempotency(
    tenant_id,tenant_company_id,idempotency_key,request_hash,source_type,source_id
  ) VALUES(v_tenant,v_tc,v_idem,v_hash,'procurement_grn',v_grn_id);

  RETURN jsonb_build_object(
    'grn',(SELECT to_jsonb(g) FROM public.goods_received_notes g WHERE g.id=v_grn_id),
    'inventory',v_inventory_result,'journal',v_journal_result,'idempotent_replay',false
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_inventory_adjustment_request_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_company uuid:=nullif(p_payload->>'tenant_company_id','')::uuid;
  v_tenant uuid;
  v_item uuid:=nullif(p_payload->>'item_id','')::uuid;
  v_location uuid:=nullif(p_payload->>'location_id','')::uuid;
  v_lot text:=nullif(trim(p_payload->>'lot_number'),'');
  v_physical numeric:=nullif(p_payload->>'physical_quantity','')::numeric;
  v_system numeric;
  v_cost numeric:=coalesce(nullif(p_payload->>'unit_cost','')::numeric,0);
  v_reason text:=nullif(trim(p_payload->>'reason'),'');
  v_key text:=nullif(trim(p_payload->>'idempotency_key'),'');
  v_hash text:=md5(p_payload::text);
  v_existing record;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if v_company is null or v_item is null or v_location is null or v_physical is null or v_reason is null or v_key is null then raise exception 'tenant_company_id, item_id, location_id, physical_quantity, reason and idempotency_key are required'; end if;
  if v_physical < 0 or v_cost < 0 then raise exception 'Physical quantity and unit cost cannot be negative'; end if;
  select tenant_id into v_tenant from public.tenant_companies where id=v_company and status='active';
  if v_tenant is null then raise exception 'Active tenant company not found'; end if;
  if not private.has_company_access(v_tenant,v_company) then raise exception 'Company access denied'; end if;
  if not private.has_action_permission(v_tenant,'TEAM') then raise exception 'Insufficient permission to request stock adjustment'; end if;
  select * into v_existing from public.inventory_adjustment_requests where tenant_company_id=v_company and idempotency_key=v_key;
  if found then
    if v_existing.request_hash<>v_hash then raise exception 'Idempotency key was already used with a different payload'; end if;
    return jsonb_build_object('request_id',v_existing.id,'status',v_existing.status,'idempotent_replay',true);
  end if;
  select coalesce(sb.quantity_on_hand,0) into v_system
  from public.inventory_stock_balances sb
  where sb.tenant_company_id=v_company and sb.item_id=v_item and sb.location_id=v_location and sb.lot_number is not distinct from v_lot
  for update;
  if not found then v_system:=0; end if;
  if not exists(select 1 from public.inventory_items where id=v_item and tenant_id=v_tenant and tenant_company_id=v_company and is_active and item_type<>'service') then raise exception 'Inventory item not found or not stockable'; end if;
  if not exists(select 1 from public.inventory_locations where id=v_location and tenant_id=v_tenant and tenant_company_id=v_company and is_active and is_stock_location) then raise exception 'Stock location not found or inactive'; end if;
  if v_physical=v_system then raise exception 'Physical count matches system quantity; no adjustment is required'; end if;
  insert into public.inventory_adjustment_requests(tenant_id,tenant_company_id,item_id,location_id,lot_number,system_quantity,physical_quantity,unit_cost,reason,status,idempotency_key,request_hash,requested_by)
  values(v_tenant,v_company,v_item,v_location,v_lot,v_system,v_physical,v_cost,v_reason,'pending',v_key,v_hash,v_uid)
  returning id into v_id;
  return jsonb_build_object('request_id',v_id,'status','pending','idempotent_replay',false);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_inventory_item_alias_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_item uuid := nullif(p_payload->>'inventory_item_id','')::uuid;
  v_alias text := nullif(trim(p_payload->>'alias_text'),'');
  v_normalized text := nullif(trim(p_payload->>'normalized_alias'),'');
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;

  if v_tenant is null or v_company is null or v_item is null or v_alias is null then
    raise exception 'Tenant, company, inventory item and alias are required';
  end if;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_company) then
    raise exception 'Not authorized';
  end if;

  if not exists (
    select 1
    from public.inventory_items ii
    where ii.id=v_item
      and ii.tenant_id=v_tenant
      and ii.tenant_company_id=v_company
      and ii.is_active
  ) then
    raise exception 'Inventory item not found';
  end if;

  if v_normalized is null then
    v_normalized := lower(regexp_replace(v_alias,'[^a-zA-Z0-9]+','','g'));
  end if;

  if v_normalized = '' then
    raise exception 'Normalized alias is required';
  end if;

  insert into public.inventory_item_aliases(
    tenant_id, tenant_company_id, inventory_item_id,
    alias_text, normalized_alias, alias_type,
    party_type, party_id, source_type, source_id, source_line_id,
    confidence_score, is_verified, verified_by, verified_at, created_by
  )
  values (
    v_tenant, v_company, v_item,
    v_alias, v_normalized,
    coalesce(nullif(p_payload->>'alias_type',''),'description'),
    nullif(p_payload->>'party_type',''),
    nullif(p_payload->>'party_id','')::uuid,
    nullif(p_payload->>'source_type',''),
    nullif(p_payload->>'source_id','')::uuid,
    nullif(p_payload->>'source_line_id','')::uuid,
    nullif(p_payload->>'confidence_score','')::numeric,
    coalesce((p_payload->>'is_verified')::boolean,false),
    nullif(p_payload->>'verified_by','')::uuid,
    nullif(p_payload->>'verified_at','')::timestamptz,
    v_uid
  )
  returning id into v_id;

  return jsonb_build_object('id',v_id);
exception
  when unique_violation then
    raise exception 'This normalized alias is already registered in this company scope';
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_inventory_item_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant_id uuid;
  v_company_id uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_item_id uuid;
  v_category_id uuid := nullif(p_payload->>'mep_category_id','')::uuid;
  v_category_domain text;
  v_payload_domain text := nullif(trim(p_payload->>'domain_code'),'');
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;

  if v_company_id is null then
    raise exception 'Operating company is required';
  end if;

  select tenant_id into v_tenant_id
  from public.tenant_companies
  where id=v_company_id and status='active';

  if v_tenant_id is null then
    raise exception 'Operating company not found';
  end if;

  if not private.has_action_permission(v_tenant_id,'MANAGER')
     or not private.has_company_access(v_tenant_id,v_company_id) then
    raise exception 'Not authorized';
  end if;

  if nullif(trim(p_payload->>'item_code'),'') is null
     or nullif(trim(p_payload->>'name'),'') is null
     or nullif(trim(p_payload->>'base_uom_code'),'') is null then
    raise exception 'Item code, item name and base UOM are required';
  end if;

  if v_category_id is not null then
    select domain_code into v_category_domain
    from public.mep_item_categories
    where id=v_category_id and is_active=true;

    if v_category_domain is null then
      raise exception 'MEP category not found or inactive';
    end if;

    if v_payload_domain is not null and v_payload_domain <> v_category_domain then
      raise exception 'MEP category domain does not match domain_code';
    end if;
  end if;

  insert into public.inventory_items(
    tenant_id,
    tenant_company_id,
    item_code,
    name,
    description,
    category,
    item_type,
    base_uom_code,
    hsn_sac_code,
    reorder_level,
    reorder_quantity,
    normalized_name,
    domain_code,
    mep_category_id,
    identity_attributes,
    identity_version,
    identity_source,
    created_by
  )
  values (
    v_tenant_id,
    v_company_id,
    trim(p_payload->>'item_code'),
    trim(p_payload->>'name'),
    nullif(trim(p_payload->>'description'),''),
    nullif(trim(p_payload->>'category'),''),
    coalesce(nullif(p_payload->>'item_type',''),'stock'),
    trim(p_payload->>'base_uom_code'),
    nullif(trim(p_payload->>'hsn_sac_code'),''),
    coalesce(nullif(p_payload->>'reorder_level','')::numeric,0),
    coalesce(nullif(p_payload->>'reorder_quantity','')::numeric,0),
    nullif(trim(p_payload->>'normalized_name'),''),
    coalesce(v_payload_domain, v_category_domain),
    v_category_id,
    coalesce(p_payload->'identity_attributes','{}'::jsonb),
    coalesce(nullif(p_payload->>'identity_version','')::integer,1),
    coalesce(nullif(p_payload->>'identity_source',''),'manual'),
    v_uid
  )
  returning id into v_item_id;

  return jsonb_build_object('id',v_item_id);
exception
  when unique_violation then
    raise exception 'Item code already exists for this company';
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_inventory_location_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant_id uuid;
  v_company_id uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_location_id uuid;
  v_parent uuid := nullif(p_payload->>'parent_location_id','')::uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_company_id is null then raise exception 'Operating company is required'; end if;
  select tenant_id into v_tenant_id from public.tenant_companies where id=v_company_id and status='active';
  if v_tenant_id is null then raise exception 'Operating company not found'; end if;
  if not private.has_action_permission(v_tenant_id,'MANAGER') or not private.has_company_access(v_tenant_id,v_company_id) then
    raise exception 'Not authorized';
  end if;
  if nullif(trim(p_payload->>'code'),'') is null or nullif(trim(p_payload->>'name'),'') is null then raise exception 'Location code and name are required'; end if;
  if v_parent is not null and not exists(select 1 from public.inventory_locations l where l.id=v_parent and l.tenant_id=v_tenant_id and l.tenant_company_id=v_company_id and l.is_active) then raise exception 'Parent location not found'; end if;
  insert into public.inventory_locations(tenant_id,tenant_company_id,code,name,location_type,address,parent_location_id,is_stock_location,created_by)
  values(v_tenant_id,v_company_id,trim(p_payload->>'code'),trim(p_payload->>'name'),coalesce(nullif(p_payload->>'location_type',''),'warehouse'),nullif(trim(p_payload->>'address'),''),v_parent,coalesce((p_payload->>'is_stock_location')::boolean,true),v_uid)
  returning id into v_location_id;
  return jsonb_build_object('id',v_location_id);
exception when unique_violation then
  raise exception 'Location code already exists for this company';
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_inventory_reservation_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid := auth.uid(); v_tenant_id uuid; v_company_id uuid; v_order_id uuid; v_idempotency_key text; v_reservation_id uuid; v_order record; v_line jsonb; v_soi record; v_item record; v_location record; v_stock record; v_available numeric; v_existing numeric; v_issued numeric; v_requested numeric; v_line_count integer:=0; v_hash text:=md5(p_payload::text); v_existing_res record;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'Invalid reservation payload'; end if;
  v_company_id:=nullif(p_payload->>'tenant_company_id','')::uuid; v_order_id:=nullif(p_payload->>'sales_order_id','')::uuid; v_idempotency_key:=nullif(trim(p_payload->>'idempotency_key'),'');
  if v_company_id is null or v_order_id is null or v_idempotency_key is null then raise exception 'tenant_company_id, sales_order_id and idempotency_key are required'; end if;
  if jsonb_typeof(p_payload->'lines')<>'array' or jsonb_array_length(p_payload->'lines')=0 then raise exception 'At least one reservation line is required'; end if;
  select tc.tenant_id into v_tenant_id from public.tenant_companies tc where tc.id=v_company_id and tc.status='active';
  if v_tenant_id is null then raise exception 'Active tenant company not found'; end if;
  if not (select private.has_company_access(v_tenant_id,v_company_id)) then raise exception 'Company access denied'; end if;
  if not (select private.has_action_permission(v_tenant_id,'TEAM')) then raise exception 'Insufficient permission to reserve inventory'; end if;
  select * into v_order from public.sales_orders so where so.id=v_order_id and so.tenant_id=v_tenant_id and so.tenant_company_id=v_company_id for update;
  if not found then raise exception 'Sales order not found for selected company'; end if;
  if v_order.status in ('cancelled','rejected','expired') then raise exception 'Sales order is not eligible for reservation'; end if;
  select * into v_existing_res from public.inventory_reservations r where r.tenant_company_id=v_company_id and r.idempotency_key=v_idempotency_key;
  if found then if v_existing_res.request_hash<>v_hash then raise exception 'Idempotency key was already used with a different payload'; end if; return jsonb_build_object('reservation_id',v_existing_res.id,'status',v_existing_res.status,'idempotent_replay',true); end if;
  insert into public.inventory_reservations(tenant_id,tenant_company_id,sales_order_id,reservation_date,status,idempotency_key,request_hash,notes,created_by) values(v_tenant_id,v_company_id,v_order_id,coalesce(nullif(p_payload->>'reservation_date','')::date,current_date),'active',v_idempotency_key,v_hash,nullif(p_payload->>'notes',''),v_user_id) returning id into v_reservation_id;
  for v_line in select value from jsonb_array_elements(p_payload->'lines') loop
    v_line_count:=v_line_count+1; v_requested:=nullif(v_line->>'quantity','')::numeric;
    if v_requested is null or v_requested<=0 then raise exception 'Reservation quantity must be greater than zero'; end if;
    select * into v_soi from public.sales_order_items soi where soi.id=nullif(v_line->>'sales_order_item_id','')::uuid and soi.sales_order_id=v_order_id and soi.tenant_id=v_tenant_id and soi.tenant_company_id=v_company_id for update;
    if not found then raise exception 'Sales order item is invalid for this sales order/company'; end if;
    select coalesce(sum(rl.reserved_quantity-rl.released_quantity),0),coalesce(sum(fl.issued_quantity),0) into v_existing,v_issued from public.inventory_reservation_lines rl join public.inventory_reservations r on r.id=rl.reservation_id left join public.inventory_fulfilment_lines fl on fl.tenant_company_id=rl.tenant_company_id and fl.sales_order_item_id=rl.sales_order_item_id and fl.inventory_item_id=rl.inventory_item_id and fl.location_id=rl.location_id and fl.lot_number is not distinct from rl.lot_number where rl.tenant_company_id=v_company_id and rl.sales_order_item_id=v_soi.id and r.status in ('active','partially_released','fulfilled');
    if v_existing-v_issued+v_requested>v_soi.quantity then raise exception 'Reservation exceeds unfulfilled ordered quantity for sales order item %',v_soi.id; end if;
    select * into v_item from public.inventory_items ii where ii.id=nullif(v_line->>'inventory_item_id','')::uuid and ii.tenant_id=v_tenant_id and ii.tenant_company_id=v_company_id and ii.is_active=true for update;
    if not found then raise exception 'Inventory item is invalid or inactive'; end if;
    select * into v_location from public.inventory_locations il where il.id=nullif(v_line->>'location_id','')::uuid and il.tenant_id=v_tenant_id and il.tenant_company_id=v_company_id and il.is_active=true and il.is_stock_location=true for update;
    if not found then raise exception 'Stock location is invalid or inactive'; end if;
    select * into v_stock from public.inventory_stock_balances sb where sb.tenant_id=v_tenant_id and sb.tenant_company_id=v_company_id and sb.item_id=v_item.id and sb.location_id=v_location.id and sb.lot_number is not distinct from nullif(v_line->>'lot_number','') for update;
    if not found then raise exception 'No stock balance exists for selected item/location/lot'; end if;
    select coalesce(sum(rl.reserved_quantity-rl.released_quantity),0)-coalesce(sum(fl.issued_quantity),0) into v_existing from public.inventory_reservation_lines rl join public.inventory_reservations r on r.id=rl.reservation_id left join public.inventory_fulfilment_lines fl on fl.tenant_company_id=rl.tenant_company_id and fl.sales_order_item_id=rl.sales_order_item_id and fl.inventory_item_id=rl.inventory_item_id and fl.location_id=rl.location_id and fl.lot_number is not distinct from rl.lot_number where rl.tenant_company_id=v_company_id and rl.inventory_item_id=v_item.id and rl.location_id=v_location.id and rl.lot_number is not distinct from v_stock.lot_number and r.status in ('active','partially_released','fulfilled');
    v_available:=v_stock.quantity_on_hand-v_existing; if v_requested>v_available then raise exception 'Insufficient available stock. Requested %, available %',v_requested,v_available; end if;
    insert into public.inventory_reservation_lines(tenant_id,tenant_company_id,reservation_id,sales_order_item_id,inventory_item_id,location_id,lot_number,requested_quantity,reserved_quantity,released_quantity,status,notes) values(v_tenant_id,v_company_id,v_reservation_id,v_soi.id,v_item.id,v_location.id,v_stock.lot_number,v_requested,v_requested,0,'active',nullif(v_line->>'notes',''));
  end loop;
  if v_line_count=0 then raise exception 'At least one reservation line is required'; end if;
  update public.inventory_reservations set updated_at=now() where id=v_reservation_id;
  return jsonb_build_object('reservation_id',v_reservation_id,'status','active','idempotent_replay',false);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_owner_company_atomic(p_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_tenant uuid:=(p_payload->>'tenant_id')::uuid; v_tc uuid; v_name text:=nullif(trim(p_payload->>'name'),''); v_code text:=nullif(trim(p_payload->>'code'),''); p jsonb:=coalesce(p_payload->'profile','{}'::jsonb);
begin
 if v_tenant is null or not private.has_action_permission(v_tenant,'OWNER') then raise exception 'not authorized'; end if;
 if v_name is null then raise exception 'company name is required'; end if;
 if exists(select 1 from public.tenant_companies where tenant_id=v_tenant and lower(name)=lower(v_name) and status<>'archived') then raise exception 'company name already exists'; end if;
 if v_code is not null and exists(select 1 from public.tenant_companies where tenant_id=v_tenant and lower(code)=lower(v_code) and status<>'archived') then raise exception 'company code already exists'; end if;
 insert into public.tenant_companies(tenant_id,name,code,status) values(v_tenant,v_name,v_code,'active') returning id into v_tc;
 insert into public.companies(name,tenant_id,tenant_company_id) values(v_name,v_tenant,v_tc);
 insert into public.company_profiles(tenant_company_id,tenant_id,legal_name,display_name,trading_name,company_type,business_type,industry,nature_of_business,description,website,official_email,official_phone,alternate_phone,incorporation_date,commencement_date,employee_count,financial_year_start_month,currency_code,timezone,is_primary)
 values(v_tc,v_tenant,nullif(p->>'legal_name',''),nullif(p->>'display_name',''),nullif(p->>'trading_name',''),nullif(p->>'company_type',''),nullif(p->>'business_type',''),nullif(p->>'industry',''),nullif(p->>'nature_of_business',''),nullif(p->>'description',''),nullif(p->>'website',''),nullif(p->>'official_email',''),nullif(p->>'official_phone',''),nullif(p->>'alternate_phone',''),nullif(p->>'incorporation_date','')::date,nullif(p->>'commencement_date','')::date,nullif(p->>'employee_count','')::integer,coalesce(nullif(p->>'financial_year_start_month','')::smallint,4),coalesce(nullif(p->>'currency_code',''),'INR'),coalesce(nullif(p->>'timezone',''),'Asia/Kolkata'),coalesce((p->>'is_primary')::boolean,false));
 insert into public.company_settings(tenant_company_id,tenant_id) values(v_tc,v_tenant);
 insert into public.company_branding(tenant_company_id,tenant_id) values(v_tc,v_tenant);
 insert into public.company_settings_audit(tenant_id,tenant_company_id,actor_user_id,entity_type,entity_id,action,new_data) values(v_tenant,v_tc,auth.uid(),'tenant_company',v_tc,'create',jsonb_build_object('name',v_name,'code',v_code));
 return v_tc;
end $function$
;

CREATE OR REPLACE FUNCTION public.create_owner_company_settings_atomic(p_payload jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_tenant uuid := (p_payload->>'tenant_id')::uuid;
  v_tc uuid;
  v_name text := nullif(trim(p_payload->>'name'),'');
  v_code text := nullif(trim(p_payload->>'code'),'');
begin
  if v_tenant is null or not private.has_action_permission(v_tenant,'OWNER') then
    raise exception 'not authorized';
  end if;
  if v_name is null then raise exception 'company name is required'; end if;

  if exists(select 1 from public.tenant_companies where tenant_id=v_tenant and lower(name)=lower(v_name) and status<>'archived') then
    raise exception 'company name already exists';
  end if;
  if v_code is not null and exists(select 1 from public.tenant_companies where tenant_id=v_tenant and lower(code)=lower(v_code) and status<>'archived') then
    raise exception 'company code already exists';
  end if;

  insert into public.tenant_companies(tenant_id,name,code,status)
  values(v_tenant,v_name,v_code,coalesce(nullif(p_payload->>'status',''),'active'))
  returning id into v_tc;

  insert into public.companies(name,tenant_id,tenant_company_id)
  values(v_name,v_tenant,v_tc);

  insert into public.company_profiles(tenant_company_id,tenant_id)
  values(v_tc,v_tenant);

  insert into public.company_settings(tenant_company_id,tenant_id)
  values(v_tc,v_tenant);

  insert into public.company_branding(tenant_company_id,tenant_id)
  values(v_tc,v_tenant);

  -- Reuse the exact same section contract for all optional company settings.
  perform public.save_owner_company_settings_atomic(
    jsonb_set(p_payload,'{tenant_company_id}',to_jsonb(v_tc),true)
  );

  return v_tc;
end
$function$
;

CREATE OR REPLACE FUNCTION public.create_payroll_payment_batch_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_run_id uuid := nullif(p_payload->>'payroll_run_id','')::uuid;
  v_bank_id uuid := nullif(p_payload->>'bank_account_id','')::uuid;
  v_payment_date date := coalesce(nullif(p_payload->>'payment_date','')::date,current_date);
  v_idem text := nullif(trim(p_payload->>'idempotency_key'),'');
  v_batch public.payroll_payment_batches%rowtype;
  v_run public.payroll_runs%rowtype;
  v_item public.payroll_run_items%rowtype;
  v_bank public.accounting_bank_accounts%rowtype;
  v_emp_bank public.employee_bank_accounts%rowtype;
  v_total numeric(18,2) := 0;
  v_count integer := 0;
  v_hash text;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_run_id is null or v_bank_id is null or v_idem is null then raise exception 'Tenant, company, payroll run, bank account and idempotency key are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;

  select * into v_run from public.payroll_runs where id=v_run_id and tenant_id=v_tenant and tenant_company_id=v_company for update;
  if not found then raise exception 'PAYROLL_RUN_NOT_FOUND'; end if;
  if v_run.status <> 'posted' then raise exception 'PAYROLL_RUN_MUST_BE_POSTED_BEFORE_PAYMENT'; end if;
  if exists(select 1 from public.payroll_payment_batches where tenant_company_id=v_company and payroll_run_id=v_run_id and status <> 'cancelled') then raise exception 'PAYROLL_PAYMENT_BATCH_ALREADY_EXISTS'; end if;

  select * into v_bank from public.accounting_bank_accounts where id=v_bank_id and tenant_id=v_tenant and tenant_company_id=v_company and is_active=true for update;
  if not found then raise exception 'ACTIVE_BANK_ACCOUNT_NOT_FOUND'; end if;

  v_hash := md5(jsonb_build_object('tenant_id',v_tenant,'tenant_company_id',v_company,'payroll_run_id',v_run_id,'payment_date',v_payment_date,'bank_account_id',v_bank_id)::text);
  select * into v_batch from public.payroll_payment_batches where tenant_company_id=v_company and idempotency_key=v_idem for update;
  if found then
    if v_batch.request_hash is distinct from v_hash then raise exception 'Idempotency key has already been used with a different payload'; end if;
    return jsonb_build_object('id',v_batch.id,'idempotent',true,'status',v_batch.status,'total_amount',v_batch.total_amount);
  end if;

  insert into public.payroll_payment_batches(tenant_id,tenant_company_id,payroll_run_id,payment_date,status,payment_method,bank_account_id,idempotency_key,request_hash,created_by)
  values(v_tenant,v_company,v_run_id,v_payment_date,'draft','bank_transfer',v_bank_id,v_idem,v_hash,v_uid)
  returning * into v_batch;

  for v_item in select * from public.payroll_run_items where payroll_run_id=v_run_id and tenant_id=v_tenant and tenant_company_id=v_company order by employee_id loop
    if v_item.net_pay < 0 then raise exception 'NEGATIVE_NET_PAY_NOT_ALLOWED'; end if;
    select * into v_emp_bank
    from public.employee_bank_accounts eb
    where eb.id = (
      select eb2.id from public.employee_bank_accounts eb2
      where eb2.employee_id=v_item.employee_id and eb2.tenant_id=v_tenant and eb2.verification_status='verified' and eb2.is_primary_salary_account=true
      order by eb2.updated_at desc, eb2.created_at desc limit 1
    );
    if not found then raise exception 'VERIFIED_PRIMARY_SALARY_BANK_ACCOUNT_REQUIRED_FOR_EMPLOYEE:%',v_item.employee_id; end if;
    if not exists(select 1 from public.employees e where e.id=v_item.employee_id and e.tenant_id=v_tenant and e.tenant_company_id=v_company) then raise exception 'EMPLOYEE_COMPANY_MISMATCH'; end if;
    insert into public.payroll_payment_items(tenant_id,tenant_company_id,payment_batch_id,payroll_run_id,payroll_run_item_id,employee_id,employee_bank_account_id,amount)
    values(v_tenant,v_company,v_batch.id,v_run_id,v_item.id,v_item.employee_id,v_emp_bank.id,round(v_item.net_pay,2));
    v_total := v_total + round(v_item.net_pay,2);
    v_count := v_count + 1;
  end loop;

  if v_count=0 then raise exception 'PAYROLL_RUN_HAS_NO_PAYABLE_EMPLOYEES'; end if;
  update public.payroll_payment_batches set total_employees=v_count,total_amount=round(v_total,2),updated_at=now() where id=v_batch.id;
  return jsonb_build_object('id',v_batch.id,'status','draft','total_employees',v_count,'total_amount',round(v_total,2));
exception when unique_violation then
  select * into v_batch from public.payroll_payment_batches where tenant_company_id=v_company and (idempotency_key=v_idem or payroll_run_id=v_run_id) order by created_at desc limit 1;
  if v_batch.id is not null then return jsonb_build_object('id',v_batch.id,'idempotent',true,'status',v_batch.status,'total_amount',v_batch.total_amount); end if;
  raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_payroll_run_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid(); v_tenant uuid:=nullif(p_payload->>'tenant_id','')::uuid; v_company uuid:=nullif(p_payload->>'tenant_company_id','')::uuid; v_period uuid:=nullif(p_payload->>'payroll_period_id','')::uuid; v_version text:=coalesce(nullif(trim(p_payload->>'calculation_version'),''),'P0'); v_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_period is null then raise exception 'Tenant, company and payroll_period_id are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  if not exists(select 1 from public.payroll_periods p where p.id=v_period and p.tenant_id=v_tenant and p.tenant_company_id=v_company and p.status in ('open','processing','calculated','under_review')) then raise exception 'PAYROLL_PERIOD_NOT_OPEN_FOR_RUN'; end if;
  if exists(select 1 from public.payroll_runs r where r.tenant_id=v_tenant and r.tenant_company_id=v_company and r.payroll_period_id=v_period) then raise exception 'PAYROLL_RUN_ALREADY_EXISTS_FOR_PERIOD'; end if;
  insert into public.payroll_runs(tenant_id,tenant_company_id,payroll_period_id,status,calculation_version,calculation_snapshot,created_by,created_at,updated_at)
  values(v_tenant,v_company,v_period,'draft',v_version,'{}'::jsonb,v_uid,now(),now()) returning id into v_id;
  return jsonb_build_object('id',v_id,'status','draft','calculation_version',v_version);
end;$function$
;

CREATE OR REPLACE FUNCTION public.create_proforma_invoice_atomic(p_header_json jsonb, p_items_json jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  h public.proforma_invoices%ROWTYPE;
  o public.sales_orders%ROWTYPE;
  q public.sales_quotations%ROWTYPE;
  x jsonb;
  v_tenant uuid;
  v_tc uuid;
  v_company uuid;
  v_order_id uuid := NULLIF(p_header_json->>'sales_order_id','')::uuid;
  v_quote_id uuid := NULLIF(p_header_json->>'quotation_id','')::uuid;
  v_no text;
  v_date date := COALESCE((p_header_json->>'proforma_date')::date, CURRENT_DATE);
  v_fy text := CASE WHEN EXTRACT(MONTH FROM v_date) >= 4 THEN EXTRACT(YEAR FROM v_date)::int::text || '-' || (EXTRACT(YEAR FROM v_date)::int+1)::text ELSE (EXTRACT(YEAR FROM v_date)::int-1)::text || '-' || EXTRACT(YEAR FROM v_date)::int::text END;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  IF v_order_id IS NOT NULL THEN
    SELECT * INTO o FROM public.sales_orders WHERE id = v_order_id FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Sales order not found'; END IF;
    v_tenant := o.tenant_id;
    v_tc := o.tenant_company_id;
    v_company := o.company_id;
  ELSE
    v_tenant := (p_header_json->>'tenant_id')::uuid;
    v_tc := (p_header_json->>'tenant_company_id')::uuid;
    v_company := (p_header_json->>'company_id')::uuid;
  END IF;

  IF v_tenant IS NULL OR v_tc IS NULL OR v_company IS NULL THEN
    RAISE EXCEPTION 'Tenant, operating company and CRM customer company are required';
  END IF;
  IF NOT private.has_action_permission(v_tenant,'MANAGER') OR NOT private.has_company_access(v_tenant,v_tc) THEN
    RAISE EXCEPTION 'Proforma invoice creation denied';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.companies c WHERE c.id=v_company AND c.tenant_id=v_tenant AND c.tenant_company_id=v_tc) THEN
    RAISE EXCEPTION 'Invalid CRM customer company';
  END IF;

  IF v_quote_id IS NOT NULL THEN
    SELECT * INTO q FROM public.sales_quotations WHERE id=v_quote_id FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Quotation not found'; END IF;
    IF q.tenant_id <> v_tenant OR q.tenant_company_id <> v_tc OR q.company_id <> v_company THEN
      RAISE EXCEPTION 'Quotation company scope mismatch';
    END IF;
  END IF;

  IF v_order_id IS NOT NULL AND (o.tenant_id <> v_tenant OR o.tenant_company_id <> v_tc OR o.company_id <> v_company) THEN
    RAISE EXCEPTION 'Sales order company scope mismatch';
  END IF;

  v_no := private.get_next_sales_doc_number(v_tenant,v_tc,'PROFORMA',v_fy);

  INSERT INTO public.proforma_invoices(
    tenant_id,tenant_company_id,proforma_no,proforma_date,customer_name,sales_order_id,status,currency_code,
    subtotal,tax_amount,total_amount,notes,created_by,quotation_id,company_id,enquiry_id,work_id,due_date,
    customer_gstin,place_of_supply,reverse_charge,cgst_amount,sgst_amount,igst_amount,terms_and_conditions
  )
  VALUES(
    v_tenant,v_tc,v_no,v_date,
    COALESCE(p_header_json->>'customer_name',COALESCE(o.customer_name,COALESCE(q.customer_name,''))),
    v_order_id,'draft',
    COALESCE(p_header_json->>'currency_code',COALESCE(o.currency_code,COALESCE(q.currency_code,'INR'))),
    0,0,0,p_header_json->>'notes',auth.uid(),v_quote_id,v_company,
    NULLIF(p_header_json->>'enquiry_id','')::uuid,NULLIF(p_header_json->>'work_id','')::uuid,
    NULLIF(p_header_json->>'due_date','')::date,p_header_json->>'customer_gstin',p_header_json->>'place_of_supply',
    COALESCE((p_header_json->>'reverse_charge')::boolean,false),0,0,0,p_header_json->>'terms_and_conditions'
  ) RETURNING * INTO h;

  FOR x IN SELECT * FROM jsonb_array_elements(COALESCE(p_items_json,'[]'::jsonb)) LOOP
    INSERT INTO public.proforma_invoice_items(
      tenant_id,tenant_company_id,proforma_invoice_id,item_description,hsn_sac_code,quantity,unit_price,
      taxable_value,gst_rate_pct,cgst_rate,sgst_rate,igst_rate,cgst_amount,sgst_amount,igst_amount,line_total
    ) VALUES(
      v_tenant,v_tc,h.id,COALESCE(x->>'item_description',''),x->>'hsn_sac_code',
      COALESCE((x->>'quantity')::numeric,1),COALESCE((x->>'unit_price')::numeric,0),
      COALESCE((x->>'taxable_value')::numeric,0),COALESCE((x->>'gst_rate_pct')::numeric,0),
      COALESCE((x->>'cgst_rate')::numeric,0),COALESCE((x->>'sgst_rate')::numeric,0),COALESCE((x->>'igst_rate')::numeric,0),
      COALESCE((x->>'cgst_amount')::numeric,0),COALESCE((x->>'sgst_amount')::numeric,0),COALESCE((x->>'igst_amount')::numeric,0),
      COALESCE((x->>'line_total')::numeric,COALESCE((x->>'taxable_value')::numeric,0)+COALESCE((x->>'cgst_amount')::numeric,0)+COALESCE((x->>'sgst_amount')::numeric,0)+COALESCE((x->>'igst_amount')::numeric,0))
    );
  END LOOP;

  UPDATE public.proforma_invoices i
  SET subtotal=s.subtotal,tax_amount=s.tax_amount,total_amount=s.total_amount,
      cgst_amount=s.cgst,sgst_amount=s.sgst,igst_amount=s.igst,updated_at=now()
  FROM (
    SELECT COALESCE(sum(taxable_value),0) subtotal,
           COALESCE(sum(cgst_amount+sgst_amount+igst_amount),0) tax_amount,
           COALESCE(sum(line_total),0) total_amount,
           COALESCE(sum(cgst_amount),0) cgst,
           COALESCE(sum(sgst_amount),0) sgst,
           COALESCE(sum(igst_amount),0) igst
    FROM public.proforma_invoice_items WHERE proforma_invoice_id=h.id
  ) s
  WHERE i.id=h.id
  RETURNING i.* INTO h;

  RETURN to_jsonb(h);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_purchase_bill_atomic(p_header jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid(); v_tenant uuid; v_tc uuid; v_company uuid; v_vendor uuid;
  v_po uuid; v_grn uuid; v_id uuid; v_no text; v_item jsonb; v_sub numeric:=0;
  v_tax numeric:=0; v_total numeric:=0; v_taxable numeric; v_rate numeric;
  v_cgst numeric; v_sgst numeric; v_igst numeric; v_line numeric;
  v_fy text:=to_char(coalesce((p_header->>'bill_date')::date,current_date),'YYYY');
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  v_tenant:=(p_header->>'tenant_id')::uuid; v_tc:=(p_header->>'tenant_company_id')::uuid;
  v_company:=(p_header->>'company_id')::uuid; v_vendor:=(p_header->>'vendor_id')::uuid;
  v_po:=(p_header->>'purchase_order_id')::uuid; v_grn:=(p_header->>'grn_id')::uuid;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then raise exception 'Not authorized'; end if;

  if not exists(select 1 from public.companies c
    where c.id=v_company and c.tenant_id=v_tenant and c.tenant_company_id=v_tc)
  then raise exception 'Invalid company'; end if;

  if not exists(select 1 from public.vendors v
    where v.id=v_vendor and v.tenant_id=v_tenant and v.tenant_company_id=v_tc)
  then raise exception 'Invalid vendor'; end if;

  if v_po is not null and not exists(select 1 from public.purchase_orders p
    where p.id=v_po and p.tenant_id=v_tenant and p.tenant_company_id=v_tc
      and p.company_id=v_company and p.vendor_id=v_vendor)
  then raise exception 'Invalid purchase order linkage'; end if;

  if v_grn is not null and not exists(select 1 from public.goods_received_notes g
    where g.id=v_grn and g.tenant_id=v_tenant and g.tenant_company_id=v_tc
      and g.company_id=v_company and g.vendor_id=v_vendor
      and (v_po is null or g.purchase_order_id=v_po))
  then raise exception 'Invalid GRN linkage'; end if;

  v_no:=private.get_next_purchase_doc_number(v_tenant,v_tc,'PB',v_fy);

  insert into public.purchase_bills(
    tenant_id,tenant_company_id,company_id,bill_no,vendor_invoice_no,bill_date,due_date,
    vendor_id,purchase_order_id,grn_id,work_id,status,currency_code,vendor_gstin,
    reverse_charge,created_by
  ) values(
    v_tenant,v_tc,v_company,v_no,p_header->>'vendor_invoice_no',
    coalesce((p_header->>'bill_date')::date,current_date),(p_header->>'due_date')::date,
    v_vendor,v_po,v_grn,(p_header->>'work_id')::uuid,'verified',
    coalesce(p_header->>'currency_code','INR'),p_header->>'vendor_gstin',
    coalesce((p_header->>'reverse_charge')::boolean,false),v_uid
  ) returning id into v_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_taxable:=(v_item->>'quantity')::numeric*(v_item->>'unit_price')::numeric;
    v_rate:=coalesce((v_item->>'tax_rate')::numeric,0);
    v_cgst:=coalesce((v_item->>'cgst_amount')::numeric,v_taxable*v_rate/200);
    v_sgst:=coalesce((v_item->>'sgst_amount')::numeric,v_taxable*v_rate/200);
    v_igst:=coalesce((v_item->>'igst_amount')::numeric,0);
    v_line:=v_taxable+v_cgst+v_sgst+v_igst;
    v_sub:=v_sub+v_taxable; v_tax:=v_tax+v_cgst+v_sgst+v_igst; v_total:=v_total+v_line;

    insert into public.purchase_bill_items(
      tenant_id,tenant_company_id,purchase_bill_id,description,item_code,quantity,unit,
      unit_price,taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,notes,
      inventory_item_id,purchase_order_item_id,goods_received_note_item_id
    ) values(
      v_tenant,v_tc,v_id,v_item->>'description',v_item->>'item_code',(v_item->>'quantity')::numeric,
      coalesce(v_item->>'unit','NOS'),(v_item->>'unit_price')::numeric,v_taxable,v_rate,v_cgst,v_sgst,v_igst,v_line,v_item->>'notes',
      nullif(v_item->>'inventory_item_id','')::uuid,
      nullif(v_item->>'purchase_order_item_id','')::uuid,
      nullif(v_item->>'goods_received_note_item_id','')::uuid
    );
  end loop;

  update public.purchase_bills set
    subtotal=v_sub,
    cgst_amount=(select coalesce(sum(cgst_amount),0) from public.purchase_bill_items where purchase_bill_id=v_id),
    sgst_amount=(select coalesce(sum(sgst_amount),0) from public.purchase_bill_items where purchase_bill_id=v_id),
    igst_amount=(select coalesce(sum(igst_amount),0) from public.purchase_bill_items where purchase_bill_id=v_id),
    tax_amount=v_tax,total_amount=v_total,balance_due=v_total,
    notes=p_header->>'notes',updated_at=now()
  where id=v_id;

  return jsonb_build_object(
    'bill',(select to_jsonb(x) from public.purchase_bills x where x.id=v_id),
    'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) from public.purchase_bill_items i where i.purchase_bill_id=v_id)
  );
end
$function$
;

CREATE OR REPLACE FUNCTION public.create_purchase_bill_with_accounting_atomic(p_header jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid:=nullif(p_header->>'tenant_id','')::uuid;
  v_tc uuid:=nullif(p_header->>'tenant_company_id','')::uuid;
  v_company uuid:=nullif(p_header->>'company_id','')::uuid;
  v_vendor uuid:=nullif(p_header->>'vendor_id','')::uuid;
  v_grn uuid:=nullif(p_header->>'grn_id','')::uuid;
  v_po uuid:=nullif(p_header->>'purchase_order_id','')::uuid;
  v_idem text:=nullif(trim(p_header->>'idempotency_key'),'');
  v_hash text:=md5(jsonb_build_object('header',p_header,'items',coalesce(p_items,'[]'::jsonb))::text);
  v_existing public.procurement_accounting_idempotency%rowtype;
  v_bill_result jsonb; v_bill_id uuid; v_bill_no text; v_bill_date date;
  v_stock_subtotal numeric:=0; v_expense_subtotal numeric:=0;
  v_bill_stock_qty numeric:=0; v_ref_grn_value numeric:=0; v_grni_debit numeric:=0; v_ppv numeric:=0;
  v_cgst numeric:=0; v_sgst numeric:=0; v_igst numeric:=0; v_total numeric:=0;
  v_ap uuid; v_grni uuid; v_expense uuid; v_ppv_account uuid;
  v_cgst_account uuid; v_sgst_account uuid; v_igst_account uuid;
  v_journal_lines jsonb:='[]'::jsonb; v_journal_result jsonb;
  v_match_count integer; v_is_stock boolean; v_grni_posted numeric:=0;
  v_current_qty numeric; v_prior_qty numeric; v_available_qty numeric; v_unit_price numeric;
  r record;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if v_tenant is null or v_tc is null or v_company is null or v_vendor is null or v_po is null or v_idem is null then
    raise exception 'Tenant, company, operating company, vendor, purchase order and idempotency key are required';
  end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_tc) then
    raise exception 'Not authorized';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_tc::text||':'||v_idem,0));

  select * into v_existing
  from public.procurement_accounting_idempotency
  where tenant_company_id=v_tc and idempotency_key=v_idem;

  if found then
    if v_existing.request_hash<>v_hash then
      raise exception 'Idempotency key has already been used with a different payload';
    end if;
    return jsonb_build_object('purchase_bill_id',v_existing.source_id,'idempotent_replay',true);
  end if;

  if not exists (
    select 1 from public.purchase_orders po
    where po.id=v_po and po.tenant_id=v_tenant and po.tenant_company_id=v_tc
      and po.company_id=v_company and po.vendor_id=v_vendor
      and po.status in ('approved','issued','partially_received','received')
  ) then
    raise exception 'Purchase order is invalid, inaccessible, wrong vendor/company, or not approved';
  end if;

  v_bill_result:=public.create_purchase_bill_atomic(p_header,p_items);
  v_bill_id:=(v_bill_result->'bill'->>'id')::uuid;
  v_bill_no:=v_bill_result->'bill'->>'bill_no';
  v_bill_date:=coalesce((v_bill_result->'bill'->>'bill_date')::date,current_date);
  v_cgst:=coalesce((v_bill_result->'bill'->>'cgst_amount')::numeric,0);
  v_sgst:=coalesce((v_bill_result->'bill'->>'sgst_amount')::numeric,0);
  v_igst:=coalesce((v_bill_result->'bill'->>'igst_amount')::numeric,0);
  v_total:=coalesce((v_bill_result->'bill'->>'total_amount')::numeric,0);

  for r in select pbi.* from public.purchase_bill_items pbi where pbi.purchase_bill_id=v_bill_id loop
    select count(*) into v_match_count
    from public.inventory_items ii
    where ii.tenant_id=v_tenant and ii.tenant_company_id=v_tc
      and ii.item_code=r.item_code and ii.is_active;

    if v_match_count>1 then
      raise exception 'Purchase bill item code % maps to multiple active inventory items',r.item_code;
    end if;

    v_is_stock := (
      v_match_count=1 and exists(
        select 1 from public.inventory_items ii
        where ii.tenant_id=v_tenant and ii.tenant_company_id=v_tc
          and ii.item_code=r.item_code and ii.is_active and ii.item_type<>'service'
      )
    );

    if v_is_stock then
      v_stock_subtotal:=v_stock_subtotal+r.taxable_amount;
      v_bill_stock_qty:=v_bill_stock_qty+r.quantity;
    else
      v_expense_subtotal:=v_expense_subtotal+r.taxable_amount;
    end if;
  end loop;

  v_ap:=private.resolve_procurement_account(v_tenant,v_tc,'accounts_payable');

  if v_stock_subtotal>0 then
    if v_grn is null then
      raise exception 'Stock purchase bills require a referenced posted GRN';
    end if;

    if not exists(
      select 1 from public.goods_received_notes g
      where g.id=v_grn and g.tenant_id=v_tenant and g.tenant_company_id=v_tc
        and g.company_id=v_company and g.vendor_id=v_vendor
        and g.purchase_order_id=v_po and g.status='posted'
    ) then
      raise exception 'Referenced GRN does not match the purchase bill PO, vendor, company, or posted status';
    end if;

    -- Every stock bill line must identify the PO/GRN item when supplied.
    for r in select pbi.* from public.purchase_bill_items pbi where pbi.purchase_bill_id=v_bill_id loop
      if exists(
        select 1 from public.inventory_items ii
        where ii.tenant_id=v_tenant and ii.tenant_company_id=v_tc
          and ii.item_code=r.item_code and ii.is_active and ii.item_type<>'service'
      ) then
        if r.goods_received_note_item_id is not null then
          if not exists(
            select 1
            from public.goods_received_note_items gri
            join public.purchase_order_items poi on poi.id=gri.purchase_order_item_id
            where gri.id=r.goods_received_note_item_id
              and gri.grn_id=v_grn
              and poi.purchase_order_id=v_po
          ) then
            raise exception 'Purchase bill line references a GRN item outside the selected PO/GRN';
          end if;
        elsif r.purchase_order_item_id is not null then
          if not exists(
            select 1 from public.purchase_order_items poi
            where poi.id=r.purchase_order_item_id and poi.purchase_order_id=v_po
          ) then
            raise exception 'Purchase bill line references a purchase-order item outside the selected PO';
          end if;
        end if;
      end if;
    end loop;

    -- Partial billing is allowed. Current bill quantity must not exceed
    -- accepted quantity remaining after previously posted/accounted bills.
    for r in
      select poi.id po_item_id, poi.item_code, poi.unit_price,
             coalesce(sum(gri.accepted_quantity),0) grn_qty
      from public.goods_received_note_items gri
      join public.purchase_order_items poi on poi.id=gri.purchase_order_item_id
      where gri.grn_id=v_grn and poi.purchase_order_id=v_po
      group by poi.id, poi.item_code, poi.unit_price
    loop
      select coalesce(sum(pbi.quantity),0) into v_current_qty
      from public.purchase_bill_items pbi
      join public.purchase_bills pb on pb.id=pbi.purchase_bill_id
      where pb.id=v_bill_id
        and (
          (r.item_code is not null and pbi.item_code=r.item_code)
          or pbi.purchase_order_item_id=r.po_item_id
        );

      select coalesce(sum(pbi.quantity),0) into v_prior_qty
      from public.purchase_bill_items pbi
      join public.purchase_bills pb on pb.id=pbi.purchase_bill_id
      where pb.id<>v_bill_id
        and pb.grn_id=v_grn
        and pb.tenant_id=v_tenant and pb.tenant_company_id=v_tc
        and pb.status not in ('cancelled','rejected')
        and (
          (r.item_code is not null and pbi.item_code=r.item_code)
          or pbi.purchase_order_item_id=r.po_item_id
        );

      v_available_qty:=r.grn_qty-v_prior_qty;

      if v_current_qty>v_available_qty then
        raise exception 'Purchase bill quantity for PO item % exceeds unbilled accepted GRN quantity. Available %, requested %',
          r.po_item_id,v_available_qty,v_current_qty;
      end if;

      if v_current_qty>0 then
        v_ref_grn_value:=v_ref_grn_value+(v_current_qty*r.unit_price);
      end if;
    end loop;

    if v_ref_grn_value<=0 then
      raise exception 'Referenced GRN has no positively valued accepted quantity available for billing';
    end if;

    select coalesce(sum(jl.credit-jl.debit),0) into v_grni_posted
    from public.accounting_journal_entries je
    join public.accounting_journal_lines jl on jl.journal_entry_id=je.id
    where je.tenant_id=v_tenant and je.tenant_company_id=v_tc
      and je.source_type='procurement_grn' and je.source_id=v_grn
      and je.status='posted' and jl.account_id=private.resolve_procurement_account(v_tenant,v_tc,'grni_clearing');

    if v_grni_posted < v_ref_grn_value then
      raise exception 'GRNI accrual remaining value is insufficient for this purchase bill';
    end if;

    v_grni_debit:=v_ref_grn_value;
    v_ppv:=v_stock_subtotal-v_ref_grn_value;
    v_grni:=private.resolve_procurement_account(v_tenant,v_tc,'grni_clearing');
  end if;

  if v_expense_subtotal>0 then
    v_expense:=private.resolve_procurement_account(v_tenant,v_tc,'purchase_expense');
  end if;
  if v_ppv<>0 then
    v_ppv_account:=private.resolve_procurement_account(v_tenant,v_tc,'purchase_price_variance');
  end if;
  if v_cgst>0 then v_cgst_account:=private.resolve_procurement_account(v_tenant,v_tc,'input_cgst'); end if;
  if v_sgst>0 then v_sgst_account:=private.resolve_procurement_account(v_tenant,v_tc,'input_sgst'); end if;
  if v_igst>0 then v_igst_account:=private.resolve_procurement_account(v_tenant,v_tc,'input_igst'); end if;

  if v_grni_debit>0 then
    v_journal_lines:=v_journal_lines||jsonb_build_array(jsonb_build_object('account_id',v_grni,'debit_amount',v_grni_debit,'credit_amount',0,'description','GRNI clearing - '||v_bill_no));
  end if;
  if v_expense_subtotal>0 then
    v_journal_lines:=v_journal_lines||jsonb_build_array(jsonb_build_object('account_id',v_expense,'debit_amount',v_expense_subtotal,'credit_amount',0,'description','Purchase expense - '||v_bill_no));
  end if;
  if v_ppv>0 then
    v_journal_lines:=v_journal_lines||jsonb_build_array(jsonb_build_object('account_id',v_ppv_account,'debit_amount',v_ppv,'credit_amount',0,'description','Purchase price variance - '||v_bill_no));
  elsif v_ppv<0 then
    v_journal_lines:=v_journal_lines||jsonb_build_array(jsonb_build_object('account_id',v_ppv_account,'debit_amount',0,'credit_amount',abs(v_ppv),'description','Purchase price variance income - '||v_bill_no));
  end if;
  if v_cgst>0 then v_journal_lines:=v_journal_lines||jsonb_build_array(jsonb_build_object('account_id',v_cgst_account,'debit_amount',v_cgst,'credit_amount',0,'description','Input CGST - '||v_bill_no)); end if;
  if v_sgst>0 then v_journal_lines:=v_journal_lines||jsonb_build_array(jsonb_build_object('account_id',v_sgst_account,'debit_amount',v_sgst,'credit_amount',0,'description','Input SGST - '||v_bill_no)); end if;
  if v_igst>0 then v_journal_lines:=v_journal_lines||jsonb_build_array(jsonb_build_object('account_id',v_igst_account,'debit_amount',v_igst,'credit_amount',0,'description','Input IGST - '||v_bill_no)); end if;

  v_journal_lines:=v_journal_lines||jsonb_build_array(jsonb_build_object(
    'account_id',v_ap,'debit_amount',0,'credit_amount',v_total,
    'party_type','vendor','party_id',v_vendor,'description','Accounts payable - '||v_bill_no
  ));

  v_journal_result:=public.post_journal_entry_atomic(jsonb_build_object(
    'tenant_id',v_tenant,'tenant_company_id',v_tc,'entry_date',v_bill_date,
    'voucher_type','PURCHASE_BILL','narration','Purchase bill accounting - '||v_bill_no,
    'source_type','procurement_purchase_bill','source_id',v_bill_id,
    'idempotency_key','procurement-purchase-bill:'||v_idem,'lines',v_journal_lines
  ));

  insert into public.procurement_accounting_idempotency(
    tenant_id,tenant_company_id,idempotency_key,request_hash,source_type,source_id
  ) values(v_tenant,v_tc,v_idem,v_hash,'procurement_purchase_bill',v_bill_id);

  return jsonb_build_object(
    'bill',(select to_jsonb(b) from public.purchase_bills b where b.id=v_bill_id),
    'journal',v_journal_result,
    'grni_cleared',v_grni_debit,
    'ppv',v_ppv,
    'idempotent_replay',false
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_purchase_order_atomic(p_header jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid; v_tc uuid; v_company uuid; v_vendor uuid; v_id uuid; v_no text;
  v_item jsonb; v_sub numeric:=0; v_tax numeric:=0; v_total numeric:=0;
  v_taxable numeric; v_rate numeric; v_cgst numeric; v_sgst numeric; v_igst numeric; v_line numeric;
  v_fy text:=to_char(coalesce((p_header->>'po_date')::date,current_date),'YYYY');
  v_boq_line public.master_boq_lines%rowtype; v_existing_qty numeric; v_requested_qty numeric; v_uom text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  v_tenant:=(p_header->>'tenant_id')::uuid; v_tc:=(p_header->>'tenant_company_id')::uuid;
  v_company:=(p_header->>'company_id')::uuid; v_vendor:=(p_header->>'vendor_id')::uuid;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then
    raise exception 'Not authorized';
  end if;

  if not exists(select 1 from public.companies c
    where c.id=v_company and c.tenant_id=v_tenant and c.tenant_company_id=v_tc)
  then raise exception 'Invalid company'; end if;

  if not exists(select 1 from public.vendors v
    where v.id=v_vendor and v.tenant_id=v_tenant
      and v.tenant_company_id=v_tc and v.status='active')
  then raise exception 'Invalid or inactive vendor'; end if;

  v_no:=private.get_next_purchase_doc_number(v_tenant,v_tc,'PO',v_fy);

  insert into public.purchase_orders(
    tenant_id,tenant_company_id,company_id,po_no,po_date,vendor_id,
    purchase_request_id,rfq_id,vendor_quotation_id,work_id,status,currency_code,
    expected_delivery_date,payment_terms_days,vendor_gstin,place_of_supply,reverse_charge,created_by
  ) values(
    v_tenant,v_tc,v_company,v_no,coalesce((p_header->>'po_date')::date,current_date),v_vendor,
    (p_header->>'purchase_request_id')::uuid,(p_header->>'rfq_id')::uuid,
    (p_header->>'vendor_quotation_id')::uuid,(p_header->>'work_id')::uuid,'draft',
    coalesce(p_header->>'currency_code','INR'),(p_header->>'expected_delivery_date')::date,
    coalesce((p_header->>'payment_terms_days')::int,0),p_header->>'vendor_gstin',
    p_header->>'place_of_supply',coalesce((p_header->>'reverse_charge')::boolean,false),v_uid
  ) returning id into v_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_requested_qty:=coalesce((v_item->>'quantity')::numeric,0);
    if v_requested_qty <= 0 then raise exception 'PO quantity must be greater than zero'; end if;

    if nullif(v_item->>'master_boq_line_id','') is not null then
      if not (v_item->>'master_boq_line_id')::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then raise exception 'Invalid master_boq_line_id'; end if;

      select * into v_boq_line from public.master_boq_lines
      where id=(v_item->>'master_boq_line_id')::uuid
        and tenant_id=v_tenant and tenant_company_id=v_tc for update;

      if not found then raise exception 'Master BOQ line not found or outside company scope'; end if;
      if v_boq_line.match_status not in ('verified','matched') or v_boq_line.inventory_item_id is null
      then raise exception 'Master BOQ line % is not resolved to a Master Item',v_boq_line.line_no; end if;
      if v_boq_line.line_type <> 'ITEM'
      then raise exception 'Master BOQ line % is not a purchasable item',v_boq_line.line_no; end if;
      if v_boq_line.procurement_scope = 'INSTALLATION'
      then raise exception 'Master BOQ line % is installation-only',v_boq_line.line_no; end if;

      if not exists(select 1 from public.master_boqs b
        where b.id=v_boq_line.master_boq_id and b.tenant_id=v_tenant
          and b.tenant_company_id=v_tc and b.status='approved' and b.is_current=true)
      then raise exception 'Master BOQ line % does not belong to the current approved Master BOQ',v_boq_line.line_no; end if;

      v_uom:=upper(trim(coalesce(v_item->>'unit',v_boq_line.supply_uom_code,v_boq_line.uom_code,'')));
      if v_boq_line.supply_uom_code is not null and v_uom <> upper(trim(v_boq_line.supply_uom_code))
      then raise exception 'PO UOM % does not match Master BOQ UOM % for line %',v_uom,v_boq_line.supply_uom_code,v_boq_line.line_no; end if;

      select coalesce(sum(poi.quantity),0) into v_existing_qty
      from public.purchase_order_items poi
      join public.purchase_orders po on po.id=poi.purchase_order_id
      where poi.master_boq_line_id=v_boq_line.id
        and po.tenant_id=v_tenant and po.tenant_company_id=v_tc
        and po.status not in ('cancelled','rejected','void');

      if v_existing_qty + v_requested_qty > v_boq_line.quantity + 0.000001
      then raise exception 'PO quantity exceeds Master BOQ balance for line %: approved %, already committed %, requested %, remaining %',
        v_boq_line.line_no,v_boq_line.quantity,v_existing_qty,v_requested_qty,
        greatest(v_boq_line.quantity-v_existing_qty,0); end if;
    end if;

    v_taxable:=v_requested_qty*(v_item->>'unit_price')::numeric;
    v_rate:=coalesce((v_item->>'tax_rate')::numeric,0);
    v_cgst:=coalesce((v_item->>'cgst_amount')::numeric,v_taxable*v_rate/200);
    v_sgst:=coalesce((v_item->>'sgst_amount')::numeric,v_taxable*v_rate/200);
    v_igst:=coalesce((v_item->>'igst_amount')::numeric,0);
    v_line:=v_taxable+v_cgst+v_sgst+v_igst;
    v_sub:=v_sub+v_taxable; v_tax:=v_tax+v_cgst+v_sgst+v_igst; v_total:=v_total+v_line;

    insert into public.purchase_order_items(
      tenant_id,tenant_company_id,purchase_order_id,description,item_code,quantity,unit,
      unit_price,taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,
      notes,inventory_item_id,master_boq_line_id
    ) values(
      v_tenant,v_tc,v_id,v_item->>'description',v_item->>'item_code',v_requested_qty,v_item->>'unit',
      (v_item->>'unit_price')::numeric,v_taxable,v_rate,v_cgst,v_sgst,v_igst,v_line,v_item->>'notes',
      nullif(v_item->>'inventory_item_id','')::uuid,nullif(v_item->>'master_boq_line_id','')::uuid
    );
  end loop;

  update public.purchase_orders set
    subtotal=v_sub,
    cgst_amount=(select coalesce(sum(cgst_amount),0) from public.purchase_order_items where purchase_order_id=v_id),
    sgst_amount=(select coalesce(sum(sgst_amount),0) from public.purchase_order_items where purchase_order_id=v_id),
    igst_amount=(select coalesce(sum(igst_amount),0) from public.purchase_order_items where purchase_order_id=v_id),
    tax_amount=v_tax,total_amount=v_total,
    terms_and_conditions=p_header->>'terms_and_conditions',notes=p_header->>'notes',updated_at=now()
  where id=v_id;

  return jsonb_build_object(
    'order',(select to_jsonb(x) from public.purchase_orders x where x.id=v_id),
    'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) from public.purchase_order_items i where i.purchase_order_id=v_id)
  );
exception when others then raise;
end
$function$
;

CREATE OR REPLACE FUNCTION public.create_purchase_request_atomic(p_header jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_tenant uuid; v_tc uuid; v_company uuid; v_id uuid; v_no text; v_item jsonb; v_sub jsonb; v_fy text:=to_char(coalesce((p_header->>'request_date')::date,current_date),'YYYY');
begin
 if v_uid is null then raise exception 'Authentication required'; end if; v_tenant:=(p_header->>'tenant_id')::uuid; v_tc:=(p_header->>'tenant_company_id')::uuid; v_company:=(p_header->>'company_id')::uuid;
 if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_tc) then raise exception 'Not authorized'; end if;
 if not exists(select 1 from public.companies c where c.id=v_company and c.tenant_id=v_tenant and c.tenant_company_id=v_tc) then raise exception 'Invalid company'; end if;
 v_no:=private.get_next_purchase_doc_number(v_tenant,v_tc,'PR',v_fy);
 insert into public.purchase_requests(tenant_id,tenant_company_id,company_id,pr_no,request_date,required_date,requested_by,work_id,status,priority,purpose,notes,created_by) values(v_tenant,v_tc,v_company,v_no,coalesce((p_header->>'request_date')::date,current_date),(p_header->>'required_date')::date,(p_header->>'requested_by')::uuid,(p_header->>'work_id')::uuid,'draft',coalesce(p_header->>'priority','normal'),p_header->>'purpose',p_header->>'notes',v_uid) returning id into v_id;
 for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
  insert into public.purchase_request_items(tenant_id,tenant_company_id,purchase_request_id,description,item_code,quantity,unit,notes) values(v_tenant,v_tc,v_id,v_item->>'description',v_item->>'item_code',(v_item->>'quantity')::numeric,v_item->>'unit',v_item->>'notes');
 end loop;
 return jsonb_build_object('request',(select to_jsonb(x) from public.purchase_requests x where x.id=v_id),'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb) from public.purchase_request_items i where i.purchase_request_id=v_id));
end $function$
;

CREATE OR REPLACE FUNCTION public.create_rfq_atomic(p_header jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_tenant uuid; v_tc uuid; v_company uuid; v_id uuid; v_no text; v_pr uuid; v_fy text:=to_char(coalesce((p_header->>'rfq_date')::date,current_date),'YYYY');
begin
 if v_uid is null then raise exception 'Authentication required'; end if; v_tenant:=(p_header->>'tenant_id')::uuid; v_tc:=(p_header->>'tenant_company_id')::uuid; v_company:=(p_header->>'company_id')::uuid; v_pr:=(p_header->>'purchase_request_id')::uuid;
 if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_tc) then raise exception 'Not authorized'; end if;
 if not exists(select 1 from public.companies c where c.id=v_company and c.tenant_id=v_tenant and c.tenant_company_id=v_tc) then raise exception 'Invalid company'; end if;
 if v_pr is not null and not exists(select 1 from public.purchase_requests r where r.id=v_pr and r.tenant_id=v_tenant and r.tenant_company_id=v_tc) then raise exception 'Invalid purchase request'; end if;
 v_no:=private.get_next_purchase_doc_number(v_tenant,v_tc,'RFQ',v_fy);
 insert into public.rfqs(tenant_id,tenant_company_id,company_id,rfq_no,rfq_date,purchase_request_id,work_id,status,due_date,notes,created_by) values(v_tenant,v_tc,v_company,v_no,coalesce((p_header->>'rfq_date')::date,current_date),v_pr,(p_header->>'work_id')::uuid,'draft',(p_header->>'due_date')::date,p_header->>'notes',v_uid) returning id into v_id;
 return (select to_jsonb(x) from public.rfqs x where x.id=v_id);
end $function$
;

CREATE OR REPLACE FUNCTION public.create_sales_quotation_atomic(p_header_json jsonb, p_items_json jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  h public.sales_quotations%ROWTYPE;
  x jsonb;
  v_tenant uuid := (p_header_json->>'tenant_id')::uuid;
  v_tc uuid := (p_header_json->>'tenant_company_id')::uuid;
  v_company uuid := (p_header_json->>'company_id')::uuid;
  v_enquiry uuid := NULLIF(p_header_json->>'enquiry_id','')::uuid;
  v_work uuid := NULLIF(p_header_json->>'work_id','')::uuid;
  v_no text;
  v_fy text := COALESCE(NULLIF(p_header_json->>'fiscal_year',''), CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN EXTRACT(YEAR FROM CURRENT_DATE)::int::text ELSE (EXTRACT(YEAR FROM CURRENT_DATE)::int-1)::text END || '-' || CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4 THEN (EXTRACT(YEAR FROM CURRENT_DATE)::int+1)::text ELSE EXTRACT(YEAR FROM CURRENT_DATE)::int::text END);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF NOT private.has_action_permission(v_tenant, 'MANAGER') THEN RAISE EXCEPTION 'Manager permission required'; END IF;
  IF NOT private.has_company_access(v_tenant, v_tc) THEN RAISE EXCEPTION 'Company access denied'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.companies c WHERE c.id=v_company AND c.tenant_id=v_tenant AND c.tenant_company_id=v_tc) THEN RAISE EXCEPTION 'Invalid CRM customer company'; END IF;

  v_no := private.get_next_sales_doc_number(v_tenant, v_tc, 'QUOTATION', v_fy);
  INSERT INTO public.sales_quotations(tenant_id,tenant_company_id,quotation_no,quotation_date,customer_name,status,currency_code,subtotal,tax_amount,total_amount,valid_until,notes,created_by,company_id,enquiry_id,work_id,customer_gstin,place_of_supply,reverse_charge,cgst_amount,sgst_amount,igst_amount,terms_and_conditions)
  VALUES(v_tenant,v_tc,v_no,COALESCE((p_header_json->>'quotation_date')::date,CURRENT_DATE),COALESCE(p_header_json->>'customer_name',''),COALESCE(p_header_json->>'status','draft'),COALESCE(p_header_json->>'currency_code','INR'),0,0,0,NULLIF(p_header_json->>'valid_until','')::date,p_header_json->>'notes',auth.uid(),v_company,v_enquiry,v_work,p_header_json->>'customer_gstin',p_header_json->>'place_of_supply',COALESCE((p_header_json->>'reverse_charge')::boolean,false),0,0,0,p_header_json->>'terms_and_conditions') RETURNING * INTO h;

  FOR x IN SELECT * FROM jsonb_array_elements(COALESCE(p_items_json,'[]'::jsonb)) LOOP
    INSERT INTO public.sales_quotation_items(tenant_id,tenant_company_id,quotation_id,item_description,hsn_sac_code,quantity,unit_price,taxable_value,gst_rate_pct,cgst_rate,sgst_rate,igst_rate,cgst_amount,sgst_amount,igst_amount,line_total)
    VALUES(v_tenant,v_tc,h.id,COALESCE(x->>'item_description',''),x->>'hsn_sac_code',COALESCE((x->>'quantity')::numeric,1),COALESCE((x->>'unit_price')::numeric,0),COALESCE((x->>'taxable_value')::numeric,0),COALESCE((x->>'gst_rate_pct')::numeric,0),COALESCE((x->>'cgst_rate')::numeric,0),COALESCE((x->>'sgst_rate')::numeric,0),COALESCE((x->>'igst_rate')::numeric,0),COALESCE((x->>'cgst_amount')::numeric,0),COALESCE((x->>'sgst_amount')::numeric,0),COALESCE((x->>'igst_amount')::numeric,0),COALESCE((x->>'line_total')::numeric,COALESCE((x->>'taxable_value')::numeric,0)+COALESCE((x->>'cgst_amount')::numeric,0)+COALESCE((x->>'sgst_amount')::numeric,0)+COALESCE((x->>'igst_amount')::numeric,0)));
  END LOOP;

  UPDATE public.sales_quotations q SET subtotal=s.subtotal,tax_amount=s.tax_amount,total_amount=s.total_amount,cgst_amount=s.cgst,sgst_amount=s.sgst,igst_amount=s.igst,updated_at=now()
  FROM (SELECT COALESCE(sum(taxable_value),0) subtotal,COALESCE(sum(cgst_amount+sgst_amount+igst_amount),0) tax_amount,COALESCE(sum(line_total),0) total_amount,COALESCE(sum(cgst_amount),0) cgst,COALESCE(sum(sgst_amount),0) sgst,COALESCE(sum(igst_amount),0) igst FROM public.sales_quotation_items WHERE quotation_id=h.id) s WHERE q.id=h.id RETURNING q.* INTO h;
  RETURN to_jsonb(h);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_vendor_atomic(p_vendor jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid;
  v_tc uuid;
  v_company uuid;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  v_tenant:=(p_vendor->>'tenant_id')::uuid;
  v_tc:=(p_vendor->>'tenant_company_id')::uuid;
  v_company:=null;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then
    raise exception 'Not authorized';
  end if;

  insert into public.vendors(
    tenant_id,tenant_company_id,company_id,vendor_code,vendor_name,legal_name,
    gstin,pan,email,phone,address,payment_terms_days,status,notes,created_by
  )
  values(
    v_tenant,v_tc,v_company,p_vendor->>'vendor_code',p_vendor->>'vendor_name',
    p_vendor->>'legal_name',p_vendor->>'gstin',p_vendor->>'pan',
    p_vendor->>'email',p_vendor->>'phone',p_vendor->>'address',
    coalesce((p_vendor->>'payment_terms_days')::int,0),
    coalesce(p_vendor->>'status','active'),p_vendor->>'notes',v_uid
  )
  returning id into v_id;

  return (select to_jsonb(v) from public.vendors v where v.id=v_id);
end
$function$
;

CREATE OR REPLACE FUNCTION public.create_vendor_quotation_atomic(p_header jsonb, p_items jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid; v_tc uuid; v_company uuid; v_rfq uuid; v_vendor uuid; v_id uuid;
  v_item jsonb; v_sub numeric:=0; v_tax numeric:=0; v_total numeric:=0;
  v_taxable numeric; v_rate numeric; v_line numeric; v_cgst numeric; v_sgst numeric; v_igst numeric;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  v_tenant:=(p_header->>'tenant_id')::uuid;
  v_tc:=(p_header->>'tenant_company_id')::uuid;
  v_company:=(p_header->>'company_id')::uuid;
  v_rfq:=(p_header->>'rfq_id')::uuid;
  v_vendor:=(p_header->>'vendor_id')::uuid;

  if not private.has_action_permission(v_tenant,'MANAGER')
     or not private.has_company_access(v_tenant,v_tc) then
    raise exception 'Not authorized';
  end if;

  if not exists(
    select 1 from public.vendors v
    where v.id=v_vendor and v.tenant_id=v_tenant and v.tenant_company_id=v_tc
  ) then raise exception 'Invalid vendor'; end if;

  if not exists(
    select 1 from public.rfqs r
    where r.id=v_rfq and r.tenant_id=v_tenant
      and r.tenant_company_id=v_tc and r.company_id=v_company
  ) then raise exception 'Invalid RFQ'; end if;

  insert into public.vendor_quotations(
    tenant_id,tenant_company_id,company_id,rfq_id,vendor_id,quotation_no,
    quotation_date,valid_until,status,currency_code,created_by
  )
  values(
    v_tenant,v_tc,v_company,v_rfq,v_vendor,p_header->>'quotation_no',
    (p_header->>'quotation_date')::date,(p_header->>'valid_until')::date,
    'received',coalesce(p_header->>'currency_code','INR'),v_uid
  )
  returning id into v_id;

  for v_item in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    v_taxable:=(v_item->>'quantity')::numeric*(v_item->>'unit_price')::numeric;
    v_rate:=coalesce((v_item->>'tax_rate')::numeric,0);
    v_cgst:=coalesce((v_item->>'cgst_amount')::numeric,v_taxable*v_rate/200);
    v_sgst:=coalesce((v_item->>'sgst_amount')::numeric,v_taxable*v_rate/200);
    v_igst:=coalesce((v_item->>'igst_amount')::numeric,0);
    v_line:=v_taxable+v_cgst+v_sgst+v_igst;
    v_sub:=v_sub+v_taxable; v_tax:=v_tax+v_cgst+v_sgst+v_igst; v_total:=v_total+v_line;

    insert into public.vendor_quotation_items(
      tenant_id,tenant_company_id,vendor_quotation_id,description,item_code,
      quantity,unit,unit_price,taxable_amount,tax_rate,cgst_amount,sgst_amount,igst_amount,line_total,notes
    )
    values(
      v_tenant,v_tc,v_id,v_item->>'description',v_item->>'item_code',
      (v_item->>'quantity')::numeric,v_item->>'unit',(v_item->>'unit_price')::numeric,
      v_taxable,v_rate,v_cgst,v_sgst,v_igst,v_line,v_item->>'notes'
    );
  end loop;

  update public.vendor_quotations
  set subtotal=v_sub,tax_amount=v_tax,total_amount=v_total,notes=p_header->>'notes',updated_at=now()
  where id=v_id;

  return jsonb_build_object(
    'quotation',(select to_jsonb(x) from public.vendor_quotations x where x.id=v_id),
    'items',(select coalesce(jsonb_agg(to_jsonb(i)),'[]'::jsonb)
             from public.vendor_quotation_items i where i.vendor_quotation_id=v_id)
  );
end
$function$
;

CREATE OR REPLACE FUNCTION public.crm_customer_upsert_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_tenant uuid := auth.uid();
  v_tenant_id uuid;
  v_tenant_company_id uuid;
  v_company_id uuid;
  v_name text;
  v_profile jsonb := coalesce(p_payload->'profile','{}'::jsonb);
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  v_tenant_id := nullif(p_payload->>'tenant_id','')::uuid;
  v_tenant_company_id := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_company_id := nullif(p_payload->>'company_id','')::uuid;
  v_name := nullif(trim(p_payload->>'name'),'');
  if v_tenant_id is null or v_tenant_company_id is null or v_name is null then raise exception 'INVALID_CUSTOMER_PAYLOAD'; end if;
  if not private.has_action_permission(v_tenant_id,'MANAGER') or not private.has_company_access(v_tenant_id,v_tenant_company_id) then raise exception 'FORBIDDEN'; end if;

  if v_company_id is null then
    insert into public.companies(name,tenant_id,tenant_company_id)
    values(v_name,v_tenant_id,v_tenant_company_id)
    returning id into v_company_id;
  else
    update public.companies
      set name=v_name
    where id=v_company_id and tenant_id=v_tenant_id and tenant_company_id=v_tenant_company_id;
    if not found then raise exception 'CUSTOMER_NOT_FOUND'; end if;
  end if;

  insert into public.crm_customer_profiles(
    company_id,tenant_id,tenant_company_id,legal_name,display_name,trading_name,company_type,business_type,
    industry,gstin,pan,cin,website,official_email,official_phone,billing_address,shipping_address,notes,status,created_by
  ) values (
    v_company_id,v_tenant_id,v_tenant_company_id,
    nullif(v_profile->>'legal_name',''),nullif(v_profile->>'display_name',''),nullif(v_profile->>'trading_name',''),
    nullif(v_profile->>'company_type',''),nullif(v_profile->>'business_type',''),nullif(v_profile->>'industry',''),
    nullif(v_profile->>'gstin',''),nullif(v_profile->>'pan',''),nullif(v_profile->>'cin',''),
    nullif(v_profile->>'website',''),nullif(v_profile->>'official_email',''),nullif(v_profile->>'official_phone',''),
    coalesce(v_profile->'billing_address','{}'::jsonb),coalesce(v_profile->'shipping_address','{}'::jsonb),
    nullif(v_profile->>'notes',''),coalesce(nullif(v_profile->>'status',''),'active'),auth.uid()
  )
  on conflict(company_id) do update set
    legal_name=excluded.legal_name,display_name=excluded.display_name,trading_name=excluded.trading_name,
    company_type=excluded.company_type,business_type=excluded.business_type,industry=excluded.industry,
    gstin=excluded.gstin,pan=excluded.pan,cin=excluded.cin,website=excluded.website,
    official_email=excluded.official_email,official_phone=excluded.official_phone,
    billing_address=excluded.billing_address,shipping_address=excluded.shipping_address,
    notes=excluded.notes,status=excluded.status,updated_at=now();

  return jsonb_build_object('company_id',v_company_id,'name',v_name);
end $function$
;

CREATE OR REPLACE FUNCTION public.crm_get_workspace_atomic(p_tenant_id uuid, p_tenant_company_id uuid DEFAULT NULL::uuid, p_company_id uuid DEFAULT NULL::uuid, p_unit_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_result jsonb;
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 if not private.has_action_permission(p_tenant_id,'VIEWER') then raise exception 'FORBIDDEN'; end if;
 if p_tenant_company_id is not null and not private.has_company_access(p_tenant_id,p_tenant_company_id) then raise exception 'FORBIDDEN'; end if;
 select jsonb_build_object(
   'customers', coalesce((select jsonb_agg(to_jsonb(c)||jsonb_build_object('profile',to_jsonb(cp)) order by c.name) from public.companies c left join public.crm_customer_profiles cp on cp.company_id=c.id where c.tenant_id=p_tenant_id and (p_tenant_company_id is null or c.tenant_company_id=p_tenant_company_id) and (cp.status is null or cp.status<>'archived') and (p_company_id is null or c.id=p_company_id)),'[]'::jsonb),
   'contacts', coalesce((select jsonb_agg(to_jsonb(x) order by x.name) from public.contacts x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and (p_company_id is null or x.company_id=p_company_id)),'[]'::jsonb),
   'enquiries', coalesce((select jsonb_agg(to_jsonb(x) order by x.enquiry_date desc) from public.enquiries x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and (p_company_id is null or x.company_id=p_company_id)),'[]'::jsonb),
   'follow_ups', coalesce((select jsonb_agg(to_jsonb(x) order by x.due_date) from public.follow_ups x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and (p_company_id is null or x.company_id=p_company_id)),'[]'::jsonb),
   'tasks', coalesce((select jsonb_agg(to_jsonb(x) order by x.due_date nulls last) from public.tasks x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and (p_unit_id is null or exists(select 1 from public.works w where w.id=x.work_id and w.unit_id=p_unit_id))),'[]'::jsonb),
   'issues', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.issues x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and (p_company_id is null or exists(select 1 from public.works w where w.id=x.work_id and w.company_id=p_company_id))),'[]'::jsonb),
   'logs', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.logs x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id)),'[]'::jsonb),
   'works', coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.works x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and (p_company_id is null or x.company_id=p_company_id) and (p_unit_id is null or x.unit_id=p_unit_id)),'[]'::jsonb),
   'summary', jsonb_build_object(
      'customer_count',(select count(*) from public.companies c left join public.crm_customer_profiles cp on cp.company_id=c.id where c.tenant_id=p_tenant_id and (p_tenant_company_id is null or c.tenant_company_id=p_tenant_company_id) and (cp.status is null or cp.status<>'archived')),
      'open_enquiries',(select count(*) from public.enquiries x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and x.status not in ('won','lost','closed')),
      'pending_followups',(select count(*) from public.follow_ups x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and x.status='pending'),
      'overdue_followups',(select count(*) from public.follow_ups x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and x.status='pending' and x.due_date < now()),
      'open_issues',(select count(*) from public.issues x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and x.status='open'),
      'open_tasks',(select count(*) from public.tasks x where x.tenant_id=p_tenant_id and (p_tenant_company_id is null or x.tenant_company_id=p_tenant_company_id) and x.status not in ('completed','cancelled'))
   )
 ) into v_result;
 return v_result;
end $function$
;

CREATE OR REPLACE FUNCTION public.deactivate_account_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_id uuid := nullif(p_payload->>'id','')::uuid;
  v_system boolean;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_id is null then raise exception 'Tenant, operating company and account are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  select is_system_account into v_system from public.chart_of_accounts where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company for update;
  if not found then raise exception 'Account not found'; end if;
  if v_system then raise exception 'System accounts cannot be deactivated'; end if;
  update public.chart_of_accounts set is_active=false, updated_at=now() where id=v_id;
  return jsonb_build_object('id',v_id,'is_active',false);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.derive_canonical_master_code(p_parent text, p_child text, p_description text)
 RETURNS text
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$ declare ctx text:=upper(coalesce(nullif(trim(p_parent),''),nullif(trim(p_description),''),'')); child text:=upper(coalesce(nullif(trim(p_child),''),nullif(trim(p_description),''),'')); sz text; cls text; begin select (regexp_match(child,'([0-9]{1,4})[[:space:]]*(MM|NB)([^0-9A-Z]|$)'))[1] into sz; if sz is null then select (regexp_match(ctx,'([0-9]{1,4})[[:space:]]*(MM|NB)([^0-9A-Z]|$)'))[1] into sz; end if; if sz is not null and (ctx ~ '(^|[^A-Z0-9])M[.]?[[:space:]]*S([^A-Z0-9]|$)' or ctx ~ 'MILD[[:space:]]+STEEL') and ctx ~ 'PIPE' then cls:=coalesce((regexp_match(ctx,'CLASS[^A-Z0-9]*([A-C])'))[1],(regexp_match(ctx,'([A-C])[^A-Z0-9]+CLASS'))[1]); if cls is not null then return 'MS-'||upper(cls)||'-PIPE-'||sz::int; end if; end if; if sz is not null and ctx ~ 'GATE[[:space:]]+VALVE' then if ctx ~ 'D[.]?[[:space:]]*I' then return 'DI-GV-'||sz::int; elsif ctx ~ 'G[.]?[[:space:]]*I' then return 'GI-GV-'||sz::int; elsif ctx ~ 'M[.]?[[:space:]]*S' then return 'MS-GV-'||sz::int; elsif ctx ~ 'S[.]?[[:space:]]*S' then return 'SS-GV-'||sz::int; end if; end if; return null; end; $function$
;

CREATE OR REPLACE FUNCTION public.enroll_attendance_face_profile(p_tenant_id uuid, p_tenant_company_id uuid, p_employee_id uuid, p_verification_provider text, p_provider_subject_ref text)
 RETURNS attendance_face_profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
    v_employee public.employees%rowtype;
    v_existing public.attendance_face_profiles%rowtype;
    v_profile public.attendance_face_profiles%rowtype;
    v_now timestamptz := clock_timestamp();
begin
    if auth.uid() is null then
        raise exception 'AUTHENTICATION_REQUIRED';
    end if;

    if not private.has_action_permission(p_tenant_id, 'MANAGER') then
        raise exception 'INSUFFICIENT_ATTENDANCE_FACE_ENROLLMENT_PERMISSION';
    end if;

    if not private.has_company_access(p_tenant_id, p_tenant_company_id) then
        raise exception 'COMPANY_ACCESS_DENIED';
    end if;

    if p_verification_provider is null or btrim(p_verification_provider) = '' then
        raise exception 'VERIFICATION_PROVIDER_REQUIRED';
    end if;

    if p_provider_subject_ref is null or btrim(p_provider_subject_ref) = '' then
        raise exception 'PROVIDER_SUBJECT_REFERENCE_REQUIRED';
    end if;

    select * into v_employee
    from public.employees
    where id = p_employee_id
      and tenant_id = p_tenant_id
      and tenant_company_id = p_tenant_company_id
      and employment_status in ('active','probation');

    if not found then
        raise exception 'EMPLOYEE_NOT_FOUND_OR_NOT_ACTIVE';
    end if;

    select * into v_existing
    from public.attendance_face_profiles
    where tenant_id = p_tenant_id
      and tenant_company_id = p_tenant_company_id
      and employee_id = p_employee_id
      and enrollment_status = 'active'
    order by enrolled_at desc nulls last, created_at desc nulls last
    limit 1
    for update;

    if found then
        if v_existing.verification_provider = p_verification_provider
           and v_existing.provider_subject_ref = p_provider_subject_ref then
            return v_existing;
        end if;
        raise exception 'ACTIVE_FACE_PROFILE_ALREADY_EXISTS';
    end if;

    -- Re-enrollment is represented by a new profile row; prior records remain immutable history.
    -- The partial unique index guarantees only one active profile per employee/company.
    insert into public.attendance_face_profiles (
        tenant_id,
        tenant_company_id,
        employee_id,
        verification_provider,
        provider_subject_ref,
        enrollment_status,
        enrolled_at,
        revoked_at,
        created_by,
        created_at,
        updated_at
    ) values (
        p_tenant_id,
        p_tenant_company_id,
        p_employee_id,
        btrim(p_verification_provider),
        btrim(p_provider_subject_ref),
        'active',
        v_now,
        null,
        auth.uid(),
        v_now,
        v_now
    )
    returning * into v_profile;

    return v_profile;
exception
    when unique_violation then
        raise exception 'FACE_PROFILE_CONFLICT';
end;
$function$
;

CREATE OR REPLACE FUNCTION public.finalize_payroll_run_with_accounting_atomic(p_payroll_run_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_run public.payroll_runs%rowtype;
  v_period public.payroll_periods%rowtype;
  v_lines jsonb:='[]'::jsonb;
  v_journal jsonb;
  v_journal_id uuid;
  v_idem text;
  v_existing public.payroll_run_accounting%rowtype;
  v_gross numeric:=0; v_employer numeric:=0; v_net numeric:=0;
  v_pf_employee numeric:=0; v_pf_employer numeric:=0;
  v_esi_employee numeric:=0; v_esi_employer numeric:=0;
  v_pf_total numeric:=0; v_esi_total numeric:=0;
  v_pt numeric:=0; v_tds numeric:=0; v_other numeric:=0;
  v_explicit_employer numeric:=0; v_employer_residual numeric:=0;
  v_salary_exp uuid; v_employer_exp uuid; v_salary_payable uuid;
  v_pf_payable uuid; v_esi_payable uuid; v_pt_payable uuid;
  v_tds_payable uuid; v_other_payable uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into v_run from public.payroll_runs where id=p_payroll_run_id for update;
  if not found then raise exception 'PAYROLL_RUN_NOT_FOUND'; end if;
  if not private.has_company_access(v_run.tenant_id,v_run.tenant_company_id) or not private.has_action_permission(v_run.tenant_id,'MANAGER') then raise exception 'Not authorized'; end if;

  select * into v_existing from public.payroll_run_accounting where payroll_run_id=v_run.id;
  if found then
    return jsonb_build_object('payroll_run_id',v_run.id,'journal_entry_id',v_existing.journal_entry_id,'status','posted','idempotent',true);
  end if;
  if v_run.status<>'approved' then raise exception 'PAYROLL_RUN_MUST_BE_APPROVED'; end if;
  if not exists(select 1 from public.payroll_run_items where payroll_run_id=v_run.id) then raise exception 'PAYROLL_RUN_HAS_NO_ITEMS'; end if;

  select * into v_period from public.payroll_periods
  where id=v_run.payroll_period_id and tenant_id=v_run.tenant_id and tenant_company_id=v_run.tenant_company_id for update;
  if not found then raise exception 'PAYROLL_PERIOD_NOT_FOUND'; end if;

  select
    max(account_id) filter(where mapping_key='salary_expense'),
    max(account_id) filter(where mapping_key='employer_contribution_expense'),
    max(account_id) filter(where mapping_key='salary_payable'),
    max(account_id) filter(where mapping_key='pf_payable'),
    max(account_id) filter(where mapping_key='esi_payable'),
    max(account_id) filter(where mapping_key='pt_payable'),
    max(account_id) filter(where mapping_key='tds_payable'),
    max(account_id) filter(where mapping_key='other_deductions_payable')
  into v_salary_exp,v_employer_exp,v_salary_payable,v_pf_payable,v_esi_payable,v_pt_payable,v_tds_payable,v_other_payable
  from public.payroll_account_mappings
  where tenant_id=v_run.tenant_id and tenant_company_id=v_run.tenant_company_id and is_active=true;
  if v_salary_exp is null or v_employer_exp is null or v_salary_payable is null or v_pf_payable is null or v_esi_payable is null or v_pt_payable is null or v_tds_payable is null or v_other_payable is null then
    raise exception 'PAYROLL_ACCOUNT_MAPPING_INCOMPLETE';
  end if;

  select coalesce(sum(gross_earnings),0),coalesce(sum(employer_contributions),0),coalesce(sum(net_pay),0)
  into v_gross,v_employer,v_net
  from public.payroll_run_items where payroll_run_id=v_run.id;

  select
    coalesce(sum(rc.amount) filter(where upper(c.code) in ('PF_EMPLOYEE','PF_EMP')),0),
    coalesce(sum(rc.amount) filter(where upper(c.code) in ('EPF_EMPLOYER','EPS_EMPLOYER','EDLI_EMPLOYER')),0),
    coalesce(sum(rc.amount) filter(where upper(c.code) in ('ESI_EMPLOYEE','ESI_EMP')),0),
    coalesce(sum(rc.amount) filter(where upper(c.code)='ESI_EMPLOYER'),0),
    coalesce(sum(rc.amount) filter(where upper(c.code) in ('PT','PROFESSIONAL_TAX')),0),
    coalesce(sum(rc.amount) filter(where upper(c.code)='TDS'),0)
  into v_pf_employee,v_pf_employer,v_esi_employee,v_esi_employer,v_pt,v_tds
  from public.payroll_run_item_components rc
  join public.payroll_run_items ri on ri.id=rc.payroll_run_item_id
  join public.payroll_components c on c.id=rc.payroll_component_id
  where ri.payroll_run_id=v_run.id;

  v_explicit_employer:=v_pf_employer+v_esi_employer;
  v_employer_residual:=greatest(v_employer-v_explicit_employer,0);
  v_pf_total:=v_pf_employee+v_pf_employer+v_employer_residual;
  v_esi_total:=v_esi_employee+v_esi_employer;

  -- Only employee deductions reduce net salary. Employer contributions are
  -- separate payroll liabilities and must not be subtracted from deductions.
  v_other:=greatest(
    (select coalesce(sum(total_deductions),0) from public.payroll_run_items where payroll_run_id=v_run.id)
    -v_pf_employee-v_esi_employee-v_pt-v_tds,0);

  if v_gross<=0 or v_net<0 or v_employer<0 then raise exception 'INVALID_PAYROLL_TOTALS'; end if;
  if round(v_gross+v_employer,2) <> round(v_net+v_pf_total+v_esi_total+v_pt+v_tds+v_other,2) then
    raise exception 'PAYROLL_ACCOUNTING_BUILD_UNBALANCED';
  end if;

  v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_salary_exp,'description','Payroll salary expense','debit',round(v_gross,2),'credit',0));
  if v_employer>0 then v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_employer_exp,'description','Employer statutory contribution expense','debit',round(v_employer,2),'credit',0)); end if;
  v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_salary_payable,'description','Net salary payable','debit',0,'credit',round(v_net,2)));
  if v_pf_total>0 then v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_pf_payable,'description','PF and related statutory payable','debit',0,'credit',round(v_pf_total,2))); end if;
  if v_esi_total>0 then v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_esi_payable,'description','ESI payable','debit',0,'credit',round(v_esi_total,2))); end if;
  if v_pt>0 then v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_pt_payable,'description','Professional tax payable','debit',0,'credit',round(v_pt,2))); end if;
  if v_tds>0 then v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_tds_payable,'description','TDS payable','debit',0,'credit',round(v_tds,2))); end if;
  if v_other>0 then v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_other_payable,'description','Other payroll deductions payable','debit',0,'credit',round(v_other,2))); end if;

  v_idem:='PAYROLL-POST-'||v_run.id::text;
  v_journal:=public.post_journal_entry_atomic(jsonb_build_object(
    'tenant_id',v_run.tenant_id,'tenant_company_id',v_run.tenant_company_id,
    'entry_date',coalesce(v_period.pay_date,v_period.period_end),'voucher_type','PAYROLL',
    'source_type','payroll_run','source_id',v_run.id,'idempotency_key',v_idem,
    'narration','Payroll posting for '||v_period.period_code,'lines',v_lines));
  v_journal_id:=nullif(v_journal->>'id','')::uuid;

  insert into public.payroll_run_accounting(tenant_id,tenant_company_id,payroll_run_id,journal_entry_id,idempotency_key,created_by)
  values(v_run.tenant_id,v_run.tenant_company_id,v_run.id,v_journal_id,v_idem,v_uid);
  update public.payroll_runs set status='posted',posted_at=now(),updated_at=now() where id=v_run.id;
  update public.payroll_periods set status='posted',updated_at=now() where id=v_period.id and status in ('approved','calculated','under_review');
  update public.approval_requests set status='applied',updated_at=now() where entity_type='payroll_run' and entity_id=v_run.id and status='approved';

  return jsonb_build_object('payroll_run_id',v_run.id,'journal_entry_id',v_journal_id,'status','posted','idempotency_key',v_idem);
end;$function$
;

CREATE OR REPLACE FUNCTION public.generate_payroll_bank_file_atomic(p_payment_batch_id uuid, p_profile_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_batch public.payroll_payment_batches%rowtype; v_profile public.payroll_bank_file_profiles%rowtype; v_file public.payroll_bank_files%rowtype; v_item record; v_content text:=''; v_row text; v_count integer:=0; v_total numeric(18,2):=0; v_hash text; v_filename text; v_name text; v_account text; v_existing public.payroll_bank_files%rowtype; v_eol text:=chr(10);
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_batch from public.payroll_payment_batches where id=p_payment_batch_id for update;
 if not found then raise exception 'PAYMENT_BATCH_NOT_FOUND'; end if;
 if not private.has_company_access(v_batch.tenant_id,v_batch.tenant_company_id) or not private.has_action_permission(v_batch.tenant_id,'ADMIN') then raise exception 'Not authorized'; end if;
 if v_batch.status<>'approved' then raise exception 'PAYMENT_BATCH_MUST_BE_APPROVED_BEFORE_BANK_FILE'; end if;
 select * into v_profile from public.payroll_bank_file_profiles where id=p_profile_id and tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and is_active=true;
 if not found then raise exception 'ACTIVE_BANK_FILE_PROFILE_NOT_FOUND'; end if;
 if v_profile.format_code<>'CSV_SALARY_V1' then raise exception 'UNSUPPORTED_BANK_FILE_FORMAT'; end if;
 if exists(select 1 from public.payroll_payment_items where payment_batch_id=v_batch.id and payment_status<>'pending') then raise exception 'BANK_FILE_REQUIRES_ALL_PAYMENT_ITEMS_PENDING'; end if;
 if (select count(*) from public.payroll_payment_items where payment_batch_id=v_batch.id)<>v_batch.total_employees then raise exception 'PAYMENT_ITEM_COUNT_MISMATCH'; end if;
 if round((select coalesce(sum(amount),0) from public.payroll_payment_items where payment_batch_id=v_batch.id),2)<>round(v_batch.total_amount,2) then raise exception 'PAYMENT_ITEM_TOTAL_MISMATCH'; end if;
 if v_profile.include_header then v_content:='Record No'||v_profile.delimiter||'Employee Code'||v_profile.delimiter||'Beneficiary Name'||v_profile.delimiter||'Account Number'||v_profile.delimiter||'IFSC'||v_profile.delimiter||'Account Type'||v_profile.delimiter||'Amount'||v_profile.delimiter||'Payment Date'||v_profile.delimiter||'Payment Mode'||v_eol; end if;
 for v_item in select p.id,p.amount,e.employee_code,coalesce(nullif(e.display_name,''),concat_ws(' ',e.first_name,e.middle_name,e.last_name)) as beneficiary_name,eb.account_number,eb.ifsc_code,coalesce(eb.account_type,'savings') as account_type from public.payroll_payment_items p join public.employees e on e.id=p.employee_id and e.tenant_id=p.tenant_id and e.tenant_company_id=p.tenant_company_id join public.employee_bank_accounts eb on eb.id=p.employee_bank_account_id and eb.tenant_id=p.tenant_id where p.payment_batch_id=v_batch.id order by e.employee_code,p.id loop
   if nullif(trim(v_item.account_number),'') is null or nullif(trim(v_item.ifsc_code),'') is null then raise exception 'BANK_DETAILS_INCOMPLETE_FOR_EMPLOYEE:%',v_item.employee_code; end if;
   if v_profile.delimiter=',' then v_name:=replace(replace(coalesce(v_item.beneficiary_name,v_item.employee_code),',',' '),chr(10),' '); else v_name:=replace(replace(coalesce(v_item.beneficiary_name,v_item.employee_code),v_profile.delimiter,' '),chr(10),' '); end if;
   v_account:=replace(replace(v_item.account_number,v_profile.delimiter,' '),chr(10),'');
   v_row:=v_count+1||v_profile.delimiter||v_item.employee_code||v_profile.delimiter||v_name||v_profile.delimiter||v_account||v_profile.delimiter||upper(v_item.ifsc_code)||v_profile.delimiter||upper(v_item.account_type)||v_profile.delimiter||to_char(round(v_item.amount,2),'FM999999999990.00')||v_profile.delimiter||to_char(v_batch.payment_date,'YYYY-MM-DD')||v_profile.delimiter||v_profile.payment_mode||v_eol;
   v_content:=v_content||v_row; v_count:=v_count+1; v_total:=v_total+v_item.amount;
 end loop;
 if v_count=0 then raise exception 'NO_PAYMENT_ITEMS'; end if;
 v_hash:=encode(extensions.digest(convert_to(v_content,'UTF8'),'sha256'),'hex');
 v_filename:=v_profile.naming_prefix||'_'||to_char(v_batch.payment_date,'YYYYMMDD')||'_'||replace(v_batch.id::text,'-','')||'.'||v_profile.file_extension;
 select * into v_existing from public.payroll_bank_files where tenant_company_id=v_batch.tenant_company_id and payroll_payment_batch_id=v_batch.id and profile_id=v_profile.id for update;
 if found then
   if v_existing.status in ('submitted','accepted','cancelled') then raise exception 'BANK_FILE_CANNOT_BE_REGENERATED_IN_CURRENT_STATUS'; end if;
   update public.payroll_bank_files set file_name=v_filename,status='generated',row_count=v_count,total_amount=round(v_total,2),file_hash=v_hash,generation_no=v_existing.generation_no+1,generated_by=v_uid,generated_at=now(),submitted_at=null,external_reference=null,rejection_reason=null,updated_at=now() where id=v_existing.id returning * into v_file;
 else
   insert into public.payroll_bank_files(tenant_id,tenant_company_id,payroll_payment_batch_id,profile_id,status,file_name,mime_type,row_count,total_amount,file_hash,generation_no,generated_by) values(v_batch.tenant_id,v_batch.tenant_company_id,v_batch.id,v_profile.id,'generated',v_filename,'text/csv',v_count,round(v_total,2),v_hash,1,v_uid) returning * into v_file;
 end if;
 return jsonb_build_object('id',v_file.id,'status',v_file.status,'file_name',v_file.file_name,'mime_type',v_file.mime_type,'row_count',v_file.row_count,'total_amount',v_file.total_amount,'file_hash',v_file.file_hash,'generation_no',v_file.generation_no,'content',v_content);
end; $function$
;

CREATE OR REPLACE FUNCTION public.generate_payroll_esi_export_atomic(p_payroll_period_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_period public.payroll_periods%rowtype; v_content text;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_period from public.payroll_periods where id=p_payroll_period_id;
 if not found then raise exception 'PAYROLL_PERIOD_NOT_FOUND'; end if;
 if not private.has_company_access(v_period.tenant_id,v_period.tenant_company_id) or not private.has_action_permission(v_period.tenant_id,'MANAGER') then raise exception 'Not authorized'; end if;
 select 'Insurance Number,Employee Code,Employee Name,Gross Wages,Employee Contribution,Employer Contribution,Total Contribution'||chr(10)||coalesce(string_agg(coalesce(esi.insurance_number,'')||','||e.employee_code||','||replace(coalesce(e.display_name,trim(e.first_name||' '||coalesce(e.last_name,''))),',',' ')||','||to_char(ri.gross_earnings,'FM9999999990.00')||','||to_char(coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code) in ('ESI_EMPLOYEE','ESI_EMP')) ,0),'FM9999999990.00')||','||to_char(coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code)='ESI_EMPLOYER'),0),'FM9999999990.00')||','||to_char(coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code) in ('ESI_EMPLOYEE','ESI_EMPLOYER','ESI_EMP')),0),'FM9999999990.00'),chr(10) order by e.employee_code),'') into v_content from public.payroll_runs r join public.payroll_run_items ri on ri.payroll_run_id=r.id join public.employees e on e.id=ri.employee_id join public.employee_esi_details esi on esi.employee_id=e.id and esi.tenant_id=r.tenant_id where r.tenant_id=v_period.tenant_id and r.tenant_company_id=v_period.tenant_company_id and r.payroll_period_id=v_period.id and r.status in ('posted','paid') and coalesce(esi.esi_applicable,false);
 return jsonb_build_object('file_name','ESI-'||v_period.period_code||'.csv','mime_type','text/csv','content',v_content,'format','ESI_CONTRIBUTION_WORKING','period_code',v_period.period_code);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_payroll_form16_preparation_atomic(p_employee_id uuid, p_tax_year text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_uid uuid:=auth.uid(); v_emp public.employees%rowtype; v_company uuid; v_tenant uuid; v_start date; v_end date; v_gross numeric(18,2); v_tds numeric(18,2); v_ded numeric(18,2); v_prev numeric(18,2):=0; v_prev_tds numeric(18,2):=0; v_other numeric(18,2):=0; v_cert public.payroll_tax_certificates%rowtype; v_html text;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_tax_year !~ '^[0-9]{4}-[0-9]{2}$' then raise exception 'Tax year must be YYYY-YY'; end if;
 v_start:=to_date(left(p_tax_year,4)||'-04-01','YYYY-MM-DD'); v_end:=to_date((left(p_tax_year,4)::integer+1)::text||'-03-31','YYYY-MM-DD');
 select * into v_emp from public.employees where id=p_employee_id;
 if not found then raise exception 'EMPLOYEE_NOT_FOUND'; end if;
 v_tenant:=v_emp.tenant_id; v_company:=v_emp.tenant_company_id;
 if not private.has_company_access(v_tenant,v_company) and v_emp.linked_user_id<>v_uid then raise exception 'Not authorized'; end if;
 if not private.has_company_access(v_tenant,v_company) and v_emp.linked_user_id=v_uid then null; end if;
 select coalesce(sum(ri.gross_earnings),0),coalesce(sum(case when upper(c.code)='TDS' then rc.amount else 0 end),0),coalesce(sum(ri.total_deductions),0) into v_gross,v_tds,v_ded
 from public.payroll_runs r join public.payroll_periods pp on pp.id=r.payroll_period_id join public.payroll_run_items ri on ri.payroll_run_id=r.id left join public.payroll_run_item_components rc on rc.payroll_run_item_id=ri.id left join public.payroll_components c on c.id=rc.payroll_component_id
 where r.tenant_id=v_tenant and r.tenant_company_id=v_company and ri.employee_id=v_emp.id and pp.period_end between v_start and v_end and r.status in ('posted','paid');
 select coalesce(td.previous_employer_income,0),coalesce(td.previous_employer_tds,0),coalesce(td.other_income,0) into v_prev,v_prev_tds,v_other from public.payroll_tax_declarations td where td.tenant_id=v_tenant and td.tenant_company_id=v_company and td.employee_id=v_emp.id and td.tax_year=p_tax_year order by td.updated_at desc limit 1;
 v_gross:=round(v_gross,2); v_tds:=round(v_tds,2); v_ded:=round(v_ded,2); v_prev:=round(v_prev,2); v_prev_tds:=round(v_prev_tds,2); v_other:=round(v_other,2);
 insert into public.payroll_tax_certificates(tenant_id,tenant_company_id,employee_id,tax_year,status,gross_salary,taxable_salary,total_deductions,tds_deducted,previous_employer_income,previous_employer_tds,other_income,declaration_snapshot,generated_by) values(v_tenant,v_company,v_emp.id,p_tax_year,'prepared',v_gross,greatest(v_gross-v_ded,0),v_ded,v_tds,v_prev,v_prev_tds,v_other,jsonb_build_object('period_start',v_start,'period_end',v_end,'previous_employer_tds_included',v_prev_tds,'other_income_included',v_other,'note','Preparation data only; official Form 16 certificate issuance remains subject to employer TDS reconciliation and prescribed reporting.'),v_uid) on conflict(tenant_company_id,employee_id,tax_year) do update set status='prepared',gross_salary=excluded.gross_salary,taxable_salary=excluded.taxable_salary,total_deductions=excluded.total_deductions,tds_deducted=excluded.tds_deducted,previous_employer_income=excluded.previous_employer_income,previous_employer_tds=excluded.previous_employer_tds,other_income=excluded.other_income,declaration_snapshot=excluded.declaration_snapshot,generated_at=now(),generated_by=excluded.generated_by returning * into v_cert;
 v_html:='<!doctype html><html><head><meta charset="utf-8"><title>Form 16 Preparation Statement</title><style>body{font-family:Arial,sans-serif;margin:40px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px}</style></head><body><h1>Form 16 Preparation Statement</h1><p><b>Employee:</b> '||replace(replace(replace(coalesce(v_emp.display_name,v_emp.first_name),'&','&amp;'),'<','&lt;'),'>','&gt;')||' ('||replace(v_emp.employee_code,'&','&amp;')||')</p><p><b>Tax Year:</b> '||p_tax_year||'</p><table><tr><th>Particular</th><th>Amount (INR)</th></tr><tr><td>Salary / Gross Earnings</td><td>'||to_char(v_gross,'FM9999999990.00')||'</td></tr><tr><td>Total Payroll Deductions</td><td>'||to_char(v_ded,'FM9999999990.00')||'</td></tr><tr><td>Taxable Salary Working</td><td>'||to_char(greatest(v_gross-v_ded,0),'FM9999999990.00')||'</td></tr><tr><td>Previous Employer Income</td><td>'||to_char(v_prev,'FM9999999990.00')||'</td></tr><tr><td>Previous Employer TDS</td><td>'||to_char(v_prev_tds,'FM9999999990.00')||'</td></tr><tr><td>Other Income Declared</td><td>'||to_char(v_other,'FM9999999990.00')||'</td></tr><tr><td>TDS Deducted by Current Employer</td><td>'||to_char(v_tds,'FM9999999990.00')||'</td></tr></table><p style="margin-top:30px;font-size:12px">Preparation statement generated by Business OS. This is not the official Form 16 certificate until employer TDS records and prescribed reporting are reconciled and the certificate is formally issued.</p></body></html>';
 return jsonb_build_object('id',v_cert.id,'status',v_cert.status,'employee_id',v_emp.id,'tax_year',p_tax_year,'file_name','Form16-Preparation-'||v_emp.employee_code||'-'||p_tax_year||'.html','mime_type','text/html','content',v_html,'gross_salary',v_gross,'taxable_salary',greatest(v_gross-v_ded,0),'tds_deducted',v_tds);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_payroll_payslip_atomic(p_payroll_run_item_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_uid uuid:=auth.uid(); v_item public.payroll_run_items%rowtype; v_run public.payroll_runs%rowtype; v_period public.payroll_periods%rowtype; v_emp public.employees%rowtype; v_html text; v_hash text; v_slip public.payroll_payslips%rowtype; v_allowed boolean:=false;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_item from public.payroll_run_items where id=p_payroll_run_item_id for update;
 if not found then raise exception 'PAYROLL_RUN_ITEM_NOT_FOUND'; end if;
 select * into v_run from public.payroll_runs where id=v_item.payroll_run_id;
 select * into v_period from public.payroll_periods where id=v_run.payroll_period_id;
 select * into v_emp from public.employees where id=v_item.employee_id;
 if private.has_company_access(v_run.tenant_id,v_run.tenant_company_id) and private.has_action_permission(v_run.tenant_id,'MANAGER') then v_allowed:=true; end if;
 if v_emp.linked_user_id=v_uid then v_allowed:=true; end if;
 if not v_allowed then raise exception 'Not authorized'; end if;
 if v_run.status not in ('posted','paid') then raise exception 'PAYSLIP_REQUIRES_POSTED_PAYROLL'; end if;
 select coalesce(string_agg('<tr><td>'||replace(replace(replace(c.name,'&','&amp;'),'<','&lt;'),'>','&gt;')||'</td><td>'||case when c.component_type='deduction' then '-' else '' end||to_char(rc.amount,'FM9999999990.00')||'</td></tr>','' order by rc.sequence,c.name),'') into v_html from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=v_item.id;
 v_html:='<!doctype html><html><head><meta charset="utf-8"><title>Payslip '||v_period.period_code||'</title><style>body{font-family:Arial,sans-serif;margin:40px;color:#222}h1{margin-bottom:4px}table{border-collapse:collapse;width:100%;margin-top:20px}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f5f5f5}.total{font-weight:700}</style></head><body><h1>Salary Payslip</h1><p><b>Period:</b> '||replace(v_period.period_code,'&','&amp;')||'</p><p><b>Employee:</b> '||replace(replace(replace(coalesce(v_emp.display_name,trim(v_emp.first_name||' '||coalesce(v_emp.last_name,''))),'&','&amp;'),'<','&lt;'),'>','&gt;')||' ('||replace(v_emp.employee_code,'&','&amp;')||')</p><table><tr><th>Component</th><th>Amount (INR)</th></tr>'||v_html||'</table><table><tr><td class="total">Gross Earnings</td><td class="total">'||to_char(v_item.gross_earnings,'FM9999999990.00')||'</td></tr><tr><td class="total">Total Deductions</td><td class="total">'||to_char(v_item.total_deductions,'FM9999999990.00')||'</td></tr><tr><td class="total">Net Pay</td><td class="total">'||to_char(v_item.net_pay,'FM9999999990.00')||'</td></tr></table><p style="margin-top:30px;font-size:12px">System-generated payslip from Business OS.</p></body></html>';
 v_hash:=encode(extensions.digest(convert_to(v_html,'UTF8'),'sha256'),'hex');
 select * into v_slip from public.payroll_payslips where tenant_company_id=v_run.tenant_company_id and payroll_run_item_id=v_item.id for update;
 if found then update public.payroll_payslips set content_hash=v_hash,generated_at=now(),generated_by=v_uid where id=v_slip.id returning * into v_slip;
 else insert into public.payroll_payslips(tenant_id,tenant_company_id,payroll_run_id,payroll_run_item_id,employee_id,period_code,payslip_number,content_hash,generated_by) values(v_run.tenant_id,v_run.tenant_company_id,v_run.id,v_item.id,v_item.employee_id,v_period.period_code,'PS-'||v_period.period_code||'-'||v_emp.employee_code,v_hash,v_uid) returning * into v_slip; end if;
 return jsonb_build_object('id',v_slip.id,'payslip_number',v_slip.payslip_number,'file_name','Payslip-'||v_emp.employee_code||'-'||v_period.period_code||'.html','mime_type','text/html','content',v_html,'content_hash',v_hash);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_payroll_pf_ecr_atomic(p_payroll_period_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_period public.payroll_periods%rowtype; v_content text; v_missing integer;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_period from public.payroll_periods where id=p_payroll_period_id;
 if not found then raise exception 'PAYROLL_PERIOD_NOT_FOUND'; end if;
 if not private.has_company_access(v_period.tenant_id,v_period.tenant_company_id) or not private.has_action_permission(v_period.tenant_id,'MANAGER') then raise exception 'Not authorized'; end if;
 select count(*) into v_missing from public.payroll_runs r join public.payroll_run_items ri on ri.payroll_run_id=r.id join public.employee_pf_details pf on pf.employee_id=ri.employee_id and pf.tenant_id=r.tenant_id where r.tenant_id=v_period.tenant_id and r.tenant_company_id=v_period.tenant_company_id and r.payroll_period_id=v_period.id and r.status in ('posted','paid') and coalesce(pf.pf_applicable,false) and nullif(trim(pf.uan),'') is null;
 if v_missing>0 then raise exception 'PF_ECR_UAN_MISSING_FOR_EMPLOYEES'; end if;
 select coalesce(string_agg(pf.uan||'#~#'||replace(replace(replace(coalesce(e.display_name,trim(e.first_name||' '||coalesce(e.last_name,''))),'#',''),chr(10),' '),chr(13),' ')||'#~#'||trunc(ri.gross_earnings)||'#~#'||trunc(coalesce(nullif(pf.pf_wage,0),0))||'#~#'||trunc(coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code) in ('PF_EMPLOYEE','PF_EMP')),0))||'#~#'||trunc(coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code) in ('PF_EMPLOYEE','PF_EMP')),0))||'#~#'||trunc(case when exists(select 1 from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code)='EPS_EMPLOYER' and rc.amount>0) then least(coalesce(nullif(pf.pf_wage,0),0),15000) else 0 end)||'#~#'||trunc(coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code)='EPS_EMPLOYER'),0))||'#~#'||trunc(coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where false),0))||'#~#'||trunc(coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code)='EPF_EMPLOYER'),0))||'#~#'||trunc(ri.lop_days)||'#~#0#~#0#~#0#~#0#~#0#~#0',chr(10) order by e.employee_code),'') into v_content
 from public.payroll_runs r join public.payroll_run_items ri on ri.payroll_run_id=r.id join public.employees e on e.id=ri.employee_id join public.employee_pf_details pf on pf.employee_id=e.id and pf.tenant_id=r.tenant_id where r.tenant_id=v_period.tenant_id and r.tenant_company_id=v_period.tenant_company_id and r.payroll_period_id=v_period.id and r.status in ('posted','paid') and coalesce(pf.pf_applicable,false);
 return jsonb_build_object('file_name','PF-ECR-'||v_period.period_code||'.txt','mime_type','text/plain','content',v_content,'format','EPFO_ECR_V2_DETAIL_LINES','period_code',v_period.period_code,'note','Validate the generated file against the current EPFO portal validation rules before upload.');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.generate_payroll_statutory_export_atomic(p_payroll_period_id uuid, p_statutory_type text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_uid uuid:=auth.uid(); v_period public.payroll_periods%rowtype; v_type text:=upper(trim(p_statutory_type)); v_total numeric(18,2); v_count integer; v_csv text; v_settlement public.payroll_statutory_settlements%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if v_type not in ('PF','ESI','PT','TDS') then raise exception 'Invalid statutory type'; end if;
 select * into v_period from public.payroll_periods where id=p_payroll_period_id for update;
 if not found then raise exception 'PAYROLL_PERIOD_NOT_FOUND'; end if;
 if not private.has_company_access(v_period.tenant_id,v_period.tenant_company_id) or not private.has_action_permission(v_period.tenant_id,'MANAGER') then raise exception 'Not authorized'; end if;
 select coalesce(sum(rc.amount),0),count(distinct ri.employee_id) filter(where true) into v_total,v_count
 from public.payroll_runs r join public.payroll_run_items ri on ri.payroll_run_id=r.id join public.payroll_run_item_components rc on rc.payroll_run_item_id=ri.id join public.payroll_components c on c.id=rc.payroll_component_id
 where r.tenant_id=v_period.tenant_id and r.tenant_company_id=v_period.tenant_company_id and r.payroll_period_id=v_period.id and r.status in ('posted','paid') and ((v_type='PF' and upper(c.code) in ('PF_EMPLOYEE','PF_EMP','EPF_EMPLOYER','EPS_EMPLOYER','EDLI_EMPLOYER')) or (v_type='ESI' and upper(c.code) in ('ESI_EMPLOYEE','ESI_EMPLOYER','ESI_EMP')) or (v_type='PT' and upper(c.code) in ('PT','PROFESSIONAL_TAX')) or (v_type='TDS' and upper(c.code)='TDS'));
 v_total:=round(v_total,2);
 if v_total<=0 then raise exception 'NO_STATUTORY_AMOUNT_AVAILABLE'; end if;
 select * into v_settlement from public.payroll_statutory_settlements where tenant_company_id=v_period.tenant_company_id and payroll_period_id=v_period.id and statutory_type=v_type for update;
 if found then
   if v_settlement.status in ('paid','cancelled') then raise exception 'STATUTORY_SETTLEMENT_LOCKED'; end if;
   update public.payroll_statutory_settlements set total_amount=v_total,employee_count=v_count,status='exported',export_generation=export_generation+1,updated_at=now() where id=v_settlement.id returning * into v_settlement;
 else
   insert into public.payroll_statutory_settlements(tenant_id,tenant_company_id,payroll_period_id,statutory_type,total_amount,employee_count,status,idempotency_key,created_by) values(v_period.tenant_id,v_period.tenant_company_id,v_period.id,v_type,v_total,v_count,'exported','PAYROLL-STAT-'||v_period.id||'-'||v_type,v_uid) returning * into v_settlement;
 end if;
 v_csv:='Employee Code,Employee Name,Statutory Type,Period,Employee Amount,Employer Amount,Total Amount'||chr(10);
 select v_csv || coalesce(string_agg(e.employee_code||','||replace(coalesce(e.display_name,trim(coalesce(e.first_name,'')||' '||coalesce(e.last_name,''))),',',' ')||','||v_type||','||v_period.period_code||','||to_char(coalesce(sum(case when ((v_type='PF' and upper(c.code) in ('PF_EMPLOYEE','PF_EMP')) or (v_type='ESI' and upper(c.code) in ('ESI_EMPLOYEE','ESI_EMP'))) then rc.amount else 0 end),0),'FM9999999990.00')||','||to_char(coalesce(sum(case when ((v_type='PF' and upper(c.code) in ('EPF_EMPLOYER','EPS_EMPLOYER','EDLI_EMPLOYER')) or (v_type='ESI' and upper(c.code)='ESI_EMPLOYER')) then rc.amount else 0 end),0),'FM9999999990.00')||','||to_char(coalesce(sum(rc.amount),0),'FM9999999990.00'),chr(10) order by e.employee_code),'') into v_csv
 from public.payroll_runs r join public.payroll_run_items ri on ri.payroll_run_id=r.id join public.employees e on e.id=ri.employee_id join public.payroll_run_item_components rc on rc.payroll_run_item_id=ri.id join public.payroll_components c on c.id=rc.payroll_component_id
 where r.tenant_id=v_period.tenant_id and r.tenant_company_id=v_period.tenant_company_id and r.payroll_period_id=v_period.id and r.status in ('posted','paid') and ((v_type='PF' and upper(c.code) in ('PF_EMPLOYEE','PF_EMP','EPF_EMPLOYER','EPS_EMPLOYER','EDLI_EMPLOYER')) or (v_type='ESI' and upper(c.code) in ('ESI_EMPLOYEE','ESI_EMPLOYER','ESI_EMP')) or (v_type='PT' and upper(c.code) in ('PT','PROFESSIONAL_TAX')) or (v_type='TDS' and upper(c.code)='TDS'))
 group by e.id,e.employee_code,e.display_name,e.first_name,e.last_name;
 return jsonb_build_object('id',v_settlement.id,'status',v_settlement.status,'statutory_type',v_type,'total_amount',v_total,'employee_count',v_count,'file_name','PAYROLL-'||v_type||'-'||v_period.period_code||'.csv','mime_type','text/csv','content',v_csv,'export_generation',v_settlement.export_generation);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_accounting_financials_atomic(p_tenant_id uuid, p_tenant_company_id uuid, p_from_date date, p_to_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_pl numeric := 0;
  v_pe numeric := 0;
  v_net numeric := 0;
  v_assets numeric := 0;
  v_liabilities numeric := 0;
  v_equity numeric := 0;
  v_balance_check numeric := 0;
  v_total_debit numeric := 0;
  v_total_credit numeric := 0;
  v_cash_movement numeric := 0;
  v_ar numeric := 0;
  v_ap numeric := 0;
  v_rows jsonb;
begin
  if v_uid is null then
    raise exception 'Authentication required' using errcode='42501';
  end if;
  if p_tenant_id is null or p_tenant_company_id is null then
    raise exception 'Tenant and operating company are required';
  end if;
  if p_from_date is null or p_to_date is null or p_from_date > p_to_date then
    raise exception 'Invalid reporting period';
  end if;
  if not private.has_company_access(p_tenant_id,p_tenant_company_id)
     or not private.has_action_permission(p_tenant_id,'MANAGER') then
    raise exception 'Not authorized' using errcode='42501';
  end if;

  /* Period P&L. Revenue is normally credit-natured; expenses debit-natured. */
  select
    coalesce(sum(case when lower(coa.account_type) in ('revenue','income') then jl.credit-jl.debit else 0 end),0),
    coalesce(sum(case when lower(coa.account_type) in ('expense','expenses') then jl.debit-jl.credit else 0 end),0)
  into v_pl, v_pe
  from public.accounting_journal_entries je
  join public.accounting_journal_lines jl on jl.journal_entry_id=je.id
  join public.chart_of_accounts coa on coa.id=jl.account_id
  where je.tenant_id=p_tenant_id
    and je.tenant_company_id=p_tenant_company_id
    and je.status='posted'
    and je.entry_date between p_from_date and p_to_date
    and lower(coa.account_type) in ('revenue','income','expense','expenses');

  v_net := v_pl - v_pe;

  /* Balance sheet is cumulative through the requested as-of date. */
  select
    coalesce(sum(case when lower(coa.account_type) in ('asset','assets') then jl.debit-jl.credit else 0 end),0),
    coalesce(sum(case when lower(coa.account_type) in ('liability','liabilities') then jl.credit-jl.debit else 0 end),0),
    coalesce(sum(case when lower(coa.account_type) in ('equity','capital') then jl.credit-jl.debit else 0 end),0)
  into v_assets, v_liabilities, v_equity
  from public.accounting_journal_entries je
  join public.accounting_journal_lines jl on jl.journal_entry_id=je.id
  join public.chart_of_accounts coa on coa.id=jl.account_id
  where je.tenant_id=p_tenant_id
    and je.tenant_company_id=p_tenant_company_id
    and je.status='posted'
    and je.entry_date <= p_to_date
    and lower(coa.account_type) in ('asset','assets','liability','liabilities','equity','capital');

  /* Balance check includes current-period P&L when P&L has not been closed into equity. */
  v_balance_check := v_assets - (v_liabilities + v_equity + v_net);

  select coalesce(sum(jl.debit),0), coalesce(sum(jl.credit),0)
  into v_total_debit, v_total_credit
  from public.accounting_journal_entries je
  join public.accounting_journal_lines jl on jl.journal_entry_id=je.id
  where je.tenant_id=p_tenant_id
    and je.tenant_company_id=p_tenant_company_id
    and je.status='posted'
    and je.entry_date between p_from_date and p_to_date;

  /* Cash/bank movement from posted GL lines classified by account subtype/name. */
  select coalesce(sum(jl.debit-jl.credit),0)
  into v_cash_movement
  from public.accounting_journal_entries je
  join public.accounting_journal_lines jl on jl.journal_entry_id=je.id
  join public.chart_of_accounts coa on coa.id=jl.account_id
  where je.tenant_id=p_tenant_id
    and je.tenant_company_id=p_tenant_company_id
    and je.status='posted'
    and je.entry_date between p_from_date and p_to_date
    and (
      lower(coalesce(coa.account_subtype,'')) in ('cash','bank','cash_and_bank')
      or lower(coalesce(coa.account_name,'')) ~ '(cash|bank)'
    );

  /* AR/AP are operational settlement balances as of the requested date. */
  select coalesce(sum(greatest(ti.balance_due,0)),0)
  into v_ar
  from public.tax_invoices ti
  where ti.tenant_id=p_tenant_id
    and ti.tenant_company_id=p_tenant_company_id
    and ti.invoice_date <= p_to_date
    and ti.status not in ('cancelled','void');

  select coalesce(sum(greatest(pb.balance_due,0)),0)
  into v_ap
  from public.purchase_bills pb
  where pb.tenant_id=p_tenant_id
    and pb.tenant_company_id=p_tenant_company_id
    and pb.bill_date <= p_to_date
    and pb.status not in ('cancelled','rejected');

  select coalesce(jsonb_agg(to_jsonb(x) order by x.account_code),'[]'::jsonb)
  into v_rows
  from (
    select
      coa.account_code,
      coa.account_name,
      coa.account_type,
      coalesce(sum(case when je.entry_date between p_from_date and p_to_date then jl.debit else 0 end),0) as period_debit,
      coalesce(sum(case when je.entry_date between p_from_date and p_to_date then jl.credit else 0 end),0) as period_credit,
      coalesce(sum(case when je.entry_date <= p_to_date then jl.debit-jl.credit else 0 end),0) as cumulative_signed_balance
    from public.chart_of_accounts coa
    left join public.accounting_journal_lines jl on jl.account_id=coa.id
    left join public.accounting_journal_entries je
      on je.id=jl.journal_entry_id
      and je.tenant_id=p_tenant_id
      and je.tenant_company_id=p_tenant_company_id
      and je.status='posted'
      and je.entry_date <= p_to_date
    where coa.tenant_id=p_tenant_id
      and coa.tenant_company_id=p_tenant_company_id
    group by coa.id,coa.account_code,coa.account_name,coa.account_type
  ) x;

  return jsonb_build_object(
    'report_version','3',
    'report_key','accounts_financials',
    'tenant_id',p_tenant_id,
    'tenant_company_id',p_tenant_company_id,
    'from_date',p_from_date,
    'to_date',p_to_date,
    'profit_and_loss',jsonb_build_object(
      'revenue',v_pl,
      'expenses',v_pe,
      'net_result',v_net
    ),
    'balance_sheet',jsonb_build_object(
      'assets',v_assets,
      'liabilities',v_liabilities,
      'equity',v_equity,
      'current_period_result',v_net,
      'balance_check',v_balance_check,
      'is_balanced',abs(v_balance_check) < 0.01
    ),
    'trial_balance',jsonb_build_object(
      'debit',v_total_debit,
      'credit',v_total_credit,
      'difference',v_total_debit-v_total_credit
    ),
    'cash_flow',jsonb_build_object(
      'posted_cash_bank_movement',v_cash_movement
    ),
    'receivables',jsonb_build_object('outstanding',v_ar),
    'payables',jsonb_build_object('outstanding',v_ap),
    'account_balances',v_rows,
    'generated_at',clock_timestamp()
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_accounting_fiscal_close_readiness_atomic(p_tenant_id uuid, p_tenant_company_id uuid, p_fiscal_period_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_start date; v_end date; v_unreconciled_bank integer:=0; v_bad_period_links integer:=0; v_unbalanced integer:=0; v_result jsonb;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_tenant_id is null or p_tenant_company_id is null or p_fiscal_period_id is null then raise exception 'Tenant, operating company and fiscal period are required'; end if;
 if not private.has_action_permission(p_tenant_id,'ADMIN') or not private.has_company_access(p_tenant_id,p_tenant_company_id) then raise exception 'Not authorized' using errcode='42501'; end if;
 select period_start,period_end into v_start,v_end from public.accounting_fiscal_periods where id=p_fiscal_period_id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id;
 if not found then raise exception 'Fiscal period not found'; end if;
 select count(*) into v_unreconciled_bank from public.accounting_bank_transactions bt where bt.tenant_id=p_tenant_id and bt.tenant_company_id=p_tenant_company_id and bt.transaction_date between v_start and v_end and coalesce(bt.reconciliation_status,'unreconciled')<>'reconciled';
 select count(*) into v_bad_period_links from public.accounting_journal_entries je where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.status='posted' and je.entry_date between v_start and v_end and (je.fiscal_period_id is distinct from p_fiscal_period_id);
 select count(*) into v_unbalanced from public.accounting_journal_entries je where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.status='posted' and je.entry_date between v_start and v_end and (select coalesce(sum(jl.debit),0) from public.accounting_journal_lines jl where jl.journal_entry_id=je.id)<>(select coalesce(sum(jl.credit),0) from public.accounting_journal_lines jl where jl.journal_entry_id=je.id);
 v_result:=jsonb_build_object('report_version',1,'report_key','accounting_fiscal_close_readiness','fiscal_period_id',p_fiscal_period_id,'period_start',v_start,'period_end',v_end,'unreconciled_bank_transactions',v_unreconciled_bank,'posted_journals_with_wrong_period',v_bad_period_links,'unbalanced_posted_journals',v_unbalanced,'ready_to_close',v_unreconciled_bank=0 and v_bad_period_links=0 and v_unbalanced=0,'generated_at',now());
 return v_result;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_accounts_ar_ap_integrity_atomic(p_tenant_id uuid, p_tenant_company_id uuid, p_as_of_date date DEFAULT CURRENT_DATE)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_ar_gl numeric := 0;
  v_ap_gl numeric := 0;
  v_ar_operational numeric := 0;
  v_ap_operational numeric := 0;
  v_ar_diff numeric := 0;
  v_ap_diff numeric := 0;
  v_ar_account_count integer := 0;
  v_ap_account_count integer := 0;
  v_result jsonb;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_tenant_id is null or p_tenant_company_id is null or p_as_of_date is null then raise exception 'Tenant, operating company and as-of date are required'; end if;
  if not private.has_action_permission(p_tenant_id,'MANAGER') or not private.has_company_access(p_tenant_id,p_tenant_company_id) then raise exception 'Not authorized' using errcode='42501'; end if;

  /* Control accounts: AR debit balance, AP credit balance, cumulative through as-of date. */
  select count(*) into v_ar_account_count
  from public.chart_of_accounts a
  where a.tenant_id=p_tenant_id and a.tenant_company_id=p_tenant_company_id and a.is_active
    and (lower(coalesce(a.account_subtype,'')) in ('accounts_receivable','receivables','trade_receivables','trade_receivable')
         or lower(a.account_name) like '%accounts receivable%' or lower(a.account_name) like '%trade receivable%');

  select count(*) into v_ap_account_count
  from public.chart_of_accounts a
  where a.tenant_id=p_tenant_id and a.tenant_company_id=p_tenant_company_id and a.is_active
    and (lower(coalesce(a.account_subtype,'')) in ('accounts_payable','payable','trade_payables','trade_payable')
         or lower(a.account_name) like '%accounts payable%' or lower(a.account_name) like '%trade payable%');

  if v_ar_account_count > 0 then
    select coalesce(sum(jl.debit-jl.credit),0) into v_ar_gl
    from public.accounting_journal_entries je
    join public.accounting_journal_lines jl on jl.journal_entry_id=je.id
    join public.chart_of_accounts a on a.id=jl.account_id
    where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id
      and je.status='posted' and je.entry_date<=p_as_of_date
      and a.tenant_id=p_tenant_id and a.tenant_company_id=p_tenant_company_id and a.is_active
      and (lower(coalesce(a.account_subtype,'')) in ('accounts_receivable','receivables','trade_receivables','trade_receivable')
           or lower(a.account_name) like '%accounts receivable%' or lower(a.account_name) like '%trade receivable%');
  end if;

  if v_ap_account_count > 0 then
    select coalesce(sum(jl.credit-jl.debit),0) into v_ap_gl
    from public.accounting_journal_entries je
    join public.accounting_journal_lines jl on jl.journal_entry_id=je.id
    join public.chart_of_accounts a on a.id=jl.account_id
    where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id
      and je.status='posted' and je.entry_date<=p_as_of_date
      and a.tenant_id=p_tenant_id and a.tenant_company_id=p_tenant_company_id and a.is_active
      and (lower(coalesce(a.account_subtype,'')) in ('accounts_payable','payable','trade_payables','trade_payable')
           or lower(a.account_name) like '%accounts payable%' or lower(a.account_name) like '%trade payable%');
  end if;

  select coalesce(sum(greatest(coalesce(i.balance_due,0),0)),0) into v_ar_operational
  from public.tax_invoices i
  where i.tenant_id=p_tenant_id and i.tenant_company_id=p_tenant_company_id
    and i.invoice_date<=p_as_of_date
    and coalesce(i.status,'') not in ('cancelled','void','draft');

  select coalesce(sum(greatest(coalesce(b.balance_due,0),0)),0) into v_ap_operational
  from public.purchase_bills b
  where b.tenant_id=p_tenant_id and b.tenant_company_id=p_tenant_company_id
    and b.bill_date<=p_as_of_date
    and coalesce(b.status,'') not in ('cancelled','void','draft');

  v_ar_diff := round(v_ar_gl-v_ar_operational,2);
  v_ap_diff := round(v_ap_gl-v_ap_operational,2);

  v_result := jsonb_build_object(
    'report_version',1,
    'report_key','accounts_ar_ap_integrity',
    'as_of_date',p_as_of_date,
    'ar',jsonb_build_object('control_account_count',v_ar_account_count,'gl_balance',round(v_ar_gl,2),'operational_outstanding',round(v_ar_operational,2),'difference',v_ar_diff,'is_reconciled',v_ar_account_count=1 and abs(v_ar_diff)<=0.01),
    'ap',jsonb_build_object('control_account_count',v_ap_account_count,'gl_balance',round(v_ap_gl,2),'operational_outstanding',round(v_ap_operational,2),'difference',v_ap_diff,'is_reconciled',v_ap_account_count=1 and abs(v_ap_diff)<=0.01),
    'overall_reconciled',v_ar_account_count=1 and v_ap_account_count=1 and abs(v_ar_diff)<=0.01 and abs(v_ap_diff)<=0.01,
    'generated_at',now()
  );
  return v_result;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_business_report_catalog_atomic(p_tenant_id uuid, p_tenant_company_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_tenant_id is null or p_tenant_company_id is null then raise exception 'Tenant and operating company are required'; end if;
  if not private.has_company_access(p_tenant_id,p_tenant_company_id) or not private.has_action_permission(p_tenant_id,'MANAGER') then
    raise exception 'Not authorized' using errcode='42501';
  end if;
  return jsonb_build_object('report_version','2','reports',jsonb_build_array(
    jsonb_build_object('key','executive_overview','domain','Executive','name','Business Overview','type','summary'),
    jsonb_build_object('key','sales_quotations','domain','Sales','name','Quotations','type','detail'),
    jsonb_build_object('key','sales_orders','domain','Sales','name','Sales Orders','type','detail'),
    jsonb_build_object('key','sales_invoices','domain','Sales','name','Invoices & Receivables','type','detail'),
    jsonb_build_object('key','procurement_orders','domain','Procurement','name','Purchase Orders','type','detail'),
    jsonb_build_object('key','procurement_bills','domain','Procurement','name','Purchase Bills & Payables','type','detail'),
    jsonb_build_object('key','procurement_performance','domain','Procurement','name','Procurement Performance','type','detail'),
    jsonb_build_object('key','inventory_stock','domain','Inventory','name','Stock Position','type','detail'),
    jsonb_build_object('key','inventory_movement','domain','Inventory','name','Stock Movement','type','detail'),
    jsonb_build_object('key','inventory_valuation','domain','Inventory','name','Inventory Valuation','type','detail'),
    jsonb_build_object('key','inventory_aging','domain','Inventory','name','Inventory Aging','type','detail'),
    jsonb_build_object('key','accounts_ledger','domain','Accounts','name','General Ledger','type','detail'),
    jsonb_build_object('key','accounts_trial_balance','domain','Accounts','name','Trial Balance','type','detail'),
    jsonb_build_object('key','accounts_profit_loss','domain','Accounts','name','Profit & Loss','type','detail'),
    jsonb_build_object('key','accounts_balance_sheet','domain','Accounts','name','Balance Sheet','type','detail'),
    jsonb_build_object('key','accounts_cash_flow','domain','Accounts','name','Cash Flow','type','detail'),
    jsonb_build_object('key','accounts_ar_aging','domain','Accounts','name','Receivables Aging','type','detail'),
    jsonb_build_object('key','accounts_ap_aging','domain','Accounts','name','Payables Aging','type','detail'),
    jsonb_build_object('key','hr_attendance','domain','HR','name','Attendance','type','detail'),
    jsonb_build_object('key','hr_leave','domain','HR','name','Leave','type','detail'),
    jsonb_build_object('key','hr_payroll','domain','HR','name','Payroll','type','detail'),
    jsonb_build_object('key','projects','domain','Projects','name','Project Status & Commercial','type','detail'),
    jsonb_build_object('key','projects_profitability','domain','Projects','name','Project Profitability','type','detail')
  ));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_business_report_rows_atomic(p_tenant_id uuid, p_tenant_company_id uuid, p_report_key text, p_from_date date, p_to_date date, p_limit integer DEFAULT 500, p_offset integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid(); v_key text := lower(trim(coalesce(p_report_key,'')));
  v_limit integer := least(greatest(coalesce(p_limit,500),1),1000); v_offset integer := greatest(coalesce(p_offset,0),0); v_rows jsonb := '[]'::jsonb;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_tenant_id is null or p_tenant_company_id is null then raise exception 'Tenant and operating company are required'; end if;
  if p_from_date is null or p_to_date is null or p_from_date > p_to_date then raise exception 'Invalid reporting period'; end if;
  if not private.has_company_access(p_tenant_id,p_tenant_company_id) or not private.has_action_permission(p_tenant_id,'MANAGER') then raise exception 'Not authorized' using errcode='42501'; end if;

  if v_key = 'accounts_profit_loss' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.account_type,x.account_code),'[]'::jsonb) into v_rows from (
      select coa.account_code,coa.account_name,coa.account_type,
             coalesce(sum(jl.credit-jl.debit),0) as net_amount,
             case when lower(coalesce(coa.account_type,'')) in ('income','revenue') then 'Income'
                  when lower(coalesce(coa.account_type,'')) in ('expense','expenses') then 'Expense' else 'Other' end as section
      from public.chart_of_accounts coa
      join public.accounting_journal_lines jl on jl.account_id=coa.id
      join public.accounting_journal_entries je on je.id=jl.journal_entry_id
      where coa.tenant_id=p_tenant_id and coa.tenant_company_id=p_tenant_company_id and je.status='posted'
        and je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.entry_date between p_from_date and p_to_date
        and lower(coalesce(coa.account_type,'')) in ('income','revenue','expense','expenses')
      group by coa.account_code,coa.account_name,coa.account_type
      order by section,coa.account_code limit v_limit offset v_offset) x;
  elsif v_key = 'accounts_balance_sheet' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.section,x.account_code),'[]'::jsonb) into v_rows from (
      select coa.account_code,coa.account_name,coa.account_type,
             case when lower(coalesce(coa.account_type,'')) in ('asset','assets') then 'Assets'
                  when lower(coalesce(coa.account_type,'')) in ('liability','liabilities') then 'Liabilities'
                  when lower(coalesce(coa.account_type,'')) in ('equity','capital') then 'Equity' else 'Other' end as section,
             coalesce(sum(jl.debit-jl.credit),0) as debit_credit_balance
      from public.chart_of_accounts coa
      left join public.accounting_journal_lines jl on jl.account_id=coa.id
      left join public.accounting_journal_entries je on je.id=jl.journal_entry_id
      where coa.tenant_id=p_tenant_id and coa.tenant_company_id=p_tenant_company_id
        and (je.id is null or (je.status='posted' and je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.entry_date <= p_to_date))
        and lower(coalesce(coa.account_type,'')) in ('asset','assets','liability','liabilities','equity','capital')
      group by coa.account_code,coa.account_name,coa.account_type
      order by section,coa.account_code limit v_limit offset v_offset) x;
  elsif v_key = 'accounts_cash_flow' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.flow_date desc,x.voucher_number desc),'[]'::jsonb) into v_rows from (
      select je.entry_date as flow_date,je.voucher_number,je.voucher_type,je.narration,
             coa.account_code,coa.account_name,
             case when lower(coalesce(coa.account_subtype,'')) in ('cash','bank','cash_and_bank') or lower(coalesce(coa.account_name,'')) ~ '(cash|bank)' then 'Cash/Bank' else 'Non-Cash' end as account_class,
             sum(jl.debit-jl.credit) as net_cash_movement
      from public.accounting_journal_entries je
      join public.accounting_journal_lines jl on jl.journal_entry_id=je.id
      join public.chart_of_accounts coa on coa.id=jl.account_id
      where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.status='posted' and je.entry_date between p_from_date and p_to_date
        and (lower(coalesce(coa.account_subtype,'')) in ('cash','bank','cash_and_bank') or lower(coalesce(coa.account_name,'')) ~ '(cash|bank)')
      group by je.entry_date,je.voucher_number,je.voucher_type,je.narration,coa.account_code,coa.account_name,coa.account_subtype
      order by je.entry_date desc,je.voucher_number desc limit v_limit offset v_offset) x;
  elsif v_key = 'accounts_ar_aging' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.days_overdue desc,x.due_date),'[]'::jsonb) into v_rows from (
      select ti.invoice_no,ti.invoice_date,ti.due_date,ti.customer_name,ti.total_amount,ti.amount_paid,greatest(ti.balance_due,0) as balance_due,
             greatest((current_date-ti.due_date),0) as days_overdue,
             case when current_date <= ti.due_date then 'Current' when current_date-ti.due_date between 1 and 30 then '1-30'
                  when current_date-ti.due_date between 31 and 60 then '31-60' when current_date-ti.due_date between 61 and 90 then '61-90'
                  when current_date-ti.due_date between 91 and 180 then '91-180' else '180+' end as aging_bucket,
             ti.work_id
      from public.tax_invoices ti
      where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.status not in ('cancelled','void') and greatest(ti.balance_due,0)>0
      order by days_overdue desc,ti.due_date limit v_limit offset v_offset) x;
  elsif v_key = 'accounts_ap_aging' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.days_overdue desc,x.due_date),'[]'::jsonb) into v_rows from (
      select pb.bill_no,pb.bill_date,pb.due_date,pb.vendor_id,pb.total_amount,pb.amount_paid,greatest(pb.balance_due,0) as balance_due,
             greatest((current_date-pb.due_date),0) as days_overdue,
             case when current_date <= pb.due_date then 'Current' when current_date-pb.due_date between 1 and 30 then '1-30'
                  when current_date-pb.due_date between 31 and 60 then '31-60' when current_date-pb.due_date between 61 and 90 then '61-90'
                  when current_date-pb.due_date between 91 and 180 then '91-180' else '180+' end as aging_bucket,
             pb.work_id
      from public.purchase_bills pb
      where pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.status not in ('cancelled','rejected') and greatest(pb.balance_due,0)>0
      order by days_overdue desc,pb.due_date limit v_limit offset v_offset) x;
  elsif v_key = 'inventory_valuation' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.stock_value desc),'[]'::jsonb) into v_rows from (
      select v.item_code,v.item_name,v.base_uom_code,v.category,v.location_code,v.location_name,v.lot_number,
             v.quantity_on_hand,v.reserved_quantity,v.available_quantity,v.average_unit_cost,v.stock_value,
             v.reorder_level,v.reorder_shortfall,v.is_low_stock
      from public.inventory_control_stock_v v where v.tenant_id=p_tenant_id and v.tenant_company_id=p_tenant_company_id
      order by v.stock_value desc limit v_limit offset v_offset) x;
  elsif v_key = 'inventory_aging' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.age_days desc,x.stock_value desc),'[]'::jsonb) into v_rows from (
      select b.item_code,b.item_name,b.location_code,b.lot_number,b.quantity_on_hand,b.average_unit_cost,b.stock_value,
             greatest(current_date-coalesce((select max(l.transaction_date) from public.inventory_stock_ledger_v l where l.tenant_id=b.tenant_id and l.tenant_company_id=b.tenant_company_id and l.item_code=b.item_code and l.location_code=b.location_code and l.quantity_in>0),current_date),0) as age_days,
             case when greatest(current_date-coalesce((select max(l.transaction_date) from public.inventory_stock_ledger_v l where l.tenant_id=b.tenant_id and l.tenant_company_id=b.tenant_company_id and l.item_code=b.item_code and l.location_code=b.location_code and l.quantity_in>0),current_date),0) <= 30 then '0-30'
                  when greatest(current_date-coalesce((select max(l.transaction_date) from public.inventory_stock_ledger_v l where l.tenant_id=b.tenant_id and l.tenant_company_id=b.tenant_company_id and l.item_code=b.item_code and l.location_code=b.location_code and l.quantity_in>0),current_date),0) <= 60 then '31-60'
                  when greatest(current_date-coalesce((select max(l.transaction_date) from public.inventory_stock_ledger_v l where l.tenant_id=b.tenant_id and l.tenant_company_id=b.tenant_company_id and l.item_code=b.item_code and l.location_code=b.location_code and l.quantity_in>0),current_date),0) <= 90 then '61-90'
                  when greatest(current_date-coalesce((select max(l.transaction_date) from public.inventory_stock_ledger_v l where l.tenant_id=b.tenant_id and l.tenant_company_id=b.tenant_company_id and l.item_code=b.item_code and l.location_code=b.location_code and l.quantity_in>0),current_date),0) <= 180 then '91-180' else '180+' end as aging_bucket
      from public.inventory_control_stock_v b where b.tenant_id=p_tenant_id and b.tenant_company_id=p_tenant_company_id
      order by age_days desc,b.stock_value desc limit v_limit offset v_offset) x;
  elsif v_key = 'procurement_performance' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.po_date desc,x.po_no desc),'[]'::jsonb) into v_rows from (
      select po.po_no,po.po_date,po.vendor_id,po.status,po.total_amount,po.expected_delivery_date,po.work_id,
             coalesce((select count(*) from public.goods_received_notes grn where grn.purchase_order_id=po.id and grn.status not in ('cancelled','rejected')),0) as grn_count,
             coalesce((select sum(pb.total_amount) from public.purchase_bills pb where pb.purchase_order_id=po.id and pb.status not in ('cancelled','rejected')),0) as billed_value,
             case when po.expected_delivery_date is not null and po.expected_delivery_date < current_date and po.status not in ('closed','cancelled','rejected') then true else false end as delivery_overdue
      from public.purchase_orders po where po.tenant_id=p_tenant_id and po.tenant_company_id=p_tenant_company_id and po.po_date between p_from_date and p_to_date
      order by po.po_date desc,po.po_no desc limit v_limit offset v_offset) x;
  elsif v_key = 'projects_profitability' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.gross_contribution desc),'[]'::jsonb) into v_rows from (
      select w.id,w.wo_number,w.po_number,w.title,
        coalesce((select sum(ti.total_amount) from public.tax_invoices ti where ti.work_id=w.id and ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.invoice_date between p_from_date and p_to_date and ti.status not in ('cancelled','void')),0) as revenue,
        coalesce((select sum(pb.total_amount) from public.purchase_bills pb where pb.work_id=w.id and pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.bill_date between p_from_date and p_to_date and pb.status not in ('cancelled','rejected')),0) as procurement_cost,
        coalesce((select sum(abs(l.line_value)) from public.inventory_stock_ledger_v l where l.work_id=w.id and l.tenant_id=p_tenant_id and l.tenant_company_id=p_tenant_company_id and l.transaction_date between p_from_date and p_to_date and l.quantity_out>0),0) as material_issue_value,
        coalesce((select sum(jl.debit-jl.credit) from public.accounting_journal_lines jl join public.accounting_journal_entries je on je.id=jl.journal_entry_id join public.chart_of_accounts coa on coa.id=jl.account_id where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.status='posted' and je.source_type ilike '%payroll%' and je.entry_date between p_from_date and p_to_date and jl.project_id=w.id and lower(coalesce(coa.account_type,'')) in ('expense','expenses')),0) as labour_cost,
        coalesce((select sum(ti.total_amount) from public.tax_invoices ti where ti.work_id=w.id and ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.invoice_date between p_from_date and p_to_date and ti.status not in ('cancelled','void')),0)
        - coalesce((select sum(pb.total_amount) from public.purchase_bills pb where pb.work_id=w.id and pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.bill_date between p_from_date and p_to_date and pb.status not in ('cancelled','rejected')),0)
        - coalesce((select sum(abs(l.line_value)) from public.inventory_stock_ledger_v l where l.work_id=w.id and l.tenant_id=p_tenant_id and l.tenant_company_id=p_tenant_company_id and l.transaction_date between p_from_date and p_to_date and l.quantity_out>0),0)
        - coalesce((select sum(jl.debit-jl.credit) from public.accounting_journal_lines jl join public.accounting_journal_entries je on je.id=jl.journal_entry_id join public.chart_of_accounts coa on coa.id=jl.account_id where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.status='posted' and je.source_type ilike '%payroll%' and je.entry_date between p_from_date and p_to_date and jl.project_id=w.id and lower(coalesce(coa.account_type,'')) in ('expense','expenses')),0) as gross_contribution
      from public.works w where w.tenant_id=p_tenant_id and w.tenant_company_id=p_tenant_company_id and w.created_at::date <= p_to_date
      order by gross_contribution desc limit v_limit offset v_offset) x;
  elsif v_key = 'sales_invoices' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.invoice_date desc,x.invoice_no desc),'[]'::jsonb) into v_rows from (select ti.invoice_no,ti.invoice_date,ti.customer_name,ti.status,ti.total_amount,ti.amount_paid,ti.balance_due,ti.due_date,ti.work_id from public.tax_invoices ti where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.invoice_date between p_from_date and p_to_date and ti.status not in ('cancelled','void') order by ti.invoice_date desc,ti.invoice_no desc limit v_limit offset v_offset) x;
  elsif v_key = 'sales_orders' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.order_date desc,x.order_no desc),'[]'::jsonb) into v_rows from (select so.order_no,so.order_date,so.customer_name,so.status,so.total_amount,so.delivery_date,so.work_id from public.sales_orders so where so.tenant_id=p_tenant_id and so.tenant_company_id=p_tenant_company_id and so.order_date between p_from_date and p_to_date and so.status not in ('cancelled','rejected') order by so.order_date desc,so.order_no desc limit v_limit offset v_offset) x;
  elsif v_key = 'sales_quotations' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.quotation_date desc,x.quotation_no desc),'[]'::jsonb) into v_rows from (select q.quotation_no,q.quotation_date,q.customer_name,q.status,q.total_amount,q.valid_until,q.work_id from public.sales_quotations q where q.tenant_id=p_tenant_id and q.tenant_company_id=p_tenant_company_id and q.quotation_date between p_from_date and p_to_date order by q.quotation_date desc,q.quotation_no desc limit v_limit offset v_offset) x;
  elsif v_key = 'procurement_orders' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.po_date desc,x.po_no desc),'[]'::jsonb) into v_rows from (select po.po_no,po.po_date,po.vendor_id,po.status,po.total_amount,po.expected_delivery_date,po.work_id from public.purchase_orders po where po.tenant_id=p_tenant_id and po.tenant_company_id=p_tenant_company_id and po.po_date between p_from_date and p_to_date and po.status not in ('cancelled','rejected') order by po.po_date desc,po.po_no desc limit v_limit offset v_offset) x;
  elsif v_key = 'procurement_bills' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.bill_date desc,x.bill_no desc),'[]'::jsonb) into v_rows from (select pb.bill_no,pb.bill_date,pb.vendor_id,pb.status,pb.total_amount,pb.amount_paid,pb.balance_due,pb.due_date,pb.work_id from public.purchase_bills pb where pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.bill_date between p_from_date and p_to_date and pb.status not in ('cancelled','rejected') order by pb.bill_date desc,pb.bill_no desc limit v_limit offset v_offset) x;
  elsif v_key = 'inventory_stock' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.stock_value desc),'[]'::jsonb) into v_rows from (select v.item_code,v.item_name,v.base_uom_code,v.category,v.location_code,v.location_name,v.lot_number,v.quantity_on_hand,v.reserved_quantity,v.available_quantity,v.average_unit_cost,v.stock_value,v.reorder_level,v.reorder_shortfall,v.is_low_stock from public.inventory_control_stock_v v where v.tenant_id=p_tenant_id and v.tenant_company_id=p_tenant_company_id order by v.stock_value desc limit v_limit offset v_offset) x;
  elsif v_key = 'inventory_movement' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.transaction_date desc,x.transaction_no desc),'[]'::jsonb) into v_rows from (select l.transaction_no,l.transaction_date,l.transaction_type,l.item_code,l.item_name,l.location_code,l.quantity,l.quantity_in,l.quantity_out,l.unit_cost,l.line_value,l.reference_no,l.source_type,l.work_id from public.inventory_stock_ledger_v l where l.tenant_id=p_tenant_id and l.tenant_company_id=p_tenant_company_id and l.transaction_date between p_from_date and p_to_date order by l.transaction_date desc,l.transaction_no desc limit v_limit offset v_offset) x;
  elsif v_key = 'accounts_ledger' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.entry_date desc,x.voucher_number desc,x.line_no),'[]'::jsonb) into v_rows from (select je.entry_date,je.voucher_number,je.voucher_type,je.narration,coa.account_code,coa.account_name,coa.account_type,jl.line_no,jl.description,jl.debit,jl.credit,jl.party_type,jl.party_id,jl.project_id from public.accounting_journal_entries je join public.accounting_journal_lines jl on jl.journal_entry_id=je.id join public.chart_of_accounts coa on coa.id=jl.account_id where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.status='posted' and je.entry_date between p_from_date and p_to_date order by je.entry_date desc,je.voucher_number desc,jl.line_no limit v_limit offset v_offset) x;
  elsif v_key = 'accounts_trial_balance' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.account_code),'[]'::jsonb) into v_rows from (select coa.account_code,coa.account_name,coa.account_type,coalesce(sum(jl.debit),0) debit,coalesce(sum(jl.credit),0) credit,coalesce(sum(jl.debit-jl.credit),0) balance from public.chart_of_accounts coa left join public.accounting_journal_lines jl on jl.account_id=coa.id left join public.accounting_journal_entries je on je.id=jl.journal_entry_id where coa.tenant_id=p_tenant_id and coa.tenant_company_id=p_tenant_company_id and (je.id is null or (je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.status='posted' and je.entry_date <= p_to_date)) group by coa.id,coa.account_code,coa.account_name,coa.account_type order by coa.account_code limit v_limit offset v_offset) x;
  elsif v_key = 'hr_attendance' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.attendance_date desc,x.employee_code),'[]'::jsonb) into v_rows from (select a.attendance_date,e.employee_code,coalesce(e.display_name,concat_ws(' ',e.first_name,e.last_name)) employee_name,a.status,a.is_full_day,a.is_half_day,a.worked_minutes,a.effective_work_minutes,a.late_minutes,a.early_departure_minutes,a.holiday,a.weekly_off,a.leave,a.comp_off from public.attendance_daily_records a join public.employees e on e.id=a.employee_id where a.tenant_id=p_tenant_id and a.tenant_company_id=p_tenant_company_id and a.attendance_date between p_from_date and p_to_date order by a.attendance_date desc,e.employee_code limit v_limit offset v_offset) x;
  elsif v_key = 'hr_leave' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.from_date desc,x.employee_code),'[]'::jsonb) into v_rows from (select lr.id,lr.from_date,lr.to_date,lr.total_days,lr.status,lt.code leave_code,lt.name leave_type,e.employee_code,coalesce(e.display_name,concat_ws(' ',e.first_name,e.last_name)) employee_name,lr.reason from public.leave_requests lr join public.leave_types lt on lt.id=lr.leave_type_id join public.employees e on e.id=lr.employee_id where lr.tenant_id=p_tenant_id and lr.tenant_company_id=p_tenant_company_id and lr.from_date <= p_to_date and lr.to_date >= p_from_date order by lr.from_date desc,e.employee_code limit v_limit offset v_offset) x;
  elsif v_key = 'hr_payroll' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.period_start desc,x.employee_code),'[]'::jsonb) into v_rows from (select pp.period_code,pp.period_name,pp.period_start,pp.period_end,r.status,e.employee_code,coalesce(e.display_name,concat_ws(' ',e.first_name,e.last_name)) employee_name,ri.working_days,ri.paid_days,ri.lop_days,ri.gross_earnings,ri.total_deductions,ri.employer_contributions,ri.net_pay from public.payroll_run_items ri join public.payroll_runs r on r.id=ri.payroll_run_id join public.payroll_periods pp on pp.id=r.payroll_period_id join public.employees e on e.id=ri.employee_id where r.tenant_id=p_tenant_id and r.tenant_company_id=p_tenant_company_id and pp.period_start <= p_to_date and pp.period_end >= p_from_date and r.status in ('calculated','approved','posted','paid') order by pp.period_start desc,e.employee_code limit v_limit offset v_offset) x;
  elsif v_key = 'projects' then
    select coalesce(jsonb_agg(to_jsonb(x) order by x.created_at desc,x.title),'[]'::jsonb) into v_rows from (select w.id,w.wo_number,w.po_number,w.title,w.company_id,w.created_at,(select count(*) from public.tasks t where t.work_id=w.id and t.status in ('not_started','in_progress','blocked')) open_tasks,(select count(*) from public.tasks t where t.work_id=w.id and t.due_date < current_date and t.status not in ('completed','cancelled')) overdue_tasks,(select count(*) from public.issues i where i.work_id=w.id and i.status='open') open_issues,(select coalesce(sum(ti.total_amount),0) from public.tax_invoices ti where ti.work_id=w.id and ti.invoice_date between p_from_date and p_to_date and ti.status not in ('cancelled','void')) revenue,(select coalesce(sum(pb.total_amount),0) from public.purchase_bills pb where pb.work_id=w.id and pb.bill_date between p_from_date and p_to_date and pb.status not in ('cancelled','rejected')) procurement_cost,(select coalesce(sum(abs(l.line_value)),0) from public.inventory_stock_ledger_v l where l.work_id=w.id and l.transaction_date between p_from_date and p_to_date and l.quantity_out>0) material_issue_value from public.works w where w.tenant_id=p_tenant_id and w.tenant_company_id=p_tenant_company_id and w.created_at::date <= p_to_date order by w.created_at desc,w.title limit v_limit offset v_offset) x;
  else raise exception 'Unsupported report key: %',p_report_key using errcode='22023';
  end if;
  return jsonb_build_object('report_version','2','report_key',v_key,'tenant_id',p_tenant_id,'tenant_company_id',p_tenant_company_id,'from_date',p_from_date,'to_date',p_to_date,'limit',v_limit,'offset',v_offset,'rows',v_rows,'generated_at',clock_timestamp());
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_business_report_summary_atomic(p_tenant_id uuid, p_tenant_company_id uuid, p_from_date date, p_to_date date)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid(); v_sales jsonb; v_procurement jsonb; v_inventory jsonb; v_accounts jsonb; v_hr jsonb; v_projects jsonb; v_exec jsonb; v_v2 jsonb;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_tenant_id is null or p_tenant_company_id is null then raise exception 'Tenant and operating company are required'; end if;
  if p_from_date is null or p_to_date is null or p_from_date > p_to_date then raise exception 'Invalid reporting period'; end if;
  if not private.has_company_access(p_tenant_id,p_tenant_company_id) or not private.has_action_permission(p_tenant_id,'MANAGER') then raise exception 'Not authorized' using errcode='42501'; end if;
  select jsonb_build_object('quotation_count',count(*) filter(where q.quotation_date between p_from_date and p_to_date),'quotation_value',coalesce(sum(q.total_amount) filter(where q.quotation_date between p_from_date and p_to_date and q.status not in('cancelled','rejected')),0),'sales_order_count',(select count(*) from public.sales_orders so where so.tenant_id=p_tenant_id and so.tenant_company_id=p_tenant_company_id and so.order_date between p_from_date and p_to_date),'sales_order_value',(select coalesce(sum(so.total_amount),0) from public.sales_orders so where so.tenant_id=p_tenant_id and so.tenant_company_id=p_tenant_company_id and so.order_date between p_from_date and p_to_date and so.status not in('cancelled','rejected')),'invoice_count',(select count(*) from public.tax_invoices ti where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.invoice_date between p_from_date and p_to_date),'invoice_value',(select coalesce(sum(ti.total_amount),0) from public.tax_invoices ti where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.invoice_date between p_from_date and p_to_date and ti.status not in('cancelled','void')),'collected_value',(select coalesce(sum(sp.amount),0) from public.sales_payments sp join public.tax_invoices ti on ti.id=sp.tax_invoice_id where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and sp.payment_date between p_from_date and p_to_date),'receivable_outstanding',(select coalesce(sum(greatest(ti.balance_due,0)),0) from public.tax_invoices ti where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.status not in('cancelled','void'))) into v_sales from public.sales_quotations q where q.tenant_id=p_tenant_id and q.tenant_company_id=p_tenant_company_id;
  select jsonb_build_object('purchase_request_count',(select count(*) from public.purchase_requests pr where pr.tenant_id=p_tenant_id and pr.tenant_company_id=p_tenant_company_id and pr.request_date between p_from_date and p_to_date),'purchase_order_count',(select count(*) from public.purchase_orders po where po.tenant_id=p_tenant_id and po.tenant_company_id=p_tenant_company_id and po.po_date between p_from_date and p_to_date),'purchase_order_value',(select coalesce(sum(po.total_amount),0) from public.purchase_orders po where po.tenant_id=p_tenant_id and po.tenant_company_id=p_tenant_company_id and po.po_date between p_from_date and p_to_date and po.status not in('cancelled','rejected')),'grn_count',(select count(*) from public.goods_received_notes grn where grn.tenant_id=p_tenant_id and grn.tenant_company_id=p_tenant_company_id and grn.grn_date between p_from_date and p_to_date),'purchase_bill_count',(select count(*) from public.purchase_bills pb where pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.bill_date between p_from_date and p_to_date),'purchase_bill_value',(select coalesce(sum(pb.total_amount),0) from public.purchase_bills pb where pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.bill_date between p_from_date and p_to_date and pb.status not in('cancelled','rejected')),'payable_outstanding',(select coalesce(sum(greatest(pb.balance_due,0)),0) from public.purchase_bills pb where pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.status not in('cancelled','rejected'))) into v_procurement;
  select jsonb_build_object('stock_value',coalesce(sum(v.stock_value),0),'low_stock_count',count(*) filter(where v.is_low_stock),'available_quantity_value',coalesce(sum(v.available_quantity*v.average_unit_cost),0),'reconciliation_variance_count',(select count(*) from public.inventory_reconciliation_v r where r.tenant_company_id=p_tenant_company_id and r.variance_quantity<>0),'movement_value',(select coalesce(sum(abs(l.line_value)),0) from public.inventory_stock_ledger_v l where l.tenant_id=p_tenant_id and l.tenant_company_id=p_tenant_company_id and l.transaction_date between p_from_date and p_to_date)) into v_inventory from public.inventory_control_stock_v v where v.tenant_id=p_tenant_id and v.tenant_company_id=p_tenant_company_id;
  select jsonb_build_object('posted_debit',coalesce(sum(jl.debit) filter(where je.entry_date between p_from_date and p_to_date),0),'posted_credit',coalesce(sum(jl.credit) filter(where je.entry_date between p_from_date and p_to_date),0),'trial_balance_difference',coalesce(sum(jl.debit) filter(where je.entry_date<=p_to_date),0)-coalesce(sum(jl.credit) filter(where je.entry_date<=p_to_date),0),'income',coalesce(sum(jl.credit-jl.debit) filter(where je.entry_date between p_from_date and p_to_date and lower(coalesce(coa.account_type,'')) in('income','revenue')),0),'expenses',coalesce(sum(jl.debit-jl.credit) filter(where je.entry_date between p_from_date and p_to_date and lower(coalesce(coa.account_type,'')) in('expense','expenses')),0),'bank_unreconciled_count',(select count(*) from public.accounting_bank_transactions bt where bt.tenant_id=p_tenant_id and bt.tenant_company_id=p_tenant_company_id and bt.transaction_date<=p_to_date and bt.reconciliation_status='unreconciled')) into v_accounts from public.accounting_journal_lines jl join public.accounting_journal_entries je on je.id=jl.journal_entry_id left join public.chart_of_accounts coa on coa.id=jl.account_id where je.tenant_id=p_tenant_id and je.tenant_company_id=p_tenant_company_id and je.status='posted';
  select jsonb_build_object('active_headcount',count(*) filter(where e.employment_status='active'),'joined_in_period',count(*) filter(where e.joining_date between p_from_date and p_to_date),'exited_in_period',count(*) filter(where e.exit_date between p_from_date and p_to_date),'attendance_present_days',(select count(*) from public.attendance_daily_records a where a.tenant_id=p_tenant_id and a.tenant_company_id=p_tenant_company_id and a.attendance_date between p_from_date and p_to_date and(a.is_full_day=true or lower(coalesce(a.status,''))='present')),'attendance_half_days',(select count(*) from public.attendance_daily_records a where a.tenant_id=p_tenant_id and a.tenant_company_id=p_tenant_company_id and a.attendance_date between p_from_date and p_to_date and a.is_half_day=true),'leave_requests',(select count(*) from public.leave_requests lr where lr.tenant_id=p_tenant_id and lr.tenant_company_id=p_tenant_company_id and lr.from_date<=p_to_date and lr.to_date>=p_from_date),'approved_leave_days',(select coalesce(sum(lrd.approved_days),0) from public.leave_request_days lrd join public.leave_requests lr on lr.id=lrd.leave_request_id where lr.tenant_id=p_tenant_id and lr.tenant_company_id=p_tenant_company_id and lrd.leave_date between p_from_date and p_to_date and lr.status='approved'),'payroll_net',(select coalesce(sum(ri.net_pay),0) from public.payroll_run_items ri join public.payroll_runs r on r.id=ri.payroll_run_id join public.payroll_periods pp on pp.id=r.payroll_period_id where r.tenant_id=p_tenant_id and r.tenant_company_id=p_tenant_company_id and pp.period_start<=p_to_date and pp.period_end>=p_from_date and r.status in('calculated','approved','posted','paid'))) into v_hr from public.employees e where e.tenant_id=p_tenant_id and e.tenant_company_id=p_tenant_company_id;
  select jsonb_build_object('project_count',count(*),'projects_created_in_period',count(*) filter(where w.created_at::date between p_from_date and p_to_date),'open_tasks',(select count(*) from public.tasks t where t.tenant_id=p_tenant_id and t.tenant_company_id=p_tenant_company_id and t.status in('not_started','in_progress','blocked')),'overdue_tasks',(select count(*) from public.tasks t where t.tenant_id=p_tenant_id and t.tenant_company_id=p_tenant_company_id and t.due_date<current_date and t.status not in('completed','cancelled')),'open_issues',(select count(*) from public.issues i where i.tenant_id=p_tenant_id and i.tenant_company_id=p_tenant_company_id and i.status='open'),'project_revenue',(select coalesce(sum(ti.total_amount),0) from public.tax_invoices ti where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.work_id is not null and ti.invoice_date between p_from_date and p_to_date and ti.status not in('cancelled','void')),'project_procurement_cost',(select coalesce(sum(pb.total_amount),0) from public.purchase_bills pb where pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.work_id is not null and pb.bill_date between p_from_date and p_to_date and pb.status not in('cancelled','rejected')),'project_material_issue_value',(select coalesce(sum(abs(l.line_value)),0) from public.inventory_stock_ledger_v l where l.tenant_id=p_tenant_id and l.tenant_company_id=p_tenant_company_id and l.work_id is not null and l.transaction_date between p_from_date and p_to_date and l.quantity_out>0)) into v_projects from public.works w where w.tenant_id=p_tenant_id and w.tenant_company_id=p_tenant_company_id;
  select jsonb_build_object('revenue',v_sales->'invoice_value','collections',v_sales->'collected_value','receivables',v_sales->'receivable_outstanding','purchase_commitment',v_procurement->'purchase_order_value','payables',v_procurement->'payable_outstanding','stock_value',v_inventory->'stock_value','active_headcount',v_hr->'active_headcount','open_tasks',v_projects->'open_tasks','overdue_tasks',v_projects->'overdue_tasks','open_issues',v_projects->'open_issues') into v_exec;
  select jsonb_build_object(
    'profit_loss_income',v_accounts->'income','profit_loss_expenses',v_accounts->'expenses','profit_loss_net',coalesce((v_accounts->>'income')::numeric,0)-coalesce((v_accounts->>'expenses')::numeric,0),
    'receivables_current',(select coalesce(sum(greatest(ti.balance_due,0)),0) from public.tax_invoices ti where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.status not in('cancelled','void') and ti.due_date>=current_date),
    'receivables_overdue',(select coalesce(sum(greatest(ti.balance_due,0)),0) from public.tax_invoices ti where ti.tenant_id=p_tenant_id and ti.tenant_company_id=p_tenant_company_id and ti.status not in('cancelled','void') and ti.due_date<current_date),
    'payables_current',(select coalesce(sum(greatest(pb.balance_due,0)),0) from public.purchase_bills pb where pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.status not in('cancelled','rejected') and pb.due_date>=current_date),
    'payables_overdue',(select coalesce(sum(greatest(pb.balance_due,0)),0) from public.purchase_bills pb where pb.tenant_id=p_tenant_id and pb.tenant_company_id=p_tenant_company_id and pb.status not in('cancelled','rejected') and pb.due_date<current_date),
    'project_gross_contribution',coalesce((v_projects->>'project_revenue')::numeric,0)-coalesce((v_projects->>'project_procurement_cost')::numeric,0)-coalesce((v_projects->>'project_material_issue_value')::numeric,0)
  ) into v_v2;
  return jsonb_build_object('report_version','2','tenant_id',p_tenant_id,'tenant_company_id',p_tenant_company_id,'from_date',p_from_date,'to_date',p_to_date,'executive',v_exec,'sales',v_sales,'procurement',v_procurement,'inventory',v_inventory,'accounts',v_accounts,'hr',v_hr,'projects',v_projects,'management_v2',v_v2,'generated_at',clock_timestamp());
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_my_profile_atomic()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_profile jsonb;
  v_tenant jsonb;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select to_jsonb(p)
  into v_profile
  from public.profiles p
  where p.id = v_uid;

  if v_profile is null then
    raise exception 'User profile not found';
  end if;

  select jsonb_build_object(
    'tenant_id', tm.tenant_id,
    'tenant_role', tm.role,
    'membership_status', tm.status,
    'tenant_name', t.name
  )
  into v_tenant
  from public.tenant_memberships tm
  left join public.tenants t on t.id = tm.tenant_id
  where tm.user_id = v_uid
    and coalesce(tm.status, 'ACTIVE') in ('ACTIVE','active')
  order by tm.created_at asc
  limit 1;

  return jsonb_build_object(
    'profile', v_profile,
    'membership', coalesce(v_tenant, '{}'::jsonb)
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_owner_company_settings_audit(p_tenant_company_id uuid, p_limit integer DEFAULT 100)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_tenant uuid; v_limit integer:=greatest(1,least(coalesce(p_limit,100),500));
begin
  select tenant_id into v_tenant from public.tenant_companies where id=p_tenant_company_id and status<>'archived';
  if v_tenant is null or not private.has_action_permission(v_tenant,'OWNER') then
    raise exception 'not authorized';
  end if;
  return coalesce((
    select jsonb_agg(to_jsonb(a) order by a.created_at desc)
    from (
      select * from public.company_settings_audit
      where tenant_company_id=p_tenant_company_id
      order by created_at desc
      limit v_limit
    ) a
  ),'[]'::jsonb);
end
$function$
;

CREATE OR REPLACE FUNCTION public.get_owner_company_settings(p_tenant_company_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_tenant uuid; v_result jsonb;
begin
 select tenant_id into v_tenant from public.tenant_companies where id=p_tenant_company_id and status<>'archived';
 if v_tenant is null or not private.has_action_permission(v_tenant,'OWNER') then raise exception 'not authorized'; end if;
 select jsonb_build_object(
  'tenant_company',to_jsonb(tc),
  'profile',coalesce((select to_jsonb(x) from public.company_profiles x where x.tenant_company_id=tc.id),'{}'::jsonb),
  'registrations',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.company_registrations x where x.tenant_company_id=tc.id),'[]'::jsonb),
  'addresses',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.company_addresses x where x.tenant_company_id=tc.id and x.is_active),'[]'::jsonb),
  'contacts',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.company_contacts x where x.tenant_company_id=tc.id and x.is_active),'[]'::jsonb),
  'banks',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at) from public.company_bank_profiles x where x.tenant_company_id=tc.id and x.is_active),'[]'::jsonb),
  'branding',coalesce((select to_jsonb(x) from public.company_branding x where x.tenant_company_id=tc.id),'{}'::jsonb),
  'settings',coalesce((select to_jsonb(x) from public.company_settings x where x.tenant_company_id=tc.id),'{}'::jsonb),
  'documents',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.company_documents x where x.tenant_company_id=tc.id and x.is_archived=false and x.is_current=true),'[]'::jsonb)
 ) into v_result from public.tenant_companies tc where tc.id=p_tenant_company_id;
 return v_result;
end $function$
;

CREATE OR REPLACE FUNCTION public.get_payroll_accounting_e2e_integrity_atomic(p_tenant_id uuid, p_tenant_company_id uuid, p_payroll_run_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 v_uid uuid:=auth.uid(); r public.payroll_runs%rowtype; p public.payroll_periods%rowtype;
 v_item_count int:=0; v_net numeric:=0; v_accounting_count int:=0; v_journal_id uuid; v_journal_status text; v_journal_debit numeric:=0; v_journal_credit numeric:=0;
 v_batch_count int:=0; v_batch_status text; v_batch_total numeric:=0; v_batch_items_total numeric:=0; v_bank_tx_count int:=0; v_recon_count int:=0; v_reconciled_amount numeric:=0;
 v_result jsonb;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if p_tenant_id is null or p_tenant_company_id is null or p_payroll_run_id is null then raise exception 'Tenant, operating company and payroll run are required'; end if;
 if not private.has_action_permission(p_tenant_id,'MANAGER') or not private.has_company_access(p_tenant_id,p_tenant_company_id) then raise exception 'Not authorized' using errcode='42501'; end if;
 select * into r from public.payroll_runs where id=p_payroll_run_id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id;
 if not found then raise exception 'PAYROLL_RUN_NOT_FOUND'; end if;
 select * into p from public.payroll_periods where id=r.payroll_period_id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id;
 if not found then raise exception 'PAYROLL_PERIOD_NOT_FOUND'; end if;
 select count(*),coalesce(sum(net_pay),0) into v_item_count,v_net from public.payroll_run_items where payroll_run_id=r.id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id;
 select count(*),max(journal_entry_id) into v_accounting_count,v_journal_id from public.payroll_run_accounting where payroll_run_id=r.id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id;
 if v_journal_id is not null then select status into v_journal_status from public.accounting_journal_entries where id=v_journal_id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id; select coalesce(sum(debit),0),coalesce(sum(credit),0) into v_journal_debit,v_journal_credit from public.accounting_journal_lines where journal_entry_id=v_journal_id; end if;
 select count(*),max(status),coalesce(max(total_amount),0) into v_batch_count,v_batch_status,v_batch_total from public.payroll_payment_batches where payroll_run_id=r.id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id and status<>'cancelled';
 if v_batch_count=1 then select coalesce(sum(amount),0) into v_batch_items_total from public.payroll_payment_items i where i.payment_batch_id=(select id from public.payroll_payment_batches where payroll_run_id=r.id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id and status<>'cancelled' limit 1); select count(*),coalesce(sum(pr.matched_amount),0) into v_recon_count,v_reconciled_amount from public.payroll_payment_reconciliations pr where pr.payroll_payment_batch_id=(select id from public.payroll_payment_batches where payroll_run_id=r.id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id and status<>'cancelled' limit 1) and pr.status='matched'; select count(*) into v_bank_tx_count from public.accounting_bank_transactions bt where bt.payroll_payment_batch_id=(select id from public.payroll_payment_batches where payroll_run_id=r.id and tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id and status<>'cancelled' limit 1) and bt.tenant_id=p_tenant_id and bt.tenant_company_id=p_tenant_company_id; end if;
 v_result:=jsonb_build_object('report_version',1,'report_key','payroll_accounting_e2e_integrity','payroll_run_id',r.id,'payroll_run_status',r.status,'payroll_period_code',p.period_code,'item_count',v_item_count,'net_pay',round(v_net,2),'accounting',jsonb_build_object('link_count',v_accounting_count,'journal_entry_id',v_journal_id,'journal_status',v_journal_status,'debit',round(v_journal_debit,2),'credit',round(v_journal_credit,2),'is_balanced',v_journal_id is not null and v_journal_status='posted' and round(v_journal_debit,2)=round(v_journal_credit,2)),'payment',jsonb_build_object('batch_count',v_batch_count,'batch_status',v_batch_status,'batch_total',round(v_batch_total,2),'payment_items_total',round(v_batch_items_total,2),'bank_transaction_count',v_bank_tx_count,'matched_reconciliation_count',v_recon_count,'matched_amount',round(v_reconciled_amount,2),'payment_total_matches_payroll',v_batch_count=1 and round(v_batch_total,2)=round(v_net,2) and round(v_batch_items_total,2)=round(v_net,2),'fully_reconciled',v_batch_count=1 and v_bank_tx_count=1 and v_recon_count=v_item_count and round(v_reconciled_amount,2)=round(v_net,2)),'e2e_integrity',v_item_count>0 and v_accounting_count=1 and v_journal_status='posted' and round(v_journal_debit,2)=round(v_journal_credit,2) and v_batch_count=1 and round(v_batch_total,2)=round(v_net,2) and round(v_batch_items_total,2)=round(v_net,2) and v_bank_tx_count=1,'generated_at',now());
 return v_result;
end;$function$
;

CREATE OR REPLACE FUNCTION public.get_payroll_dashboard_summary_atomic(p_tenant_id uuid, p_tenant_company_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_runs jsonb; v_payments jsonb; v_stat jsonb; v_recon jsonb; v_totals jsonb;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if not private.has_company_access(p_tenant_id,p_tenant_company_id) or not private.has_action_permission(p_tenant_id,'MANAGER') then raise exception 'Not authorized'; end if;
 select jsonb_build_object('draft',count(*) filter(where status='draft'),'calculating',count(*) filter(where status='calculating'),'calculated',count(*) filter(where status='calculated'),'pending_approval',count(*) filter(where status='pending_approval'),'approved',count(*) filter(where status='approved'),'posted',count(*) filter(where status='posted'),'paid',count(*) filter(where status='paid'),'failed',count(*) filter(where status='failed')) into v_runs from public.payroll_runs where tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id;
 select jsonb_build_object('draft',count(*) filter(where status='draft'),'pending_approval',count(*) filter(where status='pending_approval'),'approved',count(*) filter(where status='approved'),'paid',count(*) filter(where status='paid'),'failed',count(*) filter(where status='failed'),'cancelled',count(*) filter(where status='cancelled'),'total_amount',coalesce(sum(total_amount) filter(where status<>'cancelled'),0)) into v_payments from public.payroll_payment_batches where tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id;
 select jsonb_build_object('exported',count(*) filter(where status='exported'),'paid',count(*) filter(where status='paid'),'failed',count(*) filter(where status='failed'),'outstanding_amount',coalesce(sum(total_amount) filter(where status in ('exported','draft')),0)) into v_stat from public.payroll_statutory_settlements where tenant_id=p_tenant_id and tenant_company_id=p_tenant_company_id;
 select jsonb_build_object('unreconciled',coalesce((select count(*) from public.accounting_bank_transactions b where b.tenant_id=p_tenant_id and b.tenant_company_id=p_tenant_company_id and b.payroll_payment_batch_id is not null and b.reconciliation_status='unreconciled'),0),'reconciled',coalesce((select count(*) from public.accounting_bank_transactions b where b.tenant_id=p_tenant_id and b.tenant_company_id=p_tenant_company_id and b.payroll_payment_batch_id is not null and b.reconciliation_status='reconciled'),0),'failed_items',coalesce((select count(*) from public.payroll_payment_items i where i.tenant_id=p_tenant_id and i.tenant_company_id=p_tenant_company_id and i.payment_status='failed'),0)) into v_recon;
 select jsonb_build_object('gross_payroll',coalesce(sum(x.gross_earnings),0),'net_payroll',coalesce(sum(x.net_pay),0),'employer_contributions',coalesce(sum(x.employer_contributions),0),'tds',coalesce(sum(x.tds),0)) into v_totals from (select ri.id,ri.gross_earnings,ri.net_pay,ri.employer_contributions,coalesce((select sum(rc.amount) from public.payroll_run_item_components rc join public.payroll_components c on c.id=rc.payroll_component_id where rc.payroll_run_item_id=ri.id and upper(c.code)='TDS'),0) tds from public.payroll_runs r join public.payroll_run_items ri on ri.payroll_run_id=r.id where r.tenant_id=p_tenant_id and r.tenant_company_id=p_tenant_company_id and r.status in ('posted','paid')) x;
 return jsonb_build_object('runs',v_runs,'payments',v_payments,'statutory',v_stat,'reconciliation',v_recon,'totals',v_totals);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'guest');
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.issue_inventory_against_reservation_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_company_id uuid;
  v_reservation_id uuid;
  v_idempotency_key text;
  v_request_hash text := md5(p_payload::text);
  v_tenant_id uuid;
  v_reservation record;
  v_line jsonb;
  v_rl record;
  v_soi record;
  v_qty numeric;
  v_active_reserved numeric;
  v_issued numeric;
  v_issue_lines jsonb := '[]'::jsonb;
  v_tx jsonb;
  v_tx_id uuid;
  v_tx_no text;
  v_existing record;
  v_fulfilment record;
  v_remaining boolean;
  v_first_location uuid;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then raise exception 'Invalid issue payload'; end if;

  v_company_id := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_reservation_id := nullif(p_payload->>'reservation_id','')::uuid;
  v_idempotency_key := nullif(trim(p_payload->>'idempotency_key'),'');
  if v_company_id is null or v_reservation_id is null or v_idempotency_key is null then
    raise exception 'tenant_company_id, reservation_id and idempotency_key are required';
  end if;
  if jsonb_typeof(p_payload->'lines') <> 'array' or jsonb_array_length(p_payload->'lines') = 0 then
    raise exception 'At least one issue line is required';
  end if;
  if (select count(*) from jsonb_array_elements(p_payload->'lines')) <>
     (select count(distinct value->>'reservation_line_id') from jsonb_array_elements(p_payload->'lines')) then
    raise exception 'Duplicate reservation line in issue request';
  end if;

  select tc.tenant_id into v_tenant_id
  from public.tenant_companies tc
  where tc.id = v_company_id and tc.status = 'active';
  if v_tenant_id is null then raise exception 'Active tenant company not found'; end if;
  if not (select private.has_company_access(v_tenant_id,v_company_id)) then raise exception 'Company access denied'; end if;
  if not (select private.has_action_permission(v_tenant_id,'TEAM')) then raise exception 'Insufficient permission to issue inventory'; end if;

  select r.* into v_reservation
  from public.inventory_reservations r
  where r.id = v_reservation_id
    and r.tenant_id = v_tenant_id
    and r.tenant_company_id = v_company_id
  for update;
  if not found then raise exception 'Reservation not found for selected company'; end if;
  if v_reservation.status in ('released','cancelled','fulfilled') then raise exception 'Reservation is not eligible for issue'; end if;

  select * into v_existing
  from public.inventory_transactions t
  where t.tenant_company_id = v_company_id and t.idempotency_key = v_idempotency_key
  limit 1;
  if found then
    if v_existing.request_hash <> v_request_hash then raise exception 'Idempotency key was already used with a different request'; end if;
    return jsonb_build_object(
      'transaction_id',v_existing.id,
      'transaction_no',v_existing.transaction_no,
      'reservation_id',v_reservation_id,
      'status',v_reservation.status,
      'idempotent_replay',true
    );
  end if;

  -- Validate every reservation line first. A single inventory transaction can only have one source location.
  for v_line in select value from jsonb_array_elements(p_payload->'lines') loop
    v_qty := nullif(v_line->>'quantity','')::numeric;
    if v_qty is null or v_qty <= 0 then raise exception 'Issue quantity must be greater than zero'; end if;

    select * into v_rl
    from public.inventory_reservation_lines rl
    where rl.id = nullif(v_line->>'reservation_line_id','')::uuid
      and rl.reservation_id = v_reservation_id
      and rl.tenant_id = v_tenant_id
      and rl.tenant_company_id = v_company_id
    for update;
    if not found then raise exception 'Reservation line not found'; end if;

    if v_first_location is null then
      v_first_location := v_rl.location_id;
    elsif v_first_location <> v_rl.location_id then
      raise exception 'All issue lines in one transaction must use the same stock location';
    end if;

    v_active_reserved := v_rl.reserved_quantity - v_rl.released_quantity - v_rl.issued_quantity;
    if v_active_reserved <= 0 then raise exception 'Reservation line has no remaining quantity available to issue'; end if;
    if v_qty > v_active_reserved then raise exception 'Issue quantity exceeds remaining reserved quantity'; end if;

    select soi.* into v_soi
    from public.sales_order_items soi
    where soi.id = v_rl.sales_order_item_id
      and soi.sales_order_id = v_reservation.sales_order_id
      and soi.tenant_id = v_tenant_id
      and soi.tenant_company_id = v_company_id
    for update;
    if not found then raise exception 'Sales order item not found'; end if;

    -- Protect the ordered quantity using authoritative reservation-line issue state plus any other reservation lines for the same SO item.
    select coalesce(sum(rl2.issued_quantity),0)
      into v_issued
    from public.inventory_reservation_lines rl2
    where rl2.sales_order_item_id = v_rl.sales_order_item_id
      and rl2.tenant_id = v_tenant_id
      and rl2.tenant_company_id = v_company_id;
    if v_issued + v_qty > v_soi.quantity then raise exception 'Issue quantity exceeds ordered quantity'; end if;

    v_issue_lines := v_issue_lines || jsonb_build_array(
      jsonb_build_object(
        'item_id',v_rl.inventory_item_id,
        'quantity',v_qty,
        'lot_number',v_rl.lot_number,
        'notes',coalesce(nullif(v_line->>'notes',''),'Sales Order reservation issue')
      )
    );
  end loop;

  v_tx := public.post_inventory_transaction_atomic(jsonb_build_object(
    'tenant_company_id',v_company_id,
    'transaction_type','issue',
    'transaction_date',coalesce(nullif(p_payload->>'transaction_date','')::date,current_date),
    'from_location_id',v_first_location,
    'to_location_id',null,
    'work_id',(select so.work_id from public.sales_orders so where so.id=v_reservation.sales_order_id),
    'source_type','sales_order_reservation',
    'source_id',v_reservation_id,
    'reference_no',coalesce(nullif(p_payload->>'reference_no',''),(select so.order_no from public.sales_orders so where so.id=v_reservation.sales_order_id)),
    'notes',nullif(p_payload->>'notes',''),
    'idempotency_key',v_idempotency_key,
    'lines',v_issue_lines
  ));
  v_tx_id := (v_tx->>'id')::uuid;
  v_tx_no := v_tx->>'transaction_no';

  -- The reservation line is the authoritative lifecycle quantity. Fulfilment is the operational projection/audit view.
  for v_line in select value from jsonb_array_elements(p_payload->'lines') loop
    v_qty := nullif(v_line->>'quantity','')::numeric;

    select * into v_rl
    from public.inventory_reservation_lines rl
    where rl.id = (v_line->>'reservation_line_id')::uuid
      and rl.reservation_id = v_reservation_id
      and rl.tenant_id = v_tenant_id
      and rl.tenant_company_id = v_company_id
    for update;
    if not found then raise exception 'Reservation line not found during issue commit'; end if;

    update public.inventory_reservation_lines
    set issued_quantity = issued_quantity + v_qty,
        status = case
          when issued_quantity + v_qty >= reserved_quantity - released_quantity then 'fulfilled'
          else 'active'
        end,
        updated_at = now()
    where id = v_rl.id;

    select * into v_fulfilment
    from public.inventory_fulfilment_lines fl
    where fl.tenant_company_id = v_company_id
      and fl.sales_order_item_id = v_rl.sales_order_item_id
      and fl.inventory_item_id = v_rl.inventory_item_id
      and fl.location_id = v_rl.location_id
      and fl.lot_number is not distinct from v_rl.lot_number
    for update;

    if found then
      update public.inventory_fulfilment_lines
      set issued_quantity = issued_quantity + v_qty,
          reserved_quantity = greatest(reserved_quantity,v_rl.reserved_quantity),
          inventory_transaction_id = coalesce(inventory_transaction_id,v_tx_id),
          last_inventory_transaction_id = v_tx_id,
          updated_at = now()
      where id = v_fulfilment.id;
    else
      insert into public.inventory_fulfilment_lines(
        tenant_id,tenant_company_id,sales_order_item_id,inventory_item_id,location_id,lot_number,
        ordered_quantity,reserved_quantity,issued_quantity,inventory_transaction_id,last_inventory_transaction_id
      )
      select v_tenant_id,v_company_id,v_rl.sales_order_item_id,v_rl.inventory_item_id,v_rl.location_id,v_rl.lot_number,
             soi.quantity,v_rl.reserved_quantity,v_qty,v_tx_id,v_tx_id
      from public.sales_order_items soi
      where soi.id = v_rl.sales_order_item_id;
    end if;
  end loop;

  select exists(
    select 1
    from public.inventory_reservation_lines rl
    where rl.reservation_id = v_reservation_id
      and (rl.reserved_quantity - rl.released_quantity - rl.issued_quantity) > 0
  ) into v_remaining;

  if not v_remaining then
    update public.inventory_reservations
    set status='fulfilled',updated_at=now()
    where id=v_reservation_id;
  end if;

  return jsonb_build_object(
    'transaction_id',v_tx_id,
    'transaction_no',v_tx_no,
    'reservation_id',v_reservation_id,
    'status',(select status from public.inventory_reservations where id=v_reservation_id),
    'idempotent_replay',false
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.issue_tax_invoice_atomic(p_header_json jsonb, p_items_json jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE h public.tax_invoices%ROWTYPE; x jsonb; v_order public.sales_orders%ROWTYPE; v_tenant uuid; v_tc uuid; v_company uuid; v_no text; v_date date:=COALESCE((p_header_json->>'invoice_date')::date,CURRENT_DATE); v_fy text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF (p_header_json->>'sales_order_id') IS NOT NULL AND (p_header_json->>'sales_order_id') <> '' THEN
    SELECT * INTO v_order FROM public.sales_orders WHERE id=(p_header_json->>'sales_order_id')::uuid FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Sales order not found'; END IF;
    v_tenant:=v_order.tenant_id; v_tc:=v_order.tenant_company_id; v_company:=v_order.company_id;
  ELSE
    v_tenant:=(p_header_json->>'tenant_id')::uuid; v_tc:=(p_header_json->>'tenant_company_id')::uuid; v_company:=(p_header_json->>'company_id')::uuid;
  END IF;
  IF NOT private.has_action_permission(v_tenant,'MANAGER') OR NOT private.has_company_access(v_tenant,v_tc) THEN RAISE EXCEPTION 'Tax invoice issuance denied'; END IF;
  v_fy:=CASE WHEN EXTRACT(MONTH FROM v_date)>=4 THEN EXTRACT(YEAR FROM v_date)::int::text || '-' || (EXTRACT(YEAR FROM v_date)::int+1)::text ELSE (EXTRACT(YEAR FROM v_date)::int-1)::text || '-' || EXTRACT(YEAR FROM v_date)::int::text END;
  v_no:=private.get_next_sales_doc_number(v_tenant,v_tc,'TAX_INVOICE',v_fy);
  INSERT INTO public.tax_invoices(tenant_id,tenant_company_id,invoice_no,invoice_date,customer_name,sales_order_id,proforma_invoice_id,status,currency_code,subtotal,tax_amount,total_amount,notes,created_by,quotation_id,company_id,enquiry_id,work_id,due_date,customer_gstin,place_of_supply,reverse_charge,cgst_amount,sgst_amount,igst_amount,amount_paid,balance_due,terms_and_conditions)
  VALUES(v_tenant,v_tc,v_no,v_date,COALESCE(p_header_json->>'customer_name',COALESCE(v_order.customer_name,'')),NULLIF(p_header_json->>'sales_order_id','')::uuid,NULLIF(p_header_json->>'proforma_invoice_id','')::uuid,'issued',COALESCE(p_header_json->>'currency_code',COALESCE(v_order.currency_code,'INR')),0,0,0,p_header_json->>'notes',auth.uid(),NULLIF(p_header_json->>'quotation_id','')::uuid,v_company,NULLIF(p_header_json->>'enquiry_id','')::uuid,NULLIF(p_header_json->>'work_id','')::uuid,NULLIF(p_header_json->>'due_date','')::date,p_header_json->>'customer_gstin',p_header_json->>'place_of_supply',COALESCE((p_header_json->>'reverse_charge')::boolean,false),0,0,0,0,0,p_header_json->>'terms_and_conditions') RETURNING * INTO h;
  FOR x IN SELECT * FROM jsonb_array_elements(COALESCE(p_items_json,'[]'::jsonb)) LOOP
    INSERT INTO public.tax_invoice_items(tenant_id,tenant_company_id,tax_invoice_id,item_description,hsn_sac_code,quantity,unit_price,taxable_value,gst_rate_pct,cgst_rate,sgst_rate,igst_rate,cgst_amount,sgst_amount,igst_amount,line_total)
    VALUES(v_tenant,v_tc,h.id,COALESCE(x->>'item_description',''),x->>'hsn_sac_code',COALESCE((x->>'quantity')::numeric,1),COALESCE((x->>'unit_price')::numeric,0),COALESCE((x->>'taxable_value')::numeric,0),COALESCE((x->>'gst_rate_pct')::numeric,0),COALESCE((x->>'cgst_rate')::numeric,0),COALESCE((x->>'sgst_rate')::numeric,0),COALESCE((x->>'igst_rate')::numeric,0),COALESCE((x->>'cgst_amount')::numeric,0),COALESCE((x->>'sgst_amount')::numeric,0),COALESCE((x->>'igst_amount')::numeric,0),COALESCE((x->>'line_total')::numeric,COALESCE((x->>'taxable_value')::numeric,0)+COALESCE((x->>'cgst_amount')::numeric,0)+COALESCE((x->>'sgst_amount')::numeric,0)+COALESCE((x->>'igst_amount')::numeric,0)));
  END LOOP;
  UPDATE public.tax_invoices i SET subtotal=s.subtotal,tax_amount=s.tax_amount,total_amount=s.total_amount,cgst_amount=s.cgst,sgst_amount=s.sgst,igst_amount=s.igst,balance_due=s.total_amount,updated_at=now() FROM (SELECT COALESCE(sum(taxable_value),0) subtotal,COALESCE(sum(cgst_amount+sgst_amount+igst_amount),0) tax_amount,COALESCE(sum(line_total),0) total_amount,COALESCE(sum(cgst_amount),0) cgst,COALESCE(sum(sgst_amount),0) sgst,COALESCE(sum(igst_amount),0) igst FROM public.tax_invoice_items WHERE tax_invoice_id=h.id) s WHERE i.id=h.id RETURNING i.* INTO h;
  IF v_order.id IS NOT NULL THEN UPDATE public.sales_orders SET status='invoiced',updated_at=now() WHERE id=v_order.id; END IF;
  RETURN to_jsonb(h);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.issue_tax_invoice_with_accounting_atomic(p_header_json jsonb, p_items_json jsonb, p_accounting_json jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_result jsonb;
  v_invoice public.tax_invoices%rowtype;
  v_journal jsonb;
  v_accounting jsonb := coalesce(p_accounting_json,'{}'::jsonb);
  v_subtotal numeric := 0;
  v_tax numeric := 0;
  v_total numeric := 0;
  v_cgst numeric := 0;
  v_sgst numeric := 0;
  v_igst numeric := 0;
  v_ar uuid;
  v_rev uuid;
  v_cgst_acc uuid;
  v_sgst_acc uuid;
  v_igst_acc uuid;
  v_lines jsonb := '[]'::jsonb;
  v_idem text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if coalesce((v_accounting->>'post_accounting')::boolean,false) is not true then
    raise exception 'ACCOUNTING_REQUIRED_FOR_TAX_INVOICE';
  end if;

  v_result := public.issue_tax_invoice_atomic(p_header_json,p_items_json);
  v_invoice := jsonb_populate_record(null::public.tax_invoices,v_result);

  v_subtotal := round(coalesce(v_invoice.subtotal,0),2);
  v_tax := round(coalesce(v_invoice.tax_amount,0),2);
  v_total := round(coalesce(v_invoice.total_amount,0),2);
  v_cgst := round(coalesce(v_invoice.cgst_amount,0),2);
  v_sgst := round(coalesce(v_invoice.sgst_amount,0),2);
  v_igst := round(coalesce(v_invoice.igst_amount,0),2);
  if v_total <= 0 then raise exception 'TAX_INVOICE_TOTAL_MUST_BE_GREATER_THAN_ZERO'; end if;
  if round(v_subtotal+v_tax,2) <> v_total then raise exception 'TAX_INVOICE_TOTAL_MISMATCH'; end if;

  v_ar := nullif(v_accounting->>'ar_account_id','')::uuid;
  v_rev := nullif(v_accounting->>'revenue_account_id','')::uuid;
  v_cgst_acc := nullif(v_accounting->>'cgst_account_id','')::uuid;
  v_sgst_acc := nullif(v_accounting->>'sgst_account_id','')::uuid;
  v_igst_acc := nullif(v_accounting->>'igst_account_id','')::uuid;

  if v_ar is null or v_rev is null then raise exception 'AR_AND_REVENUE_ACCOUNTS_REQUIRED'; end if;
  if v_cgst > 0 and v_cgst_acc is null then raise exception 'CGST_ACCOUNT_REQUIRED'; end if;
  if v_sgst > 0 and v_sgst_acc is null then raise exception 'SGST_ACCOUNT_REQUIRED'; end if;
  if v_igst > 0 and v_igst_acc is null then raise exception 'IGST_ACCOUNT_REQUIRED'; end if;

  if not exists(select 1 from public.chart_of_accounts where id=v_ar and tenant_id=v_invoice.tenant_id and tenant_company_id=v_invoice.tenant_company_id and is_active) then raise exception 'INVALID_AR_ACCOUNT'; end if;
  if not exists(select 1 from public.chart_of_accounts where id=v_rev and tenant_id=v_invoice.tenant_id and tenant_company_id=v_invoice.tenant_company_id and is_active) then raise exception 'INVALID_REVENUE_ACCOUNT'; end if;
  if v_cgst_acc is not null and not exists(select 1 from public.chart_of_accounts where id=v_cgst_acc and tenant_id=v_invoice.tenant_id and tenant_company_id=v_invoice.tenant_company_id and is_active) then raise exception 'INVALID_CGST_ACCOUNT'; end if;
  if v_sgst_acc is not null and not exists(select 1 from public.chart_of_accounts where id=v_sgst_acc and tenant_id=v_invoice.tenant_id and tenant_company_id=v_invoice.tenant_company_id and is_active) then raise exception 'INVALID_SGST_ACCOUNT'; end if;
  if v_igst_acc is not null and not exists(select 1 from public.chart_of_accounts where id=v_igst_acc and tenant_id=v_invoice.tenant_id and tenant_company_id=v_invoice.tenant_company_id and is_active) then raise exception 'INVALID_IGST_ACCOUNT'; end if;

  v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id',v_ar,'debit',v_total,'credit',0,'description','Accounts receivable - '||v_invoice.invoice_no,'party_type','customer'));
  if v_subtotal > 0 then v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id',v_rev,'debit',0,'credit',v_subtotal,'description','Sales revenue - '||v_invoice.invoice_no)); end if;
  if v_cgst > 0 then v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id',v_cgst_acc,'debit',0,'credit',v_cgst,'description','Output CGST - '||v_invoice.invoice_no)); end if;
  if v_sgst > 0 then v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id',v_sgst_acc,'debit',0,'credit',v_sgst,'description','Output SGST - '||v_invoice.invoice_no)); end if;
  if v_igst > 0 then v_lines := v_lines || jsonb_build_array(jsonb_build_object('account_id',v_igst_acc,'debit',0,'credit',v_igst,'description','Output IGST - '||v_invoice.invoice_no)); end if;

  if round(v_total,2) <> round(v_subtotal+v_cgst+v_sgst+v_igst,2) then raise exception 'SALES_INVOICE_ACCOUNTING_NOT_BALANCED'; end if;
  v_idem := coalesce(nullif(trim(v_accounting->>'idempotency_key'),''),'SALES-INVOICE-'||v_invoice.id::text);

  v_journal := public.post_journal_entry_atomic(jsonb_build_object(
    'tenant_id',v_invoice.tenant_id,
    'tenant_company_id',v_invoice.tenant_company_id,
    'entry_date',v_invoice.invoice_date,
    'voucher_type','SALES_INVOICE',
    'narration','Sales invoice '||v_invoice.invoice_no,
    'source_type','tax_invoice',
    'source_id',v_invoice.id,
    'idempotency_key',v_idem,
    'lines',v_lines
  ));

  return jsonb_build_object('invoice',v_result,'journal',v_journal,'accounting_posted',true);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.lock_fiscal_period_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_id uuid := nullif(p_payload->>'id','')::uuid;
  v_status text;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_id is null then raise exception 'Tenant, operating company and fiscal period are required'; end if;
  if not private.has_action_permission(v_tenant,'OWNER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  select status into v_status from public.accounting_fiscal_periods where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company for update;
  if not found then raise exception 'Fiscal period not found'; end if;
  if v_status <> 'closed' then raise exception 'Only a closed fiscal period can be locked'; end if;
  update public.accounting_fiscal_periods set status='locked', updated_at=now() where id=v_id;
  return jsonb_build_object('id',v_id,'status','locked');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.match_payroll_bank_transaction_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid:=nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid:=nullif(p_payload->>'tenant_company_id','')::uuid;
  v_tx_id uuid:=nullif(p_payload->>'bank_transaction_id','')::uuid;
  v_item_id uuid:=nullif(p_payload->>'payroll_payment_item_id','')::uuid;
  v_batch_id uuid:=nullif(p_payload->>'payroll_payment_batch_id','')::uuid;
  v_status text:=lower(coalesce(nullif(trim(p_payload->>'status'),''),'matched'));
  v_method text:=lower(coalesce(nullif(trim(p_payload->>'match_method'),''),'manual'));
  v_matched numeric(18,2):=coalesce(nullif(p_payload->>'matched_amount','')::numeric,0);
  v_tx public.accounting_bank_transactions%rowtype;
  v_item public.payroll_payment_items%rowtype;
  v_batch public.payroll_payment_batches%rowtype;
  v_existing uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_tx_id is null or v_item_id is null then raise exception 'Tenant, company, bank transaction and payroll payment item are required'; end if;
  if not private.has_company_access(v_tenant,v_company) or not private.has_action_permission(v_tenant,'MANAGER') then raise exception 'Not authorized'; end if;
  if v_status not in ('matched','partial','failed','exception') then raise exception 'Invalid reconciliation status'; end if;
  if v_method not in ('manual','reference','amount_date','batch') then raise exception 'Invalid match method'; end if;
  select * into v_tx from public.accounting_bank_transactions where id=v_tx_id and tenant_id=v_tenant and tenant_company_id=v_company for update;
  if not found then raise exception 'BANK_TRANSACTION_NOT_FOUND'; end if;
  select * into v_item from public.payroll_payment_items where id=v_item_id and tenant_id=v_tenant and tenant_company_id=v_company for update;
  if not found then raise exception 'PAYROLL_PAYMENT_ITEM_NOT_FOUND'; end if;
  select * into v_batch from public.payroll_payment_batches where id=v_item.payment_batch_id and tenant_id=v_tenant and tenant_company_id=v_company for update;
  if not found then raise exception 'PAYROLL_PAYMENT_BATCH_NOT_FOUND'; end if;
  if v_batch_id is not null and v_batch.id<>v_batch_id then raise exception 'PAYROLL_PAYMENT_BATCH_MISMATCH'; end if;
  if v_item.payment_batch_id<>v_batch.id then raise exception 'PAYMENT_ITEM_BATCH_MISMATCH'; end if;
  if v_tx.reconciliation_status='reconciled' and not exists(select 1 from public.payroll_payment_reconciliations r where r.bank_transaction_id=v_tx.id and r.tenant_company_id=v_company) then raise exception 'BANK_TRANSACTION_ALREADY_RECONCILED'; end if;
  select id into v_existing from public.payroll_payment_reconciliations where tenant_company_id=v_company and (bank_transaction_id=v_tx.id or payroll_payment_item_id=v_item.id) limit 1;
  if v_existing is not null then raise exception 'PAYROLL_PAYMENT_ALREADY_RECONCILED'; end if;
  if v_status='failed' then v_matched:=0; else if v_matched<=0 then v_matched:=least(round(v_tx.amount,2),round(v_item.amount,2)); end if; end if;
  if v_status in ('matched','partial') and v_matched>round(v_item.amount,2) then raise exception 'MATCHED_AMOUNT_EXCEEDS_PAYMENT_ITEM'; end if;
  if v_status='matched' and round(v_matched,2)<>round(v_item.amount,2) then raise exception 'MATCHED_STATUS_REQUIRES_FULL_AMOUNT'; end if;
  if v_status='partial' and (v_matched<=0 or round(v_matched,2)>=round(v_item.amount,2)) then raise exception 'PARTIAL_STATUS_REQUIRES_PARTIAL_AMOUNT'; end if;
  if v_status='matched' and round(v_tx.amount,2)<>round(v_matched,2) then raise exception 'BANK_TRANSACTION_AMOUNT_MISMATCH'; end if;
  insert into public.payroll_payment_reconciliations(tenant_id,tenant_company_id,payroll_payment_batch_id,payroll_payment_item_id,bank_transaction_id,matched_amount,status,match_method,external_reference,notes,created_by)
  values(v_tenant,v_company,v_batch.id,v_item.id,v_tx.id,round(v_matched,2),v_status,v_method,nullif(trim(p_payload->>'external_reference'),''),nullif(trim(p_payload->>'notes'),''),v_uid);
  update public.accounting_bank_transactions set payroll_payment_batch_id=v_batch.id,payroll_payment_item_id=v_item.id where id=v_tx.id;
  if v_status='matched' then
    perform public.reconcile_bank_transaction_atomic(jsonb_build_object('tenant_id',v_tenant,'tenant_company_id',v_company,'id',v_tx.id,'reconciliation_status','reconciled'));
    update public.payroll_payment_items set payment_status='paid',bank_reference_no=coalesce(nullif(trim(p_payload->>'external_reference'),''),bank_reference_no),paid_at=coalesce(paid_at,now()),updated_at=now() where id=v_item.id and payment_status in ('pending','processing');
  elsif v_status='failed' then
    update public.payroll_payment_items set payment_status='failed',failure_reason=nullif(trim(p_payload->>'notes'),''),updated_at=now() where id=v_item.id and payment_status in ('pending','processing');
  end if;
  update public.payroll_payment_batches set status=case when not exists(select 1 from public.payroll_payment_items i where i.payment_batch_id=v_batch.id and i.payment_status in ('pending','processing')) then case when exists(select 1 from public.payroll_payment_items i where i.payment_batch_id=v_batch.id and i.payment_status='paid') then 'paid' else 'failed' end else status end,updated_at=now() where id=v_batch.id;
  return jsonb_build_object('id',v_tx.id,'payment_item_id',v_item.id,'payment_batch_id',v_batch.id,'status',v_status,'matched_amount',round(v_matched,2));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.post_bank_transaction_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_bank uuid := nullif(p_payload->>'bank_account_id','')::uuid;
  v_contra uuid := nullif(p_payload->>'contra_account_id','')::uuid;
  v_date date := coalesce(nullif(p_payload->>'transaction_date','')::date,current_date);
  v_type text := lower(nullif(trim(p_payload->>'transaction_type'),''));
  v_amount numeric := nullif(p_payload->>'amount','')::numeric;
  v_idem text := nullif(trim(p_payload->>'idempotency_key'),'');
  v_period uuid;
  v_bank_account public.accounting_bank_accounts%rowtype;
  v_journal uuid;
  v_tx uuid;
  v_voucher text := coalesce(nullif(trim(p_payload->>'voucher_number'),''),'BANK-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'));
  v_debit_bank boolean;
  v_journal_payload jsonb;
  v_journal_result jsonb;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_bank is null or v_contra is null or v_idem is null then raise exception 'Tenant, company, bank account, contra account and idempotency key are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  if v_amount is null or v_amount <= 0 then raise exception 'Amount must be greater than zero'; end if;
  if v_type not in ('receipt','payment','bank_charge','bank_interest','other') then raise exception 'Unsupported bank transaction type; use bank_transfer_atomic for transfers'; end if;

  select * into v_bank_account from public.accounting_bank_accounts b
  where b.id=v_bank and b.tenant_id=v_tenant and b.tenant_company_id=v_company and b.is_active=true for update;
  if v_bank_account.id is null then raise exception 'Active bank account not found'; end if;
  if not exists(select 1 from public.chart_of_accounts a where a.id=v_contra and a.tenant_id=v_tenant and a.tenant_company_id=v_company and a.is_active=true) then raise exception 'Invalid or inactive contra account'; end if;

  select id into v_tx from public.accounting_bank_transactions where tenant_company_id=v_company and idempotency_key=v_idem;
  if v_tx is not null then return jsonb_build_object('id',v_tx,'idempotent',true); end if;

  select id into v_period from public.accounting_fiscal_periods
  where tenant_id=v_tenant and tenant_company_id=v_company and v_date between period_start and period_end and status='open' limit 1;
  if v_period is null then raise exception 'No open fiscal period for bank transaction date'; end if;

  v_debit_bank := v_type in ('receipt','bank_interest') or (v_type='other' and lower(coalesce(p_payload->>'direction','receipt'))='receipt');
  if v_type='other' and lower(coalesce(p_payload->>'direction','receipt')) not in ('receipt','payment') then raise exception 'Other transaction requires direction receipt or payment'; end if;

  v_journal_payload := jsonb_build_object(
    'tenant_id',v_tenant,'tenant_company_id',v_company,'entry_date',v_date,
    'voucher_number',v_voucher,'voucher_type',case when v_debit_bank then 'RECEIPT' else 'PAYMENT' end,
    'narration',coalesce(p_payload->>'description',p_payload->>'reference_no','Bank transaction'),
    'source_type','bank_transaction',
    'source_id',null,
    'idempotency_key','banktx:'||v_idem,
    'lines',jsonb_build_array(
      case when v_debit_bank then jsonb_build_object('account_id',v_bank_account.account_id,'debit_amount',v_amount,'credit_amount',0,'description',coalesce(p_payload->>'description','Bank transaction'))
           else jsonb_build_object('account_id',v_bank_account.account_id,'debit_amount',0,'credit_amount',v_amount,'description',coalesce(p_payload->>'description','Bank transaction')) end,
      case when v_debit_bank then jsonb_build_object('account_id',v_contra,'debit_amount',0,'credit_amount',v_amount,'description',coalesce(p_payload->>'description','Bank transaction'))
           else jsonb_build_object('account_id',v_contra,'debit_amount',v_amount,'credit_amount',0,'description',coalesce(p_payload->>'description','Bank transaction')) end
    )
  );

  v_journal_result := public.post_journal_entry_atomic(v_journal_payload);
  v_journal := (v_journal_result->>'id')::uuid;

  insert into public.accounting_bank_transactions(
    tenant_id,tenant_company_id,bank_account_id,transaction_date,transaction_type,reference_no,description,amount,journal_entry_id,reconciliation_status,idempotency_key
  ) values(
    v_tenant,v_company,v_bank,v_date,v_type,nullif(trim(p_payload->>'reference_no'),''),p_payload->>'description',v_amount,v_journal,'unreconciled',v_idem
  ) returning id into v_tx;

  return jsonb_build_object('id',v_tx,'journal_entry_id',v_journal,'status','posted');
exception when unique_violation then
  select id into v_tx from public.accounting_bank_transactions where tenant_company_id=v_company and idempotency_key=v_idem;
  if v_tx is not null then return jsonb_build_object('id',v_tx,'idempotent',true); end if;
  raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.post_inventory_transaction_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant_id uuid;
  v_company_id uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_type text := lower(trim(p_payload->>'transaction_type'));
  v_date date := coalesce(nullif(p_payload->>'transaction_date','')::date,current_date);
  v_from uuid := nullif(p_payload->>'from_location_id','')::uuid;
  v_to uuid := nullif(p_payload->>'to_location_id','')::uuid;
  v_work uuid := nullif(p_payload->>'work_id','')::uuid;
  v_lines jsonb := coalesce(p_payload->'lines','[]'::jsonb);
  v_tx_id uuid;
  v_tx_no text;
  v_existing record;
  v_hash text := md5(p_payload::text);
  r record;
  v_item uuid;
  v_qty numeric;
  v_unit_cost numeric;
  v_lot text;
  v_expiry date;
  v_src_bal record;
  v_dst_bal record;
  v_dst_found boolean;
  v_new_avg numeric;
  v_line_cost numeric;
  v_line_value numeric;
  v_line_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_company_id is null then raise exception 'Operating company is required'; end if;
  select tenant_id into v_tenant_id from public.tenant_companies where id=v_company_id and status='active';
  if v_tenant_id is null then raise exception 'Operating company not found'; end if;
  if v_type not in ('opening','receipt','issue','transfer','adjustment_in','adjustment_out','return_in','return_out','consumption') then raise exception 'Invalid inventory transaction type'; end if;
  if jsonb_typeof(v_lines) <> 'array' or jsonb_array_length(v_lines)=0 then raise exception 'At least one inventory line is required'; end if;
  if not private.has_company_access(v_tenant_id,v_company_id) then raise exception 'Not authorized'; end if;
  if v_type in ('opening','adjustment_in','adjustment_out') then
    if not private.has_action_permission(v_tenant_id,'MANAGER') then raise exception 'Not authorized for this transaction type'; end if;
  elsif not private.has_action_permission(v_tenant_id,'TEAM') then
    raise exception 'Not authorized';
  end if;
  if nullif(trim(p_payload->>'idempotency_key'),'') is not null then
    select * into v_existing from public.inventory_transactions where tenant_company_id=v_company_id and idempotency_key=trim(p_payload->>'idempotency_key');
    if found then
      if v_existing.request_hash <> v_hash then raise exception 'Idempotency key was already used with a different request'; end if;
      return jsonb_build_object('id',v_existing.id,'transaction_no',v_existing.transaction_no,'status','posted','idempotent_replay',true);
    end if;
  end if;
  if v_type in ('opening','receipt','return_in','adjustment_in') then
    if v_to is null or v_from is not null then raise exception 'Destination location is required and source location must be empty'; end if;
  elsif v_type in ('issue','return_out','consumption','adjustment_out') then
    if v_from is null or v_to is not null then raise exception 'Source location is required and destination location must be empty'; end if;
  elsif v_type='transfer' then
    if v_from is null or v_to is null or v_from=v_to then raise exception 'Transfer requires two different locations'; end if;
  end if;
  if v_from is not null and not exists(select 1 from public.inventory_locations where id=v_from and tenant_id=v_tenant_id and tenant_company_id=v_company_id and is_active and is_stock_location) then raise exception 'Source location not found or not a stock location'; end if;
  if v_to is not null and not exists(select 1 from public.inventory_locations where id=v_to and tenant_id=v_tenant_id and tenant_company_id=v_company_id and is_active and is_stock_location) then raise exception 'Destination location not found or not a stock location'; end if;
  if v_work is not null and not exists(select 1 from public.works where id=v_work and tenant_id=v_tenant_id and tenant_company_id=v_company_id) then raise exception 'Work/project not found'; end if;
  for r in select value from jsonb_array_elements(v_lines) loop
    v_item := nullif(r.value->>'item_id','')::uuid;
    v_qty := nullif(r.value->>'quantity','')::numeric;
    v_unit_cost := coalesce(nullif(r.value->>'unit_cost','')::numeric,0);
    if v_item is null or v_qty is null or v_qty <= 0 then raise exception 'Each inventory line requires a positive quantity and item'; end if;
    if not exists(select 1 from public.inventory_items where id=v_item and tenant_id=v_tenant_id and tenant_company_id=v_company_id and is_active and item_type <> 'service') then raise exception 'Inventory item not found or not stockable'; end if;
    if v_unit_cost < 0 then raise exception 'Unit cost cannot be negative'; end if;
    if v_type in ('opening','receipt','adjustment_in','return_in') and v_unit_cost <= 0 then raise exception 'Unit cost is required for inbound inventory'; end if;
  end loop;
  perform pg_advisory_xact_lock(hashtextextended(k.lock_key,0))
  from (
    select distinct (line.value->>'item_id') || ':' || loc.location_id::text || ':' || coalesce(nullif(trim(line.value->>'lot_number'),''),'') as lock_key
    from jsonb_array_elements(v_lines) line
    cross join lateral (values (v_from),(v_to)) loc(location_id)
    where loc.location_id is not null
  ) k
  order by k.lock_key;
  v_tx_no := private.get_next_inventory_doc_number(v_company_id,v_type,v_date);
  insert into public.inventory_transactions(tenant_id,tenant_company_id,transaction_no,transaction_type,transaction_date,from_location_id,to_location_id,work_id,source_type,source_id,reference_no,notes,idempotency_key,request_hash,created_by)
  values(v_tenant_id,v_company_id,v_tx_no,v_type,v_date,v_from,v_to,v_work,nullif(trim(p_payload->>'source_type'),''),nullif(p_payload->>'source_id','')::uuid,nullif(trim(p_payload->>'reference_no'),''),nullif(trim(p_payload->>'notes'),''),nullif(trim(p_payload->>'idempotency_key'),''),v_hash,v_uid)
  returning id into v_tx_id;
  for r in select value from jsonb_array_elements(v_lines) loop
    v_item := nullif(r.value->>'item_id','')::uuid;
    v_qty := nullif(r.value->>'quantity','')::numeric;
    v_unit_cost := coalesce(nullif(r.value->>'unit_cost','')::numeric,0);
    v_lot := nullif(trim(r.value->>'lot_number'),'');
    v_expiry := nullif(r.value->>'expiry_date','')::date;
    v_src_bal := null;
    v_dst_bal := null;
    v_dst_found := false;
    if v_from is not null then
      select * into v_src_bal from public.inventory_stock_balances where tenant_company_id=v_company_id and item_id=v_item and location_id=v_from and lot_key=coalesce(v_lot,'') for update;
      if not found then raise exception 'Insufficient stock: no balance exists for item at source location'; end if;
      if v_src_bal.quantity_on_hand < v_qty then raise exception 'Insufficient stock for item at source location'; end if;
    end if;
    if v_to is not null then
      select * into v_dst_bal from public.inventory_stock_balances where tenant_company_id=v_company_id and item_id=v_item and location_id=v_to and lot_key=coalesce(v_lot,'') for update;
      v_dst_found := found;
    end if;
    if v_from is not null then v_line_cost := v_src_bal.average_unit_cost; else v_line_cost := v_unit_cost; end if;
    if v_to is not null then
      if not v_dst_found then
        insert into public.inventory_stock_balances(tenant_id,tenant_company_id,item_id,location_id,lot_number,quantity_on_hand,average_unit_cost)
        values(v_tenant_id,v_company_id,v_item,v_to,v_lot,v_qty,v_line_cost);
      else
        v_new_avg := ((v_dst_bal.quantity_on_hand * v_dst_bal.average_unit_cost) + (v_qty * v_line_cost)) / nullif(v_dst_bal.quantity_on_hand + v_qty,0);
        update public.inventory_stock_balances set quantity_on_hand=quantity_on_hand+v_qty, average_unit_cost=round(v_new_avg,6), updated_at=now() where id=v_dst_bal.id;
      end if;
    end if;
    if v_from is not null then update public.inventory_stock_balances set quantity_on_hand=quantity_on_hand-v_qty, updated_at=now() where id=v_src_bal.id; end if;
    v_line_value := round(v_qty * v_line_cost,6);
    insert into public.inventory_transaction_lines(tenant_id,tenant_company_id,transaction_id,item_id,quantity,unit_cost,line_value,lot_number,expiry_date,notes)
    values(v_tenant_id,v_company_id,v_tx_id,v_item,v_qty,v_line_cost,v_line_value,v_lot,v_expiry,nullif(trim(r.value->>'notes'),''))
    returning id into v_line_id;
  end loop;
  return jsonb_build_object('id',v_tx_id,'transaction_no',v_tx_no,'status','posted','idempotent_replay',false);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.post_journal_entry_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_date date := nullif(p_payload->>'entry_date','')::date;
  v_period uuid;
  v_entry_id uuid;
  v_voucher text;
  v_idem text := nullif(trim(p_payload->>'idempotency_key'),'');
  v_request_hash text;
  v_existing_hash text;
  v_debit numeric := 0;
  v_credit numeric := 0;
  v_line jsonb;
  v_account uuid;
  v_debit_line numeric;
  v_credit_line numeric;
  v_count integer := 0;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null then raise exception 'Tenant and operating company are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  if v_date is null or v_idem is null then raise exception 'Entry date and idempotency key are required'; end if;
  if jsonb_typeof(p_payload->'lines') <> 'array' then raise exception 'Journal lines are required'; end if;

  v_request_hash := md5(
    jsonb_build_object(
      'tenant_id', v_tenant,
      'tenant_company_id', v_company,
      'voucher_number', nullif(trim(p_payload->>'voucher_number'),''),
      'voucher_type', coalesce(nullif(p_payload->>'voucher_type',''),'JOURNAL'),
      'entry_date', v_date,
      'narration', p_payload->>'narration',
      'source_type', p_payload->>'source_type',
      'source_id', nullif(p_payload->>'source_id','')::uuid,
      'lines', p_payload->'lines'
    )::text
  );

  select id, request_hash into v_entry_id, v_existing_hash
  from public.accounting_journal_entries
  where tenant_company_id=v_company and idempotency_key=v_idem;

  if v_entry_id is not null then
    if v_existing_hash is null or v_existing_hash <> v_request_hash then
      raise exception 'Idempotency key has already been used with a different payload';
    end if;
    return jsonb_build_object('id',v_entry_id,'idempotent',true);
  end if;

  select id into v_period
  from public.accounting_fiscal_periods
  where tenant_id=v_tenant and tenant_company_id=v_company
    and v_date between period_start and period_end and status='open'
  limit 1;
  if v_period is null then raise exception 'No open fiscal period for entry date'; end if;

  for v_line in select value from jsonb_array_elements(p_payload->'lines') loop
    v_count := v_count + 1;
    v_account := nullif(v_line->>'account_id','')::uuid;
    v_debit_line := coalesce(nullif(v_line->>'debit','')::numeric, nullif(v_line->>'debit_amount','')::numeric, 0);
    v_credit_line := coalesce(nullif(v_line->>'credit','')::numeric, nullif(v_line->>'credit_amount','')::numeric, 0);
    if v_debit_line < 0 or v_credit_line < 0 or (v_debit_line > 0 and v_credit_line > 0) or (v_debit_line = 0 and v_credit_line = 0) then
      raise exception 'Each journal line must contain either debit or credit amount';
    end if;
    if not exists (select 1 from public.chart_of_accounts a where a.id=v_account and a.tenant_id=v_tenant and a.tenant_company_id=v_company and a.is_active=true) then
      raise exception 'Invalid or inactive account';
    end if;
    v_debit := v_debit + v_debit_line;
    v_credit := v_credit + v_credit_line;
  end loop;

  if v_count < 2 then raise exception 'A journal entry requires at least two lines'; end if;
  if v_debit <= 0 or v_debit <> v_credit then raise exception 'Journal entry is not balanced'; end if;

  v_voucher := coalesce(nullif(trim(p_payload->>'voucher_number'),''),'JV-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'));

  insert into public.accounting_journal_entries(
    tenant_id,tenant_company_id,fiscal_period_id,voucher_number,voucher_type,entry_date,
    narration,source_type,source_id,status,idempotency_key,request_hash,created_by
  ) values(
    v_tenant,v_company,v_period,v_voucher,coalesce(nullif(p_payload->>'voucher_type',''),'JOURNAL'),v_date,
    p_payload->>'narration',p_payload->>'source_type',nullif(p_payload->>'source_id','')::uuid,
    'posted',v_idem,v_request_hash,v_uid
  ) returning id into v_entry_id;

  v_count := 0;
  for v_line in select value from jsonb_array_elements(p_payload->'lines') loop
    v_count := v_count + 1;
    insert into public.accounting_journal_lines(
      journal_entry_id,account_id,line_no,description,debit,credit,party_type,party_id,project_id
    ) values(
      v_entry_id,nullif(v_line->>'account_id','')::uuid,v_count,v_line->>'description',
      coalesce(nullif(v_line->>'debit','')::numeric, nullif(v_line->>'debit_amount','')::numeric,0),
      coalesce(nullif(v_line->>'credit','')::numeric, nullif(v_line->>'credit_amount','')::numeric,0),
      v_line->>'party_type',nullif(v_line->>'party_id','')::uuid,nullif(v_line->>'project_id','')::uuid
    );
  end loop;

  return jsonb_build_object('id',v_entry_id,'voucher_number',v_voucher,'debit',v_debit,'credit',v_credit,'status','posted');
exception when unique_violation then
  select id, request_hash into v_entry_id, v_existing_hash
  from public.accounting_journal_entries
  where tenant_company_id=v_company and idempotency_key=v_idem;
  if v_entry_id is not null then
    if v_existing_hash is null or v_existing_hash <> v_request_hash then
      raise exception 'Idempotency key has already been used with a different payload';
    end if;
    return jsonb_build_object('id',v_entry_id,'idempotent',true);
  end if;
  raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.process_leave_approval_atomic(p_leave_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_auth_user_id uuid := auth.uid();
  v_leave_req public.leave_requests%ROWTYPE;
  v_app_req public.approval_requests%ROWTYPE;
  v_emp_bal public.leave_balances%ROWTYPE;
  v_calculated_total numeric;
  v_approved_total numeric;
  v_requested_total numeric;
  v_balance_count integer;
  v_ledger_count integer;
  v_now timestamptz := pg_catalog.now();
  v_day_rec public.leave_request_days%ROWTYPE;
BEGIN
  IF v_auth_user_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Active authentication session required';
  END IF;

  -- Lock order step 1: leave request.
  SELECT * INTO v_leave_req
  FROM public.leave_requests
  WHERE id = p_leave_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: Leave request record not found';
  END IF;

  -- DB-side authorization: authenticated tenant member with company access
  -- and management action authority.
  IF NOT (SELECT private.has_company_access(v_leave_req.tenant_id, v_leave_req.tenant_company_id)) THEN
    RAISE EXCEPTION 'FORBIDDEN: No access to the request operating company';
  END IF;

  IF NOT (SELECT private.has_action_permission(v_leave_req.tenant_id, 'MANAGER')) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: OWNER/ADMIN/MANAGER authority required';
  END IF;

  IF v_leave_req.status = 'applied' THEN
    SELECT count(*) INTO v_ledger_count
    FROM public.leave_ledger
    WHERE leave_request_id = p_leave_request_id
      AND transaction_type = 'leave_used';

    IF v_ledger_count <> 1 THEN
      RAISE EXCEPTION 'CORRUPT_STATE: Applied leave must have exactly one leave_used ledger entry';
    END IF;

    RETURN jsonb_build_object('success', true, 'message', 'Leave request already applied (idempotent)');
  END IF;

  IF v_leave_req.status IN ('cancelled', 'rejected', 'failed') THEN
    RAISE EXCEPTION 'INVALID_STATUS: Cannot apply leave request in % status', v_leave_req.status;
  END IF;

  IF v_leave_req.approval_request_id IS NULL THEN
    RAISE EXCEPTION 'MISSING_APPROVAL_LINK: Leave request is not linked to an approval request';
  END IF;

  SELECT * INTO v_app_req
  FROM public.approval_requests
  WHERE id = v_leave_req.approval_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'NOT_FOUND: Associated approval request record not found';
  END IF;

  IF v_app_req.request_type <> 'leave_application'
     OR v_app_req.status <> 'approved'
     OR v_app_req.tenant_id <> v_leave_req.tenant_id
     OR v_app_req.tenant_company_id <> v_leave_req.tenant_company_id
     OR v_app_req.entity_type <> 'leave_request'
     OR v_app_req.entity_id <> v_leave_req.id
     OR v_app_req.subject_employee_id <> v_leave_req.employee_id THEN
    RAISE EXCEPTION 'APPROVAL_LINK_MISMATCH: Approval request is not the approved request linked to this leave';
  END IF;

  IF v_app_req.requested_by = v_auth_user_id THEN
    RAISE EXCEPTION 'MAKER_CHECKER_VIOLATION: Requester cannot execute final approval processing for their own request';
  END IF;

  -- Validate the leave-day source of truth before touching balances.
  SELECT
    COALESCE(sum(CASE
      WHEN day_type = 'half_day' THEN 0.5
      WHEN day_type = 'working_day' THEN 1.0
      ELSE 0.0
    END), 0),
    COALESCE(sum(requested_days), 0),
    COALESCE(sum(approved_days), 0)
  INTO v_calculated_total, v_requested_total, v_approved_total
  FROM public.leave_request_days
  WHERE leave_request_id = v_leave_req.id
    AND tenant_id = v_leave_req.tenant_id
    AND tenant_company_id = v_leave_req.tenant_company_id;

  IF v_calculated_total <> v_leave_req.total_days
     OR v_requested_total <> v_leave_req.total_days
     OR v_approved_total <> v_leave_req.total_days
     OR v_calculated_total <= 0 THEN
    RAISE EXCEPTION 'TOTAL_DAYS_MISMATCH: Leave day breakdown is inconsistent with total_days';
  END IF;

  -- Lock order step 2: exact balance period covering the complete leave range.
  SELECT count(*) INTO v_balance_count
  FROM public.leave_balances
  WHERE tenant_id = v_leave_req.tenant_id
    AND tenant_company_id = v_leave_req.tenant_company_id
    AND employee_id = v_leave_req.employee_id
    AND leave_type_id = v_leave_req.leave_type_id
    AND balance_period_start <= v_leave_req.from_date
    AND balance_period_end >= v_leave_req.to_date;

  IF v_balance_count = 0 THEN
    RAISE EXCEPTION 'MISSING_BALANCE_PERIOD: No single leave balance period covers the complete leave request';
  ELSIF v_balance_count > 1 THEN
    RAISE EXCEPTION 'AMBIGUOUS_BALANCE_PERIOD: Multiple balance periods cover the leave request';
  END IF;

  SELECT * INTO v_emp_bal
  FROM public.leave_balances
  WHERE tenant_id = v_leave_req.tenant_id
    AND tenant_company_id = v_leave_req.tenant_company_id
    AND employee_id = v_leave_req.employee_id
    AND leave_type_id = v_leave_req.leave_type_id
    AND balance_period_start <= v_leave_req.from_date
    AND balance_period_end >= v_leave_req.to_date
  FOR UPDATE;

  IF v_emp_bal.pending < v_leave_req.total_days THEN
    RAISE EXCEPTION 'CORRUPT_BALANCE_STATE: Pending balance is less than requested leave days';
  END IF;

  UPDATE public.leave_balances
  SET used = used + v_leave_req.total_days,
      pending = pending - v_leave_req.total_days,
      updated_at = v_now
  WHERE id = v_emp_bal.id;

  INSERT INTO public.leave_ledger (
    tenant_id, tenant_company_id, employee_id, leave_type_id,
    leave_request_id, leave_balance_id, transaction_type, quantity,
    transaction_date, reference_type, reference_id, reason, metadata,
    created_by, created_at
  ) VALUES (
    v_leave_req.tenant_id, v_leave_req.tenant_company_id,
    v_leave_req.employee_id, v_leave_req.leave_type_id,
    v_leave_req.id, v_emp_bal.id, 'leave_used', -ABS(v_leave_req.total_days),
    v_leave_req.from_date, 'leave_request', v_leave_req.id,
    'Approved leave application',
    jsonb_build_object('approval_request_id', v_leave_req.approval_request_id),
    v_auth_user_id, v_now
  );

  UPDATE public.leave_requests
  SET status = 'applied', approved_at = COALESCE(approved_at, v_now), updated_at = v_now
  WHERE id = v_leave_req.id;

  FOR v_day_rec IN
    SELECT *
    FROM public.leave_request_days
    WHERE leave_request_id = v_leave_req.id
      AND tenant_id = v_leave_req.tenant_id
      AND tenant_company_id = v_leave_req.tenant_company_id
  LOOP
    IF v_day_rec.day_type IN ('working_day', 'half_day') THEN
      INSERT INTO public.attendance_daily_records (
        tenant_id, tenant_company_id, employee_id, attendance_date, status, leave, updated_at
      ) VALUES (
        v_leave_req.tenant_id, v_leave_req.tenant_company_id,
        v_leave_req.employee_id, v_day_rec.leave_date, 'leave', true, v_now
      )
      ON CONFLICT (employee_id, attendance_date) DO UPDATE
      SET status = 'leave', leave = true, updated_at = v_now;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'leave_request_id', v_leave_req.id,
    'status', 'applied'
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.process_payroll_payment_batch_atomic(p_payment_batch_id uuid, p_reference_no text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_batch public.payroll_payment_batches%rowtype;
  v_bank public.accounting_bank_accounts%rowtype;
  v_payable uuid;
  v_period uuid;
  v_journal uuid;
  v_tx uuid;
  v_total numeric(18,2);
  v_items_total numeric(18,2);
  v_items_count integer;
  v_date date;
  v_voucher text;
  v_bank_ref text;
  v_req public.approval_requests%rowtype;
  v_journal_result jsonb;
  v_bank_result jsonb;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into v_batch from public.payroll_payment_batches where id=p_payment_batch_id for update;
  if not found then raise exception 'PAYROLL_PAYMENT_BATCH_NOT_FOUND'; end if;
  -- Bank disbursement is a high-risk financial action: execution remains ADMIN-only.
  if not private.has_company_access(v_batch.tenant_id,v_batch.tenant_company_id) or not private.has_action_permission(v_batch.tenant_id,'ADMIN') then raise exception 'Not authorized'; end if;
  if v_batch.status='paid' then
    return jsonb_build_object('id',v_batch.id,'status','paid','idempotent',true,'journal_entry_id',v_batch.journal_entry_id,'bank_transaction_id',v_batch.bank_transaction_id);
  end if;
  if v_batch.status<>'approved' then raise exception 'PAYMENT_BATCH_MUST_BE_APPROVED'; end if;
  if v_batch.approval_request_id is null then raise exception 'PAYMENT_APPROVAL_REQUIRED'; end if;
  select * into v_req from public.approval_requests where id=v_batch.approval_request_id and tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and status='approved' for update;
  if not found then raise exception 'PAYMENT_APPROVAL_NOT_COMPLETE'; end if;

  select count(*),coalesce(sum(amount),0)::numeric(18,2)
    into v_items_count,v_items_total
  from public.payroll_payment_items
  where payment_batch_id=v_batch.id and tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and payment_status='pending';
  if v_items_count=0 then raise exception 'NO_PENDING_PAYMENT_ITEMS'; end if;
  if round(v_items_total,2)<>round(v_batch.total_amount,2) then raise exception 'PAYMENT_BATCH_TOTAL_MISMATCH'; end if;

  v_date:=v_batch.payment_date; v_total:=round(v_batch.total_amount,2);
  select * into v_bank from public.accounting_bank_accounts
  where id=v_batch.bank_account_id and tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and is_active=true for update;
  if not found then raise exception 'ACTIVE_BANK_ACCOUNT_NOT_FOUND'; end if;
  select account_id into v_payable from public.payroll_account_mappings
  where tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and mapping_key='salary_payable' and is_active=true;
  if v_payable is null then raise exception 'SALARY_PAYABLE_ACCOUNT_MAPPING_REQUIRED'; end if;
  if not exists(select 1 from public.chart_of_accounts a where a.id=v_payable and a.tenant_id=v_batch.tenant_id and a.tenant_company_id=v_batch.tenant_company_id and a.is_active=true) then raise exception 'INVALID_SALARY_PAYABLE_ACCOUNT_MAPPING'; end if;
  select id into v_period from public.accounting_fiscal_periods
  where tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and v_date between period_start and period_end and status='open' limit 1;
  if v_period is null then raise exception 'NO_OPEN_FISCAL_PERIOD_FOR_PAYMENT_DATE'; end if;

  v_voucher:='SALARY-PAY-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS');
  v_journal_result:=public.post_journal_entry_atomic(jsonb_build_object(
    'tenant_id',v_batch.tenant_id,
    'tenant_company_id',v_batch.tenant_company_id,
    'entry_date',v_date,
    'voucher_number',v_voucher,
    'voucher_type','PAYMENT',
    'narration','Salary payment - '||v_batch.id,
    'source_type','payroll_payment_batch',
    'source_id',v_batch.id,
    'idempotency_key','PAYROLL-PAYMENT-JV-'||v_batch.id,
    'lines',jsonb_build_array(
      jsonb_build_object('account_id',v_payable,'debit_amount',v_total,'credit_amount',0,'description','Salary payable settled'),
      jsonb_build_object('account_id',v_bank.account_id,'debit_amount',0,'credit_amount',v_total,'description','Salary bank disbursement')
    )
  ));
  v_journal:=(v_journal_result->>'id')::uuid;

  v_bank_ref:=coalesce(nullif(trim(p_reference_no),''),'SALARY-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'));
  insert into public.accounting_bank_transactions(
    tenant_id,tenant_company_id,bank_account_id,transaction_date,transaction_type,reference_no,description,amount,journal_entry_id,reconciliation_status,idempotency_key
  ) values(
    v_batch.tenant_id,v_batch.tenant_company_id,v_batch.bank_account_id,v_date,'payment',v_bank_ref,'Salary payment - '||v_batch.id,v_total,v_journal,'unreconciled','PAYROLL-PAYMENT-BANK-'||v_batch.id
  ) returning id into v_tx;

  update public.payroll_payment_items
    set payment_status='paid',bank_reference_no=v_bank_ref,paid_at=now(),updated_at=now()
  where payment_batch_id=v_batch.id and tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and payment_status='pending';
  if not found then raise exception 'PAYMENT_ITEMS_NOT_UPDATED'; end if;
  update public.payroll_payment_batches
    set status='paid',journal_entry_id=v_journal,bank_transaction_id=v_tx,processed_at=now(),paid_at=now(),updated_at=now()
  where id=v_batch.id;
  update public.payroll_runs set status='paid',updated_at=now() where id=v_batch.payroll_run_id and tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and status='posted';
  update public.payroll_periods set status='paid',updated_at=now()
  where id=(select payroll_period_id from public.payroll_runs where id=v_batch.payroll_run_id) and tenant_id=v_batch.tenant_id and tenant_company_id=v_batch.tenant_company_id and status='posted';
  update public.approval_requests set status='applied',updated_at=now() where id=v_batch.approval_request_id and status='approved';
  return jsonb_build_object('id',v_batch.id,'status','paid','journal_entry_id',v_journal,'bank_transaction_id',v_tx,'total_amount',v_total);
exception when unique_violation then
  select * into v_batch from public.payroll_payment_batches where id=p_payment_batch_id for update;
  if v_batch.status='paid' then return jsonb_build_object('id',v_batch.id,'status','paid','idempotent',true,'journal_entry_id',v_batch.journal_entry_id,'bank_transaction_id',v_batch.bank_transaction_id); end if;
  raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.process_payroll_statutory_payment_atomic(p_settlement_id uuid, p_bank_account_id uuid, p_reference_no text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_s public.payroll_statutory_settlements%rowtype; v_bank public.accounting_bank_accounts%rowtype; v_map uuid; v_period uuid; v_jv jsonb; v_jid uuid; v_tx uuid; v_ref text;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_s from public.payroll_statutory_settlements where id=p_settlement_id for update;
 if not found then raise exception 'STATUTORY_SETTLEMENT_NOT_FOUND'; end if;
 if not private.has_company_access(v_s.tenant_id,v_s.tenant_company_id) or not private.has_action_permission(v_s.tenant_id,'ADMIN') then raise exception 'Not authorized'; end if;
 if v_s.status='paid' then return jsonb_build_object('id',v_s.id,'status','paid','journal_entry_id',v_s.journal_entry_id,'bank_transaction_id',v_s.bank_transaction_id,'idempotent',true); end if;
 if v_s.status not in ('draft','exported') then raise exception 'STATUTORY_SETTLEMENT_NOT_PAYABLE'; end if;
 select * into v_bank from public.accounting_bank_accounts where id=p_bank_account_id and tenant_id=v_s.tenant_id and tenant_company_id=v_s.tenant_company_id and is_active=true for update;
 if not found then raise exception 'ACTIVE_BANK_ACCOUNT_NOT_FOUND'; end if;
 select account_id into v_map from public.payroll_account_mappings where tenant_id=v_s.tenant_id and tenant_company_id=v_s.tenant_company_id and mapping_key=case v_s.statutory_type when 'PF' then 'pf_payable' when 'ESI' then 'esi_payable' when 'PT' then 'pt_payable' when 'TDS' then 'tds_payable' end and is_active=true;
 if v_map is null then raise exception 'STATUTORY_PAYABLE_ACCOUNT_MAPPING_REQUIRED'; end if;
 select id into v_period from public.accounting_fiscal_periods where tenant_id=v_s.tenant_id and tenant_company_id=v_s.tenant_company_id and v_s.settlement_date between period_start and period_end and status='open' limit 1;
 if v_period is null then raise exception 'NO_OPEN_FISCAL_PERIOD_FOR_SETTLEMENT_DATE'; end if;
 v_ref:=coalesce(nullif(trim(p_reference_no),''),'STAT-'||v_s.statutory_type||'-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'));
 v_jv:=public.post_journal_entry_atomic(jsonb_build_object('tenant_id',v_s.tenant_id,'tenant_company_id',v_s.tenant_company_id,'entry_date',v_s.settlement_date,'voucher_number','STAT-'||v_s.statutory_type||'-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'),'voucher_type','PAYMENT','narration',v_s.statutory_type||' statutory settlement - '||v_s.payroll_period_id,'source_type','payroll_statutory_settlement','source_id',v_s.id,'idempotency_key','PAYROLL-STAT-PAY-'||v_s.id,'lines',jsonb_build_array(jsonb_build_object('account_id',v_map,'debit_amount',v_s.total_amount,'credit_amount',0,'description',v_s.statutory_type||' payable settled'),jsonb_build_object('account_id',v_bank.account_id,'debit_amount',0,'credit_amount',v_s.total_amount,'description',v_s.statutory_type||' statutory payment'))));
 v_jid:=(v_jv->>'id')::uuid;
 insert into public.accounting_bank_transactions(tenant_id,tenant_company_id,bank_account_id,transaction_date,transaction_type,reference_no,description,amount,journal_entry_id,reconciliation_status,idempotency_key) values(v_s.tenant_id,v_s.tenant_company_id,p_bank_account_id,v_s.settlement_date,'payment',v_ref,v_s.statutory_type||' statutory settlement - '||v_s.payroll_period_id,v_s.total_amount,v_jid,'unreconciled','PAYROLL-STAT-BANK-'||v_s.id) returning id into v_tx;
 update public.payroll_statutory_settlements set status='paid',bank_account_id=p_bank_account_id,bank_transaction_id=v_tx,journal_entry_id=v_jid,payment_reference=v_ref,updated_at=now() where id=v_s.id;
 return jsonb_build_object('id',v_s.id,'status','paid','journal_entry_id',v_jid,'bank_transaction_id',v_tx,'payment_reference',v_ref);
exception when unique_violation then
 select * into v_s from public.payroll_statutory_settlements where id=p_settlement_id;
 if v_s.status='paid' then return jsonb_build_object('id',v_s.id,'status','paid','journal_entry_id',v_s.journal_entry_id,'bank_transaction_id',v_s.bank_transaction_id,'idempotent',true); end if;
 raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.reconcile_bank_transaction_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_id uuid := nullif(p_payload->>'id','')::uuid;
  v_status text := lower(coalesce(nullif(trim(p_payload->>'reconciliation_status'),''),'reconciled'));
  v_bank_tx public.accounting_bank_transactions%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_id is null then raise exception 'Tenant, company and bank transaction are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  if v_status not in ('reconciled','unreconciled','ignored') then raise exception 'Invalid reconciliation status'; end if;
  select * into v_bank_tx from public.accounting_bank_transactions b where b.id=v_id and b.tenant_id=v_tenant and b.tenant_company_id=v_company for update;
  if v_bank_tx.id is null then raise exception 'Bank transaction not found'; end if;
  if v_status='reconciled' and v_bank_tx.journal_entry_id is null then raise exception 'Only posted bank transactions can be reconciled'; end if;
  update public.accounting_bank_transactions
  set reconciliation_status=v_status,
      reconciled_at=case when v_status='reconciled' then coalesce(reconciled_at,now()) else null end
  where id=v_id;
  return jsonb_build_object('id',v_id,'reconciliation_status',v_status);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.record_payroll_bank_file_result_atomic(p_bank_file_id uuid, p_result text, p_external_reference text DEFAULT NULL::text, p_rejection_reason text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_file public.payroll_bank_files%rowtype; v_status text:=lower(trim(p_result));
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_file from public.payroll_bank_files where id=p_bank_file_id for update;
 if not found then raise exception 'BANK_FILE_NOT_FOUND'; end if;
 if not private.has_company_access(v_file.tenant_id,v_file.tenant_company_id) or not private.has_action_permission(v_file.tenant_id,'ADMIN') then raise exception 'Not authorized'; end if;
 if v_status not in ('accepted','rejected') then raise exception 'BANK_FILE_RESULT_MUST_BE_ACCEPTED_OR_REJECTED'; end if;
 if v_file.status<>'submitted' then raise exception 'BANK_FILE_MUST_BE_SUBMITTED_BEFORE_RESULT'; end if;
 if v_status='rejected' and nullif(trim(p_rejection_reason),'') is null then raise exception 'REJECTION_REASON_REQUIRED'; end if;
 update public.payroll_bank_files set status=v_status,external_reference=coalesce(nullif(trim(p_external_reference),''),external_reference),rejection_reason=case when v_status='rejected' then nullif(trim(p_rejection_reason),'') else null end,updated_at=now() where id=v_file.id returning * into v_file;
 return jsonb_build_object('id',v_file.id,'status',v_file.status,'external_reference',v_file.external_reference,'rejection_reason',v_file.rejection_reason);
end; $function$
;

CREATE OR REPLACE FUNCTION public.record_payroll_bank_file_submission_atomic(p_bank_file_id uuid, p_external_reference text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_file public.payroll_bank_files%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_file from public.payroll_bank_files where id=p_bank_file_id for update;
 if not found then raise exception 'BANK_FILE_NOT_FOUND'; end if;
 if not private.has_company_access(v_file.tenant_id,v_file.tenant_company_id) or not private.has_action_permission(v_file.tenant_id,'ADMIN') then raise exception 'Not authorized'; end if;
 if v_file.status<>'generated' then raise exception 'BANK_FILE_MUST_BE_GENERATED'; end if;
 if nullif(trim(p_external_reference),'') is null then raise exception 'EXTERNAL_REFERENCE_REQUIRED'; end if;
 update public.payroll_bank_files set status='submitted',external_reference=trim(p_external_reference),submitted_at=now(),updated_at=now() where id=v_file.id returning * into v_file;
 return jsonb_build_object('id',v_file.id,'status',v_file.status,'external_reference',v_file.external_reference);
end; $function$
;

CREATE OR REPLACE FUNCTION public.record_purchase_payment_atomic(p_payment jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_bill public.purchase_bills%rowtype; v_amount numeric; v_id uuid; v_new_paid numeric; v_new_balance numeric;
begin
 if v_uid is null then raise exception 'Authentication required'; end if; v_amount:=(p_payment->>'amount')::numeric; if v_amount is null or v_amount<=0 then raise exception 'Payment amount must be positive'; end if;
 select * into v_bill from public.purchase_bills where id=(p_payment->>'purchase_bill_id')::uuid for update;
 if not found then raise exception 'Purchase bill not found'; end if;
 if not private.has_action_permission(v_bill.tenant_id,'MANAGER') or not private.has_company_access(v_bill.tenant_id,v_bill.tenant_company_id) then raise exception 'Not authorized'; end if;
 if v_amount>v_bill.balance_due then raise exception 'Payment exceeds balance due'; end if;
 v_new_paid:=v_bill.amount_paid+v_amount; v_new_balance:=v_bill.total_amount-v_new_paid;
 insert into public.purchase_payments(tenant_id,tenant_company_id,purchase_bill_id,payment_date,amount,payment_method,reference_no,notes,created_by) values(v_bill.tenant_id,v_bill.tenant_company_id,v_bill.id,coalesce((p_payment->>'payment_date')::date,current_date),v_amount,p_payment->>'payment_method',p_payment->>'reference_no',p_payment->>'notes',v_uid) returning id into v_id;
 update public.purchase_bills set amount_paid=v_new_paid,balance_due=v_new_balance,status=case when v_new_balance=0 then 'paid' else 'partially_paid' end,updated_at=now() where id=v_bill.id;
 return jsonb_build_object('payment',(select to_jsonb(x) from public.purchase_payments x where x.id=v_id),'bill',(select to_jsonb(x) from public.purchase_bills x where x.id=v_bill.id));
end $function$
;

CREATE OR REPLACE FUNCTION public.record_purchase_payment_with_accounting_atomic(p_payment jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid();
  v_tenant uuid:=nullif(p_payment->>'tenant_id','')::uuid;
  v_tc uuid:=nullif(p_payment->>'tenant_company_id','')::uuid;
  v_bill uuid:=nullif(p_payment->>'purchase_bill_id','')::uuid;
  v_amount numeric:=nullif(p_payment->>'amount','')::numeric;
  v_date date:=coalesce(nullif(p_payment->>'payment_date','')::date,current_date);
  v_idem text:=nullif(trim(p_payment->>'idempotency_key'),'');
  v_hash text:=md5(p_payment::text);
  v_existing public.procurement_accounting_idempotency%rowtype;
  v_payment_result jsonb; v_payment_id uuid;
  v_bank_account uuid:=nullif(p_payment->>'bank_account_id','')::uuid;
  v_cash_account uuid:=nullif(p_payment->>'cash_account_id','')::uuid;
  v_bank_ledger uuid; v_ap uuid; v_journal uuid; v_journal_result jsonb;
  v_method text:=lower(coalesce(p_payment->>'payment_method',p_payment->>'payment_mode',''));
  v_normalized_payment jsonb; v_bill_row public.purchase_bills%rowtype; v_payment_source text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if v_tenant is null or v_tc is null or v_bill is null or v_amount is null or v_amount<=0 or v_idem is null then
    raise exception 'Tenant, company, bill, positive amount and idempotency key are required';
  end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_tc) then raise exception 'Not authorized'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_tc::text||':'||v_idem,0));
  select * into v_existing from public.procurement_accounting_idempotency where tenant_company_id=v_tc and idempotency_key=v_idem;
  if found then
    if v_existing.request_hash<>v_hash then raise exception 'Idempotency key has already been used with a different payload'; end if;
    return jsonb_build_object('payment_id',v_existing.source_id,'idempotent_replay',true);
  end if;
  select * into v_bill_row from public.purchase_bills where id=v_bill for update;
  if not found then raise exception 'Purchase bill not found'; end if;
  if v_bill_row.tenant_id<>v_tenant or v_bill_row.tenant_company_id<>v_tc then raise exception 'Purchase bill does not belong to the selected company'; end if;
  if v_amount>v_bill_row.balance_due then raise exception 'Payment exceeds balance due'; end if;

  if v_method='cash' then
    if v_cash_account is null then v_cash_account:=private.resolve_procurement_account(v_tenant,v_tc,'cash'); end if;
    if not exists(select 1 from public.chart_of_accounts a where a.id=v_cash_account and a.tenant_id=v_tenant and a.tenant_company_id=v_tc and a.is_active and a.account_type='asset') then
      raise exception 'Invalid active cash ledger account';
    end if;
    v_bank_ledger:=v_cash_account; v_payment_source:='cash';
  else
    if v_bank_account is null then raise exception 'bank_account_id is required for non-cash vendor payment'; end if;
    select b.account_id into v_bank_ledger from public.accounting_bank_accounts b
    where b.id=v_bank_account and b.tenant_id=v_tenant and b.tenant_company_id=v_tc and b.is_active;
    if v_bank_ledger is null then raise exception 'Active bank account not found'; end if;
    v_payment_source:='bank';
  end if;

  -- Normalize the frontend's payment_mode into the legacy purchase-payments
  -- payment_method field without requiring a schema change.
  v_normalized_payment:=jsonb_set(
    p_payment,
    '{payment_method}',
    to_jsonb(case when v_method='cash' then 'cash' else v_method end),
    true
  );
  if nullif(trim(v_normalized_payment->>'reference_no'),'') is null
     and nullif(trim(v_normalized_payment->>'reference_number'),'') is not null then
    v_normalized_payment:=jsonb_set(v_normalized_payment,'{reference_no}',to_jsonb(v_normalized_payment->>'reference_number'),true);
  end if;

  v_payment_result:=public.record_purchase_payment_atomic(v_normalized_payment);
  v_payment_id:=(v_payment_result->'payment'->>'id')::uuid;
  v_ap:=private.resolve_procurement_account(v_tenant,v_tc,'accounts_payable');
  v_journal_result:=public.post_journal_entry_atomic(jsonb_build_object(
    'tenant_id',v_tenant,'tenant_company_id',v_tc,'entry_date',v_date,
    'voucher_type','VENDOR_PAYMENT','narration','Vendor payment - '||coalesce(v_bill_row.bill_no,v_bill::text),
    'source_type','procurement_vendor_payment','source_id',v_payment_id,
    'idempotency_key','procurement-vendor-payment:'||v_idem,
    'lines',jsonb_build_array(
      jsonb_build_object('account_id',v_ap,'debit_amount',v_amount,'credit_amount',0,'party_type','vendor','party_id',v_bill_row.vendor_id,'description','Accounts payable settlement'),
      jsonb_build_object('account_id',v_bank_ledger,'debit_amount',0,'credit_amount',v_amount,'description',case when v_payment_source='cash' then 'Cash payment' else 'Bank payment' end)
    )));
  v_journal:=(v_journal_result->>'id')::uuid;
  if v_payment_source='bank' then
    insert into public.accounting_bank_transactions(tenant_id,tenant_company_id,bank_account_id,transaction_date,transaction_type,reference_no,description,amount,journal_entry_id,reconciliation_status,idempotency_key)
    values(v_tenant,v_tc,v_bank_account,v_date,'payment',nullif(trim(coalesce(p_payment->>'reference_no',p_payment->>'reference_number','')),''),coalesce(p_payment->>'notes','Vendor payment'),v_amount,v_journal,'unreconciled','procurement-vendor-payment-bank:'||v_idem);
  end if;
  insert into public.procurement_accounting_idempotency(tenant_id,tenant_company_id,idempotency_key,request_hash,source_type,source_id)
  values(v_tenant,v_tc,v_idem,v_hash,'procurement_vendor_payment',v_payment_id);
  return jsonb_build_object('payment',(select to_jsonb(p) from public.purchase_payments p where p.id=v_payment_id),'journal',v_journal_result,'bank_transaction_created',v_payment_source='bank','idempotent_replay',false);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.record_sales_payment_atomic(p_payment_json jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE i public.tax_invoices%ROWTYPE; p public.sales_payments%ROWTYPE; v_amount numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  v_amount:=COALESCE((p_payment_json->>'amount')::numeric,0);
  IF v_amount <= 0 THEN RAISE EXCEPTION 'Payment amount must be greater than zero'; END IF;
  SELECT * INTO i FROM public.tax_invoices WHERE id=(p_payment_json->>'tax_invoice_id')::uuid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Tax invoice not found'; END IF;
  IF NOT private.has_action_permission(i.tenant_id,'MANAGER') OR NOT private.has_company_access(i.tenant_id,i.tenant_company_id) THEN RAISE EXCEPTION 'Payment recording denied'; END IF;
  IF v_amount > GREATEST(i.balance_due,0) THEN RAISE EXCEPTION 'Payment exceeds outstanding balance'; END IF;
  INSERT INTO public.sales_payments(tenant_id,tenant_company_id,tax_invoice_id,payment_date,payment_mode,reference_number,amount,notes,recorded_by)
  VALUES(i.tenant_id,i.tenant_company_id,i.id,COALESCE((p_payment_json->>'payment_date')::date,CURRENT_DATE),COALESCE(p_payment_json->>'payment_mode','bank_transfer'),p_payment_json->>'reference_number',v_amount,p_payment_json->>'notes',auth.uid()) RETURNING * INTO p;
  UPDATE public.tax_invoices SET amount_paid=amount_paid+v_amount,balance_due=GREATEST(total_amount-(amount_paid+v_amount),0),status=CASE WHEN total_amount <= amount_paid+v_amount THEN 'paid' ELSE 'partially_paid' END,updated_at=now() WHERE id=i.id RETURNING * INTO i;
  RETURN jsonb_build_object('payment',to_jsonb(p),'invoice',to_jsonb(i));
END;
$function$
;

CREATE OR REPLACE FUNCTION public.record_sales_payment_with_accounting_atomic(p_payment_json jsonb, p_accounting_json jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_result jsonb;
  v_invoice public.tax_invoices%rowtype;
  v_payment public.sales_payments%rowtype;
  v_accounting jsonb := coalesce(p_accounting_json,'{}'::jsonb);
  v_ar uuid;
  v_bank uuid;
  v_amount numeric;
  v_journal jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if coalesce((v_accounting->>'post_accounting')::boolean,false) is not true then raise exception 'ACCOUNTING_REQUIRED_FOR_SALES_PAYMENT'; end if;
  v_result := public.record_sales_payment_atomic(p_payment_json);
  v_payment := jsonb_populate_record(null::public.sales_payments,(v_result->'payment'));
  v_invoice := jsonb_populate_record(null::public.tax_invoices,(v_result->'invoice'));
  v_amount := round(v_payment.amount,2);
  v_ar := nullif(v_accounting->>'ar_account_id','')::uuid;
  v_bank := nullif(v_accounting->>'bank_account_id','')::uuid;
  if v_ar is null or v_bank is null then raise exception 'AR_AND_BANK_ACCOUNTS_REQUIRED'; end if;
  if not exists(select 1 from public.chart_of_accounts where id=v_ar and tenant_id=v_invoice.tenant_id and tenant_company_id=v_invoice.tenant_company_id and is_active) then raise exception 'INVALID_AR_ACCOUNT'; end if;
  if not exists(select 1 from public.chart_of_accounts where id=v_bank and tenant_id=v_invoice.tenant_id and tenant_company_id=v_invoice.tenant_company_id and is_active) then raise exception 'INVALID_BANK_ACCOUNT'; end if;
  v_journal := public.post_journal_entry_atomic(jsonb_build_object(
    'tenant_id',v_invoice.tenant_id,
    'tenant_company_id',v_invoice.tenant_company_id,
    'entry_date',v_payment.payment_date,
    'voucher_type','SALES_RECEIPT',
    'narration','Customer receipt for '||v_invoice.invoice_no,
    'source_type','sales_payment',
    'source_id',v_payment.id,
    'idempotency_key',coalesce(nullif(trim(v_accounting->>'idempotency_key'),''),'SALES-PAYMENT-'||v_payment.id::text),
    'lines',jsonb_build_array(
      jsonb_build_object('account_id',v_bank,'debit',v_amount,'credit',0,'description','Customer receipt - '||v_invoice.invoice_no),
      jsonb_build_object('account_id',v_ar,'debit',0,'credit',v_amount,'description','Accounts receivable settlement - '||v_invoice.invoice_no)
    )
  ));
  return jsonb_build_object('payment',v_result->'payment','invoice',v_result->'invoice','journal',v_journal,'accounting_posted',true);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.release_inventory_reservation_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_user_id uuid:=auth.uid();
  v_company_id uuid;
  v_reservation_id uuid;
  v_idempotency_key text;
  v_action_type text:=coalesce(nullif(p_payload->>'action_type',''),'release');
  v_request_hash text:=md5(p_payload::text);
  v_tenant_id uuid;
  v_action_id uuid;
  v_line jsonb;
  v_rl record;
  v_release numeric;
  v_active numeric;
  v_any_active boolean;
  v_new_status text;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' then raise exception 'Invalid release payload'; end if;
  v_company_id:=nullif(p_payload->>'tenant_company_id','')::uuid;
  v_reservation_id:=nullif(p_payload->>'reservation_id','')::uuid;
  v_idempotency_key:=nullif(trim(p_payload->>'idempotency_key'),'');
  if v_company_id is null or v_reservation_id is null or v_idempotency_key is null then raise exception 'tenant_company_id, reservation_id and idempotency_key are required'; end if;
  if v_action_type not in ('release','cancel') then raise exception 'Invalid reservation action'; end if;
  if jsonb_typeof(p_payload->'lines')<>'array' or jsonb_array_length(p_payload->'lines')=0 then raise exception 'At least one release line is required'; end if;

  select tc.tenant_id into v_tenant_id
  from public.tenant_companies tc
  where tc.id=v_company_id and tc.status='active';
  if v_tenant_id is null then raise exception 'Active tenant company not found'; end if;
  if not private.has_company_access(v_tenant_id,v_company_id) then raise exception 'Company access denied'; end if;
  if not private.has_action_permission(v_tenant_id,'TEAM') then raise exception 'Insufficient permission to release inventory reservation'; end if;

  select a.id into v_action_id
  from public.inventory_reservation_actions a
  where a.tenant_company_id=v_company_id and a.idempotency_key=v_idempotency_key;
  if v_action_id is not null then
    if (select request_hash from public.inventory_reservation_actions where id=v_action_id)<>v_request_hash then raise exception 'Idempotency key was already used with a different payload'; end if;
    return jsonb_build_object('action_id',v_action_id,'reservation_id',v_reservation_id,'status',(select status from public.inventory_reservations where id=v_reservation_id),'idempotent_replay',true);
  end if;

  perform 1 from public.inventory_reservations r
  where r.id=v_reservation_id and r.tenant_id=v_tenant_id and r.tenant_company_id=v_company_id
  for update;
  if not found then raise exception 'Reservation not found for selected company'; end if;
  if (select status from public.inventory_reservations where id=v_reservation_id) in ('released','cancelled','fulfilled') then raise exception 'Reservation is no longer releasable'; end if;

  insert into public.inventory_reservation_actions(tenant_id,tenant_company_id,reservation_id,action_type,idempotency_key,request_hash,created_by)
  values(v_tenant_id,v_company_id,v_reservation_id,v_action_type,v_idempotency_key,v_request_hash,v_user_id)
  returning id into v_action_id;

  for v_line in select value from jsonb_array_elements(p_payload->'lines') loop
    v_release:=nullif(v_line->>'quantity','')::numeric;
    if v_release is null or v_release<=0 then raise exception 'Release quantity must be greater than zero'; end if;

    select * into v_rl
    from public.inventory_reservation_lines rl
    where rl.id=nullif(v_line->>'reservation_line_id','')::uuid
      and rl.reservation_id=v_reservation_id
      and rl.tenant_id=v_tenant_id
      and rl.tenant_company_id=v_company_id
    for update;
    if not found then raise exception 'Reservation line not found'; end if;

    v_active:=v_rl.reserved_quantity-v_rl.released_quantity-v_rl.issued_quantity;
    if v_release>v_active then raise exception 'Release quantity exceeds unissued active reserved quantity'; end if;

    update public.inventory_reservation_lines
    set released_quantity=released_quantity+v_release,
        status=case
          when released_quantity+v_release+v_rl.issued_quantity>=reserved_quantity then 'released'
          else 'partially_released'
        end,
        updated_at=now()
    where id=v_rl.id;
  end loop;

  select exists(
    select 1 from public.inventory_reservation_lines rl
    where rl.reservation_id=v_reservation_id
      and (rl.reserved_quantity-rl.released_quantity-rl.issued_quantity)>0
  ) into v_any_active;

  v_new_status:=case
    when not v_any_active then case when v_action_type='cancel' then 'cancelled' else 'released' end
    else 'partially_released'
  end;

  update public.inventory_reservations
  set status=v_new_status,updated_at=now()
  where id=v_reservation_id;

  return jsonb_build_object('action_id',v_action_id,'reservation_id',v_reservation_id,'status',v_new_status,'idempotent_replay',false);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.reverse_journal_entry_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_original uuid := nullif(p_payload->>'journal_entry_id','')::uuid;
  v_reverse_date date := coalesce(nullif(p_payload->>'reversal_date','')::date,current_date);
  v_idem text := nullif(trim(p_payload->>'idempotency_key'),'');
  v_period uuid;
  v_reversal uuid;
  v_existing uuid;
  v_status text;
  v_original_reversal uuid;
  v_voucher text;
  v_line record;
  v_line_no integer := 0;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_original is null or v_idem is null then raise exception 'Tenant, company, journal entry and idempotency key are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;

  select id into v_existing from public.accounting_journal_entries where tenant_company_id=v_company and idempotency_key=v_idem;
  if v_existing is not null then return jsonb_build_object('id',v_existing,'idempotent',true); end if;

  select status,reversal_of_entry_id into v_status,v_original_reversal
  from public.accounting_journal_entries
  where id=v_original and tenant_id=v_tenant and tenant_company_id=v_company
  for update;
  if not found then raise exception 'Journal entry not found'; end if;
  if v_original_reversal is not null then raise exception 'A reversal entry cannot itself be reversed'; end if;
  if v_status <> 'posted' then raise exception 'Only a posted journal entry can be reversed'; end if;

  select id into v_period from public.accounting_fiscal_periods
  where tenant_id=v_tenant and tenant_company_id=v_company
    and v_reverse_date between period_start and period_end and status='open' limit 1;
  if v_period is null then raise exception 'No open fiscal period for reversal date'; end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_original::text,0));
  v_voucher := coalesce(nullif(trim(p_payload->>'voucher_number'),''),'REV-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'));

  insert into public.accounting_journal_entries(
    tenant_id,tenant_company_id,fiscal_period_id,voucher_number,voucher_type,entry_date,narration,
    source_type,source_id,status,reversal_of_entry_id,idempotency_key,request_hash,created_by
  )
  select tenant_id,tenant_company_id,v_period,v_voucher,'REVERSAL',v_reverse_date,
    coalesce(nullif(p_payload->>'narration',''),'Reversal of '||voucher_number),
    'journal_reversal',id,'posted',id,v_idem,
    md5(jsonb_build_object('original_entry_id',id,'reversal_date',v_reverse_date,'narration',coalesce(p_payload->>'narration',''),'voucher_number',v_voucher)::text),v_uid
  from public.accounting_journal_entries where id=v_original
  returning id into v_reversal;

  for v_line in
    select account_id,line_no,description,debit,credit,party_type,party_id,project_id
    from public.accounting_journal_lines where journal_entry_id=v_original order by line_no
  loop
    v_line_no := v_line_no + 1;
    insert into public.accounting_journal_lines(
      journal_entry_id,account_id,line_no,description,debit,credit,party_type,party_id,project_id
    ) values (
      v_reversal,v_line.account_id,v_line_no,
      coalesce(v_line.description,'')||' (Reversal)',v_line.credit,v_line.debit,
      v_line.party_type,v_line.party_id,v_line.project_id
    );
  end loop;

  if v_line_no < 2 then raise exception 'Original journal has insufficient lines to reverse'; end if;
  update public.accounting_journal_entries set status='reversed' where id=v_original;
  return jsonb_build_object('id',v_reversal,'reversal_of_entry_id',v_original,'status','posted');
exception when unique_violation then
  select id into v_existing from public.accounting_journal_entries where tenant_company_id=v_company and idempotency_key=v_idem;
  if v_existing is not null then return jsonb_build_object('id',v_existing,'idempotent',true); end if;
  raise;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.revoke_attendance_face_profile(p_tenant_id uuid, p_tenant_company_id uuid, p_employee_id uuid, p_reason text DEFAULT NULL::text)
 RETURNS attendance_face_profiles
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
    v_profile public.attendance_face_profiles%rowtype;
    v_now timestamptz := clock_timestamp();
begin
    if auth.uid() is null then
        raise exception 'AUTHENTICATION_REQUIRED';
    end if;

    if not private.has_action_permission(p_tenant_id, 'MANAGER') then
        raise exception 'INSUFFICIENT_ATTENDANCE_FACE_REVOCATION_PERMISSION';
    end if;

    if not private.has_company_access(p_tenant_id, p_tenant_company_id) then
        raise exception 'COMPANY_ACCESS_DENIED';
    end if;

    select * into v_profile
    from public.attendance_face_profiles
    where tenant_id = p_tenant_id
      and tenant_company_id = p_tenant_company_id
      and employee_id = p_employee_id
      and enrollment_status = 'active'
    order by enrolled_at desc nulls last, created_at desc nulls last
    limit 1
    for update;

    if not found then
        raise exception 'ACTIVE_FACE_PROFILE_NOT_FOUND';
    end if;

    update public.attendance_face_profiles
    set enrollment_status = 'revoked',
        revoked_at = v_now,
        updated_at = v_now
    where id = v_profile.id
    returning * into v_profile;

    -- Keep biometric provider reference as audit history; provider-side deletion/revocation is handled outside this DB boundary.
    return v_profile;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.save_owner_company_settings_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_tc uuid := (p_payload->>'tenant_company_id')::uuid;
  v_tenant uuid;
  v_item jsonb;
  v_id uuid;
begin
  if v_tc is null then raise exception 'tenant_company_id is required'; end if;

  select tenant_id into v_tenant from public.tenant_companies
  where id=v_tc and status<>'archived' for update;

  if v_tenant is null or not private.has_action_permission(v_tenant,'OWNER') then raise exception 'not authorized'; end if;

  update public.tenant_companies
  set name=coalesce(nullif(trim(p_payload->>'name'),''),name),
      code=case when p_payload ? 'code' then nullif(trim(p_payload->>'code'),'') else code end,
      status=coalesce(nullif(p_payload->>'status',''),status),
      updated_at=now()
  where id=v_tc;

  insert into public.company_profiles(tenant_company_id,tenant_id) values(v_tc,v_tenant)
  on conflict (tenant_company_id) do nothing;

  update public.company_profiles set
    legal_name=case when p_payload->'profile' ? 'legal_name' then nullif(p_payload->'profile'->>'legal_name','') else legal_name end,
    display_name=case when p_payload->'profile' ? 'display_name' then nullif(p_payload->'profile'->>'display_name','') else display_name end,
    trading_name=case when p_payload->'profile' ? 'trading_name' then nullif(p_payload->'profile'->>'trading_name','') else trading_name end,
    company_type=case when p_payload->'profile' ? 'company_type' then nullif(p_payload->'profile'->>'company_type','') else company_type end,
    business_type=case when p_payload->'profile' ? 'business_type' then nullif(p_payload->'profile'->>'business_type','') else business_type end,
    industry=case when p_payload->'profile' ? 'industry' then nullif(p_payload->'profile'->>'industry','') else industry end,
    nature_of_business=case when p_payload->'profile' ? 'nature_of_business' then nullif(p_payload->'profile'->>'nature_of_business','') else nature_of_business end,
    description=case when p_payload->'profile' ? 'description' then nullif(p_payload->'profile'->>'description','') else description end,
    website=case when p_payload->'profile' ? 'website' then nullif(p_payload->'profile'->>'website','') else website end,
    official_email=case when p_payload->'profile' ? 'official_email' then nullif(p_payload->'profile'->>'official_email','') else official_email end,
    official_phone=case when p_payload->'profile' ? 'official_phone' then nullif(p_payload->'profile'->>'official_phone','') else official_phone end,
    alternate_phone=case when p_payload->'profile' ? 'alternate_phone' then nullif(p_payload->'profile'->>'alternate_phone','') else alternate_phone end,
    incorporation_date=case when p_payload->'profile' ? 'incorporation_date' then nullif(p_payload->'profile'->>'incorporation_date','')::date else incorporation_date end,
    commencement_date=case when p_payload->'profile' ? 'commencement_date' then nullif(p_payload->'profile'->>'commencement_date','')::date else commencement_date end,
    employee_count=case when p_payload->'profile' ? 'employee_count' then nullif(p_payload->'profile'->>'employee_count','')::integer else employee_count end,
    financial_year_start_month=case when p_payload->'profile' ? 'financial_year_start_month' then coalesce(nullif(p_payload->'profile'->>'financial_year_start_month','')::smallint,4) else financial_year_start_month end,
    currency_code=case when p_payload->'profile' ? 'currency_code' then coalesce(nullif(p_payload->'profile'->>'currency_code',''),'INR') else currency_code end,
    timezone=case when p_payload->'profile' ? 'timezone' then coalesce(nullif(p_payload->'profile'->>'timezone',''),'Asia/Kolkata') else timezone end,
    is_primary=case when p_payload->'profile' ? 'is_primary' then coalesce((p_payload->'profile'->>'is_primary')::boolean,false) else is_primary end,
    updated_at=now()
  where tenant_company_id=v_tc;

  update public.companies
  set name=(select name from public.tenant_companies where id=v_tc)
  where tenant_company_id=v_tc and tenant_id=v_tenant;

  if jsonb_typeof(p_payload->'registrations')='array' then
    for v_item in select value from jsonb_array_elements(p_payload->'registrations') loop
      v_id:=nullif(v_item->>'id','')::uuid;
      if v_id is null then
        insert into public.company_registrations(tenant_id,tenant_company_id,registration_type,registration_number,issuing_authority,state_code,issue_date,expiry_date,status,is_primary,notes)
        values(v_tenant,v_tc,nullif(v_item->>'registration_type',''),nullif(v_item->>'registration_number',''),nullif(v_item->>'issuing_authority',''),nullif(v_item->>'state_code',''),nullif(v_item->>'issue_date','')::date,nullif(v_item->>'expiry_date','')::date,coalesce(nullif(v_item->>'status',''),'active'),coalesce((v_item->>'is_primary')::boolean,false),nullif(v_item->>'notes',''));
      else
        update public.company_registrations set
          registration_type=coalesce(nullif(v_item->>'registration_type',''),registration_type),
          registration_number=coalesce(nullif(v_item->>'registration_number',''),registration_number),
          issuing_authority=case when v_item ? 'issuing_authority' then nullif(v_item->>'issuing_authority','') else issuing_authority end,
          state_code=case when v_item ? 'state_code' then nullif(v_item->>'state_code','') else state_code end,
          issue_date=case when v_item ? 'issue_date' then nullif(v_item->>'issue_date','')::date else issue_date end,
          expiry_date=case when v_item ? 'expiry_date' then nullif(v_item->>'expiry_date','')::date else expiry_date end,
          status=coalesce(nullif(v_item->>'status',''),status),
          is_primary=case when v_item ? 'is_primary' then coalesce((v_item->>'is_primary')::boolean,false) else is_primary end,
          notes=case when v_item ? 'notes' then nullif(v_item->>'notes','') else notes end,
          updated_at=now()
        where id=v_id and tenant_company_id=v_tc;
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_payload->'addresses')='array' then
    for v_item in select value from jsonb_array_elements(p_payload->'addresses') loop
      v_id:=nullif(v_item->>'id','')::uuid;
      if v_id is null then
        insert into public.company_addresses(tenant_id,tenant_company_id,address_type,label,address_line_1,address_line_2,landmark,city,district,state,state_code,postal_code,country,latitude,longitude,is_primary,is_active)
        values(v_tenant,v_tc,nullif(v_item->>'address_type',''),nullif(v_item->>'label',''),nullif(v_item->>'address_line_1',''),nullif(v_item->>'address_line_2',''),nullif(v_item->>'landmark',''),nullif(v_item->>'city',''),nullif(v_item->>'district',''),nullif(v_item->>'state',''),nullif(v_item->>'state_code',''),nullif(v_item->>'postal_code',''),coalesce(nullif(v_item->>'country',''),'India'),nullif(v_item->>'latitude','')::numeric,nullif(v_item->>'longitude','')::numeric,coalesce((v_item->>'is_primary')::boolean,false),coalesce((v_item->>'is_active')::boolean,true));
      else
        update public.company_addresses set
          address_type=coalesce(nullif(v_item->>'address_type',''),address_type),
          label=case when v_item ? 'label' then nullif(v_item->>'label','') else label end,
          address_line_1=coalesce(nullif(v_item->>'address_line_1',''),address_line_1),
          address_line_2=case when v_item ? 'address_line_2' then nullif(v_item->>'address_line_2','') else address_line_2 end,
          landmark=case when v_item ? 'landmark' then nullif(v_item->>'landmark','') else landmark end,
          city=case when v_item ? 'city' then nullif(v_item->>'city','') else city end,
          district=case when v_item ? 'district' then nullif(v_item->>'district','') else district end,
          state=case when v_item ? 'state' then nullif(v_item->>'state','') else state end,
          state_code=case when v_item ? 'state_code' then nullif(v_item->>'state_code','') else state_code end,
          postal_code=case when v_item ? 'postal_code' then nullif(v_item->>'postal_code','') else postal_code end,
          country=case when v_item ? 'country' then coalesce(nullif(v_item->>'country',''),'India') else country end,
          latitude=case when v_item ? 'latitude' then nullif(v_item->>'latitude','')::numeric else latitude end,
          longitude=case when v_item ? 'longitude' then nullif(v_item->>'longitude','')::numeric else longitude end,
          is_primary=case when v_item ? 'is_primary' then coalesce((v_item->>'is_primary')::boolean,false) else is_primary end,
          is_active=case when v_item ? 'is_active' then coalesce((v_item->>'is_active')::boolean,true) else is_active end,
          updated_at=now()
        where id=v_id and tenant_company_id=v_tc;
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_payload->'contacts')='array' then
    for v_item in select value from jsonb_array_elements(p_payload->'contacts') loop
      v_id:=nullif(v_item->>'id','')::uuid;
      if v_id is null then
        insert into public.company_contacts(tenant_id,tenant_company_id,contact_type,name,designation,department,email,phone,alternate_phone,is_primary,is_active,notes)
        values(v_tenant,v_tc,nullif(v_item->>'contact_type',''),nullif(v_item->>'name',''),nullif(v_item->>'designation',''),nullif(v_item->>'department',''),nullif(v_item->>'email',''),nullif(v_item->>'phone',''),nullif(v_item->>'alternate_phone',''),coalesce((v_item->>'is_primary')::boolean,false),coalesce((v_item->>'is_active')::boolean,true),nullif(v_item->>'notes',''));
      else
        update public.company_contacts set
          contact_type=coalesce(nullif(v_item->>'contact_type',''),contact_type),
          name=coalesce(nullif(v_item->>'name',''),name),
          designation=case when v_item ? 'designation' then nullif(v_item->>'designation','') else designation end,
          department=case when v_item ? 'department' then nullif(v_item->>'department','') else department end,
          email=case when v_item ? 'email' then nullif(v_item->>'email','') else email end,
          phone=case when v_item ? 'phone' then nullif(v_item->>'phone','') else phone end,
          alternate_phone=case when v_item ? 'alternate_phone' then nullif(v_item->>'alternate_phone','') else alternate_phone end,
          is_primary=case when v_item ? 'is_primary' then coalesce((v_item->>'is_primary')::boolean,false) else is_primary end,
          is_active=case when v_item ? 'is_active' then coalesce((v_item->>'is_active')::boolean,true) else is_active end,
          notes=case when v_item ? 'notes' then nullif(v_item->>'notes','') else notes end,
          updated_at=now()
        where id=v_id and tenant_company_id=v_tc;
      end if;
    end loop;
  end if;

  if jsonb_typeof(p_payload->'banks')='array' then
    for v_item in select value from jsonb_array_elements(p_payload->'banks') loop
      v_id:=nullif(v_item->>'id','')::uuid;
      if v_id is null then
        insert into public.company_bank_profiles(tenant_id,tenant_company_id,bank_name,branch_name,account_name,masked_account_number,ifsc_code,account_type,upi_id,is_primary,is_active,notes)
        values(v_tenant,v_tc,nullif(v_item->>'bank_name',''),nullif(v_item->>'branch_name',''),nullif(v_item->>'account_name',''),nullif(v_item->>'masked_account_number',''),nullif(v_item->>'ifsc_code',''),nullif(v_item->>'account_type',''),nullif(v_item->>'upi_id',''),coalesce((v_item->>'is_primary')::boolean,false),coalesce((v_item->>'is_active')::boolean,true),nullif(v_item->>'notes',''));
      else
        update public.company_bank_profiles set
          bank_name=coalesce(nullif(v_item->>'bank_name',''),bank_name),
          branch_name=case when v_item ? 'branch_name' then nullif(v_item->>'branch_name','') else branch_name end,
          account_name=case when v_item ? 'account_name' then nullif(v_item->>'account_name','') else account_name end,
          masked_account_number=case when v_item ? 'masked_account_number' then nullif(v_item->>'masked_account_number','') else masked_account_number end,
          ifsc_code=case when v_item ? 'ifsc_code' then nullif(v_item->>'ifsc_code','') else ifsc_code end,
          account_type=case when v_item ? 'account_type' then nullif(v_item->>'account_type','') else account_type end,
          upi_id=case when v_item ? 'upi_id' then nullif(v_item->>'upi_id','') else upi_id end,
          is_primary=case when v_item ? 'is_primary' then coalesce((v_item->>'is_primary')::boolean,false) else is_primary end,
          is_active=case when v_item ? 'is_active' then coalesce((v_item->>'is_active')::boolean,true) else is_active end,
          notes=case when v_item ? 'notes' then nullif(v_item->>'notes','') else notes end,
          updated_at=now()
        where id=v_id and tenant_company_id=v_tc;
      end if;
    end loop;
  end if;

  insert into public.company_settings(tenant_company_id,tenant_id) values(v_tc,v_tenant) on conflict (tenant_company_id) do nothing;
  if jsonb_typeof(p_payload->'settings')='object' then
    update public.company_settings set
      date_format=case when p_payload->'settings' ? 'date_format' then coalesce(nullif(p_payload->'settings'->>'date_format',''),'DD-MM-YYYY') else date_format end,
      number_format=case when p_payload->'settings' ? 'number_format' then coalesce(nullif(p_payload->'settings'->>'number_format',''),'en-IN') else number_format end,
      default_address_id=case when p_payload->'settings' ? 'default_address_id' then nullif(p_payload->'settings'->>'default_address_id','')::uuid else default_address_id end,
      default_bank_profile_id=case when p_payload->'settings' ? 'default_bank_profile_id' then nullif(p_payload->'settings'->>'default_bank_profile_id','')::uuid else default_bank_profile_id end,
      gst_registration_type=case when p_payload->'settings' ? 'gst_registration_type' then nullif(p_payload->'settings'->>'gst_registration_type','') else gst_registration_type end,
      gst_filing_frequency=case when p_payload->'settings' ? 'gst_filing_frequency' then nullif(p_payload->'settings'->>'gst_filing_frequency','') else gst_filing_frequency end,
      tds_applicable=case when p_payload->'settings' ? 'tds_applicable' then coalesce((p_payload->'settings'->>'tds_applicable')::boolean,false) else tds_applicable end,
      pf_applicable=case when p_payload->'settings' ? 'pf_applicable' then coalesce((p_payload->'settings'->>'pf_applicable')::boolean,false) else pf_applicable end,
      esic_applicable=case when p_payload->'settings' ? 'esic_applicable' then coalesce((p_payload->'settings'->>'esic_applicable')::boolean,false) else esic_applicable end,
      professional_tax_applicable=case when p_payload->'settings' ? 'professional_tax_applicable' then coalesce((p_payload->'settings'->>'professional_tax_applicable')::boolean,false) else professional_tax_applicable end,
      default_tax_region=case when p_payload->'settings' ? 'default_tax_region' then nullif(p_payload->'settings'->>'default_tax_region','') else default_tax_region end,
      metadata=case when p_payload->'settings' ? 'metadata' and jsonb_typeof(p_payload->'settings'->'metadata')='object' then p_payload->'settings'->'metadata' else metadata end,
      updated_at=now()
    where tenant_company_id=v_tc;
  end if;

  insert into public.company_branding(tenant_company_id,tenant_id) values(v_tc,v_tenant) on conflict (tenant_company_id) do nothing;
  if jsonb_typeof(p_payload->'branding')='object' then
    update public.company_branding set
      logo_file_id=case when p_payload->'branding' ? 'logo_file_id' then nullif(p_payload->'branding'->>'logo_file_id','')::uuid else logo_file_id end,
      logo_url=case when p_payload->'branding' ? 'logo_url' then nullif(p_payload->'branding'->>'logo_url','') else logo_url end,
      favicon_file_id=case when p_payload->'branding' ? 'favicon_file_id' then nullif(p_payload->'branding'->>'favicon_file_id','')::uuid else favicon_file_id end,
      favicon_url=case when p_payload->'branding' ? 'favicon_url' then nullif(p_payload->'branding'->>'favicon_url','') else favicon_url end,
      primary_color=case when p_payload->'branding' ? 'primary_color' then nullif(p_payload->'branding'->>'primary_color','') else primary_color end,
      secondary_color=case when p_payload->'branding' ? 'secondary_color' then nullif(p_payload->'branding'->>'secondary_color','') else secondary_color end,
      accent_color=case when p_payload->'branding' ? 'accent_color' then nullif(p_payload->'branding'->>'accent_color','') else accent_color end,
      font_family=case when p_payload->'branding' ? 'font_family' then nullif(p_payload->'branding'->>'font_family','') else font_family end,
      login_template=case when p_payload->'branding' ? 'login_template' then nullif(p_payload->'branding'->>'login_template','') else login_template end,
      welcome_message=case when p_payload->'branding' ? 'welcome_message' then nullif(p_payload->'branding'->>'welcome_message','') else welcome_message end,
      contact_display_text=case when p_payload->'branding' ? 'contact_display_text' then nullif(p_payload->'branding'->>'contact_display_text','') else contact_display_text end,
      updated_at=now()
    where tenant_company_id=v_tc;
  end if;

  if jsonb_typeof(p_payload->'documents')='array' then
    for v_item in select value from jsonb_array_elements(p_payload->'documents') loop
      v_id:=nullif(v_item->>'id','')::uuid;
      if v_id is null then
        insert into public.company_documents(tenant_id,tenant_company_id,document_type,document_name,document_number,issue_date,expiry_date,verification_status,storage_provider,storage_bucket,storage_key,file_url,file_name,mime_type,file_size_bytes,checksum,version,is_current,is_archived,notes,uploaded_by)
        values(v_tenant,v_tc,nullif(v_item->>'document_type',''),nullif(v_item->>'document_name',''),nullif(v_item->>'document_number',''),nullif(v_item->>'issue_date','')::date,nullif(v_item->>'expiry_date','')::date,coalesce(nullif(v_item->>'verification_status',''),'pending'),nullif(v_item->>'storage_provider',''),nullif(v_item->>'storage_bucket',''),nullif(v_item->>'storage_key',''),nullif(v_item->>'file_url',''),nullif(v_item->>'file_name',''),nullif(v_item->>'mime_type',''),nullif(v_item->>'file_size_bytes','')::bigint,nullif(v_item->>'checksum',''),coalesce(nullif(v_item->>'version','')::integer,1),coalesce((v_item->>'is_current')::boolean,true),coalesce((v_item->>'is_archived')::boolean,false),nullif(v_item->>'notes',''),auth.uid());
      else
        update public.company_documents set
          document_type=coalesce(nullif(v_item->>'document_type',''),document_type),
          document_name=coalesce(nullif(v_item->>'document_name',''),document_name),
          document_number=case when v_item ? 'document_number' then nullif(v_item->>'document_number','') else document_number end,
          issue_date=case when v_item ? 'issue_date' then nullif(v_item->>'issue_date','')::date else issue_date end,
          expiry_date=case when v_item ? 'expiry_date' then nullif(v_item->>'expiry_date','')::date else expiry_date end,
          verification_status=coalesce(nullif(v_item->>'verification_status',''),verification_status),
          storage_provider=case when v_item ? 'storage_provider' then nullif(v_item->>'storage_provider','') else storage_provider end,
          storage_bucket=case when v_item ? 'storage_bucket' then nullif(v_item->>'storage_bucket','') else storage_bucket end,
          storage_key=case when v_item ? 'storage_key' then nullif(v_item->>'storage_key','') else storage_key end,
          file_url=case when v_item ? 'file_url' then nullif(v_item->>'file_url','') else file_url end,
          file_name=case when v_item ? 'file_name' then nullif(v_item->>'file_name','') else file_name end,
          mime_type=case when v_item ? 'mime_type' then nullif(v_item->>'mime_type','') else mime_type end,
          file_size_bytes=case when v_item ? 'file_size_bytes' then nullif(v_item->>'file_size_bytes','')::bigint else file_size_bytes end,
          checksum=case when v_item ? 'checksum' then nullif(v_item->>'checksum','') else checksum end,
          version=case when v_item ? 'version' then coalesce(nullif(v_item->>'version','')::integer,version) else version end,
          is_current=case when v_item ? 'is_current' then coalesce((v_item->>'is_current')::boolean,true) else is_current end,
          is_archived=case when v_item ? 'is_archived' then coalesce((v_item->>'is_archived')::boolean,false) else is_archived end,
          notes=case when v_item ? 'notes' then nullif(v_item->>'notes','') else notes end,
          updated_at=now()
        where id=v_id and tenant_company_id=v_tc;
      end if;
    end loop;
  end if;

  insert into public.company_settings_audit(tenant_id,tenant_company_id,actor_user_id,entity_type,entity_id,action,new_data)
  values(v_tenant,v_tc,auth.uid(),'tenant_company',v_tc,'update',p_payload);

  return public.get_owner_company_settings(v_tc);
end
$function$
;

CREATE OR REPLACE FUNCTION public.save_owner_company_settings_details_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_tenant uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_item jsonb;
  v_id uuid;
  v_id_text text;
  v_count_reg integer := 0;
  v_count_addr integer := 0;
  v_count_contact integer := 0;
  v_count_bank integer := 0;
  v_count_doc integer := 0;
begin
  if v_company is null then
    raise exception 'tenant_company_id is required';
  end if;

  select tc.tenant_id
    into v_tenant
  from public.tenant_companies tc
  where tc.id = v_company
    and tc.status <> 'archived';

  if v_tenant is null or not private.has_action_permission(v_tenant,'OWNER') then
    raise exception 'not authorized';
  end if;

  /*
   * Registrations
   */
  for v_item in
    select value from jsonb_array_elements(coalesce(p_payload->'registrations','[]'::jsonb))
  loop
    v_id := null;
    v_id_text := nullif(v_item->>'id','');
    if v_id_text is not null and v_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      v_id := v_id_text::uuid;
    end if;

    if v_id is not null and exists (
      select 1 from public.company_registrations r
      where r.id=v_id and r.tenant_id=v_tenant and r.tenant_company_id=v_company
    ) then
      update public.company_registrations
      set registration_type = coalesce(nullif(v_item->>'registration_type',''),'Other'),
          registration_number = coalesce(nullif(v_item->>'registration_number',''),''),
          issuing_authority = nullif(v_item->>'issuing_authority',''),
          state_code = nullif(v_item->>'state_code',''),
          issue_date = nullif(v_item->>'issue_date','')::date,
          expiry_date = nullif(v_item->>'expiry_date','')::date,
          status = case
            when (v_item->>'status') in ('active','inactive','expired','pending') then v_item->>'status'
            else 'active'
          end,
          is_primary = coalesce((v_item->>'is_primary')::boolean,false),
          notes = nullif(v_item->>'notes',''),
          updated_at = now()
      where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company;
    else
      insert into public.company_registrations(
        tenant_id,tenant_company_id,registration_type,registration_number,
        issuing_authority,state_code,issue_date,expiry_date,status,is_primary,notes
      ) values (
        v_tenant,v_company,
        coalesce(nullif(v_item->>'registration_type',''),'Other'),
        coalesce(nullif(v_item->>'registration_number',''),''),
        nullif(v_item->>'issuing_authority',''),
        nullif(v_item->>'state_code',''),
        nullif(v_item->>'issue_date','')::date,
        nullif(v_item->>'expiry_date','')::date,
        case when (v_item->>'status') in ('active','inactive','expired','pending')
             then v_item->>'status' else 'active' end,
        coalesce((v_item->>'is_primary')::boolean,false),
        nullif(v_item->>'notes','')
      );
    end if;
    v_count_reg := v_count_reg + 1;
  end loop;

  /*
   * Addresses
   */
  for v_item in
    select value from jsonb_array_elements(coalesce(p_payload->'addresses','[]'::jsonb))
  loop
    v_id := null;
    v_id_text := nullif(v_item->>'id','');
    if v_id_text is not null and v_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      v_id := v_id_text::uuid;
    end if;

    if v_id is not null and exists (
      select 1 from public.company_addresses a
      where a.id=v_id and a.tenant_id=v_tenant and a.tenant_company_id=v_company
    ) then
      update public.company_addresses
      set address_type = coalesce(nullif(v_item->>'address_type',''),'Other'),
          label = nullif(v_item->>'label',''),
          address_line_1 = coalesce(nullif(v_item->>'address_line_1',''),''),
          address_line_2 = nullif(v_item->>'address_line_2',''),
          landmark = nullif(v_item->>'landmark',''),
          city = nullif(v_item->>'city',''),
          district = nullif(v_item->>'district',''),
          state = nullif(v_item->>'state',''),
          state_code = nullif(v_item->>'state_code',''),
          postal_code = nullif(v_item->>'postal_code',''),
          country = coalesce(nullif(v_item->>'country',''),'India'),
          latitude = nullif(v_item->>'latitude','')::numeric,
          longitude = nullif(v_item->>'longitude','')::numeric,
          is_primary = coalesce((v_item->>'is_primary')::boolean,false),
          is_active = true,
          updated_at = now()
      where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company;
    else
      insert into public.company_addresses(
        tenant_id,tenant_company_id,address_type,label,address_line_1,address_line_2,
        landmark,city,district,state,state_code,postal_code,country,latitude,longitude,
        is_primary,is_active
      ) values (
        v_tenant,v_company,
        coalesce(nullif(v_item->>'address_type',''),'Other'),
        nullif(v_item->>'label',''),
        coalesce(nullif(v_item->>'address_line_1',''),''),
        nullif(v_item->>'address_line_2',''),
        nullif(v_item->>'landmark',''),
        nullif(v_item->>'city',''),
        nullif(v_item->>'district',''),
        nullif(v_item->>'state',''),
        nullif(v_item->>'state_code',''),
        nullif(v_item->>'postal_code',''),
        coalesce(nullif(v_item->>'country',''),'India'),
        nullif(v_item->>'latitude','')::numeric,
        nullif(v_item->>'longitude','')::numeric,
        coalesce((v_item->>'is_primary')::boolean,false),
        true
      );
    end if;
    v_count_addr := v_count_addr + 1;
  end loop;

  /*
   * Contacts
   */
  for v_item in
    select value from jsonb_array_elements(coalesce(p_payload->'contacts','[]'::jsonb))
  loop
    v_id := null;
    v_id_text := nullif(v_item->>'id','');
    if v_id_text is not null and v_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      v_id := v_id_text::uuid;
    end if;

    if v_id is not null and exists (
      select 1 from public.company_contacts c
      where c.id=v_id and c.tenant_id=v_tenant and c.tenant_company_id=v_company
    ) then
      update public.company_contacts
      set contact_type = coalesce(nullif(v_item->>'contact_type',''),'Other'),
          name = coalesce(nullif(v_item->>'name',''),''),
          designation = nullif(v_item->>'designation',''),
          department = nullif(v_item->>'department',''),
          email = nullif(v_item->>'email',''),
          phone = nullif(v_item->>'phone',''),
          alternate_phone = nullif(v_item->>'alternate_phone',''),
          is_primary = coalesce((v_item->>'is_primary')::boolean,false),
          is_active = true,
          notes = nullif(v_item->>'notes',''),
          updated_at = now()
      where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company;
    else
      insert into public.company_contacts(
        tenant_id,tenant_company_id,contact_type,name,designation,department,
        email,phone,alternate_phone,is_primary,is_active,notes
      ) values (
        v_tenant,v_company,
        coalesce(nullif(v_item->>'contact_type',''),'Other'),
        coalesce(nullif(v_item->>'name',''),''),
        nullif(v_item->>'designation',''),
        nullif(v_item->>'department',''),
        nullif(v_item->>'email',''),
        nullif(v_item->>'phone',''),
        nullif(v_item->>'alternate_phone',''),
        coalesce((v_item->>'is_primary')::boolean,false),
        true,
        nullif(v_item->>'notes','')
      );
    end if;
    v_count_contact := v_count_contact + 1;
  end loop;

  /*
   * Bank profiles. Only masked account data is persisted by this V1 contract.
   */
  for v_item in
    select value from jsonb_array_elements(coalesce(p_payload->'bank_profiles','[]'::jsonb))
  loop
    v_id := null;
    v_id_text := nullif(v_item->>'id','');
    if v_id_text is not null and v_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      v_id := v_id_text::uuid;
    end if;

    if v_id is not null and exists (
      select 1 from public.company_bank_profiles b
      where b.id=v_id and b.tenant_id=v_tenant and b.tenant_company_id=v_company
    ) then
      update public.company_bank_profiles
      set bank_name = coalesce(nullif(v_item->>'bank_name',''),''),
          branch_name = nullif(coalesce(v_item->>'branch_name',v_item->>'branch'),''),
          account_name = nullif(v_item->>'account_name',''),
          masked_account_number = nullif(v_item->>'masked_account_number',''),
          ifsc_code = nullif(coalesce(v_item->>'ifsc_code',v_item->>'ifsc'),''),
          account_type = nullif(v_item->>'account_type',''),
          upi_id = nullif(v_item->>'upi_id',''),
          is_primary = coalesce((v_item->>'is_primary')::boolean,false),
          is_active = true,
          notes = nullif(v_item->>'notes',''),
          updated_at = now()
      where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company;
    else
      insert into public.company_bank_profiles(
        tenant_id,tenant_company_id,bank_name,branch_name,account_name,
        masked_account_number,ifsc_code,account_type,upi_id,is_primary,is_active,notes
      ) values (
        v_tenant,v_company,
        coalesce(nullif(v_item->>'bank_name',''),''),
        nullif(coalesce(v_item->>'branch_name',v_item->>'branch'),''),
        nullif(v_item->>'account_name',''),
        nullif(v_item->>'masked_account_number',''),
        nullif(coalesce(v_item->>'ifsc_code',v_item->>'ifsc'),''),
        nullif(v_item->>'account_type',''),
        nullif(v_item->>'upi_id',''),
        coalesce((v_item->>'is_primary')::boolean,false),
        true,
        nullif(v_item->>'notes','')
      );
    end if;
    v_count_bank := v_count_bank + 1;
  end loop;

  /*
   * Company settings singleton
   */
  if p_payload ? 'settings' then
    insert into public.company_settings(
      tenant_company_id,tenant_id,date_format,number_format,default_address_id,
      default_bank_profile_id,gst_registration_type,gst_filing_frequency,
      tds_applicable,pf_applicable,esic_applicable,professional_tax_applicable,
      default_tax_region,metadata
    ) values (
      v_company,v_tenant,
      coalesce(nullif(p_payload->'settings'->>'date_format',''),'DD-MM-YYYY'),
      coalesce(nullif(p_payload->'settings'->>'number_format',''),'en-IN'),
      nullif(p_payload->'settings'->>'default_address_id','')::uuid,
      nullif(p_payload->'settings'->>'default_bank_profile_id','')::uuid,
      nullif(p_payload->'settings'->>'gst_registration_type',''),
      nullif(p_payload->'settings'->>'gst_filing_frequency',''),
      coalesce((p_payload->'settings'->>'tds_applicable')::boolean,false),
      coalesce((p_payload->'settings'->>'pf_applicable')::boolean,false),
      coalesce((p_payload->'settings'->>'esic_applicable')::boolean,false),
      coalesce((p_payload->'settings'->>'professional_tax_applicable')::boolean,false),
      nullif(p_payload->'settings'->>'default_tax_region',''),
      coalesce(p_payload->'settings'->'metadata','{}'::jsonb)
    )
    on conflict (tenant_company_id) do update set
      date_format = excluded.date_format,
      number_format = excluded.number_format,
      default_address_id = excluded.default_address_id,
      default_bank_profile_id = excluded.default_bank_profile_id,
      gst_registration_type = excluded.gst_registration_type,
      gst_filing_frequency = excluded.gst_filing_frequency,
      tds_applicable = excluded.tds_applicable,
      pf_applicable = excluded.pf_applicable,
      esic_applicable = excluded.esic_applicable,
      professional_tax_applicable = excluded.professional_tax_applicable,
      default_tax_region = excluded.default_tax_region,
      metadata = excluded.metadata,
      updated_at = now();
  end if;

  /*
   * Branding singleton
   */
  if p_payload ? 'branding' then
    insert into public.company_branding(
      tenant_company_id,tenant_id,logo_file_id,logo_url,favicon_file_id,favicon_url,
      primary_color,secondary_color,accent_color,font_family,login_template,
      welcome_message,contact_display_text
    ) values (
      v_company,v_tenant,
      case when nullif(p_payload->'branding'->>'logo_file_id','') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
           then (p_payload->'branding'->>'logo_file_id')::uuid else null end,
      nullif(p_payload->'branding'->>'logo_url',''),
      case when nullif(p_payload->'branding'->>'favicon_file_id','') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
           then (p_payload->'branding'->>'favicon_file_id')::uuid else null end,
      nullif(p_payload->'branding'->>'favicon_url',''),
      nullif(p_payload->'branding'->>'primary_color',''),
      nullif(p_payload->'branding'->>'secondary_color',''),
      nullif(p_payload->'branding'->>'accent_color',''),
      nullif(p_payload->'branding'->>'font_family',''),
      nullif(p_payload->'branding'->>'login_template',''),
      nullif(p_payload->'branding'->>'welcome_message',''),
      nullif(p_payload->'branding'->>'contact_display_text','')
    )
    on conflict (tenant_company_id) do update set
      logo_file_id = excluded.logo_file_id,
      logo_url = excluded.logo_url,
      favicon_file_id = excluded.favicon_file_id,
      favicon_url = excluded.favicon_url,
      primary_color = excluded.primary_color,
      secondary_color = excluded.secondary_color,
      accent_color = excluded.accent_color,
      font_family = excluded.font_family,
      login_template = excluded.login_template,
      welcome_message = excluded.welcome_message,
      contact_display_text = excluded.contact_display_text,
      updated_at = now();
  end if;

  /*
   * Documents. V1 stores metadata only; actual R2 upload is intentionally separate.
   * New records are always pending verification.
   */
  for v_item in
    select value from jsonb_array_elements(coalesce(p_payload->'documents','[]'::jsonb))
  loop
    v_id := null;
    v_id_text := nullif(v_item->>'id','');
    if v_id_text is not null and v_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
      v_id := v_id_text::uuid;
    end if;

    if v_id is not null and exists (
      select 1 from public.company_documents d
      where d.id=v_id and d.tenant_id=v_tenant and d.tenant_company_id=v_company
    ) then
      update public.company_documents
      set document_type = coalesce(nullif(v_item->>'document_type',''),'Other'),
          document_name = coalesce(nullif(v_item->>'document_name',''),''),
          document_number = nullif(v_item->>'document_number',''),
          issue_date = nullif(v_item->>'issue_date','')::date,
          expiry_date = nullif(v_item->>'expiry_date','')::date,
          storage_provider = nullif(v_item->>'storage_provider',''),
          storage_bucket = nullif(v_item->>'storage_bucket',''),
          storage_key = nullif(v_item->>'storage_key',''),
          file_url = nullif(v_item->>'file_url',''),
          file_name = nullif(v_item->>'file_name',''),
          mime_type = nullif(v_item->>'mime_type',''),
          file_size_bytes = nullif(v_item->>'file_size_bytes','')::bigint,
          checksum = nullif(v_item->>'checksum',''),
          version = greatest(1,coalesce((v_item->>'version')::integer,1)),
          is_current = coalesce((v_item->>'is_current')::boolean,true),
          is_archived = coalesce((v_item->>'is_archived')::boolean,false),
          notes = nullif(v_item->>'notes',''),
          updated_at = now()
      where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company;
    else
      insert into public.company_documents(
        tenant_id,tenant_company_id,document_type,document_name,document_number,
        issue_date,expiry_date,verification_status,storage_provider,storage_bucket,
        storage_key,file_url,file_name,mime_type,file_size_bytes,checksum,version,
        is_current,is_archived,notes,uploaded_by
      ) values (
        v_tenant,v_company,
        coalesce(nullif(v_item->>'document_type',''),'Other'),
        coalesce(nullif(v_item->>'document_name',''),''),
        nullif(v_item->>'document_number',''),
        nullif(v_item->>'issue_date','')::date,
        nullif(v_item->>'expiry_date','')::date,
        'pending',
        nullif(v_item->>'storage_provider',''),
        nullif(v_item->>'storage_bucket',''),
        nullif(v_item->>'storage_key',''),
        nullif(v_item->>'file_url',''),
        nullif(v_item->>'file_name',''),
        nullif(v_item->>'mime_type',''),
        nullif(v_item->>'file_size_bytes','')::bigint,
        nullif(v_item->>'checksum',''),
        greatest(1,coalesce((v_item->>'version')::integer,1)),
        true,
        false,
        nullif(v_item->>'notes',''),
        auth.uid()
      );
    end if;
    v_count_doc := v_count_doc + 1;
  end loop;

  return jsonb_build_object(
    'tenant_company_id',v_company,
    'registrations_processed',v_count_reg,
    'addresses_processed',v_count_addr,
    'contacts_processed',v_count_contact,
    'bank_profiles_processed',v_count_bank,
    'documents_processed',v_count_doc
  );
end
$function$
;

CREATE OR REPLACE FUNCTION public.submit_payroll_payment_batch_for_approval_atomic(p_payment_batch_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid(); v_batch public.payroll_payment_batches%rowtype; v_req uuid; v_step uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into v_batch from public.payroll_payment_batches where id=p_payment_batch_id for update;
  if not found then raise exception 'PAYROLL_PAYMENT_BATCH_NOT_FOUND'; end if;
  if not private.has_company_access(v_batch.tenant_id,v_batch.tenant_company_id) or not private.has_action_permission(v_batch.tenant_id,'MANAGER') then raise exception 'Not authorized'; end if;
  if v_batch.status<>'draft' then raise exception 'PAYMENT_BATCH_MUST_BE_DRAFT'; end if;
  if v_batch.total_amount <= 0 then raise exception 'PAYMENT_BATCH_AMOUNT_MUST_BE_GREATER_THAN_ZERO'; end if;
  insert into public.approval_requests(tenant_id,tenant_company_id,request_type,request_number,requested_by,entity_type,entity_id,title,description,payload,current_snapshot,status,priority,current_step_order,submitted_at,created_at,updated_at)
  values(v_batch.tenant_id,v_batch.tenant_company_id,'PAYROLL_PAYMENT_APPROVAL','PAYMENT-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'),v_uid,'payroll_payment_batch',v_batch.id,'Salary payment approval - '||v_batch.id,'Approval required before salary disbursement',jsonb_build_object('payment_batch_id',v_batch.id,'payroll_run_id',v_batch.payroll_run_id,'total_amount',v_batch.total_amount,'total_employees',v_batch.total_employees),to_jsonb(v_batch),'pending_approval','critical',1,now(),now(),now()) returning id into v_req;
  insert into public.approval_request_steps(tenant_id,tenant_company_id,request_id,workflow_step_id,step_order,approver_type,approver_role,status,created_at,updated_at)
  values(v_batch.tenant_id,v_batch.tenant_company_id,v_req,null,1,'role','ADMIN','pending',now(),now()) returning id into v_step;
  update public.payroll_payment_batches set status='pending_approval',approval_request_id=v_req,updated_at=now() where id=v_batch.id;
  return jsonb_build_object('id',v_batch.id,'approval_request_id',v_req,'approval_step_id',v_step,'status','pending_approval');
end;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_payroll_run_for_approval_atomic(p_payroll_run_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid:=auth.uid(); v_run public.payroll_runs%rowtype; v_req uuid; v_step uuid; v_requester uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into v_run from public.payroll_runs where id=p_payroll_run_id for update;
  if not found then raise exception 'PAYROLL_RUN_NOT_FOUND'; end if;
  if not private.has_company_access(v_run.tenant_id,v_run.tenant_company_id) or not private.has_action_permission(v_run.tenant_id,'MANAGER') then raise exception 'Not authorized'; end if;
  if v_run.status<>'calculated' then raise exception 'PAYROLL_RUN_MUST_BE_CALCULATED'; end if;
  if exists(select 1 from public.approval_requests where entity_type='payroll_run' and entity_id=v_run.id and status in ('submitted','pending_approval','approved','applied')) then raise exception 'PAYROLL_APPROVAL_ALREADY_EXISTS'; end if;
  insert into public.approval_requests(tenant_id,tenant_company_id,request_type,request_number,requested_by,entity_type,entity_id,title,description,payload,current_snapshot,status,priority,current_step_order,submitted_at,created_at,updated_at)
  values(v_run.tenant_id,v_run.tenant_company_id,'PAYROLL_RUN_APPROVAL','PAY-'||to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'),v_uid,'payroll_run',v_run.id,'Payroll approval - '||v_run.id,'Approval required before payroll posting',jsonb_build_object('payroll_run_id',v_run.id,'calculation_version',v_run.calculation_version),v_run.calculation_snapshot,'pending_approval','high',1,now(),now(),now()) returning id into v_req;
  insert into public.approval_request_steps(tenant_id,tenant_company_id,request_id,workflow_step_id,step_order,approver_type,approver_role,status,created_at,updated_at)
  values(v_run.tenant_id,v_run.tenant_company_id,v_req,null,1,'role','ADMIN','pending',now(),now()) returning id into v_step;
  update public.approval_requests set current_step_order=1,updated_at=now() where id=v_req;
  return jsonb_build_object('approval_request_id',v_req,'approval_step_id',v_step,'status','pending_approval');
end;$function$
;

CREATE OR REPLACE FUNCTION public.submit_recruitment_application(p_token text, p_first_name text, p_middle_name text DEFAULT NULL::text, p_last_name text DEFAULT NULL::text, p_mobile text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_address text DEFAULT NULL::text, p_city text DEFAULT NULL::text, p_state text DEFAULT NULL::text, p_pin text DEFAULT NULL::text, p_position_applied text DEFAULT NULL::text, p_preferred_location text DEFAULT NULL::text, p_total_experience_years numeric DEFAULT NULL::numeric, p_relevant_experience_years numeric DEFAULT NULL::numeric, p_current_company text DEFAULT NULL::text, p_current_ctc numeric DEFAULT NULL::numeric, p_expected_ctc numeric DEFAULT NULL::numeric, p_notice_period_days integer DEFAULT NULL::integer, p_highest_qualification text DEFAULT NULL::text, p_resume_url text DEFAULT NULL::text, p_willing_to_relocate boolean DEFAULT NULL::boolean, p_source text DEFAULT NULL::text, p_availability_date date DEFAULT NULL::date, p_consent_given boolean DEFAULT false)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$ declare v_link public.recruitment_application_links%rowtype; v_candidate_id uuid; begin if nullif(trim(p_token),'') is null then raise exception 'Invalid application link'; end if; if coalesce(trim(p_first_name),'') = '' then raise exception 'First name is required'; end if; if coalesce(trim(p_mobile),'') = '' then raise exception 'Mobile is required'; end if; if coalesce(p_consent_given,false) = false then raise exception 'Consent is required'; end if; select * into v_link from public.recruitment_application_links where token_hash = encode(extensions.digest(p_token,'sha256'),'hex') and status = 'active' and (expires_at is null or expires_at > now()) and (max_submissions is null or submission_count < max_submissions) for update; if not found then raise exception 'Invalid or expired application link'; end if; insert into public.recruitment_candidates (tenant_id,tenant_company_id,job_position_id,application_link_id,first_name,middle_name,last_name,display_name,mobile,email,address,city,state,pin,position_applied,preferred_location,total_experience_years,relevant_experience_years,current_company,current_ctc,expected_ctc,notice_period_days,highest_qualification,resume_url,willing_to_relocate,source,availability_date,consent_given,consent_at,status) values (v_link.tenant_id,v_link.tenant_company_id,v_link.job_position_id,v_link.id,trim(p_first_name),nullif(trim(p_middle_name),''),nullif(trim(p_last_name),''),nullif(trim(concat_ws(' ',p_first_name,p_middle_name,p_last_name)),''),trim(p_mobile),nullif(trim(p_email),''),p_address,p_city,p_state,p_pin,p_position_applied,p_preferred_location,p_total_experience_years,p_relevant_experience_years,p_current_company,p_current_ctc,p_expected_ctc,p_notice_period_days,p_highest_qualification,p_resume_url,p_willing_to_relocate,p_source,p_availability_date,true,now(),'applied') returning id into v_candidate_id; update public.recruitment_application_links set submission_count = submission_count + 1 where id = v_link.id; return v_candidate_id; end; $function$
;

CREATE OR REPLACE FUNCTION public.touch_company_settings_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
begin new.updated_at=now(); return new; end $function$
;

CREATE OR REPLACE FUNCTION public.unmatch_payroll_bank_transaction_atomic(p_reconciliation_id uuid, p_reason text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_r public.payroll_payment_reconciliations%rowtype; v_tx public.accounting_bank_transactions%rowtype; v_item public.payroll_payment_items%rowtype; v_batch public.payroll_payment_batches%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 select * into v_r from public.payroll_payment_reconciliations where id=p_reconciliation_id for update;
 if not found then raise exception 'PAYROLL_RECONCILIATION_NOT_FOUND'; end if;
 if not private.has_company_access(v_r.tenant_id,v_r.tenant_company_id) or not private.has_action_permission(v_r.tenant_id,'ADMIN') then raise exception 'Not authorized'; end if;
 if nullif(trim(p_reason),'') is null then raise exception 'UNMATCH_REASON_REQUIRED'; end if;
 select * into v_tx from public.accounting_bank_transactions where id=v_r.bank_transaction_id for update;
 select * into v_item from public.payroll_payment_items where id=v_r.payroll_payment_item_id for update;
 select * into v_batch from public.payroll_payment_batches where id=v_r.payroll_payment_batch_id for update;
 if v_batch.bank_transaction_id=v_tx.id then raise exception 'CANNOT_UNMATCH_INTERNAL_SALARY_DISBURSEMENT'; end if;
 if v_batch.status='paid' and v_item.payment_status='paid' then raise exception 'PAID_BATCH_REQUIRES_FINANCIAL_CORRECTION_WORKFLOW'; end if;
 update public.accounting_bank_transactions set payroll_payment_batch_id=null,payroll_payment_item_id=null,reconciliation_status='unreconciled',reconciled_at=null where id=v_tx.id;
 update public.payroll_payment_items set payment_status=case when v_item.payment_status='paid' then 'pending' else v_item.payment_status end,paid_at=case when v_item.payment_status='paid' then null else v_item.paid_at end,updated_at=now() where id=v_item.id;
 delete from public.payroll_payment_reconciliations where id=v_r.id;
 return jsonb_build_object('id',v_r.id,'status','unmatched','reason',trim(p_reason));
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_account_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_id uuid := nullif(p_payload->>'id','')::uuid;
  v_parent uuid := nullif(p_payload->>'parent_account_id','')::uuid;
  v_is_control boolean;
  v_active boolean;
  v_system boolean;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_id is null then raise exception 'Tenant, operating company and account are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  select is_system_account into v_system from public.chart_of_accounts where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company for update;
  if not found then raise exception 'Account not found'; end if;
  if v_system and (p_payload ? 'is_active') and coalesce((p_payload->>'is_active')::boolean,false)=false then raise exception 'System accounts cannot be deactivated'; end if;
  if v_parent is not null then
    if v_parent=v_id then raise exception 'An account cannot be its own parent'; end if;
    if not exists(select 1 from public.chart_of_accounts p where p.id=v_parent and p.tenant_id=v_tenant and p.tenant_company_id=v_company) then raise exception 'Invalid parent account'; end if;
  end if;
  v_is_control := case when p_payload ? 'is_control_account' then (p_payload->>'is_control_account')::boolean else null end;
  v_active := case when p_payload ? 'is_active' then (p_payload->>'is_active')::boolean else null end;

  update public.chart_of_accounts
  set account_name=coalesce(nullif(trim(p_payload->>'account_name'),''),account_name),
      account_subtype=case when p_payload ? 'account_subtype' then nullif(trim(p_payload->>'account_subtype'),'') else account_subtype end,
      parent_account_id=case when p_payload ? 'parent_account_id' then v_parent else parent_account_id end,
      is_control_account=coalesce(v_is_control,is_control_account),
      is_active=coalesce(v_active,is_active),
      updated_at=now()
  where id=v_id;
  return jsonb_build_object('id',v_id);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_bank_account_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid;
  v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_id uuid := nullif(p_payload->>'id','')::uuid;
  v_row public.accounting_bank_accounts%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_id is null then raise exception 'Tenant, operating company and bank account are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;

  select * into v_row from public.accounting_bank_accounts b
  where b.id=v_id and b.tenant_id=v_tenant and b.tenant_company_id=v_company
  for update;
  if v_row.id is null then raise exception 'Bank account not found'; end if;

  update public.accounting_bank_accounts
  set bank_name=coalesce(nullif(trim(p_payload->>'bank_name'),''),bank_name),
      account_name=coalesce(nullif(trim(p_payload->>'account_name'),''),account_name),
      masked_account_number=case when p_payload ? 'masked_account_number' then nullif(trim(p_payload->>'masked_account_number'),'') else masked_account_number end,
      ifsc_code=case when p_payload ? 'ifsc_code' then upper(nullif(trim(p_payload->>'ifsc_code'),'')) else ifsc_code end,
      bank_type=coalesce(nullif(lower(trim(p_payload->>'bank_type')),''),bank_type),
      is_active=coalesce((p_payload->>'is_active')::boolean,is_active),
      updated_at=now()
  where id=v_id;

  return jsonb_build_object('id',v_id);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_my_profile_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Invalid profile payload';
  end if;

  update public.profiles
  set
    display_name = nullif(trim(p_payload->>'display_name'), ''),
    full_name = nullif(trim(p_payload->>'full_name'), ''),
    phone = nullif(trim(p_payload->>'phone'), ''),
    job_title = nullif(trim(p_payload->>'job_title'), ''),
    department = nullif(trim(p_payload->>'department'), ''),
    timezone = coalesce(nullif(trim(p_payload->>'timezone'), ''), timezone),
    locale = coalesce(nullif(trim(p_payload->>'locale'), ''), locale),
    avatar_url = nullif(trim(p_payload->>'avatar_url'), '')
  where id = v_uid
  returning * into v_profile;

  if not found then
    raise exception 'User profile not found';
  end if;

  return to_jsonb(v_profile);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_owner_company_atomic(p_payload jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_tc uuid:=(p_payload->>'tenant_company_id')::uuid; v_tenant uuid; p jsonb:=coalesce(p_payload->'profile','{}'::jsonb);
begin
 select tenant_id into v_tenant from public.tenant_companies where id=v_tc for update;
 if v_tenant is null or not private.has_action_permission(v_tenant,'OWNER') then raise exception 'not authorized'; end if;
 update public.tenant_companies set name=coalesce(nullif(trim(p_payload->>'name'),''),name),code=case when p_payload ? 'code' then nullif(trim(p_payload->>'code'),'') else code end,status=coalesce(nullif(p_payload->>'status',''),status),updated_at=now() where id=v_tc;
 insert into public.company_profiles(tenant_company_id,tenant_id) values(v_tc,v_tenant) on conflict(tenant_company_id) do nothing;
 update public.company_profiles set legal_name=coalesce(nullif(p->>'legal_name',''),legal_name),display_name=coalesce(nullif(p->>'display_name',''),display_name),trading_name=coalesce(nullif(p->>'trading_name',''),trading_name),company_type=coalesce(nullif(p->>'company_type',''),company_type),business_type=coalesce(nullif(p->>'business_type',''),business_type),industry=coalesce(nullif(p->>'industry',''),industry),nature_of_business=coalesce(nullif(p->>'nature_of_business',''),nature_of_business),description=coalesce(nullif(p->>'description',''),description),website=coalesce(nullif(p->>'website',''),website),official_email=coalesce(nullif(p->>'official_email',''),official_email),official_phone=coalesce(nullif(p->>'official_phone',''),official_phone),alternate_phone=coalesce(nullif(p->>'alternate_phone',''),alternate_phone),incorporation_date=coalesce(nullif(p->>'incorporation_date','')::date,incorporation_date),commencement_date=coalesce(nullif(p->>'commencement_date','')::date,commencement_date),employee_count=coalesce(nullif(p->>'employee_count','')::integer,employee_count),financial_year_start_month=coalesce(nullif(p->>'financial_year_start_month','')::smallint,financial_year_start_month),currency_code=coalesce(nullif(p->>'currency_code',''),currency_code),timezone=coalesce(nullif(p->>'timezone',''),timezone),is_primary=coalesce((p->>'is_primary')::boolean,is_primary),updated_at=now() where tenant_company_id=v_tc;
 update public.companies set name=(select name from public.tenant_companies where id=v_tc) where tenant_company_id=v_tc and tenant_id=v_tenant;
 insert into public.company_settings_audit(tenant_id,tenant_company_id,actor_user_id,entity_type,entity_id,action,new_data) values(v_tenant,v_tc,auth.uid(),'tenant_company',v_tc,'update',p_payload);
end $function$
;

CREATE OR REPLACE FUNCTION public.upsert_payroll_account_mapping_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_uid uuid := auth.uid(); v_tenant uuid := nullif(p_payload->>'tenant_id','')::uuid; v_company uuid := nullif(p_payload->>'tenant_company_id','')::uuid;
  v_key text := nullif(trim(p_payload->>'mapping_key'),''); v_account uuid := nullif(p_payload->>'account_id','')::uuid; v_id uuid;
begin
  if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if v_tenant is null or v_company is null or v_key is null or v_account is null then raise exception 'Tenant, company, mapping_key and account_id are required'; end if;
  if not private.has_action_permission(v_tenant,'MANAGER') or not private.has_company_access(v_tenant,v_company) then raise exception 'Not authorized'; end if;
  if not exists(select 1 from public.chart_of_accounts a where a.id=v_account and a.tenant_id=v_tenant and a.tenant_company_id=v_company and a.is_active) then raise exception 'Invalid or inactive account'; end if;
  insert into public.payroll_account_mappings(tenant_id,tenant_company_id,mapping_key,account_id,is_active,created_by,updated_at)
  values(v_tenant,v_company,v_key,v_account,true,v_uid,now())
  on conflict (tenant_id,tenant_company_id,mapping_key) do update set account_id=excluded.account_id,is_active=true,updated_at=now();
  select id into v_id from public.payroll_account_mappings where tenant_id=v_tenant and tenant_company_id=v_company and mapping_key=v_key;
  return jsonb_build_object('id',v_id,'mapping_key',v_key,'account_id',v_account);
end;$function$
;

CREATE OR REPLACE FUNCTION public.upsert_payroll_bank_file_profile_atomic(p_payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_uid uuid:=auth.uid(); v_tenant uuid:=nullif(p_payload->>'tenant_id','')::uuid; v_company uuid:=nullif(p_payload->>'tenant_company_id','')::uuid; v_id uuid:=nullif(p_payload->>'id','')::uuid; v_code text:=nullif(trim(p_payload->>'profile_code'),''); v_bank text:=nullif(trim(p_payload->>'bank_name'),''); v_row public.payroll_bank_file_profiles%rowtype;
begin
 if v_uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
 if v_tenant is null or v_company is null or v_code is null or v_bank is null then raise exception 'Tenant, company, profile_code and bank_name are required'; end if;
 if not private.has_company_access(v_tenant,v_company) or not private.has_action_permission(v_tenant,'ADMIN') then raise exception 'Not authorized'; end if;
 if v_id is null then
   insert into public.payroll_bank_file_profiles(tenant_id,tenant_company_id,profile_code,bank_name,format_code,payment_mode,delimiter,include_header,file_extension,naming_prefix,is_active,metadata,created_by)
   values(v_tenant,v_company,v_code,v_bank,coalesce(nullif(p_payload->>'format_code',''),'CSV_SALARY_V1'),upper(coalesce(nullif(p_payload->>'payment_mode',''),'NEFT')),coalesce(nullif(p_payload->>'delimiter',''),','),coalesce((p_payload->>'include_header')::boolean,false),coalesce(nullif(p_payload->>'file_extension',''),'csv'),coalesce(nullif(trim(p_payload->>'naming_prefix'),''),'SALARY'),coalesce((p_payload->>'is_active')::boolean,true),coalesce(p_payload->'metadata','{}'::jsonb),v_uid) returning * into v_row;
 else
   update public.payroll_bank_file_profiles set bank_name=coalesce(nullif(trim(p_payload->>'bank_name'),''),bank_name),format_code=coalesce(nullif(p_payload->>'format_code',''),format_code),payment_mode=upper(coalesce(nullif(p_payload->>'payment_mode',''),payment_mode)),delimiter=coalesce(nullif(p_payload->>'delimiter',''),delimiter),include_header=coalesce((p_payload->>'include_header')::boolean,include_header),file_extension=coalesce(nullif(p_payload->>'file_extension',''),file_extension),naming_prefix=coalesce(nullif(trim(p_payload->>'naming_prefix'),''),naming_prefix),is_active=coalesce((p_payload->>'is_active')::boolean,is_active),metadata=coalesce(p_payload->'metadata',metadata),updated_at=now() where id=v_id and tenant_id=v_tenant and tenant_company_id=v_company returning * into v_row;
   if not found then raise exception 'BANK_FILE_PROFILE_NOT_FOUND'; end if;
 end if;
 return jsonb_build_object('id',v_row.id,'profile_code',v_row.profile_code,'status',case when v_row.is_active then 'active' else 'inactive' end);
end; $function$
;

-- OMITTED FUNCTION realtime.apply_rls: Supabase-managed schema
-- OMITTED FUNCTION realtime.broadcast_changes: Supabase-managed schema
-- OMITTED FUNCTION realtime.build_prepared_statement_sql: Supabase-managed schema
-- OMITTED FUNCTION realtime.cast: Supabase-managed schema
-- OMITTED FUNCTION realtime.check_equality_op: Supabase-managed schema
-- OMITTED FUNCTION realtime.check_equality_op: Supabase-managed schema
-- OMITTED FUNCTION realtime.is_visible_through_filters: Supabase-managed schema
-- OMITTED FUNCTION realtime.list_changes: Supabase-managed schema
-- OMITTED FUNCTION realtime.quote_wal2json: Supabase-managed schema
-- OMITTED FUNCTION realtime.send_binary: Supabase-managed schema
-- OMITTED FUNCTION realtime.send: Supabase-managed schema
-- OMITTED FUNCTION realtime.subscription_check_filters: Supabase-managed schema
-- OMITTED FUNCTION realtime.to_regrole: Supabase-managed schema
-- OMITTED FUNCTION realtime.topic: Supabase-managed schema
-- OMITTED FUNCTION realtime.wal2json_escape_identifier: Supabase-managed schema
-- OMITTED FUNCTION storage.allow_any_operation: Supabase-managed schema
-- OMITTED FUNCTION storage.allow_only_operation: Supabase-managed schema
-- OMITTED FUNCTION storage.can_insert_object: Supabase-managed schema
-- OMITTED FUNCTION storage.enforce_bucket_lifecycle_service_role: Supabase-managed schema
-- OMITTED FUNCTION storage.enforce_bucket_name_length: Supabase-managed schema
-- OMITTED FUNCTION storage.extension: Supabase-managed schema
-- OMITTED FUNCTION storage.filename: Supabase-managed schema
-- OMITTED FUNCTION storage.foldername: Supabase-managed schema
-- OMITTED FUNCTION storage.get_common_prefix: Supabase-managed schema
-- OMITTED FUNCTION storage.get_size_by_bucket: Supabase-managed schema
-- OMITTED FUNCTION storage.list_multipart_uploads_with_delimiter: Supabase-managed schema
-- OMITTED FUNCTION storage.list_objects_with_delimiter: Supabase-managed schema
-- OMITTED FUNCTION storage.operation: Supabase-managed schema
-- OMITTED FUNCTION storage.protect_bucket_control_columns: Supabase-managed schema
-- OMITTED FUNCTION storage.protect_delete: Supabase-managed schema
-- OMITTED FUNCTION storage.search_by_timestamp: Supabase-managed schema
-- OMITTED FUNCTION storage.search_v2: Supabase-managed schema
-- OMITTED FUNCTION storage.search: Supabase-managed schema
-- OMITTED FUNCTION storage.update_updated_at_column: Supabase-managed schema
-- OMITTED FUNCTION vault._crypto_aead_det_decrypt: Supabase-managed schema
-- OMITTED FUNCTION vault._crypto_aead_det_encrypt: Supabase-managed schema
-- OMITTED FUNCTION vault._crypto_aead_det_noncegen: Supabase-managed schema
-- OMITTED FUNCTION vault.create_secret: Supabase-managed schema
-- OMITTED FUNCTION vault.update_secret: Supabase-managed schema

-- ==========================================
-- SECTION 15: TRIGGERS
-- ==========================================
-- OMITTED TRIGGER auth.users.on_auth_user_created: Supabase-managed schema
CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

CREATE TRIGGER company_addresses_audit AFTER INSERT OR DELETE OR UPDATE ON public.company_addresses FOR EACH ROW EXECUTE FUNCTION audit_company_settings_change();

CREATE TRIGGER company_addresses_updated_at BEFORE UPDATE ON public.company_addresses FOR EACH ROW EXECUTE FUNCTION touch_company_settings_updated_at();

CREATE TRIGGER company_bank_profiles_audit AFTER INSERT OR DELETE OR UPDATE ON public.company_bank_profiles FOR EACH ROW EXECUTE FUNCTION audit_company_settings_change();

CREATE TRIGGER company_bank_profiles_updated_at BEFORE UPDATE ON public.company_bank_profiles FOR EACH ROW EXECUTE FUNCTION touch_company_settings_updated_at();

CREATE TRIGGER company_branding_audit AFTER INSERT OR DELETE OR UPDATE ON public.company_branding FOR EACH ROW EXECUTE FUNCTION audit_company_settings_change();

CREATE TRIGGER company_branding_updated_at BEFORE UPDATE ON public.company_branding FOR EACH ROW EXECUTE FUNCTION touch_company_settings_updated_at();

CREATE TRIGGER company_contacts_audit AFTER INSERT OR DELETE OR UPDATE ON public.company_contacts FOR EACH ROW EXECUTE FUNCTION audit_company_settings_change();

CREATE TRIGGER company_contacts_updated_at BEFORE UPDATE ON public.company_contacts FOR EACH ROW EXECUTE FUNCTION touch_company_settings_updated_at();

CREATE TRIGGER company_documents_audit AFTER INSERT OR DELETE OR UPDATE ON public.company_documents FOR EACH ROW EXECUTE FUNCTION audit_company_settings_change();

CREATE TRIGGER company_documents_updated_at BEFORE UPDATE ON public.company_documents FOR EACH ROW EXECUTE FUNCTION touch_company_settings_updated_at();

CREATE TRIGGER company_profiles_audit AFTER INSERT OR DELETE OR UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION audit_company_settings_change();

CREATE TRIGGER company_profiles_updated_at BEFORE UPDATE ON public.company_profiles FOR EACH ROW EXECUTE FUNCTION touch_company_settings_updated_at();

CREATE TRIGGER company_registrations_audit AFTER INSERT OR DELETE OR UPDATE ON public.company_registrations FOR EACH ROW EXECUTE FUNCTION audit_company_settings_change();

CREATE TRIGGER company_registrations_updated_at BEFORE UPDATE ON public.company_registrations FOR EACH ROW EXECUTE FUNCTION touch_company_settings_updated_at();

CREATE TRIGGER company_settings_audit AFTER INSERT OR DELETE OR UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION audit_company_settings_change();

CREATE TRIGGER company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION touch_company_settings_updated_at();

CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.logs FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

CREATE TRIGGER trg_master_boq_line_canonical_identity BEFORE INSERT OR UPDATE OF original_description, specification, inventory_item_id, match_status ON public.master_boq_lines FOR EACH ROW EXECUTE FUNCTION apply_canonical_master_item_to_boq_line();

CREATE TRIGGER trg_enforce_profiles_role_protection BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION private.enforce_profiles_role_protection();

CREATE TRIGGER trg_cascade_project_assignment_termination AFTER UPDATE ON public.project_assignments FOR EACH ROW EXECUTE FUNCTION private.cascade_project_assignment_termination();

CREATE TRIGGER trg_enforce_project_assignments_active_membership BEFORE INSERT ON public.project_assignments FOR EACH ROW EXECUTE FUNCTION private.enforce_project_assignments_active_membership();

CREATE TRIGGER trg_enforce_project_assignments_immutability BEFORE UPDATE ON public.project_assignments FOR EACH ROW EXECUTE FUNCTION private.enforce_project_assignments_immutability();

CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.reminders FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

CREATE TRIGGER trg_enforce_stage_assignments_active_membership BEFORE INSERT ON public.stage_assignments FOR EACH ROW EXECUTE FUNCTION private.enforce_stage_assignments_active_membership();

CREATE TRIGGER trg_enforce_stage_assignments_immutability BEFORE UPDATE ON public.stage_assignments FOR EACH ROW EXECUTE FUNCTION private.enforce_stage_assignments_immutability();

CREATE TRIGGER trg_enforce_stage_definitions_immutability BEFORE UPDATE ON public.stage_definitions FOR EACH ROW EXECUTE FUNCTION private.enforce_stage_definitions_immutability();

CREATE TRIGGER trg_update_stage_definitions_updated_at BEFORE UPDATE ON public.stage_definitions FOR EACH ROW EXECUTE FUNCTION private.update_stage_definitions_updated_at();

CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.tenant_companies FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

CREATE TRIGGER trg_enforce_last_owner_protection BEFORE DELETE OR UPDATE ON public.tenant_memberships FOR EACH ROW EXECUTE FUNCTION private.enforce_last_owner_protection();

CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.tenant_memberships FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

CREATE TRIGGER trg_enforce_tenancy_immutability BEFORE UPDATE ON public.works FOR EACH ROW EXECUTE FUNCTION private.enforce_tenancy_immutability();

-- OMITTED TRIGGER realtime.subscription.tr_check_filters: Supabase-managed schema
-- OMITTED TRIGGER storage.buckets.enforce_bucket_name_length_trigger: Supabase-managed schema
-- OMITTED TRIGGER storage.buckets.protect_bucket_control_insert: Supabase-managed schema
-- OMITTED TRIGGER storage.buckets.protect_bucket_control_update: Supabase-managed schema
-- OMITTED TRIGGER storage.buckets.protect_bucket_control_update_role: Supabase-managed schema
-- OMITTED TRIGGER storage.buckets.protect_buckets_delete: Supabase-managed schema
-- OMITTED TRIGGER storage.objects.protect_objects_delete: Supabase-managed schema
-- OMITTED TRIGGER storage.objects.update_objects_updated_at: Supabase-managed schema

-- ==========================================
-- SECTION 16: RLS ENABLE / FORCE
-- ==========================================
-- OMITTED RLS auth.audit_log_entries: Supabase-managed schema
-- OMITTED RLS auth.flow_state: Supabase-managed schema
-- OMITTED RLS auth.identities: Supabase-managed schema
-- OMITTED RLS auth.instances: Supabase-managed schema
-- OMITTED RLS auth.mfa_amr_claims: Supabase-managed schema
-- OMITTED RLS auth.mfa_challenges: Supabase-managed schema
-- OMITTED RLS auth.mfa_factors: Supabase-managed schema
-- OMITTED RLS auth.one_time_tokens: Supabase-managed schema
-- OMITTED RLS auth.refresh_tokens: Supabase-managed schema
-- OMITTED RLS auth.saml_providers: Supabase-managed schema
-- OMITTED RLS auth.saml_relay_states: Supabase-managed schema
-- OMITTED RLS auth.schema_migrations: Supabase-managed schema
-- OMITTED RLS auth.sessions: Supabase-managed schema
-- OMITTED RLS auth.sso_domains: Supabase-managed schema
-- OMITTED RLS auth.sso_providers: Supabase-managed schema
-- OMITTED RLS auth.users: Supabase-managed schema
ALTER TABLE public.accounting_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_fiscal_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_request_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_request_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_authentication_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_daily_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_employee_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_face_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_feature_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calc_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comp_off_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_bank_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_company_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_esi_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_field_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_nominees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_pf_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_structure_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_salary_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_tax_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_received_note_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goods_received_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_calendar_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holiday_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_policy_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_adjustment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_fulfilment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_item_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_item_match_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservation_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_stock_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_request_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_boq_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.master_boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_ai_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_document_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_document_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_extraction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_hsn_tax_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_item_match_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_item_matching_benchmark_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_item_matching_benchmark_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_item_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_normalization_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mep_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_bank_file_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_bank_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_payment_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_payment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_payment_reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_run_accounting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_run_item_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_run_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_statutory_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_statutory_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tax_previous_employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_tds_tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procurement_accounting_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforma_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proforma_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_application_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruitment_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_document_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stage_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_company_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.v_secdef_count ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_off_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;
-- OMITTED RLS realtime.messages: Supabase-managed schema
-- OMITTED RLS storage.buckets: Supabase-managed schema
-- OMITTED RLS storage.buckets_analytics: Supabase-managed schema
-- OMITTED RLS storage.buckets_vectors: Supabase-managed schema
-- OMITTED RLS storage.migrations: Supabase-managed schema
-- OMITTED RLS storage.objects: Supabase-managed schema
-- OMITTED RLS storage.s3_multipart_uploads: Supabase-managed schema
-- OMITTED RLS storage.s3_multipart_uploads_parts: Supabase-managed schema
-- OMITTED RLS storage.vector_indexes: Supabase-managed schema

-- ==========================================
-- SECTION 17: RLS POLICIES
-- ==========================================
CREATE POLICY "accounting_bank_accounts_select" ON public.accounting_bank_accounts AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "accounting_bank_transactions_select" ON public.accounting_bank_transactions AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "accounting_fiscal_periods_select" ON public.accounting_fiscal_periods AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "accounting_journal_entries_select" ON public.accounting_journal_entries AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "accounting_journal_lines_select" ON public.accounting_journal_lines AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM accounting_journal_entries e
  WHERE ((e.id = accounting_journal_lines.journal_entry_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "approval_request_actions_tenant_access" ON public.approval_request_actions AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "approval_request_steps_tenant_access" ON public.approval_request_steps AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "approval_requests_tenant_access" ON public.approval_requests AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "approval_workflow_steps_tenant_access" ON public.approval_workflow_steps AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM approval_workflows aw
  WHERE ((aw.id = approval_workflow_steps.approval_workflow_id) AND private.has_company_access(aw.tenant_id, aw.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM approval_workflows aw
  WHERE ((aw.id = approval_workflow_steps.approval_workflow_id) AND private.has_company_access(aw.tenant_id, aw.tenant_company_id)))));
CREATE POLICY "approval_workflows_tenant_access" ON public.approval_workflows AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_auth_events_insert" ON public.attendance_authentication_events AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_auth_events_select" ON public.attendance_authentication_events AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_auth_events_update" ON public.attendance_authentication_events AS PERMISSIVE FOR UPDATE TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_company_access" ON public.attendance_daily_records AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_company_access" ON public.attendance_devices AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_company_access" ON public.attendance_employee_shifts AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_events_insert" ON public.attendance_events AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_events_select" ON public.attendance_events AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_events_update" ON public.attendance_events AS PERMISSIVE FOR UPDATE TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_face_profiles_delete_blocked" ON public.attendance_face_profiles AS PERMISSIVE FOR DELETE TO authenticated USING (false);
CREATE POLICY "attendance_face_profiles_insert_blocked" ON public.attendance_face_profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (false);
CREATE POLICY "attendance_face_profiles_select" ON public.attendance_face_profiles AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_face_profiles_update_blocked" ON public.attendance_face_profiles AS PERMISSIVE FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "attendance_company_access" ON public.attendance_feature_settings AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_policies_tenant_access" ON public.attendance_policies AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "attendance_company_access" ON public.attendance_shifts AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "interviews_tenant_access" ON public.candidate_interviews AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "onboarding_tenant_access" ON public.candidate_onboarding AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "chart_of_accounts_select" ON public.chart_of_accounts AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "comp_off_policies_tenant_access" ON public.comp_off_policies AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Clients - Delete for Admin" ON public.companies AS PERMISSIVE FOR DELETE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Clients - Insert for Manager" ON public.companies AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Clients - Select for Access" ON public.companies AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Clients - Update for Manager" ON public.companies AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "CRM Access Companies" ON public.companies AS PERMISSIVE FOR ALL TO public USING ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid))) = ANY (ARRAY['admin'::text, 'crm_team'::text])));
CREATE POLICY "Enable read access for all users" ON public.companies AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "owner_company_addresses" ON public.company_addresses AS PERMISSIVE FOR ALL TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "owner_company_bank_profiles" ON public.company_bank_profiles AS PERMISSIVE FOR ALL TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "owner_company_branding" ON public.company_branding AS PERMISSIVE FOR ALL TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "owner_company_contacts" ON public.company_contacts AS PERMISSIVE FOR ALL TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "owner_company_documents" ON public.company_documents AS PERMISSIVE FOR ALL TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "owner_company_profiles" ON public.company_profiles AS PERMISSIVE FOR ALL TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "owner_company_registrations" ON public.company_registrations AS PERMISSIVE FOR ALL TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "owner_company_settings_audit" ON public.company_settings_audit AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "owner_company_settings" ON public.company_settings AS PERMISSIVE FOR ALL TO authenticated USING (private.has_action_permission(tenant_id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(tenant_id, 'OWNER'::text));
CREATE POLICY "crm_contacts_tenant_access" ON public.contacts AS PERMISSIVE FOR ALL TO authenticated USING ((tenant_id IN ( SELECT tm.tenant_id
   FROM tenant_memberships tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.status = 'active'::text))))) WITH CHECK ((tenant_id IN ( SELECT tm.tenant_id
   FROM tenant_memberships tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.status = 'active'::text)))));
CREATE POLICY "crm_customer_profiles_owner_manager_all" ON public.crm_customer_profiles AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "departments_insert" ON public.departments AS PERMISSIVE FOR INSERT TO public WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "departments_select" ON public.departments AS PERMISSIVE FOR SELECT TO public USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "departments_update" ON public.departments AS PERMISSIVE FOR UPDATE TO public USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "designations_insert" ON public.designations AS PERMISSIVE FOR INSERT TO public WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "designations_select" ON public.designations AS PERMISSIVE FOR SELECT TO public USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "designations_update" ON public.designations AS PERMISSIVE FOR UPDATE TO public USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "Documents - Delete for Admin" ON public.documents AS PERMISSIVE FOR DELETE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Documents - Insert for Team" ON public.documents AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'TEAM'::text)));
CREATE POLICY "Documents - Select for Access" ON public.documents AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "employee_bank_insert" ON public.employee_bank_accounts AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_bank_accounts.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_bank_select" ON public.employee_bank_accounts AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_bank_accounts.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_bank_update" ON public.employee_bank_accounts AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_bank_accounts.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_bank_accounts.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_categories_tenant_access" ON public.employee_categories AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "employee_assignments_insert" ON public.employee_company_assignments AS PERMISSIVE FOR INSERT TO public WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "employee_assignments_select" ON public.employee_company_assignments AS PERMISSIVE FOR SELECT TO public USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "employee_assignments_update" ON public.employee_company_assignments AS PERMISSIVE FOR UPDATE TO public USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "employee_dependents_insert" ON public.employee_dependents AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_dependents.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_dependents_select" ON public.employee_dependents AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_dependents.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_dependents_update" ON public.employee_dependents AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_dependents.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_dependents.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_documents_insert" ON public.employee_documents AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_documents.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_documents_select" ON public.employee_documents AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_documents.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_documents_update" ON public.employee_documents AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_documents.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_documents.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_esi_insert" ON public.employee_esi_details AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_esi_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_esi_select" ON public.employee_esi_details AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_esi_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_esi_update" ON public.employee_esi_details AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_esi_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_esi_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_field_configs_insert" ON public.employee_field_configurations AS PERMISSIVE FOR INSERT TO public WITH CHECK ((private.has_action_permission(tenant_id, 'ADMIN'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "employee_field_configs_select" ON public.employee_field_configurations AS PERMISSIVE FOR SELECT TO public USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "employee_field_configs_update" ON public.employee_field_configurations AS PERMISSIVE FOR UPDATE TO public USING ((private.has_action_permission(tenant_id, 'ADMIN'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'ADMIN'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "employee_field_definitions_insert" ON public.employee_field_definitions AS PERMISSIVE FOR INSERT TO public WITH CHECK (((tenant_id IS NOT NULL) AND private.has_action_permission(tenant_id, 'ADMIN'::text) AND (is_system = false)));
CREATE POLICY "employee_field_definitions_select" ON public.employee_field_definitions AS PERMISSIVE FOR SELECT TO public USING ((((tenant_id IS NULL) AND (is_system = true)) OR ((tenant_id IS NOT NULL) AND (EXISTS ( SELECT 1
   FROM tenant_memberships tm
  WHERE ((tm.tenant_id = employee_field_definitions.tenant_id) AND (tm.user_id = auth.uid()) AND (tm.status = 'active'::text)))))));
CREATE POLICY "employee_field_definitions_update" ON public.employee_field_definitions AS PERMISSIVE FOR UPDATE TO public USING (((tenant_id IS NOT NULL) AND private.has_action_permission(tenant_id, 'ADMIN'::text) AND (is_system = false))) WITH CHECK (((tenant_id IS NOT NULL) AND private.has_action_permission(tenant_id, 'ADMIN'::text) AND (is_system = false)));
CREATE POLICY "employee_field_values_insert" ON public.employee_field_values AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_field_values.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_field_values_select" ON public.employee_field_values AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_field_values.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_field_values_update" ON public.employee_field_values AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_field_values.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_field_values.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_nominees_insert" ON public.employee_nominees AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_nominees.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_nominees_select" ON public.employee_nominees AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_nominees.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_nominees_update" ON public.employee_nominees AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_nominees.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_nominees.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_pf_insert" ON public.employee_pf_details AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_pf_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_pf_select" ON public.employee_pf_details AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_pf_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_pf_update" ON public.employee_pf_details AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_pf_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_pf_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_salary_structure_items_insert" ON public.employee_salary_structure_items AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "employee_salary_structure_items_select" ON public.employee_salary_structure_items AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "employee_salary_structure_items_update" ON public.employee_salary_structure_items AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "employee_salary_structures_insert" ON public.employee_salary_structures AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "employee_salary_structures_select" ON public.employee_salary_structures AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "employee_salary_structures_update" ON public.employee_salary_structures AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "employee_tax_insert" ON public.employee_tax_details AS PERMISSIVE FOR INSERT TO public WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_tax_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_tax_select" ON public.employee_tax_details AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_tax_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employee_tax_update" ON public.employee_tax_details AS PERMISSIVE FOR UPDATE TO public USING ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_tax_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = employee_tax_details.employee_id) AND private.has_company_access(e.tenant_id, e.tenant_company_id)))));
CREATE POLICY "employees_insert" ON public.employees AS PERMISSIVE FOR INSERT TO public WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "employees_select" ON public.employees AS PERMISSIVE FOR SELECT TO public USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "employees_update" ON public.employees AS PERMISSIVE FOR UPDATE TO public USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "crm_enquiries_tenant_access" ON public.enquiries AS PERMISSIVE FOR ALL TO authenticated USING ((tenant_id IN ( SELECT tm.tenant_id
   FROM tenant_memberships tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.status = 'active'::text))))) WITH CHECK ((tenant_id IN ( SELECT tm.tenant_id
   FROM tenant_memberships tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.status = 'active'::text)))));
CREATE POLICY "file_attachments_insert_company_access" ON public.file_attachments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "file_attachments_select_company_access" ON public.file_attachments AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "file_attachments_update_company_access" ON public.file_attachments AS PERMISSIVE FOR UPDATE TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "crm_follow_ups_tenant_access" ON public.follow_ups AS PERMISSIVE FOR ALL TO authenticated USING ((tenant_id IN ( SELECT tm.tenant_id
   FROM tenant_memberships tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.status = 'active'::text))))) WITH CHECK ((tenant_id IN ( SELECT tm.tenant_id
   FROM tenant_memberships tm
  WHERE ((tm.user_id = auth.uid()) AND (tm.status = 'active'::text)))));
CREATE POLICY "grn_items_select" ON public.goods_received_note_items AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "grn_select" ON public.goods_received_notes AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "grn_write" ON public.goods_received_notes AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "holiday_calendar_days_tenant_access" ON public.holiday_calendar_days AS PERMISSIVE FOR ALL TO authenticated USING ((EXISTS ( SELECT 1
   FROM holiday_calendars hc
  WHERE ((hc.id = holiday_calendar_days.holiday_calendar_id) AND private.has_company_access(hc.tenant_id, hc.tenant_company_id))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM holiday_calendars hc
  WHERE ((hc.id = holiday_calendar_days.holiday_calendar_id) AND private.has_company_access(hc.tenant_id, hc.tenant_company_id)))));
CREATE POLICY "holiday_calendars_tenant_access" ON public.holiday_calendars AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "hr_policy_sets_tenant_access" ON public.hr_policy_sets AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "inventory_adjustment_requests_select" ON public.inventory_adjustment_requests AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "inventory_fulfilment_lines_read" ON public.inventory_fulfilment_lines AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(inventory_fulfilment_lines.tenant_id, inventory_fulfilment_lines.tenant_company_id) AS has_company_access));
CREATE POLICY "inventory_item_aliases_select" ON public.inventory_item_aliases AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(inventory_item_aliases.tenant_id, inventory_item_aliases.tenant_company_id) AS has_company_access));
CREATE POLICY "inventory_item_match_feedback_select" ON public.inventory_item_match_feedback AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(inventory_item_match_feedback.tenant_id, inventory_item_match_feedback.tenant_company_id) AS has_company_access));
CREATE POLICY "inventory_items_select" ON public.inventory_items AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(inventory_items.tenant_id, inventory_items.tenant_company_id) AS has_company_access));
CREATE POLICY "inventory_locations_select" ON public.inventory_locations AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(inventory_locations.tenant_id, inventory_locations.tenant_company_id) AS has_company_access));
CREATE POLICY "inventory_reservation_actions_read" ON public.inventory_reservation_actions AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT private.has_company_access(inventory_reservation_actions.tenant_id, inventory_reservation_actions.tenant_company_id) AS has_company_access) AND ( SELECT private.has_action_permission(inventory_reservation_actions.tenant_id, 'VIEWER'::text) AS has_action_permission)));
CREATE POLICY "inventory_reservation_lines_read" ON public.inventory_reservation_lines AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT private.has_company_access(inventory_reservation_lines.tenant_id, inventory_reservation_lines.tenant_company_id) AS has_company_access) AND ( SELECT private.has_action_permission(inventory_reservation_lines.tenant_id, 'VIEWER'::text) AS has_action_permission)));
CREATE POLICY "inventory_reservations_read" ON public.inventory_reservations AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT private.has_company_access(inventory_reservations.tenant_id, inventory_reservations.tenant_company_id) AS has_company_access) AND ( SELECT private.has_action_permission(inventory_reservations.tenant_id, 'VIEWER'::text) AS has_action_permission)));
CREATE POLICY "inventory_stock_balances_select" ON public.inventory_stock_balances AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(inventory_stock_balances.tenant_id, inventory_stock_balances.tenant_company_id) AS has_company_access));
CREATE POLICY "inventory_transaction_lines_select" ON public.inventory_transaction_lines AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(inventory_transaction_lines.tenant_id, inventory_transaction_lines.tenant_company_id) AS has_company_access));
CREATE POLICY "inventory_transactions_select" ON public.inventory_transactions AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(inventory_transactions.tenant_id, inventory_transactions.tenant_company_id) AS has_company_access));
CREATE POLICY "Enable all for authenticated users" ON public.issues AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Enable read access for all users" ON public.issues AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Issues - Delete for Admin" ON public.issues AS PERMISSIVE FOR DELETE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Issues - Insert for Team" ON public.issues AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'TEAM'::text)));
CREATE POLICY "Issues - Select for Access" ON public.issues AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Issues - Update for Manager" ON public.issues AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "job_positions_tenant_access" ON public.job_positions AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "leave_company_access_p0" ON public.leave_balances AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "leave_ledger_insert_p0" ON public.leave_ledger AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "leave_ledger_select_p0" ON public.leave_ledger AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "leave_policy_rules_tenant_access" ON public.leave_policy_rules AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "leave_company_access_p0" ON public.leave_request_days AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "leave_company_access_p0" ON public.leave_requests AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "leave_types_tenant_access" ON public.leave_types AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Enable all for authenticated users" ON public.logs AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Enable read access for all users" ON public.logs AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Logs - Delete for Admin" ON public.logs AS PERMISSIVE FOR DELETE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Logs - Insert for Team" ON public.logs AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'TEAM'::text)));
CREATE POLICY "Logs - Select for Access" ON public.logs AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Logs - Update for Manager" ON public.logs AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "master_boq_lines_select" ON public.master_boq_lines AS PERMISSIVE FOR SELECT TO public USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "master_boq_lines_write" ON public.master_boq_lines AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "master_boqs_select" ON public.master_boqs AS PERMISSIVE FOR SELECT TO public USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "master_boqs_write" ON public.master_boqs AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "mep_ai_corrections_select" ON public.mep_ai_corrections AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "mep_attribute_definitions_select" ON public.mep_attribute_definitions AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "mep_document_examples_select" ON public.mep_document_examples AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "mep_document_extractions_select" ON public.mep_document_extractions AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "mep_domains_select" ON public.mep_domains AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "mep_extraction_lines_select" ON public.mep_extraction_lines AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "mep_hsn_tax_mappings_select" ON public.mep_hsn_tax_mappings AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "mep_item_categories_select" ON public.mep_item_categories AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "mep_item_match_candidates_select" ON public.mep_item_match_candidates AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(mep_item_match_candidates.tenant_id, mep_item_match_candidates.tenant_company_id) AS has_company_access));
CREATE POLICY "mep_item_matching_benchmark_cases_select" ON public.mep_item_matching_benchmark_cases AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "mep_item_matching_benchmark_cases_write" ON public.mep_item_matching_benchmark_cases AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "mep_item_matching_benchmark_runs_select" ON public.mep_item_matching_benchmark_runs AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "mep_item_matching_benchmark_runs_write" ON public.mep_item_matching_benchmark_runs AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "mep_item_specifications_select" ON public.mep_item_specifications AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(mep_item_specifications.tenant_id, mep_item_specifications.tenant_company_id) AS has_company_access));
CREATE POLICY "mep_normalization_rules_select" ON public.mep_normalization_rules AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "mep_units_select" ON public.mep_units AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "notifications_actor_insert" ON public.notifications AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((actor_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "notifications_actor_insert_access" ON public.notifications AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((actor_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "notifications_recipient_select" ON public.notifications AS RESTRICTIVE FOR SELECT TO authenticated USING ((recipient_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "notifications_recipient_select_access" ON public.notifications AS PERMISSIVE FOR SELECT TO authenticated USING ((recipient_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "notifications_recipient_update" ON public.notifications AS RESTRICTIVE FOR UPDATE TO authenticated USING ((recipient_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((recipient_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "notifications_recipient_update_access" ON public.notifications AS PERMISSIVE FOR UPDATE TO authenticated USING ((recipient_id = ( SELECT auth.uid() AS uid))) WITH CHECK ((recipient_id = ( SELECT auth.uid() AS uid)));
CREATE POLICY "overtime_policies_tenant_access" ON public.overtime_policies AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "payroll_account_mappings_insert" ON public.payroll_account_mappings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "payroll_account_mappings_select" ON public.payroll_account_mappings AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "payroll_account_mappings_update" ON public.payroll_account_mappings AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "payroll_bank_file_profiles_select" ON public.payroll_bank_file_profiles AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "payroll_bank_files_select" ON public.payroll_bank_files AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "payroll_components_insert" ON public.payroll_components AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_components_select" ON public.payroll_components AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_components_update" ON public.payroll_components AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_payment_batches_select" ON public.payroll_payment_batches AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(payroll_payment_batches.tenant_id, payroll_payment_batches.tenant_company_id) AS has_company_access));
CREATE POLICY "payroll_payment_items_select" ON public.payroll_payment_items AS PERMISSIVE FOR SELECT TO authenticated USING (( SELECT private.has_company_access(payroll_payment_items.tenant_id, payroll_payment_items.tenant_company_id) AS has_company_access));
CREATE POLICY "payroll_payment_reconciliations_select" ON public.payroll_payment_reconciliations AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "payroll_payslips_select" ON public.payroll_payslips AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "payroll_periods_insert" ON public.payroll_periods AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_periods_select" ON public.payroll_periods AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_periods_update" ON public.payroll_periods AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_run_accounting_select" ON public.payroll_run_accounting AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "payroll_run_item_components_insert" ON public.payroll_run_item_components AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_run_item_components_select" ON public.payroll_run_item_components AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_run_item_components_update" ON public.payroll_run_item_components AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_run_items_insert" ON public.payroll_run_items AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_run_items_select" ON public.payroll_run_items AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_run_items_update" ON public.payroll_run_items AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_runs_insert" ON public.payroll_runs AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_runs_select" ON public.payroll_runs AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_runs_update" ON public.payroll_runs AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_settings_insert" ON public.payroll_settings AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_settings_select" ON public.payroll_settings AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_settings_update" ON public.payroll_settings AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_statutory_rules_insert" ON public.payroll_statutory_rules AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_statutory_rules_select" ON public.payroll_statutory_rules AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_statutory_rules_update" ON public.payroll_statutory_rules AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id))) WITH CHECK ((private.has_action_permission(tenant_id, 'MANAGER'::text) AND private.has_company_access(tenant_id, tenant_company_id)));
CREATE POLICY "payroll_statutory_settlements_select" ON public.payroll_statutory_settlements AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "payroll_tax_certificates_select" ON public.payroll_tax_certificates AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "payroll_tax_declarations_insert" ON public.payroll_tax_declarations AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = payroll_tax_declarations.employee_id) AND (e.tenant_id = payroll_tax_declarations.tenant_id) AND (e.tenant_company_id = payroll_tax_declarations.tenant_company_id) AND (e.linked_user_id = auth.uid())))))));
CREATE POLICY "payroll_tax_declarations_select" ON public.payroll_tax_declarations AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = payroll_tax_declarations.employee_id) AND (e.tenant_id = payroll_tax_declarations.tenant_id) AND (e.tenant_company_id = payroll_tax_declarations.tenant_company_id) AND (e.linked_user_id = auth.uid())))))));
CREATE POLICY "payroll_tax_declarations_update_employee_draft" ON public.payroll_tax_declarations AS PERMISSIVE FOR UPDATE TO authenticated USING (((declaration_status = 'draft'::text) AND private.has_company_access(tenant_id, tenant_company_id) AND (EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = payroll_tax_declarations.employee_id) AND (e.tenant_id = payroll_tax_declarations.tenant_id) AND (e.tenant_company_id = payroll_tax_declarations.tenant_company_id) AND (e.linked_user_id = auth.uid())))))) WITH CHECK (((declaration_status = ANY (ARRAY['draft'::text, 'submitted'::text])) AND private.has_company_access(tenant_id, tenant_company_id) AND (EXISTS ( SELECT 1
   FROM employees e
  WHERE ((e.id = payroll_tax_declarations.employee_id) AND (e.tenant_id = payroll_tax_declarations.tenant_id) AND (e.tenant_company_id = payroll_tax_declarations.tenant_company_id) AND (e.linked_user_id = auth.uid()))))));
CREATE POLICY "payroll_tax_declarations_update_management" ON public.payroll_tax_declarations AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "payroll_tax_previous_employers_insert" ON public.payroll_tax_previous_employers AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (EXISTS ( SELECT 1
   FROM payroll_tax_declarations d
  WHERE ((d.id = payroll_tax_previous_employers.tax_declaration_id) AND (d.tenant_id = payroll_tax_previous_employers.tenant_id) AND (d.tenant_company_id = payroll_tax_previous_employers.tenant_company_id) AND (private.has_action_permission(d.tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
           FROM employees e
          WHERE ((e.id = d.employee_id) AND (e.tenant_id = d.tenant_id) AND (e.tenant_company_id = d.tenant_company_id) AND (e.linked_user_id = auth.uid()))))))))));
CREATE POLICY "payroll_tax_previous_employers_select" ON public.payroll_tax_previous_employers AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND (EXISTS ( SELECT 1
   FROM payroll_tax_declarations d
  WHERE ((d.id = payroll_tax_previous_employers.tax_declaration_id) AND (d.tenant_id = payroll_tax_previous_employers.tenant_id) AND (d.tenant_company_id = payroll_tax_previous_employers.tenant_company_id) AND (private.has_action_permission(d.tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
           FROM employees e
          WHERE ((e.id = d.employee_id) AND (e.tenant_id = d.tenant_id) AND (e.tenant_company_id = d.tenant_company_id) AND (e.linked_user_id = auth.uid()))))))))));
CREATE POLICY "payroll_tax_previous_employers_update_employee_draft" ON public.payroll_tax_previous_employers AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND (EXISTS ( SELECT 1
   FROM (payroll_tax_declarations d
     JOIN employees e ON ((e.id = d.employee_id)))
  WHERE ((d.id = payroll_tax_previous_employers.tax_declaration_id) AND (d.tenant_id = payroll_tax_previous_employers.tenant_id) AND (d.tenant_company_id = payroll_tax_previous_employers.tenant_company_id) AND (d.declaration_status = 'draft'::text) AND (e.tenant_id = d.tenant_id) AND (e.tenant_company_id = d.tenant_company_id) AND (e.linked_user_id = auth.uid())))))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (EXISTS ( SELECT 1
   FROM (payroll_tax_declarations d
     JOIN employees e ON ((e.id = d.employee_id)))
  WHERE ((d.id = payroll_tax_previous_employers.tax_declaration_id) AND (d.tenant_id = payroll_tax_previous_employers.tenant_id) AND (d.tenant_company_id = payroll_tax_previous_employers.tenant_company_id) AND (d.declaration_status = ANY (ARRAY['draft'::text, 'submitted'::text])) AND (e.tenant_id = d.tenant_id) AND (e.tenant_company_id = d.tenant_company_id) AND (e.linked_user_id = auth.uid()))))));
CREATE POLICY "payroll_tax_previous_employers_update_management" ON public.payroll_tax_previous_employers AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND (EXISTS ( SELECT 1
   FROM payroll_tax_declarations d
  WHERE ((d.id = payroll_tax_previous_employers.tax_declaration_id) AND (d.tenant_id = payroll_tax_previous_employers.tenant_id) AND (d.tenant_company_id = payroll_tax_previous_employers.tenant_company_id) AND private.has_action_permission(d.tenant_id, 'MANAGER'::text)))))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (EXISTS ( SELECT 1
   FROM payroll_tax_declarations d
  WHERE ((d.id = payroll_tax_previous_employers.tax_declaration_id) AND (d.tenant_id = payroll_tax_previous_employers.tenant_id) AND (d.tenant_company_id = payroll_tax_previous_employers.tenant_company_id) AND private.has_action_permission(d.tenant_id, 'MANAGER'::text))))));
CREATE POLICY "payroll_tds_tax_rules_insert" ON public.payroll_tds_tax_rules AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "payroll_tds_tax_rules_select" ON public.payroll_tds_tax_rules AS PERMISSIVE FOR SELECT TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "payroll_tds_tax_rules_update" ON public.payroll_tds_tax_rules AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Allow all authenticated users to read profiles" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (true);
CREATE POLICY "Profiles - Insert Self" ON public.profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((id = auth.uid()));
CREATE POLICY "Profiles - Select Self or Tenant Peer" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING (((id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (tenant_memberships tm1
     JOIN tenant_memberships tm2 ON ((tm1.tenant_id = tm2.tenant_id)))
  WHERE ((tm1.user_id = auth.uid()) AND (tm2.user_id = profiles.id))))));
CREATE POLICY "Profiles - Update Self Metadata Only" ON public.profiles AS PERMISSIVE FOR UPDATE TO authenticated USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));
CREATE POLICY "Users can read own profile" ON public.profiles AS PERMISSIVE FOR SELECT TO authenticated USING ((( SELECT auth.uid() AS uid) = id));
CREATE POLICY "proforma_invoice_items_read" ON public.proforma_invoice_items AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "proforma_invoice_items_write" ON public.proforma_invoice_items AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "proforma_invoices_read" ON public.proforma_invoices AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "proforma_invoices_write" ON public.proforma_invoices AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Project Assignments - Insert for Manager" ON public.project_assignments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text) AND (assigned_by = auth.uid())));
CREATE POLICY "Project Assignments - Select for OpCo Access" ON public.project_assignments AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Project Assignments - Update for Manager" ON public.project_assignments AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "pb_items_select" ON public.purchase_bill_items AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "pb_select" ON public.purchase_bills AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "pb_write" ON public.purchase_bills AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "po_items_select" ON public.purchase_order_items AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "po_select" ON public.purchase_orders AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "po_write" ON public.purchase_orders AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "purchase_payments_select" ON public.purchase_payments AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "purchase_payments_write" ON public.purchase_payments AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "pr_items_select" ON public.purchase_request_items AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "pr_select" ON public.purchase_requests AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "pr_write" ON public.purchase_requests AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "recruitment_links_tenant_access" ON public.recruitment_application_links AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "candidates_tenant_access" ON public.recruitment_candidates AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Enable all for authenticated users" ON public.reminders AS PERMISSIVE FOR ALL TO public USING ((auth.role() = 'authenticated'::text));
CREATE POLICY "Reminders - Delete for Manager" ON public.reminders AS PERMISSIVE FOR DELETE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Reminders - Insert for Team" ON public.reminders AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'TEAM'::text)));
CREATE POLICY "Reminders - Select for Access" ON public.reminders AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Reminders - Update for Team" ON public.reminders AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'TEAM'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'TEAM'::text)));
CREATE POLICY "reminders_personal_owner_delete" ON public.reminders AS RESTRICTIVE FOR DELETE TO authenticated USING ((created_by = ( SELECT auth.uid() AS uid)));
CREATE POLICY "reminders_personal_owner_insert" ON public.reminders AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK ((created_by = ( SELECT auth.uid() AS uid)));
CREATE POLICY "reminders_personal_owner_select" ON public.reminders AS RESTRICTIVE FOR SELECT TO authenticated USING ((created_by = ( SELECT auth.uid() AS uid)));
CREATE POLICY "reminders_personal_owner_update" ON public.reminders AS RESTRICTIVE FOR UPDATE TO authenticated USING ((created_by = ( SELECT auth.uid() AS uid))) WITH CHECK ((created_by = ( SELECT auth.uid() AS uid)));
CREATE POLICY "rfq_select" ON public.rfqs AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "rfq_write" ON public.rfqs AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "sales_order_items_read" ON public.sales_order_items AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "sales_order_items_write" ON public.sales_order_items AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "sales_orders_read" ON public.sales_orders AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "sales_orders_write" ON public.sales_orders AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "sales_payments_read" ON public.sales_payments AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "sales_payments_write" ON public.sales_payments AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "sales_quotation_items_read" ON public.sales_quotation_items AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "sales_quotation_items_write" ON public.sales_quotation_items AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "sales_quotations_read" ON public.sales_quotations AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "sales_quotations_write" ON public.sales_quotations AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Stage Assignments - Insert for Manager or Project Lead" ON public.stage_assignments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM project_assignments pa
  WHERE ((pa.tenant_id = stage_assignments.tenant_id) AND (pa.tenant_company_id = stage_assignments.tenant_company_id) AND (pa.work_id = stage_assignments.work_id) AND (pa.user_id = auth.uid()) AND (pa.project_role = 'lead'::text) AND (pa.status = 'active'::text)))))));
CREATE POLICY "Stage Assignments - Select for OpCo Access" ON public.stage_assignments AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Stage Assignments - Update for Manager or Project Lead" ON public.stage_assignments AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM project_assignments pa
  WHERE ((pa.tenant_id = stage_assignments.tenant_id) AND (pa.tenant_company_id = stage_assignments.tenant_company_id) AND (pa.work_id = stage_assignments.work_id) AND (pa.user_id = auth.uid()) AND (pa.project_role = 'lead'::text) AND (pa.status = 'active'::text))))))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM project_assignments pa
  WHERE ((pa.tenant_id = stage_assignments.tenant_id) AND (pa.tenant_company_id = stage_assignments.tenant_company_id) AND (pa.work_id = stage_assignments.work_id) AND (pa.user_id = auth.uid()) AND (pa.project_role = 'lead'::text) AND (pa.status = 'active'::text)))))));
CREATE POLICY "Stage Definitions - Insert for Manager" ON public.stage_definitions AS PERMISSIVE FOR INSERT TO public WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Stage Definitions - Select for OpCo Access" ON public.stage_definitions AS PERMISSIVE FOR SELECT TO public USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Stage Definitions - Update for Manager" ON public.stage_definitions AS PERMISSIVE FOR UPDATE TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Task Assignees - Insert for Manager or Project Lead" ON public.task_assignees AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM project_assignments pa
  WHERE ((pa.tenant_id = task_assignees.tenant_id) AND (pa.tenant_company_id = task_assignees.tenant_company_id) AND (pa.work_id = ( SELECT t.work_id
           FROM tasks t
          WHERE (t.id = task_assignees.task_id))) AND (pa.user_id = auth.uid()) AND (pa.project_role = 'lead'::text) AND (pa.status = 'active'::text))))) AND (assigned_by = auth.uid()) AND (EXISTS ( SELECT 1
   FROM (project_assignments pa
     JOIN tasks t ON ((t.id = task_assignees.task_id)))
  WHERE ((pa.tenant_id = task_assignees.tenant_id) AND (pa.tenant_company_id = task_assignees.tenant_company_id) AND (pa.work_id = t.work_id) AND (pa.user_id = task_assignees.user_id) AND (pa.status = 'active'::text)))) AND ((role <> 'accountable'::text) OR (EXISTS ( SELECT 1
   FROM (stage_assignments sa
     JOIN tasks t ON ((t.id = task_assignees.task_id)))
  WHERE ((t.stage_id IS NOT NULL) AND (sa.tenant_id = task_assignees.tenant_id) AND (sa.tenant_company_id = task_assignees.tenant_company_id) AND (sa.work_id = t.work_id) AND (sa.stage_id = t.stage_id) AND (sa.user_id = task_assignees.user_id) AND (sa.status = 'active'::text)))) OR (EXISTS ( SELECT 1
   FROM tasks t
  WHERE ((t.id = task_assignees.task_id) AND (t.stage_id IS NULL)))))));
CREATE POLICY "Task Assignees - Select for OpCo Access" ON public.task_assignees AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Task Assignees - Update for Manager or Project Lead" ON public.task_assignees AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM (project_assignments pa
     JOIN tasks t ON ((t.id = task_assignees.task_id)))
  WHERE ((pa.tenant_id = task_assignees.tenant_id) AND (pa.tenant_company_id = task_assignees.tenant_company_id) AND (pa.work_id = t.work_id) AND (pa.user_id = auth.uid()) AND (pa.project_role = 'lead'::text) AND (pa.status = 'active'::text))))))) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Tasks - Insert for Manager or Project Lead" ON public.tasks AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM project_assignments pa
  WHERE ((pa.tenant_id = tasks.tenant_id) AND (pa.tenant_company_id = tasks.tenant_company_id) AND (pa.work_id = tasks.work_id) AND (pa.user_id = auth.uid()) AND (pa.project_role = 'lead'::text) AND (pa.status = 'active'::text))))) AND (created_by = auth.uid())));
CREATE POLICY "Tasks - Select for OpCo Access" ON public.tasks AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Tasks - Update for Manager or Project Lead" ON public.tasks AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM project_assignments pa
  WHERE ((pa.tenant_id = tasks.tenant_id) AND (pa.tenant_company_id = tasks.tenant_company_id) AND (pa.work_id = tasks.work_id) AND (pa.user_id = auth.uid()) AND (pa.project_role = 'lead'::text) AND (pa.status = 'active'::text))))))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND (private.has_action_permission(tenant_id, 'MANAGER'::text) OR (EXISTS ( SELECT 1
   FROM project_assignments pa
  WHERE ((pa.tenant_id = tasks.tenant_id) AND (pa.tenant_company_id = tasks.tenant_company_id) AND (pa.work_id = tasks.work_id) AND (pa.user_id = auth.uid()) AND (pa.project_role = 'lead'::text) AND (pa.status = 'active'::text)))))));
CREATE POLICY "tax_invoice_items_read" ON public.tax_invoice_items AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "tax_invoice_items_write" ON public.tax_invoice_items AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "tax_invoices_read" ON public.tax_invoices AS PERMISSIVE FOR SELECT TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'VIEWER'::text)));
CREATE POLICY "tax_invoices_write" ON public.tax_invoices AS PERMISSIVE FOR ALL TO public USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Companies - Insert for Admin" ON public.tenant_companies AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.is_tenant_member(tenant_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Companies - Select for Access" ON public.tenant_companies AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, id));
CREATE POLICY "Companies - Update for Admin" ON public.tenant_companies AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, id) AND private.has_action_permission(tenant_id, 'ADMIN'::text))) WITH CHECK ((private.is_tenant_member(tenant_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Memberships - Delete for Admin/Owner" ON public.tenant_memberships AS PERMISSIVE FOR DELETE TO authenticated USING (private.can_manage_membership(tenant_id, role, role));
CREATE POLICY "Memberships - Insert for Admin/Owner" ON public.tenant_memberships AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (private.can_manage_membership(tenant_id, role, NULL::text));
CREATE POLICY "Memberships - Select for Tenant Members" ON public.tenant_memberships AS PERMISSIVE FOR SELECT TO authenticated USING (private.is_tenant_member(tenant_id));
CREATE POLICY "Memberships - Update for Admin/Owner" ON public.tenant_memberships AS PERMISSIVE FOR UPDATE TO authenticated USING (private.can_manage_membership(tenant_id, role, role)) WITH CHECK (private.can_manage_membership(tenant_id, role, role));
CREATE POLICY "Tenants - Select for Members" ON public.tenants AS PERMISSIVE FOR SELECT TO authenticated USING (private.is_tenant_member(id));
CREATE POLICY "Tenants - Update for Owners" ON public.tenants AS PERMISSIVE FOR UPDATE TO authenticated USING (private.has_action_permission(id, 'OWNER'::text)) WITH CHECK (private.has_action_permission(id, 'OWNER'::text));
CREATE POLICY "CRM Access Units" ON public.units AS PERMISSIVE FOR ALL TO public USING ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid))) = ANY (ARRAY['admin'::text, 'crm_team'::text])));
CREATE POLICY "Enable read access for all users" ON public.units AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Units - Delete for Admin" ON public.units AS PERMISSIVE FOR DELETE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Units - Insert for Manager" ON public.units AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Units - Select for Access" ON public.units AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Units - Update for Manager" ON public.units AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "User Company Access - Delete for Admin" ON public.user_company_access AS PERMISSIVE FOR DELETE TO authenticated USING ((private.is_tenant_member(tenant_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "User Company Access - Insert for Admin" ON public.user_company_access AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (private.has_action_permission(tenant_id, 'ADMIN'::text));
CREATE POLICY "User Company Access - Select for Tenant Members" ON public.user_company_access AS PERMISSIVE FOR SELECT TO authenticated USING (private.is_tenant_member(tenant_id));
CREATE POLICY "User Company Access - Update for Admin" ON public.user_company_access AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.is_tenant_member(tenant_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text))) WITH CHECK ((private.is_tenant_member(tenant_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "vendor_quote_items_select" ON public.vendor_quotation_items AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "vendor_quote_items_write" ON public.vendor_quotation_items AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "vendor_quote_select" ON public.vendor_quotations AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "vendors_select" ON public.vendors AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "vendors_write" ON public.vendors AS PERMISSIVE FOR ALL TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "weekly_off_policies_tenant_access" ON public.weekly_off_policies AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "work_locations_tenant_access" ON public.work_locations AS PERMISSIVE FOR ALL TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id)) WITH CHECK (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "CRM Access Works" ON public.works AS PERMISSIVE FOR ALL TO public USING ((( SELECT profiles.role
   FROM profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid))) = ANY (ARRAY['admin'::text, 'crm_team'::text])));
CREATE POLICY "Enable read access for all users" ON public.works AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "Works - Delete for Admin" ON public.works AS PERMISSIVE FOR DELETE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'ADMIN'::text)));
CREATE POLICY "Works - Insert for Manager" ON public.works AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
CREATE POLICY "Works - Select for Access" ON public.works AS PERMISSIVE FOR SELECT TO authenticated USING (private.has_company_access(tenant_id, tenant_company_id));
CREATE POLICY "Works - Update for Manager" ON public.works AS PERMISSIVE FOR UPDATE TO authenticated USING ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text))) WITH CHECK ((private.has_company_access(tenant_id, tenant_company_id) AND private.has_action_permission(tenant_id, 'MANAGER'::text)));
-- OMITTED POLICY storage.objects.Allow authenticated deletes: Supabase-managed schema
-- OMITTED POLICY storage.objects.Allow authenticated updates: Supabase-managed schema
-- OMITTED POLICY storage.objects.Allow authenticated uploads: Supabase-managed schema

-- ==========================================
-- SECTION 18: GRANTS / PRIVILEGES
-- ==========================================
-- (Skipping for local baseline deterministic safety)

-- ==========================================
-- SECTION 19: OWNERSHIP
-- ==========================================
-- (Skipping ownership to avoid role issues in local baselines)

