import React, { useState, useEffect, useCallback, useRef } from "react";
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
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react";
import CarEstimatorForm from "./CarEstimatorForm";
import CarEstimatorResult from "./CarEstimatorResult";
import estimatorHero from "../../../assets/images/estimatorHero.png";
import EstimatorBlogsSection from "./EstimatorBlogsSection";
import { API_CONFIG } from "../../../config/index.js";

const fmt = (n) => `PKR ${Math.round(n).toLocaleString()}`;
const API_BASE = API_CONFIG.BASE_URL;

// Custom hook to fetch car makes from database
function useMakes() {
  const [makes, setMakes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMakes = async () => {
      try {
        const response = await fetch(`${API_BASE}/cars/stats/counts-by-make`);
        const data = await response.json();
        if (data.success && data.data) {
          // Extract make names from the response
          const makeList = data.data.map(item => item.make || item._id).filter(Boolean);
          setMakes(makeList.length > 0 ? makeList : ['Toyota', 'Honda', 'Suzuki', 'Kia', 'MG']);
        } else {
          setMakes(['Toyota', 'Honda', 'Suzuki', 'Kia', 'MG']);
        }
      } catch (error) {
        console.error('Failed to fetch makes:', error);
        setMakes(['Toyota', 'Honda', 'Suzuki', 'Kia', 'MG']);
      } finally {
        setLoading(false);
      }
    };
    fetchMakes();
  }, []);

  return { makes, loading };
}

