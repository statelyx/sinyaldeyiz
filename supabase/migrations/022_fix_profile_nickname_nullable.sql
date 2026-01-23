-- =====================================================
-- FIX: Make nickname nullable in profiles table
-- Reason: Initial profile creation sends null for nickname
-- User sets nickname during onboarding
-- =====================================================

-- Drop NOT NULL constraint from nickname
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

        RAISE NOTICE 'nickname column is now nullable';
    ELSE
        RAISE NOTICE 'nickname column is already nullable or does not exist';
    END IF;
END $$;

-- Verify the change
SELECT
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'nickname';
