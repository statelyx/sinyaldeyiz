-- Vehicle Catalog Seed Script
-- This script seeds the vehicle_catalog table from arabalar.json data
-- Run this in Supabase SQL Editor after creating the tables

-- Insert vehicle catalog data
-- Note: This is a sample. For full 1666 entries, use the TypeScript script

INSERT INTO vehicle_catalog (id, marka, model, donanim, motor, yakit, vites, fiyat, websitesi) VALUES
  ('1', 'Alfa Romeo', '4C', '1.8 TCT', '1800', 'Benzin', 'Otomatik', '580000', 'http://www.alfaromeo.com.tr/'),
  ('2', 'Alfa Romeo', '4C Spider', '1.8 TCT', '1800', 'Benzin', 'Otomatik', '620000', 'http://www.alfaromeo.com.tr/'),
  ('3', 'Alfa Romeo', 'Giulia', '2.0 200hp SUPER RWD BENZİNLİ AT', '2000', 'Benzin', 'Otomatik', '320000', 'http://www.alfaromeo.com.tr/'),
  ('4', 'Alfa Romeo', 'Giulia', '2.0 280hp VELOCE AWD BENZİNLİ AT', '2000', 'Benzin', 'Otomatik', '380000', 'http://www.alfaromeo.com.tr/'),
  ('5', 'Alfa Romeo', 'Giulia', '2.9 510hp QV RWD BENZİNLİ AT', '2900', 'Benzin', 'Otomatik', '780000', 'http://www.alfaromeo.com.tr/'),
  ('6', 'Alfa Romeo', 'Giulietta', '1.4 TB MULTIAIR SUPER BENZİNLİ TCT', '1400', 'Benzin', 'Otomatik', '121000', 'http://www.alfaromeo.com.tr/'),
  ('7', 'Alfa Romeo', 'Giulietta', '1.6 JTD 120hp PROGRESSION DİZEL MT', '1600', 'Dizel', 'Düz', '114000', 'http://www.alfaromeo.com.tr/'),
  ('8', 'Alfa Romeo', 'Giulietta', '1.6 JTD 120hp SUPER DİZEL MT', '1600', 'Dizel', 'Düz', '121000', 'http://www.alfaromeo.com.tr/'),
  ('9', 'Alfa Romeo', 'Giulietta', '1.6 JTDM 120hp SUPER DİZEL TCT', '1600', 'Dizel', 'Otomatik', '136000', 'http://www.alfaromeo.com.tr/'),
  ('10', 'Alfa Romeo', 'Giulietta', '1.6 JTDM PROGRESSION DİZEL TCT', '1600', 'Dizel', 'Otomatik', '121000', 'http://www.alfaromeo.com.tr/');

-- For the complete dataset, use the TypeScript script below:
-- ts-node scripts/seed-vehicles.ts

-- Verify the seed
SELECT COUNT(*) as total_vehicles FROM vehicle_catalog;
SELECT DISTINCT marka FROM vehicle_catalog ORDER BY marka;
