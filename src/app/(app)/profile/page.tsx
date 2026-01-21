'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/supabase-provider'
import { createSupabase } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'

// Vehicle brands that can be used as avatars - all using PNG icons
const VEHICLE_AVATARS = [
    { brand: 'BMW', path: '/vehicles/brands/bmw.png' },
    { brand: 'Mercedes', path: '/vehicles/brands/mercedes-benz.png' },
    { brand: 'Audi', path: '/vehicles/brands/audi.png' },
    { brand: 'Porsche', path: '/vehicles/brands/porsche.png' },
    { brand: 'Ferrari', path: '/vehicles/brands/ferrari.png' },
    { brand: 'Lamborghini', path: '/vehicles/brands/lamborghini.png' },
    { brand: 'Toyota', path: '/vehicles/brands/toyota.png' },
    { brand: 'Honda', path: '/vehicles/brands/honda.png' },
    { brand: 'Yamaha', path: '/vehicles/brands/yamaha.png' },
    { brand: 'Kawasaki', path: '/vehicles/brands/kawasaki.png' },
    { brand: 'Tesla', path: '/vehicles/brands/tesla.png' },
    { brand: 'Ford', path: '/vehicles/brands/ford.png' },
    { brand: 'Volkswagen', path: '/vehicles/brands/volkswagen.png' },
    { brand: 'Nissan', path: '/vehicles/brands/nissan.png' },
    { brand: 'Mazda', path: '/vehicles/brands/mazda.png' },
    { brand: 'Subaru', path: '/vehicles/brands/subaru.png' },
    { brand: 'Mitsubishi', path: '/vehicles/brands/mitsubishi.png' },
    { brand: 'Ducati', path: '/vehicles/brands/ducati.png' },
    { brand: 'Suzuki', path: '/vehicles/brands/suzuki.png' },
    { brand: 'Hyundai', path: '/vehicles/brands/hyundai.png' },
    { brand: 'Kia', path: '/vehicles/brands/kia.png' },
    { brand: 'Volvo', path: '/vehicles/brands/volvo.png' },
    { brand: 'Jaguar', path: '/vehicles/brands/jaguar.png' },
    { brand: 'Land Rover', path: '/vehicles/brands/land-rover.png' },
    { brand: 'Chevrolet', path: '/vehicles/brands/chevrolet.png' },
    { brand: 'Renault', path: '/vehicles/brands/renault.png' },
    { brand: 'Peugeot', path: '/vehicles/brands/peugeot.png' },
    { brand: 'Fiat', path: '/vehicles/brands/fiat.png' },
    { brand: 'Alfa Romeo', path: '/vehicles/brands/alfa-romeo.png' },
    { brand: 'Maserati', path: '/vehicles/brands/maserati.png' },
    { brand: 'Bugatti', path: '/vehicles/brands/bugatti.png' },
    { brand: 'Aston Martin', path: '/vehicles/brands/aston-martin.png' },
    { brand: 'Bentley', path: '/vehicles/brands/bentley.png' },
    { brand: 'Rolls-Royce', path: '/vehicles/brands/rolls-royce.png' },
    { brand: 'McLaren', path: '/vehicles/brands/mclaren.png' },
    { brand: 'KTM', path: '/vehicles/brands/ktm.png' },
    { brand: 'Harley-Davidson', path: '/vehicles/brands/harley-davidson.png' },
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
    const [nicknameChangedCount, setNicknameChangedCount] = useState(0)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Load nickname change count
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const count = localStorage.getItem('nickname_change_count') || '0'
            setNicknameChangedCount(parseInt(count))
        }
    }, [])

    const canChangeNickname = nicknameChangedCount === 0

    // Auto-save avatar when changed
    const handleAvatarChange = async (newAvatar: string) => {
        if (!user) return
        setAvatar(newAvatar)
        setError('')
        setSuccess('')

        try {
            const supabase = createSupabase()
            const { error: updateError } = await (supabase
                .from('profiles') as any)
                .update({ avatar_url: newAvatar, updated_at: new Date().toISOString() })
                .eq('id', user.id)

            if (updateError) throw updateError

            await refreshProfile()
            setSuccess('Avatar güncellendi!')
            setTimeout(() => setSuccess(''), 2000)
        } catch (err: any) {
            setError(err.message || 'Avatar güncellenemedi')
        }
    }

    const handleSave = async () => {
        if (!user) return
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const supabase = createSupabase()

            // Check if nickname is being changed
            const isNicknameChange = nickname !== profile?.nickname

            // Validate nickname change
            if (isNicknameChange && !canChangeNickname) {
                setError('Takma ad sadece 1 kez değiştirilebilir!')
                setLoading(false)
                return
            }

            const updateData = {
                id: user.id,
                city,
                avatar_url: avatar,
                updated_at: new Date().toISOString(),
            }

            // Only update nickname if it's changed and allowed
            if (isNicknameChange) {
                ;(updateData as any).nickname = nickname
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .upsert(updateData as any)

            if (updateError) throw updateError

            // Update nickname change count if nickname was changed
            if (isNicknameChange) {
                const newCount = nicknameChangedCount + 1
                setNicknameChangedCount(newCount)
                localStorage.setItem('nickname_change_count', newCount.toString())
            }

            await refreshProfile()
            setSuccess('Profil güncellendi!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err: any) {
            setError(err.message || 'Güncelleme başarısız')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!user) return
        setDeleteLoading(true)
        setError('')

        try {
            const supabase = createSupabase()

            // Delete user data (cascade will handle related records)
            const { error: deleteError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', user.id)

            if (deleteError) throw deleteError

            // Sign out
            await signOut()

            // Redirect to home
            router.push('/')
        } catch (err: any) {
            setError(err.message || 'Hesap silinemedi')
            setDeleteLoading(false)
        }
    }

    const handleSignOut = async () => {
        await signOut()
        router.push('/')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-yellow-950/20 to-black p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Profil Ayarları</h1>
                    <p className="text-white/60 mt-1">Kişisel bilgilerini düzenle</p>
                </div>

                {/* Messages */}
                {success && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-yellow-500/10">
                    {/* Avatar Section */}
                    <div className="bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-orange-500/5"></div>
                        <div className="flex justify-center relative z-10">
                            <button
                                onClick={() => setShowAvatarPicker(true)}
                                className="relative inline-block group"
                            >
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-1 ring-4 ring-yellow-400/30 shadow-lg shadow-yellow-500/20 group-hover:ring-yellow-400/50 transition-all">
                                    <div className="w-full h-full rounded-full bg-black/90 backdrop-blur-xl flex items-center justify-center overflow-hidden">
                                        {avatar.startsWith('/vehicles/') ? (
                                            <img
                                                src={avatar}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : avatar.startsWith('http') ? (
                                            <img
                                                src={avatar}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    ;(e.target as HTMLImageElement).src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23fbbf24"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6 0-8 4-8 4v2h16v-2s-2-4-8-4z"/></svg>')
                                                }}
                                            />
                                        ) : (
                                            <span className="text-5xl">{avatar}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 w-10 h-10 bg-black/90 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-lg group-hover:scale-110 transition-transform">
                                    ✏️
                                </div>
                            </button>
                        </div>
                        <p className="text-white/60 text-sm mt-4 relative z-10">Avatar seçmek için tıklayın</p>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-6">
                        {/* Email (readonly) */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                E-posta
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/40 cursor-not-allowed"
                            />
                            <p className="text-white/40 text-xs mt-1">E-posta değiştirilemez</p>
                        </div>

                        {/* Nickname */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Takma Ad {!canChangeNickname && <span className="text-red-400">(Son değiştirme hakkı kullanıldı)</span>}
                            </label>
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                disabled={!canChangeNickname}
                                className={`w-full px-4 py-3 rounded-lg text-white focus:outline-none focus:ring-2 ${
                                    !canChangeNickname
                                        ? 'bg-white/5 border border-white/10 cursor-not-allowed text-white/40'
                                        : 'bg-white/5 border border-white/10 focus:ring-yellow-400'
                                }`}
                                placeholder="Takma adınız"
                            />
                            {!canChangeNickname && (
                                <p className="text-yellow-400 text-xs mt-1">⚠️ Takma ad sadece 1 kez değiştirilebilir</p>
                            )}
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Şehir
                            </label>
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
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
                            className="w-full py-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-black font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20"
                        >
                            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="border-t border-white/10 p-6 space-y-4">
                        <h3 className="text-red-400 font-medium mb-4">Tehlikeli Bölge</h3>

                        <button
                            onClick={handleSignOut}
                            className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium rounded-lg border border-red-500/50 transition-all"
                        >
                            Çıkış Yap
                        </button>

                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all"
                        >
                            Hesabı Sil
                        </button>

                        <p className="text-white/40 text-xs text-center">
                            Hesabı silerseniz tüm verileriniz kalıcı olarak silinir ve geri alınamaz.
                        </p>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-red-500/50 shadow-xl">
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h3 className="text-2xl font-bold text-white mb-2">Hesabı Sil</h3>
                                <p className="text-white/70">
                                    Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecek.
                                </p>
                                <p className="text-red-400 font-medium mt-2">
                                    Emin misiniz?
                                </p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setError('')
                                    }}
                                    disabled={deleteLoading}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteLoading}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                                >
                                    {deleteLoading ? 'Siliniyor...' : 'Evet, Sil'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Avatar Picker Modal */}
                {showAvatarPicker && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl border border-white/10 shadow-xl max-h-[90vh] flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Marka Avatar Seç</h3>
                                <button onClick={() => setShowAvatarPicker(false)} className="text-white/60 hover:text-white text-2xl">
                                    ✕
                                </button>
                            </div>

                            {/* Scrollable grid */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-1">
                                    {VEHICLE_AVATARS.map((vehicle) => (
                                        <button
                                            key={vehicle.brand}
                                            onClick={() => {
                                                handleAvatarChange(vehicle.path)
                                                setShowAvatarPicker(false)
                                            }}
                                            className={`group relative aspect-square rounded-xl p-2 transition-all ${
                                                avatar === vehicle.path
                                                    ? 'bg-gradient-to-br from-yellow-400/30 to-orange-500/30 ring-2 ring-yellow-400 shadow-lg shadow-yellow-500/20'
                                                    : 'bg-white/5 hover:bg-white/10 hover:ring-1 hover:ring-white/20'
                                            }`}
                                        >
                                            <div className="w-full h-full flex items-center justify-center">
                                                <img
                                                    src={vehicle.path}
                                                    alt={vehicle.brand}
                                                    className="max-w-full max-h-full object-contain filter drop-shadow-lg"
                                                    onError={(e) => {
                                                        // Fallback to default icon
                                                        const target = e.target as HTMLImageElement
                                                        target.style.display = 'none'
                                                        const parent = target.parentElement
                                                        if (parent && !parent.querySelector('.fallback-icon')) {
                                                            const fallback = document.createElement('span')
                                                            fallback.className = 'fallback-icon text-2xl'
                                                            fallback.textContent = '🚗'
                                                            parent.appendChild(fallback)
                                                        }
                                                    }}
                                                />
                                            </div>
                                            {/* Tooltip/label */}
                                            <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-xs text-white/80 text-center py-1 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity">
                                                {vehicle.brand}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10 text-center">
                                <p className="text-white/50 text-sm">Favori markanızı seçin</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
