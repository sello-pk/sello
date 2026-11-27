import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';
import Logger from '../utils/logger.js';
import { ensureDbConnected } from '../utils/ensureDb.js';
import { recordCompareCall } from './compareMonitoring.js';
import { CompareConfig } from '../models/compareModel.js';
import {
  COMPARE_SCHEMA_VERSION,
  compareFields,
  featureFields,
  compareFuelTypes,
  compareTransmissionTypes,
  defaultCompareContent,
} from '../constants/carCompare.js';
import { jag9Config, jag9Extract, jag9SigningSecret, isCircuitOpen, circuitReason } from './compare/researchProvider.js';
import {
  collectSources,
  quoteInText,
  pageMentionsVariant,
  normalizeEvidence,
} from './compare/sourceCollector.js';

const fallbackSecret = randomBytes(32);
const inFlight = new Map();
const researchCache = new Map();
const SESSION_TTL = 30 * 60 * 1000;
const CACHE_TTL = Number(process.env.COMPARE_RESEARCH_CACHE_TTL_MS) || 12 * 60 * 60 * 1000;

const normalizeSelection = (value) => String(value || '').trim();
const normalizeFuel = (value) => {
  const text = normalizeSelection(value).toLowerCase();
  if (/plug.?in|phev/.test(text)) return 'Plug-in Hybrid (PHEV)';
  if (/electric|\bev\b|bev/.test(text)) return 'Electric (EV)';
  if (/hybrid/.test(text)) return 'Hybrid';
  if (/petrol|gasoline/.test(text)) return 'Petrol';
  if (/diesel/.test(text)) return 'Diesel';
  if (/\bcng\b/.test(text)) return 'CNG';
  if (/\blpg\b/.test(text)) return 'LPG';
  return text === 'other' ? 'Other' : '';
};
const normalizeTransmission = (value) => {
  const text = normalizeSelection(value).toLowerCase();
  if (/dct|dsg|dual.?clutch/.test(text)) return 'DCT / DSG';
  if (/\bcvt\b/.test(text)) return 'CVT';
  if (/\bamt\b|automated.?manual/.test(text)) return 'AMT';
  if (/manual/.test(text)) return 'Manual';
  if (/automatic|auto/.test(text)) return 'Automatic';
  return text === 'other' ? 'Other' : '';
};

function sign(payload) {
  const secret = jag9SigningSecret() || fallbackSecret;
  return createHmac('sha256', secret).update(`sello-car-compare:${payload}`).digest();
}
function snapshot(result) {
  const payload = Buffer.from(JSON.stringify({ result, expiresAt: Date.now() + SESSION_TTL })).toString('base64url');
  return { ...result, researchId: `${payload}.${sign(payload).toString('base64url')}` };
}
function readSnapshot(token) {
  if (typeof token !== 'string' || token.length > 100000) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const signature = Buffer.from(parts[1], 'base64url');
    const expected = sign(parts[0]);
    if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) return null;
    const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    return data.expiresAt > Date.now() ? data.result : null;
  } catch {
    return null;
  }
}

function cacheKey(identity) {
  return [
    identity.make,
    identity.model,
    identity.year,
    String(identity.variant || '').trim().toLowerCase(),
    identity.fuelType,
    identity.transmission,
  ].join('|');
}

function readCache(identity) {
  const entry = researchCache.get(cacheKey(identity));
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    researchCache.delete(cacheKey(identity));
    return null;
  }
  return entry.result;
}

function writeCache(identity, result) {
  researchCache.set(cacheKey(identity), { expiresAt: Date.now() + CACHE_TTL, result });
}

export function clearCompareResearchCache() {
  researchCache.clear();
}

