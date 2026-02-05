import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  RotateCcw,
  Sparkles,
  Bookmark,
  History,
  TrendingUp,
  Shield,
  Zap,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import CarEstimatorForm from "./CarEstimatorForm";
import CarEstimatorResult from "./CarEstimatorResult";
import SEO from "../../common/SEO";

const CarEstimatorPage = () => {
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("estimate");
  const [savedValuations, setSavedValuations] = useState([]);

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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-orange-100">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-4"
              >
                <Zap className="w-4 h-4" />
                AI-Powered • Real-Time Market Data
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-gray-900 mb-4"
              >
                Get Your Car's True Value
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-600 max-w-3xl mx-auto mb-8"
              >
                Our AI analyzes real-time data from Sello & local dealerships to
                give you the most accurate valuation for your car.
              </motion.p>

              {/* Trust Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-8 text-sm text-gray-600"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-500" />
                  <span>Trusted by 50,000+ users</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>95% accuracy rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>Updated hourly</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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
                  className={`group relative py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    tab.disabled
                      ? "border-transparent text-gray-300 cursor-not-allowed"
                      : activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <div className="text-center py-12">
                    <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No saved valuations yet
                    </h3>
                    <p className="text-gray-600">
                      Get a car valuation and save it here for future reference.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedValuations.map((valuation) => (
                      <motion.div
                        key={valuation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {valuation.make} {valuation.model}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {valuation.year}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteValuation(valuation.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-lg font-bold text-primary-600 mb-2">
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
                <div className="text-center py-12">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Market Trends
                  </h3>
                  <p className="text-gray-600">
                    Coming soon! Track car price trends and market insights.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Blog Sections */}
        <div className="mt-16 space-y-12">
          {/* Section 1: How AI Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center bg-gray-50 p-8 md:order-2">
                <img
                  src="/src/assets/images/estimator2.PNG"
                  alt="AI Car Estimation"
                  className="rounded-lg shadow-md max-w-full h-auto"
                />
              </div>
              <div className="p-8 md:order-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  How Our AI Car Price Estimator Actually Works
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Here's the deal: our AI checks out your car's details stuff
                  like mileage engine health body shape, and how well it's been
                  cared for. Then it runs the numbers to figure out a fair
                  market price. No complicated tech talk just a straightforward
                  look at what really matters.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-primary-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">AI-Powered Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Real-Time Data</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Why Know Your Car's Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center bg-gray-50 p-8">
                <img
                  src="/src/assets/images/estimator3.PNG"
                  alt="Car Value Analysis"
                  className="rounded-lg shadow-md max-w-full h-auto"
                />
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Why You Should Know Your Car's Real Value Before Selling
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Guessing your car's price usually backfires. Aim too high and
                  the car sits around with no buyers. Go too low and you leave
                  money on the table. Using an AI estimator takes the guesswork
                  out of it. You get a realistic price and the whole selling
                  process moves quicker and smoother.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Maximize Your Price</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Sell Faster</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 3: What Affects Resale Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center bg-gray-50 p-8 md:order-2">
                <img
                  src="/src/assets/images/estimator4.PNG"
                  alt="Car Value Factors"
                  className="rounded-lg shadow-md max-w-full h-auto"
                />
              </div>
              <div className="p-8 md:order-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  What Really Affects Your Car's Resale Price?
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Let's be honest: not everything about your car matters to
                  buyers but some things really do. Mileage engine condition the
                  paint job interior suspension tire quality and whether it's
                  been in an accident these are the big ones. Buyers pay
                  attention to this stuff because it tells them how the car's
                  been treated and what kind of shape it's in.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Car className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">Mileage</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Zap className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">Engine Condition</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Shield className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">Paint Quality</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-primary-500" />
                    <span className="text-sm">Accident History</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 4: AI vs Guessing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-center justify-center bg-gray-50 p-8">
                <img
                  src="/src/assets/images/estimatorBlog.PNG"
                  alt="AI vs Manual Pricing"
                  className="rounded-lg shadow-md max-w-full h-auto"
                />
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  AI Car Pricing vs Guessing a Price Yourself
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Let's be real guessing your car's value is a shot in the dark.
                  AI, on the other hand sticks to the facts and uses real data.
                  That means you get a price that's consistent fair and not
                  swayed by anyone's opinion. It's just more reliable.
                </p>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Data-driven pricing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Eliminates human bias</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700">Consistent results</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CarEstimatorPage;
