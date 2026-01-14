'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabase } from '@/lib/supabase/client'

interface AuthModalProps {
    isOpen: boolean
    onClose: () => void
    mode: 'login' | 'register'
    onModeChange: (mode: 'login' | 'register') => void
}

export function AuthModal({ isOpen, onClose, mode, onModeChange }: AuthModalProps) {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [socialLoading, setSocialLoading] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    if (!isOpen) return null

    const handleGoogleAuth = async () => {
        setError('')
        setSocialLoading('google')

        try {
            const supabase = createSupabase()

            // Use environment variable for redirect URL - no runtime calculation
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
            const redirectUrl = `${siteUrl}/auth/callback`

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            })

            if (error) throw error
            // User will be redirected to Google
        } catch (err: any) {
            console.error('Google auth error:', err.message)
            if (err.message?.includes('provider is not enabled')) {
                setError('Google girişi henüz aktif değil. Supabase panelinden Google provider\'ı etkinleştirin.')
            } else {
                setError(err.message || 'Google ile giriş başarısız')
            }
            setSocialLoading(null)
        }
    }

    const handleGuestAccess = () => {
        // Guest mode - just close modal and allow browsing
        // Guest users can view landing page features without auth
        onClose()
        // Optional: Show a toast that they're browsing as guest
    }

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const supabase = createSupabase()

            // Use environment variable for redirect URL
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

            if (mode === 'register') {
                if (password !== confirmPassword) {
                    setError('Şifreler eşleşmiyor')
                    setLoading(false)
                    return
                }

                if (password.length < 6) {
                    setError('Şifre en az 6 karakter olmalı')
                    setLoading(false)
                    return
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${siteUrl}/auth/callback`,
                    }
                })

                if (error) throw error

                if (data.user) {
                    setSuccess('Kayıt başarılı! Yönlendiriliyorsunuz...')

                    // Wait briefly then redirect
                    setTimeout(() => {
                        router.push('/onboarding')
                        onClose()
                    }, 1000)
                }
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                if (error) throw error

                if (data.user) {
                    // Check if user has completed onboarding
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('nickname, onboarding_completed')
                        .eq('id', data.user.id)
                        .single()

                    onClose()

                    if ((profile as any)?.onboarding_completed || (profile as any)?.nickname) {
                        router.push('/dashboard')
                    } else {
                        router.push('/onboarding')
                    }
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err.message)
            if (err.message?.includes('Invalid login')) {
                setError('E-posta veya şifre hatalı')
            } else if (err.message?.includes('already registered')) {
                setError('Bu e-posta zaten kayıtlı. Giriş yapmayı deneyin.')
            } else if (err.message?.includes('Email not confirmed')) {
                setError('E-posta adresi doğrulanmamış. E-postanızı kontrol edin.')
            } else {
                setError(err.message || 'Bir hata oluştu')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl p-8 w-full max-w-md mx-4 border border-white/10 shadow-2xl shadow-yellow-500/10 max-h-[90vh] overflow-y-auto">
                {/* Glowing top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🏎️</div>
                    <h2 className="text-2xl font-black text-white mb-2">
                        {mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                    </h2>
                    <p className="text-white/60 text-sm">
                        {mode === 'login'
                            ? 'Hesabına giriş yap, sinyale katıl!'
                            : 'Hemen kayıt ol, topluluğa katıl!'}
                    </p>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
                        <span className="text-red-500 text-lg">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-start gap-3">
                        <span className="text-lg">✅</span>
                        <span>{success}</span>
                    </div>
                )}

                {/* Google Login Button - Primary CTA */}
                <button
                    onClick={handleGoogleAuth}
                    disabled={socialLoading !== null || loading}
                    className="w-full py-4 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-800 disabled:opacity-50 mb-4 shadow-lg text-base"
                >
                    {socialLoading === 'google' ? (
                        <div className="w-5 h-5 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    Google ile devam et
                </button>

                {/* Guest Access Button */}
                <button
                    onClick={handleGuestAccess}
                    disabled={loading || socialLoading !== null}
                    className="w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 disabled:opacity-50 mb-6"
                >
                    <span className="text-lg">👤</span>
                    Misafir olarak gez
                </button>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-slate-800 text-white/40">veya e-posta ile</span>
                    </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                            E-posta
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
                            placeholder="ornek@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                            Şifre
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {mode === 'register' && (
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
                                Şifre Tekrar
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || socialLoading !== null}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-bold text-base rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                Yükleniyor...
                            </div>
                        ) : (
                            mode === 'login' ? '🏁 Giriş Yap' : '🏁 Kayıt Ol'
                        )}
                    </button>
                </form>

                {/* Toggle Mode */}
                <p className="text-center text-white/50 text-sm mt-6">
                    {mode === 'login' ? (
                        <>
                            Hesabın yok mu?{' '}
                            <button
                                onClick={() => onModeChange('register')}
                                className="text-yellow-400 hover:text-yellow-300 font-semibold"
                            >
                                Kayıt Ol
                            </button>
                        </>
                    ) : (
                        <>
                            Zaten hesabın var mı?{' '}
                            <button
                                onClick={() => onModeChange('login')}
                                className="text-yellow-400 hover:text-yellow-300 font-semibold"
                            >
                                Giriş Yap
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    )
}
