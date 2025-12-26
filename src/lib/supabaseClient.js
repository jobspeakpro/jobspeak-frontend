import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase env vars. Check .env.local for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
  // Throw so we fail loudly instead of random broken behavior
  throw new Error("Supabase env vars missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

