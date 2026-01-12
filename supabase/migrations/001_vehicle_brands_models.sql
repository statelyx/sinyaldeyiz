-- =====================================================
-- SINYALDEYIZ - Vehicle Database Setup
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create vehicle_brands table
CREATE TABLE IF NOT EXISTS vehicle_brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('car', 'motorcycle')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create vehicle_models table
CREATE TABLE IF NOT EXISTS vehicle_models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER NOT NULL REFERENCES vehicle_brands(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_type ON vehicle_brands(type);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand_id ON vehicle_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_brands_name ON vehicle_brands(name);

-- 4. Enable RLS
ALTER TABLE vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_models ENABLE ROW LEVEL SECURITY;

-- 5. Create read-only policies (everyone can read)
CREATE POLICY "Anyone can read vehicle_brands" ON vehicle_brands FOR SELECT USING (true);
CREATE POLICY "Anyone can read vehicle_models" ON vehicle_models FOR SELECT USING (true);

-- =====================================================
-- INSERT CAR BRANDS (71 brands)
-- =====================================================
INSERT INTO vehicle_brands (id, name, type) VALUES
(1, 'Acura', 'car'),
(2, 'Alfa Romeo', 'car'),
(3, 'AMC', 'car'),
(4, 'Aston Martin', 'car'),
(5, 'Audi', 'car'),
(6, 'Avanti', 'car'),
(7, 'Bentley', 'car'),
(8, 'BMW', 'car'),
(9, 'Buick', 'car'),
(10, 'Cadillac', 'car'),
(11, 'Chevrolet', 'car'),
(12, 'Chrysler', 'car'),
(13, 'Daewoo', 'car'),
(14, 'Daihatsu', 'car'),
(15, 'Datsun', 'car'),
(16, 'DeLorean', 'car'),
(17, 'Dodge', 'car'),
(18, 'Eagle', 'car'),
(19, 'Ferrari', 'car'),
(20, 'FIAT', 'car'),
(21, 'Fisker', 'car'),
(22, 'Ford', 'car'),
(23, 'Freightliner', 'car'),
(24, 'Geo', 'car'),
(25, 'GMC', 'car'),
(26, 'Honda', 'car'),
(27, 'HUMMER', 'car'),
(28, 'Hyundai', 'car'),
(29, 'Infiniti', 'car'),
(30, 'Isuzu', 'car'),
(31, 'Jaguar', 'car'),
(32, 'Jeep', 'car'),
(33, 'Kia', 'car'),
(34, 'Lamborghini', 'car'),
(35, 'Lancia', 'car'),
(36, 'Land Rover', 'car'),
(37, 'Lexus', 'car'),
(38, 'Lincoln', 'car'),
(39, 'Lotus', 'car'),
(40, 'Maserati', 'car'),
(41, 'Maybach', 'car'),
(42, 'Mazda', 'car'),
(43, 'McLaren', 'car'),
(44, 'Mercedes-Benz', 'car'),
(45, 'Mercury', 'car'),
(46, 'Merkur', 'car'),
(47, 'MINI', 'car'),
(48, 'Mitsubishi', 'car'),
(49, 'Nissan', 'car'),
(50, 'Oldsmobile', 'car'),
(51, 'Peugeot', 'car'),
(52, 'Plymouth', 'car'),
(53, 'Pontiac', 'car'),
(54, 'Porsche', 'car'),
(55, 'RAM', 'car'),
(56, 'Renault', 'car'),
(57, 'Rolls-Royce', 'car'),
(58, 'Saab', 'car'),
(59, 'Saturn', 'car'),
(60, 'Scion', 'car'),
(61, 'smart', 'car'),
(62, 'SRT', 'car'),
(63, 'Sterling', 'car'),
(64, 'Subaru', 'car'),
(65, 'Suzuki', 'car'),
(66, 'Tesla', 'car'),
(67, 'Toyota', 'car'),
(68, 'Triumph', 'car'),
(69, 'Volkswagen', 'car'),
(70, 'Volvo', 'car'),
(71, 'Yugo', 'car')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INSERT MOTORCYCLE BRANDS (120 brands) - IDs start at 1000
-- =====================================================
INSERT INTO vehicle_brands (id, name, type) VALUES
(1001, 'AJP', 'motorcycle'),
(1002, 'Adiva', 'motorcycle'),
(1003, 'Aeon', 'motorcycle'),
(1004, 'Aprilia', 'motorcycle'),
(1005, 'Aspess Power', 'motorcycle'),
(1006, 'Axy', 'motorcycle'),
(1007, 'Azel', 'motorcycle'),
(1008, 'BMW', 'motorcycle'),
(1009, 'Bajaj', 'motorcycle'),
(1010, 'Benelli', 'motorcycle'),
(1011, 'Beta', 'motorcycle'),
(1012, 'Bimota', 'motorcycle'),
(1013, 'Borile', 'motorcycle'),
(1014, 'Boss Hoss', 'motorcycle'),
(1015, 'Buell', 'motorcycle'),
(1016, 'Bultaco', 'motorcycle'),
(1017, 'CCM', 'motorcycle'),
(1018, 'CF Moto', 'motorcycle'),
(1019, 'CH Racing', 'motorcycle'),
(1020, 'CMC', 'motorcycle'),
(1021, 'CPI', 'motorcycle'),
(1022, 'CR&S', 'motorcycle'),
(1023, 'Cagiva', 'motorcycle'),
(1024, 'Dado Motors', 'motorcycle'),
(1025, 'Daelim', 'motorcycle'),
(1026, 'Derbi', 'motorcycle'),
(1027, 'Ducati', 'motorcycle'),
(1028, 'E-Tropolis', 'motorcycle'),
(1029, 'E-max', 'motorcycle'),
(1030, 'Ecomission', 'motorcycle'),
(1031, 'Fantic Motor', 'motorcycle'),
(1032, 'Garelli', 'motorcycle'),
(1033, 'Gas Gas', 'motorcycle'),
(1034, 'Generic', 'motorcycle'),
(1035, 'Ghezzi-Brian', 'motorcycle'),
(1036, 'GiMotori', 'motorcycle'),
(1037, 'GiPuma', 'motorcycle'),
(1038, 'Gilera', 'motorcycle'),
(1039, 'Green Mobility Italia', 'motorcycle'),
(1040, 'HDM', 'motorcycle'),
(1041, 'HM', 'motorcycle'),
(1042, 'HP Power', 'motorcycle'),
(1043, 'Harley-Davidson', 'motorcycle'),
(1044, 'Headbanger', 'motorcycle'),
(1045, 'Honda', 'motorcycle'),
(1046, 'Honda Dall''Ara', 'motorcycle'),
(1047, 'Hupper', 'motorcycle'),
(1048, 'Husaberg', 'motorcycle'),
(1049, 'Husqvarna', 'motorcycle'),
(1050, 'Hyosung', 'motorcycle'),
(1051, 'Indian', 'motorcycle'),
(1052, 'Italjet', 'motorcycle'),
(1053, 'Jawa', 'motorcycle'),
(1054, 'KRC', 'motorcycle'),
(1055, 'KTM', 'motorcycle'),
(1056, 'Kawasaki', 'motorcycle'),
(1057, 'Kawasaki KL', 'motorcycle'),
(1058, 'Keeway', 'motorcycle'),
(1059, 'Kreidler', 'motorcycle'),
(1060, 'Kymco', 'motorcycle'),
(1061, 'LML', 'motorcycle'),
(1062, 'Lambretta', 'motorcycle'),
(1063, 'Laverda', 'motorcycle'),
(1064, 'Leonart', 'motorcycle'),
(1065, 'Lingben', 'motorcycle'),
(1066, 'Linhai', 'motorcycle'),
(1067, 'MBK', 'motorcycle'),
(1068, 'MV Agusta', 'motorcycle'),
(1069, 'MZ', 'motorcycle'),
(1070, 'Magni', 'motorcycle'),
(1071, 'Maico', 'motorcycle'),
(1072, 'Malaguti', 'motorcycle'),
(1073, 'Mash', 'motorcycle'),
(1074, 'Millepercento', 'motorcycle'),
(1075, 'Mondial', 'motorcycle'),
(1076, 'Montesa', 'motorcycle'),
(1077, 'Moto Bellini', 'motorcycle'),
(1078, 'Moto Guzzi', 'motorcycle'),
(1079, 'Moto Morini', 'motorcycle'),
(1080, 'Moto Rumi', 'motorcycle'),
(1081, 'MotoBi', 'motorcycle'),
(1082, 'Motom', 'motorcycle'),
(1083, 'Motor Union', 'motorcycle'),
(1084, 'Nipponia', 'motorcycle'),
(1085, 'Norton', 'motorcycle'),
(1086, 'Nox', 'motorcycle'),
(1087, 'Ossa', 'motorcycle'),
(1088, 'Over', 'motorcycle'),
(1089, 'PGO', 'motorcycle'),
(1090, 'Paton', 'motorcycle'),
(1091, 'Peda Motor', 'motorcycle'),
(1092, 'Peugeot', 'motorcycle'),
(1093, 'Piaggio', 'motorcycle'),
(1094, 'Polini', 'motorcycle'),
(1095, 'Quadro', 'motorcycle'),
(1096, 'Quantya', 'motorcycle'),
(1097, 'RedMoto Honda', 'motorcycle'),
(1098, 'Renault', 'motorcycle'),
(1099, 'Rieju', 'motorcycle'),
(1100, 'Royal Enfield', 'motorcycle'),
(1101, 'SWM', 'motorcycle'),
(1102, 'Sachs', 'motorcycle'),
(1103, 'Scorpa', 'motorcycle'),
(1104, 'Sherco', 'motorcycle'),
(1105, 'Siamoto', 'motorcycle'),
(1106, 'Steed', 'motorcycle'),
(1107, 'Suzuki', 'motorcycle'),
(1108, 'Suzuki Valenti', 'motorcycle'),
(1109, 'Sym', 'motorcycle'),
(1110, 'TGB', 'motorcycle'),
(1111, 'TM Racing', 'motorcycle'),
(1112, 'Terra Modena', 'motorcycle'),
(1113, 'Triumph', 'motorcycle'),
(1114, 'Ural', 'motorcycle'),
(1115, 'Vectrix', 'motorcycle'),
(1116, 'Vertemati', 'motorcycle'),
(1117, 'Victory', 'motorcycle'),
(1118, 'Vor', 'motorcycle'),
(1119, 'WT Motors', 'motorcycle'),
(1120, 'Yamaha', 'motorcycle')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POPULAR CAR MODELS (Sample - most common brands)
-- =====================================================

-- Audi models (brand_id: 5)
INSERT INTO vehicle_models (brand_id, name) VALUES
(5, 'A1'), (5, 'A3'), (5, 'A4'), (5, 'A5'), (5, 'A6'), (5, 'A7'), (5, 'A8'),
(5, 'Q2'), (5, 'Q3'), (5, 'Q5'), (5, 'Q7'), (5, 'Q8'),
(5, 'TT'), (5, 'R8'), (5, 'RS3'), (5, 'RS4'), (5, 'RS5'), (5, 'RS6'), (5, 'RS7'),
(5, 'e-tron'), (5, 'e-tron GT');

-- BMW models (brand_id: 8)
INSERT INTO vehicle_models (brand_id, name) VALUES
(8, '1 Series'), (8, '2 Series'), (8, '3 Series'), (8, '4 Series'), (8, '5 Series'),
(8, '6 Series'), (8, '7 Series'), (8, '8 Series'),
(8, 'X1'), (8, 'X2'), (8, 'X3'), (8, 'X4'), (8, 'X5'), (8, 'X6'), (8, 'X7'),
(8, 'Z4'), (8, 'i3'), (8, 'i4'), (8, 'iX'), (8, 'iX3'),
(8, 'M2'), (8, 'M3'), (8, 'M4'), (8, 'M5'), (8, 'M8');

-- Mercedes-Benz models (brand_id: 44)
INSERT INTO vehicle_models (brand_id, name) VALUES
(44, 'A-Class'), (44, 'B-Class'), (44, 'C-Class'), (44, 'E-Class'), (44, 'S-Class'),
(44, 'CLA'), (44, 'CLS'), (44, 'GLA'), (44, 'GLB'), (44, 'GLC'), (44, 'GLE'), (44, 'GLS'),
(44, 'AMG GT'), (44, 'EQC'), (44, 'EQS'), (44, 'EQE'),
(44, 'Maybach S-Class'), (44, 'G-Class');

-- Volkswagen models (brand_id: 69)
INSERT INTO vehicle_models (brand_id, name) VALUES
(69, 'Polo'), (69, 'Golf'), (69, 'Jetta'), (69, 'Passat'), (69, 'Arteon'),
(69, 'T-Cross'), (69, 'T-Roc'), (69, 'Tiguan'), (69, 'Touareg'),
(69, 'ID.3'), (69, 'ID.4'), (69, 'ID.5'), (69, 'ID.Buzz'),
(69, 'Caddy'), (69, 'Transporter'), (69, 'Amarok');

-- Toyota models (brand_id: 67)
INSERT INTO vehicle_models (brand_id, name) VALUES
(67, 'Yaris'), (67, 'Corolla'), (67, 'Camry'), (67, 'Avalon'),
(67, 'C-HR'), (67, 'RAV4'), (67, 'Highlander'), (67, 'Land Cruiser'),
(67, 'Supra'), (67, 'GR86'), (67, 'Prius'), (67, 'bZ4X'),
(67, 'Hilux'), (67, 'Tacoma'), (67, 'Tundra');

-- Honda models (brand_id: 26)
INSERT INTO vehicle_models (brand_id, name) VALUES
(26, 'Jazz'), (26, 'Civic'), (26, 'Accord'), (26, 'Insight'),
(26, 'HR-V'), (26, 'CR-V'), (26, 'Pilot'), (26, 'Passport'),
(26, 'NSX'), (26, 'e'), (26, 'e:Ny1');

-- Ford models (brand_id: 22)
INSERT INTO vehicle_models (brand_id, name) VALUES
(22, 'Fiesta'), (22, 'Focus'), (22, 'Mondeo'), (22, 'Mustang'),
(22, 'Puma'), (22, 'Kuga'), (22, 'Explorer'), (22, 'Bronco'),
(22, 'F-150'), (22, 'Ranger'), (22, 'Mustang Mach-E');

-- Tesla models (brand_id: 66)
INSERT INTO vehicle_models (brand_id, name) VALUES
(66, 'Model 3'), (66, 'Model Y'), (66, 'Model S'), (66, 'Model X'),
(66, 'Cybertruck'), (66, 'Roadster');

-- Porsche models (brand_id: 54)
INSERT INTO vehicle_models (brand_id, name) VALUES
(54, '911'), (54, '718 Cayman'), (54, '718 Boxster'),
(54, 'Panamera'), (54, 'Taycan'),
(54, 'Macan'), (54, 'Cayenne');

-- Ferrari models (brand_id: 19)
INSERT INTO vehicle_models (brand_id, name) VALUES
(19, '296 GTB'), (19, '296 GTS'), (19, 'SF90'), (19, 'F8 Tributo'),
(19, 'Roma'), (19, 'Portofino M'), (19, '812'), (19, 'Purosangue'),
(19, 'Daytona SP3');

-- Lamborghini models (brand_id: 34)
INSERT INTO vehicle_models (brand_id, name) VALUES
(34, 'Huracán'), (34, 'Huracán EVO'), (34, 'Huracán Tecnica'),
(34, 'Urus'), (34, 'Revuelto');

-- Hyundai models (brand_id: 28)
INSERT INTO vehicle_models (brand_id, name) VALUES
(28, 'i10'), (28, 'i20'), (28, 'i30'), (28, 'Elantra'),
(28, 'Kona'), (28, 'Tucson'), (28, 'Santa Fe'), (28, 'Palisade'),
(28, 'IONIQ 5'), (28, 'IONIQ 6'), (28, 'N Vision 74');

-- Kia models (brand_id: 33)
INSERT INTO vehicle_models (brand_id, name) VALUES
(33, 'Picanto'), (33, 'Rio'), (33, 'Ceed'), (33, 'Forte'),
(33, 'Stonic'), (33, 'Sportage'), (33, 'Sorento'), (33, 'Telluride'),
(33, 'EV6'), (33, 'EV9'), (33, 'Stinger');

-- =====================================================
-- POPULAR MOTORCYCLE MODELS
-- =====================================================

-- Honda Motorcycle models (brand_id: 1045)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1045, 'CBR600RR'), (1045, 'CBR1000RR'), (1045, 'CB650R'), (1045, 'CB1000R'),
(1045, 'Africa Twin'), (1045, 'NC750X'), (1045, 'X-ADV'),
(1045, 'Gold Wing'), (1045, 'Rebel 500'), (1045, 'Rebel 1100'),
(1045, 'PCX'), (1045, 'Forza'), (1045, 'ADV150');

