import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { buildCarUrl } from "../../utils/urlBuilders";
import {
  FiHome,
  FiPlus,
  FiEye,
  FiMessageSquare,
  FiUser,
  FiLogOut,
  FiBell,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiBarChart2,
  FiActivity,
  FiHeart,
  FiCalendar,
  FiSettings,
  FiChevronRight,
  FiAlertCircle,
  FiZap,
  FiXCircle,
  FiEdit,
} from "react-icons/fi";
import {
  useGetMeQuery,
  useGetMyCarsQuery,
  useLogoutMutation,
  useGetSubscriptionPlansQuery,
} from "../../redux/services/api";
import { useGetSellerBuyerChatsQuery } from "../../redux/services/api";
import { Spinner } from "../../components/ui/Loading";
import toast from "react-hot-toast";
import { Image as LazyImage } from "../../components/ui/Image";
import { images } from "../../assets/assets";
import AccountDeletionRequest from "../../components/features/profile/AccountDeletionRequest";

const DealerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSection, setActiveSection] = useState("");
  const [showAddCar, setShowAddCar] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newCar, setNewCar] = useState({
    make: "",
    model: "",
    year: "",
    mileage: "",
    condition: "",
    engine_type: "",
    transmission: "",
    color: "",
    registration_city: "",
    starting_bid: "",
    reserve_price: "",
    buy_now_price: "",
    images: [],
    inspection_report: {},
  });
  const [auctionStats, setAuctionStats] = useState({
    totalAuctions: 0,
    activeAuctions: 0,
    soldAuctions: 0,
    totalAuctionSales: 0,
    tokenBalance: 0,
  });
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useGetMeQuery(undefined, {
    pollingInterval: 30000, // Refetch every 30 seconds to check verification status
  });
  const {
    data: carsData,
    isLoading: carsLoading,
    refetch: refetchCars,
  } = useGetMyCarsQuery();
  const { data: chatsData } = useGetSellerBuyerChatsQuery(undefined, {
    pollingInterval: 5000,
  });
  const { data: subscriptionPlansData } = useGetSubscriptionPlansQuery();
  const [logout] = useLogoutMutation();

  // Check if subscription tab should be shown
  // If showSubscriptionTab is explicitly false, hide it
  // Otherwise, show it (default behavior when undefined or true)
  const showSubscriptionTab =
    subscriptionPlansData?.showSubscriptionTab !== false;

  // Redirect if user is on payments tab but it's disabled
  useEffect(() => {
    if (!showSubscriptionTab && activeTab === "payments") {
      setActiveTab("dashboard");
    }
  }, [showSubscriptionTab, activeTab]);

  const cars = carsData?.cars || [];
  const chats = chatsData || [];

  // Calculate statistics - handle undefined/null safely
  const activeListingsCount = Array.isArray(cars)
    ? cars.filter(
        (c) => c && !c.isSold && (c.isActive || c.status === "active"),
      ).length
    : 0;
  const isSubscriptionActive =
    user?.subscription?.isActive &&
    user?.subscription?.endDate &&
    new Date(user.subscription.endDate) > new Date();

  // Subscription limits based on plan
  const getListingLimit = () => {
    if (user?.subscription?.plan === "free") return 5;
    if (["basic", "premium", "dealer"].includes(user?.subscription?.plan))
      return -1; // unlimited
    return 5; // default free plan
  };

  const listingLimit = isSubscriptionActive ? getListingLimit() : 5;
  const canPostMore = listingLimit === -1 || activeListingsCount < listingLimit;
  const listingsRemaining =
    listingLimit === -1
      ? "Unlimited"
      : Math.max(0, listingLimit - activeListingsCount);

  // Mock auction stats - in real app, this would come from API
  useEffect(() => {
    setAuctionStats({
      totalAuctions: 25,
      activeAuctions: 7,
      soldAuctions: 18,
      totalAuctionSales: 12500000,
      tokenBalance: 25000,
    });
  }, []);

  const stats = {
    totalAds: cars.length,
    activeListings: activeListingsCount,
    pendingApproval: cars.filter((c) => !c.isActive && !c.isSold).length,
    totalInquiries: chats.length,
    profileCompletion: user?.dealerInfo?.verified ? 100 : 70,
    subscriptionPlan: user?.subscription?.plan || "free",
    subscriptionActive: isSubscriptionActive,
    listingLimit,
    listingsRemaining,
    canPostMore,
    subscriptionEndDate: user?.subscription?.endDate,
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // clearTokens is called by transformResponse, but ensure cleanup
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      // Clear tokens even if logout request fails
      const { clearTokens } = await import("../../utils/tokenRefresh");
      clearTokens();
      localStorage.removeItem("user");
      toast.error("Logout failed");
      navigate("/login");
    }
  };

  // Don't show full-page loader - let page render normally
  if (userLoading) {
    return null;
  }

  // Check if user is a verified dealer
  // DealerDashboard is ONLY for VERIFIED dealers
  const isDealer = user?.role === "dealer";
  const isVerified = user?.dealerInfo?.verified === true;

  // Redirect unverified dealers to seller dashboard
  useEffect(() => {
    if (!userLoading && user) {
      if (isDealer && !isVerified) {
        navigate("/seller/dashboard", { replace: true });
      } else if (!isDealer) {
        // Not a dealer - redirect based on role
        if (user.role === "admin") {
          navigate("/admin/dashboard", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    }
  }, [user, userLoading, isDealer, isVerified, navigate]);

  if (!user || !isDealer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            {!isDealer
              ? "You need to be a verified dealer to access this dashboard."
              : "Your dealer account is pending verification. Please wait for admin approval."}
          </p>
          <div className="flex gap-3 justify-center">
            {!isDealer ? (
              <button
                onClick={() => navigate("/profile")}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90"
              >
                Go to Profile
              </button>
            ) : (
              <button
                onClick={() => navigate("/seller/dashboard")}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90"
              >
                Go to Seller Dashboard
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Only verified dealers can access - if not verified, redirect (handled in useEffect)
  if (!isVerified) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary-500">SELLO</h2>
          <p className="text-xs text-gray-500 mt-1">Dealer Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "dashboard"
                ? "bg-primary-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiHome size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("auctions")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "auctions"
                ? "bg-primary-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiActivity size={20} />
            <span>Auctions</span>
            {auctionStats.activeAuctions > 0 && (
              <span className="ml-auto bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {auctionStats.activeAuctions}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("post-ad")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "post-ad"
                ? "bg-primary-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiPlus size={20} />
            <span>Post New Ad</span>
          </button>

          <button
            onClick={() => setActiveTab("listings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "listings"
                ? "bg-primary-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiEye size={20} />
            <span>My Listings</span>
            {stats.totalAds > 0 && (
              <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.totalAds}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "messages"
                ? "bg-primary-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiMessageSquare size={20} />
            <span>Messages</span>
            {chats.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {chats.length}
              </span>
            )}
          </button>

          {showSubscriptionTab && (
            <button
              onClick={() => setActiveTab("payments")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "payments"
                  ? "bg-primary-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FiCreditCard size={20} />
              <span>Payments</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "analytics"
                ? "bg-primary-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiBarChart2 size={20} />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => navigate("/auctions/watchlist")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
          >
            <FiHeart size={20} />
            <span>Watchlist</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
          >
            <FiUser size={20} />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "settings"
                ? "bg-primary-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FiSettings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white capitalize">
                {activeTab.replace("-", " ")}
              </h2>
              <p className="text-slate-400">
                Manage your vehicle listings and auctions
              </p>
            </div>
            <button
              onClick={() => setShowAddCar(true)}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg"
            >
              <FiPlus size={20} />
              Submit New Vehicle
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Total Ads Posted
                    </span>
                    <FiTrendingUp className="text-primary-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalAds}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Active Listings
                    </span>
                    <FiCheckCircle className="text-green-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.activeListings}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Pending Approval
                    </span>
                    <FiClock className="text-yellow-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.pendingApproval}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Total Inquiries
                    </span>
                    <FiMessageSquare className="text-primary-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalInquiries}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Profile Completion
                    </span>
                    <FiUser className="text-purple-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.profileCompletion}%
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${stats.profileCompletion}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Subscription Status Card - Only show if subscription tab is enabled */}
              {showSubscriptionTab && (
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-sm border border-gray-200 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Subscription Status
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        stats.subscriptionActive
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {stats.subscriptionActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-primary-100">Current Plan</p>
                      <p className="font-semibold text-lg capitalize">
                        {stats.subscriptionPlan} Plan
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-100">
                        Active Listings
                      </p>
                      <p className="font-semibold text-lg">
                        {stats.activeListings} /{" "}
                        {stats.listingLimit === -1 ? "∞" : stats.listingLimit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-primary-100">Remaining</p>
                      <p className="font-semibold text-lg">
                        {stats.listingsRemaining}
                      </p>
                    </div>
                  </div>
                  {stats.subscriptionEndDate &&
                    stats.subscriptionActive &&
                    !isNaN(new Date(stats.subscriptionEndDate).getTime()) && (
                      <p className="text-sm text-primary-100 mb-4">
                        Expires on:{" "}
                        {new Date(
                          stats.subscriptionEndDate,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  {(!stats.subscriptionActive || !stats.canPostMore) && (
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full md:w-auto px-6 py-2 bg-white text-primary-500 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
                    >
                      {!stats.subscriptionActive
                        ? "Upgrade Subscription"
                        : "Manage Subscription"}
                    </button>
                  )}
                </div>
              )}

              {/* Quick Stats Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Business Overview
                  </h3>
                  <button
                    onClick={() => navigate("/profile")}
                    className="text-sm text-primary-500 hover:text-primary-500 font-medium"
                  >
                    Manage Profile →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border-l-4 border-primary-500 pl-4">
                    <p className="text-sm text-gray-600">Business Name</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {user.dealerInfo?.businessName || "Not set"}
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="text-sm text-gray-600">Verification Status</p>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold mt-1 ${
                        user.dealerInfo?.verified
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {user.dealerInfo?.verified ? (
                        <>
                          <FiCheckCircle size={14} />
                          Verified
                        </>
                      ) : (
                        <>
                          <FiClock size={14} />
                          Pending
                        </>
                      )}
                    </span>
                  </div>
                  <div className="border-l-4 border-primary-500 pl-4">
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">
                      {user.dealerInfo?.city || "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Listings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Listings
                  </h3>
                  <button
                    onClick={() => navigate("/create-post")}
                    className="text-primary-500 hover:text-primary-500 font-medium"
                  >
                    View All
                  </button>
                </div>
                {carsLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner fullScreen={false} />
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No listings yet. Start by posting your first ad!</p>
                    <button
                      onClick={() => navigate("/create-post")}
                      className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90"
                    >
                      Post New Ad
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cars.slice(0, 6).map((car) => (
                      <div
                        key={car._id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate(buildCarUrl(car))}
                      >
                        <div className="h-48 relative">
                          <LazyImage
                            src={car.images?.[0] || images.carPlaceholder}
                            alt={car.title}
                            className="w-full h-full object-cover"
                          />
                          {car.isSold && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                              SOLD
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {car.make} {car.model} {car.year}
                          </h4>
                          <p className="text-primary-500 font-bold mt-1">
                            PKR {car.price?.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                car.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {car.isActive ? "Active" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "auctions" && (
            <div className="space-y-6">
              {/* Enhanced Auction Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <FiActivity className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {auctionStats.totalAuctions}
                    </span>
                  </div>
                  <p className="text-sm text-orange-700 font-medium">
                    Total Auctions
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    All time listings
                  </p>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <FiTrendingUp className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold text-emerald-600">
                      {auctionStats.activeAuctions}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-700 font-medium">
                    Active Auctions
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Currently live
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <FiCheckCircle className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold text-purple-600">
                      {auctionStats.soldAuctions}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 font-medium">
                    Sold at Auction
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Successfully completed
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FiDollarSign className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      PKR {auctionStats.tokenBalance.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-blue-700 font-medium">
                    Token Balance
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Available for bidding
                  </p>
                </div>
              </div>

              {/* Enhanced Auction Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FiActivity className="text-orange-600" size={20} />
                  </div>
                  Auction Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/auctions/token-payment"
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all bg-gradient-to-br from-emerald-50 to-emerald-100"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiDollarSign className="text-white" size={32} />
                      </div>
                      <h4 className="font-bold text-emerald-800 text-lg mb-2">
                        Add Tokens
                      </h4>
                      <p className="text-sm text-emerald-600">
                        Purchase bidding tokens for auctions
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-emerald-600 group-hover:gap-2 transition-all">
                        <span className="text-sm font-medium">Top Up Now</span>
                        <FiChevronRight size={16} />
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/auctions/live"
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:shadow-lg transition-all bg-gradient-to-br from-orange-50 to-orange-100"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiActivity className="text-white" size={32} />
                      </div>
                      <h4 className="font-bold text-orange-800 text-lg mb-2">
                        Live Auctions
                      </h4>
                      <p className="text-sm text-orange-600">
                        View and participate in active auctions
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-orange-600 group-hover:gap-2 transition-all">
                        <span className="text-sm font-medium">
                          Enter Auction
                        </span>
                        <FiChevronRight size={16} />
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/auctions/schedule"
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-blue-100"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiCalendar className="text-white" size={32} />
                      </div>
                      <h4 className="font-bold text-blue-800 text-lg mb-2">
                        Auction Schedule
                      </h4>
                      <p className="text-sm text-blue-600">
                        Check upcoming auction events
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-blue-600 group-hover:gap-2 transition-all">
                        <span className="text-sm font-medium">
                          View Schedule
                        </span>
                        <FiChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Active Bids Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Active Bids
                  </h3>
                  <Link
                    to="/auctions/live"
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1590362891991-f776e747a588?w=200"
                          alt="Car"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Toyota Corolla 2022
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your bid: PKR 3.85M
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                        Highest Bid
                      </span>
                      <p className="text-xs text-gray-500 mt-1">2h 15m left</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1590362891992-f776e747a588?w=200"
                          alt="Car"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Honda Civic 2021
                        </h4>
                        <p className="text-sm text-gray-600">
                          Your bid: PKR 2.70M
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-yellow-600 font-medium bg-yellow-100 px-2 py-1 rounded">
                        Outbid
                      </span>
                      <p className="text-xs text-gray-500 mt-1">1h 30m left</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Auctions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upcoming Auctions
                  </h3>
                  <Link
                    to="/auctions/schedule"
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    View Schedule
                  </Link>
                </div>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        Auction #102
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        18 Cars
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Starts in: <span className="font-medium">2d 12h 45m</span>
                    </div>
                  </div>

                  <div className="p-3 border border-gray-200 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        Auction #103
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        22 Cars
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Starts in: <span className="font-medium">4d 8h 30m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auction Management */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FiSettings className="text-orange-500" size={20} />
                    Auction Management
                  </h3>
                  <button className="text-orange-500 hover:text-orange-600 font-medium text-sm">
                    Manage All
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Active Listings
                      </span>
                      <FiEdit className="text-gray-400" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">7</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Toyota Corolla</span>
                        <button className="text-orange-500 hover:text-orange-600">
                          Edit
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Honda Civic</span>
                        <button className="text-orange-500 hover:text-orange-600">
                          Edit
                        </button>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Suzuki Swift</span>
                        <button className="text-orange-500 hover:text-orange-600">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Bid Management
                      </span>
                      <FiDollarSign className="text-gray-400" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">28</p>
                    <p className="text-sm text-gray-600 mb-3">
                      Total bids today
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Highest bid</span>
                        <span className="font-medium text-green-600">
                          PKR 4.2M
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Reserve met</span>
                        <span className="font-medium text-green-600">Yes</span>
                      </div>
                      <button className="w-full text-center text-orange-500 hover:text-orange-600 text-sm font-medium">
                        View All Bids
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Auction Settings
                      </span>
                      <FiSettings className="text-gray-400" size={16} />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Auto-extend
                        </span>
                        <button className="w-12 h-6 bg-orange-500 rounded-full relative">
                          <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Reserve price
                        </span>
                        <button className="w-12 h-6 bg-orange-500 rounded-full relative">
                          <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Buy now</span>
                        <button className="w-12 h-6 bg-gray-300 rounded-full relative">
                          <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Quick Actions
                      </span>
                      <FiZap className="text-gray-400" size={16} />
                    </div>
                    <div className="space-y-2">
                      <button className="w-full px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium">
                        End Auction Early
                      </button>
                      <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        Extend Auction
                      </button>
                      <button className="w-full px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        Pause Bidding
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auction Notifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Auction Notifications
                  </h3>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    2 New
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FiBell className="text-amber-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Outbid Alert
                      </p>
                      <p className="text-xs text-gray-600">
                        You have been outbid on Toyota Corolla 2022
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FiCalendar className="text-blue-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Auction Starting
                      </p>
                      <p className="text-xs text-gray-600">
                        Auction #102 starts in 1 hour
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <FiCheckCircle className="text-emerald-600" size={16} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Verification Complete
                      </p>
                      <p className="text-xs text-gray-600">
                        Your CNIC has been verified successfully
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "post-ad" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Post a New Listing
              </h3>
              {!stats.canPostMore &&
                !stats.subscriptionActive &&
                showSubscriptionTab && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <FiClock className="text-yellow-600 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-semibold text-yellow-900 mb-1">
                          Listing Limit Reached
                        </h4>
                        <p className="text-sm text-yellow-700 mb-3">
                          You've used all {stats.listingLimit} listings on your
                          free plan. Upgrade to post more listings.
                        </p>
                        <button
                          onClick={() => navigate("/profile")}
                          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 text-sm font-medium"
                        >
                          Upgrade Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              <button
                onClick={() => {
                  if (
                    !stats.canPostMore &&
                    !stats.subscriptionActive &&
                    showSubscriptionTab
                  ) {
                    toast.error(
                      `You've reached your listing limit. Please upgrade your subscription.`,
                    );
                    navigate("/profile");
                    return;
                  }
                  navigate("/create-post");
                }}
                disabled={
                  !stats.canPostMore &&
                  !stats.subscriptionActive &&
                  showSubscriptionTab
                }
                className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex flex-col items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus size={48} className="text-gray-400" />
                <span className="text-lg font-medium text-gray-700">
                  {!stats.canPostMore &&
                  !stats.subscriptionActive &&
                  showSubscriptionTab
                    ? "Upgrade to Post More Listings"
                    : "Click to Create New Listing"}
                </span>
              </button>
              {stats.canPostMore && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  {stats.listingsRemaining === "Unlimited"
                    ? "Unlimited listings available"
                    : `${stats.listingsRemaining} listing${
                        stats.listingsRemaining !== 1 ? "s" : ""
                      } remaining`}
                </p>
              )}
            </div>
          )}

          {activeTab === "listings" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  My Listings
                </h3>
                <button
                  onClick={() => navigate("/create-post")}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 flex items-center gap-2"
                >
                  <FiPlus size={18} />
                  New Listing
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cars.map((car) => (
                  <div
                    key={car._id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-48 relative">
                      <LazyImage
                        src={car.images?.[0] || images.carPlaceholder}
                        alt={car.title}
                        className="w-full h-full object-cover"
                      />
                      {car.isSold && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">
                          SOLD
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900">
                        {car.make} {car.model} {car.year}
                      </h4>
                      <p className="text-primary-500 font-bold mt-1">
                        PKR {car.price?.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => navigate(`/edit-car/${car._id}`)}
                          className="flex-1 px-3 py-2 bg-primary-500 text-white rounded text-sm hover:opacity-90"
                        >
                          <FiEdit className="inline mr-1" size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(buildCarUrl(car))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                        >
                          <FiEye className="inline mr-1" size={14} />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "messages" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Messages
              </h3>
              <button
                onClick={() => navigate("/seller/chats")}
                className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex flex-col items-center justify-center gap-3"
              >
                <FiMessageSquare size={48} className="text-gray-400" />
                <span className="text-lg font-medium text-gray-700">
                  View All Messages
                </span>
              </button>
            </div>
          )}

          {activeTab === "payments" && showSubscriptionTab && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Payments
              </h3>
              <p className="text-gray-600">
                Payment history and subscription management coming soon.
              </p>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Analytics
              </h3>
              <p className="text-gray-600">Analytics dashboard coming soon.</p>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Account Management
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Manage your account settings and preferences.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={() => navigate("/profile")}
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium text-left"
                    >
                      Edit Profile Information
                    </button>
                    <button
                      onClick={() => setActiveSection("account-deletion")}
                      className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium text-left"
                    >
                      Request Account Deletion
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">
                    Business Settings
                  </h4>
                  <p className="text-gray-600">
                    Business settings and preferences coming soon.
                  </p>
                </div>
              </div>

              {/* Account Deletion Section */}
              {activeSection === "account-deletion" && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <AccountDeletionRequest user={user} />
                </div>
              )}
            </div>
          )}
        </main>

        {/* Comprehensive Auction Posting Dialog */}
        {showAddCar && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Submit Vehicle for Auction
                </h3>
                <button
                  onClick={() => {
                    setShowAddCar(false);
                    setCurrentStep(1);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiXCircle size={24} />
                </button>
              </div>

              {/* Steps Indicator */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  {[
                    { num: 1, title: "Basic Info" },
                    { num: 2, title: "Photos" },
                    { num: 3, title: "Inspection" },
                    { num: 4, title: "Pricing" },
                  ].map((step, index) => (
                    <React.Fragment key={step.num}>
                      <div
                        className={`flex items-center gap-2 cursor-pointer ${currentStep >= step.num ? "text-orange-500" : "text-gray-400"}`}
                        onClick={() => setCurrentStep(step.num)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            currentStep >= step.num
                              ? "bg-orange-500 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {step.num}
                        </div>
                        <span className="hidden sm:inline text-sm font-medium">
                          {step.title}
                        </span>
                      </div>
                      {index < 3 && (
                        <div
                          className={`flex-1 h-0.5 mx-2 ${currentStep > step.num ? "bg-orange-500" : "bg-gray-200"}`}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Make *
                      </label>
                      <input
                        type="text"
                        value={newCar.make}
                        onChange={(e) =>
                          setNewCar({ ...newCar, make: e.target.value })
                        }
                        placeholder="e.g. Toyota"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model *
                      </label>
                      <input
                        type="text"
                        value={newCar.model}
                        onChange={(e) =>
                          setNewCar({ ...newCar, model: e.target.value })
                        }
                        placeholder="e.g. Corolla"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year *
                      </label>
                      <input
                        type="number"
                        value={newCar.year}
                        onChange={(e) =>
                          setNewCar({ ...newCar, year: e.target.value })
                        }
                        placeholder="e.g. 2022"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mileage (km) *
                      </label>
                      <input
                        type="number"
                        value={newCar.mileage}
                        onChange={(e) =>
                          setNewCar({ ...newCar, mileage: e.target.value })
                        }
                        placeholder="e.g. 35000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition *
                      </label>
                      <select
                        value={newCar.condition}
                        onChange={(e) =>
                          setNewCar({ ...newCar, condition: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select condition</option>
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="needs_repair">Needs Repair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Engine Type
                      </label>
                      <select
                        value={newCar.engine_type}
                        onChange={(e) =>
                          setNewCar({ ...newCar, engine_type: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select engine</option>
                        <option value="petrol">Petrol</option>
                        <option value="diesel">Diesel</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="cng">CNG</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transmission
                      </label>
                      <select
                        value={newCar.transmission}
                        onChange={(e) =>
                          setNewCar({ ...newCar, transmission: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Select transmission</option>
                        <option value="automatic">Automatic</option>
                        <option value="manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="text"
                        value={newCar.color}
                        onChange={(e) =>
                          setNewCar({ ...newCar, color: e.target.value })
                        }
                        placeholder="e.g. White"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration City
                      </label>
                      <input
                        type="text"
                        value={newCar.registration_city}
                        onChange={(e) =>
                          setNewCar({
                            ...newCar,
                            registration_city: e.target.value,
                          })
                        }
                        placeholder="e.g. Lahore"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Photos */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Vehicle Photos
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload at least 3 photos. Include exterior (front, back,
                        sides), interior, and engine bay.
                      </p>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <FiPlus
                          className="mx-auto text-gray-400 mb-2"
                          size={32}
                        />
                        <p className="text-gray-500">Click to upload images</p>
                        <p className="text-sm text-gray-400 mt-1">
                          PNG, JPG up to 10MB each
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Inspection */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Self-Inspection Report
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Rate each component honestly. Our team will verify
                        during physical inspection.
                      </p>
                      <div className="space-y-4">
                        {[
                          "Engine",
                          "Transmission",
                          "Brakes",
                          "Suspension",
                          "Electrical",
                          "Interior",
                          "Exterior",
                        ].map((component) => (
                          <div key={component}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {component}
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                              <option value="">Select rating</option>
                              <option value="excellent">Excellent</option>
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                              <option value="poor">Poor</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Pricing */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Starting Bid (PKR) *
                      </label>
                      <input
                        type="number"
                        value={newCar.starting_bid}
                        onChange={(e) =>
                          setNewCar({ ...newCar, starting_bid: e.target.value })
                        }
                        placeholder="e.g. 3000000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum starting price for bidding
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reserve Price (PKR)
                      </label>
                      <input
                        type="number"
                        value={newCar.reserve_price}
                        onChange={(e) =>
                          setNewCar({
                            ...newCar,
                            reserve_price: e.target.value,
                          })
                        }
                        placeholder="Minimum price you'll accept"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Car won't sell below this price (optional)
                      </p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiZap className="text-emerald-600" size={20} />
                        <label className="text-emerald-800 font-medium">
                          Buy It Now Price (PKR)
                        </label>
                      </div>
                      <input
                        type="number"
                        value={newCar.buy_now_price}
                        onChange={(e) =>
                          setNewCar({
                            ...newCar,
                            buy_now_price: e.target.value,
                          })
                        }
                        placeholder="Instant purchase price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <p className="text-xs text-emerald-700 mt-2">
                        Allow buyers to skip bidding and purchase immediately at
                        this price (optional)
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Listing Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Vehicle:</span>
                          <p className="font-medium">
                            {newCar.year} {newCar.make} {newCar.model}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Condition:</span>
                          <p className="font-medium capitalize">
                            {newCar.condition || "Not set"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Photos:</span>
                          <p className="font-medium">
                            {newCar.images.length} uploaded
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Starting Bid:</span>
                          <p className="font-medium">
                            PKR{" "}
                            {parseInt(
                              newCar.starting_bid || 0,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
                <button
                  onClick={() =>
                    currentStep > 1
                      ? setCurrentStep(currentStep - 1)
                      : setShowAddCar(false)
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {currentStep > 1 ? "Back" : "Cancel"}
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={
                      currentStep === 1 &&
                      (!newCar.make ||
                        !newCar.model ||
                        !newCar.year ||
                        !newCar.mileage ||
                        !newCar.condition)
                    }
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <FiChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      toast.success("Vehicle submitted for approval!");
                      setShowAddCar(false);
                      setCurrentStep(1);
                      setNewCar({
                        make: "",
                        model: "",
                        year: "",
                        mileage: "",
                        condition: "",
                        engine_type: "",
                        transmission: "",
                        color: "",
                        registration_city: "",
                        starting_bid: "",
                        reserve_price: "",
                        buy_now_price: "",
                        images: [],
                        inspection_report: {},
                      });
                    }}
                    disabled={!newCar.starting_bid}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit for Approval
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerDashboard;