export async function resolveVehicle(input) {
  ensureDbConnected();
  if (!input || !['makeId', 'modelId', 'yearId'].every((key) => typeof input[key] === 'string' && mongoose.isValidObjectId(input[key]))) {
    throw new Error('Select an existing brand, model and year');
  }
  const variant = String(input.variant || '').trim().replace(/\s+/g, ' ');
  const fuelType = normalizeSelection(input.fuelType);
  const transmission = normalizeSelection(input.transmission);
  if (variant.length > 100) throw new Error('Variant must be at most 100 characters');
  if (!compareFuelTypes.includes(fuelType)) throw new Error('Select a supported fuel type');
  if (!compareTransmissionTypes.includes(transmission)) throw new Error('Select a supported transmission');
  const categories = await Category.find({
    _id: { $in: [input.makeId, input.modelId, input.yearId] },
    type: 'car',
    isActive: true,
    vehicleType: { $in: ['Car', null] },
  }).lean();
  const make = categories.find((row) => String(row._id) === input.makeId && row.subType === 'make');
  const model = categories.find((row) => String(row._id) === input.modelId && row.subType === 'model');
  const year = categories.find((row) => String(row._id) === input.yearId && row.subType === 'year');
  if (!make || !model || !year || String(model.parentCategory) !== String(make._id)) {
    throw new Error('Vehicle does not match the existing catalog');
  }
  if (year.parentCategory && String(year.parentCategory) !== String(model._id)) {
    throw new Error('Vehicle does not match the existing catalog');
  }
  return {
    key: [input.makeId, input.modelId, input.yearId, variant.toLowerCase(), fuelType, transmission].join(':'),
    makeId: make._id,
    modelId: model._id,
    yearId: year._id,
    make: make.name,
    model: model.name,
    year: Number(year.name),
    variant,
    fuelType,
    transmission,
  };
}

export async function getCompareConfig() {
  ensureDbConnected();
  const config = await CompareConfig.findOne({ key: 'main' }).lean();
  return {
    ...config,
    aiResearch: true,
    aiSummary: true,
    schemaVersion: COMPARE_SCHEMA_VERSION,
    sections: config?.sections?.length === 4 ? config.sections : defaultCompareContent,
  };
}

const emptyFeatures = () => Object.fromEntries(featureFields.map(([key]) => [key, { value: 'NOT_VERIFIED' }]));
const positive = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;
const plainText = (value) => typeof value === 'string' && value.trim() && !/https?:\/\/|www\.|<|\[|\uE000|\uE200/i.test(value);

function priceDate(value) {
  if (typeof value !== 'string') return null;
  value = value.replace(/[\u2010-\u2015\u2212]/g, '-');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) && time <= Date.now() && new Date(time).toISOString().slice(0, 10) === value ? value : null;
}

function emptyResult(identity, status) {
  return {
    ...identity,
    schemaVersion: COMPARE_SCHEMA_VERSION,
    specs: {},
    features: emptyFeatures(),
    research: { status, found: 0, total: compareFields.length, evidenceUnverified: 0 },
  };
}

export async function compareVehicles(inputs) {
  if (!Array.isArray(inputs) || inputs.length < 2 || inputs.length > 3) throw new Error('Select two or three vehicles');
  const identities = await Promise.all(inputs.map(resolveVehicle));
  if (new Set(identities.map((row) => row.key)).size !== identities.length) {
    throw new Error('Select different vehicles, years or variants');
  }
  return identities.map((identity) => emptyResult(identity, 'waiting'));
}

function extractJsonObject(text) {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = (fenced?.[1] || text || '').trim();
  const start = candidate.indexOf('{');
  if (start < 0) throw new SyntaxError('Research response did not include JSON');
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < candidate.length; i += 1) {
    const ch = candidate[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return JSON.parse(candidate.slice(start, i + 1));
    }
  }
  throw new SyntaxError('Research JSON was truncated or incomplete');
}

function pageByUrl(pages, url) {
  const want = normalizeEvidence(url).replace(/\/$/, '');
  return pages.find((page) => normalizeEvidence(page.url).replace(/\/$/, '') === want)
    || pages.find((page) => {
      try {
        return new URL(page.url).hostname === new URL(url).hostname
          && new URL(page.url).pathname.replace(/\/$/, '') === new URL(url).pathname.replace(/\/$/, '');
      } catch {
        return false;
      }
    });
}

