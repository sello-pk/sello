import mongoose from "mongoose";

const auctionExtensionLogSchema = new mongoose.Schema(
  {
    auction: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true, index: true },
    extendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    extensionMinutes: { type: Number, required: true },
    reason: {
      type: String,
      enum: ["auto_snipe", "manual_seller", "admin_extend"],
      default: "admin_extend",
    },
    previousEndTime: { type: Date, default: null },
    newEndTime: { type: Date, default: null },
  },
  { timestamps: true }
);

auctionExtensionLogSchema.index({ auction: 1, createdAt: -1 });

export const AuctionExtensionLog = mongoose.model("AuctionExtensionLog", auctionExtensionLogSchema);
export default AuctionExtensionLog;
