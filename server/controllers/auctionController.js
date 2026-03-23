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
    const visibleStatuses =
      auction?.status === "live"
        ? ["approved", "live", "pending"]
        : ["approved", "live"];

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
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    // Client-side-friendly filtering (car fields are nested)
    let result = cars.filter((ac) => ac.car);

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
    const safeResult = result.map((item) => ({
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
    const minimumNextBid = engineGetMinNextBid(ac);

    res.json({
      success: true,
      data: {
        ...ac,
        currentBidder: null,
        minimumNextBid,
        totalBidders,
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
    const hasWallet = wallet && wallet.balance >= amount;
    const verified = !hasWallet
      ? await TokenPayment.findOne({ user: userId, status: "verified" })
      : null;
    if (!hasWallet && !verified) {
      return res.status(403).json({
        success: false,
        message: wallet
          ? `Insufficient wallet balance. You need PKR ${amount.toLocaleString()} but have PKR ${wallet.balance.toLocaleString()}`
          : "You must deposit funds to your wallet before bidding",
      });
    }

    // Check bid limit based on deposit tier (wallet users only)
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

    // Anti-sniping: extend end time if bid within window
    const prevWinningBid = await Bid.findOne({
      auctionCar: auctionCarId,
      isWinning: true,
    }).populate("bidder", "email name");
    const ext = extendAuctionIfNeeded(ac.auction);
    if (ext.extended && ext.newEndTime) {
      await Auction.findByIdAndUpdate(ac.auction._id, {
        endTime: ext.newEndTime,
      });
      ac.auction.endTime = ext.newEndTime;
      const io = req.app.get("io");
      if (io) {
        io.to(`auction:${ac.auction._id}`).emit("auction-status-change", {
          auctionId: ac.auction._id,
          status: "live",
          endTime: ext.newEndTime,
        });
        io.to(`auction:${ac.auction._id}`).emit("auction:extended", {
          auctionId: ac.auction._id,
          newEndTime: ext.newEndTime,
        });
      }
    }

    // Refund previous winning bidder's wallet hold
    if (prevWinningBid && prevWinningBid.bidder) {
      const prevWallet = await Wallet.findOne({ user: prevWinningBid.bidder });
      if (prevWallet) {
        prevWallet.balance += prevWinningBid.amount;
        prevWallet.totalBidHeld = Math.max(
          0,
          prevWallet.totalBidHeld - prevWinningBid.amount,
        );
        prevWallet.lastTransactionAt = new Date();
        await prevWallet.save();
        await logWalletTxn({
          user: prevWinningBid.bidder,
          type: "bid_refund",
          amount: prevWinningBid.amount,
          reference: prevWinningBid._id,
          referenceModel: "Bid",
          description: "Outbid refund for auction car",
        });
      }
    }

    await Bid.updateMany(
      { auctionCar: auctionCarId, isWinning: true },
      { isWinning: false },
    );

    if (hasWallet) {
      wallet.balance -= amount;
      wallet.totalBidHeld += amount;
      wallet.lastTransactionAt = new Date();
      await wallet.save();
      await logWalletTxn({
        user: userId,
        type: "bid_hold",
        amount: -amount,
        reference: null,
        referenceModel: "Bid",
        description: `Bid placed – PKR ${amount.toLocaleString()}`,
      });
    }

    const bid = await Bid.create({
      auction: ac.auction._id,
      auctionCar: auctionCarId,
      bidder: userId,
      bidderName: req.user.name || "Bidder",
      amount,
      bidType: "online",
      isWinning: true,
    });

    ac.currentBid = amount;
    ac.currentBidder = userId;
    ac.bidCount += 1;
    if (ac.status === "approved") ac.status = "live";
    await ac.save();
    await Auction.findByIdAndUpdate(ac.auction._id, { $inc: { totalBids: 1 } });

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
    const hasWallet = wallet && wallet.balance >= buyNowPrice;
    const verified = !hasWallet
      ? await TokenPayment.findOne({ user: userId, status: "verified" })
      : null;
    if (!hasWallet && !verified)
      return res.status(403).json({
        success: false,
        message: hasWallet
          ? `Insufficient balance. Buy now price is PKR ${buyNowPrice.toLocaleString()}.`
          : "You must deposit funds before using buy now",
      });

    // Refund any current winning bidder
    const prevWin = await Bid.findOne({
      auctionCar: auctionCarId,
      isWinning: true,
    });
    if (prevWin && prevWin.bidder) {
      const prevWallet = await Wallet.findOne({ user: prevWin.bidder });
      if (prevWallet) {
        prevWallet.balance += prevWin.amount;
        prevWallet.totalBidHeld = Math.max(
          0,
          prevWallet.totalBidHeld - prevWin.amount,
        );
        prevWallet.lastTransactionAt = new Date();
        await prevWallet.save();
        await logWalletTxn({
          user: prevWin.bidder,
          type: "bid_refund",
          amount: prevWin.amount,
          reference: prevWin._id,
          referenceModel: "Bid",
          description: "Refund – lot sold via buy now",
        });
      }
    }
    await Bid.updateMany(
      { auctionCar: auctionCarId, isWinning: true },
      { isWinning: false },
    );

    if (hasWallet) {
      wallet.balance -= buyNowPrice;
      wallet.totalBidHeld += buyNowPrice;
      wallet.lastTransactionAt = new Date();
      await wallet.save();
      await logWalletTxn({
        user: userId,
        type: "bid_hold",
        amount: -buyNowPrice,
        reference: null,
        referenceModel: "Bid",
        description: `Buy now – PKR ${buyNowPrice.toLocaleString()}`,
      });
    }

    const bid = await Bid.create({
      auction: ac.auction._id,
      auctionCar: auctionCarId,
      bidder: userId,
      bidderName: req.user.name || "Bidder",
      amount: buyNowPrice,
      bidType: "online",
      isWinning: true,
    });

    ac.status = "sold";
    ac.winner = userId;
    ac.finalPrice = buyNowPrice;
    ac.soldAt = new Date();
    ac.currentBid = buyNowPrice;
    ac.currentBidder = userId;
    await ac.save();

    await ProxyBid.updateMany(
      { auctionCar: auctionCarId },
      { isActive: false },
    );

    const winnerWallet = await Wallet.findOne({ user: userId });
    const walletDeduction = winnerWallet ? buyNowPrice : 10000;
    const amountDue = Math.max(0, buyNowPrice - walletDeduction);
    const escrow = await createEscrowForWinner(
      auctionCarId,
      userId,
      buyNowPrice,
      walletDeduction,
      amountDue,
    );

    if (winnerWallet) {
      winnerWallet.totalBidHeld = Math.max(
        0,
        winnerWallet.totalBidHeld - buyNowPrice,
      );
      await winnerWallet.save();
      await logWalletTxn({
        user: userId,
        type: "escrow_payment",
        amount: -buyNowPrice,
        reference: escrow._id,
        referenceModel: "Escrow",
        description: "Winning buy now moved to escrow",
      });
    } else {
      await logWalletTxn({
        user: userId,
        type: "token_deposit",
        amount: -10000,
        reference: escrow._id,
        referenceModel: "Escrow",
        description: "Token deposit applied to buy now",
      });
    }

    await Auction.findByIdAndUpdate(ac.auction._id, { $inc: { totalSold: 1 } });

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
    const { paymentMethod, transactionId } = req.body;
    if (!paymentMethod || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Payment method and transaction ID required",
      });
    }

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

    const payment = await TokenPayment.create({
      user: req.user._id,
      paymentMethod,
      transactionId,
    });

    res.status(201).json({
      success: true,
      data: payment,
      message: "Payment submitted for verification",
    });
  } catch (error) {
    Logger.error("submitTokenPayment error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to submit payment" });
  }
};

export const getMyTokenPayments = async (req, res) => {
  try {
    const payments = await TokenPayment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    const verified = payments.find((p) => p.status === "verified");
    res.json({
      success: true,
      data: {
        payments,
        tokenBalance: verified ? verified.amount : 0,
        hasVerifiedToken: !!verified,
      },
    });
  } catch (error) {
    Logger.error("getMyTokenPayments error", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payments" });
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

    // Parse geoLocation from JSON string if it's a string (from FormData)
    let parsedGeoLocation = geoLocation;
    if (typeof geoLocation === "string") {
      try {
        parsedGeoLocation = JSON.parse(geoLocation);
      } catch (e) {
        console.error("Failed to parse geoLocation:", e);
        parsedGeoLocation = {
          type: "Point",
          coordinates: [67.0011, 24.8607], // Default coordinates
        };
      }
    }
    if (!parsedGeoLocation || !Array.isArray(parsedGeoLocation?.coordinates)) {
      parsedGeoLocation = {
        type: "Point",
        coordinates: [67.0011, 24.8607],
      };
    }

    // Hybrid model: inspection report PDF is mandatory for every auction submission
    const inspectionReportFile = req.files?.inspectionReport?.[0];
    if (!inspectionReportFile || !inspectionReportFile.buffer) {
      return res.status(400).json({
        success: false,
        message:
          "Inspection report (PDF) is required. Please upload the vehicle inspection report.",
      });
    }

    // Handle two scenarios:
    // 1. Submit existing car to auction (carId provided)
    // 2. Create new car and submit to auction (no carId, full car data provided)

    let car;

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
      const images = req.files?.images || [];
      const totalBytes = images.reduce(
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
      if (images.length > 0) {
        try {
          imageUrls = await uploadListingImagesToCloudinary(images, {
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
        condition: condition || "Used",
        price: startingBid || price || 0,
        colorExterior: colorExterior || color || "Not specified",
        colorInterior: colorInterior || "Not specified",
        fuelType: fuelType || engine_type || "Petrol",
        engineCapacity,
        transmission: transmission || "Manual",
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
        isApproved: false,
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
      Logger.error("Inspection report PDF upload failed", err);
      return res.status(503).json({
        success: false,
        message: "Failed to upload inspection report. Try again.",
      });
    }
    const damageFiles = req.files?.damageImages || [];
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
    const docFiles = req.files?.documents || [];
    if (docFiles.length > 0) {
      try {
        documentUrls = await Promise.all(
          docFiles.map((f) =>
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

    const ac = await AuctionCar.create({
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
      { auction: auction._id, status: { $in: ["approved", "pending"] } },
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
        const walletDeduction = winnerWallet ? topBid.amount : 10000;
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
      message: `Auction ended. ${totalSold} cars sold.`,
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

    if (action === "verify") {
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
      message: `Payment ${action === "verify" ? "verified" : "rejected"}`,
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
    const { auctionId, carId, startingBid, reservePrice, buyNowPrice } =
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

    const auctionCar = await AuctionCar.create({
      auction: auctionId,
      car: carId,
      submittedBy: req.user._id,
      startingBid: startingBid || car.price || 500000,
      reservePrice: reservePrice || 0,
      buyNowPrice: buyNowPrice || 0,
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

// ═══════════════════════════════════════════════════════════════════════════
// Helpers – Wallet Ledger
// ═══════════════════════════════════════════════════════════════════════════

async function getRunningBalance(userId) {
  const last = await WalletTransaction.findOne({ user: userId })
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
}) {
  const balance = (await getRunningBalance(user)) + amount;
  return WalletTransaction.create({
    user,
    type,
    amount,
    balance,
    reference,
    referenceModel,
    description,
    status,
  });
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
        const dealerWallet = await Wallet.findOne({ user: dealerId });
        if (dealerWallet) {
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
      }
      if (sellerId && sellerAmount > 0) {
        const sellerWallet = await Wallet.findOne({ user: sellerId });
        if (sellerWallet) {
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
    if (!["verified", "pending"].includes(payment.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot refund a ${payment.status} payment`,
      });
    }

    payment.status = "refunded";
    await payment.save();

    await logWalletTxn({
      user: payment.user._id || payment.user,
      type: "token_refund",
      amount: payment.amount,
      reference: payment._id,
      referenceModel: "TokenPayment",
      description: "Token deposit refunded",
    });

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

    const winnerIds = (
      await AuctionCar.find({ auction: auctionId, status: "sold" })
        .select("winner")
        .lean()
    )
      .map((ac) => ac.winner?.toString())
      .filter(Boolean);

    const toRefund = await TokenPayment.find({
      status: "verified",
      user: { $nin: winnerIds.map((id) => id) },
    });

    let refunded = 0;
    for (const payment of toRefund) {
      payment.status = "refunded";
      await payment.save();
      await logWalletTxn({
        user: payment.user,
        type: "token_refund",
        amount: payment.amount,
        reference: payment._id,
        referenceModel: "TokenPayment",
        description: `Bulk refund – auction "${auction.title}" completed`,
      });
      await Notification.create({
        title: "Token Deposit Refunded",
        message: `Your token deposit of PKR ${payment.amount.toLocaleString()} has been refunded (auction ended).`,
        type: "success",
        recipient: payment.user,
        actionUrl: "/auctions/transactions",
      });
      refunded++;
    }

    res.json({ success: true, message: `${refunded} token deposits refunded` });
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
        { auction: auction._id, status: { $in: ["approved", "pending"] } },
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
    const isDealer =
      req.user.role === "dealer" || req.user.dealerInfo?.verified;
    const submittedCars = await AuctionCar.find({
      auction: auctionId,
      submittedBy: req.user._id,
    }).limit(1);
    const isSeller = submittedCars.length > 0;
    if (!isAdmin && !isSeller) {
      return res.status(403).json({
        success: false,
        message: "Only admin or the seller can extend this auction",
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
      reason: isAdmin ? "admin_extend" : "manual_seller",
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
