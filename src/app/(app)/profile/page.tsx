'use client'

import { useState, useEffect, useRef } from 'react'
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
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [nickname, setNickname] = useState(profile?.nickname || '')
    const [city, setCity] = useState(profile?.city || '')
    const [avatar, setAvatar] = useState(profile?.avatar_url || '👤')
    const [customAvatarUrl, setCustomAvatarUrl] = useState('')
    const [showAvatarPicker, setShowAvatarPicker] = useState(false)
    const [showCustomAvatar, setShowCustomAvatar] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploading, setUploading] = useState(false)
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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Dosya boyutu maksimum 5MB olmalı')
            return
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Sadece resim dosyaları yüklenebilir')
            return
        }

        setUploading(true)
        setUploadProgress(0)
        setError('')

        try {
            const supabase = createSupabase()
            const fileExt = file.name.split('.').pop()
            const fileName = `${user!.id}-${Date.now()}.${fileExt}`
            const filePath = `avatars/${fileName}`

            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) {
                // If bucket doesn't exist, try to create it first
                if (uploadError.message.includes('The resource was not found')) {
                    setError('Storage bucket bulunamadı. Lütfen daha sonra tekrar deneyin.')
                } else {
                    throw uploadError
                }
                return
            }

            setUploadProgress(50)

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setAvatar(publicUrl)
            setUploadProgress(100)
            setSuccess('Resim yüklendi! Şimdi "Değişiklikleri Kaydet" butonuna tıklayın.')
            setTimeout(() => setSuccess(''), 5000)
        } catch (err: any) {
            setError(err.message || 'Yükleme başarısız')
        } finally {
            setUploading(false)
            setUploadProgress(0)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
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
                        <div className="flex justify-center gap-4 relative z-10">
                            <button
                                onClick={() => setShowAvatarPicker(true)}
                                className="relative inline-block"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-5xl mx-auto ring-4 ring-yellow-400/30 shadow-lg shadow-yellow-500/20">
                                    {avatar}
                                </div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/90 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-yellow-400">
                                    ✏️
                                </div>
                            </button>
                            <button
                                onClick={() => setShowCustomAvatar(true)}
                                className="relative inline-block"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-5xl mx-auto ring-4 ring-orange-500/30 shadow-lg shadow-orange-500/20">
                                    🌐
                                </div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/90 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-orange-500">
                                    🔗
                                </div>
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="relative inline-block"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-yellow-500 flex items-center justify-center text-5xl mx-auto ring-4 ring-red-500/30 shadow-lg shadow-red-500/20">
                                    {uploading ? '⏳' : '📷'}
                                </div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-black/90 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-red-500">
                                    📤
                                </div>
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                                        <span className="text-xs text-white font-bold">{uploadProgress}%</span>
                                    </div>
                                )}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                        <p className="text-white/60 text-sm mt-3 relative z-10">Emoji, URL veya dosya yükleme ile avatar değiştir</p>
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
                        <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Emoji Avatar Seç</h3>
                                <button onClick={() => setShowAvatarPicker(false)} className="text-white/60 hover:text-white">
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
                                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 ring-2 ring-yellow-400'
                                            : 'bg-white/10 hover:bg-white/20'
                                            }`}
                                    >
                                        {av}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Avatar URL Modal */}
                {showCustomAvatar && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">Avatar URL Gir</h3>
                                <button onClick={() => setShowCustomAvatar(false)} className="text-white/60 hover:text-white">
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="url"
                                    value={customAvatarUrl}
                                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                                    placeholder="https://example.com/avatar.jpg"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />

                                {customAvatarUrl && (
                                    <div className="flex justify-center">
                                        <img
                                            src={customAvatarUrl}
                                            alt="Preview"
                                            className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-500/30 shadow-lg shadow-orange-500/20"
                                            onError={() => setError('Geçersiz resim URL')}
                                            onLoad={() => setError('')}
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={() => {
                                        if (customAvatarUrl) {
                                            setAvatar(customAvatarUrl)
                                            setShowCustomAvatar(false)
                                            setCustomAvatarUrl('')
                                        }
                                    }}
                                    disabled={!customAvatarUrl}
                                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-orange-500/20"
                                >
                                    Avatarı Ayarla
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
