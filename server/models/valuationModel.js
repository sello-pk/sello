import mongoose from "mongoose";

const valuationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous valuations if needed, or require for history
    },
    vehicleData: {
      make: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true },
      mileage: { type: Number, required: true },
      variant: { type: String },
      registrationCity: { type: String },
      fuelType: { type: String, required: true },
      transmission: { type: String, required: true },
      engineType: { type: String },
      engineCapacity: { type: String },
      exteriorColor: { type: String },
      condition: {
        engine: { type: String },
        body: { type: String },
        tire: { type: String },
        suspension: { type: String },
        interior: { type: String },
      },
      history: {
        accident: { type: String },
        paintStatus: { type: String },
      },
      additionalNotes: { type: String },
      features: {
        sunroof: { type: Boolean, default: false },
        leatherSeats: { type: Boolean, default: false },
        navigation: { type: Boolean, default: false },
        bluetooth: { type: Boolean, default: false },
        cruiseControl: { type: Boolean, default: false },
      },
    },
    estimation: {
      minPrice: { type: Number, required: true },
      maxPrice: { type: Number, required: true },
      averagePrice: { type: Number, required: true },
      confidenceScore: { type: Number, default: 85 },
      analysisSummary: { type: String },
      marketContext: {
        similarListingsCount: { type: Number, default: 0 },
        priceIndicator: { type: String }, // 'fair', 'below_market', 'above_market'
      },
      isAIPowered: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ["active", "archived", "converted_to_listing"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Valuation = mongoose.model("Valuation", valuationSchema);

export default Valuation;
