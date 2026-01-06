-- DATA RESET (Careful! This deletes all data for a clean slate) --
drop table if exists public.attendance cascade;
drop table if exists public.assignments cascade;
drop table if exists public.vocabulary cascade;
drop table if exists public.tuition_payments cascade;
drop table if exists public.students cascade;
drop table if exists public.classes cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Classes Table
create table public.classes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) not null,
  name text not null,
  schedule text,
  level text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Students Table
create table public.students (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  name text not null,
  date_of_birth date, 
  parent_name text,
  phone text,
  notes text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tuition Payments Table (New)
create table public.tuition_payments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  amount numeric not null,
  month text not null, -- Format 'YYYY-MM'
  status text default 'paid',
  payment_date timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Attendance Table
create table public.attendance (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  date date not null,
  status text check (status in ('present', 'absent', 'late')) default 'present',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(student_id, class_id, date)
);

-- Assignments Table
create table public.assignments (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vocabulary Table
create table public.vocabulary (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  week text not null, -- e.g. "Week 1", "Week 2"
  words jsonb not null, -- Store array of {word, definition, example}
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.tuition_payments enable row level security;
alter table public.attendance enable row level security;
alter table public.assignments enable row level security;
alter table public.vocabulary enable row level security;

-- Policies --

-- Classes
create policy "Teachers can manage their own classes"
  on public.classes for all
  using (auth.uid() = user_id);

-- Students (linked via class)
create policy "Teachers can manage students in their classes"
  on public.students for all
  using (
    exists (
      select 1 from public.classes
      where classes.id = students.class_id
      and classes.user_id = auth.uid()
    )
  );

-- Tuition
create policy "Teachers can manage tuition"
  on public.tuition_payments for all
  using (
    exists (
      select 1 from public.classes
      where classes.id = tuition_payments.class_id
      and classes.user_id = auth.uid()
    )
  );

-- Attendance
create policy "Teachers can manage attendance"
  on public.attendance for all
  using (
    exists (
      select 1 from public.classes
      where classes.id = attendance.class_id
      and classes.user_id = auth.uid()
    )
  );

-- Assignments
create policy "Teachers can manage assignments"
  on public.assignments for all
  using (
    exists (
      select 1 from public.classes
      where classes.id = assignments.class_id
      and classes.user_id = auth.uid()
    )
  );

-- Vocabulary
create policy "Teachers can manage vocabulary"
  on public.vocabulary for all
  using (
    exists (
      select 1 from public.classes
      where classes.id = vocabulary.class_id
      and classes.user_id = auth.uid()
    )
  );
