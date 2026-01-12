'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CurrentWeather {
    temperature: number
    weatherCode: number
    weatherCondition: string
    weatherIcon: string
    windSpeed: number
    windDirection: number
    humidity: number
    precipitation: number
    pressure: number
    visibility: number
    uvIndex: number
    isRaining: boolean
    asphaltCondition: 'İdeal' | 'Normal' | 'Kaygan' | 'Tehlikeli'
    cabrioIndex: number
}

interface DailyForecast {
    date: string
    dayName: string
    weatherCode: number
    weatherIcon: string
    weatherCondition: string
    tempMax: number
    tempMin: number
    precipitationSum: number
    windSpeedMax: number
    uvIndexMax: number
    sunrise: string
    sunset: string
}

interface HourlyForecast {
    time: string
    hour: string
    temperature: number
    weatherCode: number
    weatherIcon: string
    precipitation: number
    windSpeed: number
}

// Weather codes from Open-Meteo
const WEATHER_CONDITIONS: Record<number, { condition: string; icon: string }> = {
    0: { condition: 'Açık', icon: '☀️' },
    1: { condition: 'Çoğunlukla Açık', icon: '🌤️' },
    2: { condition: 'Parçalı Bulutlu', icon: '⛅' },
    3: { condition: 'Bulutlu', icon: '☁️' },
    45: { condition: 'Sisli', icon: '🌫️' },
    48: { condition: 'Puslu', icon: '🌫️' },
    51: { condition: 'Hafif Çisenti', icon: '🌧️' },
    53: { condition: 'Çisenti', icon: '🌧️' },
    55: { condition: 'Yoğun Çisenti', icon: '🌧️' },
    56: { condition: 'Buzlu Çisenti', icon: '🌨️' },
    57: { condition: 'Yoğun Buzlu Çisenti', icon: '🌨️' },
    61: { condition: 'Hafif Yağmur', icon: '🌦️' },
    63: { condition: 'Yağmurlu', icon: '🌧️' },
    65: { condition: 'Yoğun Yağmur', icon: '🌧️' },
    66: { condition: 'Buzlu Yağmur', icon: '🌨️' },
    67: { condition: 'Yoğun Buzlu Yağmur', icon: '🌨️' },
    71: { condition: 'Hafif Kar', icon: '🌨️' },
    73: { condition: 'Kar Yağışlı', icon: '❄️' },
    75: { condition: 'Yoğun Kar', icon: '❄️' },
    77: { condition: 'Kar Taneleri', icon: '❄️' },
    80: { condition: 'Sağanak', icon: '🌧️' },
    81: { condition: 'Yoğun Sağanak', icon: '🌧️' },
    82: { condition: 'Şiddetli Sağanak', icon: '⛈️' },
    85: { condition: 'Kar Sağanağı', icon: '🌨️' },
    86: { condition: 'Yoğun Kar Sağanağı', icon: '🌨️' },
    95: { condition: 'Gök Gürültülü Fırtına', icon: '⛈️' },
    96: { condition: 'Dolu ile Fırtına', icon: '⛈️' },
    99: { condition: 'Şiddetli Dolu Fırtınası', icon: '⛈️' },
}

const WIND_DIRECTIONS = ['K', 'KKD', 'KD', 'DKD', 'D', 'DGD', 'GD', 'GGD', 'G', 'GGB', 'GB', 'BGB', 'B', 'BKB', 'KB', 'KKB']

function getWindDirection(degrees: number): string {
    const index = Math.round(degrees / 22.5) % 16
    return WIND_DIRECTIONS[index]
}

function getWeatherInfo(code: number) {
    return WEATHER_CONDITIONS[code] || { condition: 'Bilinmiyor', icon: '❓' }
}

function getDayName(dateStr: string): string {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    const date = new Date(dateStr)
    return days[date.getDay()]
}

