/**
 * Birim Testleri: resolveLocationWithFallback fonksiyonu
 *
 * Timeout durumunda son bilinen konum döndürüldüğünü ve
 * son bilinen konum yokken hata fırlatıldığını test eder.
 *
 * _Gereksinimler: 3.1, 3.3_
 */

import { describe, it, expect } from 'vitest'
import {
  resolveLocationWithFallback,
  type LocationData,
} from '@/lib/services/location-service'

// Sabit test konumları
const istanbul: LocationData = { lat: 41.0082, lon: 28.9784, accuracy_meters: 50 }
const ankara: LocationData = { lat: 39.9334, lon: 32.8597, accuracy_meters: 100 }

describe('resolveLocationWithFallback - Birim Testleri', () => {
  it('timeout hatası durumunda son bilinen konumu döndürür', async () => {
    const timeoutError = new Error('Konum isteği zaman aşımına uğradı')
    const failingPromise = Promise.reject(timeoutError)

    const result = await resolveLocationWithFallback(failingPromise, istanbul)

    expect(result.location).toEqual(istanbul)
    expect(result.usedFallback).toBe(true)
    expect(result.fallbackReason).toBe('Konum isteği zaman aşımına uğradı')
  })

  it('son bilinen konum yokken timeout hatası fırlatılır', async () => {
    const timeoutError = new Error('Konum isteği zaman aşımına uğradı')
    const failingPromise = Promise.reject(timeoutError)

    await expect(
      resolveLocationWithFallback(failingPromise, null)
    ).rejects.toThrow('Konum isteği zaman aşımına uğradı')
  })

  it('konum isteği başarılı olduğunda orijinal konumu döndürür', async () => {
    const successPromise = Promise.resolve(ankara)

    const result = await resolveLocationWithFallback(successPromise, istanbul)

    expect(result.location).toEqual(ankara)
    expect(result.usedFallback).toBe(false)
    expect(result.fallbackReason).toBeUndefined()
  })

  it('PERMISSION_DENIED hatası durumunda son bilinen konumu döndürür', async () => {
    const permError = new Error('Konum izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.')
    const failingPromise = Promise.reject(permError)

    const result = await resolveLocationWithFallback(failingPromise, ankara)

    expect(result.location).toEqual(ankara)
    expect(result.usedFallback).toBe(true)
  })

  it('son bilinen konum undefined iken hata fırlatılır', async () => {
    const error = new Error('Konum bilgisi alınamadı')
    const failingPromise = Promise.reject(error)

    await expect(
      resolveLocationWithFallback(failingPromise, undefined)
    ).rejects.toThrow('Konum bilgisi alınamadı')
  })
})
