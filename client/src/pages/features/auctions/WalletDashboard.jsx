import React from "react";
import { Link } from "react-router-dom";
import SEO from "../../../components/common/SEO";

export default function WalletDashboard() {
  return (
    <>
      <SEO
        title="Auction Wallet Dashboard | Sello.pk"
        description="Access your auction wallet dashboard on Sello.pk to review balances, deposits, refunds, token payments, and escrow-related actions."
        canonical="https://sello.pk/auctions/wallet"
      />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Auction Wallet Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Wallet balance, deposits, refunds, token payments and escrow all live in transactions.
        </p>
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-sm text-slate-600 mb-4">
            Use the full transaction center to manage financial actions.
          </p>
          <Link
            to="/auctions/transactions"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#FFA602] text-white font-medium"
          >
            Open Buyer Transactions
          </Link>
        </div>
        </div>
      </div>
    </>
  );
}
