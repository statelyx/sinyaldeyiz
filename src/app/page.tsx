'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { AuthModal } from '@/components/auth/auth-modal'
import { useAuth } from '@/components/providers/supabase-provider'

// Dynamic import to avoid SSR issues with Three.js
const ThreeBackground = dynamic(() => import('@/components/three/ThreeBackground'), {
  ssr: false,
  loading: () => null,
})

// Fake testimonials with avatar images
const testimonials = [
  { id: 1, text: 'adamımm bu app harika', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet' },
  { id: 2, text: 'off kızlar hadi nerdeyiz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep' },
  { id: 3, text: 'en gz uygulama', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet' },
  { id: 4, text: 'bağdat caddesinde 10 kişi toplandık', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=elif' },
  { id: 5, text: 'motor crew olarak kullanıyoruz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emre' },
  { id: 6, text: 'gece cruiselerinde mükemmel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=selin' },
  { id: 7, text: 'arabamı göstermek için aşırı iyi', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=burak' },
  { id: 8, text: 'modifiye araba sahipleri için şart', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse' },
  { id: 9, text: 'yarış pistinde buluştuk efsaneydi', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can' },
  { id: 10, text: 'drift ekibiyle tanıştım burdan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=deniz' },
  { id: 11, text: 'her gece online olan var', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kerem' },
  { id: 12, text: 'bmw club ile buluştuk', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yagmur' },
]

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { user, loading, authState, isOnboarded } = useAuth()
  const router = useRouter()

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      if (isOnboarded) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }
  }, [user, loading, isOnboarded, router])

  const openLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const openRegister = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Three.js Animated Background */}
      <ThreeBackground />

      {/* Animated Background Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
                        linear-gradient(rgba(250, 204, 21, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(250, 204, 21, 0.1) 1px, transparent 1px)
                    `,
          backgroundSize: '60px 60px',
        }} />
      </div>

      {/* Glowing Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-yellow-400/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Navbar - Glassmorphism */}
      <nav className="relative z-50 px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl">🏎️</span>
            <span className="text-xl">×</span>
            <span className="text-2xl">🏍️</span>
          </div>
          <span className="text-2xl font-black tracking-tight">
            Sinyal<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">deyiz</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openLogin}
            className="px-5 py-2.5 text-white/80 hover:text-white font-medium transition-colors"
          >
            Giriş
          </button>
          <button
            onClick={openRegister}
            className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-lg hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/20"
          >
            Kayıt Ol
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-16">
        {/* Badge */}
        <div className="mb-8 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-2.5 shadow-xl">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-white/70 font-medium">Türkiye'nin ilk konum bazlı araç sosyal ağı</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center leading-tight mb-6 max-w-5xl">
          <span className="text-white">Sinyaldeyiz</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
            Arabacılar & Motorcular
          </span>
          <br />
          <span className="text-white/90">Nerede, Şimdi Gör</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/60 text-center max-w-2xl mb-12 leading-relaxed">
          Varsayılan <span className="text-yellow-400 font-semibold">görünmez</span>.
          İstersen <span className="text-orange-400 font-semibold">sinyal ver</span>,
          yakındakiler seni bulsun.
        </p>

        {/* CTA Buttons - Glassmorphism */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg mb-16">
          <button
            onClick={openRegister}
            className="flex-1 py-4 px-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl shadow-2xl shadow-yellow-500/30 transition-all hover:shadow-yellow-500/50 hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Google ile Giriş
          </button>
          <button
            onClick={openLogin}
            className="flex-1 py-4 px-8 bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white font-bold text-lg rounded-xl border border-white/10 transition-all hover:border-white/20 flex items-center justify-center gap-3"
          >
            <span className="text-xl">📧</span>
            E-posta ile Giriş
          </button>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl">
          {[
            { icon: '👻', label: 'Varsayılan Görünmez' },
            { icon: '📍', label: 'Konum Kontrolü' },
            { icon: '🔒', label: 'KVKK Uyumlu' },
            { icon: '🗺️', label: 'Canlı Harita' },
            { icon: '🚗', label: 'Araba & Motor' },
          ].map((badge, i) => (
            <div
              key={i}
              className="px-4 py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-2 text-sm text-white/70 hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <span className="text-lg">{badge.icon}</span>
              <span>{badge.label}</span>
            </div>
          ))}
        </div>

        {/* Testimonials with Avatar Images */}
        <div className="mt-16 max-w-6xl mx-auto">
          <h3 className="text-center text-white/40 text-sm font-medium mb-6 uppercase tracking-wider">Kullanıcılar ne diyor?</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all"
              >
                <img
                  src={t.avatar}
                  alt="Kullanıcı"
                  className="w-6 h-6 rounded-full bg-white/10"
                />
                <span className="text-sm text-white/70">"{t.text}"</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="relative z-10 px-6 py-24 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            <span className="text-white">Nasıl </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Çalışır?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '👻',
                title: 'Varsayılan Görünmez',
                desc: 'Kayıt olduğunda kimse seni göremez. Gizliliğin bizimle güvende.',
                gradient: 'from-slate-800 to-slate-900',
              },
              {
                step: '02',
                icon: '📡',
                title: 'Sinyal Ver',
                desc: '30-60-120 dakikalık süreli görünürlük. Kontrolü sen seç, sen kapat.',
                gradient: 'from-yellow-900/30 to-orange-900/30',
              },
              {
                step: '03',
                icon: '🤝',
                title: 'Buluş & Tanış',
                desc: 'Yakındaki araba ve motor tutkunlarıyla haritada buluş, sohbet et.',
                gradient: 'from-orange-900/30 to-red-900/30',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-8 rounded-2xl bg-gradient-to-br ${item.gradient} backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all group`}
              >
                <div className="flex items-start justify-between mb-6">
                  <span className="text-5xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-yellow-400/50 text-sm font-mono">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicle Types Section */}
      <section className="relative z-10 px-6 py-24 bg-gradient-to-b from-transparent to-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-8">
            <span className="text-white">Hem </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Araba</span>
            <span className="text-white"> Hem </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Motor</span>
          </h2>

          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-400/50 transition-all group">
              <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform">🚗</span>
              <h3 className="text-xl font-bold text-white mb-2">Otomobil</h3>
              <p className="text-white/60">50+ marka, 1600+ model</p>
            </div>
            <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-400/50 transition-all group">
              <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform">🏍️</span>
              <h3 className="text-xl font-bold text-white mb-2">Motorsiklet</h3>
              <p className="text-white/60">120+ marka, 1000+ model</p>
            </div>
          </div>

          <button
            onClick={openRegister}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl shadow-2xl shadow-yellow-500/30 transition-all hover:shadow-yellow-500/50 hover:scale-[1.02]"
          >
            🏁 Hemen Başla — Ücretsiz
          </button>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="relative z-10 px-6 py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">🛡️</span>
              <h3 className="text-2xl font-bold text-white">Gizlilik & Güvenlik</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                '✅ KVKK Uyumlu',
                '✅ Konum Kontrolü',
                '✅ Görünmez Mod',
                '✅ Şikayet Sistemi',
                '✅ Spam Koruması',
              ].map((item, i) => (
                <span key={i} className="text-sm text-white/70">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center border-t border-white/5">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-2xl">🏎️</span>
          <span className="text-xl font-bold text-white">
            Sinyal<span className="text-yellow-400">deyiz</span>
          </span>
        </div>
        <p className="text-white/40 text-sm">
          © 2026 Sinyaldeyiz. Tüm hakları saklıdır.
        </p>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  )
}
