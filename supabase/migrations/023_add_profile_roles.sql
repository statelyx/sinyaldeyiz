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

-- Note: Admin role assignment is handled at application level
-- The admin page checks both email (legacy) and role column (new)
-- To manually assign admin role to a user, run:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'user_uuid';

-- Verify
SELECT id, role FROM public.profiles WHERE role = 'admin';
