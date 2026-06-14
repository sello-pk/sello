import { FEATURE_CONFIG } from "../config/index.js";

export const AUCTION_CAPABILITY_KEYS = ["auctionBidder", "auctionDealer"];
export const AUCTION_REQUEST_TYPES = ["dealer", "auctionBidder", "auctionDealer"];

const APPROVED_STATES = new Set(["approved"]);
const PENDING_STATES = new Set(["pending"]);
const REJECTED_STATES = new Set(["rejected", "revoked"]);

const safeStatus = (value) => {
  if (!value) return "not_requested";
  return String(value).toLowerCase();
};

export const normalizeAuctionCapabilities = (user) => {
  const source = user?.auctionCapabilities || {};
  const normalized = {
    auctionBidder: {
      status: safeStatus(source?.auctionBidder?.status),
      requestedAt: source?.auctionBidder?.requestedAt || null,
      reviewedAt: source?.auctionBidder?.reviewedAt || null,
      reviewedBy: source?.auctionBidder?.reviewedBy || null,
      rejectionReason: source?.auctionBidder?.rejectionReason || "",
      documents: Array.isArray(source?.auctionBidder?.documents)
        ? source.auctionBidder.documents
        : [],
    },
    auctionDealer: {
      status: safeStatus(source?.auctionDealer?.status),
      requestedAt: source?.auctionDealer?.requestedAt || null,
      reviewedAt: source?.auctionDealer?.reviewedAt || null,
      reviewedBy: source?.auctionDealer?.reviewedBy || null,
      rejectionReason: source?.auctionDealer?.rejectionReason || "",
      documents: Array.isArray(source?.auctionDealer?.documents)
        ? source.auctionDealer.documents
        : [],
    },
    graceUntil: source?.graceUntil || null,
  };

  return normalized;
};

export const getAuctionAccessMode = () => {
  const mode = String(FEATURE_CONFIG.AUCTION_ACCESS_ENFORCEMENT || "off").toLowerCase();
  if (mode === "hard" || mode === "soft" || mode === "off") return mode;
  return "off";
};

export const hasApprovedAuctionBidAccess = (user) => {
  if (!user) return false;
  if (user.role === "admin") return true;

  const caps = normalizeAuctionCapabilities(user);
  if (APPROVED_STATES.has(caps.auctionBidder.status)) return true;
  if (APPROVED_STATES.has(caps.auctionDealer.status)) return true;

  return false;
};

const hasGraceAccess = (user) => {
  const caps = normalizeAuctionCapabilities(user);
  if (!caps.graceUntil) return false;
  return new Date(caps.graceUntil).getTime() > Date.now();
};

export const evaluateAuctionBidAccess = (user) => {
  const mode = getAuctionAccessMode();
  if (mode === "off") {
    return {
      allowed: true,
      mode,
      reason: null,
      warning: null,
      capabilities: normalizeAuctionCapabilities(user),
    };
  }

  if (hasApprovedAuctionBidAccess(user)) {
    return {
      allowed: true,
      mode,
      reason: null,
      warning: null,
      capabilities: normalizeAuctionCapabilities(user),
    };
  }

  if (hasGraceAccess(user)) {
    return {
      allowed: true,
      mode,
      reason: null,
      warning: "Grace-period access is active. Please complete verification.",
      capabilities: normalizeAuctionCapabilities(user),
    };
  }

  const capabilities = normalizeAuctionCapabilities(user);
  const bidderStatus = capabilities.auctionBidder.status;
  const dealerStatus = capabilities.auctionDealer.status;

  let reason = "Auction bidder approval is required before you can place bids.";
  if (PENDING_STATES.has(bidderStatus) || PENDING_STATES.has(dealerStatus)) {
    reason = "Your auction access request is under review. Please wait for approval.";
  } else if (REJECTED_STATES.has(bidderStatus) || REJECTED_STATES.has(dealerStatus)) {
    reason = "Your auction access request was rejected. Update documents and re-apply.";
  }

  if (mode === "soft") {
    return {
      allowed: true,
      mode,
      reason: null,
      warning: reason,
      capabilities,
    };
  }

  return {
    allowed: false,
    mode,
    reason,
    warning: null,
    capabilities,
  };
};

