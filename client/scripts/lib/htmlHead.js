/** Shared HTML head patch helpers for build-time SEO shells. */

export function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function toAbsolute(siteUrl, maybeRelative) {
  if (!maybeRelative) return "";
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  if (maybeRelative.startsWith("//")) return `https:${maybeRelative}`;
  return `${siteUrl}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}

export function updateTitle(html, title) {
  const tag = `<title>${escapeAttr(title)}</title>`;
  if (/<title>[\s\S]*?<\/title>/.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/, tag);
  }
  return html.replace("</head>", `${tag}\n  </head>`);
}

export function updateOrInjectMeta(html, attrKey, attrValue, content) {
  if (content === undefined || content === null || content === "") return html;
  const re = new RegExp(`(<meta[^>]*${attrKey}="${attrValue}"[^>]*)`);
  if (re.test(html)) {
    return html.replace(re, (m, tag) =>
      tag.replace(/(content=")[^"]*(")/, `$1${escapeAttr(content)}$2`),
    );
  }
  return html.replace(
    "</head>",
    `<meta ${attrKey}="${attrValue}" content="${escapeAttr(content)}" />\n  </head>`,
  );
}

export function updateOrInjectLink(html, rel, href) {
  const re = new RegExp(`(<link[^>]*rel="${rel}"[^>]*)(\\s*)/?>`);
  if (re.test(html)) {
    return html.replace(re, (m, prefix) =>
      prefix.includes("href=")
        ? `${prefix.replace(/(href=")[^"]*(")/, `$1${escapeAttr(href)}$2`)} />`
        : `${prefix} href="${escapeAttr(href)}" />`,
    );
  }
  return html.replace(
    "</head>",
    `<link rel="${rel}" href="${escapeAttr(href)}" />\n  </head>`,
  );
}

export function injectScript(html, scriptType, id, content) {
  const attrs = `type="${scriptType}"${id ? ` id="${id}"` : ""}`;
  return html.replace(
    "</head>",
    `<script ${attrs}>${content}</script>\n  </head>`,
  );
}

export function applyPageHead(html, { title, description, canonical, image, keywords, robots }) {
  let out = updateTitle(html, title);
  out = updateOrInjectMeta(out, "name", "description", description);
  if (keywords) out = updateOrInjectMeta(out, "name", "keywords", keywords);
  if (robots) out = updateOrInjectMeta(out, "name", "robots", robots);
  out = updateOrInjectMeta(out, "property", "og:title", title);
  out = updateOrInjectMeta(out, "property", "og:description", description);
  out = updateOrInjectMeta(out, "property", "og:url", canonical);
  out = updateOrInjectMeta(out, "name", "twitter:title", title);
  out = updateOrInjectMeta(out, "name", "twitter:description", description);
  out = updateOrInjectMeta(out, "name", "twitter:url", canonical);
  if (image) {
    out = updateOrInjectMeta(out, "property", "og:image", image);
    out = updateOrInjectMeta(out, "name", "twitter:image", image);
  }
  out = updateOrInjectLink(out, "canonical", canonical);
  return out;
}

export function injectNoscriptBlock(html, innerHtml) {
  const block = `\n    <!-- seo-shell noscript -->\n    <noscript>\n${innerHtml}\n    </noscript>\n`;
  if (html.includes('id="root"')) {
    return html.replace(/<div id="root"><\/div>/, `${block}<div id="root"></div>`);
  }
  return html.replace("</body>", `${block}</body>`);
}

export function stripHeroPreloads(html) {
  return html.replace(
    /<link\b[^>]*id="sello-preload-hero-lcp-[^"]*"[^>]*\/?>/gi,
    "",
  );
}