-- Yamaha Motorcycle models (brand_id: 1120)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1120, 'YZF-R1'), (1120, 'YZF-R6'), (1120, 'YZF-R7'), (1120, 'YZF-R3'),
(1120, 'MT-09'), (1120, 'MT-07'), (1120, 'MT-10'), (1120, 'MT-03'),
(1120, 'Tracer 9'), (1120, 'Tracer 7'), (1120, 'Tenere 700'),
(1120, 'XMAX'), (1120, 'TMAX'), (1120, 'NMAX');

-- Kawasaki Motorcycle models (brand_id: 1056)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1056, 'Ninja ZX-10R'), (1056, 'Ninja ZX-6R'), (1056, 'Ninja 650'), (1056, 'Ninja 400'),
(1056, 'Z900'), (1056, 'Z650'), (1056, 'Z400'), (1056, 'Z H2'),
(1056, 'Versys 1000'), (1056, 'Versys 650'),
(1056, 'Vulcan S'), (1056, 'W800');

-- Suzuki Motorcycle models (brand_id: 1107)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1107, 'GSX-R1000'), (1107, 'GSX-R750'), (1107, 'GSX-R600'),
(1107, 'GSX-S1000'), (1107, 'GSX-S750'), (1107, 'GSX-8S'),
(1107, 'V-Strom 1050'), (1107, 'V-Strom 650'),
(1107, 'Hayabusa'), (1107, 'Katana'), (1107, 'SV650');

