// Supabase Client Configuration (Replaces firebase.ts)
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Safety check for production environments
export const isSupabaseConfigValid = !!supabaseUrl && !!supabaseAnonKey;

if (!isSupabaseConfigValid) {
    console.warn(
        'Supabase configuration is incomplete. All authentication and database features will be disabled. ' +
        'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.'
    );
}

// Initialize the Supabase client
export const supabase = createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
