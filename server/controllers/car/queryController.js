import Car from "../../models/carModel.js";
import { AuctionCar, Auction } from "../../models/auctionModel.js";
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
    console.log('🔍 getAllCars - req.query:', req.query);
    try {
      const { filter: advancedFilter } = buildCarQuery(req.query);
      console.log('🔍 getAllCars - advancedFilter from buildCarQuery:', advancedFilter);
      if (advancedFilter && Object.keys(advancedFilter).length > 0) {
         console.log('🔍 getAllCars - Merging with base query. Base query:', JSON.stringify(query, null, 2));
         console.log('🔍 getAllCars - Advanced filter:', JSON.stringify(advancedFilter, null, 2));
         // Merge advanced filters into the main query
         // We use $and to ensure both base constraints and user filters are met
         query = { $and: [query, advancedFilter] };
         console.log('🔍 getAllCars - Final merged query:', JSON.stringify(query, null, 2));
      } else {
         console.log('🔍 getAllCars - No advanced filters to apply');
      }
    } catch (filterError) {
      Logger.warn("Error building car query filters", filterError);
      // Continue with base query if filter building fails (or return error if strict)
    }

    console.log('🔍 getAllCars - Final MongoDB query:', JSON.stringify(query, null, 2));
    
    const carsDocuments = await Car.find(query)
      .select("title make model year price images city location status featured condition fuelType transmission mileage postedBy createdAt viewsgeoLocation vehicleType features carDoors horsepower engineCapacity contactNumber whatsappNumber isSold listingType")
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "name email role sellerRating isVerified dealerInfo")
      .sort({ featured: -1, status: 1, createdAt: -1 })
      .lean();
      
    console.log('🔍 getAllCars - Found cars count:', carsDocuments.length);
    
    // Debug: Log first few cars to see what we have
    if (carsDocuments.length > 0) {
      console.log('🔍 getAllCars - Sample cars:', carsDocuments.slice(0, 3).map(car => ({
        make: car.make,
        model: car.model,
        title: car.title
      })));
    }

    // Enrichment: For auction-flagged items, join minimal auction data (timer/bid)
    const cars = await Promise.all(
      carsDocuments.map(async (c) => {
        if (c.listingType === "auction") {
          try {
            const ac = await AuctionCar.findOne({ car: c._id, status: { $ne: "withdrawn" } })
              .populate("auction", "endTime status")
              .lean();
            if (ac && ac.auction) {
              return {
                ...c,
                currentBid: ac.currentBid || 0,
                startingBid: ac.startingBid || 0,
                auctionEndTime: ac.auction.endTime,
                auctionStatus: ac.auction.status,
                lotStatus: ac.status
              };
            }
          } catch (err) {
            Logger.warn("Failed to enrich marketplace car with auction data", { carId: c._id });
          }
        }
        return c;
      })
    );

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

    const carData = car.toObject();

    // Enrichment: For auction-flagged items, join minimal auction data (timer/bid)
    if (carData.listingType === "auction") {
      try {
        const ac = await AuctionCar.findOne({ car: carData._id, status: { $ne: "withdrawn" } })
          .populate("auction", "endTime status")
          .lean();
        if (ac && ac.auction) {
          carData.currentBid = ac.currentBid || 0;
          carData.startingBid = ac.startingBid || 0;
          carData.auctionEndTime = ac.auction.endTime;
          carData.auctionStatus = ac.auction.status;
          carData.lotStatus = ac.status;
        }
      } catch (err) {
        Logger.warn("Failed to enrich marketplace detail with auction data", { carId: carData._id });
      }
    }

    return res.status(200).json({ 
      success: true, 
      data: {
        ...carData,
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
    const match = {
      status: { $nin: ["deleted", "expired"] },
      $or: [
        { isApproved: true },
        { isApproved: { $exists: false } }
      ]
    };
    // Scope counts by vehicle type when provided (so Bike tab shows only bike listing counts)
    const validVehicleTypes = ["Car", "Bus", "Truck", "Van", "Bike", "E-bike", "Farm"];
    if (req.query.vehicleType && validVehicleTypes.includes(req.query.vehicleType)) {
      match.vehicleType = req.query.vehicleType;
    }
    const counts = await Car.aggregate([
      { $match: match },
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

export const getModelsByMake = async (req, res) => {
  try {
    const { make } = req.params;
    if (!make) {
      return res.status(400).json({ success: false, message: "Make is required" });
    }
    
    const match = {
      status: { $nin: ["deleted", "expired"] },
      $or: [{ isApproved: true }, { isApproved: { $exists: false } }],
      make: { $regex: new RegExp(`^${make}$`, 'i') } // case-insensitive match
    };
    
    const models = await Car.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $toLower: { $trim: { input: "$model" } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Return just the model names
    const modelNames = models.map(m => m._id).filter(Boolean);
    
    return res.status(200).json({ 
      success: true, 
      data: modelNames,
      make: make
    });
  } catch (error) {
    Logger.error("Get Models By Make Error", error);
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

// Get distinct years from cars (dynamic based on available inventory)
export const getYears = async (req, res) => {
  try {
    const { make, model } = req.query;
    
    const query = {
      status: { $nin: ["deleted", "expired"] },
      year: { $exists: true, $ne: null }
    };
    
    if (make) {
      query.make = { $regex: new RegExp(make, 'i') };
    }
    if (model) {
      query.model = { $regex: new RegExp(model, 'i') };
    }

    const years = await Car.distinct('year', query);
    
    // Sort years descending (newest first)
    const sortedYears = years
      .filter(y => y && y >= 1990 && y <= new Date().getFullYear() + 1)
      .sort((a, b) => b - a);

    return res.status(200).json({
      success: true,
      data: sortedYears
    });
  } catch (error) {
    Logger.error("Get Years Error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
