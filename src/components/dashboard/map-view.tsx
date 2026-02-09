'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { VisibleUser } from '@/lib/services/location-service'
import { getBrandSlug } from '@/lib/utils/brand-slug'
import { escapeHtml, buildCurrentUserMarkerHtml, buildOtherUserMarkerHtml } from '@/lib/utils/marker-helpers'

interface MapViewProps {
    userLocation: { lat: number; lon: number } | null
    visibleUsers: VisibleUser[]
    isSignalActive: boolean
    userVehicleBrand?: string
    userAvatarUrl?: string
    userNickname?: string
    userStatusMessage?: string
}

type MapStyle = 'light' | 'dark' | '3d-light' | '3d-dark'
type MapViewMode = '2d' | '3d'

// Map style configurations with Google Maps-like appearance
const MAP_STYLES = {
    light: {
        style: {
            version: 8,
            sources: {
                'osm-light': {
                    type: 'raster',
                    tiles: [
                        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    ],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap contributors',
                },
            },
            layers: [
                {
                    id: 'osm-tiles',
                    type: 'raster',
                    source: 'osm-light',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
        pitch: 0,
        bearing: 0,
    },
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
                    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
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
    '3d-light': {
        style: {
            version: 8,
            sources: {
                'osm-light': {
                    type: 'raster',
                    tiles: [
                        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
                        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    ],
                    tileSize: 256,
                    attribution: '&copy; OpenStreetMap contributors',
                },
            },
            layers: [
                {
                    id: 'osm-tiles',
                    type: 'raster',
                    source: 'osm-light',
                    minzoom: 0,
                    maxzoom: 19,
                },
            ],
        },
        pitch: 60,
        bearing: 0,
    },
    '3d-dark': {
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
                    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
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

export default function MapView({ userLocation, visibleUsers, isSignalActive, userVehicleBrand, userAvatarUrl, userNickname, userStatusMessage }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const markers = useRef<maplibregl.Marker[]>([])
    const userMarker = useRef<maplibregl.Marker | null>(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('light')
    const [viewMode, setViewMode] = useState<MapViewMode>('2d')
    // MapLibre kontrollerinin toplam yüksekliğini takip et - sabit değer kullan
    const ctrlBottomOffset = 200

    // Get current style config
    const getCurrentStyle = useCallback(() => {
        const styleKey = viewMode === '3d' ? `3d-${mapTheme}` as MapStyle : mapTheme
        return MAP_STYLES[styleKey]
    }, [mapTheme, viewMode])

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return

        const center: [number, number] = userLocation
            ? [userLocation.lon, userLocation.lat]
            : [28.9784, 41.0082]

        const currentStyle = getCurrentStyle()

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: currentStyle.style as any,
            center,
            zoom: 13,
            pitch: currentStyle.pitch,
            bearing: currentStyle.bearing,
            attributionControl: false,
        })

        // Add zoom controls
        map.current.addControl(new maplibregl.NavigationControl({
            showCompass: true,
            showZoom: true,
            visualizePitch: true,
        }), 'top-right')

        // Add fullscreen control
        map.current.addControl(new maplibregl.FullscreenControl(), 'top-right')

        // Add geolocation control
        map.current.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
            }),
            'top-right'
        )

        // Add scale control
        map.current.addControl(new maplibregl.ScaleControl({
            maxWidth: 100,
            unit: 'metric'
        }), 'bottom-left')

        map.current.on('load', () => {
            setMapLoaded(true)
        })

        map.current.on('styledata', () => {
            // Re-apply custom styles after style change
            const styleElement = document.createElement('style')
            styleElement.textContent = `
                .maplibregl-ctrl-group {
                    background: ${mapTheme === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)'} !important;
                    border: 1px solid ${mapTheme === 'dark' ? 'rgba(250, 204, 21, 0.3)' : 'rgba(0, 0, 0, 0.1)'} !important;
                    border-radius: 12px !important;
                    backdrop-filter: blur(12px);
                    box-shadow: 0 4px 20px ${mapTheme === 'dark' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
                }
                .maplibregl-ctrl-group button {
                    background-color: transparent !important;
                    border: none !important;
                    color: ${mapTheme === 'dark' ? '#fff' : '#000'} !important;
                }
                .maplibregl-ctrl-group button:hover {
                    background-color: ${mapTheme === 'dark' ? 'rgba(250, 204, 21, 0.2)' : 'rgba(0, 0, 0, 0.05)'} !important;
                }
            `
            document.head.appendChild(styleElement)
        })

        return () => {
            map.current?.remove()
            map.current = null
        }
    }, [])

    // Update map style when theme or view mode changes
    useEffect(() => {
        if (!map.current || !mapLoaded) return

        const currentStyle = getCurrentStyle()
        map.current.setStyle(currentStyle.style as any)
        map.current.setPitch(currentStyle.pitch)
        map.current.setBearing(currentStyle.bearing)
    }, [mapTheme, viewMode, mapLoaded, getCurrentStyle])

    // Update center when user location changes
    useEffect(() => {
        if (!map.current || !userLocation || !mapLoaded) return

        map.current.flyTo({
            center: [userLocation.lon, userLocation.lat],
            zoom: 14,
            pitch: getCurrentStyle().pitch,
            bearing: getCurrentStyle().bearing,
            duration: 1500,
        })
    }, [userLocation, mapLoaded, getCurrentStyle])

    // Marker elementi oluştur
    const createMarkerElement = useCallback((user: VisibleUser, isCurrentUser: boolean) => {
        const el = document.createElement('div')
        el.className = 'marker-container'

        if (isCurrentUser) {
            el.innerHTML = buildCurrentUserMarkerHtml({
                vehicleBrand: userVehicleBrand,
                avatarUrl: userAvatarUrl,
                nickname: userNickname,
                statusMessage: userStatusMessage,
            })
        } else {
            const safeBrand = user.vehicle_brand ? escapeHtml(user.vehicle_brand) : ''
            const safeModel = user.vehicle_model ? escapeHtml(user.vehicle_model) : ''
            const safeNickname = escapeHtml(user.nickname || 'Sürücü')
            const safeStatusMessage = user.status_message ? escapeHtml(user.status_message) : ''

            el.innerHTML = buildOtherUserMarkerHtml({
                nickname: user.nickname,
                vehicleBrand: user.vehicle_brand,
                vehicleModel: user.vehicle_model,
                statusMessage: user.status_message,
            })

            ;(el as any).dataset.safeBrand = safeBrand
            ;(el as any).dataset.safeModel = safeModel
            ;(el as any).dataset.safeNickname = safeNickname
            ;(el as any).dataset.safeStatusMessage = safeStatusMessage
        }

        return el
    }, [mapTheme, userVehicleBrand, userAvatarUrl, userNickname, userStatusMessage])

    // Update user markers
    useEffect(() => {
        if (!map.current || !mapLoaded) return

        markers.current.forEach(marker => marker.remove())
        markers.current = []

        visibleUsers.forEach(user => {
            if (!user.lat || !user.lon) return

            const el = createMarkerElement(user, false)
            const safeBrand = (el as any).dataset.safeBrand || ''
            const safeModel = (el as any).dataset.safeModel || ''
            const safeNickname = (el as any).dataset.safeNickname || 'Sürücü'
            const brandSlug = getBrandSlug(user.vehicle_brand)

            const popup = new maplibregl.Popup({
                offset: 35,
                closeButton: true,
                className: 'custom-popup',
                closeOnClick: false,
            }).setHTML(`
        <div class="p-4 min-w-[200px] ${mapTheme === 'dark' ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-xl border ${mapTheme === 'dark' ? 'border-yellow-400/30' : 'border-gray-200'} rounded-2xl shadow-xl">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center overflow-hidden shadow-lg">
              <img src="/vehicles/brands/${brandSlug}.png" alt="${safeBrand}" class="w-7 h-7 object-contain" onerror="this.style.display='none'">
            </div>
            <div>
              <p class="font-bold ${mapTheme === 'dark' ? 'text-white' : 'text-gray-900'} text-sm">${safeNickname}</p>
            </div>
          </div>
          ${safeBrand && safeModel ? `
            <div class="text-sm ${mapTheme === 'dark' ? 'text-yellow-400' : 'text-amber-600'} font-medium mb-2">
              ${safeBrand} ${safeModel}
            </div>
          ` : ''}
          ${user.status_message ? `
            <div class="mb-2 p-2 ${mapTheme === 'dark' ? 'bg-black/50' : 'bg-gray-100'} rounded-lg">
              <p class="text-xs ${mapTheme === 'dark' ? 'text-white' : 'text-gray-900'}">💬 ${escapeHtml(user.status_message)}</p>
            </div>
          ` : ''}
          <div class="text-[10px] ${mapTheme === 'dark' ? 'text-green-400' : 'text-green-600'} flex items-center gap-1">
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
    }, [visibleUsers, mapLoaded, mapTheme, createMarkerElement])

    // Mevcut kullanıcı marker'ını güncelle
    useEffect(() => {
        if (!map.current || !mapLoaded || !userLocation || !isSignalActive) {
            if (userMarker.current) {
                userMarker.current.remove()
                userMarker.current = null
            }
            return
        }

        // Marker'ı her zaman yeniden oluştur (props değişebilir)
        if (userMarker.current) {
            userMarker.current.remove()
            userMarker.current = null
        }

        const el = createMarkerElement({
            user_id: 'current',
            lat: userLocation.lat,
            lon: userLocation.lon,
            nickname: userNickname || 'Sen',
            expires_at: '',
        }, true)

        userMarker.current = new maplibregl.Marker({ element: el })
            .setLngLat([userLocation.lon, userLocation.lat])
            .addTo(map.current!)

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

            {/* Özel Kontroller - MapLibre kontrollerinin altında, en az 8px boşlukla */}
            <div className="absolute right-[10px] z-10" style={{ top: `${ctrlBottomOffset}px` }}>
                <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-2 border border-yellow-400/20 shadow-xl flex gap-2">
                    {/* Tema Değiştirme */}
                    <button
                        onClick={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-yellow-400/20 group relative"
                        title={mapTheme === 'dark' ? 'Açık Mod' : 'Koyu Mod'}
                    >
                        {mapTheme === 'dark' ? (
                            <span className="text-2xl">🌙</span>
                        ) : (
                            <span className="text-2xl">☀️</span>
                        )}
                    </button>

                    {/* 2D/3D Geçişi */}
                    <button
                        onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
                        className="px-4 h-12 rounded-xl flex items-center justify-center transition-all font-bold text-sm bg-gradient-to-r from-yellow-400/80 to-amber-500/80 text-black hover:from-yellow-400 hover:to-amber-500"
                    >
                        {viewMode === '2d' ? '2D' : '3D'}
                    </button>
                </div>
            </div>

            {/* Trafik Göstergesi - Sol üst, diğer kontrollerle çakışmaz */}
            <div className="absolute top-[10px] left-[10px] z-10 bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-yellow-400/20 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-white text-sm font-medium">Trafik</span>
                    </div>
                    <div className="h-4 w-px bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-green-400">●</span>
                        <span className="text-xs text-white/60">Hafif</span>
                    </div>
                </div>
            </div>

            {/* Map overlay for loading */}
            {!mapLoaded && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-yellow-400 font-medium">Harita yükleniyor...</p>
                    </div>
                </div>
            )}

            {/* Custom styles */}
            <style jsx global>{`
        .maplibregl-popup-content {
          border-radius: 16px;
          padding: 0;
          background: transparent !important;
          font-family: inherit;
        }
        .maplibregl-popup-tip {
          display: none;
        }
        .marker-container {
          cursor: pointer;
        }
        .maplibregl-ctrl-top-right {
          top: 10px !important;
          right: 10px !important;
        }
        .maplibregl-ctrl-top-right .maplibregl-ctrl {
          margin: 0 0 8px 0 !important;
        }
      `}</style>
        </div>
    )
}

// getBrandSlug ve marker yardımcıları @/lib/utils/ modüllerinden import ediliyor
