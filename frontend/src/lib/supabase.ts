import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../../utils/supabase/info'

// Prioritize Environment Variables (for Vercel), fallback to local file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${projectId}.supabase.co`
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || publicAnonKey

if (!import.meta.env.VITE_SUPABASE_URL) {
    console.warn("⚠️ Using fallback Supabase URL. For production, set VITE_SUPABASE_URL in environment variables.");
}
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn("⚠️ Using fallback Supabase Anon Key. For production, set VITE_SUPABASE_ANON_KEY in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey)
