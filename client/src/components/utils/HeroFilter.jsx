import React, { useState, useEffect, useMemo } from "react";
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
  const [vehicleType] = useState("Car"); // Defaulting for search context

  const { makes, models, cities, getModelsByMake } =
    useCarCategories(vehicleType);

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
    {
      skip: !queryParams,
    },
  );

  const cityOptions = useMemo(() => {
    if (!Array.isArray(cities)) return [];

    const uniqueCities = Array.from(
      new Map(cities.map((city) => [city.name, city])).values(),
    );

    return uniqueCities.sort((a, b) =>
      (a.name || "").localeCompare(b.name || ""),
    );
  }, [cities]);

  const modelOptions = useMemo(() => {
    if (!Array.isArray(models) || models.length === 0) return [];
    // Models only available after make is selected; show only models for selected make.
    if (!filters.make) return [];

    const selectedMakeName = String(filters.make).trim().toLowerCase();
    const matchedMakeIds = (makes || [])
      .filter(
        (make) =>
          String(make?.name || "")
            .trim()
            .toLowerCase() === selectedMakeName,
      )
      .map((make) => String(make?._id || ""));

    if (matchedMakeIds.length === 0) return [];

    return models.filter((model) => {
      const parent =
        typeof model?.parentCategory === "object" &&
        model?.parentCategory !== null
          ? model.parentCategory._id
          : model?.parentCategory;
      return matchedMakeIds.includes(String(parent || ""));
    });
  }, [models, makes, filters.make]);

  const makeSelectOptions = useMemo(
    () =>
      (makes || []).map((make) => ({
        value: make.name,
        label: capitalize(make.name),
      })),
    [makes],
  );

  const modelSelectOptions = useMemo(
    () =>
      (modelOptions || []).map((model) => ({
        value: model.name,
        label: capitalize(model.name),
      })),
    [modelOptions],
  );

  const citySelectOptions = useMemo(
    () =>
      cityOptions.map((city) => ({
        value: city.name,
        label: capitalize(city.name),
      })),
    [cityOptions],
  );

  const DropdownIndicator = (props) => (
    <components.DropdownIndicator {...props}>
      <VscChevronDown className="text-gray-400 text-base" />
    </components.DropdownIndicator>
  );

  const searchableSelectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
      height: "48px",
      borderRadius: "12px",
      border: "none",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(6, 78, 59, 0.2)" : "none",
      backgroundColor: "#f9fafb",
      cursor: "text",
    }),
    valueContainer: (base) => ({
      ...base,
      padding: "0 14px",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#6b7280",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151",
    }),
    indicatorSeparator: () => ({ display: "none" }),
    menu: (base) => ({
      ...base,
      marginTop: 6,
      borderRadius: "12px",
      overflow: "hidden",
      width: "100%",
      minWidth: "100%",
      zIndex: 60,
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "260px",
      paddingTop: 0,
      paddingBottom: 0,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f3f4f6" : "#fff",
      color: "#374151",
      cursor: "pointer",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 9999,
    }),
  };

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

    if (
      filters.minPrice &&
      filters.maxPrice &&
      Number(filters.minPrice) > Number(filters.maxPrice)
    ) {
      toast.error("Min Price cannot be greater than Max Price");
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

  useEffect(() => {
    if (!searchError) return;
    toast.error(searchError?.data?.message || "Failed to search cars.");
  }, [searchError]);

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-sm p-4 sm:p-5 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:gap-5">
          <h2 className="text-white font-medium text-lg md:text-left sm:text-left lg:text-left text-center">
            Find the Best Vehicles for Sale in Pakistan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 items-center">
            <div className="relative min-w-0">
              <Select
                value={
                  makeSelectOptions.find(
                    (option) => option.value === filters.make,
                  ) || null
                }
                onChange={(option) => handleChange("make", option?.value || "")}
                options={makeSelectOptions}
                placeholder="Make"
                isClearable
                isSearchable
                styles={searchableSelectStyles}
                components={{ DropdownIndicator }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            <div className="relative min-w-0">
              <Select
                value={
                  modelSelectOptions.find(
                    (option) => option.value === filters.model,
                  ) || null
                }
                onChange={(option) =>
                  handleChange("model", option?.value || "")
                }
                options={modelSelectOptions}
                placeholder="Model"
                isClearable={!!filters.make}
                isSearchable={!!filters.make}
                isDisabled={!filters.make}
                styles={searchableSelectStyles}
                components={{ DropdownIndicator }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
            </div>

            <div className="relative min-w-0">
              <Select
                value={
                  citySelectOptions.find(
                    (option) => option.value === filters.city,
                  ) || null
                }
                onChange={(option) => handleChange("city", option?.value || "")}
                options={citySelectOptions}
                placeholder="City"
                isClearable={!!filters.model}
                isSearchable={!!filters.model}
                isDisabled={!filters.model}
                styles={searchableSelectStyles}
                components={{ DropdownIndicator }}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
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
              className="h-12 w-full sm:w-auto border border-primary   text-primary px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-w-[200px]"
            >
              Browse Listings
            </button>
            <button
              type="button"
              onClick={() => navigate("/create-post")}
              className="h-12 w-full sm:w-auto border border-primary   text-primary px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-w-[200px]"
            >
              Sell Your Car
            </button>
            <button
              type="button"
              onClick={() => navigate("/auctions/live")}
              className="h-12 w-full sm:w-auto border border-primary   text-primary px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-w-[200px]"
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
