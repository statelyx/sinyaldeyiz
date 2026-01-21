-- =====================================================
-- FIX vehicle_brands TABLE - Add type column
-- =====================================================

-- Add type column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicle_brands' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.vehicle_brands ADD COLUMN type TEXT NOT NULL DEFAULT 'car';
  END IF;
END $$;

-- Create check constraint for type values
ALTER TABLE public.vehicle_brands DROP CONSTRAINT IF EXISTS vehicle_brands_type_check;
ALTER TABLE public.vehicle_brands ADD CONSTRAINT vehicle_brands_type_check
  CHECK (type IN ('car', 'motorcycle'));

-- Create index on type for faster queries
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_type ON public.vehicle_brands(type);

-- Verify schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'vehicle_brands'
ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'VEHICLE_BRANDS SCHEMA FIXED!';
  RAISE NOTICE 'Added type column (car/motorcycle)';
  RAISE NOTICE '==================================================';
END $$;
