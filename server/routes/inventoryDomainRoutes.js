import express from "express";
import {
  createCar, deleteCar, editCar, getAllCars, getFilteredCars, getMyCars, getSingleCar, markCarAsSold, relistCar, getCarCountsByMake
} from "../controllers/carController.js";
import {
  createValuation, getUserValuationHistory, getAllValuationsAdmin, getValuationById, deleteValuation
} from "../controllers/valuationController.js";
import {
  getVehicleTypes, getFieldsForType
} from "../controllers/categoryController.js";
import {
    getSimilarListings, trackRecentlyViewed, getRecentlyViewed, getRecommendedListings
} from '../controllers/recommendationsController.js';
import { upload } from "../middlewares/multer.js";
import { auth, authorize } from "../middlewares/authMiddleware.js";
import { validateObjectId } from "../middlewares/validationMiddleware.js";
import { cache, cacheKeys, invalidateCache } from "../middlewares/cacheMiddleware.js";

const router = express.Router();

/* ---------------------------------- CARS ---------------------------------- */
// Public
router.get("/cars", cache(300, cacheKeys.carListings), getAllCars);
router.get("/cars/filter", cache(300, cacheKeys.carListings), getFilteredCars);
router.get("/cars/stats/counts-by-make", cache(1800, () => "cache:cars:stats:counts-by-make"), getCarCountsByMake);
router.get("/cars/:id", validateObjectId('id'), cache(600, cacheKeys.car), getSingleCar);

// Actions
router.post("/cars", auth, upload.array("images", 10), async (req, res, next) => {
    await invalidateCache("cache:cars:*");
    next();
}, createCar);

router.put("/cars/:id", auth, validateObjectId('id'), upload.array("images", 10), async (req, res, next) => {
    await invalidateCache(`cache:cars:${req.params.id}`);
    await invalidateCache("cache:cars:list:*");
    next();
}, editCar);

router.put("/cars/:carId/sold", auth, validateObjectId('carId'), async (req, res, next) => {
    await invalidateCache(`cache:cars:${req.params.carId}`);
    await invalidateCache("cache:cars:list:*");
    next();
}, markCarAsSold);

router.post("/cars/:carId/relist", auth, validateObjectId('carId'), async (req, res, next) => {
    await invalidateCache(`cache:cars:${req.params.carId}`);
    await invalidateCache("cache:cars:list:*");
    next();
}, relistCar);

router.delete("/cars/:id", auth, validateObjectId('id'), async (req, res, next) => {
    await invalidateCache(`cache:cars:${req.params.id}`);
    await invalidateCache("cache:cars:list:*");
    next();
}, deleteCar);

router.get("/cars/my/listings", auth, getMyCars);

/* ------------------------------- VALUATIONS ------------------------------- */
router.post("/valuations", (req, res, next) => {
  auth(req, res, (err) => { next(); });
}, createValuation);
router.get("/valuations/my-history", auth, getUserValuationHistory);
router.get("/valuations/:id", validateObjectId('id'), getValuationById);
// Admin
router.get("/valuations/admin/all", auth, authorize("admin"), getAllValuationsAdmin);
router.delete("/valuations/admin/:id", auth, authorize("admin"), validateObjectId('id'), deleteValuation);

/* --------------------------- VEHICLE ATTRIBUTES --------------------------- */
router.get("/vehicle-attributes/types", getVehicleTypes);
router.get("/vehicle-attributes/types/:id/fields", getFieldsForType);

/* ---------------------------- RECOMMENDATIONS ----------------------------- */
router.get("/recommendations/similar/:carId", getSimilarListings);
router.post("/recommendations/viewed/:carId", auth, trackRecentlyViewed);
router.get("/recommendations/viewed", auth, getRecentlyViewed);
router.get("/recommendations/recommended", auth, getRecommendedListings);

export default router;
