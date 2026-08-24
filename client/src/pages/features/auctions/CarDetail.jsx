import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  IoChevronBack as ChevronLeft,
  IoChevronForward as ChevronRight,
  IoLocationOutline as MapPin,
  IoSpeedometerOutline as Gauge,
  IoCalendarOutline as Calendar,
  IoWaterOutline as Fuel,
  IoSettingsOutline as Settings2,
  IoDocumentTextOutline as FileText,
  IoAlertCircleOutline as AlertTriangle,
  IoTimeOutline as Clock,
  IoCheckmarkCircleOutline as CheckCircle,
  IoCloseOutline as X,
  IoScanOutline as ZoomIn,
  IoCarSportOutline as Car,
  IoTrophyOutline as Award,
  IoInformationCircleOutline as Info,
  IoHeartOutline as Heart,
  IoHeartDislikeOutline as HeartOff,
  IoHammerOutline as Gavel,
  IoRefreshOutline as RefreshCw,
} from "react-icons/io5";
import {
  useGetAuctionCarDetailQuery,
  usePlaceBidMutation,
  useSetProxyBidMutation,
  useBuyNowMutation,
  useAddToAuctionWatchlistMutation,
  useRemoveFromAuctionWatchlistMutation,
  useGetMeQuery,
  useGetMyTokenPaymentsQuery,
  useGetMyAuctionAccessStatusQuery,
  useGetMyWalletQuery,
  useBookInspectionMutation,
  useGetInspectionTimeSlotsQuery,
  useCreateValuationMutation,
} from "@redux/services/api";
import { useSocket } from "@contexts/SocketContext";
import BidPriceChart from "@components/auction/BidPriceChart";
import SEO from "../../../components/common/SEO";
import StructuredData from "../../../components/common/StructuredData";
import { trackViewContent } from "../../../utils/metaPixel.js";

