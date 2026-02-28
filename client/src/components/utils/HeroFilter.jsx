import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCarCategories } from "../../hooks/useCarCategories";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import toast from "react-hot-toast";
import { capitalize } from "../../utils/formatters";
import { FiSearch } from "react-icons/fi";
import { VscChevronDown } from "react-icons/vsc";

const HeroFilter = () => {
  const navigate = useNavigate();
  const [vehicleType] = useState("Car"); // Defaulting for search context

  const { makes, models, cities } = useCarCategories(vehicleType);

  const [filters, setFilters] = useState({
    make: "",
    model: "",
    city: "",
    minPrice: "",
    maxPrice: "",
  });

  const [queryParams, setQueryParams] = useState(null);

  const { data: filteredCars } = useGetFilteredCarsQuery(queryParams, {
    skip: !queryParams,
  });

  const cityOptions = useMemo(() => {
    if (!Array.isArray(cities)) return [];

    const uniqueCities = Array.from(
      new Map(cities.map((city) => [city.name, city])).values(),
    );

    return uniqueCities.sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [cities]);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (
      !filters.make &&
      !filters.model &&
      !filters.city &&
      !filters.minPrice &&
      !filters.maxPrice
    ) {
      toast.error("Please select a filter");
      return;
    }

    const payload = {
      vehicleType,
      make: filters.make || undefined,
      model: filters.model || undefined,
      city: filters.city || undefined,
      priceMin: filters.minPrice || undefined,
      priceMax: filters.maxPrice || undefined,
    };

    const cleanPayload = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanPayload[key] = value;
      }
    });

    setQueryParams(cleanPayload);
  };

  useEffect(() => {
    if (filteredCars && queryParams) {
      const params = new URLSearchParams(queryParams);
      navigate(`/search-results?${params.toString()}`);
    }
  }, [filteredCars, queryParams, navigate]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm p-4 sm:p-5 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:gap-5">
          <h2 className="text-white font-medium text-lg md:text-left sm:text-left lg:text-left text-center">
            Find the Best Vehicles for Sale in Pakistan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 items-center">
            <div className="relative min-w-0">
              <select
                className="h-12 w-full bg-gray-50 border-none rounded-xl px-4 pr-10 text-gray-500 appearance-none focus:ring-2 focus:ring-emerald-900"
                value={filters.make}
                onChange={(e) => handleChange("make", e.target.value)}
              >
                <option value="">Make</option>
                {makes?.map((m) => (
                  <option key={m._id} value={m.name}>
                    {capitalize(m.name)}
                  </option>
                ))}
              </select>
              <VscChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-base" />
            </div>

            <div className="relative min-w-0">
              <select
                className="h-12 w-full bg-gray-50 border-none rounded-xl px-4 pr-10 text-gray-500 appearance-none focus:ring-2 focus:ring-emerald-900"
                value={filters.model}
                onChange={(e) => handleChange("model", e.target.value)}
              >
                <option value="">Model</option>
                {models?.map((m) => (
                  <option key={m._id} value={m.name}>
                    {capitalize(m.name)}
                  </option>
                ))}
              </select>
              <VscChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-base" />
            </div>

            <div className="relative min-w-0">
              <select
                className="h-12 w-full bg-gray-50 border-none rounded-xl px-4 pr-10 text-gray-500 appearance-none focus:ring-2 focus:ring-emerald-900"
                value={filters.city}
                onChange={(e) => handleChange("city", e.target.value)}
              >
                <option value="">City</option>
                {cityOptions.map((city) => (
                  <option key={city._id} value={city.name}>
                    {capitalize(city.name)}
                  </option>
                ))}
              </select>
              <VscChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-base" />
            </div>

            <div className="min-w-0">
              <input
                type="number"
                min="0"
                placeholder="Min Price"
                className="h-12 w-full bg-gray-50 border-none rounded-xl px-4 text-gray-500 focus:ring-2 focus:ring-primary placeholder:text-gray-300"
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
              />
            </div>

            <div className="min-w-0">
              <input
                type="number"
                min="0"
                placeholder="Max Price"
                className="h-12 w-full bg-gray-50 border-none rounded-xl px-4 text-gray-500 focus:ring-2 focus:ring-primary placeholder:text-gray-300"
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full bg-primary-500 hover:opacity-90 text-white px-8 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors"
            >
              <FiSearch className="text-lg" />
              Search
            </button>
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-start gap-3">
            <button
              type="button"
              onClick={() => navigate("/listings")}
              className="h-12 w-full sm:w-auto border border-primary text-primary px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-w-[200px]"
            >
              Browse Listings
            </button>
            <button
              type="button"
              onClick={() => navigate("/create-post")}
              className="h-12 w-full sm:w-auto bg-primary text-white px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity min-w-[170px]"
            >
              Sell Your Car
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroFilter;
