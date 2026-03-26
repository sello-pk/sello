/**
 * Auction engine – bid validation, anti-sniping, proxy bids, finalization, escrow.
 * Controller calls these; no HTTP or req/res here.
 */
import { AUCTION_CONFIG } from "../config/auctionConfig.js";
import mongoose from "mongoose";
import {
  Auction,
  AuctionCar,
  Bid,
  ProxyBid,
  TokenPayment,
  Escrow,
  AuctionSettings,
  WalletTransaction,
} from "../models/auctionModel.js";
import { Wallet } from "../models/paymentModel.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { evaluateAuctionBidAccess } from "../utils/auctionAccess.js";
import Logger from "../utils/logger.js";

const { MIN_BID_INCREMENT, ANTI_SNIPE_WINDOW_SECONDS, ANTI_SNIPE_EXTENSION_SECONDS, ESCROW_PAYMENT_DEADLINE_HOURS } = AUCTION_CONFIG;

const SETTINGS_DEFAULTS = {
  minBidIncrement: AUCTION_CONFIG.MIN_BID_INCREMENT ?? 50000,
  antiSnipeTriggerSeconds: AUCTION_CONFIG.ANTI_SNIPE_TRIGGER_SECONDS ?? AUCTION_CONFIG.ANTI_SNIPE_WINDOW_SECONDS ?? 120,
  antiSnipeExtensionSeconds: AUCTION_CONFIG.ANTI_SNIPE_EXTENSION_SECONDS ?? 120,
  paymentWindowHours: AUCTION_CONFIG.ESCROW_PAYMENT_DEADLINE_HOURS ?? 48,
  tokenDepositPercent: 0,
  maxProxyBid: AUCTION_CONFIG.MAX_PROXY_BID ?? 100_000_000,
  activeBidderWindowMinutes: 15,
};
let settingsCache = null;
let settingsCacheAt = 0;
const SETTINGS_CACHE_MS = 60 * 1000;
const LOSER_PARTICIPATION_FEE = 500;

/** Get merged auction settings (DB overrides + config defaults). Cached briefly. */
export async function getAuctionSettings() {
  const now = Date.now();
  if (settingsCache && now - settingsCacheAt < SETTINGS_CACHE_MS) return settingsCache;
  const doc = await AuctionSettings.findOne().sort({ updatedAt: -1 }).lean();
  settingsCache = { ...SETTINGS_DEFAULTS, ...doc };
  delete settingsCache._id;
  delete settingsCache.__v;
  delete settingsCache.updatedBy;
  delete settingsCache.createdAt;
  delete settingsCache.updatedAt;
  settingsCacheAt = now;
  return settingsCache;
}

/** Invalidate settings cache (call after admin updates). */
export function invalidateAuctionSettingsCache() {
  settingsCache = null;
  settingsCacheAt = 0;
}

/**
 * Resolve bid increment for a lot: per-lot bidIncrement > settings > config default.
 */
function getBidIncrement(auctionCar, settingsMin) {
  if (auctionCar.bidIncrement != null && auctionCar.bidIncrement > 0) return auctionCar.bidIncrement;
  if (settingsMin != null && settingsMin > 0) return settingsMin;
  return MIN_BID_INCREMENT;
}

/**
 * Validate that a bid is allowed: auction live, car accepting bids, time window, amount >= current + increment.
 * @param {Object} auction - Auction doc (plain or populated)
 * @param {Object} auctionCar - AuctionCar doc
 * @param {number} amount - Bid amount
 * @param {number} [minIncrement] - Optional min bid increment (from settings or auctionCar.bidIncrement)
 * @returns {{ valid: boolean, message?: string }}
 */
