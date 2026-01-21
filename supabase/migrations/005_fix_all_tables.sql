-- =====================================================
-- SINYALDEYIZ - COMPREHENSIVE DATABASE FIX
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 18),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add status message fields if they don't exist
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
-- 2. VEHICLE CATALOG TABLE
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
-- 3. VEHICLES TABLE (User vehicles)
-- =====================================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  catalog_id TEXT REFERENCES vehicle_catalog(id) ON DELETE SET NULL,
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
-- 4. LOCATION STATUS TABLE (CRITICAL - Ghost Mode)
-- =====================================================
CREATE TABLE IF NOT EXISTS location_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
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
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ENTRIES TABLE (Forum responses)
-- =====================================================
CREATE TABLE IF NOT EXISTS entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. VOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS votes (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);

-- Vehicles
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_catalog_id ON vehicles(catalog_id);

-- Location Status (CRITICAL for signal feature)
CREATE INDEX IF NOT EXISTS idx_location_status_visible ON location_status(is_visible, expires_at) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_location_status_geohash ON location_status USING GIST(geohash gist_geometry_ops);
CREATE INDEX IF NOT EXISTS idx_location_status_updated ON location_status(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_location_status_status ON location_status(status_expires_at) WHERE status_message IS NOT NULL;

-- Topics
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topics_brand_model ON topics(brand, model, created_at DESC);

-- Entries
CREATE INDEX IF NOT EXISTS idx_entries_topic_id ON entries(topic_id, created_at);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id, created_at DESC);

-- Votes
CREATE INDEX IF NOT EXISTS idx_votes_entry_id ON votes(entry_id);

-- Reports
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status, created_at DESC);

-- Hotspots
CREATE INDEX IF NOT EXISTS idx_hotspots_region ON hotspots(region_id);
CREATE INDEX IF NOT EXISTS idx_hotspots_updated ON hotspots(updated_at DESC);

-- Vehicle Brands
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_name ON vehicle_brands(name);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
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

-- Function to expire visibility
CREATE OR REPLACE FUNCTION expire_visibility()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_visible = TRUE AND OLD.expires_at IS NOT NULL AND OLD.expires_at <= NOW() THEN
    NEW.is_visible = FALSE;
    NEW.expires_at = NULL;
    NEW.visibility_duration = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_expire_visibility ON location_status;
CREATE TRIGGER trigger_expire_visibility
  BEFORE UPDATE ON location_status
  FOR EACH ROW
  EXECUTE FUNCTION expire_visibility();

-- Function to update hotspot count
CREATE OR REPLACE FUNCTION update_hotspot_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.geohash IS NOT NULL AND NEW.is_visible = TRUE THEN
    INSERT INTO hotspots (region_id, user_count)
    VALUES (SUBSTRING(NEW.geohash, 1, 6), 1)
    ON CONFLICT (region_id) DO UPDATE
    SET user_count = hotspots.user_count + 1,
        updated_at = NOW();
  END IF;

  IF OLD.is_visible = TRUE AND (NEW.is_visible = FALSE OR NEW.expires_at <= NOW()) THEN
    UPDATE hotspots
    SET user_count = GREATEST(user_count - 1, 0),
        updated_at = NOW()
    WHERE region_id = SUBSTRING(OLD.geohash, 1, 6);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_hotspots ON location_status;
CREATE TRIGGER trigger_update_hotspots
  AFTER INSERT OR UPDATE ON location_status
  FOR EACH ROW
  EXECUTE FUNCTION update_hotspot_count();

-- Function to calculate entry score
CREATE OR REPLACE FUNCTION get_entry_score(entry_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER;
BEGIN
  SELECT COALESCE(SUM(value), 0) INTO score
  FROM votes
  WHERE votes.entry_id = get_entry_score.entry_id;
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Vehicles RLS
CREATE POLICY "Users can view all vehicles" ON vehicles FOR SELECT USING (true);
CREATE POLICY "Users can insert own vehicles" ON vehicles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vehicles" ON vehicles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vehicles" ON vehicles FOR DELETE USING (auth.uid() = user_id);

-- Location Status RLS
CREATE POLICY "Users can view visible locations" ON location_status FOR SELECT USING (is_visible = true OR auth.uid() = user_id);
CREATE POLICY "Users can manage own location" ON location_status FOR ALL USING (auth.uid() = user_id);

-- Topics RLS
CREATE POLICY "Users can view all topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create topics" ON topics FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update own topics" ON topics FOR UPDATE USING (auth.uid() = created_by);

-- Entries RLS
CREATE POLICY "Users can view all entries" ON entries FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create entries" ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON entries FOR UPDATE USING (auth.uid() = user_id);

-- Votes RLS
CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Reports RLS
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Authenticated users can create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = created_by);

-- =====================================================
-- ENABLE REALTIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE location_status;
ALTER PUBLICATION supabase_realtime ADD TABLE topics;
ALTER PUBLICATION supabase_realtime ADD TABLE entries;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SINYALDEYIZ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'All tables created successfully';
  RAISE NOTICE 'RLS policies enabled';
  RAISE NOTICE 'Realtime enabled for location_status';
  RAISE NOTICE '==========================================';
END $$;
