// Safe wrapper around Supabase client with robust env fallbacks
// Prefer importing from this file in the app code.

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Read from Vite env and derive sensible defaults for Lovable Cloud
const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const URL_FROM_PROJECT = PROJECT_ID ? `https://${PROJECT_ID}.supabase.co` : undefined;

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  URL_FROM_PROJECT ||
  // Final non-secret fallback to ensure app remains usable in preview
  'https://chdnmfujjdbtxfoogymc.supabase.co';

// The publishable (anon) key is safe to be exposed client-side by design
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoZG5tZnVqamRidHhmb29neW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMTk0ODMsImV4cCI6MjA3Njg5NTQ4M30.qUKLzEoVPn5gLuljQuAEcDjr6l0_ZU3TWwJz-JEiym0';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
