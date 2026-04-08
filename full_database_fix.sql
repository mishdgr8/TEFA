-- RUN THIS IN SUPABASE SQL EDITOR TO FIX MISSING COLUMNS AND GUEST ACCESS

-- 1. Add missing columns to orders table
ALTER TABLE "public"."orders" 
ADD COLUMN IF NOT EXISTS "subtotal" DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS "shipping_cost" DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS "discount_amount" DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS "total_usd" DECIMAL(12,2);

-- 2. Add missing columns to order_items table
ALTER TABLE "public"."order_items" 
ADD COLUMN IF NOT EXISTS "image" TEXT,
ADD COLUMN IF NOT EXISTS "selected_color" TEXT,
ADD COLUMN IF NOT EXISTS "price_usd" DECIMAL(12,2);

-- 3. Fix RLS for Guest Checkouts (if not already done)
DROP POLICY IF EXISTS "Enable insert for anon and authenticated users" ON "public"."orders";
CREATE POLICY "Enable insert for anon and authenticated users" ON "public"."orders"
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable insert for anon and authenticated users" ON "public"."order_items";
CREATE POLICY "Enable insert for anon and authenticated users" ON "public"."order_items"
FOR INSERT WITH CHECK (true);

-- 4. Ensure admin/public can read orders
DROP POLICY IF EXISTS "Enable read for all users" ON "public"."orders";
CREATE POLICY "Enable read for all users" ON "public"."orders"
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read for all users" ON "public"."order_items";
CREATE POLICY "Enable read for all users" ON "public"."order_items"
FOR SELECT USING (true);
