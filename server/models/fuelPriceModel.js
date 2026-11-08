import mongoose from "mongoose";

/** Canonical retail / notified fuels we track on Sello. */
export const FUEL_TYPES = [
  "motor_spirit", // Premier Euro 5 (MS / Petrol Super)
  "hi_octane", // Octane+ Euro 5 / Hi-Octane 97 RON
  "high_speed_diesel", // Hi-Cetane Diesel Euro 5 (HSD)
  "e10_gasoline", // E10 blend (when officially published)
  "kerosene_oil", // Superior Kerosene Oil (SKO)
  "light_diesel_oil", // Light Diesel Oil (LDO)
  "lpg", // Liquefied Petroleum Gas
  "lng", // Liquefied Natural Gas (bulk — rarely retail)
  "biodiesel",
  "jet_fuel",
  "marine_fuel",
];

export const FUEL_TYPE_LABELS = {
  motor_spirit: "Premier Euro 5 (Petrol / Motor Spirit)",
  hi_octane: "Octane+ Euro 5 (Hi-Octane)",
  high_speed_diesel: "Hi-Cetane Diesel Euro 5 (HSD)",
  e10_gasoline: "E10 Gasoline",
  kerosene_oil: "Superior Kerosene Oil (SKO)",
  light_diesel_oil: "Light Diesel Oil (LDO)",
  lpg: "Liquefied Petroleum Gas (LPG)",
  lng: "Liquefied Natural Gas (LNG)",
  biodiesel: "Biodiesel",
  jet_fuel: "Jet Fuel (JP-1)",
  marine_fuel: "Marine / Bunker Fuel",
};

/** Display order + grouping for public UI. */
export const FUEL_CATALOG = [
  {
    group: "Retail automotive",
    fuels: [
      "motor_spirit",
      "hi_octane",
      "high_speed_diesel",
      "e10_gasoline",
    ],
  },
  {
    group: "Industrial & utility",
    fuels: ["kerosene_oil", "light_diesel_oil"],
  },
  {
    group: "Gaseous & alternate",
    fuels: ["lpg", "lng", "biodiesel"],
  },
  {
    group: "Aviation & marine",
    fuels: ["jet_fuel", "marine_fuel"],
  },
];

export const FUEL_DEFAULT_UNIT = {
  motor_spirit: "per_litre",
  hi_octane: "per_litre",
  high_speed_diesel: "per_litre",
  e10_gasoline: "per_litre",
  kerosene_oil: "per_litre",
  light_diesel_oil: "per_litre",
  lpg: "per_kg",
  lng: "per_mmbtu",
  biodiesel: "per_litre",
  jet_fuel: "per_litre",
  marine_fuel: "per_tonne",
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
    source_channel: {
      type: String,
      enum: ["ogra", "trackmate", "admin", "other"],
      default: "ogra",
      index: true,
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
