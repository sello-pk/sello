import Car from "../../models/carModel.js";
import { buildCarQuery } from "../../utils/parseArray.js";
import Logger from "../../utils/logger.js";
import mongoose from "mongoose";
import { getPriceAnalysis } from "../../utils/valuationHelper.js";

export const getAllCars = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const now = new Date();

    const baseQuery = {
      $and: [
        { $or: [{ isApproved: true }, { isApproved: { $exists: false } }] },
        { status: { $nin: ["deleted", "expired"] } },
        {
          $or: [
            { status: { $ne: "sold" } },
            {
              status: "sold",
              $or: [{ autoDeleteDate: { $gt: now } }, { autoDeleteDate: { $exists: false } }],
            },
          ],
        },
      ],
    };

    if (req.query.includeSold === "true") {
      baseQuery.$and = baseQuery.$and.filter(
        (clause) => !(clause.$or && clause.$or.some((c) => c.status && c.status.$ne === "sold"))
      );
    }

    let query = { ...baseQuery };

    // Apply vehicleType filter if manually provided (though buildCarQuery also handles it, keeping for safety)
    if (req.query.vehicleType) {
      const validVehicleTypes = ["Car", "Bus", "Truck", "Van", "Bike", "E-bike", "Farm"];
      const vehicleTypes = Array.isArray(req.query.vehicleType) ? req.query.vehicleType : [req.query.vehicleType];
      const validTypes = vehicleTypes.filter((vt) => validVehicleTypes.includes(vt));
      if (validTypes.length > 0) {
        query = { ...query, vehicleType: { $in: validTypes } };
      }
    }

    // Always apply advanced filters (search, price range, make, model, etc.)
    // We pass the entire query object to buildCarQuery
    try {
      const { filter: advancedFilter } = buildCarQuery(req.query);
      if (advancedFilter && Object.keys(advancedFilter).length > 0) {
         // Merge advanced filters into the main query
         // We use $and to ensure both base constraints and user filters are met
         query = { $and: [query, advancedFilter] };
      }
    } catch (filterError) {
      Logger.warn("Error building car query filters", filterError);
      // Continue with base query if filter building fails (or return error if strict)
    }

    const cars = await Car.find(query)
      .select("title make model year price images city location status featured condition fuelType transmission mileage postedBy createdAt viewsgeoLocation vehicleType features carDoors horsepower engineCapacity")
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "name email role sellerRating isVerified dealerInfo")
      .sort({ featured: -1, status: 1, createdAt: -1 })
      .lean();

    const total = await Car.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: { total, page, pages: Math.ceil(total / limit), cars },
    });
  } catch (error) {
    Logger.error("Get Cars Error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Start of Selection
export const getFilteredCars = getAllCars;
// End of Selection

export const getSingleCar = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID" });
    }

    const car = await Car.findById(id).populate("postedBy", "name email role avatar dealerInfo sellerRating reviewCount isVerified createdAt");
    if (!car) return res.status(404).json({ success: false, message: "Not found" });

    // AI Price Analysis
    let priceAnalysis = null;
    try {
      priceAnalysis = await getPriceAnalysis(car);
    } catch (paError) {
      Logger.warn("Price analysis failed for single car", { carId: car._id });
    }

    // Increment views
    car.views = (car.views || 0) + 1;
    await car.save();

    return res.status(200).json({ 
      success: true, 
      data: {
        ...car.toObject(),
        priceAnalysis
      }
    });
  } catch (error) {
    Logger.error("Get Single Car Error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCarCountsByMake = async (req, res) => {
  try {
    const now = new Date();
    const counts = await Car.aggregate([
      { 
        $match: { 
          status: { $nin: ["deleted", "expired"] },
          $or: [
            { isApproved: true },
            { isApproved: { $exists: false } }
          ]
        } 
      },
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$make" } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    return res.status(200).json({ success: true, data: counts });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getMyCars = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12; // Adjusted to match other endpoints
    const skip = (page - 1) * limit;

    const query = { 
      postedBy: req.user._id, 
      status: { $ne: 'deleted' } 
    };

    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    const cars = await Car.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "name email");

    const total = await Car.countDocuments(query);
    
    // Calculate stats
    const stats = {
      total: await Car.countDocuments({ postedBy: req.user._id, status: { $ne: 'deleted' } }),
      active: await Car.countDocuments({ postedBy: req.user._id, status: 'active' }),
      sold: await Car.countDocuments({ postedBy: req.user._id, status: 'sold' }),
      expired: await Car.countDocuments({ postedBy: req.user._id, status: 'expired' })
    };

    return res.status(200).json({ 
      success: true, 
      data: { 
        cars, 
        total,
        page,
        pages: Math.ceil(total / limit),
        stats
      } 
    });
  } catch (error) {
    Logger.error("Get My Cars Error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
