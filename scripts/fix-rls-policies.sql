-- =====================================================
-- SİNYALDEYİZ - RLS POLICY FIX
-- =====================================================
-- Supabase SQL Editor'da çalıştırılabilir
-- vehicle_brands ve vehicle_models tablolarına anon insert izni verir

-- vehicle_brands için politikalar
CREATE POLICY IF NOT EXISTS "Allow insert for public on vehicle_brands"
ON vehicle_brands FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow select for public on vehicle_brands"
ON vehicle_brands FOR SELECT
TO anon
USING (true);

-- vehicle_models için politikalar
CREATE POLICY IF NOT EXISTS "Allow insert for public on vehicle_models"
ON vehicle_models FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow select for public on vehicle_models"
ON vehicle_models FOR SELECT
TO anon
USING (true);

-- Politikaları doğrula
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('vehicle_brands', 'vehicle_models')
ORDER BY tablename, policyname;
