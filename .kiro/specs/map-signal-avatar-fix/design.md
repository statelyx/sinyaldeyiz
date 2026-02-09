# Tasarım Dokümanı

## Genel Bakış

Bu tasarım, sinyaldeyiz uygulamasındaki harita-sinyal-avatar entegrasyonundaki 3 ana hatayı düzeltmeye yöneliktir:

1. **Avatar Görüntüleme Hatası**: Profil sayfasında araç marka PNG ikonları avatar olarak seçildiğinde düzgün render edilmiyor
2. **Harita Buton Düzeni Hatası**: MapLibre kontrolleri ve özel kontrol butonları üst üste biniyor
3. **Sinyal-Harita Bağlantı Hatası**: Sinyal verildiğinde kullanıcı haritada görünmüyor

## Mimari

Mevcut mimari korunacak. Düzeltmeler mevcut bileşenler üzerinde yapılacaktır:

```
Dashboard/MapPage
├── MapView (harita bileşeni - MapLibre GL JS)
│   ├── MapLibre Kontrolleri (zoom, pusula, fullscreen, geolocate)
│   ├── Özel Kontroller (tema, 2D/3D)
│   ├── Kullanıcı Marker'ı (sinyal aktifken)
│   └── Diğer Kullanıcı Marker'ları
├── SignalButton (sinyal verme butonu)
│   └── location-service.ts (Supabase ile iletişim)
└── Profil Sayfası
    └── Avatar Seçici (araç marka ikonları)
```

## Bileşenler ve Arayüzler

### 1. Profil Sayfası Avatar Düzeltmesi (`src/app/(app)/profile/page.tsx`)

**Sorunun Kökü**: Avatar olarak seçilen PNG path'i (`/vehicles/brands/bmw.png`) profil sayfasında `<img>` etiketi ile render ediliyor ancak:
- Avatar gösterim alanında `object-cover` kullanılıyor, PNG ikonlar için `object-contain` gerekli
- PNG ikonlar şeffaf arka plana sahip, siyah arka plan üzerinde kaybolabiliyor

**Çözüm**:
- Avatar gösteriminde `/vehicles/` ile başlayan path'ler için `object-contain` ve uygun padding kullanılacak
- Arka plan rengi koyu gradient olarak ayarlanacak, ikon görünür olacak

### 2. Harita Buton Düzeni Düzeltmesi (`src/components/dashboard/map-view.tsx`)

**Sorunun Kökü**: MapLibre'nin varsayılan kontrolleri `top-right` pozisyonuna ekleniyor. Özel kontrol paneli de `absolute top-4 right-4` ile aynı köşeye konumlandırılıyor. Bu iki grup üst üste biniyor.

**Çözüm**:
- MapLibre varsayılan kontrollerini `top-right` pozisyonunda bırak
- Özel kontrol panelini (tema, 2D/3D) `top-right` yerine MapLibre kontrollerinin altına taşı — `top` değerini artırarak veya `bottom-right` pozisyonuna taşıyarak çakışmayı önle
- CSS ile MapLibre kontrol grubu için üst margin ekleyerek özel panel ile arasında boşluk bırak

### 3. Sinyal-Harita Entegrasyon Düzeltmesi

**Sorunun Kökü**: Birden fazla sorun var:

a) `map-view.tsx`'deki `createMarkerElement` fonksiyonunda mevcut kullanıcı marker'ı (`isCurrentUser: true`) sadece genel bir konum ikonu gösteriyor, araç avatar ikonu kullanmıyor.

b) `map-view.tsx`'deki kullanıcı marker güncelleme effect'i `isSignalActive` ve `userLocation` değiştiğinde tetikleniyor ama `createMarkerElement` dependency'si eksik olabilir veya marker doğru oluşturulmuyor.

c) Dashboard'da `handleSignalChange` çağrıldığında `fetchVisibleUsers` tetikleniyor ama Supabase'e yazma işlemi henüz tamamlanmamış olabilir — race condition.

**Çözüm**:
- Mevcut kullanıcı marker'ında araç marka ikonunu kullan (profil'den `avatar_url` veya `vehicle_brand` bilgisi)
- Sinyal verildiğinde kısa bir gecikme (500ms) sonra `fetchVisibleUsers` çağır
- Kullanıcı marker'ına yanıp sönme animasyonu ekle
- Realtime subscription'ın düzgün çalıştığından emin ol

### 4. MapView Props Genişletmesi

MapView bileşenine kullanıcının avatar/araç bilgisini taşımak için props eklenecek:

