-- =====================================================
-- RECREATE vehicle_brands and vehicle_models tables
-- For compatibility with seed script
-- =====================================================

-- Drop existing tables (this will delete data)
DROP TABLE IF EXISTS public.vehicle_models CASCADE;
DROP TABLE IF EXISTS public.vehicle_brands CASCADE;

-- Create vehicle_brands with SERIAL id and type column
CREATE TABLE public.vehicle_brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('car', 'motorcycle')),
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, type)
);

-- Create vehicle_models with proper foreign key
CREATE TABLE public.vehicle_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES public.vehicle_brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_vehicle_brands_type ON public.vehicle_brands(type);
CREATE INDEX idx_vehicle_models_brand_id ON public.vehicle_models(brand_id);

-- Enable RLS
ALTER TABLE public.vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Enable read access for all users" ON public.vehicle_brands FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.vehicle_models FOR SELECT USING (true);

-- Verify schema
SELECT 'vehicle_brands columns:' as info;
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'vehicle_brands' ORDER BY ordinal_position;

SELECT 'vehicle_models columns:' as info;
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'vehicle_models' ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '==================================================';
  RAISE NOTICE 'VEHICLE TABLES RECREATED FOR SEED SCRIPT!';
  RAISE NOTICE 'vehicle_brands: SERIAL id, type column added';
  RAISE NOTICE 'vehicle_models: proper foreign key';
  RAISE NOTICE '==================================================';
END $$;
