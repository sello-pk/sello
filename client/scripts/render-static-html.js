import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  CLIENT_ROOT,
  API_BASE_URL,
  SITE_URL,
  fetchJson,
  fetchAllPublishedBlogs,
  fetchPublishedBlogBySlug,
  fetchBlogCategories,
  articlePlainText,
  isSubstantialArticle,
} from "./lib/api.js";

const DIST_ROOT = path.join(CLIENT_ROOT, "dist");

const SKIP_BLOG_PAGES = process.env.SKIP_BLOG_PAGES === "1";
const ONLY = process.env.ONLY_ROUTE ? String(process.env.ONLY_ROUTE) : null;
const CONCURRENCY = Math.max(1, Number(process.env.SELLO_CONCURRENCY || 4));

function log(...args) {
  
  console.log(
    `[render-static] ${new Date().toISOString().slice(11, 19)}`,
    ...args,
  );
}

function fail(message) {
  
  console.error(`[render-static] FATAL: ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------- head utils

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function toAbsolute(maybeRelative) {
  if (!maybeRelative) return "";
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  if (maybeRelative.startsWith("//")) return `https:${maybeRelative}`;
  return `${SITE_URL}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}

function metaTag(attrKey, attrValue, content) {
  if (content === undefined || content === null || content === "") return null;
  return `<meta ${attrKey}="${attrValue}" content="${escapeAttr(content)}" />`;
}

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function fullTitle(title) {
  const t = String(title || "").trim();
  if (!t) return "Blog | Sello";
  return t.includes("Sello") ? t : `${t} | Sello`;
}

function updateOrInjectMeta(html, attrKey, attrValue, content) {
  const re = new RegExp(`(<meta[^>]*${attrKey}="${attrValue}"[^>]*)`);
  if (re.test(html)) {
    return html.replace(re, (m, tag) =>
      tag.replace(/(content=")[^"]*(")/, `$1${escapeAttr(content)}$2`),
    );
  }
  const tag = metaTag(attrKey, attrValue, content);
  return tag ? html.replace("</head>", `${tag}\n  </head>`) : html;
}

function updateTitle(html, title) {
  const tag = `<title>${escapeAttr(title)}</title>`;
  if (/<title>[\s\S]*?<\/title>/.test(html)) {
    return html.replace(/<title>[\s\S]*?<\/title>/, tag);
  }
  return html.replace("</head>", `${tag}\n  </head>`);
}

function updateOrInjectLink(html, rel, href) {
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

function injectScript(html, scriptType, id, content) {
  const attrs = `type="${scriptType}"${id ? ` id="${id}"` : ""}`;
  return html.replace(
    "</head>",
    `<script ${attrs}>${content}</script>\n  </head>`,
  );
}

// ------------------------------------------------------------- head builders

const PRIVACY_TERMS_COMMON = {
  title: "Privacy Policy - Your Data Protection Rights | Sello.pk",
  description:
    "Sello.pk privacy policy explains how we collect, use, and protect your personal information when you buy or sell cars on our platform.",
  keywords:
    "privacy policy, data protection, personal information, user privacy, car marketplace",
  canonical: `${SITE_URL}/privacy-policy`,
};

const TERMS_COMMON = {
  title: "Terms & Conditions - Sello.pk Marketplace Rules",
  description:
    "Read Sello.pk's terms and conditions for buying and selling cars. Understand your rights, responsibilities, and platform rules.",
  keywords:
    "terms and conditions, marketplace rules, car buying terms, selling conditions, user agreement",
  // Existing client behavior (TermsCondition.jsx): canonical is always plural.
  canonical: `${SITE_URL}/terms-conditions`,
};

const STATIC_META = {
  "/about": {
    title: "About Us | Buy & Sell Cars Online in Pakistan - Sello.pk",
    description:
      "Sello.pk is a secure and transparent platform to buy and sell cars in Pakistan. Discover our mission, values, and commitment to trusted car trading.",
    canonical: `${SITE_URL}/about`,
  },
  "/contact": {
    title: "Contact Us | 24/7 Car Marketplace Support - Sello.pk",
    description:
      "Need help buying or selling a car in Pakistan? Contact Sello.pk for fast, reliable support. We're here to guide you every step of the way.",
    canonical: `${SITE_URL}/contact`,
  },
  "/privacy-policy": PRIVACY_TERMS_COMMON,
  "/terms-condition": TERMS_COMMON,
  "/terms-conditions": TERMS_COMMON,
  "/blog": {
    title: "Car Blog in Pakistan | News, Guides & Insights - Sello.pk",
    description:
      "Read the latest automotive news, buying guides, selling tips, and market insights on the Sello.pk car blog.",
    keywords:
      "blog, car blog, automotive news, buy cars Pakistan, sell cars, car tips, car guides, Sello blog",
    canonical: `${SITE_URL}/blog`,
  },
  "/blog/all": {
    title: "All Blog Posts | Car News & Buying Guides - Sello.pk",
    description:
      "Browse all blog articles on Sello.pk covering car buying, selling, auctions, maintenance, and automotive trends in Pakistan.",
    keywords:
      "blog posts, car articles, automotive news Pakistan, buy sell cars, car guides, Sello",
    canonical: `${SITE_URL}/blog/all`,
  },
};

function buildStaticHead(meta) {
  const title = fullTitle(meta.title);
  const { description, keywords, canonical } = meta;
  return (html) => {
    let out = updateTitle(html, title);
    out = updateOrInjectMeta(out, "name", "description", description);
    if (keywords) {
      out = updateOrInjectMeta(out, "name", "keywords", keywords);
    }
    out = updateOrInjectMeta(out, "property", "og:title", title);
    out = updateOrInjectMeta(out, "property", "og:description", description);
    out = updateOrInjectMeta(out, "property", "og:url", canonical);
    out = updateOrInjectMeta(out, "name", "twitter:title", title);
    out = updateOrInjectMeta(out, "name", "twitter:description", description);
    out = updateOrInjectMeta(out, "name", "twitter:url", canonical);
    out = updateOrInjectLink(out, "canonical", canonical);
    return out;
  };
}

function buildBlogHead(blog) {
  const slug = blog?.slug || blog?._id;
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
  const safeTitle = String(blog?.title || "").trim();
  const safeMetaTitle = String(blog?.metaTitle || "").trim();
  const safeMetaDescription = String(blog?.metaDescription || "").trim();
  const safeExcerpt = String(blog?.excerpt || "").trim();
  const plainPreview = articlePlainText(blog).slice(0, 160);
  const image = toAbsolute(blog?.featuredImage);
  const tags =
    Array.isArray(blog?.tags) && blog.tags.length
      ? blog.tags.filter(Boolean).join(", ")
      : "";
  const keywords = blog?.metaKeywords || tags || "";

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: safeTitle,
    description: safeMetaDescription || safeExcerpt || "",
    image: image ? [image] : undefined,
    author: { "@type": "Organization", name: "Sello.pk" },
    publisher: {
      "@type": "Organization",
      name: "Sello.pk",
      logo: { "@type": "ImageObject", url: "https://sello.pk/logo.png" },
    },
    datePublished: blog?.publishedAt || blog?.createdAt || undefined,
    dateModified:
      blog?.updatedAt || blog?.publishedAt || blog?.createdAt || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    articleSection: blog?.category?.name || undefined,
    articleBody: articlePlainText(blog).slice(0, 20_000),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      { "@type": "ListItem", position: 3, name: safeTitle, item: canonical },
    ],
  };

  const title = fullTitle(safeMetaTitle || safeTitle);
  const description = safeMetaDescription || safeExcerpt || plainPreview;
  const jsonLd = safeJson({ "@graph": [blogPosting, breadcrumb] });
  const payload = safeJson({
    slug: blog?.slug,
    id: blog?._id,
    blog,
  });

  return (html) => {
    let out = updateTitle(html, title);
    out = updateOrInjectMeta(out, "name", "description", description);
    if (keywords) {
      out = updateOrInjectMeta(out, "name", "keywords", keywords);
    }
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
    out = injectScript(out, "application/ld+json", "structured-data", jsonLd);
    out = injectScript(
      out,
      "application/json",
      "sello-prerendered-blog",
      payload,
    );
    return out;
  };
}

// ------------------------------------------------------------------- writing

function outputPathFor(routePath) {
  const clean = routePath.replace(/^\/+|\/+$/g, "");
  return clean
    ? path.join(DIST_ROOT, clean, "index.html")
    : path.join(DIST_ROOT, "index.html");
}

async function renderOne(renderer, entry, route) {
  const start = Date.now();
  const store = entry.createAppStore();
  if (route.seed) {
    route.seed(store);
  }
  const body = await renderer.renderRoute(route.path, store);

  const shellPath = path.join(DIST_ROOT, "index.html");
  if (!fs.existsSync(shellPath)) {
    throw new Error(
      `${shellPath} not found - run "vite build" before render-static-html`,
    );
  }
  const shell = fs.readFileSync(shellPath, "utf8");
  const finalHtml = route.head(shell).replace(
    "</body>",
    `<!-- prerendered:${route.path} -->\n${body}\n  </body>`,
  );
  const outPath = outputPathFor(route.path);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, finalHtml, "utf8");

  const bodyWords = (body.replace(/<[^>]+>/g, " ") || "")
    .split(/\s+/)
    .filter(Boolean)
    .length;
  log(
    `OK ${route.path} -> ${path.relative(DIST_ROOT, outPath)} body=${bodyWords}w ${Date.now() - start}ms`,
  );
  return { route, outPath };
}

async function mapLimit(items, limit, worker) {
  const results = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = items[index++];
      try {
        results.push(await worker(current));
      } catch (error) {
        results.push({ route: current, error });
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => run()),
  );
  return results;
}

