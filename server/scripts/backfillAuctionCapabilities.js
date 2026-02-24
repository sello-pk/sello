import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/userModel.js";
import { FEATURE_CONFIG } from "../config/index.js";
import Logger from "../utils/logger.js";

const run = async () => {
  await connectDB();
  const graceDays = FEATURE_CONFIG.AUCTION_ACCESS_GRACE_DAYS || 14;
  const graceUntil = new Date(Date.now() + graceDays * 24 * 60 * 60 * 1000);

  const users = await User.find({}).select("role dealerInfo auctionCapabilities");
  let updated = 0;

  for (const user of users) {
    let changed = false;

    if (!user.auctionCapabilities) {
      user.auctionCapabilities = {};
      changed = true;
    }

    if (!user.auctionCapabilities.auctionBidder?.status) {
      user.auctionCapabilities.auctionBidder = {
        status: "not_requested",
        requestedAt: null,
      };
      changed = true;
    }

    if (!user.auctionCapabilities.auctionDealer?.status) {
      user.auctionCapabilities.auctionDealer = {
        status: "not_requested",
        requestedAt: null,
      };
      changed = true;
    }

    // Map already verified legacy dealers to approved auction dealer capability.
    if (user.role === "dealer" && user?.dealerInfo?.verified) {
      if (user.auctionCapabilities.auctionDealer.status !== "approved") {
        user.auctionCapabilities.auctionDealer.status = "approved";
        user.auctionCapabilities.auctionDealer.reviewedAt =
          user?.dealerInfo?.verifiedAt || new Date();
        changed = true;
      }
    }

    // Short grace period for existing users that had no explicit bidder decision yet.
    if (!user.auctionCapabilities.graceUntil) {
      user.auctionCapabilities.graceUntil = graceUntil;
      changed = true;
    }

    if (changed) {
      await user.save();
      updated += 1;
    }
  }

  Logger.info("Auction capability backfill completed", {
    totalUsers: users.length,
    updatedUsers: updated,
    graceDays,
  });

  await mongoose.disconnect();
};

run()
  .then(() => {
    console.log("Backfill finished successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Backfill failed:", error);
    process.exit(1);
  });

