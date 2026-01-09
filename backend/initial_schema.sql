-- DATA RESET (Careful! This deletes all data for a clean slate) --
drop table if exists public.quiz_attempts cascade;
drop table if exists public.quiz_questions cascade;
drop table if exists public.quizzes cascade;
drop table if exists public.submissions cascade;
drop table if exists public.grades cascade;
drop table if exists public.attendance cascade;
drop table if exists public.assignments cascade;
drop table if exists public.vocabulary cascade;
drop table if exists public.tuition_payments cascade;
drop table if exists public.students cascade;
drop table if exists public.classes cascade;
drop table if exists public.profiles cascade;

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES (Auth/Roles)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text check (role in ('admin', 'teacher', 'student')) default 'student',
  full_name text,
  avatar_url text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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
  user_id uuid references auth.users(id), -- Linked Auth User
  name text not null,
  email text,
  avatar_url text,
  date_of_birth date, 
  parent_name text,
  phone text,
  notes text,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tuition Payments Table
create table public.tuition_payments (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  class_id uuid references public.classes(id) on delete cascade not null,
  amount numeric not null,
  month text not null, 
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

-- Submissions Table
create table public.submissions (
  id uuid default uuid_generate_v4() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  content text,
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  grade numeric,
  feedback text
);

-- Grades/Scores Table 
create table public.grades (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  title text not null,
  score numeric not null,
  max_score numeric default 100,
  weight numeric default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vocabulary Table
create table public.vocabulary (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  week text not null, 
  words jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QUIZZES
create table public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  title text not null,
  description text,
  time_limit_minutes integer, 
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.quiz_questions (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  question_text text not null,
  question_type text check (question_type in ('multiple_choice', 'text', 'true_false')) default 'multiple_choice',
  options jsonb, 
  correct_answer text, 
  points integer default 1,
  order_index integer default 0
);

create table public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  score numeric,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  answers jsonb 
);

-- Enable RLS (All Tables)
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.tuition_payments enable row level security;
alter table public.attendance enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.grades enable row level security;
alter table public.vocabulary enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

-- POLICIES (Simplified for Teacher/Admin for now)
-- NOTE: In production, you'd add "OR exists(select 1 from profiles where id=auth.uid() and role='admin')" to everything.

create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Teachers manage own" on public.classes for all using (auth.uid() = user_id);

-- (Generic Teacher Policies for resources linked to class)
create policy "Teachers manage students" on public.students for all using (exists (select 1 from public.classes where classes.id = students.class_id and classes.user_id = auth.uid()));
create policy "Teachers manage tuition" on public.tuition_payments for all using (exists (select 1 from public.classes where classes.id = tuition_payments.class_id and classes.user_id = auth.uid()));
create policy "Teachers manage attendance" on public.attendance for all using (exists (select 1 from public.classes where classes.id = attendance.class_id and classes.user_id = auth.uid()));
create policy "Teachers manage assignments" on public.assignments for all using (exists (select 1 from public.classes where classes.id = assignments.class_id and classes.user_id = auth.uid()));
create policy "Teachers manage submissions" on public.submissions for all using (exists (select 1 from public.assignments join public.classes on assignments.class_id = classes.id where assignments.id = submissions.assignment_id and classes.user_id = auth.uid()));
create policy "Teachers manage grades" on public.grades for all using (exists (select 1 from public.classes where classes.id = grades.class_id and classes.user_id = auth.uid()));
create policy "Teachers manage vocabulary" on public.vocabulary for all using (exists (select 1 from public.classes where classes.id = vocabulary.class_id and classes.user_id = auth.uid()));

-- Quiz Policies
create policy "Teachers manage quizzes" on public.quizzes for all using (exists (select 1 from public.classes where classes.id = quizzes.class_id and classes.user_id = auth.uid()));
create policy "Teachers manage questions" on public.quiz_questions for all using (exists (select 1 from public.quizzes join public.classes on quizzes.class_id = classes.id where quizzes.id = quiz_questions.quiz_id and classes.user_id = auth.uid()));
create policy "Teachers manage attempts" on public.quiz_attempts for all using (exists (select 1 from public.quizzes join public.classes on quizzes.class_id = classes.id where quizzes.id = quiz_attempts.quiz_id and classes.user_id = auth.uid()));
