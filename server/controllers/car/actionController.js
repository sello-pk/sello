import Car from "../../models/carModel.js";
import User from "../../models/userModel.js";
import { uploadListingImagesToCloudinary } from "../../utils/cloudinary.js";
import Logger from "../../utils/logger.js";
import mongoose from "mongoose";
import { 
  validateRequiredFields, 
  getRequiredFields, 
  getOptionalFields 
} from "../../utils/vehicleFieldConfig.js";
import {
  LISTING_MAX_TOTAL_BYTES,
  MSG_IMAGE_TOTAL_EXCEEDED,
} from "../../constants/listingUpload.js";

/**
 * Upload listing images with size check + bounded Cloudinary concurrency
 * (15 parallel uploads cause 502 / timeout — see uploadListingImagesToCloudinary).
 */
async function uploadCarImagesToCloudinary(files) {
  if (!files || files.length === 0) return [];
  const totalBytes = files.reduce((sum, f) => sum + (f.buffer?.length || 0), 0);
  if (totalBytes > LISTING_MAX_TOTAL_BYTES) {
    const err = new Error(MSG_IMAGE_TOTAL_EXCEEDED);
    err.statusCode = 400;
    throw err;
  }
  try {
    return await uploadListingImagesToCloudinary(files, {
      folder: "sello_cars",
    });
  } catch (err) {
    const code = err?.http_code ?? err?.error?.http_code;
    const friendly =
      code === 502 || code === 503
        ? "Image service was busy. Please try again with fewer photos or wait a moment."
        : err?.name === "TimeoutError" || code === 499
          ? "Image upload timed out. Try uploading fewer images at once or smaller files."
          : err?.message || "Image upload failed.";
    const wrapped = new Error(friendly);
    wrapped.statusCode = 503; // retryable / service busy
    wrapped.cause = err;
    Logger.error("Cloudinary listing upload failed", err);
    throw wrapped;
  }
}

const normalizeString = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

const parseNumericField = (value) => {
  if (value === null || value === undefined || value === "") return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return value;

  const normalized = String(value).replace(/,/g, "").trim();
  // Parse only positive numeric tokens. Hyphen in ranges like 1500-1999 is a separator, not a negative sign.
  const matches = normalized.match(/\d+(\.\d+)?/g);
  if (!matches || matches.length === 0) return undefined;

  const numbers = matches.map(Number).filter((n) => Number.isFinite(n));
  if (numbers.length === 0) return undefined;
  if (numbers.length >= 2 && normalized.includes("-")) {
    // For ranges, use midpoint (e.g., 1500-1999 => 1750)
    return Math.round((numbers[0] + numbers[1]) / 2);
  }
  return numbers[0];
};

/** Multer / multipart can surface duplicate fields as arrays — use last value. */
const firstMultipartScalar = (v) => {
  if (v === undefined || v === null) return v;
  if (Array.isArray(v)) return v.length ? v[v.length - 1] : "";
  return v;
};

/** Strip spaces/dashes so client can send "0300-1234567" and schema still validates. */
const normalizeListingPhone = (v) => {
  const s = firstMultipartScalar(v);
  if (s === undefined || s === null) return s;
  return String(s).replace(/[\s-]/g, "").trim();
};

const parseGeoLocation = (rawGeoLocation) => {
  const defaultCoordinates = [74.3587, 31.5204]; // Lahore fallback
  if (!rawGeoLocation) {
    return { type: "Point", coordinates: defaultCoordinates };
  }

  let parsed = rawGeoLocation;
  if (typeof rawGeoLocation === "string") {
    try {
      parsed = JSON.parse(rawGeoLocation);
    } catch {
      const parts = rawGeoLocation
        .split(",")
        .map((part) => Number(part.trim()))
        .filter((num) => Number.isFinite(num));
      parsed = parts.length === 2 ? parts : null;
    }
  }

  let coordinates = null;
  if (Array.isArray(parsed) && parsed.length === 2) {
    coordinates = parsed.map(Number);
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray(parsed.coordinates) &&
    parsed.coordinates.length === 2
  ) {
    coordinates = parsed.coordinates.map(Number);
  }

  if (!coordinates || coordinates.some((num) => !Number.isFinite(num))) {
    return { type: "Point", coordinates: defaultCoordinates };
  }

  const [lng, lat] = coordinates;
  if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
    return { type: "Point", coordinates: defaultCoordinates };
  }

  return { type: "Point", coordinates: [lng, lat] };
};

