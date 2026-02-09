/**
 * Sinyal ile ilgili saf yardımcı fonksiyonlar.
 * Supabase bağımlılığı olmadan test edilebilir.
 */

/** Geçerli sinyal süreleri (dakika) */
export const VALID_DURATIONS = [10, 30, 60] as const

/**
 * Verilen sürenin geçerli olup olmadığını kontrol eder.
 */
export function isValidDuration(durationMinutes: number): boolean {
    return (VALID_DURATIONS as readonly number[]).includes(durationMinutes)
}

/**
 * Verilen başlangıç zamanı ve süreye göre bitiş zamanını hesaplar.
 * @returns ISO string formatında expires_at değeri
 */
export function calculateExpiresAt(now: Date, durationMinutes: number): string {
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000)
    return expiresAt.toISOString()
}
