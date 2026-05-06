import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FRONTEND_CONFIG } from "../../config";

/**
 * SEO Component for dynamic meta tags
 * Usage: <SEO title="Page Title" description="Page description" image="image-url" canonical="canonical-url" />
 */
const SEO = ({
  title = "Sello - Buy and Sell Cars in Pakistan",
  description = "Find your perfect car on Sello Pakistan. Browse thousands of new and used cars from trusted sellers across Pakistan. Buy or sell your car today!",
  image = "/logo.png",
  type = "website",
  keywords = "cars, buy cars, sell cars, used cars, new cars, Pakistan, Lahore, Karachi, Islamabad, car marketplace",
  author = "Sello",
  url,
  canonical,
  robots = "index, follow",
}) => {
  const location = useLocation();
  const siteUrl = (FRONTEND_CONFIG.SITE_URL || "https://sello.pk").replace(
    /\/+$/,
    "",
  );

  const normalizeText = (value, fallback = "") => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed || fallback;
    }
    if (value === null || value === undefined) return fallback;
    try {
      const converted = String(value).trim();
      return converted || fallback;
    } catch {
      return fallback;
    }
  };

  const toAbsoluteUrl = (value) => {
    const normalizedValue = normalizeText(value, "");
    if (!normalizedValue) return "";
    if (/^https?:\/\//i.test(normalizedValue)) return normalizedValue;
    const normalizedPath = normalizedValue.startsWith("/")
      ? normalizedValue
      : `/${normalizedValue}`;
    return `${siteUrl}${normalizedPath}`;
  };

  const canonicalUrl = toAbsoluteUrl(
    canonical || url || `${location.pathname}${location.search || ""}`,
  );
  const siteName = "Sello";
  const safeTitle = normalizeText(title, "Sello - Buy and Sell Cars in Pakistan");
  const safeDescription = normalizeText(
    description,
    "Find your perfect car on Sello Pakistan.",
  );
  const safeKeywords = normalizeText(keywords, "");
  const safeAuthor = normalizeText(author, "Sello");
  const safeType = normalizeText(type, "website");
  const safeRobots = normalizeText(robots, "index, follow");
  const fullTitle = safeTitle.includes("Sello")
    ? safeTitle
    : `${safeTitle} | Sello`;
  const imageUrl = toAbsoluteUrl(image);

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name, content, attribute = "name") => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", safeDescription);
    updateMetaTag("keywords", safeKeywords);
    updateMetaTag("author", safeAuthor);
    updateMetaTag("viewport", "width=device-width, initial-scale=1.0");

    // Open Graph tags
    updateMetaTag("og:title", fullTitle, "property");
    updateMetaTag("og:description", safeDescription, "property");
    updateMetaTag("og:image", imageUrl, "property");
    updateMetaTag("og:url", canonicalUrl, "property");
    updateMetaTag("og:type", safeType, "property");
    updateMetaTag("og:site_name", siteName, "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", safeDescription);
    updateMetaTag("twitter:image", imageUrl);
    updateMetaTag("twitter:url", canonicalUrl);

    // Additional tags
    updateMetaTag("theme-color", "#3B82F6"); // Primary color
    updateMetaTag("robots", safeRobots);

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);
  }, [
    title,
    safeDescription,
    imageUrl,
    safeType,
    safeKeywords,
    safeAuthor,
    canonicalUrl,
    fullTitle,
    safeRobots,
  ]);

  return null; // This component doesn't render anything
};

export default SEO;
