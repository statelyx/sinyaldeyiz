/**
 * Birim Testleri: createMarkerElement (marker-helpers) fonksiyonları
 *
 * Mevcut kullanıcı marker'ının araç ikonu içerdiğini ve
 * diğer kullanıcı marker'larının doğru bilgileri gösterdiğini test eder.
 *
 * _Gereksinimler: 2.2, 2.4_
 */

import { describe, it, expect } from 'vitest'
import {
    escapeHtml,
    buildCurrentUserMarkerHtml,
    buildOtherUserMarkerHtml,
} from '@/lib/utils/marker-helpers'

describe('escapeHtml', () => {
    it('HTML özel karakterlerini escape eder', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
        expect(escapeHtml('"test"')).toBe('&quot;test&quot;')
        expect(escapeHtml("it's")).toBe("it&#039;s")
        expect(escapeHtml('a & b')).toBe('a &amp; b')
    })
})

describe('buildCurrentUserMarkerHtml - Mevcut kullanıcı marker', () => {
    it('araç markası verildiğinde araç ikonu img etiketi içerir', () => {
        const html = buildCurrentUserMarkerHtml({ vehicleBrand: 'BMW' })
        expect(html).toContain('/vehicles/brands/bmw.png')
        expect(html).toContain('<img')
        expect(html).toContain('object-contain')
    })

    it('araç markası yoksa fallback SVG ikonu gösterir', () => {
        const html = buildCurrentUserMarkerHtml({})
        expect(html).toContain('<svg')
        expect(html).not.toContain('<img')
    })

    it('kullanıcı adını gösterir', () => {
        const html = buildCurrentUserMarkerHtml({ nickname: 'Furkan' })
        expect(html).toContain('Furkan')
    })

    it('kullanıcı adı yoksa "Sen" gösterir', () => {
        const html = buildCurrentUserMarkerHtml({})
        expect(html).toContain('Sen')
    })

    it('durum mesajı varsa baloncuk gösterir', () => {
        const html = buildCurrentUserMarkerHtml({ statusMessage: 'Yoldayım' })
        expect(html).toContain('💬')
        expect(html).toContain('Yoldayım')
    })

    it('durum mesajı yoksa baloncuk göstermez', () => {
        const html = buildCurrentUserMarkerHtml({})
        expect(html).not.toContain('💬')
    })

    it('animate-ping efekti içerir', () => {
        const html = buildCurrentUserMarkerHtml({ vehicleBrand: 'BMW' })
        expect(html).toContain('animate-ping')
    })

    it('avatarUrl ile araç ikonu çıkarır', () => {
        const html = buildCurrentUserMarkerHtml({
            avatarUrl: '/vehicles/brands/tesla.png',
        })
        expect(html).toContain('/vehicles/brands/tesla.png')
        expect(html).toContain('<img')
    })
})

describe('buildOtherUserMarkerHtml - Diğer kullanıcı marker', () => {
    it('araç marka ikonunu gösterir', () => {
        const html = buildOtherUserMarkerHtml({ vehicleBrand: 'Audi' })
        expect(html).toContain('/vehicles/brands/audi.png')
        expect(html).toContain('<img')
    })

    it('kullanıcı adını gösterir', () => {
        const html = buildOtherUserMarkerHtml({ nickname: 'Ali' })
        expect(html).toContain('Ali')
    })

    it('kullanıcı adı yoksa "Sürücü" gösterir', () => {
        const html = buildOtherUserMarkerHtml({})
        expect(html).toContain('Sürücü')
    })

    it('durum mesajı varsa baloncuk gösterir', () => {
        const html = buildOtherUserMarkerHtml({ statusMessage: 'Trafikte' })
        expect(html).toContain('💬')
        expect(html).toContain('Trafikte')
    })

    it('durum mesajı yoksa baloncuk göstermez', () => {
        const html = buildOtherUserMarkerHtml({})
        expect(html).not.toContain('💬')
    })

    it('XSS saldırılarına karşı HTML escape uygular', () => {
        const html = buildOtherUserMarkerHtml({
            nickname: '<script>alert("xss")</script>',
            statusMessage: '<img onerror=alert(1)>',
        })
        expect(html).not.toContain('<script>')
        expect(html).toContain('&lt;script&gt;')
    })
})
