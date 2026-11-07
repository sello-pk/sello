import * as cheerio from "cheerio";
import {
  OGRA_PRICE_PORTAL,
  OGRA_NOTIFIED_LISTING,
  OGRA_PRICE_PUBLICATION_LISTING,
} from "./constants.js";
import { fetchText } from "./httpClient.js";

const MONTHS = {
  january: 0,
  february: 1,
  march: 2,
  april: 3,
  may: 4,
  june: 5,
  july: 6,
  august: 7,
  september: 8,
  october: 9,
  november: 10,
  december: 11,
};

export function parseEffectiveDateFromText(text = "") {
  if (!text) return null;
  const match = String(text).match(
    /(?:effective(?:\s+dated)?|dated)\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (!match) return null;
  const month = MONTHS[match[1].toLowerCase()];
  const day = Number(match[2]);
  const year = Number(match[3]);
  if (month == null || !day || !year) return null;
  return new Date(Date.UTC(year, month, day));
}

function formatDateInput(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function portalListingUrl(daysBack = 90) {
  const to = new Date();
  const from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()));
  from.setUTCDate(from.getUTCDate() - daysBack);
  const qs = new URLSearchParams({
    section: "daily-fuel",
    category: "price-publications",
    date_from: formatDateInput(from),
    date_to: formatDateInput(to),
  });
  return `${OGRA_PRICE_PORTAL}/?${qs.toString()}`;
}

function isPricePublicationTitle(title = "") {
  const t = title.toLowerCase();
  return (
    t.includes("price publication") ||
    t.includes("price publications") ||
    (t.includes("petroleum products prices") && t.includes("effective"))
  );
}

function prefersBuildUp(title = "") {
  const t = title.toLowerCase();
  if (t.includes("platts")) return false;
  if (t.includes("ifem")) return false;
  if (t.includes("detail computation")) return false;
  if (t.includes("max ex-depot")) return false;
  if (t.includes("district") || t.includes("pump wise")) return false;
  return (
    t.includes("price publication") ||
    t.includes("price publications effective")
  );
}

export async function discoverOgraPublications() {
  const discoveries = [];
  const errors = [];

  // Primary: official OGRA Price Publications portal (HTML listing + document files)
  try {
    const listingUrl = portalListingUrl(120);
    const { text, url } = await fetchText(listingUrl);
    const $ = cheerio.load(text);

    $("article.current-site-publication-row, .simple-publication-row").each(
      (_, el) => {
        const title =
          $(el).find(".current-site-publication-title, h2").first().text().trim() ||
          $(el).text().trim().slice(0, 180);
        const href =
          $(el).find('a[href*="/document/"][href*="lang=en"]').attr("href") ||
          $(el).find('a[href*="/document/"]').attr("href");
        if (!href) return;
        const abs = new URL(href, OGRA_PRICE_PORTAL).toString();
        const idMatch = abs.match(/document\/(\d+)/);
        if (!idMatch) return;
        if (!isPricePublicationTitle(title) && !prefersBuildUp(title)) return;

        discoveries.push({
          document_ref: `price-portal:${idMatch[1]}`,
          portal_document_id: idMatch[1],
          title: title || `OGRA document ${idMatch[1]}`,
          source_url: abs.split("#")[0],
          listing_url: url,
          effective_date: parseEffectiveDateFromText(title),
          preferred: prefersBuildUp(title),
          channel: "price_portal",
        });
      }
    );

    // Fallback: raw link scan if markup changes
    if (discoveries.length === 0) {
      const linkRegex =
        /href="(\/document\/(\d+)\/file\?lang=en)"[^>]*>[\s\S]{0,40}?<\/a>[\s\S]{0,200}?/gi;
      let match;
      while ((match = linkRegex.exec(text))) {
        const id = match[2];
        const nearby = text.slice(Math.max(0, match.index - 250), match.index + 80);
        const titleMatch = nearby.match(
          /(?:title|h2)[^>]*>\s*([^<]{10,160})|Price Publications?[^<]{0,80}/i
        );
        const title = (titleMatch?.[1] || titleMatch?.[0] || `Document ${id}`).trim();
        if (!isPricePublicationTitle(title) && !prefersBuildUp(title)) continue;
        discoveries.push({
          document_ref: `price-portal:${id}`,
          portal_document_id: id,
          title,
          source_url: `${OGRA_PRICE_PORTAL}/document/${id}/file?lang=en`,
          listing_url: url,
          effective_date: parseEffectiveDateFromText(title),
          preferred: prefersBuildUp(title),
          channel: "price_portal",
        });
      }
    }
  } catch (error) {
    errors.push({ source: "price_portal", message: error.message });
  }

  // Secondary: classic OGRA website notified petroleum prices + price publication pages
  for (const listing of [
    { url: OGRA_NOTIFIED_LISTING, channel: "ogra_notified" },
    { url: OGRA_PRICE_PUBLICATION_LISTING, channel: "ogra_price_publication" },
  ]) {
    try {
      const { text, url } = await fetchText(listing.url);
      const $ = cheerio.load(text);
      $("a.download-pdf, a[href*='/download/']").each((_, el) => {
        const href = $(el).attr("href");
        if (!href || !/\/download\/\d+/.test(href)) return;
        const abs = new URL(href, "https://www.ogra.org.pk").toString();
        const idMatch = abs.match(/download\/(\d+)/);
        if (!idMatch) return;
        const container = $(el).closest("li, tr, div, article");
        const title = container
          .find("p, span, a, h2, h3, h4")
          .filter((_, node) => {
            const t = $(node).text().trim();
            return /petroleum|price publication|motor spirit|effective/i.test(t);
          })
          .first()
          .text()
          .trim() || container.text().replace(/\s+/g, " ").trim().slice(0, 180);

        if (!isPricePublicationTitle(title) && !/price publication/i.test(title)) {
          return;
        }

        discoveries.push({
          document_ref: `ogra-download:${idMatch[1]}`,
          portal_document_id: null,
          title: title || `OGRA download ${idMatch[1]}`,
          source_url: abs,
          listing_url: url,
          effective_date: parseEffectiveDateFromText(title),
          preferred: prefersBuildUp(title),
          channel: listing.channel,
        });
      });
    } catch (error) {
      errors.push({ source: listing.channel, message: error.message });
    }
  }

  // De-dupe by document_ref, prefer build-up titles
  const byRef = new Map();
  for (const item of discoveries) {
    const existing = byRef.get(item.document_ref);
    if (!existing || (item.preferred && !existing.preferred)) {
      byRef.set(item.document_ref, item);
    }
  }

  const unique = [...byRef.values()].sort((a, b) => {
    if (a.preferred !== b.preferred) return a.preferred ? -1 : 1;
    const ad = a.effective_date?.getTime() || 0;
    const bd = b.effective_date?.getTime() || 0;
    return bd - ad;
  });

  return { publications: unique, errors, checkedAt: new Date() };
}
