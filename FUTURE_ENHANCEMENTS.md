# Teacher-Centric Future Enhancements 🎓

This document focuses on features that empower teachers and center owners to manage their classes more efficiently, reduce administrative workload, and improve educational quality.

## ✅ Accomplished (Recent)
- **High-Fidelity UI Overhaul**: All teacher components (`ClassDetail`, `StudentList`, `Attendance`, `Quiz`, etc.) now use the premium "Canvas-inspired" design.
- **Integrated Help Guide**: A built-in "Hướng dẫn" section is now accessible directly from the sidebar.
- **Security Hardening**: RLS policies refined and recursion bugs fixed.
- **Supabase Keep-Alive**: Automated workflow to prevent project pausing.

---

## � 1. 🤖 AI Teacher Assistant (Content Generation)
*Reducing the time teachers spend on data entry.*
- **Smart Vocabulary Entry**: Automatically generate Vietnamese definitions, phonetic transcriptions, and 3-5 example sentences when a teacher adds a new English word.
- **Quiz Generator**: Generate quiz questions (Multiple choice, Fill-in-the-blank) based on a vocabulary list or a provided text.
- **Grammar Helper**: Suggest common mistakes and corrections based on the "Level" of the class.

## 🎯 2. 📊 Management & Financial Dashboard (Center Ownership)
*Providing business insights for the teacher/owner.*
- **Revenue Analytics**: Visual charts showing "Expected" vs "Collected" tuition per month.
- **Profitability Tracking**: Ability to track expenses (e.g., room rent, materials) alongside income.
- **Past-Due Alerts**: A central dashboard highlighting students who haven't paid fees for more than 30 days.
- **Exportable Reports**: Generate PDF/Excel summaries for monthly accounting.

## 🎯 3. 📢 Parent Communication Hub (Automated Outreach)
*Keeping parents informed without manual texting.*
- **Attendance Auto-Alerts**: One-click to send a Zalo/Email notification to a parent if a student is marked "Vắng" (Absent).
- **Monthly Progress Reports**: Automatically compile vocabulary learned, attendance records, and quiz scores into a beautiful PDF report for parents.
- **Announcements**: A global "Center Updates" feature to broadcast news to all classes (e.g., holiday dates).

## 🎯 4. �️ Administrative Efficiency
*Speeding up routine tasks.*
- **Bulk Attendance**: Mark all students as "Present" with one click, then adjust outliers.
- **Batch Tuition Creation**: Create tuition slips for all students in a class (or across all classes) for the upcoming month in one action.
- **Lesson Planning**: A dedicated space to store lesson plans, curriculum links, and shared teaching resources.

---

## 🏗️ Technical Enhancements (Teacher-Facing)
- **Structured Schedule**: Migrate from string-based schedules to JSONB for conflict detection (e.g., warning if two classes are scheduled at the same time).
- **Rich Text Support**: Allow teachers to use bold/italic/lists in homework and vocabulary notes.
- **Internal Notes**: A "Teacher-only" notepad for each class to keep track of pedagogical observations.
