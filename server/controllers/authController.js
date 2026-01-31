import User from "../models/userModel.js";
import RefreshToken from "../models/refreshTokenModel.js";
import Category from "../models/categoryModel.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { uploadCloudinary, Logger, sendEmail, generateOtp, isValidEmail, sendVerificationCode } from "../utils/helpers.js";
import { getPasswordResetTemplate, getWelcomeTemplate } from "../utils/emailTemplates.js";
import client from "../config/googleClient.js";

/* -------------------------------------------------------------------------- */
/*                                AUTH SERVICE                                */
/* -------------------------------------------------------------------------- */

const AuthService = {
    generateAccessToken: (userId, email) => {
        return jwt.sign({ id: userId, email, type: "access" }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || (process.env.NODE_ENV === "production" ? "2h" : "1h")
        });
    },

    generateRefreshToken: () => crypto.randomBytes(32).toString("hex"),

    storeRefreshToken: async (userId, token, userAgent, ipAddress, ttlDays = 7) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + ttlDays);
        await RefreshToken.create({ token, userId, expiresAt, userAgent, ipAddress, isRevoked: false });
    },

    generateTokens: async (userId, email, userAgent, ipAddress, ttlDays = 7) => {
        const accessToken = AuthService.generateAccessToken(userId, email);
        const refreshToken = AuthService.generateRefreshToken();
        await AuthService.storeRefreshToken(userId, refreshToken, userAgent, ipAddress, ttlDays);
        return { accessToken, refreshToken, ttlDays };
    },

    validatePassword: (password) => password && password.length >= 6,

    register: async (req) => {
        const { name, email, password, role, dealerName, mobileNumber } = req.body;
        
        if (!name || !email || !password) throw new Error("Missing name, email or password");
        if (!isValidEmail(email)) throw new Error("Invalid email format");
        if (!AuthService.validatePassword(password)) throw new Error("Password too short");

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) throw new Error("User already exists");

        const avatarFile = req.file || (req.files && req.files.avatar && req.files.avatar[0]);
        if (!avatarFile) throw new Error("Avatar is required");

        const avatarUrl = await uploadCloudinary(avatarFile.buffer, { folder: "avatars" });
        const hashedPassword = await bcrypt.hash(password, 12);

        const userData = {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            avatar: avatarUrl,
            password: hashedPassword,
            role: role || "individual",
            status: "active",
            isEmailVerified: false
        };

        if (role === "dealer") {
            userData.dealerInfo = {
                businessName: dealerName || name,
                businessPhone: mobileNumber,
                verified: false
            };
            userData.phone = mobileNumber;
        }

        const user = await User.create(userData);

        try {
            await sendEmail(user.email, "Welcome to SELLO", getWelcomeTemplate(user.name));
        } catch (e) { Logger.warn("Welcome email failed", e); }

        return user;
    },

    login: async (email, password) => {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) throw new Error("Invalid email or password");

        if (user.status === "suspended") throw new Error("Account suspended");
        if (user.status === "inactive") throw new Error("Account inactive");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid email or password");

        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });
        return user;
    }
};

/* -------------------------------------------------------------------------- */
/*                              AUTH CONTROLLERS                              */
/* -------------------------------------------------------------------------- */

