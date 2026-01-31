import React, { lazy, Suspense } from "react";
import { Route, Routes, Navigate, useSearchParams, useNavigate } from "react-router-dom";
import RouteLoader from "../components/common/RouteLoader";
import { ProtectedRoute, AdminRoute } from "../components/shared/RouteGuards.jsx";
import { useSupportChat } from "../contexts/SupportChatContext.jsx";
import { useEffect } from "react";

// Critical pages
import Home from "../pages/Home.jsx";
import Login from "../pages/auth/Login.jsx";
import Signup from "../pages/auth/SignUp.jsx";
import CarListings from "../pages/listings/CarListings.jsx";
import CategoryListings from "../pages/listings/CategoryListings.jsx";
import CarDetails from "../pages/listings/CarDetails.jsx";
import GenericVehicleCategoryPage from "../pages/listings/GenericVehicleCategoryPage.jsx";
import Blog from "../pages/blog/Blog.jsx";
import AllBlog from "../pages/blog/AllBlog.jsx";
import BlogDetails from "../pages/blog/BlogDetails.jsx";
import CarEstimator from "../pages/features/CarEstimator.jsx";
import FilteredResults from "../pages/listings/FilteredResults.jsx";
import NotFound from "../pages/NotFound.jsx";

// Auth (Lazy)
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword.jsx"));
const VerifyOTP = lazy(() => import("../pages/auth/VerifyOTP.jsx"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword.jsx"));
const ResetSuccess = lazy(() => import("../pages/auth/ResetSuccess.jsx"));
const AcceptInvite = lazy(() => import("../pages/auth/AcceptInvite.jsx"));

// Public (Lazy)
const OurPrivacyPolicy = lazy(() => import("../pages/ourPages/OurPrivacyPolicy.jsx"));
const TermsCondition = lazy(() => import("../pages/ourPages/TermsCondition.jsx"));
const About = lazy(() => import("../pages/about/About.jsx"));
const Contact = lazy(() => import("../pages/contact/Contact.jsx"));
const AllBrands = lazy(() => import("../pages/AllBrands.jsx"));
const FilterPage = lazy(() => import("../pages/filter/FilterPage.jsx"));
const CategoryPage = lazy(() => import("../pages/categories/CategoryPage.jsx"));

// Protected User (Lazy)
const CreatePost = lazy(() => import("../pages/posts/CreatePost.jsx"));
const EditCar = lazy(() => import("../pages/posts/EditCar.jsx"));
const UserListingPage = lazy(() => import("../pages/userListings/UserListingPage.jsx"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage.jsx"));
const SavedCars = lazy(() => import("../pages/SavedCars.jsx"));
const MyChats = lazy(() => import("../pages/chats/MyChats.jsx"));
const SellerChats = lazy(() => import("../pages/seller/SellerChats.jsx"));
const DealerDashboard = lazy(() => import("../pages/dashboards/DealerDashboard.jsx"));
const SellerDashboard = lazy(() => import("../pages/dashboards/SellerDashboard.jsx"));

// Admin (Lazy)
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard.jsx"));
const AdminUsers = lazy(() => import("../pages/admin/Users.jsx"));
const AdminListings = lazy(() => import("../pages/admin/Listings.jsx"));
const AdminDealers = lazy(() => import("../pages/admin/Dealers.jsx"));
const AdminCategories = lazy(() => import("../pages/admin/Categories.jsx"));
const AdminValuations = lazy(() => import("../pages/admin/Valuations.jsx"));
const AdminChatMonitoring = lazy(() => import("../pages/admin/ChatMonitoring.jsx"));
const AdminChatbot = lazy(() => import("../pages/admin/Chatbot.jsx"));
const AdminPromotions = lazy(() => import("../pages/admin/Promotions.jsx"));
const AdminPayments = lazy(() => import("../pages/admin/Payments.jsx"));
const AdminNotifications = lazy(() => import("../pages/admin/Notifications.jsx"));
const AdminReports = lazy(() => import("../pages/admin/Reports.jsx"));
const ActivityLog = lazy(() => import("../pages/admin/ActivityLog.jsx"));
const AccountDeletionRequests = lazy(() => import("../pages/admin/AccountDeletionRequests.jsx"));
const Settings = lazy(() => import("../pages/admin/Settings.jsx"));
const SupportChat = lazy(() => import("../pages/admin/SupportChat.jsx"));
const SupportChatbot = lazy(() => import("../pages/admin/SupportChatbot.jsx"));
const CustomerRequests = lazy(() => import("../pages/admin/CustomerRequests.jsx"));
const Banners = lazy(() => import("../pages/admin/Banners.jsx"));
const Testimonials = lazy(() => import("../pages/admin/Testimonials.jsx"));

// Blog Admin (Lazy)
const BlogsOverview = lazy(() => import("../pages/admin/BlogsOverview.jsx"));
const BlogCategories = lazy(() => import("../pages/admin/BlogCategories.jsx"));
const BlogCreateEnhanced = lazy(() => import("../pages/admin/BlogCreateEnhanced.jsx"));
const BlogEdit = lazy(() => import("../pages/admin/BlogEdit.jsx"));
const BlogComments = lazy(() => import("../pages/admin/BlogComments.jsx"));
const BlogMediaLibrary = lazy(() => import("../pages/admin/BlogMediaLibrary.jsx"));

// Help (Lazy) - Simplified for brevity in example, but keep all in real implementation
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
        <Route path="/listings/:categoryType" element={<GenericVehicleCategoryPage />} />
        <Route path="/car-details/:id" element={<CarDetails />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/filter" element={<FilterPage />} />
        
        {/* Features */}
        <Route path="/car-estimator" element={<CarEstimator />} />
        
        {/* Auth Flow */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-success" element={<ResetSuccess />} />
        
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
        </Route>

        {/* Admin Panel */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/valuations" element={<AdminValuations />} />
          <Route path="/admin/dealers" element={<AdminDealers />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/blogs" element={<BlogsOverview />} />
          <Route path="/admin/blogs/categories" element={<BlogCategories />} />
          <Route path="/admin/blogs/create" element={<BlogCreateEnhanced />} />
          <Route path="/admin/blogs/:id/edit" element={<BlogEdit />} />
          <Route path="/admin/blogs/comments" element={<BlogComments />} />
          <Route path="/admin/blogs/media" element={<BlogMediaLibrary />} />
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/analytics" element={<AdminReports />} />
          <Route path="/admin/activity-log" element={<ActivityLog />} />
          <Route path="/admin/account-deletion-requests" element={<AccountDeletionRequests />} />
          <Route path="/admin/chat" element={<AdminChatMonitoring />} />
          <Route path="/admin/chatbot" element={<SupportChatbot />} />
          <Route path="/admin/support-chat" element={<SupportChat />} />
          <Route path="/admin/customer-requests" element={<CustomerRequests />} />
          <Route path="/admin/banners" element={<Banners />} />
          <Route path="/admin/testimonials" element={<Testimonials />} />
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
