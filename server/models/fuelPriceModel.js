import mongoose from "mongoose";

export const FUEL_TYPES = [
  "motor_spirit",
  "high_speed_diesel",
  "kerosene_oil",
  "light_diesel_oil",
];

export const FUEL_TYPE_LABELS = {
  motor_spirit: "Motor Spirit / Petrol (Super)",
  high_speed_diesel: "High-Speed Diesel",
  kerosene_oil: "Kerosene Oil",
  light_diesel_oil: "Light Diesel Oil",
};

const fuelPriceSchema = new mongoose.Schema(
  {
    fuel_type: {
      type: String,
      required: true,
      enum: FUEL_TYPES,
      unique: true,
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
    fetched_at: { type: Date, required: true },
    verified_at: { type: Date, required: true },
    publication_status: {
      type: String,
      enum: ["draft", "verified", "published", "rejected", "superseded"],
      default: "published",
      index: true,
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

const FuelPrice = mongoose.model("FuelPrice", fuelPriceSchema);

export default FuelPrice;
