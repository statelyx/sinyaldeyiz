-- =====================================================
-- FIX: Proper RLS policies for vehicles table
-- This ensures users can only see and manage their own vehicles
-- =====================================================

-- Enable RLS on vehicles table
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.vehicles;

-- Create proper RLS policies

-- SELECT: Users can only view their own vehicles
CREATE POLICY "Users can view their own vehicles"
ON public.vehicles FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Users can only insert their own vehicles
CREATE POLICY "Users can insert their own vehicles"
ON public.vehicles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own vehicles
CREATE POLICY "Users can update their own vehicles"
ON public.vehicles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own vehicles
CREATE POLICY "Users can delete their own vehicles"
ON public.vehicles FOR DELETE
USING (auth.uid() = user_id);

-- Verify the policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'vehicles'
ORDER BY policyname;
