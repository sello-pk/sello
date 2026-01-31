import Category from "../models/categoryModel.js";
import VehicleType from "../models/vehicleTypeModel.js";
import CategoryField from "../models/categoryFieldModel.js";
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
      description,
      image,
      type,
      subType,
      parentCategory,
      order,
      isActive,
      vehicleType,
    } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: "Name and type are required.",
      });
    }

    // Handle image upload
    let imageUrl = image || null;
    if (req.file) {
      try {
        imageUrl = await uploadCloudinary(req.file.buffer);
      } catch (error) {
        Logger.error("Error uploading category image", error);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image.",
        });
      }
    }

    // Validate subType for car categories
    if (
      type === "car" &&
      subType &&
      !["make", "model", "year"].includes(subType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid subType for car category. Must be 'make', 'model', or 'year'.",
      });
    }

    // Validate vehicleType for car categories (but not for years - years are independent)
    if (type === "car" && subType && ["make", "model"].includes(subType)) {
      const validVehicleTypes = [
        "Car",
        "Bus",
        "Truck",
        "Van",
        "Bike",
        "E-bike",
        "Farm",
      ];
      if (!vehicleType || !validVehicleTypes.includes(vehicleType)) {
        return res.status(400).json({
          success: false,
          message: `vehicleType is required for car categories. Must be one of: ${validVehicleTypes.join(
            ", ",
          )}`,
        });
      }
    }

    // Validate subType for location categories
    if (
      type === "location" &&
      subType &&
      !["country", "city", "state"].includes(subType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid subType for location category. Must be 'country', 'city', or 'state'.",
      });
    }

    // Cities and states require a parentCategory
    if (
      type === "location" &&
      (subType === "city" || subType === "state") &&
      !parentCategory
    ) {
      if (subType === "city") {
        return res.status(400).json({
          success: false,
          message: "City categories must have a state or country category as parent.",
        });
      } else if (subType === "state") {
        return res.status(400).json({
          success: false,
          message: "State categories must have a country category as parent.",
        });
      }
    }

    // Validate parentCategory if provided
    if (parentCategory) {
      if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
        return res.status(400).json({
          success: false,
          message: "Invalid parent category ID.",
        });
      }
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found.",
        });
      }

      // Ensure parent is a location type category
      if (type === "location" && parent.type !== "location") {
        return res.status(400).json({
          success: false,
          message: `Parent category must be a location type category. Received type: "${parent.type}"`,
        });
      }

      // Cities can have state OR country as parent
      if (subType === "city") {
        if (parent.subType !== "state" && parent.subType !== "country") {
          return res.status(400).json({
            success: false,
            message: `City categories must have a state or country category as parent. Received parent type: "${parent.subType}"`,
          });
        }
      } else if (subType === "state") {
        // States must have a country as parent
        if (parent.subType !== "country") {
          return res.status(400).json({
            success: false,
            message: "State categories must have a country category as parent.",
          });
        }
      } else if (subType === "model") {
        // Models must have a make as parent
        if (parent.subType !== "make") {
          return res.status(400).json({
            success: false,
            message: "Model categories must have a make category as parent.",
          });
        }
        // Ensure parent make has the same vehicleType
        if (vehicleType && parent.vehicleType !== vehicleType) {
          return res.status(400).json({
            success: false,
            message: `Model vehicle type (${vehicleType}) must match parent brand vehicle type (${
              parent.vehicleType || "none"
            }).`,
          });
        }
      }
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

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
    // Handle specific duplicate key error from MongoDB
    if (error.code === 11000) {
       return res.status(409).json({
        success: false,
        message: "Category already exists.",
      });
    }

    // Handle Mongoose Validation Errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    Logger.error("Create Category Error", error);
    console.error("Create Category Detailed Error:", error); 
    
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export { createCategory };
