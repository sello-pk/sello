import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { IoIosArrowRoundUp } from "react-icons/io";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useGetCarsQuery } from "../../../redux/services/api";
import CarCard from "../../common/CarCard";
import SortAndViewOptions from "../../listings/SortAndViewOptions";

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

// Skeleton matching CarCard layout (rounded-xl, 3:2 image, content block)
const CarCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden border border-[#e5e7eb] shadow-md animate-pulse flex flex-col">
    <div className="w-full aspect-[3/2] bg-gray-200" />
    <div className="p-4 flex flex-col flex-1">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2 mt-1.5" />
      <div className="border-t border-gray-100 my-3" />
      <div className="flex justify-between gap-2">
        <div className="h-3 bg-gray-100 rounded w-14" />
        <div className="h-3 bg-gray-100 rounded w-12" />
        <div className="h-3 bg-gray-100 rounded w-14" />
      </div>
      <div className="border-t border-gray-100 mt-3 pt-3 flex justify-end">
        <div className="h-5 bg-gray-200 rounded w-24" />
      </div>
    </div>
  </div>
);

// Safe capitalize function
// const capitalize = (str) => {
//   if (!str || typeof str !== "string") return "";
//   return str.charAt(0).toUpperCase() + str.slice(1);
// };

// capitalize();

const GetAllCarsSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [displayLimit, setDisplayLimit] = useState(12); // For Load More feature
  const [allLoadedCars, setAllLoadedCars] = useState([]); // Accumulate loaded cars
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Check if we're on home page or listing page
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  const limit = isHomePage ? 6 : 12; // Show 6 on home, 12 on listing page
  const LOAD_MORE_THRESHOLD = 100; // Switch to pagination after 100 items

  // Get URL parameters
  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const urlCondition = (searchParams.get("condition") || "").toLowerCase();
  const urlTransmission = searchParams.get("transmission") || "";
  const urlFuelType = searchParams.get("fuelType") || "";
  const urlBodyType = searchParams.get("bodyType") || "";
  const urlVehicleType = searchParams.get("vehicleType") || "";

  // Keep the "New / Used" tab in sync with URL query param.
  // This ensures the "Or Browse By Types" buttons filter correctly on arrival.
  useEffect(() => {
    if (urlCondition === "new" || urlCondition === "used") setActiveTab(urlCondition);
    else setActiveTab("all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCondition]);

  // Memoize query params to prevent unnecessary refetches
  const queryParams = useMemo(
    () => ({
      page,
      limit,
      // Only apply condition filter if not 'all cars'
      ...(activeTab !== "all" && { condition: activeTab }),
      // Apply search term if present in URL
      ...(urlSearch && { search: urlSearch }),
      // Additional "Or Browse By Types" filters (passed from URL)
      ...(urlTransmission && { transmission: urlTransmission }),
      ...(urlFuelType && { fuelType: urlFuelType }),
      ...(urlBodyType && { bodyType: urlBodyType }),
      ...(urlVehicleType && { vehicleType: urlVehicleType }),
    }),
    [
      page,
      activeTab,
      limit,
      urlSearch,
      urlTransmission,
      urlFuelType,
      urlBodyType,
      urlVehicleType,
    ],
  );

  // Call backend with pagination and filtering
  const { data: carsData, isLoading, error } = useGetCarsQuery(queryParams);

  // Reset to first page and clear loaded cars when changing tabs
  useEffect(() => {
    setPage(1);
    setDisplayLimit(12);
    setAllLoadedCars([]);
  }, [
    activeTab,
    urlSearch,
    urlCondition,
    urlTransmission,
    urlFuelType,
    urlBodyType,
    urlVehicleType,
  ]);

  // Accumulate cars when new data arrives (for Load More feature)
  useEffect(() => {
    if (carsData?.cars && Array.isArray(carsData.cars) && !isHomePage) {
      if (page === 1) {
        // First page - replace all
        setAllLoadedCars(carsData.cars);
        setDisplayLimit(12); // Reset display limit
      } else {
        // Subsequent pages - append (for Load More)
        setAllLoadedCars((prev) => {
          const existingIds = new Set(prev.map((c) => c._id));
          const newCars = carsData.cars.filter(
            (c) => c?._id && !existingIds.has(c._id),
          );
          return [...prev, ...newCars];
        });
      }
      setIsLoadingMore(false);
    }
  }, [carsData?.cars, page, isHomePage]);

  // Cars data from API with fallback to empty array
  const cars = useMemo(() => {
    if (isHomePage) {
      // Home page - just show current page data
      return Array.isArray(carsData?.cars) ? carsData.cars : [];
    }

    // Listing page - use accumulated cars if under threshold
    const totalLoaded = allLoadedCars.length;
    if (totalLoaded > 0 && totalLoaded < LOAD_MORE_THRESHOLD) {
      // Load More mode - show up to displayLimit
      return allLoadedCars.slice(0, displayLimit);
    }

    // Pagination mode - use current page data
    return Array.isArray(carsData?.cars) ? carsData.cars : [];
  }, [carsData?.cars, allLoadedCars, displayLimit, isHomePage]);

  const totalPages = carsData?.pages || 1;
  const totalCars = carsData?.total || 0;
  const totalLoaded = allLoadedCars.length;

  // Determine if we should show Load More or Pagination
  const shouldShowLoadMore =
    !isHomePage &&
    totalLoaded > 0 &&
    totalLoaded < LOAD_MORE_THRESHOLD &&
    (displayLimit < totalLoaded ||
      (displayLimit < totalCars && page < totalPages));

  const shouldShowPagination =
    !isHomePage &&
    (totalLoaded >= LOAD_MORE_THRESHOLD || totalCars > LOAD_MORE_THRESHOLD) &&
    totalPages > 1;

  // Handle Load More
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    const nextLimit = displayLimit + 12;

    // If we need more data and haven't reached threshold
    if (
      nextLimit > totalLoaded &&
      page < totalPages &&
      totalLoaded < LOAD_MORE_THRESHOLD
    ) {
      // Fetch next page
      setPage((prev) => prev + 1);
    } else {
      // Just increase display limit
      setDisplayLimit(nextLimit);
      setIsLoadingMore(false);
    }
  }, [displayLimit, totalLoaded, page, totalPages, isLoadingMore]);

  // Handle tab change with useCallback
  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      // Sync condition back to URL so backend filters match.
      const params = new URLSearchParams(searchParams);
      if (tab === "all") params.delete("condition");
      else params.set("condition", tab);

      navigate(`/listings${params.toString() ? `?${params.toString()}` : ""}`);
    },
    [navigate, searchParams],
  );

  // Handle page change with loading state
  // const handlePageChange = (newPage) => {
  //   if (newPage !== page) {
  //     setIsPageChanging(true);
  //     setPage(newPage);
  //     window.scrollTo({ top: 0, behavior: "smooth" });
  //   }
  // };

  // Define the available tabs - memoized
  const tabs = useMemo(
    () => [
      { id: "all", label: "All Vehicles" },
      { id: "new", label: "New Vehicles" },
      { id: "used", label: "Used Vehicles" },
    ],
    [],
  );

  // Filter cars based on active tab (client-side fallback) - memoized
  const filteredCars = useMemo(() => {
    if (activeTab === "all") return cars;
    return cars.filter(
      (car) => car.condition?.toLowerCase() === activeTab.toLowerCase(),
    );
  }, [cars, activeTab]);

  // Sorted cars for listing page (sort only when not home)
  const sortedCars = useMemo(
    () => (isHomePage ? filteredCars : sortCars(filteredCars, sortBy)),
    [filteredCars, sortBy, isHomePage],
  );

  // Prevent rendering on search-results page to avoid conflicts
  if (
    location.pathname === "/search-results" ||
    location.pathname.startsWith("/admin")
  ) {
    return null;
  }

  // Show skeleton loaders while loading
  if (isLoading) {
    return (
      <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-10 md:py-12">
        <div className="max-w-8xl mx-auto w-full">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B0C1E] mb-2">
            Explore All Vehicles
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Browse new and used vehicles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <CarCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && carsData?.cars?.length > 0) {
    // Extract error message from RTK Query error structure
    const errorMessage =
      error?.data?.message ||
      error?.message ||
      error?.error ||
      "Unknown error occurred";

    return (
      <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-10 md:py-12">
        <div className="max-w-8xl mx-auto w-full">
          <div className="rounded-xl border border-[#e5e7eb] bg-white py-12 px-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading vehicles</h2>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate(0)}
              className="px-6 py-2.5 bg-[#ff8a00] text-white rounded-xl font-semibold hover:brightness-110 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-3 max-w-8xl mx-auto sm:px-4 md:px-6 lg:px-8 py-10 md:py-12 min-w-0 overflow-x-hidden">
      <div className="min-w-0">
        <h2 className="text-2xl md:text-3xl font-bold text-[#0B0C1E]">
          Explore All Vehicles
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Browse new and used vehicles
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mt-6 p-1 bg-gray-100 rounded-xl w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-[#0B0C1E] shadow-sm"
                  : "text-gray-600 hover:text-[#0B0C1E] hover:bg-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort and view (listings page only) */}
        {!isHomePage && filteredCars.length > 0 && (
          <div className="mt-5">
            <SortAndViewOptions
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewChange={setViewMode}
              totalResults={sortedCars.length}
              resultLabel="vehicles"
            />
          </div>
        )}

        {/* Cars Grid */}
        <div
          className={`mt-6 min-w-0 ${
            !isHomePage && viewMode === "list"
              ? "grid grid-cols-1 gap-4 sm:gap-6"
              : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          }`}
        >
          {filteredCars.length === 0 ? (
            <div className="col-span-full rounded-xl border border-[#e5e7eb] bg-white py-16 px-6 text-center">
              <p className="text-gray-500 text-lg">
                {activeTab === "all"
                  ? "No vehicles available at the moment."
                  : `No ${activeTab} vehicles found.`}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Try another tab or check back later.
              </p>
            </div>
          ) : (
            (isHomePage ? filteredCars.slice(0, 6) : sortedCars).map(
              (car) => (
                <CarCard
                  key={car._id}
                  car={car}
                  variant={
                    !isHomePage && viewMode === "list" ? "list" : "grid"
                  }
                />
              ),
            )
          )}
        </div>

        {/* View All Link - Show on home page when there are cars */}
        {isHomePage && filteredCars.length > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => {
                const params = new URLSearchParams();
                if (activeTab !== "all") {
                  params.append("condition", activeTab);
                }
                navigate(
                  `/listings${params.toString() ? "?" + params.toString() : ""}`,
                );
              }}
              className="px-6 py-3 bg-[#ff8a00] text-white rounded-xl font-semibold hover:brightness-110 transition-all shadow-md flex items-center gap-2"
            >
              View All Vehicles
              <IoIosArrowRoundUp className="text-xl rotate-[40deg]" />
            </button>
          </div>
        )}

        {/* Load More Button - Show when under 100 items */}
        {shouldShowLoadMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-[#ff8a00] text-white rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoadingMore ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </>
              ) : (
                <>
                  Load More ({Math.min(displayLimit, totalLoaded)} of{" "}
                  {totalLoaded >= LOAD_MORE_THRESHOLD ? totalCars : totalLoaded}
                  )
                  <IoIosArrowRoundUp className="text-xl rotate-[90deg]" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Pagination Controls - Show after 100 items or when total > 100 */}
        {shouldShowPagination && totalPages > 1 && (
          <div className="flex flex-col items-center gap-5 mt-10 pt-8 border-t border-[#e5e7eb]">
            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex flex-wrap justify-center items-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(p - 1, 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 1}
                className="px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              {page > 2 && (
                <button
                  onClick={() => { setPage(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-gray-50 font-medium text-sm"
                >
                  1
                </button>
              )}
              {page > 3 && <span className="px-1 text-gray-400">...</span>}
              {page > 1 && (
                <button
                  onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-gray-50 font-medium text-sm"
                >
                  {page - 1}
                </button>
              )}
              <span className="px-4 py-2.5 rounded-xl bg-[#ff8a00] text-white font-semibold text-sm">
                {page}
              </span>
              {page < totalPages && (
                <button
                  onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-gray-50 font-medium text-sm"
                >
                  {page + 1}
                </button>
              )}
              {page < totalPages - 2 && <span className="px-1 text-gray-400">...</span>}
              {page < totalPages - 1 && (
                <button
                  onClick={() => { setPage(totalPages); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="px-4 py-2.5 rounded-xl border border-[#e5e7eb] bg-white hover:bg-gray-50 font-medium text-sm"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => {
                  setPage((p) => Math.min(p + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === totalPages}
                className="px-4 py-2.5 rounded-xl bg-[#ff8a00] text-white font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Memoize the component to prevent unnecessary rerenders
export default memo(GetAllCarsSection);
