-- 09_analytics_views.sql
-- New Module: Teacher Management Dashboard (Analytics Views)

-- 1. Revenue Summary View
-- Provides monthly revenue totals (expected vs paid)
create or replace view public.revenue_summary as
select 
    class_id,
    period,
    sum(case when status = 'paid' then amount else 0 end) as total_paid,
    sum(case when status = 'pending' then amount else 0 end) as total_pending,
    sum(case when status = 'overdue' then amount else 0 end) as total_overdue,
    sum(amount) as total_expected,
    count(distinct student_id) as student_count
from public.tuitions
group by class_id, period;

-- 2. Attendance Performance View
-- Provides attendance rates per class
create or replace view public.attendance_performance as
select 
    class_id,
    count(*) filter (where status = 'present') as present_count,
    count(*) filter (where status = 'absent') as absent_count,
    count(*) filter (where status = 'late') as late_count,
    count(*) as total_attendance_records,
    round(
        (count(*) filter (where status = 'present')::numeric / nullif(count(*), 0) * 100), 
        2
    ) as present_rate
from public.attendance
group by class_id;

-- 3. Overdue Tuition View
-- Specifically for the "Overdue" table in the dashboard
create or replace view public.overdue_tuition_list as
select 
    t.id,
    t.class_id,
    t.student_id,
    s.name as student_name,
    c.name as class_name,
    t.amount,
    t.period,
    t.due_date,
    t.status
from public.tuitions t
join public.students s on t.student_id = s.id
join public.classes c on t.class_id = c.id
where t.status = 'overdue' or (t.status = 'pending' and t.due_date < current_date);

-- Security: Grant access to Authenticated users
grant select on public.revenue_summary to authenticated;
grant select on public.attendance_performance to authenticated;
grant select on public.overdue_tuition_list to authenticated;
