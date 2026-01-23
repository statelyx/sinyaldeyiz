-- =====================================================
-- ADD: Role-based access control for admin users
-- =====================================================

-- Add role column to profiles table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.profiles
        ADD COLUMN role TEXT DEFAULT 'user'
        CHECK (role IN ('user', 'admin', 'moderator'));

        RAISE NOTICE 'role column added to profiles';
    END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Update existing admin emails to have admin role
UPDATE public.profiles
SET role = 'admin'
WHERE email IN ('statelyxx@gmail.com', 'admin@sinyaldeyiz.com');

-- Verify
SELECT email, role FROM public.profiles WHERE role = 'admin';
