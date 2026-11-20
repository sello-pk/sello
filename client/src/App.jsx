import React, { Suspense, useMemo, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { lazyImport } from "./utils/lazyImports.js";

// Components
import Navbar from "./components/Navbar.jsx";
import BottomHeader from "./components/BottomHeader.jsx";
import Footer from "./components/Footer.jsx";
import { AdSenseSlot } from "./components/ads";
import { isAnalyticsEnabled } from "./components/ads/loadMarketingScripts";
/** Filename avoids "cookieconsent" (cookie-blocker lists match that URL substring). */
import PrivacyNotice from "./components/common/PrivacyNotice.jsx";
/** Chunk filename avoids "WhatsApp" (many blockers strip that URL substring). */
const HelpChatWidget = lazyImport(
  () => import("./components/features/help/HelpChatWidget.jsx"),
);
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import AppRouter from "./routes/AppRouter.jsx";
import { RouteSeo } from "./components/common/SEO.jsx";
import useMetaPixel from "./hooks/useMetaPixel.js";
import { getRouteSeo } from "./utils/routeSeo.js";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    if (pathname.startsWith("/admin")) return;

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
  }, [pathname]);

  return null;
};

const App = () => {
  useMetaPixel();
  const location = useLocation();
  const [showHelpChat, setShowHelpChat] = useState(false);
  const fallbackSeo = useMemo(
    () => getRouteSeo(location.pathname, location.search),
    [location.pathname, location.search],
  );

  const clarityRef = React.useRef(null);

  useEffect(() => {
    const projectId = import.meta.env.VITE_CLARITY_PROJECT_ID;
    if (!projectId) return;

    let cancelled = false;
    let unsubscribe = () => {};

    const initClarity = async () => {
      try {
        const { hasCookieConsent } = await import("./components/ads/consent.js");
        if (
          cancelled ||
          !hasCookieConsent() ||
          !isAnalyticsEnabled() ||
          clarityRef.current
        )
          return;
        const mod = await import("react-microsoft-clarity");
        if (cancelled) return;
        clarityRef.current = mod.clarity;
        mod.clarity.init(projectId);
        mod.clarity.setTag("environment", import.meta.env.MODE);
        mod.clarity.setTag("platform", "web");
      } catch {
        /* ignore */
      }
    };

    const scheduleInit = () => {
      // Session replay is production-only, same as the other analytics tags.
      if (!isAnalyticsEnabled()) return;
      if (typeof window.requestIdleCallback === "function") {
        requestIdleCallback(initClarity, { timeout: 5000 });
      } else {
        setTimeout(initClarity, 3000);
      }
    };

    (async () => {
      try {
        const consent = await import("./components/ads/consent.js");
        if (cancelled) return;
        if (consent.hasCookieConsent()) scheduleInit();
        unsubscribe = consent.subscribeCookieConsent(scheduleInit);
      } catch {
        /* ignore */
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!location?.pathname || !clarityRef.current) return;

    clarityRef.current.setTag("page", location.pathname);
    clarityRef.current.setEvent("page_view");
  }, [location.pathname]);

  const hideNavbarFooter = [
    "/login",
    "/sign-up",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/reset-success",
    "/accept-invite",
  ];

  const isAdminPage = location.pathname.startsWith("/admin");
  const shouldShowNavbarFooter =
    !hideNavbarFooter.includes(location.pathname) &&
    !location.pathname.startsWith("/accept-invite/") &&
    !isAdminPage;

  // Defer support chat (socket.io + RTK) until idle — reduces mobile INP/TBT on first paint
  useEffect(() => {
    if (!shouldShowNavbarFooter) {
      setShowHelpChat(false);
      return;
    }
    let cancelled = false;
    const enable = () => {
      if (!cancelled) setShowHelpChat(true);
    };
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(enable, { timeout: 4500 });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(id);
      };
    }
    const t = window.setTimeout(enable, 3500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [shouldShowNavbarFooter, location.pathname]);

  return (
    <ThemeProvider>
      <ScrollToTop />
      <Toaster containerStyle={{ zIndex: 100001 }} />

      {/* Show Navbar + BottomHeader except for auth pages + admin */}
      {shouldShowNavbarFooter && (
        <>
          <Navbar />
          <BottomHeader />
        </>
      )}

      <main
        id="main-content"
        className={`min-w-0 w-full max-w-full ${
          isAdminPage ? "h-dvh overflow-hidden" : ""
        }`}
      >
        <RouteSeo fallback={fallbackSeo}>
          <AppRouter />
        </RouteSeo>
      </main>

      {/* Global ad slot: public pages only, above the footer. */}
      {shouldShowNavbarFooter && (
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
          <AdSenseSlot slot="globalFooter" minHeight={200} />
        </div>
      )}

      {/* Show Footer except for auth pages & admin */}
      {shouldShowNavbarFooter && <Footer />}

      {/* Cookie / AdSense disclosure — public pages only */}
      {shouldShowNavbarFooter && <PrivacyNotice />}

      {/* Support chat — lazy chunk; filename HelpChatWidget avoids ad-block false blocks */}
      {shouldShowNavbarFooter && showHelpChat && (
        <Suspense fallback={null}>
          <HelpChatWidget />
        </Suspense>
      )}
    </ThemeProvider>
  );
};

export default App;
