-- =====================================================
-- CHECK AND FIX vehicle_catalog - Make brands/models visible
-- =====================================================

-- Check if vehicle_catalog exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'vehicle_catalog';

-- Count records in vehicle_catalog
SELECT COUNT(*) as total_catalog_records FROM public.vehicle_catalog;

-- Show sample data if exists
SELECT * FROM public.vehicle_catalog LIMIT 5;

-- If vehicle_catalog is empty, we need to check if it exists first
-- The issue might be that vehicle_catalog table doesn't exist

-- Create vehicle_catalog if not exists
CREATE TABLE IF NOT EXISTS public.vehicle_catalog (
  id TEXT PRIMARY KEY,
  marka TEXT NOT NULL,
  model TEXT NOT NULL,
  donanim TEXT NOT NULL,
  motor TEXT NOT NULL,
  yakit TEXT NOT NULL CHECK (yakit IN ('Benzin', 'Dizel', 'Hibrit', 'Elektrik', 'LPG')),
  vites TEXT NOT NULL CHECK (vites IN ('Düz', 'Otomatik', 'Yarı Otomatik', 'CVT')),
  fiyat TEXT NOT NULL,
  websitesi TEXT
);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'VEHICLE_CATALOG CHECKED!';
  RAISE NOTICE '==================================================';
END $$;
