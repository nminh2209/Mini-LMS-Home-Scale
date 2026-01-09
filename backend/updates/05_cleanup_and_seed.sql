-- CLEANUP SCRIPT (Improved)
-- This script manually deletes dependencies to avoid Foreign Key errors if CASCADE wasn't set up perfectly.

-- 1. Get IDs of users to delete (EVERYONE EXCEPT ADMIN)
-- We use a temporary table or just a subquery in delete statements.

-- 2. Delete classes owned by these users
delete from public.classes
where user_id in (
  select id from auth.users 
  where email not in ('nminh22092209@gmail.com')
);

-- 3. Delete profiles of these users
delete from public.profiles
where id in (
  select id from auth.users 
  where email not in ('nminh22092209@gmail.com')
);

-- 4. Finally, delete the users themselves
delete from auth.users
where email not in ('nminh22092209@gmail.com');

-- 5. Helper to reset roles for your test users (Run this AFTER creating them)
-- update public.profiles set role = 'teacher' where email = 'teacher_test@lms.local';
-- update public.profiles set role = 'student' where email = 'student_test@lms.local';
