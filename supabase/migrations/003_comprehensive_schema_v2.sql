-- =====================================================
-- Sinyaldeyiz Kapsamlı Veritabanı Şeması v2
-- =====================================================
-- Bu migration dosyasını Supabase SQL Editor'da çalıştırın
-- =====================================================

-- 1. PROFILES TABLOSU (Kullanıcı Profilleri)
-- =====================================================
-- İlk önce mevcut tabloyu güncelle veya oluştur

DO $$
BEGIN
    -- Create profiles table if not exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            nickname TEXT,
            provider TEXT DEFAULT 'email',
            avatar_url TEXT,
            age INTEGER,
            gender TEXT,
            city TEXT,
            is_guest BOOLEAN DEFAULT false,
            onboarding_completed BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'provider') THEN
        ALTER TABLE public.profiles ADD COLUMN provider TEXT DEFAULT 'email';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_guest') THEN
        ALTER TABLE public.profiles ADD COLUMN is_guest BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE public.profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. VEHICLE_BRANDS TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('car', 'motorcycle')),
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, type)
);

-- 3. VEHICLE_MODELS TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicle_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES public.vehicle_brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year_start INTEGER,
    year_end INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. VEHICLES TABLOSU (Kullanıcı Araçları)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    catalog_id INTEGER REFERENCES public.vehicle_brands(id),
    brand TEXT,
    model TEXT,
    year INTEGER,
    plate_number TEXT,
    nickname TEXT,
    is_primary BOOLEAN DEFAULT false,
    photo_urls TEXT[] DEFAULT '{}',
    vehicle_type TEXT DEFAULT 'car' CHECK (vehicle_type IN ('car', 'motorcycle')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CARS TABLOSU (Araç Kataloğu - Import için)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cars (
    id SERIAL PRIMARY KEY,
    marka TEXT NOT NULL,
    model TEXT NOT NULL,
    donanim TEXT,
    motor TEXT,
    yakit TEXT,
    vites TEXT,
    fiyat TEXT,
    websitesi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MOTORCYCLES TABLOSU (Motor Kataloğu)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.motorcycles (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER,
    brand_name TEXT NOT NULL,
    model_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- =====================================================

-- Profiles için RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Vehicle_brands için RLS (Herkes okuyabilir)
ALTER TABLE public.vehicle_brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read vehicle_brands" ON public.vehicle_brands;
CREATE POLICY "Anyone can read vehicle_brands" ON public.vehicle_brands
    FOR SELECT USING (true);

-- Vehicle_models için RLS (Herkes okuyabilir)
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read vehicle_models" ON public.vehicle_models;
CREATE POLICY "Anyone can read vehicle_models" ON public.vehicle_models
    FOR SELECT USING (true);

-- Vehicles için RLS
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own vehicles" ON public.vehicles;
CREATE POLICY "Users can view own vehicles" ON public.vehicles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vehicles" ON public.vehicles;
CREATE POLICY "Users can insert own vehicles" ON public.vehicles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vehicles" ON public.vehicles;
CREATE POLICY "Users can update own vehicles" ON public.vehicles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.vehicles;
CREATE POLICY "Users can delete own vehicles" ON public.vehicles
    FOR DELETE USING (auth.uid() = user_id);

-- Cars için RLS (Herkes okuyabilir)
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read cars" ON public.cars;
CREATE POLICY "Anyone can read cars" ON public.cars
    FOR SELECT USING (true);

-- Motorcycles için RLS (Herkes okuyabilir)
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read motorcycles" ON public.motorcycles;
CREATE POLICY "Anyone can read motorcycles" ON public.motorcycles
    FOR SELECT USING (true);

-- =====================================================
-- SAMPLE VEHICLE BRANDS DATA
-- =====================================================
INSERT INTO public.vehicle_brands (name, type) VALUES
-- Araba Markaları
('Alfa Romeo', 'car'),
('Audi', 'car'),
('BMW', 'car'),
('Chevrolet', 'car'),
('Citroen', 'car'),
('Dacia', 'car'),
('Fiat', 'car'),
('Ford', 'car'),
('Honda', 'car'),
('Hyundai', 'car'),
('Kia', 'car'),
('Mazda', 'car'),
('Mercedes-Benz', 'car'),
('Mitsubishi', 'car'),
('Nissan', 'car'),
('Opel', 'car'),
('Peugeot', 'car'),
('Renault', 'car'),
('Seat', 'car'),
('Skoda', 'car'),
('Subaru', 'car'),
('Suzuki', 'car'),
('Tesla', 'car'),
('Toyota', 'car'),
('Volkswagen', 'car'),
('Volvo', 'car'),
-- Motorsiklet Markaları
('Aprilia', 'motorcycle'),
('Benelli', 'motorcycle'),
('BMW Motorrad', 'motorcycle'),
('Ducati', 'motorcycle'),
('Harley-Davidson', 'motorcycle'),
('Honda', 'motorcycle'),
('Husqvarna', 'motorcycle'),
('Kawasaki', 'motorcycle'),
('KTM', 'motorcycle'),
('Moto Guzzi', 'motorcycle'),
('MV Agusta', 'motorcycle'),
('Royal Enfield', 'motorcycle'),
('Suzuki', 'motorcycle'),
('Triumph', 'motorcycle'),
('Yamaha', 'motorcycle')
ON CONFLICT (name, type) DO NOTHING;

-- Sample models for popular brands
INSERT INTO public.vehicle_models (brand_id, name) 
SELECT b.id, m.name FROM public.vehicle_brands b
CROSS JOIN (VALUES 
    ('A Serisi'), ('C Serisi'), ('E Serisi'), ('S Serisi'), ('GLC'), ('GLE')
) AS m(name)
WHERE b.name = 'Mercedes-Benz' AND b.type = 'car'
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicle_models (brand_id, name) 
SELECT b.id, m.name FROM public.vehicle_brands b
CROSS JOIN (VALUES 
    ('1 Serisi'), ('3 Serisi'), ('5 Serisi'), ('7 Serisi'), ('X3'), ('X5'), ('X6')
) AS m(name)
WHERE b.name = 'BMW' AND b.type = 'car'
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicle_models (brand_id, name) 
SELECT b.id, m.name FROM public.vehicle_brands b
CROSS JOIN (VALUES 
    ('Golf'), ('Passat'), ('Polo'), ('Tiguan'), ('T-Roc'), ('Arteon')
) AS m(name)
WHERE b.name = 'Volkswagen' AND b.type = 'car'
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicle_models (brand_id, name) 
SELECT b.id, m.name FROM public.vehicle_brands b
CROSS JOIN (VALUES 
    ('CBR600RR'), ('CBR1000RR'), ('CB650R'), ('Africa Twin'), ('Goldwing'), ('Rebel 500')
) AS m(name)
WHERE b.name = 'Honda' AND b.type = 'motorcycle'
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicle_models (brand_id, name) 
SELECT b.id, m.name FROM public.vehicle_brands b
CROSS JOIN (VALUES 
    ('YZF-R1'), ('MT-07'), ('MT-09'), ('Tracer 900'), ('Tenere 700'), ('XSR700')
) AS m(name)
WHERE b.name = 'Yamaha' AND b.type = 'motorcycle'
ON CONFLICT DO NOTHING;

INSERT INTO public.vehicle_models (brand_id, name) 
SELECT b.id, m.name FROM public.vehicle_brands b
CROSS JOIN (VALUES 
    ('Ninja 400'), ('Ninja ZX-6R'), ('Ninja ZX-10R'), ('Z650'), ('Z900'), ('Versys 650')
) AS m(name)
WHERE b.name = 'Kawasaki' AND b.type = 'motorcycle'
ON CONFLICT DO NOTHING;

-- =====================================================
-- AUTO-CREATE PROFILE TRIGGER
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

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON public.vehicles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_type ON public.vehicle_brands(type);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand_id ON public.vehicle_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON public.profiles(nickname);

-- =====================================================
-- DONE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Sinyaldeyiz veritabanı şeması v2 başarıyla oluşturuldu!';
    RAISE NOTICE '📌 Tablolar: profiles, vehicle_brands, vehicle_models, vehicles, cars, motorcycles';
    RAISE NOTICE '📌 Örnek marka/model verileri eklendi';
END $$;
