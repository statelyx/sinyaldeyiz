'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/supabase-provider'

// Navigasyon öğeleri
export const navItems = [
  { href: '/dashboard', label: 'Ana Sayfa', icon: '🏠' },
  { href: '/map', label: 'Harita', icon: '🗺️' },
  { href: '/weather', label: 'Hava', icon: '🌤️' },
  { href: '/garage', label: 'Garaj', icon: '🚗' },
  { href: '/profile', label: 'Profil', icon: '👤' },
]

interface TopBarProps {
  isSignalActive?: boolean
  visibleUsersCount?: number
}

export function TopBar({ isSignalActive = false, visibleUsersCount = 0 }: TopBarProps) {
  const { profile, isGuest, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Çıkış işlemi
  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <>
      {/* Üst menü çubuğu - masaüstü 56px, mobil 48px */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-xl border-b border-white/10 h-12 lg:h-14">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          {/* Sol: Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl lg:text-3xl">🏎️</span>
            <span className="text-lg lg:text-xl font-bold text-white">
              Sinyal<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">deyiz</span>
            </span>
          </Link>

          {/* Orta: Nav linkleri - sadece masaüstünde */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === item.href
                    ? 'bg-white/10 text-yellow-400'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sağ: Sinyal durumu, kullanıcı bilgisi, çıkış */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Sinyal durumu chip */}
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-bold transition-all ${
              isSignalActive
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-white/5 border-white/10 text-white/50'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSignalActive ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
              {isSignalActive ? 'SIGNAL ON' : 'SIGNAL OFF'}
            </div>

            {/* Aktif kullanıcı sayısı */}
            <div className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2 text-xs font-bold text-yellow-400">
              <span>📡</span>
              <span>{visibleUsersCount} aktif</span>
            </div>

            {/* Kullanıcı avatarı */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-sm overflow-hidden">
              {profile?.avatar_url?.startsWith('/vehicles/') ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-5 h-5 object-contain" />
              ) : (
                <span>{profile?.avatar_url || '👤'}</span>
              )}
            </div>

            {/* Kullanıcı adı */}
            <span className="text-white/70 text-sm font-medium max-w-[120px] truncate">
              {profile?.nickname || (isGuest ? 'Misafir' : 'Kullanıcı')}
            </span>

            {/* Çıkış butonu */}
            <button
              onClick={handleSignOut}
              className="text-white/50 hover:text-red-400 transition-colors text-sm px-2 py-1 rounded hover:bg-white/5"
              title="Çıkış Yap"
            >
              🚪
            </button>
          </div>

          {/* Mobil: Sinyal durumu ikonu + hamburger menü */}
          <div className="flex lg:hidden items-center gap-3">
            {/* Mobil sinyal durumu */}
            <div className={`w-2.5 h-2.5 rounded-full ${isSignalActive ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />

            {/* Hamburger menü butonu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white/80 hover:text-white transition-colors"
              aria-label="Menüyü aç"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobil menü overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobil açılır menü */}
      {mobileMenuOpen && (
        <div className="fixed top-12 left-0 right-0 z-50 lg:hidden bg-black/80 backdrop-blur-xl border-b border-white/10">
          {/* Kullanıcı bilgisi */}
          <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg overflow-hidden">
              {profile?.avatar_url?.startsWith('/vehicles/') ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-7 h-7 object-contain" />
              ) : (
                <span>{profile?.avatar_url || '👤'}</span>
              )}
            </div>
            <div>
              <p className="text-white font-medium text-sm">{profile?.nickname || (isGuest ? 'Misafir' : 'Kullanıcı')}</p>
              <p className="text-white/50 text-xs">{profile?.city || 'Sürücü'}</p>
            </div>
            {/* Sinyal durumu */}
            <div className={`ml-auto px-2 py-1 rounded text-xs font-bold ${
              isSignalActive ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/40'
            }`}>
              {isSignalActive ? 'ON' : 'OFF'}
            </div>
          </div>

          {/* Nav linkleri */}
          <nav className="py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 transition-all ${
                  pathname === item.href
                    ? 'bg-white/10 text-yellow-400'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Çıkış */}
          <div className="border-t border-white/5 py-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleSignOut()
              }}
              className="flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
            >
              <span className="text-lg">🚪</span>
              <span className="font-medium text-sm">Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