-- Ducati Motorcycle models (brand_id: 1027)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1027, 'Panigale V4'), (1027, 'Panigale V2'), (1027, 'Streetfighter V4'),
(1027, 'Monster'), (1027, 'Diavel'), (1027, 'XDiavel'),
(1027, 'Multistrada V4'), (1027, 'DesertX'),
(1027, 'Scrambler'), (1027, 'SuperSport');

-- KTM Motorcycle models (brand_id: 1055)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1055, '1290 Super Duke R'), (1055, '890 Duke'), (1055, '790 Duke'), (1055, '390 Duke'),
(1055, 'RC 390'), (1055, 'RC 8C'),
(1055, '1290 Super Adventure'), (1055, '890 Adventure'),
(1055, '450 EXC-F'), (1055, '350 EXC-F');

-- BMW Motorcycle models (brand_id: 1008)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1008, 'S1000RR'), (1008, 'S1000R'), (1008, 'S1000XR'),
(1008, 'R1250GS'), (1008, 'R1250GS Adventure'), (1008, 'R1250RT'),
(1008, 'F900R'), (1008, 'F900XR'), (1008, 'F750GS'), (1008, 'F850GS'),
(1008, 'R nineT'), (1008, 'R18'), (1008, 'CE 04');

-- Harley-Davidson Motorcycle models (brand_id: 1043)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1043, 'Street Glide'), (1043, 'Road Glide'), (1043, 'Road King'),
(1043, 'Fat Boy'), (1043, 'Fat Bob'), (1043, 'Softail Standard'),
(1043, 'Iron 883'), (1043, 'Sportster S'),
(1043, 'Pan America'), (1043, 'LiveWire');

