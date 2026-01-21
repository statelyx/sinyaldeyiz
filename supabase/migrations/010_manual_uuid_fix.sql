-- =====================================================
-- SINYALDEYIZ - MANUAL UUID VERSION (NO FUNCTIONS)
-- Run this in Supabase SQL Editor
-- This version uses no UUID generation functions
-- =====================================================

-- First enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- location_status - MOST CRITICAL!
-- =====================================================
DROP TABLE IF EXISTS public.location_status CASCADE;

CREATE TABLE public.location_status (
  user_id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
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

-- =====================================================
-- vehicles - Manual default, will be replaced by app
-- =====================================================
DROP TABLE IF EXISTS public.vehicles CASCADE;

CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
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

-- =====================================================
-- vehicle_brands
-- =====================================================
DROP TABLE IF EXISTS public.vehicle_brands CASCADE;

CREATE TABLE public.vehicle_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- profiles - Manual default, will be replaced by app
-- =====================================================
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  nickname TEXT UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 18),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  city TEXT,
  avatar_url TEXT,
  status_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_location_status_visible ON public.location_status(is_visible, expires_at) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_location_status_status ON public.location_status(status_expires_at) WHERE status_message IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_name ON public.vehicle_brands(name);

-- =====================================================
-- FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_location_status_updated_at ON public.location_status;
CREATE TRIGGER update_location_status_updated_at BEFORE UPDATE ON public.location_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_status IF NOT EXISTS;

-- =====================================================
-- VERIFY
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'SINYALDEYIZ DATABASE SETUP COMPLETE!';
  RAISE NOTICE 'location_status: OK';
  RAISE NOTICE 'vehicles: OK';
  RAISE NOTICE 'vehicle_brands: OK';
  RAISE NOTICE 'profiles: OK';
  RAISE NOTICE '==================================================';
END $$;

-- Check tables
SELECT 'Tables:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
