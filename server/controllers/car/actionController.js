import Car from "../../models/carModel.js";
import User from "../../models/userModel.js";
import { uploadCloudinary } from "../../utils/cloudinary.js";
import Logger from "../../utils/logger.js";
import mongoose from "mongoose";
import { validateRequiredFields } from "../../utils/vehicleFieldConfig.js";

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

export const createCar = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

    const validation = validateRequiredFields(req.body.vehicleType || "Car", req.body);
    if (!validation.isValid) {
      return res.status(400).json({ success: false, message: `Missing: ${validation.missing.join(", ")}` });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadCloudinary(file.buffer, { folder: "sello_cars" }));
      images = await Promise.all(uploadPromises);
    }

    const normalizedEngineCapacity = parseNumericField(req.body.engineCapacity);
    const normalizedHorsepower = parseNumericField(req.body.horsepower);
    const normalizedGeoLocation = parseGeoLocation(req.body.geoLocation);

    if (
      (req.body.vehicleType || "Car") === "Car" &&
      normalizedEngineCapacity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid engineCapacity. Please select a valid numeric range.",
      });
    }

    const carData = {
      ...req.body,
      make: normalizeString(req.body.make),
      model: normalizeString(req.body.model),
      engineCapacity: normalizedEngineCapacity ?? 0,
      horsepower: normalizedHorsepower ?? 0,
      geoLocation: normalizedGeoLocation,
      images,
      postedBy: req.user._id,
      isApproved: true,
      status: "active"
    };

    const car = await Car.create(carData);
    await User.findByIdAndUpdate(req.user._id, { $push: { carsPosted: car._id } });

    return res.status(201).json({ success: true, data: car });
  } catch (error) {
    Logger.error("Create Car Error", error);
    return res.status(500).json({ success: false, message: error.message });
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
      const uploadPromises = req.files.map((file) => uploadCloudinary(file.buffer, { folder: "sello_cars" }));
      newImageUrls = await Promise.all(uploadPromises);
    }
    const images = [...existingImages, ...newImageUrls];

    const normalizedEngineCapacity = parseNumericField(req.body.engineCapacity);
    const normalizedHorsepower = parseNumericField(req.body.horsepower);
    const normalizedGeoLocation = parseGeoLocation(req.body.geoLocation);

    if (
      (req.body.vehicleType || car.vehicleType || "Car") === "Car" &&
      normalizedEngineCapacity === undefined &&
      (req.body.engineCapacity === undefined || req.body.engineCapacity === "")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid engineCapacity. Please select a valid numeric range.",
      });
    }

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
      engineCapacity: normalizedEngineCapacity !== undefined ? normalizedEngineCapacity : car.engineCapacity,
      horsepower: normalizedHorsepower !== undefined ? normalizedHorsepower : (car.horsepower ?? 0),
      geoLocation: normalizedGeoLocation,
      images,
    };
    delete updateData.postedBy;
    delete updateData._id;
    delete updateData.__v;

    const updated = await Car.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    Logger.error("Edit Car Error", error);
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
