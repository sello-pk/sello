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
  FiCreditCard,
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
  useGetMyTokenPaymentsQuery,
  useGetMyWonAuctionsQuery,
  useGetMyAuctionWatchlistQuery,
  useGetAuctionsQuery,
  useGetLiveAuctionQuery,
} from "../../redux/services/api";
import { Spinner } from "../../components/ui/Loading";
import toast from "react-hot-toast";
import { Image as LazyImage } from "../../components/ui/Image";
import { images } from "../../assets/assets";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
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
  const { data: user, isLoading: userLoading } = useGetMeQuery();
  const { data: carsData, isLoading: carsLoading } = useGetMyCarsQuery();
  const [logout] = useLogoutMutation();
  const { data: tokenData } = useGetMyTokenPaymentsQuery();
  const { data: wonAuctions = [] } = useGetMyWonAuctionsQuery();
  const { data: watchlistItems = [] } = useGetMyAuctionWatchlistQuery();
  const { data: upcomingAuctions = [] } = useGetAuctionsQuery({ status: "scheduled", limit: 5 });
  const { data: liveAuction } = useGetLiveAuctionQuery();

  const auctionStats = {
    totalAuctions: wonAuctions.length,
    activeAuctions: liveAuction ? 1 : 0,
    soldAuctions: wonAuctions.length,
    totalAuctionSales: wonAuctions.reduce((sum, w) => sum + (w.finalPrice || 0), 0),
    tokenBalance: tokenData?.tokenBalance || 0,
    hasVerifiedToken: tokenData?.hasVerifiedToken || false,
    watchlistCount: watchlistItems.length,
  };

  const cars = carsData?.cars || [];

  const stats = {
    totalAds: cars.length,
    activeListings: cars.filter((c) => !c.isSold && c.isActive).length,
    soldCars: cars.filter((c) => c.isSold).length,
    totalEarnings: cars
      .filter((c) => c.isSold)
      .reduce((sum, c) => sum + (c.price || 0), 0),
  };


  const handleLogout = async () => {
    try {
      await logout().unwrap();
      const { clearAuthSession } = await import("../../utils/tokenManager");
      clearAuthSession();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      const { clearAuthSession } = await import("../../utils/tokenManager");
      clearAuthSession();
      toast.error("Logout failed");
      navigate("/login");
    }
  };

  // Redirect logic based on user role and verification status
  useEffect(() => {
    if (!userLoading && user) {
      // Redirect individual users to home page
      if (user.role === "individual") {
        navigate("/", { replace: true });
        return;
      }

      // Redirect admins to admin dashboard
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      // Redirect verified dealers to dealer dashboard
      if (user.role === "dealer" && user.dealerInfo?.verified) {
        navigate("/dealer/dashboard", { replace: true });
        return;
      }
    }
  }, [user, userLoading, navigate]);

  // Don't show full-page loader - let page render normally
  if (userLoading) {
    return null;
  }

  // Only unverified dealers can access this dashboard
  // All other users are redirected (handled in useEffect above)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
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
            Please login with an appropriate account.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Redirect individual users, admins, and verified dealers (handled in useEffect above)
  if (
    user.role === "individual" ||
    user.role === "admin" ||
    (user.role === "dealer" && user.dealerInfo?.verified)
  ) {
    return null; // Will redirect in useEffect
  }

  // Only unverified dealers can access this dashboard
  if (user.role !== "dealer" || user.dealerInfo?.verified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
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
            {user?.role === "admin"
              ? "Admins should use the admin dashboard."
              : user?.dealerInfo?.verified
                ? "Verified dealers should use the dealer dashboard."
                : "This dashboard is only accessible to unverified dealers."}
          </p>
          <div className="flex gap-3 justify-center">
            {user?.dealerInfo?.verified ? (
              <button
                onClick={() => navigate("/dealer/dashboard")}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90"
              >
                Go to Dealer Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90"
              >
                Go Home
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-primary-500">SELLO</h2>
          <p className="text-xs text-gray-500 mt-1">
            {user?.role === "dealer" ? "Dealer Dashboard" : "My Dashboard"}
          </p>
        </div>

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
            onClick={() => navigate("/create-post")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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
            onClick={() => navigate("/seller/chats")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiMessageSquare size={20} />
            <span>Messages</span>
          </button>

          <button
            onClick={() => navigate("/auctions/watchlist")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiHeart size={20} />
            <span>Watchlist</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <FiUser size={20} />
            <span>Profile</span>
          </button>
        </nav>

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
        <header className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {user.role === "dealer"
                  ? "Dealer Dashboard"
                  : "Seller Dashboard"}
              </h2>
              <p className="text-slate-400">
                Manage your vehicle listings and auctions
              </p>
            </div>
            <button
              onClick={() => {
                toast.error("Only approved auction dealers can register cars for auction.");
                navigate("/profile");
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-amber-500 hover:to-orange-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg"
            >
              <FiPlus size={20} />
              Submit New Vehicle
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    <span className="text-sm text-gray-600">Sold Cars</span>
                    <FiCheckCircle className="text-primary-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.soldCars}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Total Earnings
                    </span>
                    <FiCreditCard className="text-green-500" size={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    PKR {stats.totalEarnings.toLocaleString()}
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
                    onClick={() => navigate("/my-listings")}
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
                        <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                          <LazyImage
                            src={car.images?.[0] || images.carPlaceholder}
                            alt={car.title}
                            className="absolute inset-0 w-full h-full object-cover object-center"
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
                      <FiCreditCard className="text-white" size={24} />
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
                        <FiCreditCard className="text-white" size={32} />
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

              {/* Won Auctions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Won Auctions</h3>
                  <Link to="/auctions/transactions" className="text-orange-500 hover:text-orange-600 font-medium">View All</Link>
                </div>
                <div className="space-y-3">
                  {wonAuctions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No won auctions yet. Start bidding on live auctions!</p>
                  ) : wonAuctions.slice(0, 3).map((item) => {
                    const car = item.car || {};
                    const img = Array.isArray(car.images) ? car.images[0] : car.images;
                    return (
                      <Link key={item._id} to={`/auctions/result?car_id=${item._id}`} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {img && <img src={img} alt={`${car.make} ${car.model}`} className="w-full h-full object-contain object-center" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{car.year} {car.make} {car.model}</h4>
                            <p className="text-sm text-gray-600">Final: PKR {item.finalPrice?.toLocaleString()}</p>
                          </div>
                        </div>
                        <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded">Won</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Auctions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Auctions</h3>
                  <Link to="/auctions/schedule" className="text-orange-500 hover:text-orange-600 font-medium">View Schedule</Link>
                </div>
                <div className="space-y-3">
                  {liveAuction && (
                    <Link to="/auctions/live" className="block p-3 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{liveAuction.title}</span>
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded animate-pulse">LIVE</span>
                      </div>
                      <div className="text-sm text-gray-600">{liveAuction.totalCars || 0} cars • {liveAuction.totalBids || 0} bids</div>
                    </Link>
                  )}
                  {upcomingAuctions.length > 0 ? upcomingAuctions.slice(0, 3).map((a) => (
                    <div key={a._id} className="p-3 border border-gray-200 rounded-lg bg-blue-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{a.title}</span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">{a.totalCars || 0} Cars</span>
                      </div>
                      <div className="text-sm text-gray-600">Starts: {new Date(a.startTime).toLocaleDateString("en-PK", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                    </div>
                  )) : !liveAuction && (
                    <p className="text-sm text-gray-500 text-center py-4">No upcoming auctions</p>
                  )}
                </div>
              </div>

              {/* Auction Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                  <FiSettings className="text-orange-500" size={20} />
                  Auction Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link to="/auctions/transactions" className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Won</span>
                      <FiTrendingUp className="text-emerald-500" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{wonAuctions.length}</p>
                    <p className="text-sm text-gray-600">Cars won at auction</p>
                  </Link>

                  <Link to="/auctions/watchlist" className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Watchlist</span>
                      <FiHeart className="text-red-400" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{watchlistItems.length}</p>
                    <p className="text-sm text-gray-600">Cars you're following</p>
                  </Link>

                  <Link to="/auctions/token-payment" className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Token</span>
                      <FiCreditCard className="text-purple-500" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">PKR {auctionStats.tokenBalance.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{auctionStats.hasVerifiedToken ? "✓ Verified" : "Not verified"}</p>
                  </Link>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <FiZap className={liveAuction ? "text-red-500" : "text-gray-400"} size={16} />
                    </div>
                    {liveAuction ? (
                      <>
                        <p className="text-lg font-bold text-red-600 mb-1">{liveAuction.title}</p>
                        <Link to="/auctions/live" className="text-sm text-orange-500 font-medium">Join Now →</Link>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-gray-400 mb-1">No Live Auction</p>
                        <Link to="/auctions/schedule" className="text-sm text-orange-500 font-medium">View Schedule →</Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
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
                    <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                      <LazyImage
                        src={car.images?.[0] || images.carPlaceholder}
                        alt={car.title}
                        className="absolute inset-0 w-full h-full object-cover object-center"
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
                          Edit
                        </button>
                        <button
                          onClick={() => navigate(buildCarUrl(car))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      toast.error(
                        "Only approved auction dealers can register cars for auction.",
                      );
                      setShowAddCar(false);
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

export default SellerDashboard;
