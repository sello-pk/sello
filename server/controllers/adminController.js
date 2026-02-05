import mongoose from "mongoose";
import Car from "../models/carModel.js";
import User from "../models/userModel.js";
import { Blog } from "../models/blogModel.js";
import CustomerRequest from "../models/customerRequestModel.js";
import AuditLog from "../models/auditLogModel.js";
import { Logger, sendEmail, createAuditLog } from "../utils/helpers.js";
import { getCarApprovedTemplate, getCarRejectedTemplate } from "../utils/emailTemplates.js";

/* -------------------------------------------------------------------------- */
/*                                ADMIN SERVICE                               */
/* -------------------------------------------------------------------------- */

const AdminService = {
  getStats: async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Basic counts
    const [
      users,
      cars,
      dealers,
      sold,
      blogs,
      requests,
      revenueData
    ] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments({ isApproved: true, status: "active" }),
      User.countDocuments({ role: "dealer" }),
      Car.countDocuments({ status: "sold" }),
      Blog.countDocuments({ status: "published" }),
      CustomerRequest.countDocuments({ status: "open" }),
      User.aggregate([{ $group: { _id: null, total: { $sum: "$totalSpent" } } }])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Growth Percentage helper
    const getGrowth = async (Model, query, dateField = "createdAt") => {
      const [current, previous] = await Promise.all([
        Model.countDocuments({ ...query, [dateField]: { $gte: thirtyDaysAgo } }),
        Model.countDocuments({ ...query, [dateField]: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
      ]);
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    const changes = {
      users: await getGrowth(User, {}),
      dealers: await getGrowth(User, { role: "dealer" }),
      cars: await getGrowth(Car, { isApproved: true, status: "active" }),
      blogs: await getGrowth(Blog, { status: "published" }),
      requests: await getGrowth(CustomerRequest, { status: "open" }),
      sold: await getGrowth(Car, { status: "sold" }, "soldAt"),
      revenue: 0
    };

    // Revenue growth aggregation
    const revGrowth = await User.aggregate([
      { $unwind: "$paymentHistory" },
      { $match: { "paymentHistory.status": "completed" } },
      { $facet: {
        current: [
          { $match: { "paymentHistory.createdAt": { $gte: thirtyDaysAgo } } },
          { $group: { _id: null, total: { $sum: "$paymentHistory.amount" } } }
        ],
        previous: [
          { $match: { "paymentHistory.createdAt": { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
          { $group: { _id: null, total: { $sum: "$paymentHistory.amount" } } }
        ]
      }}
    ]);
    const currRev = revGrowth[0].current[0]?.total || 0;
    const prevRev = revGrowth[0].previous[0]?.total || 0;
    changes.revenue = prevRev === 0 ? (currRev > 0 ? 100 : 0) : parseFloat(((currRev - prevRev) / prevRev * 100).toFixed(1));

    // Timeline for charts (Last 7 Months)
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const timeline = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        timeline.push({ 
            month: monthNames[d.getMonth()], 
            monthNum: d.getMonth() + 1, 
            year: d.getFullYear(), 
            start: d, 
            end: new Date(d.getFullYear(), d.getMonth() + 1, 1) 
        });
    }

    // Sales Trends
    const salesTrendsRaw = await Car.aggregate([
        { $match: { status: "sold", soldAt: { $gte: timeline[0].start } } },
        { $group: {
            _id: { month: { $month: "$soldAt" }, year: { $year: "$soldAt" } },
            count: { $sum: 1 }
        }}
    ]);

    const salesTrends = timeline.map(m => {
        const found = salesTrendsRaw.find(r => r._id.month === m.monthNum && r._id.year === m.year);
        return { month: m.month, sales: found?.count || 0 };
    });

    // User Growth
    const userGrowthRaw = await User.aggregate([
        { $match: { createdAt: { $gte: timeline[0].start } } },
        { $group: {
            _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" }, role: "$role" },
            count: { $sum: 1 }
        }}
    ]);

    const userGrowth = timeline.map(m => {
        const monthly = userGrowthRaw.filter(r => r._id.month === m.monthNum && r._id.year === m.year);
        const newUsers = monthly.filter(r => r._id.role === "individual").reduce((a, b) => a + b.count, 0);
        const newDealers = monthly.filter(r => r._id.role === "dealer").reduce((a, b) => a + b.count, 0);
        return {
            month: m.month,
            newUsers,
            newDealers,
            activeUsers: newUsers + newDealers
        };
    });

    return { 
      users, cars, dealers, sold, blogs, requests, totalRevenue,
      changes, salesTrends, userGrowth 
    };
  },

  updateUser: async (userId, data) => {
    return await User.findByIdAndUpdate(userId, data, { new: true });
  },

  deleteUser: async (userId) => {
    await Car.deleteMany({ postedBy: userId });
    return await User.findByIdAndDelete(userId);
  },

  reviewCar: async (carId, isApproved, reason, adminId) => {
    const car = await Car.findById(carId).populate("postedBy");
    if (!car) throw new Error("Car not found");

    car.isApproved = isApproved;
    if (!isApproved) {
      car.rejectionReason = reason;
    } else {
      car.rejectionReason = null;
    }
    car.approvedBy = adminId;
    car.approvedAt = new Date();
    await car.save();

    const template = isApproved ? getCarApprovedTemplate : getCarRejectedTemplate;
    const statusText = isApproved ? "approved" : "rejected";
    try {
      await sendEmail(car.postedBy.email, `Listing ${statusText}`, template(car.postedBy.name, car.title, reason));
    } catch (e) { Logger.warn("Moderation email failed", e); }

    return car;
  }
};

/* -------------------------------------------------------------------------- */
/*                              ADMIN CONTROLLERS                             */
/* -------------------------------------------------------------------------- */

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await AdminService.getStats();

    // Transform data for frontend dashboard
    const dashboardData = {
      metrics: [
        { title: "Total Users", value: stats.users, change: stats.changes.users, icon: "users" },
        { title: "Total Dealers", value: stats.dealers, change: stats.changes.dealers, icon: "dealers" },
        { title: "Active Listings", value: stats.cars, change: stats.changes.cars, icon: "listings" },
        { title: "Active Blogs", value: stats.blogs, change: stats.changes.blogs, icon: "blogs" },
        { title: "Customer Requests", value: stats.requests, change: stats.changes.requests, icon: "requests" },
        { title: "Cars Sold", value: stats.sold, change: stats.changes.sold, icon: "sold" },
        { title: "Total Revenue", value: stats.totalRevenue, change: stats.changes.revenue, icon: "revenue" }
      ],
      salesTrends: stats.salesTrends,
      userGrowth: stats.userGrowth
    };

    return res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const query = {};
        if (role) query.role = role;
        if (search) query.$or = [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];
        
        const users = await User.find(query).skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 });
        const total = await User.countDocuments(query);
        return res.status(200).json({ success: true, data: { users, total } });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const updateUser = async (req, res) => {
    try {
        const user = await AdminService.updateUser(req.params.userId, req.body);
        return res.status(200).json({ success: true, data: user });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const deleteUser = async (req, res) => {
    try {
        await AdminService.deleteUser(req.params.userId);
        return res.status(200).json({ success: true, message: "Deleted" });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getAllCars = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      status, 
      brand,
      dateFrom,
      dateTo,
      priceMin,
      priceMax,
      yearMin,
      yearMax,
      condition,
      fuelType,
      transmission,
      isApproved,
      featured
    } = req.query;

    const query = { status: { $ne: "deleted" } };

    // Search and Brand
    if (brand && brand !== "all") query.make = brand;
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { make: regex }, { model: regex }];
    }

    // Status Filters
    if (status && status !== "all") {
      if (status === "pending") {
        query.isApproved = { $exists: false };
      } else if (status === "approved") {
        query.isApproved = true;
      } else if (status === "rejected") {
        query.isApproved = false;
      } else if (status === "sold") {
        query.status = "sold";
      }
    }

    // Advanced Filters
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }
    
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    if (yearMin || yearMax) {
      query.year = {};
      if (yearMin) query.year.$gte = Number(yearMin);
      if (yearMax) query.year.$lte = Number(yearMax);
    }

    if (condition) query.condition = condition;
    if (fuelType) query.fuelType = fuelType;
    if (transmission) query.transmission = transmission;
    if (isApproved !== undefined) query.isApproved = isApproved === "true" || isApproved === true;
    if (featured !== undefined) query.featured = featured === "true" || featured === true;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [cars, total, brands] = await Promise.all([
      Car.find(query)
        .populate("postedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Car.countDocuments(query),
      Car.distinct("make")
    ]);

    return res.status(200).json({
      success: true,
      data: {
        cars,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        },
        brands: brands.filter(Boolean).sort()
      }
    });
  } catch (error) {
    Logger.error("Admin GetAllCars Error", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const approveCar = async (req, res) => {
  try {
    const { isApproved, rejectionReason } = req.body;
    const car = await AdminService.reviewCar(req.params.carId, isApproved, rejectionReason, req.user._id);
    return res.status(200).json({ success: true, data: car });
  } catch (error) {
    Logger.error("Approve Car Error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectCar = async (req, res) => {
  try {
    const car = await AdminService.reviewCar(req.params.carId, false, req.body.rejectionReason, req.user._id);
    return res.status(200).json({ success: true, data: car });
  } catch (error) {
    Logger.error("Reject Car Error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().populate("actor", "name email").sort({ timestamp: -1 }).limit(100);
        return res.status(200).json({ success: true, data: logs });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select("-password -otp -otpExpiry");
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        return res.status(200).json({ success: true, data: user });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const deleteCar = async (req, res) => {
    try {
        await Car.findByIdAndDelete(req.params.carId);
        return res.status(200).json({ success: true, message: "Car deleted" });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const featureCar = async (req, res) => {
    try {
        const { featured, durationDays = 7 } = req.body;
        const featuredUntil = featured ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;
        const car = await Car.findByIdAndUpdate(req.params.carId, { featured, featuredUntil }, { new: true });
        return res.status(200).json({ success: true, data: car });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getAllDealers = async (req, res) => {
    try {
        const dealers = await User.find({ role: "dealer" }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: dealers });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const verifyUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { isVerified: true }, { new: true });
        return res.status(200).json({ success: true, data: user });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const verifyDealer = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { "dealerInfo.verified": true, "dealerInfo.verifiedAt": new Date() }, { new: true });
        return res.status(200).json({ success: true, data: user });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getListingHistory = async (req, res) => {
    try {
        const cars = await Car.find({ postedBy: req.params.userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: cars });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getAuditLogsController = async (req, res) => {
    return getAuditLogs(req, res);
};

export const getAnalyticsSummary = async (req, res) => {
    try {
        const stats = await AdminService.getStats();
        return res.status(200).json({ success: true, data: stats });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const trackAnalyticsEvent = async (req, res) => {
    try {
        const { event, metadata } = req.body;
        Logger.analytics(event, req.user?._id, metadata);
        return res.status(200).json({ success: true });
    } catch (error) { return res.status(500).json({ success: false }); }
};
