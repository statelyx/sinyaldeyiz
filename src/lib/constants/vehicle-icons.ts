/**
 * Vehicle brand icon mapping
 * Maps brand names to their PNG icon files
 */

export const VEHICLE_BRAND_ICONS: Record<string, string> = {
  // Car brands
  'abarth': '/vehicles/brands/abarth.png',
  'acura': '/vehicles/brands/acura.png',
  'alfa-romeo': '/vehicles/brands/alfa-romeo.png',
  'aston-martin': '/vehicles/brands/aston-martin.png',
  'audi': '/vehicles/brands/audi.png',
  'audi-sport': '/vehicles/brands/audi-sport.png',
  'bentley': '/vehicles/brands/bentley.png',
  'bmw': '/vehicles/brands/bmw.png',
  'bmw-m': '/vehicles/brands/bmw-m.png',
  'brabus': '/vehicles/brands/brabus.png',
  'brilliance': '/vehicles/brands/brilliance.png',
  'bugatti': '/vehicles/brands/bugatti.png',
  'byd': '/vehicles/brands/byd.png',
  'cadillac': '/vehicles/brands/cadillac.png',
  'chery': '/vehicles/brands/chery.png',
  'chevrolet': '/vehicles/brands/chevrolet.png',
  'chevrolet-corvette': '/vehicles/brands/chevrolet-corvette.png',
  'chrysler': '/vehicles/brands/chrysler.png',
  'citroen': '/vehicles/brands/citroen.png',
  'cupra': '/vehicles/brands/cupra.png',
  'dacia': '/vehicles/brands/dacia.png',
  'daewoo': '/vehicles/brands/daewoo.png',
  'daf': '/vehicles/brands/daf.png',
  'daihatsu': '/vehicles/brands/daihatsu.png',
  'dodge': '/vehicles/brands/dodge.png',
  'dodge-viper': '/vehicles/brands/dodge-viper.png',
  'ds': '/vehicles/brands/ds.png',
  'ferrari': '/vehicles/brands/ferrari.png',
  'fiat': '/vehicles/brands/fiat.png',
  'ford': '/vehicles/brands/ford.png',
  'ford-mustang': '/vehicles/brands/ford-mustang.png',
  'gmc': '/vehicles/brands/gmc.png',
  'honda': '/vehicles/brands/honda.png',
  'hummer': '/vehicles/brands/hummer.png',
  'hupmobile': '/vehicles/brands/hupmobile.png',
  'hyundai': '/vehicles/brands/hyundai.png',
  'infiniti': '/vehicles/brands/infiniti.png',
  'isuzu': '/vehicles/brands/isuzu.png',
  'iveco': '/vehicles/brands/iveco.png',
  'jaguar': '/vehicles/brands/jaguar.png',
  'jawa': '/vehicles/brands/jawa.png',
  'jeep': '/vehicles/brands/jeep.png',
  'kia': '/vehicles/brands/kia.png',
  'ktm': '/vehicles/brands/ktm.png',
  'lada': '/vehicles/brands/lada.png',
  'lagonda': '/vehicles/brands/lagonda.png',
  'lamborghini': '/vehicles/brands/lamborghini.png',
  'lancia': '/vehicles/brands/lancia.png',
  'land-rover': '/vehicles/brands/land-rover.png',
  'lexus': '/vehicles/brands/lexus.png',
  'lincoln': '/vehicles/brands/lincoln.png',
  'lotus': '/vehicles/brands/lotus.png',
  'lynk-and-co': '/vehicles/brands/lynk-and-co.png',
  'man': '/vehicles/brands/man.png',
  'maserati': '/vehicles/brands/maserati.png',
  'maybach': '/vehicles/brands/maybach.png',
  'mazda': '/vehicles/brands/mazda.png',
  'mclaren': '/vehicles/brands/mclaren.png',
  'mercedes': '/vehicles/brands/mercedes-benz.png',
  'mercedes-benz': '/vehicles/brands/mercedes-benz.png',
  'mercedes-amg': '/vehicles/brands/mercedes-amg.png',
  'mg': '/vehicles/brands/mg.png',
  'mini': '/vehicles/brands/mini.png',
  'mitsubishi': '/vehicles/brands/mitsubishi.png',
  'nissan': '/vehicles/brands/nissan.png',
  'nissan-gt-r': '/vehicles/brands/nissan-gt-r.png',
  'opel': '/vehicles/brands/opel.png',
  'pagani': '/vehicles/brands/pagani.png',
  'peugeot': '/vehicles/brands/peugeot.png',
  'pontiac': '/vehicles/brands/pontiac.png',
  'porsche': '/vehicles/brands/porsche.png',
  'proton': '/vehicles/brands/proton.png',
  'renault': '/vehicles/brands/renault.png',
  'rolls-royce': '/vehicles/brands/rolls-royce.png',
  'rover': '/vehicles/brands/rover.png',
  'saab': '/vehicles/brands/saab.png',
  'scania': '/vehicles/brands/scania.png',
  'seat': '/vehicles/brands/seat.png',
  'skoda': '/vehicles/brands/skoda.png',
  'smart': '/vehicles/brands/smart.png',
  'ssangyong': '/vehicles/brands/ssangyong.png',
  'subaru': '/vehicles/brands/subaru.png',
  'suzuki': '/vehicles/brands/suzuki.png',
  'tata': '/vehicles/brands/tata.png',
  'tesla': '/vehicles/brands/tesla.png',
  'toyota': '/vehicles/brands/toyota.png',
  'volkswagen': '/vehicles/brands/volkswagen.png',
  'volvo': '/vehicles/brands/volvo.png',
}

/**
 * Get vehicle icon path for a given brand
 * @param brand - Vehicle brand name
 * @returns Path to the icon PNG file
 */
export function getVehicleIconPath(brand?: string): string {
  if (!brand) return '/vehicles/brands/default.png'

  // Try exact match first
  const brandKey = brand.toLowerCase().trim()
  if (VEHICLE_BRAND_ICONS[brandKey]) {
    return VEHICLE_BRAND_ICONS[brandKey]
  }

  // Try partial match for brands with multiple words
  const partialMatch = Object.keys(VEHICLE_BRAND_ICONS).find(key =>
    brandKey.includes(key) || key.includes(brandKey)
  )

  return partialMatch ? VEHICLE_BRAND_ICONS[partialMatch] : '/vehicles/brands/default.png'
}

/**
 * Get all available vehicle brands
 * @returns Array of brand names with icons
 */
export function getAllVehicleBrands(): string[] {
  return Object.keys(VEHICLE_BRAND_ICONS).sort()
}