export function validateBid(auction, auctionCar, amount, minIncrement) {
  if (!auction || !auctionCar) {
    return { valid: false, message: "Auction or auction car not found" };
  }
  if (auction.status !== "live") {
    return { valid: false, message: "Auction is not live" };
  }
  if (!["approved", "live"].includes(auctionCar.status)) {
    return { valid: false, message: "This car is not accepting bids" };
  }
  const now = new Date();
  if (new Date(auction.startTime) > now) {
    return { valid: false, message: "Auction has not started yet" };
  }
  if (new Date(auction.endTime) <= now) {
    return { valid: false, message: "Auction has already ended" };
  }
  const inc = getBidIncrement(auctionCar, minIncrement);
  const currentHigh = auctionCar.currentBid ?? auctionCar.startingBid ?? 0;
  if (amount < currentHigh + inc) {
    return {
      valid: false,
      message: `Minimum bid is PKR ${(currentHigh + inc).toLocaleString()}`,
    };
  }
  return { valid: true };
}

/**
 * Get minimum next bid amount for an auction car.
 * @param {Object} auctionCar - AuctionCar doc
 * @param {number} [minIncrement] - Optional (from settings or auctionCar.bidIncrement)
 */
export function getMinNextBid(auctionCar, minIncrement) {
  const current = auctionCar.currentBid ?? auctionCar.startingBid ?? 0;
  return current + getBidIncrement(auctionCar, minIncrement);
}

/**
 * If auction is within anti-snipe window of end, return new end time (extended). Otherwise return null.
 * @param {Object} auction - Auction doc with endTime
 * @returns {{ extended: boolean, newEndTime?: Date }}
 */
export function extendAuctionIfNeeded(auction) {
  const now = new Date();
  const endTime = new Date(auction.endTime);
  const windowMs = ANTI_SNIPE_WINDOW_SECONDS * 1000;
  if (endTime.getTime() - now.getTime() > windowMs) {
    return { extended: false };
  }
  const newEndTime = new Date(endTime.getTime() + ANTI_SNIPE_EXTENSION_SECONDS * 1000);
  return { extended: true, newEndTime };
}

/**
 * Create escrow for a winner. Caller is responsible for wallet/ledger/notify.
 * Uses paymentWindowHours from AuctionSettings (default 72).
 * @returns {Promise<import('../models/auctionModel.js').Escrow>}
 */
export async function createEscrowForWinner(auctionCarId, buyerId, amount, tokenDeduction, amountDue) {
  const settings = await getAuctionSettings();
  const hours = settings?.paymentWindowHours ?? ESCROW_PAYMENT_DEADLINE_HOURS ?? 72;
  const paymentDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  const escrow = await Escrow.create({
    auctionCar: auctionCarId,
    buyer: buyerId,
    amount,
    tokenDeduction,
    amountDue,
    paymentDeadline,
  });
  return escrow;
}

/**
 * Apply proxy bids after a manual bid. Finds highest eligible proxy and places one bid (eBay-style).
 * @param {string} auctionCarId
 * @param {number} currentAmount
 * @param {*} excludeUserId - Bidder who just placed the bid
 * @param {*} auctionId
 * @param {{ logWalletTxn: Function, getIo?: () => any }} deps
 */
