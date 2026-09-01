import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import FilterResultsSection from "../../components/sections/filter/FilterResultsSection";
import SortAndViewOptions from "../../components/listings/SortAndViewOptions";
import CarInspectionContent from "../../components/features/CarInspection/CarInspectionContent";
import { FiX, FiFilter } from "react-icons/fi";
import Breadcrumb from "../../components/common/Breadcrumb";
import StructuredData from "../../components/common/StructuredData";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { trackSearch } from "../../utils/metaPixel.js";
import {
  unslugify,
  buildListingsSearchUrl,
  getListingsPageCopy,
} from "../../utils/urlBuilders";

const FilteredResults = () => {
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const [searchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const searchTrackedKey = useRef("");

  const cityFromPath = citySlug ? unslugify(citySlug) : "";
  const searchTerm = searchParams.get("search") || "";
  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const city = cityFromPath || searchParams.get("city") || "";

  const pageCopy = getListingsPageCopy({
    city,
    make,
    model,
    searchTerm,
  });

  // Build query parameters based on URL params only
  const queryParams = useMemo(() => {
    const urlFilters = {};
    searchParams.forEach((value, key) => {
      if (value && value.trim() !== "") {
        urlFilters[key] = value;
      }
    });
    if (cityFromPath) {
      urlFilters.city = cityFromPath;
    }

    if (Object.keys(urlFilters).length > 0) {
      return { ...urlFilters, limit: 50, page: 1 };
    }

    return null;
  }, [searchParams, cityFromPath]);

  // Fetch data using the correct query parameters
  const { data: apiResults, isLoading: apiLoading, isFetching, error: apiError } = useGetFilteredCarsQuery(
    queryParams,
    { skip: !queryParams },
  );

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q || apiLoading || apiError || !apiResults) return;
    const key = `${q}|${searchParams.toString()}`;
    if (searchTrackedKey.current === key) return;
    searchTrackedKey.current = key;
    trackSearch(q);
  }, [searchTerm, apiLoading, apiError, apiResults, searchParams]);

  const carsData = apiResults;
  const carsLoading = apiLoading || (isFetching && !apiResults);

  // Sort cars based on selected option
  const sortedCars = useMemo(() => {
    if (!carsData?.cars || !Array.isArray(carsData.cars)) return [];

    const cars = [...carsData.cars];

    switch (sortBy) {
      case "price-low":
        return cars.sort((a, b) => (a.price || 0) - (b.price || 0));
      case "price-high":
        return cars.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "year-new":
        return cars.sort((a, b) => (b.year || 0) - (a.year || 0));
      case "year-old":
        return cars.sort((a, b) => (a.year || 0) - (b.year || 0));
      case "mileage-low":
        return cars.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
      case "mileage-high":
        return cars.sort((a, b) => (b.mileage || 0) - (a.mileage || 0));
      case "oldest":
        return cars.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
        );
      case "newest":
      default:
        return cars.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
    }
  }, [carsData?.cars, sortBy]);

  const activeFilters = useMemo(() => {
    const filters = [];
    searchParams.forEach((value, key) => {
      if (value && value !== "" && key !== "city") {
        filters.push([key, value]);
      }
    });
    if (city) {
      filters.unshift(["city", city]);
    }
    return filters;
  }, [searchParams, city]);

  const totalResults = carsData?.total || 0;
  const shownCount = sortedCars.length;
  const rangeLabel =
    totalResults > 0
      ? `1 - ${shownCount} of ${totalResults} Results`
      : "0 Results";

  const breadcrumbItems = city
    ? [
        { label: "Home", path: "/" },
        { label: "Used Cars", path: "/listings" },
        { label: pageCopy.title, path: citySlug ? `/used-cars/${citySlug}` : "/search-results" },
      ]
    : [
        { label: "Home", path: "/" },
        { label: "Used Cars", path: "/listings" },
        { label: pageCopy.title, path: "/search-results" },
      ];

  const navigateWithFilters = (nextFilters) => {
    navigate(buildListingsSearchUrl(nextFilters));
  };

  const removeFilter = (keyToRemove) => {
    const next = {};
    searchParams.forEach((value, key) => {
      if (value && key !== keyToRemove && key !== "city") {
        next[key] = value;
      }
    });
    if (city && keyToRemove !== "city") {
      next.city = city;
    }
    navigateWithFilters(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 min-w-0 overflow-x-hidden">
      <StructuredData.CollectionPageSchema
        name={pageCopy.title}
        description={pageCopy.description}
      />
      <StructuredData.ItemListSchema cars={carsData?.cars} />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0 pt-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
          {pageCopy.title}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <Breadcrumb items={breadcrumbItems} hideHome />
          <p className="text-sm text-gray-500 shrink-0 pb-3 sm:pb-0">
            {rangeLabel}
          </p>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        {carsLoading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading search results...</p>
          </div>
        ) : apiError ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Results
            </h3>
            <p className="text-gray-600 mb-4">
              {apiError.message || "Failed to load search results. Please try again."}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiFilter size={16} />
                Active Filters
              </h3>
              <button
                onClick={() => navigate("/listings")}
                className="text-sm text-primary-500 hover:text-primary-500 font-medium"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map(([key, value]) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-2 bg-primary-50 text-primary-500 px-3 py-1 rounded-full text-sm font-medium"
                >
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}: {value}
                  </span>
                  <button
                    onClick={() => removeFilter(key)}
                    className="hover:text-primary-500"
                  >
                    <FiX size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sort and View Options */}
        {totalResults > 0 && (
          <SortAndViewOptions
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewChange={setViewMode}
            totalResults={totalResults}
            resultLabel="cars"
          />
        )}

        {/* Results */}
        {totalResults > 0 ? (
          <FilterResultsSection
            filteredCars={{ ...carsData, cars: sortedCars }}
            isLoading={carsLoading}
            viewMode={viewMode}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeFilters.length > 0
                ? `No results found for your selected filters`
                : searchTerm
                  ? `No results found for "${searchTerm}"`
                  : "No cars found"}
            </h3>
            <p className="text-gray-600 mb-4">
              {activeFilters.length > 0
                ? "Try clearing some filters or adjusting your search criteria. For example, if you searched for 'Honda City', try just 'Honda' to see all Honda models."
                : searchTerm
                  ? "Try adjusting your search terms or browse all cars"
                  : "Check back later for new listings"}
            </p>
            
            {activeFilters.length > 0 && (
              <div className="flex gap-3 justify-center mb-4">
                <button
                  onClick={() => navigate("/listings")}
                  className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Clear All Filters
                </button>
                {make || model ? (
                  <button
                    onClick={() => removeFilter("model")}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Show All Models
                  </button>
                ) : null}
              </div>
            )}
            
            {searchTerm && (
              <button
                onClick={() => navigate("/")}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Browse All Cars
              </button>
            )}
          </div>
        )}
          </>
        )}
      </div>

      {/* Car Inspection Content */}
      <CarInspectionContent />
    </div>
  );
};

export default FilteredResults;
