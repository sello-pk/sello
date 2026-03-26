import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  IoShieldCheckmarkOutline as ShieldCheck,
  IoWalletOutline as Wallet,
  IoCheckmarkCircleOutline as CheckCircle,
  IoInformationCircleOutline as Info,
  IoArrowBack as ArrowLeft,
  IoCallOutline as Phone,
  IoCopyOutline as Copy,
  IoCloseOutline as Close,
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
      className={`inline-flex items-center justify-center font-medium px-5 py-2.5 text-sm transition-all duration-300 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${v[variant]} ${className}`}
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

const getLatestAuctionSettlement = (payment) => {
  const settlements = Array.isArray(payment?.auctionSettlements)
    ? [...payment.auctionSettlements]
    : [];
  if (!settlements.length) return null;
  settlements.sort(
    (a, b) =>
      new Date(b?.processedAt || b?.createdAt || 0).getTime() -
      new Date(a?.processedAt || a?.createdAt || 0).getTime(),
  );
  return settlements[0];
};

export default function TokenPayment() {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [detailsMethodId, setDetailsMethodId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [receiptName, setReceiptName] = useState("");

  const { data: tokenData, isLoading } = useGetMyTokenPaymentsQuery(
    undefined,
    {
      pollingInterval: 15000,
      refetchOnMountOrArgChange: true,
    },
  );
  const { data: auctionAccess } = useGetMyAuctionAccessStatusQuery();
  const { data: tokenMeta } = useGetTokenPaymentMetaQuery();
  const [submitPayment, { isLoading: submitting }] = useSubmitTokenPaymentMutation();

  const tokenDepositAmount = tokenMeta?.tokenDepositAmount || tokenData?.tokenDepositAmount || 10000;
  const paymentWindowHours = tokenMeta?.paymentWindowHours || tokenData?.paymentWindowHours || 48;
  const supportPhone = tokenMeta?.supportPhone || "0300-1234567";

  const methods = useMemo(() => {
    const fallback = [
      { id: "jazzcash", name: "JazzCash", accountName: "Okara Auto Auction", accountLabel: "Send to", accountValue: "0300-1234567" },
      { id: "easypaisa", name: "EasyPaisa", accountName: "Okara Auto Auction", accountLabel: "Send to", accountValue: "0300-7654321" },
      {
        id: "bank_transfer",
        name: "Bank Transfer",
        accountName: "SELLO",
        accountLabel: "UBL Account",
        accountValue: "A/C: 349170949 | IBAN: PK95UNIL0109000349170949",
      },
    ];

    if (!Array.isArray(tokenMeta?.methods) || tokenMeta.methods.length === 0) {
      return fallback;
    }

    const normalized = tokenMeta.methods
      .map((m) => {
        const name = String(m?.name || m?.title || m?.method || "").trim();
        const idSource = String(m?.id || m?.method || name || "").trim();
        const id = idSource
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        const accountName = String(
          m?.accountName || m?.receiverName || m?.beneficiary || "Okara Auto Auction",
        ).trim();
        const accountLabel = String(
          m?.accountLabel || m?.label || "Account/Number",
        ).trim();
        const accountValue = String(
          m?.accountValue || m?.number || m?.account || m?.accountNumber || "",
        ).trim();

        return { id, name, accountName, accountLabel, accountValue };
      })
      .filter((m) => m.id && m.name && m.accountValue);

    return normalized.length > 0 ? normalized : fallback;
  }, [tokenMeta]);

  const selectedMethodData = methods.find((m) => m.id === selectedMethod) || null;
  const detailsMethodData = methods.find((m) => m.id === detailsMethodId) || null;
  const selectedMethodValueParts = String(selectedMethodData?.accountValue || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
  const detailsMethodValueParts = String(detailsMethodData?.accountValue || "")
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  useEffect(() => {
    if (methods.length === 0) return;
    const stillValid = methods.some((m) => m.id === selectedMethod);
    if (!stillValid) {
      setSelectedMethod(methods[0].id);
    }
  }, [methods, selectedMethod]);

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
      toast.success("Payment submitted. You can bid after admin verifies it.");
      setTransactionId("");
      setReceiptUrl("");
      setReceiptName("");
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
    <div className="min-h-screen bg-slate-100 pb-8">
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-3"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <h1 className="text-2xl font-bold">Token Payment</h1>
          <p className="text-slate-300 mt-1 text-sm">
            Secure token verification with a refundable deposit. Once approved, the token amount is credited to your auction wallet, unlocks bidding access, and any loser settlement is shown here after the auction ends.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {hasVerified ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-6 text-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-emerald-700 mb-1">Token Verified</h2>
            <p className="text-slate-600 mb-4 text-sm">
              Your token is verified. This refundable deposit is now credited to your auction wallet and works as your bidding access pass for live auctions.
            </p>
            <Button onClick={() => navigate("/auctions/live")}>Go to Live Auction</Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
                <div className="p-4">
                  <div className="grid md:grid-cols-2 gap-3">
                  <div className="rounded-2xl p-4 bg-gradient-to-r from-primary to-primary text-white">
                    <div className="flex items-center justify-between">
                      <p className="text-xs opacity-90">Token Amount</p>
                      <span className="text-xs bg-white/20 rounded-full px-2 py-1">Refundable</span>
                    </div>
                    <p className="text-3xl font-bold mt-2">PKR {Number(tokenDepositAmount).toLocaleString()}</p>
                    <p className="text-xs mt-1 opacity-90">Applied to your first winning bid.</p>
                  </div>

                  <div className="rounded-2xl p-4 border border-slate-200 bg-slate-50">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold mb-2">
                      <Wallet className="w-5 h-5" /> Your Token Balance
                    </div>
                    <p className="text-3xl font-bold text-slate-900">PKR {Number(walletBalance).toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">Current balance</p>
                  </div>
                </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Select Payment Method</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {methods.map((method) => {
                    const Icon = iconByMethod[method.id] || Card;
                    const active = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method.id)}
                        className={`w-full min-w-0 rounded-xl border p-3 text-left transition ${active ? "border-primary bg-primary/5" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-500"}`}>
                              <Icon className="w-5 h-5" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{method.name}</p>
                              <p className="text-sm text-slate-500 truncate">{method.accountLabel}: {method.accountValue}</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailsMethodId(method.id);
                                }}
                                className="mt-1 text-xs font-semibold text-primary hover:underline"
                              >
                                View details
                              </button>
                            </div>
                          </div>
                          {active && <CheckCircle className="w-5 h-5 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Payment Instructions</h3>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 mb-3">
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
                        <div className="font-semibold text-slate-900">
                          {selectedMethodValueParts.length > 0 ? (
                            selectedMethodValueParts.map((part) => (
                              <p key={part} className="leading-6 break-all">
                                {part}
                              </p>
                            ))
                          ) : (
                            <p>Select a payment method</p>
                          )}
                        </div>
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
                  <label className="block text-sm font-semibold text-slate-700 mt-3 mb-2">
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
                      className="mt-2 max-h-36 rounded-lg border border-slate-200"
                    />
                  )}
                  <p className="text-xs text-slate-500 mt-2">Verification typically takes 1-2 hours during business hours.</p>

                  {!hasAuctionAccess && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-700">
                      Bidding still requires auction approval (current status: {bidderStatus.replaceAll("_", " ")}).
                      <Link to="/profile?section=auction-access" className="ml-1 font-semibold underline">Request access</Link>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedMethod || !transactionId.trim() || !receiptUrl.trim()}
                    className="w-full mt-4"
                  >
                    {submitting ? "Submitting..." : "Confirm Payment"}
                  </Button>
                </div>
              </div>
            </motion.div>

            <motion.aside initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
                <div className="p-4 bg-slate-900 text-white">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <h4 className="font-semibold text-sm">Secure Payment</h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Your payment information is encrypted. We never store sensitive financial details.
                  </p>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1.5">Need help?</h4>
                  <p className="text-xs text-slate-600 mb-2">Contact support for payment assistance.</p>
                  <a href={`tel:${supportPhone}`} className="inline-flex items-center gap-2 text-primary font-semibold text-sm">
                    <Phone className="w-4 h-4" /> {supportPhone}
                  </a>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1.5">Refund Policy</h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> Losing bidders keep the refundable balance after a PKR 500 participation fee</li>
                    <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5" /> Winner token is handled separately as part of the winning payment flow</li>
                    <li className="flex items-start gap-2"><Info className="w-3.5 h-3.5 text-primary mt-0.5" /> Wallet and token history update automatically after settlement</li>
                    <li className="flex items-start gap-2"><Info className="w-3.5 h-3.5 text-primary mt-0.5" /> Winner pays remaining amount within {paymentWindowHours} hours</li>
                  </ul>
                </div>
              </div>
            </motion.aside>
          </div>
        )}

        {payments.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 mb-3">Payment History</h3>
            <div className="space-y-2.5">
              {payments.map((payment) => {
                const latestSettlement = getLatestAuctionSettlement(payment);
                return (
                  <div key={payment._id} className="border border-slate-200 rounded-xl p-3 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">PKR {Number(payment.amount || 0).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{payment.paymentMethod} - {payment.transactionId}</p>
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
                        <p className="text-[11px] text-slate-400">{new Date(payment.createdAt).toLocaleString()}</p>
                      </div>
                      <StatusBadge status={payment.status} />
                    </div>
                    {latestSettlement?.outcome === "loser" && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        Auction ended. PKR {Number(latestSettlement.refundAmount || 0).toLocaleString()} remains in your wallet after a PKR {Number(latestSettlement.feeAmount || 0).toLocaleString()} participation fee.
                      </div>
                    )}
                    {latestSettlement?.outcome === "winner" && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        Congratulations! You won the auction. Please proceed with the next payment steps.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {detailsMethodData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailsMethodId("")} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h4 className="font-semibold text-slate-900">{detailsMethodData.name} Details</h4>
              <button
                type="button"
                onClick={() => setDetailsMethodId("")}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100"
              >
                <Close className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-500">Account Title</p>
                <p className="font-semibold text-slate-900 mt-0.5">{detailsMethodData.accountName}</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{detailsMethodData.accountLabel}</p>
                <div className="font-semibold text-slate-900 mt-0.5">
                  {detailsMethodValueParts.map((part) => (
                    <p key={part} className="leading-6 break-all">
                      {part}
                    </p>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCopy(detailsMethodData.accountName)}
                >
                  Copy title
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleCopy(detailsMethodData.accountValue)}
                >
                  Copy details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
