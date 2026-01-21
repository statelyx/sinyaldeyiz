# Supabase Database Düzeltme Rehberi

## ⚠️ SORUN: `location_status` tablosu yok!

### Adım 1: Mevcut Durumu Kontrol Et

Supabase SQL Editor'a şu sorguyu çalıştır:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Beklenen Sonuç:** Mevcut tabloların listesi

### Adım 2: Sadece Kritik Tabloları Oluştur

Aşağıdaki SQL kodunu **BÖLÜM BÖLÜM** çalıştırın:

#### Bölüm 1: location_status Tablosu (En Kritik!)
```sql
CREATE TABLE public.location_status (
  user_id UUID PRIMARY KEY,
  is_visible BOOLEAN DEFAULT FALSE,
  visibility_duration INTEGER CHECK (visibility_duration IN (10, 30, 60)),
  expires_at TIMESTAMPTZ,
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  geohash TEXT,
  accuracy_meters INTEGER,
  last_location_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status_message TEXT,
  status_expires_at TIMESTAMPTZ
);
```

#### Bölüm 2: vehicle_brands Tablosu
```sql
CREATE TABLE IF NOT EXISTS public.vehicle_brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  logo_url TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Bölüm 3: vehicles Tablosu
```sql
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  catalog_id TEXT,
  year INTEGER CHECK (year BETWEEN 1900 AND EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  plate_number TEXT,
  nickname TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plate_number)
);
```

#### Bölüm 4: Index'ler
```sql
CREATE INDEX IF NOT EXISTS idx_location_status_visible ON public.location_status(is_visible, expires_at) WHERE is_visible = TRUE;
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_name ON public.vehicle_brands(name);
```

#### Bölüm 5: Trigger Fonksiyonu
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### Bölüm 6: Trigger'lar
```sql
DROP TRIGGER IF EXISTS update_location_status_updated_at ON public.location_status;
CREATE TRIGGER update_location_status_updated_at BEFORE UPDATE ON public.location_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Bölüm 7: Realtime Aktif Et
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.location_status;
```

### Adım 3: Doğrulama

Şu sorguyu çalıştırarak tabloların oluşturulduğunu doğrulayın:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('location_status', 'vehicles', 'vehicle_brands')
ORDER BY table_name;
```

**Beklenen Sonuç:**
- location_status ✓
- vehicles ✓
- vehicle_brands ✓

---

## 🎯 Tamamlandıktan Sonra

Bu tablolar oluşturulduktan sonra:
1. ✅ Sinyal ver butonu çalışacak
2. ✅ Admin panel veri çekecek
3. ✅ Garaj sayfası yüklenecek
