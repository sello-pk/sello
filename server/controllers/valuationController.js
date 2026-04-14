import Valuation from "../models/valuationModel.js";
import Logger from "../utils/logger.js";
import { calculateEstimation } from "../utils/valuationHelper.js";

const parseMileageInput = (input) => {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input !== "string") return NaN;

  const normalized = input.replace(/,/g, "").trim();
  const numbers = normalized.match(/\d+/g)?.map(Number) || [];
  if (numbers.length === 0) return NaN;

  // Handles formats like "10,000 - 20,000", "150,000+", "< 5,000", "120000"
  if (normalized.includes("-") && numbers.length >= 2) {
    return Math.round((numbers[0] + numbers[1]) / 2);
  }

  return numbers[0];
};

const normalizeConditionForStorage = (conditionInput) => {
  if (!conditionInput) return undefined;
  if (typeof conditionInput === "object" && !Array.isArray(conditionInput)) {
    return conditionInput;
  }
  if (typeof conditionInput === "string") {
    const c = conditionInput.trim().toLowerCase();
    if (!c) return undefined;
    return {
      engine: c,
      body: c,
      interior: c,
      tire: c,
      suspension: c,
    };
  }
  return undefined;
};

/**
 * Create a new valuation
 */
export const createValuation = async (req, res) => {
  try {
    const vehicleData = req.body;

    // Validate required fields
    const requiredFields = [
      "make",
      "model",
      "year",
      "mileage",
      "engineType",
      "transmission",
    ];
    const missingFields = requiredFields.filter((field) => !vehicleData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
        error: "Validation error",
      });
    }

    // Validate data types
    const year = parseInt(vehicleData.year);
    const mileage = parseMileageInput(vehicleData.mileage);

    if (isNaN(year) || year < 1990 || year > new Date().getFullYear() + 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid year. Must be between 1990 and current year.",
        error: "Validation error",
      });
    }

    if (isNaN(mileage) || mileage < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid mileage. Must be a positive number.",
        error: "Validation error",
      });
    }

    // Log for debugging
    Logger.info("Creating valuation for:", {
      make: vehicleData.make,
      model: vehicleData.model,
      year,
    });

    const normalizedVehicleData = {
      ...vehicleData,
      year,
      mileage,
      condition: normalizeConditionForStorage(vehicleData.condition),
    };

    const estimationInput = {
      ...normalizedVehicleData,
      condition: vehicleData.condition,
    };
    const estimation = await calculateEstimation(estimationInput);

    const valuation = new Valuation({
      userId: req.user?._id, // Optional user ID
      vehicleData: normalizedVehicleData,
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
    const valuations = await Valuation.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

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
    const valuation = await Valuation.findById(req.params.id).populate(
      "userId",
      "name email",
    );

    if (!valuation) {
      return res
        .status(404)
        .json({ success: false, message: "Valuation not found" });
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
    if (!valuation)
      return res.status(404).json({ success: false, message: "Not found" });

    res.status(200).json({
      success: true,
      message: "Valuation deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete error" });
  }
};

/**
 * Calculate maintenance cost
 */
export const calculateMaintenanceCost = async (req, res) => {
  try {
    const { make, year, mileage } = req.body;

    // Base maintenance costs for Pakistani market (PKR)
    const baseCosts = {
      toyota: { base: 80000, ageMultiplier: 5000, mileageMultiplier: 0.1 },
      honda: { base: 90000, ageMultiplier: 5500, mileageMultiplier: 0.12 },
      suzuki: { base: 65000, ageMultiplier: 4000, mileageMultiplier: 0.08 },
      kia: { base: 95000, ageMultiplier: 6000, mileageMultiplier: 0.15 },
      mg: { base: 100000, ageMultiplier: 6500, mileageMultiplier: 0.18 },
    };

    const carData = baseCosts[make?.toLowerCase()] || baseCosts.toyota;
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    
    const yearly = Math.round(
      carData.base + 
      (age * carData.ageMultiplier) + 
      (mileage * carData.mileageMultiplier)
    );

    const breakdown = {
      yearly,
      oilChange: 8000 * 4,
      brakes: 25000 + (age * 2000),
      tires: 40000 + (age * 3000),
      parts: age * 3000,
      misc: Math.round(yearly * 0.15),
    };

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (error) {
    Logger.error("calculateMaintenanceCost Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Calculate fuel cost
 */
export const calculateFuelCost = async (req, res) => {
  try {
    const { monthlyKms, mileage, fuelPrice } = req.body;

    const monthlyFuelLiters = monthlyKms / mileage;
    const monthlyCost = Math.round(monthlyFuelLiters * fuelPrice);
    const yearlyCost = monthlyCost * 12;
    
    const cngSavings = Math.round(monthlyCost * 0.4);

    res.status(200).json({
      success: true,
      data: {
        monthlyCost,
        yearlyCost,
        monthlyFuelLiters: Math.round(monthlyFuelLiters),
        cngSavings,
      },
    });
  } catch (error) {
    Logger.error("calculateFuelCost Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Calculate resale value
 */
export const calculateResaleValue = async (req, res) => {
  try {
    const { currentValue, years, make, model } = req.body;

    // Brand-specific depreciation rates for Pakistani market
    const depreciationRates = {
      toyota: 0.10,      // 10% per year
      honda: 0.11,       // 11% per year
      suzuki: 0.12,      // 12% per year
      kia: 0.14,        // 14% per year
      mg: 0.15,          // 15% per year
      default: 0.12,     // 12% default
    };

    const depRate = depreciationRates[make?.toLowerCase()] || depreciationRates.default;
    
    const yearData = Array.from({ length: years + 1 }, (_, i) => ({
      year: i,
      value: Math.round(currentValue * Math.pow(1 - depRate, i)),
      depreciation: i === 0 ? 0 : Math.round((1 - Math.pow(1 - depRate, i)) * 100),
    }));

    const finalValue = yearData[years].value;
    const totalLoss = currentValue - finalValue;

    res.status(200).json({
      success: true,
      data: {
        currentValue,
        years,
        finalValue,
        totalLoss,
        depreciationRate: depRate * 100,
        yearData,
      },
    });
  } catch (error) {
    Logger.error("calculateResaleValue Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Calculate ownership cost
 */
export const calculateOwnershipCost = async (req, res) => {
  try {
    const { make, model, year, currentValue } = req.body;

    // Pakistani market average costs
    const costs = {
      insurance: 40000,
      registration: 8000,
      maintenance: 80000,
      fuel: 180000,
    };

    // Adjust based on car value for insurance
    if (currentValue > 2000000) {
      costs.insurance = 60000;
    } else if (currentValue > 5000000) {
      costs.insurance = 80000;
    }

    const totalYearly = Object.values(costs).reduce((sum, cost) => sum + cost, 0);

    res.status(200).json({
      success: true,
      data: {
        costs,
        totalYearly,
        breakdown: [
          { category: 'Insurance', cost: costs.insurance, percentage: (costs.insurance / totalYearly * 100).toFixed(1) },
          { category: 'Registration', cost: costs.registration, percentage: (costs.registration / totalYearly * 100).toFixed(1) },
          { category: 'Maintenance', cost: costs.maintenance, percentage: (costs.maintenance / totalYearly * 100).toFixed(1) },
          { category: 'Fuel', cost: costs.fuel, percentage: (costs.fuel / totalYearly * 100).toFixed(1) },
        ],
      },
    });
  } catch (error) {
    Logger.error("calculateOwnershipCost Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
