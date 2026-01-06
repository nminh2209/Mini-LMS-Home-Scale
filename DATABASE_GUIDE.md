# Database Operations Guide

This guide explains how to safely update your Supabase database without losing data, and how to recover if something goes wrong.

## 1. How to Safely Update (Migrations)

Currently, `initial_schema.sql` contains `DROP TABLE` commands. **NEVER run this file again** once your app is live and has real students/classes.

To make changes (like adding a column), you should create a **New SQL Query**.

### Example: Adding a "Avatar" to Users
Instead of editing the old file, write a new script:

```sql
-- Safe update: Only adds the column if it doesn't exist
alter table public.students 
add column if not exists avatar_url text;
```

### Example: Changing a Column Type
```sql
-- Change "phone" to be a text field (if it wasn't already)
alter table public.students 
alter column phone type text;
```

### Best Practice
1.  Keep your `initial_schema.sql` as a reference for a "fresh install".
2.  Save your new changes as separate files in your code (e.g., `backend/updates/01_add_avatar.sql`) so you track history.
3.  Run these small chunks in the Supabase SQL Editor.

---

## 2. "Rollback" & Disaster Recovery

### "I accidentally deleted everything!" (rm -rf equivalent)
If you run `DROP TABLE students`, the data is gone immediately.

### Recovery Options (Supabase)

#### Option A: Dashboard Backups (Free Tier)
Supabase takes daily backups automatically.
1.  Go to **Database** > **Backups** in the Supabase Dashboard.
2.  You can download the latest nightly backup dump.
3.  **To Restore**: You would need to manually run the SQL in that dump file to re-insert your data.

#### Option B: Point-in-Time Recovery (PITR) (Pro Plan)
*   *Cost: $25/mo + addon*
*   Allows you to "rewind" the database to any specific second (e.g., "Restore to 10 minutes ago"). This is the only true "Undo" button for production mistakes.

#### Option C: Manual "Safety Net" (Recommended for Free Tier)
Before running any risky SQL command, **Export your data**:
1.  Go to **Table Editor**.
2.  Select a table (e.g., `students`).
3.  Click **"Export"** > **"Export as CSV"**.
4.  Do this for important tables.
5.  If you mess up, you can click **"Insert"** > **"Import Data from CSV"** to restore.

## Summary Checklist for Updates
- [ ] **Backup**: Did I export a CSV of important tables?
- [ ] **Review**: Does my SQL contain `DROP` or `DELETE`? (Be careful!)
- [ ] **Test**: Did I try this `ALTER` command on a simplified test table first?
