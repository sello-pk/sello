import mongoose from "mongoose";

const securityEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "rapid_bidding",
        "failed_wallet_payment",
        "suspicious_proxy_bid",
        "multiple_accounts_bidding",
        "invalid_bid_amount",
        "bid_after_end",
        "other",
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", index: true },
    auctionCarId: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionCar", index: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    resolved: { type: Boolean, default: false, index: true },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

securityEventSchema.index({ createdAt: -1 });
securityEventSchema.index({ type: 1, resolved: 1 });

export const SecurityEvent = mongoose.model("SecurityEvent", securityEventSchema);
export default SecurityEvent;
