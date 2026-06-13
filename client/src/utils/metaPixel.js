/**
 * Meta Pixel (Facebook) — deferred load + safe event helpers.
 * Scripts load after first interaction or ~4s idle so FCP/LCP/TBT are not blocked.
 */

export const META_PIXEL_ID = "1687648445884627";

let pixelLoadScheduled = false;

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
 * Schedule pixel: first scroll/pointer/touch/key OR 4s — whichever comes first.
 */
export function scheduleFacebookPixelLoad() {
  if (pixelLoadScheduled || typeof window === "undefined") return;
  pixelLoadScheduled = true;
  ensureFbqStub();

  let fired = false;
  const run = () => {
    if (fired) return;
    fired = true;
    clearTimeout(idleTimer);
    interactionEvents.forEach((ev) =>
      window.removeEventListener(ev, run, listenerOpts),
    );
    loadFacebookPixel();
  };

  const idleTimer = setTimeout(run, 4000);
  const listenerOpts = { passive: true, capture: true };
  const interactionEvents = [
    "scroll",
    "pointerdown",
    "keydown",
    "touchstart",
    "click",
  ];
  interactionEvents.forEach((ev) =>
    window.addEventListener(ev, run, listenerOpts),
  );
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
