'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface GuestWelcomeModalProps {
    isOpen: boolean
    onClose: () => void
}

// Cookie helper functions
const deleteCookie = (name: string) => {
    if (typeof window === 'undefined') return
    document.cookie = `${name}=; path=/; max-age=0`
}

export function GuestWelcomeModal({ isOpen, onClose }: GuestWelcomeModalProps) {
    const router = useRouter()

    if (!isOpen) return null

    const handleRegister = () => {
        deleteCookie('sinyaldeyiz_guest')
        deleteCookie('sinyaldeyiz_guest_first_visit')
        onClose()
        router.push('/')
    }

    const handleContinueAsGuest = () => {
        deleteCookie('sinyaldeyiz_guest_first_visit')
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-2xl p-8 w-full max-w-lg mx-4 border border-white/10 shadow-2xl shadow-yellow-500/10">
                {/* Glowing top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">👋</div>
                    <h2 className="text-2xl font-black text-white mb-2">
                        Hoş Geldin!
                    </h2>
                    <p className="text-white/60 text-sm">
                        Sinyaldeyiz'e misafir olarak göz atıyorsun
                    </p>
                </div>

                {/* App Description */}
                <div className="space-y-4 mb-8">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🏎️</span>
                            <h3 className="font-bold text-white">Sinyaldeyiz Nedir?</h3>
                        </div>
                        <p className="text-white/70 text-sm">
                            Türkiye'nin ilk konum bazlı araç sosyal ağı. Araba ve motor tutkunlarını bir araya getiriyoruz.
                        </p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">👻</span>
                            <h3 className="font-bold text-white">Varsayılan Görünmez</h3>
                        </div>
                        <p className="text-white/70 text-sm">
                            Kayıt olduğunda kimse seni göremez. Gizliliğin bizimle güvende.
                        </p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">📡</span>
                            <h3 className="font-bold text-white">Sinyal Ver - Görün</h3>
                        </div>
                        <p className="text-white/70 text-sm">
                            İstersen sinyal ver, yakındaki araç tutkunları seni bulsun. Kontrolü sen seç, sen kapat.
                        </p>
                    </div>
                </div>

                {/* Guest Limitations Notice */}
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-lg">⚠️</span>
                        <div>
                            <h4 className="font-semibold text-yellow-400 text-sm mb-1">Misafir Kısıtlamaları</h4>
                            <ul className="text-white/60 text-xs space-y-1">
                                <li>• Haritada tam konumları göremezsin</li>
                                <li>• Sinyal veremezsin</li>
                                <li>• Mesaj gönderemezsin</li>
                                <li>• Profil oluşturamazsın</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={handleRegister}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-bold text-base rounded-xl transition-all shadow-lg shadow-yellow-500/20"
                    >
                        🏁 Hesap Oluştur – Tüm Özelliklere Eriş
                    </button>
                    <button
                        onClick={handleContinueAsGuest}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium rounded-xl border border-white/10 transition-all"
                    >
                        Misafir olarak devam et
                    </button>
                </div>
            </div>
        </div>
    )
}
