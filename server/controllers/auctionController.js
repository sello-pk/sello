import {
  Auction,
  AuctionCar,
  Bid,
  ProxyBid,
  TokenPayment,
  AuctionWatchlist,
  Escrow,
  WalletTransaction,
  AuctionSettings,
  InspectionBooking,
} from "../models/auctionModel.js";
import { BidAuditLog } from "../models/bidAuditLogModel.js";
import { Wallet, PlatformSettings } from "../models/paymentModel.js";
import Car from "../models/carModel.js";
import Notification from "../models/notificationModel.js";
import Logger from "../utils/logger.js";
import User from "../models/userModel.js";
import {
  uploadListingImagesToCloudinary,
  uploadRawToCloudinaryWithRetry,
  parseArray,
} from "../utils/helpers.js";
import {
  LISTING_MAX_TOTAL_BYTES,
  MSG_IMAGE_TOTAL_EXCEEDED,
} from "../constants/listingUpload.js";
import { evaluateAuctionBidAccess } from "../utils/auctionAccess.js";
import { AUCTION_CONFIG } from "../config/auctionConfig.js";
import {
  validateBid as engineValidateBid,
  getMinNextBid as engineGetMinNextBid,
  getAuctionSettings as engineGetAuctionSettings,
  extendAuctionIfNeeded,
  applyProxyBids as engineApplyProxyBids,
  createEscrowForWinner,
  processExpiredAuctions as engineProcessExpiredAuctions,
  processExpiredEscrows as engineProcessExpiredEscrows,
  getActiveBidderCount as engineGetActiveBidderCount,
  settleAuctionParticipantTokens,
} from "../services/auctionEngine.js";
import * as auctionEmailService from "../services/auctionEmailService.js";
import {
  getAuctionSettings,
  invalidateAuctionSettingsCache,
} from "../services/auctionEngine.js";
import { AuctionExtensionLog } from "../models/auctionExtensionLogModel.js";
import { SecurityEvent } from "../models/securityEventModel.js";

const MIN_BID_INCREMENT = AUCTION_CONFIG.MIN_BID_INCREMENT;
const MAX_PROXY_BID = AUCTION_CONFIG.MAX_PROXY_BID ?? 100_000_000;

const sanitizeBidsForPublic = (bids = []) => {
  const map = new Map();
  return bids.map((bid) => {
    if (bid?.bidType === "offline") {
      return {
        ...bid,
        bidder: null,
        bidderName: bid.bidderName || "Floor Bid",
      };
    }
    const bidderKey =
      bid?.bidder?._id?.toString() ||
      bid?.bidder?.toString() ||
      bid?.bidderName ||
      "anonymous";
    if (!map.has(bidderKey)) map.set(bidderKey, map.size + 1);
    return {
      ...bid,
      bidder: null,
      bidderName: `Bidder #${map.get(bidderKey)}`,
    };
  });
};

const hasAuctionDealerSubmissionAccess = (user) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "dealer" && user?.dealerInfo?.verified) return true;
  const dealerCapability = user?.auctionCapabilities?.auctionDealer?.status;
  return dealerCapability === "approved";
};

const requireVerifiedBidToken = async (userId) => {
  const verifiedToken = await TokenPayment.findOne({
    user: userId,
    status: "verified",
  }).lean();
  return !!verifiedToken;
};

const getOrCreateAuctionWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }
  return wallet;
};

const getHeldAmountForBid = async (bidId, fallbackWallet = null, maxAmount = 0) => {
  if (!bidId) return 0;

  const holdAgg = await WalletTransaction.aggregate([
    {
      $match: {
        reference: bidId,
        referenceModel: "Bid",
        type: "bid_hold",
        status: "completed",
      },
    },
    {
      $group: {
        _id: null,
        totalHeld: { $sum: { $abs: "$amount" } },
      },
    },
  ]);

  const ledgerHeld = Number(holdAgg[0]?.totalHeld || 0);
  if (ledgerHeld > 0) {
    return Math.min(ledgerHeld, Number(maxAmount || 0));
  }

  const walletHeld = Number(fallbackWallet?.totalBidHeld || 0);
  if (walletHeld > 0) {
    return Math.min(walletHeld, Number(maxAmount || 0));
  }

  return 0;
};

const creditVerifiedTokenPaymentToWallet = async (paymentId, userId) => {
  const existingCreditTxn = await WalletTransaction.findOne({
    user: userId,
    type: "token_deposit",
    reference: paymentId,
    referenceModel: "TokenPayment",
    amount: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (existingCreditTxn) {
    await TokenPayment.updateOne(
      { _id: paymentId, walletCreditedAt: null },
      {
        $set: {
          walletCreditedAt: existingCreditTxn.createdAt || new Date(),
          walletTransactionId: existingCreditTxn._id,
          walletCreditError: "",
        },
      },
    );
    Logger.info("Token payment already had wallet credit ledger entry", {
      paymentId: String(paymentId),
      userId: String(userId),
      walletTransactionId: existingCreditTxn._id,
    });
    return Wallet.findOne({ user: userId }).lean();
  }

  const claimedAt = new Date();
  const payment = await TokenPayment.findOneAndUpdate(
    {
      _id: paymentId,
      user: userId,
      status: "verified",
      walletCreditedAt: null,
    },
    {
      $set: {
        walletCreditedAt: claimedAt,
        walletCreditError: "",
      },
    },
    { new: true },
  );

  if (!payment) {
    return Wallet.findOne({ user: userId }).lean();
  }

  const amount = Number(payment.amount || 0);
  Logger.info("Crediting verified token payment to wallet", {
    paymentId: payment._id,
    userId: String(userId),
    amount,
  });

  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    {
      $setOnInsert: { user: userId },
      $inc: {
        balance: amount,
        totalDeposited: amount,
      },
      $set: { lastTransactionAt: claimedAt },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  try {
    const txn = await WalletTransaction.create({
      user: userId,
      type: "token_deposit",
      amount,
      balance: wallet.balance || 0,
      reference: payment._id,
      referenceModel: "TokenPayment",
      description: "Verified token deposit credited to wallet",
      status: "completed",
    });

    await TokenPayment.updateOne(
      { _id: payment._id },
      {
        $set: {
          walletTransactionId: txn._id,
          walletCreditError: "",
        },
      },
    );

    Logger.info("Verified token payment credited successfully", {
      paymentId: payment._id,
      walletId: wallet._id,
      walletBalance: wallet.balance || 0,
      walletTransactionId: txn._id,
    });
    return wallet;
  } catch (error) {
    await Wallet.updateOne(
      { user: userId },
      {
        $inc: {
          balance: -amount,
          totalDeposited: -amount,
        },
        $set: { lastTransactionAt: new Date() },
      },
    );
    await TokenPayment.updateOne(
      { _id: payment._id },
      {
        $set: {
          walletCreditedAt: null,
          walletTransactionId: null,
          walletCreditError: error?.message || "Wallet ledger write failed",
        },
      },
    );
    Logger.error("Failed to log wallet credit for verified token payment", {
      paymentId: payment._id,
      userId: String(userId),
      error: error?.message || error,
    });
    throw new Error("Wallet credit failed after payment verification");
  }
};

const syncVerifiedTokenCreditsToWallet = async (userId) => {
  const verifiedPayments = await TokenPayment.find({
    user: userId,
    status: "verified",
    walletCreditedAt: null,
  })
    .select("_id user")
    .sort({ createdAt: 1 })
    .lean();

  if (!verifiedPayments.length) {
    return Wallet.findOne({ user: userId }).lean();
  }

  let lastWallet = null;
  for (const payment of verifiedPayments) {
    lastWallet = await creditVerifiedTokenPaymentToWallet(
      payment._id,
      payment.user || userId,
    );
  }

  return lastWallet;
};

const reverseTokenCreditFromWallet = async (payment) => {
  const paymentUserId = payment.user?._id || payment.user;
  if (!payment?.walletCreditedAt) return null;
  const existingRefundTxn = await WalletTransaction.findOne({
    user: paymentUserId,
    type: "token_refund",
    reference: payment._id,
    referenceModel: "TokenPayment",
    amount: { $lt: 0 },
  }).lean();

  if (existingRefundTxn) return null;

  const creditedTxn = await WalletTransaction.findOne({
    user: paymentUserId,
    type: "token_deposit",
    reference: payment._id,
    referenceModel: "TokenPayment",
    amount: { $gt: 0 },
  }).lean();

  if (!creditedTxn) return null;

  const wallet = await getOrCreateAuctionWallet(paymentUserId);
  if ((wallet.balance || 0) < Number(payment.amount || 0)) {
    throw new Error(
      `Wallet balance is too low to refund this token. Current balance: PKR ${Number(wallet.balance || 0).toLocaleString()}.`,
    );
  }

  wallet.balance -= Number(payment.amount || 0);
  wallet.totalWithdrawn += Number(payment.amount || 0);
  wallet.lastTransactionAt = new Date();
  await wallet.save();

  await logWalletTxn({
    user: paymentUserId,
    type: "token_refund",
    amount: -Number(payment.amount || 0),
    reference: payment._id,
    referenceModel: "TokenPayment",
    description: "Token deposit refunded from wallet",
  });

  await TokenPayment.updateOne(
    { _id: payment._id },
    {
      $set: {
        walletCreditedAt: null,
        walletTransactionId: null,
      },
    },
  );

  return wallet;
};

const collapseAccidentalAuctionDuplicates = (items = []) => {
  const deduped = new Map();

  for (const item of items) {
    const car = item?.car || {};
    const submittedBy = item?.submittedBy?.toString?.() || "unknown";
    const make = String(car.make || "").trim().toLowerCase();
    const model = String(car.model || "").trim().toLowerCase();
    const year = Number(car.year || 0);
    const mileage = Number(car.mileage || 0);
    const startingBid = Number(item?.startingBid || car.price || 0);
    const createdBucket = item?.createdAt
      ? Math.floor(new Date(item.createdAt).getTime() / (10 * 60 * 1000))
      : "na";

    const signature = [
      submittedBy,
      make,
      model,
      year,
      mileage,
      startingBid,
      createdBucket,
    ].join("|");

    const existing = deduped.get(signature);
    if (!existing) {
      deduped.set(signature, item);
      continue;
    }

    const existingCreatedAt = new Date(existing.createdAt || 0).getTime();
    const currentCreatedAt = new Date(item.createdAt || 0).getTime();

    if (currentCreatedAt < existingCreatedAt) {
      deduped.set(signature, item);
    }
  }

  return Array.from(deduped.values());
};

const getAuctionSubmissionFiles = (files = {}) => ({
  inspectionReportFile:
    files?.inspectionReport?.[0] ||
    files?.["inspectionReport[]"]?.[0] ||
    files?.inspectionReportFile?.[0] ||
    files?.inspection_report?.[0] ||
    null,
  imageFiles: [
    ...(files?.images || []),
    ...(files?.["images[]"] || []),
    ...(files?.image || []),
    ...(files?.photos || []),
    ...(files?.photo || []),
  ],
  damageFiles: [
    ...(files?.damageImages || []),
    ...(files?.["damageImages[]"] || []),
    ...(files?.damageImage || []),
  ],
  documentFiles: [
    ...(files?.documents || []),
    ...(files?.["documents[]"] || []),
    ...(files?.document || []),
  ],
});

const normalizeAuctionGeoLocation = (geoLocation) => {
  let parsedGeoLocation = geoLocation;
  if (typeof geoLocation === "string") {
    try {
      parsedGeoLocation = JSON.parse(geoLocation);
    } catch (e) {
      console.error("Failed to parse geoLocation:", e);
      parsedGeoLocation = {
        type: "Point",
        coordinates: [67.0011, 24.8607],
      };
    }
  }

  if (!parsedGeoLocation || !Array.isArray(parsedGeoLocation?.coordinates)) {
    return {
      type: "Point",
      coordinates: [67.0011, 24.8607],
    };
  }

  return parsedGeoLocation;
};

const normalizeAuctionCondition = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "new" ? "New" : "Used";
};

const normalizeAuctionFuelType = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  if (normalized === "diesel") return "Diesel";
  if (normalized === "hybrid") return "Hybrid";
  if (normalized === "electric") return "Electric";
  return "Petrol";
};

const normalizeAuctionTransmission = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return normalized === "automatic" ? "Automatic" : "Manual";
};

const parseStringArrayField = (rawValue) => {
  if (rawValue === undefined || rawValue === null) return [];
  if (Array.isArray(rawValue)) {
    return rawValue
      .flatMap((item) => parseStringArrayField(item))
      .filter(Boolean);
  }
  if (typeof rawValue !== "string") {
    return [String(rawValue)].filter(Boolean);
  }

  const trimmed = rawValue.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    try {
      return parseArray(trimmed).filter(Boolean);
    } catch {
      return [trimmed];
    }
  }
  return [trimmed];
};

const getEditableAuctionSubmission = async (carId, user) => {
  const car = await Car.findById(carId);
  if (!car) {
    const error = new Error("Car not found");
    error.statusCode = 404;
    throw error;
  }

  const ownsCar =
    car.postedBy?.toString() === user?._id?.toString() || user?.role === "admin";
  if (!ownsCar) {
    const error = new Error("You can only manage your own auction submissions");
    error.statusCode = 403;
    throw error;
  }

  const query = { car: carId };
  if (user?.role !== "admin") {
    query.submittedBy = user._id;
  }

  const auctionCar = await AuctionCar.findOne(query)
    .populate("auction", "title status startTime endTime")
    .sort({ createdAt: -1 });

  if (!auctionCar) {
    const error = new Error("Auction submission not found");
    error.statusCode = 404;
    throw error;
  }

  return { car, auctionCar };
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC  –  Auctions
// ═══════════════════════════════════════════════════════════════════════════

export const getAuctions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (status && status !== "all") filter.status = status;

    const auctions = await Auction.find(filter)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Auction.countDocuments(filter);

    res.json({
      success: true,
      data: auctions,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    Logger.error("getAuctions error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch auctions" });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).lean();
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });
    res.json({ success: true, data: auction });
  } catch (error) {
    Logger.error("getAuctionById error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch auction" });
  }
};

