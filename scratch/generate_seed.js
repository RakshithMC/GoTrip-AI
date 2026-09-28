import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataTsPath = path.join(__dirname, '../services/data.ts');
const dataTsContent = fs.readFileSync(dataTsPath, 'utf8');

// Parse out cities, attractions, accommodations, restaurants from data.ts
const mockDbMatch = dataTsContent.match(/export const MOCK_DB[:\s\S]*?=\s*(\{[\s\S]*?\n\};)/);

if (!mockDbMatch) {
  console.error("Could not find MOCK_DB in data.ts");
  process.exit(1);
}

const mockDbCode = mockDbMatch[1];
const MOCK_DB = eval('(' + mockDbCode + ')');

console.log(`Found Catalog Records:`);
console.log(`- Cities: ${MOCK_DB.cities.length}`);
console.log(`- Attractions: ${MOCK_DB.attractions.length}`);
console.log(`- Accommodations: ${MOCK_DB.accommodations.length}`);
console.log(`- Restaurants: ${MOCK_DB.restaurants.length}`);

// Data Integrity Checks
const cityIdSet = new Set(MOCK_DB.cities.map(c => c.id));
const orphanAttractions = MOCK_DB.attractions.filter(a => !cityIdSet.has(a.cityId));
const orphanAccommodations = MOCK_DB.accommodations.filter(a => !cityIdSet.has(a.cityId));
const orphanRestaurants = MOCK_DB.restaurants.filter(r => !cityIdSet.has(r.cityId));

console.log("\nIntegrity Verification:");
console.log(`- Orphan Attractions: ${orphanAttractions.length}`);
console.log(`- Orphan Accommodations: ${orphanAccommodations.length}`);
console.log(`- Orphan Restaurants: ${orphanRestaurants.length}`);

function findDuplicates(arr) {
  const seen = new Set();
  const dupes = [];
  for (const item of arr) {
    if (seen.has(item.id)) dupes.push(item.id);
    else seen.add(item.id);
  }
  return dupes;
}

console.log(`- Duplicate City IDs: ${findDuplicates(MOCK_DB.cities).length}`);
console.log(`- Duplicate Attraction IDs: ${findDuplicates(MOCK_DB.attractions).length}`);
console.log(`- Duplicate Accommodation IDs: ${findDuplicates(MOCK_DB.accommodations).length}`);
console.log(`- Duplicate Restaurant IDs: ${findDuplicates(MOCK_DB.restaurants).length}`);

