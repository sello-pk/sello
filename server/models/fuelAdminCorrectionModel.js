import mongoose from "mongoose";
import { FUEL_TYPES } from "./fuelPriceModel.js";

const fuelAdminCorrectionSchema = new mongoose.Schema(
  {
    fuel_type: {
      type: String,
      required: true,
      enum: FUEL_TYPES,
      index: true,
    },
    previous_price: { type: Number, default: null },
    corrected_price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },
    unit: { type: String, default: "per_litre" },
    effective_date: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    source_url: { type: String, default: null },
    source_document: { type: String, default: null },
    publication_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FuelSourcePublication",
      default: null,
    },
    approved: { type: Boolean, default: true },
    admin_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    admin_email: { type: String, default: null },
  },
  { timestamps: true }
);

const FuelAdminCorrection = mongoose.model(
  "FuelAdminCorrection",
  fuelAdminCorrectionSchema
);

export default FuelAdminCorrection;
