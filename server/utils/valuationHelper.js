import Car from "../models/carModel.js";
import Logger from "./logger.js";
import fetch from "node-fetch";

/* --------------------------------------------------
   STEP 0: BASELINE ESTIMATION FALLBACK
-------------------------------------------------- */
const getEstimatedBaseline = (vehicleData) => {
  const { make, model, year } = vehicleData;

  // Pakistani market baseline estimates 2024
  const brandBaselines = {
    // Luxury Foreign Brands
    audi: {
      2010: 4500000,
      2011: 4800000,
      2012: 5100000,
      2013: 5400000,
      2014: 5700000,
      2015: 6000000,
    },
    bmw: {
      2010: 4200000,
      2011: 4500000,
      2012: 4800000,
      2013: 5100000,
      2014: 5400000,
      2015: 5700000,
    },
    mercedes: {
      2010: 4400000,
      2011: 4700000,
      2012: 5000000,
      2013: 5300000,
      2014: 5600000,
      2015: 5900000,
    },

    // Japanese Brands (Better Resale)
    toyota: {
      2010: 2800000,
      2011: 3000000,
      2012: 3200000,
      2013: 3400000,
      2014: 3600000,
      2015: 3800000,
    },
    honda: {
      2010: 2600000,
      2011: 2800000,
      2012: 3000000,
      2013: 3200000,
      2014: 3400000,
      2015: 3600000,
    },
    suzuki: {
      2010: 1800000,
      2011: 2000000,
      2012: 2200000,
      2013: 2400000,
      2014: 2600000,
      2015: 2800000,
    },

    // Other Brands
    hyundai: {
      2010: 2200000,
      2011: 2400000,
      2012: 2600000,
      2013: 2800000,
      2014: 3000000,
      2015: 3200000,
    },
    kia: {
      2010: 2100000,
      2011: 2300000,
      2012: 2500000,
      2013: 2700000,
      2014: 2900000,
      2015: 3100000,
    },
  };

  const makeLower = make.toLowerCase();
  const yearNum = Number(year);

  if (brandBaselines[makeLower] && brandBaselines[makeLower][yearNum]) {
    return brandBaselines[makeLower][yearNum];
  }

  // Default fallback based on year
  const yearBaselines = {
    2010: 2500000,
    2011: 2700000,
    2012: 2900000,
    2013: 3100000,
    2014: 3300000,
    2015: 3500000,
    2016: 3700000,
    2017: 3900000,
    2018: 4100000,
    2019: 4300000,
    2020: 4500000,
    2021: 4700000,
    2022: 4900000,
    2023: 5100000,
    2024: 5300000,
    2025: 5500000,
  };

  return yearBaselines[yearNum] || 3000000; // Default 30 lakh
};

/* --------------------------------------------------
   STEP 1: CLEAN OUTLIERS (Very Important)
-------------------------------------------------- */
const removeOutliers = (cars) => {
  if (cars.length < 3) return cars;

  const prices = cars.map((c) => c.price).sort((a, b) => a - b);
  const q1 = prices[Math.floor(prices.length * 0.25)];
  const q3 = prices[Math.floor(prices.length * 0.75)];
  const iqr = q3 - q1;

  return cars.filter(
    (c) => c.price >= q1 - 1.5 * iqr && c.price <= q3 + 1.5 * iqr,
  );
};

/* --------------------------------------------------
   STEP 2: AI ADJUSTMENT (ONLY % BASED)
-------------------------------------------------- */
export const getAIAdjustment = async (vehicleData, baselinePrice) => {
  const rawKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  const apiKey = typeof rawKey === "string" ? rawKey.trim() : "";
  if (!apiKey) {
    Logger.warn(
      "Car valuation: OPENAI_API_KEY (or OPENAI_KEY) is not set; skipping OpenAI — set it on the server to enable GPT refinement.",
    );
    return {
      adjustedPrice: baselinePrice,
      adjustmentPercent: 0,
      reason:
        "Market-only estimate: the server has no OpenAI API key configured, so this result uses listing data and rules only. Add OPENAI_API_KEY to your deployment environment (and billing/credits on the OpenAI account) to enable GPT-4o refinement.",
      confidenceScore: 70,
      usedOpenAI: false,
    };
  }

  const prompt = `
You are a Pakistani car market analyst.

Baseline price from database:
PKR ${baselinePrice}

Vehicle:
Mileage: ${vehicleData.mileage} KM
Condition: ${vehicleData.condition || "Good"}

Rules:
- High mileage (>120k KM): reduce 5–12%
- Very low mileage (<40k KM): increase 3–8%
- Excellent condition: +5%
- Poor condition: -10%
- Normal used car: 0 to -5%

IMPORTANT:
You may adjust ONLY within ±10% of baseline.
Do NOT invent new base price.

Return JSON:
{
 "adjustmentPercent": number,
 "reason": "short explanation",
 "confidenceScore": number
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You adjust car prices based strictly on baseline data. Never hallucinate market prices.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    Logger.error("OpenAI valuation request failed", {
      status: response.status,
      body: errorText?.slice?.(0, 500),
    });
    throw new Error(`OpenAI request failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI response missing content");
  }

  let result = {};
  try {
    result = JSON.parse(content);
  } catch {
    throw new Error("OpenAI response was not valid JSON");
  }

  const adjustment = Math.max(
    -10,
    Math.min(10, Number(result.adjustmentPercent) || 0),
  );
  const adjustedPrice = Math.round(baselinePrice * (1 + adjustment / 100));

  const reasonText =
    typeof result.reason === "string" && result.reason.trim()
      ? result.reason.trim()
      : `Applied a ${adjustment >= 0 ? "+" : ""}${adjustment}% adjustment to the PKR ${baselinePrice.toLocaleString("en-PK")} baseline based on mileage and condition.`;

  return {
    adjustedPrice,
    adjustmentPercent: adjustment,
    reason: reasonText,
    confidenceScore: Number(result.confidenceScore) || 80,
    usedOpenAI: true,
  };
};