// Helper SQL escaping functions
function sqlStr(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function sqlNum(num) {
  if (num === null || num === undefined || isNaN(num)) return 'NULL';
  return String(num);
}

function sqlJson(obj) {
  if (obj === null || obj === undefined) return 'NULL';
  return sqlStr(JSON.stringify(obj)) + '::jsonb';
}

// Generate SQL lines
let sql = `-- GoTrip AI Catalog Seed Migration
-- Migration File: 002_seed_gotrip_catalog.sql
-- Contains static travel catalog data for cities, attractions, accommodations, and restaurants.

`;

// 1. CITIES SEED
sql += `-- ==========================================\n`;
sql += `-- 1. SEED CITIES (${MOCK_DB.cities.length} records)\n`;
sql += `-- ==========================================\n`;
sql += `INSERT INTO cities (id, name, country, base_flight, avg_hotel, image, experiences, best_time)\nVALUES\n`;

const cityRows = MOCK_DB.cities.map(c => 
  `  (${sqlStr(c.id)}, ${sqlStr(c.name)}, ${sqlStr(c.country)}, ${sqlNum(c.baseFlight)}, ${sqlNum(c.avgHotel)}, ${sqlStr(c.image)}, ${sqlJson(c.experiences || [])}, ${sqlStr(c.bestTime)})`
);
sql += cityRows.join(',\n');
sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
sql += `  name = EXCLUDED.name,\n  country = EXCLUDED.country,\n  base_flight = EXCLUDED.base_flight,\n  avg_hotel = EXCLUDED.avg_hotel,\n  image = EXCLUDED.image,\n  experiences = EXCLUDED.experiences,\n  best_time = EXCLUDED.best_time;\n\n`;

// 2. ATTRACTIONS SEED
sql += `-- ==========================================\n`;
sql += `-- 2. SEED ATTRACTIONS (${MOCK_DB.attractions.length} records)\n`;
sql += `-- ==========================================\n`;
sql += `INSERT INTO attractions (id, city_id, name, category, rating, price, price_value, image, gallery, description, hours, address, website, map_uri)\nVALUES\n`;

const attrRows = MOCK_DB.attractions.map(a =>
  `  (${sqlStr(a.id)}, ${sqlStr(a.cityId)}, ${sqlStr(a.name)}, ${sqlStr(a.category)}, ${sqlNum(a.rating)}, ${sqlStr(a.price)}, ${sqlNum(a.priceValue)}, ${sqlStr(a.image)}, ${sqlJson(a.gallery || [])}, ${sqlStr(a.description)}, ${sqlStr(a.hours)}, ${sqlStr(a.address)}, ${sqlStr(a.website)}, ${sqlStr(a.mapUri)})`
);
sql += attrRows.join(',\n');
sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
sql += `  city_id = EXCLUDED.city_id,\n  name = EXCLUDED.name,\n  category = EXCLUDED.category,\n  rating = EXCLUDED.rating,\n  price = EXCLUDED.price,\n  price_value = EXCLUDED.price_value,\n  image = EXCLUDED.image,\n  gallery = EXCLUDED.gallery,\n  description = EXCLUDED.description,\n  hours = EXCLUDED.hours,\n  address = EXCLUDED.address,\n  website = EXCLUDED.website,\n  map_uri = EXCLUDED.map_uri;\n\n`;

// 3. ACCOMMODATIONS SEED
sql += `-- ==========================================\n`;
sql += `-- 3. SEED ACCOMMODATIONS (${MOCK_DB.accommodations.length} records)\n`;
sql += `-- ==========================================\n`;
sql += `INSERT INTO accommodations (id, city_id, name, type, rating, price, price_value, price_per_night, image, website, address, amenities)\nVALUES\n`;

const accRows = MOCK_DB.accommodations.map(acc =>
  `  (${sqlStr(acc.id)}, ${sqlStr(acc.cityId)}, ${sqlStr(acc.name)}, ${sqlStr(acc.type)}, ${sqlNum(acc.rating)}, ${sqlStr(acc.price)}, ${sqlNum(acc.priceValue)}, ${sqlNum(acc.pricePerNight || acc.priceValue)}, ${sqlStr(acc.image)}, ${sqlStr(acc.website)}, ${sqlStr(acc.address)}, ${sqlJson(acc.amenities || [])})`
);
sql += accRows.join(',\n');
sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
sql += `  city_id = EXCLUDED.city_id,\n  name = EXCLUDED.name,\n  type = EXCLUDED.type,\n  rating = EXCLUDED.rating,\n  price = EXCLUDED.price,\n  price_value = EXCLUDED.price_value,\n  price_per_night = EXCLUDED.price_per_night,\n  image = EXCLUDED.image,\n  website = EXCLUDED.website,\n  address = EXCLUDED.address,\n  amenities = EXCLUDED.amenities;\n\n`;

// 4. RESTAURANTS SEED
sql += `-- ==========================================\n`;
sql += `-- 4. SEED RESTAURANTS (${MOCK_DB.restaurants.length} records)\n`;
sql += `-- ==========================================\n`;
sql += `INSERT INTO restaurants (id, city_id, name, cuisine, rating, price, price_value, image, website)\nVALUES\n`;

const restRows = MOCK_DB.restaurants.map(r =>
  `  (${sqlStr(r.id)}, ${sqlStr(r.cityId)}, ${sqlStr(r.name)}, ${sqlStr(r.cuisine)}, ${sqlNum(r.rating)}, ${sqlStr(r.price)}, ${sqlNum(r.priceValue)}, ${sqlStr(r.image)}, ${sqlStr(r.website)})`
);
sql += restRows.join(',\n');
sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
sql += `  city_id = EXCLUDED.city_id,\n  name = EXCLUDED.name,\n  cuisine = EXCLUDED.cuisine,\n  rating = EXCLUDED.rating,\n  price = EXCLUDED.price,\n  price_value = EXCLUDED.price_value,\n  image = EXCLUDED.image,\n  website = EXCLUDED.website;\n`;

// Write target file
const targetPath = path.join(__dirname, '../supabase/migrations/002_seed_gotrip_catalog.sql');
fs.writeFileSync(targetPath, sql, 'utf8');
console.log(`\nSuccessfully written seed migration to: ${targetPath}`);
