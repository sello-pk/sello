import {
  Auction,
  AuctionCar,
  Bid,
  ProxyBid,
  TokenPayment,
  AuctionWatchlist,
  Escrow,
  WalletTransaction,
} from "../models/auctionModel.js";
import { Wallet, PlatformSettings } from "../models/paymentModel.js";
import Car from "../models/carModel.js";
import Notification from "../models/notificationModel.js";
import Logger from "../utils/logger.js";
import User from "../models/userModel.js";
import { evaluateAuctionBidAccess } from "../utils/auctionAccess.js";

const MIN_BID_INCREMENT = 50000; // PKR 50,000

const sanitizeBidsForPublic = (bids = []) => {
  const map = new Map();
  return bids.map((bid) => {
    if (bid?.bidType === "offline") {
      return { ...bid, bidder: null, bidderName: bid.bidderName || "Floor Bid" };
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
    res.status(500).json({ success: false, message: "Failed to fetch auctions" });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id).lean();
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });
    res.json({ success: true, data: auction });
  } catch (error) {
    Logger.error("getAuctionById error", error);
    res.status(500).json({ success: false, message: "Failed to fetch auction" });
  }
};

export const getLiveAuction = async (req, res) => {
  try {
    const auction = await Auction.findOne({ status: "live" }).sort({ startTime: -1 }).lean();
    res.json({ success: true, data: auction || null });
  } catch (error) {
    Logger.error("getLiveAuction error", error);
    res.status(500).json({ success: false, message: "Failed to fetch live auction" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC  –  Auction Cars
// ═══════════════════════════════════════════════════════════════════════════

export const getAuctionCars = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const {
      search, make, condition, transmission, fuelType,
      yearMin, yearMax, priceMin, priceMax, sortBy = "ending_soon",
      page = 1, limit = 30,
    } = req.query;

    const filter = { auction: auctionId, status: { $in: ["approved", "live"] } };

    const cars = await AuctionCar.find(filter)
      .populate({
        path: "car",
        select: "title make model year condition mileage fuelType transmission images colorExterior registrationCity vehicleType price",
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
    if (make && make !== "all") result = result.filter((ac) => ac.car.make === make);
    if (condition && condition !== "all") result = result.filter((ac) => ac.car.condition?.toLowerCase() === condition.toLowerCase());
    if (transmission && transmission !== "all") result = result.filter((ac) => ac.car.transmission?.toLowerCase() === transmission.toLowerCase());
    if (fuelType && fuelType !== "all") result = result.filter((ac) => ac.car.fuelType?.toLowerCase() === fuelType.toLowerCase());
    if (yearMin) result = result.filter((ac) => ac.car.year >= Number(yearMin));
    if (yearMax) result = result.filter((ac) => ac.car.year <= Number(yearMax));
    if (priceMin) result = result.filter((ac) => (ac.currentBid || ac.startingBid) >= Number(priceMin));
    if (priceMax) result = result.filter((ac) => (ac.currentBid || ac.startingBid) <= Number(priceMax));

    const sortFns = {
      price_low: (a, b) => (a.currentBid || a.startingBid) - (b.currentBid || b.startingBid),
      price_high: (a, b) => (b.currentBid || b.startingBid) - (a.currentBid || a.startingBid),
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
    res.status(500).json({ success: false, message: "Failed to fetch auction cars" });
  }
};

export const getAuctionCarDetail = async (req, res) => {
  try {
    const ac = await AuctionCar.findById(req.params.id)
      .populate({
        path: "car",
        select: "title make model variant year condition mileage fuelType transmission images colorExterior colorInterior registrationCity engineCapacity features description vehicleType price",
      })
      .populate("winner", "name")
      .populate("auction", "title startTime endTime status location")
      .lean();

    if (!ac) return res.status(404).json({ success: false, message: "Auction car not found" });

    const bids = await Bid.find({ auctionCar: ac._id })
      .sort({ amount: -1 })
      .limit(20)
      .populate("bidder", "name")
      .lean();

    res.json({
      success: true,
      data: {
        ...ac,
        currentBidder: null,
        bids: sanitizeBidsForPublic(bids),
      },
    });
  } catch (error) {
    Logger.error("getAuctionCarDetail error", error);
    res.status(500).json({ success: false, message: "Failed to fetch car details" });
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
    if (!ac) return res.status(404).json({ success: false, message: "Auction car not found" });
    if (ac.auction.status !== "live") return res.status(400).json({ success: false, message: "Auction is not live" });
    if (!["approved", "live"].includes(ac.status)) return res.status(400).json({ success: false, message: "This car is not accepting bids" });

    // Check wallet OR legacy token for authorization
    const wallet = await Wallet.findOne({ user: userId });
    const hasWallet = wallet && wallet.balance >= amount;
    const verified = !hasWallet ? await TokenPayment.findOne({ user: userId, status: "verified" }) : null;
    if (!hasWallet && !verified) {
      return res.status(403).json({ success: false, message: wallet ? `Insufficient wallet balance. You need PKR ${amount.toLocaleString()} but have PKR ${wallet.balance.toLocaleString()}` : "You must deposit funds to your wallet before bidding" });
    }

    // Check bid limit based on deposit tier (wallet users only)
    if (hasWallet) {
      const settings = await PlatformSettings.findOne();
      if (settings?.depositTiers?.length > 0) {
        const sorted = [...settings.depositTiers].sort((a, b) => b.minDeposit - a.minDeposit);
        const tier = sorted.find((t) => wallet.totalDeposited >= t.minDeposit);
        if (tier && amount > tier.maxBidLimit) {
          return res.status(400).json({ success: false, message: `Your deposit tier (${tier.label}) allows bids up to PKR ${tier.maxBidLimit.toLocaleString()}. Deposit more to increase your limit.` });
        }
      }
    }

    const currentHigh = ac.currentBid || ac.startingBid;
    if (amount < currentHigh + MIN_BID_INCREMENT) {
      return res.status(400).json({ success: false, message: `Minimum bid is PKR ${(currentHigh + MIN_BID_INCREMENT).toLocaleString()}` });
    }

    // Refund previous winning bidder's wallet hold
    const prevWinningBid = await Bid.findOne({ auctionCar: auctionCarId, isWinning: true });
    if (prevWinningBid && prevWinningBid.bidder) {
      const prevWallet = await Wallet.findOne({ user: prevWinningBid.bidder });
      if (prevWallet) {
        prevWallet.balance += prevWinningBid.amount;
        prevWallet.totalBidHeld = Math.max(0, prevWallet.totalBidHeld - prevWinningBid.amount);
        prevWallet.lastTransactionAt = new Date();
        await prevWallet.save();
        await logWalletTxn({
          user: prevWinningBid.bidder,
          type: "bid_refund",
          amount: prevWinningBid.amount,
          reference: prevWinningBid._id,
          referenceModel: "Bid",
          description: `Outbid refund for ${ac.car ? "" : ""}auction car`,
        });
      }
    }

    // Clear previous winning flag
    await Bid.updateMany({ auctionCar: auctionCarId, isWinning: true }, { isWinning: false });

    // Deduct from wallet
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

    // Trigger proxy bids
    await processProxyBids(auctionCarId, amount, userId, ac.auction._id, req);

    // Real-time broadcast
    const io = req.app.get("io");
    if (io) {
      const populatedBid = await Bid.findById(bid._id).populate("bidder", "name").lean();
      io.to(`auction:${ac.auction._id}`).emit("new-bid", {
        auctionCarId,
        bid: populatedBid,
        currentBid: ac.currentBid,
        bidCount: ac.bidCount,
      });
    }

    res.json({ success: true, data: bid, message: "Bid placed successfully" });
  } catch (error) {
    Logger.error("placeBid error", error);
    res.status(500).json({ success: false, message: "Failed to place bid" });
  }
};

async function processProxyBids(auctionCarId, currentAmount, excludeUserId, auctionId, req) {
  try {
    const proxies = await ProxyBid.find({
      auctionCar: auctionCarId,
      isActive: true,
      bidder: { $ne: excludeUserId },
      maxAmount: { $gt: currentAmount },
    }).sort({ maxAmount: -1 });

    if (proxies.length === 0) return;

    let top = null;
    let proxyAmount = 0;

    // Keep proxy autobid behavior aligned with API-level access policy.
    for (const proxy of proxies) {
      const proxyUser = await User.findById(proxy.bidder).select(
        "role dealerInfo auctionCapabilities"
      );
      const access = evaluateAuctionBidAccess(proxyUser);
      if (!access.allowed) {
        proxy.isActive = false;
        await proxy.save();
        continue;
      }

      const candidateAmount = Math.min(currentAmount + MIN_BID_INCREMENT, proxy.maxAmount);
      const proxyWallet = await Wallet.findOne({ user: proxy.bidder });
      if (proxyWallet && proxyWallet.balance < candidateAmount) {
        proxy.isActive = false;
        await proxy.save();
        continue;
      }

      top = proxy;
      proxyAmount = candidateAmount;
      break;
    }

    if (!top) return;

    // Check proxy bidder's wallet
    const proxyWallet = await Wallet.findOne({ user: top.bidder });
    if (proxyWallet && proxyWallet.balance < proxyAmount) {
      top.isActive = false;
      await top.save();
      return;
    }

    // Refund previous winning bidder
    const prevWin = await Bid.findOne({ auctionCar: auctionCarId, isWinning: true });
    if (prevWin && prevWin.bidder) {
      const prevW = await Wallet.findOne({ user: prevWin.bidder });
      if (prevW) {
        prevW.balance += prevWin.amount;
        prevW.totalBidHeld = Math.max(0, prevW.totalBidHeld - prevWin.amount);
        prevW.lastTransactionAt = new Date();
        await prevW.save();
        await logWalletTxn({
          user: prevWin.bidder, type: "bid_refund", amount: prevWin.amount,
          reference: prevWin._id, referenceModel: "Bid", description: "Outbid refund (proxy)",
        });
      }
    }

    await Bid.updateMany({ auctionCar: auctionCarId, isWinning: true }, { isWinning: false });

    // Deduct from proxy bidder's wallet
    if (proxyWallet) {
      proxyWallet.balance -= proxyAmount;
      proxyWallet.totalBidHeld += proxyAmount;
      proxyWallet.lastTransactionAt = new Date();
      await proxyWallet.save();
      await logWalletTxn({
        user: top.bidder, type: "bid_hold", amount: -proxyAmount,
        reference: null, referenceModel: "Bid", description: `Proxy bid – PKR ${proxyAmount.toLocaleString()}`,
      });
    }

    const bid = await Bid.create({
      auction: auctionId,
      auctionCar: auctionCarId,
      bidder: top.bidder,
      bidderName: "Proxy Bid",
      amount: proxyAmount,
      bidType: "online",
      isProxy: true,
      isWinning: true,
    });

    await AuctionCar.findByIdAndUpdate(auctionCarId, {
      currentBid: proxyAmount,
      currentBidder: top.bidder,
      $inc: { bidCount: 1 },
    });
    await Auction.findByIdAndUpdate(auctionId, { $inc: { totalBids: 1 } });

    if (proxyAmount >= top.maxAmount) {
      top.isActive = false;
      await top.save();
    }

    const io = req.app.get("io");
    if (io) {
      const populatedBid = await Bid.findById(bid._id).populate("bidder", "name").lean();
      io.to(`auction:${auctionId}`).emit("new-bid", {
        auctionCarId,
        bid: populatedBid,
        currentBid: proxyAmount,
      });
    }
  } catch (err) {
    Logger.error("processProxyBids error", err);
  }
}

export const setProxyBid = async (req, res) => {
  try {
    const { auctionCarId, maxAmount } = req.body;
    const userId = req.user._id;

    const ac = await AuctionCar.findById(auctionCarId).populate("auction");
    if (!ac || ac.auction.status !== "live") return res.status(400).json({ success: false, message: "Auction not live" });

    const currentHigh = ac.currentBid || ac.startingBid;
    if (maxAmount <= currentHigh) return res.status(400).json({ success: false, message: "Max amount must exceed current bid" });

    const proxy = await ProxyBid.findOneAndUpdate(
      { auctionCar: auctionCarId, bidder: userId },
      { maxAmount, isActive: true },
      { upsert: true, new: true }
    );

    res.json({ success: true, data: proxy, message: "Proxy bid set" });
  } catch (error) {
    Logger.error("setProxyBid error", error);
    res.status(500).json({ success: false, message: "Failed to set proxy bid" });
  }
};

// Admin offline bid
export const placeOfflineBid = async (req, res) => {
  try {
    const { auctionCarId, amount, bidderName = "Floor Bid" } = req.body;

    const ac = await AuctionCar.findById(auctionCarId).populate("auction");
    if (!ac || ac.auction.status !== "live") return res.status(400).json({ success: false, message: "Auction not live" });

    const currentHigh = ac.currentBid || ac.startingBid;
    if (amount <= currentHigh) return res.status(400).json({ success: false, message: "Amount must exceed current bid" });

    await Bid.updateMany({ auctionCar: auctionCarId, isWinning: true }, { isWinning: false });

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
    res.status(500).json({ success: false, message: "Failed to place offline bid" });
  }
};

export const getBidsForCar = async (req, res) => {
  try {
    const bids = await Bid.find({ auctionCar: req.params.auctionCarId })
      .sort({ amount: -1 })
      .limit(50)
      .populate("bidder", "name")
      .lean();

    res.json({ success: true, data: sanitizeBidsForPublic(bids) });
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
      return res.status(400).json({ success: false, message: "Payment method and transaction ID required" });
    }

    const existing = await TokenPayment.findOne({ user: req.user._id, status: { $in: ["pending", "verified"] } });
    if (existing) {
      return res.status(400).json({ success: false, message: existing.status === "verified" ? "You already have a verified token" : "Your previous payment is still pending verification" });
    }

    const payment = await TokenPayment.create({
      user: req.user._id,
      paymentMethod,
      transactionId,
    });

    res.status(201).json({ success: true, data: payment, message: "Payment submitted for verification" });
  } catch (error) {
    Logger.error("submitTokenPayment error", error);
    res.status(500).json({ success: false, message: "Failed to submit payment" });
  }
};

export const getMyTokenPayments = async (req, res) => {
  try {
    const payments = await TokenPayment.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    const verified = payments.find((p) => p.status === "verified");
    res.json({ success: true, data: { payments, tokenBalance: verified ? verified.amount : 0, hasVerifiedToken: !!verified } });
  } catch (error) {
    Logger.error("getMyTokenPayments error", error);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
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
      { upsert: true, new: true }
    );
    res.json({ success: true, data: item });
  } catch (error) {
    Logger.error("addToWatchlist error", error);
    res.status(500).json({ success: false, message: "Failed to add to watchlist" });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    await AuctionWatchlist.findOneAndDelete({ user: req.user._id, auctionCar: req.params.auctionCarId });
    res.json({ success: true, message: "Removed from watchlist" });
  } catch (error) {
    Logger.error("removeFromWatchlist error", error);
    res.status(500).json({ success: false, message: "Failed to remove from watchlist" });
  }
};

export const getMyWatchlist = async (req, res) => {
  try {
    const items = await AuctionWatchlist.find({ user: req.user._id })
      .populate({
        path: "auctionCar",
        populate: [
          { path: "car", select: "make model year mileage condition images fuelType transmission" },
          { path: "auction", select: "title endTime status" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: items.filter((i) => i.auctionCar) });
  } catch (error) {
    Logger.error("getMyWatchlist error", error);
    res.status(500).json({ success: false, message: "Failed to fetch watchlist" });
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
    res.status(500).json({ success: false, message: "Failed to fetch won auctions" });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate({ path: "auctionCar", populate: [{ path: "car", select: "make model year images mileage" }, { path: "auction", select: "title status" }] })
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
      .populate({ path: "auctionCar", populate: { path: "car", select: "make model year images" } })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: escrows });
  } catch (error) {
    Logger.error("getMyEscrows error", error);
    res.status(500).json({ success: false, message: "Failed to fetch escrows" });
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
      return res
        .status(400)
        .json({ success: false, message: "Auction is not finalized for this car" });
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

    const { auctionId, carId, startingBid, reservePrice, buyNowPrice } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction || !["draft", "scheduled"].includes(auction.status)) {
      return res.status(400).json({ success: false, message: "Auction not accepting submissions" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: "Car not found" });
    if (car.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "You can only submit your own cars" });
    }

    const existing = await AuctionCar.findOne({ auction: auctionId, car: carId });
    if (existing) return res.status(400).json({ success: false, message: "Car already submitted to this auction" });

    const ac = await AuctionCar.create({
      auction: auctionId,
      car: carId,
      startingBid: startingBid || car.price,
      reservePrice: reservePrice || null,
      buyNowPrice: buyNowPrice || null,
      submittedBy: req.user._id,
      status: req.user.role === "admin" ? "approved" : "pending",
    });

    await Auction.findByIdAndUpdate(auctionId, { $inc: { totalCars: 1 } });

    res.status(201).json({ success: true, data: ac, message: "Car submitted to auction" });
  } catch (error) {
    Logger.error("submitCarToAuction error", error);
    res.status(500).json({ success: false, message: "Failed to submit car" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Auction CRUD
// ═══════════════════════════════════════════════════════════════════════════

export const createAuction = async (req, res) => {
  try {
    const { title, description, startTime, endTime, location } = req.body;
    if (!title || !startTime || !endTime) return res.status(400).json({ success: false, message: "Title, start time and end time are required" });

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
    res.status(500).json({ success: false, message: "Failed to create auction" });
  }
};

export const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });
    res.json({ success: true, data: auction });
  } catch (error) {
    Logger.error("updateAuction error", error);
    res.status(500).json({ success: false, message: "Failed to update auction" });
  }
};

export const goLive = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });
    if (!["draft", "scheduled"].includes(auction.status)) {
      return res.status(400).json({ success: false, message: `Cannot go live from ${auction.status} status` });
    }

    auction.status = "live";
    auction.startTime = new Date();
    await auction.save();

    await AuctionCar.updateMany({ auction: auction._id, status: "approved" }, { status: "live" });

    const io = req.app.get("io");
    if (io) io.emit("auction-status-change", { auctionId: auction._id, status: "live" });

    res.json({ success: true, data: auction, message: "Auction is now live" });
  } catch (error) {
    Logger.error("goLive error", error);
    res.status(500).json({ success: false, message: "Failed to go live" });
  }
};