/**
 * Filter data based on vehicle type configuration to only keep relevant fields.
 */
const scrubVehicleData = (vehicleType, data) => {
  const vn = vehicleType || "Car";
  const required = getRequiredFields(vn);
  const optional = getOptionalFields(vn);
  const allowed = new Set([
    ...required, 
    ...optional, 
    "vehicleType", 
    "vehicleTypeCategory", 
    "postedBy", 
    "images", 
    "status", 
    "listingType", 
    "geoLocation", 
    "isApproved",
    "isSold",
    "soldAt",
    "soldDate",
    "autoDeleteDate",
    "expiryDate",
    "actualSalePrice",
    "views",
    "featured"
  ]);

  const scrubbed = {};
  Object.keys(data).forEach((key) => {
    if (allowed.has(key)) {
      scrubbed[key] = data[key];
    }
  });

  // Ensure mandatory schema internal fields are maintained
  scrubbed.vehicleType = vn;
  
  return scrubbed;
};

export const createCar = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    const requestStartedAt = Date.now();

    if (req.body.contactNumber !== undefined) {
      req.body.contactNumber = firstMultipartScalar(req.body.contactNumber);
    }
    if (req.body.whatsappNumber !== undefined) {
      req.body.whatsappNumber = firstMultipartScalar(req.body.whatsappNumber);
    }
    if (req.body.contactNumber != null && req.body.contactNumber !== "") {
      const n = normalizeListingPhone(req.body.contactNumber);
      if (n) req.body.contactNumber = n;
    }
    if (req.body.whatsappNumber != null && req.body.whatsappNumber !== "") {
      req.body.whatsappNumber = normalizeListingPhone(req.body.whatsappNumber) || "";
    }

    const validation = validateRequiredFields(req.body.vehicleType || "Car", req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: `Missing: ${validation.missing.join(", ")}` });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadCarImagesToCloudinary(req.files);
    }

    const normalizedHorsepower = parseNumericField(req.body.horsepower);
    const normalizedGeoLocation = parseGeoLocation(req.body.geoLocation);

    const carData = {
      ...req.body,
      make: normalizeString(req.body.make),
      model: normalizeString(req.body.model),
      horsepower: normalizedHorsepower ?? 0,
      geoLocation: normalizedGeoLocation,
      images,
      postedBy: req.user._id,
      isApproved: true,
      status: "active"
    };
    if (req.body.engineCapacity !== undefined && req.body.engineCapacity !== "") {
      const normalizedEngineCapacity = parseNumericField(req.body.engineCapacity);
      if (normalizedEngineCapacity !== undefined) carData.engineCapacity = normalizedEngineCapacity;
    }
    if (req.body.regionalSpec !== undefined && req.body.regionalSpec !== "") carData.regionalSpec = req.body.regionalSpec;

    // Apply scrubbing based on vehicle type
    const scrubbedData = scrubVehicleData(req.body.vehicleType || "Car", carData);

    // Idempotency guard: prevent accidental duplicate posts caused by retries/double-clicks.
    const duplicateWindowMinutes = Math.max(
      1,
      parseInt(process.env.CREATE_CAR_DEDUP_WINDOW_MINUTES, 10) || 15,
    );
    const since = new Date(Date.now() - duplicateWindowMinutes * 60 * 1000);
    const recentDuplicate = await Car.findOne({
      postedBy: req.user._id,
      title: carData.title,
      make: carData.make,
      model: carData.model,
      year: Number(carData.year),
      price: Number(carData.price),
      createdAt: { $gte: since },
      status: { $ne: "deleted" },
    })
      .sort({ createdAt: -1 })
      .lean();
    if (recentDuplicate) {
      Logger.warn("Create car deduplicated recent request", {
        userId: req.user._id,
        carId: recentDuplicate._id,
        windowMinutes: duplicateWindowMinutes,
      });
      return res.status(200).json({
        success: true,
        data: recentDuplicate,
        deduplicated: true,
        message: "Your listing was already created recently.",
      });
    }

    const car = await Car.create(scrubbedData);
    await User.findByIdAndUpdate(req.user._id, { $push: { carsPosted: car._id } });

    Logger.info("Create car completed", {
      userId: req.user._id,
      carId: car._id,
      imageCount: images.length,
      durationMs: Date.now() - requestStartedAt,
    });

    return res.status(201).json({ success: true, data: car });
  } catch (error) {
    Logger.error("Create Car Error", error);
    const status =
      typeof error.statusCode === "number" &&
      error.statusCode >= 400 &&
      error.statusCode < 600
        ? error.statusCode
        : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

export const editCar = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) return res.status(404).json({ success: false, message: "Not found" });

    if (car.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (req.body.contactNumber !== undefined) {
      req.body.contactNumber = firstMultipartScalar(req.body.contactNumber);
    }
    if (req.body.whatsappNumber !== undefined) {
      req.body.whatsappNumber = firstMultipartScalar(req.body.whatsappNumber);
    }
    if (req.body.contactNumber != null && req.body.contactNumber !== "") {
      const n = normalizeListingPhone(req.body.contactNumber);
      if (n) req.body.contactNumber = n;
    }
    if (req.body.whatsappNumber != null && req.body.whatsappNumber !== "") {
      req.body.whatsappNumber = normalizeListingPhone(req.body.whatsappNumber) || "";
    }

    const validation = validateRequiredFields(req.body.vehicleType || car.vehicleType || "Car", req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: `Missing: ${validation.missing.join(", ")}` });
    }

    let existingImages = [];
    if (req.body.existingImages) {
      existingImages = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
    } else if (req.body["existingImages[]"]) {
      const raw = req.body["existingImages[]"];
      existingImages = Array.isArray(raw) ? raw : [raw];
    }
    existingImages = existingImages.filter((url) => url && typeof url === "string" && url.trim());

    let newImageUrls = [];
    if (req.files && req.files.length > 0) {
      newImageUrls = await uploadCarImagesToCloudinary(req.files);
    }
    const newImagesFirst = req.body.newImagesFirst === "true";
    const images = newImagesFirst ? [...newImageUrls, ...existingImages] : [...existingImages, ...newImageUrls];

    const normalizedHorsepower = parseNumericField(req.body.horsepower);
    const normalizedGeoLocation = parseGeoLocation(req.body.geoLocation);

    const yearNum = req.body.year !== undefined && req.body.year !== "" ? parseInt(req.body.year, 10) : car.year;
    const priceNum = req.body.price !== undefined && req.body.price !== "" ? parseFloat(req.body.price) : car.price;
    const mileageNum = req.body.mileage !== undefined && req.body.mileage !== "" ? parseNumericField(req.body.mileage) : car.mileage;

    const updateData = {
      ...req.body,
      make: normalizeString(req.body.make),
      model: normalizeString(req.body.model),
      year: Number.isFinite(yearNum) ? yearNum : car.year,
      price: Number.isFinite(priceNum) ? priceNum : car.price,
      mileage: Number.isFinite(mileageNum) ? mileageNum : car.mileage,
      horsepower: normalizedHorsepower !== undefined ? normalizedHorsepower : (car.horsepower ?? 0),
      geoLocation: normalizedGeoLocation,
      images,
    };
    if (req.body.engineCapacity !== undefined && req.body.engineCapacity !== "") {
      const normalizedEngineCapacity = parseNumericField(req.body.engineCapacity);
      updateData.engineCapacity = normalizedEngineCapacity !== undefined ? normalizedEngineCapacity : car.engineCapacity;
    } else if (req.body.engineCapacity === "") {
      updateData.engineCapacity = undefined;
    }
    if (req.body.regionalSpec !== undefined) updateData.regionalSpec = req.body.regionalSpec || null;
    delete updateData.postedBy;
    delete updateData._id;
    delete updateData.__v;

    // Apply scrubbing based on vehicle type
    const finalUpdateData = scrubVehicleData(
      req.body.vehicleType || car.vehicleType || "Car", 
      updateData
    );

    // Never drop contact fields: scrub uses a whitelist; multipart quirks must not omit phones.
    if (Object.prototype.hasOwnProperty.call(req.body, "contactNumber")) {
      const normalizedContact = normalizeListingPhone(req.body.contactNumber);
      if (normalizedContact) finalUpdateData.contactNumber = normalizedContact;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "whatsappNumber")) {
      const w = normalizeListingPhone(req.body.whatsappNumber);
      finalUpdateData.whatsappNumber = w === undefined || w === null ? "" : w;
    }

    const updated = await Car.findByIdAndUpdate(id, finalUpdateData, { new: true, runValidators: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    Logger.error("Edit Car Error", error);
    const status =
      typeof error.statusCode === "number" &&
      error.statusCode >= 400 &&
      error.statusCode < 600
        ? error.statusCode
        : 500;
    return res.status(status).json({ success: false, message: error.message });
  }
};