function formatTime(timeStr: string): string {
    return new Date(timeStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function getAsphaltCondition(temperature: number, precipitation: number, weatherCode: number): 'İdeal' | 'Normal' | 'Kaygan' | 'Tehlikeli' {
    if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(weatherCode)) return 'Tehlikeli'
    if ([65, 82, 95, 96, 99].includes(weatherCode)) return 'Kaygan'
    if (precipitation > 0) return 'Kaygan'
    if ([45, 48].includes(weatherCode)) return 'Normal'
    if (temperature < 4) return 'Kaygan'
    if (temperature >= 15 && temperature <= 30 && precipitation === 0) return 'İdeal'
    return 'Normal'
}

function getCabrioIndex(temperature: number, windSpeed: number, precipitation: number, weatherCode: number): number {
    let score = 100
    if (temperature < 10) score -= 50
    else if (temperature < 15) score -= 30
    else if (temperature < 18) score -= 15
    else if (temperature > 35) score -= 30
    else if (temperature > 30) score -= 10
    if (windSpeed > 50) score -= 40
    else if (windSpeed > 35) score -= 25
    else if (windSpeed > 25) score -= 15
    else if (windSpeed > 15) score -= 5
    if (precipitation > 0) score -= 50
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) score -= 30
    else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) score -= 50
    else if ([95, 96, 99].includes(weatherCode)) score -= 60
    else if ([45, 48].includes(weatherCode)) score -= 20
    else if ([0, 1].includes(weatherCode)) score += 10
    return Math.max(0, Math.min(100, score))
}

function getAsphaltColor(condition: string): string {
    switch (condition) {
        case 'İdeal': return 'text-green-400 bg-green-400/10 border-green-400/30'
        case 'Normal': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
        case 'Kaygan': return 'text-orange-400 bg-orange-400/10 border-orange-400/30'
        case 'Tehlikeli': return 'text-red-400 bg-red-400/10 border-red-400/30'
        default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30'
    }
}

function getRidingAdvice(current: CurrentWeather): { title: string; advice: string; icon: string; color: string }[] {
    const advices = []

    // Helmet visor advice
    if (current.isRaining || current.precipitation > 0) {
        advices.push({ title: 'Kask Vizörü', advice: 'Yağmur damlacıkları için anti-fog sprey kullanın', icon: '🪖', color: 'text-blue-400' })
    } else if (current.uvIndex > 5) {
        advices.push({ title: 'Kask Vizörü', advice: 'Güneş vizörü veya koyu vizör önerilir', icon: '😎', color: 'text-yellow-400' })
    } else {
        advices.push({ title: 'Kask Vizörü', advice: 'Şeffaf vizör uygun', icon: '🪖', color: 'text-green-400' })
    }

    // Gear advice
    if (current.temperature < 10) {
        advices.push({ title: 'Kıyafet', advice: 'Termal içlik ve rüzgar geçirmez mont şart', icon: '🧥', color: 'text-blue-400' })
    } else if (current.temperature < 20) {
        advices.push({ title: 'Kıyafet', advice: 'Hafif ceket ve eldiven önerilir', icon: '🧤', color: 'text-cyan-400' })
    } else if (current.temperature > 30) {
        advices.push({ title: 'Kıyafet', advice: 'Havalandırmalı ceket, bol su için', icon: '💧', color: 'text-orange-400' })
    } else {
        advices.push({ title: 'Kıyafet', advice: 'Standart sürüş ekipmanı uygun', icon: '✅', color: 'text-green-400' })
    }

    // Road condition
    if (current.asphaltCondition === 'Tehlikeli') {
        advices.push({ title: 'Yol Durumu', advice: 'Sürüş önerilmez! Kaygan zemin riski yüksek', icon: '⚠️', color: 'text-red-400' })
    } else if (current.asphaltCondition === 'Kaygan') {
        advices.push({ title: 'Yol Durumu', advice: 'Dikkatli sürün, ani fren ve manevra yapmayın', icon: '⚡', color: 'text-orange-400' })
    } else if (current.asphaltCondition === 'Normal') {
        advices.push({ title: 'Yol Durumu', advice: 'Normal dikkat seviyesi yeterli', icon: '👍', color: 'text-blue-400' })
    } else {
        advices.push({ title: 'Yol Durumu', advice: 'Mükemmel sürüş koşulları!', icon: '🏍️', color: 'text-green-400' })
    }

    // Wind advice
    if (current.windSpeed > 40) {
        advices.push({ title: 'Rüzgar', advice: 'Çok güçlü rüzgar! Köprü ve açık alanlarda dikkat', icon: '💨', color: 'text-red-400' })
    } else if (current.windSpeed > 25) {
        advices.push({ title: 'Rüzgar', advice: 'Yan rüzgara dikkat, gövde pozisyonunu ayarlayın', icon: '🌬️', color: 'text-orange-400' })
    }

    return advices
}

