-- =====================================================
-- FIX: Add brand, model, vehicle_type to vehicles table
-- This migration fixes the schema mismatch between the
-- vehicles table and the onboarding code
-- =====================================================

-- Add brand column (TEXT, nullable for existing records)
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Add model column (TEXT, nullable for flexibility)
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS model TEXT;

-- Add vehicle_type column (TEXT with check constraint)
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS vehicle_type TEXT
CHECK (vehicle_type IN ('car', 'motorcycle'));

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_brand
ON public.vehicles(brand);

CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_type
ON public.vehicles(vehicle_type);

-- Add comment for documentation
COMMENT ON COLUMN public.vehicles.brand IS 'Vehicle brand name (e.g., BMW, Mercedes)';
COMMENT ON COLUMN public.vehicles.model IS 'Vehicle model name (e.g., 320i, C200)';
COMMENT ON COLUMN public.vehicles.vehicle_type IS 'Vehicle type: car or motorcycle';

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'vehicles'
AND column_name IN ('brand', 'model', 'vehicle_type')
ORDER BY column_name;
