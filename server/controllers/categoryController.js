import Category from "../models/categoryModel.js";
import mongoose from "mongoose";
import { uploadCloudinary } from "../utils/cloudinary.js";
import Logger from "../utils/logger.js";

/**
 * Create Category
 */
export const createCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create categories.",
      });
    }

    const {
      name,
      type,
      subType,
      vehicleType,
      parentCategory,
      description,
      order,
      isActive,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required.",
      });
    }

    // Validate vehicle type for car categories
    if (
      type === "car" &&
      (subType === "make" || subType === "model") &&
      !vehicleType
    ) {
      return res.status(400).json({
        success: false,
        message: "Vehicle type is required for makes and models.",
      });
    }

    // Validate parent category for location categories
    if (
      type === "location" &&
      (subType === "state" || subType === "city") &&
      !parentCategory
    ) {
      return res.status(400).json({
        success: false,
        message: "Parent category is required for states and cities.",
      });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check for duplicates before creating (case-insensitive)
    const duplicateQuery = {
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    };

    if (type === "car") {
      duplicateQuery.type = "car";
      if (subType === "make" || subType === "model") {
        duplicateQuery.subType = subType;
        duplicateQuery.vehicleType = vehicleType;
      } else if (subType === "year") {
        duplicateQuery.subType = "year";
        // Years are independent of vehicleType
      }
    } else if (type === "location") {
      duplicateQuery.type = "location";
      duplicateQuery.subType = subType;

      // For location categories, also check parent hierarchy
      if (subType === "state" && parentCategory) {
        duplicateQuery.parentCategory = parentCategory;
      } else if (subType === "city" && parentCategory) {
        duplicateQuery.parentCategory = parentCategory;
      } else if (subType === "country") {
        // Countries are standalone
      }
    }

    const existingCategory = await Category.findOne(duplicateQuery);
    if (existingCategory) {
      let errorMessage = "Category already exists.";

      // Provide more specific error messages
      if (type === "car") {
        if (subType === "make") {
          errorMessage = `Brand "${name}" already exists for vehicle type "${vehicleType}".`;
        } else if (subType === "model") {
          errorMessage = `Model "${name}" already exists for this brand and vehicle type.`;
        } else if (subType === "year") {
          errorMessage = `Year "${name}" already exists.`;
        }
      } else if (type === "location") {
        if (subType === "country") {
          errorMessage = `Country "${name}" already exists.`;
        } else if (subType === "state") {
          errorMessage = `State "${name}" already exists in this country.`;
        } else if (subType === "city") {
          errorMessage = `City "${name}" already exists in this state/country.`;
        }
      }

      return res.status(409).json({
        success: false,
        message: errorMessage,
      });
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadCloudinary(req.file.buffer);
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      image: imageUrl,
      type,
      subType: subType || null,
      vehicleType: type === "car" && vehicleType ? vehicleType : null,
      parentCategory: parentCategory || null,
      order: order || 0,
      isActive:
        isActive !== undefined
          ? isActive === "true" || isActive === true
          : true,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully.",
      data: category,
    });
  } catch (error) {
    Logger.error("Create Category Error", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let errorMessage = "Category already exists.";

      // Provide specific messages based on the field that caused the duplicate
      if (
        error.keyPattern.name &&
        error.keyPattern.vehicleType &&
        error.keyPattern.subType
      ) {
        errorMessage = `This ${error.keyPattern.subType} already exists for this vehicle type.`;
      } else if (error.keyPattern.name && error.keyPattern.subType === "year") {
        errorMessage = `This year already exists.`;
      } else if (
        error.keyPattern.name &&
        error.keyPattern.subType === "country"
      ) {
        errorMessage = `This country already exists.`;
      } else if (
        error.keyPattern.name &&
        error.keyPattern.parentCategory &&
        error.keyPattern.subType === "state"
      ) {
        errorMessage = `This state already exists in this country.`;
      } else if (
        error.keyPattern.name &&
        error.keyPattern.parentCategory &&
        error.keyPattern.subType === "city"
      ) {
        errorMessage = `This city already exists in this state/country.`;
      }

      return res.status(409).json({
        success: false,
        message: errorMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update Category
 */
export const updateCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can update categories.",
      });
    }

    const { categoryId } = req.params;
    const {
      name,
      type,
      subType,
      vehicleType,
      parentCategory,
      description,
      order,
      isActive,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // Update fields
    if (name) {
      category.name = name.trim();
      category.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (description !== undefined) category.description = description;
    if (type !== undefined) category.type = type;
    if (subType !== undefined) category.subType = subType;
    if (vehicleType !== undefined) category.vehicleType = vehicleType;
    if (parentCategory !== undefined) category.parentCategory = parentCategory;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;

    // Check for duplicates before updating (excluding current category, case-insensitive)
    const duplicateQuery = {
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
      _id: { $ne: categoryId },
    };

    if (category.type === "car") {
      duplicateQuery.type = "car";
      const currentSubType = subType !== undefined ? subType : category.subType;
      const currentVehicleType =
        vehicleType !== undefined ? vehicleType : category.vehicleType;

      if (currentSubType === "make" || currentSubType === "model") {
        duplicateQuery.subType = currentSubType;
        duplicateQuery.vehicleType = currentVehicleType;
      } else if (currentSubType === "year") {
        duplicateQuery.subType = "year";
        // Years are independent of vehicleType
      }
    } else if (category.type === "location") {
      duplicateQuery.type = "location";
      duplicateQuery.subType =
        subType !== undefined ? subType : category.subType;

      // For location categories, also check parent hierarchy
      const currentSubType = subType !== undefined ? subType : category.subType;
      const currentParent =
        parentCategory !== undefined ? parentCategory : category.parentCategory;

      if (currentSubType === "state" && currentParent) {
        duplicateQuery.parentCategory = currentParent;
      } else if (currentSubType === "city" && currentParent) {
        duplicateQuery.parentCategory = currentParent;
      } else if (currentSubType === "country") {
        // Countries are standalone
      }
    }

    const existingCategory = await Category.findOne(duplicateQuery);
    if (existingCategory) {
      let errorMessage = "Category already exists.";

      // Provide more specific error messages
      if (category.type === "car") {
        const currentSubType =
          subType !== undefined ? subType : category.subType;
        const currentVehicleType =
          vehicleType !== undefined ? vehicleType : category.vehicleType;

        if (currentSubType === "make") {
          errorMessage = `Brand "${name}" already exists for vehicle type "${currentVehicleType}".`;
        } else if (currentSubType === "model") {
          errorMessage = `Model "${name}" already exists for this brand and vehicle type.`;
        } else if (currentSubType === "year") {
          errorMessage = `Year "${name}" already exists.`;
        }
      } else if (category.type === "location") {
        const currentSubType =
          subType !== undefined ? subType : category.subType;

        if (currentSubType === "country") {
          errorMessage = `Country "${name}" already exists.`;
        } else if (currentSubType === "state") {
          errorMessage = `State "${name}" already exists in this country.`;
        } else if (currentSubType === "city") {
          errorMessage = `City "${name}" already exists in this state/country.`;
        }
      }

      return res.status(409).json({
        success: false,
        message: errorMessage,
      });
    }

    // Handle image upload
    if (req.file) {
      const imageUrl = await uploadCloudinary(req.file.buffer);
      category.image = imageUrl;
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    Logger.error("Update Category Error", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      let errorMessage = "Category already exists.";

      // Provide specific messages based on the field that caused the duplicate
      if (
        error.keyPattern.name &&
        error.keyPattern.vehicleType &&
        error.keyPattern.subType
      ) {
        errorMessage = `This ${error.keyPattern.subType} already exists for this vehicle type.`;
      } else if (error.keyPattern.name && error.keyPattern.subType === "year") {
        errorMessage = `This year already exists.`;
      } else if (
        error.keyPattern.name &&
        error.keyPattern.subType === "country"
      ) {
        errorMessage = `This country already exists.`;
      } else if (
        error.keyPattern.name &&
        error.keyPattern.parentCategory &&
        error.keyPattern.subType === "state"
      ) {
        errorMessage = `This state already exists in this country.`;
      } else if (
        error.keyPattern.name &&
        error.keyPattern.parentCategory &&
        error.keyPattern.subType === "city"
      ) {
        errorMessage = `This city already exists in this state/country.`;
      }

      return res.status(409).json({
        success: false,
        message: errorMessage,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete Category
 */
export const deleteCategory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete categories.",
      });
    }

    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    await category.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    Logger.error("Delete Category Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Vehicle Types
 * Returns available vehicle types for car categories
 */
export const getVehicleTypes = async (req, res) => {
  try {
    const vehicleTypes = [
      "Car",
      "Bus",
      "Truck",
      "Van",
      "Bike",
      "E-bike",
      "Farm",
    ];

    return res.status(200).json({
      success: true,
      data: vehicleTypes,
    });
  } catch (error) {
    Logger.error("Get Vehicle Types Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

/**
 * Get Fields for Vehicle Type
 * Returns dynamic fields configuration based on vehicle type
 */
export const getFieldsForType = async (req, res) => {
  try {
    const { id } = req.params; // vehicle type

    // Define fields for each vehicle type
    const vehicleTypeFields = {
      Car: {
        makes: [
          "Toyota",
          "Honda",
          "Ford",
          "BMW",
          "Mercedes",
          "Audi",
          "Volkswagen",
          "Nissan",
          "Hyundai",
          "Kia",
        ],
        conditions: ["New", "Like New", "Excellent", "Good", "Fair"],
        fuelTypes: ["Petrol", "Diesel", "Hybrid", "Electric", "CNG"],
        transmissions: ["Manual", "Automatic", "CVT", "Semi-Automatic"],
        bodyTypes: [
          "Sedan",
          "SUV",
          "Hatchback",
          "Coupe",
          "Convertible",
          "Wagon",
          "Pickup",
        ],
        colors: [
          "White",
          "Black",
          "Silver",
          "Gray",
          "Red",
          "Blue",
          "Green",
          "Brown",
          "Yellow",
          "Orange",
        ],
        features: [
          "Air Conditioning",
          "Power Steering",
          "Anti-lock Braking",
          "Airbags",
          "Cruise Control",
          "Parking Sensors",
          "Camera",
          "Bluetooth",
          "USB",
          "Leather Seats",
        ],
      },
      Bike: {
        makes: [
          "Honda",
          "Yamaha",
          "Suzuki",
          "Kawasaki",
          "Ducati",
          "BMW",
          "Harley-Davidson",
          "Royal Enfield",
          "TVS",
          "Bajaj",
        ],
        conditions: ["New", "Like New", "Excellent", "Good", "Fair"],
        fuelTypes: ["Petrol", "Diesel", "Electric"],
        transmissions: ["Manual", "Automatic"],
        bodyTypes: [
          "Sport",
          "Cruiser",
          "Touring",
          "Off-road",
          "Scooter",
          "Standard",
        ],
        colors: [
          "Black",
          "Red",
          "Blue",
          "White",
          "Gray",
          "Green",
          "Yellow",
          "Orange",
        ],
        features: [
          "Disc Brakes",
          "ABS",
          "LED Lights",
          "Digital Display",
          "Bluetooth",
          "USB Charging",
          "Quick Shifter",
          "Traction Control",
        ],
      },
      Truck: {
        makes: [
          "Isuzu",
          "Tata",
          "Ashok Leyland",
          "Mahindra",
          "Volvo",
          "Scania",
          "Mercedes-Benz",
          "MAN",
        ],
        conditions: ["New", "Like New", "Excellent", "Good", "Fair"],
        fuelTypes: ["Diesel", "CNG", "Electric"],
        transmissions: ["Manual", "Automatic", "Semi-Automatic"],
        bodyTypes: [
          "Pickup",
          "Flatbed",
          "Tanker",
          "Container",
          "Refrigerated",
          "Dump Truck",
        ],
        colors: ["White", "Blue", "Red", "Yellow", "Green", "Gray", "Black"],
        features: [
          "Power Steering",
          "Air Conditioning",
          "Hydraulic Lift",
          "GPS",
          "Tachometer",
          "Air Brakes",
          "Cruise Control",
        ],
      },
      Bus: {
        makes: [
          "Tata",
          "Ashok Leyland",
          "Volvo",
          "Scania",
          "Mercedes-Benz",
          "Isuzu",
          "Mahindra",
        ],
        conditions: ["New", "Like New", "Excellent", "Good", "Fair"],
        fuelTypes: ["Diesel", "CNG", "Electric"],
        transmissions: ["Manual", "Automatic"],
        bodyTypes: [
          "Minibus",
          "Coach",
          "School Bus",
          "City Bus",
          "Luxury Bus",
          "Articulated",
        ],
        colors: ["White", "Yellow", "Blue", "Red", "Green", "Gray"],
        features: [
          "Air Conditioning",
          "GPS",
          "CCTV",
          "Emergency Exit",
          "Wheelchair Access",
          "Audio System",
          "LED Display",
        ],
      },
      Van: {
        makes: [
          "Ford",
          "Mercedes-Benz",
          "Volkswagen",
          "Renault",
          "Nissan",
          "Toyota",
          "Peugeot",
          "Fiat",
        ],
        conditions: ["New", "Like New", "Excellent", "Good", "Fair"],
        fuelTypes: ["Petrol", "Diesel", "Electric", "Hybrid"],
        transmissions: ["Manual", "Automatic"],
        bodyTypes: [
          "Cargo Van",
          "Passenger Van",
          "Minivan",
          "Panel Van",
          "Crew Van",
        ],
        colors: ["White", "Silver", "Black", "Blue", "Gray", "Red"],
        features: [
          "Sliding Doors",
          "Air Conditioning",
          "Parking Sensors",
          "Bluetooth",
          "USB",
          "Cargo Space",
          "Rear Camera",
        ],
      },
      "E-bike": {
        makes: [
          "Hero Electric",
          "Ather",
          "Ola Electric",
          "TVS",
          "Bajaj",
          "Revolt",
          "Pure EV",
          "Okaya",
        ],
        conditions: ["New", "Like New", "Excellent", "Good", "Fair"],
        fuelTypes: ["Electric"],
        transmissions: ["Automatic"],
        bodyTypes: [
          "Scooter",
          "Mountain",
          "Road",
          "Hybrid",
          "Folding",
          "Fat Tire",
        ],
        colors: [
          "Black",
          "White",
          "Red",
          "Blue",
          "Green",
          "Gray",
          "Yellow",
          "Orange",
        ],
        features: [
          "LED Display",
          "USB Charging",
          "Disc Brakes",
          "LED Lights",
          "Mobile App",
          "GPS",
          "Regenerative Braking",
        ],
      },
      Farm: {
        makes: [
          "John Deere",
          "Mahindra",
          "TAFE",
          "Sonalika",
          "Escorts",
          "New Holland",
          "Kubota",
          "Massey Ferguson",
        ],
        conditions: ["New", "Like New", "Excellent", "Good", "Fair"],
        fuelTypes: ["Diesel", "Petrol", "CNG"],
        transmissions: ["Manual", "Automatic"],
        bodyTypes: [
          "Tractor",
          "Harvester",
          "Plow",
          "Seeder",
          "Sprayer",
          "Thresher",
          "Cultivator",
        ],
        colors: ["Green", "Red", "Blue", "Yellow", "Orange", "Gray", "Black"],
        features: [
          "4WD",
          "Power Steering",
          "Hydraulic Lift",
          "PTO",
          "Cruise Control",
          "GPS",
          "Air Conditioning",
        ],
      },
    };

    const fields = vehicleTypeFields[id];

    if (!fields) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        vehicleType: id,
        fields,
      },
    });
  } catch (error) {
    Logger.error("Get Fields For Type Error", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};