const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-slate-100 text-slate-900",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || ""} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const v = {
    default:
      "bg-primary-500 text-white hover:opacity-90 focus:ring-primary-500 shadow-lg shadow-primary-500/30",
    outline:
      "border-2 border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
  };
  const s = {
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    sm: "px-3 py-1.5 text-xs",
  };
  return (
    <button
      className={`${base} ${v[variant]} ${s[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const CountdownTimer = ({ targetDate }) => {
  const [time, setTime] = React.useState({ d: 0, h: 0, m: 0, s: 0 });
  React.useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = Math.max(0, new Date(targetDate) - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3">
      {[
        { v: time.d, l: "Days" },
        { v: time.h, l: "Hours" },
        { v: time.m, l: "Mins" },
        { v: time.s, l: "Secs" },
      ].map((t, i) => (
        <React.Fragment key={t.l}>
          <div className="w-12 sm:w-16 rounded-xl bg-[#101c35] border border-white/10 py-2 text-center">
            <div className="text-base sm:text-xl font-bold text-white">{pad(t.v)}</div>
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wide text-slate-300">
              {t.l}
            </div>
          </div>
          {i < 3 && <span className="text-slate-400 font-semibold text-xs sm:text-base">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

const formatPrice = (p) => `PKR ${p?.toLocaleString() || 0}`;

export default function CarDetail() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showProxyBidForm, setShowProxyBidForm] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionDate, setInspectionDate] = useState("");
  const [inspectionTimeSlot, setInspectionTimeSlot] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [proxyMax, setProxyMax] = useState(0);
  const [activeTab, setActiveTab] = useState("specs");
  const [valuationResult, setValuationResult] = useState(null);
  const viewContentTrackedId = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const auctionCarId = new URLSearchParams(location.search).get("id");

  const token = localStorage.getItem("token");
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const isLoggedIn = !!user;
  const { data: tokenData } = useGetMyTokenPaymentsQuery(undefined, {
    skip: !isLoggedIn,
  });
  const { data: auctionAccess } = useGetMyAuctionAccessStatusQuery(undefined, {
    skip: !isLoggedIn,
  });
  const { data: walletData } = useGetMyWalletQuery(undefined, {
    skip: !isLoggedIn,
  });
  const hasVerifiedToken = tokenData?.hasVerifiedToken || false;
  const bidderStatus =
    auctionAccess?.auctionCapabilities?.auctionBidder?.status ||
    "not_requested";
  const dealerStatus =
    auctionAccess?.auctionCapabilities?.auctionDealer?.status ||
    "not_requested";
  const hasAuctionAccess =
    bidderStatus === "approved" || dealerStatus === "approved";
  const { data: detail, refetch } = useGetAuctionCarDetailQuery(auctionCarId, {
    skip: !auctionCarId,
    pollingInterval: 10000,
  });
  const [placeBidMut, { isLoading: bidding }] = usePlaceBidMutation();
  const [setProxyBidMut] = useSetProxyBidMutation();
  const [buyNowMut, { isLoading: buying }] = useBuyNowMutation();
  const [addWatch] = useAddToAuctionWatchlistMutation();
  const [removeWatch] = useRemoveFromAuctionWatchlistMutation();
  const [bookInspectionMut, { isLoading: bookingInspection }] =
    useBookInspectionMutation();
  const [createValuationMut, { isLoading: valuating }] =
    useCreateValuationMutation();
  const { data: timeSlots = [] } = useGetInspectionTimeSlotsQuery();

  const car = detail?.car || {};
  const auction = detail?.auction || {};
  const bids = detail?.bids || [];
  const currentHigh = detail?.currentBid || detail?.startingBid || 0;
  const minIncrement = detail?.bidIncrement || 50000;
  const minimumBid = detail?.minimumNextBid ?? currentHigh + minIncrement;
  const quickBidSuggestions = Array.isArray(detail?.quickBidSuggestions)
    ? detail.quickBidSuggestions
    : [
        minimumBid,
        minimumBid + minIncrement,
        minimumBid + minIncrement * 2,
        minimumBid + minIncrement * 3,
      ];
  const totalBidders = detail?.totalBidders ?? 0;
  const buyNowPrice =
    detail?.buyNowPrice != null ? Number(detail.buyNowPrice) : null;
  const walletBalance = walletData?.wallet?.balance || 0;
  const canPlaceBid = hasVerifiedToken;
  const isAuctionEnded =
    detail?.status === "sold" ||
    (auction?.endTime && new Date(auction.endTime) <= new Date());
  const canBuyNow =
    auction?.status === "live" &&
    buyNowPrice > 0 &&
    detail?.status !== "sold" &&
    hasAuctionAccess &&
    hasVerifiedToken &&
    walletBalance >= buyNowPrice;
  const pageTitle =
    car?.title || (car?.make && car?.model
      ? `${car.year || ""} ${car.make} ${car.model} Auction Details | Sello.pk`
      : "Auction Car Details | Sello.pk");
  const pageDescription =
    car?.make && car?.model
      ? `View auction details for the ${car.year || ""} ${car.make} ${car.model} on Sello.pk. Check bidding activity, inspection info, pricing, and vehicle specifications before you bid.`
      : "View auction car details on Sello.pk including current bid, inspection information, pricing, and vehicle specifications before placing your bid.";
  const canonicalUrl = `https://sello.pk${location.pathname}${location.search}`;

  useEffect(() => {
    const c = detail?.car;
    if (!detail || !c?._id || !auctionCarId) return;
    const key = `${auctionCarId}|${c._id}`;
    if (viewContentTrackedId.current === key) return;
    viewContentTrackedId.current = key;
    trackViewContent({
      ...c,
      price: detail?.currentBid ?? detail?.startingBid ?? c.price,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per auction car; detail identity updates on poll; ref key blocks dupes
  }, [detail, auctionCarId, detail?.car?._id]);

  useEffect(() => {
    setBidAmount(currentHigh + minIncrement);
  }, [currentHigh, minIncrement]);
  useEffect(() => {
    setProxyMax(currentHigh + 200000);
  }, [currentHigh]);

  // Real-time
  const { socket, addEventListener, removeEventListener } = useSocket();
  useEffect(() => {
    if (!auction?._id || !socket) return;
    socket.emit("join-auction", auction._id);
    return () => {
      socket.emit("leave-auction", auction._id);
    };
  }, [auction?._id, socket]);

  const handleNewBid = useCallback(
    (data) => {
      if (data.auctionCarId === auctionCarId) refetch();
    },
    [auctionCarId, refetch],
  );

  useEffect(() => {
    if (!addEventListener) return;
    addEventListener("new-bid", handleNewBid);
    return () => {
      removeEventListener("new-bid", handleNewBid);
    };
  }, [addEventListener, removeEventListener, handleNewBid]);

  const handleAuctionExtended = useCallback(
    (data) => {
      if (data?.auctionId === auction?._id) {
        toast("Auction extended by 2 minutes", { icon: "⏱️" });
        refetch();
      }
    },
    [auction?._id, refetch],
  );
  const handleOutbid = useCallback(
    (data) => {
      if (data?.auctionCarId === auctionCarId) {
        toast("You were outbid", { icon: "🔔" });
        refetch();
      }
    },
    [auctionCarId, refetch],
  );
  const handleWon = useCallback(
    (data) => {
      if (data?.auctionCarId === auctionCarId) {
        toast.success("You won this lot!");
        navigate(`/auctions/result?car_id=${auctionCarId}`, { replace: true });
      }
    },
    [auctionCarId, navigate],
  );

  useEffect(() => {
    if (!addEventListener) return;
    addEventListener("auction:extended", handleAuctionExtended);
    addEventListener("auction:outbid", handleOutbid);
    addEventListener("auction:won", handleWon);
    return () => {
      removeEventListener("auction:extended", handleAuctionExtended);
      removeEventListener("auction:outbid", handleOutbid);
      removeEventListener("auction:won", handleWon);
    };
  }, [
    addEventListener,
    removeEventListener,
    handleAuctionExtended,
    handleOutbid,
    handleWon,
  ]);

  const handleBuyNow = async () => {
    try {
      await buyNowMut({ auctionCarId }).unwrap();
      toast.success("Buy now successful! You have won this lot.");
      navigate(`/auctions/result?car_id=${auctionCarId}`, { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || "Buy now failed");
    }
  };

  const handlePlaceBid = async () => {
    try {
      await placeBidMut({ auctionCarId, amount: bidAmount }).unwrap();
      toast.success("Bid placed successfully!");
      refetch();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to place bid");
    }
  };

  const handleProxyBid = async () => {
    try {
      await setProxyBidMut({ auctionCarId, maxAmount: proxyMax }).unwrap();
      toast.success("Proxy bid set!");
      setShowProxyBidForm(false);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to set proxy bid");
    }
  };

  const handleGetValuation = async () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      toast.error("Please login to get car valuation");
      navigate("/login");
      return;
    }

    try {
      const payload = {
        make: car.make,
        model: car.model,
        year: car.year,
        mileage: car.mileage || 0,
        engineType: car.fuelType || "Petrol",
        transmission: car.transmission || "Automatic",
        condition: car.condition || "good",
      };
      const valuation = await createValuationMut(payload).unwrap();
      const estimate =
        valuation?.estimation?.estimatedValue ||
        valuation?.estimation?.averagePrice ||
        valuation?.estimation?.averageValue ||
        valuation?.estimation?.price ||
        null;
      setValuationResult(estimate);
      toast.success("Valuation generated");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to generate valuation");
    }
  };

  const toggleFollow = async () => {
    try {
      if (isFollowing) {
        await removeWatch(auctionCarId).unwrap();
        setIsFollowing(false);
      } else {
        await addWatch({ auctionCarId }).unwrap();
        setIsFollowing(true);
      }
    } catch {
      /* ignore */
    }
  };

  const images = Array.isArray(car.images)
    ? car.images
    : [car.images].filter(Boolean);
  const inspection = detail?.inspectionReport || {};
  const inspColors = {
    pass: "bg-emerald-100 text-emerald-700 border-emerald-200",
    minor_issues: "bg-amber-100 text-amber-700 border-amber-200",
    major_issues: "bg-red-100 text-red-700 border-red-200",
  };

  const specs = [
    { label: "Make", value: car.make, icon: Car },
    { label: "Model", value: car.model, icon: Award },
    { label: "Year", value: car.year, icon: Calendar },
    {
      label: "Mileage",
      value: `${car.mileage?.toLocaleString() || 0} km`,
      icon: Gauge,
    },
    { label: "Engine", value: car.fuelType, icon: Fuel },
    { label: "Transmission", value: car.transmission, icon: Settings2 },
    { label: "Color", value: car.colorExterior, icon: Info },
    { label: "Registration", value: car.registrationCity, icon: FileText },
  ];
  const conditionLabel =
    car.condition?.replaceAll("_", " ") ||
    detail?.condition?.replaceAll("_", " ") ||
    "Verified Condition";
  const auctionLocation = auction.location || "Okara Auction Yard";
  const quickLinks = [
    { id: "overview", label: "Home" },
    { id: "bidding", label: "Live Auction" },
    { id: "specifications", label: "Schedule" },
    { id: "inspection", label: "Trust & Legal" },
  ];
  const reserveMet = detail?.reservePrice
    ? currentHigh >= detail.reservePrice
    : false;

  if (!detail) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={pageTitle.replace(/\s+/g, " ").trim()}
        description={pageDescription.replace(/\s+/g, " ").trim()}
        canonical={canonicalUrl}
      />
      <StructuredData.AuctionEventSchema auction={auction} car={car} />
      <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/25">
              <Gavel className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-tight break-words">
                {auctionLocation.split(" ").slice(0, 2).join(" ") ||
                  "Okara Auto"}{" "}
                <span className="text-primary-500">Auction</span>
              </p>
              <p className="text-xs sm:text-sm text-slate-500 truncate">
                {auction.title || "Premium live bidding"}
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-8 lg:flex">
            {quickLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() =>
                  document.getElementById(link.id)?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky top-14 sm:top-16 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-[1320px] px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/auctions/live"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Auction
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1320px] px-4 py-8 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="grid gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.95fr)] min-w-0">
          {/* Left */}
          <div className="space-y-7 min-w-0">
            {/* Gallery */}
            <div
              id="overview"
              className="bg-white rounded-[28px] overflow-hidden border border-slate-200 shadow-[0_18px_48px_rgba(15,23,42,0.08)] max-w-full"
            >
              <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-100 w-full overflow-hidden">
                {images[currentImageIndex] && (
                  <img
                    src={images[currentImageIndex]}
                    alt={`${car.make} ${car.model}`}
                    className="block w-full h-full object-cover max-w-full"
                  />
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((p) =>
                          p > 0 ? p - 1 : images.length - 1,
                        )
                      }
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((p) =>
                          p < images.length - 1 ? p + 1 : 0,
                        )
                      }
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowGallery(true)}
                  className="absolute right-2 sm:right-4 bottom-2 sm:bottom-4 px-3 sm:px-5 py-2 sm:py-3 bg-white/95 text-slate-900 rounded-xl sm:rounded-2xl flex items-center gap-2 text-xs sm:text-sm font-semibold hover:bg-white border border-slate-200 shadow-sm"
                >
                  <ZoomIn className="w-4 h-4" />
                  View All Photos
                </button>
                <div className="absolute left-2 sm:left-4 bottom-2 sm:bottom-4">
                  <Badge className="bg-slate-900/85 text-white border border-white/20 backdrop-blur-sm shadow-lg px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                    <MapPin className="w-3 h-3 mr-1 text-amber-300" />
                    {auction.location || "Okara Auction Yard"}
                  </Badge>
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4 sm:p-5 flex gap-2 sm:gap-3 overflow-x-auto overscroll-x-contain max-w-full">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-20 h-14 sm:w-24 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${currentImageIndex === i ? "border-primary-500 shadow-[0_0_0_4px_rgba(245,158,11,0.14)]" : "border-transparent opacity-75 hover:opacity-100"}`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="bg-white rounded-[28px] p-5 sm:p-7 border border-slate-200 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-2 break-words">
                    {car.title || `${car.year} ${car.make} ${car.model}`}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-base text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Gauge className="w-4 h-4" />
                      {car.mileage?.toLocaleString()} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="w-4 h-4" />
                      {car.fuelType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Settings2 className="w-4 h-4" />
                      {car.transmission}
                    </span>
                  </div>
                </div>
                <div className="inline-flex h-fit rounded-2xl bg-emerald-100 px-4 py-2 text-base font-semibold text-emerald-700 shadow-sm">
                  {conditionLabel}
                </div>
              </div>
              {detail.reservePrice && (
                <div
                  className={`rounded-2xl p-4 ${reserveMet ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}
                >
                  <div className="flex items-center gap-2">
                    {reserveMet ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-emerald-700">
                          Reserve price met
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-amber-700">
                          Reserve not yet met
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              id="specifications"
              className="bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-200 bg-slate-50/70">
                {[
                  { id: "specs", label: "Specifications" },
                  { id: "inspection", label: "Inspection Report" },
                  { id: "chart", label: "Price Chart" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-3 sm:py-4 text-sm font-semibold transition ${
                      activeTab === tab.id
                        ? "bg-white text-slate-900"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "specs" && (
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {specs.map((spec, i) => (
                      <div key={i} className="bg-slate-50 rounded-3xl p-5">
                        <spec.icon className="w-6 h-6 text-primary-500 mb-3" />
                        <p className="text-sm text-slate-500 mb-1">
                          {spec.label}
                        </p>
                        <p className="text-lg font-semibold text-slate-900 capitalize">
                          {spec.value || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "inspection" && (
                <div id="inspection" className="p-4 sm:p-6">
                  {detail?.inspectionReportPdfUrl && (
                    <a
                      href={detail.inspectionReportPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-amber-50 text-amber-800 rounded-lg hover:bg-amber-100 font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      Download inspection report (PDF)
                    </a>
                  )}
                  {Object.keys(inspection).some(
                    (k) => k !== "notes" && inspection[k],
                  ) ? (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {Object.entries(inspection)
                          .filter(([k]) => k !== "notes" && k !== "_id")
                          .map(
                            ([key, val]) =>
                              val && (
                                <div key={key} className="text-center">
                                  <div
                                    className={`rounded-xl p-4 border ${inspColors[val] || ""}`}
                                  >
                                    {val === "pass" ? (
                                      <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                                    ) : (
                                      <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                    )}
                                    <p className="text-xs uppercase tracking-wide mb-1">
                                      {key}
                                    </p>
                                    <p className="font-semibold capitalize">
                                      {val.replace("_", " ")}
                                    </p>
                                  </div>
                                </div>
                              ),
                          )}
                      </div>
                      {inspection.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                          <Info className="w-4 h-4 inline mr-1" />
                          {inspection.notes}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-sm text-slate-500">
                      Inspection report not available.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chart" && (
                <div className="p-4 sm:p-6">
                  <BidPriceChart
                    bids={
                      Array.isArray(detail?.priceChart) &&
                      detail.priceChart.length > 0
                        ? detail.priceChart.map((p) => ({
                            amount: p.amount,
                            createdAt: p.at || p.createdAt,
                          }))
                        : bids
                    }
                    carLabel={`${car?.make || ""} ${car?.model || ""}`.trim()}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            {isLoggedIn && (
              <div className="bg-white rounded-[28px] p-6 border border-slate-200 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                <div className="grid sm:grid-cols-2 gap-3">
                  {auctionCarId &&
                    (auction?.status === "live" ||
                      detail?.status === "approved" ||
                      detail?.status === "live") && (
                      <Button
                        variant="outline"
                        className="w-full border-primary-500 text-primary-500 hover:bg-primary-500/10"
                        onClick={() => setShowInspectionModal(true)}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Physical Inspection
                      </Button>
                    )}
                  <Button
                    variant="outline"
                    className={`w-full ${isFollowing ? "bg-red-50 border-red-300 text-red-600" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
                    onClick={toggleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <HeartOff className="w-5 h-5 mr-2" />
                        Unfollow Car
                      </>
                    ) : (
                      <>
                        <Heart className="w-5 h-5 mr-2" />
                        Follow Car
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
              <Clock className="w-4 h-4 inline mr-1" />
              <strong>Important:</strong> Winning bidder must complete payment
              within 24-48 hours and collect the vehicle from {auctionLocation}.
            </div>
          </div>

          {/* Right - Merged Bid Panel */}
          <div>
            <div className="lg:sticky lg:top-24 space-y-4">
              {/* ✅ Merged Timer + Bid Panel */}
              <div
                id="bidding"
                className="bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-[0_18px_48px_rgba(15,23,42,0.08)]"
              >
                {/* Dark Header: Timer + Live Bidding + Current Bid + Meta */}
                <div className="bg-slate-900 p-4 sm:p-5">
                  {/* Timer Row */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                    <p className="text-slate-400 text-xs uppercase tracking-widest">
                      Ends in
                    </p>
                    <CountdownTimer targetDate={auction.endTime} />
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-700 mb-4" />

                  {/* Live Bidding Label + Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-2 text-base font-semibold text-white">
                      <Gavel className="h-4 w-4 text-primary-500" />
                      Live Bidding
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs text-emerald-300">
                      <RefreshCw className="h-3 w-3" />
                      {auction.status === "live"
                        ? "Auto-updating"
                        : auction.status}
                    </span>
                  </div>

                  {/* Current Highest Bid */}
                  <div className="bg-white/10 rounded-[16px] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider">
                        Current Highest Bid
                      </span>
                      <p className="text-3xl font-black tracking-tight text-white mt-1">
                        {formatPrice(currentHigh)}
                      </p>
                    </div>
                    {totalBidders > 0 && (
                      <span className="text-xs text-slate-400 bg-white/10 rounded-full px-3 py-1">
                        {totalBidders} bidder{totalBidders !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-3">
                    <p className="text-xs text-slate-400">
                      Min:{" "}
                      <span className="font-semibold text-slate-200">
                        {formatPrice(minimumBid)}
                      </span>
                    </p>
                    {detail.reservePrice && (
                      <p className="text-xs text-slate-400">
                        Reserve:{" "}
                        <span className="font-semibold text-slate-200">
                          {formatPrice(detail.reservePrice)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* White Body: Recent Bids + Bidding Controls */}
                <div className="p-5">
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Recent Bids
                  </p>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4 pr-1">
                    {bids.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">
                        No bids yet. Be the first!
                      </p>
                    )}
                    {bids.slice(0, 8).map((bid, i) => (
                      <div
                        key={bid._id || i}
                        className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 ${i === 0 ? "border-primary-200 bg-primary-50" : "border-slate-100 bg-slate-50/70"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${bid.bidType === "offline" ? "bg-primary-100 text-primary-500" : "bg-slate-100 text-slate-600"}`}
                          >
                            {bid.bidType === "offline" ? (
                              <FileText className="h-3 w-3" />
                            ) : (
                              <MapPin className="h-3 w-3" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 leading-tight">
                              {bid.bidType === "offline"
                                ? "Floor Bid"
                                : bid.bidderName ||
                                  bid.bidder?.name ||
                                  "Anonymous"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(bid.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-primary-500">
                            {formatPrice(bid.amount)}
                          </p>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            {bid.bidType === "offline"
                              ? "offline"
                              : bid.isProxy
                                ? "auto"
                                : "online"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Auction Ended */}
                  {isAuctionEnded && (
                    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 text-center">
                      <p className="font-medium text-slate-700">
                        {detail?.status === "sold"
                          ? "This lot has been sold"
                          : "Auction has ended"}
                      </p>
                    </div>
                  )}

                  {/* Active Bidding Controls */}
                  {auction.status === "live" && !isAuctionEnded && (
                    <div className="space-y-3">
                      {!isLoggedIn ? (
                        <Button
                          className="w-full"
                          onClick={() => navigate("/login")}
                        >
                          Login to Place Bid
                        </Button>
                      ) : !hasAuctionAccess ? (
                        <div className="space-y-2">
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700 text-center">
                            Auction access approval required (status:{" "}
                            {bidderStatus.replaceAll("_", " ")}).
                          </div>
                          <Button
                            className="w-full"
                            onClick={() =>
                              navigate("/profile?section=auction-access")
                            }
                          >
                            Request Auction Access
                          </Button>
                        </div>
                      ) : !canPlaceBid ? (
                        <div className="space-y-3">
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-700 text-center">
                            {!hasVerifiedToken
                              ? "Your token payment must be verified by admin before you can bid."
                              : "Your verified token gives you access to place bids in this auction."}
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => navigate("/auctions/token-payment")}
                          >
                            {hasVerifiedToken
                              ? "Token Verified"
                              : "Complete Token Verification"}
                          </Button>
                          <p className="text-xs text-slate-500 text-center">
                            Token verification is mandatory for bidding access.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            {quickBidSuggestions
                              .slice(0, 4)
                              .map((amount, idx) => (
                                <button
                                  key={`${amount}-${idx}`}
                                  type="button"
                                  onClick={() => setBidAmount(Number(amount))}
                                  className={`rounded-2xl border px-3 py-2.5 text-sm font-semibold transition ${
                                    Number(bidAmount) === Number(amount)
                                      ? "border-primary-500 bg-primary-50 text-primary-500"
                                      : "border-slate-200 hover:border-primary-500 text-slate-700"
                                  }`}
                                >
                                  {formatPrice(Number(amount))}
                                </button>
                              ))}
                          </div>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                                PKR
                              </span>
                              <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) =>
                                  setBidAmount(Number(e.target.value))
                                }
                                className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                step="50000"
                                min={minimumBid}
                                placeholder={String(minimumBid)}
                              />
                            </div>
                            <Button
                              onClick={handlePlaceBid}
                              disabled={bidding || bidAmount < minimumBid}
                              className="px-5 rounded-2xl bg-primary-500 hover:opacity-90 shadow-lg shadow-primary-500/25"
                            >
                              {bidding ? "..." : "Bid Now"}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 text-center">
                            Minimum next bid: {formatPrice(minimumBid)}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* ✅ End Merged Panel */}

              {/* Buy Now */}
              {canBuyNow && (
                <div className="mt-4">
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg"
                    onClick={handleBuyNow}
                    disabled={buying}
                  >
                    {buying
                      ? "Processing..."
                      : `Buy Now - ${formatPrice(buyNowPrice)}`}
                  </Button>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    Purchase this lot immediately at the buy-now price
                  </p>
                </div>
              )}

              {/* Proxy Bid */}
              {isLoggedIn &&
                hasAuctionAccess &&
                canPlaceBid &&
                auction.status === "live" &&
                !isAuctionEnded && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full border-primary-500 text-primary-500 hover:bg-primary-500/10"
                      onClick={() => setShowProxyBidForm(true)}
                    >
                      Set Proxy Bid (Auto-Bid)
                    </Button>
                  </div>
                )}

              {/* AI Valuation */}
              <div className="mt-6 bg-white rounded-[28px] border border-slate-200 p-5 sm:p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  AI Market Valuation
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Get an AI-powered market valuation estimate
                </p>
                {valuationResult ? (
                  <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                    <p className="text-sm text-emerald-700">
                      Estimated market value
                    </p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatPrice(Number(valuationResult))}
                    </p>
                  </div>
                ) : null}
                <Button
                  className="w-full"
                  onClick={handleGetValuation}
                  disabled={valuating}
                >
                  <Info className="w-4 h-4 mr-2" />
                  {valuating ? "Getting valuation..." : "Get Valuation"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proxy Bid Modal */}
      {showProxyBidForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">
                Set Proxy Bid
              </h3>
              <button
                onClick={() => setShowProxyBidForm(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600 mb-4">
              Set maximum amount you're willing to bid. We'll bid automatically
              up to this amount.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 mb-1 block">
                  Maximum Bid Amount
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  value={proxyMax}
                  onChange={(e) => setProxyMax(Number(e.target.value))}
                  min={currentHigh + 50000}
                  step="50000"
                />
              </div>
              <Button className="w-full" onClick={handleProxyBid}>
                Set Proxy Bid
              </Button>
              <p className="text-xs text-slate-500 text-center">
                You'll be notified if you're outbid
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Book Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-500" />
                Book Physical Inspection
              </h3>
              <button
                onClick={() => setShowInspectionModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Schedule a visit to Okara Auction Yard to inspect this vehicle.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Date *
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Time slot *
                </label>
                <select
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  value={inspectionTimeSlot}
                  onChange={(e) => setInspectionTimeSlot(e.target.value)}
                >
                  <option value="">Select time</option>
                  {(Array.isArray(timeSlots)
                    ? timeSlots
                    : [
                        "09:00 AM",
                        "10:00 AM",
                        "11:00 AM",
                        "12:00 PM",
                        "02:00 PM",
                        "03:00 PM",
                        "04:00 PM",
                        "05:00 PM",
                      ]
                  ).map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">
                  Notes (optional)
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg resize-none"
                  rows={2}
                  value={inspectionNotes}
                  onChange={(e) => setInspectionNotes(e.target.value)}
                  placeholder="Any special requests"
                />
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Okara Auction Yard, Punjab
              </p>
              <Button
                className="w-full"
                disabled={
                  !inspectionDate || !inspectionTimeSlot || bookingInspection
                }
                onClick={async () => {
                  try {
                    await bookInspectionMut({
                      auctionCarId,
                      inspectionDate: new Date(inspectionDate).toISOString(),
                      timeSlot: inspectionTimeSlot,
                      notes: inspectionNotes,
                    }).unwrap();
                    toast.success("Inspection booked. We'll confirm shortly.");
                    setShowInspectionModal(false);
                    setInspectionDate("");
                    setInspectionTimeSlot("");
                    setInspectionNotes("");
                  } catch (e) {
                    toast.error(
                      e?.data?.message || "Failed to book inspection",
                    );
                  }
                }}
              >
                {bookingInspection ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Gallery */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            {images[currentImageIndex] && (
              <img
                src={images[currentImageIndex]}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImageIndex((p) =>
                      p > 0 ? p - 1 : images.length - 1,
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex((p) =>
                      p < images.length - 1 ? p + 1 : 0,
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}
