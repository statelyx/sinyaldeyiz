# Gereksinimler Dokümanı

## Giriş

Bu özellik, Sinyaldeyiz uygulamasının tüm kullanıcı arayüzünü yeni nesil bir tasarıma dönüştürmeyi amaçlar. Mevcut sol dikey sidebar kaldırılacak, yerine üstte ince yatay glassmorphism menü gelecektir. Sayfa arka planı bütünleşik olacak (siyahtan laciverte geçiş sorunu giderilecek), alt alan tamamen harita ile kaplanacaktır. Sinyal verme işlemindeki zaman aşımı hatası düzeltilecektir.

## Sözlük

- **Sistem**: Sinyaldeyiz web uygulaması (Next.js tabanlı)
- **Üst Menü (TopBar)**: Sayfanın üst kısmında soldan sağa uzanan ince, glassmorphism efektli yatay navigasyon çubuğu
- **Glassmorphism**: Yarı saydam arka plan, bulanıklaştırma (backdrop-blur) ve ince kenarlık kullanarak cam efekti veren CSS tasarım tekniği
- **Dashboard**: Ana sayfa; üst menü, hava durumu widget'ları ve harita bileşenlerini içeren sayfa
- **Harita Bileşeni (MapView)**: MapLibre GL JS kullanarak harita görüntüleyen React bileşeni
- **Sinyal**: Kullanıcının konumunu belirli bir süre boyunca diğer sürücülere göstermesi işlemi
- **Sinyal Butonu**: Kullanıcının sinyal verme ve durdurma işlemini tetikleyen buton bileşeni
- **Zaman Aşımı Hatası**: Sinyal verme sırasında konum isteğinin belirlenen sürede yanıt alamaması durumu
- **Sidebar**: Mevcut sol dikey navigasyon paneli (kaldırılacak)

## Gereksinimler

### Gereksinim 1

**Kullanıcı Hikayesi:** Bir sürücü olarak, sol sidebar yerine üstte ince yatay bir menü görmek istiyorum, böylece ekranın tamamını harita için kullanabileyim.

#### Kabul Kriterleri

1. THE Sistem SHALL mevcut sol dikey sidebar bileşenini kaldıracak ve yerine sayfanın üst kısmında soldan sağa uzanan ince yatay bir navigasyon çubuğu (TopBar) yerleştirecektir
2. THE Sistem SHALL TopBar bileşenine glassmorphism efekti uygulayacaktır (backdrop-blur-xl, yarı saydam arka plan, ince kenarlık)
3. WHEN TopBar render edildiğinde, THE Sistem SHALL logo, navigasyon linkleri, kullanıcı bilgisi ve sinyal durumu göstergesini tek satırda yatay olarak hizalayacaktır
4. THE Sistem SHALL TopBar yüksekliğini masaüstünde en fazla 56px, mobilde en fazla 48px olarak sınırlayacaktır
5. WHEN kullanıcı mobil cihazda görüntülediğinde, THE Sistem SHALL navigasyon linklerini hamburger menü veya kompakt ikon düzenine dönüştürecektir

### Gereksinim 2

**Kullanıcı Hikayesi:** Bir sürücü olarak, sayfanın arka planının bütünleşik ve tutarlı görünmesini istiyorum, böylece siyahtan laciverte geçiş gibi görsel kopukluklar olmasın.

#### Kabul Kriterleri

1. THE Sistem SHALL tüm uygulama layout arka planını tek bir tutarlı renk veya gradient olarak uygulayacaktır (siyahtan laciverte geçiş olmayacak)
2. THE Sistem SHALL TopBar ve harita arasında görsel kopukluk oluşturacak ayrı arka plan katmanlarını kaldıracaktır
3. WHEN dashboard sayfası yüklendiğinde, THE Sistem SHALL harita bileşenini TopBar altındaki tüm kalan alanı kaplayacak şekilde render edecektir
4. THE Sistem SHALL hava durumu widget'larını harita üzerinde glassmorphism efektli bir overlay olarak konumlandıracaktır

### Gereksinim 3

**Kullanıcı Hikayesi:** Bir sürücü olarak, sinyal verme butonuna bastığımda zaman aşımı hatası almak istemiyorum, böylece sinyal verme işlemi güvenilir şekilde çalışsın.

#### Kabul Kriterleri

1. WHEN sinyal butonu tıklandığında, THE Sistem SHALL konum isteği için zaman aşımı süresini en az 15 saniye olarak ayarlayacaktır
2. IF konum isteği zaman aşımına uğrarsa, THEN THE Sistem SHALL kullanıcıya anlaşılır bir hata mesajı gösterecek ve yeniden deneme seçeneği sunacaktır
3. WHEN konum isteği başarısız olduğunda, THE Sistem SHALL son bilinen konumu yedek olarak kullanma seçeneği sunacaktır
4. THE Sistem SHALL sinyal verme işlemi sırasında kullanıcıya ilerleme durumunu gösteren bir yükleme göstergesi sunacaktır

### Gereksinim 4

**Kullanıcı Hikayesi:** Bir sürücü olarak, harita altındaki tüm alanın harita ile kaplı olmasını istiyorum, böylece maksimum harita görünümüne sahip olayım.

#### Kabul Kriterleri

1. THE Sistem SHALL harita bileşenini TopBar dışındaki tüm ekran alanını kaplayacak şekilde boyutlandıracaktır
2. THE Sistem SHALL sinyal butonunu harita üzerinde sağ alt köşede floating buton olarak konumlandıracaktır
3. THE Sistem SHALL hotspot uyarısını harita üzerinde üst kısımda overlay olarak gösterecektir
4. WHEN mobil cihazda görüntülendiğinde, THE Sistem SHALL alt navigasyon çubuğunu kaldıracak ve tüm navigasyonu TopBar üzerinden sağlayacaktır

</content>
</invoke>