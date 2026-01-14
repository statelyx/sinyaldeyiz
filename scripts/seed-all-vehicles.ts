/**
 * Full Vehicle Database Import Script
 * Imports all car and motorcycle data from JSON files
 * 
 * Usage:
 *   npx tsx scripts/seed-all-vehicles.ts
 * 
 * Required environment variables:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (recommended) or NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Types for JSON data
interface CarData {
    id: string;
    marka: string;
    model: string;
    donanim: string;
    motor: string;
    yakit: string;
    vites: string;
    fiyat: string;
    websitesi: string;
}

interface MotoBrand {
    id: number;
    name: string;
}

interface MotoModel {
    brand_id: number;
    id: number;
    name: string;
}

// File paths
const ROOT_DIR = path.join(__dirname, '..');
const CARS_FILE = path.join(ROOT_DIR, 'arabalar.json');
const MOTO_BRANDS_FILE = path.join(ROOT_DIR, 'moto_brands.json');
const MOTO_MODELS_FILE = path.join(ROOT_DIR, 'moto_models.json');

async function main() {
    console.log('🚗🏍️ Sinyaldeyiz Full Vehicle Database Import');
    console.log('============================================\n');

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase credentials!');
        console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Connected to Supabase\n');

    // Statistics
    const stats = {
        carBrands: 0,
        carModels: 0,
        carTotal: 0,
        motoBrands: 0,
        motoModels: 0,
    };

    // =========================================
    // PART 1: Import Cars from arabalar.json
    // =========================================
    console.log('📁 Loading arabalar.json...');

    if (!fs.existsSync(CARS_FILE)) {
        console.error('❌ arabalar.json not found at:', CARS_FILE);
    } else {
        const carsRaw = fs.readFileSync(CARS_FILE, 'utf-8');
        const cars: CarData[] = JSON.parse(carsRaw);
        console.log(`   Found ${cars.length} car entries\n`);
        stats.carTotal = cars.length;

        // Extract unique brands
        const uniqueBrands = [...new Set(cars.map(c => c.marka))].filter(Boolean);
        stats.carBrands = uniqueBrands.length;
        console.log(`   ${stats.carBrands} unique car brands found`);

        // Extract unique models per brand
        const brandModels = new Map<string, Set<string>>();
        for (const car of cars) {
            if (!car.marka || !car.model) continue;
            if (!brandModels.has(car.marka)) {
                brandModels.set(car.marka, new Set());
            }
            brandModels.get(car.marka)!.add(car.model);
        }

        let totalModels = 0;
        for (const models of brandModels.values()) {
            totalModels += models.size;
        }
        stats.carModels = totalModels;
        console.log(`   ${stats.carModels} unique car models found\n`);

        // Insert into vehicle_catalog table (if exists)
        console.log('📤 Inserting cars into vehicle_catalog...');

        // Clear existing data (idempotent)
        await supabase.from('vehicle_catalog').delete().gte('id', '');

        // Insert in batches
        const batchSize = 100;
        let inserted = 0;

        for (let i = 0; i < cars.length; i += batchSize) {
            const batch = cars.slice(i, i + batchSize);
            const { error } = await supabase.from('vehicle_catalog').insert(batch);

            if (error) {
                console.error(`   Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
            } else {
                inserted += batch.length;
            }
        }

        console.log(`   ✅ Inserted ${inserted}/${cars.length} cars\n`);
    }

    // =========================================
    // PART 2: Import Moto Brands
    // =========================================
    console.log('📁 Loading moto_brands.json...');

    if (!fs.existsSync(MOTO_BRANDS_FILE)) {
        console.error('❌ moto_brands.json not found at:', MOTO_BRANDS_FILE);
    } else {
        const brandsRaw = fs.readFileSync(MOTO_BRANDS_FILE, 'utf-8');
        const motoBrands: MotoBrand[] = JSON.parse(brandsRaw);
        console.log(`   Found ${motoBrands.length} motorcycle brands\n`);
        stats.motoBrands = motoBrands.length;

        // Insert into moto_brands table
        console.log('📤 Inserting motorcycle brands...');

        // Clear existing (idempotent)
        await supabase.from('moto_brands').delete().gte('id', 0);

        const brandRecords = motoBrands.map(b => ({
            id: b.id,
            name: b.name,
        }));

        const { error: brandError } = await supabase.from('moto_brands').insert(brandRecords);

        if (brandError) {
            console.error('   Error inserting moto brands:', brandError.message);
        } else {
            console.log(`   ✅ Inserted ${motoBrands.length} motorcycle brands\n`);
        }
    }

    // =========================================
    // PART 3: Import Moto Models
    // =========================================
    console.log('📁 Loading moto_models.json...');

    if (!fs.existsSync(MOTO_MODELS_FILE)) {
        console.error('❌ moto_models.json not found at:', MOTO_MODELS_FILE);
    } else {
        const modelsRaw = fs.readFileSync(MOTO_MODELS_FILE, 'utf-8');
        const motoModels: MotoModel[] = JSON.parse(modelsRaw);
        console.log(`   Found ${motoModels.length} motorcycle models\n`);
        stats.motoModels = motoModels.length;

        // Insert into moto_models table
        console.log('📤 Inserting motorcycle models...');

        // Clear existing (idempotent)
        await supabase.from('moto_models').delete().gte('id', 0);

        // Insert in batches of 500 (larger batch for models)
        const batchSize = 500;
        let inserted = 0;

        for (let i = 0; i < motoModels.length; i += batchSize) {
            const batch = motoModels.slice(i, i + batchSize).map(m => ({
                id: m.id,
                brand_id: m.brand_id,
                name: m.name,
            }));

            const { error } = await supabase.from('moto_models').insert(batch);

            if (error) {
                console.error(`   Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
            } else {
                inserted += batch.length;
                process.stdout.write(`   Progress: ${inserted}/${motoModels.length}\r`);
            }
        }

        console.log(`\n   ✅ Inserted ${inserted}/${motoModels.length} motorcycle models\n`);
    }

    // =========================================
    // SUMMARY
    // =========================================
    console.log('\n============================================');
    console.log('📊 IMPORT SUMMARY');
    console.log('============================================');
    console.log(`\n🚗 ARABALAR (Cars):`);
    console.log(`   • Toplam kayıt: ${stats.carTotal}`);
    console.log(`   • Marka sayısı: ${stats.carBrands}`);
    console.log(`   • Model sayısı: ${stats.carModels}`);
    console.log(`\n🏍️ MOTORSIKLET (Motorcycles):`);
    console.log(`   • Marka sayısı: ${stats.motoBrands}`);
    console.log(`   • Model sayısı: ${stats.motoModels}`);
    console.log('\n============================================');
    console.log('✅ Import tamamlandı!');
    console.log('============================================\n');

    // Verify counts
    console.log('🔍 Verifying database counts...');

    const { count: carCount } = await supabase
        .from('vehicle_catalog')
        .select('*', { count: 'exact', head: true });

    const { count: motoBrandCount } = await supabase
        .from('moto_brands')
        .select('*', { count: 'exact', head: true });

    const { count: motoModelCount } = await supabase
        .from('moto_models')
        .select('*', { count: 'exact', head: true });

    console.log(`   vehicle_catalog: ${carCount || 0} records`);
    console.log(`   moto_brands: ${motoBrandCount || 0} records`);
    console.log(`   moto_models: ${motoModelCount || 0} records`);
}

// Run
main()
    .then(() => {
        console.log('\n🏁 Script tamamlandı!');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\n❌ Fatal error:', err);
        process.exit(1);
    });
