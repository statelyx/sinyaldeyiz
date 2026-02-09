'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/supabase-provider'
import { TopBar } from '@/components/layout/top-bar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading, authState, isOnboarded } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthCallback, setIsAuthCallback] = useState(false)

  // Auth callback kontrolü — window.location üzerinden (useSearchParams yerine)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const authParam = params.get('auth')
      if (authParam === 'success' || authParam === 'new' || authParam === 'returning') {
        setIsAuthCallback(true)
      }
    }
  }, [])

  useEffect(() => {
    if (!loading) {
      // Auth callback'ten dönüyorsa yönlendirme yapma, session'ın oturmasını bekle
      if (isAuthCallback && authState === 'unauthenticated') {
        return
      }

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
  }, [authState, loading, router, pathname, isAuthCallback])

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

  // Giriş yapılmamışsa render etme (auth callback hariç)
  if (authState === 'unauthenticated' && !isAuthCallback) {
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
      <TopBar />
      <main className="relative z-10">
        <div className="h-12 lg:h-14" />
        {children}
      </main>
    </div>
  )
}
