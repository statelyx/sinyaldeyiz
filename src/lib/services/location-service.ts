import { createSupabase, MOCK_DATA } from '@/lib/supabase/client'

export interface VisibleUser {
    user_id: string
    lat: number
    lon: number
    nickname: string
    vehicle_brand?: string
    vehicle_model?: string
    expires_at: string
    status_message?: string | null
    status_expires_at?: string | null
}

export interface LocationData {
    lat: number
    lon: number
    accuracy_meters?: number
}

// Local state for mock mode
let mockSignalActive = false
let mockSignalExpiry: Date | null = null

/**
 * Start signal - makes user visible on the map
 * @param location - User's location data
 * @param durationMinutes - Duration in minutes (10, 30, or 60)
 * @param statusMessage - Optional status message (max 100 chars)
 */
export async function startSignal(
    location: LocationData,
    durationMinutes: number = 60,
    statusMessage?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Validate duration
        if (![10, 30, 60].includes(durationMinutes)) {
            return { success: false, error: 'Geçersiz süre. Lütfen 10, 30 veya 60 dakika seçin.' }
        }

        // In mock mode, just set local state
        if (MOCK_DATA.isMockMode) {
            mockSignalActive = true
            mockSignalExpiry = new Date(Date.now() + durationMinutes * 60 * 1000)
            console.log('🚨 [Mock] Signal started at:', location, `for ${durationMinutes} minutes`)
            return { success: true }
        }

        const supabase = createSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Kullanıcı oturumu bulunamadı' }
        }

        const now = new Date()
        const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000)
        const geohash = generateSimpleGeohash(location.lat, location.lon)

        // Calculate status expiry (1 hour from now if message provided)
        const statusExpiresAt = statusMessage
            ? new Date(now.getTime() + 60 * 60 * 1000).toISOString()
            : null

        const insertData = {
            user_id: user.id,
            is_visible: true,
            visibility_duration: durationMinutes,
            expires_at: expiresAt.toISOString(),
            lat: location.lat,
            lon: location.lon,
            geohash,
            accuracy_meters: location.accuracy_meters ? Math.round(location.accuracy_meters) : null,
            last_location_update: now.toISOString(),
            updated_at: now.toISOString(),
            status_message: statusMessage || null,
            status_expires_at: statusExpiresAt,
        }

        const { error } = await (supabase
            .from('location_status') as any)
            .upsert(insertData, { onConflict: 'user_id' })

        if (error) {
            console.error('Error starting signal:', error)
            return { success: false, error: 'Sinyal başlatılırken hata oluştu: ' + error.message }
        }

        return { success: true }
    } catch (error) {
        console.error('Error in startSignal:', error)
        return { success: false, error: 'Beklenmeyen bir hata oluştu' }
    }
}

/**
 * Stop signal - makes user invisible
 */
export async function stopSignal(): Promise<{ success: boolean; error?: string }> {
    try {
        // In mock mode, just clear local state
        if (MOCK_DATA.isMockMode) {
            mockSignalActive = false
            mockSignalExpiry = null
            console.log('⏹️ [Mock] Signal stopped')
            return { success: true }
        }

        const supabase = createSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'Kullanıcı oturumu bulunamadı' }
        }

        const updateData = {
            is_visible: false,
            expires_at: null,
            lat: null,
            lon: null,
            geohash: null,
            accuracy_meters: null,
            updated_at: new Date().toISOString(),
        }

        const { error } = await (supabase
            .from('location_status') as any)
            .update(updateData)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error stopping signal:', error)
            return { success: false, error: 'Sinyal durdurulurken hata oluştu' }
        }

        return { success: true }
    } catch (error) {
        console.error('Error in stopSignal:', error)
        return { success: false, error: 'Beklenmeyen bir hata oluştu' }
    }
}

/**
 * Check if user's signal is still active (not expired)
 */
export async function checkSignalStatus(): Promise<{ isActive: boolean; expiresAt?: Date }> {
    try {
        // In mock mode, return local state
        if (MOCK_DATA.isMockMode) {
            if (mockSignalActive && mockSignalExpiry && mockSignalExpiry > new Date()) {
                return { isActive: true, expiresAt: mockSignalExpiry }
            }
            return { isActive: false }
        }

        const supabase = createSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { isActive: false }
        }

        const { data, error } = await (supabase
            .from('location_status') as any)
            .select('is_visible, expires_at')
            .eq('user_id', user.id)
            .single()

        if (error || !data) {
            return { isActive: false }
        }

        const now = new Date()
        const expiresAt = data.expires_at ? new Date(data.expires_at) : null

        if (data.is_visible && expiresAt && expiresAt > now) {
            return { isActive: true, expiresAt }
        }

        if (data.is_visible && expiresAt && expiresAt <= now) {
            await stopSignal()
        }

        return { isActive: false }
    } catch (error) {
        console.error('Error checking signal status:', error)
        return { isActive: false }
    }
}

/**
 * Get all visible users for map display
 */
