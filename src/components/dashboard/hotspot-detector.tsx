'use client'

import { useState, useEffect, useMemo } from 'react'
import type { VisibleUser } from '@/lib/services/location-service'

interface HotspotDetectorProps {
    visibleUsers: VisibleUser[]
}

interface HotspotInfo {
    userCount: number
    isHotspot: boolean
}

/**
 * Client-side hotspot detection
 * A hotspot is detected when 5+ visible users are within the same approximate region
 */
export function HotspotDetector({ visibleUsers }: HotspotDetectorProps) {
    const [dismissed, setDismissed] = useState(false)
    const [animateIn, setAnimateIn] = useState(false)

    // Detect hotspots by grouping users by approximate location
    const hotspotInfo = useMemo((): HotspotInfo => {
        if (visibleUsers.length < 5) {
            return { userCount: visibleUsers.length, isHotspot: false }
        }

        // Group users by approximate region (grid-based clustering)
        // Using ~1km grid cells (0.01 degrees ≈ 1.11km)
        const gridSize = 0.01
        const clusters: Record<string, VisibleUser[]> = {}

        visibleUsers.forEach(user => {
            if (!user.lat || !user.lon) return

            const gridKey = `${Math.floor(user.lat / gridSize)}_${Math.floor(user.lon / gridSize)}`

            if (!clusters[gridKey]) {
                clusters[gridKey] = []
            }
            clusters[gridKey].push(user)
        })

        // Check if any cluster has 5+ users
        const maxClusterSize = Math.max(...Object.values(clusters).map(c => c.length), 0)

        return {
            userCount: maxClusterSize,
            isHotspot: maxClusterSize >= 5
        }
    }, [visibleUsers])

    // Reset dismissed state when hotspot ends
    useEffect(() => {
        if (!hotspotInfo.isHotspot) {
            setDismissed(false)
        }
    }, [hotspotInfo.isHotspot])

    // Animate in when hotspot detected
    useEffect(() => {
        if (hotspotInfo.isHotspot && !dismissed) {
            setTimeout(() => setAnimateIn(true), 100)
        } else {
            setAnimateIn(false)
        }
    }, [hotspotInfo.isHotspot, dismissed])

    // Don't show if not a hotspot or dismissed
    if (!hotspotInfo.isHotspot || dismissed) {
        return null
    }

    return (
        <div
            className={`mx-4 my-2 transform transition-all duration-500 ease-out ${animateIn
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 -translate-y-2 scale-95'
                }`}
        >
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 border border-orange-500/30">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-pulse" />

                {/* Content */}
                <div className="relative flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="text-3xl animate-bounce">🔥</div>
                            <div className="absolute inset-0 text-3xl animate-ping opacity-30">🔥</div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm sm:text-base">
                                Burada hareket var!
                            </h3>
                            <p className="text-orange-200 text-xs sm:text-sm">
                                {hotspotInfo.userCount} sürücü yakınlarda, herkes toplanıyor olabilir
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setDismissed(true)}
                        className="flex-shrink-0 p-2 text-orange-300 hover:text-white hover:bg-orange-500/20 rounded-lg transition-colors"
                        aria-label="Kapat"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* User count badges */}
                <div className="relative mt-3 flex gap-1">
                    {Array.from({ length: Math.min(hotspotInfo.userCount, 10) }).map((_, i) => (
                        <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-xs text-white font-bold border-2 border-white/20"
                            style={{
                                animationDelay: `${i * 100}ms`,
                                animation: 'pulse 2s infinite',
                            }}
                        >
                            🚗
                        </div>
                    ))}
                    {hotspotInfo.userCount > 10 && (
                        <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white font-bold border-2 border-white/20">
                            +{hotspotInfo.userCount - 10}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
