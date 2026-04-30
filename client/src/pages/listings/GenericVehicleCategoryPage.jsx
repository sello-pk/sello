import React, { useState, useEffect, useMemo } from "react";
import {
  useSearchParams,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import CarCard from "../../components/common/CarCard";
import CategoryFilterForm from "../../components/sections/filter/CategoryFilterForm";
import ListingsCategoryBlogsSection from "../../components/sections/listings/ListingsCategoryBlogsSection";
import SortAndViewOptions from "../../components/listings/SortAndViewOptions";
import { vehicleCategoryConfig } from "../../config/vehicleCategoryConfig";

const sortCars = (cars, sortBy) => {
  if (!cars?.length) return cars;
  const list = [...cars];
  switch (sortBy) {
    case "price-low": return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    case "price-high": return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    case "year-new": return list.sort((a, b) => (b.year || 0) - (a.year || 0));
    case "year-old": return list.sort((a, b) => (a.year || 0) - (b.year || 0));
    case "mileage-low": return list.sort((a, b) => (a.mileage || 0) - (b.mileage || 0));
    case "mileage-high": return list.sort((a, b) => (b.mileage || 0) - (a.mileage || 0));
    case "oldest": return list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    case "newest":
    default: return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }
};

const GenericVehicleCategoryPage = () => {
  const { categoryType } = useParams();
  const navigate = useNavigate();
  const config = vehicleCategoryConfig[categoryType?.toLowerCase()];

  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [filters, setFilters] = useState(() => {
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  });

  // Redirect if invalid category
  useEffect(() => {
    if (!config) {
      navigate("/listings", { replace: true });
    }
  }, [config, navigate]);

  if (!config) return null;

  const vehicleType = config.label;

  const queryParams = {
    page,
    limit: 12,
    vehicleType,
    ...filters,
  };

  const { data, isLoading, error } = useGetFilteredCarsQuery(queryParams);

  const cars = data?.cars || [];
  const sortedCars = useMemo(() => sortCars(cars, sortBy), [cars, sortBy]);
  const total = data?.total || 0;
  const pages = data?.pages || 0;

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    navigate(
      `/listings/${categoryType?.toLowerCase()}?${newParams.toString()}`,
      { replace: true },
    );
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    if (newPage > 1) {
      newParams.set("page", newPage.toString());
    }
    navigate(
      `/listings/${categoryType?.toLowerCase()}?${newParams.toString()}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative w-full min-h-[30vh] sm:min-h-[26vh] md:min-h-[24vh] text-white bg-primary-500 overflow-hidden">
        <div className="relative z-10 flex min-h-[30vh] sm:min-h-[26vh] md:min-h-[24vh] w-full flex-col justify-center items-center px-2 sm:px-4 lg:px-6 py-3 sm:py-5 md:py-6">
          <Link
            to="/listings"
            className="absolute left-2 sm:left-4 lg:left-6 top-3 sm:top-6 lg:top-8 z-20 inline-flex items-center gap-1.5 sm:gap-2 text-white/90 hover:text-white transition"
          >
            <HiOutlineArrowLeft className="flex-shrink-0 w-3.5 h-3.5 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">Back to Vehicles</span>
            <span className="text-xs sm:text-sm font-medium sm:hidden">Back</span>
          </Link>

          <div className="flex justify-center items-center w-full px-1 sm:px-0">
            <div className="text-center w-full max-w-5xl mx-auto px-1 sm:px-4 lg:px-8 py-2 sm:py-4 lg:py-6">
              <div className="mb-2 sm:mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl sm:rounded-2xl bg-white/15">
                  <Icon className="text-2xl sm:text-3xl lg:text-4xl text-white drop-shadow-md" />
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1.5 sm:mb-2 lg:mb-3 text-white drop-shadow-lg leading-tight px-2 sm:px-0">
                {config.title}
              </h1>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 mb-3 sm:mb-4 lg:mb-5 max-w-lg sm:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-3 sm:px-0">
                {config.description}
              </p>

              {total > 0 && (
                <div className="inline-flex items-center gap-1.5 sm:gap-2 lg:gap-4 px-2 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full bg-white/15">
                  <span className="text-white font-semibold text-xs sm:text-sm md:text-base">
                    {total} {total === 1 ? "Listing" : "Listings"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-6 xl:gap-8 min-w-0">
          {/* Filter Sidebar - Mobile Collapsible */}
          <div className={`xl:col-span-1 min-w-0 ${showMobileFilters ? 'block' : 'hidden'} xl:block`}>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 xl:sticky xl:top-4 xl:max-h-[calc(100vh-120px)] xl:overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="xl:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CategoryFilterForm
                vehicleType={vehicleType}
                onFilter={handleFilterChange}
              />
            </div>
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="xl:hidden mb-3 sm:mb-4">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="font-medium">{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {/* Main Content */}
          <div className="xl:col-span-3 min-w-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Loading {categoryType} listings...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">
                  Error loading listings. Please try again.
                </p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Icon className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No Listings Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No {categoryType} listings match your filters.
                </p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post a Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
                    {config.title} Listings ({total})
                  </h2>
                  <SortAndViewOptions
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewChange={setViewMode}
                    totalResults={sortedCars.length}
                    resultLabel="vehicles"
                  />
                </div>
                <div
                  className={`mb-6 sm:mb-8 ${
                    viewMode === "list"
                      ? "grid grid-cols-1 gap-3 sm:gap-4"
                      : "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2 sm:gap-4"
                  }`}
                >
                  {sortedCars.map((car) => (
                    <CarCard
                      key={car._id}
                      car={car}
                      variant={viewMode === "list" ? "list" : "grid"}
                    />
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 mt-6 sm:mt-8">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white border rounded-lg disabled:opacity-50 text-sm sm:text-base hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-full overflow-x-auto">
                      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
                        let pageNum;
                        if (pages <= 7) {
                          pageNum = i + 1;
                        } else if (page <= 4) {
                          pageNum = i < 5 ? i + 1 : (i === 5 ? '...' : pages);
                        } else if (page >= pages - 3) {
                          pageNum = i < 2 ? (i === 0 ? 1 : '...') : pages - 6 + i;
                        } else {
                          pageNum = i === 0 ? 1 : i === 1 ? '...' : i === 5 ? '...' : i === 6 ? pages : page - 2 + i - 2;
                        }
                        
                        if (pageNum === '...') {
                          return <span key={i} className="px-2 sm:px-3 py-2 text-gray-500">...</span>;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-2 sm:px-3 py-2 rounded-lg text-sm sm:text-base transition-colors ${
                              page === pageNum 
                                ? "bg-primary-500 text-white" 
                                : "bg-white border hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pages}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-white border rounded-lg disabled:opacity-50 text-sm sm:text-base hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <ListingsCategoryBlogsSection categorySlug={categoryType?.toLowerCase()} />
      </div>
    </div>
  );
};

export default GenericVehicleCategoryPage;
