/**
 * Centralized auction configuration.
 * Used by auctionController and auctionEngine for bid validation and anti-sniping.
 */

const MIN_BID_INCREMENT =
  Number(process.env.AUCTION_MIN_BID_INCREMENT) || 50000; // PKR

/** Seconds to extend auction end time when a bid is placed within the anti-snipe window */
const ANTI_SNIPE_EXTENSION_SECONDS =
  Number(process.env.AUCTION_ANTI_SNIPE_EXTENSION_SECONDS) || 120;

/** If a bid is placed within this many seconds of endTime, extend endTime (anti-snipe trigger). */
const ANTI_SNIPE_TRIGGER_SECONDS =
  Number(process.env.AUCTION_ANTI_SNIPE_TRIGGER_SECONDS) || Number(process.env.AUCTION_ANTI_SNIPE_WINDOW_SECONDS) || 120;
const ANTI_SNIPE_WINDOW_SECONDS = ANTI_SNIPE_TRIGGER_SECONDS;

/** Escrow payment deadline in hours after win (default 72; overridden by AuctionSettings.paymentWindowHours) */
const ESCROW_PAYMENT_DEADLINE_HOURS =
  Number(process.env.AUCTION_ESCROW_PAYMENT_DEADLINE_HOURS) || 72;

/** Minutes before auction end to show "ending soon" warning (e.g. in UI) */
const AUCTION_END_WARNING_MINUTES =
  Number(process.env.AUCTION_END_WARNING_MINUTES) || 5;

/** Maximum proxy bid amount (PKR) – cap for validation */
const MAX_PROXY_BID =
  Number(process.env.AUCTION_MAX_PROXY_BID) || 100_000_000;

/** Cron interval in seconds for auction lifecycle (start/end auctions) */
const AUCTION_CRON_INTERVAL =
  Number(process.env.AUCTION_CRON_INTERVAL) || 60;

const AUCTION_PAYMENT_WINDOW_HOURS = ESCROW_PAYMENT_DEADLINE_HOURS;

export const AUCTION_CONFIG = {
  MIN_BID_INCREMENT,
  ANTI_SNIPE_TRIGGER_SECONDS,
  ANTI_SNIPE_EXTENSION_SECONDS,
  ANTI_SNIPE_WINDOW_SECONDS,
  ESCROW_PAYMENT_DEADLINE_HOURS,
  AUCTION_PAYMENT_WINDOW_HOURS,
  AUCTION_END_WARNING_MINUTES,
  MAX_PROXY_BID,
  AUCTION_CRON_INTERVAL,
};

export default AUCTION_CONFIG;