// -------------------------------------------------------------------- routes

function buildRoutes({ entry, categories, listData, blogsBySlug, relatedDataBySlug }) {
  const routes = [];
  for (const routePath of ["/about", "/contact", "/privacy-policy", "/terms-condition", "/terms-conditions"]) {
    routes.push({
      path: routePath,
      head: buildStaticHead(STATIC_META[routePath]),
      seed: null,
    });
  }

  const seedBlogListing = (store) => {
    entry.seedBlogList(store, listData);
    entry.seedCategories(store, categories);
  };

  routes.push({
    path: "/blog",
    head: buildStaticHead(STATIC_META["/blog"]),
    seed: seedBlogListing,
  });
  routes.push({
    path: "/blog/all",
    head: buildStaticHead(STATIC_META["/blog/all"]),
    seed: seedBlogListing,
  });

  for (const blog of blogsBySlug.values()) {
    const slug = blog.slug;
    routes.push({
      path: `/blog/${slug}`,
      head: buildBlogHead(blog),
      seed: (store) => {
        entry.seedArticle(store, blog);
        if (blog.category?._id && blog._id) {
          entry.seedRelatedBlogs(
            store,
            {
              limit: 3,
              status: "published",
              category: blog.category._id,
              exclude: blog._id,
            },
            relatedDataBySlug.get(slug) || { blogs: [], pagination: {} },
          );
        }
      },
    });
  }
  return routes;
}

