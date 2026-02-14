import React, { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  IoSearch as Search,
  IoGridOutline as Grid3X3,
  IoListOutline as List,
  IoLocationOutline as MapPin,
  IoFlashOutline as Zap,
  IoCarSportOutline as Car,
  IoTimeOutline as Clock,
  IoSwapVerticalOutline as SortAsc,
  IoRefreshOutline as RefreshCw,
  IoCloseOutline as X,
  IoScaleOutline as Scale,
  IoChevronDownOutline as ChevronDown,
} from "react-icons/io5";
import { GiGavel as Gavel } from "react-icons/gi";

// ==================== CUSTOM COMPONENTS ====================

// Badge Component
const Badge = ({ children, variant = "default", className = "", ...props }) => {
  const variants = {
    default: "bg-slate-100 text-slate-900",
    secondary: "bg-slate-100 text-slate-600",
    destructive: "bg-red-100 text-red-600",
    success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-600",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Button Component
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default:
      "bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] focus:ring-[#FFA602] shadow-lg shadow-[#FFA602]/30",
    outline:
      "border-2 border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    ghost: "text-slate-700 hover:bg-slate-100 focus:ring-slate-500",
    white:
      "bg-white text-[#FFA602] hover:bg-white/90 focus:ring-white shadow-lg",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600",
  };

  const sizes = {
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    sm: "px-3 py-1.5 text-xs",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Input Component
const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA602] focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
};

// Select Components
const Select = ({ children, value, onValueChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <SelectValue value={value} placeholder={placeholder} />
      </SelectTrigger>
      {isOpen && (
        <SelectContent
          onSelect={(val) => {
            onValueChange(val);
            setIsOpen(false);
          }}
        >
          {children}
        </SelectContent>
      )}
    </div>
  );
};

const SelectTrigger = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-11 px-4 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#FFA602]"
    >
      {children}
      <ChevronDown className="w-4 h-4 text-slate-400" />
    </button>
  );
};

const SelectValue = ({ value, placeholder }) => {
  return (
    <span
      className={value && value !== "all" ? "text-slate-900" : "text-slate-400"}
    >
      {value && value !== "all" ? value : placeholder}
    </span>
  );
};

const SelectContent = ({ children, onSelect }) => {
  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onSelect }),
      )}
    </div>
  );
};

const SelectItem = ({ children, value, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(value)}
      className="px-4 py-2 hover:bg-slate-100 cursor-pointer text-slate-900"
    >
      {children}
    </div>
  );
};

// CountdownTimer Component
const CountdownTimer = ({ targetDate, size = "default", showLabel = true }) => {
  return (
    <div
      className={`flex items-center gap-2 ${size === "large" ? "text-2xl" : "text-sm"}`}
    >
      <div className="text-center">
        <span className="font-bold text-white">02</span>
        {showLabel && <span className="text-xs text-slate-400 ml-1">d</span>}
      </div>
      <span className="text-white">:</span>
      <div className="text-center">
        <span className="font-bold text-white">12</span>
        {showLabel && <span className="text-xs text-slate-400 ml-1">h</span>}
      </div>
      <span className="text-white">:</span>
      <div className="text-center">
        <span className="font-bold text-white">45</span>
        {showLabel && <span className="text-xs text-slate-400 ml-1">m</span>}
      </div>
      <span className="text-white">:</span>
      <div className="text-center">
        <span className="font-bold text-white">30</span>
        {showLabel && <span className="text-xs text-slate-400 ml-1">s</span>}
      </div>
    </div>
  );
};

