/**
 * Birim Testleri: TopBar bileşeni yapısal doğrulama
 *
 * Logo, nav linkleri ve kullanıcı bilgisi alanlarının
 * doğru yapıda tanımlandığını doğrular.
 *
 * _Gereksinimler: 1.3_
 */

import { describe, it, expect } from 'vitest'
import { navItems } from '@/components/layout/top-bar'

describe('TopBar - navItems yapısal doğrulama', () => {
  it('navItems dizisi en az 3 navigasyon öğesi içerir', () => {
    expect(navItems.length).toBeGreaterThanOrEqual(3)
  })

  it('her navigasyon öğesi href, label ve icon alanlarına sahiptir', () => {
    for (const item of navItems) {
      expect(item).toHaveProperty('href')
      expect(item).toHaveProperty('label')
      expect(item).toHaveProperty('icon')
      // href "/" ile başlamalı
      expect(item.href).toMatch(/^\//)
      // label boş olmamalı
      expect(item.label.length).toBeGreaterThan(0)
      // icon boş olmamalı
      expect(item.icon.length).toBeGreaterThan(0)
    }
  })

  it('Ana Sayfa (dashboard) linki mevcut', () => {
    const dashboard = navItems.find((item) => item.href === '/dashboard')
    expect(dashboard).toBeDefined()
    expect(dashboard!.label).toBe('Ana Sayfa')
  })

  it('Harita linki mevcut', () => {
    const map = navItems.find((item) => item.href === '/map')
    expect(map).toBeDefined()
    expect(map!.label).toBe('Harita')
  })

  it('Profil linki mevcut', () => {
    const profile = navItems.find((item) => item.href === '/profile')
    expect(profile).toBeDefined()
    expect(profile!.label).toBe('Profil')
  })

  it('tüm href değerleri benzersizdir', () => {
    const hrefs = navItems.map((item) => item.href)
    const uniqueHrefs = new Set(hrefs)
    expect(uniqueHrefs.size).toBe(hrefs.length)
  })
})
