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

  const toAbsoluteUrl = (value) => {
    if (!value) return value;
    if (/^https?:\/\//i.test(value)) return value;
    const normalizedPath = value.startsWith("/") ? value : `/${value}`;
    return `${siteUrl}${normalizedPath}`;
  };

  const canonicalUrl = toAbsoluteUrl(
    canonical || url || `${location.pathname}${location.search || ""}`,
  );
  const siteName = "Sello";
  const fullTitle = title.includes("Sello") ? title : `${title} | Sello`;
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
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", author);
    updateMetaTag("viewport", "width=device-width, initial-scale=1.0");

    // Open Graph tags
    updateMetaTag("og:title", fullTitle, "property");
    updateMetaTag("og:description", description, "property");
    updateMetaTag("og:image", imageUrl, "property");
    updateMetaTag("og:url", canonicalUrl, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", siteName, "property");

    // Twitter Card tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", fullTitle);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", imageUrl);
    updateMetaTag("twitter:url", canonicalUrl);

    // Additional tags
    updateMetaTag("theme-color", "#3B82F6"); // Primary color
    updateMetaTag("robots", robots);

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
    description,
    imageUrl,
    type,
    keywords,
    author,
    canonicalUrl,
    fullTitle,
    robots,
  ]);

  return null; // This component doesn't render anything
};

export default SEO;
