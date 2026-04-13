import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select, { components } from "react-select";
import { useCarCategories } from "../../hooks/useCarCategories";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import toast from "react-hot-toast";
import { capitalize } from "../../utils/formatters";
import { FiSearch } from "react-icons/fi";
import { VscChevronDown } from "react-icons/vsc";

const HeroFilter = () => {
  const navigate = useNavigate();
  const [vehicleType] = useState("Car");

  const { makes, models, cities } = useCarCategories(vehicleType);

  const [filters, setFilters] = useState({
    make: "",
    model: "",
    city: "",
    minPrice: "",
    maxPrice: "",
  });

  const [queryParams, setQueryParams] = useState(null);

  const { data: filteredCars, error: searchError } = useGetFilteredCarsQuery(
    queryParams,
    { skip: !queryParams },
  );

  const menuPortalTarget = typeof window !== "undefined" ? document.body : null;

  const DropdownIndicator = useCallback(
    (props) => (
      <components.DropdownIndicator {...props}>
        <VscChevronDown className="text-gray-400 text-base" />
      </components.DropdownIndicator>
    ),
    [],
  );

  const searchableSelectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: "48px",
        height: "48px",
        borderRadius: "12px",
        border: "none",
        boxShadow: state.isFocused ? "0 0 0 2px rgba(6, 78, 59, 0.2)" : "none",
        backgroundColor: "#f9fafb",
      }),
      valueContainer: (base) => ({ ...base, padding: "0 14px" }),
      placeholder: (base) => ({ ...base, color: "#6b7280" }),
      singleValue: (base) => ({ ...base, color: "#374151" }),
      indicatorSeparator: () => ({ display: "none" }),
      menu: (base) => ({
        ...base,
        marginTop: 6,
        borderRadius: "12px",
        overflow: "hidden",
        zIndex: 60,
      }),
      menuList: (base) => ({ ...base, maxHeight: "260px" }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
        color: "#374151",
      }),
      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    }),
    [],
  );

  const cityOptions = useMemo(() => {
    if (!Array.isArray(cities)) return [];
    return Array.from(new Map(cities.map((c) => [c.name, c])).values()).sort(
      (a, b) => (a.name || "").localeCompare(b.name || ""),
    );
  }, [cities]);

  const modelOptions = useMemo(() => {
    if (!Array.isArray(models) || !filters.make) return [];

    const selectedMake = filters.make.toLowerCase();

    const matchedIds = (makes || [])
      .filter((m) => m?.name?.toLowerCase().trim() === selectedMake.trim())
      .map((m) => String(m._id));

    return models.filter((model) => {
      const parent =
        typeof model.parentCategory === "object"
          ? model.parentCategory._id
          : model.parentCategory;

      return matchedIds.includes(String(parent));
    });
  }, [models, makes, filters.make]);

  const makeSelectOptions = useMemo(
    () =>
      (makes || []).map((m) => ({
        value: m.name,
        label: capitalize(m.name),
      })),
    [makes],
  );

  const modelSelectOptions = useMemo(
    () =>
      modelOptions.map((m) => ({
        value: m.name,
        label: capitalize(m.name),
      })),
    [modelOptions],
  );

  const citySelectOptions = useMemo(
    () =>
      cityOptions.map((c) => ({
        value: c.name,
        label: capitalize(c.name),
      })),
    [cityOptions],
  );

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "make" ? { model: "", city: "" } : {}),
      ...(field === "model" ? { city: "" } : {}),
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (Object.values(filters).every((v) => !v)) {
      toast.error("Please select a filter");
      return;
    }

    if (
      filters.minPrice &&
      filters.maxPrice &&
      Number(filters.minPrice) > Number(filters.maxPrice)
    ) {
      toast.error("Min Price cannot be greater than Max Price");
      return;
    }

    const payload = Object.fromEntries(
      Object.entries({
        vehicleType,
        make: filters.make,
        model: filters.model,
        city: filters.city,
        priceMin: filters.minPrice,
        priceMax: filters.maxPrice,
      }).filter(([_, v]) => v),
    );

    setQueryParams(payload);
  };

  useEffect(() => {
    if (filteredCars && queryParams) {
      const params = new URLSearchParams(queryParams);
      navigate(`/search-results?${params.toString()}`);
    }
  }, [filteredCars, queryParams, navigate]);

  useEffect(() => {
    if (searchError) {
      toast.error(searchError?.data?.message || "Search failed");
    }
  }, [searchError]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm p-4 sm:p-5 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:gap-5">
          <h2 className="text-white font-medium text-lg text-center sm:text-left">
            Find the Best Cars for Sale in Pakistan with Verified Listings &
            Great Deals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3">
            <div>
              <label htmlFor="make-select" className="sr-only">Car Make</label>
              <Select
                inputId="make-select"
                aria-label="Select car make"
                value={
                  makeSelectOptions.find((o) => o.value === filters.make) || null
                }
                onChange={(o) => handleChange("make", o?.value || "")}
                options={makeSelectOptions}
                placeholder="Make"
                isClearable
                styles={searchableSelectStyles}
                components={{ DropdownIndicator }}
                menuPortalTarget={menuPortalTarget}
              />
            </div>

            <div>
              <label htmlFor="model-select" className="sr-only">Car Model</label>
              <Select
                inputId="model-select"
                aria-label="Select car model"
                value={
                  modelSelectOptions.find((o) => o.value === filters.model) ||
                  null
                }
                onChange={(o) => handleChange("model", o?.value || "")}
                options={modelSelectOptions}
                placeholder="Model"
                isDisabled={!filters.make}
                styles={searchableSelectStyles}
                components={{ DropdownIndicator }}
                menuPortalTarget={menuPortalTarget}
              />
            </div>

            <div>
              <label htmlFor="city-select" className="sr-only">City</label>
              <Select
                inputId="city-select"
                aria-label="Select city"
                value={
                  citySelectOptions.find((o) => o.value === filters.city) || null
                }
                onChange={(o) => handleChange("city", o?.value || "")}
                options={citySelectOptions}
                placeholder="City"
                isDisabled={!filters.model}
                styles={searchableSelectStyles}
                components={{ DropdownIndicator }}
                menuPortalTarget={menuPortalTarget}
              />
            </div>

            <div>
              <label htmlFor="min-price" className="sr-only">Min Price</label>
              <input
                id="min-price"
                type="number"
                placeholder="Min Price"
                className="h-12 bg-gray-50 rounded-xl px-4"
                value={filters.minPrice}
                onChange={(e) => handleChange("minPrice", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="max-price" className="sr-only">Max Price</label>
              <input
                id="max-price"
                type="number"
                placeholder="Max Price"
                className="h-12 bg-gray-50 rounded-xl px-4"
                value={filters.maxPrice}
                onChange={(e) => handleChange("maxPrice", e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="h-12 bg-primary-600 text-white rounded-xl flex items-center justify-center gap-2 font-medium"
            >
              <FiSearch />
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/listings")}
              type="button"
              className="h-12 border border-primary text-primary px-4 rounded-lg"
            >
              Browse Listings
            </button>
            <button
              onClick={() => navigate("/create-post")}
              type="button"
              className="h-12 border border-primary text-primary px-4 rounded-lg"
            >
              Sell Your Car
            </button>
            <button
              onClick={() => navigate("/auctions/live")}
              type="button"
              className="h-12 border border-primary text-primary px-4 rounded-lg"
            >
              Live Auction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroFilter;
