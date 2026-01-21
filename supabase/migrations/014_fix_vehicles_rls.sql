-- =====================================================
-- FIX VEHICLES TABLE - Add RLS policies so users can see their vehicles
-- =====================================================

-- Enable RLS on vehicles
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own vehicles
CREATE POLICY "Users can view own vehicles"
  ON public.vehicles
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Policy: Users can insert their own vehicles
CREATE POLICY "Users can insert own vehicles"
  ON public.vehicles
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Policy: Users can update their own vehicles
CREATE POLICY "Users can update own vehicles"
  ON public.vehicles
  FOR UPDATE
  USING (auth.uid()::text = user_id::text);

-- Policy: Users can delete their own vehicles
CREATE POLICY "Users can delete own vehicles"
  ON public.vehicles
  FOR DELETE
  USING (auth.uid()::text = user_id::text);

-- Check policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'vehicles';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'VEHICLES RLS POLICIES ADDED!';
  RAISE NOTICE 'Users can now see their vehicles';
  RAISE NOTICE '==================================================';
END $$;