// Custom hook to fetch models for a specific make
function useModels(make) {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!make) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/vehicle-attributes/makes/${encodeURIComponent(make)}/models`);
        const data = await response.json();
        if (data.success && data.data) {
          setModels(data.data.length > 0 ? data.data : ['Corolla', 'Civic', 'Other']);
        } else {
          setModels(['Corolla', 'Civic', 'Other']);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        setModels(['Corolla', 'Civic', 'Other']);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [make]);

  return { models, loading };
}

// Custom hook to fetch years from database (optionally filtered by make/model)
function useYears(make, model) {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      setLoading(true);
      try {
        let url = `${API_BASE}/vehicle-attributes/years`;
        const params = new URLSearchParams();
        if (make) params.append('make', make);
        if (model) params.append('model', model);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          setYears(data.data);
        } else {
          // Fallback: generate last 15 years
          const currentYear = new Date().getFullYear();
          setYears(Array.from({ length: 15 }, (_, i) => currentYear - i));
        }
      } catch (error) {
        console.error('Failed to fetch years:', error);
        // Fallback: generate last 15 years
        const currentYear = new Date().getFullYear();
        setYears(Array.from({ length: 15 }, (_, i) => currentYear - i));
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, [make, model]);

  return { years, loading };
}

// Trends Tool Component
function TrendsTool({ savedValuations, currentResult, currentFormData }) {
  const { makes, loading: makesLoading } = useMakes();
  const [make, setMake] = useState('');
  const { models, loading: modelsLoading } = useModels(make);
  const [model, setModel] = useState('');
  const { years, loading: yearsLoading } = useYears(make, model);
  const [year, setYear] = useState(new Date().getFullYear());
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Update year when years list changes and current year is not in the list
  useEffect(() => {
    if (years.length > 0 && !years.includes(year)) {
      setYear(years[0]); // Set to most recent available year
    }
  }, [years, year]);

  // Set default from current estimation result ONLY if explicitly provided
  useEffect(() => {
    if (currentFormData?.make && currentFormData?.model) {
      setMake(currentFormData.make);
      setModel(currentFormData.model);
      setYear(currentFormData.year || new Date().getFullYear());
    }
    // Otherwise, don't auto-select - let user choose manually
  }, [currentFormData]);

  // Fetch real trend data from backend when selections change (debounced)
  useEffect(() => {
    if (!make || !model) return;

    // Clear previous debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounced fetch
    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      try {
        // Call backend API for real trend data
        const response = await fetch(
          `${API_BASE}/tools/trends?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&year=${year}`
        );
        const data = await response.json();

        if (data.success && data.data) {
          setTrendData(data.data);
        } else {
          // Fallback: Calculate from saved valuations of same make/model/year
          // Use case-insensitive comparison to match backend behavior
          const relevantValuations = savedValuations.filter(
            v => v.make?.toLowerCase() === make?.toLowerCase() &&
                 v.model?.toLowerCase() === model?.toLowerCase() &&
                 Math.abs(v.year - year) <= 2
          );
          
          if (relevantValuations.length >= 3) {
            // Generate trend from actual saved data
            const sorted = relevantValuations.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
            const prices = sorted.slice(-6).map(v => v.estimatedPriceAverage || v.estimatedPriceMax);
            const months = sorted.slice(-6).map(v => new Date(v.created_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
            
            const startPrice = prices[0];
            const currentPrice = prices[prices.length - 1];
            const change = ((currentPrice - startPrice) / startPrice) * 100;
            
            setTrendData({
              make,
              model,
              year,
              percentage: change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`,
              isPositive: change > 0,
              prices,
              months,
              currentPrice,
              startPrice,
              summary: `Based on ${relevantValuations.length} actual valuations for ${year} ${make} ${model}, prices have ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}%. This trend reflects real market conditions including depreciation, demand fluctuations, and economic factors in Pakistan.`
            });
          } else {
            // Not enough data - show message
            setTrendData({
              make,
              model,
              year,
              percentage: 'N/A',
              isPositive: true,
              prices: [],
              months: [],
              currentPrice: 0,
              startPrice: 0,
              summary: `Not enough data for ${year} ${make} ${model}. Please estimate more cars of this type to see price trends.`
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch trend data:', error);
        toast.error('Failed to load trend data');
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    // Cleanup timer on unmount or dependency change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [make, model, year, savedValuations]);

  // Quick select from saved valuations
  const handleQuickSelect = (valuation) => {
    setMake(valuation.make);
    setModel(valuation.model);
    setYear(valuation.year || new Date().getFullYear());
  };

  const maxPrice = trendData ? Math.max(...trendData.prices) : 0;
  const minPrice = trendData ? Math.min(...trendData.prices) : 0;
  const priceRange = maxPrice - minPrice;

  // Safe Y coordinate calculation (handles division by zero)
  const getY = (p) => {
    if (priceRange === 0) return 75; // Center when all prices equal
    return 150 - ((p - minPrice) / priceRange) * 120 - 15;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Price Trends</h2>
        <p className="text-gray-500">
          View historical price trends for specific car models in Pakistan.
        </p>
      </div>

      {/* Main Content Grid - CSS variable for primary color used by SVG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ '--color-primary': 'var(--primary-500, #3b82f6)' }}>
        {/* Left Card - Select a Car */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-5">
            {make && model ? `${make} ${model} ${year}` : 'Select a Car'}
          </h3>
          <div className="space-y-4">
            {/* Make */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Make</label>
              {makesLoading ? (
                <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
              ) : (
                <select
                  value={make}
                  onChange={(e) => {
                    setMake(e.target.value);
                    setModel('');
                  }}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                >
                  <option value="">Select make</option>
                  {makes.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Model</label>
              {modelsLoading ? (
                <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
              ) : (
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={!make}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select model</option>
                  {models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Year</label>
              {yearsLoading ? (
                <div className="h-11 bg-gray-100 rounded-xl animate-pulse" />
              ) : (
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  disabled={years.length === 0}
                  className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-800 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {years.length === 0 ? (
                    <option value="">Select make & model first</option>
                  ) : (
                    years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Right Card - Price Trends Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : trendData?.prices?.length > 0 ? (
            <>
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-semibold text-gray-800">{trendData.make} {trendData.model} Price History</h3>
                  <p className="text-sm text-gray-500">
                    {trendData.year} model • {trendData.dataPoints || trendData.prices.length} real valuations
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  trendData.isPositive 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'bg-red-50 text-red-600'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  {trendData.percentage}
                </div>
              </div>

              {/* Line Chart SVG */}
              <div className="h-48 mb-4 relative">
                <svg viewBox="0 0 300 150" className="w-full h-full">
                  {/* Gradient definition using CSS variables */}
                  <defs>
                    <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under line */}
                  <polygon
                    fill="url(#trendGradient)"
                    points={`0,150 ${trendData.prices.map((p, i) => {
                      const x = (i / (trendData.prices.length - 1)) * 300;
                      const y = getY(p);
                      return `${x},${y}`;
                    }).join(' ')} 300,150`}
                  />
                  
                  {/* Line */}
                  <polyline
                    fill="none"
                    className="stroke-primary-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={trendData.prices.map((p, i) => {
                      const x = (i / (trendData.prices.length - 1)) * 300;
                      const y = getY(p);
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  
                  {/* Data points */}
                  {trendData.prices.map((p, i) => {
                    const x = (i / (trendData.prices.length - 1)) * 300;
                    const y = getY(p);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="4"
                        fill="white"
                        className="stroke-primary-500"
                        strokeWidth="2"
                      />
                    );
                  })}
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-400">
                  <span>{maxPrice > 0 ? fmt(maxPrice) : ''}</span>
                  <span>{maxPrice > 0 && minPrice > 0 ? fmt((maxPrice + minPrice) / 2) : ''}</span>
                  <span>{minPrice > 0 ? fmt(minPrice) : ''}</span>
                </div>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                {trendData.months.map((m, i) => (
                  <span key={i} className={i % 2 === 0 ? '' : 'hidden sm:inline'}>{m}</span>
                ))}
              </div>

              {/* Summary Text */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 leading-relaxed">{trendData.summary}</p>
              </div>
            </>
          ) : trendData ? (
            // Has trendData but no prices (not enough data)
            <div className="h-64 flex flex-col items-center justify-center text-center px-4">
              <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium mb-1">{trendData.summary}</p>
              <p className="text-sm text-gray-400">Try selecting a different car or year</p>
            </div>
          ) : (
            // No car selected yet
            <div className="h-64 flex flex-col items-center justify-center text-center px-4">
              <TrendingUp className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">Select a car to view price trends</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Access - Your Cars */}
      {savedValuations.length > 0 && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-800 mb-4">Quick Access - Your Cars</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {savedValuations.slice(0, 4).map((v) => (
              <button
                key={v.id || v._id}
                onClick={() => handleQuickSelect(v)}
                className="p-3 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-left"
              >
                <p className="font-medium text-gray-800 text-sm">{v.make} {v.model}</p>
                <p className="text-xs text-gray-500">{v.year}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Resale Tool Component
function ResaleTool() {
  const { makes, loading: makesLoading } = useMakes();
  const [make, setMake] = useState('');
  const { models, loading: modelsLoading } = useModels(make);
  const [model, setModel] = useState('');
  const [value, setValue] = useState(6000000);
  const [years, setYears] = useState(5);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Set default make when makes load
  useEffect(() => {
    if (makes.length > 0 && !make) {
      setMake(makes[0]);
    }
  }, [makes, make]);

  // Set default model when models load or make changes
  useEffect(() => {
    if (models.length > 0) {
      setModel(models[0]);
    }
  }, [models]);
  
  const calculate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/tools/resale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue: value, years, make, model }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        toast.error(data.message || 'Failed to calculate resale value');
      }
    } catch (error) {
      console.error('Resale calculation error:', error);
      toast.error('Network error: Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate on first load (silent - no error toast)
  useEffect(() => {
    const silentCalculate = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/tools/resale`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentValue: value, years, make, model }),
        });
        const data = await response.json();
        if (data.success) {
          setResult(data.data);
        }
      } catch (error) {
        console.error('Initial resale calculation error:', error);
        // Silent fail on auto-load - don't show toast
      } finally {
        setLoading(false);
      }
    };
    silentCalculate();
  }, []);

  const yearData = result?.yearData || [];
  const finalVal = result?.finalValue || 0;
  const loss = result?.totalLoss || 0;
  const depreciationRate = result?.depreciationRate?.toFixed(1) || '12.0';

  // Calculate bar heights relative to the range for better visualization
  const minVal = Math.min(...yearData.map(d => d.value));
  const maxVal = Math.max(...yearData.map(d => d.value));
  const valRange = maxVal - minVal || 1;
  const getBarHeight = (val) => {
    // Minimum 15% height so bars don't disappear, scale the rest
    const minHeight = 15;
    const scaleHeight = ((val - minVal) / valRange) * 70; // 70% is the scalable portion
    return Math.max(minHeight, minHeight + scaleHeight);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-5 text-sm">Car Value Inputs</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Car Make</label>
            {makesLoading ? (
              <div className="flex gap-2 flex-wrap">
                <div className="w-20 h-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="w-20 h-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="w-20 h-10 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : (
              <div className="flex gap-2 flex-wrap">
                {makes.map(m => (
                  <button key={m} onClick={() => setMake(m)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-colors ${make === m ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600 hover:border-primary-400'}`}>{m}</button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">Model</label>
            {modelsLoading ? (
              <div className="flex gap-2 flex-wrap">
                <div className="w-20 h-10 bg-gray-100 rounded-xl animate-pulse" />
                <div className="w-20 h-10 bg-gray-100 rounded-xl animate-pulse" />
              </div>
            ) : models.length > 0 ? (
              <select 
                value={model} 
                onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:outline-none"
              >
                {models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <input 
                type="text" 
                value={model} 
                onChange={e => setModel(e.target.value)}
                placeholder="Enter model"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:border-primary-500 focus:outline-none"
              />
            )}
          </div>
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
          <button 
            onClick={calculate} 
            disabled={loading}
            className="w-full bg-primary-500 text-white py-3 rounded-xl font-bold hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Calculating...</>
            ) : (
              <><BarChart3 className="w-4 h-4" /> Calculate Resale Value</>
            )}
          </button>
        </div>
        
        {result && (
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
                <TrendingDown className="w-4 h-4 text-red-500" />
                <p className="text-xs text-red-600 font-medium uppercase tracking-wide">Total Loss</p>
              </div>
              <p className="font-black text-red-600 text-xl">{fmt(loss)}</p>
              <p className="text-xs text-gray-500">{depreciationRate}% per year</p>
            </div>
          </div>
        )}
      </div>
      
      {result && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-gray-800 text-sm">Year-by-Year Value</h3>
            <div className="flex items-center gap-1 bg-gradient-to-r from-purple-100 to-blue-100 px-2 py-1 rounded-full">
              <span className="text-xs font-medium text-purple-700">AI Powered</span>
            </div>
          </div>
          
          {/* Improved Bar Chart with better visualization */}
          <div className="flex items-end gap-2 h-40 mb-6 px-2">
            {yearData.map((d, i) => {
              const barHeight = getBarHeight(d.value);
              const isLast = i === yearData.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative group">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        i === 0 ? 'bg-primary-500' : 
                        isLast ? 'bg-gradient-to-t from-red-500 to-red-400' : 
                        'bg-gradient-to-t from-primary-400 to-primary-300'
                      }`} 
                      style={{ height: `${barHeight}%`, minHeight: 20 }}
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      {fmt(d.value)}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-600 font-medium block">Y{d.year}</span>
                    {d.depreciation > 0 && (
                      <span className="text-xs text-red-500 font-medium">-{d.depreciation}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
            <p className="text-xs text-gray-600 font-medium mb-3">Depreciation Timeline</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {yearData.map((d) => (
                <div key={d.year} className="flex justify-between text-xs py-2 border-b border-gray-200 last:border-b-0">
                  <span className="text-gray-600 font-medium">Year {d.year}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-800">{fmt(d.value)}</span>
                    {d.depreciation > 0 && (
                      <span className="text-red-500 ml-2 font-medium">-{d.depreciation}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
                { id: "resale", label: "Resale", icon: TrendingDown },
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
                <TrendsTool 
                  savedValuations={savedValuations} 
                  currentFormData={result?.formData}
                />
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

          </AnimatePresence>
        </div>

        {/* Blog Sections */}
        <EstimatorBlogsSection />
      </div>
    </>
  );
};

export default CarEstimatorPage;
