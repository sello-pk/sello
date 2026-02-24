import mongoose from "mongoose";

// ─── Auction ────────────────────────────────────────────────────────────────
const auctionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "scheduled", "live", "completed", "cancelled"],
      default: "draft",
      index: true,
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    location: { type: String, default: "Okara Auction Yard, Punjab" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalCars: { type: Number, default: 0 },
    totalBids: { type: Number, default: 0 },
    totalSold: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

auctionSchema.index({ status: 1, startTime: 1 });
auctionSchema.index({ status: 1, endTime: 1 });

// ─── Auction Car (links a Car to an Auction with auction-specific data) ─────
const auctionCarSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
      index: true,
    },
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    startingBid: { type: Number, required: true, min: 0 },
    currentBid: { type: Number, default: 0 },
    reservePrice: { type: Number, default: null },
    buyNowPrice: { type: Number, default: null },
    currentBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bidCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "live", "sold", "unsold", "withdrawn"],
      default: "pending",
      index: true,
    },
    inspectionReport: {
      engine: { type: String, enum: ["pass", "minor_issues", "major_issues"], default: null },
      body: { type: String, enum: ["pass", "minor_issues", "major_issues"], default: null },
      interior: { type: String, enum: ["pass", "minor_issues", "major_issues"], default: null },
      tires: { type: String, enum: ["pass", "minor_issues", "major_issues"], default: null },
      notes: { type: String, default: "" },
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    finalPrice: { type: Number, default: null },
    soldAt: { type: Date, default: null },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

auctionCarSchema.index({ auction: 1, car: 1 }, { unique: true });
auctionCarSchema.index({ auction: 1, status: 1 });

// ─── Bid ────────────────────────────────────────────────────────────────────
const bidSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true,
      index: true,
    },
    auctionCar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionCar",
      required: true,
      index: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    bidderName: { type: String, default: "Anonymous" },
    amount: { type: Number, required: true, min: 0 },
    bidType: {
      type: String,
      enum: ["online", "offline"],
      default: "online",
    },
    isProxy: { type: Boolean, default: false },
    isWinning: { type: Boolean, default: false },
    placedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

bidSchema.index({ auctionCar: 1, amount: -1 });
bidSchema.index({ bidder: 1, auction: 1 });

// ─── Proxy Bid (auto-bid) ───────────────────────────────────────────────────
const proxyBidSchema = new mongoose.Schema(
  {
    auctionCar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionCar",
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    maxAmount: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

proxyBidSchema.index({ auctionCar: 1, bidder: 1 }, { unique: true });

// ─── Token Payment ──────────────────────────────────────────────────────────
const tokenPaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, default: 10000 },
    paymentMethod: {
      type: String,
      enum: ["jazzcash", "easypaisa", "bank_transfer"],
      required: true,
    },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "refunded"],
      default: "pending",
      index: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    verifiedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

tokenPaymentSchema.index({ user: 1, status: 1 });

// ─── Auction Watchlist ──────────────────────────────────────────────────────
const auctionWatchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    auctionCar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionCar",
      required: true,
    },
  },
  { timestamps: true }
);

auctionWatchlistSchema.index({ user: 1, auctionCar: 1 }, { unique: true });

// ─── Escrow ─────────────────────────────────────────────────────────────────
const escrowSchema = new mongoose.Schema(
  {
    auctionCar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuctionCar",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    tokenDeduction: { type: Number, default: 10000 },
    amountDue: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "in_escrow", "released", "refunded", "disputed"],
      default: "pending",
      index: true,
    },
    paymentDeadline: { type: Date, required: true },
    paidAt: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

escrowSchema.index({ buyer: 1, status: 1 });

// ─── WalletTransaction (Ledger) ──────────────────────────────────────────────
const walletTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: [
        "token_deposit", "token_refund",
        "escrow_payment", "escrow_release", "escrow_refund",
        "platform_fee",
        "deposit", "bid_hold", "bid_refund",
        "withdrawal", "refund",
        "admin_credit", "admin_debit",
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true },
    reference: { type: mongoose.Schema.Types.ObjectId, refPath: "referenceModel" },
    referenceModel: { type: String, enum: ["TokenPayment", "Escrow", "AuctionCar", "Deposit", "RefundRequest", "Wallet", "Bid"] },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
  },
  { timestamps: true }
);

walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ type: 1, status: 1 });

// ─── Exports ────────────────────────────────────────────────────────────────
export const Auction = mongoose.model("Auction", auctionSchema);
export const AuctionCar = mongoose.model("AuctionCar", auctionCarSchema);
export const Bid = mongoose.model("Bid", bidSchema);
export const ProxyBid = mongoose.model("ProxyBid", proxyBidSchema);
export const TokenPayment = mongoose.model("TokenPayment", tokenPaymentSchema);
export const AuctionWatchlist = mongoose.model("AuctionWatchlist", auctionWatchlistSchema);
export const Escrow = mongoose.model("Escrow", escrowSchema);
export const WalletTransaction = mongoose.model("WalletTransaction", walletTransactionSchema);
