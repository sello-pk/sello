import mongoose from "mongoose";
import Car from "../models/carModel.js";
import User from "../models/userModel.js";
import CustomerRequest from "../models/customerRequestModel.js";
import AuditLog from "../models/auditLogModel.js";
import { Logger, sendEmail, createAuditLog } from "../utils/helpers.js";
import { getCarApprovedTemplate, getCarRejectedTemplate } from "../utils/emailTemplates.js";

/* -------------------------------------------------------------------------- */
/*                                ADMIN SERVICE                               */
/* -------------------------------------------------------------------------- */

const AdminService = {
  getStats: async () => {
    const [users, cars, dealers, sold] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments({ isApproved: true, isSold: false }),
      User.countDocuments({ role: "dealer" }),
      Car.countDocuments({ isSold: true })
    ]);
    return { users, cars, dealers, sold };
  },

  updateUser: async (userId, data) => {
    return await User.findByIdAndUpdate(userId, data, { new: true });
  },

  deleteUser: async (userId) => {
    await Car.deleteMany({ postedBy: userId });
    return await User.findByIdAndDelete(userId);
  },

  reviewCar: async (carId, status, reason, adminId) => {
    const car = await Car.findById(carId).populate("postedBy");
    if (!car) throw new Error("Car not found");

    car.isApproved = status === "approved";
    car.moderationStatus = status;
    car.moderationReason = reason;
    car.approvedBy = adminId;
    car.approvedAt = new Date();
    await car.save();

    const template = status === "approved" ? getCarApprovedTemplate : getCarRejectedTemplate;
    try {
      await sendEmail(car.postedBy.email, `Listing ${status}`, template(car.postedBy.name, car.title, reason));
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
    return res.status(200).json({ success: true, data: stats });
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
        const cars = await Car.find().populate("postedBy", "name email").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: cars });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const approveCar = async (req, res) => {
    try {
        const car = await AdminService.reviewCar(req.params.carId, "approved", null, req.user._id);
        return res.status(200).json({ success: true, data: car });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
};

export const rejectCar = async (req, res) => {
    try {
        const car = await AdminService.reviewCar(req.params.carId, "rejected", req.body.reason, req.user._id);
        return res.status(200).json({ success: true, data: car });
    } catch (error) { return res.status(500).json({ success: false, message: error.message }); }
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
        const { isFeatured, durationDays = 7 } = req.body;
        const featuredUntil = isFeatured ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000) : null;
        const car = await Car.findByIdAndUpdate(req.params.carId, { isFeatured, featuredUntil }, { new: true });
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
