-- =====================================================
-- 🚨 SINYALDEYIZ PRODUCTION DATABASE FIX
-- =====================================================
-- Bu scripti Supabase SQL Editor'da çalıştırın
-- https://supabase.com/dashboard -> Projeniz -> SQL Editor
-- =====================================================

-- STEP 1: Add missing columns to profiles table
-- =====================================================

-- Add onboarding_completed column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ onboarding_completed column added';
    ELSE
        RAISE NOTICE '⚠️ onboarding_completed column already exists';
    END IF;
END $$;

-- Add email column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
        RAISE NOTICE '✅ email column added';
    ELSE
        RAISE NOTICE '⚠️ email column already exists';
    END IF;
END $$;

-- Add provider column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'provider'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN provider TEXT DEFAULT 'email';
        RAISE NOTICE '✅ provider column added';
    ELSE
        RAISE NOTICE '⚠️ provider column already exists';
    END IF;
END $$;

-- Add is_guest column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'is_guest'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_guest BOOLEAN DEFAULT false;
        RAISE NOTICE '✅ is_guest column added';
    ELSE
        RAISE NOTICE '⚠️ is_guest column already exists';
    END IF;
END $$;

-- STEP 2: Make nickname nullable (required for initial profile creation)
-- =====================================================

DO $$
BEGIN
    -- Check if nickname column exists and is NOT NULL
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'nickname'
        AND is_nullable = 'NO'
    ) THEN
        -- First drop the unique constraint if it exists
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_nickname_key;
        
        -- Then make the column nullable
        ALTER TABLE public.profiles ALTER COLUMN nickname DROP NOT NULL;
        
        RAISE NOTICE '✅ nickname column is now nullable';
    ELSE
        RAISE NOTICE '⚠️ nickname column is already nullable or does not exist';
    END IF;
END $$;

-- STEP 3: Fix RLS policies for profiles table
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can upsert own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to insert their own profile" ON public.profiles;

-- Create proper RLS policies
CREATE POLICY "Enable read access for authenticated users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

RAISE NOTICE '✅ RLS policies created/updated';

-- STEP 4: Create auto-profile trigger (if not exists)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, provider, is_guest, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
        CASE WHEN NEW.email IS NULL THEN true ELSE false END,
        false
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

RAISE NOTICE '✅ Auto-profile trigger created';

-- STEP 5: Verify the changes
-- =====================================================

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Done!
DO $$
BEGIN
    RAISE NOTICE '================================================';
    RAISE NOTICE '🎉 DATABASE FIX COMPLETED!';
    RAISE NOTICE 'Artık giriş yapabilir ve onboarding tamamlayabilirsiniz.';
    RAISE NOTICE '================================================';
END $$;
