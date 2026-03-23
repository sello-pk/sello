import express from "express";
import { auth } from "../middlewares/authMiddleware.js";
import {
  getEscrowById,
  payEscrow,
  raiseEscrowDispute,
} from "../controllers/auctionController.js";

const router = express.Router();

router.post("/pay", auth, payEscrow);
router.post("/:id/dispute", auth, raiseEscrowDispute);
router.get("/:id", auth, getEscrowById);

export default router;
