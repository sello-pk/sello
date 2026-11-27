/**
 * Stage A only: fetch Pakistan source pages for the local test matrix.
 * Does not call JAG9. Writes fixtures under server/docs/compare-fixtures/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectSources, candidateUrls } from '../services/compare/sourceCollector.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../docs/compare-fixtures');

const matrix = [
  { make: 'Toyota', model: 'Corolla', year: 2019, variant: 'GLi', fuelType: 'Petrol', transmission: 'Automatic' },
  { make: 'Toyota', model: 'Corolla', year: 2019, variant: 'Altis', fuelType: 'Petrol', transmission: 'Automatic' },
  { make: 'Honda', model: 'Civic', year: 2020, variant: '', fuelType: 'Petrol', transmission: 'Automatic' },
  { make: 'Suzuki', model: 'Alto', year: 2022, variant: 'VX', fuelType: 'Petrol', transmission: 'Manual' },
  { make: 'Suzuki', model: 'Cultus', year: 2021, variant: 'VXL', fuelType: 'Petrol', transmission: 'Automatic' },
  { make: 'Toyota', model: 'Yaris', year: 2021, variant: '', fuelType: 'Petrol', transmission: 'Automatic' },
  { make: 'Honda', model: 'City', year: 2021, variant: '', fuelType: 'Petrol', transmission: 'Automatic' },
  { make: 'KIA', model: 'Sportage', year: 2022, variant: '', fuelType: 'Petrol', transmission: 'Automatic' },
  { make: 'Hyundai', model: 'Tucson', year: 2022, variant: '', fuelType: 'Petrol', transmission: 'Automatic' },
  { make: 'MG', model: 'HS', year: 2023, variant: '', fuelType: 'Plug-in Hybrid (PHEV)', transmission: 'Automatic' },
  { make: 'Changan', model: 'Alsvin', year: 2022, variant: '', fuelType: 'Petrol', transmission: 'CVT' },
  { make: 'BYD', model: 'Atto 3', year: 2024, variant: '', fuelType: 'Electric (EV)', transmission: 'Automatic' },
  { make: 'MG', model: 'ZS EV', year: 2023, variant: '', fuelType: 'Electric (EV)', transmission: 'Automatic' },
  { make: 'Toyota', model: 'Hilux', year: 2021, variant: '', fuelType: 'Diesel', transmission: 'Automatic' },
];

fs.mkdirSync(outDir, { recursive: true });
const summary = [];

for (const identity of matrix) {
  const label = `${identity.make} ${identity.model} ${identity.year} ${identity.variant || 'no-variant'}`.trim();
  const candidates = candidateUrls(identity);
  const pages = await collectSources(identity);
  const file = `${identity.make}-${identity.model}-${identity.year}-${identity.variant || 'base'}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '.json';
  const payload = {
    schemaVersion: 'compare-30-v1',
    identity,
    candidateCount: candidates.length,
    fetched: pages.map((page) => ({
      url: page.url,
      textChars: page.text.length,
      textHead: page.text.slice(0, 240),
    })),
  };
  fs.writeFileSync(path.join(outDir, file), JSON.stringify(payload, null, 2));
  summary.push({
    label,
    candidates: candidates.length,
    fetched: pages.length,
    hosts: [...new Set(pages.map((p) => { try { return new URL(p.url).hostname; } catch { return '?'; } }))],
  });
  console.log(`${label}: fetched ${pages.length}/${candidates.length}`);
}

fs.writeFileSync(path.join(outDir, '_summary.json'), JSON.stringify({ at: new Date().toISOString(), summary }, null, 2));
console.log('Wrote fixtures to', outDir);
