-- =====================================================
-- Sinyaldeyiz Kapsamlı Veritabanı Şeması
-- =====================================================
-- Bu migration dosyasını Supabase SQL Editor'da çalıştırın
-- =====================================================

-- 1. PROFILES TABLOSU (Kullanıcı Profilleri)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    nickname TEXT,
    provider TEXT DEFAULT 'email' CHECK (provider IN ('google', 'email', 'guest')),
    avatar_url TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    city TEXT,
    is_guest BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eğer tablo zaten varsa, yeni sütunları ekleyelim
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'provider') THEN
        ALTER TABLE public.profiles ADD COLUMN provider TEXT DEFAULT 'email' CHECK (provider IN ('google', 'email', 'guest'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_guest') THEN
        ALTER TABLE public.profiles ADD COLUMN is_guest BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. CARS TABLOSU (Arabalar Kataloğu)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.cars (
    id SERIAL PRIMARY KEY,
    marka TEXT NOT NULL,
    model TEXT NOT NULL,
    donanim TEXT,
    motor TEXT,
    yakit TEXT CHECK (yakit IN ('Benzin', 'Dizel', 'Hibrit', 'Elektrik', 'LPG', 'DizeL')),
    vites TEXT CHECK (vites IN ('Düz', 'Otomatik', 'Yarı Otomatik', 'CVT')),
    fiyat TEXT,
    websitesi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MOTORCYCLES TABLOSU (Motorsikletler Kataloğu)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.motorcycles (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER,
    brand_name TEXT NOT NULL,
    model_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MOTORCYCLE_BRANDS TABLOSU
-- =====================================================
CREATE TABLE IF NOT EXISTS public.motorcycle_brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER_VEHICLES TABLOSU (Kullanıcı Araçları)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle')),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    plate_number TEXT,
    nickname TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
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

-- Motorcycle_brands için RLS (Herkes okuyabilir)
ALTER TABLE public.motorcycle_brands ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read motorcycle_brands" ON public.motorcycle_brands;
CREATE POLICY "Anyone can read motorcycle_brands" ON public.motorcycle_brands
    FOR SELECT USING (true);

-- User_vehicles için RLS
ALTER TABLE public.user_vehicles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own vehicles" ON public.user_vehicles;
CREATE POLICY "Users can view own vehicles" ON public.user_vehicles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own vehicles" ON public.user_vehicles;
CREATE POLICY "Users can insert own vehicles" ON public.user_vehicles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own vehicles" ON public.user_vehicles;
CREATE POLICY "Users can update own vehicles" ON public.user_vehicles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own vehicles" ON public.user_vehicles;
CREATE POLICY "Users can delete own vehicles" ON public.user_vehicles
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- AUTO-CREATE PROFILE TRİGGER
-- =====================================================
-- Yeni kullanıcı kaydolduğunda otomatik profil oluştur

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, provider, is_guest)
    VALUES (
        NEW.id,
        NEW.email,
        CASE 
            WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'
            WHEN NEW.email IS NULL THEN 'guest'
            ELSE 'email'
        END,
        CASE WHEN NEW.email IS NULL THEN true ELSE false END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluştur (eğer yoksa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- UPDATED_AT TRİGGER
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

DROP TRIGGER IF EXISTS update_user_vehicles_updated_at ON public.user_vehicles;
CREATE TRIGGER update_user_vehicles_updated_at
    BEFORE UPDATE ON public.user_vehicles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- İNDEXLER
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cars_marka ON public.cars(marka);
CREATE INDEX IF NOT EXISTS idx_cars_model ON public.cars(model);
CREATE INDEX IF NOT EXISTS idx_motorcycles_brand_name ON public.motorcycles(brand_name);
CREATE INDEX IF NOT EXISTS idx_user_vehicles_user_id ON public.user_vehicles(user_id);

-- =====================================================
-- TAMAMLANDI MESAJI
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Sinyaldeyiz veritabanı şeması başarıyla oluşturuldu!';
    RAISE NOTICE '📌 Şimdi veri import scriptini çalıştırın.';
END $$;
