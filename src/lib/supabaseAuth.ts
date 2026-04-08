// Authentication Helpers (Supabase — replaces Firebase auth.ts)
import { supabase } from './supabase';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

// Sign up with email and password
export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata
        }
    });
    if (error) throw error;
    return data;
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
};

// Sign in with Google (OAuth)
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    });
    if (error) throw error;
    return data;
};

// Sign in with Apple (OAuth)
export const signInWithApple = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
    return data;
};

// Sign out
export const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Subscribe to auth state changes
export const onAuthChange = (
    callback: (user: User | null) => void
): (() => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
            callback(session?.user ?? null);
        }
    );
    return () => subscription.unsubscribe();
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

export type { User };
