import express from "express";
import { sendMetaCarsCsvFeed, sendCarsSitemap } from "../controllers/metaCatalogFeedController.js";

const router = express.Router();

router.get("/feed/cars.csv", sendMetaCarsCsvFeed);
// SEO: XML sitemap of live car detail pages (listed in client/public/robots.txt)
router.get("/sitemap-cars.xml", sendCarsSitemap);

export default router;