export async function getVisibleUsers(): Promise<VisibleUser[]> {
    try {
        // In mock mode, return mock users
        if (MOCK_DATA.isMockMode) {
            return MOCK_DATA.visibleUsers.map((item: any) => ({
                user_id: item.user_id,
                lat: item.lat,
                lon: item.lon,
                nickname: item.profiles?.nickname || 'Anonim',
                vehicle_brand: item.vehicles?.[0]?.vehicle_catalog?.marka,
                vehicle_model: item.vehicles?.[0]?.vehicle_catalog?.model,
                expires_at: item.expires_at,
            }))
        }

        const supabase = createSupabase()
        const now = new Date().toISOString()

        // Önce profiles join'li sorgu dene
        const { data, error } = await supabase
            .from('location_status')
            .select(`
        user_id,
        lat,
        lon,
        expires_at,
        status_message,
        status_expires_at
      `)
            .eq('is_visible', true)
            .not('lat', 'is', null)
            .not('lon', 'is', null)
            .gt('expires_at', now)

        if (error) {
            console.error('Error fetching visible users:', error)
            return []
        }

        if (!data || data.length === 0) return []

        // Kullanıcı ID'lerini topla ve profilleri ayrı sorgula
        const userIds = data.map((item: any) => item.user_id)
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, nickname, avatar_url')
            .in('id', userIds)

        // Profilleri map'e çevir
        const profileMap: Record<string, { nickname: string | null; avatar_url: string | null }> = {}
        if (profiles) {
            profiles.forEach((p: any) => {
                profileMap[p.id] = { nickname: p.nickname, avatar_url: p.avatar_url }
            })
        }

        return data.map((item: any) => {
            const profile = profileMap[item.user_id]
            const avatarUrl = profile?.avatar_url || ''
            let vehicleBrand = ''
            if (avatarUrl.startsWith('/vehicles/brands/')) {
                vehicleBrand = avatarUrl.replace('/vehicles/brands/', '').replace('.png', '')
            }

            return {
                user_id: item.user_id,
                lat: item.lat,
                lon: item.lon,
                nickname: profile?.nickname || 'Anonim',
                vehicle_brand: vehicleBrand || undefined,
                vehicle_model: undefined,
                expires_at: item.expires_at,
                status_message: item.status_message,
                status_expires_at: item.status_expires_at,
            }
        })
    } catch (error) {
        console.error('Error in getVisibleUsers:', error)
        return []
    }
}

/**
 * Update user's location while signal is active
 */
export async function updateLocation(location: LocationData): Promise<{ success: boolean }> {
    try {
        // In mock mode, just log
        if (MOCK_DATA.isMockMode) {
            console.log('📍 [Mock] Location updated:', location)
            return { success: true }
        }

        const supabase = createSupabase()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false }
        }

        const geohash = generateSimpleGeohash(location.lat, location.lon)

        const updateData = {
            lat: location.lat,
            lon: location.lon,
            geohash,
            accuracy_meters: location.accuracy_meters ? Math.round(location.accuracy_meters) : null,
            last_location_update: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        const { error } = await (supabase
            .from('location_status') as any)
            .update(updateData)
            .eq('user_id', user.id)
            .eq('is_visible', true)

        return { success: !error }
    } catch (error) {
        console.error('Error updating location:', error)
        return { success: false }
    }
}

/**
 * Generate a simple geohash for the location
 */
function generateSimpleGeohash(lat: number, lon: number): string {
    const latRound = Math.round(lat * 100) / 100
    const lonRound = Math.round(lon * 100) / 100
    return `${latRound},${lonRound}`
}

/**
 * Konum hatası türlerini tanımlayan arayüz
 */
export interface GeolocationFallbackResult {
    location: LocationData
    /** Yedek konum kullanıldıysa true */
    usedFallback: boolean
    /** Yedek konum kullanıldıysa orijinal hata mesajı */
    fallbackReason?: string
}

/**
 * Konum isteği sonucunu fallback mantığıyla işleyen saf fonksiyon.
 * Property-based test için doğrudan test edilebilir.
 * @param locationPromise - Konum isteği promise'i
 * @param lastKnownLocation - Son bilinen konum (yedek olarak kullanılacak)
 */
export async function resolveLocationWithFallback(
    locationPromise: Promise<LocationData>,
    lastKnownLocation?: LocationData | null
): Promise<GeolocationFallbackResult> {
    try {
        const location = await locationPromise
        return { location, usedFallback: false }
    } catch (error: any) {
        // Hata durumunda son bilinen konum varsa yedek olarak kullan
        if (lastKnownLocation) {
            return {
                location: lastKnownLocation,
                usedFallback: true,
                fallbackReason: error.message || 'Konum alınamadı',
            }
        }
        // Son bilinen konum yoksa hatayı fırlat
        throw error
    }
}

/**
 * requestGeolocation fonksiyonunu sarmalayan yedekli konum isteği.
 * Timeout veya hata durumunda son bilinen konumu yedek olarak döndürür.
 * @param lastKnownLocation - Son bilinen konum (yedek olarak kullanılacak)
 */
export async function requestGeolocationWithFallback(
    lastKnownLocation?: LocationData | null
): Promise<GeolocationFallbackResult> {
    return resolveLocationWithFallback(requestGeolocation(), lastKnownLocation)
}

/**
 * Tarayıcıdan konum bilgisi al
 */
export function requestGeolocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Tarayıcınız konum özelliğini desteklemiyor'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy_meters: position.coords.accuracy,
                })
            },
            (error) => {
                // In mock mode, return Istanbul coordinates on error
                if (MOCK_DATA.isMockMode) {
                    console.log('📍 [Mock] Using default Istanbul location')
                    resolve({
                        lat: 41.0082,
                        lon: 28.9784,
                        accuracy_meters: 100,
                    })
                    return
                }

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject(new Error('Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.'))
                        break
                    case error.POSITION_UNAVAILABLE:
                        reject(new Error('Konum bilgisi alınamadı'))
                        break
                    case error.TIMEOUT:
                        reject(new Error('Konum isteği zaman aşımına uğradı'))
                        break
                    default:
                        reject(new Error('Konum alınırken hata oluştu'))
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            }
        )
    })
}
