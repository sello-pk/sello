import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  IoShieldCheckmarkOutline as ShieldCheck,
  IoWalletOutline as Wallet,
  IoCheckmarkCircleOutline as CheckCircle,
  IoInformationCircleOutline as Info,
  IoArrowBack as ArrowLeft,
} from "react-icons/io5";
import { useSubmitTokenPaymentMutation, useGetMyTokenPaymentsQuery, useGetMyAuctionAccessStatusQuery } from "@redux/services/api";

const Badge = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>{children}</span>
);

const Button = ({ children, variant = "default", className = "", disabled, ...props }) => {
  const v = {
    default: "bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] shadow-lg shadow-[#FFA602]/30",
    outline: "border-2 border-slate-300 text-slate-700 hover:bg-slate-100",
  };
  return <button className={`inline-flex items-center justify-center font-medium px-6 py-3 text-sm transition-all duration-300 rounded-lg focus:outline-none disabled:opacity-50 ${v[variant]} ${className}`} disabled={disabled} {...props}>{children}</button>;
};

const paymentMethods = [
  { id: "jazzcash", name: "JazzCash", color: "bg-red-50 border-red-200", textColor: "text-red-700", account: "0300-XXXXXXX" },
  { id: "easypaisa", name: "EasyPaisa", color: "bg-green-50 border-green-200", textColor: "text-green-700", account: "0345-XXXXXXX" },
  { id: "bank_transfer", name: "Bank Transfer", color: "bg-blue-50 border-blue-200", textColor: "text-blue-700", account: "HBL - IBAN PK36..." },
];

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  refunded: "bg-blue-100 text-blue-700",
};

export default function TokenPayment() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [transactionId, setTransactionId] = useState("");

  const { data: tokenData, isLoading } = useGetMyTokenPaymentsQuery();
  const { data: auctionAccess } = useGetMyAuctionAccessStatusQuery();
  const [submitPayment, { isLoading: submitting }] = useSubmitTokenPaymentMutation();

  const handleSubmit = async () => {
    if (!selectedMethod || !transactionId.trim()) return toast.error("Please select method and enter transaction ID");
    try {
      await submitPayment({ paymentMethod: selectedMethod, transactionId: transactionId.trim() }).unwrap();
      toast.success("Payment submitted! Awaiting verification.");
      navigate("/auctions/live");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit payment");
    }
  };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p>Loading...</p></div>;

  const hasVerified = tokenData?.hasVerifiedToken;
  const payments = tokenData?.payments || [];
  const bidderStatus = auctionAccess?.auctionCapabilities?.auctionBidder?.status || "not_requested";
  const dealerStatus = auctionAccess?.auctionCapabilities?.auctionDealer?.status || "not_requested";
  const hasAuctionAccess = bidderStatus === "approved" || dealerStatus === "approved";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="w-5 h-5" />Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Bid Token Payment</h1>
          <p className="text-slate-500 mb-8">Pay a refundable PKR 10,000 deposit to start bidding</p>

          {!hasAuctionAccess ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
              <Info className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-amber-700 mb-2">Auction access required</h2>
              <p className="text-amber-700 mb-2">
                Your bidder/dealer request must be approved before token payments are accepted.
              </p>
              <p className="text-sm text-amber-600 mb-6">Current bidder status: {bidderStatus.replaceAll("_", " ")}</p>
              <Button onClick={() => navigate("/profile")}>Go to Profile</Button>
            </div>
          ) : hasVerified ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">Token Verified!</h2>
              <p className="text-emerald-600 mb-6">You're all set to bid. Your token balance: PKR {tokenData.tokenBalance?.toLocaleString()}</p>
              <Button onClick={() => navigate("/auctions/live")}>Go to Live Auction</Button>
            </div>
          ) : (
            <>
              {/* Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex gap-4">
                <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">How it works</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>1. Send PKR 10,000 to the account below</li>
                    <li>2. Enter your transaction ID here</li>
                    <li>3. We'll verify within 1-2 hours</li>
                    <li>4. Token is fully refundable if you don't win</li>
                  </ul>
                </div>
              </div>

              {/* Method selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-slate-900 mb-3">Select Payment Method</h3>
                <div className="grid gap-3">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${selectedMethod === m.id ? `${m.color} border-[#FFA602] ring-2 ring-[#FFA602]/20` : "bg-white border-slate-200 hover:bg-slate-50"}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`font-semibold ${m.textColor}`}>{m.name}</p>
                          <p className="text-sm text-slate-500 mt-1">Send to: {m.account}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === m.id ? "border-[#FFA602] bg-[#FFA602]" : "border-slate-300"}`}>
                          {selectedMethod === m.id && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Transaction ID / Reference</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction reference number"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA602]"
                />
              </div>

              <Button onClick={handleSubmit} disabled={submitting || !selectedMethod || !transactionId.trim()} className="w-full">
                <Wallet className="w-5 h-5 mr-2" />{submitting ? "Submitting..." : "Submit Payment"}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500">
                <ShieldCheck className="w-4 h-4" />
                <span>Secure & refundable deposit</span>
              </div>
            </>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="mt-10">
              <h3 className="font-semibold text-slate-900 mb-4">Payment History</h3>
              <div className="space-y-3">
                {payments.map((p) => (
                  <div key={p._id} className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900">PKR {p.amount?.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{p.paymentMethod} — {p.transactionId}</p>
                      <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Badge className={statusColors[p.status] || ""}>{p.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