export const getLiveAuction = async (req, res) => {
  try {
    const auction = await Auction.findOne({ status: "live" })
      .sort({ startTime: -1 })
      .lean();
    res.json({ success: true, data: auction || null });
  } catch (error) {
    Logger.error("getLiveAuction error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch live auction" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC  –  Auction Cars
// ═══════════════════════════════════════════════════════════════════════════

export const getAuctionCars = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const {
      search,
      make,
      condition,
      transmission,
      fuelType,
      yearMin,
      yearMax,
      priceMin,
      priceMax,
      sortBy = "ending_soon",
      page = 1,
      limit = 30,
    } = req.query;

    const auction = await Auction.findById(auctionId).select("status").lean();
    const visibleStatuses = ["approved", "live"];

    const filter = {
      auction: auctionId,
      status: { $in: visibleStatuses },
    };

    const cars = await AuctionCar.find(filter)
      .populate({
        path: "car",
        select:
          "title make model year condition mileage fuelType transmission images colorExterior registrationCity vehicleType price",
      })
      .lean();

    // Client-side-friendly filtering (car fields are nested)
    let result = cars.filter((ac) => ac.car);
    result = collapseAccidentalAuctionDuplicates(result);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((ac) => {
        const c = ac.car;
        return `${c.make} ${c.model} ${c.year}`.toLowerCase().includes(q);
      });
    }
    if (make && make !== "all")
      result = result.filter((ac) => ac.car.make === make);
    if (condition && condition !== "all")
      result = result.filter(
        (ac) => ac.car.condition?.toLowerCase() === condition.toLowerCase(),
      );
    if (transmission && transmission !== "all")
      result = result.filter(
        (ac) =>
          ac.car.transmission?.toLowerCase() === transmission.toLowerCase(),
      );
    if (fuelType && fuelType !== "all")
      result = result.filter(
        (ac) => ac.car.fuelType?.toLowerCase() === fuelType.toLowerCase(),
      );
    if (yearMin) result = result.filter((ac) => ac.car.year >= Number(yearMin));
    if (yearMax) result = result.filter((ac) => ac.car.year <= Number(yearMax));
    if (priceMin)
      result = result.filter(
        (ac) => (ac.currentBid || ac.startingBid) >= Number(priceMin),
      );
    if (priceMax)
      result = result.filter(
        (ac) => (ac.currentBid || ac.startingBid) <= Number(priceMax),
      );

    const sortFns = {
      price_low: (a, b) =>
        (a.currentBid || a.startingBid) - (b.currentBid || b.startingBid),
      price_high: (a, b) =>
        (b.currentBid || b.startingBid) - (a.currentBid || a.startingBid),
      year_new: (a, b) => b.car.year - a.car.year,
      year_old: (a, b) => a.car.year - b.car.year,
      mileage_low: (a, b) => (a.car.mileage || 0) - (b.car.mileage || 0),
    };
    if (sortFns[sortBy]) result.sort(sortFns[sortBy]);

    const total = result.length;
    const startIndex = Math.max(0, (Number(page) - 1) * Number(limit));
    const paginatedResult = result.slice(startIndex, startIndex + Number(limit));
    const safeResult = paginatedResult.map((item) => ({
      ...item,
      currentBidder: null,
    }));
    res.json({ success: true, data: safeResult, total });
  } catch (error) {
    Logger.error("getAuctionCars error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch auction cars" });
  }
};

/** GET /auctions/live-by-car/:carId – for marketplace car detail: is this car in a live/scheduled auction? */
export const getLiveAuctionByCarId = async (req, res) => {
  try {
    const { carId } = req.params;
    const ac = await AuctionCar.findOne({
      car: carId,
      status: { $in: ["approved", "live"] },
    })
      .populate("auction", "title status startTime endTime")
      .lean();
    if (!ac || !ac.auction) {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Not in an active auction",
      });
    }
    const auctionStatus = ac.auction.status;
    if (auctionStatus !== "live" && auctionStatus !== "scheduled") {
      return res.status(404).json({
        success: false,
        data: null,
        message: "Not in an active auction",
      });
    }
    res.json({
      success: true,
      data: {
        auctionCarId: ac._id,
        auction: ac.auction,
        currentBid: ac.currentBid,
        startingBid: ac.startingBid,
        bidCount: ac.bidCount,
        status: ac.status,
      },
    });
  } catch (error) {
    Logger.error("getLiveAuctionByCarId error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to check auction" });
  }
};

