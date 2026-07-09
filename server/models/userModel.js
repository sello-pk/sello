import mongoose from "mongoose";

const capabilityDocSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    url: { type: String, default: "" },
    kind: { type: String, default: "supporting" },
  },
  { _id: false }
);

const capabilityStateSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["not_requested", "pending", "approved", "rejected", "revoked"],
      default: "not_requested",
    },
    requestedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectionReason: { type: String, default: "" },
    documents: { type: [capabilityDocSchema], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerificationCode: {
      type: String,
      default: null,
    },
    phoneVerificationExpiry: {
      type: Date,
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters"],
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Identity Verification (ID Card / Documents)
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Seller Reputation
    sellerRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["individual", "dealer", "admin"],
      default: "individual",
    },
    adminRole: {
      type: String,
      default: null,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    permissions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    avatar: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    // Subscription Fields
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "dealer"],
        default: "free",
      },
      startDate: {
        type: Date,
        default: null,
      },
      endDate: {
        type: Date,
        default: null,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      autoRenew: {
        type: Boolean,
        default: false,
      },
    },
    paymentHistory: {
      type: [
        {
          amount: { type: Number, required: true },
          currency: { type: String, default: "USD" },
          paymentMethod: { type: String },
          transactionId: { type: String },
          purpose: {
            type: String,
            enum: ["subscription", "credits"],
            required: true,
          },
          status: {
            type: String,
            enum: ["pending", "completed", "failed"],
            default: "pending",
          },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      validate: { validator: v => v.length <= 500, message: "Payment history exceeds 500 entries" },
    },
    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Dealer Specific Fields
    dealerInfo: {
      businessName: { type: String, default: null },
      businessLicense: { type: String, default: null },
      businessAddress: { type: String, default: null },
      businessPhone: { type: String, default: null },
      whatsappNumber: { type: String, default: null },
      country: { type: String, default: null },
      state: { type: String, default: null },
      city: { type: String, default: null },
      area: { type: String, default: null },
      vehicleTypes: { type: String, default: null },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
      // Enhanced dealer fields (PakWheels/Dubizzle style)
      description: { type: String, default: null },
      website: { type: String, default: null },
      socialMedia: {
        facebook: { type: String, default: null },
        instagram: { type: String, default: null },
        twitter: { type: String, default: null },
        linkedin: { type: String, default: null },
      },
      businessHours: {
        monday: {
          open: String,
          close: String,
          closed: { type: Boolean, default: false },
        },
        tuesday: {
          open: String,
          close: String,
          closed: { type: Boolean, default: false },
        },
        wednesday: {
          open: String,
          close: String,
          closed: { type: Boolean, default: false },
        },
        thursday: {
          open: String,
          close: String,
          closed: { type: Boolean, default: false },
        },
        friday: {
          open: String,
          close: String,
          closed: { type: Boolean, default: false },
        },
        saturday: {
          open: String,
          close: String,
          closed: { type: Boolean, default: false },
        },
        sunday: {
          open: String,
          close: String,
          closed: { type: Boolean, default: false },
        },
      },
      locations: [
        {
          name: String,
          address: String,
          city: String,
          area: String,
          phone: String,
          coordinates: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: [0, 0] },
          },
        },
      ],
      specialties: [{ type: String }], // e.g., "Luxury Cars", "Budget Cars", "Electric Vehicles"
      yearsInBusiness: { type: Number, default: null },
      totalCarsSold: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      showroomImages: [{ type: String }], // Images of the showroom
      certifications: [{ type: String }], // Industry certifications
      languages: [{ type: String }], // Languages spoken
      paymentMethods: [{ type: String }], // Accepted payment methods
      services: [{ type: String }], // Services offered (e.g., "Financing", "Trade-in", "Warranty")
      establishedYear: { type: Number, default: null },
      employeeCount: { type: String, default: null }, // e.g., "1-10", "11-50", "50+"
      monthlyInventory: { type: Number, default: 0 }, // Average cars in inventory
      featured: { type: Boolean, default: false }, // Featured dealer badge
      featuredUntil: { type: Date, default: null },
      subscriptionTier: {
        type: String,
        enum: ["free", "basic", "premium", "dealer"],
        default: "free",
      },
    },
    auctionCapabilities: {
      auctionBidder: { type: capabilityStateSchema, default: () => ({}) },
      auctionDealer: { type: capabilityStateSchema, default: () => ({}) },
      graceUntil: { type: Date, default: null },
    },
    // 🚗 Cars posted by user (as seller)
    carsPosted: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
      validate: { validator: v => v.length <= 1000, message: "carsPosted exceeds 1000 entries" },
    },
    carsPurchased: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
      validate: { validator: v => v.length <= 1000, message: "carsPurchased exceeds 1000 entries" },
    },
    savedCars: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Car" }],
      validate: { validator: v => v.length <= 500, message: "savedCars exceeds 500 entries" },
    },
    blockedUsers: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      validate: { validator: v => v.length <= 500, message: "blockedUsers exceeds 500 entries" },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
// Note: email already has an index from unique: true
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });
userSchema.index({ roleId: 1 }); // Index for role-based user count queries
userSchema.index({ role: 1, status: 1 }); // Compound index for common admin queries
userSchema.index({ "subscription.isActive": 1, "subscription.plan": 1 });
userSchema.index({ "subscription.isActive": 1, "subscription.endDate": 1 }); // For subscription expiration queries
userSchema.index({ "auctionCapabilities.auctionBidder.status": 1 });
userSchema.index({ "auctionCapabilities.auctionDealer.status": 1 });

const User = mongoose.model("User", userSchema);

// Static method to find and delete user in one operation
User.findByIdAndDelete = async function (userId) {
  try {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    await this.deleteOne({ _id: userId });
    return user;
  } catch (error) {
    throw error;
  }
};

export default User;
