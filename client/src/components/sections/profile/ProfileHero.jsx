import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  MdKeyboardArrowRight,
  MdEdit,
  MdCheck,
  MdClose,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import {
  FiUser,
  FiMail,
  FiCheckCircle,
  FiStar,
  FiMessageSquare,
  FiHeart,
  FiFileText,
  FiHelpCircle,
  FiActivity,
  FiTrendingUp,
  FiCreditCard,
  FiCalendar,
  FiClock,
  FiBell,
  FiChevronRight,
  FiSettings,
  FiEdit,
  FiZap,
} from "react-icons/fi";
import { RiVerifiedBadgeFill } from "react-icons/ri";
import {
  useGetMeQuery,
  useLogoutMutation,
  useUpdateProfileMutation,
  useUpdateDealerProfileMutation,
  useGetSavedCarsQuery,
  useGetMySubscriptionQuery,
  useGetMyTokenPaymentsQuery,
  useGetMyWonAuctionsQuery,
  useGetMyAuctionWatchlistQuery,
  useGetAuctionsQuery,
  useGetLiveAuctionQuery,
  useGetMyAuctionAccessStatusQuery,
} from "../../../redux/services/api";
import { clearAuthSession } from "../../../utils/tokenManager";
import { useSupportChat } from "../../../contexts/SupportChatContext";
import NotificationsSection from "./NotificationsSection";
import StructuredData from "../../common/StructuredData";
import DealerRequestForm from "../../features/profile/DealerRequestForm";
import SubscriptionManagement from "../../subscriptions/SubscriptionManagement";
import DealerProfileEditSection from "./DealerProfileEditSection";
import AccountDeletionRequest from "../../features/profile/AccountDeletionRequest";
import {
  createDealerFormState,
  mapUserToDealerForm,
} from "../../features/profile/dealerFormUtils";

