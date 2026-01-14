# 🚗 VEHICLE VERİLERİNİ DATABASE'E EKLEME KILAVUZU

## SORUN
RLS (Row Level Security) politikası yüzünden veriler eklenemiyor.

## ÇÖZÜM 1: EN KOLAY YÖNTEM (5 dakika)

### Adım 1: Supabase SQL Editor'u Aç
1. https://supabase.com/dashboard/ adresine git
2. Projeni seç (**vymimouefzxxeklbialt**)
3. Sol menüden **SQL Editor**'a tıkla

### Adım 2: Yeni Query Oluştur
**New Query** butonuna tıkla

### Adım 3: Aşağıdaki SQL Kodunu Yapıştır ve Çalıştır

```sql
-- Vehicle Brands için RLS politikası
ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Allow insert for public on vehicle_brands" ON vehicle_brands;
DROP POLICY IF EXISTS "Allow select for public on vehicle_brands" ON vehicle_brands;

-- Yeni politikalar oluştur
CREATE POLICY "Allow insert for public on vehicle_brands"
ON vehicle_brands FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow select for public on vehicle_brands"
ON vehicle_brands FOR SELECT
TO anon
USING (true);

-- Vehicle Models için RLS politikası
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Allow insert for public on vehicle_models" ON vehicle_models;
DROP POLICY IF EXISTS "Allow select for public on vehicle_models" ON vehicle_models;

-- Yeni politikalar oluştur
CREATE POLICY "Allow insert for public on vehicle_models"
ON vehicle_models FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow select for public on vehicle_models"
ON vehicle_models FOR SELECT
TO anon
USING (true);
```

### Adım 4: Run Butonuna Bas (▶️)

### Adım 5: Script'i Çalıştır
Terminal'e dön ve şu komutu çalıştır:

```bash
npx tsx scripts/seed-all-vehicles.ts
```

---

## ÇÖZÜM 2: SERVICE ROLE KEY KULLANIMI

### Service Role Key'i Bul:
1. Supabase Dashboard > **Settings** > **API**
2. **Project API keys** bölümünde **service_role** key'i kopyala
3. `.env.local` dosyasına ekle:

```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Script'i Tekrar Çalıştır:
```bash
npx tsx scripts/seed-all-vehicles.ts
```

---

## KONTROL

Script başarıyla çalıştıktan sonra şu çıktıyı görmelisin:

```
✅ Inserted 32 car brands
✅ Inserted 345 car models
✅ Inserted 120 motorcycle brands
✅ Inserted 2224 motorcycle models

📊 TOPLAM SAYAÇLAR:
   vehicle_brands: 150+ records
   vehicle_models: 2500+ records
```
