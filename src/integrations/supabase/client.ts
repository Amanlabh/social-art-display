
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xryeybbciavvjsjgdrgc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeWV5YmJjaWF2dmpzamdkcmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NzM3OTgsImV4cCI6MjA1MzU0OTc5OH0.PxxkXyZGs7OxtEX6DoQoTk_OlT4xrDmAggJGIfw4nys";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
