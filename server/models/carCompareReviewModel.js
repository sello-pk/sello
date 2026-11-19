import mongoose from "mongoose";

const schema = new mongoose.Schema({
  variantId: { type: mongoose.Schema.Types.ObjectId, ref: "CarCatalogVariant", unique: true, required: true },
  status: { type: String, enum: ["pending", "approved", "manual", "rejected"], required: true },
  identity: { type: String, required: true },
  proposals: { type: mongoose.Schema.Types.Mixed, default: {} },
  approved: { type: mongoose.Schema.Types.Mixed, default: {} },
  requested: [String],
  researchedAt: Date,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  history: [mongoose.Schema.Types.Mixed],
}, { timestamps: true });

schema.index({ status: 1, updatedAt: -1 });
export default mongoose.model("CarCompareReview", schema);

export const CarCompareResearchLease = mongoose.model("CarCompareResearchLease", new mongoose.Schema({
  _id: String,
  owner: String,
  expiresAt: { type: Date, required: true, expires: 0 },
}));
