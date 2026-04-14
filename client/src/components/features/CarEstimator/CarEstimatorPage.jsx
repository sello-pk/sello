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
  Calculator,
  Fuel,
  TrendingDown,
  DollarSign,
  Settings,
} from "lucide-react";
import CarEstimatorForm from "./CarEstimatorForm";
import CarEstimatorResult from "./CarEstimatorResult";
import estimatorHero from "../../../assets/images/estimatorHero.png";
import EstimatorBlogsSection from "./EstimatorBlogsSection";

const fmt = (n) => `PKR ${Math.round(n).toLocaleString()}`;

// Maintenance Tool Component
function MaintenanceTool() {
  const [make, setMake] = useState('Toyota');
  const [year, setYear] = useState(2020);
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const calculate = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/inventory/tools/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          make,
          year,
          mileage: 50000,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Maintenance calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-5 text-sm">Enter Car Details</h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Car Make</label>
            <div className="flex gap-2 flex-wrap">
              {['Toyota', 'Honda', 'Suzuki', 'Kia', 'MG'].map(m => (
                <button key={m} onClick={() => setMake(m)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold border transition-colors ${make === m ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600 hover:border-primary-400'}`}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Year: {year}</label>
            <input type="range" min="2010" max="2024" value={year} onChange={e => setYear(+e.target.value)} className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>2010</span><span>2024</span></div>
          </div>
          <button 
            onClick={calculate} 
            disabled={isCalculating}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Calculate Cost
              </>
            )}
          </button>
        </div>
      </div>
      {result && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Annual Cost Breakdown</h3>
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-6 text-center mb-6 border border-primary-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Settings className="w-5 h-5 text-primary-500" />
              <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">Total Annual Maintenance</p>
            </div>
            <p className="text-4xl font-black text-primary-500">{fmt(result.yearly)}</p>
            <p className="text-xs text-gray-500 mt-2">Estimated yearly cost</p>
          </div>
          
          <div className="space-y-4">
            {[
              { l: 'Oil Changes (×4)', v: result.oilChange, c: 'bg-primary-400' },
              { l: 'Brake Service', v: result.brakes, c: 'bg-primary-300' },
              { l: 'Tire Replacement', v: result.tires, c: 'bg-primary-500' },
              { l: 'Age-Related Repairs', v: result.parts, c: 'bg-primary-200' },
              { l: 'Miscellaneous', v: result.misc, c: 'bg-gray-400' },
            ].map((item, index) => (
              <div key={item.l}>
                <div className="flex justify-between text-xs mb-2 items-center">
                  <span className="text-gray-700 font-medium">{item.l}</span>
                  <span className="font-bold text-primary-600">{fmt(item.v)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.c} rounded-full`}
                    style={{ width: `${(item.v / result.yearly) * 100}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-xs text-gray-400">{((item.v / result.yearly) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Fuel Tool Component
function FuelTool() {
  const [km, setKm] = useState(2000);
  const [mileage, setMileage] = useState(12);
  const [fuelPrice, setFuelPrice] = useState(285);
  const monthly = Math.round((km / mileage) * fuelPrice);
  const monthlyLiters = Math.round(km / mileage);
  const yearlyCost = monthly * 12;
  const cngSavings = Math.round(monthly * 0.4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-5 text-sm">Adjust Parameters</h3>
        <div className="space-y-5">
          {[
            { label: `Monthly KMs: ${km.toLocaleString()}`, min: 500, max: 8000, step: 100, value: km, set: setKm },
            { label: `Fuel Avg: ${mileage} km/L`, min: 6, max: 25, step: 0.5, value: mileage, set: setMileage },
            { label: `Fuel Price: PKR ${fuelPrice}/L`, min: 200, max: 400, step: 5, value: fuelPrice, set: setFuelPrice },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">{f.label}</label>
              <input type="range" min={f.min} max={f.max} step={f.step} value={f.value}
                onChange={e => f.set(+e.target.value)} className="w-full accent-primary-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>{f.min}</span><span>{f.max}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-5 text-sm">Cost Summary</h3>
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary-500" />
                <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">Monthly Fuel Cost</p>
              </div>
              <div className="text-right">
                <p className="font-black text-primary-500 text-3xl">{fmt(monthly)}</p>
                <p className="text-xs text-gray-500">{monthlyLiters} liters</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Yearly Cost</p>
              <p className="font-black text-gray-700 text-xl">{fmt(yearlyCost)}</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Monthly Liters</p>
              <p className="font-black text-gray-700 text-xl">{monthlyLiters} L</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-600 font-medium">CNG Alternative</p>
                <p className="text-sm text-gray-700">Would save ~<strong className="text-green-600 font-black">{fmt(cngSavings)}/month</strong></p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Resale Tool Component
function ResaleTool() {
  const [value, setValue] = useState(6000000);
  const [years, setYears] = useState(5);
  
  const getDepRate = (val) => {
    if (val > 5000000) return 0.10;
    if (val > 2000000) return 0.11;
    return 0.12;
  };
  
  const dep = getDepRate(value);
  const yearData = Array.from({ length: years + 1 }, (_, i) => ({ 
    yr: i, 
    val: Math.round(value * Math.pow(1 - dep, i)),
    depreciation: i === 0 ? 0 : Math.round((1 - Math.pow(1 - dep, i)) * 100)
  }));
  const finalVal = yearData[years].val;
  const loss = value - finalVal;
  const depreciationRate = (dep * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-5 text-sm">Car Value Inputs</h3>
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Current Value: {fmt(value)}</label>
            <input type="range" min="500000" max="30000000" step="100000" value={value} onChange={e => setValue(+e.target.value)} className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>5L</span><span>3Cr</span></div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Predict for: {years} years</label>
            <input type="range" min="1" max="10" value={years} onChange={e => setYears(+e.target.value)} className="w-full accent-primary-500" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>10</span></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-4 text-center border border-primary-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-primary-500" />
              <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">Future Value</p>
            </div>
            <p className="font-black text-primary-500 text-xl">{fmt(finalVal)}</p>
            <p className="text-xs text-gray-500">In {years} years</p>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 text-center border border-red-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-red-500" />
              <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Total Depreciation</p>
            </div>
            <p className="font-black text-red-600 text-xl">{fmt(loss)}</p>
            <p className="text-xs text-gray-500">{depreciationRate}% per year</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-800 text-sm">Year-by-Year Value</h3>
          <div className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-blue-100 px-2 py-1 rounded-full">
            <span className="text-xs font-medium text-purple-700">AI Powered</span>
          </div>
        </div>
        
        <div className="flex items-end gap-2 h-36 mb-6">
          {yearData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className={`w-full rounded-t-lg transition-colors ${
                  i === 0 ? 'bg-primary-500' : 
                  i === years ? 'bg-red-400' : 
                  'bg-primary-300'
                }`} 
                style={{ height: `${(d.val / value) * 100}%`, minHeight: 6 }}
              />
              <div>
                <span className="text-xs text-gray-600 font-medium">Y{d.yr}</span>
                {d.depreciation > 0 && (
                  <span className="text-xs text-red-500 block">-{d.depreciation}%</span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-600 font-medium mb-3">Depreciation Timeline</p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {yearData.map((d, index) => (
              <div key={d.yr} className="flex justify-between text-xs py-2 border-b border-gray-200 last:border-b-0">
                <span className="text-gray-600 font-medium">Year {d.yr}</span>
                <div className="text-right">
                  <span className="font-bold text-gray-800">{fmt(d.val)}</span>
                  {d.depreciation > 0 && (
                    <span className="text-red-500 ml-2">-{d.depreciation}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Ownership Tool Component
function OwnershipTool() {
  const costs = [
    { category: 'Insurance', cost: 40000, icon: Shield, color: 'from-blue-50 to-blue-100', textColor: 'text-blue-600' },
    { category: 'Registration', cost: 8000, icon: Settings, color: 'from-gray-50 to-gray-100', textColor: 'text-gray-600' },
    { category: 'Maintenance', cost: 80000, icon: Settings, color: 'from-primary-50 to-primary-100', textColor: 'text-primary-600' },
    { category: 'Fuel', cost: 180000, icon: Zap, color: 'from-orange-50 to-orange-100', textColor: 'text-orange-600' },
  ];
  const totalYearly = costs.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-white" />
        </div>
        <h3 className="font-bold text-gray-800 text-2xl mb-2">Complete Ownership Cost</h3>
        <p className="text-gray-500 text-sm">Annual cost breakdown for Pakistani car owners</p>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 text-center mb-8 border border-primary-200">
        <p className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-2">Total Yearly Cost</p>
        <p className="text-4xl font-black text-primary-500">{fmt(totalYearly)}</p>
        <p className="text-xs text-gray-500 mt-2">All expenses combined</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {costs.map((item, index) => {
          const Icon = item.icon;
          const percentage = ((item.cost / totalYearly) * 100).toFixed(1);
          
          return (
            <div key={item.category} className={`bg-gradient-to-r ${item.color} rounded-xl p-4 text-center border border-gray-200`}>
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                <Icon className={`w-5 h-5 ${item.textColor}`} />
              </div>
              <p className={`text-xs font-bold ${item.textColor} mb-1`}>{item.category}</p>
              <p className="text-sm font-black text-gray-800">{fmt(item.cost)}</p>
              <p className="text-xs text-gray-500 mt-1">{percentage}%</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 font-medium">Monthly Average</p>
            <p className="text-lg font-black text-gray-800">{fmt(Math.round(totalYearly / 12))}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 font-medium">5-Year Total</p>
            <p className="text-lg font-black text-gray-800">{fmt(totalYearly * 5)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const CarEstimatorPage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("estimate");
  const [savedValuations, setSavedValuations] = useState([]);
  const MotionDiv = motion.div;

  useEffect(() => {
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
      <div className="min-h-screen bg-gray-50">
        {/* Hero Header */}
        <section className="relative w-full overflow-hidden min-h-[48vh] md:h-[48vh]">
          <img
            src={estimatorHero}
            alt="car estimator hero image"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70" />
          <div className="relative z-10 flex min-h-[48vh] md:h-[48vh] flex-col justify-center max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
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
                { id: "maintenance", label: "Maintenance", icon: Calculator },
                { id: "fuel", label: "Fuel", icon: Fuel },
                { id: "resale", label: "Resale", icon: TrendingDown },
                { id: "ownership", label: "Ownership", icon: DollarSign },
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

            {activeTab === "maintenance" && (
              <motion.div
                key="maintenance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MaintenanceTool />
              </motion.div>
            )}

            {activeTab === "fuel" && (
              <motion.div
                key="fuel"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FuelTool />
              </motion.div>
            )}

            {activeTab === "resale" && (
              <motion.div
                key="resale"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResaleTool />
              </motion.div>
            )}

            {activeTab === "ownership" && (
              <motion.div
                key="ownership"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OwnershipTool />
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
