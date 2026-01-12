# Mini-LMS-Home-Scale 🏫

A professional, robust Learning Management System (LMS) designed for home-based English classes ("Lớp học thêm"). It combines a "Traditional Vietnamese Classroom" (Chalkboard) aesthetic with modern digital tools for tracking student progress.

## 🌟 Key Features

*   **Vietnamese-First UI**: Fully localized interface in Vietnamese (`Tiếng Việt`).
*   **Role-Based Access (RBAC)**:
    *   **Admin**: Total system oversight and user role management.
    *   **Teacher**: Manage classes, attendance, students, and tuition.
    *   **Student**: View enrolled classes, homework, and own tuition status.
*   **Visual Schedule & Calendar**: 
    *   **Day/Time Picker**: Intelligent class creation with a visual scheduler.
    *   **Weekly Calendar**: Real-time sync with actual dates (e.g., T2 12/01) and click-to-open class functionality.
*   **Tuition Management**: 
    *   Create and track tuition requests by period (e.g., "Tháng 01/2026").
    *   Mark as paid and manage overdue status.
    *   Dedicated "Học Phí" board for overall tracking.
*   **Class Dashboard**:
    *   One-click Attendance tracking (Present/Absent/Late).
    *   Assignment management with due dates.
    *   Weekly Vocabulary lists.
*   **Security & Deletion**: Integrated "Delete" protections for classes, students, and tuition records.

## 🛠️ Technology Stack

*   **Frontend**: React 18, Vite, TypeScript.
*   **Styling**: **TailwindCSS v4**, Radix UI (Headless components).
*   **Backend**: **Supabase** (PostgreSQL, Realtime, Auth).
*   **Icons**: Lucide React.
*   **Date Operations**: `date-fns`.

## 🚀 Getting Started

### Local Development

1.  **Clone & Setup**
    ```bash
    git clone https://github.com/nminh2209/Mini-LMS-Home-Scale.git
    cd Mini-LMS-Home-Scale/frontend
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the `frontend` folder:
    ```
    VITE_SUPABASE_URL=https://goylrgwjkfvalxarzvub.supabase.co
    VITE_SUPABASE_ANON_KEY=...your_anon_key...
    ```

3.  **Run**
    ```bash
    npm run dev
    ```

## 🛡️ Security & Database

### Security Audit
We maintain a strict **Row Level Security (RLS)** model. 
*   Students can ONLY see their own data.
*   Teachers manage only THEIR classes.
*   Admins manage all system profiles.

For details, see **[SECURITY_AUDIT.md](SECURITY_AUDIT.md)**.

### Database Updates
> [!CAUTION]
> Avoid running `initial_schema.sql` on live data. Use scripts in `backend/updates/` for safe migrations.

## 📚 Guides
*   **[Deployment Guide](DEPLOY.md)**: Hosting on Vercel.
*   **[Database Guide](DATABASE_GUIDE.md)**: Manual SQL updates.
*   **[Security Audit](SECURITY_AUDIT.md)**: Potential risks and mitigations.
