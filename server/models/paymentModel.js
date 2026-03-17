import mongoose from "mongoose";

// ─── Wallet (one per user) ──────────────────────────────────────────────────
const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    balance: { type: Number, default: 0, min: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    totalBidHeld: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastTransactionAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ─── Deposit ────────────────────────────────────────────────────────────────
const depositSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    method: {
      type: String,
      enum: ["jazzcash", "easypaisa", "bank_transfer", "stripe", "cash_office", "other"],
      required: true,
    },
    transactionId: { type: String, default: "" },
    receiptUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

depositSchema.index({ user: 1, status: 1 });
depositSchema.index({ status: 1, createdAt: -1 });

// ─── Refund Request ─────────────────────────────────────────────────────────
const refundRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    type: {
      type: String,
      enum: ["no_bids", "lost_all", "declined_car", "partial", "other"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "processed"],
      default: "pending",
      index: true,
    },
    platformFee: { type: Number, default: 0 },
    platformFeePercent: { type: Number, default: 0 },
    netRefund: { type: Number, default: 0 },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    adminNotes: { type: String, default: "" },
    paymentMethod: { type: String, default: "" },
    paymentReference: { type: String, default: "" },
  },
  { timestamps: true }
);

refundRequestSchema.index({ user: 1, status: 1 });

// ─── Platform Settings (singleton) ─────────────────────────────────────────
const platformSettingsSchema = new mongoose.Schema(
  {
    platformFeePercent: { type: Number, default: 5 },
    platformFeeFixed: { type: Number, default: 0 },
    minDeposit: { type: Number, default: 10000 },
    /** Min deposit as % of vehicle value (2–5); 0 = use fixed minDeposit only. */
    minDepositPercent: { type: Number, default: 0, min: 0, max: 100 },
    maxDeposit: { type: Number, default: 50000000 },
    depositTiers: [
      {
        minDeposit: { type: Number, required: true },
        maxBidLimit: { type: Number, required: true },
        label: { type: String, default: "" },
      },
    ],
    refundPenaltyPercent: { type: Number, default: 10 },
    isWalletSystemEnabled: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// ─── Exports ────────────────────────────────────────────────────────────────
export const Wallet = mongoose.model("Wallet", walletSchema);
export const Deposit = mongoose.model("Deposit", depositSchema);
export const RefundRequest = mongoose.model("RefundRequest", refundRequestSchema);
export const PlatformSettings = mongoose.model("PlatformSettings", platformSettingsSchema);
