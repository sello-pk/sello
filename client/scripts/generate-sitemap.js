import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { CLIENT_ROOT, SITE_URL } from "./lib/api.js";

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

function articleUrl(article) {
  const recent =
    Date.now() - Date.parse(article.lastmod) < 30 * 24 * 60 * 60 * 1000;
  return `  <url>
    <loc>${escapeXml(article.loc)}</loc>
    <lastmod>${escapeXml(article.lastmod)}</lastmod>
    <changefreq>${recent ? "weekly" : "monthly"}</changefreq>
    <priority>0.7</priority>
  </url>`;
}

function main() {
  if (!fs.existsSync(PUBLIC_SITEMAP)) {
    throw new Error(`source sitemap not found: ${PUBLIC_SITEMAP}`);
  }
  const baseXml = fs.readFileSync(PUBLIC_SITEMAP, "utf8");

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

  const out = `${baseXml.replace(/<\/urlset>\s*$/, "")}${
    articleBlocks.length ? `\n\n  <!-- BLOG ARTICLES (generated) -->\n` : ""
  }${articleBlocks.join("\n")}\n</urlset>\n`;

  fs.mkdirSync(path.dirname(DIST_SITEMAP), { recursive: true });
  fs.writeFileSync(DIST_SITEMAP, out, "utf8");
  
  console.log(`wrote ${existingLocs.size} URLs -> ${DIST_SITEMAP}`);
}

main();