import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  IoFlashOutline as Zap,
} from "react-icons/io5";
import {
  useGetAuctionCarDetailQuery,
  usePlaceBidMutation,
  useSetProxyBidMutation,
  useAddToAuctionWatchlistMutation,
  useRemoveFromAuctionWatchlistMutation,
  useGetMeQuery,
  useGetMyTokenPaymentsQuery,
  useGetMyAuctionAccessStatusQuery,
  useGetMyWalletQuery,
} from "@redux/services/api";
import { useSocket } from "@contexts/SocketContext";

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
      "bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] focus:ring-[#FFA602] shadow-lg shadow-[#FFA602]/30",
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

const CountdownTimer = ({ targetDate, size = "default" }) => {
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
    <div
      className={`flex items-center justify-center gap-2 ${size === "large" ? "text-3xl" : "text-2xl"} font-bold text-white`}
    >
      {[
        { v: time.d, l: "Days" },
        { v: time.h, l: "Hours" },
        { v: time.m, l: "Mins" },
      ].map((t, i) => (
        <React.Fragment key={t.l}>
          {i > 0 && <span>:</span>}
          <div className="text-center">
            <span>{pad(t.v)}</span>
            <span className="block text-xs font-normal text-slate-400">
              {t.l}
            </span>
          </div>
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
  const [isFollowing, setIsFollowing] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [proxyMax, setProxyMax] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const auctionCarId = new URLSearchParams(location.search).get("id");

  const { data: user } = useGetMeQuery();
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
  const [addWatch] = useAddToAuctionWatchlistMutation();
  const [removeWatch] = useRemoveFromAuctionWatchlistMutation();

  const car = detail?.car || {};
  const auction = detail?.auction || {};
  const bids = detail?.bids || [];
  const currentHigh = detail?.currentBid || detail?.startingBid || 0;
  const minimumBid = currentHigh + 50000;
  const walletBalance = walletData?.wallet?.balance || 0;
  const hasWalletFundsForBid = walletBalance >= minimumBid;
  const canPlaceBid = hasVerifiedToken || hasWalletFundsForBid;

  useEffect(() => {
    setBidAmount(currentHigh + 50000);
  }, [currentHigh]);
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

  if (!detail) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Link
            to="/auctions/live"
            className="inline-flex items-center text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Auction
          </Link>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left */}
          <div className="lg:col-span-3 space-y-6">
            {/* Gallery */}
            <div className="bg-white rounded-2xl overflow-hidden border border-slate-200">
              <div className="relative aspect-[16/10] bg-slate-100">
                {images[currentImageIndex] && (
                  <img
                    src={images[currentImageIndex]}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((p) =>
                          p < images.length - 1 ? p + 1 : 0,
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowGallery(true)}
                  className="absolute right-4 bottom-4 px-4 py-2 bg-white/90 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-white"
                >
                  <ZoomIn className="w-4 h-4" />
                  View All Photos
                </button>
                <div className="absolute left-4 bottom-4">
                  <Badge className="bg-black/70 text-white border-0 backdrop-blur">
                    <MapPin className="w-3 h-3 mr-1" />
                    {auction.location || "Okara Auction Yard"}
                  </Badge>
                </div>
              </div>
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${currentImageIndex === i ? "border-[#FFA602]" : "border-transparent"}`}
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
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {car.year} {car.make} {car.model}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
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
              {detail.reservePrice && (
                <div
                  className={`rounded-xl p-4 ${currentHigh >= detail.reservePrice ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"}`}
                >
                  <div className="flex items-center gap-2">
                    {currentHigh >= detail.reservePrice ? (
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

            {/* Specs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4">Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {specs.map((spec, i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-4">
                    <spec.icon className="w-5 h-5 text-[#FFA602] mb-2" />
                    <p className="text-xs text-slate-500 mb-1">{spec.label}</p>
                    <p className="font-semibold text-slate-900 capitalize">
                      {spec.value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Inspection */}
            {Object.keys(inspection).some(
              (k) => k !== "notes" && inspection[k],
            ) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Inspection Report
                </h3>
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
              </div>
            )}

            {/* Actions */}
            {isLoggedIn && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    className={`flex-1 ${isFollowing ? "bg-red-50 border-red-300 text-red-600" : "border-[#FFA602] text-[#FFA602] hover:bg-[#FFA602]/10"}`}
                    onClick={toggleFollow}
                  >
                    {isFollowing ? (
                      <>
                        <HeartOff className="w-5 h-5 mr-2" />
                        Unfollow
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
          </div>

          {/* Right — Bid Panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-20">
              {/* Timer */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 mb-6 text-center">
                <p className="text-slate-400 text-sm mb-3">Auction ends in</p>
                <CountdownTimer targetDate={auction.endTime} />
              </div>

              {/* Bid Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-500">Current Bid</span>
                    <Badge className="bg-emerald-100 text-emerald-700">
                      {auction.status === "live" ? "Live" : auction.status}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-slate-900 mb-2">
                    {formatPrice(currentHigh)}
                  </p>
                  {detail.reservePrice && (
                    <p className="text-sm text-slate-500">
                      Reserve: {formatPrice(detail.reservePrice)}
                    </p>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium text-slate-700 mb-3">
                    Recent Bids
                  </p>
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                    {bids.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">
                        No bids yet. Be the first!
                      </p>
                    )}
                    {bids.slice(0, 8).map((bid, i) => (
                      <div
                        key={bid._id || i}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {bid.bidderName || bid.bidder?.name || "Anonymous"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(bid.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[#FFA602]">
                            {formatPrice(bid.amount)}
                          </p>
                          <Badge
                            variant="default"
                            className="text-xs bg-slate-100"
                          >
                            {bid.bidType === "offline"
                              ? "Floor"
                              : bid.isProxy
                                ? "Auto"
                                : "Online"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>

                  {auction.status === "live" && (
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
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 text-center">
                            Auction access approval is required before bidding
                            (status: {bidderStatus.replaceAll("_", " ")}).
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => navigate("/profile")}
                          >
                            Request Auction Access
                          </Button>
                        </div>
                      ) : !canPlaceBid ? (
                        <div className="space-y-2">
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 text-center">
                            Add funds to your wallet or pay the refundable PKR
                            10,000 token to start bidding
                          </div>
                          <Button
                            className="w-full"
                            onClick={() => navigate("/auctions/token-payment")}
                          >
                            Add Funds / Pay Token
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) =>
                                setBidAmount(Number(e.target.value))
                              }
                              className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA602]"
                              step="50000"
                              min={minimumBid}
                            />
                            <Button
                              onClick={handlePlaceBid}
                              disabled={bidding || bidAmount < minimumBid}
                              className="px-6"
                            >
                              {bidding ? "..." : "Place Bid"}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500 text-center">
                            Minimum increment: PKR 50,000
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Proxy Bid */}
              {isLoggedIn &&
                hasAuctionAccess &&
                canPlaceBid &&
                auction.status === "live" && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full border-[#FFA602] text-[#FFA602] hover:bg-[#FFA602]/10"
                      onClick={() => setShowProxyBidForm(true)}
                    >
                      Set Proxy Bid (Auto-Bid)
                    </Button>
                  </div>
                )}
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
  );
}
