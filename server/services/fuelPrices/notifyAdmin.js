import Notification from "../../models/notificationModel.js";
import Logger from "../../utils/logger.js";

export async function notifyFuelAdmins({ title, message, type = "warning", metadata = {} }) {
  try {
    await Notification.create({
      title,
      message,
      type,
      targetRole: "admin",
      actionUrl: "/admin/fuel-prices",
      actionText: "Open fuel prices",
      metadata: {
        system: "fuel_price_automation",
        ...metadata,
      },
    });
  } catch (error) {
    Logger.error("Failed to create fuel-price admin notification", error);
  }
}
