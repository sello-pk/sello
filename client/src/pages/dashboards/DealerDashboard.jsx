import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
  FiTrash2,
} from "react-icons/fi";
import {
  useGetMeQuery,
  useGetMyCarsQuery,
  useLogoutMutation,
  useGetSubscriptionPlansQuery,
  useGetMyTokenPaymentsQuery,
  useGetMyWonAuctionsQuery,
  useGetMyAuctionWatchlistQuery,
  useGetAuctionsQuery,
  useGetLiveAuctionQuery,
  useSubmitCarToAuctionMutation,
  useGetMyAuctionAnalyticsQuery,
} from "../../redux/services/api";
import { useGetSellerBuyerChatsQuery } from "../../redux/services/api";
import { Spinner } from "../../components/ui/Loading";
import toast from "react-hot-toast";
import { Image as LazyImage } from "../../components/ui/Image";
import { images } from "../../assets/assets";
import AccountDeletionRequest from "../../components/features/profile/AccountDeletionRequest";
import SearchableSelect from "../../components/common/SearchableSelect";
import { useCarCategories } from "../../hooks/useCarCategories";

const createEmptyAuctionForm = () => ({
  make: "",
  model: "",
  year: "",
  mileage: "",
  condition: "Used",
  fuelType: "",
  transmission: "",
  colorExterior: "",
  country: "",
  state: "",
  city: "",
  location: "",
  startingBid: "",
  reservePrice: "",
  buyNowPrice: "",
  auctionId: "",
  carId: "",
  images: [],
  inspectionReportFile: null,
});

const DealerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSection, setActiveSection] = useState("");
  const [showAddCar, setShowAddCar] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newCar, setNewCar] = useState(createEmptyAuctionForm);
  const photoInputRef = useRef(null);
  const [submitCarToAuction, { isLoading: isSubmittingAuctionCar }] =
    useSubmitCarToAuctionMutation();
  const { data: tokenData } = useGetMyTokenPaymentsQuery();
  const {
    makes,
    years,
    countries,
    states,
    cities,
    getModelsByMake,
    getStatesByCountry,
    getCitiesByCountry,
    getCitiesByState,
    isLoading: auctionCategoryLoading,
  } = useCarCategories("Car");

  const selectedMake = useMemo(
    () => makes.find((item) => item.name === newCar.make),
    [makes, newCar.make],
  );
  const availableAuctionModels = useMemo(() => {
    if (!selectedMake?._id) return [];
    return getModelsByMake?.[selectedMake._id] || [];
  }, [getModelsByMake, selectedMake]);
  const selectedCountry = useMemo(
    () => countries.find((item) => item.name === newCar.country),
    [countries, newCar.country],
  );
  const selectedState = useMemo(
    () => states.find((item) => item.name === newCar.state),
    [states, newCar.state],
  );
  const availableAuctionStates = useMemo(() => {
    if (!selectedCountry?._id) return states;
    return getStatesByCountry?.[selectedCountry._id] || [];
  }, [getStatesByCountry, selectedCountry, states]);
  const availableAuctionCities = useMemo(() => {
    if (selectedState?._id) {
      return getCitiesByState?.[selectedState._id] || [];
    }
    if (selectedCountry?._id) {
      return getCitiesByCountry?.[selectedCountry._id] || [];
    }
    return cities;
  }, [
    cities,
    getCitiesByCountry,
    getCitiesByState,
    selectedCountry,
    selectedState,
  ]);

  const updateAuctionForm = useCallback((field, value) => {
    setNewCar((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "make") {
        next.model = "";
      }
      if (field === "country") {
        next.state = "";
        next.city = "";
      }
      if (field === "state") {
        next.city = "";
      }
      if (field === "city" && !prev.location) {
        next.location = value;
      }
      return next;
    });
  }, []);

  const closeAuctionModal = useCallback(() => {
    setNewCar((prev) => {
      (prev.images || []).forEach((item) => {
        if (item?.preview) URL.revokeObjectURL(item.preview);
      });
      return createEmptyAuctionForm();
    });
    setShowAddCar(false);
    setCurrentStep(1);
  }, []);
  const { data: wonAuctions = [] } = useGetMyWonAuctionsQuery();
  const { data: watchlistItems = [] } = useGetMyAuctionWatchlistQuery();
  const { data: upcomingAuctions = [], refetch: refetchAuctions } =
    useGetAuctionsQuery(
      {
        page: 1,
        limit: 100,
      },
      {
        pollingInterval: 30000,
        refetchOnMountOrArgChange: true,
      },
    );
  const { data: liveAuction } = useGetLiveAuctionQuery();
  const { data: auctionAnalytics } = useGetMyAuctionAnalyticsQuery();

  const auctionStats = {
    totalAuctions: wonAuctions.length,
    activeAuctions: liveAuction ? 1 : 0,
    soldAuctions: wonAuctions.length,
    totalAuctionSales: wonAuctions.reduce(
      (sum, w) => sum + (w.finalPrice || 0),
      0,
    ),
    tokenBalance: tokenData?.tokenBalance || 0,
    hasVerifiedToken: tokenData?.hasVerifiedToken || false,
    watchlistCount: watchlistItems.length,
  };
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
  const auctionOptions = useMemo(() => {
    const list = Array.isArray(upcomingAuctions) ? upcomingAuctions : [];
    const raw = [...(liveAuction ? [liveAuction] : []), ...list]
      .filter(Boolean)
      .filter((a) => ["scheduled", "draft", "live"].includes(a?.status));
    const byId = new Map();
    raw.forEach((a) => {
      if (a?._id && !byId.has(a._id)) byId.set(a._id, a);
    });
    return Array.from(byId.values());
  }, [upcomingAuctions, liveAuction]);

  useEffect(() => {
    if (!newCar.auctionId) return;
    const exists = auctionOptions.some((a) => a?._id === newCar.auctionId);
    if (!exists) {
      setNewCar((prev) => ({ ...prev, auctionId: "" }));
    }
  }, [auctionOptions, newCar.auctionId]);

  useEffect(() => {
    if (!showAddCar) return;
    refetchAuctions();
  }, [showAddCar, refetchAuctions]);

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

  const MAX_PHOTOS = 10;
  const MIN_PHOTOS = 3;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

  // Compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1200px)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            resolve(
              new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              }),
            );
          },
          "image/jpeg",
          0.8, // 80% quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const processPhotoFiles = async (files) => {
    const list = Array.from(files).filter((f) =>
      ALLOWED_TYPES.includes(f.type),
    );
    const valid = [];

    for (const file of list) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is over 10MB. Max 10MB per image.`);
        continue;
      }

      try {
        // Compress image
        const compressedFile = await compressImage(file);
        valid.push({
          file: compressedFile,
          preview: URL.createObjectURL(compressedFile),
        });
      } catch (error) {
        console.error("Image compression failed:", error);
        // Use original if compression fails
        valid.push({ file, preview: URL.createObjectURL(file) });
      }
    }

    const current = newCar.images || [];
    if (current.length + valid.length > MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos. Remove some first.`);
      valid.splice(MAX_PHOTOS - current.length);
    }
    if (valid.length)
      setNewCar((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...valid],
      }));
  };

  const handlePhotoSelect = (e) => {
    const files = e.target.files;
    if (files?.length) processPhotoFiles(files);
    e.target.value = "";
  };

  const handlePhotoRemove = (index) => {
    setNewCar((prev) => {
      const next = [...(prev.images || [])];
      const item = next.splice(index, 1)[0];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return { ...prev, images: next };
    });
  };

  const handlePhotoDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handlePhotoDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer?.files;
    if (files?.length) processPhotoFiles(files);
  };

  const handleSubmitAuctionCar = async () => {
    // Validate that either an existing car is selected OR new car details are provided
    const hasNewCarDetails = newCar.make && newCar.model && newCar.year;
    const hasExistingCar = newCar.carId;

    if (!newCar.auctionId || !newCar.startingBid) {
      toast.error("Select auction and starting bid");
      return;
    }

    if (!hasExistingCar && !hasNewCarDetails) {
      toast.error(
        "Please either select an existing listing or provide vehicle details in previous steps",
      );
      return;
    }
    if (
      !newCar.inspectionReportFile ||
      !(newCar.inspectionReportFile instanceof File)
    ) {
      toast.error(
        "Inspection report (PDF) is required. Please upload the vehicle inspection report.",
      );
      return;
    }

    // Show progress toast
    const progressToast = toast.loading("Uploading images and documents...", {
      duration: 0,
    });

    try {
      const submissionData = {
        auctionId: newCar.auctionId,
        startingBid: Number(newCar.startingBid),
        reservePrice: newCar.reservePrice
          ? Number(newCar.reservePrice)
          : undefined,
        buyNowPrice: newCar.buyNowPrice
          ? Number(newCar.buyNowPrice)
          : undefined,
        inspectionReportFile: newCar.inspectionReportFile,
      };

      // Include carId only if selecting an existing car
      if (hasExistingCar) {
        submissionData.carId = newCar.carId;
      } else {
        // Include new car details if creating a new listing
        const carDetails = {
          make: newCar.make,
          model: newCar.model,
          year: newCar.year,
          mileage: newCar.mileage,
          condition: newCar.condition,
          fuelType: newCar.fuelType,
          transmission: newCar.transmission,
          colorExterior: newCar.colorExterior,
          country: newCar.country,
          city: newCar.city,
          location: newCar.location,
          images: newCar.images || [],
        };

        Object.assign(submissionData, {
          ...carDetails,
          title: `${newCar.year} ${newCar.make} ${newCar.model}`,
          description: `Vehicle submitted for auction: ${newCar.year} ${newCar.make} ${newCar.model}`,
          price: Number(newCar.startingBid),
          vehicleType: "Car",
          city: carDetails.city || "Not specified",
          country: carDetails.country || "Pakistan",
          features: [],
          fuelType: carDetails.fuelType || "Petrol",
          colorExterior: carDetails.colorExterior || "N/A",
          condition: carDetails.condition || "Used",
          transmission: carDetails.transmission || "Manual",
          contactNumber:
            user?.phone ||
            user?.dealerInfo?.businessPhone ||
            user?.dealerInfo?.whatsappNumber ||
            "+923000000000",
          warranty: "Doesn't Apply",
          ownerType: "Dealer",
          geoLocation: {
            type: "Point",
            coordinates: [67.0011, 24.8607],
          },
          location:
            carDetails.location ||
            carDetails.city ||
            user?.dealerInfo?.city ||
            "Not specified",
        });

        if (carDetails.images && carDetails.images.length > 0) {
          submissionData.images = carDetails.images.map(
            (img) => img.file || img,
          );
        }
      }

      await submitCarToAuction(submissionData).unwrap();

      // Dismiss progress toast and show success
      toast.dismiss(progressToast);
      toast.success("Vehicle submitted for auction approval");
      setNewCar((prev) => {
        (prev.images || []).forEach((item) => {
          if (item?.preview) URL.revokeObjectURL(item.preview);
        });
        return createEmptyAuctionForm();
      });
      setShowAddCar(false);
      setCurrentStep(1);
    } catch (error) {
      // Dismiss progress toast and show error
      toast.dismiss(progressToast);
      toast.error(
        error?.data?.message?.includes("Auction not accepting submissions")
          ? "Selected auction is not open for submissions. Please choose a draft, scheduled, or live auction."
          : error?.data?.message || "Failed to submit vehicle for auction",
      );
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex min-h-[calc(100vh-2rem)] gap-4">
      {/* Sidebar */}
      <div className="w-64 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
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
              <span className="ml-auto bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
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
      <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Top Header */}
        <header className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 md:px-8 py-6">
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
              onClick={() => {
                // Always start the auction submission wizard from step 1.
                // The previous code forced step 4, which feels like "going to Pricing by default".
                setCurrentStep(1);
                setNewCar(createEmptyAuctionForm());
                setShowAddCar(true);
              }}
              className="bg-gradient-to-r from-primary-500 to-primary-500 hover:from-primary-500 hover:to-primary-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-all hover:shadow-lg"
            >
              <FiPlus size={20} />
              Submit Vehicle to Auction
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8 bg-slate-50">
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

              {/* Auction Analytics (dealer auction stats from API) */}
              {auctionAnalytics && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiBarChart2 className="text-primary-500" /> Auction
                    Analytics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Cars Submitted</p>
                      <p className="text-xl font-bold text-gray-900">
                        {auctionAnalytics.carsSubmitted ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pending Approval</p>
                      <p className="text-xl font-bold text-primary-500">
                        {auctionAnalytics.pendingApproval ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">In Auction</p>
                      <p className="text-xl font-bold text-blue-600">
                        {auctionAnalytics.inAuction ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sold</p>
                      <p className="text-xl font-bold text-green-600">
                        {auctionAnalytics.sold ?? 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">
                        Total Auction Revenue
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        PKR{" "}
                        {(
                          auctionAnalytics.totalAuctionRevenue ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Avg Sale Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        PKR{" "}
                        {(
                          auctionAnalytics.averageSalePrice ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Subscription Status Card - Only show if subscription tab is enabled */}
              {showSubscriptionTab && (
                <div className="bg-gradient-to-r from-primary-500 to-primary-500 rounded-lg shadow-sm border border-gray-200 p-6 text-white">
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
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                      <FiActivity className="text-white" size={24} />
                    </div>
                    <span className="text-2xl font-bold text-primary-500">
                      {auctionStats.totalAuctions}
                    </span>
                  </div>
                  <p className="text-sm text-primary-500 font-medium">
                    Total Auctions
                  </p>
                  <p className="text-xs text-primary-500 mt-1">
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
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FiActivity className="text-primary-500" size={20} />
                  </div>
                  Auction Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/auctions/token-payment"
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-lg transition-all bg-gradient-to-br from-emerald-50 to-emerald-100"
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
                    className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-lg transition-all bg-gradient-to-br from-primary-50 to-primary-100"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <FiActivity className="text-white" size={32} />
                      </div>
                      <h4 className="font-bold text-primary-500 text-lg mb-2">
                        Live Auctions
                      </h4>
                      <p className="text-sm text-primary-500">
                        View and participate in active auctions
                      </p>
                      <div className="flex items-center gap-1 mt-3 text-primary-500 group-hover:gap-2 transition-all">
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
                  <h3 className="text-lg font-semibold text-gray-900">
                    Won Auctions
                  </h3>
                  <Link
                    to="/auctions/transactions"
                    className="text-primary-500 hover:text-primary-500 font-medium"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {wonAuctions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">
                      No won auctions yet. Start bidding on live auctions!
                    </p>
                  ) : (
                    wonAuctions.slice(0, 3).map((item) => {
                      const car = item.car || {};
                      const img = Array.isArray(car.images)
                        ? car.images[0]
                        : car.images;
                      return (
                        <Link
                          key={item._id}
                          to={`/auctions/result?car_id=${item._id}`}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                              {img && (
                                <img
                                  src={img}
                                  alt={`${car.make} ${car.model}`}
                                  className="w-full h-full object-contain object-center"
                                />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {car.year} {car.make} {car.model}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Final: PKR {item.finalPrice?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded">
                            Won
                          </span>
                        </Link>
                      );
                    })
                  )}
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
                    className="text-primary-500 hover:text-primary-500 font-medium"
                  >
                    View Schedule
                  </Link>
                </div>
                <div className="space-y-3">
                  {liveAuction && (
                    <Link
                      to="/auctions/live"
                      className="block p-3 border border-red-200 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {liveAuction.title}
                        </span>
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded animate-pulse">
                          LIVE
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {liveAuction.totalCars || 0} cars •{" "}
                        {liveAuction.totalBids || 0} bids
                      </div>
                    </Link>
                  )}
                  {upcomingAuctions.length > 0
                    ? upcomingAuctions.slice(0, 3).map((a) => (
                        <div
                          key={a._id}
                          className="p-3 border border-gray-200 rounded-lg bg-blue-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">
                              {a.title}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              {a.totalCars || 0} Cars
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Starts:{" "}
                            {new Date(a.startTime).toLocaleDateString("en-PK", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      ))
                    : !liveAuction && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No upcoming auctions
                        </p>
                      )}
                </div>
              </div>

              {/* Auction Summary Cards */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-6">
                  <FiSettings className="text-primary-500" size={20} />
                  Auction Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link
                    to="/auctions/transactions"
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Won
                      </span>
                      <FiTrendingUp className="text-emerald-500" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {wonAuctions.length}
                    </p>
                    <p className="text-sm text-gray-600">Cars won at auction</p>
                  </Link>

                  <Link
                    to="/auctions/watchlist"
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Watchlist
                      </span>
                      <FiHeart className="text-red-400" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {watchlistItems.length}
                    </p>
                    <p className="text-sm text-gray-600">
                      Cars you're following
                    </p>
                  </Link>

                  <Link
                    to="/auctions/token-payment"
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Token
                      </span>
                      <FiCreditCard className="text-purple-500" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      PKR {auctionStats.tokenBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {auctionStats.hasVerifiedToken
                        ? "✓ Verified"
                        : "Not verified"}
                    </p>
                  </Link>

                  <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Status
                      </span>
                      <FiZap
                        className={
                          liveAuction ? "text-red-500" : "text-gray-400"
                        }
                        size={16}
                      />
                    </div>
                    {liveAuction ? (
                      <>
                        <p className="text-lg font-bold text-red-600 mb-1">
                          {liveAuction.title}
                        </p>
                        <Link
                          to="/auctions/live"
                          className="text-sm text-primary-500 font-medium"
                        >
                          Join Now →
                        </Link>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-gray-400 mb-1">
                          No Live Auction
                        </p>
                        <Link
                          to="/auctions/schedule"
                          className="text-sm text-primary-500 font-medium"
                        >
                          View Schedule →
                        </Link>
                      </>
                    )}
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
                  type="button"
                  onClick={closeAuctionModal}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Close"
                >
                  <FiXCircle size={24} />
                </button>
              </div>

              {/* Steps Indicator */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  {[
                    { num: 1, title: "Basic Info" },
                    { num: 2, title: "Photos" },
                    { num: 3, title: "Inspection" },
                    { num: 4, title: "Pricing" },
                  ].map((step, index) => (
                    <React.Fragment key={step.num}>
                      <div
                        className={`flex items-center gap-2 cursor-pointer ${currentStep >= step.num ? "text-primary-600" : "text-gray-400"}`}
                        onClick={() => setCurrentStep(step.num)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                            currentStep >= step.num
                              ? "bg-primary-500 text-white"
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
                          className={`flex-1 h-0.5 mx-2 transition-colors ${currentStep > step.num ? "bg-primary-500" : "bg-gray-200"}`}
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
                    <SearchableSelect
                      label="Make"
                      value={newCar.make}
                      onChange={(value) => updateAuctionForm("make", value)}
                      options={makes.map((make) => ({
                        value: make.name,
                        label: make.name,
                      }))}
                      placeholder={
                        auctionCategoryLoading ? "Loading makes..." : "Select make"
                      }
                      isLoading={auctionCategoryLoading}
                      required
                    />
                    <SearchableSelect
                      label="Model"
                      value={newCar.model}
                      onChange={(value) => updateAuctionForm("model", value)}
                      options={availableAuctionModels.map((model) => ({
                        value: model.name,
                        label: model.name,
                      }))}
                      placeholder={
                        newCar.make ? "Select model" : "Select make first"
                      }
                      disabled={!newCar.make}
                      isLoading={auctionCategoryLoading}
                      required
                    />
                    <SearchableSelect
                      label="Year"
                      value={newCar.year}
                      onChange={(value) => updateAuctionForm("year", value)}
                      options={years.map((year) => ({
                        value: year.name,
                        label: year.name,
                      }))}
                      placeholder={
                        auctionCategoryLoading ? "Loading years..." : "Select year"
                      }
                      isLoading={auctionCategoryLoading}
                      required
                    />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition *
                      </label>
                      <select
                        value={newCar.condition}
                        onChange={(e) => updateAuctionForm("condition", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                      >
                        <option value="Used">Used</option>
                        <option value="New">New</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fuel Type
                      </label>
                      <select
                        value={newCar.fuelType}
                        onChange={(e) => updateAuctionForm("fuelType", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Select fuel type</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transmission
                      </label>
                      <select
                        value={newCar.transmission}
                        onChange={(e) =>
                          updateAuctionForm("transmission", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Select transmission</option>
                        <option value="Automatic">Automatic</option>
                        <option value="Manual">Manual</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Exterior Color
                      </label>
                      <input
                        type="text"
                        value={newCar.colorExterior}
                        onChange={(e) =>
                          updateAuctionForm("colorExterior", e.target.value)
                        }
                        placeholder="e.g. White"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                      />
                    </div>
                    <SearchableSelect
                      label="Country"
                      value={newCar.country}
                      onChange={(value) => updateAuctionForm("country", value)}
                      options={countries.map((country) => ({
                        value: country.name,
                        label: country.name,
                      }))}
                      placeholder={
                        auctionCategoryLoading
                          ? "Loading countries..."
                          : "Select country"
                      }
                      isLoading={auctionCategoryLoading}
                    />
                    <SearchableSelect
                      label="State"
                      value={newCar.state}
                      onChange={(value) => updateAuctionForm("state", value)}
                      options={availableAuctionStates.map((state) => ({
                        value: state.name,
                        label: state.name,
                      }))}
                      placeholder={
                        newCar.country ? "Select state" : "Select country first"
                      }
                      disabled={!newCar.country}
                      isLoading={auctionCategoryLoading}
                    />
                    <SearchableSelect
                      label="City"
                      value={newCar.city}
                      onChange={(value) => updateAuctionForm("city", value)}
                      options={availableAuctionCities.map((city) => ({
                        value: city.name,
                        label: city.name,
                      }))}
                      placeholder={
                        newCar.country ? "Select city" : "Select country first"
                      }
                      disabled={!newCar.country}
                      isLoading={auctionCategoryLoading}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={newCar.location}
                        onChange={(e) =>
                          updateAuctionForm("location", e.target.value)
                        }
                        placeholder="Area, showroom, or auction pickup point"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
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
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        multiple
                        className="hidden"
                        onChange={handlePhotoSelect}
                      />
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => photoInputRef.current?.click()}
                        onKeyDown={(e) =>
                          e.key === "Enter" && photoInputRef.current?.click()
                        }
                        onDragOver={handlePhotoDragOver}
                        onDrop={handlePhotoDrop}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-primary-400 hover:bg-primary-50/30 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <FiPlus
                          className="mx-auto text-primary-500 mb-2"
                          size={32}
                        />
                        <p className="text-gray-700 font-medium">
                          Click to upload images
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG up to 10MB each
                        </p>
                        {(newCar.images?.length || 0) > 0 && (
                          <p className="text-sm text-primary-600 mt-2 font-medium">
                            {newCar.images?.length || 0} photo(s) added
                          </p>
                        )}
                      </div>
                      {(newCar.images?.length || 0) > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                          {(newCar.images || []).map((item, index) => (
                            <div
                              key={index}
                              className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-square group"
                            >
                              <img
                                src={item.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-contain object-center"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePhotoRemove(index);
                                }}
                                className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-90 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label="Remove photo"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {(newCar.images?.length || 0) > 0 &&
                        (newCar.images?.length || 0) < MIN_PHOTOS && (
                          <p className="text-sm text-primary-500 mt-2">
                            Add at least {MIN_PHOTOS} photos to continue.
                          </p>
                        )}
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
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none">
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
                        Select Auction *
                      </label>
                      <select
                        value={newCar.auctionId}
                        onChange={(e) =>
                          setNewCar({ ...newCar, auctionId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Select an auction</option>
                        {auctionOptions.map((a) => (
                          <option key={a._id} value={a._id}>
                            {a.title} ({a.status})
                          </option>
                        ))}
                      </select>
                      {auctionOptions.length === 0 && (
                        <p className="text-xs text-primary-600 mt-1">
                          No draft/scheduled/live auctions found. Ask admin to
                          create or activate an auction first.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Existing Listing (Optional)
                      </label>
                      <select
                        value={newCar.carId}
                        onChange={(e) =>
                          setNewCar((prev) => {
                            const selectedCar = cars.find(
                              (car) => car._id === e.target.value,
                            );
                            return {
                              ...prev,
                              carId: e.target.value,
                              startingBid: prev.startingBid
                                ? String(prev.startingBid)
                                : selectedCar?.price
                                  ? String(selectedCar.price)
                                  : "",
                            };
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                      >
                        <option value="">Select your car listing</option>
                        {cars
                          .filter((car) => !car?.isSold)
                          .map((car) => (
                            <option key={car._id} value={car._id}>
                              {car.year} {car.make} {car.model}
                            </option>
                          ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Or provide vehicle details in previous steps (Basic
                        Info, Photos, Inspection)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Starting Bid (PKR) *
                      </label>
                      <input
                        type="number"
                        value={newCar.startingBid}
                        onChange={(e) =>
                          updateAuctionForm("startingBid", e.target.value)
                        }
                        placeholder="e.g. 3000000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none text-lg"
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
                        value={newCar.reservePrice}
                        onChange={(e) =>
                          updateAuctionForm("reservePrice", e.target.value)
                        }
                        placeholder="Minimum price you'll accept"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
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
                        value={newCar.buyNowPrice}
                        onChange={(e) =>
                          updateAuctionForm("buyNowPrice", e.target.value)
                        }
                        placeholder="Instant purchase price"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none"
                      />
                      <p className="text-xs text-emerald-700 mt-2">
                        Allow buyers to skip bidding and purchase immediately at
                        this price (optional)
                      </p>
                    </div>

                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                      <label className="block text-sm font-medium text-primary-500 mb-2">
                        Inspection Report (PDF) *
                      </label>
                      <p className="text-xs text-primary-500 mb-2">
                        Upload the vehicle inspection report. Required for every
                        auction submission.
                      </p>
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setNewCar((prev) => ({
                            ...prev,
                            inspectionReportFile: file || null,
                          }));
                        }}
                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:font-medium hover:file:bg-primary-500"
                      />
                      {newCar.inspectionReportFile && (
                        <p className="text-xs text-emerald-700 mt-2">
                          Selected: {newCar.inspectionReportFile.name}
                        </p>
                      )}
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
                              newCar.startingBid || 0,
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 flex justify-between gap-3 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() =>
                    currentStep === 4
                      ? closeAuctionModal()
                      : currentStep > 1
                        ? setCurrentStep(currentStep - 1)
                        : closeAuctionModal()
                  }
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  {currentStep === 4
                    ? "Cancel"
                    : currentStep > 1
                      ? "Back"
                      : "Cancel"}
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={
                      (currentStep === 1 &&
                        (!newCar.make ||
                          !newCar.model ||
                          !newCar.year ||
                          !newCar.mileage ||
                          !newCar.condition)) ||
                      (currentStep === 2 &&
                        (newCar.images?.length || 0) < MIN_PHOTOS)
                    }
                    className="px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-colors"
                  >
                    Next
                    <FiChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitAuctionCar}
                    disabled={
                      isSubmittingAuctionCar ||
                      auctionOptions.length === 0 ||
                      !newCar.inspectionReportFile ||
                      !newCar.startingBid ||
                      !newCar.auctionId ||
                      (!newCar.carId &&
                        !(newCar.make && newCar.model && newCar.year))
                    }
                    className="px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isSubmittingAuctionCar
                      ? "Submitting..."
                      : "Submit for Approval"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default DealerDashboard;
