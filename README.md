# 🏎️ Sinyaldeyiz

Türkiye'nin ilk konum bazlı **araba ve motorsiklet sosyal ağı**.

<img width="2527" height="835" alt="image" src="https://github.com/user-attachments/assets/34f5239d-e5d2-46d4-a540-b810401870ae" />

## 🚀 Proje Hakkında

Sinyaldeyiz, araç tutkunlarının anlık olarak konumlarını paylaşarak diğer sürücülerle buluşmalarını sağlayan bir sosyal ağ uygulamasıdır.

### ✨ Özellikler

- 📍 **Konum Paylaşımı** - İstediğin zaman sinyal ver, yakındakilerle buluş
- 🗺️ **Canlı Harita** - Tüm aktif sürücüleri haritada gör
- 👻 **Görünmez Mod** - Varsayılan olarak kimse seni göremez
- 🚗 **Araba Desteği** - 50+ marka, 1600+ araç modeli
- 🏍️ **Motorsiklet Desteği** - 120 marka, 1000+ model
- 🔐 **Gizlilik Odaklı** - KVKK uyumlu, konum senin kontrolünde
- ⏱️ **Süreli Görünürlük** - 30/60/120 dakikalık görünürlük seçenekleri

## 🔒 Gizlilik Modeli

1. **Varsayılan Görünmez**: Kayıt olduğunda kimse seni göremez
2. **Sinyal Ver**: İstediğin zaman süreli görünürlük aç
3. **Yaklaşık Konum**: Hassas konum yerine yaklaşık alan gösterilir
4. **Hotspot**: Belirli bölgelerdeki yoğunluk gösterimi (kişi bazlı değil)
5. **Kontrol Sende**: İstediğin zaman görünmez moda dön

## 🛠️ Teknolojiler

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Glassmorphism UI
- **3D Graphics**: Three.js (Animated Background)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Harita**: MapLibre GL JS
- **Testing**: Vitest (Unit), Playwright (E2E)
- **Deployment**: Vercel

## 📦 Kurulum

### Gereksinimler

- Node.js 18+
- npm veya yarn
- Supabase hesabı

### 1. Projeyi Klonla

```bash
git clone https://github.com/kullaniciadi/sinyaldeyiz.git
cd sinyaldeyiz
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

### 3. Ortam Değişkenlerini Ayarla

`.env.example` dosyasını `.env.local` olarak kopyala ve değerleri doldur:

```bash
cp .env.example .env.local
```

Düzenle:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Veritabanını Hazırla

1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/002_comprehensive_schema.sql` dosyasını çalıştır
3. Authentication → Settings → Enable Email Confirmations → **KAPALI**
4. Authentication → Providers → Google → **AKTİF** (opsiyonel)

### 5. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Tarayıcıda aç: [http://localhost:3000](http://localhost:3000)

## 🔑 Google OAuth Kurulumu (Opsiyonel)

1. **Google Cloud Console** → APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Redirect URI: `https://YOUR_SUPABASE_URL/auth/v1/callback`
4. Client ID ve Secret'ı Supabase → Authentication → Providers → Google'a gir

## 🔐 Auth Güvenliği

### Authorization Code + PKCE Flow

Bu proje, endüstri standardı **Authorization Code + PKCE** akışını kullanır (Implicit flow değil):

1. Kullanıcı "Google ile Giriş" tıklar
2. Google'a yönlendirilir
3. `/auth/callback?code=xxx` olarak geri döner (token değil!)
4. Server-side kod exchange ile güvenli token alımı
5. **URL'de asla token görünmez** ✅

### Production Ortam Değişkenleri

**Vercel veya production ortamında şunları ayarla:**

```env
NEXT_PUBLIC_SITE_URL=https://sinyaldeyiz.vercel.app
```

Bu değişken auth redirect'in doğru çalışması için **ZORUNLUDUR**.

### Supabase Auth Ayarları

**Authentication → URL Configuration:**
- Site URL: `https://sinyaldeyiz.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://sinyaldeyiz.vercel.app/auth/callback`

### Güvenlik Kontrol Listesi

- ✅ Token URL'de görünmez
- ✅ Code exchange server-side yapılır
- ✅ Cookie'ler HttpOnly
- ✅ Implicit flow kullanılmaz
- ✅ PKCE challenge kullanılır

## 📁 Proje Yapısı

```
sinyaldeyiz/
├── src/
│   ├── app/                # Next.js app router
│   │   ├── (app)/          # Authenticated routes
│   │   ├── auth/           # Auth callback
│   │   └── page.tsx        # Landing page
│   ├── components/         # React components
│   │   └── auth/           # Auth components
│   ├── lib/                # Utilities
│   │   └── supabase/       # Supabase client
│   └── types/              # TypeScript types
├── supabase/
│   └── migrations/         # SQL migrations
├── public/                 # Static files
└── arabalar.json           # Car data (1668 vehicles)
└── moto_brands.json        # Motorcycle brands (120 brands)
```

## 🧪 Demo

1. Siteyi aç: [http://localhost:3000](http://localhost:3000)
2. **Kayıt Ol** butonuna tıkla
3. Email ile kayıt ol veya **Misafir olarak devam et**
4. Onboarding'de araç/motor seçimini tamamla
5. Dashboard'da haritayı keşfet!

## 🤝 Katkıda Bulunma

1. Fork'la
2. Feature branch oluştur (`git checkout -b feature/amazing-feature`)
3. Değişikliklerini commit et (`git commit -m 'Add amazing feature'`)
4. Branch'i push et (`git push origin feature/amazing-feature`)
5. Pull Request aç

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje Sahibi**: Furkan Avcılar
- **E-posta**: [iletisim@sinyaldeyiz.com](mailto:iletisim@sinyaldeyiz.com)

---

<p align="center">
  Made with ❤️ in Türkiye 🇹🇷
</p>

<p align="center">
  🏎️ <b>Sinyaldeyiz</b> - Arabacılar & Motorcular için konum bazlı sosyal ağ
</p>
