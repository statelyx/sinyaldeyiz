/**
 * Weather Service using Open-Meteo API (FREE, no API key required)
 */

export interface WeatherData {
    temperature: number
    weatherCode: number
    weatherCondition: string
    weatherIcon: string
    windSpeed: number
    humidity: number
    precipitation: number
    isRaining: boolean
    asphaltCondition: 'İdeal' | 'Normal' | 'Kaygan' | 'Tehlikeli'
    cabrioIndex: number
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

/**
 * Fetch weather data from Open-Meteo API
 */
export async function getWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto`

        const response = await fetch(url)

        if (!response.ok) {
            throw new Error('Weather API request failed')
        }

        const data = await response.json()

        if (!data.current) {
            throw new Error('No current weather data')
        }

        const {
            temperature_2m: temperature,
            weather_code: weatherCode,
            wind_speed_10m: windSpeed,
            relative_humidity_2m: humidity,
            precipitation,
        } = data.current

        const weatherInfo = WEATHER_CONDITIONS[weatherCode] || { condition: 'Bilinmiyor', icon: '❓' }

        // Is it raining?
        const isRaining = precipitation > 0 || [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(weatherCode)

        // Calculate asphalt condition
        const asphaltCondition = calculateAsphaltCondition(temperature, precipitation, weatherCode)

        // Calculate cabrio index (0-100)
        const cabrioIndex = calculateCabrioIndex(temperature, windSpeed, precipitation, weatherCode)

        return {
            temperature: Math.round(temperature),
            weatherCode,
            weatherCondition: weatherInfo.condition,
            weatherIcon: weatherInfo.icon,
            windSpeed: Math.round(windSpeed),
            humidity: Math.round(humidity),
            precipitation,
            isRaining,
            asphaltCondition,
            cabrioIndex,
        }
    } catch (error) {
        console.error('Error fetching weather data:', error)
        return null
    }
}

/**
 * Calculate asphalt condition based on weather
 */
function calculateAsphaltCondition(
    temperature: number,
    precipitation: number,
    weatherCode: number
): 'İdeal' | 'Normal' | 'Kaygan' | 'Tehlikeli' {
    // Snow or ice conditions
    if ([71, 73, 75, 77, 85, 86, 56, 57, 66, 67].includes(weatherCode)) {
        return 'Tehlikeli'
    }

    // Heavy rain or storm
    if ([65, 82, 95, 96, 99].includes(weatherCode)) {
        return 'Kaygan'
    }

    // Any rain
    if (precipitation > 0) {
        return 'Kaygan'
    }

    // Fog
    if ([45, 48].includes(weatherCode)) {
        return 'Normal'
    }

    // Temperature too low (risk of ice)
    if (temperature < 4) {
        return 'Kaygan'
    }

    // Ideal conditions: dry, 15-30°C
    if (temperature >= 15 && temperature <= 30 && precipitation === 0) {
        return 'İdeal'
    }

    return 'Normal'
}

/**
 * Calculate Cabrio Index (0-100)
 * Higher score = better for driving with top down
 */
function calculateCabrioIndex(
    temperature: number,
    windSpeed: number,
    precipitation: number,
    weatherCode: number
): number {
    let score = 100

    // Temperature factor (ideal: 20-28°C)
    if (temperature < 10) {
        score -= 50
    } else if (temperature < 15) {
        score -= 30
    } else if (temperature < 18) {
        score -= 15
    } else if (temperature > 35) {
        score -= 30
    } else if (temperature > 30) {
        score -= 10
    }

    // Wind factor (ideal: < 20 km/h)
    if (windSpeed > 50) {
        score -= 40
    } else if (windSpeed > 35) {
        score -= 25
    } else if (windSpeed > 25) {
        score -= 15
    } else if (windSpeed > 15) {
        score -= 5
    }

    // Precipitation factor
    if (precipitation > 0) {
        score -= 50
    }

    // Weather condition factor
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)) {
        // Rain
        score -= 30
    } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
        // Snow
        score -= 50
    } else if ([95, 96, 99].includes(weatherCode)) {
        // Storm
        score -= 60
    } else if ([45, 48].includes(weatherCode)) {
        // Fog
        score -= 20
    } else if ([0, 1].includes(weatherCode)) {
        // Clear sky bonus
        score += 10
    }

    return Math.max(0, Math.min(100, score))
}

/**
 * Get cabrio index label and color
 */
export function getCabrioLabel(cabrioIndex: number): { label: string; color: string; emoji: string } {
    if (cabrioIndex >= 80) {
        return { label: 'Mükemmel', color: 'text-green-400', emoji: '🌞' }
    } else if (cabrioIndex >= 60) {
        return { label: 'İyi', color: 'text-lime-400', emoji: '😎' }
    } else if (cabrioIndex >= 40) {
        return { label: 'Orta', color: 'text-yellow-400', emoji: '🤔' }
    } else if (cabrioIndex >= 20) {
        return { label: 'Kötü', color: 'text-orange-400', emoji: '😕' }
    } else {
        return { label: 'Uygun Değil', color: 'text-red-400', emoji: '❌' }
    }
}

/**
 * Get asphalt condition color
 */
export function getAsphaltColor(condition: string): string {
    switch (condition) {
        case 'İdeal':
            return 'text-green-400 bg-green-400/10'
        case 'Normal':
            return 'text-blue-400 bg-blue-400/10'
        case 'Kaygan':
            return 'text-orange-400 bg-orange-400/10'
        case 'Tehlikeli':
            return 'text-red-400 bg-red-400/10'
        default:
            return 'text-slate-400 bg-slate-400/10'
    }
}
