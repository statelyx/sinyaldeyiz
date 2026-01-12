export interface VehicleCatalogItem {
  id: string
  marka: string
  model: string
  donanim: string
  motor: string
  yakit: string
  vites: string
  fiyat: string
  websitesi: string | null
}

export interface VehicleSelection {
  catalogId: string
  brand: string
  model: string
  trim: VehicleCatalogItem
  year: number
}
