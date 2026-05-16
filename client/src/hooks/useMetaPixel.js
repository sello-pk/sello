import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * PageView on SPA navigations after deferred pixel has loaded.
 * Initial PageView is fired from loadFacebookPixel() — not duplicated here.
 */
export default function useMetaPixel() {
  const location = useLocation();
  const isFirstRoute = useRef(true);

  useEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }

    const track = () => {
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        try {
          window.fbq("track", "PageView");
        } catch {
          /* ignore */
        }
      }
    };

    if (typeof window.fbq === "function" && !window.fbq.__selloStub) {
      track();
      return;
    }

    window.addEventListener("sello:meta-pixel-ready", track, { once: true });
    return () => window.removeEventListener("sello:meta-pixel-ready", track);
  }, [location.pathname, location.search]);
}