```typescript
interface MapViewProps {
    userLocation: { lat: number; lon: number } | null
    visibleUsers: VisibleUser[]
    isSignalActive: boolean
    userVehicleBrand?: string  // Yeni: kullanıcının araç markası
    userAvatarUrl?: string     // Yeni: kullanıcının avatar URL'i
    userNickname?: string      // Yeni: kullanıcının takma adı
    userStatusMessage?: string // Yeni: kullanıcının durum mesajı
}
```

## Veri Modelleri

Mevcut veri modelleri korunacak. Değişiklik yok:

- `profiles` tablosu: `avatar_url` alanı zaten mevcut (araç marka PNG path'i saklanıyor)
- `location_status` tablosu: `is_visible`, `lat`, `lon`, `expires_at`, `status_message` alanları mevcut
- `VisibleUser` interface'i: `vehicle_brand`, `status_message` alanları mevcut


## Doğruluk Özellikleri (Correctness Properties)

*Bir özellik (property), bir sistemin tüm geçerli yürütmelerinde doğru olması gereken bir davranış veya karakteristiktir — esasen, sistemin ne yapması gerektiğine dair biçimsel bir ifadedir. Özellikler, insan tarafından okunabilir spesifikasyonlar ile makine tarafından doğrulanabilir doğruluk garantileri arasında köprü görevi görür.*

Prework analizine dayanarak, bu projede çoğu gereksinim UI render ve görsel düzen ile ilgili olduğundan, sınırlı sayıda property-based test uygulanabilir. Gereksinim 3'ün tamamı görsel düzen gereksinimleridir ve otomatik test için uygun değildir.

### Property 1: Araç marka slug dönüşümü tutarlılığı

*Herhangi bir* araç marka adı için, `getBrandSlug` fonksiyonu her zaman geçerli bir slug döndürecektir (boş string olmayacak) ve aynı girdi için her zaman aynı çıktıyı üretecektir.

**Validates: Requirements 1.1, 2.2**

### Property 2: Sinyal başlatma veri bütünlüğü

*Herhangi bir* geçerli koordinat çifti (lat: -90 ile 90 arası, lon: -180 ile 180 arası) ve geçerli süre (10, 30 veya 60 dakika) için, `startSignal` fonksiyonu başarılı sonuç döndürdüğünde, oluşturulan `expires_at` değeri şu anki zamandan tam olarak seçilen süre kadar ileride olacaktır.

**Validates: Requirements 4.2**

### Property 3: Geçersiz süre reddi

*Herhangi bir* süre değeri için, eğer değer 10, 30 veya 60 değilse, `startSignal` fonksiyonu `{ success: false }` döndürecektir.

**Validates: Requirements 4.2**

## Hata Yönetimi

1. **Avatar yükleme hatası**: PNG dosyası bulunamazsa `onError` handler'ı ile fallback emoji (🚗) gösterilecek
2. **Konum izni reddi**: Kullanıcıya açıklayıcı hata mesajı gösterilecek
3. **Supabase bağlantı hatası**: Sinyal verme işlemi başarısız olursa kullanıcıya bilgi verilecek
4. **Realtime subscription hatası**: Fallback olarak polling (30 saniye aralıklarla) kullanılacak

## Test Stratejisi

### Birim Testleri

- `getBrandSlug` fonksiyonunun farklı marka adları ile doğru slug ürettiğini test et
- `startSignal` fonksiyonunun geçerli/geçersiz parametrelerle doğru davrandığını test et
- `stopSignal` fonksiyonunun doğru veri güncellediğini test et
- `createMarkerElement` fonksiyonunun doğru HTML ürettiğini test et

### Property-Based Testler

Property-based testler için `fast-check` kütüphanesi kullanılacaktır (mevcut projede TypeScript/Jest altyapısı var).

- Her property-based test en az 100 iterasyon çalıştırılacaktır
- Her property-based test, tasarım dokümanındaki ilgili doğruluk özelliğine referans verecektir
- Format: `**Feature: map-signal-avatar-fix, Property {number}: {property_text}**`

**Property 1 Testi**: Rastgele marka adları üretilerek `getBrandSlug` fonksiyonunun her zaman boş olmayan string döndürdüğü ve idempotent olduğu doğrulanacak.

**Property 2 Testi**: Rastgele geçerli koordinatlar ve süreler üretilerek `startSignal` fonksiyonunun (mock modda) doğru `expires_at` hesapladığı doğrulanacak.

**Property 3 Testi**: Rastgele geçersiz süre değerleri üretilerek `startSignal` fonksiyonunun reddettiği doğrulanacak.