-- Triumph Motorcycle models (brand_id: 1113)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1113, 'Street Triple'), (1113, 'Speed Triple'), (1113, 'Tiger 900'),
(1113, 'Tiger 1200'), (1113, 'Bonneville T120'), (1113, 'Thruxton'),
(1113, 'Rocket 3'), (1113, 'Trident 660');

-- Aprilia Motorcycle models (brand_id: 1004)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1004, 'RSV4'), (1004, 'RS 660'), (1004, 'Tuono V4'),
(1004, 'Tuono 660'), (1004, 'Shiver'), (1004, 'Dorsoduro'),
(1004, 'SR GT');

-- MV Agusta Motorcycle models (brand_id: 1068)
INSERT INTO vehicle_models (brand_id, name) VALUES
(1068, 'F3'), (1068, 'F4'), (1068, 'Brutale'),
(1068, 'Dragster'), (1068, 'Turismo Veloce'), (1068, 'Superveloce');

-- Reset sequence to avoid conflicts
SELECT setval('vehicle_brands_id_seq', (SELECT MAX(id) FROM vehicle_brands));
SELECT setval('vehicle_models_id_seq', (SELECT MAX(id) FROM vehicle_models));

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify data was inserted:
-- SELECT type, COUNT(*) FROM vehicle_brands GROUP BY type;
-- SELECT b.name as brand, COUNT(m.id) as model_count 
-- FROM vehicle_brands b 
-- LEFT JOIN vehicle_models m ON b.id = m.brand_id 
-- GROUP BY b.id, b.name 
-- ORDER BY model_count DESC LIMIT 20;