function buildExtractionPrompt(identity, pages) {
  const featureList = featureFields.map(([id, label]) => `${id}=${label}`).join('; ');
  const specList = compareFields
    .filter(([, , type]) => type !== 'feature')
    .map(([key, label, type, unit]) => `${key}=${label}${unit ? ` [${unit}]` : ''} (${type})`)
    .join('; ');
  const sourcesBlock = pages.map((page, index) => (
    `SOURCE ${index} URL: ${page.url}\nTEXT:\n${page.text.slice(0, 9000)}`
  )).join('\n\n---\n\n');

  return `Extract Pakistan-market facts for identity ${JSON.stringify([
    identity.make, identity.model, identity.year, identity.variant, identity.fuelType, identity.transmission,
  ])}.
Use ONLY the SOURCE texts below. Never invent quotes or URLs.
Return one JSON object:
{
  "match": true,
  "identity": ${JSON.stringify([identity.make, identity.model, identity.year, identity.variant, identity.fuelType, identity.transmission])},
  "features": [ { "feature_id": "f1", "status": "YES"|"NO"|"NOT_VERIFIED", "source_url": "https://...", "evidence_quote": "short quote from that source" } ],
  "specs": {
    "engineCc": { "value": 1498, "source_url": "https://...", "evidence_quote": "..." },
    "newPrice": { "value": 5000000, "source_url": "https://...", "evidence_quote": "...", "asOf": "YYYY-MM-DD"|null, "priceKind": "current"|"historical"|"undated" },
    "usedPrice": { "value": [min,max], "source_url": "https://...", "evidence_quote": "...", "asOf": "YYYY-MM-DD"|null, "priceKind": "estimate" },
    "city": { "value": 12, "source_url": "https://...", "evidence_quote": "...", "basis": "real_world"|"manufacturer" }
  }
}
Rules:
- Include ALL 30 features f1..f30 exactly once, ordered f1..f30. Labels: ${featureList}
- YES only if quote explicitly shows the feature on this variant. NO only if source explicitly marks absence for this variant. Otherwise NOT_VERIFIED.
- For NOT_VERIFIED you may omit source_url/evidence_quote.
- Specs allowed keys only: ${specList}. Omit unknowns.
- EV selections: omit city/highway/combined km/L; prefer batteryCapacity, consumption, range.
- Compact JSON only.
SOURCES:
${sourcesBlock}`;
}

function mergeVerified(identity, parsed, pages) {
  const features = emptyFeatures();
  let evidenceUnverified = 0;
  const knownIds = new Set(featureFields.map(([id]) => id));
  const rows = Array.isArray(parsed?.features) ? parsed.features : [];

  for (const [id] of featureFields) {
    features[id] = { value: 'NOT_VERIFIED' };
  }

  for (const row of rows) {
    const id = row?.feature_id;
    if (!knownIds.has(id)) continue;
    let status = String(row?.status || 'NOT_VERIFIED').toUpperCase();
    if (!['YES', 'NO', 'NOT_VERIFIED'].includes(status)) status = 'NOT_VERIFIED';
    if (status === 'NOT_VERIFIED') {
      features[id] = { value: 'NOT_VERIFIED' };
      continue;
    }
    const sourceUrl = String(row.source_url || '').trim();
    const quote = String(row.evidence_quote || '').trim();
    const page = pageByUrl(pages, sourceUrl);
    if (!page || !quoteInText(quote, page.text)) {
      features[id] = { value: 'NOT_VERIFIED', evidence_unverified: true };
      evidenceUnverified += 1;
      continue;
    }
    if (identity.variant && !pageMentionsVariant(page.text, identity.variant) && !normalizeEvidence(quote).includes(normalizeEvidence(identity.variant))) {
      features[id] = { value: 'NOT_VERIFIED', evidence_unverified: true };
      evidenceUnverified += 1;
      continue;
    }
    features[id] = { value: status, sourceUrl: page.url, evidence_quote: quote };
  }

  const specs = {};
  const rawSpecs = parsed?.specs && typeof parsed.specs === 'object' ? parsed.specs : {};
  for (const [key, , type] of compareFields) {
    if (type === 'feature') continue;
    const entry = rawSpecs[key];
    if (!entry || typeof entry !== 'object') continue;
    const sourceUrl = String(entry.source_url || '').trim();
    const quote = String(entry.evidence_quote || '').trim();
    const page = pageByUrl(pages, sourceUrl);
    if (!page || !quoteInText(quote, page.text)) {
      evidenceUnverified += 1;
      continue;
    }
    if (identity.variant && !pageMentionsVariant(page.text, identity.variant) && !normalizeEvidence(quote).includes(normalizeEvidence(identity.variant))) {
      evidenceUnverified += 1;
      continue;
    }
    const value = entry.value;
    if (type === 'text' && plainText(value) && String(value).length <= 100) {
      specs[key] = { value: String(value).trim(), sourceUrl: page.url, evidence_quote: quote };
    } else if (type === 'number' && positive(value)) {
      specs[key] = { value: Number(value), sourceUrl: page.url, evidence_quote: quote };
    } else if (type === 'economy' && positive(value) && ['real_world', 'manufacturer', 'r', 'm'].includes(entry.basis)) {
      const basis = entry.basis === 'm' || entry.basis === 'manufacturer' ? 'manufacturer' : 'real_world';
      specs[key] = { value: Number(value), sourceUrl: page.url, evidence_quote: quote, basis };
    } else if (type === 'price' && positive(value)) {
      const asOf = priceDate(entry.asOf);
      const priceKind = entry.priceKind === 'current' || entry.priceKind === 'historical' || entry.priceKind === 'undated'
        ? entry.priceKind
        : (asOf ? (Date.now() - Date.parse(asOf) <= 90 * 86400000 ? 'current' : 'historical') : 'undated');
      specs[key] = { value: Number(value), sourceUrl: page.url, evidence_quote: quote, asOf, priceKind };
    } else if (
      type === 'range'
      && Array.isArray(value)
      && value.length === 2
      && value.every(positive)
      && value[0] <= value[1]
    ) {
      specs[key] = {
        value: [Number(value[0]), Number(value[1])],
        sourceUrl: page.url,
        evidence_quote: quote,
        asOf: priceDate(entry.asOf),
        priceKind: 'estimate',
      };
    }
  }

  // EV: strip ICE economy if electric.
  if (identity.fuelType === 'Electric (EV)') {
    delete specs.city;
    delete specs.highway;
    delete specs.combined;
  }

  const researchedFuel = normalizeFuel(specs.fuelType?.value);
  const researchedTransmission = normalizeTransmission(specs.transmission?.value);
  const mismatch = (researchedFuel && researchedFuel !== identity.fuelType)
    || (researchedTransmission && researchedTransmission !== identity.transmission);
  if (mismatch) {
    // Do not display mismatched fuel/transmission as verified.
    delete specs.fuelType;
    delete specs.transmission;
  }

  const found = Object.keys(specs).length + Object.values(features).filter((entry) => entry.sourceUrl).length;
  return {
    specs,
    features,
    mismatch: !!mismatch,
    found,
    evidenceUnverified,
  };
}

