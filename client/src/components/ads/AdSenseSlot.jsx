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
 * - AdSense script loads only after cookie consent (see PrivacyNotice.jsx).
 * - AdSense policy: no Google ads on screens without publisher content (login,
 *   sign-up, dashboards, payment/wallet, chats, admin, 404 / "not found",
 *   empty internal-search pages). Those routes are listed once in
 *   utils/seoPolicy.js and any page rendering <SEO robots="noindex..."> also
 *   blocks ads while mounted.
 */
const AD_FILL_TIMEOUT_MS = 12 * 1000;

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
  // idle | loading | ready | blocked
  // `blocked` means the loader could not be fetched (ad blocker, Brave
  // Shields, extension, offline) — in that case we render nothing at all
  // instead of leaving an empty "Advertisement" box on the page forever.
  const [scriptState, setScriptState] = useState("idle");
  // pending | filled | unfilled — whether Google actually painted an ad.
  // An unfilled unit (new account, no inventory, unapproved origin such as
  // localhost, ad blocker that lets the loader through) would otherwise leave
  // a labelled, height-reserved empty box on the page.
  const [adState, setAdState] = useState("pending");
  const [pushed, setPushed] = useState(false);

  useEffect(() => {
    if (!adSlotId || !consentOk) {
      setScriptState("idle");
      return undefined;
    }
    let cancelled = false;
    setScriptState("loading");
    loadAdSenseScript().then((ok) => {
      if (!cancelled) setScriptState(ok ? "ready" : "blocked");
    });
    return () => {
      cancelled = true;
    };
  }, [adSlotId, consentOk]);

  useEffect(() => {
    // Not configured yet, or ad-ineligible page -> stay invisible. Reset so a
    // fresh <ins> is pushed when the slot comes back on an eligible page.
    if (!adSlotId || scriptState !== "ready") {
      pushedRef.current = false;
      setPushed(false);
      setAdState("pending");
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
      // Arm the fill watchdog first: if the push below throws (blocked or
      // offline) we still want the empty reserved box to disappear.
      pushedRef.current = true;
      setPushed(true);
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      } catch {
        // Blocked or offline: leave the reserved space empty rather than
        // throwing during render.
      }
    };

    if (typeof IntersectionObserver === "undefined" || window.localStorage.getItem("__eagerAds") === "1") {
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
  }, [adSlotId, scriptState]);

  // Wait for Google to answer a pushed unit: "filled" (an iframe was painted)
  // or "unfilled" (no ad to serve). When nothing is ever reported — the usual
  // case on localhost, unapproved origins, or a half-blocked setup — stop
  // waiting after a grace period, so no empty labelled box is left behind.
  useEffect(() => {
    if (!pushed) return undefined;
    const node = containerRef.current;
    if (!node) return undefined;

    let observer = null;
    let timer = null;
    let settled = false;

    const stop = () => {
      settled = true;
      observer?.disconnect();
      clearTimeout(timer);
    };

    const read = () => {
      if (settled) return;
      // Only `data-ad-status` counts: Google also creates a hidden iframe for
      // units it could NOT fill, so an iframe alone is not a fill signal.
      const status = node.getAttribute("data-ad-status");
      if (status === "filled") {
        setAdState("filled");
        stop();
      } else if (status === "unfilled") {
        setAdState("unfilled");
        stop();
      }
    };

    observer = new MutationObserver(read);
    observer.observe(node, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
      childList: true,
      subtree: true,
    });
    timer = setTimeout(() => {
      if (settled) return;
      setAdState((prev) => (prev === "filled" ? prev : "unfilled"));
      stop();
    }, AD_FILL_TIMEOUT_MS);
    read();

    return () => {
      observer?.disconnect();
      clearTimeout(timer);
    };
  }, [pushed]);

  // A publisher id and a slot id are both required before we emit ad markup.
  if (!ADSENSE_CLIENT || !adSlotId) return null;

  // Loader blocked (ad blocker / Brave Shields / extension / offline): emit
  // nothing so the page keeps no empty, labelled ad placeholder.
  if (scriptState === "blocked") return null;

  // Google answered "no ad" (or never answered in time): drop the whole block,
  // label included, instead of showing an empty "Advertisement" gap.
  if (adState === "unfilled") return null;

  return (
    <aside
      className={`w-full flex flex-col items-center ${className}`.trim()}
      aria-label={label}
      data-ad-slot-name={slot}
      data-ad-state={adState}
    >
      {adState === "filled" && (
        <span className="text-[10px] uppercase tracking-widest text-gray-400 select-none">
          {label}
        </span>
      )}
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
