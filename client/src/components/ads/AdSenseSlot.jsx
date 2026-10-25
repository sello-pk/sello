import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { ADSENSE_CLIENT, AD_SLOTS } from "./adSlots";
import {
  hasCookieConsent,
  subscribeCookieConsent,
} from "./consent";
import { loadAdSenseScript } from "./loadAdSenseScript";
import {
  isPrivatePath,
  isInternalSearch,
  subscribeAdsBlock,
  getAdsBlocked,
} from "../../utils/seoPolicy";

/**
 * AdSenseSlot — the single AdSense entry point for the whole app.
 *
 * Usage:  <AdSenseSlot slot="homepageFeed" />
 *
 * Design notes:
 * - One implementation, many locations. Never paste raw AdSense markup into a
 *   page; add a slot to adSlots.js and render this component instead.
 * - Renders nothing until `slot` has a real ad unit id in env, so an
 *   unconfigured deployment produces a clean page instead of broken ad units.
 * - AdSense script loads only after cookie consent (see CookieConsent.jsx).
 * - AdSense policy: no Google ads on screens without publisher content (login,
 *   sign-up, dashboards, payment/wallet, chats, admin, 404 / "not found",
 *   empty internal-search pages). Those routes are listed once in
 *   utils/seoPolicy.js and any page rendering <SEO robots="noindex..."> also
 *   blocks ads while mounted.
 */
const AdSenseSlot = ({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  minHeight = 280,
  width,
  height,
  className = "",
  label = "Advertisement",
}) => {
  const location = useLocation();
  const pageBlocksAds = useSyncExternalStore(
    subscribeAdsBlock,
    getAdsBlocked,
    () => false,
  );
  const consentOk = useSyncExternalStore(
    subscribeCookieConsent,
    hasCookieConsent,
    () => false,
  );
  const routeAllowsAds =
    !isPrivatePath(location.pathname) &&
    !isInternalSearch(location.pathname, location.search) &&
    !pageBlocksAds;
  const adSlotId = routeAllowsAds && consentOk ? AD_SLOTS[slot] : "";
  const containerRef = useRef(null);
  const pushedRef = useRef(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (!adSlotId || !consentOk) {
      setScriptReady(false);
      return undefined;
    }
    let cancelled = false;
    loadAdSenseScript().then((ok) => {
      if (!cancelled) setScriptReady(Boolean(ok));
    });
    return () => {
      cancelled = true;
    };
  }, [adSlotId, consentOk]);

  useEffect(() => {
    // Not configured yet, or ad-ineligible page -> stay invisible. Reset so a
    // fresh <ins> is pushed when the slot comes back on an eligible page.
    if (!adSlotId || !scriptReady) {
      pushedRef.current = false;
      return undefined;
    }

    const node = containerRef.current;
    if (!node) return undefined;

    // React 18 StrictMode mounts effects twice in dev; only push once.
    if (pushedRef.current) return undefined;

    let observer = null;
    let cancelled = false;

    const pushAd = () => {
      if (cancelled || pushedRef.current) return;
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      } catch {
        // Blocked or offline: leave the reserved space empty rather than
        // throwing during render.
      }
    };

    if (typeof IntersectionObserver === "undefined") {
      pushAd();
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            pushAd();
            observer?.disconnect();
          }
        },
        // Start loading a little before the block scrolls into view.
        { rootMargin: "200px 0px" },
      );
      observer.observe(node);
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [adSlotId, scriptReady]);

  // A publisher id and a slot id are both required before we emit ad markup.
  if (!ADSENSE_CLIENT || !adSlotId) return null;

  return (
    <aside
      className={`w-full flex flex-col items-center ${className}`.trim()}
      aria-label={label}
      data-ad-slot-name={slot}
    >
      <span className="text-[10px] uppercase tracking-widest text-gray-400 select-none">
        {label}
      </span>
      {/*
        AdSense requires the `adsbygoogle` class plus `data-ad-client` on the
        <ins> itself; the push only tells the loader to fill it. React must not
        re-render this node after the push, so it is keyed and never mutated.
      */}
      <ins
        key={`${slot}-${adSlotId}`}
        ref={containerRef}
        className="adsbygoogle"
        style={
          width && height
            ? {
                display: "inline-block",
                width: `${width}px`,
                height: `${height}px`,
              }
            : { display: "block", width: "100%", minHeight: `${minHeight}px` }
        }
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={adSlotId}
        {...(width && height
          ? {}
          : {
              "data-ad-format": format,
              "data-full-width-responsive": fullWidthResponsive
                ? "true"
                : "false",
            })}
      />
    </aside>
  );
};

export default AdSenseSlot;
