-- 08_harden_security.sql
-- Goal: Restrict profile visibility, grant Admin overarching access, and allow Students to view own data.

-- 1. FIX PROFILES: Don't let students browse other students
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Profiles visibility"
  on public.profiles for select
  using (
    id = auth.uid() -- Can see self
    OR exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') -- Admin can see all
    OR role = 'teacher' -- Everyone can see teachers
  );

-- 2. CREATE FUNCTION: Helper to check if current user is Admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$ language sql security definer;

-- 3. UPDATE POLICIES FOR ALL TABLES (Add Admin Bypass & Student View)

-- Classes
drop policy if exists "Teachers manage own" on public.classes;
create policy "Classes RLS" on public.classes for all using (
  auth.uid() = user_id OR public.is_admin()
);

-- Students
drop policy if exists "Teachers manage students" on public.students;
create policy "Students RLS" on public.students for all using (
  exists (select 1 from public.classes where classes.id = students.class_id and classes.user_id = auth.uid()) -- Teacher
  OR public.is_admin() -- Admin
  OR user_id = auth.uid() -- Student themselves
);

-- Tuition (New Table)
drop policy if exists "Teachers/Admins manage tuitions" on public.tuitions;
drop policy if exists "Students view own tuitions" on public.tuitions;
create policy "Tuitions RLS" on public.tuitions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'teacher')) -- Staff
  OR exists (select 1 from public.students where id = public.tuitions.student_id and user_id = auth.uid()) -- Student themselves
);

-- Tuition Payments (Old Table if exists)
drop policy if exists "Teachers manage tuition" on public.tuition_payments;
create policy "Tuition Payments RLS" on public.tuition_payments for all using (
  exists (select 1 from public.classes where classes.id = tuition_payments.class_id and classes.user_id = auth.uid())
  OR public.is_admin()
  OR exists (select 1 from public.students where id = tuition_payments.student_id and user_id = auth.uid())
);

-- Attendance
drop policy if exists "Teachers manage attendance" on public.attendance;
create policy "Attendance RLS" on public.attendance for all using (
  exists (select 1 from public.classes where classes.id = attendance.class_id and classes.user_id = auth.uid())
  OR public.is_admin()
  OR exists (select 1 from public.students where id = attendance.student_id and user_id = auth.uid())
);

-- Assignments
drop policy if exists "Teachers manage assignments" on public.assignments;
create policy "Assignments RLS" on public.assignments for all using (
  exists (select 1 from public.classes where classes.id = assignments.class_id and (classes.user_id = auth.uid() OR public.is_admin()))
  OR exists (select 1 from public.students where class_id = assignments.class_id and user_id = auth.uid()) -- Viewable by students in class
);

-- Submissions
drop policy if exists "Teachers manage submissions" on public.submissions;
create policy "Submissions RLS" on public.submissions for all using (
  exists (select 1 from public.assignments join public.classes on assignments.class_id = classes.id where assignments.id = submissions.assignment_id and (classes.user_id = auth.uid() OR public.is_admin()))
  OR student_id in (select id from public.students where user_id = auth.uid()) -- Student can manage own
);

-- Grades
drop policy if exists "Teachers manage grades" on public.grades;
create policy "Grades RLS" on public.grades for all using (
  exists (select 1 from public.classes where classes.id = grades.class_id and (classes.user_id = auth.uid() OR public.is_admin()))
  OR student_id in (select id from public.students where user_id = auth.uid()) -- Student view own
);

-- Vocabulary
drop policy if exists "Teachers manage vocabulary" on public.vocabulary;
create policy "Vocabulary RLS" on public.vocabulary for all using (
  exists (select 1 from public.classes where classes.id = vocabulary.class_id and (classes.user_id = auth.uid() OR public.is_admin()))
  OR exists (select 1 from public.students where class_id = vocabulary.class_id and user_id = auth.uid()) -- Student view
);