export const endAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction || auction.status !== "live") return res.status(400).json({ success: false, message: "Auction is not live" });

    auction.status = "completed";
    auction.endTime = new Date();
    await auction.save();

    // Determine winners for each car
    const auctionCars = await AuctionCar.find({ auction: auction._id, status: "live" });
    let totalSold = 0;

    for (const ac of auctionCars) {
      const topBid = await Bid.findOne({ auctionCar: ac._id, isWinning: true }).sort({ amount: -1 });

      if (topBid && topBid.bidder && (!ac.reservePrice || topBid.amount >= ac.reservePrice)) {
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
          winnerWallet.totalBidHeld = Math.max(0, winnerWallet.totalBidHeld - topBid.amount);
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
        }
      } else {
        ac.status = "unsold";
        // Refund last winning bidder's held amount if car goes unsold
        if (topBid && topBid.bidder) {
          const refundWallet = await Wallet.findOne({ user: topBid.bidder });
          if (refundWallet) {
            refundWallet.balance += topBid.amount;
            refundWallet.totalBidHeld = Math.max(0, refundWallet.totalBidHeld - topBid.amount);
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
    if (io) io.emit("auction-status-change", { auctionId: auction._id, status: "completed" });

    res.json({ success: true, data: auction, message: `Auction ended. ${totalSold} cars sold.` });
  } catch (error) {
    Logger.error("endAuction error", error);
    res.status(500).json({ success: false, message: "Failed to end auction" });
  }
};

export const cancelAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);
    if (!auction) return res.status(404).json({ success: false, message: "Auction not found" });

    auction.status = "cancelled";
    await auction.save();

    await AuctionCar.updateMany(
      { auction: auction._id, status: { $in: ["pending", "approved", "live"] } },
      { status: "withdrawn" }
    );

    const io = req.app.get("io");
    if (io) io.emit("auction-status-change", { auctionId: auction._id, status: "cancelled" });

    res.json({ success: true, data: auction, message: "Auction cancelled" });
  } catch (error) {
    Logger.error("cancelAuction error", error);
    res.status(500).json({ success: false, message: "Failed to cancel auction" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Auction Car Management
// ═══════════════════════════════════════════════════════════════════════════

export const approveAuctionCar = async (req, res) => {
  try {
    const ac = await AuctionCar.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true })
      .populate("car", "make model year");
    if (!ac) return res.status(404).json({ success: false, message: "Auction car not found" });
    res.json({ success: true, data: ac, message: "Car approved" });
  } catch (error) {
    Logger.error("approveAuctionCar error", error);
    res.status(500).json({ success: false, message: "Failed to approve car" });
  }
};

export const rejectAuctionCar = async (req, res) => {
  try {
    const ac = await AuctionCar.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!ac) return res.status(404).json({ success: false, message: "Auction car not found" });
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
      { new: true }
    );
    if (!ac) return res.status(404).json({ success: false, message: "Auction car not found" });
    res.json({ success: true, data: ac, message: "Inspection updated" });
  } catch (error) {
    Logger.error("updateInspection error", error);
    res.status(500).json({ success: false, message: "Failed to update inspection" });
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
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
};

