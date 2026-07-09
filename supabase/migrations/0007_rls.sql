-- 0007_rls.sql — Row Level Security. Default-deny; explicit allow per table.
-- Human plane only. Agents write via Worker service_role, which BYPASSES RLS by design.
-- Security boundary for anon/authed users. No table without an explicit policy.

-- Enable RLS everywhere.
alter table public.content            enable row level security;
alter table public.categories         enable row level security;
alter table public.content_categories enable row level security;
alter table public.translations       enable row level security;
alter table public.settings           enable row level security;
alter table public.comments           enable row level security;
alter table public.donations          enable row level security;
alter table public.donation_contacts  enable row level security;
alter table public.contacts           enable row level security;
alter table public.profiles           enable row level security;
alter table public.reading_events     enable row level security;
alter table public.slug_redirects     enable row level security;
alter table public.api_keys           enable row level security;
alter table public.agent_audit_log    enable row level security;

-- content: public reads published; admin does everything.
create policy content_public_read on public.content
  for select using (status = 'published');
create policy content_admin_all on public.content
  for all using (public.is_admin()) with check (public.is_admin());

-- categories / translations / settings / slug_redirects: public read, admin write.
create policy categories_public_read on public.categories for select using (true);
create policy categories_admin_all on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy cc_public_read on public.content_categories for select using (true);
create policy cc_admin_all on public.content_categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy translations_public_read on public.translations for select using (true);
create policy translations_admin_all on public.translations
  for all using (public.is_admin()) with check (public.is_admin());

create policy settings_public_read on public.settings for select using (true);
create policy settings_admin_all on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

create policy slug_redirects_public_read on public.slug_redirects for select using (true);
create policy slug_redirects_admin_all on public.slug_redirects
  for all using (public.is_admin()) with check (public.is_admin());

-- comments: public create + read visible; admin moderate.
create policy comments_public_read on public.comments
  for select using (status = 'visible');
create policy comments_public_insert on public.comments
  for insert with check (status = 'visible' or status = 'pending');
create policy comments_admin_all on public.comments
  for all using (public.is_admin()) with check (public.is_admin());

-- donations: public create pending; public read approved only; admin moderate.
create policy donations_public_read on public.donations
  for select using (status = 'approved');
create policy donations_public_insert on public.donations
  for insert with check (status = 'pending');
create policy donations_admin_all on public.donations
  for all using (public.is_admin()) with check (public.is_admin());

-- donation_contacts (PII): public create; NO anon read; admin only read.
create policy donation_contacts_public_insert on public.donation_contacts
  for insert with check (true);
create policy donation_contacts_admin_read on public.donation_contacts
  for select using (public.is_admin());
create policy donation_contacts_admin_all on public.donation_contacts
  for all using (public.is_admin()) with check (public.is_admin());

-- contacts: public create, admin read.
create policy contacts_public_insert on public.contacts
  for insert with check (true);
create policy contacts_admin_read on public.contacts
  for select using (public.is_admin());

-- profiles: self read + admin read; self update non-role fields; admin all.
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- reading_events: public INSERT only (write-only telemetry, no read for anon).
create policy reading_events_public_insert on public.reading_events
  for insert with check (true);
create policy reading_events_admin_read on public.reading_events
  for select using (public.is_admin());

-- api_keys / agent_audit_log: no policies for anon/authed → default deny.
-- Only service_role (Worker) touches these; service_role bypasses RLS.
