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

// Load environment variables from .env.local
function loadEnvFile() {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && !key.startsWith('#') && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                process.env[key] = value;
            }
        });
    }
}

loadEnvFile();

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

interface MotoData {
    data: Array<{
        id: number;
        name: string;
        brand_id?: number;
    }>;
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

        // Get existing car brands to avoid duplicates
        const { data: existingCarBrands } = await supabase
            .from('vehicle_brands')
            .select('id, name')
            .eq('type', 'car');

        const existingCarBrandNames = new Set(existingCarBrands?.map(b => b.name) || []);
        const newCarBrands = uniqueBrands.filter(b => !existingCarBrandNames.has(b));

        console.log(`   ${existingCarBrandNames.size} existing car brands found`);
        console.log(`   ${newCarBrands.length} new car brands to insert\n`);

        // Get max brand ID to avoid conflicts
        const { data: maxBrandResult } = await supabase
            .from('vehicle_brands')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);
        const maxBrandId = maxBrandResult?.[0]?.id || 0;
        let nextBrandId = maxBrandId + 1;

        // Insert into vehicle_brands table
        console.log('📤 Inserting car brands into vehicle_brands...');

        let brandRecords: any[] = [];
        if (newCarBrands.length > 0) {
            brandRecords = newCarBrands.map((brand) => ({
                id: nextBrandId++,
                name: brand,
                type: 'car'
            }));

            const { error: brandError } = await supabase.from('vehicle_brands').insert(brandRecords);

            if (brandError) {
                console.error('   Error inserting car brands:', brandError.message);
            } else {
                console.log(`   ✅ Inserted ${newCarBrands.length} new car brands\n`);
            }
        } else {
            console.log(`   ℹ️ All car brands already exist\n`);
            // Use existing brands for models
            brandRecords = existingCarBrands || [];
        }

        // Get existing models to avoid ID conflicts
        const { data: existingModels } = await supabase
            .from('vehicle_models')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);

        const maxModelId = existingModels && existingModels.length > 0 ? existingModels[0].id : 0;
        let nextModelId = maxModelId + 1;

        // Insert into vehicle_models table
        console.log('📤 Inserting car models into vehicle_models...');

        const modelRecords: any[] = [];

        for (const [brand, models] of brandModels.entries()) {
            const brandId = brandRecords.find(b => b.name === brand)?.id;
            if (!brandId) continue;

            for (const model of models) {
                modelRecords.push({
                    id: nextModelId++,
                    brand_id: brandId,
                    name: model
                });
            }
        }

        // Insert in batches
        const batchSize = 100;
        let inserted = 0;

        for (let i = 0; i < modelRecords.length; i += batchSize) {
            const batch = modelRecords.slice(i, i + batchSize);
            const { error } = await supabase.from('vehicle_models').insert(batch);

            if (error) {
                console.error(`   Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
            } else {
                inserted += batch.length;
            }
        }

        console.log(`   ✅ Inserted ${inserted}/${modelRecords.length} car models\n`);
    }

    // =========================================
    // PART 2: Import Moto Brands
    // =========================================
    console.log('📁 Loading moto_brands.json...');

    // Brand ID mapping from moto_brands.json
    let motoBrandsIdMap = new Map<number, string>(); // JSON brand_id -> brand name

    if (!fs.existsSync(MOTO_BRANDS_FILE)) {
        console.error('❌ moto_brands.json not found at:', MOTO_BRANDS_FILE);
    } else {
        const brandsRaw = fs.readFileSync(MOTO_BRANDS_FILE, 'utf-8');
        const motoData: MotoData = JSON.parse(brandsRaw);
        const motoBrands = motoData.data || [];
        console.log(`   Found ${motoBrands.length} motorcycle brands\n`);
        stats.motoBrands = motoBrands.length;

        // Create ID mapping: JSON brand_id -> brand name
        motoBrands.forEach(b => {
            motoBrandsIdMap.set(b.id, b.name);
        });

        // Get existing motorcycle brands to avoid duplicates
        const { data: existingMotoBrands } = await supabase
            .from('vehicle_brands')
            .select('name')
            .eq('type', 'motorcycle');

        const existingMotoBrandNames = new Set(existingMotoBrands?.map(b => b.name) || []);
        const newMotoBrands = motoBrands.filter(b => !existingMotoBrandNames.has(b.name));

        console.log(`   ${existingMotoBrandNames.size} existing brands found`);
        console.log(`   ${newMotoBrands.length} new brands to insert\n`);

        if (newMotoBrands.length > 0) {
            // Get max current brand ID
            const { data: maxBrandResult } = await supabase
                .from('vehicle_brands')
                .select('id')
                .order('id', { ascending: false })
                .limit(1);
            const maxBrandId = maxBrandResult?.[0]?.id || 0;

            const brandRecords = newMotoBrands.map((b, index) => ({
                id: maxBrandId + index + 1,
                name: b.name,
                type: 'motorcycle'
            }));

            const { error: brandError } = await supabase.from('vehicle_brands').insert(brandRecords);

            if (brandError) {
                console.error('   Error inserting moto brands:', brandError.message);
            } else {
                console.log(`   ✅ Inserted ${newMotoBrands.length} new motorcycle brands\n`);
            }
        } else {
            console.log(`   ℹ️ All motorcycle brands already exist\n`);
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
        const motoData: MotoData = JSON.parse(modelsRaw);
        const motoModels = motoData.data || [];
        console.log(`   Found ${motoModels.length} motorcycle models\n`);
        stats.motoModels = motoModels.length;

        // Get all motorcycle brands from database for ID mapping
        const { data: allMotoBrands } = await supabase
            .from('vehicle_brands')
            .select('id, name')
            .eq('type', 'motorcycle');

        // Create mapping: brand name -> database ID
        const brandNameToId = new Map(allMotoBrands?.map(b => [b.name, b.id]) || []);

        // Get max current model ID
        const { data: maxModelResult } = await supabase
            .from('vehicle_models')
            .select('id')
            .order('id', { ascending: false })
            .limit(1);
        const maxModelId = maxModelResult?.[0]?.id || 0;

        // Insert in batches of 500
        const batchSize = 500;
        let inserted = 0;
        let skipped = 0;

        for (let i = 0; i < motoModels.length; i += batchSize) {
            const batch = motoModels.slice(i, i + batchSize).map((m, idx) => {
                // Get brand name from moto_brands.json using brand_id
                if (!m.brand_id) {
                    skipped++;
                    return null;
                }
                const brandName = motoBrandsIdMap.get(m.brand_id);
                if (!brandName) {
                    skipped++;
                    return null;
                }

                // Get database ID from brand name
                const brandId = brandNameToId.get(brandName);
                if (!brandId) {
                    skipped++;
                    return null;
                }

                return {
                    id: maxModelId + i + idx + 1,
                    brand_id: brandId,
                    name: m.name
                };
            }).filter(m => m !== null); // Filter out null entries

            if (batch.length === 0) continue;

            const { error } = await supabase.from('vehicle_models').insert(batch);

            if (error) {
                console.error(`   Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
            } else {
                inserted += batch.length;
                process.stdout.write(`   Progress: ${inserted}/${motoModels.length}\r`);
            }
        }

        console.log(`\n   ✅ Inserted ${inserted}/${motoModels.length} motorcycle models (skipped: ${skipped})\n`);
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

    const { count: brandCount } = await supabase
        .from('vehicle_brands')
        .select('*', { count: 'exact', head: true });

    const { count: modelCount } = await supabase
        .from('vehicle_models')
        .select('*', { count: 'exact', head: true });

    console.log(`   vehicle_brands: ${brandCount || 0} records`);
    console.log(`   vehicle_models: ${modelCount || 0} records`);
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
