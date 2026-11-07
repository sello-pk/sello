import mongoose from "mongoose";
import { FUEL_TYPES } from "./fuelPriceModel.js";

const fuelPriceHistorySchema = new mongoose.Schema(
  {
    fuel_type: {
      type: String,
      required: true,
      enum: FUEL_TYPES,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    previous_price: { type: Number, default: null },
    change_amount: { type: Number, default: null },
    currency: { type: String, default: "PKR", uppercase: true },
    unit: { type: String, default: "per_litre" },
    effective_date: { type: Date, required: true, index: true },
    source_url: { type: String, required: true },
    source_document: { type: String, default: null },
    source_publication_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FuelSourcePublication",
      default: null,
    },
    content_hash: { type: String, required: true, index: true },
    fetched_at: { type: Date, required: true },
    verified_at: { type: Date, required: true },
    publication_status: {
      type: String,
      enum: ["draft", "verified", "published", "rejected", "superseded"],
      default: "published",
    },
    verified_by: {
      type: String,
      enum: ["automation", "admin"],
      default: "automation",
    },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

fuelPriceHistorySchema.index(
  { fuel_type: 1, effective_date: 1, content_hash: 1 },
  { unique: true }
);

const FuelPriceHistory = mongoose.model(
  "FuelPriceHistory",
  fuelPriceHistorySchema
);

export default FuelPriceHistory;