export default function WeatherPage() {
    const [current, setCurrent] = useState<CurrentWeather | null>(null)
    const [daily, setDaily] = useState<DailyForecast[]>([])
    const [hourly, setHourly] = useState<HourlyForecast[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
    const [activeTab, setActiveTab] = useState<'daily' | 'hourly'>('daily')

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setLocation({ lat: latitude, lon: longitude, name: 'Konumunuz' })
                    fetchWeatherData(latitude, longitude)
                },
                () => {
                    // Default to Istanbul
                    setLocation({ lat: 41.0082, lon: 28.9784, name: 'İstanbul' })
                    fetchWeatherData(41.0082, 28.9784)
                }
            )
        } else {
            setLocation({ lat: 41.0082, lon: 28.9784, name: 'İstanbul' })
            fetchWeatherData(41.0082, 28.9784)
        }
    }, [])

    const fetchWeatherData = async (lat: number, lon: number) => {
        setLoading(true)
        setError(null)

        try {
            // Fetch comprehensive weather data
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility&hourly=temperature_2m,weather_code,precipitation,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=7`

            const response = await fetch(url)
            if (!response.ok) throw new Error('Hava durumu verisi alınamadı')

            const data = await response.json()

            // Process current weather
            const currentData = data.current
            const weatherInfo = getWeatherInfo(currentData.weather_code)
            const asphaltCondition = getAsphaltCondition(currentData.temperature_2m, currentData.precipitation, currentData.weather_code)
            const cabrioIndex = getCabrioIndex(currentData.temperature_2m, currentData.wind_speed_10m, currentData.precipitation, currentData.weather_code)

            setCurrent({
                temperature: Math.round(currentData.temperature_2m),
                weatherCode: currentData.weather_code,
                weatherCondition: weatherInfo.condition,
                weatherIcon: weatherInfo.icon,
                windSpeed: Math.round(currentData.wind_speed_10m),
                windDirection: currentData.wind_direction_10m,
                humidity: Math.round(currentData.relative_humidity_2m),
                precipitation: currentData.precipitation,
                pressure: Math.round(currentData.surface_pressure),
                visibility: Math.round((currentData.visibility || 10000) / 1000),
                uvIndex: data.daily?.uv_index_max?.[0] || 0,
                isRaining: currentData.precipitation > 0,
                asphaltCondition,
                cabrioIndex,
            })

            // Process daily forecast
            const dailyData = data.daily
            const dailyForecasts: DailyForecast[] = dailyData.time.map((date: string, i: number) => {
                const info = getWeatherInfo(dailyData.weather_code[i])
                return {
                    date,
                    dayName: getDayName(date),
                    weatherCode: dailyData.weather_code[i],
                    weatherIcon: info.icon,
                    weatherCondition: info.condition,
                    tempMax: Math.round(dailyData.temperature_2m_max[i]),
                    tempMin: Math.round(dailyData.temperature_2m_min[i]),
                    precipitationSum: dailyData.precipitation_sum[i],
                    windSpeedMax: Math.round(dailyData.wind_speed_10m_max[i]),
                    uvIndexMax: dailyData.uv_index_max[i],
                    sunrise: formatTime(dailyData.sunrise[i]),
                    sunset: formatTime(dailyData.sunset[i]),
                }
            })
            setDaily(dailyForecasts)

            // Process hourly forecast (next 24 hours)
            const hourlyData = data.hourly
            const now = new Date()
            const currentHour = now.getHours()
            const hourlyForecasts: HourlyForecast[] = []

            for (let i = 0; i < 24; i++) {
                const index = currentHour + i
                if (index >= hourlyData.time.length) break

                const info = getWeatherInfo(hourlyData.weather_code[index])
                hourlyForecasts.push({
                    time: hourlyData.time[index],
                    hour: new Date(hourlyData.time[index]).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    temperature: Math.round(hourlyData.temperature_2m[index]),
                    weatherCode: hourlyData.weather_code[index],
                    weatherIcon: info.icon,
                    precipitation: hourlyData.precipitation[index],
                    windSpeed: Math.round(hourlyData.wind_speed_10m[index]),
                })
            }
            setHourly(hourlyForecasts)

        } catch (err) {
            console.error('Weather fetch error:', err)
            setError('Hava durumu verisi alınamadı. Lütfen daha sonra tekrar deneyin.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl animate-pulse mb-4">🌤️</div>
                    <p className="text-slate-400">Hava durumu yükleniyor...</p>
                </div>
            </div>
        )
    }

    if (error || !current) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-red-400">{error || 'Bir hata oluştu'}</p>
                    <button
                        onClick={() => location && fetchWeatherData(location.lat, location.lon)}
                        className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        )
    }

    const ridingAdvices = getRidingAdvice(current)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 pb-24">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Hava Durumu</h1>
                        <p className="text-slate-400 text-sm">📍 {location?.name}</p>
                    </div>
                    <Link href="/dashboard" className="text-slate-400 hover:text-white">
                        ← Geri
                    </Link>
                </div>

                {/* Current Weather Card */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-7xl mb-2">{current.weatherIcon}</div>
                            <div className="text-5xl font-bold text-white">{current.temperature}°C</div>
                            <div className="text-slate-400 mt-1">{current.weatherCondition}</div>
                        </div>
                        <div className="text-right space-y-2">
                            <div className="flex items-center justify-end gap-2 text-slate-300">
                                <span>💧</span>
                                <span>Nem: {current.humidity}%</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-slate-300">
                                <span>💨</span>
                                <span>{current.windSpeed} km/s {getWindDirection(current.windDirection)}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-slate-300">
                                <span>🌡️</span>
                                <span>Basınç: {current.pressure} hPa</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-slate-300">
                                <span>👁️</span>
                                <span>Görüş: {current.visibility} km</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 text-slate-300">
                                <span>☀️</span>
                                <span>UV İndeksi: {current.uvIndex}</span>
                            </div>
                        </div>
                    </div>

                    {/* Asphalt & Cabrio Index */}
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className={`rounded-xl p-4 border ${getAsphaltColor(current.asphaltCondition)}`}>
                            <div className="text-sm opacity-80">Asfalt Durumu</div>
                            <div className="text-2xl font-bold">{current.asphaltCondition}</div>
                        </div>
                        <div className="rounded-xl p-4 border border-orange-400/30 bg-orange-400/10 text-orange-400">
                            <div className="text-sm opacity-80">Sürüş İndeksi</div>
                            <div className="text-2xl font-bold">{current.cabrioIndex}/100</div>
                        </div>
                    </div>
                </div>

                {/* Motorcyclist Tips */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>🏍️</span> Motorsiklet Sürücüsü Tavsiyeleri
                    </h2>
                    <div className="grid gap-3">
                        {ridingAdvices.map((advice, index) => (
                            <div key={index} className="flex items-start gap-3 bg-slate-700/50 rounded-xl p-3">
                                <span className="text-2xl">{advice.icon}</span>
                                <div>
                                    <div className={`font-medium ${advice.color}`}>{advice.title}</div>
                                    <div className="text-slate-400 text-sm">{advice.advice}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Forecast Tabs */}
                <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
                    <button
                        onClick={() => setActiveTab('daily')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${activeTab === 'daily' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        7 Günlük Tahmin
                    </button>
                    <button
                        onClick={() => setActiveTab('hourly')}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${activeTab === 'hourly' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        24 Saat
                    </button>
                </div>

                {/* Daily Forecast */}
                {activeTab === 'daily' && (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                        {daily.map((day, index) => (
                            <div
                                key={day.date}
                                className={`flex items-center justify-between p-4 ${index !== daily.length - 1 ? 'border-b border-slate-700' : ''}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">{day.weatherIcon}</span>
                                    <div>
                                        <div className="text-white font-medium">
                                            {index === 0 ? 'Bugün' : day.dayName}
                                        </div>
                                        <div className="text-slate-400 text-sm">{day.weatherCondition}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-slate-400">
                                        <span className="text-orange-400">↑{day.tempMax}°</span>
                                        <span className="mx-1">/</span>
                                        <span className="text-blue-400">↓{day.tempMin}°</span>
                                    </div>
                                    {day.precipitationSum > 0 && (
                                        <div className="text-blue-400">💧 {day.precipitationSum.toFixed(1)}mm</div>
                                    )}
                                    <div className="text-slate-500 hidden sm:block">
                                        🌅 {day.sunrise} · 🌇 {day.sunset}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hourly Forecast */}
                {activeTab === 'hourly' && (
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 overflow-x-auto">
                        <div className="flex gap-4 min-w-max">
                            {hourly.map((hour, index) => (
                                <div key={hour.time} className="flex flex-col items-center gap-2 min-w-[60px]">
                                    <div className="text-slate-400 text-sm">
                                        {index === 0 ? 'Şimdi' : hour.hour}
                                    </div>
                                    <div className="text-2xl">{hour.weatherIcon}</div>
                                    <div className="text-white font-medium">{hour.temperature}°</div>
                                    {hour.precipitation > 0 && (
                                        <div className="text-blue-400 text-xs">💧{hour.precipitation}mm</div>
                                    )}
                                    <div className="text-slate-500 text-xs">💨{hour.windSpeed}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* UV Index Info */}
                <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>☀️</span> UV İndeksi Bilgisi
                    </h2>
                    <div className="grid grid-cols-5 gap-2 text-center text-sm">
                        <div className={`p-2 rounded-lg ${current.uvIndex < 3 ? 'bg-green-500/30 ring-2 ring-green-400' : 'bg-green-500/10'}`}>
                            <div className="text-green-400 font-bold">0-2</div>
                            <div className="text-slate-400 text-xs">Düşük</div>
                        </div>
                        <div className={`p-2 rounded-lg ${current.uvIndex >= 3 && current.uvIndex < 6 ? 'bg-yellow-500/30 ring-2 ring-yellow-400' : 'bg-yellow-500/10'}`}>
                            <div className="text-yellow-400 font-bold">3-5</div>
                            <div className="text-slate-400 text-xs">Orta</div>
                        </div>
                        <div className={`p-2 rounded-lg ${current.uvIndex >= 6 && current.uvIndex < 8 ? 'bg-orange-500/30 ring-2 ring-orange-400' : 'bg-orange-500/10'}`}>
                            <div className="text-orange-400 font-bold">6-7</div>
                            <div className="text-slate-400 text-xs">Yüksek</div>
                        </div>
                        <div className={`p-2 rounded-lg ${current.uvIndex >= 8 && current.uvIndex < 11 ? 'bg-red-500/30 ring-2 ring-red-400' : 'bg-red-500/10'}`}>
                            <div className="text-red-400 font-bold">8-10</div>
                            <div className="text-slate-400 text-xs">Ç. Yüksek</div>
                        </div>
                        <div className={`p-2 rounded-lg ${current.uvIndex >= 11 ? 'bg-purple-500/30 ring-2 ring-purple-400' : 'bg-purple-500/10'}`}>
                            <div className="text-purple-400 font-bold">11+</div>
                            <div className="text-slate-400 text-xs">Aşırı</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
