import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import RouteLoader from "../components/common/RouteLoader";
import {
  ProtectedRoute,
  AdminRoute,
  AuctionCapabilityRoute,
} from "../components/shared/RouteGuards.jsx";

// Public core routes (Lazy)
const Home = lazy(() => import("../pages/Home.jsx"));
const Login = lazy(() => import("../pages/auth/Login.jsx"));
const Signup = lazy(() => import("../pages/auth/SignUp.jsx"));
const CarListings = lazy(() => import("../pages/listings/CarListings.jsx"));
const CategoryListings = lazy(
  () => import("../pages/listings/CategoryListings.jsx"),
);
const CarDetails = lazy(() => import("../pages/listings/CarDetails.jsx"));
const GenericVehicleCategoryPage = lazy(
  () => import("../pages/listings/GenericVehicleCategoryPage.jsx"),
);
const Blog = lazy(() => import("../pages/blog/Blog.jsx"));
const AllBlog = lazy(() => import("../pages/blog/AllBlog.jsx"));
const BlogDetails = lazy(() => import("../pages/blog/BlogDetails.jsx"));
const CarEstimator = lazy(() => import("../pages/features/CarEstimator.jsx"));
const EstimatorGuideDetail = lazy(
  () => import("../pages/features/EstimatorGuideDetail.jsx"),
);
const CategoryGuideDetail = lazy(
  () => import("../pages/listings/CategoryGuideDetail.jsx"),
);
const AuctionsActions = lazy(() => import("../pages/features/auctions/Actions.jsx"));
const LiveAuction = lazy(() => import("../pages/features/auctions/LiveAuction.jsx"));
const AuctionSchedule = lazy(
  () => import("../pages/features/auctions/AuctionSchedule.jsx"),
);
const TrustLegal = lazy(() => import("../pages/features/auctions/TrustLegal.jsx"));
const AuctionResult = lazy(
  () => import("../pages/features/auctions/AuctionResult.jsx"),
);
const BuyerTransactions = lazy(
  () => import("../pages/features/auctions/BuyerTransactions.jsx"),
);
const CarDetail = lazy(() => import("../pages/features/auctions/CarDetail.jsx"));
const TokenPayment = lazy(
  () => import("../pages/features/auctions/TokenPayment.jsx"),
);
const Watchlist = lazy(() => import("../pages/features/auctions/Watchlist.jsx"));
const FilteredResults = lazy(
  () => import("../pages/listings/FilteredResults.jsx"),
);
const NotFound = lazy(() => import("../pages/NotFound.jsx"));

// Auth (Lazy)
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const VerifyOTP = lazy(() => import("../pages/auth/VerifyOTP.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));
const ResetSuccess = lazy(() => import("../pages/auth/ResetSuccess.jsx"));
const AcceptInvite = lazy(() => import("../pages/auth/AcceptInvite.jsx"));

// Public (Lazy)
const OurPrivacyPolicy = lazy(
  () => import("../pages/ourPages/OurPrivacyPolicy.jsx"),
);
const TermsCondition = lazy(
  () => import("../pages/ourPages/TermsCondition.jsx"),
);
const About = lazy(() => import("../pages/about/About.jsx"));
const Contact = lazy(() => import("../pages/contact/Contact.jsx"));
const AllBrands = lazy(() => import("../pages/AllBrands.jsx"));
const FilterPage = lazy(() => import("../pages/filter/FilterPage.jsx"));
const CategoryPage = lazy(() => import("../pages/categories/CategoryPage.jsx"));

// Protected User (Lazy)
const CreatePost = lazy(() => import("../pages/posts/CreatePost.jsx"));
const EditCar = lazy(() => import("../pages/posts/EditCar.jsx"));
const UserListingPage = lazy(
  () => import("../pages/userListings/UserListingPage.jsx"),
);
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage.jsx"));
const SavedCars = lazy(() => import("../pages/SavedCars.jsx"));
const MyChats = lazy(() => import("../pages/chats/MyChats.jsx"));
const SellerChats = lazy(() => import("../pages/seller/SellerChats.jsx"));
const DealerDashboard = lazy(
  () => import("../pages/dashboards/DealerDashboard.jsx"),
);
const SellerDashboard = lazy(
  () => import("../pages/dashboards/SellerDashboard.jsx"),
);

// Admin (Lazy)
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard.jsx"));
const AdminUsers = lazy(() => import("../pages/admin/Users.jsx"));
const AdminListings = lazy(() => import("../pages/admin/Listings.jsx"));
const AdminDealers = lazy(() => import("../pages/admin/Dealers.jsx"));
const AdminCategories = lazy(() => import("../pages/admin/Categories.jsx"));
const AdminValuations = lazy(() => import("../pages/admin/Valuations.jsx"));
const AdminChatMonitoring = lazy(
  () => import("../pages/admin/ChatMonitoring.jsx"),
);
const AdminPromotions = lazy(() => import("../pages/admin/Promotions.jsx"));
const AdminPayments = lazy(() => import("../pages/admin/Payments.jsx"));
const AdminNotifications = lazy(
  () => import("../pages/admin/Notifications.jsx"),
);
const AdminReports = lazy(() => import("../pages/admin/Reports.jsx"));
const ActivityLog = lazy(() => import("../pages/admin/ActivityLog.jsx"));
const AccountDeletionRequests = lazy(
  () => import("../pages/admin/AccountDeletionRequests.jsx"),
);
const Settings = lazy(() => import("../pages/admin/Settings.jsx"));
const SupportChat = lazy(() => import("../pages/admin/SupportChat.jsx"));
const CustomerRequests = lazy(
  () => import("../pages/admin/CustomerRequests.jsx"),
);
const Banners = lazy(() => import("../pages/admin/Banners.jsx"));
const Testimonials = lazy(() => import("../pages/admin/Testimonials.jsx"));
const AuctionManagement = lazy(
  () => import("../pages/admin/AuctionManagement.jsx"),
);

// Blog Admin (Lazy)
const BlogsOverview = lazy(() => import("../pages/admin/BlogsOverview.jsx"));
const BlogCategories = lazy(() => import("../pages/admin/BlogCategories.jsx"));
const BlogCreateEnhanced = lazy(
  () => import("../pages/admin/BlogCreateEnhanced.jsx"),
);
const BlogEdit = lazy(() => import("../pages/admin/BlogEdit.jsx"));
const BlogComments = lazy(() => import("../pages/admin/BlogComments.jsx"));
const BlogMediaLibrary = lazy(
  () => import("../pages/admin/BlogMediaLibrary.jsx"),
);

// Help (Lazy)
const HelpCenter = lazy(() => import("../pages/help/HelpCenter.jsx"));
const FAQs = lazy(() => import("../pages/help/FAQs.jsx"));

const AppRouter = () => {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
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
        <Route path="/auctions/live" element={<LiveAuction />} />
        <Route path="/auctions/schedule" element={<AuctionSchedule />} />
        <Route path="/auctions/trust-legal" element={<TrustLegal />} />
        <Route path="/auctions/car-detail" element={<CarDetail />} />

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
        <Route path="/terms-conditon" element={<TermsCondition />} />

        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/help/faqs" element={<FAQs />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