const SOLD_AUTO_DELETE_DAYS =
  parseInt(process.env.SOLD_LISTING_AUTO_DELETE_DAYS, 10) || 30;

/**
 * PUT /cars/:carId/sold
 * Body: { isSold: boolean, actualSalePrice?: number }
 * Marks listing as sold (or back to available if isSold is false).
 */
export const markCarAsSold = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { carId } = req.params;
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const ownerId = car.postedBy?.toString?.() ?? String(car.postedBy);
    const userId = req.user._id?.toString?.() ?? String(req.user._id);
    if (ownerId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const { isSold, actualSalePrice } = req.body;
    const markSold = isSold === true || isSold === "true";

    if (markSold) {
      const now = new Date();
      car.isSold = true;
      car.soldAt = now;
      car.soldDate = now;
      car.status = "sold";
      car.autoDeleteDate = new Date(
        now.getTime() + SOLD_AUTO_DELETE_DAYS * 24 * 60 * 60 * 1000,
      );
      car.isAutoDeleted = false;
      if (actualSalePrice !== undefined && actualSalePrice !== null && actualSalePrice !== "") {
        const n = Number(actualSalePrice);
        if (Number.isFinite(n) && n >= 0) car.actualSalePrice = n;
      }
    } else {
      car.isSold = false;
      car.soldAt = null;
      car.soldDate = null;
      car.autoDeleteDate = null;
      car.status = "active";
      // Optional: clear actualSalePrice when marking available again
      if (req.body.clearActualSalePrice === true) {
        car.actualSalePrice = null;
      }
    }

    await car.save();
    return res.status(200).json({ success: true, data: car });
  } catch (error) {
    Logger.error("Mark Car As Sold Error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /cars/:carId/relist
 * Puts a sold (or expired) listing back as active.
 */
export const relistCar = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { carId } = req.params;
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ success: false, message: "Car not found" });
    }

    const ownerId = car.postedBy?.toString?.() ?? String(car.postedBy);
    const userId = req.user._id?.toString?.() ?? String(req.user._id);
    if (ownerId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (car.status === "deleted" || car.isAutoDeleted) {
      return res.status(400).json({
        success: false,
        message: "Cannot relist a deleted listing",
      });
    }

    car.isSold = false;
    car.soldAt = null;
    car.soldDate = null;
    car.autoDeleteDate = null;
    car.status = "active";
    car.actualSalePrice = null;
    // Refresh expiry if your app sets expiryDate on activate — optional extension
    // car.expiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    await car.save();
    return res.status(200).json({ success: true, data: car });
  } catch (error) {
    Logger.error("Relist Car Error", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id);
    if (!car) return res.status(404).json({ success: false, message: "Not found" });

    if (car.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    car.status = "deleted";
    await car.save();
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
