-- 08_harden_security.sql
-- Goal: Restrict profile visibility, grant Admin overarching access, and allow Students to view own data.

-- 2. CREATE FUNCTIONS: Helpers with Security Definer to bypass RLS recursion
create or replace function public.is_admin()
returns boolean as $$
  -- Using a direct query on auth.uid() to avoid recursion if possible, 
  -- or ensuring this function is SECURITY DEFINER.
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$ language sql security definer;

create or replace function public.is_staff()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'teacher')
  );
$$ language sql security definer;

-- 1. FIX PROFILES: Avoid recursion by using helpers
drop policy if exists "Profiles visibility" on public.profiles;
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Profiles visibility"
  on public.profiles for select
  using (
    id = auth.uid() -- Can see self
    OR public.is_admin() -- Admin can see all (Function is security definer, so no recursion)
    OR role = 'teacher' -- Everyone can see teachers
  );

-- 3. UPDATE POLICIES FOR ALL TABLES (Add Admin Bypass & Student View)

-- Classes
drop policy if exists "Classes RLS" on public.classes;
create policy "Classes RLS" on public.classes for all using (
  auth.uid() = user_id OR public.is_admin()
);

-- Students
drop policy if exists "Students RLS" on public.students;
create policy "Students RLS" on public.students for all using (
  exists (select 1 from public.classes where classes.id = students.class_id and classes.user_id = auth.uid()) -- Teacher
  OR public.is_admin()
  OR user_id = auth.uid()
);

-- Tuitions (Table name: tuitions)
drop policy if exists "Tuitions RLS" on public.tuitions;
create policy "Tuitions RLS" on public.tuitions for all using (
  public.is_staff() -- Admin/Teacher manage
  OR exists (select 1 from public.students where id = public.tuitions.student_id and user_id = auth.uid()) -- Student view
);

-- Attendance
drop policy if exists "Attendance RLS" on public.attendance;
create policy "Attendance RLS" on public.attendance for all using (
  public.is_staff()
  OR exists (select 1 from public.students where id = attendance.student_id and user_id = auth.uid())
);

-- Assignments
drop policy if exists "Assignments RLS" on public.assignments;
create policy "Assignments RLS" on public.assignments for all using (
  public.is_staff()
  OR exists (select 1 from public.students where class_id = assignments.class_id and user_id = auth.uid())
);

-- Submissions
drop policy if exists "Submissions RLS" on public.submissions;
create policy "Submissions RLS" on public.submissions for all using (
  public.is_staff()
  OR student_id in (select id from public.students where user_id = auth.uid())
);

-- Grades
drop policy if exists "Grades RLS" on public.grades;
create policy "Grades RLS" on public.grades for all using (
  public.is_staff()
  OR student_id in (select id from public.students where user_id = auth.uid())
);

-- Vocabulary
drop policy if exists "Vocabulary RLS" on public.vocabulary;
create policy "Vocabulary RLS" on public.vocabulary for all using (
  public.is_staff()
  OR exists (select 1 from public.students where class_id = vocabulary.class_id and user_id = auth.uid())
);
