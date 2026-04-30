import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import FilterForm from "../../components/sections/filter/FilterForm";
import GridCars from "../../components/sections/filter/GridCars";
import BannerInFilter from "../../components/sections/filter/BannerInFilter";
import BlogSection from "../../components/sections/home/BlogSection";
import { useGetFilteredCarsQuery } from "../../redux/services/api";

const FilterPage = () => {
  const [searchParams] = useSearchParams();
  const [queryParams, setQueryParams] = useState(null);
  const [currentFilters, setCurrentFilters] = useState(null);
  const hasNavigated = useRef(false);
  const {
    data: filteredCars,
    isLoading,
    isFetching,
  } = useGetFilteredCarsQuery(queryParams, {
    skip: !queryParams,
  });

  // Read URL parameters on mount and convert to filter object - optimized
  useEffect(() => {
    // Build backend filters directly from URL params (more efficient)
    const backendFilters = {};

    // Map URL params to backend filter format in single pass
    const paramMap = {
      city: "city",
      bodyType: "bodyType",
      make: "make",
      model: "model",
      variant: "variant",
      yearMin: "yearMin",
      yearMax: "yearMax",
      priceMin: "priceMin",
      priceMax: "priceMax",
    };

    searchParams.forEach((value, key) => {
      if (value && paramMap[key]) {
        backendFilters[paramMap[key]] = value;
      }
    });

    // Apply filters if any exist
    if (Object.keys(backendFilters).length > 0) {
      setQueryParams(backendFilters);
      setCurrentFilters(backendFilters);
    }
  }, [searchParams]);

  // Navigation to results page is now handled directly by the FilterForm
  // or other components, to prevent redirect loops and state issues.

  const handleFilter = (filters) => {
    // Reset navigation flag when new filters are applied
    hasNavigated.current = false;

    // Only set query params if filters exist
    if (filters && Object.keys(filters).length > 0) {
      setQueryParams(filters);
      setCurrentFilters(filters);
    } else {
      // Clear filters if empty
      setQueryParams(null);
      setCurrentFilters(null);
    }
  };

  return (
    <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-primary-500">
          Find the Right Vehicle
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1.5">
          Use smart filters to narrow down listings quickly.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-3 sm:px-5 md:px-6 py-5 sm:py-6 my-4">
        <div className="w-full">
          <FilterForm onFilter={handleFilter} />
        </div>
      </div>
      <GridCars />
      <BannerInFilter skipOuterGutter />
      <BlogSection />
    </div>
  );
};

export default FilterPage;
