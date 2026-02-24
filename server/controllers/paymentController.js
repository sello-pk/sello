import { Wallet, Deposit, RefundRequest, PlatformSettings } from "../models/paymentModel.js";
import { WalletTransaction, Bid } from "../models/auctionModel.js";
import Notification from "../models/notificationModel.js";
import Logger from "../utils/logger.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getOrCreateWallet(userId) {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId });
  }
  return wallet;
}

async function logTransaction({ user, type, amount, reference, referenceModel, description, status = "completed" }) {
  const wallet = await Wallet.findOne({ user });
  const balance = wallet ? wallet.balance : 0;
  return WalletTransaction.create({ user, type, amount, balance, reference, referenceModel, description, status });
}

async function getSettings() {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({
      depositTiers: [
        { minDeposit: 10000, maxBidLimit: 500000, label: "Basic" },
        { minDeposit: 50000, maxBidLimit: 2000000, label: "Standard" },
        { minDeposit: 100000, maxBidLimit: 5000000, label: "Premium" },
        { minDeposit: 500000, maxBidLimit: 50000000, label: "VIP" },
      ],
    });
  }
  return settings;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER  –  Wallet
// ═══════════════════════════════════════════════════════════════════════════

export const getMyWallet = async (req, res) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id);

    const activeBids = await Bid.find({
      bidder: req.user._id,
      isWinning: true,
    }).select("amount auctionCar").lean();

    const settings = await getSettings();

    let maxBidLimit = 0;
    if (settings.depositTiers?.length > 0) {
      const sorted = [...settings.depositTiers].sort((a, b) => b.minDeposit - a.minDeposit);
      const tier = sorted.find((t) => wallet.totalDeposited >= t.minDeposit);
      maxBidLimit = tier?.maxBidLimit || 0;
    }

    res.json({
      success: true,
      data: {
        wallet,
        activeBids,
        maxBidLimit,
        settings: {
          minDeposit: settings.minDeposit,
          maxDeposit: settings.maxDeposit,
          platformFeePercent: settings.platformFeePercent,
          depositTiers: settings.depositTiers,
          isWalletSystemEnabled: settings.isWalletSystemEnabled,
        },
      },
    });
  } catch (error) {
    Logger.error("getMyWallet error", error);
    res.status(500).json({ success: false, message: "Failed to fetch wallet" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// USER  –  Deposits
// ═══════════════════════════════════════════════════════════════════════════

export const createDeposit = async (req, res) => {
  try {
    const { amount, method, transactionId, notes } = req.body;
    if (!amount || !method) {
      return res.status(400).json({ success: false, message: "Amount and payment method are required" });
    }

    const settings = await getSettings();
    if (amount < settings.minDeposit) {
      return res.status(400).json({ success: false, message: `Minimum deposit is PKR ${settings.minDeposit.toLocaleString()}` });
    }
    if (amount > settings.maxDeposit) {
      return res.status(400).json({ success: false, message: `Maximum deposit is PKR ${settings.maxDeposit.toLocaleString()}` });
    }

    const pendingDeposit = await Deposit.findOne({ user: req.user._id, status: "pending" });
    if (pendingDeposit) {
      return res.status(400).json({ success: false, message: "You already have a pending deposit. Wait for it to be processed." });
    }

    const deposit = await Deposit.create({
      user: req.user._id,
      amount,
      method,
      transactionId: transactionId || "",
      notes: notes || "",
    });

    res.status(201).json({ success: true, data: deposit, message: "Deposit submitted for approval" });
  } catch (error) {
    Logger.error("createDeposit error", error);
    res.status(500).json({ success: false, message: "Failed to submit deposit" });
  }
};

export const getMyDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: deposits });
  } catch (error) {
    Logger.error("getMyDeposits error", error);
    res.status(500).json({ success: false, message: "Failed to fetch deposits" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// USER  –  Refund Requests
// ═══════════════════════════════════════════════════════════════════════════

export const createRefundRequest = async (req, res) => {
  try {
    const { amount, reason, type } = req.body;
    if (!amount || !reason || !type) {
      return res.status(400).json({ success: false, message: "Amount, reason, and type are required" });
    }

    const wallet = await getOrCreateWallet(req.user._id);
    if (amount > wallet.balance) {
      return res.status(400).json({ success: false, message: "Refund amount exceeds your available balance" });
    }

    const pendingRefund = await RefundRequest.findOne({ user: req.user._id, status: "pending" });
    if (pendingRefund) {
      return res.status(400).json({ success: false, message: "You already have a pending refund request" });
    }

    const settings = await getSettings();
    const feePercent = type === "declined_car" ? settings.refundPenaltyPercent : settings.platformFeePercent;
    const fee = Math.round(amount * (feePercent / 100));
    const net = amount - fee;

    const refund = await RefundRequest.create({
      user: req.user._id,
      amount,
      reason,
      type,
      platformFee: fee,
      platformFeePercent: feePercent,
      netRefund: net,
    });

    res.status(201).json({ success: true, data: refund, message: "Refund request submitted for review" });
  } catch (error) {
    Logger.error("createRefundRequest error", error);
    res.status(500).json({ success: false, message: "Failed to submit refund request" });
  }
};

export const getMyRefundRequests = async (req, res) => {
  try {
    const refunds = await RefundRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: refunds });
  } catch (error) {
    Logger.error("getMyRefundRequests error", error);
    res.status(500).json({ success: false, message: "Failed to fetch refund requests" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Wallets
// ═══════════════════════════════════════════════════════════════════════════

export const adminGetAllWallets = async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const wallets = await Wallet.find()
      .populate("user", "name email phone role")
      .sort({ balance: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Wallet.countDocuments();
    res.json({ success: true, data: { wallets, pagination: { page: Number(page), limit: Number(limit), total } } });
  } catch (error) {
    Logger.error("adminGetAllWallets error", error);
    res.status(500).json({ success: false, message: "Failed to fetch wallets" });
  }
};

export const adminUpdateWalletBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, type, notes } = req.body;
    if (!amount || !type) {
      return res.status(400).json({ success: false, message: "Amount and type (credit/debit) are required" });
    }

    const wallet = await getOrCreateWallet(userId);
    const numAmount = Number(amount);

    if (type === "credit") {
      wallet.balance += numAmount;
      wallet.totalDeposited += numAmount;
    } else if (type === "debit") {
      if (wallet.balance < numAmount) {
        return res.status(400).json({ success: false, message: "Insufficient wallet balance" });
      }
      wallet.balance -= numAmount;
      wallet.totalWithdrawn += numAmount;
    } else {
      return res.status(400).json({ success: false, message: "Type must be 'credit' or 'debit'" });
    }

    wallet.lastTransactionAt = new Date();
    await wallet.save();

    await logTransaction({
      user: userId,
      type: type === "credit" ? "admin_credit" : "admin_debit",
      amount: type === "credit" ? numAmount : -numAmount,
      reference: wallet._id,
      referenceModel: "Wallet",
      description: notes || `Admin ${type} by ${req.user.name}`,
    });

    await Notification.create({
      title: type === "credit" ? "Wallet Credited" : "Wallet Debited",
      message: `Your wallet has been ${type === "credit" ? "credited with" : "debited by"} PKR ${numAmount.toLocaleString()}.${notes ? ` Note: ${notes}` : ""}`,
      type: type === "credit" ? "success" : "warning",
      recipient: userId,
      actionUrl: "/auctions/transactions",
    });

    res.json({ success: true, data: wallet, message: `Wallet ${type}ed successfully` });
  } catch (error) {
    Logger.error("adminUpdateWalletBalance error", error);
    res.status(500).json({ success: false, message: "Failed to update wallet" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Deposits
// ═══════════════════════════════════════════════════════════════════════════

export const adminGetAllDeposits = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const deposits = await Deposit.find(filter)
      .populate("user", "name email phone")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: deposits });
  } catch (error) {
    Logger.error("adminGetAllDeposits error", error);
    res.status(500).json({ success: false, message: "Failed to fetch deposits" });
  }
};

export const adminProcessDeposit = async (req, res) => {
  try {
    const { action, rejectionReason } = req.body;
    const deposit = await Deposit.findById(req.params.id).populate("user", "name email");
    if (!deposit) return res.status(404).json({ success: false, message: "Deposit not found" });
    if (deposit.status !== "pending") {
      return res.status(400).json({ success: false, message: `Deposit already ${deposit.status}` });
    }

    deposit.processedBy = req.user._id;
    deposit.processedAt = new Date();

    if (action === "approve") {
      deposit.status = "approved";

      const wallet = await getOrCreateWallet(deposit.user._id || deposit.user);
      wallet.balance += deposit.amount;
      wallet.totalDeposited += deposit.amount;
      wallet.lastTransactionAt = new Date();
      await wallet.save();

      await logTransaction({
        user: deposit.user._id || deposit.user,
        type: "deposit",
        amount: deposit.amount,
        reference: deposit._id,
        referenceModel: "Deposit",
        description: `Deposit approved (${deposit.method})`,
      });

      await Notification.create({
        title: "Deposit Approved",
        message: `Your deposit of PKR ${deposit.amount.toLocaleString()} has been approved and added to your wallet.`,
        type: "success",
        recipient: deposit.user._id || deposit.user,
        actionUrl: "/auctions/transactions",
      });
    } else if (action === "reject") {
      deposit.status = "rejected";
      deposit.rejectionReason = rejectionReason || "";

      await Notification.create({
        title: "Deposit Rejected",
        message: `Your deposit of PKR ${deposit.amount.toLocaleString()} was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
        type: "error",
        recipient: deposit.user._id || deposit.user,
        actionUrl: "/auctions/transactions",
      });
    }

    await deposit.save();
    res.json({ success: true, data: deposit, message: `Deposit ${action}d` });
  } catch (error) {
    Logger.error("adminProcessDeposit error", error);
    res.status(500).json({ success: false, message: "Failed to process deposit" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Refund Requests
// ═══════════════════════════════════════════════════════════════════════════

export const adminGetAllRefunds = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const refunds = await RefundRequest.find(filter)
      .populate("user", "name email phone")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: refunds });
  } catch (error) {
    Logger.error("adminGetAllRefunds error", error);
    res.status(500).json({ success: false, message: "Failed to fetch refunds" });
  }
};

export const adminProcessRefund = async (req, res) => {
  try {
    const { action, adminNotes, paymentMethod, paymentReference } = req.body;
    const refund = await RefundRequest.findById(req.params.id).populate("user", "name email");
    if (!refund) return res.status(404).json({ success: false, message: "Refund not found" });
    if (!["pending", "approved"].includes(refund.status)) {
      return res.status(400).json({ success: false, message: `Cannot process a ${refund.status} refund` });
    }

    refund.processedBy = req.user._id;
    refund.processedAt = new Date();
    if (adminNotes) refund.adminNotes = adminNotes;
    if (paymentMethod) refund.paymentMethod = paymentMethod;
    if (paymentReference) refund.paymentReference = paymentReference;

    const userId = refund.user._id || refund.user;

    if (action === "approve") {
      refund.status = "approved";

      await Notification.create({
        title: "Refund Approved",
        message: `Your refund request of PKR ${refund.amount.toLocaleString()} has been approved. Net refund: PKR ${refund.netRefund.toLocaleString()} (fee: PKR ${refund.platformFee.toLocaleString()}).`,
        type: "success",
        recipient: userId,
        actionUrl: "/auctions/transactions",
      });
    } else if (action === "reject") {
      refund.status = "rejected";

      await Notification.create({
        title: "Refund Rejected",
        message: `Your refund request of PKR ${refund.amount.toLocaleString()} was rejected.${adminNotes ? ` Note: ${adminNotes}` : ""}`,
        type: "error",
        recipient: userId,
        actionUrl: "/auctions/transactions",
      });
    } else if (action === "process") {
      refund.status = "processed";

      const wallet = await getOrCreateWallet(userId);
      if (wallet.balance < refund.amount) {
        return res.status(400).json({ success: false, message: "User has insufficient balance for this refund" });
      }

      wallet.balance -= refund.amount;
      wallet.totalWithdrawn += refund.netRefund;
      wallet.lastTransactionAt = new Date();
      await wallet.save();

      await logTransaction({
        user: userId,
        type: "refund",
        amount: -refund.amount,
        reference: refund._id,
        referenceModel: "RefundRequest",
        description: `Refund processed – net PKR ${refund.netRefund.toLocaleString()} (fee ${refund.platformFeePercent}%)`,
      });

      if (refund.platformFee > 0) {
        await logTransaction({
          user: userId,
          type: "platform_fee",
          amount: -refund.platformFee,
          reference: refund._id,
          referenceModel: "RefundRequest",
          description: `Platform fee on refund (${refund.platformFeePercent}%)`,
        });
      }

      await Notification.create({
        title: "Refund Processed",
        message: `Your refund of PKR ${refund.netRefund.toLocaleString()} has been processed.`,
        type: "success",
        recipient: userId,
        actionUrl: "/auctions/transactions",
      });
    }

    await refund.save();
    res.json({ success: true, data: refund, message: `Refund ${action}${action === "process" ? "ed" : "d"}` });
  } catch (error) {
    Logger.error("adminProcessRefund error", error);
    res.status(500).json({ success: false, message: "Failed to process refund" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Platform Settings
// ═══════════════════════════════════════════════════════════════════════════

export const adminGetPlatformSettings = async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, data: settings });
  } catch (error) {
    Logger.error("adminGetPlatformSettings error", error);
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

export const adminUpdatePlatformSettings = async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedBy = req.user._id;
    let settings = await PlatformSettings.findOne();
    if (!settings) settings = new PlatformSettings();

    const allowed = ["platformFeePercent", "platformFeeFixed", "minDeposit", "maxDeposit", "depositTiers", "refundPenaltyPercent", "isWalletSystemEnabled", "updatedBy"];
    allowed.forEach((key) => {
      if (updates[key] !== undefined) settings[key] = updates[key];
    });

    await settings.save();
    res.json({ success: true, data: settings, message: "Settings updated" });
  } catch (error) {
    Logger.error("adminUpdatePlatformSettings error", error);
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
};

// ═══════════════════════════════════════════════════════════════════════════
// ADMIN  –  Audit Log
// ═══════════════════════════════════════════════════════════════════════════

export const adminGetAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, userId } = req.query;
    const filter = {};
    if (type && type !== "all") filter.type = type;
    if (userId) filter.user = userId;

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      WalletTransaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { transactions, pagination: { page: Number(page), limit: Number(limit), total } },
    });
  } catch (error) {
    Logger.error("adminGetAuditLog error", error);
    res.status(500).json({ success: false, message: "Failed to fetch audit log" });
  }
};
