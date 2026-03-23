import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  IoShieldCheckmarkOutline as ShieldCheck,
  IoWalletOutline as Wallet,
  IoCheckmarkCircleOutline as CheckCircle,
  IoInformationCircleOutline as Info,
  IoArrowBack as ArrowLeft,
  IoCallOutline as Phone,
  IoCopyOutline as Copy,
  IoCardOutline as Card,
  IoPhonePortraitOutline as PhonePayment,
  IoBusinessOutline as Bank,
} from "react-icons/io5";
import {
  useSubmitTokenPaymentMutation,
  useGetMyTokenPaymentsQuery,
  useGetMyAuctionAccessStatusQuery,
  useGetTokenPaymentMetaQuery,
} from "@redux/services/api";

const Button = ({
  children,
  variant = "default",
  className = "",
  disabled,
  ...props
}) => {
  const v = {
    default:
      "bg-gradient-to-r from-primary to-amber-500 text-white hover:from-amber-500 hover:to-primary shadow-lg shadow-primary/30",
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-100",
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-medium px-6 py-3 text-sm transition-all duration-300 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${v[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const StatusBadge = ({ status }) => {
  const classes = {
    pending: "bg-amber-100 text-amber-700",
    verified: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    refunded: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${classes[status] || "bg-slate-100 text-slate-700"}`}>
      {status || "unknown"}
    </span>
  );
};

const iconByMethod = {
  jazzcash: PhonePayment,
  easypaisa: PhonePayment,
  bank_transfer: Bank,
};

export default function TokenPayment() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptName, setReceiptName] = useState("");

  const { data: tokenData, isLoading } = useGetMyTokenPaymentsQuery();
  const { data: auctionAccess } = useGetMyAuctionAccessStatusQuery();
  const { data: tokenMeta } = useGetTokenPaymentMetaQuery();
  const [submitPayment, { isLoading: submitting }] = useSubmitTokenPaymentMutation();

  const tokenDepositAmount = tokenMeta?.tokenDepositAmount || tokenData?.tokenDepositAmount || 10000;
  const paymentWindowHours = tokenMeta?.paymentWindowHours || tokenData?.paymentWindowHours || 48;
  const supportPhone = tokenMeta?.supportPhone || "0300-1234567";

  const methods = useMemo(() => {
    if (Array.isArray(tokenMeta?.methods) && tokenMeta.methods.length > 0) {
      return tokenMeta.methods;
    }
    return [
      { id: "jazzcash", name: "JazzCash", accountName: "Okara Auto Auction", accountLabel: "Send to", accountValue: "0300-1234567" },
      { id: "easypaisa", name: "EasyPaisa", accountName: "Okara Auto Auction", accountLabel: "Send to", accountValue: "0300-7654321" },
      { id: "bank_transfer", name: "Bank Transfer", accountName: "Okara Auto Auction Pvt Ltd", accountLabel: "HBL Account", accountValue: "1234567890" },
    ];
  }, [tokenMeta]);

  const selectedMethodData = methods.find((m) => m.id === selectedMethod) || null;

  const handleSubmit = async () => {
    if (!selectedMethod || !transactionId.trim() || !receiptUrl.trim()) {
      toast.error("Please select method, add transaction ID, and upload receipt proof");
      return;
    }
    try {
      await submitPayment({
        paymentMethod: selectedMethod,
        transactionId: transactionId.trim(),
        receiptUrl: receiptUrl.trim(),
      }).unwrap();
      toast.success("Payment submitted. Verification in progress.");
      navigate("/auctions/live");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit payment");
    }
  };

  const handleCopy = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleReceiptFile = (file) => {
    if (!file) return;
    const maxMb = 6;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`Receipt image must be smaller than ${maxMb}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptUrl(String(reader.result || ""));
      setReceiptName(file.name);
    };
    reader.onerror = () => toast.error("Failed to read receipt file");
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading token payment...</p>
      </div>
    );
  }

  const hasVerified = tokenData?.hasVerifiedToken;
  const payments = tokenData?.payments || [];
  const walletBalance = tokenData?.tokenBalance || 0;
  const bidderStatus = auctionAccess?.auctionCapabilities?.auctionBidder?.status || "not_requested";
  const dealerStatus = auctionAccess?.auctionCapabilities?.auctionDealer?.status || "not_requested";
  const hasAuctionAccess = bidderStatus === "approved" || dealerStatus === "approved";

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-5"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-3xl font-bold">Token Payment</h1>
          <p className="text-slate-300 mt-2">
            Secure your bidding access with a refundable deposit.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {hasVerified ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center shadow-sm">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-emerald-700 mb-2">Token Verified</h2>
            <p className="text-slate-600 mb-6">
              You can place bids now. Available token balance: PKR {Number(walletBalance).toLocaleString()}.
            </p>
            <Button onClick={() => navigate("/auctions/live")}>Go to Live Auction</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-5 bg-gradient-to-r from-primary to-amber-500 text-white">
                    <div className="flex items-center justify-between">
                      <p className="text-sm opacity-90">Token Amount</p>
                      <span className="text-xs bg-white/20 rounded-full px-2 py-1">Refundable</span>
                    </div>
                    <p className="text-5xl font-bold mt-2">PKR {Number(tokenDepositAmount).toLocaleString()}</p>
                    <p className="text-sm mt-2 opacity-90">This amount is applied to your first winning bid.</p>
                  </div>

                  <div className="rounded-2xl p-5 border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                      <Wallet className="w-5 h-5" /> Your Token Balance
                    </div>
                    <p className="text-4xl font-bold text-slate-900">PKR {Number(walletBalance).toLocaleString()}</p>
                    <p className="text-sm text-slate-500 mt-1">Current balance</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Select Payment Method</h3>
                <div className="space-y-3">
                  {methods.map((method) => {
                    const Icon = iconByMethod[method.id] || Card;
                    const active = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${active ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}>
                              <Icon className="w-5 h-5" />
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">{method.name}</p>
                              <p className="text-sm text-slate-500">{method.accountLabel}: {method.accountValue}</p>
                            </div>
                          </div>
                          {active && <CheckCircle className="w-5 h-5 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Payment Instructions</h3>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-4">
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-[140px_1fr_auto] gap-2 items-center">
                      <p className="text-slate-500">Account Name</p>
                      <p className="font-semibold text-slate-900">
                        {selectedMethodData?.accountName || "Select a payment method"}
                      </p>
                      {selectedMethodData?.accountName && (
                        <button
                          onClick={() => handleCopy(selectedMethodData.accountName)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-[140px_1fr_auto] gap-2 items-center">
                      <p className="text-slate-500">Account/Number</p>
                      <p className="font-semibold text-slate-900">{selectedMethodData?.accountValue || "Select a payment method"}</p>
                      {selectedMethodData?.accountValue && (
                        <button
                          onClick={() => handleCopy(selectedMethodData.accountValue)}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">Transaction ID / Reference Number *</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter your transaction ID"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <label className="block text-sm font-semibold text-slate-700 mt-4 mb-2">
                  Upload Receipt Proof *
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleReceiptFile(e.target.files?.[0])}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white"
                />
                {receiptName && (
                  <p className="text-xs text-slate-500 mt-2">Selected: {receiptName}</p>
                )}
                {!receiptName && (
                  <p className="text-xs text-slate-500 mt-2">
                    Upload screenshot/photo/PDF receipt as payment proof.
                  </p>
                )}
                {receiptUrl?.startsWith("data:image/") && (
                  <img
                    src={receiptUrl}
                    alt="Receipt preview"
                    className="mt-3 max-h-44 rounded-lg border border-slate-200"
                  />
                )}
                <p className="text-sm text-slate-500 mt-2">Verification typically takes 1-2 hours during business hours.</p>

                {!hasAuctionAccess && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
                    Bidding still requires auction approval (current status: {bidderStatus.replaceAll("_", " ")}).
                    <Link to="/profile?section=auction-access" className="ml-1 font-semibold underline">Request access</Link>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedMethod || !transactionId.trim() || !receiptUrl.trim()}
                  className="w-full mt-5"
                >
                  {submitting ? "Submitting..." : "Confirm Payment"}
                </Button>
              </div>
            </motion.div>

            <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-3">Refund Policy</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" /> Full refund if you don't win any auction</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" /> Token deducted from winning amount</li>
                  <li className="flex items-start gap-2"><Info className="w-4 h-4 text-amber-500 mt-0.5" /> Refunds processed within 5-7 business days</li>
                  <li className="flex items-start gap-2"><Info className="w-4 h-4 text-amber-500 mt-0.5" /> Winner must complete remaining payment within {paymentWindowHours} hours</li>
                </ul>
              </div>

              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold">Secure Payment</h4>
                </div>
                <p className="text-sm text-slate-300">Your payment information is encrypted. We never store sensitive financial details.</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 shadow-sm">
                <h4 className="font-semibold text-slate-900 mb-2">Need help?</h4>
                <p className="text-sm text-slate-600 mb-2">Contact support for payment assistance.</p>
                <a href={`tel:${supportPhone}`} className="inline-flex items-center gap-2 text-blue-700 font-semibold">
                  <Phone className="w-4 h-4" /> {supportPhone}
                </a>
              </div>
            </motion.aside>
          </div>
        )}

        {payments.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment History</h3>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment._id} className="border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">PKR {Number(payment.amount || 0).toLocaleString()}</p>
                    <p className="text-sm text-slate-500">{payment.paymentMethod} - {payment.transactionId}</p>
                    {payment.receiptUrl && (
                      <a
                        href={payment.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        View receipt proof
                      </a>
                    )}
                    <p className="text-xs text-slate-400">{new Date(payment.createdAt).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={payment.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
