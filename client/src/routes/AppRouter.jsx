import React, { Suspense } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import RouteLoader from "../components/common/RouteLoader";
import { lazyImport } from "../utils/lazyImports.js";
import {
  ProtectedRoute,
  AdminRoute,
  AuctionCapabilityRoute,
} from "../components/shared/RouteGuards.jsx";

/**
 * Eager imports for high-traffic public URLs — these routes do not suspend on
 * first paint, which removes the large RouteLoader → page layout swap (CLS).
 */
import Home from "../pages/Home.jsx";
import Login from "../pages/auth/Login.jsx";
import CarListings from "../pages/listings/CarListings.jsx";
import CarDetails from "../pages/listings/CarDetails.jsx";
import Blog from "../pages/blog/Blog.jsx";
import AllBlog from "../pages/blog/AllBlog.jsx";
import CarEstimator from "../pages/features/CarEstimator.jsx";
import OurPrivacyPolicy from "../pages/ourPages/OurPrivacyPolicy.jsx";
import TermsCondition from "../pages/ourPages/TermsCondition.jsx";
import About from "../pages/about/About.jsx";
import Contact from "../pages/contact/Contact.jsx";
import HelpCenter from "../pages/help/HelpCenter.jsx";
import FAQs from "../pages/help/FAQs.jsx";

// Public core routes (Lazy)
const Signup = lazyImport(() => import("../pages/auth/SignUp.jsx"));
const CategoryListings = lazyImport(
  () => import("../pages/listings/CategoryListings.jsx"),
);
const GenericVehicleCategoryPage = lazyImport(
  () => import("../pages/listings/GenericVehicleCategoryPage.jsx"),
);
const BlogDetails = lazyImport(() => import("../pages/blog/BlogDetails.jsx"));
const EstimatorGuideDetail = lazyImport(
  () => import("../pages/features/EstimatorGuideDetail.jsx"),
);
const AuctionGuideDetail = lazyImport(
  () => import("../pages/features/AuctionGuideDetail.jsx"),
);
const CategoryGuideDetail = lazyImport(
  () => import("../pages/listings/CategoryGuideDetail.jsx"),
);
const AuctionsActions = lazyImport(() => import("../pages/features/auctions/Actions.jsx"));
const LiveAuction = lazyImport(() => import("../pages/features/auctions/LiveAuction.jsx"));
const AuctionSchedule = lazyImport(
  () => import("../pages/features/auctions/AuctionSchedule.jsx"),
);
const TrustLegal = lazyImport(() => import("../pages/features/auctions/TrustLegal.jsx"));
const AuctionResult = lazyImport(
  () => import("../pages/features/auctions/AuctionResult.jsx"),
);
const BuyerTransactions = lazyImport(
  () => import("../pages/features/auctions/BuyerTransactions.jsx"),
);
const CarDetail = lazyImport(() => import("../pages/features/auctions/CarDetail.jsx"));
const TokenPayment = lazyImport(
  () => import("../pages/features/auctions/TokenPayment.jsx"),
);
const Watchlist = lazyImport(() => import("../pages/features/auctions/Watchlist.jsx"));
const CompareVehicles = lazyImport(
  () => import("../pages/features/auctions/CompareVehicles.jsx"),
);
const BuyerDashboardAuction = lazyImport(
  () => import("../pages/features/auctions/BuyerDashboard.jsx"),
);
const WalletDashboardAuction = lazyImport(
  () => import("../pages/features/auctions/WalletDashboard.jsx"),
);
const SellerAuctionDashboard = lazyImport(
  () => import("../pages/features/auctions/SellerAuctionDashboard.jsx"),
);
const FilteredResults = lazyImport(
  () => import("../pages/listings/FilteredResults.jsx"),
);
const NotFound = lazyImport(() => import("../pages/NotFound.jsx"));

// Auth (Lazy)
const ForgotPassword = lazyImport(() => import("../pages/auth/ForgotPassword.jsx"));
const VerifyOTP = lazyImport(() => import("../pages/auth/VerifyOTP.jsx"));
const ResetPassword = lazyImport(() => import("../pages/auth/ResetPassword.jsx"));
const ResetSuccess = lazyImport(() => import("../pages/auth/ResetSuccess.jsx"));
const AcceptInvite = lazyImport(() => import("../pages/auth/AcceptInvite.jsx"));

