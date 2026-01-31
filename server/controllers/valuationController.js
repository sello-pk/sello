import Valuation from "../models/valuationModel.js";
import Logger from "../utils/logger.js";
import { calculateEstimation } from "../utils/valuationHelper.js";


/**
 * Create a new valuation
 */
export const createValuation = async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Validate required fields
    const requiredFields = ['make', 'model', 'year', 'mileage', 'fuelType', 'transmission'];
    const missingFields = requiredFields.filter(field => !vehicleData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: 'Validation error'
      });
    }

    // Validate data types
    const year = parseInt(vehicleData.year);
    const mileage = parseInt(vehicleData.mileage);
    
    if (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year. Must be between 1990 and current year.',
        error: 'Validation error'
      });
    }

    if (isNaN(mileage) || mileage < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mileage. Must be a positive number.',
        error: 'Validation error'
      });
    }
    
    // Log for debugging
    Logger.info("Creating valuation for:", { make: vehicleData.make, model: vehicleData.model, year });

    const estimation = await calculateEstimation(vehicleData);

    const valuation = new Valuation({
      userId: req.user?._id, // Optional user ID
      vehicleData,
      estimation,
    });

    await valuation.save();

    res.status(201).json({
      success: true,
      data: valuation,
    });
  } catch (error) {
    Logger.error("createValuation Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during valuation",
      error: error.message,
    });
  }
};

/**
 * Get valuation history for current user
 */
export const getUserValuationHistory = async (req, res) => {
  try {
    const valuations = await Valuation.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: valuations.length,
      data: valuations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching history",
    });
  }
};

/**
 * Admin: Get all valuations
 */
export const getAllValuationsAdmin = async (req, res) => {
  try {
    const valuations = await Valuation.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: valuations.length,
      data: valuations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin fetch error",
    });
  }
};

/**
 * Get single valuation
 */
export const getValuationById = async (req, res) => {
  try {
    const valuation = await Valuation.findById(req.params.id).populate("userId", "name email");
    
    if (!valuation) {
      return res.status(404).json({ success: false, message: "Valuation not found" });
    }

    res.status(200).json({
      success: true,
      data: valuation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Fetch error",
    });
  }
};

/**
 * Delete valuation
 */
export const deleteValuation = async (req, res) => {
  try {
    const valuation = await Valuation.findByIdAndDelete(req.params.id);
    if (!valuation) return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({
      success: true,
      message: "Valuation deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete error" });
  }
};