export const getAuctionCarDetail = async (req, res) => {
  try {
    const ac = await AuctionCar.findById(req.params.id)
      .populate({
        path: "car",
        select:
          "title make model variant year condition mileage fuelType transmission images colorExterior colorInterior registrationCity engineCapacity features description vehicleType price",
      })
      .populate("winner", "name")
      .populate("auction", "title startTime endTime status location")
      .lean();

    if (!ac)
      return res
        .status(404)
        .json({ success: false, message: "Auction car not found" });

    const bids = await Bid.find({ auctionCar: ac._id })
      .sort({ amount: -1 })
      .limit(20)
      .populate("bidder", "name")
      .lean();

    const totalBidders = await Bid.distinct("bidder", {
      auctionCar: ac._id,
      bidder: { $exists: true, $ne: null },
    }).then((arr) => arr.length);
    const settings = await getAuctionSettings();
    const bidIncrement = Number(ac?.bidIncrement || settings?.minBidIncrement || 5000);
    const minimumNextBid = engineGetMinNextBid(ac);
    const quickBidSuggestions = [1, 2, 5, 10].map(
      (step) => minimumNextBid + step * bidIncrement,
    );
    const reserveMet = ac?.reservePrice ? Number(ac.currentBid || 0) >= Number(ac.reservePrice) : null;
    const priceChart = [...(bids || [])]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map((bid) => ({
        amount: bid.amount,
        at: bid.createdAt,
        type: bid.bidType || "online",
      }));

    res.json({
      success: true,
      data: {
        ...ac,
        currentBidder: null,
        bidIncrement,
        minimumNextBid,
        quickBidSuggestions,
        reserveMet,
        totalBidders,
        priceChart,
        bids: sanitizeBidsForPublic(bids),
      },
    });
  } catch (error) {
    Logger.error("getAuctionCarDetail error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch car details" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH  –  Bidding
// ═══════════════════════════════════════════════════════════════════════════

export const placeBid = async (req, res) => {
  try {
    const { auctionCarId, amount } = req.body;
    const userId = req.user._id;
    await syncVerifiedTokenCreditsToWallet(userId);

    const ac = await AuctionCar.findById(auctionCarId).populate("auction");
    if (!ac)
      return res
        .status(404)
        .json({ success: false, message: "Auction car not found" });

    // Server-side validation (engine; use per-lot bidIncrement or settings)
    const settings = await engineGetAuctionSettings();
    const validation = engineValidateBid(
      ac.auction,
      ac,
      amount,
      settings?.minBidIncrement,
    );
    if (!validation.valid)
      return res
        .status(400)
        .json({ success: false, message: validation.message });

    const wallet = await Wallet.findOne({ user: userId });
    if (wallet && wallet.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your wallet is frozen. Contact support to resolve.",
      });
    }
    const hasVerifiedToken = await requireVerifiedBidToken(userId);
    if (!hasVerifiedToken) {
      return res.status(403).json({
        success: false,
        message:
          "Your token payment is still pending admin verification. You can place bids only after it is verified.",
      });
    }
    const hasWallet = wallet && wallet.balance >= amount;

    // Check bid limit based on deposit tier only when the bidder is actually using wallet funds
    if (hasWallet) {
      const settings = await PlatformSettings.findOne();
      if (settings?.depositTiers?.length > 0) {
        const sorted = [...settings.depositTiers].sort(
          (a, b) => b.minDeposit - a.minDeposit,
        );
        const tier = sorted.find((t) => wallet.totalDeposited >= t.minDeposit);
        if (tier && amount > tier.maxBidLimit) {
          return res.status(400).json({
            success: false,
            message: `Your deposit tier (${tier.label}) allows bids up to PKR ${tier.maxBidLimit.toLocaleString()}. Deposit more to increase your limit.`,
          });
        }
      }
    }

    const session = await mongoose.startSession();
    let bid;
    let prevWinningBid = null;
    let extendedEndTime = null;
    try {
      await session.withTransaction(async () => {
        const liveAuctionCar = await AuctionCar.findById(auctionCarId)
          .populate("auction")
          .session(session);
        if (!liveAuctionCar) {
          throw new Error("Auction car not found");
        }

        const liveValidation = engineValidateBid(
          liveAuctionCar.auction,
          liveAuctionCar,
          amount,
          settings?.minBidIncrement,
        );
        if (!liveValidation.valid) {
          throw new Error(liveValidation.message);
        }

        prevWinningBid = await Bid.findOne({
          auctionCar: auctionCarId,
          isWinning: true,
        })
          .populate("bidder", "email name")
          .session(session);

        const ext = extendAuctionIfNeeded(liveAuctionCar.auction);
        if (ext.extended && ext.newEndTime) {
          await Auction.findByIdAndUpdate(
            liveAuctionCar.auction._id,
            { endTime: ext.newEndTime },
            { session },
          );
          liveAuctionCar.auction.endTime = ext.newEndTime;
          extendedEndTime = ext.newEndTime;
        }

        if (prevWinningBid && prevWinningBid.bidder) {
          const prevWallet = await Wallet.findOneAndUpdate(
            { user: prevWinningBid.bidder._id || prevWinningBid.bidder },
            {
              $inc: {
                balance: prevWinningBid.amount,
                totalBidHeld: -prevWinningBid.amount,
              },
              $set: { lastTransactionAt: new Date() },
            },
            { new: true, session },
          );
          if (prevWallet) {
            prevWallet.totalBidHeld = Math.max(0, prevWallet.totalBidHeld || 0);
            await prevWallet.save({ session });
            await logWalletTxn({
              user: prevWinningBid.bidder._id || prevWinningBid.bidder,
              type: "bid_refund",
              amount: prevWinningBid.amount,
              reference: prevWinningBid._id,
              referenceModel: "Bid",
              description: "Outbid refund for auction car",
              currentBalance: (prevWallet.balance || 0) - prevWinningBid.amount,
              session,
            });
          }
        }

        await Bid.updateMany(
          { auctionCar: auctionCarId, isWinning: true },
          { isWinning: false },
          { session },
        );

        const createdBids = await Bid.create(
          [
            {
              auction: liveAuctionCar.auction._id,
              auctionCar: auctionCarId,
              bidder: userId,
              bidderName: req.user.name || "Bidder",
              amount,
              bidType: "online",
              isWinning: true,
            },
          ],
          { session },
        );
        bid = createdBids[0];

        if (hasWallet) {
          const heldWallet = await Wallet.findOneAndUpdate(
            {
              user: userId,
              balance: { $gte: amount },
              $or: [{ isActive: { $exists: false } }, { isActive: { $ne: false } }],
            },
            {
              $inc: { balance: -amount, totalBidHeld: amount },
              $set: { lastTransactionAt: new Date() },
            },
            { new: true, session },
          );
          if (!heldWallet) {
            throw new Error("Insufficient balance. Please refresh and try again.");
          }
          await logWalletTxn({
            user: userId,
            type: "bid_hold",
            amount: -amount,
            reference: bid._id,
            referenceModel: "Bid",
            description: `Bid placed – PKR ${amount.toLocaleString()}`,
            currentBalance: (heldWallet.balance || 0) + amount,
            session,
          });
        }

        liveAuctionCar.currentBid = amount;
        liveAuctionCar.currentBidder = userId;
        liveAuctionCar.bidCount += 1;
        if (liveAuctionCar.status === "approved") liveAuctionCar.status = "live";
        await liveAuctionCar.save({ session });
        await Auction.findByIdAndUpdate(
          liveAuctionCar.auction._id,
          { $inc: { totalBids: 1 } },
          { session },
        );

        ac.currentBid = liveAuctionCar.currentBid;
        ac.currentBidder = liveAuctionCar.currentBidder;
        ac.bidCount = liveAuctionCar.bidCount;
        ac.status = liveAuctionCar.status;
        ac.auction.endTime = liveAuctionCar.auction.endTime;
      });
    } finally {
      await session.endSession();
    }

    if (extendedEndTime) {
      const io = req.app.get("io");
      if (io) {
        io.to(`auction:${ac.auction._id}`).emit("auction-status-change", {
          auctionId: ac.auction._id,
          status: "live",
          endTime: extendedEndTime,
        });
        io.to(`auction:${ac.auction._id}`).emit("auction:extended", {
          auctionId: ac.auction._id,
          newEndTime: extendedEndTime,
        });
      }
    }

    // Immutable bid audit log (outside transaction)
    try {
      await BidAuditLog.create({
        auction: ac.auction._id,
        auctionCar: auctionCarId,
        bid: bid._id,
        bidder: userId,
        bidderName: req.user.name || "Bidder",
        amount,
        bidType: "online",
        isProxy: false,
        placedBy: userId,
        ip: req.ip || req.connection?.remoteAddress || null,
        userAgent: req.get("user-agent") || null,
      });
    } catch (logErr) {
      Logger.error("BidAuditLog create error", logErr);
    }

    // Proxy bids (engine)
    await engineApplyProxyBids(auctionCarId, amount, userId, ac.auction._id, {
      logWalletTxn,
      getIo: () => req.app.get("io"),
    });

    // Real-time broadcast (keep existing event; add aliases)
    const io = req.app.get("io");
    if (io) {
      const populatedBid = await Bid.findById(bid._id)
        .populate("bidder", "name")
        .lean();
      io.to(`auction:${ac.auction._id}`).emit("new-bid", {
        auctionCarId,
        bid: populatedBid,
        currentBid: ac.currentBid,
        bidCount: ac.bidCount,
      });
      io.to(`auction:${ac.auction._id}`).emit("auction:bid", {
        auctionCarId,
        bid: populatedBid,
        currentBid: ac.currentBid,
      });
      if (prevWinningBid && prevWinningBid.bidder) {
        io.to(`user:${prevWinningBid.bidder._id}`).emit("auction:outbid", {
          auctionCarId,
          auctionId: ac.auction._id,
          newBid: amount,
          bid: populatedBid,
        });
      }
    }

    // In-app + email: outbid notification
    if (prevWinningBid && prevWinningBid.bidder) {
      const resultUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/auctions/car-detail?id=${auctionCarId}`;
      await Notification.create({
        recipient: prevWinningBid.bidder._id || prevWinningBid.bidder,
        title: "You were outbid",
        message: `Your bid was exceeded. New high: PKR ${amount.toLocaleString()}. ${ac.car?.title || "Auction car"}`,
        type: "info",
        actionUrl: resultUrl,
      }).catch(() => {});
      if (prevWinningBid.bidder.email) {
        auctionEmailService
          .sendOutbid(prevWinningBid.bidder.email, {
            auctionTitle: ac.auction.title,
            carLabel: ac.car?.title || "Auction car",
            newBidAmount: amount,
            resultUrl,
          })
          .catch(() => {});
      }
    }

    res.json({ success: true, data: bid, message: "Bid placed successfully" });
  } catch (error) {
    Logger.error("placeBid error", error);
    res.status(500).json({ success: false, message: "Failed to place bid" });
  }
};

export const setProxyBid = async (req, res) => {
  try {
    const { auctionCarId, maxAmount } = req.body;
    const userId = req.user._id;
    await syncVerifiedTokenCreditsToWallet(userId);
  
    const ac = await AuctionCar.findById(auctionCarId).populate("auction");
    if (!ac || ac.auction.status !== "live")
      return res
        .status(400)
        .json({ success: false, message: "Auction not live" });

    const currentHigh = ac.currentBid || ac.startingBid;
    if (maxAmount <= currentHigh)
      return res.status(400).json({
        success: false,
        message: "Max amount must exceed current bid",
      });
    if (maxAmount > MAX_PROXY_BID)
      return res.status(400).json({
        success: false,
        message: `Proxy bid cannot exceed PKR ${MAX_PROXY_BID.toLocaleString()}`,
      });

    const hasVerifiedToken = await requireVerifiedBidToken(userId);
    if (!hasVerifiedToken) {
      return res.status(403).json({
        success: false,
        message:
          "Your token payment is still pending admin verification. You can set proxy bids only after it is verified.",
      });
    }

    const proxy = await ProxyBid.findOneAndUpdate(
      { auctionCar: auctionCarId, bidder: userId },
      { maxAmount, isActive: true },
      { upsert: true, new: true },
    );

    res.json({ success: true, data: proxy, message: "Proxy bid set" });
  } catch (error) {
    Logger.error("setProxyBid error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to set proxy bid" });
  }
};

/**
 * Buy now: immediately purchase the lot at buyNowPrice. Ends bidding for this auction car.
 */
export const buyNow = async (req, res) => {
  try {
    const { auctionCarId } = req.body;
    const userId = req.user._id;
    await syncVerifiedTokenCreditsToWallet(userId);
  
    const ac = await AuctionCar.findById(auctionCarId)
      .populate("auction")
      .populate("car", "title make model year");
    if (!ac)
      return res
        .status(404)
        .json({ success: false, message: "Auction car not found" });
    if (ac.auction.status !== "live")
      return res
        .status(400)
        .json({ success: false, message: "Auction is not live" });
    if (!["approved", "live"].includes(ac.status))
      return res.status(400).json({
        success: false,
        message: "This lot is not available for buy now",
      });
    const buyNowPrice = ac.buyNowPrice != null ? Number(ac.buyNowPrice) : null;
    if (buyNowPrice == null || buyNowPrice <= 0)
      return res.status(400).json({
        success: false,
        message: "Buy now is not available for this lot",
      });

    const wallet = await Wallet.findOne({ user: userId });
    const hasVerifiedToken = await requireVerifiedBidToken(userId);
    if (!hasVerifiedToken) {
      return res.status(403).json({
        success: false,
        message:
          "Your token payment is still pending admin verification. You can use buy now only after it is verified.",
      });
    }
    const hasWallet = wallet && wallet.balance >= buyNowPrice;
    if (!hasWallet)
      return res.status(403).json({
        success: false,
        message:
          wallet && wallet.balance < buyNowPrice
            ? `Insufficient balance. Buy now price is PKR ${buyNowPrice.toLocaleString()} and your wallet has PKR ${wallet.balance.toLocaleString()}.`
            : "Add funds to your wallet before using buy now.",
      });

    const session = await mongoose.startSession();
    let bid;
    let escrow;
    let prevWin = null;
    let amountDue = 0;
    try {
      await session.withTransaction(async () => {
        const liveAuctionCar = await AuctionCar.findById(auctionCarId)
          .populate("auction")
          .populate("car", "title make model year")
          .session(session);
        if (!liveAuctionCar) {
          throw new Error("Auction car not found");
        }
        if (liveAuctionCar.auction.status !== "live") {
          throw new Error("Auction is not live");
        }
        if (!["approved", "live"].includes(liveAuctionCar.status)) {
          throw new Error("This lot is not available for buy now");
        }
        if (liveAuctionCar.status === "sold" || liveAuctionCar.winner) {
          throw new Error("This lot has already been sold");
        }

        const buyingWallet = await Wallet.findOneAndUpdate(
          {
            user: userId,
            balance: { $gte: buyNowPrice },
            $or: [{ isActive: { $exists: false } }, { isActive: { $ne: false } }],
          },
          {
            $inc: { balance: -buyNowPrice, totalBidHeld: buyNowPrice },
            $set: { lastTransactionAt: new Date() },
          },
          { new: true, session },
        );
        if (!buyingWallet) {
          throw new Error(
            `Insufficient balance. Buy now price is PKR ${buyNowPrice.toLocaleString()}.`,
          );
        }

        prevWin = await Bid.findOne({
          auctionCar: auctionCarId,
          isWinning: true,
        }).session(session);
        if (prevWin && prevWin.bidder) {
          const prevWallet = await Wallet.findOneAndUpdate(
            { user: prevWin.bidder },
            {
              $inc: { balance: prevWin.amount, totalBidHeld: -prevWin.amount },
              $set: { lastTransactionAt: new Date() },
            },
            { new: true, session },
          );
          if (prevWallet) {
            prevWallet.totalBidHeld = Math.max(0, prevWallet.totalBidHeld || 0);
            await prevWallet.save({ session });
            await logWalletTxn({
              user: prevWin.bidder,
              type: "bid_refund",
              amount: prevWin.amount,
              reference: prevWin._id,
              referenceModel: "Bid",
              description: "Refund – lot sold via buy now",
              currentBalance: (prevWallet.balance || 0) - prevWin.amount,
              session,
            });
          }
        }

        await Bid.updateMany(
          { auctionCar: auctionCarId, isWinning: true },
          { isWinning: false },
          { session },
        );

        const createdBids = await Bid.create(
          [
            {
              auction: liveAuctionCar.auction._id,
              auctionCar: auctionCarId,
              bidder: userId,
              bidderName: req.user.name || "Bidder",
              amount: buyNowPrice,
              bidType: "online",
              isWinning: true,
            },
          ],
          { session },
        );
        bid = createdBids[0];

        await logWalletTxn({
          user: userId,
          type: "bid_hold",
          amount: -buyNowPrice,
          reference: bid._id,
          referenceModel: "Bid",
          description: `Buy now – PKR ${buyNowPrice.toLocaleString()}`,
          currentBalance: (buyingWallet.balance || 0) + buyNowPrice,
          session,
        });

        liveAuctionCar.status = "sold";
        liveAuctionCar.winner = userId;
        liveAuctionCar.finalPrice = buyNowPrice;
        liveAuctionCar.soldAt = new Date();
        liveAuctionCar.currentBid = buyNowPrice;
        liveAuctionCar.currentBidder = userId;
        await liveAuctionCar.save({ session });

        await ProxyBid.updateMany(
          { auctionCar: auctionCarId },
          { isActive: false },
          { session },
        );

        amountDue = 0;
        escrow = await createEscrowForWinner(
          auctionCarId,
          userId,
          buyNowPrice,
          buyNowPrice,
          amountDue,
          { session },
        );

        buyingWallet.totalBidHeld = Math.max(
          0,
          (buyingWallet.totalBidHeld || 0) - buyNowPrice,
        );
        await buyingWallet.save({ session });
        await logWalletTxn({
          user: userId,
          type: "escrow_payment",
          amount: -buyNowPrice,
          reference: escrow._id,
          referenceModel: "Escrow",
          description: "Winning buy now moved to escrow",
          currentBalance: buyingWallet.balance,
          session,
        });

        await Auction.findByIdAndUpdate(
          liveAuctionCar.auction._id,
          { $inc: { totalSold: 1 } },
          { session },
        );

        ac.status = liveAuctionCar.status;
        ac.winner = liveAuctionCar.winner;
        ac.finalPrice = liveAuctionCar.finalPrice;
        ac.soldAt = liveAuctionCar.soldAt;
        ac.currentBid = liveAuctionCar.currentBid;
        ac.currentBidder = liveAuctionCar.currentBidder;
      });
    } finally {
      await session.endSession();
    }

    await Notification.create({
      title: "Auction Won (Buy Now)!",
      message: `You purchased this lot at PKR ${buyNowPrice.toLocaleString()}. ${amountDue > 0 ? `Remaining payment: PKR ${amountDue.toLocaleString()} due within 48 hours.` : ""}`,
      type: "success",
      recipient: userId,
      actionUrl: `/auctions/result?car_id=${ac._id}`,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`auction:${ac.auction._id}`).emit("auction:ended", {
        auctionCarId,
        auctionId: ac.auction._id,
      });
      io.to(`auction:${ac.auction._id}`).emit("new-bid", {
        auctionCarId,
        bid: await Bid.findById(bid._id).populate("bidder", "name").lean(),
        currentBid: buyNowPrice,
        bidCount: ac.bidCount,
      });
      io.to(`user:${userId}`).emit("auction:won", {
        auctionCarId,
        auctionId: ac.auction._id,
        finalPrice: buyNowPrice,
        actionUrl: `/auctions/result?car_id=${ac._id}`,
      });
      io.to(`user:${userId}`).emit("new-notification", {
        title: "Auction Won (Buy Now)!",
        message: "You purchased this lot. Check your results.",
        actionUrl: `/auctions/result?car_id=${ac._id}`,
      });
    }

    const user = await User.findById(userId).select("email").lean();
    if (user?.email) {
      const resultUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/auctions/result?car_id=${ac._id}`;
      auctionEmailService
        .sendAuctionWon(user.email, {
          carLabel: ac.car?.title || "Auction car",
          finalPrice: buyNowPrice,
          amountDue,
          resultUrl,
        })
        .catch(() => {});
    }

    res.json({
      success: true,
      data: { bid, escrow, auctionCar: ac },
      message: "Buy now successful. You have won this lot.",
    });
  } catch (error) {
    Logger.error("buyNow error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process buy now" });
  }
};

// Admin offline bid
export const placeOfflineBid = async (req, res) => {
  try {
    const { auctionCarId, amount, bidderName = "Floor Bid" } = req.body;

    const ac = await AuctionCar.findById(auctionCarId).populate("auction");
    if (!ac || ac.auction.status !== "live")
      return res
        .status(400)
        .json({ success: false, message: "Auction not live" });

    const currentHigh = ac.currentBid || ac.startingBid;
    if (amount <= currentHigh)
      return res
        .status(400)
        .json({ success: false, message: "Amount must exceed current bid" });

    await Bid.updateMany(
      { auctionCar: auctionCarId, isWinning: true },
      { isWinning: false },
    );

    const bid = await Bid.create({
      auction: ac.auction._id,
      auctionCar: auctionCarId,
      bidder: null,
      bidderName,
      amount,
      bidType: "offline",
      isWinning: true,
      placedBy: req.user._id,
    });

    ac.currentBid = amount;
    ac.currentBidder = null;
    ac.bidCount += 1;
    if (ac.status === "approved") ac.status = "live";
    await ac.save();

    await Auction.findByIdAndUpdate(ac.auction._id, { $inc: { totalBids: 1 } });

    const io = req.app.get("io");
    if (io) {
      io.to(`auction:${ac.auction._id}`).emit("new-bid", {
        auctionCarId,
        bid,
        currentBid: amount,
        bidCount: ac.bidCount,
      });
    }

    res.json({ success: true, data: bid, message: "Offline bid placed" });
  } catch (error) {
    Logger.error("placeOfflineBid error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to place offline bid" });
  }
};

