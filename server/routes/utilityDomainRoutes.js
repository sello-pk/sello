import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { uploadFile } from "../controllers/settingsController.js";
import { upload } from "../middlewares/multer.js";
import { getAnalyticsSummary, trackAnalyticsEvent } from "../controllers/adminController.js";
import Car from '../models/carModel.js';
import Logger from '../utils/logger.js';

const router = express.Router();

/* -------------------------------- ANALYTICS ------------------------------- */
router.get("/utility/analytics/summary", auth, authorize("admin"), getAnalyticsSummary);
router.post("/utility/analytics/track", auth, trackAnalyticsEvent);

/* --------------------------------- UPLOAD --------------------------------- */
const uploadEither = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (!err && !req.file) {
      upload.single("file")(req, res, next);
    } else {
      next(err);
    }
  });
};
router.post("/utility/upload", auth, uploadEither, uploadFile);

/* ---------------------------------- MAPS ---------------------------------- */
router.get("/utility/maps/geocode", async (req, res) => {
  try {
    const { address } = req.query;
    if (!address) return res.status(400).json({ success: false, message: "Address is required" });
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return res.status(500).json({ success: false, message: "Google Maps API not configured" });
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
    const data = await response.json();
    res.json({ success: data.status === "OK", data: data, message: data.status !== "OK" ? data.error_message : undefined });
  } catch (error) { res.status(500).json({ success: false, message: "Internal server error" }); }
});

/* ---------------------------------- SEO ----------------------------------- */
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = process.env.FRONTEND_URL || process.env.PRODUCTION_URL || 'https://yourdomain.com';
        const cars = await Car.find({ status: 'active', isApproved: true }).select('_id updatedAt').lean().limit(50000);
        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n<url><loc>${baseUrl}</loc><priority>1.0</priority></url>`;
        cars.forEach(car => {
            const lastmod = car.updatedAt ? new Date(car.updatedAt).toISOString() : new Date().toISOString();
            sitemap += `<url><loc>${baseUrl}/cars/${car._id}</loc><lastmod>${lastmod}</lastmod><priority>0.8</priority></url>`;
        });
        sitemap += `</urlset>`;
        res.set('Content-Type', 'application/xml');
        res.send(sitemap);
    } catch (error) { res.status(500).send('Error'); }
});

router.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.FRONTEND_URL || process.env.PRODUCTION_URL || 'https://yourdomain.com';
    const robots = `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${baseUrl}/sitemap.xml`;
    res.set('Content-Type', 'text/plain');
    res.send(robots);
});

export default router;
