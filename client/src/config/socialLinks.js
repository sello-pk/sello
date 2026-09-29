/**
 * Single source of truth for Sello's official social profiles.
 *
 * Every place that renders or references a social link (Footer buttons,
 * JSON-LD `sameAs`, share links) must read from here so the URLs can never
 * drift apart again. Previously the footer pointed at non-existent handles
 * (`@sello.p.k`, `@sello..pk`) and the schema pointed at different ones
 * (`@sello.pk`), and X was missing entirely.
 */

// Tracking query params that Google/WhatsApp append on share are stripped so
// the canonical handle is stored.
export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/sellopakistan",
  instagram: "https://www.instagram.com/sello.pakistan",
  x: "https://x.com/sellopak",
  youtube: "https://www.youtube.com/@sello.pakistan",
  tiktok: "https://www.tiktok.com/@sello.pakistan",
  whatsapp: "https://wa.me/923134211023",
};

/** Ordered list for `sameAs` in JSON-LD (schema.org expects a plain array). */
export const SOCIAL_SAME_AS = [
  SOCIAL_LINKS.facebook,
  SOCIAL_LINKS.instagram,
  SOCIAL_LINKS.x,
  SOCIAL_LINKS.youtube,
  SOCIAL_LINKS.tiktok,
];

export default SOCIAL_LINKS;
