# Security Audit: Mini-LMS-Home-Scale 🛡️

This document outlines the current security posture, potential risks, and identified "leaks" or vulnerabilities in the system.

## 🔴 Critical Risks (Fixed ✅)

### 1. Hardcoded Supabase Credentials
**Status**: Mitigated. 
-   The code now prioritizes `.env` variables.
-   A warning is loged if fallbacks are used.
-   **Action**: User must add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel Settings.

### 2. Profile Data Over-exposure
**Status**: Fixed via `08_harden_security.sql`.
-   Profiles are now only visible to the owner or Admins.
-   Teachers are still browseable for enrollment purposes.

## 🟡 Medium Risks (Fixed ✅)

### 1. Incomplete RLS for Students
**Status**: Fixed via `08_harden_security.sql`.
-   Students can now see their own grades, attendance, and submissions.

### 2. Admin "Blind Spots"
**Status**: Fixed via `08_harden_security.sql`.
-   Admins now have overarching access to all resources.

## 🟢 System Defenses (Strengths)

*   **Row Level Security (RLS)**: Enabled on all tables. Even with the "Anon" key, a user cannot delete or update data they don't own (except where specifically noted in the Profiles policy).
*   **Encrypted Passwords**: Handled entirely by Supabase Auth (industry standard).
*   **Role Validation**: Roles are stored in a dedicated `profiles` table which is tied to the `auth.uid()`, preventing users from spoofing their own roles.

## 📝 Recommendations for User

1.  **Restrict Profile Visibility**: Run a SQL script to change the profile policy so students can't see each other's emails.
2.  **Move to Environment Variables**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used exclusively in production.
3.  **Audit Deletion Rules**: Ensure `on delete cascade` is only used where intended (e.g., deleting a class should delete students, but deleting a student shouldn't delete the class).
