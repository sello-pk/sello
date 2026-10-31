import { ADSENSE_CLIENT } from "./adSlots";
import { hasCookieConsent } from "./consent";

const SCRIPT_ID = "sello-adsbygoogle";

/**
 * If the loader neither loads nor errors within this window (hanging proxy,
 * silently blocked extension, offline device) treat it as unavailable so the
 * page can stop rendering empty ad slots.
 */
const LOAD_TIMEOUT_MS = 10000;

let loadPromise = null;

/**
 * Injects the AdSense loader once, and only after cookie consent.
 * Safe to call many times — returns the same in-flight promise.
 *
 * Resolves `false` when the loader is unavailable (blocked by an ad blocker /
 * Brave Shields / extension, offline, or timed out). A failed <script> is
 * removed from <head> so the "already loaded" check below never reports a
 * false positive on a later call.
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
    let settled = false;
    let timer = null;
    const script = document.createElement("script");

    const settle = (ok) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      if (!ok) {
        script.remove();
        loadPromise = null;
      }
      resolve(ok);
    };

    script.id = SCRIPT_ID;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
    script.onload = () => settle(true);
    script.onerror = () => settle(false);
    timer = setTimeout(() => settle(false), LOAD_TIMEOUT_MS);
    document.head.appendChild(script);
  });

  return loadPromise;
}