export const getBidsForCar = async (req, res) => {
  try {
    const { auctionCarId } = req.params;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const sort =
      req.query.sort === "oldest" ? { createdAt: 1 } : { amount: -1 };

    const [bids, total] = await Promise.all([
      Bid.find({ auctionCar: auctionCarId })
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("bidder", "name")
        .lean(),
      Bid.countDocuments({ auctionCar: auctionCarId }),
    ]);

    res.json({
      success: true,
      data: sanitizeBidsForPublic(bids),
      pagination: { page, limit, total },
    });
  } catch (error) {
    Logger.error("getBidsForCar error", error);
    res.status(500).json({ success: false, message: "Failed to fetch bids" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH  –  Token Payments
// ═══════════════════════════════════════════════════════════════════════════

export const submitTokenPayment = async (req, res) => {
  try {
    const paymentMethod = String(req.body?.paymentMethod || "").trim().toLowerCase();
    const transactionId = String(req.body?.transactionId || "").trim();
    const receiptUrl = String(req.body?.receiptUrl || "").trim();
    const allowedMethods = ["jazzcash", "easypaisa", "bank_transfer"];

    if (!paymentMethod || !transactionId || !receiptUrl) {
      return res.status(400).json({
        success: false,
        message: "Payment method, transaction ID, and receipt proof are required",
      });
    }
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }
    if (transactionId.length < 4 || transactionId.length > 64) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID must be between 4 and 64 characters",
      });
    }
    
    // Validate receipt URL - support both data URLs and HTTP URLs
    const isDataUrl = receiptUrl.startsWith("data:");
    const isHttpUrl =
      receiptUrl.startsWith("http://") || receiptUrl.startsWith("https://");
    
    // Allow larger data URLs in production (~15MB)
    const maxDataUrlLength = 15 * 1024 * 1024;
    const maxHttpUrlLength = 4096;
    
    const looksValidReceipt =
      (isDataUrl && receiptUrl.length >= 32 && receiptUrl.length <= maxDataUrlLength) ||
      (isHttpUrl && receiptUrl.length >= 8 && receiptUrl.length <= maxHttpUrlLength);

    if (!looksValidReceipt) {
      Logger.warn("Invalid receipt format", {
        isDataUrl,
        isHttpUrl,
        length: receiptUrl.length,
        userId: req.user._id,
      });
      return res.status(400).json({
        success: false,
        message: "Receipt proof looks invalid. Please upload a valid image or PDF.",
      });
    }
    
    // Check for duplicate pending/verified payments
    const existing = await TokenPayment.findOne({
      user: req.user._id,
      status: { $in: ["pending", "verified"] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message:
          existing.status === "verified"
            ? "You already have a verified token"
            : "Your previous payment is still pending verification",
      });
    }
    
    // Check for duplicate transaction ID
    const existingTx = await TokenPayment.findOne({
      user: req.user._id,
      transactionId,
    }).lean();
    if (existingTx) {
      return res.status(400).json({
        success: false,
        message: "This transaction ID has already been submitted",
      });
    }

    const settings = await getAuctionSettings();
    const tokenAmount = Number(settings?.tokenDeposit || 10000);

    const payment = await TokenPayment.create({
      user: req.user._id,
      amount: tokenAmount,
      paymentMethod,
      transactionId,
      receiptUrl,
    });

    Logger.info("Token payment submitted", {
      paymentId: payment._id,
      userId: req.user._id,
      paymentMethod,
      transactionId,
      receiptType: isDataUrl ? "base64" : "url",
      receiptLength: receiptUrl.length,
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: "Payment submitted for verification",
    });
  } catch (error) {
    Logger.error("submitTokenPayment error", error);
    
    // Handle request entity too large errors
    if (error.type === 'entity.too.large' || error.status === 413) {
      return res.status(413).json({
        success: false,
        message: "Receipt image is too large. Please use a smaller image or take a screenshot with lower resolution.",
      });
    }
    
    res
      .status(500)
      .json({ success: false, message: "Failed to submit payment. Please try again." });
  }
};

export const getMyTokenPayments = async (req, res) => {
  try {
    const syncedWallet = await syncVerifiedTokenCreditsToWallet(req.user._id);
    const settings = await getAuctionSettings();
    const payments = await TokenPayment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    const verified = payments.find((p) => p.status === "verified");
    const wallet =
      syncedWallet || (await Wallet.findOne({ user: req.user._id }).lean());
    res.json({
      success: true,
      data: {
        payments,
        tokenBalance: Number(wallet?.balance || 0),
        hasVerifiedToken: !!verified,
        tokenDepositAmount: Number(settings?.tokenDeposit || 10000),
        paymentWindowHours: Number(settings?.paymentWindowHours || 48),
      },
    });
  } catch (error) {
    Logger.error("getMyTokenPayments error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payments" });
  }
};

export const getTokenPaymentMeta = async (req, res) => {
  try {
    const settings = await getAuctionSettings();
    res.json({
      success: true,
      data: {
        tokenDepositAmount: Number(settings?.tokenDeposit || 10000),
        paymentWindowHours: Number(settings?.paymentWindowHours || 48),
        methods: [
          {
            id: "jazzcash",
            name: "JazzCash",
            accountName: "Okara Auto Auction",
            accountLabel: "Send to",
            accountValue: "0300-1234567",
          },
          {
            id: "easypaisa",
            name: "EasyPaisa",
            accountName: "Okara Auto Auction",
            accountLabel: "Send to",
            accountValue: "0300-7654321",
          },
          {
            id: "bank_transfer",
            name: "Bank Transfer",
            accountName: "SELLO",
            accountLabel: "UBL Account",
            accountValue: "A/C: 349170949 | IBAN: PK95UNIL0109000349170949",
          },
        ],
        supportPhone: "0300-1234567",
      },
    });
  } catch (error) {
    Logger.error("getTokenPaymentMeta error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch token payment info" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH  –  Watchlist
// ═══════════════════════════════════════════════════════════════════════════

export const addToWatchlist = async (req, res) => {
  try {
    const { auctionCarId } = req.body;
    const item = await AuctionWatchlist.findOneAndUpdate(
      { user: req.user._id, auctionCar: auctionCarId },
      { user: req.user._id, auctionCar: auctionCarId },
      { upsert: true, new: true },
    );
    res.json({ success: true, data: item });
  } catch (error) {
    Logger.error("addToWatchlist error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add to watchlist" });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    await AuctionWatchlist.findOneAndDelete({
      user: req.user._id,
      auctionCar: req.params.auctionCarId,
    });
    res.json({ success: true, message: "Removed from watchlist" });
  } catch (error) {
    Logger.error("removeFromWatchlist error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove from watchlist" });
  }
};

export const getMyWatchlist = async (req, res) => {
  try {
    const items = await AuctionWatchlist.find({ user: req.user._id })
      .populate({
        path: "auctionCar",
        populate: [
          {
            path: "car",
            select:
              "make model year mileage condition images fuelType transmission",
          },
          { path: "auction", select: "title endTime status" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: items.filter((i) => i.auctionCar) });
  } catch (error) {
    Logger.error("getMyWatchlist error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch watchlist" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH  –  Buyer Transactions
// ═══════════════════════════════════════════════════════════════════════════

export const getMyWonAuctions = async (req, res) => {
  try {
    const won = await AuctionCar.find({ winner: req.user._id, status: "sold" })
      .populate("car", "make model year images")
      .populate("auction", "title")
      .sort({ soldAt: -1 })
      .lean();

    res.json({ success: true, data: won });
  } catch (error) {
    Logger.error("getMyWonAuctions error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch won auctions" });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate({
        path: "auctionCar",
        populate: [
          { path: "car", select: "make model year images mileage" },
          { path: "auction", select: "title status" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: bids });
  } catch (error) {
    Logger.error("getMyBids error", error);
    res.status(500).json({ success: false, message: "Failed to fetch bids" });
  }
};

export const getMyEscrows = async (req, res) => {
  try {
    const escrows = await Escrow.find({ buyer: req.user._id })
      .populate({
        path: "auctionCar",
        populate: { path: "car", select: "make model year images" },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: escrows });
  } catch (error) {
    Logger.error("getMyEscrows error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch escrows" });
  }
};

/** GET /api/escrow/:id – winner or admin fetches single escrow */
export const getEscrowById = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id)
      .populate({
        path: "auctionCar",
        populate: { path: "car", select: "make model year images title" },
      })
      .populate("buyer", "name email")
      .lean();

    if (!escrow)
      return res
        .status(404)
        .json({ success: false, message: "Escrow not found" });

    const isBuyer = escrow.buyer?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isBuyer && !isAdmin)
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this escrow",
      });

    res.json({ success: true, data: escrow });
  } catch (error) {
    Logger.error("getEscrowById error", error);
    res.status(500).json({ success: false, message: "Failed to fetch escrow" });
  }
};

