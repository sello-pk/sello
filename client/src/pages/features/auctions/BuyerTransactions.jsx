import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  IoWalletOutline as WalletIcon,
  IoTrophyOutline as Trophy,
  IoShieldCheckmarkOutline as ShieldCheck,
  IoCarSportOutline as Car,
  IoReceiptOutline as Receipt,
  IoTimeOutline as Clock,
  IoCheckmarkCircleOutline as CheckCircle,
  IoAlertCircleOutline as AlertCircle,
  IoTrendingUpOutline as TrendingUp,
  IoArrowUpOutline as ArrowUp,
  IoArrowDownOutline as ArrowDown,
  IoListOutline as ListIcon,
  IoAddCircleOutline as PlusCircle,
  IoReturnDownBackOutline as Undo,
  IoCloseOutline as XIcon,
} from "react-icons/io5";
import { GiGavel as Gavel } from "react-icons/gi";
import {
  useGetMyBidsQuery,
  useGetMyWonAuctionsQuery,
  useGetMyEscrowsQuery,
  usePayEscrowMutation,
  useRaiseEscrowDisputeMutation,
  useGetMyTokenPaymentsQuery,
  useGetMyWalletTransactionsQuery,
  useGetMyWalletQuery,
  useCreateDepositMutation,
  useGetMyDepositsQuery,
  useCreateRefundRequestMutation,
  useGetMyRefundRequestsQuery,
  useGetMyAuctionAccessStatusQuery,
} from "@redux/services/api";
import SEO from "../../../components/common/SEO";

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
    outline: "border border-slate-300 text-slate-700 hover:bg-slate-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-emerald-500 text-white hover:bg-emerald-600",
  };
  return (
    <button
      className={`inline-flex items-center justify-center font-medium px-4 py-2 text-sm transition-all duration-300 rounded-lg focus:outline-none disabled:opacity-50 ${v[variant] || v.default} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const formatPrice = (p) => `PKR ${(p || 0).toLocaleString()}`;

const escrowColors = {
  pending: "bg-amber-100 text-amber-700",
  in_escrow: "bg-blue-100 text-blue-700",
  released: "bg-emerald-100 text-emerald-700",
  refunded: "bg-slate-100 text-slate-600",
  disputed: "bg-red-100 text-red-700",
};

const txnTypeLabels = {
  token_deposit: "Token Deposit",
  token_refund: "Token Refund",
  escrow_payment: "Escrow Payment",
  escrow_release: "Escrow Released",
  escrow_refund: "Escrow Refund",
  platform_fee: "Participation Fee",
  deposit: "Deposit",
  bid_hold: "Bid Hold",
  bid_refund: "Bid Refund",
  bid_lock: "Bid Locked",
  withdrawal: "Withdrawal",
  refund: "Refund",
  admin_credit: "Admin Credit",
  admin_debit: "Admin Debit",
  penalty: "Penalty",
  dealer_commission: "Dealer Commission",
  inspection_fee: "Inspection Fee",
};

const tabs = [
  { id: "bids", label: "My Bids", icon: Gavel },
  { id: "won", label: "Won Auctions", icon: Trophy },
  { id: "escrow", label: "Escrow", icon: ShieldCheck },
  { id: "deposits", label: "Deposits", icon: PlusCircle },
  { id: "refunds", label: "Refunds", icon: Undo },
  { id: "tokens", label: "Token Payments", icon: Receipt },
  { id: "ledger", label: "Ledger", icon: ListIcon },
];

const depositMethods = [
  { id: "jazzcash", label: "JazzCash", account: "0300-XXXXXXX", color: "bg-red-50 border-red-200" },
  { id: "easypaisa", label: "EasyPaisa", account: "0345-XXXXXXX", color: "bg-green-50 border-green-200" },
  { id: "bank_transfer", label: "Bank Transfer", account: "UBL — A/C: 349170949 | IBAN: PK95UNIL0109000349170949 | Title: SELLO", color: "bg-blue-50 border-blue-200" },
  { id: "stripe", label: "Stripe", account: "Card / Online", color: "bg-indigo-50 border-indigo-200" },
  { id: "cash_office", label: "Cash at Office", account: "Okara Auction Yard, Punjab", color: "bg-amber-50 border-amber-200" },
];

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

const refundTypes = [
  {
    id: "no_bids",
    label: "Never placed any bid",
    desc: "Full refund minus platform fee",
  },
  {
    id: "lost_all",
    label: "Lost all auctions",
    desc: "Full refund minus platform fee",
  },
  {
    id: "declined_car",
    label: "Won but declined the car",
    desc: "Refund with penalty fee",
  },
  {
    id: "partial",
    label: "Partial withdrawal",
    desc: "Partial refund as per admin rules",
  },
  {
    id: "withdrawal",
    label: "Withdraw balance",
    desc: "Request withdrawal; admin will approve or reject",
  },
  { id: "other", label: "Other reason", desc: "Subject to admin review" },
];

export default function BuyerTransactions() {
  const [activeTab, setActiveTab] = useState("bids");
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [depositData, setDepositData] = useState({
    amount: "",
    method: "",
    transactionId: "",
    receiptUrl: "",
    notes: "",
  });
  const [refundData, setRefundData] = useState({
    amount: "",
    type: "",
    reason: "",
  });

  const { data: myBids = [], isLoading: bidsLoading } = useGetMyBidsQuery();
  const { data: wonAuctions = [], isLoading: wonLoading } =
    useGetMyWonAuctionsQuery();
  const { data: escrows = [], isLoading: escrowLoading, refetch: refetchEscrows } =
    useGetMyEscrowsQuery();
  const [payEscrow, { isLoading: payingEscrow }] = usePayEscrowMutation();
  const [raiseEscrowDispute, { isLoading: raisingDispute }] =
    useRaiseEscrowDisputeMutation();
  const { data: tokenData, isLoading: tokenLoading } =
    useGetMyTokenPaymentsQuery(undefined, {
      pollingInterval: 15000,
      refetchOnMountOrArgChange: true,
    });
  const { data: walletData, isLoading: walletLoading } =
    useGetMyWalletTransactionsQuery(
      {},
      {
        pollingInterval: 15000,
        refetchOnMountOrArgChange: true,
      },
    );
  const { data: walletInfo } = useGetMyWalletQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
  });
  const {
    data: myDeposits = [],
    isLoading: depositsLoading,
    refetch: refetchDeposits,
  } = useGetMyDepositsQuery();
  const {
    data: myRefunds = [],
    isLoading: refundsLoading,
    refetch: refetchRefunds,
  } = useGetMyRefundRequestsQuery();
  const { data: auctionAccess } = useGetMyAuctionAccessStatusQuery();

  const [createDeposit, { isLoading: submittingDeposit }] =
    useCreateDepositMutation();
  const [createRefundRequest, { isLoading: submittingRefund }] =
    useCreateRefundRequestMutation();

  const wallet = walletInfo?.wallet;
  const walletSettings = walletInfo?.settings;
  const maxBidLimit = walletInfo?.maxBidLimit || 0;
  const bidderStatus =
    auctionAccess?.auctionCapabilities?.auctionBidder?.status ||
    "not_requested";
  const dealerStatus =
    auctionAccess?.auctionCapabilities?.auctionDealer?.status ||
    "not_requested";
  const hasAuctionAccess =
    bidderStatus === "approved" || dealerStatus === "approved";

  const tokenPayments = tokenData?.payments || [];
  const verifiedTokenAmount = tokenData?.tokenBalance || 0;
  const hasVerifiedToken = tokenData?.hasVerifiedToken || false;
  const walletTransactions = walletData?.transactions || [];
  const availableBalance = wallet?.availableBalance ?? (wallet ? Math.max(0, (wallet.balance || 0) - (wallet.totalBidHeld || 0)) : 0);
  const lockedTokens = wallet?.lockedTokens ?? wallet?.totalBidHeld ?? 0;
  const isFrozen = walletInfo?.isFrozen === true;

  const summaryCards = useMemo(() => {
    const walletSummary = walletData?.summary || {};
    const balance = wallet?.balance || 0;
    const activeEscrowCount = walletData?.activeEscrows || 0;
    const totalDeposited = wallet?.totalDeposited || 0;
    const totalSpent = Math.abs(
      (walletSummary.escrow_payment?.total || 0) +
        (walletSummary.bid_hold?.total || 0) +
        (walletSummary.bid_lock?.total || 0),
    );
    return { balance, availableBalance, lockedTokens, activeEscrowCount, totalDeposited, totalSpent };
  }, [wallet, walletData, availableBalance, lockedTokens]);

  const handleSubmitDeposit = async () => {
    if (!depositData.amount || !depositData.method) {
      return toast.error("Enter amount and select payment method");
    }
    try {
      await createDeposit({
        amount: Number(depositData.amount),
        method: depositData.method,
        transactionId: depositData.transactionId,
        receiptUrl: depositData.receiptUrl || undefined,
        notes: depositData.notes,
      }).unwrap();
      toast.success("Deposit submitted for approval");
      setShowDepositForm(false);
      setDepositData({ amount: "", method: "", transactionId: "", receiptUrl: "", notes: "" });
      refetchDeposits();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit deposit");
    }
  };

  const handleSubmitRefund = async () => {
    if (!refundData.amount || !refundData.type || !refundData.reason) {
      return toast.error("Fill all required fields");
    }
    try {
      await createRefundRequest({
        amount: Number(refundData.amount),
        type: refundData.type,
        reason: refundData.reason,
      }).unwrap();
      toast.success("Refund request submitted for review");
      setShowRefundForm(false);
      setRefundData({ amount: "", type: "", reason: "" });
      refetchRefunds();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to submit refund request");
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-emerald-100 text-emerald-700",
      rejected: "bg-red-100 text-red-700",
      processed: "bg-blue-100 text-blue-700",
      verified: "bg-emerald-100 text-emerald-700",
      refunded: "bg-slate-100 text-slate-600",
    };
    return map[status] || "bg-slate-100 text-slate-600";
  };

  return (
    <>
      <SEO
        title="Auction Transactions & Payments | Sello.pk"
        description="Manage your auction bids, won vehicles, escrow payments, deposits, refunds, and token transactions in one place on Sello.pk."
        canonical="https://sello.pk/auctions/transactions"
      />
      <div className="min-h-screen bg-slate-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <WalletIcon className="w-8 h-8 text-[#FFA602]" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              My Wallet & Transactions
            </h1>
            <p className="text-slate-500">
              Wallet balance, deposits, bids, and refunds
            </p>
          </div>
        </div>

        {/* Wallet Summary Cards */}
        {isFrozen && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            Your wallet is frozen. You cannot deposit or withdraw until an admin resolves this. Contact support.
          </div>
        )}
        {!hasAuctionAccess && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            Auction bidding access is not approved yet (status:{" "}
            {bidderStatus.replaceAll("_", " ")}). You can still manage deposits
            and refunds.{" "}
            <Link
              to="/profile?section=auction-access"
              className="underline font-medium"
            >
              Request/track access in Profile
            </Link>
            .
          </div>
        )}
        <div className="grid lg:grid-cols-[240px_1fr] gap-5">
          <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 h-fit lg:sticky lg:top-20">
            <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Wallet Menu
            </p>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-[#FFA602] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-5">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-[#FFA602] to-amber-500 rounded-xl p-4 shadow-lg text-white">
                <WalletIcon className="w-5 h-5 mb-1 opacity-80" />
                <p className="text-2xl font-bold">
                  {formatPrice(summaryCards.balance)}
                </p>
                <p className="text-xs opacity-80">Total Balance</p>
                <p className="text-[10px] mt-1 opacity-80">
                  Available: {formatPrice(summaryCards.availableBalance)} · Locked: {formatPrice(summaryCards.lockedTokens)}
                </p>
                {maxBidLimit > 0 && (
                  <p className="text-[10px] mt-0.5 opacity-70">
                    Max bid: {formatPrice(maxBidLimit)}
                  </p>
                )}
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <ArrowUp className="w-5 h-5 text-emerald-500 mb-1" />
                <p className="text-xl font-bold text-slate-900">
                  {formatPrice(summaryCards.totalDeposited)}
                </p>
                <p className="text-xs text-slate-500">Total Deposited</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <ShieldCheck className="w-5 h-5 text-blue-500 mb-1" />
                <p className="text-xl font-bold text-slate-900">
                  {summaryCards.activeEscrowCount}
                </p>
                <p className="text-xs text-slate-500">Active Escrows</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <ArrowDown className="w-5 h-5 text-red-500 mb-1" />
                <p className="text-xl font-bold text-slate-900">
                  {formatPrice(summaryCards.totalSpent)}
                </p>
                <p className="text-xs text-slate-500">Total Spent</p>
              </div>
            </div>

        {/* ─── My Bids ─── */}
        {activeTab === "bids" && (
          <div className="space-y-4">
            {bidsLoading ? (
              <p className="text-center py-10 text-slate-500">Loading...</p>
            ) : myBids.length === 0 ? (
              <div className="text-center py-20">
                <Gavel className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No bids placed yet
                </h3>
                <p className="text-slate-500 mb-6">
                  Find a car you love and start bidding
                </p>
                <Link to="/auctions/live">
                  <Button>Browse Live Auction</Button>
                </Link>
              </div>
            ) : (
              myBids.map((bid) => {
                const ac = bid.auctionCar || {};
                const car = ac.car || {};
                const auction = ac.auction || {};
                const img = Array.isArray(car.images)
                  ? car.images[0]
                  : car.images;
                const isHighest = ac.currentBid === bid.amount;
                return (
                  <motion.div
                    key={bid._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-36 bg-slate-100 flex-shrink-0">
                        {img && (
                          <img
                            src={img}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">
                            {car.year} {car.make} {car.model}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {auction.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {isHighest ? (
                              <Badge className="bg-emerald-100 text-emerald-700">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Highest Bid
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-700">
                                Outbid
                              </Badge>
                            )}
                            <Badge
                              className={
                                auction.status === "live"
                                  ? "bg-red-500 text-white"
                                  : "bg-slate-100 text-slate-600"
                              }
                            >
                              {auction.status === "live"
                                ? "Live"
                                : auction.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Your Bid</p>
                          <p className="text-xl font-bold text-[#FFA602]">
                            {formatPrice(bid.amount)}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(bid.createdAt).toLocaleString()}
                          </p>
                          {auction.status === "live" && (
                            <Link
                              to={`/auctions/car-detail?id=${ac._id}`}
                              className="inline-block mt-2"
                            >
                              <Button className="px-3 py-1.5 text-xs">
                                {isHighest ? "View" : "Bid Again"}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ─── Won Auctions ─── */}
        {activeTab === "won" && (
          <div className="space-y-4">
            {wonLoading ? (
              <p className="text-center py-10 text-slate-500">Loading...</p>
            ) : wonAuctions.length === 0 ? (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No wins yet
                </h3>
                <p className="text-slate-500 mb-6">
                  Start bidding on live auctions
                </p>
                <Link to="/auctions/live">
                  <Button>Browse Live Auction</Button>
                </Link>
              </div>
            ) : (
              wonAuctions.map((item) => {
                const car = item.car || {};
                const img = Array.isArray(car.images)
                  ? car.images[0]
                  : car.images;
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-md"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-48 h-36 bg-slate-100 flex-shrink-0">
                        {img && (
                          <img
                            src={img}
                            alt={`${car.make} ${car.model}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900">
                            {car.year} {car.make} {car.model}
                          </h3>
                          <p className="text-sm text-slate-500">
                            {item.auction?.title}
                          </p>
                          <Badge className="bg-emerald-100 text-emerald-700 mt-2">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Won
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#FFA602]">
                            {formatPrice(item.finalPrice)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(item.soldAt).toLocaleDateString()}
                          </p>
                          <Link
                            to={`/auctions/result?car_id=${item._id}`}
                            className="inline-block mt-2"
                          >
                            <Button className="px-3 py-1.5 text-xs">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ─── Escrow ─── */}
        {activeTab === "escrow" && (
          <div className="space-y-4">
            {escrowLoading ? (
              <p className="text-center py-10 text-slate-500">Loading...</p>
            ) : escrows.length === 0 ? (
              <div className="text-center py-20">
                <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No escrow transactions
                </h3>
                <p className="text-slate-500">
                  Escrow records will appear here after you win an auction
                </p>
              </div>
            ) : (
              escrows.map((escrow) => {
                const car = escrow.auctionCar?.car || {};
                const hoursLeft = Math.max(
                  0,
                  Math.round(
                    (new Date(escrow.paymentDeadline) - new Date()) / 3600000,
                  ),
                );
                const isOverdue =
                  escrow.status === "pending" &&
                  new Date(escrow.paymentDeadline) < new Date();
                const isUrgent =
                  escrow.status === "pending" && hoursLeft < 12 && !isOverdue;
                const steps = ["pending", "in_escrow", "released"];
                const currentStepIdx =
                  escrow.status === "refunded" || escrow.status === "disputed"
                    ? -1
                    : steps.indexOf(escrow.status);
                return (
                  <motion.div
                    key={escrow._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl border overflow-hidden shadow-md ${isOverdue ? "border-red-300" : isUrgent ? "border-amber-300" : "border-slate-200"}`}
                  >
                    {(isOverdue || isUrgent) && (
                      <div
                        className={`px-4 py-2 text-xs font-medium flex items-center gap-2 ${isOverdue ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {isOverdue
                          ? "Payment deadline has passed!"
                          : `Only ${hoursLeft} hours left to complete payment`}
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {car.year} {car.make} {car.model}
                          </h3>
                          <Badge className={escrowColors[escrow.status] || ""}>
                            {escrow.status?.replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-xl font-bold text-slate-900">
                          {formatPrice(escrow.amount)}
                        </p>
                      </div>
                      {currentStepIdx >= 0 && (
                        <div className="flex items-center gap-0 mb-5">
                          {steps.map((step, i) => (
                            <React.Fragment key={step}>
                              <div className="flex flex-col items-center">
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= currentStepIdx ? "bg-[#FFA602] text-white" : "bg-slate-200 text-slate-500"}`}
                                >
                                  {i < currentStepIdx ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    i + 1
                                  )}
                                </div>
                                <p className="text-[10px] mt-1 text-slate-500 whitespace-nowrap">
                                  {step === "pending"
                                    ? "Awaiting Payment"
                                    : step === "in_escrow"
                                      ? "Paid / In Escrow"
                                      : "Released"}
                                </p>
                              </div>
                              {i < steps.length - 1 && (
                                <div
                                  className={`flex-1 h-0.5 ${i < currentStepIdx ? "bg-[#FFA602]" : "bg-slate-200"}`}
                                />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-slate-500">Token Deducted</p>
                          <p className="font-semibold text-emerald-600">
                            - {formatPrice(escrow.tokenDeduction)}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-slate-500">Amount Due</p>
                          <p className="font-semibold text-[#FFA602]">
                            {formatPrice(escrow.amountDue)}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Deadline
                          </p>
                          <p
                            className={`font-semibold ${isOverdue ? "text-red-600" : isUrgent ? "text-amber-600" : "text-slate-900"}`}
                          >
                            {new Date(escrow.paymentDeadline).toLocaleString()}
                          </p>
                        </div>
                        {escrow.paidAt && (
                          <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-slate-500">Paid At</p>
                            <p className="font-semibold text-emerald-600">
                              {new Date(escrow.paidAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {escrow.releasedAt && (
                          <div className="bg-emerald-50 rounded-lg p-3">
                            <p className="text-slate-500">Released At</p>
                            <p className="font-semibold text-emerald-600">
                              {new Date(escrow.releasedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                      {escrow.status === "pending" && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <p className="text-xs text-blue-700 font-medium">
                            Payment Instructions
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            {escrow.amountDue > 0
                              ? `Please pay the remaining balance of ${formatPrice(escrow.amountDue)} before the deadline. You can pay from your wallet below.`
                              : "No balance due. Mark as paid to continue."}
                          </p>
                          <Button
                            className="mt-3"
                            disabled={payingEscrow || (escrow.amountDue > 0 && (wallet?.balance ?? 0) < escrow.amountDue)}
                            onClick={async () => {
                              try {
                                await payEscrow({ escrowId: escrow._id }).unwrap();
                                toast.success("Payment received. Escrow updated.");
                                refetchEscrows();
                              } catch (e) {
                                toast.error(e?.data?.message || "Payment failed");
                              }
                            }}
                          >
                            {payingEscrow ? "Processing..." : escrow.amountDue > 0 ? `Pay ${formatPrice(escrow.amountDue)} from wallet` : "Mark as paid"}
                          </Button>
                        </div>
                      )}
                      {(escrow.status === "pending" || escrow.status === "in_escrow") && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-xs text-red-700 font-medium">
                            Issue with vehicle, payment, or delivery?
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            Raise a dispute and our admin team will review this escrow.
                          </p>
                          <Button
                            variant="danger"
                            className="mt-3"
                            disabled={raisingDispute}
                            onClick={async () => {
                              const reason = window.prompt(
                                "Describe your issue (minimum 10 characters):",
                                "",
                              );
                              if (!reason || reason.trim().length < 10) {
                                toast.error("Please provide a clear dispute reason.");
                                return;
                              }
                              try {
                                await raiseEscrowDispute({
                                  escrowId: escrow._id,
                                  reason,
                                }).unwrap();
                                toast.success("Dispute submitted successfully.");
                                refetchEscrows();
                              } catch (e) {
                                toast.error(
                                  e?.data?.message || "Failed to submit dispute",
                                );
                              }
                            }}
                          >
                            {raisingDispute ? "Submitting..." : "Raise Dispute"}
                          </Button>
                          {escrow.disputeReason && (
                            <p className="text-xs text-red-700 mt-2">
                              Existing dispute: {escrow.disputeReason}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ─── Deposits ─── */}
        {activeTab === "deposits" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Deposit Funds
                </h3>
                <p className="text-sm text-slate-500">
                  Add money to your wallet for purchases, escrow payments, and other auction charges
                </p>
              </div>
              <Button onClick={() => setShowDepositForm(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                New Deposit
              </Button>
            </div>

            {walletSettings && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-medium mb-1">Deposit Limits</p>
                <p>
                  Minimum: {formatPrice(walletSettings.minDeposit)} — Maximum:{" "}
                  {formatPrice(walletSettings.maxDeposit)}
                </p>
                {walletSettings.depositTiers?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium mb-1">
                      Bidding Tiers (deposit more to unlock higher bid limits):
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {walletSettings.depositTiers.map((tier, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded text-xs ${wallet?.totalDeposited >= tier.minDeposit ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-white text-blue-600"}`}
                        >
                          {tier.label}: {formatPrice(tier.minDeposit)} → max bid{" "}
                          {formatPrice(tier.maxBidLimit)}
                          {wallet?.totalDeposited >= tier.minDeposit && " ✓"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {depositsLoading ? (
              <p className="text-center py-10 text-slate-500">Loading...</p>
            ) : myDeposits.length === 0 && !showDepositForm ? (
              <div className="text-center py-20">
                <PlusCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No deposits yet
                </h3>
                <p className="text-slate-500 mb-6">
                  Deposit funds to start bidding on auction cars
                </p>
                <Button onClick={() => setShowDepositForm(true)}>
                  Make Your First Deposit
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {myDeposits.map((dep) => (
                  <motion.div
                    key={dep._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                  >
                    <div>
                      <p className="font-semibold text-lg text-slate-900">
                        {formatPrice(dep.amount)}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {dep.method?.replace("_", " ")}{" "}
                        {dep.transactionId ? `— ${dep.transactionId}` : ""}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(dep.createdAt).toLocaleString()}
                      </p>
                      {dep.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1">
                          Reason: {dep.rejectionReason}
                        </p>
                      )}
                    </div>
                    <Badge className={statusBadge(dep.status)}>
                      {dep.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Deposit Form Modal */}
            {showDepositForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                      Deposit Funds
                    </h3>
                    <button
                      onClick={() => setShowDepositForm(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Amount (PKR) *
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-[#FFA602] focus:border-transparent outline-none"
                        value={depositData.amount}
                        onChange={(e) =>
                          setDepositData({
                            ...depositData,
                            amount: e.target.value,
                          })
                        }
                        placeholder="e.g. 50000"
                        min={walletSettings?.minDeposit || 10000}
                        max={walletSettings?.maxDeposit || 50000000}
                      />
                      {walletSettings && (
                        <p className="text-xs text-slate-500 mt-1">
                          Min: {formatPrice(walletSettings.minDeposit)} — Max:{" "}
                          {formatPrice(walletSettings.maxDeposit)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Payment Method *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {depositMethods.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() =>
                              setDepositData({ ...depositData, method: m.id })
                            }
                            className={`p-3 rounded-lg border-2 text-left transition-all ${depositData.method === m.id ? "border-[#FFA602] bg-amber-50" : `${m.color}`}`}
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {m.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {m.account}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Transaction / Reference ID
                      </label>
                      <input
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FFA602]"
                        value={depositData.transactionId}
                        onChange={(e) =>
                          setDepositData({
                            ...depositData,
                            transactionId: e.target.value,
                          })
                        }
                        placeholder="Enter your payment reference ID"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Receipt URL (optional)
                      </label>
                      <input
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FFA602]"
                        type="url"
                        value={depositData.receiptUrl}
                        onChange={(e) =>
                          setDepositData({
                            ...depositData,
                            receiptUrl: e.target.value,
                          })
                        }
                        placeholder="https://... (upload receipt elsewhere and paste link)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FFA602]"
                        rows="2"
                        value={depositData.notes}
                        onChange={(e) =>
                          setDepositData({
                            ...depositData,
                            notes: e.target.value,
                          })
                        }
                        placeholder="Any additional notes"
                      />
                    </div>
                    <Button
                      className="w-full py-3"
                      onClick={handleSubmitDeposit}
                      disabled={submittingDeposit}
                    >
                      {submittingDeposit ? "Submitting..." : "Submit Deposit"}
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center">
                      Deposits are verified by admin and credited to your wallet
                      once approved.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* ─── Refunds ─── */}
        {activeTab === "refunds" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Refund Requests
                </h3>
                <p className="text-sm text-slate-500">
                  Request a refund from your wallet balance
                </p>
              </div>
              {availableBalance > 0 && !isFrozen && (
                <Button onClick={() => setShowRefundForm(true)}>
                  <Undo className="w-4 h-4 mr-2" />
                  Request Refund
                </Button>
              )}
            </div>

            {refundsLoading ? (
              <p className="text-center py-10 text-slate-500">Loading...</p>
            ) : myRefunds.length === 0 && !showRefundForm ? (
              <div className="text-center py-20">
                <Undo className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No refund requests
                </h3>
                <p className="text-slate-500">
                  You can request a refund of your wallet balance anytime
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRefunds.map((ref) => (
                  <motion.div
                    key={ref._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg text-slate-900">
                            {formatPrice(ref.amount)}
                          </p>
                          <Badge className={statusBadge(ref.status)}>
                            {ref.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 capitalize">
                          {ref.type?.replace("_", " ")}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(ref.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-slate-500">
                          Platform fee:{" "}
                          <span className="font-medium text-red-500">
                            {formatPrice(ref.platformFee)} (
                            {ref.platformFeePercent}%)
                          </span>
                        </p>
                        <p className="text-emerald-600 font-semibold">
                          Net refund: {formatPrice(ref.netRefund)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                      {ref.reason}
                    </p>
                    {ref.adminNotes && (
                      <p className="text-xs text-blue-600 mt-2">
                        Admin: {ref.adminNotes}
                      </p>
                    )}
                    {ref.paymentMethod && (
                      <p className="text-xs text-slate-500 mt-1">
                        Paid via: {ref.paymentMethod}{" "}
                        {ref.paymentReference
                          ? `(${ref.paymentReference})`
                          : ""}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Refund Form Modal */}
            {showRefundForm && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">
                      Request Refund
                    </h3>
                    <button
                      onClick={() => setShowRefundForm(false)}
                      className="p-2 hover:bg-slate-100 rounded-lg"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
                      <p className="font-medium">
                        Available Balance: {formatPrice(availableBalance)}
                      </p>
                      <p className="text-xs mt-1">
                        A platform fee will be deducted from your refund amount.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Refund Amount (PKR) *
                      </label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg text-lg font-semibold outline-none focus:ring-2 focus:ring-[#FFA602]"
                        value={refundData.amount}
                        onChange={(e) =>
                          setRefundData({
                            ...refundData,
                            amount: e.target.value,
                          })
                        }
                        max={availableBalance || 0}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Reason Type *
                      </label>
                      <div className="space-y-2">
                        {refundTypes.map((rt) => (
                          <button
                            key={rt.id}
                            type="button"
                            onClick={() =>
                              setRefundData({ ...refundData, type: rt.id })
                            }
                            className={`w-full p-3 rounded-lg border-2 text-left transition-all ${refundData.type === rt.id ? "border-[#FFA602] bg-amber-50" : "border-slate-200 hover:border-slate-300"}`}
                          >
                            <p className="text-sm font-medium text-slate-900">
                              {rt.label}
                            </p>
                            <p className="text-xs text-slate-500">{rt.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Detailed Reason *
                      </label>
                      <textarea
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#FFA602]"
                        rows="3"
                        value={refundData.reason}
                        onChange={(e) =>
                          setRefundData({
                            ...refundData,
                            reason: e.target.value,
                          })
                        }
                        placeholder="Please explain your reason for requesting a refund"
                      />
                    </div>
                    {refundData.amount && refundData.type && (
                      <div className="bg-slate-50 rounded-lg p-3 text-sm">
                        <p className="text-slate-500">Estimated breakdown:</p>
                        <div className="flex justify-between mt-1">
                          <span>Amount</span>
                          <span className="font-medium">
                            {formatPrice(Number(refundData.amount))}
                          </span>
                        </div>
                        <div className="flex justify-between text-red-500">
                          <span>
                            Platform fee (
                            {refundData.type === "declined_car"
                              ? walletSettings?.refundPenaltyPercent || 10
                              : walletSettings?.platformFeePercent || 5}
                            %)
                          </span>
                          <span className="font-medium">
                            -{" "}
                            {formatPrice(
                              Math.round(
                                Number(refundData.amount) *
                                  ((refundData.type === "declined_car"
                                    ? walletSettings?.refundPenaltyPercent || 10
                                    : walletSettings?.platformFeePercent || 5) /
                                    100),
                              ),
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 mt-2 pt-2 text-emerald-600 font-semibold">
                          <span>Net refund</span>
                          <span>
                            {formatPrice(
                              Number(refundData.amount) -
                                Math.round(
                                  Number(refundData.amount) *
                                    ((refundData.type === "declined_car"
                                      ? walletSettings?.refundPenaltyPercent ||
                                        10
                                      : walletSettings?.platformFeePercent ||
                                        5) /
                                      100),
                                ),
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full py-3"
                      onClick={handleSubmitRefund}
                      disabled={submittingRefund}
                    >
                      {submittingRefund
                        ? "Submitting..."
                        : "Submit Refund Request"}
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center">
                      Refund requests are reviewed by admin. You will be
                      notified once processed.
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}

        {/* ─── Token Payments ─── */}
        {activeTab === "tokens" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              Verified token payments are credited to your auction wallet after admin approval. Once an auction ends, losing bidders keep the refundable token balance in their wallet and only the participation fee is deducted automatically.
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs text-slate-500">Verified Token Deposit</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatPrice(verifiedTokenAmount)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {hasVerifiedToken
                    ? "Verified and credited to wallet"
                    : "No verified token yet"}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <p className="text-xs text-slate-500">Wallet Balance</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatPrice(summaryCards.balance)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Includes verified token credits and any approved deposits
                </p>
              </div>
            </div>
            {tokenLoading ? (
              <p className="text-center py-10 text-slate-500">Loading...</p>
            ) : tokenPayments.length === 0 ? (
              <div className="text-center py-20">
                <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No token payments
                </h3>
                <p className="text-slate-500 mb-6">
                  Pay the token deposit to start bidding
                </p>
                <Link to="/auctions/token-payment">
                  <Button>Pay Token</Button>
                </Link>
              </div>
            ) : (
              tokenPayments.map((p) => {
                const latestSettlement = getLatestAuctionSettlement(p);
                return (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-md space-y-3"
                >
                  <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {formatPrice(p.amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {p.paymentMethod} — {p.transactionId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={statusBadge(p.status)}>{p.status}</Badge>
                  </div>
                  {latestSettlement?.outcome === "loser" && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
                      Auction ended. {formatPrice(latestSettlement.refundAmount)} remains in your wallet after a {formatPrice(latestSettlement.feeAmount)} participation fee.
                    </div>
                  )}
                  {latestSettlement?.outcome === "winner" && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                      Congratulations! You won the auction. Please proceed with the next payment steps.
                    </div>
                  )}
                </motion.div>
                );
              })
            )}
          </div>
        )}

        {/* ─── Ledger ─── */}
        {activeTab === "ledger" && (
          <div>
            {walletLoading ? (
              <p className="text-center py-10 text-slate-500">Loading...</p>
            ) : walletTransactions.length === 0 ? (
              <div className="text-center py-20">
                <ListIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No transactions yet
                </h3>
                <p className="text-slate-500">
                  Your complete payment history will appear here
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b bg-slate-50">
                      <th className="p-4">Date</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Description</th>
                      <th className="p-4 text-right">Amount</th>
                      <th className="p-4 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletTransactions.map((txn) => (
                      <tr
                        key={txn._id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-4 text-slate-500 whitespace-nowrap">
                          {new Date(txn.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <Badge
                            className={
                              txn.amount >= 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }
                          >
                            {txnTypeLabels[txn.type] || txn.type}
                          </Badge>
                        </td>
                        <td className="p-4 text-slate-600 text-xs max-w-xs truncate">
                          {txn.description}
                        </td>
                        <td
                          className={`p-4 text-right font-semibold ${txn.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}
                        >
                          <span className="flex items-center justify-end gap-1">
                            {txn.amount >= 0 ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : (
                              <ArrowDown className="w-3 h-3" />
                            )}
                            PKR {Math.abs(txn.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4 text-right font-medium text-slate-900">
                          PKR {txn.balance?.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