async function retrieve(identity, { forceRefresh = false } = {}) {
  const started = Date.now();
  let callStatus = 'success';
  let usage;
  let modelLabel = 'jag9';
  try {
    if (!forceRefresh) {
      const cached = readCache(identity);
      if (cached) {
        recordCompareCall({
          operation: 'research',
          model: 'cache',
          durationMs: Date.now() - started,
          status: 'success',
          searchCalls: 0,
        });
        return snapshot({ ...cached, research: { ...cached.research, cached: true } });
      }
    }

    if (isCircuitOpen()) {
      throw Object.assign(new Error('ai_unavailable'), { detail: circuitReason() });
    }
    // Fail loud if JAG9 env missing.
    jag9Config();

    // Stage A — one source collection pass.
    const pages = await collectSources(identity);
    if (!pages.length) {
      throw new Error('search_unavailable');
    }

    // Stage B — one JAG9 extraction call.
    const extracted = await jag9Extract(buildExtractionPrompt(identity, pages), { maxTokens: 3500 });
    usage = extracted.usage;
    modelLabel = extracted.modelLabel;
    const parsed = extractJsonObject(extracted.text);
    const expected = [
      identity.make,
      identity.model,
      identity.year,
      identity.variant,
      identity.fuelType,
      identity.transmission,
    ];
    const parsedIdentity = Array.isArray(parsed?.identity)
      ? [
        String(parsed.identity[0] || ''),
        String(parsed.identity[1] || ''),
        Number(parsed.identity[2]),
        String(parsed.identity[3] || ''),
        String(parsed.identity[4] || ''),
        String(parsed.identity[5] || ''),
      ]
      : null;
    const expectedNormalized = [
      String(expected[0] || ''),
      String(expected[1] || ''),
      Number(expected[2]),
      String(expected[3] || ''),
      String(expected[4] || ''),
      String(expected[5] || ''),
    ];
    const result = emptyResult(identity, 'no_data');
    if (parsed?.match === true && parsedIdentity && JSON.stringify(parsedIdentity) === JSON.stringify(expectedNormalized)) {
      const merged = mergeVerified(identity, parsed, pages);
      result.specs = merged.specs;
      result.features = merged.features;
      if (merged.mismatch) result.research.mismatch = true;
      result.research = {
        ...result.research,
        status: merged.found ? 'complete' : 'no_data',
        found: merged.found,
        evidenceUnverified: merged.evidenceUnverified,
      };
    } else {
      result.research.status = 'no_data';
    }
    writeCache(identity, result);
    return snapshot(result);
  } catch (error) {
    const allowed = [
      'not_configured', 'ai_quota', 'ai_credentials', 'ai_capacity',
      'ai_unavailable', 'ai_incomplete', 'search_unavailable', 'timeout',
    ];
    callStatus = error.code === 'not_configured' || error.message === 'not_configured'
      ? 'not_configured'
      : allowed.includes(error.message)
        ? error.message
        : error.name === 'TimeoutError'
          ? 'timeout'
          : error instanceof SyntaxError
            ? 'ai_incomplete'
            : 'failed';
    Logger.warn('Car Compare live research failed', {
      status: callStatus,
      failureType: error.name,
      detail: error.detail || undefined,
    });
    return snapshot(emptyResult(identity, callStatus));
  } finally {
    recordCompareCall({
      operation: 'research',
      model: modelLabel,
      durationMs: Date.now() - started,
      status: callStatus,
      usage,
      searchCalls: 1,
    });
  }
}

