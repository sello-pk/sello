import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoCalendarOutline as Calendar,
  IoTimeOutline as Clock,
  IoLocationOutline as MapPin,
  IoCarSportOutline as Car,
  IoFlashOutline as Zap,
  IoCheckmarkCircleOutline as CheckCircle,
  IoArrowForward as ArrowRight,
} from "react-icons/io5";
import { useGetAuctionsQuery } from "@redux/services/api";
import { images } from "../../../assets/assets";
import SEO from "../../../components/common/SEO";

const Badge = ({ children, className = "", ...props }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
    {...props}
  >
    {children}
  </span>
);

const Button = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const v = {
    default:
      "bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] shadow-lg shadow-[#FFA602]/30",
    outline: "border-2 border-slate-300 text-slate-700 hover:bg-slate-100",
    ghost: "text-slate-700 hover:bg-slate-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-medium px-4 py-2 text-sm transition-all duration-300 rounded-lg focus:outline-none ${v[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const statusColors = {
  live: "bg-red-500 text-white",
  scheduled: "bg-blue-100 text-blue-600",
  completed: "bg-slate-100 text-slate-500",
  draft: "bg-amber-100 text-amber-600",
  cancelled: "bg-red-100 text-red-500",
};

const AuctionCard = ({ auction }) => {
  const isLive = auction.status === "live";
  const start = new Date(auction.startTime);
  const end = new Date(auction.endTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-xl transition-all"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg text-slate-900">
              {auction.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <MapPin className="w-4 h-4" />
              {auction.location || "Okara Auction Yard"}
            </div>
          </div>
          <Badge className={statusColors[auction.status] || ""}>
            {isLive && <Zap className="w-3 h-3 mr-1" />}
            {auction.status?.toUpperCase()}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center bg-slate-50 rounded-xl p-3">
            <Car className="w-5 h-5 mx-auto text-[#FFA602] mb-1" />
            <p className="font-bold text-slate-900">{auction.totalCars || 0}</p>
            <p className="text-xs text-slate-500">Cars</p>
          </div>
          <div className="text-center bg-slate-50 rounded-xl p-3">
            <Calendar className="w-5 h-5 mx-auto text-[#FFA602] mb-1" />
            <p className="font-bold text-slate-900">
              {start.toLocaleDateString("en-PK", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-500">
              {start.toLocaleTimeString("en-PK", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="text-center bg-slate-50 rounded-xl p-3">
            <Clock className="w-5 h-5 mx-auto text-[#FFA602] mb-1" />
            <p className="font-bold text-slate-900">
              {end.toLocaleDateString("en-PK", {
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-slate-500">
              {end.toLocaleTimeString("en-PK", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        {auction.status === "completed" && (
          <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-medium">
              {auction.totalSold || 0} cars sold
            </span>
          </div>
        )}
        <Link
          to={isLive ? "/auctions/live" : `/auctions/schedule`}
          className="block"
        >
          <Button className={`w-full ${isLive ? "" : "bg-slate-600"}`}>
            {isLive ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Join Live Auction
              </>
            ) : auction.status === "scheduled" ? (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                View Details
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                View Results
              </>
            )}
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default function AuctionSchedule() {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: auctions = [], isLoading } = useGetAuctionsQuery(
    { status: statusFilter === "all" ? undefined : statusFilter, limit: 50 },
    { pollingInterval: 60000 },
  );

  const tabs = [
    { value: "all", label: "All Auctions" },
    { value: "live", label: "Live Now" },
    { value: "scheduled", label: "Upcoming" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <>
      <SEO
        title="Auction Schedule | Upcoming Car Auctions in Pakistan - Sello.pk"
        description="Check the latest car auction schedule on Sello.pk. Browse upcoming, live, and completed auctions in Pakistan with dates, locations, and vehicle counts."
        canonical="https://sello.pk/auctions/schedule"
      />
      <div className="min-h-screen bg-slate-50">
      <header className="relative w-full overflow-hidden">
        <div className="relative flex min-h-[200px] h-[28vh] sm:min-h-[240px] sm:h-[32vh] md:h-[34vh] lg:h-[38vh] max-h-[420px] md:max-h-none items-center justify-center">
          <img
            src={images.auctionSchedule}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-slate-900/65"
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="bg-primary-500 p-2.5 sm:p-3 rounded-full shadow-lg ring-4 ring-white/10">
              <Calendar
                className="h-6 w-6 sm:h-7 sm:w-7 text-white shrink-0"
                aria-hidden
              />
            </div>
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Auction Schedule
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Browse upcoming, live, and past auctions
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${statusFilter === tab.value ? "bg-[#FFA602] text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-slate-500">
            Loading auctions...
          </div>
        ) : auctions.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No auctions found
            </h3>
            <p className="text-slate-500">Check back later for new auctions</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
