import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { BrowserRouter } from "react-router-dom";
import { SupportChatProvider } from "./contexts/SupportChatContext.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import AppRoot from "./AppRoot.jsx";
import { logger } from "./utils/logger.js";
import {
  lazyImport,
  tryReloadOnceForStaleChunk,
} from "./utils/lazyImports.js";
import { scheduleFacebookPixelLoad } from "./utils/metaPixel.js";
import heroLcpDesktop from "./assets/images/hero.webp";
import heroLcpMobile from "./assets/images/heroMobile.webp";

// Defer Meta Pixel network (index.html only stubs fbq)
scheduleFacebookPixelLoad();

// Dev fallback: production uses /lcp/* preloads in index.html
if (typeof document !== "undefined" && import.meta.env.DEV) {
  const path = window.location.pathname || "/";
  const isHome = path === "/" || path === "/home";
  if (isHome) {
    const preloads = [
      {
        id: "sello-preload-hero-lcp-mobile",
        href: heroLcpMobile,
        media: "(max-width: 767px)",
      },
      {
        id: "sello-preload-hero-lcp-desktop",
        href: heroLcpDesktop,
        media: "(min-width: 768px)",
      },
    ];
    for (const { id, href, media } of preloads) {
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      link.media = media;
      link.setAttribute("fetchpriority", "high");
      document.head.appendChild(link);
    }
  }
}

window.addEventListener("unhandledrejection", (event) => {
  if (tryReloadOnceForStaleChunk(event.reason)) {
    event.preventDefault();
  }
});

// Lazy load Google OAuth only when needed
const GoogleOAuthProvider = lazyImport(() =>
  import("@react-oauth/google").then((module) => ({
    default: module.GoogleOAuthProvider,
  })),
);

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  if (import.meta.env.DEV) {
    logger.warn(
      "VITE_GOOGLE_CLIENT_ID is not set. Google Login will not work.",
    );
  } else {
    throw new Error(
      "Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID.",
    );
  }
}

// Always wrap with OAuth provider when configured
const OAuthWrapper = ({ children }) => {
  if (!googleClientId) {
    return <>{children}</>; // No OAuth if not configured
  }
  
  return (
    <Suspense fallback={children}>
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    </Suspense>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRoot>
      <Provider store={store}>
        <BrowserRouter>
          <ErrorBoundary>
            <OAuthWrapper>
              <SocketProvider>
                <SupportChatProvider>
                  <App />
                </SupportChatProvider>
              </SocketProvider>
            </OAuthWrapper>
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </AppRoot>
  </React.StrictMode>,
);
