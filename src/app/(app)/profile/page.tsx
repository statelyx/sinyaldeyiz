'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/supabase-provider'
import { createSupabase } from '@/lib/supabase/client'

const AVATAR_OPTIONS = [
    '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰', '👱‍♂️', '👱‍♀️', '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲',
    '🧔', '🧔‍♀️', '👨', '👩', '🧑', '👴', '👵', '🧓', '👲', '👳‍♂️',
    '👳‍♀️', '🧕', '👮‍♂️', '👮‍♀️', '👷‍♂️', '👷‍♀️', '💂‍♂️', '💂‍♀️', '🕵️‍♂️', '🕵️‍♀️',
    '👨‍⚕️', '👩‍⚕️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳', '👨‍🎓', '👩‍🎓', '👨‍🎤', '👩‍🎤',
    '👨‍🏫', '👩‍🏫', '👨‍🏭', '👩‍🏭', '👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧',
]

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Konya', 'Adana', 'Gaziantep', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Trabzon', 'Samsun', 'Denizli']

export default function ProfilePage() {
    const router = useRouter()
    const { user, profile, refreshProfile, signOut } = useAuth()

    const [nickname, setNickname] = useState(profile?.nickname || '')
    const [city, setCity] = useState(profile?.city || '')
    const [avatar, setAvatar] = useState(profile?.avatar_url || '👤')
    const [showAvatarPicker, setShowAvatarPicker] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const handleSave = async () => {
        if (!user) return
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const supabase = createSupabase()

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    nickname,
                    city,
                    avatar_url: avatar,
                    updated_at: new Date().toISOString(),
                })

            if (updateError) throw updateError

            await refreshProfile()
            setSuccess('Profil güncellendi!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err: any) {
            setError(err.message || 'Güncelleme başarısız')
        } finally {
            setLoading(false)
        }
    }

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-slate-900 p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">Profil Ayarları</h1>
                    <p className="text-slate-400 mt-1">Kişisel bilgilerini düzenle</p>
                </div>

                {/* Messages */}
                {success && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-sm">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    {/* Avatar Section */}
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-8 text-center">
                        <button
                            onClick={() => setShowAvatarPicker(true)}
                            className="relative inline-block"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-5xl mx-auto ring-4 ring-orange-500/30">
                                {avatar}
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border-2 border-orange-500">
                                ✏️
                            </div>
                        </button>
                        <p className="text-slate-400 text-sm mt-3">Avatar değiştirmek için tıkla</p>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-6">
                        {/* Email (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                E-posta
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-slate-400 cursor-not-allowed"
                            />
                            <p className="text-slate-500 text-xs mt-1">E-posta değiştirilemez</p>
                        </div>

                        {/* Nickname */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Takma Ad
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="Takma adınız"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Şehir
                            </label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="">Şehir Seçin</option>
                                {CITIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                        >
                            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-slate-700 p-6">
                        <h3 className="text-red-400 font-medium mb-4">Tehlikeli Bölge</h3>
                        <button
                            onClick={handleSignOut}
                            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg border border-red-500/50 transition-all"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </div>

                {/* Avatar Picker Modal */}
                {showAvatarPicker && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Avatar Seç</h3>
                                <button onClick={() => setShowAvatarPicker(false)} className="text-slate-400 hover:text-white">
                                    ✕
                                </button>
                            </div>
                            <div className="grid grid-cols-10 gap-2 max-h-64 overflow-y-auto">
                                {AVATAR_OPTIONS.map((av, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setAvatar(av)
                                            setShowAvatarPicker(false)
                                        }}
                                        className={`w-8 h-8 flex items-center justify-center text-xl rounded-lg transition-all ${avatar === av
                                                ? 'bg-orange-500 ring-2 ring-orange-400'
                                                : 'bg-slate-700 hover:bg-slate-600'
                                            }`}
                                    >
                                        {av}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
