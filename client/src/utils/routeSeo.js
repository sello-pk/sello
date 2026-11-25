import { corePageSeo, getCategoryPageSeo } from "./corePageSeo.js";
import { matchPath } from "react-router-dom";
import { getListingsPageCopy } from "./urlBuilders.js";
import { CAR_LOAN_SEO } from "./carLoanCalculator.js";
import { fuelPricesSeo } from "./fuelPricesContent.js";

const notFoundSeo = {
  title: "Page Not Found | Sello.pk",
  description: "This page could not be found on Sello.pk. Browse car listings, auctions, and support from the homepage.",
  robots: "noindex, follow",
};

function getSearchFilters(search) {
  const params = new URLSearchParams(search);
  return {
    city: params.get("city"),
    make: params.get("make"),
    model: params.get("model"),
    searchTerm: params.get("search"),
  };
}

const prettifySlug = (value = "") =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const adminSections = {
  dashboard: ["Admin Dashboard", "Review marketplace activity and key figures"],
  users: ["Users", "Manage marketplace users and account status"],
  listings: ["Listings", "Review and moderate vehicle listings"],
  valuations: ["Valuations", "Review vehicle valuation requests"],
  dealers: ["Dealers", "Review dealer accounts and verification requests"],
  categories: ["Categories", "Manage vehicle categories and listing fields"],
  blogs: ["Blogs", "Manage and publish automotive articles"],
  "blogs/categories": ["Blog Categories", "Organize articles by category"],
  "blogs/create": ["Create Blog Post", "Write and publish a new automotive article"],
  "blogs/comments": ["Blog Comments", "Review and moderate article comments"],
  "blogs/media": ["Blog Media Library", "Manage images for automotive articles"],
  promotions: ["Promotions", "Manage marketplace promotions"],
  notifications: ["Notifications", "Manage notifications sent to marketplace users"],
  payments: ["Payments", "Review marketplace payments and transactions"],
  analytics: ["Analytics", "Review marketplace reports and analytics"],
  "activity-log": ["Activity Log", "Review administrative activity"],
  "account-deletion-requests": ["Account Deletion Requests", "Review requests to delete user accounts"],
  "chat-monitoring": ["Chat Monitoring", "Review marketplace conversations"],
  "support-chat": ["Support Chat", "Manage customer support conversations"],
  "customer-requests": ["Customer Requests", "Review and respond to customer requests"],
  banners: ["Banners", "Manage marketplace banners"],
  testimonials: ["Testimonials", "Manage published customer testimonials"],
  auctions: ["Auctions", "Manage auction schedules, lots, and results"],
  settings: ["Settings", "Manage marketplace settings and staff access"],
};

const listingDetailSeo = {
  title: "Vehicle Listing | Sello.pk",
  description: "View photos, specifications, price, and seller details for this vehicle on Sello.pk.",
};

const guideSeo = {
  title: "Automotive Guide | Sello.pk",
  description: "Read step-by-step automotive guides from the Sello.pk marketplace.",
};

