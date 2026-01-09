-- SAFE MIGRATION: Roles, Admin, and Quizzes
-- It is safe to run this script multiple times. It will NOT delete data.

-- 1. Create Profiles Table (if it doesn't exist)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text check (role in ('admin', 'teacher', 'student')) default 'student',
  full_name text,
  avatar_url text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

-- Policies (We drop first to avoid "policy already exists" errors when re-running)
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
create policy "Public profiles are viewable by everyone" on public.profiles for select using ( true );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );

-- 2. Link Students to Auth Users (Add column safely)
alter table public.students
add column if not exists user_id uuid references auth.users(id);

-- 3. QUIZ SYSTEM SCHEMA

-- Quizzes Table
create table if not exists public.quizzes (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  title text not null,
  description text,
  time_limit_minutes integer,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quiz Questions
create table if not exists public.quiz_questions (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  question_text text not null,
  question_type text check (question_type in ('multiple_choice', 'text', 'true_false')) default 'multiple_choice',
  options jsonb,
  correct_answer text,
  points integer default 1,
  order_index integer default 0
);

-- Quiz Attempts
create table if not exists public.quiz_attempts (
  id uuid default uuid_generate_v4() primary key,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  score numeric,
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  answers jsonb
);

-- Enable RLS
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

-- Policies
drop policy if exists "Teachers manage quizzes" on public.quizzes;
create policy "Teachers manage quizzes" on public.quizzes for all using (exists (select 1 from public.classes where classes.id = quizzes.class_id and classes.user_id = auth.uid()));

drop policy if exists "Teachers manage questions" on public.quiz_questions;
create policy "Teachers manage questions" on public.quiz_questions for all using (exists (select 1 from public.quizzes join public.classes on quizzes.class_id = classes.id where quizzes.id = quiz_questions.quiz_id and classes.user_id = auth.uid()));

drop policy if exists "Teachers manage attempts" on public.quiz_attempts;
create policy "Teachers manage attempts" on public.quiz_attempts for all using (exists (select 1 from public.quizzes join public.classes on quizzes.class_id = classes.id where quizzes.id = quiz_attempts.quiz_id and classes.user_id = auth.uid()));
