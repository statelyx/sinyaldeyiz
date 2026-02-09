/**
 * Birim Testleri: getBrandSlug fonksiyonu
 *
 * Bilinen marka adları için doğru slug üretildiğini ve
 * bilinmeyen marka adları için fallback davranışını test eder.
 *
 * _Gereksinimler: 1.1, 2.2_
 */

import { describe, it, expect } from 'vitest'
import { getBrandSlug } from '@/lib/utils/brand-slug'

describe('getBrandSlug - Bilinen markalar', () => {
    it('bilinen marka adları için doğru slug döndürür', () => {
        expect(getBrandSlug('bmw')).toBe('bmw')
        expect(getBrandSlug('mercedes')).toBe('mercedes-benz')
        expect(getBrandSlug('mercedes-benz')).toBe('mercedes-benz')
        expect(getBrandSlug('alfa-romeo')).toBe('alfa-romeo')
        expect(getBrandSlug('aston-martin')).toBe('aston-martin')
        expect(getBrandSlug('rolls-royce')).toBe('rolls-royce')
    })

    it('büyük/küçük harf farkını yok sayar', () => {
        expect(getBrandSlug('BMW')).toBe('bmw')
        expect(getBrandSlug('Mercedes')).toBe('mercedes-benz')
        expect(getBrandSlug('AUDI')).toBe('audi')
        expect(getBrandSlug('Tesla')).toBe('tesla')
    })

    it('baştaki ve sondaki boşlukları temizler', () => {
        expect(getBrandSlug('  bmw  ')).toBe('bmw')
        expect(getBrandSlug(' mercedes ')).toBe('mercedes-benz')
    })
})

describe('getBrandSlug - Bilinmeyen markalar (fallback)', () => {
    it('bilinmeyen marka adını küçük harfe çevirip boşlukları tire ile değiştirir', () => {
        expect(getBrandSlug('Tofaş Şahin')).toBe('tofaş-şahin')
        expect(getBrandSlug('Some Brand')).toBe('some-brand')
    })

    it('birden fazla boşluğu tek tire ile değiştirir', () => {
        expect(getBrandSlug('some   brand')).toBe('some-brand')
    })

    it('undefined veya boş değer için "default" döndürür', () => {
        expect(getBrandSlug(undefined)).toBe('default')
        expect(getBrandSlug('')).toBe('default')
    })
})
