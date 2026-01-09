-- Add Email and Avatar to Students
alter table public.students 
add column if not exists email text,
add column if not exists avatar_url text;

-- Create Submissions Table
create table if not exists public.submissions (
  id uuid default uuid_generate_v4() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  content text, -- Text or URL to file
  submitted_at timestamp with time zone default timezone('utc'::text, now()) not null,
  grade numeric,
  feedback text
);

-- Create Grades/Scores Table (for non-assignment grades like participation)
create table if not exists public.grades (
  id uuid default uuid_generate_v4() primary key,
  class_id uuid references public.classes(id) on delete cascade not null,
  student_id uuid references public.students(id) on delete cascade not null,
  title text not null, -- e.g. "Midterm Exam"
  score numeric not null,
  max_score numeric default 100,
  weight numeric default 1, -- for weighted averages
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for new tables
alter table public.submissions enable row level security;
alter table public.grades enable row level security;

-- Policies for Submissions
create policy "Teachers can view submissions for their classes"
  on public.submissions for select
  using (
    exists (
      select 1 from public.assignments
      join public.classes on assignments.class_id = classes.id
      where assignments.id = submissions.assignment_id
      and classes.user_id = auth.uid()
    )
  );

create policy "Teachers can grade submissions"
  on public.submissions for update
  using (
    exists (
      select 1 from public.assignments
      join public.classes on assignments.class_id = classes.id
      where assignments.id = submissions.assignment_id
      and classes.user_id = auth.uid()
    )
  );

create policy "Teachers can insert submissions (on behalf of student for now)"
  on public.submissions for insert
  with check (
    exists (
      select 1 from public.assignments
      join public.classes on assignments.class_id = classes.id
      where assignments.id = assignment_id
      and classes.user_id = auth.uid()
    )
  );

-- Policies for Grades
create policy "Teachers can manage grades"
  on public.grades for all
  using (
    exists (
      select 1 from public.classes
      where classes.id = grades.class_id
      and classes.user_id = auth.uid()
    )
  );
