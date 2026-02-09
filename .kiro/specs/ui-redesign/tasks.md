# Uygulama Planı

- [x] 1. TopBar bileşenini oluştur





  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver. Kod yorumları Türkçe olsun.**
  - [x] 1.1 `src/components/layout/top-bar.tsx` dosyasını oluştur


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Glassmorphism efektli yatay navigasyon çubuğu (bg-black/30 backdrop-blur-xl border-b border-white/10)
    - Solda logo (🏎️ Sinyaldeyiz), ortada nav linkleri, sağda kullanıcı bilgisi ve sinyal durumu
    - Masaüstü yükseklik max 56px, mobil max 48px
    - Mobilde hamburger menü veya kompakt ikon düzeni
    - _Gereksinimler: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. AppLayout'u yeniden yaz





  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver. Kod yorumları Türkçe olsun.**
  - [x] 2.1 `src/app/(app)/layout.tsx` dosyasını yeniden yaz


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Sol sidebar'ı tamamen kaldır (desktop ve mobil)
    - Mobil bottom nav'ı kaldır
    - Mobil sidebar overlay'i kaldır
    - Arka plan gradient'lerini sadeleştir — tek tutarlı arka plan (siyah-lacivert geçiş yok)
    - TopBar bileşenini entegre et
    - `main` alanını tam genişlik yap (ml-64 kaldır)
    - _Gereksinimler: 1.1, 2.1, 2.2, 4.4_

- [x] 3. Dashboard sayfasını harita-merkezli yap





  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver. Kod yorumları Türkçe olsun.**
  - [x] 3.1 `src/app/(app)/dashboard/page.tsx` dosyasını güncelle


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Racing HUD Header'ı kaldır (greeting bölümü)
    - Mobil stats bar'ı kaldır
    - Haritayı TopBar altındaki tüm alanı kaplayacak şekilde boyutlandır (h-[calc(100vh-56px)])
    - Hava durumu widget'larını harita üzerinde glassmorphism overlay olarak konumlandır (sol üst)
    - Sinyal butonunu harita üzerinde sağ alt köşede floating olarak konumlandır
    - Hotspot uyarısını harita üzerinde üst kısımda overlay olarak göster
    - _Gereksinimler: 2.3, 2.4, 4.1, 4.2, 4.3_

- [x] 4. Sinyal butonu timeout hatasını düzelt





  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver. Kod yorumları Türkçe olsun.**
  - [x] 4.1 `src/lib/services/location-service.ts` dosyasında `requestGeolocationWithFallback` fonksiyonu oluştur


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Mevcut `requestGeolocation` fonksiyonunu sarmalayan yeni fonksiyon
    - Son bilinen konumu parametre olarak al
    - Timeout veya hata durumunda son bilinen konumu yedek olarak döndür
    - _Gereksinimler: 3.1, 3.3_
  - [x] 4.2 `src/components/dashboard/signal-button.tsx` dosyasını güncelle


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - `requestGeolocationWithFallback` fonksiyonunu kullan
    - Timeout hatası durumunda yeniden deneme butonu ekle
    - Son bilinen konum kullanıldığında kullanıcıyı bilgilendir
    - Yükleme göstergesini iyileştir (ilerleme durumu)
    - _Gereksinimler: 3.2, 3.3, 3.4_

- [x] 5. Checkpoint - Tüm testlerin geçtiğinden emin ol





  - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
  - Tüm testlerin geçtiğinden emin ol, sorular olursa kullanıcıya sor.

- [x] 6. Property-based test yaz





  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver. Kod yorumları Türkçe olsun.**

  - [x] 6.1 Property 1 testini yaz: Konum hatası fallback tutarlılığı

    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - **Property 1: Konum hatası fallback tutarlılığı**
    - **Validates: Requirements 3.3**
    - fast-check ile rastgele hata türleri ve son bilinen konum kombinasyonları üretilerek `requestGeolocationWithFallback` fonksiyonunun her zaman geçerli bir konum döndürdüğünü doğrula

- [x] 7. Birim testleri yaz





  - ⚠️ **DİL KURALI: Bu görev ve tüm alt görevlerde her zaman Türkçe cevap ver. Kod yorumları Türkçe olsun.**
  - [x] 7.1 TopBar bileşeni için birim testleri yaz


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Logo, nav linkleri, kullanıcı bilgisi render edildiğini doğrula
    - _Gereksinimler: 1.3_
  - [x] 7.2 requestGeolocationWithFallback fonksiyonu için birim testleri yaz


    - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
    - Timeout durumunda son bilinen konum döndürüldüğünü test et
    - Son bilinen konum yokken hata fırlatıldığını test et
    - _Gereksinimler: 3.1, 3.3_

- [x] 8. Son Checkpoint - Tüm testlerin geçtiğinden emin ol





  - ⚠️ **DİL KURALI: Her zaman Türkçe cevap ver.**
  - Tüm testlerin geçtiğinden emin ol, sorular olursa kullanıcıya sor.
