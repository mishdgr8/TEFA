-- Run this in your Supabase SQL Editor to add the weight column to products
ALTER TABLE "public"."products" 
ADD COLUMN IF NOT EXISTS "weight" DECIMAL(10,2) DEFAULT 0.65;

-- Update existing products to have the default weight if they don't already
UPDATE "public"."products" SET "weight" = 0.65 WHERE "weight" IS NULL;
