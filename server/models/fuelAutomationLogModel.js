import mongoose from "mongoose";

const fuelAutomationLogSchema = new mongoose.Schema(
  {
    job: {
      type: String,
      default: "fuel_price_monitor",
      index: true,
    },
    level: {
      type: String,
      enum: ["info", "success", "warning", "error"],
      default: "info",
      index: true,
    },
    message: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    publication_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FuelSourcePublication",
      default: null,
    },
    started_at: { type: Date, default: null },
    finished_at: { type: Date, default: Date.now },
    duration_ms: { type: Number, default: null },
  },
  { timestamps: true }
);

fuelAutomationLogSchema.index({ createdAt: -1 });

const FuelAutomationLog = mongoose.model(
  "FuelAutomationLog",
  fuelAutomationLogSchema
);

export default FuelAutomationLog;
