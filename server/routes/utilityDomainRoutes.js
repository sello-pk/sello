import express from "express";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { hasAnyPermission } from "../middlewares/permissionMiddleware.js";
import { uploadFile } from "../controllers/settingsController.js";
import { upload } from "../middlewares/multer.js";
import { getAnalyticsSummary, trackAnalyticsEvent } from "../controllers/adminController.js";
import Car from '../models/carModel.js';
import Logger from '../utils/logger.js';
import dbCache from '../utils/dbCache.js';

const router = express.Router();

/* -------------------------------- ANALYTICS ------------------------------- */
router.get(
  "/utility/analytics/summary",
  auth,
  authorize("admin"),
  hasAnyPermission("viewAnalytics", "createReports", "exportReports"),
  getAnalyticsSummary,
);
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
        // Check cache first — sitemap regenerated on schedule, not per-request
        const CACHE_KEY = 'sitemap_xml_v1';
        const cached = await dbCache.get(CACHE_KEY);
        if (cached) {
            res.set('Content-Type', 'application/xml');
            res.set('X-Cache', 'HIT');
            return res.send(cached);
        }

        const baseUrl = (process.env.FRONTEND_URL || process.env.PRODUCTION_URL || 'https://sello.pk').replace(/\/+$/, '');
        const now = new Date().toISOString();

        const cars = await Car.find({ status: 'active', isApproved: true })
            .select('_id updatedAt')
            .lean()
            .limit(5000);

        const parts = [
            `<?xml version="1.0" encoding="UTF-8"?>`,
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
            `<url><loc>${baseUrl}</loc><lastmod>${now}</lastmod><priority>1.0</priority></url>`,
        ];

        for (const car of cars) {
            const lastmod = car.updatedAt ? new Date(car.updatedAt).toISOString() : now;
            const slugify = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            const make = slugify(car.make);
            const model = slugify(car.model);
            const year = car.year || "";
            const city = slugify(car.city || car.location || "");
            let carPath = `/cars/${car._id}`;
            if (make || model || year) {
                const slugParts = [make, model, year, "for-sale-in", city].filter(Boolean);
                carPath = `/cars/${slugParts.join("-")}-${car._id}`;
            }
            parts.push(`<url><loc>${baseUrl}${carPath}</loc><lastmod>${lastmod}</lastmod><priority>0.7</priority></url>`);
        }

        parts.push(`</urlset>`);
        const sitemap = parts.join('');

        // Cache for 6 hours — sitemap changes slowly
        await dbCache.set(CACHE_KEY, sitemap, 21600);

        res.set('Content-Type', 'application/xml');
        res.set('X-Cache', 'MISS');
        res.send(sitemap);
    } catch (error) {
        Logger.error('Sitemap generation error', error);
        res.status(500).send('Error generating sitemap');
    }
});

router.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.FRONTEND_URL || process.env.PRODUCTION_URL || 'https://yourdomain.com';
    const robots = `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${baseUrl}/sitemap.xml`;
    res.set('Content-Type', 'text/plain');
    res.send(robots);
});

export default router;
