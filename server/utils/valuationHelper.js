import Car from "../models/carModel.js";
import Logger from "./logger.js";
import fetch from "node-fetch";

/**
 * Call OpenAI API to get a professional valuation based on market trends
 */
const getAIPriceEstimation = async (vehicleData, baselineEstimation) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "your_openai_api_key_here") {
    Logger.warn("OpenAI API Key not found or invalid. Skipping AI valuation.");
    return null;
  }

  try {
    const prompt = `
      You are an expert Pakistani automotive market analyst. 
      Your task is to provide a highly accurate car valuation based on specific vehicle data and current market trends in Pakistan (platforms like PakWheels and OLX).
      
      Vehicle Details:
      Make: ${vehicleData.make}
      Model: ${vehicleData.model}
      Year: ${vehicleData.year}
      Mileage: ${vehicleData.mileage} KM
      Fuel Type: ${vehicleData.fuelType}
      Transmission: ${vehicleData.transmission || 'N/A'}
      Engine Condition: ${vehicleData.engineCondition || vehicleData.condition?.engine || 'Good'}
      Body Condition: ${vehicleData.bodyCondition || vehicleData.condition?.body || 'Good'}
      Interior Condition: ${vehicleData.interiorCondition || vehicleData.condition?.interior || 'Good'}
      
      Internal Market Data Baseline (from our database):
      Average Price Found: PKR ${baselineEstimation.averagePrice.toLocaleString()}
      Similar Listings Found: ${baselineEstimation.marketContext.similarListingsCount}
      Data Quality: ${baselineEstimation.marketContext.priceIndicator}
      
      Instructions:
      1. Analyze the vehicle data. Adjust the baseline price based on mileage, condition, and market demand in Pakistan.
      2. Factor in Pakistani market nuances (e.g., 'total genuine', 'first owner', 'registration city impact', 'accident-free').
      3. Consider current fuel prices and economic conditions in Pakistan.
      4. ${baselineEstimation.marketContext.similarListingsCount < 3 ? 'NOTE: Limited market data available. Use industry depreciation standards and comparable vehicle analysis.' : 'Use the market data as a strong baseline.'}
      5. Return a JSON object with EXACTLY these fields:
         - averagePrice (Number): Most likely selling price
         - minPrice (Number): Conservative estimate (10-15% below average)
         - maxPrice (Number): Optimistic estimate (10-15% above average)
         - analysisSummary (String): A professional 2-3 sentence analysis explaining the valuation
         - confidenceScore (Number): 1-100 based on data availability and market conditions
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are a professional car valuation expert specialized in the Pakistani market. Always respond in JSON format." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      Logger.error("OpenAI API Error:", errorText);
      return null;
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
      averagePrice: Number(result.averagePrice),
      minPrice: Number(result.minPrice),
      maxPrice: Number(result.maxPrice),
      confidenceScore: Number(result.confidenceScore),
      analysisSummary: String(result.analysisSummary),
      isAIPowered: true
    };
  } catch (error) {
    Logger.error("AI Estimation Exception:", error);
    return null;
  }
};

/**
 * Calculate estimation based on database listings OR AI if available
 */
export const calculateEstimation = async (vehicleData) => {
  const { make, model, year, mileage, condition, fuelType } = vehicleData;

  try {
    // 1. Get Baseline from Database
    const similarCars = await Car.find({
      make: new RegExp(make, "i"),
      model: new RegExp(model, "i"),
      year: { $gte: Number(year) - 2, $lte: Number(year) + 2 },
      status: "active",
    }).select("price mileage year");

    let basePrice = 2000000; 
    let count = similarCars.length;

    if (count >= 3) {
      const sum = similarCars.reduce((acc, car) => acc + car.price, 0);
      basePrice = sum / count;
    } else {
      const yearDiff = new Date().getFullYear() - Number(year);
      basePrice = Math.max(500000, 3000000 - yearDiff * 150000 - (mileage / 1000) * 2000);
    }

    // 2. Adjustments for local calculation (serves as fallback)
    let factor = 1.0;
    const cond = (condition?.engine || condition || "good").toLowerCase();
    if (cond === "excellent") factor *= 1.15;
    if (cond === "fair") factor *= 0.85;
    if (cond === "poor") factor *= 0.7;

    const fuel = (fuelType || "petrol").toLowerCase();
    if (fuel === "hybrid") factor *= 1.2;
    if (fuel === "electric") factor *= 1.3;

    const localEstimation = {
      averagePrice: Math.round(basePrice * factor),
      minPrice: Math.round(basePrice * factor * 0.9),
      maxPrice: Math.round(basePrice * factor * 1.1),
      confidenceScore: count >= 5 ? 90 : count >= 2 ? 75 : 60,
      isAIPowered: false,
      marketContext: {
        similarListingsCount: count,
        priceIndicator: count >= 3 ? "market_based" : "estimate_based",
      },
      analysisSummary: `Based on our database of ${count} similar listings and your vehicle specifications, your ${year} ${make} ${model} is estimated at PKR ${Math.round(basePrice * factor).toLocaleString()}. ${count >= 3 ? 'This valuation is based on real market data.' : 'Limited market data available - estimate based on depreciation model.'}`
    };

    // 3. Attempt to enhance with AI
    const aiEstimation = await getAIPriceEstimation(vehicleData, localEstimation);

    if (aiEstimation) {
      return {
        ...aiEstimation,
        marketContext: localEstimation.marketContext // Keep the listing count context
      };
    }

    // Fallback to local logic if AI unavailable
    return localEstimation;
    
  } catch (error) {
    Logger.error("Error in calculateEstimation:", error);
    throw error;
  }
};

/**
 * Get price analysis for a specific car listing
 */
export const getPriceAnalysis = async (car) => {
  const estimation = await calculateEstimation({
    make: car.make,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    condition: car.condition,
    fuelType: car.fuelType,
    transmission: car.transmission
  });

  const { averagePrice } = estimation;
  const diff = ((car.price - averagePrice) / averagePrice) * 100;

  let label = "fair";
  let color = "blue";
  if (diff < -10) { label = "good_deal"; color = "green"; }
  else if (diff > 10) { label = "high_price"; color = "red"; }

  return {
    ...estimation,
    pricePosition: { diff, label, color }
  };
};
