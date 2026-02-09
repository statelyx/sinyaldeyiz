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

// Harita bileşeni dinamik import (tarayıcı API'leri gerektirir)
const MapView = dynamic(() => import('@/components/dashboard/map-view'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-white/60">Harita yükleniyor...</p>
            </div>
        </div>
    ),
})

export default function DashboardPage() {
    const { profile, isGuest } = useAuth()
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
    const [visibleUsers, setVisibleUsers] = useState<VisibleUser[]>([])
    const [isSignalActive, setIsSignalActive] = useState(false)
    const [, setLoading] = useState(true)
    const [showGuestModal, setShowGuestModal] = useState(false)
 
   // İlk ziyaret kontrolü (misafir kullanıcılar için)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const getCookie = (name: string) => {
                const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
                return match ? match[2] : null
            }
            const isFirstVisit = getCookie('sinyaldeyiz_guest_first_visit') === 'true'
            if (isFirstVisit) {
                setShowGuestModal(true)
            }
        }
    }, [])

    // Görünür kullanıcıları getir
    const fetchVisibleUsers = useCallback(async () => {
        try {
            const users = await getVisibleUsers()
            setVisibleUsers(users)
        } catch (error) {
            console.error('Görünür kullanıcılar alınırken hata:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    // İlk yükleme ve realtime subscription
    useEffect(() => {
        fetchVisibleUsers()

        const supabase = createSupabase()
        let pollingInterval: ReturnType<typeof setInterval> | null = null

        const channel = supabase
            .channel('dashboard-location-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'location_status'
                },
                (payload) => {
                    console.log('🔄 Dashboard: Konum değişikliği algılandı:', payload)
                    fetchVisibleUsers()
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Dashboard: Realtime abonelik aktif')
                    if (pollingInterval) {
                        clearInterval(pollingInterval)
                        pollingInterval = null
                    }
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Dashboard: Realtime abonelik başarısız, fallback polling başlatılıyor')
                    if (!pollingInterval) {
                        pollingInterval = setInterval(() => {
                            fetchVisibleUsers()
                        }, 30000)
                    }
                }
            })

        return () => {
            console.log('🔌 Dashboard: Realtime abonelik sonlandırılıyor')
            supabase.removeChannel(channel)
            if (pollingInterval) {
                clearInterval(pollingInterval)
            }
        }
    }, [fetchVisibleUsers])
 
   // Sinyal durumu değiştiğinde
    const handleSignalChange = (active: boolean, location?: { lat: number; lon: number }) => {
        setIsSignalActive(active)
        if (location) {
            setUserLocation(location)
        }
        // Supabase'e yazma işleminin tamamlanması için kısa gecikme
        setTimeout(() => {
            fetchVisibleUsers()
        }, 500)
    }

    // Sayfa yüklendiğinde kullanıcı konumunu al
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                    })
                },
                (error) => {
                    console.log('Konum hatası:', error.message)
                    // Varsayılan: İstanbul
                    setUserLocation({ lat: 41.0082, lon: 28.9784 })
                },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    }, [])

    return (
        // Harita-merkezli tam ekran düzen: TopBar altındaki tüm alanı kaplar
        // Mobilde TopBar 48px (h-12), masaüstünde 56px (h-14)
        <div className="h-[calc(100vh-48px)] lg:h-[calc(100vh-56px)] relative">
            {/* Harita — tam ekran arka plan */}
            <MapView
                userLocation={userLocation}
                visibleUsers={visibleUsers}
                isSignalActive={isSignalActive}
                userVehicleBrand={profile?.avatar_url?.includes('/vehicles/brands/') ? profile.avatar_url.replace('/vehicles/brands/', '').replace('.png', '') : undefined}
                userAvatarUrl={profile?.avatar_url || undefined}
                userNickname={profile?.nickname || undefined}
            />

            {/* Misafir modu bulanıklaştırma overlay'i */}
            {isGuest && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-20">
                    <div className="text-center p-8 max-w-md">
                        <div className="text-7xl mb-6">🔒</div>
                        <h3 className="text-3xl font-bold text-white mb-3">
                            Misafir Modu
                        </h3>
                        <p className="text-white/70 mb-8 text-lg">
                            Haritayı görmek ve sinyal vermek için giriş yapmalısın
                        </p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-bold text-lg rounded-xl transition-all shadow-lg shadow-yellow-500/30"
                        >
                            🏁 Giriş Yap
                        </button>
                    </div>
                </div>
            )}

            {/* Hotspot uyarısı — harita üzerinde üst kısımda overlay */}
            <div className="absolute top-0 left-0 right-0 z-10">
                <HotspotDetector visibleUsers={visibleUsers} />
            </div>

            {/* Hava durumu widget'ları — harita üzerinde sol üst glassmorphism overlay */}
            <div className="absolute top-3 left-3 z-10 max-w-[calc(100vw-100px)] lg:max-w-md">
                <div className="bg-black/30 backdrop-blur-xl rounded-xl border border-white/10 p-2">
                    <WeatherWidgets location={userLocation} />
                </div>
            </div>

            {/* Sinyal butonu — harita üzerinde sağ alt köşede floating */}
            <div className="absolute bottom-6 right-6 z-10">
                <SignalButton onSignalChange={handleSignalChange} isMobile initialLocation={userLocation} />
            </div>

            {/* Masaüstü sinyal butonu — sol alt köşede daha geniş versiyon */}
            <div className="absolute bottom-6 left-6 hidden lg:block z-10">
                <SignalButton onSignalChange={handleSignalChange} initialLocation={userLocation} />
            </div>

            {/* Misafir karşılama modalı */}
            <GuestWelcomeModal
                isOpen={showGuestModal}
                onClose={() => setShowGuestModal(false)}
            />
        </div>
    )
}