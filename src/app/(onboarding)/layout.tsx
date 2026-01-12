import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/supabase/server'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress indicator */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            Hoş Geldiniz 👋
          </h1>
          <p className="text-slate-400 text-center">
            Hesabınızı tamamlayın ve Sinyaldeyiz topluluğuna katılın
          </p>
        </div>

        {children}
      </div>
    </div>
  )
}
