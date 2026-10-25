import { ADSENSE_CLIENT } from "./adSlots";
import { hasCookieConsent } from "./consent";

const SCRIPT_ID = "sello-adsbygoogle";

let loadPromise = null;

/**
 * Injects the AdSense loader once, and only after cookie consent.
 * Safe to call many times — returns the same in-flight promise.
 */
export function loadAdSenseScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve(false);
  }
  if (!ADSENSE_CLIENT || !hasCookieConsent()) {
    return Promise.resolve(false);
  }
  if (document.getElementById(SCRIPT_ID)) {
    return Promise.resolve(true);
  }
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadPromise = null;
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
