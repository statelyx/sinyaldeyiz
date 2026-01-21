-- =====================================================
-- CHECK VEHICLES TABLE - Debug why garage shows empty
-- =====================================================

-- Check if vehicles table exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'vehicles';

-- Check if vehicle_catalog exists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'vehicle_catalog';

-- Count vehicles in table
SELECT COUNT(*) as total_vehicles FROM public.vehicles;

-- Check RLS policies on vehicles
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
WHERE tablename = 'vehicles';

-- Show sample vehicles (if any)
SELECT * FROM public.vehicles LIMIT 5;

-- Check if current user has any vehicles
-- Note: Replace YOUR_USER_ID with actual UUID from profiles table
SELECT id, nickname FROM public.profiles ORDER BY created_at DESC LIMIT 5;
