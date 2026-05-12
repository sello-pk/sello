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
  Tag,
} from "lucide-react";

const CarEstimatorResult = ({ result, onSave, onSellCar }) => {
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
        formData.paintStatus === "original"
          ? 90
          : formData.paintStatus === "repainted"
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

  const formatEngineLabel = (raw) => {
    if (!raw) return "Petrol";
    return String(raw)
      .replace(/_/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  };

  const getDemandLevel = () => {
    const formData = result.formData || {};
    let demand = "Medium";
    const makeLower = String(formData.make || "").toLowerCase();

    if (
      makeLower.includes("toyota") ||
      makeLower.includes("honda") ||
      makeLower.includes("suzuki")
    ) {
      demand = "High";
    }
    const engineLower = String(formData.engineType || "").toLowerCase();
    if (engineLower === "hybrid" || engineLower === "electric") {
      demand = "High";
    }
    const transLower = String(formData.transmission || "").toLowerCase();
    if (transLower === "automatic") {
      if (
        makeLower.includes("toyota") ||
        makeLower.includes("honda") ||
        makeLower.includes("suzuki") ||
        makeLower.includes("kia") ||
        makeLower.includes("hyundai")
      ) {
        demand = "High";
      }
    }
    const mileageNum = Number(formData.mileage);
    if (Number.isFinite(mileageNum) && mileageNum > 150000) demand = "Low";

    return demand;
  };

  const getConfidenceLevel = () => {
    if (confidence >= 85) return "High";
    if (confidence >= 75) return "Medium";
    return "Low";
  };

  const fd = result.formData || {};
  const titleParts = [
    String(fd.make || "").trim(),
    String(fd.model || "").trim(),
    String(fd.variant || "").trim(),
  ].filter(Boolean);
  const vehicleTitle = titleParts.length ? titleParts.join(" ") : "Your vehicle";

  const specLineParts = [];
  if (fd.year != null && String(fd.year).trim() !== "")
    specLineParts.push(String(fd.year));
  if (String(fd.transmission || "").trim())
    specLineParts.push(String(fd.transmission).trim());
  const engineRaw = fd.engineType || fd.fuelType;
  if (engineRaw) specLineParts.push(formatEngineLabel(engineRaw));
  const mileageNum = Number(fd.mileage);
  if (Number.isFinite(mileageNum) && mileageNum >= 0)
    specLineParts.push(`${mileageNum.toLocaleString("en-PK")} km`);
  else if (String(fd.mileage ?? "").trim())
    specLineParts.push(`${String(fd.mileage).trim()} km`);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200/80 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-amber-500 text-white p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2">
              Car market estimate
            </h1>
            <p className="text-sm sm:text-base opacity-90">
              PKR band from Sello listings + rules; GPT only refines when enabled
              on the server
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {onSellCar && (
              <button
                onClick={onSellCar}
                className="bg-white text-primary-600 hover:bg-primary-50 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 justify-center border border-white/50 shadow-sm"
              >
                <Tag className="w-4 h-4" />
                Sell your car
              </button>
            )}
            <button
              onClick={onSave}
              className="bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 justify-center border border-white/30"
            >
              <CheckCircle className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-white to-gray-50/70">
        {/* Car Summary */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 mb-5 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                {vehicleTitle}
              </h2>
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                {specLineParts.length > 0 ? (
                  specLineParts.map((part, i) => (
                    <React.Fragment key={`spec-${i}`}>
                      {i > 0 && <span aria-hidden="true">•</span>}
                      <span>{part}</span>
                    </React.Fragment>
                  ))
                ) : (
                  <span>—</span>
                )}
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
              <div className="bg-red-50/40 p-3 sm:p-4 rounded-xl border border-red-100 text-center">
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  Low
                </p>
                <p className="text-lg sm:text-2xl font-bold text-red-800 mt-1">
                  PKR {formatPrice(result.min)}
                </p>
                <p className="text-xs text-red-600">Conservative</p>
              </div>
              <div className="bg-amber-50/50 p-3 sm:p-4 rounded-xl border border-yellow-100 text-center">
                <p className="text-xs sm:text-sm text-yellow-700 font-medium">
                  Average
                </p>
                <p className="text-lg sm:text-2xl font-bold text-yellow-800 mt-1">
                  PKR {formatPrice(avgPrice)}
                </p>
                <p className="text-xs text-yellow-600">Most Likely</p>
              </div>
              <div className="bg-green-50/50 p-3 sm:p-4 rounded-xl border border-green-100 text-center">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-200">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Confidence Level</span>
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
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-600">Confidence Score</span>
              <span className="font-bold text-primary-600 text-sm">
                {confidence}/100
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl p-1 mb-6 border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row space-x-0 sm:space-x-1 space-y-1 sm:space-y-0">
            {["analysis", "breakdown", "compare", "tips"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 px-2 sm:px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-200"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab === "analysis" && (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="hidden sm:inline">Summary</span>
                      <span className="sm:hidden">Summary</span>
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
                      <span className="hidden sm:inline">Basis</span>
                      <span className="sm:hidden">Basis</span>
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
        <div className="min-h-[240px]">
          {activeTab === "analysis" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-blue-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    {result.isAIPowered ? "AI market summary" : "Estimate summary"}
                  </h3>
                  {result.isAIPowered && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider font-bold">
                        GPT-4o Professional
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100">
                  <p className="text-blue-800 text-sm leading-relaxed whitespace-pre-line">
                    {String(result.summary ?? "").trim()
                      ? result.summary
                      : "No written analysis was returned for this estimate. Try running the estimator again, or contact support if this persists."}
                  </p>
                </div>
                {result.isAIPowered && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-blue-600">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    GPT-4o adjusted the baseline within the allowed band using
                    mileage and condition.
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
              <div className="mb-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  How this estimate is built
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Your PKR range is calculated on the Sello server from active
                  listings where possible, plus mileage and condition rules. It
                  is not scraped live from other websites. OpenAI (GPT-4o) only
                  applies a small optional adjustment when{" "}
                  <code className="text-xs bg-gray-100 px-1 rounded">
                    OPENAI_API_KEY
                  </code>{" "}
                  is configured and the OpenAI account can accept API calls.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-200 pb-3">
                  <span className="text-gray-600">Mid estimate (average)</span>
                  <span className="font-bold text-gray-900">
                    PKR {formatPrice(avgPrice)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-b border-gray-200 pb-3">
                  <span className="text-gray-600">Similar listings used</span>
                  <span className="font-medium text-gray-900">
                    {result.marketContext?.similarListingsCount != null
                      ? `${result.marketContext.similarListingsCount} (approx.)`
                      : "—"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 border-b border-gray-200 pb-3">
                  <span className="text-gray-600 shrink-0">Baseline method</span>
                  <span className="font-medium text-gray-900 text-right sm:max-w-[70%]">
                    {result.marketContext?.dataSource ||
                      "Similar cars on Sello"}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-600">GPT-4o refinement</span>
                  <span
                    className={`font-medium ${result.isAIPowered ? "text-green-700" : "text-amber-800"}`}
                  >
                    {result.isAIPowered
                      ? "Applied for this run"
                      : "Not used (no key, billing error, or API failure)"}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                We removed decorative &quot;dealer row&quot; comparisons that
                were only illustrations. If OpenAI usage stays at zero, add{" "}
                <code className="bg-white px-1 rounded">OPENAI_API_KEY</code> to
                your API host environment and ensure your OpenAI org has an
                active credit balance.
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
