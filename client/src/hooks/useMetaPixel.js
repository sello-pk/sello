import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fires Meta Pixel PageView on client-side route changes.
 * Skips the first run so the initial PageView from index.html is not duplicated.
 */
export default function useMetaPixel() {
  const location = useLocation();
  const isFirstRoute = useRef(true);

  useEffect(() => {
    if (isFirstRoute.current) {
      isFirstRoute.current = false;
      return;
    }

    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      try {
        window.fbq("track", "PageView");
      } catch {
        /* ignore */
      }
    } else if (import.meta.env.DEV) {
      console.warn("Meta Pixel not available (route change)");
    }
  }, [location.pathname, location.search]);
}
