import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RangeFilter from "../../utils/filter/RangeFilter";
import Input from "../../utils/filter/Input";
import SearchableSelect from "../../common/SearchableSelect";
import FilterSpecs from "../../utils/filter/FilterSpecs";
import ExteriorColor from "../../utils/filter/ExteriorColor";
import InteriorColor from "../../utils/filter/InteriorColor";
import LocationButton from "../../utils/filter/LocationButton";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCarCategories } from "../../../hooks/useCarCategories";
import { isFieldVisible } from "../../../utils/vehicleFieldConfig";
import { fixImageUrl } from "../../../utils/imageUtils";

// Helper function to get dynamic labels based on vehicle type
const getVehicleLabel = (vehicleType, fieldType) => {
  const vehicleName = vehicleType || "Vehicle";
  if (fieldType === "make") {
    return `${vehicleName} Make`;
  } else if (fieldType === "model") {
    return `${vehicleName} Model`;
  }
  return `${vehicleName} ${fieldType}`;
};

const FilterForm = ({ onFilter, simplifiedFields = false }) => {
  // Vehicle type options - same as CreatePostForm and HeroFilter
  const vehicleTypeOptions = [
    "Car",
    "Bus",
    "Truck",
    "Van",
    "Bike",
    "E-bike",
    "Farm",
  ];
  const [availableModels, setAvailableModels] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    vehicleType: "Car",
    minPrice: "",
    maxPrice: "",
    make: "",
    model: "",
    variant: "",
    minYear: "",
    maxYear: "",
    minMileage: "",
    maxMileage: "",
    condition: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    exteriorColor: "",
    interiorColor: "",
    ownerType: "",
    warranty: "",
    minBatteryRange: "",
    maxBatteryRange: "",
    minMotorPower: "",
    maxMotorPower: "",
    country: "",
    city: "",
    radius: "",
    userLat: "",
    userLng: "",
  });

  // Filter categories by selected vehicle type (must be after filters declaration)
  const {
    makes,
    models,
    years,
    countries,
    states,
    cities,
    getCitiesByCountry,
    getStatesByCountry,
    getCitiesByState,
    isLoading: categoriesLoading,
  } = useCarCategories(filters.vehicleType || null);

  // Removed internal query - parent component handles it
  // const [queryParams, setQueryParams] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resolveModelsBySelectedMake = (selectedMakeName) => {
    if (!Array.isArray(models) || models.length === 0) return [];
    if (!selectedMakeName || !String(selectedMakeName).trim()) return [];

    const normalizedMake = String(selectedMakeName).trim().toLowerCase();
    const matchedMakeIds = (makes || [])
      .filter(
        (make) =>
          String(make?.name || "").trim().toLowerCase() === normalizedMake,
      )
      .map((make) => String(make?._id || ""));

    if (matchedMakeIds.length === 0) return [];

    return models.filter((model) => {
      const parent =
        typeof model?.parentCategory === "object" && model?.parentCategory !== null
          ? model.parentCategory._id
          : model?.parentCategory;
      return matchedMakeIds.includes(String(parent || ""));
    });
  };

  // Read URL parameters on mount and apply filters
  useEffect(() => {
    const urlFilters = {};

    // Read all URL parameters
    const make = searchParams.get("make");
    const model = searchParams.get("model");
    const yearMin = searchParams.get("yearMin");
    const yearMax = searchParams.get("yearMax");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");

    // Build filter object from URL params
    if (!simplifiedFields) {
      const city = searchParams.get("city");
      const bodyType = searchParams.get("bodyType");
      const variant = searchParams.get("variant");
      if (city) urlFilters.city = city;
      if (bodyType) urlFilters.bodyType = bodyType;
      if (variant) urlFilters.variant = variant;
    }
    if (make) {
      urlFilters.make = make;
    }
    if (model) urlFilters.model = model;
    if (yearMin) urlFilters.minYear = yearMin;
    if (yearMax) urlFilters.maxYear = yearMax;
    if (priceMin) urlFilters.minPrice = priceMin;
    if (priceMax) urlFilters.maxPrice = priceMax;

    // Update filters state
    if (Object.keys(urlFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...urlFilters }));

      // Build backend filters and trigger search
      const backendFilters = {};
      if (!simplifiedFields) {
        if (urlFilters.city) backendFilters.city = urlFilters.city;
        if (urlFilters.bodyType) backendFilters.bodyType = urlFilters.bodyType;
        if (urlFilters.variant) backendFilters.variant = urlFilters.variant;
      }
      if (urlFilters.make) backendFilters.make = urlFilters.make;
      if (urlFilters.model) backendFilters.model = urlFilters.model;
      if (urlFilters.minYear) backendFilters.yearMin = urlFilters.minYear;
      if (urlFilters.maxYear) backendFilters.yearMax = urlFilters.maxYear;
      if (urlFilters.minPrice) backendFilters.priceMin = urlFilters.minPrice;
      if (urlFilters.maxPrice) backendFilters.priceMax = urlFilters.maxPrice;

      // Trigger filter
      if (onFilter && Object.keys(backendFilters).length > 0) {
        onFilter(backendFilters);
      }
    }
  }, [searchParams, makes, onFilter, simplifiedFields]);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));

    if (field === "vehicleType") {
      setAvailableModels([]); // Models depend on make; make is cleared below
      // Clear fields that are not relevant to selected type and reset dependent fields
      setFilters((prev) => ({
        ...prev,
        make: "", // Reset make when vehicle type changes
        model: "", // Reset model when vehicle type changes
        bodyType: isFieldVisible(value, "bodyType") ? prev.bodyType : "",
        minBatteryRange: isFieldVisible(value, "batteryRange")
          ? prev.minBatteryRange
          : "",
        maxBatteryRange: isFieldVisible(value, "batteryRange")
          ? prev.maxBatteryRange
          : "",
        minMotorPower: isFieldVisible(value, "motorPower")
          ? prev.minMotorPower
          : "",
        maxMotorPower: isFieldVisible(value, "motorPower")
          ? prev.maxMotorPower
          : "",
        // Keep condition and sellerType - they apply to all vehicle types
      }));
    }

    // When make changes, update available models
    if (field === "make") {
      const makeModels = resolveModelsBySelectedMake(value);
      setAvailableModels(makeModels);
      if (
        filters.model &&
        makeModels.length > 0 &&
        !makeModels.find((m) => m.name === filters.model)
      ) {
        setFilters((prev) => ({ ...prev, model: "" }));
      }
    }

    // When country changes, update available cities
    if (field === "country") {
      if (value) {
        const selectedCountryObj = countries.find((c) => c.name === value);
        if (selectedCountryObj) {
          const countryCities =
            getCitiesByCountry[selectedCountryObj._id] || [];
          setAvailableCities(countryCities.length > 0 ? countryCities : cities);
          // Reset city if it's not available for the new country
          if (
            filters.city &&
            countryCities.length > 0 &&
            !countryCities.find((c) => c.name === filters.city)
          ) {
            setFilters((prev) => ({ ...prev, city: "" }));
          }
        } else {
          setAvailableCities(cities);
        }
      } else {
        // Show all cities when country is cleared
        setAvailableCities(cities);
      }
    }
  };

  // Initialize available models - show all if no make selected, filtered if make selected
  useEffect(() => {
    setAvailableModels(resolveModelsBySelectedMake(filters.make));
  }, [filters.make, makes, models]);

  // Initialize available states - show all if no country selected, filtered if country selected
  useEffect(() => {
    if (filters.country && countries.length > 0 && getStatesByCountry) {
      const selectedCountryObj = countries.find(
        (c) => c.name === filters.country,
      );
      if (selectedCountryObj) {
        const countryStates = getStatesByCountry[selectedCountryObj._id] || [];
        setAvailableStates(countryStates.length > 0 ? countryStates : states);
      } else {
        setAvailableStates(states);
      }
    } else {
      // Show all states when no country is selected
      setAvailableStates(states);
    }
  }, [filters.country, countries, states, getStatesByCountry]);

  // Initialize available cities - show all if no country/state selected, filtered if country/state selected
  useEffect(() => {
    if (filters.country && countries.length > 0) {
      const selectedCountryObj = countries.find(
        (c) => c.name === filters.country,
      );
      if (selectedCountryObj) {
        // If state is selected, filter cities by state, otherwise by country
        if (filters.state && getCitiesByState) {
          const selectedStateObj = availableStates.find(
            (s) => s.name === filters.state,
          );
          if (selectedStateObj && getCitiesByState[selectedStateObj._id]) {
            const stateCities = getCitiesByState[selectedStateObj._id] || [];
            setAvailableCities(stateCities.length > 0 ? stateCities : cities);
          } else {
            // Fallback to country cities
            const countryCities =
              getCitiesByCountry[selectedCountryObj._id] || [];
            setAvailableCities(
              countryCities.length > 0 ? countryCities : cities,
            );
          }
        } else {
          // Filter by country only
          const countryCities =
            getCitiesByCountry[selectedCountryObj._id] || [];
          setAvailableCities(countryCities.length > 0 ? countryCities : cities);
        }
      } else {
        setAvailableCities(cities);
      }
    } else {
      // Show all cities when no country is selected
      setAvailableCities(cities);
    }
  }, [
    filters.country,
    filters.state,
    countries,
    states,
    cities,
    getCitiesByCountry,
    getCitiesByState,
    availableStates,
  ]);

  const handleRangeChange = (type, values) => {
    if (type === "price") {
      setFilters((prev) => ({
        ...prev,
        minPrice: values[0],
        maxPrice: values[1],
      }));
    } else if (type === "year") {
      setFilters((prev) => ({
        ...prev,
        minYear: values[0],
        maxYear: values[1],
      }));
    } else if (type === "mileage") {
      setFilters((prev) => ({
        ...prev,
        minMileage: values[0],
        maxMileage: values[1],
      }));
    } else if (type === "batteryRange") {
      setFilters((prev) => ({
        ...prev,
        minBatteryRange: values[0],
        maxBatteryRange: values[1],
      }));
    } else if (type === "motorPower") {
      setFilters((prev) => ({
        ...prev,
        minMotorPower: values[0],
        maxMotorPower: values[1],
      }));
    }
  };

  const handleLocationChange = (locationData) => {
    if (locationData && locationData.coordinates) {
      // Store coordinates for location-based filtering
      handleChange("userLat", locationData.coordinates.lat.toString());
      handleChange("userLng", locationData.coordinates.lng.toString());

      // Also update city if address is provided
      if (locationData.address) {
        // Extract city from address if possible
        const addressParts = locationData.address.split(",");
        if (addressParts.length > 0) {
          handleChange("city", addressParts[addressParts.length - 1].trim());
        }
      }
    } else if (typeof locationData === "string") {
      handleChange("city", locationData);
    }
  };

  const validateFilters = (filters) => {
    if (
      filters.minPrice &&
      filters.maxPrice &&
      Number(filters.minPrice) > Number(filters.maxPrice)
    ) {
      toast.error("Minimum price cannot be greater than maximum price");
      return false;
    }
    if (
      filters.minYear &&
      filters.maxYear &&
      Number(filters.minYear) > Number(filters.maxYear)
    ) {
      toast.error("Minimum year cannot be greater than maximum year");
      return false;
    }
    if (
      filters.minMileage &&
      filters.maxMileage &&
      Number(filters.minMileage) > Number(filters.maxMileage)
    ) {
      toast.error("Minimum mileage cannot be greater than maximum mileage");
      return false;
    }
    if (
      filters.minEngineCapacity &&
      filters.maxEngineCapacity &&
      Number(filters.minEngineCapacity) > Number(filters.maxEngineCapacity)
    ) {
      toast.error(
        "Minimum engine capacity cannot be greater than maximum engine capacity",
      );
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFilters(filters)) return;

    const backendFilters = {};

    // Map filters to backend query
    if (!simplifiedFields && filters.search) backendFilters.search = filters.search;
    if (filters.vehicleType) backendFilters.vehicleType = filters.vehicleType;
    if (filters.minPrice) backendFilters.priceMin = filters.minPrice;
    if (filters.maxPrice) backendFilters.priceMax = filters.maxPrice;
    if (filters.minYear) backendFilters.yearMin = filters.minYear;
    if (filters.maxYear) backendFilters.yearMax = filters.maxYear;
    if (!simplifiedFields && filters.variant) backendFilters.variant = filters.variant;
    if (filters.minMileage) backendFilters.mileageMin = filters.minMileage;
    if (filters.maxMileage) backendFilters.mileageMax = filters.maxMileage;
    if (filters.make) backendFilters.make = filters.make;
    if (filters.model) backendFilters.model = filters.model;
    if (!simplifiedFields && filters.bodyType)
      backendFilters.bodyType = filters.bodyType;
    if (filters.fuelType) backendFilters.fuelType = filters.fuelType;
    if (filters.transmission)
      backendFilters.transmission = filters.transmission;
    if (!simplifiedFields && filters.exteriorColor)
      backendFilters.colorExterior = filters.exteriorColor;
    if (!simplifiedFields && filters.interiorColor)
      backendFilters.colorInterior = filters.interiorColor;
    if (filters.ownerType) backendFilters.ownerType = filters.ownerType;
    if (filters.warranty) backendFilters.warranty = filters.warranty;
    if (filters.minBatteryRange)
      backendFilters.batteryRangeMin = filters.minBatteryRange;
    if (filters.maxBatteryRange)
      backendFilters.batteryRangeMax = filters.maxBatteryRange;
    if (filters.minMotorPower)
      backendFilters.motorPowerMin = filters.minMotorPower;
    if (filters.maxMotorPower)
      backendFilters.motorPowerMax = filters.maxMotorPower;
    if (filters.condition) backendFilters.condition = filters.condition;
    if (!simplifiedFields && filters.country) backendFilters.country = filters.country;
    if (!simplifiedFields && filters.city) backendFilters.city = filters.city;
    if (!simplifiedFields && filters.radius) backendFilters.radius = filters.radius;
    if (!simplifiedFields && filters.userLat) backendFilters.userLat = filters.userLat;
    if (!simplifiedFields && filters.userLng) backendFilters.userLng = filters.userLng;

    // Remove empty values
    const cleanFilters = {};
    Object.entries(backendFilters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        cleanFilters[key] = value;
      }
    });

    // Trigger filter callback and navigate to results page with URL params
    if (Object.keys(cleanFilters).length > 0) {
      if (onFilter) onFilter(cleanFilters);

      const params = new URLSearchParams();
      Object.entries(cleanFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });

      navigate(`/search-results?${params.toString()}`);
      toast.success("Filters applied successfully!");
    } else {
      toast.error("Please select at least one filter");
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      vehicleType: "Car",
      minPrice: "",
      maxPrice: "",
      make: "",
      model: "",
      variant: "",
      minYear: "",
      maxYear: "",
      minMileage: "",
      maxMileage: "",
      condition: "",
      bodyType: "",
      fuelType: "",
      transmission: "",
      exteriorColor: "",
      interiorColor: "",
      ownerType: "",
      warranty: "",
      minBatteryRange: "",
      maxBatteryRange: "",
      minMotorPower: "",
      maxMotorPower: "",
      country: "",
      city: "",
      radius: "",
      userLat: "",
      userLng: "",
    });
    // setQueryParams(null); // Removed - parent handles it
    if (onFilter) onFilter(null); // Notify parent to clear results
    setAvailableModels([]);
    setAvailableCities(cities);
    toast.success("Filters cleared");
  };

  return (
    <div className="min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Filter Cars</h2>
          <p className="text-sm text-gray-600 mt-1">
            Find your perfect car with advanced filters
          </p>
        </div>
        <button
          type="button"
          onClick={handleClearFilters}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear All
        </button>
      </div>
      <form className="space-y-4 h-auto min-w-0" onSubmit={handleSubmit}>
        {/* Vehicle Type Selection - Button Style like CreatePostForm */}
        <div className="mb-6">
          <label className="block mb-3 text-center font-medium text-gray-700">
            Vehicle Type
          </label>
          <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
            {vehicleTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleChange("vehicleType", type)}
                className={`group relative px-3 sm:px-5 py-1.5 rounded font-semibold text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  filters.vehicleType === type
                    ? "bg-primary-500 text-black shadow-lg shadow-primary-500/25 ring-2 ring-primary-500 ring-offset-2"
                    : "bg-white text-gray-700 border-2 border-gray-200 hover:border-primary-500 hover:shadow-md hover:bg-primary-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {!simplifiedFields && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Search by Title
            </label>
            <Input
              inputType="text"
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              placeholder="e.g., Toyota Camry"
            />
          </div>
        )}

        {/* Price */}
        <div className="field space-y-2 min-w-0">
          <label className="block mb-2 text-sm font-medium text-gray-700">Price (PKR)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block mb-1 text-xs text-gray-500">From</label>
              <Input
                inputType="number"
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-500">To</label>
              <Input
                inputType="number"
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
          <div className="min-w-0 overflow-hidden">
            <RangeFilter
              type="price"
              min={0}
              max={10000000}
              onChange={(values) => handleRangeChange("price", values)}
            />
          </div>
        </div>

        {/* Row 1: Make and Model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {getVehicleLabel(filters.vehicleType || "Vehicle", "make")}
            </label>
            <SearchableSelect
              value={filters.make}
              onChange={(value) => handleChange("make", value)}
              options={makes.map((make) => ({
                value: make.name,
                label: make.name,
              }))}
              placeholder={
                !filters.vehicleType
                  ? "Select vehicle type first"
                  : categoriesLoading
                    ? "Loading..."
                    : "All Makes"
              }
              disabled={!filters.vehicleType || categoriesLoading}
              isLoading={categoriesLoading}
            />
          </div>
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              {getVehicleLabel(filters.vehicleType || "Vehicle", "model")}
            </label>
            <SearchableSelect
              value={filters.model}
              onChange={(value) => handleChange("model", value)}
              options={availableModels.map((model) => ({
                value: model.name,
                label: model.name,
              }))}
              placeholder={
                !filters.vehicleType
                  ? "Select vehicle type first"
                  : !filters.make
                    ? "Select make first"
                    : categoriesLoading
                      ? "Loading..."
                      : availableModels.length === 0
                        ? "No models for this make"
                        : "Select Model"
              }
              disabled={
                !filters.vehicleType || !filters.make || categoriesLoading
              }
              isLoading={categoriesLoading}
            />
          </div>
        </div>

        {!simplifiedFields && (
          <div className="field min-w-0">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Variant
            </label>
            <Input
              inputType="text"
              value={filters.variant}
              onChange={(e) => handleChange("variant", e.target.value)}
              placeholder="e.g., VTi Oriel"
            />
          </div>
        )}

        {/* Year - new line after Variant */}
        <div className="field space-y-2 min-w-0">
          <label className="block mb-2 text-sm font-medium text-gray-700">Year</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block mb-1 text-xs text-gray-500">From</label>
              <Input
                inputType="number"
                value={filters.minYear}
                onChange={(e) => handleChange("minYear", e.target.value)}
                placeholder="1950"
                min="1950"
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-500">To</label>
              <Input
                inputType="number"
                value={filters.maxYear}
                onChange={(e) => handleChange("maxYear", e.target.value)}
                placeholder={new Date().getFullYear().toString()}
                min="1950"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
          <div className="min-w-0 overflow-hidden">
            <RangeFilter
              type="year"
              min={1950}
              max={new Date().getFullYear()}
              onChange={(values) => handleRangeChange("year", values)}
            />
          </div>
        </div>

        {/* Mileage */}
        <div className="field space-y-2 min-w-0">
          <label className="block mb-2 text-sm font-medium text-gray-700">Mileage</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block mb-1 text-xs text-gray-500">From</label>
              <Input
                inputType="number"
                value={filters.minMileage}
                onChange={(e) => handleChange("minMileage", e.target.value)}
                placeholder="Min"
              />
            </div>
            <div>
              <label className="block mb-1 text-xs text-gray-500">To</label>
              <Input
                inputType="number"
                value={filters.maxMileage}
                onChange={(e) => handleChange("maxMileage", e.target.value)}
                placeholder="Max"
              />
            </div>
          </div>
          <div className="min-w-0 overflow-hidden">
            <RangeFilter
              type="mileage"
              min={0}
              max={300000}
              onChange={(values) => handleRangeChange("mileage", values)}
            />
          </div>
        </div>

        {/* Battery Range (E-bike) */}
        {isFieldVisible(filters.vehicleType || "Car", "batteryRange") && (
          <div className="field space-y-2 min-w-0">
            <label className="block mb-2 text-sm font-medium text-gray-700">Battery Range (km)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block mb-1 text-xs text-gray-500">From</label>
                <Input
                  inputType="number"
                  value={filters.minBatteryRange}
                  onChange={(e) =>
                    handleChange("minBatteryRange", e.target.value)
                  }
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-500">To</label>
                <Input
                  inputType="number"
                  value={filters.maxBatteryRange}
                  onChange={(e) =>
                    handleChange("maxBatteryRange", e.target.value)
                  }
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        )}

        {/* Motor Power (E-bike) */}
        {isFieldVisible(filters.vehicleType || "Car", "motorPower") && (
          <div className="field space-y-2 min-w-0">
            <label className="block mb-2 text-sm font-medium text-gray-700">Motor Power (W)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block mb-1 text-xs text-gray-500">From</label>
                <Input
                  inputType="number"
                  value={filters.minMotorPower}
                  onChange={(e) =>
                    handleChange("minMotorPower", e.target.value)
                  }
                  placeholder="Min"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-500">To</label>
                <Input
                  inputType="number"
                  value={filters.maxMotorPower}
                  onChange={(e) =>
                    handleChange("maxMotorPower", e.target.value)
                  }
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        )}

        {/* Condition Filter - Full Width */}
        <div className="field space-y-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Condition
          </label>
          <select
            value={filters.condition || ""}
            onChange={(e) => handleChange("condition", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Conditions</option>
            <option value="New">New</option>
            <option value="Used">Used</option>
          </select>
        </div>

        {/* Body Type Filter - Full Width */}
        {!simplifiedFields && isFieldVisible(filters.vehicleType || "Car", "bodyType") && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Body Type
            </label>
            <FilterSpecs specType="bodyTypes" vehicleType={filters.vehicleType || "Car"} value={filters.bodyType} onChange={(value) => handleChange("bodyType", value)} />
          </div>
        )}

        {/* Fuel Type Filter - Full Width */}
        {isFieldVisible(filters.vehicleType || "Car", "fuelType") && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Fuel Type
            </label>
            <FilterSpecs specType="fuelType" vehicleType={filters.vehicleType || "Car"} value={filters.fuelType} onChange={(value) => handleChange("fuelType", value)} />
          </div>
        )}

        {/* Transmission Filter - Full Width */}
        {isFieldVisible(filters.vehicleType || "Car", "transmission") && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Transmission
            </label>
            <FilterSpecs specType="transmissionType" value={filters.transmission} onChange={(value) => handleChange("transmission", value)} />
          </div>
        )}

        {!simplifiedFields && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Exterior Color
            </label>
            <ExteriorColor
              value={filters.exteriorColor}
              onChange={(value) => handleChange("exteriorColor", value)}
            />
          </div>
        )}

        {!simplifiedFields && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Interior Color
            </label>
            <InteriorColor
              value={filters.interiorColor}
              onChange={(value) => handleChange("interiorColor", value)}
            />
          </div>
        )}

        {/* Owner Type - Full Width */}
        <div className="field space-y-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Owner Type
          </label>
          <FilterSpecs specType="ownerType" value={filters.ownerType} onChange={(value) => handleChange("ownerType", value)} />
        </div>

        {/* Warranty - Full Width */}
        <div className="field space-y-2">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Warranty
          </label>
          <FilterSpecs specType="warrantyType" value={filters.warranty} onChange={(value) => handleChange("warranty", value)} />
        </div>

        {!simplifiedFields && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Country
            </label>
            <SearchableSelect
              value={filters.country}
              onChange={(value) => handleChange("country", value)}
              options={countries.map((country) => ({
                value: country.name,
                label: country.name,
              }))}
              placeholder="All Countries"
              disabled={categoriesLoading}
              isLoading={categoriesLoading}
            />
          </div>
        )}

        {!simplifiedFields && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              City
            </label>
            <SearchableSelect
              value={filters.city}
              onChange={(value) => handleChange("city", value)}
              options={availableCities.map((city) => ({
                value: city.name,
                label: city.name,
              }))}
              placeholder={
                categoriesLoading
                  ? "Loading..."
                  : availableCities.length === 0
                    ? "No cities available"
                    : filters.country
                      ? "All Cities"
                      : "All Cities (select Country to filter)"
              }
              disabled={categoriesLoading}
              isLoading={categoriesLoading}
            />
          </div>
        )}

        {!simplifiedFields && (
          <div className="field space-y-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Location
            </label>
            <LocationButton
              value={
                filters.userLat && filters.userLng
                  ? JSON.stringify([
                      parseFloat(filters.userLng),
                      parseFloat(filters.userLat),
                    ])
                  : null
              }
              onChange={handleLocationChange}
            />
          </div>
        )}

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="bg-primary-500 text-white px-4 py-2 rounded hover:opacity-90 transition-colors w-full text-xl shadow-lg shadow-gray-400 font-semibold"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterForm;
