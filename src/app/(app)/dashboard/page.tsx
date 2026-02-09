'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/components/providers/supabase-provider'
import { SignalButton } from '@/components/dashboard/signal-button'
import { WeatherWidgets } from '@/components/dashboard/weather-widgets'
import { HotspotDetector } from '@/components/dashboard/hotspot-detector'
import { GuestWelcomeModal } from '@/components/auth/guest-modal'
import type { VisibleUser } from '@/lib/services/location-service'
import { getVisibleUsers } from '@/lib/services/location-service'
import { createSupabase } from '@/lib/supabase/client'

const MapView = dynamic(() => import('@/components/dashboard/map-view'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-950 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/60 text-sm">Harita yükleniyor...</p>
            </div>
        </div>
    ),
})

export default function DashboardPage() {
    const { profile, isGuest } = useAuth()
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
    const [visibleUsers, setVisibleUsers] = useState<VisibleUser[]>([])
    const [isSignalActive, setIsSignalActive] = useState(false)
    const [showGuestModal, setShowGuestModal] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const getCookie = (name: string) => {
                const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
                return match ? match[2] : null
            }
            if (getCookie('sinyaldeyiz_guest_first_visit') === 'true') setShowGuestModal(true)
        }
    }, [])

    const fetchVisibleUsers = useCallback(async () => {
        try {
            const users = await getVisibleUsers()
            setVisibleUsers(users)
        } catch (error) {
            console.error('Görünür kullanıcılar alınırken hata:', error)
        }
    }, [])

    useEffect(() => {
        fetchVisibleUsers()
        const supabase = createSupabase()
        let pollingInterval: ReturnType<typeof setInterval> | null = null

        const channel = supabase
            .channel('dashboard-location-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'location_status' }, () => {
                fetchVisibleUsers()
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED' && pollingInterval) {
                    clearInterval(pollingInterval)
                    pollingInterval = null
                }
                if (status === 'CHANNEL_ERROR' && !pollingInterval) {
                    pollingInterval = setInterval(fetchVisibleUsers, 15000)
                }
            })

        return () => {
            supabase.removeChannel(channel)
            if (pollingInterval) clearInterval(pollingInterval)
        }
    }, [fetchVisibleUsers])

    const handleSignalChange = (active: boolean, location?: { lat: number; lon: number }) => {
        setIsSignalActive(active)
        if (location) setUserLocation(location)
        setTimeout(fetchVisibleUsers, 500)
    }

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => setUserLocation({ lat: 41.0082, lon: 28.9784 }),
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    }, [])

    return (
        <div className="flex flex-col h-[calc(100dvh-48px)] lg:h-[calc(100dvh-56px)] overflow-hidden">
            {/* Hava durumu barı — TopBar altında, yatay tek satır */}
            <div className="shrink-0 bg-slate-950/90 backdrop-blur-sm border-b border-white/5 px-2 lg:px-4 py-1.5">
                <div className="flex items-center gap-2 lg:gap-3">
                    <div className="flex-1 overflow-x-auto scrollbar-hide">
                        <WeatherWidgets location={userLocation} />
                    </div>
                    {/* Aktif kullanıcı sayısı — her zaman görünür */}
                    <div className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                        <span className="text-xs">📡</span>
                        <span className="text-xs font-bold">{visibleUsers.length}</span>
                    </div>
                    {/* Sinyal durumu — her zaman görünür */}
                    <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                        isSignalActive
                            ? 'bg-green-500/10 border-green-500/20 text-green-400'
                            : 'bg-white/5 border-white/10 text-white/40'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isSignalActive ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                        {isSignalActive ? 'ON' : 'OFF'}
                    </div>
                </div>
            </div>

            {/* Hotspot uyarısı */}
            <HotspotDetector visibleUsers={visibleUsers} />

            {/* Harita — kalan tüm alanı kaplar, ince çerçeve içinde */}
            <div className="flex-1 relative m-1 lg:m-2 rounded-xl lg:rounded-2xl overflow-hidden border border-white/10">
                <MapView
                    userLocation={userLocation}
                    visibleUsers={visibleUsers}
                    isSignalActive={isSignalActive}
                    userVehicleBrand={profile?.avatar_url?.includes('/vehicles/brands/') ? profile.avatar_url.replace('/vehicles/brands/', '').replace('.png', '') : undefined}
                    userAvatarUrl={profile?.avatar_url || undefined}
                    userNickname={profile?.nickname || undefined}
                />

                {/* Misafir modu overlay */}
                {isGuest && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-20">
                        <div className="text-center p-6 max-w-sm">
                            <div className="text-5xl mb-4">🔒</div>
                            <h3 className="text-2xl font-bold text-white mb-2">Misafir Modu</h3>
                            <p className="text-white/70 mb-6">Haritayı görmek için giriş yap</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl"
                            >
                                🏁 Giriş Yap
                            </button>
                        </div>
                    </div>
                )}

                {/* Sinyal butonu — sağ alt, safe area */}
                <div className="absolute z-30 right-3 lg:right-4" style={{ bottom: 'max(12px, env(safe-area-inset-bottom, 12px))' }}>
                    <SignalButton onSignalChange={handleSignalChange} isMobile initialLocation={userLocation} />
                </div>

                {/* Masaüstü sinyal butonu — sol alt */}
                <div className="absolute bottom-4 left-4 hidden lg:block z-10">
                    <SignalButton onSignalChange={handleSignalChange} initialLocation={userLocation} />
                </div>
            </div>

            <GuestWelcomeModal isOpen={showGuestModal} onClose={() => setShowGuestModal(false)} />
        </div>
    )
}
