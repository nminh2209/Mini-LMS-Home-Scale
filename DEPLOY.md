# How to Deploy to Vercel

Your "Vietnamese Classroom" LMS is ready for the world! Follow these steps to deploy it for free.

## 1. Prepare GitHub
1.  Make sure all your latest changes are committed and pushed to GitHub.
    ```bash
    git add .
    git commit -m "Ready for deploy"
    git push
    ```

## 2. Connect to Vercel
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your repository: `Mini-LMS-Home-Scale`.

## 3. Configure Project
Vercel will detect the project, but we need to tweak a few settings because the app lives in the `frontend` folder.

*   **Framework Preset**: Vite
*   **Root Directory**: Click `Edit` and select `frontend`.
    *   *This is crucial!* The build command won't work otherwise.

## 4. Environment Variables (Recommended)
While the app has a fallback, it is best practice to set these in Vercel:

1.  Expand **Environment Variables**.
2.  Add the following:
    *   `VITE_SUPABASE_URL`: `https://goylrgwjkfvalxarzvub.supabase.co`
    *   `VITE_SUPABASE_ANON_KEY`: *(Copy the key from `frontend/utils/supabase/info.tsx`)*

## 5. Deploy
1.  Click **"Deploy"**.
2.  Wait a minute or two.
3.  **Success!** 🎉 Vercel will give you a live URL (e.g., `mini-lms-home-scale.vercel.app`).

## 6. Verify
Visit the link. Try logging in with your "simple username" (e.g., `admin`). The app should work exactly as it does locally!
