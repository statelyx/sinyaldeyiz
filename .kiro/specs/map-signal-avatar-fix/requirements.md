# Gereksinimler Dokümanı

## Giriş

Bu özellik, sinyaldeyiz uygulamasındaki harita-sinyal-avatar entegrasyonundaki mevcut hataları düzeltmeyi amaçlar. Kullanıcılar profil sayfasından araç marka PNG ikonlarını avatar olarak seçebilmeli, haritada sinyal verdiklerinde bu avatar ikonu konumlarında efektli şekilde yanıp sönmeli ve durum mesajı görüntülenmelidir. Ayrıca harita kontrol butonlarının düzeni düzeltilmelidir.

## Sözlük

- **Sistem**: Sinyaldeyiz web uygulaması (Next.js tabanlı)
- **Harita Bileşeni (MapView)**: MapLibre GL JS kullanarak harita görüntüleyen React bileşeni
- **Sinyal**: Kullanıcının konumunu belirli bir süre boyunca diğer sürücülere göstermesi işlemi
- **Avatar**: Kullanıcının profil resmi olarak seçtiği araç marka PNG ikonu
- **Araç İkonu**: `/vehicles/brands/` dizininde bulunan araç marka logosu PNG dosyaları
- **Marker**: Harita üzerinde kullanıcı konumunu gösteren görsel işaretçi
- **Durum Mesajı**: Kullanıcının sinyal verirken eklediği kısa metin (maks. 100 karakter)
- **Profil Sayfası**: Kullanıcının kişisel bilgilerini ve avatarını düzenlediği sayfa
- **Dashboard**: Ana sayfa, harita ve sinyal butonunu içeren sayfa
- **MapLibre Kontrolleri**: Harita üzerindeki zoom, pusula, tam ekran ve konum butonları

## Gereksinimler

### Gereksinim 1

**Kullanıcı Hikayesi:** Bir sürücü olarak, profil sayfasından araç marka ikonlarını avatar olarak seçmek istiyorum, böylece haritada ve profilimde araç markam görünsün.

#### Kabul Kriterleri

1. WHEN kullanıcı profil sayfasında bir araç marka ikonu seçtiğinde, THE Sistem SHALL seçilen PNG ikonunu profil avatarı olarak `<img>` etiketi ile görüntüleyecektir
2. WHEN avatar olarak bir araç marka ikonu atandığında, THE Sistem SHALL ikonu yuvarlak çerçeve içinde ortalanmış ve `object-contain` stiliyle gösterecektir
3. IF seçilen araç marka ikonu dosyası bulunamazsa, THEN THE Sistem SHALL varsayılan bir araç emojisi (🚗) gösterecektir
4. WHEN avatar seçimi yapıldığında, THE Sistem SHALL seçimi Supabase veritabanındaki `profiles.avatar_url` alanına kaydedecektir

### Gereksinim 2

**Kullanıcı Hikayesi:** Bir sürücü olarak, sinyal verdiğimde haritada konumumda araç avatar ikonum yanıp sönerek görünmesini istiyorum, böylece diğer sürücüler beni kolayca fark etsin.

#### Kabul Kriterleri

1. WHEN kullanıcı sinyal verdiğinde, THE Sistem SHALL kullanıcının mevcut konumunu Supabase `location_status` tablosuna kaydedecektir
2. WHEN sinyal aktifken, THE Sistem SHALL kullanıcının harita marker'ını araç marka ikonu ile oluşturacaktır
3. WHEN sinyal aktifken, THE Sistem SHALL kullanıcı marker'ına CSS `animate-ping` veya `animate-pulse` efekti uygulayacaktır
4. WHEN kullanıcı sinyal verirken durum mesajı eklediğinde, THE Sistem SHALL mesajı marker'ın üzerinde bir baloncuk içinde gösterecektir
5. WHEN sinyal süresi dolduğunda, THE Sistem SHALL kullanıcı marker'ını haritadan kaldıracaktır

### Gereksinim 3

**Kullanıcı Hikayesi:** Bir sürücü olarak, harita üzerindeki kontrol butonlarının düzenli ve erişilebilir olmasını istiyorum, böylece haritayı rahatça kullanabileyim.

#### Kabul Kriterleri

1. THE Sistem SHALL MapLibre varsayılan kontrollerini (zoom, pusula, tam ekran, konum) sağ üst köşede dikey olarak hizalayacaktır
2. THE Sistem SHALL özel kontrol butonlarını (tema değiştirme, 2D/3D geçişi) MapLibre kontrollerinin altında ayrı bir panel olarak konumlandıracaktır
3. THE Sistem SHALL harita kontrolleri ile özel kontrol butonları arasında en az 8px boşluk bırakacaktır
4. THE Sistem SHALL trafik göstergesini sol üst köşede, diğer kontrollerle çakışmayacak şekilde konumlandıracaktır

### Gereksinim 4

**Kullanıcı Hikayesi:** Bir sürücü olarak, sinyal verme işleminin harita ile tam entegre çalışmasını istiyorum, böylece sinyal verdiğimde anında haritada görüneyim.

#### Kabul Kriterleri

1. WHEN sinyal butonu tıklandığında, THE Sistem SHALL tarayıcıdan konum izni isteyecek ve konumu alacaktır
2. WHEN konum başarıyla alındığında, THE Sistem SHALL `location_status` tablosuna `is_visible: true`, koordinatlar ve süre bilgisini yazacaktır
3. WHEN sinyal aktifken, THE Sistem SHALL `navigator.geolocation.watchPosition` ile konum güncellemelerini takip edecektir
4. WHEN `location_status` tablosunda değişiklik olduğunda, THE Sistem SHALL Supabase realtime subscription aracılığıyla haritadaki marker'ları güncelleyecektir
5. WHEN sinyal durdurulduğunda, THE Sistem SHALL `location_status` tablosunda `is_visible: false` olarak güncelleyecek ve marker'ı kaldıracaktır
