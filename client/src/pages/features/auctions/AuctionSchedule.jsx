import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoCalendarOutline as Calendar,
  IoTimeOutline as Clock,
  IoCarSportOutline as Car,
  IoPeopleOutline as Users,
  IoArrowForward as ArrowRight,
  IoCalendarNumberOutline as CalendarDays,
  IoLocationOutline as MapPin,
  IoChevronForward as ChevronRight,
  IoOptionsOutline as Filter,
} from "react-icons/io5";
import { GiGavel as Gavel } from "react-icons/gi";
import { format, addDays, isBefore, isAfter, isToday } from "date-fns";

// ==================== CUSTOM COMPONENTS ====================

// Badge Component
const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-slate-100 text-slate-900",
    secondary: "bg-slate-100 text-slate-600",
    destructive: "bg-red-100 text-red-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Button Component
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default:
      "bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] focus:ring-[#FFA602] shadow-lg shadow-[#FFA602]/30",
    outline:
      "border-2 border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    white:
      "bg-white text-[#FFA602] hover:bg-white/90 focus:ring-white shadow-lg",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  };

  const sizes = {
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    sm: "px-3 py-1.5 text-xs",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA602] focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
};

// Tabs Components
const Tabs = ({ value, onValueChange, children }) => {
  return (
    <div className="tabs">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { value, onValueChange }),
      )}
    </div>
  );
};

const TabsList = ({ children, className = "" }) => {
  return (
    <div className={`inline-flex p-1 rounded-lg ${className}`}>{children}</div>
  );
};

const TabsTrigger = ({ value, onValueChange, children, className = "" }) => {
  const isActive = value === onValueChange?.value;

  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
        isActive
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      } ${className}`}
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </button>
  );
};

// Select Components
const Select = ({ children, value, onValueChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <SelectValue value={value} placeholder={placeholder} />
      </SelectTrigger>
      {isOpen && (
        <SelectContent
          onSelect={(val) => {
            onValueChange(val);
            setIsOpen(false);
          }}
        >
          {children}
        </SelectContent>
      )}
    </div>
  );
};

const SelectTrigger = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full h-10 px-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#FFA602] text-sm ${className}`}
    >
      {children}
      <svg
        className="w-4 h-4 text-slate-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};

const SelectValue = ({ value, placeholder }) => {
  return (
    <span
      className={value && value !== "all" ? "text-slate-900" : "text-slate-400"}
    >
      {value && value !== "all" ? value : placeholder}
    </span>
  );
};

const SelectContent = ({ children, onSelect }) => {
  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onSelect }),
      )}
    </div>
  );
};

const SelectItem = ({ children, value, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(value)}
      className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer text-slate-900"
    >
      {children}
    </div>
  );
};

// CountdownTimer Component
const CountdownTimer = ({ size = "default", showLabel = true }) => {
  return (
    <div
      className={`flex items-center gap-1 ${size === "large" ? "text-2xl" : "text-sm"}`}
    >
      <div className="text-center">
        <span className="font-bold text-slate-900">02</span>
        {showLabel && <span className="text-xs text-slate-500 ml-1">d</span>}
      </div>
      <span className="text-slate-400">:</span>
      <div className="text-center">
        <span className="font-bold text-slate-900">12</span>
        {showLabel && <span className="text-xs text-slate-500 ml-1">h</span>}
      </div>
      <span className="text-slate-400">:</span>
      <div className="text-center">
        <span className="font-bold text-slate-900">45</span>
        {showLabel && <span className="text-xs text-slate-500 ml-1">m</span>}
      </div>
    </div>
  );
};

// AuctionStatusBadge Component
const AuctionStatusBadge = ({ status }) => {
  const colors = {
    live: "bg-red-500 text-white",
    upcoming: "bg-blue-500 text-white",
    completed: "bg-slate-500 text-white",
  };
  return (
    <span
      className={`${colors[status] || "bg-slate-500 text-white"} text-xs px-2 py-1 rounded-full`}
    >
      {status?.toUpperCase()}
    </span>
  );
};

// ==================== MAIN COMPONENT ====================

