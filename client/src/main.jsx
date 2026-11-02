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
import { tryReloadOnceForStaleChunk } from "./utils/lazyImports.js";
import heroLcpDesktop from "./assets/images/hero.webp";
import heroLcpMobile from "./assets/images/heroMobile.webp";

// Homepage-only hero LCP preload. In dev the hrefs are the bundled hashed
// assets; in production the stable /lcp/* URLs (copied at build time) are
// preloaded so the hero is discoverable before the main chunk. Blog/article
// pages intentionally skip these so they don't fetch the hero image.
function injectHomeHeroPreloads() {
  const path = window.location.pathname || "/";
  const isHome = path === "/" || path === "/home";
  if (!isHome) return;
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  const target = isMobile
    ? {
        id: "sello-preload-hero-lcp-mobile",
        href: import.meta.env.PROD ? "/lcp/heroMobile.webp" : heroLcpMobile,
      }
    : {
        id: "sello-preload-hero-lcp-desktop",
        href: import.meta.env.PROD ? "/lcp/hero.webp" : heroLcpDesktop,
      };
  if (document.getElementById(target.id)) return;
  const link = document.createElement("link");
  link.id = target.id;
  link.rel = "preload";
  link.as = "image";
  link.href = target.href;
  link.setAttribute("fetchpriority", "high");
  document.head.appendChild(link);
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  injectHomeHeroPreloads();
}

window.addEventListener("unhandledrejection", (event) => {
  if (tryReloadOnceForStaleChunk(event.reason)) {
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRoot>
      <Provider store={store}>
        <BrowserRouter>
          <ErrorBoundary>
            <SocketProvider>
              <SupportChatProvider>
                <App />
              </SupportChatProvider>
            </SocketProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </AppRoot>
  </React.StrictMode>,
);
