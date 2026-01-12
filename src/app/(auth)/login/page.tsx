import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tekrar Hoş Geldiniz</h1>
        <p className="text-slate-400">Sinyaldeyiz hesabınıza giriş yapın</p>
      </div>
      <LoginForm />
    </div>
  )
}
