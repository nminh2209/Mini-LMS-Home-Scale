-- FIX ADMIN PERMISSIONS
-- Admins need permission to update OTHER users' profiles.

-- 1. Create a policy allowing Admins to update ALL profiles
create policy "Admins can update any profile"
  on public.profiles
  for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- 2. (Optional) Enhance Student Table for better display
-- Ensure 'user_id' is unique so we don't duplicate students
alter table public.students
add constraint students_user_id_key unique (user_id);
