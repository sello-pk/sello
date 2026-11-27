/**
 * Contract test: FE and BE carCompare constants must stay identical for compare-30-v1.
 * Run: node scripts/assertCompareSchemaParity.js
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMPARE_SCHEMA_VERSION,
  featureFields,
  basicFields,
  fuelFields,
  electricFields,
  priceFields,
  compareFields,
} from '../constants/carCompare.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientPath = path.resolve(__dirname, '../../client/src/constants/carCompare.js');
const clientSrc = fs.readFileSync(clientPath, 'utf8');

function fail(message) {
  console.error('COMPARE SCHEMA PARITY FAIL:', message);
  process.exit(1);
}

if (COMPARE_SCHEMA_VERSION !== 'compare-30-v1') fail(`server version ${COMPARE_SCHEMA_VERSION}`);
if (!clientSrc.includes("COMPARE_SCHEMA_VERSION = 'compare-30-v1'")) fail('client missing compare-30-v1');

const checks = [
  ['featureFields', featureFields.length, 30],
  ['basicFields', basicFields.length, 8],
  ['fuelFields', fuelFields.length, 3],
  ['electricFields', electricFields.length, 3],
  ['priceFields', priceFields.length, 2],
];
for (const [name, actual, expected] of checks) {
  if (actual !== expected) fail(`${name} length ${actual} !== ${expected}`);
}

const featureIds = featureFields.map(([id]) => id);
if (featureIds.join(',') !== Array.from({ length: 30 }, (_, i) => `f${i + 1}`).join(',')) {
  fail('feature ids must be f1..f30 in order');
}

if (compareFields.length !== basicFields.length + featureFields.length + fuelFields.length + electricFields.length + priceFields.length) {
  fail('compareFields composition mismatch');
}

// Ensure no legacy 73-field mention in compare service path files (spot check).
const service = fs.readFileSync(path.resolve(__dirname, '../services/compareService.js'), 'utf8');
if (/\b73\b.*field|legacy.?73/i.test(service)) fail('legacy 73-field residue in compareService');

console.log('COMPARE SCHEMA PARITY OK', {
  version: COMPARE_SCHEMA_VERSION,
  features: featureFields.length,
  totalFields: compareFields.length,
});
