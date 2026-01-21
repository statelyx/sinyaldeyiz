-- =====================================================
-- SINYALDEYIZ - SAFE DATABASE FIX
-- Run this in Supabase SQL Editor
-- This version checks if tables exist before creating
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PROFILES TABLE (Safe version)
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
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
        RAISE NOTICE 'profiles table created';
    ELSE
        RAISE NOTICE 'profiles table already exists';
    END IF;
END $$;

-- Add status message columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'status_message'
    ) THEN
        ALTER TABLE profiles ADD COLUMN status_message TEXT;
        RAISE NOTICE 'profiles.status_message added';
    END IF;
END $$;

-- =====================================================
-- 2. LOCATION STATUS TABLE (CRITICAL - Ghost Mode)
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'location_status') THEN
        CREATE TABLE location_status (
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
        RAISE NOTICE 'location_status table created';
    ELSE
        -- Add status columns if they don't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'location_status' AND column_name = 'status_message'
        ) THEN
            ALTER TABLE location_status ADD COLUMN status_message TEXT;
            RAISE NOTICE 'location_status.status_message added';
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'location_status' AND column_name = 'status_expires_at'
        ) THEN
            ALTER TABLE location_status ADD COLUMN status_expires_at TIMESTAMPTZ;
            RAISE NOTICE 'location_status.status_expires_at added';
        END IF;
    END IF;
END $$;

-- =====================================================
-- 3. VEHICLES TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vehicles') THEN
        CREATE TABLE vehicles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
        RAISE NOTICE 'vehicles table created';
    ELSE
        RAISE NOTICE 'vehicles table already exists';
    END IF;
END $$;

-- =====================================================
-- 4. VEHICLE CATALOG TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vehicle_catalog') THEN
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
        RAISE NOTICE 'vehicle_catalog table created';
    ELSE
        RAISE NOTICE 'vehicle_catalog table already exists';
    END IF;
END $$;

-- =====================================================
-- 5. VEHICLE BRANDS TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vehicle_brands') THEN
        CREATE TABLE vehicle_brands (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          country TEXT,
          logo_url TEXT,
          website TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'vehicle_brands table created';
    ELSE
        RAISE NOTICE 'vehicle_brands table already exists';
    END IF;
END $$;

-- =====================================================
-- 6. TOPICS TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'topics') THEN
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
        RAISE NOTICE 'topics table created';
    ELSE
        RAISE NOTICE 'topics table already exists';
    END IF;
END $$;

-- =====================================================
-- 7. ENTRIES TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'entries') THEN
        CREATE TABLE entries (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        RAISE NOTICE 'entries table created';
    ELSE
        RAISE NOTICE 'entries table already exists';
    END IF;
END $$;

-- =====================================================
-- 8. VOTES TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'votes') THEN
        CREATE TABLE votes (
          entry_id UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          value INTEGER NOT NULL CHECK (value IN (-1, 1)),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          PRIMARY KEY (entry_id, user_id)
        );
        RAISE NOTICE 'votes table created';
    ELSE
        RAISE NOTICE 'votes table already exists';
    END IF;
END $$;

-- =====================================================
-- 9. REPORTS TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports') THEN
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
        RAISE NOTICE 'reports table created';
    ELSE
        RAISE NOTICE 'reports table already exists';
    END IF;
END $$;

-- =====================================================
-- 10. HOTSPOTS TABLE
-- =====================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'hotspots') THEN
        CREATE TABLE hotspots (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          region_id TEXT NOT NULL,
          region_name TEXT,
          user_count INTEGER DEFAULT 0,
          started_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(region_id)
        );
        RAISE NOTICE 'hotspots table created';
    ELSE
        RAISE NOTICE 'hotspots table already exists';
    END IF;
END $$;

-- =====================================================
-- INDEXES (Create only if they don't exist)
-- =====================================================

-- Location Status Indexes
CREATE INDEX IF NOT EXISTS idx_location_status_visible ON location_status(is_visible, expires_at) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_location_status_status ON location_status(status_expires_at) WHERE status_message IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_location_status_updated ON location_status(updated_at DESC);

-- Vehicles Indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);

-- Vehicle Brands Indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_name ON vehicle_brands(name);

-- Topics Indexes
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category, created_at DESC);

-- Entries Indexes
CREATE INDEX IF NOT EXISTS idx_entries_topic_id ON entries(topic_id, created_at);

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

-- Create triggers only if they don't exist
DO $$
BEGIN
    -- Profiles trigger
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at
        BEFORE UPDATE ON profiles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'update_profiles_updated_at trigger created';
    END IF;

    -- Vehicles trigger
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_vehicles_updated_at') THEN
        CREATE TRIGGER update_vehicles_updated_at
        BEFORE UPDATE ON vehicles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'update_vehicles_updated_at trigger created';
    END IF;

    -- Location status trigger
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_location_status_updated_at') THEN
        CREATE TRIGGER update_location_status_updated_at
        BEFORE UPDATE ON location_status
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'update_location_status_updated_at trigger created';
    END IF;

    -- Topics trigger
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_topics_updated_at') THEN
        CREATE TRIGGER update_topics_updated_at
        BEFORE UPDATE ON topics
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'update_topics_updated_at trigger created';
    END IF;

    -- Entries trigger
    IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_entries_updated_at') THEN
        CREATE TRIGGER update_entries_updated_at
        BEFORE UPDATE ON entries
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'update_entries_updated_at trigger created';
    END IF;
END $$;

-- =====================================================
-- ENABLE REALTIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE location_status IF NOT EXISTS;
ALTER PUBLICATION supabase_realtime ADD TABLE topics IF NOT EXISTS;
ALTER PUBLICATION supabase_realtime ADD TABLE entries IF NOT EXISTS;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'SINYALDEYIZ DATABASE SETUP COMPLETE!';
  RAISE NOTICE '==========================================';
  RAISE NOTICE 'All tables checked/created successfully';
  RAISE NOTICE 'location_status table: OK';
  RAISE NOTICE 'Realtime enabled';
  RAISE NOTICE '==========================================';
END $$;
