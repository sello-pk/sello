import express from "express";
import { sendMetaCarsCsvFeed } from "../controllers/metaCatalogFeedController.js";

const router = express.Router();

router.get("/feed/cars.csv", sendMetaCarsCsvFeed);

export default router;
