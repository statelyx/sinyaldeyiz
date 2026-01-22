-- =====================================================
-- FIX PROFILES RLS - Allow insert for new users
-- =====================================================

-- Drop existing INSERT policy if exists
DROP POLICY IF EXISTS "Enable insert for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create a more permissive INSERT policy
-- This allows authenticated users to insert a profile where id matches their auth.uid()
CREATE POLICY "Allow authenticated users to insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also ensure service role can bypass RLS (for server-side operations)
-- This is already default behavior but we ensure it

-- Verify the policy was created
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'profiles' AND cmd = 'INSERT';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Profiles INSERT RLS policy fixed!';
END $$;
