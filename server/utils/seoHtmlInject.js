/**
 * Inject crawlable meta + Product JSON-LD into the SPA shell for a car.
 * Used when Express serves the client and a build-time shell is missing.
 */

import fs from "node:fs";
import Car from "../models/carModel.js";
import {
  buildCarPath,
  extractCarIdFromSlug,
  getPublicSiteOrigin,
} from "./carUrls.js";

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtml(value) {
  return escapeAttr(value);
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function updateTitle(html, title) {
  const tag = `<title>${escapeAttr(title)}</title>`;
  if (/<title>[\s\S]*?<\/title>/.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/, tag);
  }
  return html.replace("</head>", `${tag}\n</head>`);
}

function updateMeta(html, attrKey, attrValue, content) {
  if (!content) return html;
  const re = new RegExp(`(<meta[^>]*${attrKey}="${attrValue}"[^>]*)`);
  if (re.test(html)) {
    return html.replace(re, (m, tag) =>
      tag.replace(/(content=")[^"]*(")/, `$1${escapeAttr(content)}$2`),
    );
  }
  return html.replace(
    "</head>",
    `<meta ${attrKey}="${attrValue}" content="${escapeAttr(content)}" />\n</head>`,
  );
}

function updateCanonical(html, href) {
  const re = /(<link[^>]*rel="canonical"[^>]*)(\s*)\/?>/;
  if (re.test(html)) {
    return html.replace(re, (m, prefix) =>
      prefix.includes("href=")
        ? `${prefix.replace(/(href=")[^"]*(")/, `$1${escapeAttr(href)}$2`)} />`
        : `${prefix} href="${escapeAttr(href)}" />`,
    );
  }
  return html.replace(
    "</head>",
    `<link rel="canonical" href="${escapeAttr(href)}" />\n</head>`,
  );
}

function carTitle(car) {
  if (car.title) return String(car.title).trim();
  return [car.year, car.make, car.model, "for sale", car.city && `in ${car.city}`]
    .filter(Boolean)
    .join(" ");
}

function carDescription(car) {
  const price =
    car.price != null ? `PKR ${Number(car.price).toLocaleString()}` : "";
  return `${carTitle(car)}${price ? ` — ${price}` : ""}. View details on Sello.pk.`.slice(
    0,
    320,
  );
}

/**
 * @returns {Promise<string|null>} HTML or null to fall back to plain shell
 */
export async function buildCarDetailHtml(shellPath, slugSegment) {
  const id = extractCarIdFromSlug(slugSegment);
  if (!id || !/^[a-f0-9]{24}$/i.test(id)) return null;
  if (!fs.existsSync(shellPath)) return null;

  const car = await Car.findById(id)
    .select(
      "title make model year price images city location status condition fuelType transmission mileage isSold vehicleType bodyType description isApproved",
    )
    .lean();
  if (!car) return null;
  if (car.isApproved === false) return null;

  const origin = getPublicSiteOrigin();
  const path = buildCarPath(car);
  const canonical = `${origin}${path}`;
  const title = `${carTitle(car)} | Sello.pk`;
  const description = carDescription(car);
  const image = Array.isArray(car.images) && car.images[0] ? car.images[0] : "";
  const availability =
    car.isSold || car.status === "sold"
      ? "https://schema.org/SoldOut"
      : "https://schema.org/InStock";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: carTitle(car),
        description,
        image: image || undefined,
        sku: String(car._id),
        brand: { "@type": "Brand", name: car.make || "Unknown" },
        offers: {
          "@type": "Offer",
          priceCurrency: "PKR",
          price: car.price,
          availability,
          url: canonical,
          seller: { "@type": "Organization", name: "Sello.pk" },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: origin },
          {
            "@type": "ListItem",
            position: 2,
            name: "Listings",
            item: `${origin}/listings`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: carTitle(car),
            item: canonical,
          },
        ],
      },
    ],
  };

  let html = fs.readFileSync(shellPath, "utf8");
  html = updateTitle(html, title);
  html = updateMeta(html, "name", "description", description);
  html = updateMeta(html, "property", "og:title", title);
  html = updateMeta(html, "property", "og:description", description);
  html = updateMeta(html, "property", "og:url", canonical);
  if (image) html = updateMeta(html, "property", "og:image", image);
  html = updateCanonical(html, canonical);
  html = html.replace(
    "</head>",
    `<script type="application/ld+json" id="structured-data">${safeJson(jsonLd)}</script>\n</head>`,
  );

  const price =
    car.price != null ? `PKR ${Number(car.price).toLocaleString()}` : "";
  const noscript = `
    <noscript>
      <article>
        <h1>${escapeHtml(carTitle(car))}</h1>
        ${price ? `<p><strong>Price:</strong> ${escapeHtml(price)}</p>` : ""}
        ${car.city ? `<p><strong>Location:</strong> ${escapeHtml(car.city)}</p>` : ""}
        <p>${escapeHtml(description)}</p>
      </article>
    </noscript>`;
  if (html.includes('id="root"')) {
    html = html.replace(/<div id="root"><\/div>/, `${noscript}\n<div id="root"></div>`);
  }

  return html;
}