export async function applyProxyBids(auctionCarId, currentAmount, excludeUserId, auctionId, deps) {
  const { logWalletTxn, getIo } = deps || {};
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

    for (const proxy of proxies) {
      const proxyUser = await User.findById(proxy.bidder).select("role dealerInfo auctionCapabilities");
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

    const proxyWallet = await Wallet.findOne({ user: top.bidder });
    if (proxyWallet && proxyWallet.balance < proxyAmount) {
      top.isActive = false;
      await top.save();
      return;
    }

    // Refund previous winning bidder
    const prevWin = await Bid.findOne({ auctionCar: auctionCarId, isWinning: true });
    if (prevWin && prevWin.bidder && logWalletTxn) {
      const prevW = await Wallet.findOne({ user: prevWin.bidder });
      if (prevW) {
        prevW.balance += prevWin.amount;
        prevW.totalBidHeld = Math.max(0, prevW.totalBidHeld - prevWin.amount);
        prevW.lastTransactionAt = new Date();
        await prevW.save();
        await logWalletTxn({
          user: prevWin.bidder,
          type: "bid_refund",
          amount: prevWin.amount,
          reference: prevWin._id,
          referenceModel: "Bid",
          description: "Outbid refund (proxy)",
        });
      }
    }

    await Bid.updateMany({ auctionCar: auctionCarId, isWinning: true }, { isWinning: false });

    if (proxyWallet && logWalletTxn) {
      proxyWallet.balance -= proxyAmount;
      proxyWallet.totalBidHeld += proxyAmount;
      proxyWallet.lastTransactionAt = new Date();
      await proxyWallet.save();
      await logWalletTxn({
        user: top.bidder,
        type: "bid_hold",
        amount: -proxyAmount,
        reference: null,
        referenceModel: "Bid",
        description: `Proxy bid – PKR ${proxyAmount.toLocaleString()}`,
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

    const io = getIo && getIo();
    if (io) {
      const populatedBid = await Bid.findById(bid._id).populate("bidder", "name").lean();
      io.to(`auction:${auctionId}`).emit("new-bid", {
        auctionCarId,
        bid: populatedBid,
        currentBid: proxyAmount,
        bidCount: (await AuctionCar.findById(auctionCarId).select("bidCount").lean())?.bidCount,
      });
      io.to(`auction:${auctionId}`).emit("auction:bid", { auctionCarId, bid: populatedBid, currentBid: proxyAmount });
    }
  } catch (err) {
    Logger.error("applyProxyBids error", err);
  }
}

/**
 * Finalize a sold auction car: set winner, create escrow, update wallet/ledger.
 * @param {Object} auctionCar - AuctionCar doc (with _id)
 * @param {Object} topBid - Winning Bid doc (bidder, amount)
 * @param {{ logWalletTxn: Function }} deps
 * @returns {Promise<import('../models/auctionModel.js').Escrow>}
 */
export async function finalizeAuctionCar(auctionCar, topBid, deps) {
  const { logWalletTxn } = deps || {};
  auctionCar.status = "sold";
  auctionCar.winner = topBid.bidder;
  auctionCar.finalPrice = topBid.amount;
  auctionCar.soldAt = new Date();
  await auctionCar.save();

  const winnerWallet = await Wallet.findOne({ user: topBid.bidder });
  const walletDeduction = winnerWallet ? topBid.amount : 10000;
  const amountDue = Math.max(0, topBid.amount - walletDeduction);
  const escrow = await createEscrowForWinner(
    auctionCar._id,
    topBid.bidder,
    topBid.amount,
    walletDeduction,
    amountDue,
  );

  if (winnerWallet && logWalletTxn) {
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
  } else if (logWalletTxn) {
    await logWalletTxn({
      user: topBid.bidder,
      type: "token_deposit",
      amount: -10000,
      reference: escrow._id,
      referenceModel: "Escrow",
      description: "Token deposit applied to winning bid",
    });
  }

  try {
    await Notification.create({
      title: "Auction Won!",
      message: amountDue > 0
        ? `Congratulations! You won. Remaining payment: PKR ${amountDue.toLocaleString()} due within ${ESCROW_PAYMENT_DEADLINE_HOURS} hours.`
        : "Your wallet balance covered the full amount.",
      type: "success",
      recipient: topBid.bidder,
      actionUrl: `/auctions/result?car_id=${auctionCar._id}`,
    });
  } catch (e) {
    Logger.error("finalizeAuctionCar notification error", e);
  }

  return escrow;
}

async function ensureVerifiedTokenPaymentWalletCredit(payment) {
  if (!payment || payment.status !== "verified") {
    return Wallet.findOne({ user: payment?.user }).lean();
  }

  if (payment.walletCreditedAt) {
    return Wallet.findOne({ user: payment.user }).lean();
  }

  const existingCreditTxn = await WalletTransaction.findOne({
    user: payment.user,
    type: "token_deposit",
    reference: payment._id,
    referenceModel: "TokenPayment",
    amount: { $gt: 0 },
  })
    .sort({ createdAt: -1 })
    .lean();

  if (existingCreditTxn) {
    await TokenPayment.updateOne(
      { _id: payment._id, walletCreditedAt: null },
      {
        $set: {
          walletCreditedAt: existingCreditTxn.createdAt || new Date(),
          walletTransactionId: existingCreditTxn._id,
          walletCreditError: "",
        },
      },
    );
    return Wallet.findOne({ user: payment.user }).lean();
  }

  const claimedAt = new Date();
  const claimedPayment = await TokenPayment.findOneAndUpdate(
    {
      _id: payment._id,
      user: payment.user,
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

  if (!claimedPayment) {
    return Wallet.findOne({ user: payment.user }).lean();
  }

  const amount = Number(claimedPayment.amount || 0);
  const wallet = await Wallet.findOneAndUpdate(
    { user: claimedPayment.user },
    {
      $setOnInsert: { user: claimedPayment.user },
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
      user: claimedPayment.user,
      type: "token_deposit",
      amount,
      balance: wallet.balance || 0,
      reference: claimedPayment._id,
      referenceModel: "TokenPayment",
      description: "Verified token deposit credited to wallet",
      status: "completed",
    });

    await TokenPayment.updateOne(
      { _id: claimedPayment._id },
      {
        $set: {
          walletTransactionId: txn._id,
          walletCreditError: "",
        },
      },
    );

    return wallet;
  } catch (error) {
    await Wallet.updateOne(
      { user: claimedPayment.user },
      {
        $inc: {
          balance: -amount,
          totalDeposited: -amount,
        },
        $set: { lastTransactionAt: new Date() },
      },
    );
    await TokenPayment.updateOne(
      { _id: claimedPayment._id },
      {
        $set: {
          walletCreditedAt: null,
          walletTransactionId: null,
          walletCreditError: error?.message || "Wallet ledger write failed",
        },
      },
    );
    throw error;
  }
}

/**
 * After an auction completes, charge the participation fee once for each losing bidder.
 * The verified token amount is already credited to the wallet earlier in the flow, so the
 * settlement here only deducts the non-refundable PKR 500 fee and records the remaining
 * token amount as the bidder's refunded/retained amount for UI visibility.
 * @param {Object} auction
 * @param {{ logWalletTxn: Function }} deps
 * @returns {Promise<{ settled: number, skipped: number, failed: number }>}
 */
export async function settleAuctionParticipantTokens(auction, deps) {
  const { logWalletTxn } = deps || {};
  if (!auction?._id || !logWalletTxn) {
    return { settled: 0, skipped: 0, failed: 0 };
  }

  const auctionCars = await AuctionCar.find({ auction: auction._id })
    .select("_id winner status")
    .lean();

  if (!auctionCars.length) {
    return { settled: 0, skipped: 0, failed: 0 };
  }

  const auctionCarIds = auctionCars.map((row) => row._id);
  const winnerIds = new Set(
    auctionCars
      .filter((row) => row.status === "sold" && row.winner)
      .map((row) => String(row.winner)),
  );
  const participantIds = await Bid.distinct("bidder", {
    auctionCar: { $in: auctionCarIds },
    bidder: { $exists: true, $ne: null },
  });

  let settled = 0;
  let skipped = 0;
  let failed = 0;

  for (const bidderId of participantIds.map((id) => String(id))) {
    if (winnerIds.has(bidderId)) {
      skipped++;
      continue;
    }

    try {
      let payment = await TokenPayment.findOne({
        user: bidderId,
        status: "verified",
      }).sort({ verifiedAt: -1, createdAt: -1 });

      if (!payment) {
        Logger.warn("No verified token payment found for losing bidder", {
          auctionId: String(auction._id),
          userId: bidderId,
        });
        skipped++;
        continue;
      }

      const settlementExists = (payment.auctionSettlements || []).some(
        (entry) =>
          String(entry?.auction) === String(auction._id) &&
          entry?.outcome === "loser" &&
          entry?.processedAt,
      );

      if (settlementExists) {
        skipped++;
        continue;
      }

      const existingFeeTxn = await WalletTransaction.findOne({
        user: bidderId,
        type: "platform_fee",
        reference: auction._id,
        referenceModel: "Auction",
      })
        .sort({ createdAt: -1 })
        .lean();

      if (existingFeeTxn) {
        payment.auctionSettlements = [
          ...(payment.auctionSettlements || []),
          {
            auction: auction._id,
            outcome: "loser",
            tokenAmount: Number(payment.amount || 0),
            feeAmount: LOSER_PARTICIPATION_FEE,
            refundAmount: Math.max(
              Number(payment.amount || 0) - LOSER_PARTICIPATION_FEE,
              0,
            ),
            processedAt: existingFeeTxn.createdAt || new Date(),
            feeTransactionId: existingFeeTxn._id,
            note: "Recovered from existing settlement ledger entry",
          },
        ];
        await payment.save();
        skipped++;
        continue;
      }

      if (!payment.walletCreditedAt) {
        await ensureVerifiedTokenPaymentWalletCredit(payment);
        payment = await TokenPayment.findById(payment._id);
      }

      const now = new Date();
      const wallet = await Wallet.findOneAndUpdate(
        {
          user: bidderId,
          balance: { $gte: LOSER_PARTICIPATION_FEE },
        },
        {
          $inc: {
            balance: -LOSER_PARTICIPATION_FEE,
            totalWithdrawn: LOSER_PARTICIPATION_FEE,
          },
          $set: { lastTransactionAt: now },
        },
        { new: true },
      );

      if (!wallet) {
        throw new Error(
          `Wallet balance is too low to deduct PKR ${LOSER_PARTICIPATION_FEE}.`,
        );
      }

      const feeTxn = await logWalletTxn({
        user: bidderId,
        type: "platform_fee",
        amount: -LOSER_PARTICIPATION_FEE,
        reference: auction._id,
        referenceModel: "Auction",
        description: `Participation fee retained after auction "${auction.title || "Auction"}" ended`,
      });

      payment.auctionSettlements = [
        ...(payment.auctionSettlements || []),
        {
          auction: auction._id,
          outcome: "loser",
          tokenAmount: Number(payment.amount || 0),
          feeAmount: LOSER_PARTICIPATION_FEE,
          refundAmount: Math.max(
            Number(payment.amount || 0) - LOSER_PARTICIPATION_FEE,
            0,
          ),
          processedAt: now,
          feeTransactionId: feeTxn?._id || null,
          note: "Auto-settled after auction completion",
        },
      ];
      await payment.save();

      try {
        await Notification.create({
          title: "Auction Token Settled",
          message: `Auction ended. PKR ${Math.max(Number(payment.amount || 0) - LOSER_PARTICIPATION_FEE, 0).toLocaleString()} remains in your wallet after a PKR ${LOSER_PARTICIPATION_FEE.toLocaleString()} participation fee.`,
          type: "info",
          recipient: bidderId,
          actionUrl: "/auctions/transactions",
        });
      } catch (notifyError) {
        Logger.error("settleAuctionParticipantTokens notification error", {
          auctionId: String(auction._id),
          bidderId,
          error: notifyError?.message || notifyError,
        });
      }

      settled++;
    } catch (error) {
      failed++;
      Logger.error("settleAuctionParticipantTokens error", {
        auctionId: String(auction._id),
        bidderId,
        error: error?.message || error,
      });
    }
  }

  return { settled, skipped, failed };
}

/**
 * Refund unsold lot: mark car unsold, refund winning bidder's held amount.
 * @param {Object} auctionCar - AuctionCar doc
 * @param {Object|null} topBid - Current winning Bid or null
 * @param {{ logWalletTxn: Function }} deps
 */
export async function refundUnsoldBidders(auctionCar, topBid, deps) {
  const { logWalletTxn } = deps || {};
  auctionCar.status = "unsold";
  await auctionCar.save();

  if (!topBid || !topBid.bidder) return;
  const refundWallet = await Wallet.findOne({ user: topBid.bidder });
  if (!refundWallet) return;

  refundWallet.balance += topBid.amount;
  refundWallet.totalBidHeld = Math.max(0, refundWallet.totalBidHeld - topBid.amount);
  refundWallet.lastTransactionAt = new Date();
  await refundWallet.save();

  if (logWalletTxn) {
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

/**
 * Process expired live auctions: mark completed, finalize or refund each car.
 * Call from cron. Expects logWalletTxn to be provided in deps.
 * @param {{ logWalletTxn: Function }} deps
 * @returns {Promise<{ ended: number, sold: number }>}
 */
export async function processExpiredAuctions(deps) {
  const now = new Date();
  const toEnd = await Auction.find({
    status: "live",
    endTime: { $lte: now },
  });
  let allSold = 0;

  for (const auction of toEnd) {
    auction.status = "completed";
    await auction.save();

    const auctionCars = await AuctionCar.find({
      auction: auction._id,
      status: "live",
    });
    let auctionSold = 0;

    for (const ac of auctionCars) {
      const topBid = await Bid.findOne({
        auctionCar: ac._id,
        isWinning: true,
      }).sort({ amount: -1 });

      const meetsReserve = !ac.reservePrice || (topBid && topBid.amount >= ac.reservePrice);
      if (topBid && topBid.bidder && meetsReserve) {
        await finalizeAuctionCar(ac, topBid, deps);
        auctionSold++;
      } else {
        await refundUnsoldBidders(ac, topBid || null, deps);
      }
    }

    auction.totalSold = auctionSold;
    await auction.save();
    const settlement = await settleAuctionParticipantTokens(auction, deps);
    allSold += auctionSold;
    Logger.info(
      `Auction ${auction._id} auto-completed. ${auctionSold} cars sold. ` +
        `Loser settlements: ${settlement.settled} settled, ${settlement.skipped} skipped, ${settlement.failed} failed.`,
    );
  }

  return { ended: toEnd.length, sold: allSold };
}

/**
 * Process escrows past payment deadline: mark as penalized, log penalty, notify admin.
 * Call from cron. Expects logWalletTxn in deps.
 * @param {{ logWalletTxn: Function }} deps
 * @returns {Promise<{ penalized: number }>}
 */
export async function processExpiredEscrows(deps) {
  const { logWalletTxn } = deps || {};
  const now = new Date();
  const overdue = await Escrow.find({
    status: { $in: ["pending", "in_escrow"] },
    paymentDeadline: { $lt: now },
  })
    .populate("buyer", "name email")
    .populate({ path: "auctionCar", select: "car", populate: { path: "car", select: "make model year" } });
  let penalized = 0;
  for (const escrow of overdue) {
    escrow.status = "penalized";
    await escrow.save();
    if (logWalletTxn) {
      await logWalletTxn({
        user: escrow.buyer._id || escrow.buyer,
        type: "penalty",
        amount: -escrow.tokenDeduction,
        reference: escrow._id,
        referenceModel: "Escrow",
        description: "Token confiscated – payment not completed within deadline",
      });
    }
    try {
      await Notification.create({
        title: "Payment Overdue – Token Confiscated",
        message: `You did not complete payment within the deadline. PKR ${escrow.tokenDeduction?.toLocaleString?.() || escrow.tokenDeduction} has been recorded as a penalty.`,
        type: "error",
        recipient: escrow.buyer._id || escrow.buyer,
        actionUrl: "/auctions/transactions",
      });
      const adminUsers = await User.find({ role: "admin" }).select("_id").lean();
      for (const admin of adminUsers) {
        await Notification.create({
          title: "Escrow Penalized – Admin",
          message: `Buyer ${escrow.buyer?.name || escrow.buyer} did not pay. Escrow ${escrow._id} marked penalized.`,
          type: "warning",
          recipient: admin._id,
          actionUrl: "/admin/escrows",
        });
      }
    } catch (e) {
      Logger.error("processExpiredEscrows notification error", e);
    }
    penalized++;
    Logger.warn(`Escrow ${escrow._id} penalized (payment deadline exceeded)`);
  }
  return { penalized };
}

/**
 * Count distinct bidders who placed a bid in the last N minutes for an auction.
 * @param {string} auctionId
 * @param {number} [windowMinutes] - default 15
 * @returns {Promise<number>}
 */
export async function getActiveBidderCount(auctionId, windowMinutes = 15) {
  const since = new Date(Date.now() - (windowMinutes * 60 * 1000));
  const result = await Bid.aggregate([
    {
      $match: {
        auction: new mongoose.Types.ObjectId(auctionId),
        createdAt: { $gte: since },
        bidder: { $exists: true, $ne: null },
      },
    },
    { $group: { _id: "$bidder" } },
    { $count: "count" },
  ]);
  return result[0]?.count ?? 0;
}
