import { RegisterForm } from '@/components/auth/register-form'

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sinyaldeyiz&apos;e Hoş Geldiniz</h1>
        <p className="text-slate-400">Hesap oluşturun ve topluluğa katılın</p>
      </div>
      <RegisterForm />
    </div>
  )
}
