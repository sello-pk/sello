import React from "react";
import { Link } from "react-router-dom";
import SEO from "../../../components/common/SEO";

export default function BuyerDashboard() {
  return (
    <>
      <SEO
        title="Buyer Dashboard - Live Auctions & Bidding | Sello.pk"
        description="Access your buyer dashboard for live car auctions. View bidding history, manage watchlist, make token payments, and track transactions."
        keywords="buyer dashboard, car auctions, live bidding, auction wallet, token payment, watchlist"
        canonical="https://sello.pk/auctions/buyer-dashboard"
      />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Buyer Auction Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Quick access to live bidding, results, escrow, wallet and token
            payments.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Link
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow"
              to="/auctions/live"
            >
              Live Auction
            </Link>
            <Link
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow"
              to="/auctions/transactions"
            >
              Buyer Transactions
            </Link>
            <Link
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow"
              to="/auctions/token-payment"
            >
              Token Payment
            </Link>
            <Link
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow"
              to="/auctions/watchlist"
            >
              Watchlist
            </Link>
            <Link
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow"
              to="/auctions/schedule"
            >
              Auction Schedule
            </Link>
            <Link
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow"
              to="/seller/dashboard"
            >
              Seller/Dealer Area
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
