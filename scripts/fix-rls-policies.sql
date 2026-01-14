-- =====================================================
-- SİNYALDEYİZ - RLS POLICY FIX
-- =====================================================
-- Bu script Supabase SQL Editor'da çalıştırılmalıdır
-- vehicle_brands ve vehicle_models tablolarına anon insert izni verir

-- =====================================================
-- 1. vehicle_brands tablosu için politikalar
-- =====================================================

-- Mevcut politikaları göster (kontrol için)
SELECT * FROM pg_policies WHERE tablename = 'vehicle_brands';

-- INSERT politikası oluştur (veya güncelle)
CREATE POLICY IF NOT EXISTS "Allow insert for public on vehicle_brands"
ON vehicle_brands FOR INSERT
TO anon
WITH CHECK (true);

-- SELECT politikası oluştur (herkes okuyabilsin)
CREATE POLICY IF NOT EXISTS "Allow select for public on vehicle_brands"
ON vehicle_brands FOR SELECT
TO anon
USING (true);

-- =====================================================
-- 2. vehicle_models tablosu için politikalar
-- =====================================================

-- Mevcut politikaları göster (kontrol için)
SELECT * FROM pg_policies WHERE tablename = 'vehicle_models';

-- INSERT politikası oluştur (veya güncelle)
CREATE POLICY IF NOT EXISTS "Allow insert for public on vehicle_models"
ON vehicle_models FOR INSERT
TO anon
WITH CHECK (true);

-- SELECT politikası oluştur (herkes okuyabilsin)
CREATE POLICY IF NOT EXISTS "Allow select for public on vehicle_models"
ON vehicle_models FOR SELECT
TO anon
USING (true);

-- =====================================================
-- 3. Politikaları doğrula
-- =====================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('vehicle_brands', 'vehicle_models')
ORDER BY tablename, policyname;
