-- ===========================================================
-- SINYALDEYIZ - VEHICLE CATALOG FINAL MIGRATION
-- ===========================================================
-- Bu migration araba ve motorsiklet verilerini yönetir
-- arabalar.json, moto_brands.json, moto_models.json parse edilecek

-- ===========================================================
-- 1. CARS TABLES
-- ===========================================================

-- Araba markaları
CREATE TABLE IF NOT EXISTS public.cars_brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Araba modelleri
CREATE TABLE IF NOT EXISTS public.cars_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES public.cars_brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, name)
);

-- Araba trim seviyeleri (donanımlar)
CREATE TABLE IF NOT EXISTS public.cars_trims (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES public.cars_models(id) ON DELETE CASCADE,
    donanim TEXT NOT NULL,
    motor TEXT,
    yakit TEXT,
    vites TEXT,
    fiyat TEXT,
    website TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_cars_models_brand_id ON public.cars_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_cars_trims_model_id ON public.cars_trims(model_id);

-- ===========================================================
-- 2. MOTORCYCLES TABLES
-- ===========================================================

-- Motorsiklet markaları
CREATE TABLE IF NOT EXISTS public.moto_brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Motorsiklet modelleri
CREATE TABLE IF NOT EXISTS public.moto_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES public.moto_brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(brand_id, name)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_moto_models_brand_id ON public.moto_models(brand_id);

-- ===========================================================
-- 3. UPDATE VEHICLES TABLE
-- ===========================================================
-- Kullanıcı araçları için catalog_id referansı

DO $$
BEGIN
    -- Add catalog columns if not exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vehicles' AND column_name = 'car_trim_id') THEN
        ALTER TABLE public.vehicles ADD COLUMN car_trim_id INTEGER REFERENCES public.cars_trims(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'vehicles' AND column_name = 'moto_model_id') THEN
        ALTER TABLE public.vehicles ADD COLUMN moto_model_id INTEGER REFERENCES public.moto_models(id);
    END IF;
END $$;

-- ===========================================================
-- 4. FORUM TABLES (for demo content)
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.forum_threads (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT,
    author_nickname TEXT,
    author_avatar TEXT,
    reply_count INTEGER DEFAULT 0,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_replies (
    id SERIAL PRIMARY KEY,
    thread_id INTEGER REFERENCES public.forum_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    author_nickname TEXT,
    author_avatar TEXT,
    is_demo BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON public.forum_replies(thread_id);

-- ===========================================================
-- 5. RLS POLICIES
-- ===========================================================

-- Enable RLS
ALTER TABLE public.cars_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars_trims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moto_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moto_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- Public read access for catalogs
DROP POLICY IF EXISTS "Public read cars_brands" ON public.cars_brands;
CREATE POLICY "Public read cars_brands" ON public.cars_brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read cars_models" ON public.cars_models;
CREATE POLICY "Public read cars_models" ON public.cars_models FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read cars_trims" ON public.cars_trims;
CREATE POLICY "Public read cars_trims" ON public.cars_trims FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read moto_brands" ON public.moto_brands;
CREATE POLICY "Public read moto_brands" ON public.moto_brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read moto_models" ON public.moto_models;
CREATE POLICY "Public read moto_models" ON public.moto_models FOR SELECT USING (true);

-- Forum policies
DROP POLICY IF EXISTS "Public read forum_threads" ON public.forum_threads;
CREATE POLICY "Public read forum_threads" ON public.forum_threads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert forum_threads" ON public.forum_threads;
CREATE POLICY "Users insert forum_threads" ON public.forum_threads FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Public read forum_replies" ON public.forum_replies;
CREATE POLICY "Public read forum_replies" ON public.forum_replies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users insert forum_replies" ON public.forum_replies;
CREATE POLICY "Users insert forum_replies" ON public.forum_replies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===========================================================
-- 6. AVATARS LIST (for picker)
-- ===========================================================

CREATE TABLE IF NOT EXISTS public.avatars (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    category TEXT DEFAULT 'default',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read avatars" ON public.avatars;
CREATE POLICY "Public read avatars" ON public.avatars FOR SELECT USING (true);

-- Insert 50 DiceBear avatars
INSERT INTO public.avatars (url, category) VALUES
('https://api.dicebear.com/7.x/avataaars/svg?seed=driver1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=driver2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=driver3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=driver4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=driver5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=racer1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=racer2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=racer3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=racer4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=racer5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=speed1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=speed2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=speed3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=speed4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=speed5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=turbo1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=turbo2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=turbo3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=turbo4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=turbo5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=drift1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=drift2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=drift3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=drift4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=drift5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=motor1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=motor2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=motor3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=motor4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=motor5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=bike1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=bike2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=bike3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=bike4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=bike5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=rider1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=rider2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=rider3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=rider4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=rider5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=crew1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=crew2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=crew3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=crew4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=crew5', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=night1', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=night2', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=night3', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=night4', 'avataaars'),
('https://api.dicebear.com/7.x/avataaars/svg?seed=night5', 'avataaars')
ON CONFLICT DO NOTHING;

-- ===========================================================
-- 7. DEMO FORUM THREADS (50 threads)
-- ===========================================================

INSERT INTO public.forum_threads (title, content, author_nickname, author_avatar, reply_count, is_demo) VALUES
('hadi nerdesiniz haydi kop kop', 'bağdat caddesi bu gece dolcek', 'AhmetR34', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmetR34', 5, true),
('tak tak tak kapıda kim var hesabııı', 'geceyarısı crew toplanıyo', 'ZeynepM3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynepM3', 3, true),
('en gz modifiyeli araba yarışması', 'kazanan ödül alcak', 'EmreTurbo', 'https://api.dicebear.com/7.x/avataaars/svg?seed=turboemre', 8, true),
('motor crew istanbul avrupa', 'kadıköy buluşması var mı', 'BikeKing', 'https://api.dicebear.com/7.x/avataaars/svg?seed=bikeking', 4, true),
('drift antrenman alanı bilen var mı', 'yasal drift yerleri arıyorum', 'DriftMaster', 'https://api.dicebear.com/7.x/avataaars/svg?seed=driftmaster', 6, true),
('bmw e36 sahipleri burda mı', 'e36 meeting için hedef kadıköy', 'E36Fan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=e36fan', 12, true),
('gece cruiseları için en iyi rotalar', 'istanbul gece rotası önerileri', 'NightRider', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nightrider', 7, true),
('bu uygulama harika lan', 'sonunda böyle bi uygulama yapılmış', 'CarLover', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlover', 15, true),
('modifiye masrafları paylaşalım', 'ne kadar harcadınız arabaya', 'ModKing', 'https://api.dicebear.com/7.x/avataaars/svg?seed=modking', 9, true),
('superbike sahipleri nerde', 'motor toplu sürüş düzenlicez', 'SuperBiker', 'https://api.dicebear.com/7.x/avataaars/svg?seed=superbiker', 4, true),
('yarın maslak rallisi var', 'katılmak isteyen sinyal versin', 'RallyBoss', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rallyboss', 11, true),
('araba fotoğrafı paylaşım', 'araçlarınızı görelim', 'PhotoCar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=photocar', 20, true),
('mercedes amg klubu', 'amg sahipleri bir araya gelelim', 'AMGTurk', 'https://api.dicebear.com/7.x/avataaars/svg?seed=amgturk', 8, true),
('motor bakım önerileri', 'motosiklet bakım ipuçları', 'MotoMech', 'https://api.dicebear.com/7.x/avataaars/svg?seed=motomech', 5, true),
('beşiktaş sahili toplanma', 'bu akşam sahilde buluşma', 'SahilCrew', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sahilcrew', 13, true),
('egzoz sesi test toplantısı', 'en güzel sesin sahibi kim', 'Exhaust', 'https://api.dicebear.com/7.x/avataaars/svg?seed=exhaust', 7, true),
('audi rs grubu', 'audi rs modelleri için grup', 'RSDriver', 'https://api.dicebear.com/7.x/avataaars/svg?seed=rsdriver', 6, true),
('klasik araba sahipleri', 'klasik araç tutkunları buraya', 'Vintage', 'https://api.dicebear.com/7.x/avataaars/svg?seed=vintage', 4, true),
('elektrikli araç sohbeti', 'tesla ve diğer ev sahipleri', 'ElecDrive', 'https://api.dicebear.com/7.x/avataaars/svg?seed=elecdrive', 3, true),
('off road ekibi', '4x4 tutkunları toplanıyor', 'OffRoad', 'https://api.dicebear.com/7.x/avataaars/svg?seed=offroad', 5, true),
('stance araba topluluğu', 'stance culture istanbul', 'StanceTR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=stancetr', 9, true),
('wrap ve folyo ustası arıyorum', 'araba kaplama önerileri', 'WrapKing', 'https://api.dicebear.com/7.x/avataaars/svg?seed=wrapking', 4, true),
('jdm türkiye', 'japon arabası sevenler', 'JDMTurk', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jdmturk', 16, true),
('turbo upgrade sohbeti', 'turbo yükseltme deneyimleri', 'TurboMax', 'https://api.dicebear.com/7.x/avataaars/svg?seed=turbomax', 7, true),
('formula 1 izleme partisi', 'yarış izleme buluşması', 'F1Fan', 'https://api.dicebear.com/7.x/avataaars/svg?seed=f1fan', 10, true),
('ducati sahipleri kulübü', 'ducati türkiye grubu', 'DucatiTR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ducatitr', 6, true),
('lastik önerileri', 'hangi lastik marka model', 'TireGuru', 'https://api.dicebear.com/7.x/avataaars/svg?seed=tireguru', 8, true),
('nitro kullanıyor musunuz', 'nos sistemi deneyimleri', 'NitroKing', 'https://api.dicebear.com/7.x/avataaars/svg?seed=nitroking', 5, true),
('hafta sonu pist günü', 'intercity de buluşalım', 'PistDriver', 'https://api.dicebear.com/7.x/avataaars/svg?seed=pistdriver', 14, true),
('yamaha r1 sahipleri', 'r1 modelleri için topluluk', 'R1Rider', 'https://api.dicebear.com/7.x/avataaars/svg?seed=r1rider', 4, true),
('üsküdar buluşma noktası', 'çamlıca tepesinde toplanalım', 'UskudarCrew', 'https://api.dicebear.com/7.x/avataaars/svg?seed=uskudarcrew', 7, true),
('araba detay temizliği', 'detailing uzmanları buraya', 'DetailPro', 'https://api.dicebear.com/7.x/avataaars/svg?seed=detailpro', 5, true),
('volkswagen golf kulübü', 'golf gti okulları', 'GolfGTI', 'https://api.dicebear.com/7.x/avataaars/svg?seed=golfgti', 11, true),
('ses sistemi kurulumu', 'araç ses sistemleri', 'SoundCar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=soundcar', 6, true),
('sabah sürüşü 6 da', 'erken sürüş tutkunları', 'EarlyCruise', 'https://api.dicebear.com/7.x/avataaars/svg?seed=earlycruise', 3, true),
('kawasaki ninja grubu', 'ninja sahipleri burada', 'NinjaRider', 'https://api.dicebear.com/7.x/avataaars/svg?seed=ninjarider', 5, true),
('air ride sistemleri', 'hava süspansiyon sohbeti', 'AirRide', 'https://api.dicebear.com/7.x/avataaars/svg?seed=airride', 4, true),
('muscle car türkiye', 'amerikan kasları burada', 'MuscleTR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=muscletr', 8, true),
('araç çekimi fotoğrafçısı', 'profesyonel araç fotoğrafı', 'CarPhoto', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carphoto', 5, true),
('honda civic type r', 'type r sahipleri topluluğu', 'TypeRTR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=typertr', 7, true),
('carbon fiber aksesuar', 'karbon parça önerileri', 'CarbonKing', 'https://api.dicebear.com/7.x/avataaars/svg?seed=carbonking', 4, true),
('ktm duke sahipleri', 'duke modelleri grubu', 'DukeRider', 'https://api.dicebear.com/7.x/avataaars/svg?seed=dukerider', 5, true),
('oto yıkama önerileri', 'en iyi oto yıkama nerde', 'WashCar', 'https://api.dicebear.com/7.x/avataaars/svg?seed=washcar', 3, true),
('porsche 911 kulübü', '911 sahipleri derneği', 'Porsche911', 'https://api.dicebear.com/7.x/avataaars/svg?seed=porsche911', 12, true),
('harley davidson istanbul', 'harley türkiye topluluğu', 'HarleyTR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=harleytr', 9, true),
('subaru wrx sti', 'impreza sahipleri burada', 'SubaruTR', 'https://api.dicebear.com/7.x/avataaars/svg?seed=subarutr', 10, true),
('chip tuning deneyimleri', 'yazılım yükseltme sohbeti', 'ChipTuner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=chiptuner', 6, true),
('otoyol sürüşü etkinliği', 'tem otoyolda toplanalım', 'HighwayRace', 'https://api.dicebear.com/7.x/avataaars/svg?seed=highwayrace', 8, true),
('bmw m power ailesi', 'm serisi sahipleri', 'MPower', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mpower', 15, true),
('bugün nerdeyiz', 'canlı konum paylaşımı', 'LiveCrew', 'https://api.dicebear.com/7.x/avataaars/svg?seed=livecrew', 25, true)
ON CONFLICT DO NOTHING;

-- Add some demo replies
INSERT INTO public.forum_replies (thread_id, content, author_nickname, author_avatar, is_demo) 
SELECT 
    t.id,
    CASE (random() * 5)::int
        WHEN 0 THEN 'geliyorummm'
        WHEN 1 THEN 'ben de varım'
        WHEN 2 THEN 'süpersiniz lan'
        WHEN 3 THEN 'kop kop kop'
        WHEN 4 THEN 'arabayla mı geleyim'
        ELSE 'motorla gelcem'
    END,
    'User' || (random() * 100)::int,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=user' || (random() * 100)::int,
    true
FROM public.forum_threads t
CROSS JOIN generate_series(1, 3)
WHERE t.is_demo = true
LIMIT 150;

-- Update reply counts
UPDATE public.forum_threads SET reply_count = (
    SELECT COUNT(*) FROM public.forum_replies WHERE thread_id = forum_threads.id
) WHERE is_demo = true;
