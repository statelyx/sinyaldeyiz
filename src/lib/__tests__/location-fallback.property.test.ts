/**
 * Property-Based Test: Konum hatası fallback tutarlılığı
 *
 * **Feature: ui-redesign, Property 1: Konum hatası fallback tutarlılığı**
 * **Validates: Requirements 3.3**
 *
 * fast-check kütüphanesi kullanılarak, rastgele hata türleri ve son bilinen konum
 * kombinasyonları üretilerek resolveLocationWithFallback fonksiyonunun
 * her zaman geçerli bir konum döndürdüğü doğrulanır.
 *
 * Minimum 100 iterasyon çalıştırılır.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
    resolveLocationWithFallback,
    type LocationData,
    type GeolocationFallbackResult,
} from '@/lib/services/location-service'

// Geçerli konum verisi üreten arbitrary
const locationArb: fc.Arbitrary<LocationData> = fc.record({
    lat: fc.double({ min: -90, max: 90, noNaN: true, noDefaultInfinity: true }),
    lon: fc.double({ min: -180, max: 180, noNaN: true, noDefaultInfinity: true }),
    accuracy_meters: fc.option(
        fc.double({ min: 0, max: 10000, noNaN: true, noDefaultInfinity: true }),
        { nil: undefined }
    ),
})

// Konum hata türlerini simüle eden arbitrary
const locationErrorArb: fc.Arbitrary<Error> = fc.constantFrom(
    new Error('Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.'),
    new Error('Konum bilgisi alınamadı'),
    new Error('Konum isteği zaman aşımına uğradı'),
    new Error('Konum alınırken hata oluştu'),
)

/**
 * Sonucun geçerli bir konum içerip içermediğini doğrulayan yardımcı fonksiyon
 */
function konumGecerliMi(result: GeolocationFallbackResult): boolean {
    return (
        typeof result.location.lat === 'number' &&
        typeof result.location.lon === 'number' &&
        result.location.lat >= -90 &&
        result.location.lat <= 90 &&
        result.location.lon >= -180 &&
        result.location.lon <= 180 &&
        !Number.isNaN(result.location.lat) &&
        !Number.isNaN(result.location.lon)
    )
}

describe('Property 1: Konum hatası fallback tutarlılığı', () => {
    it('herhangi bir hata türü ve mevcut son bilinen konum için, fonksiyon her zaman geçerli bir konum döndürür', async () => {
        await fc.assert(
            fc.asyncProperty(
                locationErrorArb,
                locationArb,
                async (error: Error, lastKnownLocation: LocationData) => {
                    // Hata fırlatan bir promise oluştur
                    const failingPromise = Promise.reject(error)

                    // Fonksiyonu çağır — son bilinen konum mevcut olduğunda reject etmemeli
                    const result = await resolveLocationWithFallback(failingPromise, lastKnownLocation)

                    // Sonuç geçerli bir konum içermeli
                    expect(konumGecerliMi(result)).toBe(true)

                    // Fallback kullanıldığı bilgisi doğru olmalı
                    expect(result.usedFallback).toBe(true)

                    // Fallback nedeni boş olmamalı
                    expect(result.fallbackReason).toBeTruthy()

                    // Döndürülen konum, son bilinen konum ile aynı olmalı
                    expect(result.location.lat).toBe(lastKnownLocation.lat)
                    expect(result.location.lon).toBe(lastKnownLocation.lon)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('konum isteği başarılı olduğunda, fallback kullanılmaz ve orijinal konum döndürülür', async () => {
        await fc.assert(
            fc.asyncProperty(
                locationArb,
                locationArb,
                async (successLocation: LocationData, lastKnownLocation: LocationData) => {
                    // Başarılı bir promise oluştur
                    const successPromise = Promise.resolve(successLocation)

                    const result = await resolveLocationWithFallback(successPromise, lastKnownLocation)

                    // Sonuç geçerli bir konum içermeli
                    expect(konumGecerliMi(result)).toBe(true)

                    // Fallback kullanılmamış olmalı
                    expect(result.usedFallback).toBe(false)

                    // Döndürülen konum, başarılı konum ile aynı olmalı
                    expect(result.location.lat).toBe(successLocation.lat)
                    expect(result.location.lon).toBe(successLocation.lon)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('hata durumunda son bilinen konum yoksa, fonksiyon hatayı fırlatır', async () => {
        await fc.assert(
            fc.asyncProperty(
                locationErrorArb,
                async (error: Error) => {
                    const failingPromise = Promise.reject(error)

                    // Son bilinen konum olmadan çağrıldığında hata fırlatmalı
                    await expect(
                        resolveLocationWithFallback(failingPromise, null)
                    ).rejects.toThrow()
                }
            ),
            { numRuns: 100 }
        )
    })
})
