-- 1. Create a Trigger Function to auto-create profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role, email)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url', 
    'student', -- Default role is student
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

-- 2. Attach the Trigger to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. FIX MISSING PROFILES (Backfill)
-- This inserts a profile for any user that exists in Auth but not in Profiles
insert into public.profiles (id, email, role)
select id, email, 'student'
from auth.users
where id not in (select id from public.profiles);

-- 4. OPTIONAL: Fix your Admin Status (since you mentioned changing email)
-- Replace the email below if you want to force-promote a specific email in this script
-- update public.profiles set role = 'admin' where email = 'nminh22092209@gmail.com';
