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
import "leaflet/dist/leaflet.css";
import { logger } from "./utils/logger.js";

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

// Check if we're on auth pages
const isAuthPage = typeof window !== 'undefined' && 
  (window.location.pathname === '/login' || window.location.pathname === '/signup');

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
