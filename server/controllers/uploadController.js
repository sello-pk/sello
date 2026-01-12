import { uploadCloudinary } from "../utils/cloudinary.js";
import Logger from "../utils/logger.js";

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    const maxSize = 20 * 1024 * 1024; // 20MB

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid file type. Only images (JPEG, PNG, WebP, GIF) are allowed.",
      });
    }

    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 20MB.",
      });
    }

    // Multer uses memoryStorage, so file is in req.file.buffer, not req.file.path
    if (!req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: "File buffer not available",
      });
    }

    // Upload to Cloudinary using buffer
    const imageUrl = await uploadCloudinary(req.file.buffer, {
      folder: "uploads",
      quality: 80,
      removeExif: true,
    });

    if (!imageUrl) {
      Logger.error("Cloudinary upload failed", {
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to upload file to cloud storage",
      });
    }

    Logger.info("File uploaded successfully", {
      filename: req.file.originalname,
      url: imageUrl.substring(0, 50) + "...",
    });

    // Return response in format expected by TinyMCE
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        url: imageUrl,
        publicId: imageUrl.split("/").slice(-2).join("/").split(".")[0], // Extract public ID from URL
      },
    });
  } catch (error) {
    Logger.error("Upload Error", error, {
      filename: req.file?.originalname,
      mimetype: req.file?.mimetype,
    });
    return res.status(500).json({
      success: false,
      message: "Internal server error during upload",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
