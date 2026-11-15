#!/usr/bin/env node
// Run once to bake coordinates into restaurants.json:
//   VITE_MAPBOX_TOKEN=pk.xxx node scripts/geocode.js

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '../src/data/restaurants.json');

const token = process.env.VITE_MAPBOX_TOKEN;
if (!token) {
  console.error('Set VITE_MAPBOX_TOKEN before running this script.');
  process.exit(1);
}

const restaurants = JSON.parse(readFileSync(dataPath, 'utf8'));

const alreadyDone = restaurants.filter((r) => r.coordinates).length;
if (alreadyDone === restaurants.length) {
  console.log('All restaurants already have coordinates. Nothing to do.');
  process.exit(0);
}

const toGeocode = restaurants.filter((r) => !r.coordinates);
console.log(`Geocoding ${toGeocode.length} restaurants...`);

const requestBody = toGeocode.map((r) => ({
  types: ['address'],
  q: r.address,
  bbox: [-122.6, 47.0, -121.9, 47.9],
  limit: 1
}));

const response = await fetch(
  `https://api.mapbox.com/search/geocode/v6/batch?access_token=${token}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  }
);

if (!response.ok) {
  console.error(`Mapbox API error: ${response.status} ${response.statusText}`);
  process.exit(1);
}

const { batch } = await response.json();
let filled = 0;
let missed = 0;

batch.forEach((featureCollection, i) => {
  const restaurant = toGeocode[i];
  if (featureCollection?.features?.length > 0) {
    const [lng, lat] = featureCollection.features[0].geometry.coordinates;
    restaurant.coordinates = [lng, lat];
    filled++;
  } else {
    console.warn(`  No result for: ${restaurant.name} (${restaurant.address})`);
    missed++;
  }
});

writeFileSync(dataPath, JSON.stringify(restaurants, null, 2));
console.log(`Done. ${filled} filled, ${missed} missed.`);
