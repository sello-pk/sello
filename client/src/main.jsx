import React, { lazy, Suspense } from "react";
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
import heroLcpUrl from "./assets/images/hero.webp";

// Early LCP hint: same URL as Hero.jsx (browser dedupes with <img>)
if (typeof document !== "undefined") {
  const id = "sello-preload-hero-lcp";
  if (!document.getElementById(id)) {
    const link = document.createElement("link");
    link.id = id;
    link.rel = "preload";
    link.as = "image";
    link.href = heroLcpUrl;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
  }
}

// Lazy load Google OAuth only when needed
const GoogleOAuthProvider = lazy(() => 
  import('@react-oauth/google').then(module => ({ default: module.GoogleOAuthProvider }))
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
