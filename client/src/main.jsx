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
  const preloads = [
    {
      id: "sello-preload-hero-lcp-mobile",
      href: import.meta.env.PROD ? "/lcp/heroMobile.webp" : heroLcpMobile,
      media: "(max-width: 767px)",
    },
    {
      id: "sello-preload-hero-lcp-desktop",
      href: import.meta.env.PROD ? "/lcp/hero.webp" : heroLcpDesktop,
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

/**
 * Older static prerenders appended a full App HTML tree as a sibling of
 * #root (after a <!-- prerendered:... --> comment). React then mounted a
 * second App inside #root → double navbar/footer on blog/about/legal pages.
 * New builds inject into #root; this only removes leftover OUTSIDE siblings.
 * SPA shells (home/listings/tools) are untouched: they have no orphan chrome.
 */
function removeOrphanedPrerenderOutsideRoot() {
  const root = document.getElementById("root");
  if (!root?.parentNode) return;

  // New correct builds already have the app tree inside #root — do nothing.
  const rootHasAppChrome = Boolean(
    root.querySelector("nav.sello-site-nav, #main-content, footer"),
  );

  const isOrphanAppNode = (el) => {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (el.tagName === "SCRIPT" || el.tagName === "LINK" || el.tagName === "STYLE") {
      return false;
    }
    if (el.tagName === "NOSCRIPT") return false;
    return Boolean(
      el.matches?.(
        "nav.sello-site-nav, #main-content, footer, [data-rht-toaster], .sello-bottom-bar",
      ) ||
        el.querySelector?.(
          "nav.sello-site-nav, #main-content, footer, .sello-bottom-bar",
        ) ||
        el.hasAttribute?.("data-rht-toaster"),
    );
  };

  let node = root.nextSibling;
  let stripping = false;
  while (node) {
    const next = node.nextSibling;
    if (
      node.nodeType === Node.COMMENT_NODE &&
      /prerendered:/.test(String(node.nodeValue || ""))
    ) {
      stripping = true;
      node.parentNode.removeChild(node);
      node = next;
      continue;
    }

    // Legacy deploy fallback: empty #root + orphaned App chrome siblings.
    if (!stripping && !rootHasAppChrome && isOrphanAppNode(node)) {
      stripping = true;
    }

    if (stripping) {
      const keepScript =
        node.nodeType === Node.ELEMENT_NODE && node.tagName === "SCRIPT";
      if (!keepScript) {
        node.parentNode.removeChild(node);
      }
    }
    node = next;
  }
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  injectHomeHeroPreloads();
  removeOrphanedPrerenderOutsideRoot();
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
