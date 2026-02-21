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

  const getDemandColor = (demand) => {
    switch (demand?.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800 border border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "low":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getDemandText = (demand) => {
    return demand || "Medium";
  };

  const formatPrice = (price) => {
    const lakhs = Math.floor(price / 100000);
    const thousands = Math.floor((price % 100000) / 1000);
    return `${lakhs}.${thousands.toString().padStart(2, "0")} Lakh`;
  };

  // Calculate confidence and scores based on form data
  const confidence = result.confidence || 85;

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

  const scores = calculateConditionScores();
  const avgPrice = (result.min + result.max) / 2;

  // Mock market comparison data
  const marketData = [
    {
      platform: "Real-time data",
      price: avgPrice,
      km: "0 km",
      source: "Market Database",
    },
    {
      platform: "Pakistan Market",
      price: avgPrice * 0.97,
      km: "118,000 km",
      source: "Used, 2025 model, 118,000 km, Good condition",
    },
    {
      platform: "Local Dealerships",
      price: avgPrice * 1.03,
      km: "95,000 km",
      source: "Dealer certified, 2025 model, 95,000 km, Excellent condition",
    },
    {
      platform: "Market Analysis",
      price: avgPrice * 0.95,
      km: "135,000 km",
      source: "Used, 2025 model, 135,000 km, Fair condition",
    },
    {
      platform: "Recent Sales",
      price: avgPrice * 1.06,
      km: "88,000 km",
      source: "Sold last week, 2025 model, 88,000 km, Excellent condition",
    },
    {
      platform: "Market Trends",
      price: avgPrice * 0.99,
      km: "125,000 km",
      source: "Market average, 2025 model, 125,000 km, Average condition",
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              AI Car Price Estimator
            </h1>
            <p className="text-sm sm:text-base opacity-90">
              Professional Market Valuation
            </p>
          </div>
          <button
            onClick={onSave}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <CheckCircle className="w-4 h-4" />
            Save Valuation
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6">
        {/* Car Summary */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                {result.formData?.make || "Toyota"}{" "}
                {result.formData?.model || "Baleno"}{" "}
                {result.formData?.variant || "rs XLi"}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                <span>{result.formData?.year || "2025"}</span>
                <span>•</span>
                <span>{result.formData?.transmission || "Manual"}</span>
                <span>•</span>
                <span>{result.formData?.fuelType || "Petrol"}</span>
                <span>•</span>
                <span>{result.formData?.mileage || "100000"} km</span>
              </div>
            </div>
            <div className="mt-3 sm:mt-0">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getDemandColor(getDemandLevel())}`}
              >
                {getDemandLevel()} Demand
              </span>
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
              Current Market Value
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-red-50 p-3 sm:p-4 rounded-lg border border-red-200 text-center">
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  Low
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-800 mt-1">
                  PKR {formatPrice(result.min)}
                </p>
                <p className="text-xs text-red-600">Conservative</p>
              </div>
              <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200 text-center">
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">
                  Average
                </p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-800 mt-1">
                  PKR {formatPrice(avgPrice)}
                </p>
                <p className="text-xs text-yellow-600">Most Likely</p>
              </div>
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200 text-center">
                <p className="text-xs sm:text-sm text-green-700 font-medium">
                  High
                </p>
                <p className="text-lg sm:text-2xl font-bold text-green-800 mt-1">
                  PKR {formatPrice(result.max)}
                </p>
                <p className="text-xs text-green-600">Optimistic</p>
              </div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Confidence:</span>
              <span
                className={`font-bold text-sm ${
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
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Score:</span>
              <span className="font-bold text-primary-600 text-sm">
                {confidence}/100
              </span>
            </div>
          </div>
        </div>

        {/* New Valuation Button */}
        <div className="text-center mb-6">
          <button className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors w-full sm:w-auto">
            New Valuation
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 rounded-xl p-1 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-1 space-y-1 sm:space-y-0">
            {["analysis", "breakdown", "compare", "tips"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-primary-600 shadow-sm border border-primary-200"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab === "analysis" && (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="hidden sm:inline">AI Analysis</span>
                      <span className="sm:hidden">Analysis</span>
                    </>
                  )}
                  {tab === "breakdown" && (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="hidden sm:inline">Condition</span>
                      <span className="sm:hidden">Breakdown</span>
                    </>
                  )}
                  {tab === "compare" && (
                    <>
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="hidden sm:inline">Market</span>
                      <span className="sm:hidden">Compare</span>
                    </>
                  )}
                  {tab === "tips" && (
                    <>
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="hidden sm:inline">Tips</span>
                      <span className="sm:hidden">Tips</span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === "analysis" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-blue-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    AI Market Analysis
                  </h3>
                  {result.isAIPowered && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                        GPT-4o Professional
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg p-4 border border-blue-100">
                  <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
                    {result.summary}
                  </p>
                </div>
                {result.isAIPowered && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-blue-600">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    Enhanced with real-time market data and professional
                    analysis
                  </div>
                )}
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
                <h3 className="font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  Market Comparison
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">
                    Live market data
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {marketData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index === 0
                            ? "bg-green-500 animate-pulse"
                            : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                          {item.platform}
                          {index === 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                              Real-time
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.source}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 text-lg">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-xs text-gray-500">{item.km}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-orange-800">
                  <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  Market comparison data is based on similar listings in our
                  database and enhanced with AI analysis for accurate Pakistani
                  market insights.
                </div>
              </div>
            </div>
          )}

          {activeTab === "tips" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
                <h3 className="font-bold text-gray-900">
                  Value Enhancement Tips
                </h3>
              </div>

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
                    description: "by using car efficiently.",
                  },
                ].map((tip, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg">
                      {tip.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">
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
