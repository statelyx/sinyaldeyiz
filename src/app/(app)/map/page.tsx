'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { SignalButton } from '@/components/dashboard/signal-button'
import { WeatherWidgets } from '@/components/dashboard/weather-widgets'
import { HotspotDetector } from '@/components/dashboard/hotspot-detector'
import { getVisibleUsers, type VisibleUser } from '@/lib/services/location-service'
import { createSupabase } from '@/lib/supabase/client'

const MapView = dynamic(() => import('@/components/dashboard/map-view'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Harita yükleniyor...</p>
            </div>
        </div>
    ),
})

export default function MapPage() {
    const [isSignalActive, setIsSignalActive] = useState(false)
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
    const [visibleUsers, setVisibleUsers] = useState<VisibleUser[]>([])

    useEffect(() => {
        const fetchUsers = async () => {
            const users = await getVisibleUsers()
            setVisibleUsers(users)
            console.log('📍 Visible users fetched:', users.length)
        }

        // Initial fetch
        fetchUsers()

        // Set up real-time subscription for instant updates
        const supabase = createSupabase()
        const channel = supabase
            .channel('location-status-changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'location_status'
                },
                (payload) => {
                    console.log('🔄 Location change detected:', payload)
                    // Fetch all visible users when any change occurs
                    fetchUsers()
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime subscription active')
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error('❌ Realtime subscription failed')
                }
            })

        // Cleanup subscription on unmount
        return () => {
            console.log('🔌 Unsubscribing from realtime')
            supabase.removeChannel(channel)
        }
    }, [])

    const handleSignalChange = (active: boolean, location?: { lat: number; lon: number }) => {
        setIsSignalActive(active)
        if (location) {
            setUserLocation(location)
        }
    }

    return (
        <div className="h-screen flex flex-col relative">
            {/* Weather Widgets - Top Bar */}
            <div className="absolute top-2 left-2 right-2 z-20 lg:top-4 lg:left-4 lg:right-4">
                <WeatherWidgets location={userLocation} />
            </div>

            {/* Hotspot Alert */}
            <div className="absolute top-20 left-4 right-4 z-20">
                <HotspotDetector visibleUsers={visibleUsers} />
            </div>

            {/* Full Screen Map */}
            <div className="flex-1 w-full h-full">
                <MapView
                    isSignalActive={isSignalActive}
                    userLocation={userLocation}
                    visibleUsers={visibleUsers}
                />
            </div>

            {/* Signal Button - Floating */}
            <div className="absolute bottom-24 right-4 z-30 lg:bottom-8">
                <SignalButton
                    onSignalChange={handleSignalChange}
                />
            </div>

            {/* Active Users Counter */}
            <div className="absolute bottom-24 left-4 z-30 lg:bottom-8 bg-slate-800/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-slate-700">
                <p className="text-slate-400 text-sm">Aktif Sürücü</p>
                <p className="text-2xl font-bold text-white">{visibleUsers.length}</p>
            </div>
        </div>
    )
}
