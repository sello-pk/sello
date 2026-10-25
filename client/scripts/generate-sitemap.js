import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { CLIENT_ROOT, SITE_URL } from "./lib/api.js";

const { makeSeo, modelSeo } = await import(
  pathToFileURL(path.join(CLIENT_ROOT, "src/utils/listingsSeo.js")).href
);

const PUBLIC_SITEMAP = path.join(CLIENT_ROOT, "public", "sitemap.xml");
const DIST_SITEMAP = path.join(CLIENT_ROOT, "dist", "sitemap.xml");

const MANIFEST_PATH =
  process.env.SELLO_ARTICLES_MANIFEST || findLatestManifest(os.tmpdir());

function findLatestManifest(dir) {
  if (!fs.existsSync(dir)) return null;
  const candidates = fs
    .readdirSync(dir)
    .filter((file) => /^sello-articles-manifest-.*\.json$/.test(file))
    .map((file) => path.join(dir, file))
    .filter((file) => fs.statSync(file).isFile())
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return candidates[0] || null;
}

function now() {
  console.log(`[sitemap] ${new Date().toISOString()}`);
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toTitleCase(value) {
  return String(value || "")
    .trim()
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function urlBlock(loc, { lastmod, changefreq = "weekly", priority = "0.7" }) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

function articleUrl(article) {
  const recent =
    Date.now() - Date.parse(article.lastmod) < 30 * 24 * 60 * 60 * 1000;
  return urlBlock(article.loc, {
    lastmod: article.lastmod,
    changefreq: recent ? "weekly" : "monthly",
    priority: "0.7",
  });
}

/** makeSeo / modelSeo keys → canonical /search-results?make=&model= URLs */
function buildMakeModelUrls(today) {
  const blocks = [];
  const seen = new Set();

  for (const key of Object.keys(makeSeo || {})) {
    const make = toTitleCase(key);
    const loc = `${SITE_URL}/search-results?make=${encodeURIComponent(make)}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    blocks.push(
      urlBlock(loc, { lastmod: today, changefreq: "daily", priority: "0.8" }),
    );
  }

  for (const key of Object.keys(modelSeo || {})) {
    const parts = String(key).trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) continue;
    // Multi-word makes that appear in makeSeo
    let make;
    let model;
    if (parts[0] === "mercedes" && parts[1] === "benz") {
      make = "Mercedes Benz";
      model = toTitleCase(parts.slice(2).join(" "));
    } else {
      make = toTitleCase(parts[0]);
      model = toTitleCase(parts.slice(1).join(" "));
    }
    if (!model) continue;
    const loc = `${SITE_URL}/search-results?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`;
    if (seen.has(loc)) continue;
    seen.add(loc);
    blocks.push(
      urlBlock(loc, { lastmod: today, changefreq: "daily", priority: "0.8" }),
    );
  }

  return blocks;
}

function main() {
  if (!fs.existsSync(PUBLIC_SITEMAP)) {
    throw new Error(`source sitemap not found: ${PUBLIC_SITEMAP}`);
  }
  const today = new Date().toISOString().slice(0, 10);
  let baseXml = fs.readFileSync(PUBLIC_SITEMAP, "utf8");
  // Freshen static lastmods on each build so crawlers see a current signal
  baseXml = baseXml.replace(
    /<lastmod>[^<]+<\/lastmod>/g,
    `<lastmod>${today}</lastmod>`,
  );

  const existingLocs = new Set();
  for (const match of baseXml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    existingLocs.add(match[1].trim());
  }
  now();
  console.log(`base sitemap: ${existingLocs.size} URLs from public/sitemap.xml`);

  const articleBlocks = [];
  if (MANIFEST_PATH && fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    for (const article of manifest.articles || []) {
      const loc = String(article.loc || "").trim();
      if (!loc) continue;
      if (existingLocs.has(loc)) continue;
      existingLocs.add(loc);
      articleBlocks.push(articleUrl(article));
    }
  } else {
    console.warn(
      `no article manifest found (SELLO_ARTICLES_MANIFEST unset) - appending only base URLs`,
    );
  }

  const makeModelBlocks = [];
  for (const block of buildMakeModelUrls(today)) {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    const loc = locMatch?.[1];
    if (!loc || existingLocs.has(loc)) continue;
    existingLocs.add(loc);
    makeModelBlocks.push(block);
  }
  console.log(`make/model landings added: ${makeModelBlocks.length}`);

  const out = `${baseXml.replace(/<\/urlset>\s*$/, "")}${
    makeModelBlocks.length
      ? `\n\n  <!-- MAKE / MODEL LANDINGS (generated) -->\n`
      : ""
  }${makeModelBlocks.join("\n")}${
    articleBlocks.length ? `\n\n  <!-- BLOG ARTICLES (generated) -->\n` : ""
  }${articleBlocks.join("\n")}\n</urlset>\n`;

  fs.mkdirSync(path.dirname(DIST_SITEMAP), { recursive: true });
  fs.writeFileSync(DIST_SITEMAP, out, "utf8");

  console.log(`wrote ${existingLocs.size} URLs -> ${DIST_SITEMAP}`);
}

main();
