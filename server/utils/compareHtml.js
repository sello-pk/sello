import fs from 'node:fs/promises';
import { compareVehicles, getCompareConfig } from '../services/compareService.js';
import { compareGroups } from '../constants/carCompare.js';
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
export async function compareHtml(indexFile, query) {
  const [html, config] = await Promise.all([fs.readFile(indexFile, 'utf8'), getCompareConfig()]);
  let vehicles = [];
  try { if (query) vehicles = await compareVehicles(JSON.parse(query)); } catch { /* Invalid comparisons render the tool with noindex. */ }
  const title = vehicles.length ? `${vehicles.map(row => `${row.make} ${row.model} ${row.year} ${row.variant}`).join(' vs ')} | SELLO` : 'Car Compare in Pakistan | SELLO';
  const description = 'Compare exact car years and variants, prices, fuel averages, safety and running costs in Pakistan.';
  const sections = config.sections.map(section => `<article><h2>${escape(section.title)}</h2><p>${escape(section.description)}</p><img src="${escape(section.image)}" alt="${escape(section.alt)}" width="640" height="320" loading="lazy"></article>`).join('');
  const table = vehicles.length ? `<table><thead><tr><th>Specification</th>${vehicles.map(row => `<th>${escape(`${row.make} ${row.model} ${row.year} ${row.variant}`)}</th>`).join('')}</tr></thead><tbody>${compareGroups.map(group => `<tr><th colspan="${vehicles.length + 1}">${escape(group.title)}</th></tr>${group.fields.map(field => `<tr><th>${escape(field.label)} ${escape(field.unit)}</th>${vehicles.map(row => `<td>${escape(row.specs[field.key]?.value ?? 'Not Available')}</td>`).join('')}</tr>`).join('')}`).join('')}</tbody></table>` : '';
  const body = `<section id="sello-compare-prerender"><h1>${escape(title)}</h1><p>${escape(description)}</p>${table}${sections}</section>`;
  const cleaned = html.replace(/<title>[\s\S]*?<\/title>/i, '').replace(/<meta\b[^>]*(?:name=["'](?:description|robots)["']|property=["']og:[^"']+["'])[^>]*>/gi, '').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi, '');
  return cleaned.replace('</head>', `<title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="robots" content="${query ? 'noindex, follow' : 'index, follow'}"><link rel="canonical" href="https://sello.pk/cars/compare"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:url" content="https://sello.pk/cars/compare"><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebApplication', name: 'SELLO Car Compare', applicationCategory: 'LifestyleApplication', operatingSystem: 'Web', url: 'https://sello.pk/cars/compare' }).replace(/</g, '\\u003c')}</script></head>`).replace(/<div id="root">/, `<div id="root">${body}`);
}