/* --------------------------------------------------
   STEP 3: MAIN ESTIMATION LOGIC
-------------------------------------------------- */
export const calculateEstimation = async (vehicleData) => {
  const { make, model, year, mileage, condition } = vehicleData;

  const similarCars = await Promise.race([
    Car.find({
      make: new RegExp(make, "i"),
      model: new RegExp(model, "i"),
      year: { $gte: Number(year) - 2, $lte: Number(year) + 2 },
      status: "active",
    }).select("price mileage year"),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database timeout")), 5000),
    ),
  ]).catch(() => []);

  // If no similar cars, use broader search or fallback
  let baselinePrice = 0;
  let cleanedCars = [];

  if (similarCars.length > 0) {
    // Remove price outliers
    cleanedCars = removeOutliers(similarCars);

    // Calculate baseline average
    const avgPrice =
      cleanedCars.reduce((sum, car) => sum + car.price, 0) / cleanedCars.length;

    baselinePrice = Math.round(avgPrice);
  } else {
    // Fallback: Use broader search or estimated baseline
    const anyCars = await Promise.race([
      Car.find({
        make: new RegExp(make, "i"),
        status: "active",
      })
        .select("price mileage year")
        .limit(10),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database timeout")), 5000),
      ),
    ]).catch(() => []);

    if (anyCars.length > 0) {
      const avgPrice =
        anyCars.reduce((sum, car) => sum + car.price, 0) / anyCars.length;
      baselinePrice = Math.round(avgPrice);
      cleanedCars = anyCars;
    } else {
      // Final fallback: Use estimated baseline based on Pakistani market
      baselinePrice = getEstimatedBaseline(vehicleData);
      cleanedCars = [{ price: baselinePrice }]; // Dummy for confidence calculation
    }
  }

  /* -----------------------------------------
     STEP 4: HARD LOGIC (NOT AI)
  ------------------------------------------*/

  let factor = 1.0;

  // Mileage depreciation curve
  if (mileage > 150000) factor *= 0.88;
  else if (mileage > 120000) factor *= 0.92;
  else if (mileage < 40000) factor *= 1.05;

  const cond =
    typeof condition === "string"
      ? condition.toLowerCase()
      : typeof condition === "object" && condition
        ? String(
            condition.engine ||
              condition.body ||
              condition.interior ||
              condition.tire ||
              condition.suspension ||
              "good",
          ).toLowerCase()
        : "good";
  if (cond === "excellent") factor *= 1.07;
  if (cond === "fair") factor *= 0.9;
  if (cond === "poor") factor *= 0.75;

  baselinePrice = Math.round(baselinePrice * factor);

  /* -----------------------------------------
     STEP 5: AI ADJUSTMENT (Small % Only)
  ------------------------------------------*/

  let aiAdjustment;
  try {
    aiAdjustment = await getAIAdjustment(vehicleData, baselinePrice);
  } catch (error) {
    Logger.error("AI valuation adjustment failed, using baseline:", error);
    aiAdjustment = {
      adjustedPrice: baselinePrice,
      adjustmentPercent: 0,
      reason:
        "AI refinement was skipped or failed (check server logs, OPENAI_API_KEY, and OpenAI billing). Showing market baseline only.",
      confidenceScore: 70,
      usedOpenAI: false,
    };
  }

  const summaryText =
    (aiAdjustment.reason && String(aiAdjustment.reason).trim()) ||
    "Estimate based on similar listings and standard depreciation factors.";

  return {
    averagePrice: aiAdjustment.adjustedPrice,
    minPrice: Math.round(aiAdjustment.adjustedPrice * 0.93),
    maxPrice: Math.round(aiAdjustment.adjustedPrice * 1.07),
    confidenceScore:
      cleanedCars.length >= 5 ? 90 : cleanedCars.length >= 3 ? 75 : 60,
    analysisSummary: summaryText,
    marketContext: {
      similarListingsCount: cleanedCars.length,
      dataSource:
        similarCars.length > 0
          ? "Similar Cars"
          : aiAdjustment.usedOpenAI
            ? "Brand Average + AI"
            : "Brand average (heuristic baseline)",
    },
    isAIPowered: Boolean(aiAdjustment.usedOpenAI),
  };
};

/* --------------------------------------------------
   STEP 6: PRICE ANALYSIS FOR LISTING
-------------------------------------------------- */
export const getPriceAnalysis = async (car) => {
  const estimation = await calculateEstimation({
    make: car.make,
    model: car.model,
    year: car.year,
    mileage: car.mileage,
    condition: car.condition,
  });

  return {
    ...estimation,
    isListed: true,
    listedPrice: car.price,
    priceDifference: car.price - estimation.averagePrice,
    priceDifferencePercent:
      ((car.price - estimation.averagePrice) / estimation.averagePrice) * 100,
  };
};
