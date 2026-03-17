import mongoose from "mongoose";

/**
 * Immutable audit log for every bid (online, offline, proxy).
 * Used for fraud detection and compliance; do not update or delete.
 */
const bidAuditLogSchema = new mongoose.Schema(
  {
    auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true, index: true },
    auctionCar: { type: mongoose.Schema.Types.ObjectId, ref: "AuctionCar", required: true, index: true },
    bid: { type: mongoose.Schema.Types.ObjectId, ref: "Bid", required: true, index: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    bidderName: { type: String, default: "Anonymous" },
    amount: { type: Number, required: true },
    bidType: { type: String, enum: ["online", "offline"], default: "online" },
    isProxy: { type: Boolean, default: false },
    placedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

bidAuditLogSchema.index({ auction: 1, createdAt: -1 });
bidAuditLogSchema.index({ auctionCar: 1, createdAt: -1 });
bidAuditLogSchema.index({ bidder: 1, createdAt: -1 });

export const BidAuditLog = mongoose.model("BidAuditLog", bidAuditLogSchema);
export default BidAuditLog;
