/**
 * Harita marker'ı oluşturma yardımcı fonksiyonları.
 * MapView bileşeninden ayrıştırılmış, test edilebilir saf fonksiyonlar.
 */

import { getBrandSlug } from './brand-slug'

/** HTML özel karakterlerini escape eder */
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

export interface CurrentUserMarkerOptions {
    vehicleBrand?: string
    avatarUrl?: string
    nickname?: string
    statusMessage?: string
}

export interface OtherUserMarkerOptions {
    nickname?: string
    vehicleBrand?: string
    vehicleModel?: string
    statusMessage?: string | null
}

/**
 * Mevcut kullanıcı marker'ı için HTML üretir.
 * _Gereksinimler: 2.2, 2.4_
 */
export function buildCurrentUserMarkerHtml(opts: CurrentUserMarkerOptions): string {
    const brandSlug = opts.vehicleBrand
        ? getBrandSlug(opts.vehicleBrand)
        : (opts.avatarUrl?.includes('/vehicles/brands/')
            ? opts.avatarUrl.replace('/vehicles/brands/', '').replace('.png', '')
            : '')
    const hasVehicleIcon = !!brandSlug && brandSlug !== 'default'
    const safeStatusMessage = opts.statusMessage ? escapeHtml(opts.statusMessage) : ''
    const safeNickname = escapeHtml(opts.nickname || 'Sen')

    return `
<div class="relative">
  <div class="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-400/40 border-3 border-white overflow-hidden ${hasVehicleIcon ? 'bg-black/50' : ''}">
    ${hasVehicleIcon
        ? `<img src="/vehicles/brands/${brandSlug}.png" alt="${escapeHtml(opts.vehicleBrand || '')}" class="w-9 h-9 object-contain" onerror="this.style.display='none';this.parentElement.innerHTML='<svg class=\\'w-7 h-7 text-black\\' fill=\\'currentColor\\' viewBox=\\'0 0 20 20\\'><path fill-rule=\\'evenodd\\' d=\\'M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z\\' clip-rule=\\'evenodd\\' /></svg>'">`
        : `<svg class="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
    </svg>`
    }
  </div>
  <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-[11px] px-3 py-1 rounded-full whitespace-nowrap font-bold border-2 border-white">
    ${safeNickname}
  </div>
  ${safeStatusMessage ? `
    <div class="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/95 backdrop-blur-md text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap border border-yellow-400/40 shadow-lg max-w-[180px] truncate z-10">
      💬 ${safeStatusMessage}
      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/95 border-r border-b border-yellow-400/40"></div>
    </div>
  ` : ''}
  <div class="absolute inset-0 w-14 h-14 rounded-full bg-yellow-400 animate-ping opacity-40"></div>
</div>`
}

/**
 * Diğer kullanıcı marker'ı için HTML üretir.
 * _Gereksinimler: 2.2, 2.4_
 */
export function buildOtherUserMarkerHtml(opts: OtherUserMarkerOptions): string {
    const safeNickname = escapeHtml(opts.nickname || 'Sürücü')
    const safeBrand = opts.vehicleBrand ? escapeHtml(opts.vehicleBrand) : ''
    const safeStatusMessage = opts.statusMessage ? escapeHtml(opts.statusMessage) : ''
    const brandSlug = getBrandSlug(opts.vehicleBrand)

    return `
<div class="relative cursor-pointer group">
  <div class="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400/30 to-amber-500/30 backdrop-blur-md border-3 border-yellow-400/70 flex items-center justify-center shadow-lg shadow-yellow-400/30 transition-transform group-hover:scale-110 overflow-hidden bg-black/50">
    <img src="/vehicles/brands/${brandSlug}.png" alt="${safeBrand}" class="w-9 h-9 object-contain" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSI+PHJlY3Qgd2lkdGg9IjI4IiBoZWlnaHQ9IjE4IiB4PSIzIiByeT0iMiIgZmlsbD0iI2Y1YiIvPjwvc3ZnPg=='">
  </div>
  <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-md text-yellow-400 text-[11px] px-3 py-1 rounded-full whitespace-nowrap font-bold border-2 border-yellow-400/50">
    ${safeNickname}
  </div>
  ${safeStatusMessage ? `
    <div class="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/95 backdrop-blur-md text-white text-xs px-3 py-2 rounded-xl whitespace-nowrap border border-yellow-400/40 shadow-lg max-w-[180px] truncate z-10">
      💬 ${safeStatusMessage}
      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/95 border-r border-b border-yellow-400/40"></div>
    </div>
  ` : ''}
</div>`
}
