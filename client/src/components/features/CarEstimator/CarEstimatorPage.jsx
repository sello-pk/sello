import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Car,
  Trash2,
  Sparkles,
  Bookmark,
  TrendingUp,
  Zap,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import CarEstimatorForm from "./CarEstimatorForm";
import CarEstimatorResult from "./CarEstimatorResult";
import SEO from "../../common/SEO";
import estimatorHero from "../../../assets/images/estimatorHero.png";
import EstimatorBlogsSection from "./EstimatorBlogsSection";

const CarEstimatorPage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("estimate");
  const [savedValuations, setSavedValuations] = useState([]);
  const MotionDiv = motion.div;

  useEffect(() => {
    document.title = "AI Car Price Estimator - Sello";
    // Load saved valuations from localStorage
    const saved = localStorage.getItem("carValuations");
    if (saved) {
      setSavedValuations(JSON.parse(saved));
    }
  }, []);

  const handleEstimate = (estimationResult) => {
    setResult(estimationResult);
    // Auto-switch to result tab after successful valuation
    setActiveTab("result");
  };

  const handleReset = () => {
    setResult(null);
  };

  const handleSaveValuation = () => {
    if (!result) return;

    const valuation = {
      id: Date.now(),
      ...result.formData,
      estimatedPriceMin: result.min,
      estimatedPriceMax: result.max,
      estimatedPriceAverage: (result.min + result.max) / 2,
      created_date: new Date().toISOString(),
      summary: result.summary,
    };

    const updatedValuations = [...savedValuations, valuation];
    setSavedValuations(updatedValuations);
    localStorage.setItem("carValuations", JSON.stringify(updatedValuations));
    toast.success("Valuation saved. View it in the Saved tab.");
  };

  const handleSellCar = () => {
    if (!result?.formData) return;
    const prefill = {
      make: result.formData.make || "",
      model: result.formData.model || "",
      variant: result.formData.variant || "",
      year: result.formData.year || "",
      fuelType: result.formData.engineType || result.formData.fuelType || "",
      transmission: result.formData.transmission || "",
      mileage: result.formData.mileage || "",
    };
    navigate("/create-post", { state: { fromEstimator: true, prefill } });
  };

  const handleDeleteValuation = (id) => {
    const updatedValuations = savedValuations.filter((v) => v.id !== id);
    setSavedValuations(updatedValuations);
    localStorage.setItem("carValuations", JSON.stringify(updatedValuations));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <SEO
        title="AI Car Price Estimator | Sello.pk"
        description="Get accurate car price estimates with our AI-powered tool. Analyze market data, compare prices, and make informed decisions when buying or selling cars in Pakistan."
        canonical="https://sello.pk/car-estimator"
      />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Header */}
        <section className="relative w-full overflow-hidden md:min-h-[48vh]">
          <img
            src={estimatorHero}
            alt="car estimator hero image"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70" />
          <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:min-h-[48vh] md:py-14">
            <div className="text-center">
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white text-primary-500 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4"
              >
                <Zap className="w-4 h-4" />
                AI-Powered • Real-Time Market Data
              </MotionDiv>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4"
              >
                Get Your Car's True Value
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-gray-100 max-w-3xl mx-auto mb-8 px-4"
              >
                Our AI analyzes real-time data from Sello & local dealerships to
                give you the most accurate valuation for your car.
              </motion.p>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-200"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                  <span className="hidden sm:inline">
                    Trusted by 50,000+ users
                  </span>
                  <span className="sm:hidden">50k+ users</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                  <span>95% accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                  <span>Updated hourly</span>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div id="estimator-tabs" className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 scroll-mt-4">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-2 sm:space-x-8 min-w-max">
              {[
                { id: "estimate", label: "Estimate", icon: Car },
                {
                  id: "result",
                  label: "Result",
                  icon: Sparkles,
                  disabled: !result,
                },
                {
                  id: "saved",
                  label: "Saved",
                  icon: Bookmark,
                  count: savedValuations.length,
                },
                { id: "trends", label: "Trends", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={tab.disabled}
                  className={`group relative py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                    tab.disabled
                      ? "border-transparent text-gray-300 cursor-not-allowed"
                      : activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
                    {tab.count > 0 && (
                      <span className="bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full text-xs font-medium">
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            {activeTab === "estimate" && (
              <motion.div
                key="estimate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full">
                  <CarEstimatorForm
                    onEstimate={handleEstimate}
                    onReset={handleReset}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <CarEstimatorResult
                  result={result}
                  onSave={handleSaveValuation}
                  onSellCar={handleSellCar}
                  fullWidth={true}
                />
              </motion.div>
            )}

            {activeTab === "saved" && (
              <motion.div
                key="saved"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {savedValuations.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Bookmark className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      No saved valuations yet
                    </h3>
                    <p className="text-sm text-gray-600 px-4">
                      Get a car valuation and save it here for future reference.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {savedValuations.map((valuation) => (
                      <motion.div
                        key={valuation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                              {valuation.make} {valuation.model}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {valuation.year}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteValuation(valuation.id)}
                            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 transition-colors text-sm"
                            title="Delete saved valuation"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>

                        <div className="text-sm sm:text-lg font-bold text-primary-600 mb-2">
                          {formatPrice(valuation.estimatedPriceMin)} -{" "}
                          {formatPrice(valuation.estimatedPriceMax)}
                        </div>

                        <div className="text-xs text-gray-500">
                          {new Date(
                            valuation.created_date,
                          ).toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "trends" && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center py-8 sm:py-12">
                  <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                    Market Trends
                  </h3>
                  <p className="text-sm text-gray-600 px-4">
                    Coming soon! Track car price trends and market insights.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Blog Sections */}
        <EstimatorBlogsSection />
      </div>
    </>
  );
};

export default CarEstimatorPage;