// Public (Lazy)
const AllBrands = lazyImport(() => import("../pages/AllBrands.jsx"));
const FilterPage = lazyImport(() => import("../pages/filter/FilterPage.jsx"));
const CategoryPage = lazyImport(() => import("../pages/categories/CategoryPage.jsx"));

// Protected User (Lazy)
const CreatePost = lazyImport(() => import("../pages/posts/CreatePost.jsx"));
const EditCar = lazyImport(() => import("../pages/posts/EditCar.jsx"));
const EditAuctionCar = lazyImport(() => import("../pages/posts/EditAuctionCar.jsx"));
const UserListingPage = lazyImport(
  () => import("../pages/userListings/UserListingPage.jsx"),
);
const ProfilePage = lazyImport(() => import("../pages/profile/ProfilePage.jsx"));
const SavedCars = lazyImport(() => import("../pages/SavedCars.jsx"));
const MyChats = lazyImport(() => import("../pages/chats/MyChats.jsx"));
const SellerChats = lazyImport(() => import("../pages/seller/SellerChats.jsx"));
const DealerDashboard = lazyImport(
  () => import("../pages/dashboards/DealerDashboard.jsx"),
);
const SellerDashboard = lazyImport(
  () => import("../pages/dashboards/SellerDashboard.jsx"),
);

// Admin (Lazy)
const AdminDashboard = lazyImport(() => import("../pages/admin/Dashboard.jsx"));
const AdminUsers = lazyImport(() => import("../pages/admin/Users.jsx"));
const AdminListings = lazyImport(() => import("../pages/admin/Listings.jsx"));
const AdminDealers = lazyImport(() => import("../pages/admin/Dealers.jsx"));
const AdminCategories = lazyImport(() => import("../pages/admin/Categories.jsx"));
const AdminValuations = lazyImport(() => import("../pages/admin/Valuations.jsx"));
const AdminChatMonitoring = lazyImport(
  () => import("../pages/admin/ChatMonitoring.jsx"),
);
const AdminPromotions = lazyImport(() => import("../pages/admin/Promotions.jsx"));
const AdminPayments = lazyImport(() => import("../pages/admin/Payments.jsx"));
const AdminNotifications = lazyImport(
  () => import("../pages/admin/Notifications.jsx"),
);
const AdminReports = lazyImport(() => import("../pages/admin/Reports.jsx"));
const ActivityLog = lazyImport(() => import("../pages/admin/ActivityLog.jsx"));
const AccountDeletionRequests = lazyImport(
  () => import("../pages/admin/AccountDeletionRequests.jsx"),
);
const Settings = lazyImport(() => import("../pages/admin/Settings.jsx"));
const SupportChat = lazyImport(() => import("../pages/admin/SupportChat.jsx"));
const CustomerRequests = lazyImport(
  () => import("../pages/admin/CustomerRequests.jsx"),
);
const Banners = lazyImport(() => import("../pages/admin/Banners.jsx"));
const Testimonials = lazyImport(() => import("../pages/admin/Testimonials.jsx"));
const AuctionManagement = lazyImport(
  () => import("../pages/admin/AuctionManagement.jsx"),
);

// Blog Admin (Lazy)
const BlogsOverview = lazyImport(() => import("../pages/admin/BlogsOverview.jsx"));
const BlogCategories = lazyImport(() => import("../pages/admin/BlogCategories.jsx"));
const BlogCreateEnhanced = lazyImport(
  () => import("../pages/admin/BlogCreateEnhanced.jsx"),
);
const BlogEdit = lazyImport(() => import("../pages/admin/BlogEdit.jsx"));
const BlogComments = lazyImport(() => import("../pages/admin/BlogComments.jsx"));
const BlogMediaLibrary = lazyImport(
  () => import("../pages/admin/BlogMediaLibrary.jsx"),
);

