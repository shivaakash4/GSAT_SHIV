import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession:    true,        // store token in localStorage
    autoRefreshToken:  true,        // auto refresh before expiry
    storageKey:        'gsat-auth', // localStorage key name
    storage:           typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