const routeSeoConfigs = [
  { path: "/", seo: corePageSeo.home },
  { path: "/home", seo: corePageSeo.home },
  { path: "/listings", seo: corePageSeo.listings },
  { path: "/cars/:id", seo: listingDetailSeo },
  { path: "/car-details/:id", seo: listingDetailSeo },
  { path: "/fuel-prices", seo: fuelPricesSeo },
  { path: "/car-loan-calculator", seo: CAR_LOAN_SEO },
  { path: "/petrol-prices", seo: fuelPricesSeo },
  { path: "/listings/:categorySlug/guide/:blogId", seo: guideSeo },
  { path: "/car-estimator/guide/:blogId", seo: guideSeo },
  { path: "/auctions/guide/:blogId", seo: guideSeo },
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
      const suppliedSeo = getCategoryPageSeo(categoryType);
      if (suppliedSeo) return suppliedSeo;
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
      title:
        "Filter Cars for Sale in Pakistan | Refine Your Search – Sello.pk",
      description:
        "Use advanced filters on Sello.pk to narrow down cars for sale in Pakistan by city, make, model, year, and price.",
    },
  },
  {
    path: "/search-results",
    seo: (_params, search) => {
      const { city, make, model, searchTerm } = getSearchFilters(search);
      const copy = getListingsPageCopy({
        city,
        make,
        model,
        searchTerm,
      });
      return {
        title: `${copy.title} | Cars for Sale in Pakistan – Sello.pk`,
        description: copy.description,
      };
    },
  },
  {
    path: "/used-cars/:citySlug",
    seo: ({ citySlug }) => {
      const cityName = prettifySlug(citySlug);
      const copy = getListingsPageCopy({ city: cityName });
      return {
        title: copy.title,
        description: copy.description,
        keywords: `cars for sale in ${cityName}, used cars ${cityName}, ${cityName} cars`,
        canonical: `https://sello.pk/used-cars/${citySlug}`,
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
  { path: "/car-estimator", seo: corePageSeo.estimator },
  {
    path: "/vehicle-verification",
    seo: {
      title: "Online Vehicle Verification in Pakistan | Check Car Details",
      description:
        "Verify your car or bike online through Sello. Open province guides for Punjab, Sindh, KPK, Islamabad, Balochistan, GB and AJK, then continue to official Excise portals.",
      canonical: "https://sello.pk/vehicle-verification",
    },
  },
  {
    path: "/vehicle-verification/punjab",
    seo: {
      title:
        "Punjab Vehicle Verification Online | MTMIS Excise Check – Sello.pk",
      description:
        "Verify Punjab vehicle registration and ownership records via official MTMIS. Read the Sello guide, then open Punjab Excise for the live check.",
      canonical: "https://sello.pk/vehicle-verification/punjab",
    },
  },
  {
    path: "/vehicle-verification/islamabad",
    seo: {
      title:
        "Islamabad Vehicle Verification Online | Excise Check – Sello.pk",
      description:
        "Check Islamabad (ICT) vehicle ownership and registration through official Excise services. Guide on Sello, verification on the government portal.",
      canonical: "https://sello.pk/vehicle-verification/islamabad",
    },
  },
  {
    path: "/vehicle-verification/sindh",
    seo: {
      title: "Sindh Vehicle Verification Online | Excise Search – Sello.pk",
      description:
        "Verify Sindh vehicle registration details on the official Excise vehicle search. Follow the Sello guide, then continue to the government portal.",
      canonical: "https://sello.pk/vehicle-verification/sindh",
    },
  },
  {
    path: "/vehicle-verification/kpk",
    seo: {
      title: "KPK Vehicle Verification Online | Excise MV Records – Sello.pk",
      description:
        "Verify Khyber Pakhtunkhwa vehicle registration via official KP Excise MV records. Read the guide on Sello, then open the government portal.",
      canonical: "https://sello.pk/vehicle-verification/kpk",
    },
  },
  {
    path: "/vehicle-verification/balochistan",
    seo: {
      title:
        "Balochistan Vehicle Verification Online | Excise Check – Sello.pk",
      description:
        "Check Balochistan vehicle registration through official Excise online verification. Guide on Sello, live check on the government portal.",
      canonical: "https://sello.pk/vehicle-verification/balochistan",
    },
  },
  {
    path: "/vehicle-verification/gilgit-baltistan",
    seo: {
      title:
        "Gilgit-Baltistan Vehicle Verification | GB Excise Search – Sello.pk",
      description:
        "Verify Gilgit-Baltistan vehicle registration via official GB Excise vehicle search. Read the Sello guide, then open the government portal.",
      canonical: "https://sello.pk/vehicle-verification/gilgit-baltistan",
    },
  },
  {
    path: "/vehicle-verification/azad-kashmir",
    seo: {
      title: "Azad Kashmir Vehicle Verification Online | AJK IRD – Sello.pk",
      description:
        "Verify Azad Kashmir vehicle token tax / registration-related details via official AJK IRD. Guide on Sello, verification on the government portal.",
      canonical: "https://sello.pk/vehicle-verification/azad-kashmir",
    },
  },
  {
    path: "/driving-licence",
    seo: {
      title:
        "Driving Licence Information & Verification in Pakistan | Sello.pk",
      description:
        "Explore province driving licence guides for Punjab, Sindh, KPK, Islamabad and Balochistan, then continue to official government portals to apply, renew or verify.",
      canonical: "https://sello.pk/driving-licence",
    },
  },
  {
    path: "/driving-licence/punjab",
    seo: {
      exactTitle: true,
      title:
        "Punjab Driving Licence Check Online – DLIMS Verification & Tracking",
      description:
        "Find out how to apply, renew, verify and track your driving licence in Punjab. You can also view your e-driving licence through DLIMS 2.0.",
      canonical: "https://sello.pk/driving-licence/punjab",
    },
  },
  {
    path: "/driving-licence/sindh",
    seo: {
      exactTitle: true,
      title: "How to Apply for a Driving License in Karachi | Step-by-Step Guide",
      description: "Learn how to apply for a driving license in Karachi. Explore Sindh licence requirements, documents, fees, learner permits, driving tests and renewal.",
      canonical: "https://sello.pk/driving-licence/sindh",
    },
  },
  {
    path: "/driving-licence/kpk",
    seo: {
      exactTitle: true,
      title: "KPK Driving License Verification Online | DLIMS KPK Guide",
      description: "Verify your KPK driving license online, track applications and see how to apply for a license, renew or get a learner permit through official KP services.",
      canonical: "https://sello.pk/driving-licence/kpk",
    },
  },
  {
    path: "/driving-licence/islamabad",
    seo: {
      exactTitle: true,
      title: "Islamabad Driving Licence Verification Online | ITP-DLIMS",
      description: "Check out your Islamabad driving license online at ITP-DLIMS. See how to verify, apply, renew, track your license and also check out official fees and requirements.",
      canonical: "https://sello.pk/driving-licence/islamabad",
    },
  },
  {
    path: "/driving-licence/balochistan",
    seo: {
      exactTitle: true,
      title: "Driving License Verification Balochistan Online | QTP DLIMS",
      description: "Verify your Balochistan driving licence online through Quetta Traffic Police. Learn how to check by CNIC, book appointments, apply for a learner permit, renew or get a duplicate licence.",
      canonical: "https://sello.pk/driving-licence/balochistan",
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
  { path: "/auctions/live", seo: corePageSeo.liveAuction },
  { path: "/auctions/betting", seo: corePageSeo.liveAuction },
  {
    path: "/auctions/schedule",
    seo: {
      title:
        "Auction Schedule | Upcoming Car Auctions in Pakistan – Sello.pk",
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
      title:
        "Compare Auction Cars | Side-by-Side Vehicle Comparison – Sello.pk",
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
    path: "/blog/:id",
    seo: {
      title: "Automotive Article | Sello.pk",
      description: "Read automotive news, vehicle guides, and buying and selling advice on the Sello.pk blog.",
    },
  },
  { path: "/about", seo: corePageSeo.about },
  { path: "/contact", seo: corePageSeo.contact },
  {
    path: "/help-center",
    seo: {
      title: "Help Center | Support for Buying & Selling Cars – Sello.pk",
      description:
        "Get support for listings, auctions, payments, and account issues through the Sello.pk Help Center.",
    },
  },
  {
    path: "/help",
    seo: {
      title: "Help Center | Support for Buying & Selling Cars – Sello.pk",
      description:
        "Get support for listings, auctions, payments, and account issues through the Sello.pk Help Center.",
      canonical: "https://sello.pk/help-center",
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
    path: "/help/*",
    seo: {
      title: "Help Center | Support for Buying & Selling Cars – Sello.pk",
      description:
        "Get support for listings, auctions, payments, and account issues through the Sello.pk Help Center.",
      canonical: "https://sello.pk/help-center",
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
      canonical: "https://sello.pk/terms-conditions",
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
      title:
        "Edit Auction Car Submission | Update Auction Listing – Sello.pk",
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
    path: "/admin/blogs/:id/edit",
    seo: { title: "Edit Blog Post | Sello Admin", description: "Edit an automotive article in the Sello.pk admin dashboard." },
  },
  ...Object.entries(adminSections).map(([section, [title, description]]) => ({
    path: `/admin/${section}`,
    seo: { title: `${title} | Sello Admin`, description: `${description} in the Sello.pk admin dashboard.` },
  })),
];

const aliases = new Map([
  ["/terms-and-conditions", "/terms-conditions"],
  ["/admin/blog-categories", "/admin/blogs/categories"],
  ["/admin/blog-comments", "/admin/blogs/comments"],
]);

export const staticSeoPaths = [
  ...routeSeoConfigs.map(({ path }) => path).filter((path) => !/[:*]/.test(path)),
  ...aliases.keys(),
  ...["car", "bike", "bus", "truck", "van", "farm", "buses", "vans", "e-bikes"].map((type) => `/listings/${type}`),
];

export function getRouteSeo(pathname, search = "") {
  const normalizedPath = pathname.toLowerCase().replace(/\/+$/, "") || "/";
  const routePath = aliases.get(normalizedPath) || normalizedPath;
  if (matchPath("/admin/users/:userId", routePath)) {
    return { title: "User Details | Sello Admin", description: "Review a user account and its status in the Sello.pk admin dashboard." };
  }
  for (const config of routeSeoConfigs) {
    const match = matchPath(config.path, routePath);
    if (match) {
      return typeof config.seo === "function"
        ? config.seo(match.params, search)
        : config.seo;
    }
  }

  return notFoundSeo;
}