export async function researchVehicle(input, options = {}) {
  const identity = await resolveVehicle(input);
  const forceRefresh = options.forceRefresh === true;
  const key = `${identity.key}:${forceRefresh ? 'force' : 'cache'}`;
  if (!inFlight.has(key)) {
    inFlight.set(key, retrieve(identity, { forceRefresh }).finally(() => inFlight.delete(key)));
  }
  return inFlight.get(key);
}

export async function recommendation(researchIds) {
  if (!Array.isArray(researchIds) || researchIds.length < 2 || researchIds.length > 3 || new Set(researchIds).size !== researchIds.length) {
    throw new Error('Research two or three vehicles before requesting a recommendation');
  }
  const vehicles = researchIds.map(readSnapshot);
  if (vehicles.some((vehicle) => !vehicle)) return { text: '', reason: 'expired', schemaVersion: COMPARE_SCHEMA_VERSION };
  if (new Set(vehicles.map((row) => row.key)).size !== vehicles.length) throw new Error('Select different vehicles');

  const withData = vehicles.filter((vehicle) => vehicle.research.found > 0);
  if (withData.length < 1) {
    return {
      text: 'No sourced specifications were verified for these selections, so a recommendation cannot be made yet. Retry research or pick a more specific variant.',
      reason: 'no_data',
      schemaVersion: COMPARE_SCHEMA_VERSION,
    };
  }

  const missing = vehicles
    .filter((vehicle) => !(vehicle.research.found > 0))
    .map((vehicle) => `${vehicle.make} ${vehicle.model} ${vehicle.year}`)
    .join(', ');

  const data = vehicles.map(({ make, model, year, variant, fuelType, transmission, specs, features, research }) => ({
    make,
    model,
    year,
    variant,
    fuelType,
    transmission,
    status: research.status,
    mismatch: !!research.mismatch,
    found: research.found,
    specs: Object.fromEntries(compareFields.filter(([key, , type]) => type !== 'feature' && specs[key]).map(([key, label, , unit]) => {
      const { value, basis, priceKind, asOf } = specs[key];
      return [label, { value, unit, basis, priceKind, asOf }];
    })),
    features: Object.fromEntries(featureFields.filter(([key]) => features?.[key]?.sourceUrl).map(([key, label]) => [label, features[key].value])),
  }));

  try {
    if (isCircuitOpen()) {
      return {
        text: missing
          ? `Limited sourced data is available. Missing research for: ${missing}. Provider is temporarily unavailable for a fuller summary.`
          : 'Provider is temporarily unavailable for a recommendation summary. Review the sourced tables above.',
        reason: 'ai_unavailable',
        schemaVersion: COMPARE_SCHEMA_VERSION,
      };
    }
    jag9Config();
    const answer = await jag9Extract(
      `Return only JSON {"summary":"80-120 words"}. Use only these sourced Pakistan-market facts. Prefer honest gaps over invented winners. If some cars lack data, say what is missing. Data: ${JSON.stringify(data)}${missing ? ` Missing sourced research for: ${missing}.` : ''}`,
      { maxTokens: 280 },
    );
    const summary = extractJsonObject(answer.text)?.summary;
    if (!plainText(summary) || summary.trim().split(/\s+/).length > 130) {
      return {
        text: missing
          ? `Sourced data exists for ${withData.length} vehicle(s). Missing or empty research: ${missing}. Compare the tables above until research completes.`
          : '',
        reason: missing ? 'partial' : 'ai_incomplete',
        schemaVersion: COMPARE_SCHEMA_VERSION,
      };
    }
    return { text: summary.trim(), schemaVersion: COMPARE_SCHEMA_VERSION };
  } catch {
    return {
      text: missing
        ? `Sourced data exists for ${withData.length} vehicle(s). Missing research: ${missing}.`
        : '',
      reason: 'failed',
      schemaVersion: COMPARE_SCHEMA_VERSION,
    };
  }
}

export { COMPARE_SCHEMA_VERSION };
