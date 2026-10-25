/**
 * Meta Pixel (Facebook) — consent-gated load + safe event helpers.
 * Script inject happens after cookie consent (loadMarketingScripts / scheduleFacebookPixelLoad).
 * Event helpers queue on the fbq stub until the real script is present.
 */

import { hasCookieConsent } from "../components/ads/consent.js";

export const META_PIXEL_ID = "1687648445884627";

let pixelLoadScheduled = false;
let pixelScriptLoading = false;

/** Queue calls until fbevents.js is loaded (same pattern as Meta's snippet). */
function ensureFbqStub() {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "function" && window.fbq.__selloStub) return;
  if (typeof window.fbq === "function" && !window.fbq.__selloStub) return;

  const n = function () {
    n.callMethod
      ? n.callMethod.apply(n, arguments)
      : n.queue.push(arguments);
  };
  n.push = n;
  n.loaded = false;
  n.version = "2.0";
  n.queue = [];
  n.__selloStub = true;
  window.fbq = n;
  if (!window._fbq) window._fbq = n;
}

/**
 * Injects fbevents.js once, then init + PageView.
 * Safe to call multiple times.
 */
export function loadFacebookPixel() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }
  if (!hasCookieConsent()) return;

  ensureFbqStub();

  if (window.fbq.__selloScriptRequested) return;
  if (window.fbq.loaded && !window.fbq.__selloStub) {
    try {
      window.fbq("track", "PageView");
    } catch {
      /* ignore */
    }
    return;
  }

  window.fbq.__selloScriptRequested = true;
  pixelScriptLoading = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  script.onerror = () => {
    pixelScriptLoading = false;
    window.fbq.__selloScriptRequested = false;
  };
  script.onload = () => {
    pixelScriptLoading = false;
    try {
      if (window.fbq.__selloStub) {
        window.fbq.__selloStub = false;
      }
      window.fbq("init", META_PIXEL_ID);
      window.fbq("track", "PageView");
      window.dispatchEvent(new CustomEvent("sello:meta-pixel-ready"));
    } catch {
      /* ad blockers / privacy tools */
    }
  };

  const firstScript = document.getElementsByTagName("script")[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}

/**
 * Prefer loadMarketingScripts after consent. Kept for callers that still schedule Meta alone.
 */
export function scheduleFacebookPixelLoad() {
  if (pixelLoadScheduled || typeof window === "undefined") return;
  if (!hasCookieConsent()) return;
  pixelLoadScheduled = true;
  loadFacebookPixel();
}

export const trackMetaEvent = (event, data = {}) => {
  if (typeof window === "undefined") return;
  ensureFbqStub();
  if (typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, data);
  } catch {
    /* ignore */
  }
};

export const trackViewContent = (car) => {
  if (!car) return;
  const id = car._id ?? car.id ?? "";
  trackMetaEvent("ViewContent", {
    content_name: car.title || "",
    content_ids: id ? [String(id)] : [],
    content_type: "product",
    value: Number(car.price ?? car.currentBid ?? 0) || 0,
    currency: "PKR",
  });
};

export const trackSearch = (query) => {
  trackMetaEvent("Search", {
    search_string: query || "",
  });
};

export const trackLead = () => {
  trackMetaEvent("Lead");
};

export const trackContact = () => {
  trackMetaEvent("Contact");
};
