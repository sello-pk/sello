import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { SupportChatProvider } from "./contexts/SupportChatContext.jsx";
import { SocketProvider } from "./contexts/SocketContext.jsx";
import ErrorBoundary from "./components/common/ErrorBoundary.jsx";
import AppRoot from "./AppRoot.jsx";
import "leaflet/dist/leaflet.css";
import { logger } from "./utils/logger.js";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  if (import.meta.env.DEV) {
    logger.warn(
      "VITE_GOOGLE_CLIENT_ID is not set. Google Login will not work."
    );
  } else {
    throw new Error(
      "Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID."
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppRoot>
      <Provider store={store}>
        <BrowserRouter>
          <ErrorBoundary>
            <GoogleOAuthProvider clientId={googleClientId}>
              <SocketProvider>
                <SupportChatProvider>
                  <App />
                </SupportChatProvider>
              </SocketProvider>
            </GoogleOAuthProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </Provider>
    </AppRoot>
  </React.StrictMode>
);

