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
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex-shrink-0 w-24 h-20 bg-slate-700/50 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (!location) {
        return (
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">📍 Hava durumu için konum gerekli</p>
            </div>
        )
    }

    if (error || !weather) {
        return (
            <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-sm">⚠️ Hava durumu yüklenemedi</p>
            </div>
        )
    }

    const cabrioInfo = getCabrioLabel(weather.cabrioIndex)
    const asphaltColorClass = getAsphaltColor(weather.asphaltCondition)

    return (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Temperature Widget */}
            <div className="flex-shrink-0 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur rounded-xl p-4 min-w-[100px] border border-slate-600/50">
                <div className="text-3xl mb-1">{weather.weatherIcon}</div>
                <div className="text-2xl font-bold text-white">{weather.temperature}°</div>
                <div className="text-xs text-slate-400 mt-1 truncate">{weather.weatherCondition}</div>
            </div>

            {/* Asphalt Condition Widget */}
            <div className="flex-shrink-0 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur rounded-xl p-4 min-w-[100px] border border-slate-600/50">
                <div className="text-2xl mb-1">🛣️</div>
                <div className={`text-sm font-bold px-2 py-0.5 rounded-full inline-block ${asphaltColorClass}`}>
                    {weather.asphaltCondition}
                </div>
                <div className="text-xs text-slate-400 mt-1">Asfalt</div>
            </div>

            {/* Cabrio Index Widget */}
            <div className="flex-shrink-0 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur rounded-xl p-4 min-w-[100px] border border-slate-600/50">
                <div className="text-2xl mb-1">{cabrioInfo.emoji}</div>
                <div className="flex items-baseline gap-1">
                    <span className={`text-2xl font-bold ${cabrioInfo.color}`}>{weather.cabrioIndex}</span>
                    <span className="text-xs text-slate-500">/100</span>
                </div>
                <div className="text-xs text-slate-400 mt-1">Cabrio İndeks</div>
            </div>

            {/* Wind Widget */}
            <div className="flex-shrink-0 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur rounded-xl p-4 min-w-[100px] border border-slate-600/50">
                <div className="text-2xl mb-1">💨</div>
                <div className="text-lg font-bold text-white">{weather.windSpeed} <span className="text-sm text-slate-400">km/s</span></div>
                <div className="text-xs text-slate-400 mt-1">Rüzgar</div>
            </div>

            {/* Humidity Widget */}
            <div className="flex-shrink-0 bg-gradient-to-br from-slate-700/80 to-slate-800/80 backdrop-blur rounded-xl p-4 min-w-[100px] border border-slate-600/50">
                <div className="text-2xl mb-1">💧</div>
                <div className="text-lg font-bold text-white">{weather.humidity}<span className="text-sm text-slate-400">%</span></div>
                <div className="text-xs text-slate-400 mt-1">Nem</div>
            </div>

            {/* Rain Warning (if applicable) */}
            {weather.isRaining && (
                <div className="flex-shrink-0 bg-gradient-to-br from-blue-600/30 to-blue-800/30 backdrop-blur rounded-xl p-4 min-w-[100px] border border-blue-500/50">
                    <div className="text-2xl mb-1">🌧️</div>
                    <div className="text-sm font-bold text-blue-400">Yağış Var</div>
                    <div className="text-xs text-blue-300 mt-1">Dikkatli sür</div>
                </div>
            )}
        </div>
    )
}
