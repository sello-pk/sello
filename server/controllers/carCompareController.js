import Car from "../models/carModel.js";
import Logger from "../utils/logger.js";

const fields = ("_id title make model variant year condition price mileage bodyType colorExterior " +
  "city location engineCapacity fuelType transmission horsepower numberOfCylinders carDoors features " +
  "regionalSpec ownerType warranty status updatedAt isSold isAutoDeleted expiryDate").split(" ");
const visibility = {
  $and: [
    { $or: [{ isApproved: true }, { isApproved: { $exists: false } }] },
    { $or: [{ listingType: "normal" }, { listingType: { $exists: false } }] },
    { $or: [{ vehicleType: "Car" }, { vehicleType: { $exists: false } }] },
  ],
};

export function parseComparisonIds(value) {
  if (typeof value !== "string" || value.length > 99) return null;
  const ids = value.toLowerCase().split(",");
  return ids.every((id) => /^[a-f0-9]{24}$/.test(id)) &&
    new Set(ids).size === ids.length ? ids : null;
}

export function comparisonResults(ids, records, now = new Date()) {
  const byId = new Map(records.map((record) => [String(record._id), record]));
  return ids.map((id) => {
    const record = byId.get(id);
    if (!record) return { id, status: "missing" };
    if (record.isSold || record.isAutoDeleted ||
        (record.status && record.status !== "active") ||
        (record.expiryDate && new Date(record.expiryDate) <= now)) {
      return { id, status: "unavailable" };
    }

    const car = Object.fromEntries(fields.filter((field) =>
      !["isSold", "isAutoDeleted", "expiryDate"].includes(field) && Object.hasOwn(record, field)
    ).map((field) => [field, record[field]]));
    car.images = Array.isArray(record.images)
      ? record.images.filter((url) => typeof url === "string" && /^https?:\/\//i.test(url)).slice(0, 1)
      : [];
    return { id, status: "found", car };
  });
}

export async function getCarComparison(req, res) {
  const ids = parseComparisonIds(req.query.ids);
  if (!ids) {
    return res.status(400).json({ success: false, message: "Supply one to four distinct car listing IDs." });
  }

  try {
    const records = await Car.find({
      ...visibility,
      _id: { $in: ids },
      status: { $ne: "deleted" },
    }).select(fields.join(" ")).slice("images", 1).maxTimeMS(5000).lean();
    res.set("Cache-Control", "no-store");
    return res.json({ success: true, data: { listings: comparisonResults(ids, records) } });
  } catch (error) {
    Logger.error("Car comparison lookup failed", error);
    return res.status(500).json({ success: false, message: "Could not load the selected cars." });
  }
}
