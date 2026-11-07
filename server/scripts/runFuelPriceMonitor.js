import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import { runFuelPriceMonitorJob } from "../services/fuelPrices/runFuelPriceJob.js";
import Logger from "../utils/logger.js";

dotenv.config();

await connectDB();
try {
  const summary = await runFuelPriceMonitorJob();
  console.log(JSON.stringify(summary, null, 2));
  Logger.info("Manual fuel price monitor finished", summary);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
