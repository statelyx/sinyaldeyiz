'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthModal } from '@/components/auth/auth-modal'
import { useAuth } from '@/components/providers/supabase-provider'

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users (but not if they were just on onboarding page)
  useEffect(() => {
    if (loading || !user) return

    // Skip redirect if user was just on onboarding page (prevents redirect loop)
    const onboardingVisited = sessionStorage.getItem('onboarding_page_visited')
    if (onboardingVisited === 'true') {
      sessionStorage.removeItem('onboarding_page_visited')
      return
    }

    const checkOnboardingAndRedirect = async () => {
      const supabase = await import('@/lib/supabase/client').then(m => m.createSupabase())
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single() as any

      if (profile?.onboarding_completed) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }

    checkOnboardingAndRedirect()
  }, [user, loading, router])

  const openLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const openRegister = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden relative">
      {/* Animated Gradient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Glassmorphism animated blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-[30%] right-[-15%] w-[45vw] h-[45vw] bg-gradient-to-r from-purple-500/15 to-pink-500/15 rounded-full blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="relative z-50 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-black/20">
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
            className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg shadow-yellow-500/20"
          >
            Kayıt Ol
          </button>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <div className="relative z-10 min-h-[calc(100vh-80px)] flex items-center">
        <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - iPhone Mockup */}
          <div className="flex flex-col items-center lg:items-start">
            {/* iPhone Frame */}
            <div className="relative">
              {/* iPhone outer frame */}
              <div className="relative w-[280px] h-[580px] bg-gradient-to-br from-slate-700 to-slate-900 rounded-[3rem] p-2 shadow-2xl shadow-black/50">
                {/* iPhone inner frame */}
                <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-2xl z-20" />

                  {/* Screen Content - App Screenshots */}
                  <div className="w-full h-full relative overflow-hidden">
                    {/* Screenshot 1 - Map View */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800 p-4 pt-10">
                      {/* App Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-white">🗺️ Canlı Harita</span>
                        <span className="text-xs text-green-400 flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          12 Aktif
                        </span>
                      </div>

                      {/* Fake Map */}
                      <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl mb-4 relative overflow-hidden">
                        {/* Map grid lines */}
                        <div className="absolute inset-0 opacity-20" style={{
                          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                          backgroundSize: '20px 20px'
                        }} />
                        {/* Location pins */}
                        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full" />
                        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-orange-500 rounded-full animate-ping animation-delay-1000" />
                        <div className="absolute top-1/2 right-1/4 w-3 h-3 bg-orange-500 rounded-full" />
                        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-ping animation-delay-2000" />
                        <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-green-400 rounded-full" />
                      </div>

                      {/* Nearby Users */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs">🏎️</div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-white">Ahmet_M3</div>
                            <div className="text-[10px] text-white/50">BMW M3 • 500m uzakta</div>
                          </div>
                          <span className="text-yellow-400 text-xs">Sinyalde</span>
                        </div>
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                          <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-xs">🏍️</div>
                          <div className="flex-1">
                            <div className="text-xs font-medium text-white">Rider_34</div>
                            <div className="text-[10px] text-white/50">Kawasaki ZX-10R • 1.2km</div>
                          </div>
                          <span className="text-orange-400 text-xs">Sinyalde</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Home indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-1 bg-white/50 rounded-full" />
                </div>
              </div>

              {/* Glow effect behind phone */}
              <div className="absolute -inset-10 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-purple-500/20 blur-3xl -z-10 rounded-full" />
            </div>

            {/* App Store Badges */}
            <div className="flex gap-4 mt-8">
              <a href="#" className="group transition-transform hover:scale-105">
                <div className="flex items-center gap-2 px-4 py-2 bg-black border border-white/20 rounded-xl">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[8px] text-white/60">Yakında</div>
                    <div className="text-sm font-semibold text-white">App Store</div>
                  </div>
                </div>
              </a>
              <a href="#" className="group transition-transform hover:scale-105">
                <div className="flex items-center gap-2 px-4 py-2 bg-black border border-white/20 rounded-xl">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-[8px] text-white/60">Yakında</div>
                    <div className="text-sm font-semibold text-white">Google Play</div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Side - Content & Auth */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Badge */}
            <div className="mb-6 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/70 font-medium">Türkiye'nin ilk konum bazlı araç sosyal ağı</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              <span className="text-white">Araba & Motor</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                Tutkunu musun?
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-white/60 mb-8 max-w-md">
              Yakındaki <span className="text-yellow-400 font-semibold">arabacılar</span> ve{' '}
              <span className="text-orange-400 font-semibold">motorcularla</span> tanış.
              Sinyal ver, haritada görün!
            </p>

            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-8">
              <button
                onClick={openRegister}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-lg rounded-xl shadow-2xl shadow-yellow-500/30 transition-all hover:shadow-yellow-500/50 hover:scale-[1.02] flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google ile Başla
              </button>
              <button
                onClick={openLogin}
                className="flex-1 py-4 px-6 bg-white/5 backdrop-blur-xl hover:bg-white/10 text-white font-bold text-lg rounded-xl border border-white/10 transition-all hover:border-white/20 flex items-center justify-center gap-3"
              >
                <span>📧</span>
                E-posta ile Giriş
              </button>
            </div>

            {/* Guest Button */}
            <button
              onClick={() => {
                localStorage.setItem('sinyaldeyiz_guest', 'true')
                localStorage.setItem('sinyaldeyiz_guest_first_visit', 'true')
                router.push('/dashboard')
              }}
              className="py-3 px-6 text-white/50 hover:text-white/80 font-medium transition-colors flex items-center gap-2"
            >
              <span>👤</span>
              Misafir olarak bak
            </button>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {[
                { icon: '👻', label: 'Görünmez Mod' },
                { icon: '📍', label: 'Konum Kontrolü' },
                { icon: '🔒', label: 'KVKK Uyumlu' },
                { icon: '💬', label: 'Sohbet' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 text-sm text-white/60"
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section className="relative z-10 py-16 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Araba Markası' },
              { value: '120+', label: 'Motor Markası' },
              { value: '1000+', label: 'Kullanıcı' },
              { value: '🔥', label: 'Aktif Topluluk' },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center border-t border-white/5">
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

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }
        .animate-blob {
          animation: blob 20s infinite ease-in-out;
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
