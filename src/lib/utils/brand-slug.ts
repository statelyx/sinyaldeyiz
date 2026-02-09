/**
 * Araç marka adını URL-uyumlu slug'a dönüştürür.
 * Bilinen markalar için sabit eşleme kullanır, bilinmeyenler için
 * küçük harfe çevirip boşlukları tire ile değiştirir.
 */

const BRAND_MAP: Record<string, string> = {
    'mercedes': 'mercedes-benz', 'mercedes-benz': 'mercedes-benz',
    'bmw': 'bmw', 'audi': 'audi', 'audi-sport': 'audi-sport',
    'porsche': 'porsche', 'ferrari': 'ferrari', 'lamborghini': 'lamborghini',
    'maserati': 'maserati', 'toyota': 'toyota', 'honda': 'honda',
    'nissan': 'nissan', 'nissan-gt-r': 'nissan-gt-r', 'mazda': 'mazda',
    'subaru': 'subaru', 'mitsubishi': 'mitsubishi', 'ford': 'ford',
    'ford-mustang': 'ford-mustang', 'chevrolet': 'chevrolet',
    'chevrolet-corvette': 'chevrolet-corvette', 'dodge': 'dodge',
    'dodge-viper': 'dodge-viper', 'jeep': 'jeep', 'tesla': 'tesla',
    'volkswagen': 'volkswagen', 'volvo': 'volvo', 'kia': 'kia',
    'hyundai': 'hyundai', 'lexus': 'lexus', 'infiniti': 'infiniti',
    'acura': 'acura', 'alfa-romeo': 'alfa-romeo', 'aston-martin': 'aston-martin',
    'bentley': 'bentley', 'bugatti': 'bugatti', 'cadillac': 'cadillac',
    'chery': 'chery', 'chrysler': 'chrysler', 'citroen': 'citroen',
    'cupra': 'cupra', 'dacia': 'dacia', 'daewoo': 'daewoo', 'daf': 'daf',
    'daihatsu': 'daihatsu', 'ds': 'ds', 'fiat': 'fiat', 'gmc': 'gmc',
    'hummer': 'hummer', 'hupmobile': 'hupmobile', 'isuzu': 'isuzu',
    'iveco': 'iveco', 'jaguar': 'jaguar', 'jawa': 'jawa',
    'ktm': 'ktm', 'lada': 'lada', 'lagonda': 'lagonda', 'lancia': 'lancia',
    'land-rover': 'land-rover', 'lincoln': 'lincoln', 'lotus': 'lotus',
    'lynk-and-co': 'lynk-and-co', 'man': 'man', 'maybach': 'maybach',
    'mclaren': 'mclaren', 'mercedes-amg': 'mercedes-amg', 'mg': 'mg',
    'mini': 'mini', 'opel': 'opel', 'pagani': 'pagani', 'peugeot': 'peugeot',
    'pontiac': 'pontiac', 'proton': 'proton', 'renault': 'renault',
    'rolls-royce': 'rolls-royce', 'rover': 'rover', 'saab': 'saab',
    'scania': 'scania', 'seat': 'seat', 'skoda': 'skoda', 'smart': 'smart',
    'ssangyong': 'ssangyong', 'suzuki': 'suzuki', 'tata': 'tata',
    'abarth': 'abarth', 'brabus': 'brabus', 'brilliance': 'brilliance',
    'byd': 'byd',
}

export function getBrandSlug(brand?: string): string {
    if (!brand) return 'default'
    const brandLower = brand.toLowerCase().trim()
    if (!brandLower) return 'default'
    if (Object.prototype.hasOwnProperty.call(BRAND_MAP, brandLower)) {
        return BRAND_MAP[brandLower]
    }
    return brandLower.replace(/\s+/g, '-')
}