export default function AuctionSchedule() {
  const [filter, setFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");

  // Generate sample auctions
  const displayAuctions = [...Array(10)].map((_, i) => {
    const startDate = addDays(new Date(), i * 2 - 4);
    const endDate = addDays(startDate, 0);
    endDate.setHours(18, 0, 0);
    startDate.setHours(10, 0, 0);

    let status = "upcoming";
    if (isBefore(endDate, new Date())) status = "completed";
    else if (isBefore(startDate, new Date()) && isAfter(endDate, new Date()))
      status = "live";

    return {
      id: i,
      title: `Auction #${100 + i}`,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status,
      total_cars: 15 + Math.floor(Math.random() * 20),
      total_bids: 50 + Math.floor(Math.random() * 200),
      total_sold:
        status === "completed" ? 10 + Math.floor(Math.random() * 15) : 0,
    };
  });

  const filteredAuctions = displayAuctions.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;

    if (dateFilter === "today") {
      if (!isToday(new Date(a.start_time))) return false;
    } else if (dateFilter === "this_week") {
      const auctionDate = new Date(a.start_time);
      const now = new Date();
      const weekFromNow = addDays(now, 7);
      if (isBefore(auctionDate, now) || isAfter(auctionDate, weekFromNow))
        return false;
    }

    if (monthFilter !== "all") {
      const auctionMonth = format(new Date(a.start_time), "yyyy-MM");
      if (auctionMonth !== monthFilter) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="bg-[#FFA602]/20 text-[#FFA602] border border-[#FFA602]/30 mb-4">
              <CalendarDays className="w-4 h-4 mr-1" />
              Every Second Day
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Auction Schedule
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Our auctions run every second day. Plan your bidding strategy and
              never miss an opportunity.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="live" className="text-red-600">
                  Live
                </TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin className="w-4 h-4" />
              All auctions at Okara Yard, Punjab
            </div>
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                <SelectItem value={format(new Date(), "yyyy-MM")}>
                  {format(new Date(), "MMMM yyyy")}
                </SelectItem>
                <SelectItem value={format(addDays(new Date(), 30), "yyyy-MM")}>
                  {format(addDays(new Date(), 30), "MMMM yyyy")}
                </SelectItem>
                <SelectItem value={format(addDays(new Date(), 60), "yyyy-MM")}>
                  {format(addDays(new Date(), 60), "MMMM yyyy")}
                </SelectItem>
              </SelectContent>
            </Select>

            {(dateFilter !== "all" || monthFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFilter("all");
                  setMonthFilter("all");
                }}
                className="text-red-600 hover:text-red-700"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Auction List */}
        <div className="space-y-4">
          {filteredAuctions.map((auction, index) => (
            <motion.div
              key={auction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div
                className={`
                bg-white rounded-2xl border overflow-hidden
                ${
                  auction.status === "live"
                    ? "border-red-300 ring-2 ring-red-500/20 shadow-lg shadow-red-500/10"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }
                transition-all duration-300
              `}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left - Date & Info */}
                    <div className="flex items-start gap-4">
                      {/* Date Box */}
                      <div
                        className={`
                        w-20 h-20 rounded-xl flex flex-col items-center justify-center flex-shrink-0
                        ${
                          auction.status === "live"
                            ? "bg-gradient-to-br from-red-500 to-red-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }
                      `}
                      >
                        <span className="text-xs uppercase tracking-wider opacity-80">
                          {format(new Date(auction.start_time), "MMM")}
                        </span>
                        <span className="text-3xl font-bold">
                          {format(new Date(auction.start_time), "d")}
                        </span>
                        <span className="text-xs opacity-80">
                          {format(new Date(auction.start_time), "EEE")}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">
                            {auction.title}
                          </h3>
                          <AuctionStatusBadge status={auction.status} />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(
                              new Date(auction.start_time),
                              "h:mm a",
                            )} - {format(new Date(auction.end_time), "h:mm a")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Car className="w-4 h-4" />
                            {auction.total_cars} Cars
                          </span>
                          {auction.total_bids > 0 && (
                            <span className="flex items-center gap-1">
                              <Gavel className="w-4 h-4" />
                              {auction.total_bids} Bids
                            </span>
                          )}
                          {auction.status === "completed" && (
                            <span className="flex items-center gap-1 text-emerald-600">
                              <Users className="w-4 h-4" />
                              {auction.total_sold} Sold
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right - Timer & CTA */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                      {(auction.status === "live" ||
                        auction.status === "upcoming") && (
                        <div className="bg-slate-50 rounded-xl px-4 py-3">
                          <p className="text-xs text-slate-500 mb-1">
                            {auction.status === "live"
                              ? "Ends in"
                              : "Starts in"}
                          </p>
                          <CountdownTimer size="small" showLabel={false} />
                        </div>
                      )}

                      <Link to={`/auctions/live?auction_id=${auction.id}`}>
                        <Button
                          className={`
                            ${
                              auction.status === "live"
                                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25"
                                : auction.status === "upcoming"
                                  ? "bg-gradient-to-r from-[#FFA602] to-amber-500 hover:from-amber-500 hover:to-[#FFA602] shadow-[#FFA602]/25"
                                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                            }
                            shadow-lg
                          `}
                        >
                          {auction.status === "live"
                            ? "Enter Auction"
                            : auction.status === "upcoming"
                              ? "View Cars"
                              : "View Results"}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Live Auction Footer */}
                {auction.status === "live" && (
                  <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-t border-red-200 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-600">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">
                          Bidding in progress
                        </span>
                      </div>
                      <span className="text-sm text-slate-600">
                        127 active bidders
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAuctions.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No auctions found
            </h3>
            <p className="text-slate-500">Check back soon for more auctions</p>
          </div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-3">
            Auction Every Second Day
          </h3>
          <p className="text-slate-400 max-w-2xl mx-auto mb-6">
            Our regular auction schedule means you never have to wait long. Each
            auction features 15-30 inspected vehicles ready for bidding.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-4 h-4 text-[#FFA602]" />
              Auctions run 10:00 AM - 6:00 PM
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-[#FFA602]" />
              Okara Auction Yard, Punjab
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
