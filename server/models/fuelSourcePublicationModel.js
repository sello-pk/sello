import mongoose from "mongoose";

const fuelSourcePublicationSchema = new mongoose.Schema(
  {
    document_ref: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    source_url: { type: String, required: true },
    listing_url: { type: String, default: null },
    filename: { type: String, default: null },
    content_hash: { type: String, default: null, index: true },
    content_type: { type: String, default: null },
    byte_size: { type: Number, default: null },
    notification_date: { type: Date, default: null, index: true },
    effective_date: { type: Date, default: null, index: true },
    detected_at: { type: Date, required: true },
    downloaded_at: { type: Date, default: null },
    processed_at: { type: Date, default: null },
    status: {
      type: String,
      enum: [
        "detected",
        "downloaded",
        "extracted",
        "validated",
        "published",
        "needs_review",
        "failed",
        "duplicate",
        "skipped",
      ],
      default: "detected",
      index: true,
    },
    extraction_method: {
      type: String,
      enum: ["html", "pdf_text", "pdf_ocr", "admin", null],
      default: null,
    },
    extracted_prices: { type: [mongoose.Schema.Types.Mixed], default: [] },
    validation: {
      passed: { type: Boolean, default: false },
      errors: { type: [String], default: [] },
      warnings: { type: [String], default: [] },
    },
    error_message: { type: String, default: null },
    local_path: { type: String, default: null },
  },
  { timestamps: true }
);

const FuelSourcePublication = mongoose.model(
  "FuelSourcePublication",
  fuelSourcePublicationSchema
);

export default FuelSourcePublication;
