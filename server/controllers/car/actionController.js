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

    const carData = {
      ...req.body,
      make: normalizeString(req.body.make),
      model: normalizeString(req.body.model),
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
