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
  const raw = String(text);

  // "Effective Dated November 07, 2026" / "Effective November 7, 2026"
  const long = raw.match(
    /(?:effective(?:\s+dated)?|dated|from)\s+([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (long) {
    const month = MONTHS[long[1].toLowerCase()];
    const day = Number(long[2]);
    const year = Number(long[3]);
    if (month != null && day && year) return new Date(Date.UTC(year, month, day));
  }

  // "7-Nov-26" / "07-Nov-2026" (common in OGRA build-up sheets)
  const short = raw.match(
    /\b(\d{1,2})[-/ ]([A-Za-z]{3,9})[-/ ](\d{2,4})\b/
  );
  if (short) {
    const day = Number(short[1]);
    const monKey = short[2].toLowerCase();
    const month =
      MONTHS[monKey] ??
      MONTHS[
        Object.keys(MONTHS).find((k) => k.startsWith(monKey.slice(0, 3))) || ""
      ];
    let year = Number(short[3]);
    if (year < 100) year += 2000;
    if (month != null && day && year) return new Date(Date.UTC(year, month, day));
  }

  // "07-11-2026" / "07/11/2026" (POL notification filenames)
  const dmy = raw.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]) - 1;
    const year = Number(dmy[3]);
    if (month >= 0 && month <= 11 && day && year) {
      return new Date(Date.UTC(year, month, day));
    }
  }

  return null;
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
  if (t.includes("district") || t.includes("pump wise") || t.includes("pol prices"))
    return false;
  return (
    t.includes("price publication") ||
    t.includes("price publications effective") ||
    // Official gazette notifications — often newer than price.ogra.org.pk mirrors
    (t.includes("petroleum products prices") && t.includes("effective"))
  );
}

/** Nearby OGRA download IDs often hold the text-layer build-up for a scanned notification. */
export function companionDownloadCandidates(documentRef, title, listingUrl) {
  const match = String(documentRef || "").match(/^ogra-download:(\d+)$/);
  if (!match) return [];
  const id = Number(match[1]);
  if (!Number.isFinite(id)) return [];
  // Prefer nearby older IDs first (build-ups are usually published just before the gazette PDF).
  const deltas = [-1, -2, -3, -4, -5, -6, -7, -8, 1, 2];
  return deltas
    .map((delta) => id + delta)
    .filter((sibling) => sibling > 0)
    .map((sibling) => ({
      document_ref: `ogra-download:${sibling}`,
      portal_document_id: null,
      title: `${title} (companion build-up #${sibling})`,
      source_url: `https://www.ogra.org.pk/download/${sibling}?lang=en`,
      listing_url: listingUrl,
      effective_date: parseEffectiveDateFromText(title),
      preferred: true,
      channel: "ogra_companion",
      companion_of: documentRef,
    }));
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

  // For the newest few scanned notifications, probe nearby download IDs for
  // text-layer build-ups (e.g. Nov 7 notification 18073 → build-up 18071).
  const newestNotifications = discoveries
    .filter(
      (d) =>
        d.channel === "ogra_notified" &&
        d.preferred &&
        d.effective_date &&
        !d.companion_of
    )
    .sort(
      (a, b) =>
        (b.effective_date?.getTime() || 0) - (a.effective_date?.getTime() || 0)
    )
    .slice(0, 3);
  for (const note of newestNotifications) {
    discoveries.push(
      ...companionDownloadCandidates(
        note.document_ref,
        note.title,
        note.listing_url
      )
    );
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
    const ad = a.effective_date?.getTime() || 0;
    const bd = b.effective_date?.getTime() || 0;
    if (ad !== bd) return bd - ad;
    // Try text-layer companions before the scanned gazette itself
    const aComp = Boolean(a.companion_of);
    const bComp = Boolean(b.companion_of);
    if (aComp !== bComp) return aComp ? -1 : 1;
    if (a.preferred !== b.preferred) return a.preferred ? -1 : 1;
    return 0;
  });

  return { publications: unique, errors, checkedAt: new Date() };
}