/** POST /api/escrow/pay – winner pays remaining balance (from wallet) */
export const payEscrow = async (req, res) => {
  try {
    const { escrowId } = req.body;
    if (!escrowId)
      return res
        .status(400)
        .json({ success: false, message: "escrowId required" });

    const escrow = await Escrow.findById(escrowId).populate(
      "buyer",
      "name email",
    );
    if (!escrow)
      return res
        .status(404)
        .json({ success: false, message: "Escrow not found" });

    if (escrow.buyer._id.toString() !== req.user._id.toString())
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to pay this escrow" });

    if (escrow.status !== "pending")
      return res.status(400).json({
        success: false,
        message: `Escrow is already ${escrow.status}. No payment needed.`,
      });

    if (escrow.amountDue <= 0) {
      escrow.status = "in_escrow";
      escrow.paidAt = new Date();
      await escrow.save();
      return res.json({
        success: true,
        data: escrow,
        message: "No balance due. Escrow marked as paid.",
      });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet || wallet.balance < escrow.amountDue)
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. You need PKR ${escrow.amountDue.toLocaleString()}.`,
      });

    wallet.balance -= escrow.amountDue;
    wallet.lastTransactionAt = new Date();
    await wallet.save();

    await logWalletTxn({
      user: req.user._id,
      type: "escrow_payment",
      amount: -escrow.amountDue,
      reference: escrow._id,
      referenceModel: "Escrow",
      description: "Escrow remaining balance paid",
    });

    escrow.status = "in_escrow";
    escrow.paidAt = new Date();
    await escrow.save();

    await Notification.create({
      title: "Escrow Payment Received",
      message: `Your payment of PKR ${escrow.amountDue.toLocaleString()} has been received. The seller will be notified when funds are released.`,
      type: "success",
      recipient: req.user._id,
      actionUrl: "/auctions/transactions",
    });

    res.json({
      success: true,
      data: escrow,
      message: "Payment received. Escrow is now in_escrow.",
    });
  } catch (error) {
    Logger.error("payEscrow error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process escrow payment" });
  }
};

/** POST /api/escrow/:id/dispute – buyer flags an issue (pending or in_escrow) */
export const raiseEscrowDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || "").trim();
    if (reason.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please describe the issue (at least 10 characters).",
      });
    }

    const escrow = await Escrow.findById(id).populate("buyer", "name email");
    if (!escrow) {
      return res
        .status(404)
        .json({ success: false, message: "Escrow not found" });
    }

    if (escrow.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to dispute this escrow",
      });
    }

    if (!["pending", "in_escrow"].includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        message: `This escrow cannot be disputed in status "${escrow.status}".`,
      });
    }

    escrow.status = "disputed";
    escrow.disputeReason = reason.slice(0, 4000);
    escrow.disputedAt = new Date();
    await escrow.save();

    await Notification.create({
      title: "Escrow dispute submitted",
      message:
        "We received your dispute. Our team will review and contact you shortly.",
      type: "warning",
      recipient: req.user._id,
      actionUrl: "/auctions/transactions",
    });

    res.json({
      success: true,
      data: escrow,
      message: "Dispute submitted successfully.",
    });
  } catch (error) {
    Logger.error("raiseEscrowDispute error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit dispute" });
  }
};

export const getMyAuctionResult = async (req, res) => {
  try {
    const { auctionCarId } = req.params;
    const auctionCar = await AuctionCar.findById(auctionCarId)
      .populate({
        path: "car",
        select:
          "title make model variant year condition mileage fuelType transmission images colorExterior registrationCity vehicleType",
      })
      .populate("auction", "title startTime endTime status location")
      .populate("winner", "name")
      .lean();

    if (!auctionCar) {
      return res
        .status(404)
        .json({ success: false, message: "Auction result not found" });
    }

    if (auctionCar.status !== "sold") {
      return res.status(400).json({
        success: false,
        message: "Auction is not finalized for this car",
      });
    }

    const isOwner =
      auctionCar.winner &&
      auctionCar.winner._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own auction results",
      });
    }

    const escrowQuery = { auctionCar: auctionCar._id };
    if (!isAdmin) {
      escrowQuery.buyer = req.user._id;
    }
    const escrow = await Escrow.findOne(escrowQuery).lean();

    return res.json({
      success: true,
      data: {
        ...auctionCar,
        escrow: escrow || null,
      },
    });
  } catch (error) {
    Logger.error("getMyAuctionResult error", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch auction result" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH  –  Submit Car to Auction
// ═══════════════════════════════════════════════════════════════════════════

export const getMyAuctionSubmissionByCar = async (req, res) => {
  try {
    const { car, auctionCar } = await getEditableAuctionSubmission(
      req.params.carId,
      req.user,
    );

    return res.json({
      success: true,
      data: {
        auctionCar,
        car,
      },
    });
  } catch (error) {
    Logger.error("getMyAuctionSubmissionByCar error", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch auction submission",
    });
  }
};

export const submitCarToAuction = async (req, res) => {
  try {
    if (!hasAuctionDealerSubmissionAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved auction dealers can submit cars to auction",
      });
    }

    const {
      auctionId,
      carId,
      startingBid,
      reservePrice,
      buyNowPrice,
      title,
      description,
      make,
      model,
      year,
      condition,
      price,
      colorExterior,
      color,
      colorInterior,
      fuelType,
      engine_type,
      engineCapacity,
      transmission,
      mileage,
      features,
      regionalSpec,
      bodyType,
      country,
      city,
      registration_city,
      location,
      carDoors,
      contactNumber,
      geoLocation,
      horsepower,
      warranty,
      numberOfCylinders,
      ownerType,
      batteryRange,
      motorPower,
      vehicleType,
      vehicleTypeCategory,
      videoUrls,
    } = req.body;

    if (!auctionId) {
      return res.status(400).json({
        success: false,
        message: "Auction is required for submission",
      });
    }

    const auction = await Auction.findById(auctionId).select("status title");
    if (!auction || !["draft", "scheduled", "live"].includes(auction.status)) {
      return res.status(400).json({
        success: false,
        message:
          "Auction not accepting submissions. Please select a draft, scheduled, or live auction.",
      });
    }

    const parsedGeoLocation = normalizeAuctionGeoLocation(geoLocation);
    const { inspectionReportFile, imageFiles, damageFiles, documentFiles } =
      getAuctionSubmissionFiles(req.files);

    // Hybrid model: inspection report PDF is mandatory for every auction submission
    if (!inspectionReportFile || !inspectionReportFile.buffer) {
      return res.status(400).json({
        success: false,
        message:
          "Inspection report is required. Please upload the vehicle inspection file.",
      });
    }

    // Handle two scenarios:
    // 1. Submit existing car to auction (carId provided)
    // 2. Create new car and submit to auction (no carId, full car data provided)

    let car;
    const duplicateWindowMinutes = Math.max(
      1,
      parseInt(process.env.CREATE_CAR_DEDUP_WINDOW_MINUTES, 10) || 15,
    );
    const duplicateSince = new Date(
      Date.now() - duplicateWindowMinutes * 60 * 1000,
    );

    if (carId) {
      // Scenario 1: Submit existing car
      car = await Car.findById(carId);
      if (!car)
        return res
          .status(404)
          .json({ success: false, message: "Car not found" });
      if (
        car.postedBy.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "You can only submit your own cars",
        });
      }
    } else {
      // Scenario 2: Create new car for auction
      // Validate required fields for new car creation
      if (!make || !model || !year) {
        return res.status(400).json({
          success: false,
          message:
            "Make, model, and year are required when creating a new listing",
        });
      }

      // Handle image uploads — parallel + total size cap (same as listing uploads)
      const totalBytes = imageFiles.reduce(
        (sum, img) => sum + (img.buffer?.length || 0),
        0,
      );
      if (totalBytes > LISTING_MAX_TOTAL_BYTES) {
        return res.status(400).json({
          success: false,
          message: MSG_IMAGE_TOTAL_EXCEEDED,
        });
      }
      let imageUrls = [];
      if (imageFiles.length > 0) {
        try {
          imageUrls = await uploadListingImagesToCloudinary(imageFiles, {
            folder: "auction_cars",
          });
        } catch (error) {
          Logger.error("Image upload failed for auction car", error);
          const code = error?.http_code ?? error?.error?.http_code;
          const msg =
            code === 502 || code === 503
              ? "Image service was busy. Try again with fewer photos."
              : error?.name === "TimeoutError" || code === 499
                ? "Image upload timed out. Use fewer or smaller images."
                : error?.message || "Image upload failed.";
          return res.status(503).json({ success: false, message: msg });
        }
      }

      let parsedFeatures = [];
      try {
        parsedFeatures = parseArray(features);
      } catch {
        parsedFeatures = [];
      }

      const normalizedAuctionTitle = String(
        title || `${make} ${model} ${year}`,
      ).trim();
      const normalizedYear = Number(year);
      const normalizedMileage = Number(mileage || 0);
      const normalizedStartingBid = Number(startingBid || price || 0);

      const recentDuplicateCar = await Car.findOne({
        postedBy: req.user._id,
        listingType: "auction",
        title: normalizedAuctionTitle,
        make,
        model,
        year: normalizedYear,
        mileage: normalizedMileage,
        price: normalizedStartingBid,
        createdAt: { $gte: duplicateSince },
        status: { $ne: "deleted" },
      })
        .sort({ createdAt: -1 })
        .select("_id")
        .lean();

      if (recentDuplicateCar?._id) {
        const existingAuctionCar = await AuctionCar.findOne({
          auction: auctionId,
          car: recentDuplicateCar._id,
        }).sort({ createdAt: -1 });

        if (existingAuctionCar) {
          Logger.warn("submitCarToAuction deduplicated recent request", {
            userId: req.user._id,
            auctionId,
            auctionCarId: existingAuctionCar._id,
            carId: recentDuplicateCar._id,
            windowMinutes: duplicateWindowMinutes,
          });
          return res.status(200).json({
            success: true,
            data: existingAuctionCar,
            deduplicated: true,
            message: "This vehicle was already submitted to the selected auction.",
          });
        }
      }

      // Create new car (listingType auction for hybrid model)
      car = await Car.create({
        title: title || `${make} ${model} ${year}`,
        description:
          description ||
          `Vehicle submitted for auction: ${make} ${model} ${year}`,
        vehicleType: vehicleType || "Car",
        make,
        model,
        year,
        condition: normalizeAuctionCondition(condition),
        price: startingBid || price || 0,
        colorExterior: colorExterior || color || "Not specified",
        colorInterior: colorInterior || "Not specified",
        fuelType: normalizeAuctionFuelType(fuelType || engine_type),
        engineCapacity,
        transmission: normalizeAuctionTransmission(transmission),
        mileage: mileage || 0,
        features: parsedFeatures,
        regionalSpec,
        bodyType,
        country: country || "Pakistan",
        city: city || registration_city || "Not specified",
        location: location || city || registration_city || "Not specified",
        carDoors,
        contactNumber,
        geoLocation: parsedGeoLocation, // Use the parsed geoLocation object
        horsepower,
        warranty,
        numberOfCylinders,
        ownerType,
        batteryRange,
        motorPower,
        images: imageUrls || [],
        postedBy: req.user._id,
        status: "active", // Changed from "pending" to "active" as that's the valid enum
        listingType: "auction",
        isApproved: true,
      });
    }

    const existing = await AuctionCar.findOne({
      auction: auctionId,
      car: car._id,
    });
    if (existing) {
      if (
        existing.status === "pending" &&
        existing.submittedBy?.toString() === req.user._id.toString()
      ) {
        const promotedStatus = auction.status === "live" ? "live" : "approved";
        existing.status = promotedStatus;
        await existing.save();
        return res.status(200).json({
          success: true,
          data: existing,
          message: "Existing pending submission is now active in auction",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Car already submitted to this auction",
      });
    }

    let inspectionReportPdfUrl = null;
    let damageImageUrls = [];
    let documentUrls = [];
    try {
      inspectionReportPdfUrl = await uploadRawToCloudinaryWithRetry(
        inspectionReportFile.buffer,
        { folder: "auction_inspection" },
      );
    } catch (err) {
      Logger.error("Inspection report upload failed", err);
      return res.status(503).json({
        success: false,
        message: "Failed to upload inspection report. Try again.",
      });
    }
    if (damageFiles.length > 0) {
      try {
        damageImageUrls = await uploadListingImagesToCloudinary(damageFiles, {
          folder: "auction_damage",
        });
      } catch (err) {
        Logger.error("Damage image upload failed", err);
        return res.status(503).json({
          success: false,
          message: "Failed to upload damage images. Try fewer/smaller files.",
        });
      }
    }
    if (documentFiles.length > 0) {
      try {
        documentUrls = await Promise.all(
          documentFiles.map((f) =>
            uploadRawToCloudinaryWithRetry(f.buffer, {
              folder: "auction_documents",
            }),
          ),
        );
      } catch (err) {
        Logger.error("Auction document upload failed", err);
        return res.status(503).json({
          success: false,
          message: "Failed to upload one or more documents. Please retry.",
        });
      }
    }
    const parsedVideoUrls = parseArray(videoUrls);

    const auctionCarStatus = auction.status === "live" ? "live" : "approved";

    let ac;
    try {
      ac = await AuctionCar.create({
        auction: auctionId,
        car: car._id,
        startingBid: startingBid || car.price,
        reservePrice: reservePrice || null,
        buyNowPrice: buyNowPrice || null,
        submittedBy: req.user._id,
        status: auctionCarStatus,
        inspectionReportPdfUrl,
        damageImageUrls,
        documentUrls,
        videoUrls: parsedVideoUrls.filter(Boolean),
      });
    } catch (createError) {
      if (createError?.code === 11000) {
        const existingAuctionCar = await AuctionCar.findOne({
          auction: auctionId,
          car: car._id,
        });
        if (existingAuctionCar) {
          Logger.warn("submitCarToAuction resolved duplicate key", {
            userId: req.user._id,
            auctionId,
            auctionCarId: existingAuctionCar._id,
            carId: car._id,
          });
          return res.status(200).json({
            success: true,
            data: existingAuctionCar,
            deduplicated: true,
            message: "This vehicle was already submitted to the selected auction.",
          });
        }
      }
      throw createError;
    }

    await Auction.findByIdAndUpdate(auctionId, { $inc: { totalCars: 1 } });

    res.status(201).json({
      success: true,
      data: ac,
      message: carId
        ? "Car submitted to auction"
        : "Car created and submitted to auction",
    });
  } catch (error) {
    Logger.error("submitCarToAuction error", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      body: req.body,
      user: req.user?._id,
      files: req.files ? Object.keys(req.files) : [],
    });
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit car",
    });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Auction CRUD
// ═══════════════════════════════════════════════════════════════════════════

export const updateMyAuctionSubmissionByCar = async (req, res) => {
  try {
    if (!hasAuctionDealerSubmissionAccess(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only approved auction dealers can update auction submissions",
      });
    }

    const { car, auctionCar } = await getEditableAuctionSubmission(
      req.params.carId,
      req.user,
    );

    if (["live", "sold", "unsold", "withdrawn"].includes(auctionCar.status)) {
      return res.status(400).json({
        success: false,
        message:
          "This auction listing can no longer be edited because it is already live or closed.",
      });
    }

    const {
      title,
      description,
      make,
      model,
      year,
      condition,
      colorExterior,
      colorInterior,
      fuelType,
      engineCapacity,
      transmission,
      mileage,
      features,
      regionalSpec,
      bodyType,
      city,
      location,
      contactNumber,
      whatsappNumber,
      geoLocation,
      warranty,
      ownerType,
      startingBid,
      reservePrice,
      buyNowPrice,
      videoUrls,
    } = req.body;

    const { inspectionReportFile, imageFiles, damageFiles, documentFiles } =
      getAuctionSubmissionFiles(req.files);

    const totalBytes = imageFiles.reduce(
      (sum, img) => sum + (img.buffer?.length || 0),
      0,
    );
    if (totalBytes > LISTING_MAX_TOTAL_BYTES) {
      return res.status(400).json({
        success: false,
        message: MSG_IMAGE_TOTAL_EXCEEDED,
      });
    }

    let newImageUrls = [];
    if (imageFiles.length > 0) {
      try {
        newImageUrls = await uploadListingImagesToCloudinary(imageFiles, {
          folder: "auction_cars",
        });
      } catch (error) {
        Logger.error("Auction edit image upload failed", error);
        return res.status(503).json({
          success: false,
          message: "Failed to upload updated photos. Try fewer or smaller files.",
        });
      }
    }

    const existingImages = parseStringArrayField(
      req.body["existingImages[]"] ?? req.body.existingImages,
    );
    const newImagesFirst = req.body.newImagesFirst === "true";
    const images = (
      newImagesFirst
        ? [...newImageUrls, ...existingImages]
        : [...existingImages, ...newImageUrls]
    ).filter(Boolean);

    let inspectionReportPdfUrl = auctionCar.inspectionReportPdfUrl || null;
    if (inspectionReportFile?.buffer) {
      try {
        inspectionReportPdfUrl = await uploadRawToCloudinaryWithRetry(
          inspectionReportFile.buffer,
          { folder: "auction_inspection" },
        );
      } catch (error) {
        Logger.error("Auction edit inspection report upload failed", error);
        return res.status(503).json({
          success: false,
          message: "Failed to upload updated inspection report. Try again.",
        });
      }
    }

    let damageImageUrls = parseStringArrayField(
      req.body["existingDamageImageUrls[]"] ?? req.body.existingDamageImageUrls,
    );
    if (damageFiles.length > 0) {
      try {
        const uploadedDamageUrls = await uploadListingImagesToCloudinary(
          damageFiles,
          {
            folder: "auction_damage",
          },
        );
        damageImageUrls = [...damageImageUrls, ...uploadedDamageUrls];
      } catch (error) {
        Logger.error("Auction edit damage image upload failed", error);
        return res.status(503).json({
          success: false,
          message: "Failed to upload updated damage images. Try again.",
        });
      }
    }

    let documentUrls = parseStringArrayField(
      req.body["existingDocumentUrls[]"] ?? req.body.existingDocumentUrls,
    );
    if (documentFiles.length > 0) {
      try {
        const uploadedDocuments = await Promise.all(
          documentFiles.map((file) =>
            uploadRawToCloudinaryWithRetry(file.buffer, {
              folder: "auction_documents",
            }),
          ),
        );
        documentUrls = [...documentUrls, ...uploadedDocuments];
      } catch (error) {
        Logger.error("Auction edit document upload failed", error);
        return res.status(503).json({
          success: false,
          message: "Failed to upload updated documents. Please retry.",
        });
      }
    }

    let parsedFeatures = car.features || [];
    if (features !== undefined) {
      try {
        parsedFeatures = parseArray(features);
      } catch {
        parsedFeatures = [];
      }
    }

    const normalizedGeoLocation =
      geoLocation !== undefined
        ? normalizeAuctionGeoLocation(geoLocation)
        : car.geoLocation;

    car.title = title || car.title;
    car.description = description ?? car.description;
    car.make = make || car.make;
    car.model = model || car.model;
    car.year = year ? Number(year) : car.year;
    car.condition = condition
      ? normalizeAuctionCondition(condition)
      : car.condition;
    car.price =
      startingBid !== undefined && startingBid !== ""
        ? Number(startingBid)
        : car.price;
    car.colorExterior = colorExterior ?? car.colorExterior;
    car.colorInterior = colorInterior ?? car.colorInterior;
    car.fuelType = fuelType ? normalizeAuctionFuelType(fuelType) : car.fuelType;
    car.transmission = transmission
      ? normalizeAuctionTransmission(transmission)
      : car.transmission;
    car.mileage =
      mileage !== undefined && mileage !== "" ? Number(mileage) : car.mileage;
    car.bodyType = bodyType ?? car.bodyType;
    car.city = city || car.city;
    car.location = location ?? car.location;
    car.contactNumber = contactNumber || car.contactNumber;
    car.whatsappNumber =
      whatsappNumber !== undefined ? whatsappNumber : car.whatsappNumber;
    car.geoLocation = normalizedGeoLocation;
    car.warranty = warranty || car.warranty;
    car.ownerType = ownerType || car.ownerType;
    car.images = images.length > 0 ? images : car.images;
    car.features = parsedFeatures;
    if (regionalSpec !== undefined) {
      car.regionalSpec = regionalSpec || null;
    }
    if (engineCapacity !== undefined) {
      car.engineCapacity =
        engineCapacity === "" ? undefined : Number(engineCapacity);
    }
    await car.save();

    if (startingBid !== undefined && startingBid !== "") {
      auctionCar.startingBid = Number(startingBid);
    }
    if (reservePrice !== undefined) {
      auctionCar.reservePrice =
        reservePrice === "" ? null : Number(reservePrice);
    }
    if (buyNowPrice !== undefined) {
      auctionCar.buyNowPrice =
        buyNowPrice === "" ? null : Number(buyNowPrice);
    }
    auctionCar.inspectionReportPdfUrl = inspectionReportPdfUrl;
    auctionCar.damageImageUrls = damageImageUrls;
    auctionCar.documentUrls = documentUrls;
    if (videoUrls !== undefined) {
      auctionCar.videoUrls = parseArray(videoUrls).filter(Boolean);
    }
    await auctionCar.save();

    const refreshed = await AuctionCar.findById(auctionCar._id)
      .populate("auction", "title status startTime endTime")
      .populate("car");

    return res.json({
      success: true,
      data: {
        auctionCar: refreshed,
        car: refreshed?.car,
      },
      message: "Auction listing updated successfully",
    });
  } catch (error) {
    Logger.error("updateMyAuctionSubmissionByCar error", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update auction submission",
    });
  }
};

export const createAuction = async (req, res) => {
  try {
    const { title, description, startTime, endTime, location } = req.body;
    if (!title || !startTime || !endTime)
      return res.status(400).json({
        success: false,
        message: "Title, start time and end time are required",
      });

    const auction = await Auction.create({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location || undefined,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: auction });
  } catch (error) {
    Logger.error("createAuction error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create auction" });
  }
};

export const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });
    res.json({ success: true, data: auction });
  } catch (error) {
    Logger.error("updateAuction error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update auction" });
  }
};

export const goLive = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });
    if (!["draft", "scheduled"].includes(auction.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot go live from ${auction.status} status`,
      });
    }

    auction.status = "live";
    auction.startTime = new Date();
    await auction.save();

    await AuctionCar.updateMany(
      { auction: auction._id, status: "approved" },
      { status: "live" },
    );

    const io = req.app.get("io");
    if (io)
      io.emit("auction-status-change", {
        auctionId: auction._id,
        status: "live",
      });

    res.json({ success: true, data: auction, message: "Auction is now live" });
  } catch (error) {
    Logger.error("goLive error", error);
    res.status(500).json({ success: false, message: "Failed to go live" });
  }
};

