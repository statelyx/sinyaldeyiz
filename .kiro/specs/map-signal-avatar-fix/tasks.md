# Uygulama Planı

- [x] 1. Profil sayfasında avatar görüntüleme hatasını düzelt





  - [x] 1.1 Profil sayfasındaki avatar gösterim kodunu düzelt (`src/app/(app)/profile/page.tsx`)


    - Avatar gösterim alanında `/vehicles/` path'leri için `object-contain` ve padding uygula
    - Avatar seçici modalda PNG ikonların düzgün render edildiğinden emin ol
    - Fallback mekanizmasını (onError handler) düzelt
    - _Gereksinimler: 1.1, 1.2, 1.3_
  - [x] 1.2 Avatar seçiminin veritabanına doğru kaydedildiğini doğrula


    - `handleAvatarChange` fonksiyonunun `avatar_url` alanını doğru güncellediğinden emin ol
    - _Gereksinimler: 1.4_

- [x] 2. Harita buton düzenini düzelt





  - ⚠️ **DİL KURALI: Bu görev ve sonraki tüm görevlerde her zaman Türkçe cevap ver. Kod yorumları Türkçe olsun. Commit mesajları Türkçe olsun.**
  - [x] 2.1 MapView bileşenindeki kontrol butonlarını yeniden konumlandır (`src/components/dashboard/map-view.tsx`)


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - MapLibre varsayılan kontrollerini `top-right` pozisyonunda bırak
    - Özel kontrol panelini (tema, 2D/3D) MapLibre kontrollerinin altına taşı — `top` offset'ini artır
    - Kontrol grupları arasında yeterli boşluk bırak (en az 8px)
    - Trafik göstergesinin sol üstte diğer kontrollerle çakışmadığından emin ol
    - _Gereksinimler: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Sinyal-harita entegrasyonunu düzelt




  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver.**
  - [x] 3.1 MapView bileşenine kullanıcı bilgi props'larını ekle


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - `MapViewProps` interface'ine `userVehicleBrand`, `userAvatarUrl`, `userNickname`, `userStatusMessage` ekle
    - Dashboard ve MapPage'den bu props'ları MapView'a geçir
    - _Gereksinimler: 2.2, 2.4_
  - [x] 3.2 Mevcut kullanıcı marker'ını araç ikonu ile güncelle


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - `createMarkerElement` fonksiyonunda `isCurrentUser: true` durumunda araç marka ikonunu kullan
    - Marker'a `animate-ping` efekti ekle
    - Durum mesajı varsa marker üzerinde baloncuk göster
    - _Gereksinimler: 2.2, 2.3, 2.4_
  - [x] 3.3 Sinyal verildikten sonra harita güncelleme zamanlamasını düzelt


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - `handleSignalChange` içinde `fetchVisibleUsers` çağrısından önce 500ms gecikme ekle
    - Sinyal durdurulduğunda marker'ın temizlendiğinden emin ol
    - _Gereksinimler: 2.1, 2.5, 4.2, 4.5_
  - [x] 3.4 Realtime subscription'ın düzgün çalıştığını doğrula


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Supabase channel subscription'ın `location_status` tablosundaki değişiklikleri dinlediğinden emin ol
    - Subscription hata durumunda fallback polling mekanizması ekle
    - _Gereksinimler: 4.4_

- [x] 4. Checkpoint - Tüm testlerin geçtiğinden emin ol





  - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
  - Tüm testlerin geçtiğinden emin ol, sorular olursa kullanıcıya sor.

- [x] 5. Property-based testleri yaz





  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver.**

  - [x] 5.1 fast-check kütüphanesini kur ve test altyapısını hazırla

    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - `fast-check` paketini dev dependency olarak ekle
    - Test dosyası oluştur: `src/lib/__tests__/map-signal-avatar.property.test.ts`
    - _Gereksinimler: 1.1, 2.2, 4.2_
  - [x] 5.2 Property 1 testini yaz: Araç marka slug dönüşümü tutarlılığı


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - **Property 1: Araç marka slug dönüşümü tutarlılığı**
    - **Validates: Requirements 1.1, 2.2**
    - Rastgele marka adları üretilerek `getBrandSlug` fonksiyonunun her zaman boş olmayan string döndürdüğünü ve idempotent olduğunu doğrula


  - [x] 5.3 Property 2 testini yaz: Sinyal başlatma veri bütünlüğü

    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - **Property 2: Sinyal başlatma veri bütünlüğü**
    - **Validates: Requirements 4.2**
    - Rastgele geçerli koordinatlar ve süreler üretilerek expires_at hesaplamasının doğruluğunu doğrula

  - [x] 5.4 Property 3 testini yaz: Geçersiz süre reddi

    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - **Property 3: Geçersiz süre reddi**
    - **Validates: Requirements 4.2**
    - Rastgele geçersiz süre değerleri üretilerek startSignal fonksiyonunun reddettiğini doğrula

- [x] 6. Birim testleri yaz





  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver.**

  - [x] 6.1 getBrandSlug fonksiyonu için birim testleri yaz

    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Bilinen marka adları için doğru slug üretildiğini test et
    - Bilinmeyen marka adları için fallback davranışını test et
    - _Gereksinimler: 1.1, 2.2_
  - [x] 6.2 createMarkerElement fonksiyonu için birim testleri yaz


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Mevcut kullanıcı marker'ının araç ikonu içerdiğini test et
    - Diğer kullanıcı marker'larının doğru bilgileri gösterdiğini test et
    - _Gereksinimler: 2.2, 2.4_

- [x] 7. Son Checkpoint - Tüm testlerin geçtiğinden emin ol





  - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
  - Tüm testlerin geçtiğinden emin ol, sorular olursa kullanıcıya sor.
