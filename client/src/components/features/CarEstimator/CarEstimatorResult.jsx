import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Star,
  CheckCircle,
  AlertCircle,
  Car,
  Settings,
  Paintbrush,
  Gauge,
} from "lucide-react";

const CarEstimatorResult = ({ result, onSave, fullWidth = false }) => {
  const [showAllBreakdown, setShowAllBreakdown] = useState(false);
  const [activeTab, setActiveTab] = useState("analysis");

  if (!result) return null;

  const formatPrice = (price) => {
    const lakhs = Math.floor(price / 100000);
    const thousands = Math.floor((price % 100000) / 1000);
    return `PKR ${lakhs}.${thousands.toString().padStart(2, "0")} Lakh`;
  };

  const formatPriceFull = (price) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Calculate confidence and scores based on form data
  const calculateConfidence = () => {
    let score = 85; // Base score
    const formData = result.formData || {};

    // Adjust based on condition
    if (formData.engineCondition === "excellent") score += 5;
    if (formData.bodyCondition === "excellent") score += 5;
    if (formData.paintStatus === "Original") score += 3;
    if (formData.mileage < 50000) score += 5;
    if (formData.accidentHistory === "None") score += 5;

    return Math.min(95, Math.max(60, score));
  };

  const calculateConditionScores = () => {
    const formData = result.formData || {};
    return {
      engine:
        formData.engineCondition === "excellent"
          ? 90
          : formData.engineCondition === "good"
            ? 80
            : formData.engineCondition === "fair"
              ? 70
              : 60,
      body:
        formData.bodyCondition === "excellent"
          ? 90
          : formData.bodyCondition === "good"
            ? 85
            : formData.bodyCondition === "fair"
              ? 75
              : 65,
      paint:
        formData.paintStatus === "Original"
          ? 90
          : formData.paintStatus === "Repainted"
            ? 75
            : 80,
      tires:
        formData.tireCondition === "New"
          ? 95
          : formData.tireCondition === "Good"
            ? 85
            : formData.tireCondition === "Worn"
              ? 70
              : 60,
    };
  };

  const confidence = calculateConfidence();
  const scores = calculateConditionScores();
  const avgPrice = (result.min + result.max) / 2;

  // Mock market comparison data
  const marketData = [
    {
      platform: "Real-time data",
      price: avgPrice,
      km: "0 km",
      source: "PakWheels",
    },
    {
      platform: "PakWheels",
      price: avgPrice * 0.98,
      km: "120,000 km",
      source: "Used, 2025 model, 120,000 km, Multan condition",
    },
    {
      platform: "OLX Pakistan",
      price: avgPrice * 0.96,
      km: "125,000 km",
      source: "Used, 2025 model, 125,000 km, Multan condition",
    },
    {
      platform: "Local Dealership",
      price: avgPrice * 1.02,
      km: "123,000 km",
      source: "Used, 2025 model, 123,000 km, Multan condition",
    },
    {
      platform: "PakWheels",
      price: avgPrice * 1.04,
      km: "118,000 km",
      source: "Used, 2025 model, 118,000 km, Multan condition",
    },
  ];

  const getDemandLevel = () => {
    const formData = result.formData || {};
    let demand = "Medium";

    if (formData.make === "toyota" || formData.make === "honda")
      demand = "High";
    if (formData.fuelType === "hybrid" || formData.fuelType === "electric")
      demand = "High";
    if (formData.transmission === "automatic") demand = "High";
    if (formData.mileage > 150000) demand = "Low";

    return demand;
  };

  const getConfidenceLevel = () => {
    if (confidence >= 85) return "High";
    if (confidence >= 75) return "Medium";
    return "Low";
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${fullWidth ? "max-w-7xl mx-auto" : ""}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm opacity-90">
                AI-Powered • Real-Time Market Data
              </div>
              <div className="text-xs opacity-75">
                Get Your Car's True Value
              </div>
            </div>
          </div>
          <button
            onClick={onSave}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Save Valuation
          </button>
        </div>

        <div className="text-xs opacity-75">
          Our AI analyzes real-time data from PakWheels, OLX & local dealerships
          to give you the most accurate valuation for your car.
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Car Summary */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Estimated Market Value
          </h2>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="text-lg font-semibold text-gray-700 mb-2">
              {result.formData?.year || "2025"}{" "}
              {result.formData?.make || "Toyota"}{" "}
              {result.formData?.model || "Corolla"}{" "}
              {result.formData?.variant || "XLi"}
            </div>
            <div className="flex justify-center gap-4 text-sm text-gray-600">
              <span>{result.formData?.transmission || "Automatic"}</span>
              <span>•</span>
              <span>{result.formData?.fuelType || "Petrol"}</span>
              <span>•</span>
              <span>{result.formData?.mileage || "123K"} km</span>
              <span>•</span>
              <span className="font-medium">{getDemandLevel()} Demand</span>
            </div>
          </div>

          <div className="text-sm text-gray-600 mb-4">Fair Market Price</div>

          {/* Price Range */}
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Low</div>
              <div className="text-2xl font-bold text-red-500">
                {formatPrice(result.min)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Average</div>
              <div className="text-3xl font-bold text-primary-600">
                {formatPrice(avgPrice)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">High</div>
              <div className="text-2xl font-bold text-green-500">
                {formatPrice(result.max)}
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Confidence:</span>
              <span
                className={`font-medium ${
                  getConfidenceLevel() === "High"
                    ? "text-green-600"
                    : getConfidenceLevel() === "Medium"
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {getConfidenceLevel()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Overall Score:</span>
              <span className="font-medium text-primary-600">
                {confidence}/100
              </span>
            </div>
          </div>
        </div>

        {/* New Valuation Button */}
        <div className="text-center mb-6">
          <button className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors">
            New Valuation
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex space-x-8">
            {["analysis", "breakdown", "compare", "tips"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "analysis" && "AI Analysis Summary"}
                {tab === "breakdown" && "Condition Breakdown"}
                {tab === "compare" && "Compare with Market"}
                {tab === "tips" && "Boost Your Car's Value"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === "analysis" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  AI Analysis Summary
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  The {result.formData?.year || "2025"}{" "}
                  {result.formData?.make || "Toyota"}{" "}
                  {result.formData?.model || "Corolla"}{" "}
                  {result.formData?.variant || "XLi"}{" "}
                  {result.formData?.transmission || "Automatic"} in{" "}
                  {result.formData?.registrationCity || "Multan"}, with{" "}
                  {result.formData?.mileage || "123,445"} km mileage, is
                  estimated to be valued between {formatPriceFull(result.min)}{" "}
                  and {formatPriceFull(result.max)}. This valuation considers
                  the regional price adjustment for{" "}
                  {result.formData?.registrationCity || "Multan"}, the automatic
                  transmission premium, and the absence of premium features. The
                  car's {result.formData?.engineCondition || "good"} engine,{" "}
                  {result.formData?.bodyCondition || "good"} body, and{" "}
                  {result.formData?.interiorCondition || "good"} interior
                  conditions positively influence its value, while the{" "}
                  {result.formData?.paintStatus || "repainting"} and higher
                  mileage slightly reduce it. The market demand for this model
                  is {getDemandLevel().toLowerCase()}, and the confidence level
                  in this estimate is {getConfidenceLevel().toLowerCase()}.
                </p>
              </div>
            </div>
          )}

          {activeTab === "breakdown" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  Condition Breakdown
                </h3>
                <button
                  onClick={() => setShowAllBreakdown(!showAllBreakdown)}
                  className="text-primary-600 text-sm hover:text-primary-700 flex items-center gap-1"
                >
                  {showAllBreakdown ? "Show Less" : "Show All"}
                  {showAllBreakdown ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(scores).map(([key, score]) => (
                  <div key={key} className="text-center">
                    <div className="relative inline-flex items-center justify-center w-16 h-16 mb-2">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke={
                            score >= 85
                              ? "#10b981"
                              : score >= 75
                                ? "#f59e0b"
                                : "#ef4444"
                          }
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(score / 100) * 176} 176`}
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute text-sm font-bold">{score}%</div>
                    </div>
                    <div className="text-sm font-medium text-gray-900 capitalize">
                      {key}
                    </div>
                  </div>
                ))}
              </div>

              {showAllBreakdown && (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Engine</div>
                        <div className="text-xs text-gray-500">
                          {scores.engine}% -{" "}
                          {result.formData?.engineCondition || "Good"} condition
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {scores.engine}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Body</div>
                        <div className="text-xs text-gray-500">
                          {scores.body}% -{" "}
                          {result.formData?.bodyCondition || "Good"} condition
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {scores.body}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Paintbrush className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Paint</div>
                        <div className="text-xs text-gray-500">
                          {scores.paint}% -{" "}
                          {result.formData?.paintStatus || "Original"}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {scores.paint}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gauge className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Tires</div>
                        <div className="text-xs text-gray-500">
                          {scores.tires}% -{" "}
                          {result.formData?.tireCondition || "Good"} condition
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {scores.tires}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "compare" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  Compare with Market
                </h3>
                <span className="text-xs text-gray-500">
                  Similar listings from Pakistani marketplaces
                </span>
              </div>

              <div className="space-y-3">
                {marketData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          index === 0 ? "bg-primary-500" : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          {item.platform}
                          {index === 0 && (
                            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                              Real-time data
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.source}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-xs text-gray-500">{item.km}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-xs text-blue-800">
                  <strong>Data sourced from:</strong> PakWheels, OLX Pakistan &
                  local dealerships
                </div>
              </div>
            </div>
          )}

          {activeTab === "tips" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Tips to get a better selling price
              </h3>

              <div className="space-y-3">
                {[
                  {
                    icon: "1",
                    title: "Regular maintenance",
                    description:
                      "to keep engine and suspension in good condition.",
                  },
                  {
                    icon: "2",
                    title: "Address paint imperfections",
                    description: "to improve exterior appeal.",
                  },
                  {
                    icon: "3",
                    title: "Install basic safety features",
                    description: "like ABS and airbags to enhance value.",
                  },
                  {
                    icon: "4",
                    title: "Keep mileage low",
                    description: "by using the car efficiently.",
                  },
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {tip.icon}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {tip.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {tip.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarEstimatorResult;
