# Mini-LMS-Home-Scale 🏫

A lightweight, robust Learning Management System (LMS) designed for home-based English classes ("Lớp học thêm"). It combines a "Traditional Vietnamese Classroom" aesthetic with modern digital tools.

## 🌟 Features

*   **Class Management**: Organize students into classes (e.g., "Grade 10 - Mon/Wed").
*   **Student Profiles**: Manage contact info, parent details, and notes.
*   **Digital Attendance**: Track presence (Present/Late/Absent) with a single click.
*   **Tuition Tracking**: Record monthly fee payments.
*   **Learning Tools**:
    *   **Assignments**: Create and track homework with due dates.
    *   **Vocabulary**: Build weekly word lists with definitions and examples.
*   **Authentication**: Secure login with simple usernames (e.g., `admin`).

## 🛠️ Technology Stack

*   **Frontend**: React 18, Vite, TypeScript, TailwindCSS v4, Radix UI.
*   **Backend**: Supabase (PostgreSQL, Auth).
*   **Hosting**: Vercel (Frontend), Supabase (Backend).

## 🚀 Quick Start (Local Development)

1.  **Clone & Setup**
    ```bash
    git clone https://github.com/nminh2209/Mini-LMS-Home-Scale.git
    cd Mini-LMS-Home-Scale/frontend
    npm install
    ```

2.  **Environment Variables**
    Ensure you have a `.env` file in the `frontend` directory with your Supabase credentials:
    ```
    VITE_SUPABASE_URL=https://goylrgwjkfvalxarzvub.supabase.co
    VITE_SUPABASE_ANON_KEY=your_anon_key_here
    ```

3.  **Run the App**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) to view it.

## 📚 Documentation & Guides

*   **[Deployment Guide](DEPLOY.md)**: How to publish this app to the internet (Vercel).
*   **[Database Guide](DATABASE_GUIDE.md)**: How to safely update the database and recover data.
*   **[Frontend Details](frontend/README.md)**: Specifics about the UI structure.

## 🛡️ Database Management

> **Important**: Do NOT run the `initial_schema.sql` file on a production database as it will delete data.

To make changes to the database (e.g., adding columns), please follow the instructions in **[DATABASE_GUIDE.md](DATABASE_GUIDE.md)**.
