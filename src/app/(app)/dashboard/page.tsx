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

// Dynamic import for map (requires browser APIs)
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

// Dynamic greeting messages
const greetings = [
    { emoji: '🏎️', text: 'Gazı veriyoruz' },
    { emoji: '🏁', text: 'Kontağı çeviriyoruz' },
    { emoji: '🚀', text: 'Motor sıcak' },
    { emoji: '⚡', text: 'Pist hazır' },
    { emoji: '🔥', text: 'Yollar seninle güzel' },
]

export default function DashboardPage() {
    const { user, profile, isGuest } = useAuth()
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
    const [visibleUsers, setVisibleUsers] = useState<VisibleUser[]>([])
    const [isSignalActive, setIsSignalActive] = useState(false)
    const [loading, setLoading] = useState(true)
    const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)])
    const [showGuestModal, setShowGuestModal] = useState(false)

    // Check for first-time guest visit
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

    // Get nickname or fallback
    const displayName = profile?.nickname || user?.email?.split('@')[0] || (isGuest ? 'Misafir' : 'Sürücü')

    // Fetch visible users
    const fetchVisibleUsers = useCallback(async () => {
        try {
            const users = await getVisibleUsers()
            setVisibleUsers(users)
        } catch (error) {
            console.error('Error fetching visible users:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial load and real-time subscription for instant updates
    useEffect(() => {
        fetchVisibleUsers()

        // Set up real-time subscription for instant updates
        const supabase = createSupabase()
        const channel = supabase
            .channel('dashboard-location-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'location_status'
                },
                (payload) => {
                    console.log('🔄 Dashboard: Location change detected:', payload)
                    // Fetch all visible users when any change occurs
                    fetchVisibleUsers()
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Dashboard: Realtime subscription active')
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Dashboard: Realtime subscription failed')
                }
            })

        // Cleanup subscription on unmount
        return () => {
            console.log('🔌 Dashboard: Unsubscribing from realtime')
            supabase.removeChannel(channel)
        }
    }, [fetchVisibleUsers])

    // Handle signal status change
    const handleSignalChange = (active: boolean, location?: { lat: number; lon: number }) => {
        setIsSignalActive(active)
        if (location) {
            setUserLocation(location)
        }
        fetchVisibleUsers()
    }

    // Get user location on mount
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
                    console.log('Geolocation error:', error.message)
                    setUserLocation({ lat: 41.0082, lon: 28.9784 }) // Istanbul
                },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    }, [])

    return (
        <div className="h-[calc(100vh-4rem)] lg:h-screen flex flex-col bg-black">
            {/* Racing HUD Header */}
            <div className="relative p-4 bg-gradient-to-r from-black via-slate-900/50 to-black border-b border-white/5 overflow-hidden">
                {/* Top glow line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Greeting Section */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/30">
                            {greeting.emoji}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white">
                                {greeting.text}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{displayName}</span>!
                            </h1>
                            <p className="text-white/50 text-sm">
                                {isGuest ? (
                                    <span className="flex items-center gap-1">
                                        <span className="text-yellow-400">👤</span> Misafir olarak geziyorsun
                                    </span>
                                ) : (
                                    'Bugün kimler sinyalde bakalım 🏁'
                                )}
                            </p>
                        </div>
                    </div>

                    {/* HUD Stats - Desktop */}
                    <div className="hidden lg:flex items-center gap-3">
                        {/* Signal Status Chip */}
                        <div className={`px-5 py-2.5 rounded-xl border flex items-center gap-2.5 text-sm font-bold transition-all ${isSignalActive
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : 'bg-white/5 border-white/10 text-white/50'
                            }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${isSignalActive ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                            {isSignalActive ? 'SIGNAL ON' : 'SIGNAL OFF'}
                        </div>

                        {/* Active Users */}
                        <div className="px-5 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2.5 text-sm font-bold text-yellow-400">
                            <span>📡</span>
                            <span>{visibleUsers.length} aktif</span>
                        </div>
                    </div>
                </div>

                {/* Weather Widgets - Compact */}
                <div className="mt-4">
                    <WeatherWidgets location={userLocation} />
                </div>
            </div>

            {/* Hotspot Alert */}
            <HotspotDetector visibleUsers={visibleUsers} />

            {/* Map Section */}
            <div className="flex-1 relative">
                <MapView
                    userLocation={userLocation}
                    visibleUsers={visibleUsers}
                    isSignalActive={isSignalActive}
                />

                {/* Guest Mode Blur Overlay */}
                {isGuest && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-10">
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

                {/* Desktop Signal Button */}
                <div className="absolute bottom-6 left-6 hidden lg:block">
                    <SignalButton onSignalChange={handleSignalChange} />
                </div>

                {/* Desktop Stats Panel - Racing Style */}
                <div className="absolute top-4 right-4 hidden lg:block">
                    <div className="bg-black/90 backdrop-blur-xl rounded-2xl p-5 border border-white/10 space-y-4 shadow-2xl min-w-[200px]">
                        <h3 className="text-white font-black flex items-center gap-2 text-sm uppercase tracking-wider">
                            <span className="w-1 h-5 bg-gradient-to-b from-yellow-400 to-orange-500 rounded-full" />
                            Dashboard
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-white/50">Aktif Sürücü</span>
                                <span className="text-yellow-400 font-black text-xl">{visibleUsers.length}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-white/50">Sinyal Durumu</span>
                                <span className={`font-bold ${isSignalActive ? 'text-green-400' : 'text-white/30'}`}>
                                    {isSignalActive ? '🟢 AKTİF' : '⚪ PASİF'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-white/50">Mod</span>
                                <span className="text-white/70 font-medium">
                                    {isGuest ? '👤 Misafir' : '✅ Üye'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Floating Action Button */}
                <div className="absolute bottom-6 right-6 lg:hidden z-30">
                    <SignalButton onSignalChange={handleSignalChange} isMobile />
                </div>
            </div>

            {/* Mobile Stats Bar - Racing HUD Style */}
            <div className="lg:hidden bg-black border-t border-white/5 px-4 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {/* Signal Indicator */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase ${isSignalActive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-white/5 text-white/40'
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${isSignalActive ? 'bg-green-400 animate-pulse' : 'bg-white/30'}`} />
                            {isSignalActive ? 'ON' : 'OFF'}
                        </div>

                        {/* Active Users */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-yellow-400 font-black">{visibleUsers.length}</span>
                            <span className="text-white/40">sürücü</span>
                        </div>
                    </div>

                    {/* User Tag */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-xs border border-white/5">
                        <span>{isGuest ? '👤' : '🏎️'}</span>
                        <span className="text-white/70 font-medium truncate max-w-[100px]">
                            {displayName}
                        </span>
                    </div>
                </div>
            </div>

            {/* Guest Welcome Modal */}
            <GuestWelcomeModal
                isOpen={showGuestModal}
                onClose={() => setShowGuestModal(false)}
            />
        </div>
    )
}
