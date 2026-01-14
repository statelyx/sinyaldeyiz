'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { VisibleUser } from '@/lib/services/location-service'

interface MapViewProps {
    userLocation: { lat: number; lon: number } | null
    visibleUsers: VisibleUser[]
    isSignalActive: boolean
}

// Escape HTML to prevent XSS
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

export default function MapView({ userLocation, visibleUsers, isSignalActive }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const markers = useRef<maplibregl.Marker[]>([])
    const userMarker = useRef<maplibregl.Marker | null>(null)
    const [mapLoaded, setMapLoaded] = useState(false)

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return

        // Default center (Istanbul)
        const center: [number, number] = userLocation
            ? [userLocation.lon, userLocation.lat]
            : [28.9784, 41.0082]

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    osm: {
                        type: 'raster',
                        tiles: [
                            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        ],
                        tileSize: 256,
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    },
                },
                layers: [
                    {
                        id: 'osm-tiles',
                        type: 'raster',
                        source: 'osm',
                        minzoom: 0,
                        maxzoom: 19,
                    },
                ],
            },
            center,
            zoom: 12,
            attributionControl: false,
        })

        // Add zoom controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-left')

        // Add geolocation control
        map.current.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
            }),
            'top-left'
        )

        map.current.on('load', () => {
            setMapLoaded(true)
        })

        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [])

    // Update center when user location changes
    useEffect(() => {
        if (!map.current || !userLocation || !mapLoaded) return

        map.current.flyTo({
            center: [userLocation.lon, userLocation.lat],
            zoom: 13,
            duration: 1500,
        })
    }, [userLocation, mapLoaded])

    // Create marker element
    const createMarkerElement = useCallback((user: VisibleUser, isCurrentUser: boolean) => {
        const el = document.createElement('div')
        el.className = 'marker-container'

        if (isCurrentUser) {
            el.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg shadow-lg border-2 border-white">
            📍
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium">
            Sen
          </div>
          <div class="absolute inset-0 w-10 h-10 rounded-full bg-blue-500 animate-ping opacity-25"></div>
        </div>
      `
        } else {
            // Vehicle emoji based on brand
            const vehicleEmoji = getVehicleEmoji(user.vehicle_brand)
            // Escape nickname to prevent XSS
            const safeNickname = escapeHtml(user.nickname || 'Sürücü')
            const safeBrand = user.vehicle_brand ? escapeHtml(user.vehicle_brand) : ''
            const safeModel = user.vehicle_model ? escapeHtml(user.vehicle_model) : ''

            el.innerHTML = `
        <div class="relative cursor-pointer group">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-lg shadow-lg border-2 border-white transition-transform group-hover:scale-110">
            ${vehicleEmoji}
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium max-w-[80px] truncate">
            ${safeNickname}
          </div>
        </div>
      `

            // Store safe data for popup
            ;(el as any).dataset.safeBrand = safeBrand
            ;(el as any).dataset.safeModel = safeModel
            ;(el as any).dataset.safeNickname = safeNickname
        }

        return el
    }, [])

    // Update user markers
    useEffect(() => {
        if (!map.current || !mapLoaded) return

        // Clear existing markers
        markers.current.forEach(marker => marker.remove())
        markers.current = []

        // Add markers for visible users
        visibleUsers.forEach(user => {
            if (!user.lat || !user.lon) return

            const el = createMarkerElement(user, false)

            // Get escaped data from element
            const safeBrand = (el as any).dataset.safeBrand || ''
            const safeModel = (el as any).dataset.safeModel || ''
            const safeNickname = (el as any).dataset.safeNickname || 'Sürücü'
            const vehicleEmoji = getVehicleEmoji(user.vehicle_brand)

            const popup = new maplibregl.Popup({
                offset: 25,
                closeButton: false,
                className: 'custom-popup',
            }).setHTML(`
        <div class="p-3 min-w-[150px]">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-sm">
              ${vehicleEmoji}
            </div>
            <div>
              <p class="font-bold text-slate-800">${safeNickname}</p>
            </div>
          </div>
          ${safeBrand && safeModel ? `
            <div class="text-sm text-slate-600">
              <span class="font-medium">${safeBrand}</span> ${safeModel}
            </div>
          ` : ''}
          <div class="text-xs text-slate-400 mt-2">
            Aktif sinyal
          </div>
        </div>
      `)

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat([user.lon, user.lat])
                .setPopup(popup)
                .addTo(map.current!)

            markers.current.push(marker)
        })
    }, [visibleUsers, mapLoaded, createMarkerElement])

    // Update current user marker
    useEffect(() => {
        if (!map.current || !mapLoaded || !userLocation || !isSignalActive) {
            if (userMarker.current) {
                userMarker.current.remove()
                userMarker.current = null
            }
            return
        }

        if (userMarker.current) {
            userMarker.current.setLngLat([userLocation.lon, userLocation.lat])
        } else {
            const el = createMarkerElement({
                user_id: 'current',
                lat: userLocation.lat,
                lon: userLocation.lon,
                nickname: 'Sen',
                expires_at: ''
            }, true)

            userMarker.current = new maplibregl.Marker({ element: el })
                .setLngLat([userLocation.lon, userLocation.lat])
                .addTo(map.current!)
        }

        return () => {
            if (userMarker.current) {
                userMarker.current.remove()
                userMarker.current = null
            }
        }
    }, [userLocation, isSignalActive, mapLoaded, createMarkerElement])

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Map overlay for loading */}
            {!mapLoaded && (
                <div className="absolute inset-0 bg-slate-800/80 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-slate-300">Harita yükleniyor...</p>
                    </div>
                </div>
            )}

            {/* Custom styles for popup */}
            <style jsx global>{`
        .maplibregl-popup-content {
          border-radius: 12px;
          padding: 0;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border: 1px solid #e2e8f0;
        }

        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
          border-top-color: white;
        }

        .marker-container {
          cursor: pointer;
        }

        .maplibregl-ctrl-group {
          background: rgba(30, 41, 59, 0.9) !important;
          border: 1px solid rgba(71, 85, 105, 0.5) !important;
          border-radius: 8px !important;
          backdrop-filter: blur(8px);
        }

        .maplibregl-ctrl-group button {
          background-color: transparent !important;
          border: none !important;
        }

        .maplibregl-ctrl-group button:hover {
          background-color: rgba(51, 65, 85, 0.8) !important;
        }

        .maplibregl-ctrl-group button span {
          filter: invert(0.9);
        }

        .maplibregl-ctrl-attrib {
          background: rgba(30, 41, 59, 0.8) !important;
          color: #94a3b8 !important;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .maplibregl-ctrl-attrib a {
          color: #60a5fa !important;
        }
      `}</style>
        </div>
    )
}

// Helper function to get vehicle emoji based on brand
function getVehicleEmoji(brand?: string): string {
    if (!brand) return '🚗'

    const brandLower = brand.toLowerCase()

    // Luxury brands
    if (['mercedes', 'bmw', 'audi', 'porsche', 'ferrari', 'lamborghini', 'maserati'].some(b => brandLower.includes(b))) {
        return '🏎️'
    }

    // Japanese brands
    if (['toyota', 'honda', 'nissan', 'mazda', 'subaru', 'mitsubishi', 'lexus'].some(b => brandLower.includes(b))) {
        return '🚙'
    }

    // American brands
    if (['ford', 'chevrolet', 'dodge', 'jeep', 'tesla'].some(b => brandLower.includes(b))) {
        return '🚐'
    }

    // Default
    return '🚗'
}