// CarCard Component
const CarCard = ({
  car,
  auction,
  compact = false,
  showCompare = false,
  onCompareToggle,
  isComparing = false,
}) => {
  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-slate-200">
        <div className="flex">
          <div className="w-48 h-36 bg-slate-200 relative">
            <img
              src={car.images}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {car.make} {car.model}
                </h3>
                <p className="text-slate-500 text-sm">
                  {car.year} • {car.mileage?.toLocaleString()} km
                </p>
              </div>
              <Badge variant="success">Live</Badge>
            </div>
            <div className="mt-3 flex justify-between items-center">
              <div>
                <span className="text-sm text-slate-500">Current Bid</span>
                <p className="font-bold text-[#FFA602] text-xl">
                  ₨ {car.current_bid?.toLocaleString()}
                </p>
              </div>
              {showCompare && (
                <Button
                  variant={isComparing ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCompareToggle(car.id)}
                >
                  <Scale className="w-4 h-4 mr-1" />
                  Compare
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-slate-200">
      <div className="h-48 bg-slate-200 relative">
        <img
          src={car.images}
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-[#FFA602] text-white border-0">
          Live
        </Badge>
        {showCompare && (
          <button
            onClick={() => onCompareToggle(car.id)}
            className={`absolute top-2 left-2 p-2 rounded-full ${
              isComparing
                ? "bg-[#FFA602] text-white"
                : "bg-white text-slate-600"
            } shadow-lg`}
          >
            <Scale className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">
              {car.make} {car.model}
            </h3>
            <p className="text-slate-500 text-sm">
              {car.year} • {car.mileage?.toLocaleString()} km
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-slate-500">Current Bid</span>
            <p className="font-bold text-[#FFA602]">
              ₨ {car.current_bid?.toLocaleString()}
            </p>
          </div>
          <Button size="sm">Place Bid</Button>
        </div>
      </div>
    </div>
  );
};

// AdvancedFilters Component (simplified version)
const AdvancedFilters = ({ filters, onFiltersChange, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="h-11"
      >
        <Search className="w-4 h-4 mr-2" />
        Advanced Filters
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50">
          <h3 className="font-semibold mb-3">Advanced Filters</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-600">Year Range</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Min"
                  value={filters.yearMin}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, yearMin: e.target.value })
                  }
                />
                <Input
                  placeholder="Max"
                  value={filters.yearMax}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, yearMax: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Price Range (₨)</label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Min"
                  value={filters.priceMin}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, priceMin: e.target.value })
                  }
                />
                <Input
                  placeholder="Max"
                  value={filters.priceMax}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, priceMax: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600">Transmission</label>
              <select
                className="w-full mt-1 p-2 border border-slate-200 rounded-lg"
                value={filters.transmission}
                onChange={(e) =>
                  onFiltersChange({ ...filters, transmission: e.target.value })
                }
              >
                <option value="all">All</option>
                <option value="automatic">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// LiveAuctionUpdates Component (simplified)
const LiveAuctionUpdates = ({ carIds, onBidUpdate, userId }) => {
  return null; // Placeholder for real-time functionality
};