export const register = async (req, res) => {
    try {
        const user = await AuthService.register(req);
        const { accessToken, refreshToken, ttlDays } = await AuthService.generateTokens(user._id, user.email, req.headers["user-agent"], req.ip);

        res.cookie("token", accessToken, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 30 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: ttlDays * 24 * 3600 * 1000 });

        return res.status(201).json({
            success: true,
            message: "Registered successfully",
            data: { 
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
                token: accessToken,
                accessToken
            }
        });
    } catch (error) {
        Logger.error("Register Error", error);
        return res.status(error.message === "User already exists" ? 409 : 400).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });

        const user = await AuthService.login(email, password);
        const { accessToken, refreshToken, ttlDays } = await AuthService.generateTokens(user._id, user.email, req.headers["user-agent"], req.ip, rememberMe ? 30 : 7);

        res.cookie("token", accessToken, { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 30 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: ttlDays * 24 * 3600 * 1000 });

        return res.status(200).json({
            success: true,
            message: "Logged in successfully",
            data: { 
                user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, permissions: user.permissions || {} },
                token: accessToken,
                accessToken
            }
        });
    } catch (error) {
        Logger.error("Login Error", error);
        return res.status(401).json({ success: false, message: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, message: "Valid email required" });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || user.status === "suspended") return res.status(200).json({ success: true, message: "If an account exists, OTP sent." });

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        await sendEmail(user.email, "Password Reset Code", getPasswordResetTemplate(user.name, otp));
        return res.status(200).json({ success: true, message: "Password reset code sent." });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || user.otp !== otp?.toString() || Date.now() > user.otpExpiry) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }
        user.otpVerified = true;
        await user.save({ validateBeforeSave: false });
        return res.status(200).json({ success: true, message: "OTP verified" });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (password.length < 6) return res.status(400).json({ success: false, message: "Password too short" });

        const user = await User.findOne({ email: email.toLowerCase().trim(), otpVerified: true });
        if (!user) return res.status(400).json({ success: false, message: "Verify OTP first" });

        user.password = await bcrypt.hash(password, 12);
        user.otp = null;
        user.otpVerified = false;
        await RefreshToken.deleteMany({ userId: user._id });
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated" });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) await RefreshToken.updateOne({ token: refreshToken }, { isRevoked: true, revokedAt: new Date() });
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    return res.status(200).json({ success: true, message: "Logged out" });
};

export const refreshToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) return res.status(401).json({ success: false, message: "Refresh token missing" });

        const doc = await RefreshToken.findOne({ token, isRevoked: false }).populate("userId");
        if (!doc || doc.expiresAt < new Date()) return res.status(401).json({ success: false, message: "Invalid/Expired refresh token" });

        const accessToken = AuthService.generateAccessToken(doc.userId._id, doc.userId.email);
        return res.status(200).json({ success: true, accessToken, token: accessToken });
    } catch (error) { return res.status(500).json({ success: false }); }
};

export const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
        const { email, name, picture } = ticket.getPayload();
        
        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            user = await User.create({ name, email: email.toLowerCase(), avatar: picture, password: crypto.randomBytes(32).toString("hex"), isEmailVerified: true, status: "active", role: "individual" });
        }
        
        const { accessToken, refreshToken, ttlDays } = await AuthService.generateTokens(user._id, user.email, req.headers["user-agent"], req.ip);
        res.cookie("token", accessToken, { httpOnly: false, secure: process.env.NODE_ENV === "production", maxAge: 30 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: ttlDays * 24 * 3600 * 1000 });
        return res.status(200).json({ success: true, data: { user, token: accessToken, accessToken } });
    } catch (error) { Logger.error("Google Login Error", error); return res.status(500).json({ success: false }); }
};

export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !isValidEmail(email)) return res.status(400).json({ success: false, message: "Valid email required" });

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user || user.status === "suspended") return res.status(200).json({ success: true, message: "If an account exists, OTP sent." });

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        await sendEmail(user.email, "Verification Code", getPasswordResetTemplate(user.name, otp));
        return res.status(200).json({ success: true, message: "OTP resent successfully" });
    } catch (error) { 
        Logger.error("Resend OTP Error", error);
        return res.status(500).json({ success: false, message: "Internal server error" }); 
    }
};

export const logoutAllDevices = async (req, res) => {
    try {
        const userId = req.user._id;
        await RefreshToken.deleteMany({ userId });
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        return res.status(200).json({ success: true, message: "Logged out from all devices" });
    } catch (error) {
        Logger.error("Logout All Devices Error", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const sendPhoneVerification = async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ success: false, message: "Phone number required" });

        const otp = generateOtp();
        const user = await User.findById(req.user._id);
        
        user.phone = phone;
        user.phoneVerificationCode = otp;
        user.phoneVerificationExpiry = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        await sendVerificationCode(phone, otp);
        return res.status(200).json({ success: true, message: "Verification code sent to phone" });
    } catch (error) {
        Logger.error("Send Phone Verification Error", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const verifyPhone = async (req, res) => {
    try {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ success: false, message: "OTP required" });

        const user = await User.findById(req.user._id);
        if (user.phoneVerificationCode !== otp?.toString() || Date.now() > user.phoneVerificationExpiry) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        user.phoneVerified = true;
        user.phoneVerificationCode = null;
        user.phoneVerificationExpiry = null;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json({ success: true, message: "Phone verified successfully" });
    } catch (error) {
        Logger.error("Verify Phone Error", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
