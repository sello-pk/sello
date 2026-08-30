import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Select, { components } from "react-select";
import { useCarCategories } from "../../hooks/useCarCategories";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import toast from "react-hot-toast";
import { capitalize } from "../../utils/formatters";
import { buildListingsSearchUrl } from "../../utils/urlBuilders";
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
        boxShadow: state.isFocused
          ? "0 0 0 2px rgba(255, 166, 2, 0.35)"
          : "none",
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

    const payload = Object.fromEntries(
      Object.entries({
        vehicleType,
        make: filters.make,
        model: filters.model,
        city: filters.city,
      }).filter(([_, v]) => v),
    );

    setQueryParams(payload);
  };

  useEffect(() => {
    if (filteredCars && queryParams) {
      navigate(buildListingsSearchUrl(queryParams));
    }
  }, [filteredCars, queryParams, navigate]);

  useEffect(() => {
    if (searchError) {
      toast.error(searchError?.data?.message || "Search failed");
    }
  }, [searchError]);

  return (
    <div className="mx-auto w-full max-w-6xl px-3 py-3 sm:px-4 sm:py-4">
      <div className="rounded-xl border border-white/20 bg-white/10 p-4 shadow-sm backdrop-blur-md sm:p-5 md:p-6">
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:gap-5">
          <h2 className="text-center text-base font-medium leading-snug text-white sm:text-left sm:text-lg">
            Find the Best Cars for Sale in Pakistan with Verified Listings &amp;
            Great Deals
          </h2>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Select
              inputId="make-select"
              name="make-select"
              aria-label="Vehicle make"
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

            <Select
              inputId="model-select"
              name="model-select"
              aria-label="Vehicle model"
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

            <Select
              inputId="city-select"
              name="city-select"
              aria-label="City"
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

            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-500 font-semibold text-white hover:bg-opacity-90 focus-visible:outline focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              <FiSearch aria-hidden />
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/listings")}
              type="button"
              className="h-12 rounded-lg border border-primary-500 px-4 font-medium text-primary-500 hover:bg-primary-500 hover:text-white"
            >
              Browse Listings
            </button>
            <button
              onClick={() => navigate("/create-post")}
              type="button"
              className="h-12 rounded-lg border border-primary-500 px-4 font-medium text-primary-500 hover:bg-primary-500 hover:text-white"
            >
              Sell Your Car
            </button>
            <button
              onClick={() => navigate("/auctions/live")}
              type="button"
              className="h-12 rounded-lg border border-primary-500 px-4 font-medium text-primary-500 hover:bg-primary-500 hover:text-white"
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
