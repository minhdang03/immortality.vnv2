-- 0014_content_id_default.sql — content.id default for agent-created rows.
-- Original schema kept id = Firestore doc id (no default) for the migration import.
-- Agent write plane (Worker /v1/content) inserts new rows without an id →
-- not-null violation. Add gen_random_uuid()::text default (same pattern as
-- api_keys/agent_audit_log). Existing Firestore ids are untouched; explicit
-- ids still win over the default.

alter table public.content
  alter column id set default gen_random_uuid()::text;
