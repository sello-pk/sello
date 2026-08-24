import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IoTrophyOutline as Trophy,
  IoCarSportOutline as Car,
  IoWalletOutline as Wallet,
  IoLocationOutline as MapPin,
  IoTimeOutline as Clock,
  IoCheckmarkCircleOutline as CheckCircle,
  IoArrowForward as ArrowRight,
} from "react-icons/io5";
import { useGetMyAuctionResultQuery } from "@redux/services/api";
import SEO from "../../../components/common/SEO";

const formatPrice = (p) => `PKR ${p?.toLocaleString() || 0}`;

const Badge = ({ children, className = "" }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
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
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-medium px-6 py-3 text-sm transition-all duration-300 rounded-lg focus:outline-none ${v[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default function AuctionResult() {
  const location = useLocation();
  const carId = new URLSearchParams(location.search).get("car_id");

  const {
    data: result,
    isLoading,
    isError,
  } = useGetMyAuctionResultQuery(carId, {
    skip: !carId,
  });
  const car = result?.car || {};
  const pageTitle =
    result?.status === "sold" && (car?.title || (car?.make && car?.model))
      ? `Auction Result for ${car.title || `${car.year || ""} ${car.make} ${car.model}`} | Sello.pk`
      : "Auction Result | Sello.pk";
  const pageDescription =
    result?.status === "sold"
      ? "View your auction result, winning bid summary, payment breakdown, and pickup instructions for your purchased vehicle on Sello.pk."
      : "View your auction result and transaction status for Sello.pk car auctions.";
  const canonicalUrl = `https://sello.pk${location.pathname}${location.search}`;

  if (isLoading) {
    return (
      <>
        <SEO
          title={pageTitle}
          description={pageDescription}
          canonical={canonicalUrl}
        />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  if (isError || !result) {
    return (
      <>
        <SEO
          title={pageTitle}
          description={pageDescription}
          canonical={canonicalUrl}
        />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              Access Restricted
            </h2>
            <p className="text-slate-500 mb-6">
              You can only view results for auctions you have won.
            </p>
            <Link to="/auctions/transactions">
              <Button>Go to My Transactions</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (result.status !== "sold") {
    return (
      <>
        <SEO
          title={pageTitle}
          description={pageDescription}
          canonical={canonicalUrl}
        />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-700 mb-2">
              No Results Found
            </h2>
            <p className="text-slate-500 mb-6">
              This car doesn't have auction results yet.
            </p>
            <Link to="/auctions">
              <Button>Back to Auctions</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const escrowRecord = result.escrow || null;
  const tokenDeduction =
    escrowRecord?.tokenDeduction ?? Math.min(10000, result.finalPrice || 0);
  const amountDue =
    escrowRecord?.amountDue ??
    Math.max(0, (result.finalPrice || 0) - tokenDeduction);
  const img = Array.isArray(car.images) ? car.images[0] : car.images;

  return (
    <>
      <SEO
        title={pageTitle.replace(/\s+/g, " ").trim()}
        description={pageDescription}
        canonical={canonicalUrl}
      />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Success Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white mb-8 shadow-xl">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Congratulations!
            </h1>
            <p className="text-emerald-100 text-lg">You've won this auction</p>
          </div>

          {/* Car Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-8">
            <div className="grid md:grid-cols-2">
              <div className="h-64 bg-slate-100">
                {img && (
                  <img
                    src={img}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-6 flex flex-col justify-center">
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {car.title || `${car.year} ${car.make} ${car.model}`}
                </h2>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <p>
                    {car.mileage?.toLocaleString()} km • {car.fuelType} •{" "}
                    {car.transmission}
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 w-fit">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Won
                </Badge>
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#FFA602]" />
              Payment Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Final Bid Price</span>
                <span className="font-semibold text-slate-900">
                  {formatPrice(result.finalPrice)}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-slate-600">Token Deposit (Deducted)</span>
                <span className="font-semibold text-emerald-600">
                  - {formatPrice(tokenDeduction)}
                </span>
              </div>
              <div className="flex justify-between py-3 bg-[#FFA602]/5 -mx-6 px-6 rounded-xl">
                <span className="font-semibold text-slate-900 text-lg">
                  Amount Due
                </span>
                <span className="font-bold text-[#FFA602] text-xl">
                  {formatPrice(amountDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Pickup */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h3 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FFA602]" />
              Vehicle Pickup
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-medium text-slate-900">
                Okara Auction Yard, Punjab
              </p>
              <div className="flex items-center gap-2 text-amber-600">
                <Clock className="w-4 h-4" />
                <span>
                  {escrowRecord?.paymentDeadline
                    ? `Payment due by ${new Date(escrowRecord.paymentDeadline).toLocaleString()}`
                    : "Payment due within 48 hours of winning"}
                </span>
              </div>
              <p className="text-slate-500">
                Bring original CNIC, payment receipt, and auction confirmation
                email.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/auctions/transactions" className="flex-1">
              <Button className="w-full">
                <Wallet className="w-5 h-5 mr-2" />
                View My Transactions
              </Button>
            </Link>
            <Link to="/auctions" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Auctions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
        </div>
      </div>
    </>
  );
}
