import Logger from '../../utils/logger.js';

const MAX_SOURCES = 4;
const MAX_TEXT_CHARS = 12000;
const FETCH_TIMEOUT_MS = 12000;

function slug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Deterministic Pakistan-market candidate URLs (one search pass = build + fetch). */
export function candidateUrls(identity) {
  const make = slug(identity.make);
  const model = slug(identity.model);
  const variant = slug(identity.variant);
  const year = identity.year;
  const urls = [];

  if (make && model) {
    urls.push(`https://www.pakwheels.com/new-cars/${make}/${model}`);
    urls.push(`https://www.pakwheels.com/new-cars/${make}/${model}/specifications`);
    if (variant) {
      urls.push(`https://www.pakwheels.com/new-cars/${make}/${model}/${variant}`);
    }
    urls.push(`https://www.pakwheels.com/new-cars/${make}/${model}-${year}`);
  }

  // Common distributor / brand hubs (homepage-level; useful when model pages 404).
  const brandHubs = {
    toyota: 'https://www.toyota-indus.com/',
    honda: 'https://www.honda.com.pk/',
    suzuki: 'https://www.suzukipakistan.com/',
    hyundai: 'https://www.hyundai-nishat.com/',
    kia: 'https://www.kia.com/pk/main.html',
    mg: 'https://mgmotors.com.pk/',
    changan: 'https://www.changan.com.pk/',
    byd: 'https://www.byd.com/pk',
    'mercedes-benz': 'https://www.mercedes-benz.com.pk/',
    audi: 'https://www.audi.com.pk/',
  };
  if (brandHubs[make]) urls.push(brandHubs[make]);

  urls.push(`https://www.gari.pk/new-cars/${make}/${model}/`);
  urls.push(`https://www.carspiritpk.com/${make}-${model}/`);

  return [...new Set(urls)].slice(0, 10);
}

function htmlToText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'User-Agent': 'SelloCarCompareBot/1.0 (+https://sello.pk)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (!/html|text|xml/i.test(contentType) && contentType) return null;
    const html = await response.text();
    const text = htmlToText(html).slice(0, MAX_TEXT_CHARS);
    if (text.length < 200) return null;
    return { url: response.url || url, text };
  } catch (error) {
    Logger.warn('Car Compare source fetch failed', { host: (() => { try { return new URL(url).host; } catch { return 'bad'; } })() });
    return null;
  }
}

/**
 * Stage A: one pass — build candidate URLs and fetch top pages with enough text.
 */
export async function collectSources(identity) {
  const candidates = candidateUrls(identity);
  const pages = [];
  for (const url of candidates) {
    if (pages.length >= MAX_SOURCES) break;
    const page = await fetchPage(url);
    if (page) pages.push(page);
  }
  return pages;
}

export function normalizeEvidence(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function quoteInText(quote, pageText) {
  const q = normalizeEvidence(quote);
  if (!q || q.length < 8) return false;
  return normalizeEvidence(pageText).includes(q);
}

export function pageMentionsVariant(pageText, variant) {
  const v = String(variant || '').trim();
  if (!v) return true;
  return normalizeEvidence(pageText).includes(normalizeEvidence(v));
}