export const verifyTokenPayment = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const payment = await TokenPayment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

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
      title: action === "verify" ? "Token Payment Verified" : "Token Payment Rejected",
      message: action === "verify" ? "Your token deposit has been verified. You can now place bids!" : `Your token payment was rejected. ${rejectionReason || ""}`,
      type: action === "verify" ? "success" : "error",
      recipient: payment.user,
      actionUrl: "/auctions",
    });

    res.json({ success: true, data: payment, message: `Payment ${action === "verify" ? "verified" : "rejected"}` });
  } catch (error) {
    Logger.error("verifyTokenPayment error", error);
    res.status(500).json({ success: false, message: "Failed to process payment" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Dashboard Stats
// ═══════════════════════════════════════════════════════════════════════════

export const getAuctionDashboard = async (req, res) => {
  try {
    const [totalAuctions, liveAuctions, totalCars, totalBids, totalUsers, pendingPayments] = await Promise.all([
      Auction.countDocuments(),
      Auction.countDocuments({ status: "live" }),
      AuctionCar.countDocuments(),
      Bid.countDocuments(),
      TokenPayment.countDocuments({ status: "verified" }),
      TokenPayment.countDocuments({ status: "pending" }),
    ]);

    const recentAuctions = await Auction.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentBids = await Bid.find().sort({ createdAt: -1 }).limit(10).populate("bidder", "name").lean();

    res.json({
      success: true,
      data: {
        stats: { totalAuctions, liveAuctions, totalCars, totalBids, totalUsers, pendingPayments },
        recentAuctions,
        recentBids,
      },
    });
  } catch (error) {
    Logger.error("getAuctionDashboard error", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard" });
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
    res.status(500).json({ success: false, message: "Failed to fetch auction cars" });
  }
};

export const adminAddCarToAuction = async (req, res) => {
  try {
    const { auctionId, carId, startingBid, reservePrice, buyNowPrice } = req.body;

    const auction = await Auction.findById(auctionId);
    if (!auction || !["draft", "scheduled", "live"].includes(auction.status)) {
      return res.status(400).json({ success: false, message: "Auction not accepting cars" });
    }

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: "Car not found" });

    const existing = await AuctionCar.findOne({ car: carId, auction: auctionId });
    if (existing) return res.status(400).json({ success: false, message: "Car already in this auction" });

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

async function logWalletTxn({ user, type, amount, reference, referenceModel, description, status = "completed" }) {
  const balance = (await getRunningBalance(user)) + amount;
  return WalletTransaction.create({ user, type, amount, balance, reference, referenceModel, description, status });
}

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Escrow Management
// ═══════════════════════════════════════════════════════════════════════════

const ESCROW_TRANSITIONS = {
  pending: ["in_escrow", "disputed", "refunded"],
  in_escrow: ["released", "disputed", "refunded"],
  disputed: ["in_escrow", "released", "refunded"],
};

export const adminUpdateEscrowStatus = async (req, res) => {
  try {
    const { status: newStatus, notes } = req.body;
    const escrow = await Escrow.findById(req.params.id).populate("buyer", "name email");
    if (!escrow) return res.status(404).json({ success: false, message: "Escrow not found" });

    const allowed = ESCROW_TRANSITIONS[escrow.status];
    if (!allowed || !allowed.includes(newStatus)) {
      return res.status(400).json({ success: false, message: `Cannot transition from "${escrow.status}" to "${newStatus}"` });
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
      type: newStatus === "released" ? "success" : newStatus === "refunded" ? "info" : "warning",
      recipient: escrow.buyer._id || escrow.buyer,
      actionUrl: "/auctions/transactions",
    });

    res.json({ success: true, data: escrow, message: `Escrow updated: ${prev} → ${newStatus}` });
  } catch (error) {
    Logger.error("adminUpdateEscrowStatus error", error);
    res.status(500).json({ success: false, message: "Failed to update escrow" });
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
    res.status(500).json({ success: false, message: "Failed to fetch escrows" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Token Refunds
// ═══════════════════════════════════════════════════════════════════════════

export const adminRefundToken = async (req, res) => {
  try {
    const payment = await TokenPayment.findById(req.params.id).populate("user", "name email");
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status === "refunded") return res.status(400).json({ success: false, message: "Already refunded" });
    if (!["verified", "pending"].includes(payment.status)) {
      return res.status(400).json({ success: false, message: `Cannot refund a ${payment.status} payment` });
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

    res.json({ success: true, data: payment, message: "Token refunded successfully" });
  } catch (error) {
    Logger.error("adminRefundToken error", error);
    res.status(500).json({ success: false, message: "Failed to refund token" });
  }
};

export const adminBulkRefundTokens = async (req, res) => {
  try {
    const { auctionId } = req.body;
    if (!auctionId) return res.status(400).json({ success: false, message: "Auction ID required" });

    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== "completed") {
      return res.status(400).json({ success: false, message: "Auction must be completed to bulk refund" });
    }

    const winnerIds = (
      await AuctionCar.find({ auction: auctionId, status: "sold" }).select("winner").lean()
    ).map((ac) => ac.winner?.toString()).filter(Boolean);

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
    res.status(500).json({ success: false, message: "Failed to process bulk refund" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Payment Stats / Revenue Analytics
// ═══════════════════════════════════════════════════════════════════════════

export const getPaymentStats = async (req, res) => {
  try {
    const [
      tokenStats,
      escrowStats,
      totalRefunds,
      recentTransactions,
    ] = await Promise.all([
      TokenPayment.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
      ]),
      Escrow.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
      ]),
      WalletTransaction.aggregate([
        { $match: { type: { $in: ["token_refund", "escrow_refund"] }, status: "completed" } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$amount" } } },
      ]),
      WalletTransaction.find().sort({ createdAt: -1 }).limit(20)
        .populate("user", "name email").lean(),
    ]);

    const tokenByStatus = {};
    tokenStats.forEach((t) => { tokenByStatus[t._id] = { count: t.count, total: t.total }; });

    const escrowByStatus = {};
    escrowStats.forEach((e) => { escrowByStatus[e._id] = { count: e.count, total: e.total }; });

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
    res.status(500).json({ success: false, message: "Failed to fetch payment stats" });
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
    summary.forEach((s) => { summaryMap[s._id] = { total: s.total, count: s.count }; });

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
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// CRON  –  Auto-transition auctions based on time
// ═══════════════════════════════════════════════════════════════════════════

export const runAuctionLifecycle = async () => {
  try {
    const now = new Date();

    // Scheduled → Live
    const toGoLive = await Auction.find({ status: "scheduled", startTime: { $lte: now } });
    for (const auction of toGoLive) {
      auction.status = "live";
      await auction.save();
      await AuctionCar.updateMany({ auction: auction._id, status: "approved" }, { status: "live" });
      Logger.info(`Auction ${auction._id} auto-transitioned to live`);
    }

    // Live → Completed (past end time)
    const toEnd = await Auction.find({ status: "live", endTime: { $lte: now } });
    for (const auction of toEnd) {
      auction.status = "completed";
      await auction.save();

      const auctionCars = await AuctionCar.find({ auction: auction._id, status: "live" });
      let totalSold = 0;

      for (const ac of auctionCars) {
        const topBid = await Bid.findOne({ auctionCar: ac._id, isWinning: true }).sort({ amount: -1 });
        if (topBid && topBid.bidder && (!ac.reservePrice || topBid.amount >= ac.reservePrice)) {
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
            winnerWallet.totalBidHeld = Math.max(0, winnerWallet.totalBidHeld - topBid.amount);
            await winnerWallet.save();
            await logWalletTxn({
              user: topBid.bidder, type: "escrow_payment", amount: -topBid.amount,
              reference: escrow._id, referenceModel: "Escrow",
              description: "Winning bid moved to escrow",
            });
          } else {
            await logWalletTxn({
              user: topBid.bidder, type: "token_deposit", amount: -10000,
              reference: escrow._id, referenceModel: "Escrow",
              description: "Token deposit applied to winning bid",
            });
          }

          await Notification.create({
            title: "Auction Won!",
            message: `Congratulations! You won an auction. ${escrow.amountDue > 0 ? `Remaining payment: PKR ${escrow.amountDue.toLocaleString()} due within 48 hours.` : "Your wallet balance covered the full amount."}`,
            type: "success",
            recipient: topBid.bidder,
            actionUrl: `/auctions/result?car_id=${ac._id}`,
          });
        } else {
          ac.status = "unsold";
          // Refund the last winning bidder's held amount if car goes unsold
          if (topBid && topBid.bidder) {
            const refundWallet = await Wallet.findOne({ user: topBid.bidder });
            if (refundWallet) {
              refundWallet.balance += topBid.amount;
              refundWallet.totalBidHeld = Math.max(0, refundWallet.totalBidHeld - topBid.amount);
              refundWallet.lastTransactionAt = new Date();
              await refundWallet.save();
              await logWalletTxn({
                user: topBid.bidder, type: "bid_refund", amount: topBid.amount,
                reference: topBid._id, referenceModel: "Bid",
                description: "Bid refund – car unsold (reserve not met)",
              });
            }
          }
        }
        await ac.save();
      }

      auction.totalSold = totalSold;
      await auction.save();
      Logger.info(`Auction ${auction._id} auto-completed. ${totalSold} cars sold.`);
    }

    // Overdue escrow detection – mark pending escrows past deadline as disputed
    const overdueEscrows = await Escrow.find({
      status: "pending",
      paymentDeadline: { $lt: now },
    }).populate("buyer", "name email");

    for (const escrow of overdueEscrows) {
      escrow.status = "disputed";
      await escrow.save();

      await logWalletTxn({
        user: escrow.buyer._id || escrow.buyer,
        type: "escrow_payment",
        amount: 0,
        reference: escrow._id,
        referenceModel: "Escrow",
        description: "Escrow marked disputed – payment deadline exceeded",
        status: "failed",
      });

      await Notification.create({
        title: "Payment Overdue – Escrow Disputed",
        message: "Your escrow payment deadline has passed. The escrow has been marked as disputed. Please contact support.",
        type: "error",
        recipient: escrow.buyer._id || escrow.buyer,
        actionUrl: "/auctions/transactions",
      });

      Logger.warn(`Escrow ${escrow._id} marked disputed (overdue)`);
    }
  } catch (error) {
    Logger.error("runAuctionLifecycle error", error);
  }
};