// -------------------------------------------------------------------- run

async function main() {
  log(`client root: ${CLIENT_ROOT}`);
  log(`api: ${API_BASE_URL}`);
  log(`concurrency: ${CONCURRENCY}`);

  let categories = [];
  let listData = { blogs: [], pagination: {} };
  let blogsBySlug = new Map();
  let relatedDataBySlug = new Map();

  if (!SKIP_BLOG_PAGES) {
    log("fetching published blog list (route discovery)…");
    const { blogs } = await fetchAllPublishedBlogs();
    for (const blog of blogs || []) {
      if (!blog?.slug) continue;
      if (!isSubstantialArticle(blog)) continue;
      let article = blog;
      try {
        article = await fetchPublishedBlogBySlug(blog.slug);
      } catch (error) {
        log(`warn: deep fetch failed for ${blog.slug} (${error.message}); using list item`);
      }
      if (article && isSubstantialArticle(article)) {
        blogsBySlug.set(article.slug || blog.slug, article);
      }
    }
    log(`articles passing word gate: ${blogsBySlug.size} (of ${(blogs || []).length})`);
    if (blogsBySlug.size === 0) {
      fail(
        "no substantial articles found. The public blog API may be down; set SKIP_BLOG_PAGES=1 to build pages only.",
      );
    }

    log("fetching blog page-1 list + categories…");
    const listRes = await fetchJson(
      `${API_BASE_URL}/blogs?page=1&limit=12&status=published`,
    );
    listData = listRes?.data || listRes || { blogs: [], pagination: {} };
    categories = await fetchBlogCategories();

    log("fetching related blog posts…");
    const related = await Promise.all(
      Array.from(blogsBySlug.values())
        .filter((b) => b.category?._id && b._id)
        .map(async (b) => {
          try {
            const res = await fetchJson(
              `${API_BASE_URL}/blogs?limit=3&status=published&category=${encodeURIComponent(b.category._id)}&exclude=${encodeURIComponent(b._id)}`,
            );
            return [b.slug, res?.data || res || {}];
          } catch (error) {
            log(`warn: related fetch failed for ${b.slug} (${error.message})`);
            return [b.slug, { blogs: [], pagination: {} }];
          }
        }),
    );
    relatedDataBySlug = new Map(related);
  }

  const { createRenderer } = await import("./ssr-render.js");
  const renderer = await createRenderer();
  const { entry } = renderer;

  const routes = buildRoutes({
    entry,
    categories,
    listData,
    blogsBySlug,
    relatedDataBySlug,
  });

  let targets = routes;
  if (ONLY) {
    targets = routes.filter(
      (r) => r.path === ONLY || r.path.startsWith(`${ONLY}/`),
    );
    log(`--only filter: ${targets.length} route(s) match ${ONLY}`);
  }

  const results = await mapLimit(targets, CONCURRENCY, (route) =>
    renderOne(renderer, entry, route),
  );

  const errors = results.filter((r) => r.error);
  if (errors.length) {
    for (const e of errors) {
      
      console.error(`[render-static] ERROR ${e.route?.path}: ${e.error?.message}`);
      if (e.error?.stack && process.env.SELLO_DEBUG) {
        
        console.error(e.error.stack);
      }
    }
    fail(`${errors.length} route(s) failed`);
  }

  const ok = results.filter((r) => !r.error);
  log(`wrote ${ok.length} static pages, ${errors.length} errors`);

  if (!SKIP_BLOG_PAGES) {
    const manifestPath = path.join(
      os.tmpdir(),
      `sello-articles-manifest-${Date.now()}.json`,
    );
    const articles = Array.from(blogsBySlug.values()).map((b) => ({
      slug: b.slug,
      loc: `${SITE_URL}/blog/${encodeURIComponent(b.slug)}`,
      lastmod:
        new Date(b.updatedAt || b.publishedAt || b.createdAt)
          .toISOString()
          .slice(0, 10) ||
        new Date().toISOString().slice(0, 10),
    }));
    fs.writeFileSync(manifestPath, JSON.stringify({ generatedAt: new Date().toISOString(), articles }, null, 2), "utf8");
    process.env.SELLO_ARTICLES_MANIFEST = manifestPath;
    log(`article manifest: ${manifestPath}`);
  }

  await renderer.close();
  log("done");
}

main().catch((error) => {
  
  console.error(`[render-static] FATAL: ${error.stack || error}`);
  process.exit(1);
});