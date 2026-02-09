'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/supabase-provider'
import { TopBar } from '@/components/layout/top-bar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, authState, isOnboarded, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      // Kimlik doğrulama durumuna göre yönlendirme
      if (authState === 'unauthenticated') {
        router.push('/')
        return
      }

      // Kullanıcı giriş yapmış ama onboarding tamamlanmamışsa
      if (authState === 'authenticated_not_onboarded' && pathname !== '/onboarding') {
        router.push('/onboarding')
        return
      }
    }
  }, [authState, loading, router, pathname])

  // Yükleme durumu
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-lg">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Giriş yapılmamışsa render etme
  if (authState === 'unauthenticated') {
    return null
  }

  // Onboarding sayfası için navigasyonsuz render
  if (pathname === '/onboarding') {
    return <>{children}</>
  }

  // Onboarding tamamlanmamışsa dashboard layout render etme
  if (!isOnboarded && authState !== 'guest') {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* TopBar bileşeni — sidebar yerine üst menü */}
      <TopBar />

      {/* Ana içerik — tam genişlik, TopBar altında */}
      <main className="relative z-10">
        {/* TopBar yüksekliği kadar boşluk: mobil 48px, masaüstü 56px */}
        <div className="h-12 lg:h-14" />
        {children}
      </main>
    </div>
  )
}
