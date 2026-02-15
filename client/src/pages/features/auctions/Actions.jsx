import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoFlashOutline as Zap,
  IoArrowForward as ArrowRight,
  IoLocationOutline as MapPin,
  IoCalendarOutline as Calendar,
  IoPeopleOutline as Users,
  IoCarSportOutline as Car,
  IoTrendingUpOutline as TrendingUp,
  IoPlayOutline as Play,
  IoShieldOutline as Shield,
  IoTimeOutline as Clock,
  IoCheckmarkCircleOutline as CheckCircle,
} from "react-icons/io5";
import { GiGavel as Gavel } from "react-icons/gi";

// ==================== COMPONENTS ====================

// CountdownTimer Component
const CountdownTimer = ({ targetDate, size = "default" }) => {
  // For UI demo, using static values
  return (
    <div
      className={`grid grid-cols-4 gap-2 ${
        size === "large" ? "text-2xl" : "text-lg"
      }`}
    >
      <div className="bg-white/20 rounded-lg p-2 text-center">
        <div className="font-bold text-white">02</div>
        <div className="text-xs text-white/70">Days</div>
      </div>
      <div className="bg-white/20 rounded-lg p-2 text-center">
        <div className="font-bold text-white">12</div>
        <div className="text-xs text-white/70">Hours</div>
      </div>
      <div className="bg-white/20 rounded-lg p-2 text-center">
        <div className="font-bold text-white">45</div>
        <div className="text-xs text-white/70">Mins</div>
      </div>
      <div className="bg-white/20 rounded-lg p-2 text-center">
        <div className="font-bold text-white">30</div>
        <div className="text-xs text-white/70">Secs</div>
      </div>
    </div>
  );
};

// CarCard Component
const CarCard = ({ car = {} }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <div className="h-48 bg-slate-200 relative">
      <img
        src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400"
        alt="Car"
        className="w-full h-full object-cover"
      />
      <span className="absolute top-2 right-2 bg-[#FFA602] text-white text-xs px-2 py-1 rounded-full">
        Live
      </span>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-lg">Toyota Corolla</h3>
      <p className="text-slate-500 text-sm">2020 • 45,000 km</p>
      <div className="mt-3 flex justify-between items-center">
        <span className="font-bold text-[#FFA602]">₨ 2,450,000</span>
        <span className="text-xs bg-slate-100 px-2 py-1 rounded">12 Bids</span>
      </div>
    </div>
  </div>
);

// TrustBadges Component
const TrustBadges = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { icon: Shield, text: "Secure Payment" },
      { icon: Clock, text: "Fast Delivery" },
      { icon: Users, text: "Verified Bidders" },
      { icon: CheckCircle, text: "Quality Checked" },
    ].map((item, i) => (
      <motion.div
        key={i}
        whileHover={{ y: -5 }}
        className="bg-white p-4 rounded-xl shadow-md text-center border border-slate-100"
      >
        <item.icon className="w-8 h-8 mx-auto text-[#FFA602] mb-2" />
        <p className="font-medium text-sm">{item.text}</p>
      </motion.div>
    ))}
  </div>
);

// Badge Component
const Badge = ({ children, className = "", ...props }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
    {...props}
  >
    {children}
  </span>
);

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
      "border-2 border-[#FFA602] text-[#FFA602] hover:bg-[#FFA602] hover:text-white focus:ring-[#FFA602]",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    white:
      "bg-white text-[#FFA602] hover:bg-white/90 focus:ring-white shadow-lg",
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

// ==================== MAIN AUCTIONS ACTIONS COMPONENT ====================

export default function AuctionsActions() {
  // Static/Mock Data
  const liveAuction = true;
  const cars = [1, 2, 3, 4, 5, 6];

  const stats = [
    { value: "500+", label: "Cars Sold", icon: Car },
    { value: "10K+", label: "Active Bidders", icon: Users },
    { value: "₨2B+", label: "Total Sales", icon: TrendingUp },
    { value: "48hrs", label: "Quick Delivery", icon: Clock },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Register",
      desc: "Complete verification & pay refundable token",
      icon: Users,
    },
    {
      step: "02",
      title: "Browse",
      desc: "Explore cars in current or upcoming auctions",
      icon: Car,
    },
    {
      step: "03",
      title: "Bid",
      desc: "Place bids online or visit Okara yard",
      icon: Gavel,
    },
    {
      step: "04",
      title: "Win & Collect",
      desc: "Pay within 48hrs & pickup from Okara",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50">
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920"
            alt="Luxury car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>

        {/* Hero Content */}
        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {liveAuction && (
                <Badge className="bg-red-500 text-white border-0 mb-6 animate-pulse">
                  <Zap className="w-4 h-4 mr-1" />
                  Live Auction in Progress
                </Badge>
              )}

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Pakistan’s Largest Hybrid
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFA602] to-amber-500">
                  Car Auction
                </span>
                Platform
              </h1>

              <p className="text-lg text-slate-300 mb-8 max-w-xl">
                Buy, sell, or bid on verified cars across Pakistan. Join live
                online auctions or attend our physical auction events. Get
                instant AI-powered car price estimation before you decide.
              </p>

              <div className="flex items-center gap-2 text-slate-400 mb-8">
                <MapPin className="w-5 h-5 text-[#FFA602]" />
                <span>Serving Buyers & Sellers Across Pakistan</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auctions/live">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Play className="w-5 h-5 mr-2" />
                    View Live Auction
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
                  >
                    Register to Bid
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Content - Countdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <h3 className="text-white font-semibold text-xl mb-2">
                    Auction Ends In
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Auctions held every second day
                  </p>
                </div>

                <CountdownTimer size="large" />

                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {cars.length}
                    </p>
                    <p className="text-xs text-slate-400">Cars Available</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">127</p>
                    <p className="text-xs text-slate-400">Active Bidders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">₨8.5M</p>
                    <p className="text-xs text-slate-400">Highest Bid</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-[#FFA602]" />
                <p className="text-2xl md:text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== TRUST BADGES ========== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Why Choose Us?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Pakistan's most transparent and trusted car auction platform
          </p>
        </motion.div>
        <TrustBadges />
      </section>

      {/* ========== FEATURED AUCTIONS ========== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Featured Auctions
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Currently live and upcoming auctions
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: item * 0.1 }}
              className="group-hover:scale-110 transition-transform duration-300"
            >
              <CarCard car={{ id: item }} />
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/auctions/live">
            <Button
              variant="outline"
              className="border-[#FFA602] text-[#FFA602] hover:bg-[#FFA602] hover:text-white"
            >
              View All Auctions
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Simple, transparent, and secure bidding process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center group"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#FFA602] to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#FFA602]/30 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 text-7xl font-bold text-white/5">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA SECTION ========== */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-[#FFA602] to-amber-500 rounded-3xl p-12 md:p-16 shadow-2xl shadow-[#FFA602]/25"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Next Car?
            </h2>
            <p className="text-white/80 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of buyers who trust Okara Auto Auction
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button
                  variant="white"
                  size="lg"
                  className="bg-white text-[#FFA602] hover:bg-white/90 shadow-lg w-full sm:w-auto"
                >
                  Register Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/schedule">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20 bg-transparent w-full sm:w-auto"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  View Schedule
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
