-- 07_create_tuitions.sql (Revised)
-- New Module: Tuition Management (Quản lý học phí)

-- 1. Safely create Enum (Ignore if exists)
DO $$ begin
    create type public.tuition_status as enum ('pending', 'paid', 'overdue');
exception
    when duplicate_object then null;
end $$;

-- 2. Create Table
create table if not exists public.tuitions (
  id uuid default gen_random_uuid() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  amount integer not null check (amount >= 0),
  period varchar(50) not null, -- e.g. "Tháng 10/2023"
  status public.tuition_status default 'pending',
  due_date date,
  paid_at timestamptz,
  note text,
  created_at timestamptz default now()
);

-- 3. RLS Policies
alter table public.tuitions enable row level security;

-- Drop existing policies to prevent "policy already exists" errors if re-running
drop policy if exists "Teachers/Admins manage tuitions" on public.tuitions;
drop policy if exists "Students view own tuitions" on public.tuitions;

-- Admins and Teachers can view/edit all tuitions
create policy "Teachers/Admins manage tuitions"
  on public.tuitions
  for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role in ('admin', 'teacher')
    )
  );

-- Students can view their OWN tuitions
create policy "Students view own tuitions"
  on public.tuitions
  for select
  using (
    exists (
      select 1 from public.students
      where id = public.tuitions.student_id
      and user_id = auth.uid()
    )
  );
