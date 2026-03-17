/**
 * Auction-specific email notifications.
 * Only sends when ENABLE_EMAIL_NOTIFICATIONS is true; uses existing SMTP config.
 */
import { sendEmail } from "../utils/helpers.js";
import { EMAIL_CONFIG } from "../config/index.js";
import Logger from "../utils/logger.js";

function getFrontendUrl() {
  return EMAIL_CONFIG.getFrontendUrl ? EMAIL_CONFIG.getFrontendUrl() : process.env.CLIENT_URL || "http://localhost:5173";
}

function wrapHtml(title, body) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FFA602;">${title}</h2>
      <div style="margin: 20px 0;">${body}</div>
      <p style="color: #666;">— Sello Auction Team</p>
    </div>
  `;
}

/**
 * Send outbid notification. toEmail = previous high bidder.
 */
export async function sendOutbid(toEmail, { auctionTitle, carLabel, newBidAmount, resultUrl }) {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;
  try {
    const subject = `You were outbid – ${carLabel}`;
    const body = `
      <p>Your bid on <strong>${carLabel}</strong> in auction "${auctionTitle}" was exceeded.</p>
      <p>New high bid: <strong>PKR ${Number(newBidAmount).toLocaleString()}</strong>.</p>
      <p><a href="${resultUrl}" style="color: #FFA602;">Place a new bid</a></p>
    `;
    await sendEmail(toEmail, subject, wrapHtml("You were outbid", body));
  } catch (e) {
    Logger.error("Auction email sendOutbid failed", e);
  }
}

/**
 * Send auction won notification.
 */
export async function sendAuctionWon(toEmail, { carLabel, finalPrice, amountDue, resultUrl }) {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;
  try {
    const subject = `You won: ${carLabel}`;
    const body = `
      <p>Congratulations! You won <strong>${carLabel}</strong>.</p>
      <p>Final price: <strong>PKR ${Number(finalPrice).toLocaleString()}</strong>.</p>
      ${amountDue > 0 ? `<p>Amount due within 48 hours: <strong>PKR ${Number(amountDue).toLocaleString()}</strong>.</p>` : ""}
      <p><a href="${resultUrl}" style="color: #FFA602;">View result & pay</a></p>
    `;
    await sendEmail(toEmail, subject, wrapHtml("Auction Won!", body));
  } catch (e) {
    Logger.error("Auction email sendAuctionWon failed", e);
  }
}

/**
 * Send payment reminder (escrow deadline approaching or overdue).
 */
export async function sendPaymentReminder(toEmail, { carLabel, amountDue, deadline, resultUrl }) {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;
  try {
    const subject = `Payment reminder – ${carLabel}`;
    const body = `
      <p>Reminder: Your winning bid on <strong>${carLabel}</strong> has an outstanding payment of <strong>PKR ${Number(amountDue).toLocaleString()}</strong>.</p>
      <p>Payment deadline: ${deadline}.</p>
      <p><a href="${resultUrl}" style="color: #FFA602;">Pay now</a></p>
    `;
    await sendEmail(toEmail, subject, wrapHtml("Payment reminder", body));
  } catch (e) {
    Logger.error("Auction email sendPaymentReminder failed", e);
  }
}

/**
 * Send auction starting soon.
 */
export async function sendAuctionStarting(toEmail, { auctionTitle, startTime, scheduleUrl }) {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;
  try {
    const subject = `Auction starting: ${auctionTitle}`;
    const body = `
      <p>Auction "<strong>${auctionTitle}</strong>" is starting at ${new Date(startTime).toLocaleString()}.</p>
      <p><a href="${scheduleUrl}" style="color: #FFA602;">View schedule</a></p>
    `;
    await sendEmail(toEmail, subject, wrapHtml("Auction starting", body));
  } catch (e) {
    Logger.error("Auction email sendAuctionStarting failed", e);
  }
}

/**
 * Send auction ending soon / ended.
 */
export async function sendAuctionEnding(toEmail, { auctionTitle, endTime, liveUrl }) {
  if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== "true") return;
  try {
    const subject = `Auction ending: ${auctionTitle}`;
    const body = `
      <p>Auction "<strong>${auctionTitle}</strong>" is ending at ${new Date(endTime).toLocaleString()}.</p>
      <p><a href="${liveUrl}" style="color: #FFA602;">Go to live auction</a></p>
    `;
    await sendEmail(toEmail, subject, wrapHtml("Auction ending", body));
  } catch (e) {
    Logger.error("Auction email sendAuctionEnding failed", e);
  }
}
