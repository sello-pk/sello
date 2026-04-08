import React, { useMemo } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Navbar from "./components/Navbar.jsx";
import BottomHeader from "./components/BottomHeader.jsx";
import Footer from "./components/Footer.jsx";
import WhatsAppChatWidget from "./components/features/help/WhatsAppChatWidget.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import AppRouter from "./routes/AppRouter.jsx";
import SEO from "./components/common/SEO.jsx";

const prettifySlug = (value = "") =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getRouteSeo = (pathname, search) => {
  const searchParams = new URLSearchParams(search);
  const searchTerm = searchParams.get("search");
  const city = searchParams.get("city");
  const make = searchParams.get("make");
  const model = searchParams.get("model");

  const defaultSeo = {
    title: "Sello.pk | Buy & Sell Cars in Pakistan",
    description:
      "Discover trusted car listings, live auctions, and dealer inventory across Pakistan on Sello.pk.",
  };

  const configs = [
    {
      path: "/",
      seo: {
        title: "Car for Sale in Pakistan | Buy & Sell Used Cars – Sello.pk",
        description:
          "Find the best car for sale in Pakistan on Sello.pk. Buy or sell used cars in Karachi, Lahore, Islamabad & beyond with verified sellers and fair pricing.",
        keywords: "cars for sale, cars for sale in Pakistan",
        canonical: "https://sello.pk/",
      },
    },
    {
      path: "/home",
      seo: {
        title: "Car for Sale in Pakistan | Buy & Sell Used Cars – Sello.pk",
        description:
          "Find the best car for sale in Pakistan on Sello.pk. Buy or sell used cars in Karachi, Lahore, Islamabad & beyond with verified sellers and fair pricing.",
        keywords: "cars for sale, cars for sale in Pakistan",
        canonical: "https://sello.pk/",
      },
    },
    {
      path: "/listings",
      seo: {
        title: "Buy and Sell Cars in Pakistan | Trusted Brands – Sello.pk",
        description:
          "Buy and sell cars in Pakistan with confidence. Explore premium brands, compare models, and connect with trusted sellers on Sello.pk.",
        keywords: "buy and sell cars, buy and sell cars in Pakistan",
        canonical: "https://sello.pk/listings",
      },
    },
    {
      path: "/cars",
      seo: {
        title: "Buy and Sell Cars in Pakistan | Trusted Brands – Sello.pk",
        description:
          "Buy and sell cars in Pakistan with confidence. Explore premium brands, compare models, and connect with trusted sellers on Sello.pk.",
        keywords: "buy and sell cars, buy and sell cars in Pakistan",
        canonical: "https://sello.pk/listings",
      },
    },
    {
      path: "/listings/categories",
      seo: {
        title: "Vehicle Categories in Pakistan | Browse by Type – Sello.pk",
        description:
          "Explore cars, bikes, vans, trucks, buses, and more by vehicle category on Sello.pk.",
      },
    },
    {
      path: "/listings/:categoryType",
      seo: ({ categoryType }) => {
        const categoryName = prettifySlug(categoryType);
        return {
          title: `${categoryName} for Sale in Pakistan | ${categoryName} Listings – Sello.pk`,
          description: `Browse ${categoryName.toLowerCase()} listings in Pakistan on Sello.pk. Compare prices, explore features, and connect with verified sellers.`,
        };
      },
    },
    {
      path: "/filter",
      seo: {
        title: "Filter Cars for Sale in Pakistan | Refine Your Search – Sello.pk",
        description:
          "Use advanced filters on Sello.pk to narrow down cars for sale in Pakistan by city, make, model, year, and price.",
      },
    },
    {
      path: "/search-results",
      seo: () => {
        const headline =
          searchTerm ||
          [make, model, city].filter(Boolean).join(" ") ||
          "Cars";
        return {
          title: `${headline} Search Results | Cars for Sale in Pakistan – Sello.pk`,
          description:
            "Browse filtered car search results on Sello.pk and compare listings by price, make, model, location, and condition.",
        };
      },
    },
    {
      path: "/view-all-brands",
      seo: {
        title: "All Car Brands in Pakistan | Browse Makes – Sello.pk",
        description:
          "Explore all major car brands and vehicle makes available on Sello.pk, from Suzuki and Toyota to Honda, Kia, and more.",
      },
    },
    {
      path: "/car-estimator",
      seo: {
        title: "AI Car Estimator - Find Your Car's Real Value | Sello.pk",
        description:
          "Get instant AI-powered car valuations for the Pakistani market based on make, model, year, condition, and location.",
      },
    },
    {
      path: "/auctions",
      seo: {
        title: "Car Auctions in Pakistan | Bid on Verified Cars – Sello.pk",
        description:
          "Join car auctions in Pakistan on Sello.pk. Discover verified vehicles, upcoming events, hybrid bidding, and trusted auction support.",
      },
    },
    {
      path: "/auctions/live",
      seo: {
        title: "Live Car Auction in Pakistan | Bid Online – Sello.pk",
        description:
          "Follow live car auctions on Sello.pk, view active bids, compare listed vehicles, and bid online with real-time updates.",
      },
    },
    {
      path: "/auctions/betting",
      seo: {
        title: "Live Car Auction in Pakistan | Bid Online – Sello.pk",
        description:
          "Track live auction bidding on Sello.pk and explore verified vehicles available in current car auctions across Pakistan.",
      },
    },
    {
      path: "/auctions/schedule",
      seo: {
        title: "Auction Schedule | Upcoming Car Auctions in Pakistan – Sello.pk",
        description:
          "Check upcoming car auction dates, schedules, and event details on Sello.pk so you never miss the next bidding opportunity.",
      },
    },
    {
      path: "/auctions/trust-legal",
      seo: {
        title: "Auction Trust & Legal Information | Secure Bidding – Sello.pk",
        description:
          "Review auction trust, compliance, and legal information on Sello.pk before buying or selling vehicles through our auction platform.",
      },
    },
    {
      path: "/auctions/car-detail",
      seo: {
        title: "Auction Car Details | Verified Vehicle Information – Sello.pk",
        description:
          "Review auction vehicle details, specifications, bidding history, and seller information before placing your next bid on Sello.pk.",
      },
    },
    {
      path: "/auctions/compare",
      seo: {
        title: "Compare Auction Cars | Side-by-Side Vehicle Comparison – Sello.pk",
        description:
          "Compare auction vehicles side by side on Sello.pk to make smarter bidding decisions based on specs, price, and condition.",
      },
    },
    {
      path: "/auctions/buyer-dashboard",
      seo: {
        title: "Buyer Dashboard - Live Auctions & Bidding | Sello.pk",
        description:
          "Access your buyer dashboard for live car auctions. View bidding history, manage your watchlist, and track auction activity on Sello.pk.",
      },
    },
    {
      path: "/auctions/wallet",
      seo: {
        title: "Auction Wallet Dashboard | Manage Auction Funds – Sello.pk",
        description:
          "Manage your auction wallet, balance, and token activity on Sello.pk for a smoother bidding experience.",
      },
    },
    {
      path: "/auctions/seller-dashboard",
      seo: {
        title: "Seller Auction Dashboard | Manage Auction Listings – Sello.pk",
        description:
          "Track your auction submissions, bids, and seller activity from the Sello.pk seller auction dashboard.",
      },
    },
    {
      path: "/auctions/token-payment",
      seo: {
        title: "Auction Token Payment | Activate Bidding Access – Sello.pk",
        description:
          "Pay your auction token securely on Sello.pk to unlock bidding access and participate in verified car auctions across Pakistan.",
      },
    },
    {
      path: "/auctions/transactions",
      seo: {
        title: "Auction Transactions | Payment History & Activity – Sello.pk",
        description:
          "Review your auction transactions, deposits, refunds, and payment history in one place on Sello.pk.",
      },
    },
    {
      path: "/auctions/result",
      seo: {
        title: "Auction Results | View Winning Bids & Outcomes – Sello.pk",
        description:
          "Check auction outcomes, winning bids, and payment status for completed vehicle auctions on Sello.pk.",
      },
    },
    {
      path: "/auctions/watchlist",
      seo: {
        title: "Auction Watchlist | Track Cars You Want to Bid On – Sello.pk",
        description:
          "Save auction vehicles to your watchlist on Sello.pk and stay ready for upcoming bids and live auction activity.",
      },
    },
    {
      path: "/blog",
      seo: {
        title: "Car Blog in Pakistan | News, Guides & Insights – Sello.pk",
        description:
          "Read the latest automotive news, buying guides, selling tips, and market insights on the Sello.pk car blog.",
      },
    },
    {
      path: "/blog/all",
      seo: {
        title: "All Blog Posts | Car News & Buying Guides – Sello.pk",
        description:
          "Browse all blog articles on Sello.pk covering car buying, selling, auctions, maintenance, and automotive trends in Pakistan.",
      },
    },
    {
      path: "/about",
      seo: {
        title: "About Us | Buy & Sell Cars Online in Pakistan – Sello.pk",
        description:
          "Sello.pk is a secure and transparent platform to buy and sell cars in Pakistan. Discover our mission, values, and commitment to trusted car trading.",
      },
    },
    {
      path: "/contact",
      seo: {
        title: "Contact Us | 24/7 Car Marketplace Support – Sello.pk",
        description:
          "Need help buying or selling a car in Pakistan? Contact Sello.pk for fast, reliable support. We’re here to guide you every step of the way.",
      },
    },
    {
      path: "/help-center",
      seo: {
        title: "Help Center | Support for Buying & Selling Cars – Sello.pk",
        description:
          "Get support for listings, auctions, payments, and account issues through the Sello.pk Help Center.",
      },
    },
    {
      path: "/help/faqs",
      seo: {
        title: "FAQs | Common Questions About Cars & Auctions – Sello.pk",
        description:
          "Find answers to common questions about buying cars, selling vehicles, payments, and auctions on Sello.pk.",
      },
    },
    {
      path: "/privacy-policy",
      seo: {
        title: "Privacy Policy - Your Data Protection Rights | Sello.pk",
        description:
          "Read how Sello.pk collects, uses, and protects your personal information when you buy or sell cars on our platform.",
      },
    },
    {
      path: "/terms-condition",
      seo: {
        title: "Terms & Conditions - Sello.pk Marketplace Rules",
        description:
          "Read Sello.pk’s terms and conditions for buying and selling cars, including platform rules, rights, and responsibilities.",
      },
    },
    {
      path: "/terms-conditions",
      seo: {
        title: "Terms & Conditions - Sello.pk Marketplace Rules",
        description:
          "Read Sello.pk’s terms and conditions for buying and selling cars, including platform rules, rights, and responsibilities.",
      },
    },
    {
      path: "/saved-cars",
      seo: {
        title: "My Saved Cars - Track Your Favorite Listings | Sello.pk",
        description:
          "View and manage all your saved cars on Sello.pk so you can compare listings and revisit favorites later.",
      },
    },
    {
      path: "/profile",
      seo: {
        title: "My Profile - Account Settings & Preferences | Sello.pk",
        description:
          "Manage your profile settings, preferences, and account information on Sello.pk.",
      },
    },
    {
      path: "/my-listings",
      seo: {
        title: "My Listings | Manage Your Car Ads – Sello.pk",
        description:
          "Review and manage your active car listings, drafts, and sold vehicles from your Sello.pk account.",
      },
    },
    {
      path: "/create-post",
      seo: {
        title: "Create Car Listing | Sell Your Car Online – Sello.pk",
        description:
          "Create a new car listing on Sello.pk and reach buyers across Pakistan with your vehicle ad.",
      },
    },
    {
      path: "/edit-car/:id",
      seo: {
        title: "Edit Car Listing | Update Your Vehicle Ad – Sello.pk",
        description:
          "Update your existing car listing details, images, and pricing on Sello.pk.",
      },
    },
    {
      path: "/edit-auction-car/:id",
      seo: {
        title: "Edit Auction Car Submission | Update Auction Listing – Sello.pk",
        description:
          "Modify your auction car submission, pricing, images, and supporting details on Sello.pk.",
      },
    },
    {
      path: "/my-chats",
      seo: {
        title: "My Chats | Buyer & Seller Conversations – Sello.pk",
        description:
          "Stay connected with buyers and sellers through your Sello.pk chat inbox.",
      },
    },
    {
      path: "/seller/chats",
      seo: {
        title: "Seller Chats | Manage Buyer Inquiries – Sello.pk",
        description:
          "Track and respond to buyer inquiries about your vehicle listings using seller chats on Sello.pk.",
      },
    },
    {
      path: "/dealer/dashboard",
      seo: {
        title: "Dealer Dashboard | Manage Dealer Activity – Sello.pk",
        description:
          "Access your dealer dashboard on Sello.pk to manage inventory, performance, and account activity.",
      },
    },
    {
      path: "/seller/dashboard",
      seo: {
        title: "Seller Dashboard | Manage Listings & Activity – Sello.pk",
        description:
          "Access your Sello.pk seller dashboard to manage listings, leads, and sales activity.",
      },
    },
    {
      path: "/login",
      seo: {
        title: "Login | Sello.pk",
        description:
          "Login to your Sello.pk account to manage listings, auctions, chats, and saved cars.",
      },
    },
    {
      path: "/sign-up",
      seo: {
        title: "Sign Up - Create Your Free Sello Account",
        description:
          "Create your free Sello.pk account to buy and sell cars in Pakistan and access listings, auctions, and more.",
      },
    },
    {
      path: "/forgot-password",
      seo: {
        title: "Forgot Password - Reset Your Account Password | Sello.pk",
        description:
          "Reset your Sello account password securely with OTP verification.",
      },
    },
    {
      path: "/verify-otp",
      seo: {
        title: "Verify OTP - Confirm Your Identity | Sello.pk",
        description:
          "Verify your OTP to securely continue your account recovery flow on Sello.pk.",
      },
    },
    {
      path: "/reset-password",
      seo: {
        title: "Reset Password | Secure Account Recovery – Sello.pk",
        description:
          "Create a new password and restore access to your Sello.pk account securely.",
      },
    },
    {
      path: "/reset-success",
      seo: {
        title: "Password Reset Successful | Sello.pk",
        description:
          "Your Sello.pk account password has been updated successfully.",
      },
    },
    {
      path: "/accept-invite/:token",
      seo: {
        title: "Accept Invitation | Join Sello.pk",
        description:
          "Accept your invitation and complete account setup on Sello.pk.",
      },
    },
    {
      path: "/admin/*",
      seo: {
        title: "Sello Admin",
        description: "Sello.pk administration area.",
      },
    },
  ];

  for (const config of configs) {
    const match = matchPath(
      { path: config.path, end: config.path !== "/admin/*" },
      pathname,
    );
    if (!match) continue;
    return typeof config.seo === "function"
      ? config.seo(match.params || {})
      : config.seo;
  }

  return pathname === "*"
    ? {
        title: "Page Not Found | Sello.pk",
        description:
          "The page you’re looking for could not be found on Sello.pk.",
      }
    : defaultSeo;
};

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
  const location = useLocation();
  const fallbackSeo = useMemo(
    () => getRouteSeo(location.pathname, location.search),
    [location.pathname, location.search],
  );

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
      {fallbackSeo && <SEO {...fallbackSeo} />}
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
