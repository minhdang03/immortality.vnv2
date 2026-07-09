-- seed.sql — minimal defaults only (translations + settings).
-- Content is imported in phase-02 from Firestore. Do NOT seed content here.

insert into public.settings (key, value) values
  ('theme', '{"mode":"light"}'::jsonb),
  ('donation_channels', '[]'::jsonb)
on conflict (key) do nothing;

insert into public.translations (lang, key, value) values
  ('vi', 'site.name', 'Bất Tử Đạo'),
  ('en', 'site.name', 'Immortality')
on conflict (lang, key) do nothing;
