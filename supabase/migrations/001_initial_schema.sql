-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT UNIQUE NOT NULL,
  age INTEGER CHECK (age >= 18),
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  city TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicle catalog (seeded from arabalar.json)
CREATE TABLE vehicle_catalog (
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

-- User vehicles
CREATE TABLE vehicles (
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

-- Location status (ghost mode)
CREATE TABLE location_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  is_visible BOOLEAN DEFAULT FALSE,
  visibility_duration INTEGER CHECK (visibility_duration IN (30, 60, 120)),
  expires_at TIMESTAMPTZ,
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  geohash TEXT,
  accuracy_meters INTEGER,
  last_location_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Topics (dictionary entries)
CREATE TABLE topics (
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

-- Entries (topic responses)
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes
CREATE TABLE votes (
  entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (entry_id, user_id)
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_type TEXT NOT NULL CHECK (target_type IN ('topic', 'entry', 'user', 'vehicle_photo')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'violence', 'other')),
  description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'))
);

-- Hotspots/Events
CREATE TABLE hotspots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  region_id TEXT NOT NULL, -- geohash prefix (e.g., first 6 chars)
  region_name TEXT,
  user_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_id)
);

-- Indexes for performance
CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_catalog_id ON vehicles(catalog_id);
CREATE INDEX idx_location_status_geohash ON location_status USING GIST(geohash gist_geometry_ops);
CREATE INDEX idx_location_status_visible ON location_status(is_visible, expires_at) WHERE is_visible = TRUE;
CREATE INDEX idx_location_status_updated ON location_status(updated_at DESC);
CREATE INDEX idx_topics_category ON topics(category, created_at DESC);
CREATE INDEX idx_topics_brand_model ON topics(brand, model, created_at DESC);
CREATE INDEX idx_entries_topic_id ON entries(topic_id, created_at);
CREATE INDEX idx_entries_user_id ON entries(user_id, created_at DESC);
CREATE INDEX idx_votes_entry_id ON votes(entry_id);
CREATE INDEX idx_reports_status ON reports(status, created_at DESC);
CREATE INDEX idx_hotspots_region ON hotspots(region_id);
CREATE INDEX idx_hotspots_updated ON hotspots(updated_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_status_updated_at BEFORE UPDATE ON location_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entries_updated_at BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotspots_updated_at BEFORE UPDATE ON hotspots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to expire visibility
CREATE OR REPLACE FUNCTION expire_visibility()
RETURNS TRIGGER AS $$
BEGIN
  -- If visibility has expired, set to invisible
  IF OLD.is_visible = TRUE AND OLD.expires_at IS NOT NULL AND OLD.expires_at <= NOW() THEN
    NEW.is_visible = FALSE;
    NEW.expires_at = NULL;
    NEW.visibility_duration = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check visibility expiry on update
CREATE TRIGGER trigger_expire_visibility
  BEFORE UPDATE ON location_status
  FOR EACH ROW
  EXECUTE FUNCTION expire_visibility();

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

-- Function to update hotspot count
CREATE OR REPLACE FUNCTION update_hotspot_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Extract first 6 chars of geohash for region
  IF NEW.geohash IS NOT NULL AND NEW.is_visible = TRUE THEN
    INSERT INTO hotspots (region_id, user_count)
    VALUES (SUBSTRING(NEW.geohash, 1, 6), 1)
    ON CONFLICT (region_id) DO UPDATE
    SET user_count = hotspots.user_count + 1,
        updated_at = NOW();
  END IF;

  -- Handle expiry case
  IF OLD.is_visible = TRUE AND (NEW.is_visible = FALSE OR NEW.expires_at <= NOW()) THEN
    UPDATE hotspots
    SET user_count = GREATEST(user_count - 1, 0),
        updated_at = NOW()
    WHERE region_id = SUBSTRING(OLD.geohash, 1, 6);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update hotspots
CREATE TRIGGER trigger_update_hotspots
  AFTER INSERT OR UPDATE ON location_status
  FOR EACH ROW
  EXECUTE FUNCTION update_hotspot_count();
