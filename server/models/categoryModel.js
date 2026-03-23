import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      set: function (value) {
        // Normalize name to title case for consistency
        if (value && typeof value === "string") {
          return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        return value;
      },
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["car", "blog", "location", "vehicle"],
      required: true,
    },
    subType: {
      type: String,
      enum: ["make", "model", "year", "country", "city", "state", null],
      default: null,
    },
    // Vehicle type for car categories (makes/models/years) - links to vehicle types like Car, Bus, Truck, etc.
    vehicleType: {
      type: String,
      enum: ["Car", "Bus", "Truck", "Van", "Bike", "E-bike", "Farm", null],
      default: null,
      index: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ type: 1, isActive: 1 });
categorySchema.index({ type: 1, subType: 1, isActive: 1 });
categorySchema.index({ type: 1, subType: 1, vehicleType: 1, isActive: 1 }); // For filtering car categories by vehicle type
categorySchema.index({ parentCategory: 1 });

// Compound unique index: name + vehicleType + subType must be unique for car categories
// This allows same make name for different vehicle types (e.g., "Toyota" for Car and "Toyota" for Truck)
// Using collation for case-insensitive comparison
categorySchema.index(
  { name: 1, vehicleType: 1, subType: 1, type: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 }, // Case-insensitive comparison
    partialFilterExpression: {
      type: "car",
      vehicleType: { $ne: null },
    },
  },
);

// Compound unique index for models: name + vehicleType + subType + type + parentCategory must be unique
// This ensures models are unique within each brand/make
// Using collation for case-insensitive comparison
categorySchema.index(
  { name: 1, vehicleType: 1, subType: 1, type: 1, parentCategory: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 }, // Case-insensitive comparison
    partialFilterExpression: {
      type: "car",
      subType: "model",
      parentCategory: { $ne: null },
    },
  },
);

// Unique index for years/countries with same key pattern.
// Merge into one declaration to avoid duplicate-key-pattern warnings.
categorySchema.index(
  { name: 1, subType: 1, type: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
    partialFilterExpression: {
      $or: [
        { type: "car", subType: "year" },
        { type: "location", subType: "country" },
      ],
    },
  },
);

// Unique index for states/cities with same key pattern.
// Merge into one declaration to avoid duplicate-key-pattern warnings.
categorySchema.index(
  { name: 1, parentCategory: 1, subType: 1, type: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
    partialFilterExpression: {
      type: "location",
      subType: { $in: ["state", "city"] },
    },
  },
);

// Unique slug per vehicle type for car categories
categorySchema.index(
  { slug: 1, vehicleType: 1, type: 1 },
  {
    unique: true,
    partialFilterExpression: {
      type: "car",
      vehicleType: { $ne: null },
    },
  },
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