const ProfileHero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSupportChat } = useSupportChat();
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showDealerForm, setShowDealerForm] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const { data: tokenData } = useGetMyTokenPaymentsQuery();
  const { data: wonAuctions = [] } = useGetMyWonAuctionsQuery();
  const { data: watchlistItems = [] } = useGetMyAuctionWatchlistQuery();
  const { data: upcomingAuctions = [] } = useGetAuctionsQuery({ status: "scheduled", limit: 5 });
  const { data: liveAuction } = useGetLiveAuctionQuery();
  const { data: auctionAccess } = useGetMyAuctionAccessStatusQuery(undefined, {
    skip: !localStorage.getItem("token"),
  });

  const auctionStats = {
    totalAuctions: wonAuctions.length,
    activeAuctions: liveAuction ? 1 : 0,
    wonAuctions: wonAuctions.length,
    totalBids: wonAuctions.reduce((sum, w) => sum + (w.bidCount || 0), 0),
    tokenBalance: tokenData?.tokenBalance || 0,
    hasVerifiedToken: tokenData?.hasVerifiedToken || false,
    watchlistCount: watchlistItems.length,
  };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: null,
    avatarPreview: null,
  });

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetMeQuery(undefined, {
    skip: !localStorage.getItem("token"),
  });

  const isVerifiedAccount =
    user?.role === "dealer"
      ? user?.dealerInfo?.verified === true
      : user?.verified === true;

  const VerifiedDealerIcon = ({ className = "" }) => (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm ${className}`}
      title="Verified dealer"
      aria-label="Verified dealer"
    >
      <RiVerifiedBadgeFill size={14} />
    </span>
  );
  const { data: savedCarsData } = useGetSavedCarsQuery(undefined, {
    skip: !user || isLoading,
  });
  const { data: subscriptionData } = useGetMySubscriptionQuery(undefined, {
    skip: !user || isLoading,
  });
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [updateDealerProfile, { isLoading: isUpdatingDealer }] =
    useUpdateDealerProfileMutation();

  // Dealer profile form state
  const [dealerFormData, setDealerFormData] = useState(createDealerFormState());
  const [dealerFiles, setDealerFiles] = useState({
    avatar: null,
    businessLicense: null,
    showroomImages: [],
  });
  const [isEditingDealer, setIsEditingDealer] = useState(false);

  const [metrics, setMetrics] = useState({
    posts: 0,
    activeListings: 0,
    sales: 0,
    earnings: 0,
    savedCount: 0,
    rating: 0,
    ratingCount: 0,
  });

  useEffect(() => {
    if (user) {
      try {
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          avatar: null,
          avatarPreview: user?.avatar || null,
        });

        // Set dealer form data if user is a dealer
        if (user?.role === "dealer" && user?.dealerInfo) {
          setDealerFormData(mapUserToDealerForm(user));
        }

        const posts = user?.carsPosted?.length || 0;
        const sales = user?.carsPurchased?.length || 0;
        const savedCount =
          user?.savedCars?.length || savedCarsData?.length || 0;
        const earnings =
          user?.carsPurchased?.reduce(
            (sum, car) => sum + (car?.price || 0),
            0,
          ) || 0;
        setMetrics({
          posts,
          activeListings: posts,
          sales,
          earnings,
          savedCount,
          clicks: 0,
          rating: user?.sellerRating || 0,
          ratingCount: user?.reviewCount || 0,
        });
      } catch (error) {
        console.error("Error setting user data", error);
      }
    }
  }, [user, savedCarsData]);

  useEffect(() => {
    if (isError && error?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [isError, error, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get("section");
    if (!section) return;

    if (section === "auction-access" || section === "become-dealer") {
      setActiveSection("auctions");
      setShowDealerForm(true);
      return;
    }
    if (section === "auctions") {
      setActiveSection("auctions");
      return;
    }
    if (section === "dealer-profile") {
      setActiveSection("dealer-profile");
    }
  }, [location.search]);

  const handleProfilePopup = () => {
    setShowProfilePopup(true);
    setIsEditing(false);
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        avatar: null,
        avatarPreview: user.avatar || null,
      });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          avatar: file,
          avatarPreview: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      const formDataToSend = new FormData();
      if (formData.name) {
        formDataToSend.append("name", formData.name);
      }
      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }

      await updateProfile(formDataToSend).unwrap();
      await refetch();
      setIsEditing(false);
      setShowProfilePopup(false);
    } catch (err) {
      console.error("Update failed", err);
      alert(
        err?.data?.message || "Failed to update profile. Please try again.",
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      clearAuthSession();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
      // Clear session even if logout request fails (stale RTK cache = wrong user on next login)
      clearAuthSession();
      navigate("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary-500 mx-auto mb-4"></div>
          <div className="text-gray-500 text-sm">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (isError && error?.status !== 401) {
    console.error("Profile error", error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading profile</div>
          <div className="text-gray-500 text-sm">
            {error?.data?.message || error?.message || "Failed to load profile"}
          </div>
          <button
            onClick={() => navigate(0)}
            className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Safety check: if no user data after loading, show error
  if (!user && !isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">
            No user data available
          </div>
          <div className="text-gray-500 text-sm mb-4">
            Please try logging in again.
          </div>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const bidderStatus = auctionAccess?.auctionCapabilities?.auctionBidder?.status || "not_requested";
  const dealerAccessStatus = auctionAccess?.auctionCapabilities?.auctionDealer?.status || "not_requested";
  const canBidAuctions = bidderStatus === "approved" || dealerAccessStatus === "approved";
  const isVerifiedDealer = user?.role === "dealer" && user?.dealerInfo?.verified === true;
  const hasPendingDealerRequest =
    dealerAccessStatus === "pending" ||
    (!!user?.dealerInfo?.businessName && !user?.dealerInfo?.verified);

  const menuItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: FiUser,
      onClick: () => setActiveSection("overview"),
    },
    {
      id: "my-listings",
      label: "My Listings",
      icon: FiFileText,
      onClick: () => navigate("/my-listings"),
      highlight: true,
    },
    {
      id: "auctions",
      label: "My Auctions",
      icon: FiActivity,
      onClick: () => setActiveSection("auctions"),
    },
    {
      id: "wallet-transactions",
      label: "Wallet",
      icon: FiCreditCard,
      onClick: () => navigate("/auctions/transactions"),
    },
    {
      id: "watchlist",
      label: "Watchlist",
      icon: FiHeart,
      onClick: () => navigate("/auctions/watchlist"),
    },
    {
      id: "chats",
      label: "Chats",
      icon: FiMessageSquare,
      onClick: () => navigate("/my-chats"),
    },
    // For dealers: Show appropriate dashboard based on verification status
    ...(isVerifiedDealer
      ? [
          {
            id: "dealer-dashboard",
            label: "Dealer Dashboard",
            icon: FiCheckCircle,
            onClick: () => navigate("/dealer/dashboard"),
            highlight: true,
          },
        ]
      : []),
    ...(user?.role === "dealer" && !user?.dealerInfo?.verified
      ? [
          {
            id: "seller-dashboard",
            label: "My Dashboard",
            icon: FiCheckCircle,
            onClick: () => navigate("/seller/dashboard"),
            highlight: true,
          },
        ]
      : []),
    // For individual users: Show My Dashboard
    ...(user?.role === "individual"
      ? [] // Individual users don't have a dashboard
      : []),
    ...(isVerifiedDealer
      ? [
          {
            id: "dealer-profile",
            label: "Dealer Profile",
            icon: FiUser,
            onClick: () => setActiveSection("dealer-profile"),
            highlight: true,
          },
        ]
      : []),
    ...(!isVerifiedDealer
      ? [
          {
            id: "become-dealer",
            label: "Dealer / Bidder Request",
            icon: FiStar,
            onClick: () => setShowDealerForm(true),
            highlight: !hasPendingDealerRequest,
          },
        ]
      : []),
    // Only show subscription tab if user doesn't have active premium subscription
    ...(subscriptionData?.subscription?.isActive &&
    subscriptionData?.subscription?.endDate &&
    new Date(subscriptionData?.subscription?.endDate) > new Date() &&
    subscriptionData?.subscription?.plan !== "free"
      ? []
      : [
          {
            id: "subscription",
            label: "Subscription",
            icon: FiStar,
            onClick: () => setActiveSection("subscription"),
          },
        ]),
    {
      id: "support",
      label: "Support",
      icon: FiHelpCircle,
      onClick: () => openSupportChat(),
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-50">
      {/* Modern Header Section */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden ring-2 ring-gray-100 ring-offset-2">
                <img
                  src={
                    user?.avatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.name || "User",
                    )}&background=FFA602&color=fff&size=200`
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleProfilePopup}
                className="absolute -bottom-1 -right-1 bg-white hover:bg-gray-50 text-gray-700 p-2 rounded-full shadow-lg border border-gray-200 transition-all hover:scale-105"
                title="Edit Profile"
              >
                <MdEdit className="text-lg" />
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 truncate">
                  {user?.name || "User"}
                </h2>
                {isVerifiedAccount && <VerifiedDealerIcon className="flex-shrink-0" />}
              </div>
              <p className="text-gray-500 text-sm mb-4">{user?.email || ""}</p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {metrics.posts}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {metrics.sales}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Sales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    PKR {metrics.earnings.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">Earnings</div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate("/create-post")}
              className="px-6 py-2.5 bg-primary-500 hover:opacity-90 text-white rounded-lg font-medium text-sm transition-colors shadow-sm hover:shadow-md"
            >
              Create Post
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto min-w-0 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Menu */}
          <div className="min-w-0 lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary-50 text-primary-500"
                          : item.highlight
                            ? "text-primary-500 hover:bg-primary-50"
                            : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={isActive ? "text-primary-500" : ""}
                          size={18}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                      <MdKeyboardArrowRight
                        className={`text-gray-400 transition-transform ${
                          isActive ? "rotate-90" : ""
                        }`}
                        size={18}
                      />
                    </button>
                  );
                })}
                <div className="border-t border-gray-200 my-2"></div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <MdLogout size={18} />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-w-0 space-y-6 lg:col-span-3">
            {activeSection === "overview" && (
              <>
                {/* Account Information Cards - Different for Dealers vs Individuals */}
                {user?.role === "dealer" ? (
                  <>
                    {/* Dealer Account Overview */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Account Overview
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-l-4 border-primary-500 pl-4">
                          <p className="text-sm text-gray-600">
                            Account Status
                          </p>
                          <p className="font-semibold text-gray-900 text-lg capitalize">
                            {user?.dealerInfo?.verified ? (
                              <span className="text-green-600">
                                Verified Dealer
                              </span>
                            ) : (
                              <span className="text-yellow-600">
                                Pending Verification
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="border-l-4 border-primary-500 pl-4">
                          <p className="text-sm text-gray-600">Business Name</p>
                          <p className="font-semibold text-gray-900 text-lg inline-flex items-center gap-2">
                            {user?.dealerInfo?.businessName || "Not set"}
                            {user?.dealerInfo?.verified && <VerifiedDealerIcon />}
                          </p>
                        </div>
                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {user?.email}
                          </p>
                        </div>
                        <div className="border-l-4 border-purple-500 pl-4">
                          <p className="text-sm text-gray-600">Member Since</p>
                          <p className="font-semibold text-gray-900 text-lg">
                            {user?.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">
                          Quick Actions
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              setActiveSection("dealer-profile");
                              setIsEditingDealer(true);
                            }}
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 text-sm font-medium"
                          >
                            Edit Business Profile
                          </button>
                          <button
                            onClick={() => {
                              if (user?.dealerInfo?.verified) {
                                navigate("/dealer/dashboard");
                              } else {
                                navigate("/seller/dashboard");
                              }
                            }}
                            className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 text-sm font-medium"
                          >
                            View Dashboard
                          </button>
                          <button
                            onClick={() => navigate("/my-listings")}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                          >
                            Manage Listings
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Individual User Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500">
                            Total Posts
                          </span>
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                            <FiFileText
                              className="text-primary-500"
                              size={20}
                            />
                          </div>
                        </div>
                        <div className="text-3xl font-semibold text-gray-900">
                          {metrics.posts}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500">
                            Active Listings
                          </span>
                          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                            <FiCheckCircle
                              className="text-green-600"
                              size={20}
                            />
                          </div>
                        </div>
                        <div className="text-3xl font-semibold text-gray-900">
                          {metrics.activeListings}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500">
                            Total Sales
                          </span>
                          <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                            <FiStar className="text-primary-600" size={20} />
                          </div>
                        </div>
                        <div className="text-3xl font-semibold text-gray-900">
                          {metrics.sales}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500">
                            Earnings
                          </span>
                          <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                            <span className="text-yellow-600 text-xl">💰</span>
                          </div>
                        </div>
                        <div className="text-2xl font-semibold text-gray-900">
                          PKR {metrics.earnings.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {/* Individual users: direct link to their listings (sidebar also has My Listings) */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigate("/my-listings")}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 text-sm font-medium"
                      >
                        View my listings
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate("/create-post")}
                        className="px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 text-sm font-medium"
                      >
                        Create post
                      </button>
                    </div>
                  </>
                )}

                {/* Upcoming Auctions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
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
                      <p className="text-sm text-gray-500 text-center py-4">No upcoming auctions scheduled</p>
                    )}
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
                  <NotificationsSection />
                </div>

                {/* Account Deletion Request */}
                <AccountDeletionRequest user={user} />
              </>
            )}

            {activeSection === "auctions" && (
              <>
                {/* Enhanced Auction Stats */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FiActivity className="text-orange-600" size={20} />
                    </div>
                    Auction Activity Overview
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        All time participation
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                          <FiTrendingUp className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-emerald-600">
                          {auctionStats.wonAuctions}
                        </span>
                      </div>
                      <p className="text-sm text-emerald-700 font-medium">
                        Auctions Won
                      </p>
                      <p className="text-xs text-emerald-600 mt-1">
                        Successful bids
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                          <FiCalendar className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-blue-600">
                          {auctionStats.totalBids}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 font-medium">
                        Total Bids
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        All auction bids
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                          <FiCreditCard className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold text-purple-600">
                          PKR {auctionStats.tokenBalance.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-purple-700 font-medium">
                        Token Balance
                      </p>
                      <p className="text-xs text-purple-600 mt-1">
                        Available for bidding
                      </p>
                    </div>
                  </div>
                </div>

                {/* Won Auctions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <FiActivity className="text-emerald-600" size={20} />
                      </div>
                      Your Won Auctions
                    </h3>
                    <Link
                      to="/auctions/transactions"
                      className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                    >
                      View All
                      <FiChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {wonAuctions.length === 0 ? (
                      <div className="text-center py-6">
                        <FiActivity className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-sm text-gray-500">No won auctions yet. Start bidding on live auctions!</p>
                        <Link to="/auctions/live" className="text-orange-500 hover:text-orange-600 text-sm font-medium mt-2 inline-block">Browse Live Auction</Link>
                      </div>
                    ) : wonAuctions.slice(0, 3).map((item) => {
                      const car = item.car || {};
                      const img = Array.isArray(car.images) ? car.images[0] : car.images;
                      return (
                        <Link key={item._id} to={`/auctions/result?car_id=${item._id}`} className="flex items-center justify-between p-4 border-2 border-emerald-200 rounded-xl bg-emerald-50 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                              {img && <img src={img} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{car.year} {car.make} {car.model}</h4>
                              <p className="text-sm text-gray-600">Final Price: <span className="font-semibold text-emerald-600">PKR {item.finalPrice?.toLocaleString()}</span></p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                              <FiCheckCircle size={14} />Won
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Auction Summary */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FiSettings className="text-purple-600" size={20} />
                      </div>
                      Auction Summary
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link to="/auctions/transactions" className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">My Bids & Bid History</span>
                        <FiActivity className="text-orange-500" size={16} />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">View all bids and activity</p>
                      <p className="text-xs text-orange-500 font-medium">View →</p>
                    </Link>

                    <Link to="/auctions/transactions" className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Auctions Won</span>
                        <FiTrendingUp className="text-emerald-500" size={16} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{wonAuctions.length}</p>
                      <p className="text-sm text-gray-600">Cars you've won</p>
                    </Link>

                    <Link to="/auctions/transactions" className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Auction Payments</span>
                        <FiCreditCard className="text-blue-500" size={16} />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">Pay escrow, view ledger</p>
                      <p className="text-xs text-orange-500 font-medium">Wallet →</p>
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
                        <span className="text-sm font-medium text-gray-700">Token Status</span>
                        <FiCreditCard className="text-purple-500" size={16} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">PKR {auctionStats.tokenBalance.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">{auctionStats.hasVerifiedToken ? "✓ Verified — Ready to bid" : "Not verified"}</p>
                    </Link>

                    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">Live Status</span>
                        <FiZap className={liveAuction ? "text-red-500" : "text-gray-400"} size={16} />
                      </div>
                      {liveAuction ? (
                        <>
                          <p className="text-lg font-bold text-red-600 mb-1">{liveAuction.title}</p>
                          <Link to="/auctions/live" className="text-sm text-orange-500 hover:text-orange-600 font-medium">Join Now →</Link>
                        </>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-gray-400 mb-1">No Live Auction</p>
                          <Link to="/auctions/schedule" className="text-sm text-orange-500 hover:text-orange-600 font-medium">View Schedule →</Link>
                        </>
                      )}
                    </div>

                    {user?.role === "dealer" && (
                      <Link to="/dealer/dashboard" className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">My Auction Listings</span>
                          <FiFileText className="text-orange-500" size={16} />
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Manage cars in auction</p>
                        <p className="text-xs text-orange-500 font-medium">Dealer Dashboard →</p>
                      </Link>
                    )}
                  </div>
                </div>

                {/* Upcoming Auctions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-blue-600" size={20} />
                      </div>
                      Upcoming Auctions
                    </h3>
                    <Link
                      to="/auctions/schedule"
                      className="text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                    >
                      View Schedule
                      <FiChevronRight size={16} />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {upcomingAuctions.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-6">No upcoming auctions scheduled</p>
                    ) : upcomingAuctions.slice(0, 4).map((a) => (
                      <div key={a._id} className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-blue-900 text-lg">{a.title}</span>
                          <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            <FiActivity size={14} />{a.totalCars || 0} Cars
                          </div>
                        </div>
                        <div className="text-sm text-blue-700">
                          Starts: <span className="font-bold">{new Date(a.startTime).toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auction Status */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FiBell className="text-orange-600" size={20} />
                      </div>
                      Your Auction Status
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-xl bg-gray-50">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiCreditCard className="text-purple-600" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-1">Token Payment</p>
                        <p className="text-sm text-gray-600">{auctionStats.hasVerifiedToken ? "Your token is verified. You can place bids." : "Pay the PKR 10,000 refundable token to start bidding."}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Auction access status: {canBidAuctions ? "Approved" : bidderStatus.replace("_", " ")}
                        </p>
                      </div>
                      {!auctionStats.hasVerifiedToken && (
                        <Link to="/auctions/token-payment" className="text-sm text-orange-500 hover:text-orange-600 font-medium whitespace-nowrap">Pay Now →</Link>
                      )}
                    </div>

                    {liveAuction && (
                      <div className="flex items-start gap-4 p-4 border-2 border-red-200 rounded-xl bg-red-50">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiZap className="text-red-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">Live Auction Active</p>
                          <p className="text-sm text-gray-600">{liveAuction.title} — {liveAuction.totalCars || 0} cars available</p>
                        </div>
                        <Link to="/auctions/live" className="text-sm text-red-500 hover:text-red-600 font-medium whitespace-nowrap">Join →</Link>
                      </div>
                    )}

                    {wonAuctions.length > 0 && (
                      <div className="flex items-start gap-4 p-4 border-2 border-emerald-200 rounded-xl bg-emerald-50">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiCheckCircle className="text-emerald-600" size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 mb-1">Auctions Won</p>
                          <p className="text-sm text-gray-600">You have won {wonAuctions.length} auction(s). Check your transactions.</p>
                        </div>
                        <Link to="/auctions/transactions" className="text-sm text-emerald-500 hover:text-emerald-600 font-medium whitespace-nowrap">View →</Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FiActivity className="text-purple-600" size={20} />
                    </div>
                    Auction Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      to="/auctions/watchlist"
                      className="group p-6 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:shadow-lg transition-all bg-gradient-to-br from-red-50 to-red-100"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <FiHeart className="text-white" size={32} />
                        </div>
                        <h4 className="font-bold text-red-800 text-lg mb-2">
                          My Watchlist
                        </h4>
                        <p className="text-sm text-red-600">
                          View cars you're following
                        </p>
                        <div className="flex items-center gap-1 mt-3 text-red-600 group-hover:gap-2 transition-all">
                          <span className="text-sm font-medium">
                            View Watchlist
                          </span>
                          <FiChevronRight size={16} />
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/auctions/token-payment"
                      className="group p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all bg-gradient-to-br from-emerald-50 to-emerald-100"
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
                          <span className="text-sm font-medium">
                            Top Up Now
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
              </>
            )}

            {activeSection === "subscription" && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                {subscriptionData?.subscription?.isActive &&
                subscriptionData?.subscription?.endDate &&
                new Date(subscriptionData.subscription.endDate) > new Date() &&
                subscriptionData?.subscription?.plan !== "free" ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiCheckCircle className="text-green-500 text-4xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Active Subscription:{" "}
                      {subscriptionData?.planDetails?.name || "Premium"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Your subscription is active until{" "}
                      {new Date(
                        subscriptionData.subscription.endDate,
                      ).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      You have unlimited listings and all premium features
                      enabled.
                    </p>
                  </div>
                ) : (
                  <SubscriptionManagement />
                )}
              </div>
            )}

            {activeSection === "dealer-profile" && isVerifiedDealer && (
              <DealerProfileEditSection
                user={user}
                dealerFormData={dealerFormData}
                setDealerFormData={setDealerFormData}
                dealerFiles={dealerFiles}
                setDealerFiles={setDealerFiles}
                isEditingDealer={isEditingDealer}
                setIsEditingDealer={setIsEditingDealer}
                updateDealerProfile={updateDealerProfile}
                isUpdatingDealer={isUpdatingDealer}
                refetch={refetch}
              />
            )}
          </div>
        </div>
      </div>

      {/* Dealer Request Form Modal */}
      <DealerRequestForm
        isOpen={showDealerForm}
        onClose={() => setShowDealerForm(false)}
        onSuccess={() => {
          refetch();
          setShowDealerForm(false);
        }}
      />

      {/* Profile Edit Modal */}
      {showProfilePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => {
            if (!isEditing) {
              setShowProfilePopup(false);
            }
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowProfilePopup(false);
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MdClose size={24} />
            </button>

            <div className="flex flex-col items-center mb-6 pt-4">
              <div className="relative group mb-4">
                <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-200">
                  <img
                    src={
                      formData.avatarPreview ||
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || "User",
                      )}&background=FFA602&color=fff&size=200`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-full">
                  <MdEdit size={24} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.name || "User"}
              </h3>
              <p className="text-gray-500 text-sm mt-1">{user?.email || ""}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiUser className="inline mr-2" size={16} />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  placeholder="Enter your name"
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiMail className="inline mr-2" size={16} />
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-gray-50 cursor-not-allowed"
                  value={user?.email || ""}
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={!isEditing}
                  />
                  <div className="text-sm text-gray-600">
                    {formData.avatar ? "Change Image" : "Click to upload"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    JPG, PNG up to 5MB
                  </div>
                </label>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-primary-500 hover:opacity-90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MdEdit size={18} />
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || "",
                        email: user?.email || "",
                        avatar: null,
                        avatarPreview: user?.avatar || null,
                      });
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="flex-1 bg-primary-500 hover:opacity-90 disabled:bg-primary-300 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <MdCheck size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {user?.dealerInfo && <StructuredData.AutoDealerSchema dealerInfo={user.dealerInfo} />}
    </div>
  );
};

export default ProfileHero;
