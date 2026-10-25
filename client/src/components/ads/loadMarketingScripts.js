/**
 * Loads non-essential analytics / ads tags only after cookie consent.
 * Mirrors the previous index.html deferred loaders, without firing before disclosure.
 */

import { hasCookieConsent } from "./consent";

let started = false;

function injectScript(src, { id, crossOrigin } = {}) {
  if (id && document.getElementById(id)) return null;
  const s = document.createElement("script");
  if (id) s.id = id;
  s.async = true;
  if (crossOrigin) s.crossOrigin = crossOrigin;
  s.src = src;
  document.head.appendChild(s);
  return s;
}

function loadGoogleAnalytics() {
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  injectScript(
    "https://www.googletagmanager.com/gtag/js?id=G-81SP569LXT",
    { id: "sello-gtag-js" },
  );
  window.gtag("js", new Date());
  window.gtag("config", "G-81SP569LXT");
}

function loadGtm() {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    "gtm.start": new Date().getTime(),
    event: "gtm.js",
  });
  injectScript(
    "https://www.googletagmanager.com/gtm.js?id=GTM-KPGZZ337",
    { id: "sello-gtm" },
  );
}

function loadMetaPixel() {
  if (window.fbq?._selloLoaded) return;
  !(function (f, b, e, v, n) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
  })(window, document);
  injectScript("https://connect.facebook.net/en_US/fbevents.js", {
    id: "sello-fbevents",
  });
  window.fbq("init", "1687648445884627");
  window.fbq("track", "PageView");
  window.fbq._selloLoaded = true;
  try {
    window.dispatchEvent(new Event("sello:meta-pixel-ready"));
  } catch {
    /* ignore */
  }
}

function loadTikTok() {
  if (window.ttq?._selloLoaded) return;
  !(function (w, d, t) {
    w.TiktokAnalyticsObject = t;
    var ttq = (w[t] = w[t] || []);
    ttq.methods = [
      "page",
      "track",
      "identify",
      "instances",
      "debug",
      "on",
      "off",
      "once",
      "ready",
      "alias",
      "group",
      "enableCookie",
      "disableCookie",
      "holdConsent",
      "revokeConsent",
      "grantConsent",
    ];
    ttq.setAndDefer = function (t, e) {
      t[e] = function () {
        t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
      };
    };
    for (var i = 0; i < ttq.methods.length; i++)
      ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) {
      for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
        ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (e, n) {
      var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i = ttq._i || {};
      ttq._i[e] = [];
      ttq._i[e]._u = r;
      ttq._t = ttq._t || {};
      ttq._t[e] = +new Date();
      ttq._o = ttq._o || {};
      ttq._o[e] = n || {};
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.async = !0;
      s.src = r + "?sdkid=" + e + "&lib=" + t;
      var x = document.getElementsByTagName("script")[0];
      x.parentNode.insertBefore(s, x);
    };
  })(window, document, "ttq");
  window.ttq.load("D8MDRHBC77UCQ7E688EG");
  window.ttq.page();
  window.ttq._selloLoaded = true;
}

function loadContentSquare() {
  injectScript("https://t.contentsquare.net/uxa/49bee21e3b2cf.js", {
    id: "sello-contentsquare",
  });
}

/**
 * Idempotent. Safe to call from CookieConsent and App bootstrap.
 */
export function loadMarketingScripts() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  if (!hasCookieConsent()) return false;
  if (started) return true;
  started = true;

  try {
    loadGoogleAnalytics();
    loadGtm();
    loadMetaPixel();
    loadTikTok();
    // Clarity is initialized from App.jsx (react-microsoft-clarity) after consent
    loadContentSquare();

  } catch {
    started = false;
    return false;
  }
  return true;
}
