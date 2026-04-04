import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar.jsx";
import BottomHeader from "./components/BottomHeader.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppChatWidget from "./components/features/help/WhatsAppChatWidget.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import AppRouter from "./routes/AppRouter.jsx";

const getPageTitle = (pathname) => {
  if (pathname.startsWith("/admin")) return "Sello Admin";
  if (pathname.startsWith("/blog/")) return "Blog Details | Sello";

  const exactTitles = {
    "/": "Sello - Buy and Sell Cars in Pakistan",
    "/home": "Sello - Buy and Sell Cars in Pakistan",
    "/listings": "Car Listings | Sello",
    "/cars": "Car Listings | Sello",
    "/car-estimator": "AI Car Estimator | Sello",
    "/blog": "Blog | Sello",
    "/blog/all": "All Blogs | Sello",
    "/about": "About Us | Sello",
    "/contact": "Contact Us | Sello",
    "/help-center": "Help Center | Sello",
    "/help/faqs": "FAQs | Sello",
    "/login": "Login | Sello",
    "/sign-up": "Sign Up | Sello",
  };

  return exactTitles[pathname] || "Sello";
};

// ScrollToTop component to scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const pathnameChanged = prevPathnameRef.current !== pathname;
    prevPathnameRef.current = pathname;

    if (pathname.startsWith("/admin")) return;

    if (pathnameChanged) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
    } else if (window.scrollY > 0) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  return null;
};

const App = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = getPageTitle(location.pathname);
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

  const shouldShowNavbarFooter =
    !hideNavbarFooter.includes(location.pathname) &&
    !location.pathname.startsWith("/admin");

  return (
    <ThemeProvider>
      <ScrollToTop />
      <Toaster />

      {/* Show Navbar + BottomHeader except for auth pages + admin */}
      {shouldShowNavbarFooter && (
        <>
          <Navbar />
          <BottomHeader />
        </>
      )}

      <main
        id="main-content"
        className={`min-w-0 overflow-x-hidden ${
          shouldShowNavbarFooter ? "pb-0" : "h-screen overflow-hidden pb-0"
        }`}
      >
        <AppRouter />
      </main>

      {/* Show Footer except for auth pages & admin */}
      {shouldShowNavbarFooter && <Footer />}

      {/* Support Chat Widget - Show on all pages except auth and admin */}
      {shouldShowNavbarFooter && <WhatsAppChatWidget />}
    </ThemeProvider>
  );
};

export default App;
