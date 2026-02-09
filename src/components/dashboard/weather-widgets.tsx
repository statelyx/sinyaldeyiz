'use client'

import { useState, useEffect } from 'react'
import { getWeatherData, getCabrioLabel, getAsphaltColor, type WeatherData } from '@/lib/services/weather-service'

interface WeatherWidgetsProps {
    location: { lat: number; lon: number } | null
}

export function WeatherWidgets({ location }: WeatherWidgetsProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchWeather() {
            if (!location) {
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError(false)
                const data = await getWeatherData(location.lat, location.lon)
                setWeather(data)
            } catch (err) {
                console.error('Error fetching weather:', err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchWeather()

        // Refresh weather every 10 minutes
        const interval = setInterval(fetchWeather, 10 * 60 * 1000)
        return () => clearInterval(interval)
    }, [location])

    if (loading) {
        return (
            <div className="flex items-center gap-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-20 h-8 bg-white/5 rounded-lg animate-pulse" />
                ))}
            </div>
        )
    }

    if (!location) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 text-white/40 text-xs">
                <span>📍</span> Konum bekleniyor...
            </div>
        )
    }

    if (error || !weather) {
        return (
            <div className="flex items-center gap-1.5 px-2 py-1 text-white/40 text-xs">
                <span>⚠️</span> Hava durumu yüklenemedi
            </div>
        )
    }

    const cabrioInfo = getCabrioLabel(weather.cabrioIndex)
    const asphaltColorClass = getAsphaltColor(weather.asphaltCondition)

    return (
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
            {/* Sıcaklık */}
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                <span className="text-base">{weather.weatherIcon}</span>
                <span className="text-sm font-bold text-white">{weather.temperature}°</span>
                <span className="text-[10px] text-white/50">{weather.weatherCondition}</span>
            </div>

            {/* Asfalt */}
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                <span className="text-base">🛣️</span>
                <span className={`text-xs font-bold ${asphaltColorClass}`}>{weather.asphaltCondition}</span>
            </div>

            {/* Cabrio */}
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                <span className="text-base">{cabrioInfo.emoji}</span>
                <span className={`text-sm font-bold ${cabrioInfo.color}`}>{weather.cabrioIndex}</span>
                <span className="text-[10px] text-white/40">/100</span>
            </div>

            {/* Rüzgar */}
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5 hidden sm:inline-flex">
                <span className="text-base">💨</span>
                <span className="text-xs font-bold text-white">{weather.windSpeed} km/s</span>
            </div>

            {/* Nem */}
            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5 hidden sm:inline-flex">
                <span className="text-base">💧</span>
                <span className="text-xs font-bold text-white">{weather.humidity}%</span>
            </div>

            {/* Yağış uyarısı */}
            {weather.isRaining && (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-base">🌧️</span>
                    <span className="text-xs font-bold text-blue-400">Yağış</span>
                </div>
            )}
        </div>
    )
}