const AppRouter = () => {
  const location = useLocation();
  // Force route tree to remount when location changes (fixes production bug: URL updates but view stays, e.g. after leaving /filter)
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes key={location.key ?? location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />

        {/* Listings & Categories */}
        <Route path="/listings" element={<CarListings />} />
        <Route path="/listings/categories" element={<CategoryListings />} />
        <Route
          path="/listings/:categorySlug/guide/:blogId"
          element={<CategoryGuideDetail />}
        />
        <Route
          path="/listings/:categoryType"
          element={<GenericVehicleCategoryPage />}
        />
        <Route path="/cars" element={<CarListings />} />
        <Route path="/car-details/:id" element={<CarDetails />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/filter" element={<FilterPage />} />
        <Route path="/search-results" element={<FilteredResults />} />
        <Route path="/view-all-brands" element={<AllBrands />} />

        {/* Features — Public Auction Pages */}
        <Route path="/car-estimator" element={<CarEstimator />} />
        <Route
          path="/car-estimator/guide/:blogId"
          element={<EstimatorGuideDetail />}
        />
                <Route path="/auctions" element={<AuctionsActions />} />
        <Route path="/auctions/guide/:blogId" element={<AuctionGuideDetail />} />
        <Route path="/auctions/live" element={<LiveAuction />} />
        <Route path="/auctions/betting" element={<LiveAuction />} />
        <Route path="/auctions/schedule" element={<AuctionSchedule />} />
        <Route path="/auctions/trust-legal" element={<TrustLegal />} />
        <Route path="/auctions/car-detail" element={<CarDetail />} />
        <Route path="/auctions/compare" element={<CompareVehicles />} />
        <Route path="/auctions/buyer-dashboard" element={<BuyerDashboardAuction />} />
        <Route path="/auctions/wallet" element={<WalletDashboardAuction />} />
        <Route path="/auctions/seller-dashboard" element={<SellerAuctionDashboard />} />

        {/* Auth Flow */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />
        <Route path="/accept-invite/:token" element={<AcceptInvite />} />

        {/* User Dashboard & Actions */}
        <Route element={<ProtectedRoute />}>
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/edit-car/:id" element={<EditCar />} />
          <Route path="/edit-auction-car/:id" element={<EditAuctionCar />} />
          <Route path="/my-listings" element={<UserListingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/saved-cars" element={<SavedCars />} />
          <Route path="/my-chats" element={<MyChats />} />
          <Route path="/seller/chats" element={<SellerChats />} />
          <Route path="/dealer/dashboard" element={<DealerDashboard />} />
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          {/* Auction — Authenticated User Pages */}
          <Route path="/auctions/token-payment" element={<TokenPayment />} />
          <Route path="/auctions/transactions" element={<BuyerTransactions />} />
          <Route path="/auctions/result" element={<AuctionResult />} />
        </Route>
        <Route element={<AuctionCapabilityRoute />}>
          <Route path="/auctions/watchlist" element={<Watchlist />} />
        </Route>

        {/* Admin Panel */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/:userId" element={<AdminUsers />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/valuations" element={<AdminValuations />} />
          <Route path="/admin/dealers" element={<AdminDealers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/blogs" element={<BlogsOverview />} />
          <Route path="/admin/blogs/categories" element={<BlogCategories />} />
          <Route path="/admin/blog-categories" element={<BlogCategories />} />
          <Route path="/admin/blogs/create" element={<BlogCreateEnhanced />} />
          <Route path="/admin/blogs/:id/edit" element={<BlogEdit />} />
          <Route path="/admin/blogs/comments" element={<BlogComments />} />
          <Route path="/admin/blog-comments" element={<BlogComments />} />
          <Route path="/admin/blogs/media" element={<BlogMediaLibrary />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/analytics" element={<AdminReports />} />
          <Route path="/admin/activity-log" element={<ActivityLog />} />
          <Route
            path="/admin/account-deletion-requests"
            element={<AccountDeletionRequests />}
          />
          <Route
            path="/admin/chat-monitoring"
            element={<AdminChatMonitoring />}
          />
          <Route path="/admin/support-chat" element={<SupportChat />} />
          <Route
            path="/admin/customer-requests"
            element={<CustomerRequests />}
          />
          <Route path="/admin/banners" element={<Banners />} />
          <Route path="/admin/testimonials" element={<Testimonials />} />
          <Route path="/admin/auctions" element={<AuctionManagement />} />
          <Route path="/admin/settings" element={<Settings />} />

          {/* Add other admin routes as needed */}
        </Route>

        {/* CMS & Info */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/all" element={<AllBlog />} />
        <Route path="/blog/:id" element={<BlogDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<OurPrivacyPolicy />} />
        <Route path="/terms-condition" element={<TermsCondition />} />
        <Route path="/terms-conditions" element={<TermsCondition />} />

        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/help/faqs" element={<FAQs />} />
        <Route path="/help/*" element={<HelpCenter />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
