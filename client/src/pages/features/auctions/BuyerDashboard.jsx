import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoHammerOutline as Gavel,
  IoWalletOutline as Wallet,
  IoTrophyOutline as Trophy,
  IoCalendarOutline as Calendar,
  IoNotificationsOutline as Bell,
  IoTimeOutline as Clock,
  IoArrowForward as ArrowRight,
  IoCarSportOutline as Car,
  IoChevronForward as ChevronRight,
  IoTrendingUpOutline as TrendingUp,
  IoAlertCircleOutline as AlertCircle,
  IoCheckmarkCircleOutline as CheckCircle,
  IoEyeOutline as Eye,
  IoCashOutline as DollarSign,
  IoSpeedometerOutline as Timer,
} from "react-icons/io5";

// ==================== CUSTOM COMPONENTS ====================

// Badge Component
const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-slate-100 text-slate-900",
    secondary: "bg-slate-100 text-slate-600",
    destructive: "bg-red-100 text-red-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
    outline: "border border-slate-200 text-slate-700 bg-transparent",
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

// Card Components
const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => {
  return (
    <div className={`p-6 border-b border-slate-100 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = "" }) => {
  return (
    <h3 className={`text-lg font-semibold text-slate-900 ${className}`}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
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

const TabsContent = ({ children, className = "" }) => {
  return <div className={className}>{children}</div>;
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

// StatsCard Component
const StatsCard = ({ value, label, color }) => {
  const colors = {
    orange: "bg-orange-100 text-orange-600",
    emerald: "bg-emerald-100 text-emerald-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}
          >
            {/* Icon will be handled by the parent component */}
          </div>
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
};

// ==================== MAIN COMPONENT ====================

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Mock user
    setUser({
      id: 1,
      full_name: "Raza Ali",
      token_balance: 10000,
      auctions_won: 2,
      total_bids: 15,
    });
  }, []);

  // Sample data
  const sampleBids = [
    {
      id: 1,
      amount: 3850000,
      is_winning: true,
      created_date: new Date().toISOString(),
      car_id: "1",
    },
    {
      id: 2,
      amount: 2700000,
      is_winning: false,
      created_date: new Date(Date.now() - 86400000).toISOString(),
      car_id: "2",
    },
    {
      id: 3,
      amount: 1950000,
      is_winning: true,
      created_date: new Date(Date.now() - 172800000).toISOString(),
      car_id: "3",
    },
  ];

  const sampleNotifications = [
    {
      id: 1,
      title: "Outbid Alert",
      message: "You have been outbid on Toyota Corolla 2022",
      type: "outbid",
      is_read: false,
      created_date: new Date().toISOString(),
    },
    {
      id: 2,
      title: "Auction Starting",
      message: "Auction #102 starts in 1 hour",
      type: "auction_reminder",
      is_read: false,
      created_date: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 3,
      title: "Verification Complete",
      message: "Your CNIC has been verified successfully",
      type: "verification",
      is_read: true,
      created_date: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const sampleWonCars = [];

  const stats = [
    {
      icon: Gavel,
      value: sampleBids.length,
      label: "Active Bids",
      color: "orange",
    },
    {
      icon: Trophy,
      value: user?.auctions_won || 0,
      label: "Auctions Won",
      color: "emerald",
    },
    {
      icon: Wallet,
      value: `₨${((user?.token_balance || 10000) / 1000).toFixed(0)}K`,
      label: "Token Balance",
      color: "blue",
    },
    {
      icon: TrendingUp,
      value: user?.total_bids || sampleBids.length,
      label: "Total Bids",
      color: "purple",
    },
  ];

  const notificationIcons = {
    outbid: { icon: AlertCircle, color: "text-amber-600 bg-amber-100" },
    auction_won: { icon: Trophy, color: "text-emerald-600 bg-emerald-100" },
    auction_reminder: { icon: Calendar, color: "text-blue-600 bg-blue-100" },
    payment_due: { icon: Clock, color: "text-red-600 bg-red-100" },
    verification: {
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-100",
    },
    general: { icon: Bell, color: "text-slate-600 bg-slate-100" },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Welcome back, {user?.full_name?.split(" ")[0] || "Bidder"}
              </h1>
              <p className="text-slate-400">Manage your bids and auctions</p>
            </div>
            <Link to="/auctions/live">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                <Gavel className="w-5 h-5 mr-2" />
                Enter Live Auction
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StatsCard
                value={stat.value}
                label={stat.label}
                color={stat.color}
              />
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Bids */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-orange-500" />
                  Your Active Bids
                </CardTitle>
                <Link to="/auctions/live">
                  <Button variant="ghost" size="sm">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {sampleBids.length > 0 ? (
                  <div className="space-y-3">
                    {sampleBids.map((bid, index) => (
                      <motion.div
                        key={bid.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`
                          flex items-center justify-between p-4 rounded-xl border
                          ${
                            bid.is_winning
                              ? "bg-emerald-50 border-emerald-200"
                              : "bg-slate-50 border-slate-200"
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-12 bg-slate-200 rounded-lg overflow-hidden">
                            <img
                              src={`https://images.unsplash.com/photo-${1590362891991 + index}-f776e747a588?w=200`}
                              alt="Car"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {
                                [
                                  "Toyota Corolla 2022",
                                  "Honda Civic 2021",
                                  "Suzuki Alto 2023",
                                ][index]
                              }
                            </p>
                            <p className="text-sm text-slate-500">
                              Bid: PKR {bid.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {bid.is_winning ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Highest Bid
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Outbid
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gavel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No active bids yet</p>
                    <Link to="/auctions/live">
                      <Button className="mt-4" variant="outline">
                        Browse Auctions
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auctions Won */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  Auctions Won
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sampleWonCars.length > 0 ? (
                  <div className="space-y-3">
                    {sampleWonCars.map((car) => (
                      <div
                        key={car.id}
                        className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {car.make} {car.model} {car.year}
                          </p>
                          <p className="text-sm text-slate-500">
                            Final Price: PKR {car.final_price?.toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-amber-500 text-white">
                          Payment Due
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No auctions won yet</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Keep bidding to win your dream car!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Auctions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Upcoming Auctions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      title: "Auction #102",
                      start_time: new Date(
                        Date.now() + 86400000 * 2,
                      ).toISOString(),
                      total_cars: 18,
                    },
                    {
                      id: 2,
                      title: "Auction #103",
                      start_time: new Date(
                        Date.now() + 86400000 * 4,
                      ).toISOString(),
                      total_cars: 22,
                    },
                  ].map((auction) => (
                    <div
                      key={auction.id}
                      className="p-3 bg-slate-50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">
                          {auction.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {auction.total_cars} Cars
                        </Badge>
                      </div>
                      <CountdownTimer size="small" showLabel={false} />
                    </div>
                  ))}
                </div>
                <Link to="/auctions/schedule">
                  <Button variant="outline" className="w-full mt-4">
                    View Full Schedule
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-500" />
                  Notifications
                  {sampleNotifications.filter((n) => !n.is_read).length > 0 && (
                    <Badge className="bg-red-500 text-white ml-auto">
                      {sampleNotifications.filter((n) => !n.is_read).length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sampleNotifications.slice(0, 5).map((notif) => {
                    const { icon: Icon, color } =
                      notificationIcons[notif.type] ||
                      notificationIcons.general;
                    return (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 p-3 rounded-xl ${notif.is_read ? "bg-slate-50" : "bg-orange-50 border border-orange-200"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${notif.is_read ? "text-slate-700" : "text-slate-900"}`}
                          >
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Token Balance */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="w-6 h-6 text-orange-400" />
                  <span className="font-semibold">Token Balance</span>
                </div>
                <p className="text-3xl font-bold mb-2">
                  PKR {(user?.token_balance || 10000).toLocaleString()}
                </p>
                <p className="text-sm text-slate-400 mb-4">
                  Available for bidding
                </p>
                <Link to="/token-payment">
                  <Button
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Add More Tokens
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
