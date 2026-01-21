-- =====================================================
-- SINYALDEYIZ - ULTRA SAFE DATABASE FIX
-- Run this in Supabase SQL Editor
-- No foreign keys to auth schema, only UUID references
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  nickname TEXT UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 18),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  city TEXT,
  avatar_url TEXT,
  status_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add status_message if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'status_message'
    ) THEN
        ALTER TABLE profiles ADD COLUMN status_message TEXT;
    END IF;
END $$;

-- =====================================================
-- 2. LOCATION STATUS TABLE (CRITICAL!)
-- =====================================================
CREATE TABLE IF NOT EXISTS location_status (
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

-- =====================================================
-- 3. VEHICLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicles (
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

-- =====================================================
-- 4. VEHICLE CATALOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_catalog (
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

-- =====================================================
-- 5. VEHICLE BRANDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicle_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TOPICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL CHECK (category IN ('general', 'brand', 'model', 'location', 'event')),
  brand TEXT,
  model TEXT,
  city TEXT,
  title TEXT NOT NULL,
  content TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ENTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. VOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS votes (
  entry_id UUID NOT NULL,
  user_id UUID NOT NULL,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (entry_id, user_id)
);

-- =====================================================
-- 9. REPORTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type TEXT NOT NULL CHECK (target_type IN ('topic', 'entry', 'user', 'vehicle_photo')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'violence', 'other')),
  description TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'))
);

-- =====================================================
-- 10. HOTSPOTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id TEXT NOT NULL,
  region_name TEXT,
  user_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_location_status_visible ON location_status(is_visible, expires_at) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_location_status_status ON location_status(status_expires_at) WHERE status_message IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_location_status_updated ON location_status(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_name ON vehicle_brands(name);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entries_topic_id ON entries(topic_id, created_at);

-- =====================================================
-- FUNCTIONS
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

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_location_status_updated_at ON location_status;
CREATE TRIGGER update_location_status_updated_at BEFORE UPDATE ON location_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_entries_updated_at ON entries;
CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hotspots_updated_at ON hotspots;
CREATE TRIGGER update_hotspots_updated_at BEFORE UPDATE ON hotspots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE location_status;
ALTER PUBLICATION supabase_realtime ADD TABLE topics;
ALTER PUBLICATION supabase_realtime ADD TABLE entries;

-- =====================================================
-- DONE!
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SINYALDEYIZ DATABASE SETUP COMPLETE!';
  RAISE NOTICE 'All tables created successfully!';
  RAISE NOTICE 'location_status: OK ✓';
  RAISE NOTICE 'vehicles: OK ✓';
  RAISE NOTICE 'vehicle_brands: OK ✓';
  RAISE NOTICE 'Realtime: enabled ✓';
  RAISE NOTICE '==========================================';
END $$;
