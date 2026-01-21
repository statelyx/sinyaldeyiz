-- =====================================================
-- VERIFICATION - Check tables were created
-- =====================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('location_status', 'vehicles', 'vehicle_brands', 'profiles')
ORDER BY table_name;

-- Check location_status columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'location_status'
ORDER BY ordinal_position;

-- Check realtime
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
