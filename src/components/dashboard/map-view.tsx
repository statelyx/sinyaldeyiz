'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { VisibleUser } from '@/lib/services/location-service'
import { VehicleIcon } from './vehicle-icon'
import { ChatBubble } from './chat-bubble'

interface MapViewProps {
    userLocation: { lat: number; lon: number } | null
    visibleUsers: VisibleUser[]
    isSignalActive: boolean
}

type MapStyle = 'dark' | '3d'

// Map style configurations
const MAP_STYLES = {
    dark: {
        style: {
            version: 8,
            sources: {
                'carto-dark': {
                    type: 'raster',
                    tiles: [
                        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                    ],
                    tileSize: 256,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                },
            },
            layers: [
                {
                    id: 'dark-tiles',
                    type: 'raster',
                    source: 'carto-dark',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
        pitch: 0,
        bearing: 0,
    },
    '3d': {
        style: {
            version: 8,
            sources: {
                'carto-dark': {
                    type: 'raster',
                    tiles: [
                        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
                    ],
                    tileSize: 256,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                },
            },
            layers: [
                {
                    id: 'dark-tiles',
                    type: 'raster',
                    source: 'carto-dark',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
        pitch: 60,
        bearing: -17.6,
    },
}

export default function MapView({ userLocation, visibleUsers, isSignalActive }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const markers = useRef<maplibregl.Marker[]>([])
    const userMarker = useRef<maplibregl.Marker | null>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [mapStyle, setMapStyle] = useState<MapStyle>('dark')

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return

        // Default center (Istanbul)
        const center: [number, number] = userLocation
            ? [userLocation.lon, userLocation.lat]
            : [28.9784, 41.0082]

        const currentStyle = MAP_STYLES[mapStyle]

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: currentStyle.style as any,
            center,
            zoom: 12,
            pitch: currentStyle.pitch,
            bearing: currentStyle.bearing,
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

    // Update map style
    useEffect(() => {
        if (!map.current || !mapLoaded) return

        const currentStyle = MAP_STYLES[mapStyle]
        map.current.setStyle(currentStyle.style as any)
        map.current.setPitch(currentStyle.pitch)
        map.current.setBearing(currentStyle.bearing)
    }, [mapStyle, mapLoaded])

    // Update center when user location changes
    useEffect(() => {
        if (!map.current || !userLocation || !mapLoaded) return

        map.current.flyTo({
            center: [userLocation.lon, userLocation.lat],
            zoom: 13,
            pitch: MAP_STYLES[mapStyle].pitch,
            bearing: MAP_STYLES[mapStyle].bearing,
            duration: 1500,
        })
    }, [userLocation, mapLoaded, mapStyle])

    // Create marker element
    const createMarkerElement = useCallback((user: VisibleUser, isCurrentUser: boolean) => {
        const el = document.createElement('div')
        el.className = 'marker-container'

        if (isCurrentUser) {
            el.innerHTML = `
        <div class="relative">
          <div class="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-400/30 border-2 border-white">
            <svg class="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold">
            Sen
          </div>
          <div class="absolute inset-0 w-12 h-12 rounded-full bg-yellow-400 animate-ping opacity-30"></div>
        </div>
      `
        } else {
            const safeNickname = escapeHtml(user.nickname || 'Sürücü')
            const safeBrand = user.vehicle_brand ? escapeHtml(user.vehicle_brand) : ''
            const safeModel = user.vehicle_model ? escapeHtml(user.vehicle_model) : ''

            el.innerHTML = `
        <div class="relative cursor-pointer group">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm border-2 border-yellow-400/50 flex items-center justify-center shadow-lg shadow-yellow-400/20 transition-transform group-hover:scale-110 overflow-hidden">
            <img src="/vehicles/brands/${getBrandSlug(user.vehicle_brand)}.png" alt="${safeBrand}" class="w-8 h-8 object-contain" onerror="this.src='/vehicles/brands/default.png'" />
          </div>
          <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm text-yellow-400 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-bold border border-yellow-400/30">
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

            const popup = new maplibregl.Popup({
                offset: 30,
                closeButton: false,
                className: 'custom-popup',
            }).setHTML(`
        <div class="p-4 min-w-[180px] bg-gradient-to-br from-yellow-400/10 to-amber-500/10 backdrop-blur-xl border border-yellow-400/30 rounded-2xl">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center overflow-hidden">
              <img src="/vehicles/brands/${getBrandSlug(user.vehicle_brand)}.png" alt="${safeBrand}" class="w-6 h-6 object-contain" onerror="this.src='/vehicles/brands/default.png'" />
            </div>
            <div>
              <p class="font-bold text-white text-sm">${safeNickname}</p>
            </div>
          </div>
          ${safeBrand && safeModel ? `
            <div class="text-sm text-yellow-400 font-medium">
              ${safeBrand} ${safeModel}
            </div>
          ` : ''}
          ${user.status_message ? `
            <div class="mt-2 p-2 bg-black/50 rounded-lg">
              <p class="text-xs text-white">💬 ${escapeHtml(user.status_message)}</p>
            </div>
          ` : ''}
          <div class="text-[10px] text-yellow-400/60 mt-2 flex items-center gap-1">
            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
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
                expires_at: '',
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

            {/* Map Style Switcher */}
            <div className="absolute top-4 right-4 z-10">
                <div className="bg-black/90 backdrop-blur-xl rounded-xl p-1 border border-yellow-400/30 shadow-lg">
                    <button
                        onClick={() => setMapStyle('dark')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            mapStyle === 'dark'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        2D
                    </button>
                    <button
                        onClick={() => setMapStyle('3d')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            mapStyle === '3d'
                                ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        3D
                    </button>
                </div>
            </div>

            {/* Map overlay for loading */}
            {!mapLoaded && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-yellow-400 font-medium">Harita yükleniyor...</p>
                    </div>
                </div>
            )}

            {/* Custom styles for popup */}
            <style jsx global>{`
        .maplibregl-popup-content {
          border-radius: 16px;
          padding: 0;
          background: transparent !important;
        }

        .maplibregl-popup-tip {
          display: none;
        }

        .marker-container {
          cursor: pointer;
        }

        .maplibregl-ctrl-group {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(250, 204, 21, 0.3) !important;
          border-radius: 12px !important;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 20px rgba(250, 204, 21, 0.2);
        }

        .maplibregl-ctrl-group button {
          background-color: transparent !important;
          border: none !important;
        }

        .maplibregl-ctrl-group button:hover {
          background-color: rgba(250, 204, 21, 0.1) !important;
        }

        .maplibregl-ctrl-group button span {
          filter: invert(1) sepia(1) saturate(5) hue-rotate(5deg);
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
        </div>
    )
}

// Helper function to escape HTML
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
}

// Helper function to get brand slug from brand name
function getBrandSlug(brand?: string): string {
    if (!brand) return 'default'

    const brandMap: Record<string, string> = {
        'mercedes': 'mercedes-benz',
        'mercedes-benz': 'mercedes-benz',
        'bmw': 'bmw',
        'audi': 'audi',
        'audi-sport': 'audi-sport',
        'porsche': 'porsche',
        'ferrari': 'ferrari',
        'lamborghini': 'lamborghini',
        'maserati': 'maserati',
        'toyota': 'toyota',
        'honda': 'honda',
        'nissan': 'nissan',
        'nissan-gt-r': 'nissan-gt-r',
        'mazda': 'mazda',
        'subaru': 'subaru',
        'mitsubishi': 'mitsubishi',
        'ford': 'ford',
        'ford-mustang': 'ford-mustang',
        'chevrolet': 'chevrolet',
        'chevrolet-corvette': 'chevrolet-corvette',
        'dodge': 'dodge',
        'dodge-viper': 'dodge-viper',
        'jeep': 'jeep',
        'tesla': 'tesla',
        'volkswagen': 'volkswagen',
        'volvo': 'volvo',
        'kia': 'kia',
        'hyundai': 'hyundai',
        'lexus': 'lexus',
        'infiniti': 'infiniti',
        'acura': 'acura',
        'alfa-romeo': 'alfa-romeo',
        'aston-martin': 'aston-martin',
        'bentley': 'bentley',
        'bugatti': 'bugatti',
        'cadillac': 'cadillac',
        'chery': 'chery',
        'chrysler': 'chrysler',
        'citroen': 'citroen',
        'cupra': 'cupra',
        'dacia': 'dacia',
        'daewoo': 'daewoo',
        'daf': 'daf',
        'daihatsu': 'daihatsu',
        'ds': 'ds',
        'fiat': 'fiat',
        'gmc': 'gmc',
        'hummer': 'hummer',
        'hupmobile': 'hupmobile',
        'isuzu': 'isuzu',
        'iveco': 'iveco',
        'jaguar': 'jaguar',
        'jawa': 'jawa',
        'ktm': 'ktm',
        'lada': 'lada',
        'lagonda': 'lagonda',
        'lancia': 'lancia',
        'land-rover': 'land-rover',
        'lincoln': 'lincoln',
        'lotus': 'lotus',
        'lynk-and-co': 'lynk-and-co',
        'man': 'man',
        'maybach': 'maybach',
        'mclaren': 'mclaren',
        'mercedes-amg': 'mercedes-amg',
        'mg': 'mg',
        'mini': 'mini',
        'opel': 'opel',
        'pagani': 'pagani',
        'peugeot': 'peugeot',
        'pontiac': 'pontiac',
        'proton': 'proton',
        'renault': 'renault',
        'rolls-royce': 'rolls-royce',
        'rover': 'rover',
        'saab': 'saab',
        'scania': 'scania',
        'seat': 'seat',
        'skoda': 'skoda',
        'smart': 'smart',
        'ssangyong': 'ssangyong',
        'suzuki': 'suzuki',
        'tata': 'tata',
    }

    const brandLower = brand.toLowerCase().trim()
    return brandMap[brandLower] || brandLower.replace(/\s+/g, '-')
}
