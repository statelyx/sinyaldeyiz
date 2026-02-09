/**
 * Property-Based Testler: Harita-Sinyal-Avatar Entegrasyonu
 *
 * fast-check kütüphanesi kullanılarak doğruluk özellikleri test edilir.
 * Her test en az 100 iterasyon çalıştırılır.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { getBrandSlug } from '@/lib/utils/brand-slug'
import { isValidDuration, calculateExpiresAt, VALID_DURATIONS } from '@/lib/utils/signal-helpers'

/**
 * **Feature: map-signal-avatar-fix, Property 1: Araç marka slug dönüşümü tutarlılığı**
 * **Validates: Requirements 1.1, 2.2**
 *
 * Herhangi bir araç marka adı için, getBrandSlug fonksiyonu her zaman
 * boş olmayan string döndürür ve aynı girdi için her zaman aynı çıktıyı üretir (idempotent).
 */
describe('Property 1: Araç marka slug dönüşümü tutarlılığı', () => {
    it('rastgele marka adları için her zaman boş olmayan string döndürür ve idempotent çalışır', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }),
                (brandName: string) => {
                    const slug = getBrandSlug(brandName)

                    // Boş olmayan string döndürmeli
                    expect(slug).toBeTruthy()
                    expect(typeof slug).toBe('string')
                    expect(slug.length).toBeGreaterThan(0)

                    // İdempotent olmalı: aynı girdi her zaman aynı çıktıyı üretmeli
                    const slug2 = getBrandSlug(brandName)
                    expect(slug).toBe(slug2)
                }
            ),
            { numRuns: 100 }
        )
    })
})

/**
 * **Feature: map-signal-avatar-fix, Property 2: Sinyal başlatma veri bütünlüğü**
 * **Validates: Requirements 4.2**
 *
 * Herhangi bir geçerli koordinat çifti ve geçerli süre için,
 * calculateExpiresAt fonksiyonu başlangıç zamanından tam olarak
 * seçilen süre kadar ileride bir zaman döndürür.
 */
describe('Property 2: Sinyal başlatma veri bütünlüğü', () => {
    it('geçerli koordinatlar ve süreler için expires_at doğru hesaplanır', () => {
        fc.assert(
            fc.property(
                fc.double({ min: -90, max: 90, noNaN: true }),       // lat
                fc.double({ min: -180, max: 180, noNaN: true }),     // lon
                fc.constantFrom(...VALID_DURATIONS),                  // süre
                fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true }), // başlangıç zamanı
                (lat: number, lon: number, durationMinutes: number, now: Date) => {
                    // Süre geçerli olmalı
                    expect(isValidDuration(durationMinutes)).toBe(true)

                    // expires_at hesapla
                    const expiresAtStr = calculateExpiresAt(now, durationMinutes)
                    const expiresAt = new Date(expiresAtStr)

                    // Fark tam olarak seçilen süre kadar olmalı (milisaniye cinsinden)
                    const expectedDiffMs = durationMinutes * 60 * 1000
                    const actualDiffMs = expiresAt.getTime() - now.getTime()

                    expect(actualDiffMs).toBe(expectedDiffMs)
                }
            ),
            { numRuns: 100 }
        )
    })
})

/**
 * **Feature: map-signal-avatar-fix, Property 3: Geçersiz süre reddi**
 * **Validates: Requirements 4.2**
 *
 * Herhangi bir süre değeri için, eğer değer 10, 30 veya 60 değilse,
 * isValidDuration fonksiyonu false döndürür.
 */
describe('Property 3: Geçersiz süre reddi', () => {
    it('geçersiz süre değerleri reddedilir', () => {
        fc.assert(
            fc.property(
                fc.integer().filter(n => !VALID_DURATIONS.includes(n as any)),
                (invalidDuration: number) => {
                    expect(isValidDuration(invalidDuration)).toBe(false)
                }
            ),
            { numRuns: 100 }
        )
    })
})
