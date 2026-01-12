import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read vehicle data from arabalar.json
const vehicleDataPath = path.join(__dirname, '../../data/arabalar.json');

interface VehicleData {
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

async function seedVehicles() {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Read vehicle data
  console.log('Reading vehicle data from', vehicleDataPath);
  const rawData = fs.readFileSync(vehicleDataPath, 'utf-8');
  const vehicles: VehicleData[] = JSON.parse(rawData);

  console.log(`Found ${vehicles.length} vehicles to seed.`);

  // Process in batches of 100
  const batchSize = 100;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < vehicles.length; i += batchSize) {
    const batch = vehicles.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vehicles.length / batchSize)}...`);

    try {
      const { error } = await supabase
        .from('vehicle_catalog')
        .insert(batch);

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        errorCount += batch.length;
      } else {
        console.log(`Successfully inserted batch ${Math.floor(i / batchSize) + 1}`);
        successCount += batch.length;
      }
    } catch (err) {
      console.error(`Exception in batch ${Math.floor(i / batchSize) + 1}:`, err);
      errorCount += batch.length;
    }
  }

  console.log('\n=== Seeding Complete ===');
  console.log(`Total vehicles: ${vehicles.length}`);
  console.log(`Successfully seeded: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  // Verify the seed
  const { count } = await supabase
    .from('vehicle_catalog')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal vehicles in database: ${count}`);

  // Get unique brands
  const { data: brands } = await supabase
    .from('vehicle_catalog')
    .select('marka');

  const uniqueBrands = [...new Set(brands?.map(b => b.marka) || [])];
  console.log(`\nUnique brands: ${uniqueBrands.length}`);
  console.log('Brands:', uniqueBrands.sort().join(', '));
}

// Run the seed
seedVehicles()
  .then(() => {
    console.log('\nSeed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