export const endAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction || auction.status !== "live")
      return res
        .status(400)
        .json({ success: false, message: "Auction is not live" });

    auction.status = "completed";
    auction.endTime = new Date();
    await auction.save();

    // Determine winners for each car
    const auctionCars = await AuctionCar.find({
      auction: auction._id,
      status: "live",
    });
    let totalSold = 0;

    for (const ac of auctionCars) {
      const topBid = await Bid.findOne({
        auctionCar: ac._id,
        isWinning: true,
      }).sort({ amount: -1 });

      if (
        topBid &&
        topBid.bidder &&
        (!ac.reservePrice || topBid.amount >= ac.reservePrice)
      ) {
        ac.status = "sold";
        ac.winner = topBid.bidder;
        ac.finalPrice = topBid.amount;
        ac.soldAt = new Date();
        totalSold++;

        // Winner's held bid converts to escrow – no balance change (already deducted)
        const winnerWallet = await Wallet.findOne({ user: topBid.bidder });
        const walletDeduction = await getHeldAmountForBid(
          topBid._id,
          winnerWallet,
          topBid.amount,
        );
        const escrow = await Escrow.create({
          auctionCar: ac._id,
          buyer: topBid.bidder,
          amount: topBid.amount,
          tokenDeduction: walletDeduction,
          amountDue: Math.max(0, topBid.amount - walletDeduction),
          paymentDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        });

        if (winnerWallet) {
          winnerWallet.totalBidHeld = Math.max(
            0,
            winnerWallet.totalBidHeld - topBid.amount,
          );
          await winnerWallet.save();
          await logWalletTxn({
            user: topBid.bidder,
            type: "escrow_payment",
            amount: -topBid.amount,
            reference: escrow._id,
            referenceModel: "Escrow",
            description: "Winning bid moved to escrow",
          });
        } else {
          await logWalletTxn({
            user: topBid.bidder,
            type: "token_deposit",
            amount: -10000,
            reference: escrow._id,
            referenceModel: "Escrow",
            description: "Token deposit applied to winning bid",
          });
        }

        // Notify winner
        await Notification.create({
          title: "Auction Won!",
          message: `Congratulations! You won an auction. ${escrow.amountDue > 0 ? `Remaining payment: PKR ${escrow.amountDue.toLocaleString()} due within 48 hours.` : "Your wallet balance covered the full amount."}`,
          type: "success",
          recipient: topBid.bidder,
          actionUrl: `/auctions/result?car_id=${ac._id}`,
        });

        const io = req.app.get("io");
        if (io) {
          io.to(`user:${topBid.bidder}`).emit("new-notification", {
            title: "Auction Won!",
            message: "You won an auction! Check your results.",
            actionUrl: `/auctions/result?car_id=${ac._id}`,
          });
          io.to(`user:${topBid.bidder}`).emit("auction:won", {
            auctionCarId: ac._id,
            auctionId: auction._id,
            finalPrice: topBid.amount,
            actionUrl: `/auctions/result?car_id=${ac._id}`,
          });
        }
      } else {
        ac.status = "unsold";
        // Refund last winning bidder's held amount if car goes unsold
        if (topBid && topBid.bidder) {
          const refundWallet = await Wallet.findOne({ user: topBid.bidder });
          if (refundWallet) {
            refundWallet.balance += topBid.amount;
            refundWallet.totalBidHeld = Math.max(
              0,
              refundWallet.totalBidHeld - topBid.amount,
            );
            refundWallet.lastTransactionAt = new Date();
            await refundWallet.save();
            await logWalletTxn({
              user: topBid.bidder,
              type: "bid_refund",
              amount: topBid.amount,
              reference: topBid._id,
              referenceModel: "Bid",
              description: "Bid refund – car unsold (reserve not met)",
            });
          }
        }
      }
      await ac.save();
    }

    auction.totalSold = totalSold;
    await auction.save();
    const settlement = await settleAuctionParticipantTokens(auction, {
      logWalletTxn,
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("auction-status-change", {
        auctionId: auction._id,
        status: "completed",
      });
      io.emit("auction:ended", {
        auctionId: auction._id,
        totalSold,
        status: "completed",
      });
    }

    res.json({
      success: true,
      data: auction,
      message: `Auction ended. ${totalSold} cars sold. ${settlement.settled} losing bidder settlements processed.`,
    });
  } catch (error) {
    Logger.error("endAuction error", error);
    res.status(500).json({ success: false, message: "Failed to end auction" });
  }
};

export const cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });

    auction.status = "cancelled";
    await auction.save();

    await AuctionCar.updateMany(
      {
        auction: auction._id,
        status: { $in: ["pending", "approved", "live"] },
      },
      { status: "withdrawn" },
    );

    const io = req.app.get("io");
    if (io)
      io.emit("auction-status-change", {
        auctionId: auction._id,
        status: "cancelled",
      });

    res.json({ success: true, data: auction, message: "Auction cancelled" });
  } catch (error) {
    Logger.error("cancelAuction error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to cancel auction" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Auction Car Management
// ═══════════════════════════════════════════════════════════════════════════

export const approveAuctionCar = async (req, res) => {
  try {
    const ac = await AuctionCar.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true },
    ).populate("car", "make model year");
    if (!ac)
      return res
        .status(404)
        .json({ success: false, message: "Auction car not found" });
    res.json({ success: true, data: ac, message: "Car approved" });
  } catch (error) {
    Logger.error("approveAuctionCar error", error);
    res.status(500).json({ success: false, message: "Failed to approve car" });
  }
};

export const rejectAuctionCar = async (req, res) => {
  try {
    const ac = await AuctionCar.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true },
    );
    if (!ac)
      return res
        .status(404)
        .json({ success: false, message: "Auction car not found" });
    res.json({ success: true, data: ac, message: "Car rejected" });
  } catch (error) {
    Logger.error("rejectAuctionCar error", error);
    res.status(500).json({ success: false, message: "Failed to reject car" });
  }
};

export const updateInspection = async (req, res) => {
  try {
    const ac = await AuctionCar.findByIdAndUpdate(
      req.params.id,
      { inspectionReport: req.body },
      { new: true },
    );
    if (!ac)
      return res
        .status(404)
        .json({ success: false, message: "Auction car not found" });
    res.json({ success: true, data: ac, message: "Inspection updated" });
  } catch (error) {
    Logger.error("updateInspection error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update inspection" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Token Payment Management
// ═══════════════════════════════════════════════════════════════════════════

export const getAllTokenPayments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const payments = await TokenPayment.find(filter)
      .populate("user", "name email phone")
      .populate("verifiedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: payments });
  } catch (error) {
    Logger.error("getAllTokenPayments error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payments" });
  }
};

export const verifyTokenPayment = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const payment = await TokenPayment.findById(req.params.id);
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });

    if (!["verify", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'verify' or 'reject'.",
      });
    }
    if (payment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `Only pending payments can be reviewed. Current status: ${payment.status}`,
      });
    }

    if (action === "verify") {
      Logger.info("Admin verifying token payment", {
        paymentId: payment._id,
        userId: String(payment.user),
        amount: Number(payment.amount || 0),
        adminId: String(req.user._id),
      });
      payment.status = "verified";
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();
    } else if (action === "reject") {
      payment.status = "rejected";
      payment.verifiedBy = req.user._id;
      payment.verifiedAt = new Date();
      payment.rejectionReason = rejectionReason || "";
    }
    await payment.save();
    let walletAfterCredit = null;
    if (action === "verify") {
      walletAfterCredit = await syncVerifiedTokenCreditsToWallet(payment.user);
      Logger.info("Token payment verification wallet sync completed", {
        paymentId: payment._id,
        userId: String(payment.user),
        walletBalance: Number(walletAfterCredit?.balance || 0),
        walletCreditedAt:
          payment.walletCreditedAt || payment.verifiedAt || new Date(),
      });
    }

    await Notification.create({
      title:
        action === "verify"
          ? "Token Payment Verified"
          : "Token Payment Rejected",
      message:
        action === "verify"
          ? "Your token deposit has been verified. You can now place bids!"
          : `Your token payment was rejected. ${rejectionReason || ""}`,
      type: action === "verify" ? "success" : "error",
      recipient: payment.user,
      actionUrl: "/auctions",
    });

    res.json({
      success: true,
      data: payment,
      message:
        action === "verify"
          ? "Payment verified and wallet updated successfully"
          : "Payment rejected",
    });
  } catch (error) {
    Logger.error("verifyTokenPayment error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process payment" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Dashboard Stats
// ═══════════════════════════════════════════════════════════════════════════

export const getAuctionDashboard = async (req, res) => {
  try {
    const [
      totalAuctions,
      liveAuctions,
      totalCars,
      totalBids,
      totalUsers,
      pendingPayments,
      soldCount,
      unsoldCount,
      completedAuctions,
    ] = await Promise.all([
      Auction.countDocuments(),
      Auction.countDocuments({ status: "live" }),
      AuctionCar.countDocuments(),
      Bid.countDocuments(),
      TokenPayment.countDocuments({ status: "verified" }),
      TokenPayment.countDocuments({ status: "pending" }),
      AuctionCar.countDocuments({ status: "sold" }),
      AuctionCar.countDocuments({ status: "unsold" }),
      Auction.countDocuments({ status: "completed" }),
    ]);

    const soldPipeline = [
      { $match: { status: "sold", finalPrice: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$finalPrice" },
          count: { $sum: 1 },
        },
      },
    ];
    const soldAgg = await AuctionCar.aggregate(soldPipeline);
    const avgSalePrice = soldAgg[0]?.count
      ? soldAgg[0].total / soldAgg[0].count
      : 0;
    const auctionBidPipeline = [
      { $match: { status: { $in: ["completed", "live"] } } },
      {
        $group: {
          _id: null,
          totalBids: { $sum: "$totalBids" },
          count: { $sum: 1 },
        },
      },
    ];
    const auctionBidAgg = await Auction.aggregate(auctionBidPipeline);
    const bidsPerAuction = auctionBidAgg[0]?.count
      ? auctionBidAgg[0].totalBids / auctionBidAgg[0].count
      : 0;
    const lotsClosed = soldCount + unsoldCount;
    const conversionRate = lotsClosed > 0 ? (soldCount / lotsClosed) * 100 : 0;

    const recentAuctions = await Auction.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    const recentBids = await Bid.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("bidder", "name")
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalAuctions,
          liveAuctions,
          totalCars,
          totalBids,
          totalUsers,
          pendingPayments,
          soldCount,
          unsoldCount,
          completedAuctions,
          averageSalePrice: Math.round(avgSalePrice),
          bidsPerAuction: Math.round(bidsPerAuction * 100) / 100,
          conversionRate: Math.round(conversionRate * 100) / 100,
        },
        recentAuctions,
        recentBids,
      },
    });
  } catch (error) {
    Logger.error("getAuctionDashboard error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  All Auction Cars (for management)
// ═══════════════════════════════════════════════════════════════════════════

export const getAllAuctionCars = async (req, res) => {
  try {
    const { auctionId, status } = req.query;
    const filter = {};
    if (auctionId) filter.auction = auctionId;
    if (status && status !== "all") filter.status = status;

    const cars = await AuctionCar.find(filter)
      .populate("car", "make model year images condition price")
      .populate("submittedBy", "name email")
      .populate("auction", "title status")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: cars });
  } catch (error) {
    Logger.error("getAllAuctionCars error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch auction cars" });
  }
};

