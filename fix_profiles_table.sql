-- FIX FOR PROFILES TABLE
-- Run this in the Supabase SQL Editor

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS "country" TEXT;

-- Refresh the schema cache if possible (Supabase does this automatically usually)
-- But the following ensures the profiles table has necessary columns for onboarding.
