import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  hasCookieConsent,
  setCookieConsent,
} from "../ads/consent";
import { loadAdSenseScript } from "../ads/loadAdSenseScript";

/**
 * Lightweight cookie notice for AdSense / analytics disclosure.
 * Does not block the site; records acknowledgment, then allows AdSense to load.
 */
const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasCookieConsent()) {
      // Returning visitor — warm the AdSense loader without showing the banner.
      loadAdSenseScript();
      return;
    }
    setVisible(true);
  }, []);

  const accept = () => {
    setCookieConsent();
    setVisible(false);
    loadAdSenseScript();
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie notice"
      className="fixed bottom-0 inset-x-0 z-[60] p-3 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white shadow-lg px-4 py-3 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-sm text-slate-700 flex-1 leading-relaxed">
          We use cookies for site functionality, analytics, and to show relevant
          ads (including Google AdSense). See our{" "}
          <Link
            to="/privacy-policy#advertising"
            className="text-[#ff8a00] font-medium underline-offset-2 hover:underline"
          >
            Privacy Policy
          </Link>{" "}
          for details and ad opt-out options.
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-lg bg-[#0B0C1E] text-white text-sm font-semibold px-4 py-2.5 hover:opacity-90 transition-opacity"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