export const adminAddCarToAuction = async (req, res) => {
  try {
    const { auctionId, carId, startingBid, reservePrice, buyNowPrice, bidIncrement } =
      req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction || !["draft", "scheduled", "live"].includes(auction.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Auction not accepting cars" });
    }

    const car = await Car.findById(carId);
    if (!car)
      return res.status(404).json({ success: false, message: "Car not found" });

    const existing = await AuctionCar.findOne({
      car: carId,
      auction: auctionId,
    });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Car already in this auction" });

    const status = auction.status === "live" ? "live" : "approved";
    
    // Fetch global auction settings for the fallback bid increment
    const settings = await AuctionSettings.findOne();
    const defaultBidIncrement = settings?.minBidIncrement || 50000;

    const auctionCar = await AuctionCar.create({
      auction: auctionId,
      car: carId,
      submittedBy: req.user._id,
      startingBid: startingBid || car.price || 500000,
      reservePrice: reservePrice || 0,
      buyNowPrice: buyNowPrice || 0,
      bidIncrement: bidIncrement || defaultBidIncrement,
      currentBid: 0,
      bidCount: 0,
      status,
    });

    await Auction.findByIdAndUpdate(auctionId, { $inc: { totalCars: 1 } });
    res.status(201).json({ success: true, data: auctionCar });
  } catch (error) {
    Logger.error("adminAddCarToAuction error", error);
    res.status(500).json({ success: false, message: "Failed to add car" });
  }
};

export const adminUpdateAuctionCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { startingBid, reservePrice, buyNowPrice, bidIncrement, status } = req.body;

    const ac = await AuctionCar.findById(id);
    if (!ac) {
      return res.status(404).json({ success: false, message: "Auction car not found" });
    }

    if (startingBid !== undefined) ac.startingBid = startingBid;
    if (reservePrice !== undefined) ac.reservePrice = reservePrice;
    if (buyNowPrice !== undefined) ac.buyNowPrice = buyNowPrice;
    if (bidIncrement !== undefined) ac.bidIncrement = bidIncrement;
    if (status !== undefined) ac.status = status;

    await ac.save();

    res.json({ success: true, data: ac, message: "Auction car updated successfully" });
  } catch (error) {
    Logger.error("adminUpdateAuctionCar error", error);
    res.status(500).json({ success: false, message: "Failed to update auction car" });
  }
};