// SavedSearches Component (simplified)
const SavedSearches = ({ currentFilters, onApplyFilter, userId }) => {
  const savedSearches = [
    {
      id: 1,
      name: "Toyota under 3M",
      filters: { make: "Toyota", priceMax: "3000000" },
    },
    { id: 2, name: "Honda 2020+", filters: { make: "Honda", yearMin: "2020" } },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
        <Clock className="w-4 h-4" />
        Saved Searches
      </div>
      <div className="flex gap-2">
        {savedSearches.map((search) => (
          <Badge
            key={search.id}
            variant="secondary"
            className="cursor-pointer hover:bg-slate-200"
            onClick={() => onApplyFilter(search.filters)}
          >
            {search.name}
          </Badge>
        ))}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

const defaultFilters = {
  make: "all",
  model: "all",
  yearMin: "",
  yearMax: "",
  priceMin: "",
  priceMax: "",
  condition: "all",
  transmission: "all",
  fuelType: "all",
  sortBy: "ending_soon",
};

export default function LiveAuction() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState(defaultFilters);
  const [user, setUser] = useState(null);
  const [compareCars, setCompareCars] = useState([]);

  useEffect(() => {
    // Mock user check
    setUser({ id: 1, name: "Demo User" });
  }, []);

  const toggleCompare = (carId) => {
    setCompareCars((prev) =>
      prev.includes(carId)
        ? prev.filter((id) => id !== carId)
        : prev.length < 3
          ? [...prev, carId]
          : prev,
    );
  };

  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const auctionId = urlParams.get("auction_id");

  const liveAuction = {
    id: "demo",
    title: "Auction #101",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000 * 6).toISOString(),
    status: "live",
    total_cars: 18,
  };

  // Sample cars
  const displayCars = [...Array(12)].map((_, i) => ({
    id: i,
    make: [
      "Toyota",
      "Honda",
      "Suzuki",
      "Hyundai",
      "Kia",
      "Mercedes",
      "BMW",
      "Audi",
      "Nissan",
      "Mazda",
      "Ford",
      "Chevrolet",
    ][i],
    model: [
      "Corolla",
      "Civic",
      "Alto",
      "Elantra",
      "Sportage",
      "C-Class",
      "3 Series",
      "A4",
      "Altima",
      "CX-5",
      "Mustang",
      "Camaro",
    ][i],
    year: 2018 + (i % 6),
    mileage: 20000 + i * 8000,
    condition: ["excellent", "good", "fair", "good", "excellent", "good"][
      i % 6
    ],
    engine_type: ["petrol", "diesel", "hybrid", "petrol", "petrol", "diesel"][
      i % 6
    ],
    transmission: i % 3 === 0 ? "automatic" : "manual",
    registration_city: [
      "Lahore",
      "Karachi",
      "Islamabad",
      "Multan",
      "Faisalabad",
      "Peshawar",
    ][i % 6],
    starting_bid: 1200000 + i * 400000,
    current_bid: 1500000 + i * 450000,
    images: [
      "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=600",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600",
      "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600",
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600",
      "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?w=600",
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600",
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600",
      "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600",
    ][i],
  }));

  const uniqueMakes = [...new Set(displayCars.map((c) => c.make))];

  const filteredCars = useMemo(() => {
    let result = displayCars;

    if (searchQuery) {
      result = result.filter((car) =>
        `${car.make} ${car.model} ${car.year}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
    }

    if (filters.make !== "all") {
      result = result.filter((car) => car.make === filters.make);
    }

    if (filters.condition !== "all") {
      result = result.filter((car) => car.condition === filters.condition);
    }

    if (filters.transmission !== "all") {
      result = result.filter(
        (car) => car.transmission === filters.transmission,
      );
    }

    if (filters.fuelType !== "all") {
      result = result.filter((car) => car.engine_type === filters.fuelType);
    }

    // Convert string values to numbers for comparisons
    const yearMin = filters.yearMin ? Number(filters.yearMin) : null;
    const yearMax = filters.yearMax ? Number(filters.yearMax) : null;
    const priceMin = filters.priceMin ? Number(filters.priceMin) : null;
    const priceMax = filters.priceMax ? Number(filters.priceMax) : null;

    if (yearMin) result = result.filter((car) => car.year >= yearMin);
    if (yearMax) result = result.filter((car) => car.year <= yearMax);
    if (priceMin)
      result = result.filter(
        (car) => (car.current_bid || car.starting_bid) >= priceMin,
      );
    if (priceMax)
      result = result.filter(
        (car) => (car.current_bid || car.starting_bid) <= priceMax,
      );

    result = [...result].sort((a, b) => {
      switch (filters.sortBy) {
        case "price_low":
          return (
            (a.current_bid || a.starting_bid) -
            (b.current_bid || b.starting_bid)
          );
        case "price_high":
          return (
            (b.current_bid || b.starting_bid) -
            (a.current_bid || a.starting_bid)
          );
        case "year_new":
          return b.year - a.year;
        case "year_old":
          return a.year - b.year;
        case "mileage_low":
          return a.mileage - b.mileage;
        default:
          return 0;
      }
    });

    return result;
  }, [displayCars, searchQuery, filters]);

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) =>
      value && value !== "all" && value !== "" && value !== "ending_soon",
  ).length;

  const clearAllFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery("");
  };

  const handleBidUpdate = (bid) => {};

  const carIds = filteredCars.map((c) => c.id);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Live Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 sticky top-0 z-40 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white border-0 animate-pulse">
                  <Zap className="w-4 h-4 mr-1" />
                  LIVE
                </Badge>
                <h1 className="text-xl font-bold text-white">
                  {liveAuction.title}
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
                <MapPin className="w-4 h-4" />
                Okara Auction Yard
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Live updates
              </div>
              <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm">Ends in:</span>
                  <CountdownTimer
                    targetDate={liveAuction.end_time}
                    size="small"
                    showLabel={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-[#FFA602]" />
                <span className="font-semibold text-slate-900">
                  {filteredCars.length}
                </span>
                <span className="text-slate-500">Cars Found</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-slate-500">127 active bidders</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">
                Auction ends at 6:00 PM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by make, model, year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={filters.make}
                onValueChange={(v) =>
                  setFilters({ ...filters, make: v, model: "all" })
                }
              >
                <SelectTrigger className="w-36 h-11">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {uniqueMakes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.condition}
                onValueChange={(v) => setFilters({ ...filters, condition: v })}
              >
                <SelectTrigger className="w-36 h-11">
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.sortBy}
                onValueChange={(v) => setFilters({ ...filters, sortBy: v })}
              >
                <SelectTrigger className="w-44 h-11">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending_soon">Ending Soon</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="year_new">Year: Newest First</SelectItem>
                  <SelectItem value="mileage_low">
                    Mileage: Low to High
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* Advanced Filters Button */}
              <AdvancedFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClear={clearAllFilters}
              />

              {/* View Toggle */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 ${viewMode === "grid" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50"}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 ${viewMode === "list" ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:bg-slate-50"}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              {/* Compare Button */}
              {compareCars.length >= 2 && (
                <Link to="/compare">
                  <Button className="bg-[#FFA602] hover:bg-amber-500">
                    <Scale className="w-4 h-4 mr-2" />
                    Compare ({compareCars.length})
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-100">
              <span className="text-sm text-slate-500">Active filters:</span>
              {filters.make !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Make: {filters.make}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilters({ ...filters, make: "all" })}
                  />
                </Badge>
              )}
              {filters.condition !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {filters.condition}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setFilters({ ...filters, condition: "all" })}
                  />
                </Badge>
              )}
              {(filters.priceMin || filters.priceMax) && (
                <Badge variant="secondary" className="gap-1">
                  Price: {filters.priceMin || "0"} - {filters.priceMax || "∞"}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      setFilters({ ...filters, priceMin: "", priceMax: "" })
                    }
                  />
                </Badge>
              )}
              {(filters.yearMin || filters.yearMax) && (
                <Badge variant="secondary" className="gap-1">
                  Year: {filters.yearMin || "any"} - {filters.yearMax || "any"}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() =>
                      setFilters({ ...filters, yearMin: "", yearMax: "" })
                    }
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Updates */}
      <LiveAuctionUpdates
        carIds={carIds}
        onBidUpdate={handleBidUpdate}
        userId={user?.id}
      />

      {/* Saved Searches */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <SavedSearches
            currentFilters={filters}
            onApplyFilter={(f) => setFilters({ ...defaultFilters, ...f })}
            userId={user.id}
          />
        </div>
      )}

      {/* Car Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${searchQuery}-${JSON.stringify(filters)}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              ${
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            `}
          >
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CarCard
                  car={car}
                  auction={liveAuction}
                  compact={viewMode === "list"}
                  showCompare={true}
                  onCompareToggle={toggleCompare}
                  isComparing={compareCars.includes(car.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filteredCars.length === 0 && (
          <div className="text-center py-16">
            <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No cars found
            </h3>
            <p className="text-slate-500">Try adjusting your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
