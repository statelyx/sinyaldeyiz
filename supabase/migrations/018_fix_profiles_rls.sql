-- =====================================================
-- FIX PROFILES RLS - Allow users to update their own profile
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can upsert own profiles" ON public.profiles;

-- Create proper RLS policies for profiles
CREATE POLICY "Users can view own profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profiles"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Verify policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'profiles';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'PROFILES RLS POLICIES FIXED!';
  RAISE NOTICE 'Users can now update their own profiles';
  RAISE NOTICE '==================================================';
END $$;
