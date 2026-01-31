import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import Notification from "../models/notificationModel.js";
import Verification from "../models/verificationModel.js";
import AccountDeletionRequest from "../models/accountDeletionRequestModel.js";
import SavedSearch from "../models/savedSearchModel.js";
import Review from "../models/reviewModel.js";
import Report from "../models/reportModel.js";
import Car from "../models/carModel.js";
import { uploadCloudinary, Logger, sendEmail, parseArray, buildCarQuery } from "../utils/helpers.js";
import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/*                               PROFILE SECTION                              */
/* -------------------------------------------------------------------------- */

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -otp -otpExpiry")
      .populate("carsPosted", "title make model price images")
      .populate("carsPurchased", "title make model price images")
      .populate("savedCars", "title make model price images");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let effectivePermissions = user.permissions || {};
    if (user.role === "admin" && user.roleId) {
      const roleDoc = await Role.findById(user.roleId).select("permissions isActive");
      if (roleDoc?.isActive) {
        effectivePermissions = { ...(roleDoc.permissions || {}), ...(user.permissions || {}) };
      }
    }

    return res.status(200).json({
      success: true,
      data: { ...user.toObject(), permissions: effectivePermissions }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone?.trim() || null;
    if (req.file) {
      user.avatar = await uploadCloudinary(req.file.buffer, { folder: "avatars", quality: 80 });
    }
    await user.save();
    return res.status(200).json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                            NOTIFICATIONS SECTION                           */
/* -------------------------------------------------------------------------- */

export const getUserNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const query = { $or: [{ recipient: req.user._id }, { recipient: null }] };
    if (req.query.isRead !== undefined) query.isRead = req.query.isRead === "true";

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    return res.status(200).json({ success: true, data: { notifications, unreadCount } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.notificationId, { isRead: true, readAt: new Date() });
    return res.status(200).json({ success: true, message: "Marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ $or: [{ recipient: req.user._id }, { recipient: null }], isRead: false }, { isRead: true, readAt: new Date() });
    return res.status(200).json({ success: true, message: "All marked as read" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------------------------------------------------------------- */
/*                             VERIFICATION SECTION                           */
/* -------------------------------------------------------------------------- */

export const submitVerification = async (req, res) => {
  try {
    const { documentType } = req.body;
    if (!req.files?.frontDocument?.[0]) return res.status(400).json({ success: false, message: "Front document required" });

    const frontDocUrl = await uploadCloudinary(req.files.frontDocument[0].buffer, { folder: "sello_verifications" });
    const backDocUrl = req.files.backDocument?.[0] ? await uploadCloudinary(req.files.backDocument[0].buffer, { folder: "sello_verifications" }) : null;

    const verification = await Verification.findOneAndUpdate(
      { user: req.user._id },
      { user: req.user._id, documentType, frontDocument: frontDocUrl, backDocument: backDocUrl, status: "pending", submittedAt: new Date() },
      { upsert: true, new: true }
    );
    return res.status(200).json({ success: true, message: "Submitted", data: verification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getVerificationStatus = async (req, res) => {
  try {
    const verification = await Verification.findOne({ user: req.user._id });
    return res.status(200).json({ success: true, data: verification || { status: "not_submitted" } });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

/* -------------------------------------------------------------------------- */
/*                           SAVED CARS & SEARCHES                            */
/* -------------------------------------------------------------------------- */

export const saveCar = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedCars: req.params.carId } });
    return res.status(200).json({ success: true, message: "Saved" });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const unsaveCar = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $pull: { savedCars: req.params.carId } });
    return res.status(200).json({ success: true, message: "Unsaved" });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const getSavedCars = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedCars");
    return res.status(200).json({ success: true, data: user.savedCars || [] });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const getSavedSearches = async (req, res) => {
  try {
    const searches = await SavedSearch.find({ user: req.user._id, isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: searches });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const createSavedSearch = async (req, res) => {
  try {
    const search = await SavedSearch.create({ ...req.body, user: req.user._id });
    return res.status(201).json({ success: true, data: search });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

/* -------------------------------------------------------------------------- */
/*                               REVIEWS & REPORTS                            */
/* -------------------------------------------------------------------------- */

export const addReview = async (req, res) => {
  try {
    const { targetUserId, rating, comment, carId } = req.body;
    const review = await Review.create({ reviewer: req.user._id, targetUser: targetUserId, rating, comment, transaction: carId || null });
    
    // Update Avg Rating
    const stats = await Review.aggregate([
      { $match: { targetUser: new mongoose.Types.ObjectId(targetUserId) } },
      { $group: { _id: "$targetUser", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    if (stats.length > 0) {
      await User.findByIdAndUpdate(targetUserId, { sellerRating: stats[0].avgRating, reviewCount: stats[0].count });
    }
    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const createReport = async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, reporter: req.user._id });
    return res.status(201).json({ success: true, message: "Reported", data: report });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

/* --------------------------- ACCOUNT DELETION --------------------------- */

export const createDeletionRequest = async (req, res) => {
  try {
    const request = await AccountDeletionRequest.create({ user: req.user._id, ...req.body });
    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

export const getDeletionRequestStatus = async (req, res) => {
  try {
    const request = await AccountDeletionRequest.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    return res.status(500).json({ success: false });
  }
};

/* -------------------------------------------------------------------------- */
/*                                ADMIN SECTION                               */
/* -------------------------------------------------------------------------- */

export const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().populate("recipient", "name email").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) { return res.status(500).json({ success: false }); }
};

export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ success: true, data: notification });
  } catch (error) { return res.status(500).json({ success: false }); }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) { return res.status(500).json({ success: false }); }
};

export const getAllVerifications = async (req, res) => {
    try {
        const verifications = await Verification.find().populate('user', 'name email role isVerified').sort({ submittedAt: -1 });
        return res.status(200).json({ success: true, data: verifications });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const reviewVerification = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const verification = await Verification.findByIdAndUpdate(req.params.verificationId, { status, reviewedBy: req.user._id, reviewedAt: new Date(), rejectionReason }, { new: true });
        if (status === 'approved') await User.findByIdAndUpdate(verification.user, { isVerified: true });
        return res.status(200).json({ success: true, data: verification });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getAllDeletionRequests = async (req, res) => {
    try {
        const requests = await AccountDeletionRequest.find().populate('user', 'name email role').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: requests });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getDeletionRequestStats = async (req, res) => {
    try {
        const stats = await AccountDeletionRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
        return res.status(200).json({ success: true, data: stats });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const reviewReview = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const review = await Review.findByIdAndUpdate(req.params.reviewId, { isApproved, moderatedBy: req.user._id, moderatedAt: new Date() }, { new: true });
        return res.status(200).json({ success: true, data: review });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getReports = async (req, res) => {
    try {
        const reports = await Report.find().populate("reporter", "name email avatar").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: reports });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const updateReportStatus = async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.reportId, { ...req.body, reviewedBy: req.user._id, reviewedAt: new Date() }, { new: true });
        return res.status(200).json({ success: true, data: report });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const requestSeller = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        return res.status(200).json({ success: true, message: "Status confirmed", data: { role: user.role } });
    } catch (error) { return res.status(500).json({ success: false }); }
};

// dealer methods
export const updateDealerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user.role !== "dealer") return res.status(403).json({ success: false, message: "Not a dealer" });
        user.dealerInfo = { ...user.dealerInfo, ...req.body };
        await user.save();
        return res.status(200).json({ success: true, data: user });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const requestDealer = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        user.dealerInfo = { ...user.dealerInfo, ...req.body };
        await user.save();
        return res.status(200).json({ success: true, message: "Dealer request submitted" });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ targetUser: req.params.userId, isApproved: true }).populate("reviewer", "name avatar");
        return res.status(200).json({ success: true, data: reviews });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const moderateReview = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const review = await Review.findByIdAndUpdate(req.params.reviewId, { isApproved, moderatedBy: req.user._id, moderatedAt: new Date() }, { new: true });
        return res.status(200).json({ success: true, data: review });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const reportReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.reviewId, { $addToSet: { reportedBy: req.user._id }, isReported: true }, { new: true });
        return res.status(200).json({ success: true, message: "Reported" });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().populate("reviewer", "name email").populate("targetUser", "name email").sort({ createdAt: -1 });
        return res.status(200).json({ success: true, data: reviews });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const reviewDeletionRequest = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await AccountDeletionRequest.findByIdAndUpdate(req.params.requestId, { status, reviewedBy: req.user._id, reviewedAt: new Date() }, { new: true });
        if (status === 'approved') await User.findByIdAndDelete(request.user);
        return res.status(200).json({ success: true, data: request });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const getSavedSearch = async (req, res) => {
    try { return res.status(200).json({ success: true, data: await SavedSearch.findById(req.params.searchId) }); } catch (error) { return res.status(500).json({ success: false }); }
};

export const updateSavedSearch = async (req, res) => {
    try { return res.status(200).json({ success: true, data: await SavedSearch.findByIdAndUpdate(req.params.searchId, req.body, { new: true }) }); } catch (error) { return res.status(500).json({ success: false }); }
};

export const deleteSavedSearch = async (req, res) => {
    try { await SavedSearch.findByIdAndUpdate(req.params.searchId, { isActive: false }); return res.status(200).json({ success: true }); } catch (error) { return res.status(500).json({ success: false }); }
};

export const executeSavedSearch = async (req, res) => {
    try {
        const search = await SavedSearch.findById(req.params.searchId);
        const { filter } = buildCarQuery(search.searchCriteria);
        const cars = await Car.find(filter).limit(20).lean();
        return res.status(200).json({ success: true, data: { cars } });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: "Logged out" });
};

export const sendSavedSearchAlerts = async () => {
    try {
        const activeSearches = await SavedSearch.find({ isActive: true, emailAlerts: true });
        let sentCount = 0;
        
        for (const search of activeSearches) {
            // Placeholder logic: check if there are new listings based on search criteria
            // In a real implementation, you'd find cars created since search.lastAlertSent
            // and send emails if results are found.
            
            // For now, we just update the lastAlertSent
            search.lastAlertSent = new Date();
            await search.save();
            sentCount++;
        }
        
        return { success: true, sent: sentCount, total: activeSearches.length };
    } catch (error) {
        Logger.error("sendSavedSearchAlerts Error", error);
        throw error;
    }
};
