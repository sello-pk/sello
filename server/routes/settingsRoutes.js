import express from "express";
import {
  getAllSettings,
  getSetting,
  upsertSetting,
  deleteSetting,
  uploadFile,
} from "../controllers/settingsController.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import {
  hasPermission,
  hasAnyPermission,
} from "../middlewares/permissionMiddleware.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

// Upload route - available to all authenticated users (merged from uploadRoutes.js)
const uploadEither = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err && !req.file) {
      upload.single("file")(req, res, next);
    } else {
      next(err);
    }
  });
};

router.post("/upload", auth, uploadEither, uploadFile);

// All other routes require admin access
router.use(auth);
router.use(authorize("admin"));

// Get routes - require viewSettings (or broader platform settings permission)
router.get(
  "/",
  hasAnyPermission("viewSettings", "managePlatformSettings"),
  getAllSettings,
);
router.get(
  "/:key",
  hasAnyPermission("viewSettings", "managePlatformSettings"),
  getSetting,
);

// Update/Delete routes - require managePlatformSettings permission
router.post("/", hasPermission("managePlatformSettings"), upsertSetting);
router.put("/:key", hasPermission("managePlatformSettings"), upsertSetting);
router.delete("/:key", hasPermission("managePlatformSettings"), deleteSetting);

export default router;
