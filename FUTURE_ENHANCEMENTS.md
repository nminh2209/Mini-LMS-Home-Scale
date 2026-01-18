# System Analysis & Future Enhancements

This document outlines potential bugs, technical debt, and ideas for future improvements for the Mini-LMS system.

## 🐛 Potential Issues & Technical Debt

1. **Table Inconsistency**: 
    - `StudentList.tsx` currently uses the legacy `tuition_payments` table, while the new `TuitionManager.tsx` uses the `tuitions` table. 
    - *Action*: Standardize all tuition-related logic to use the `tuitions` table.

2. **UI Fragmentation**:
    - High-fidelity "Canvas-style" UI is currently applied to `AttendanceManager`, `TuitionManager`, and `CalendarView`.
    - `ClassDetail` and its sub-tabs (`StudentList`, `AssignmentList`, `VocabularyList`) still use an older, flatter UI.
    - *Action*: Refactor legacy components to match the new high-fidelity design language.

3. **Schedule Parsing**:
    - `OrchestrationOverview` and `CalendarView` both parse the `classes.schedule` string (e.g., "T2/T4 - 18:00"). This is brittle.
    - *Action*: Consider migrating to a structured JSONB schedule format in the database for easier querying and validation.

4. **Performance**:
    - Student counts are currently hardcoded or fetched repeatedly.
    - *Action*: Use Postgres Views or Functions to fetch aggregated data (student counts, attendance rates) in a single request.

---

## 🚀 Future Feature Ideas

### 📱 Mobile Experience
- **Parent/Student App**: A simplified view for students to check their homework, vocabulary, and tuition status on their phones.
- **Push Notifications**: Use Web Push API to notify students about new assignments or tuition reminders.

### 🤖 Automation
- **Attendance Alerts**: Automatically email parents if a student is marked "Vắng" (Absent).
- **Weekly Progress Reports**: Generate an automated summary of vocabulary learned and assignments completed for parents.

### 💰 Financials
- **Online Payments**: Integrate MoMo, ZaloPay, or VNPay for automated tuition payments.
- **Reporting Dashboard**: A monthly financial summary showing total expected vs. collected revenue.

### 🏫 Academic
- **Rich Text Editor**: Use TipTap or Quill for assignments and vocabulary notes to allow formatting and images.
- **Student Progress Tracker**: Visual charts showing attendance and quiz performance over time.
- **Shared Resource Library**: A global repository of documents/images that can be shared across multiple classes.
