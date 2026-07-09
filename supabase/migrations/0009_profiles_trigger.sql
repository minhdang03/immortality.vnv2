-- 0009_profiles_trigger.sql — auto-create profiles row on Supabase Auth sign-up.
-- Runs as trigger owner (SECURITY DEFINER implied for trigger functions referencing auth schema).
-- Default role = 'user'. Admin promotion is manual: UPDATE profiles SET role='admin' WHERE id=<uid>.

create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'user',
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;  -- idempotent: re-runs safe
  return new;
end;
$$;

-- Drop first so migration is re-runnable in dev.
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── One-time bootstrap (run ONCE after the first admin signs up) ────────────────
-- Replace <YOUR_USER_UUID> with the UUID from: auth.users table in Supabase dashboard.
--
--   UPDATE public.profiles SET role = 'admin' WHERE id = '<YOUR_USER_UUID>';
--
-- To find the UUID: Supabase Dashboard → Authentication → Users → copy the UUID
-- shown next to your email address.
-- ────────────────────────────────────────────────────────────────────────────────
