import React from "react";
import { Link } from "react-router-dom";
import SEO from "../../../components/common/SEO";

export default function SellerAuctionDashboard() {
  return (
    <>
      <SEO
        title="Seller Auction Dashboard | Sello.pk"
        description="Manage your seller-side auction workflow on Sello.pk. Access seller dashboards, transaction tools, and live auction entry points from one place."
        canonical="https://sello.pk/auctions/seller-dashboard"
      />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Seller Auction Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Seller auction operations are integrated with your existing seller/dealer dashboards.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <Link className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow" to="/seller/dashboard">
            Open Seller Dashboard
          </Link>
          <Link className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow" to="/dealer/dashboard">
            Open Dealer Dashboard
          </Link>
          <Link className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow" to="/auctions/transactions">
            Seller/Buyer Transactions
          </Link>
          <Link className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow" to="/auctions/live">
            Browse Live Auction
          </Link>
        </div>
        </div>
      </div>
    </>
  );
}