export const adminDeleteAuctionCar = async (req, res) => {
  try {
    const { id } = req.params;
    const ac = await AuctionCar.findById(id);
    if (!ac) {
      return res.status(404).json({ success: false, message: "Auction car not found" });
    }

    const { auction: auctionId } = ac;
    await AuctionCar.findByIdAndDelete(id);

    // Decrement totalCars in the auction
    await Auction.findByIdAndUpdate(auctionId, { $inc: { totalCars: -1 } });

    res.json({ success: true, message: "Car removed from auction" });
  } catch (error) {
    Logger.error("adminDeleteAuctionCar error", error);
    res.status(500).json({ success: false, message: "Failed to remove car from auction" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// Helpers – Wallet Ledger
// ═══════════════════════════════════════════════════════════════════════════

async function getRunningBalance(userId, session = null) {
  const last = await WalletTransaction.findOne({ user: userId })
    .session(session)
    .sort({ createdAt: -1 })
    .select("balance")
    .lean();
  return last?.balance || 0;
}

async function logWalletTxn({
  user,
  type,
  amount,
  reference,
  referenceModel,
  description,
  status = "completed",
  currentBalance,
  session = null,
}) {
  const balance =
    typeof currentBalance === "number"
      ? currentBalance + amount
      : (await getRunningBalance(user, session)) + amount;
  return WalletTransaction.create({
    user,
    type,
    amount,
    balance,
    reference,
    referenceModel,
    description,
    status,
  }, { session });
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Escrow Management
// ═══════════════════════════════════════════════════════════════════════════

const ESCROW_TRANSITIONS = {
  pending: ["in_escrow", "disputed", "refunded", "penalized"],
  in_escrow: ["released", "disputed", "refunded"],
  disputed: ["in_escrow", "released", "refunded"],
  penalized: [],
};

export const adminUpdateEscrowStatus = async (req, res) => {
  try {
    const { status: newStatus, notes } = req.body;
    const escrow = await Escrow.findById(req.params.id)
      .populate("buyer", "name email")
      .populate({
        path: "auctionCar",
        populate: [
          { path: "car", select: "postedBy make model year" },
          { path: "submittedBy", select: "name email" },
        ],
      });
    if (!escrow)
      return res
        .status(404)
        .json({ success: false, message: "Escrow not found" });

    const allowed = ESCROW_TRANSITIONS[escrow.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${escrow.status}" to "${newStatus}"`,
      });
    }

    const prev = escrow.status;
    escrow.status = newStatus;

    if (newStatus === "in_escrow") {
      escrow.paidAt = new Date();
      await logWalletTxn({
        user: escrow.buyer._id || escrow.buyer,
        type: "escrow_payment",
        amount: -escrow.amountDue,
        reference: escrow._id,
        referenceModel: "Escrow",
        description: `Escrow payment received (${prev} → in_escrow)`,
      });
    } else if (newStatus === "released") {
      escrow.releasedAt = new Date();
      await logWalletTxn({
        user: escrow.buyer._id || escrow.buyer,
        type: "escrow_release",
        amount: 0,
        reference: escrow._id,
        referenceModel: "Escrow",
        description: "Escrow funds released to seller",
      });

      const ac = escrow.auctionCar;
      const finalPrice = escrow.amount || 0;
      const settings = await getAuctionSettings();
      const listingFee = settings?.listingFee ?? 0;
      const buyerFeePercent = settings?.buyerFeePercent ?? 0;
      const sellerSuccessFeePercent =
        settings?.sellerSuccessFeePercent ??
        settings?.sellerCommissionPercent ??
        0;
      const inspectionFee = settings?.inspectionFee ?? 0;
      const dealerCommissionPercent = settings?.dealerCommissionPercent ?? 0;
      const dealerCommissionFixed = settings?.dealerCommissionFixed ?? 0;
      const dealerCommission = dealerCommissionPercent
        ? Math.round(finalPrice * (dealerCommissionPercent / 100))
        : dealerCommissionFixed;
      const platformCut =
        Math.round(finalPrice * (sellerSuccessFeePercent / 100)) + listingFee;
      const sellerAmount = Math.max(
        0,
        finalPrice - platformCut - inspectionFee - dealerCommission,
      );
      const dealerId = ac?.submittedBy?._id || ac?.submittedBy;
      const sellerId = ac?.car?.postedBy;

      if (dealerId && (inspectionFee > 0 || dealerCommission > 0)) {
        const dealerWallet = await getOrCreateAuctionWallet(dealerId);
        const total = inspectionFee + dealerCommission;
        dealerWallet.balance += total;
        dealerWallet.lastTransactionAt = new Date();
        await dealerWallet.save();
        if (inspectionFee > 0) {
          await logWalletTxn({
            user: dealerId,
            type: "inspection_fee",
            amount: inspectionFee,
            reference: escrow._id,
            referenceModel: "Escrow",
            description: "Inspection fee (auction sale)",
          });
        }
        if (dealerCommission > 0) {
          await logWalletTxn({
            user: dealerId,
            type: "dealer_commission",
            amount: dealerCommission,
            reference: escrow._id,
            referenceModel: "Escrow",
            description: "Dealer commission (auction sale)",
          });
        }
      }
      if (sellerId && sellerAmount > 0) {
        const sellerWallet = await getOrCreateAuctionWallet(sellerId);
        sellerWallet.balance += sellerAmount;
        sellerWallet.lastTransactionAt = new Date();
        await sellerWallet.save();
        await logWalletTxn({
          user: sellerId,
          type: "seller_payout",
          amount: sellerAmount,
          reference: escrow._id,
          referenceModel: "Escrow",
          description: "Seller payout (auction sale)",
        });
      }
    } else if (newStatus === "refunded") {
      await logWalletTxn({
        user: escrow.buyer._id || escrow.buyer,
        type: "escrow_refund",
        amount: escrow.amountDue,
        reference: escrow._id,
        referenceModel: "Escrow",
        description: "Escrow refunded to buyer",
      });
    }

    await escrow.save();

    await Notification.create({
      title: "Escrow Status Updated",
      message: `Your escrow has been updated to "${newStatus}".${notes ? ` Note: ${notes}` : ""}`,
      type:
        newStatus === "released"
          ? "success"
          : newStatus === "refunded"
            ? "info"
            : "warning",
      recipient: escrow.buyer._id || escrow.buyer,
      actionUrl: "/auctions/transactions",
    });

    res.json({
      success: true,
      data: escrow,
      message: `Escrow updated: ${prev} → ${newStatus}`,
    });
  } catch (error) {
    Logger.error("adminUpdateEscrowStatus error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update escrow" });
  }
};

export const adminGetAllEscrows = async (req, res) => {
  try {
    const { status, overdue } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (overdue === "true") {
      filter.status = "pending";
      filter.paymentDeadline = { $lt: new Date() };
    }

    const escrows = await Escrow.find(filter)
      .populate("buyer", "name email phone")
      .populate({
        path: "auctionCar",
        populate: [
          { path: "car", select: "make model year images" },
          { path: "auction", select: "title" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: escrows });
  } catch (error) {
    Logger.error("adminGetAllEscrows error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch escrows" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Token Refunds
// ═══════════════════════════════════════════════════════════════════════════

export const adminRefundToken = async (req, res) => {
  try {
    const payment = await TokenPayment.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!payment)
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    if (payment.status === "refunded")
      return res
        .status(400)
        .json({ success: false, message: "Already refunded" });
    if (payment.status !== "verified") {
      return res.status(400).json({
        success: false,
        message: `Only verified payments can be refunded. Current status: ${payment.status}`,
      });
    }

    payment.status = "refunded";
    payment.refundedAt = new Date();
    await payment.save();
    await reverseTokenCreditFromWallet(payment);

    await Notification.create({
      title: "Token Deposit Refunded",
      message: `Your token deposit of PKR ${payment.amount.toLocaleString()} has been refunded.`,
      type: "success",
      recipient: payment.user._id || payment.user,
      actionUrl: "/auctions/transactions",
    });

    res.json({
      success: true,
      data: payment,
      message: "Token refunded successfully",
    });
  } catch (error) {
    Logger.error("adminRefundToken error", error);
    res.status(500).json({ success: false, message: "Failed to refund token" });
  }
};

export const adminBulkRefundTokens = async (req, res) => {
  try {
    const { auctionId } = req.body;
    if (!auctionId)
      return res
        .status(400)
        .json({ success: false, message: "Auction ID required" });

    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Auction must be completed to bulk refund",
      });
    }

    const settlement = await settleAuctionParticipantTokens(auction, {
      logWalletTxn,
    });

    res.json({
      success: true,
      message: `${settlement.settled} losing bidder settlements processed, ${settlement.skipped} already settled, ${settlement.failed} failed`,
    });
  } catch (error) {
    Logger.error("adminBulkRefundTokens error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to process bulk refund" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Payment Stats / Revenue Analytics
// ═══════════════════════════════════════════════════════════════════════════

export const getPaymentStats = async (req, res) => {
  try {
    const [tokenStats, escrowStats, totalRefunds, recentTransactions] =
      await Promise.all([
        TokenPayment.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              total: { $sum: "$amount" },
            },
          },
        ]),
        Escrow.aggregate([
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
              total: { $sum: "$amount" },
            },
          },
        ]),
        WalletTransaction.aggregate([
          {
            $match: {
              type: { $in: ["token_refund", "escrow_refund"] },
              status: "completed",
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              total: { $sum: "$amount" },
            },
          },
        ]),
        WalletTransaction.find()
          .sort({ createdAt: -1 })
          .limit(20)
          .populate("user", "name email")
          .lean(),
      ]);

    const tokenByStatus = {};
    tokenStats.forEach((t) => {
      tokenByStatus[t._id] = { count: t.count, total: t.total };
    });

    const escrowByStatus = {};
    escrowStats.forEach((e) => {
      escrowByStatus[e._id] = { count: e.count, total: e.total };
    });

    const overdueEscrows = await Escrow.countDocuments({
      status: "pending",
      paymentDeadline: { $lt: new Date() },
    });

    const totalCollected =
      (tokenByStatus.verified?.total || 0) +
      (escrowByStatus.in_escrow?.total || 0) +
      (escrowByStatus.released?.total || 0);

    res.json({
      success: true,
      data: {
        totalCollected,
        tokenPayments: tokenByStatus,
        escrows: escrowByStatus,
        overdueEscrows,
        refunds: totalRefunds[0] || { count: 0, total: 0 },
        recentTransactions,
      },
    });
  } catch (error) {
    Logger.error("getPaymentStats error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment stats" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUTH  –  User Wallet Transactions (Ledger)
// ═══════════════════════════════════════════════════════════════════════════

export const getMyWalletTransactions = async (req, res) => {
  try {
    await syncVerifiedTokenCreditsToWallet(req.user._id);
    const { page = 1, limit = 30 } = req.query;
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      WalletTransaction.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      WalletTransaction.countDocuments({ user: req.user._id }),
    ]);

    const summary = await WalletTransaction.aggregate([
      { $match: { user: req.user._id, status: "completed" } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const activeEscrows = await Escrow.countDocuments({
      buyer: req.user._id,
      status: { $in: ["pending", "in_escrow"] },
    });

    const summaryMap = {};
    summary.forEach((s) => {
      summaryMap[s._id] = { total: s.total, count: s.count };
    });

    res.json({
      success: true,
      data: {
        transactions,
        pagination: { page: Number(page), limit: Number(limit), total },
        summary: summaryMap,
        activeEscrows,
      },
    });
  } catch (error) {
    Logger.error("getMyWalletTransactions error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch transactions" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CRON  –  Auto-transition auctions based on time
// ═══════════════════════════════════════════════════════════════════════════

export const runAuctionLifecycle = async () => {
  try {
    const now = new Date();

    // Scheduled → Live
    const toGoLive = await Auction.find({
      status: "scheduled",
      startTime: { $lte: now },
    });
    for (const auction of toGoLive) {
      auction.status = "live";
      await auction.save();
      await AuctionCar.updateMany(
        { auction: auction._id, status: "approved" },
        { status: "live" },
      );
      Logger.info(`Auction ${auction._id} auto-transitioned to live`);
    }

    // Live → Completed (past end time) – delegate to engine
    await engineProcessExpiredAuctions({ logWalletTxn });

    // Overdue escrows: penalize (token confiscated, penalty recorded, admin notified)
    await engineProcessExpiredEscrows({ logWalletTxn });
  } catch (error) {
    Logger.error("runAuctionLifecycle error", error);
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Auction Settings (DB-backed, editable via UI)
// ═══════════════════════════════════════════════════════════════════════════

export const getAuctionSettingsHandler = async (req, res) => {
  try {
    const settings = await getAuctionSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    Logger.error("getAuctionSettings error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch auction settings" });
  }
};

export const updateAuctionSettingsHandler = async (req, res) => {
  try {
    const body = req.body || {};
    const updatable = [
      "minBidIncrement",
      "antiSnipeTriggerSeconds",
      "antiSnipeExtensionSeconds",
      "paymentWindowHours",
      "tokenDepositPercent",
      "maxProxyBid",
      "activeBidderWindowMinutes",
      "listingFee",
      "buyerFeePercent",
      "sellerCommissionPercent",
      "sellerSuccessFeePercent",
      "auctionDepositAmount",
      "auctionEntryFee",
      "dealerSubscriptionFee",
      "tokenDeposit",
      "inspectionFee",
      "dealerCommissionPercent",
      "dealerCommissionFixed",
    ];
    const update = {};
    updatable.forEach((k) => {
      if (body[k] !== undefined) update[k] = Number(body[k]);
    });
    if (Object.keys(update).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No valid fields to update" });
    }
    update.updatedBy = req.user._id;
    const doc = await AuctionSettings.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true },
    ).lean();
    invalidateAuctionSettingsCache();
    const { updatedBy, createdAt, updatedAt, __v, _id, ...data } = doc;
    res.json({ success: true, data, message: "Auction settings updated" });
  } catch (error) {
    Logger.error("updateAuctionSettings error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update auction settings" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// AUCTION  –  Extend (manual seller/admin), Stats (active bidders)
// ═══════════════════════════════════════════════════════════════════════════

export const extendAuction = async (req, res) => {
  try {
    const auctionId = req.params.id;
    const { minutes } = req.body;
    const allowedMinutes = [2, 5, 10];
    if (!minutes || !allowedMinutes.includes(Number(minutes))) {
      return res.status(400).json({
        success: false,
        message: "minutes required: 2, 5, or 10",
      });
    }
    const auction = await Auction.findById(auctionId);
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });
    if (auction.status !== "live") {
      return res.status(400).json({
        success: false,
        message: "Only live auctions can be extended",
      });
    }
    const isAdmin = req.user.role === "admin";
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admin can extend this auction",
      });
    }
    const previousEndTime = new Date(auction.endTime);
    const extensionMs = Number(minutes) * 60 * 1000;
    const newEndTime = new Date(previousEndTime.getTime() + extensionMs);
    auction.endTime = newEndTime;
    await auction.save();
    await AuctionExtensionLog.create({
      auction: auctionId,
      extendedBy: req.user._id,
      extensionMinutes: Number(minutes),
      reason: "admin_extend",
      previousEndTime,
      newEndTime,
    });
    const io = req.app.get("io");
    if (io) {
      io.to(`auction:${auctionId}`).emit("auction:extended", {
        auctionId,
        newEndTime,
        extendedBy: minutes,
      });
    }
    res.json({
      success: true,
      data: { endTime: newEndTime, extendedMinutes: Number(minutes) },
      message: `Auction extended by ${minutes} minutes`,
    });
  } catch (error) {
    Logger.error("extendAuction error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to extend auction" });
  }
};

export const getAuctionStats = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const settings = await getAuctionSettings();
    const windowMinutes = settings.activeBidderWindowMinutes || 15;
    const activeBidders = await engineGetActiveBidderCount(
      auctionId,
      windowMinutes,
    );
    const auction = await Auction.findById(auctionId)
      .select("totalBids totalCars totalSold status")
      .lean();
    if (!auction)
      return res
        .status(404)
        .json({ success: false, message: "Auction not found" });
    res.json({
      success: true,
      data: {
        activeBidders,
        totalBids: auction.totalBids || 0,
        totalCars: auction.totalCars || 0,
        totalSold: auction.totalSold || 0,
        status: auction.status,
      },
    });
  } catch (error) {
    Logger.error("getAuctionStats error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch auction stats" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// DEALER  –  Auction analytics
// ═══════════════════════════════════════════════════════════════════════════

export const getDealerAuctionAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const cars = await AuctionCar.find({ submittedBy: userId })
      .populate("auction", "title status")
      .lean();
    const submitted = cars.length;
    const pending = cars.filter((c) => c.status === "pending").length;
    const approved = cars.filter(
      (c) => c.status === "approved" || c.status === "live",
    ).length;
    const inAuction = cars.filter((c) => c.status === "live").length;
    const sold = cars.filter((c) => c.status === "sold").length;
    const unsold = cars.filter((c) => c.status === "unsold").length;
    const soldCars = cars.filter((c) => c.status === "sold" && c.finalPrice);
    const totalRevenue = soldCars.reduce(
      (sum, c) => sum + (c.finalPrice || 0),
      0,
    );
    const averageSalePrice = soldCars.length
      ? totalRevenue / soldCars.length
      : 0;
    res.json({
      success: true,
      data: {
        carsSubmitted: submitted,
        pendingApproval: pending,
        approved: approved,
        inAuction,
        sold,
        unsold,
        totalAuctionRevenue: totalRevenue,
        averageSalePrice,
      },
    });
  } catch (error) {
    Logger.error("getDealerAuctionAnalytics error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dealer analytics" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Auction extensions log, Risk (security events)
// ═══════════════════════════════════════════════════════════════════════════

export const adminGetAuctionExtensions = async (req, res) => {
  try {
    const { auctionId } = req.query;
    const filter = auctionId ? { auction: auctionId } : {};
    const list = await AuctionExtensionLog.find(filter)
      .populate("auction", "title status")
      .populate("extendedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();
    res.json({ success: true, data: list });
  } catch (error) {
    Logger.error("adminGetAuctionExtensions error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch extension log" });
  }
};

export const adminGetSecurityEvents = async (req, res) => {
  try {
    const { resolved, type, limit = 100 } = req.query;
    const filter = {};
    if (resolved !== undefined) filter.resolved = resolved === "true";
    if (type) filter.type = type;
    const list = await SecurityEvent.find(filter)
      .populate("userId", "name email")
      .populate("auctionId", "title")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();
    res.json({ success: true, data: list });
  } catch (error) {
    Logger.error("adminGetSecurityEvents error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch security events" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// INSPECTION BOOKINGS (auction-related; used by /inspections routes & admin)
// ═══════════════════════════════════════════════════════════════════════════

const INSPECTION_YARD = "Okara Auction Yard, Punjab";
const INSPECTION_TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

export const getInspectionTimeSlots = (req, res) => {
  res.json({ success: true, data: INSPECTION_TIME_SLOTS });
};

export const bookInspection = async (req, res) => {
  try {
    const { auctionCarId, carId, inspectionDate, timeSlot, notes } = req.body;
    const userId = req.user._id;
    const date = inspectionDate ? new Date(inspectionDate) : null;
    if (!date || !timeSlot || !INSPECTION_TIME_SLOTS.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message:
          "Valid inspectionDate and timeSlot required. Slots: " +
          INSPECTION_TIME_SLOTS.join(", "),
      });
    }
    const carRef = auctionCarId || carId;
    if (!carRef) {
      return res
        .status(400)
        .json({ success: false, message: "auctionCarId or carId required" });
    }
    const ac = await AuctionCar.findById(carRef)
      .populate("car")
      .populate("auction")
      .lean();
    const carIdForBooking = ac?.car?._id || ac?.car || carRef;
    const booking = await InspectionBooking.create({
      car: carIdForBooking,
      auctionCar: ac?._id || null,
      auction: ac?.auction?._id || ac?.auction || null,
      user: userId,
      inspectionDate: date,
      timeSlot,
      yardLocation: INSPECTION_YARD,
      status: "pending",
      notes: notes || "",
    });
    const populated = await InspectionBooking.findById(booking._id)
      .populate("car", "title make model year")
      .populate("auction", "title")
      .lean();
    res
      .status(201)
      .json({ success: true, data: populated, message: "Inspection booked" });
  } catch (error) {
    Logger.error("bookInspection error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to book inspection" });
  }
};

export const getMyInspectionBookings = async (req, res) => {
  try {
    const list = await InspectionBooking.find({ user: req.user._id })
      .populate("car", "title make model year images")
      .populate("auction", "title")
      .sort({ inspectionDate: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (error) {
    Logger.error("getMyInspectionBookings error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch bookings" });
  }
};

export const adminGetInspectionBookings = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (from || to) {
      filter.inspectionDate = {};
      if (from) filter.inspectionDate.$gte = new Date(from);
      if (to) filter.inspectionDate.$lte = new Date(to);
    }
    const list = await InspectionBooking.find(filter)
      .populate("user", "name email")
      .populate("car", "title make model year")
      .populate("auction", "title")
      .sort({ inspectionDate: 1, timeSlot: 1 })
      .lean();
    res.json({ success: true, data: list });
  } catch (error) {
    Logger.error("adminGetInspectionBookings error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch inspection bookings" });
  }
};

export const adminUpdateInspectionBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "completed", "cancelled"];
    if (!status || !allowed.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid status required" });
    }
    const booking = await InspectionBooking.findById(req.params.id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    booking.status = status;
    if (status === "confirmed") {
      booking.confirmedBy = req.user._id;
      booking.confirmedAt = new Date();
    }
    await booking.save();
    const populated = await InspectionBooking.findById(booking._id)
      .populate("user", "name email")
      .populate("car", "title make model year")
      .lean();
    res.json({ success: true, data: populated, message: "Booking updated" });
  } catch (error) {
    Logger.error("adminUpdateInspectionBooking error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update booking" });
  }
};
