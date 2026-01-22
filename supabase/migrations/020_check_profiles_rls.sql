-- =====================================================
-- CHECK PROFILES RLS POLICIES - Show current state
-- =====================================================

-- Check current policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check if RLS is enabled
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Check profiles table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Count profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PROFILES RLS STATUS CHECKED!';
  RAISE NOTICE 'If policies exist, RLS is working';
  RAISE NOTICE '==================================================';
END $$;
