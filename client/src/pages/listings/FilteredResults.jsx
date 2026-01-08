import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import FilterResultsSection from "../../components/sections/filter/FilterResultsSection";
import SortAndViewOptions from "../../components/listings/SortAndViewOptions";
import { FiX, FiFilter } from "react-icons/fi";
import Breadcrumb from "../../components/common/Breadcrumb";
import { useGetCarsQuery } from "../../redux/services/api";

const FilteredResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filteredCars, isLoading, filters } = location.state || {};
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  const searchTerm = searchParams.get("search") || filters?.search || "";

  // Fetch search results from API if no location.state (direct navigation)
  const { data: searchResults, isLoading: isSearchLoading } = useGetCarsQuery(
    {
      search: searchTerm,
      limit: 50,
      page: 1,
    },
    {
      skip: !!location.state, // Skip if we have location.state data
    }
  );

  // Use location.state data if available, otherwise use API results
  const carsData = location.state ? filteredCars : searchResults;
  const carsLoading = location.state ? isLoading : isSearchLoading;

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
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        );
      case "newest":
      default:
        return cars.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
    }
  }, [carsData?.cars, sortBy]);

  const activeFilters = filters
    ? Object.entries(filters).filter(([, value]) => value)
    : [];
  const totalResults = sortedCars.length || carsData?.total || 0;

  // Show loading while search is loading (for direct navigation)
  if (carsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search results...</p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home", path: "/" },
    { label: "Search Results", path: "/search-results" },
  ];

  const removeFilter = (key) => {
    // Navigate to filter page with updated filters
    const newFilters = { ...filters };
    delete newFilters[key];

    // Build URL params from remaining filters
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    navigate(`/filter?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb items={breadcrumbItems} />

      <div className="container mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchTerm
              ? `Search Results for "${searchTerm}"`
              : "Search Results"}
          </h1>
          {searchTerm && (
            <p className="text-gray-600">
              Found {totalResults} {totalResults === 1 ? "car" : "cars"}{" "}
              matching your search
            </p>
          )}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FiFilter size={16} />
                Active Filters
              </h3>
              <button
                onClick={() => navigate("/filter")}
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
          />
        )}

        {/* Results */}
        <FilterResultsSection
          filteredCars={{ ...carsData, cars: sortedCars }}
          isLoading={carsLoading}
          viewMode={viewMode}
        />
      </div>
    </div>
  );
};

export default FilteredResults;
