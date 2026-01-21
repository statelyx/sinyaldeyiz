-- =====================================================
-- STEP BY STEP - Run each section separately
-- =====================================================

-- STEP 1: Check existing tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- STEP 2: Create ONLY location_status table (most critical)
-- Run this AFTER checking step 1
CREATE TABLE public.location_status (
  user_id UUID PRIMARY KEY,
  is_visible BOOLEAN DEFAULT FALSE,
  visibility_duration INTEGER CHECK (visibility_duration IN (10, 30, 60)),
  expires_at TIMESTAMPTZ,
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  geohash TEXT,
  accuracy_meters INTEGER,
  last_location_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status_message TEXT,
  status_expires_at TIMESTAMPTZ
);

-- STEP 3: Check if location_status created
SELECT * FROM information_schema.columns WHERE table_name = 'location_status';

-- STEP 4: Create vehicle_brands table
CREATE TABLE IF NOT EXISTS public.vehicle_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 5: Check vehicle_brands
SELECT * FROM information_schema.columns WHERE table_name = 'vehicle_brands';

-- STEP 6: Create vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  catalog_id TEXT,
  year INTEGER CHECK (year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  plate_number TEXT,
  nickname TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plate_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_location_status_visible ON public.location_status(is_visible, expires_at) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_location_status_status ON public.location_status(status_expires_at) WHERE status_message IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_name ON public.vehicle_brands(name);

-- Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_location_status_updated_at ON public.location_status;
CREATE TRIGGER update_location_status_updated_at BEFORE UPDATE ON public.location_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_status;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'CRITICAL TABLES CREATED!';
  RAISE NOTICE 'location_status: OK';
  RAISE NOTICE 'vehicles: OK';
  RAISE NOTICE 'vehicle_brands: OK';
  RAISE NOTICE '==================================================';
END $$;
