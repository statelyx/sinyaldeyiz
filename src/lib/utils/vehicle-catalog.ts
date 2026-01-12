import type { VehicleCatalogItem } from '@/types/vehicle-catalog'

export function parseVehicleCatalog(jsonData: any[]): VehicleCatalogItem[] {
  return jsonData.map(item => ({
    id: item.id,
    marka: item.marka,
    model: item.model,
    donanim: item.donanim,
    motor: item.motor,
    yakit: item.yakit,
    vites: item.vites,
    fiyat: item.fiyat,
    websitesi: item.websitesi || null
  }))
}

export function getUniqueBrands(catalog: VehicleCatalogItem[]): string[] {
  return [...new Set(catalog.map(item => item.marka))].sort((a, b) =>
    a.localeCompare(b, 'tr')
  )
}

export function getModelsByBrand(catalog: VehicleCatalogItem[], brand: string): string[] {
  return [...new Set(catalog
    .filter(item => item.marka === brand)
    .map(item => item.model)
  )].sort((a, b) => a.localeCompare(b, 'tr'))
}

export function getTrimsByModel(
  catalog: VehicleCatalogItem[],
  brand: string,
  model: string
): VehicleCatalogItem[] {
  return catalog.filter(item =>
    item.marka === brand && item.model === model
  ).sort((a, b) => a.donanim.localeCompare(b.donanim, 'tr'))
}

export function searchVehicles(
  catalog: VehicleCatalogItem[],
  query: string
): VehicleCatalogItem[] {
  const lowerQuery = query.toLowerCase()
  return catalog.filter(item =>
    item.marka.toLowerCase().includes(lowerQuery) ||
    item.model.toLowerCase().includes(lowerQuery) ||
    item.donanim.toLowerCase().includes(lowerQuery)
  )
}
