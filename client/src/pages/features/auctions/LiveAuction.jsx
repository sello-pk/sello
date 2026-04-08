import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  IoSearch as Search,
  IoGridOutline as Grid3X3,
  IoListOutline as List,
  IoLocationOutline as MapPin,
  IoFlashOutline as Zap,
  IoCarSportOutline as Car,
  IoTimeOutline as Clock,
  IoRefreshOutline as RefreshCw,
  IoCloseOutline as X,
  IoChevronDownOutline as ChevronDown,
} from "react-icons/io5";
import { GiGavel as Gavel } from "react-icons/gi";
import {
  useGetLiveAuctionQuery,
  useGetAuctionCarsQuery,
  useGetAuctionsQuery,
} from "@redux/services/api";
import { useSocket } from "@contexts/SocketContext";
import { useCarCategories } from "@hooks/useCarCategories";
import SearchableSelect from "@components/common/SearchableSelect";
import LiveAuctionUpdates from "@components/auction/LiveAuctionUpdates";
import AuctionSavedSearches from "@components/auction/AuctionSavedSearches";
import SEO from "../../../components/common/SEO";

// Shared tiny components

const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-slate-100 text-slate-900",
    secondary: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-600",
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
    "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
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

const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA602] focus:border-transparent transition-all ${className}`}
    {...props}
  />
);

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
    <div className="flex items-center gap-2 text-sm">
      {[
        { v: time.d, l: "d" },
        { v: time.h, l: "h" },
        { v: time.m, l: "m" },
        { v: time.s, l: "s" },
      ].map((t, i) => (
        <React.Fragment key={t.l}>
          {i > 0 && <span className="text-white">:</span>}
          <div className="text-center">
            <span className="font-bold text-white">{pad(t.v)}</span>
            <span className="text-xs text-slate-400 ml-1">{t.l}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

const CarCard = ({ auctionCar, compact = false, auctionLocation, auctionEndTime }) => {
  const car = auctionCar.car || {};
  const img = Array.isArray(car.images) ? car.images[0] : car.images;
  const bidValue = auctionCar.currentBid || auctionCar.startingBid || car.price || 0;
  const city = car.city || car.registrationCity || "Unknown";
  const mileage = Number(car.mileage || 0).toLocaleString();

  const getTimeLeft = () => {
    if (!auctionEndTime) return { h: "00", m: "00", s: "00" };
    const diff = Math.max(0, new Date(auctionEndTime).getTime() - Date.now());
    return {
      h: String(Math.floor(diff / 3600000)).padStart(2, "0"),
      m: String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0"),
      s: String(Math.floor((diff % 60000) / 1000)).padStart(2, "0"),
    };
  };
  const t = getTimeLeft();

  if (compact) {
    return (
      <Link to={`/auctions/car-detail?id=${auctionCar._id}`} className="block">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-slate-200">
          <div className="flex">
            <div className="w-48 h-36 bg-slate-200 relative">
              {img && (
                <img
                  src={img}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {car.make} {car.model}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {car.year} - {mileage} km
                  </p>
                </div>
                <Badge className="inline-flex items-center px-3 py-1 gap-2 rounded-full text-xs font-medium bg-white !text-red-400 border border-white whitespace-nowrap animate-pulse duration-500 ease">
                  <Zap className="w-3.5 h-3.5 shrink-0 !text-red-400" />
                  Live
                </Badge>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-slate-500">Current Bid</span>
                  <p className="font-bold text-[#FFA602] text-xl">
                    PKR {Number(bidValue).toLocaleString()}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {auctionCar.bidCount || 0} bids
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/auctions/car-detail?id=${auctionCar._id}`} className="block">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-slate-200">
        <div className="h-64 bg-slate-200 relative">
          {img ? (
            <img
              src={img}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
              No image available
            </div>
          )}
          <Badge className="absolute top-3 left-3 inline-flex items-center px-3 py-1 gap-2 rounded-full text-xs font-medium bg-white !text-red-400 border border-white whitespace-nowrap animate-pulse duration-500 ease">
            <Zap className="w-3.5 h-3.5 shrink-0 !text-red-400" />
            Live
          </Badge>
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-slate-700 flex items-center justify-center">
            <Gavel className="w-4 h-4" />
          </div>
          <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {auctionLocation || "Auction Yard"}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-2xl text-slate-900 leading-tight line-clamp-1">
            {car.year} {car.make} {car.model}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm">
            <span>{mileage} km</span>
            <span>{city}</span>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Current Bid</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-3xl font-bold text-slate-900">
                PKR {Number(bidValue).toLocaleString()}
              </p>
              <Gavel className="w-6 h-6 text-[#FFA602]" />
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-500 mb-2">Ends in:</p>
            <div className="flex items-center gap-2">
              {[t.h, t.m, t.s].map((part, idx) => (
                <React.Fragment key={`${auctionCar._id}-time-${idx}`}>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-bold">
                    {part}
                  </div>
                  {idx < 2 && <span className="text-slate-500">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <Button className="w-full mt-4">Place Bid</Button>
        </div>
      </div>
    </Link>
  );
};
// Main

const defaultFilters = {
  make: "all",
  condition: "all",
  transmission: "all",
  fuelType: "all",
  sortBy: "ending_soon",
};

export default function LiveAuction() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState(defaultFilters);
  const { data: liveAuction, isLoading: auctionLoading, refetch: refetchAuction } =
    useGetLiveAuctionQuery(undefined, { pollingInterval: 30000 });

  const auctionId = liveAuction?._id;

  const { data: carsResponse, refetch: refetchCars } = useGetAuctionCarsQuery(
    { auctionId, search: searchQuery, ...filters },
    { skip: !auctionId, pollingInterval: 15000 },
  );

  const { data: upcomingList = [] } = useGetAuctionsQuery(
    { status: "scheduled", limit: 6 },
    { skip: false },
  );
  const { data: endedList = [] } = useGetAuctionsQuery(
    { status: "completed", limit: 6 },
    { skip: false },
  );

  const displayCars = Array.isArray(carsResponse?.data)
    ? carsResponse.data
    : Array.isArray(carsResponse?.cars)
      ? carsResponse.cars
      : Array.isArray(carsResponse)
        ? carsResponse
        : [];
  const upcomingAuctions = Array.isArray(upcomingList) ? upcomingList : upcomingList?.data || [];
  const endedAuctions = Array.isArray(endedList) ? endedList : endedList?.data || [];

  // Live auction is car-only, so request only car categories.
  const { makes } = useCarCategories("Car");
  const carMakes = useMemo(
    () =>
      (Array.isArray(makes) ? makes : []).filter(
        (make) => !make?.vehicleType || make.vehicleType === "Car",
      ),
    [makes],
  );

  // Real-time bid updates via socket
  const { socket, addEventListener, removeEventListener } = useSocket();

  useEffect(() => {
    if (!auctionId || !socket) return;
    socket.emit("join-auction", auctionId);
    return () => {
      socket.emit("leave-auction", auctionId);
    };
  }, [auctionId, socket]);

  const handleNewBid = useCallback(() => {
    refetchCars();
  }, [refetchCars]);

  const handleAuctionExtended = useCallback(
    (data) => {
      if (data?.auctionId === auctionId) {
        refetchCars();
        toast("Auction extended by 2 minutes");
      }
    },
    [auctionId, refetchCars],
  );

  const handleAuctionEnded = useCallback(
    (data) => {
      if (data?.auctionId === auctionId) {
        refetchCars();
        refetchAuction();
        toast("Auction has ended");
      }
    },
    [auctionId, refetchCars, refetchAuction],
  );

  useEffect(() => {
    if (!addEventListener) return;
    addEventListener("new-bid", handleNewBid);
    return () => {
      removeEventListener("new-bid", handleNewBid);
    };
  }, [addEventListener, removeEventListener, handleNewBid]);

  useEffect(() => {
    if (!addEventListener) return;
    addEventListener("auction:extended", handleAuctionExtended);
    addEventListener("auction:ended", handleAuctionEnded);
    return () => {
      removeEventListener("auction:extended", handleAuctionExtended);
      removeEventListener("auction:ended", handleAuctionEnded);
    };
  }, [addEventListener, removeEventListener, handleAuctionExtended, handleAuctionEnded]);

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery("");
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([, v]) => v && v !== "all" && v !== "ending_soon",
  ).length;

  if (auctionLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#FFA602] animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading auction...</p>
        </div>
      </div>
    );
  }

  if (!liveAuction) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-10">
            <Gavel className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">No Live Auction</h2>
            <p className="text-slate-500 mb-6">Check back soon or view upcoming and past auctions below.</p>
            <Link to="/auctions/schedule">
              <Button>View Full Schedule</Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#FFA602]" />
                Upcoming Auctions
              </h3>
              {upcomingAuctions.length === 0 ? (
                <p className="text-slate-500 text-sm">No upcoming auctions scheduled.</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingAuctions.map((a) => (
                    <li key={a._id}>
                      <Link
                        to="/auctions/schedule"
                        className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <p className="font-semibold text-slate-900">{a.title}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Starts: {a.startTime ? new Date(a.startTime).toLocaleString() : "-"}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/auctions/schedule" className="inline-block mt-3 text-sm text-[#FFA602] hover:underline font-medium">
                View schedule -&gt;
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Car className="w-5 h-5 text-slate-500" />
                Ended Auctions
              </h3>
              {endedAuctions.length === 0 ? (
                <p className="text-slate-500 text-sm">No ended auctions to show.</p>
              ) : (
                <ul className="space-y-3">
                  {endedAuctions.map((a) => (
                    <li key={a._id}>
                      <Link
                        to="/auctions/schedule"
                        className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <p className="font-semibold text-slate-900">{a.title}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Ended: {a.endTime ? new Date(a.endTime).toLocaleString() : "-"}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/auctions/schedule" className="inline-block mt-3 text-sm text-[#FFA602] hover:underline font-medium">
                View schedule -&gt;
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Live Auctions in Pakistan | Bid in Real-Time – Sello.pk"
        description="Join live auctions on Sello.pk and bid in real-time on cars, electronics & more. Secure platform, fast bidding, and exciting deals across Pakistan."
        canonical="https://sello.pk/auctions/live"
      />
      <div className="min-h-screen bg-slate-50">
      {/* Live Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 sticky top-0 z-40 border-b border-slate-700">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge className="inline-flex items-center px-3 py-1 gap-2 rounded-full text-xs font-medium bg-white !text-red-400 border border-white whitespace-nowrap animate-pulse duration-500 ease">
                  <Zap className="w-3.5 h-3.5 shrink-0 !text-red-400" />
                  Live
                </Badge>
                <h1 className="text-xl font-bold text-white">
                  {liveAuction.title}
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                {liveAuction.location}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/auctions/transactions"
                className="text-sm text-white/80 hover:text-white transition-colors"
              >
                Wallet
              </Link>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Live updates
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">Ends in:</span>
                  <CountdownTimer targetDate={liveAuction.endTime} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-[#FFA602]" />
              <span className="font-semibold text-slate-900">
                {displayCars.length}
              </span>
              <span className="text-slate-500">Cars Found</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-slate-500">
                {liveAuction.totalBids || 0} total bids
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
          Bidding is visible to everyone. To place bids, users need approved
          auction access plus a verified token or sufficient wallet balance.
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by make, model, year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="h-11 px-3 border border-slate-200 rounded-lg text-sm"
                value={filters.make}
                onChange={(e) =>
                  setFilters({ ...filters, make: e.target.value })
                }
              >
                <option value="all">All Makes</option>
                {carMakes.map((make) => (
                  <option key={make._id} value={make.name}>
                    {make.name}
                  </option>
                ))}
              </select>
              <select
                className="h-11 px-3 border border-slate-200 rounded-lg text-sm"
                value={filters.condition}
                onChange={(e) =>
                  setFilters({ ...filters, condition: e.target.value })
                }
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
              <select
                className="h-11 px-3 border border-slate-200 rounded-lg text-sm"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
              >
                <option value="ending_soon">Ending Soon</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="year_new">Year: Newest First</option>
              </select>
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50"}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 grid lg:grid-cols-2 gap-4">
            <AuctionSavedSearches
              filters={filters}
              searchQuery={searchQuery}
              onApply={(nextFilters, nextSearch) => {
                setFilters((p) => ({ ...p, ...nextFilters }));
                setSearchQuery(nextSearch || "");
              }}
            />
            <LiveAuctionUpdates
              auctionId={auctionId}
              socket={socket}
              addEventListener={addEventListener}
              removeEventListener={removeEventListener}
            />
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">Active filters:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Car Grid */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchQuery}-${JSON.stringify(filters)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {displayCars.map((ac, i) => (
              <motion.div
                key={ac._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <CarCard
                  auctionCar={ac}
                  compact={viewMode === "list"}
                  auctionLocation={liveAuction?.location}
                  auctionEndTime={liveAuction?.endTime}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {displayCars.length === 0 && !auctionLoading && (
          <div className="text-center py-16">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No cars found
            </h3>
            <p className="text-slate-500">Try adjusting your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Upcoming & Ended: same layout as when no live auction */}
        <div className="grid md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#FFA602]" />
              Upcoming Auctions
            </h3>
            {upcomingAuctions.length === 0 ? (
              <p className="text-slate-500 text-sm">No upcoming auctions.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingAuctions.slice(0, 3).map((a) => (
                  <li key={a._id}>
                    <Link
                      to="/auctions/schedule"
                      className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <p className="font-semibold text-slate-900">{a.title}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Starts: {a.startTime ? new Date(a.startTime).toLocaleString() : "-"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/auctions/schedule" className="inline-block mt-3 text-sm text-[#FFA602] hover:underline font-medium">
              View schedule -&gt;
            </Link>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Car className="w-5 h-5 text-slate-500" />
              Ended Auctions
            </h3>
            {endedAuctions.length === 0 ? (
              <p className="text-slate-500 text-sm">No ended auctions.</p>
            ) : (
              <ul className="space-y-3">
                {endedAuctions.slice(0, 3).map((a) => (
                  <li key={a._id}>
                    <Link
                      to="/auctions/schedule"
                      className="block bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <p className="font-semibold text-slate-900">{a.title}</p>
                      <p className="text-sm text-slate-500 mt-1">
                        Ended: {a.endTime ? new Date(a.endTime).toLocaleString() : "-"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/auctions/schedule" className="inline-block mt-3 text-sm text-[#FFA602] hover:underline font-medium">
              View schedule -&gt;
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
