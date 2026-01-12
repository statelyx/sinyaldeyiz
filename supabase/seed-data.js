/**
 * Sinyaldeyiz - Araç Veri Import Script
 * 
 * Bu script arabalar.json ve moto_brands.json verilerini
 * Supabase veritabanına yükler.
 * 
 * Kullanım:
 * 1. .env.local dosyasındaki Supabase bilgilerinin doğru olduğundan emin ol
 * 2. npm install @supabase/supabase-js (eğer yoksa)
 * 3. node supabase/seed-data.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Supabase client - process.env'den oku veya manuel gir
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY'

// Service role key gerekli (anon key RLS nedeniyle çalışmaz)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function seedCars() {
    console.log('🚗 Arabalar yükleniyor...')

    try {
        const carsPath = path.join(__dirname, '..', 'arabalar.json')
        const carsData = JSON.parse(fs.readFileSync(carsPath, 'utf8'))

        // Batch insert - 100'er kayıt
        const batchSize = 100
        let inserted = 0

        for (let i = 0; i < carsData.length; i += batchSize) {
            const batch = carsData.slice(i, i + batchSize).map(car => ({
                marka: car.marka,
                model: car.model,
                donanim: car.donanim || null,
                motor: car.motor || null,
                yakit: car.yakit || null,
                vites: car.vites || null,
                fiyat: car.fiyat || null,
                websitesi: car.websitesi || null
            }))

            const { error } = await supabase.from('cars').insert(batch)

            if (error) {
                console.error(`❌ Batch ${i}-${i + batchSize} hata:`, error.message)
            } else {
                inserted += batch.length
                console.log(`  ✓ ${inserted} / ${carsData.length} araç eklendi`)
            }
        }

        console.log(`✅ Toplam ${inserted} araç başarıyla yüklendi!\n`)
    } catch (error) {
        console.error('❌ Araçlar yüklenirken hata:', error.message)
    }
}

async function seedMotorcycleBrands() {
    console.log('🏍️ Motorsiklet markaları yükleniyor...')

    try {
        const brandsPath = path.join(__dirname, '..', 'moto_brands.json')
        const brandsFile = JSON.parse(fs.readFileSync(brandsPath, 'utf8'))
        const brandsData = brandsFile.data

        const brands = brandsData.map(brand => ({
            name: brand.name
        }))

        const { error, data } = await supabase.from('motorcycle_brands').insert(brands).select()

        if (error) {
            console.error('❌ Markalar yüklenirken hata:', error.message)
        } else {
            console.log(`✅ ${data.length} motorsiklet markası başarıyla yüklendi!\n`)
        }

        // Motorcycles tablosuna da marka bilgilerini ekle
        const motorcycles = brandsData.map(brand => ({
            brand_id: brand.id,
            brand_name: brand.name,
            model_name: null // Modeller ayrıca eklenebilir
        }))

        const { error: motoError } = await supabase.from('motorcycles').insert(motorcycles)

        if (motoError) {
            console.error('❌ Motorcycles tablosuna eklenirken hata:', motoError.message)
        }

    } catch (error) {
        console.error('❌ Motorsiklet markaları yüklenirken hata:', error.message)
    }
}

async function main() {
    console.log('═══════════════════════════════════════')
    console.log('   🏎️  Sinyaldeyiz Veri Import Script')
    console.log('═══════════════════════════════════════\n')

    // URL kontrolü
    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        console.error('❌ HATA: Supabase URL ve Service Role Key\'i ayarla!')
        console.log('\n📝 Seçenekler:')
        console.log('  1. .env.local dosyasına ekle:')
        console.log('     NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co')
        console.log('     SUPABASE_SERVICE_ROLE_KEY=eyJxxx...')
        console.log('\n  2. Bu dosyadaki değişkenleri manuel güncelle')
        console.log('\nService Role Key: Supabase Dashboard → Settings → API → service_role key')
        process.exit(1)
    }

    await seedCars()
    await seedMotorcycleBrands()

    console.log('═══════════════════════════════════════')
    console.log('   ✅ Veri import işlemi tamamlandı!')
    console.log('═══════════════════════════════════════')
}

main().catch(console.error)
