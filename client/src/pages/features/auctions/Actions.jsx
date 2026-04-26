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
import {
  useGetLiveAuctionQuery,
  useGetAuctionsQuery,
  useGetMeQuery,
  useGetMyAuctionAccessStatusQuery,
} from "@redux/services/api";
import HowAuctionsWork from "../../../components/auction/HowAuctionsWork";
import AuctionBlogsSection from "../../../components/features/auctions/AuctionBlogsSection";
import SEO from "../../../components/common/SEO";

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
    <div className="grid grid-cols-4 gap-2 text-lg">
      {[
        { val: time.d, label: "Days" },
        { val: time.h, label: "Hours" },
        { val: time.m, label: "Mins" },
        { val: time.s, label: "Secs" },
      ].map((t) => (
        <div key={t.label} className="bg-white/20 rounded-lg p-2 text-center">
          <div className="font-bold text-white">{pad(t.val)}</div>
          <div className="text-xs text-white/70">{t.label}</div>
        </div>
      ))}
    </div>
  );
};

const Badge = ({ children, className = "", ...props }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
    {...props}
  >
    {children}
  </span>
);

const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    default:
      "bg-gradient-to-r from-primary to-amber-500 text-white hover:from-amber-500 hover:to-primary focus:ring-primary shadow-lg shadow-primary/30",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
    white: "bg-white text-primary hover:bg-white/90 focus:ring-white shadow-lg",
  };
  const sizes = { default: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function AuctionsActions() {
  const { data: liveAuction } = useGetLiveAuctionQuery();
  const { data: recentAuctions } = useGetAuctionsQuery({ limit: 6 });
  const token = localStorage.getItem("token");
  const { data: user } = useGetMeQuery(undefined, { skip: !token });
  const { data: auctionAccess } = useGetMyAuctionAccessStatusQuery(undefined, {
    skip: !user,
  });

  const isLoggedIn = !!user;
  const bidderStatus =
    auctionAccess?.auctionCapabilities?.auctionBidder?.status ||
    "not_requested";
  const dealerStatus =
    auctionAccess?.auctionCapabilities?.auctionDealer?.status ||
    "not_requested";
  const hasAuctionAccess =
    bidderStatus === "approved" || dealerStatus === "approved";
  const registerLink = isLoggedIn ? "/auctions/token-payment" : "/sign-up";
  const registerLabel = isLoggedIn
    ? hasAuctionAccess
      ? "Start Bidding"
      : "Pay Token / Request Access"
    : "Register to Bid";
  const ctaLabel = isLoggedIn
    ? hasAuctionAccess
      ? "Pay Token & Bid"
      : "Pay Token / Request Access"
    : "Register Now";

  const stats = [
    { value: liveAuction?.totalCars || "—", label: "Cars Listed", icon: Car },
    {
      value: liveAuction?.totalBids || "—",
      label: "Total Bids",
      icon: TrendingUp,
    },
    { value: liveAuction?.totalSold || "—", label: "Cars Sold", icon: Users },
    { value: "48hrs", label: "Quick Delivery", icon: Clock },
  ];

  const howItWorks = [
    {
      step: "01",
      title: "Register",
      desc: "Request bidder/dealer approval and set up token or wallet",
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
    <>
      <SEO
        title="Online Auctions in Pakistan | Bid & Win Deals – Sello.pk"
        description="Explore online auctions on Sello.pk. Bid on cars, electronics & more. Get the best deals with secure bidding and verified listings across Pakistan."
        canonical="https://sello.pk/auctions"
      />
      <div className="min-h-screen w-full bg-slate-50">
      {/* Hero */}
      <section className="relative h-[68vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920"
            alt="Luxury car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/60" />
        </div>
        <div className="relative max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {liveAuction && (
                <Badge className="bg-red-500 text-white border-0 mb-6 animate-pulse">
                  <Zap className="w-4 h-4 mr-1" /> Live Auction in Progress
                </Badge>
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Pakistan's Largest Hybrid
                <span className="block text-transparent bg-clip-text bg-primary">
                  Car Auction
                </span>
                Platform
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-xl">
                Buy, sell, or bid on verified cars across Pakistan. Join live
                online auctions or attend our physical auction events.
              </p>
              <div className="flex items-center gap-2 text-slate-400 mb-8">
                <MapPin className="w-5 h-5 text-primary" />
                <span>Serving Buyers & Sellers Across Pakistan</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auctions/live">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Play className="w-5 h-5 mr-2" /> View Live Auction
                  </Button>
                </Link>
                <Link to={registerLink}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
                  >
                    {registerLabel} <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="text-center mb-6">
                  <h3 className="text-white font-semibold text-xl mb-2">
                    {liveAuction ? "Auction Ends In" : "Next Auction Soon"}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Auctions held every second day
                  </p>
                </div>
                {liveAuction ? (
                  <CountdownTimer targetDate={liveAuction.endTime} />
                ) : (
                  <div className="text-center text-slate-400 py-4">
                    No live auction right now
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {liveAuction?.totalCars || 0}
                    </p>
                    <p className="text-xs text-slate-400">Cars Available</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {liveAuction?.totalBids || 0}
                    </p>
                    <p className="text-xs text-slate-400">Total Bids</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {liveAuction?.totalSold || 0}
                    </p>
                    <p className="text-xs text-slate-400">Cars Sold</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl md:text-3xl font-bold text-slate-900">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#050B20] mb-3">
            Why Choose Us?
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Pakistan's most transparent and trusted car auction platform
          </p>
        </motion.div>
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
              <item.icon className="w-8 h-8 mx-auto text-primary mb-2" />
              <p className="font-medium text-sm">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <HowAuctionsWork />

      <AuctionBlogsSection />

      {/* CTA */}
      <section className="bg-gray-50 relative overflow-hidden">
        <div className="relative bg-white py-16 md:py-20 w-full rounded-tl-[60px] md:rounded-tl-[80px] shadow-lg">
          <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="max-w-full mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                className="group relative bg-white rounded-2xl md:rounded-3xl p-8 sm:p-10 md:p-12 shadow-lg border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 to-transparent rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="relative">
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                    Ready to Find Your Next Car?
                  </h2>
                  <p className="text-slate-600 mb-8 text-lg max-w-2xl mx-auto">
                    Join thousands of buyers who trust Okara Auto Auction
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
                    <Link to={registerLink}>
                      <Button size="lg" className="w-full sm:w-auto">
                        {ctaLabel} <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    <Link to="/auctions/schedule">
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full sm:w-auto"
                      >
                        <Calendar className="w-5 h-5 mr-2" /> View Schedule
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
