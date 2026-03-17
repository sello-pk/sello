import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import { getEscrowById, payEscrow } from "../controllers/auctionController.js";

const router = express.Router();

router.get("/:id", auth, getEscrowById);
router.post("/pay", auth, payEscrow);

export default router;
