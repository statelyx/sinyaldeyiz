'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/supabase-provider'
import Link from 'next/link'

const navItems = [
  { href: '/dashboard', label: 'Ana Sayfa', icon: '🏠', mobileIcon: '🏠' },
  { href: '/map', label: 'Harita', icon: '🗺️', mobileIcon: '🗺️' },
  { href: '/weather', label: 'Hava', icon: '🌤️', mobileIcon: '🌤️' },
  { href: '/garage', label: 'Garaj', icon: '🚗', mobileIcon: '🚗' },
  { href: '/profile', label: 'Profil', icon: '👤', mobileIcon: '👤' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, authState, isOnboarded, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      // Redirect based on auth state
      if (authState === 'unauthenticated') {
        router.push('/')
        return
      }

      // If user is authenticated but hasn't completed onboarding
      // and they're not already on the onboarding page
      if (authState === 'authenticated_not_onboarded' && pathname !== '/onboarding') {
        router.push('/onboarding')
        return
      }
    }
  }, [authState, loading, router, pathname])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-lg">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (authState === 'unauthenticated') {
    return null
  }

  // For onboarding, render without navigation
  if (pathname === '/onboarding') {
    return <>{children}</>
  }

  // Don't render dashboard layout if not onboarded
  if (!isOnboarded && authState !== 'guest') {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Desktop Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-black/95 backdrop-blur-xl border-r border-white/5 hidden lg:flex flex-col z-40 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-3xl">🏎️</span>
            <span className="text-2xl font-bold text-white">
              Sinyal<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">deyiz</span>
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
              {profile?.avatar_url || '👤'}
            </div>
            <div>
              <p className="text-white font-semibold">{profile?.nickname || 'Kullanıcı'}</p>
              <p className="text-white/60 text-sm">{profile?.city || 'Sürücü'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.href
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30 shadow-lg shadow-yellow-500/10'
                : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-black/95 backdrop-blur-xl border-b border-white/5 lg:hidden flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🏎️</span>
          <span className="text-lg font-bold text-white">
            Sinyal<span className="text-yellow-400">deyiz</span>
          </span>
        </Link>

        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-lg">
          {profile?.avatar_url || '👤'}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-black/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-40 lg:hidden transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-3xl">🏎️</span>
            <span className="text-xl font-bold text-white">
              Sinyal<span className="text-yellow-400">deyiz</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="text-white/60 text-xl">
            ✕
          </button>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-xl">
              {profile?.avatar_url || '👤'}
            </div>
            <div>
              <p className="text-white font-medium">{profile?.nickname || 'Kullanıcı'}</p>
              <p className="text-white/60 text-sm">{profile?.city || 'Sürücü'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.href
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400'
                : 'text-white/70 hover:bg-white/5'
                }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <span className="text-xl">🚪</span>
            <span className="font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="lg:hidden h-16" />
        {children}
        <div className="lg:hidden h-20" />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/95 backdrop-blur-xl border-t border-white/5 lg:hidden flex items-center justify-around z-40 pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${pathname === item.href
              ? 'text-yellow-400'
              : 'text-white/60 hover:text-white'
              }`}
          >
            <span className="text-2xl">{item.mobileIcon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
