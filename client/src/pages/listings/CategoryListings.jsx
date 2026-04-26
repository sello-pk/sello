import React, { useState, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import {
  FaCar,
  FaBus,
  FaTruck,
  FaMotorcycle,
  FaBolt,
  FaTractor,
} from "react-icons/fa6";
import { FaShuttleVan } from "react-icons/fa";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import CarCard from "../../components/common/CarCard";
import CategoryFilterForm from "../../components/sections/filter/CategoryFilterForm";
import SortAndViewOptions from "../../components/listings/SortAndViewOptions";

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

const categoryIcons = {
  cars: FaCar,
  car: FaCar,
  buses: FaBus,
  bus: FaBus,
  trucks: FaTruck,
  truck: FaTruck,
  vans: FaShuttleVan,
  van: FaShuttleVan,
  bikes: FaMotorcycle,
  bike: FaMotorcycle,
  "e-bikes": FaBolt,
  "e-bike": FaBolt,
  farm: FaTractor,
};

const categoryTitles = {
  cars: "Cars",
  car: "Cars",
  buses: "Buses",
  bus: "Buses",
  trucks: "Trucks",
  truck: "Trucks",
  vans: "Vans",
  van: "Vans",
  bikes: "Bikes",
  bike: "Bikes",
  "e-bikes": "E-Bikes",
  "e-bike": "E-Bikes",
  farm: "Farm",
};

const categoryDescriptions = {
  cars: "Cars, sedans, SUVs, and other passenger vehicles",
  car: "Cars, sedans, SUVs, and other passenger vehicles",
  buses: "Buses and commercial passenger vehicles",
  bus: "Buses and commercial passenger vehicles",
  trucks: "Trucks and heavy-duty vehicles",
  truck: "Trucks and heavy-duty vehicles",
  vans: "Vans and utility vehicles",
  van: "Vans and utility vehicles",
  bikes: "Motorcycles and bikes",
  bike: "Motorcycles and bikes",
  "e-bikes": "Electric bikes and scooters",
  "e-bike": "Electric bikes and scooters",
  farm: "Farm vehicles and agricultural equipment",
};

const categoryVehicleTypes = {
  cars: "Car",
  car: "Car",
  buses: "Bus",
  bus: "Bus",
  trucks: "Truck",
  truck: "Truck",
  vans: "Van",
  van: "Van",
  bikes: "Bike",
  bike: "Bike",
  "e-bikes": "E-bike",
  "e-bike": "E-bike",
  farm: "Farm",
};

const categoryBackgrounds = {
  cars: "/assets/categories/carCat.svg",
  car: "/assets/categories/carCat.svg",
  buses: "/assets/categories/busCat.svg",
  bus: "/assets/categories/busCat.svg",
  trucks: "/assets/categories/truckCat.svg",
  truck: "/assets/categories/truckCat.svg",
  vans: "/assets/categories/vanCat.svg",
  van: "/assets/categories/vanCat.svg",
  bikes: "/assets/categories/bikeCat.svg",
  bike: "/assets/categories/bikeCat.svg",
  "e-bikes": "/assets/categories/ebikeCat.svg",
  "e-bike": "/assets/categories/ebikeCat.svg",
  farm: "/assets/categories/farmCat.svg",
};

const CategoryListings = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();

  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState(() => {
    const params = {};
    searchParams.forEach((value, key) => {
      if (key !== "category") {
        params[key] = value;
      }
    });
    return params;
  });

  // Get vehicle type from category
  const vehicleType = categoryVehicleTypes[category];

  // Build query params - always filter for specific vehicle type
  const queryParams = {
    page,
    limit: 12,
    ...(vehicleType && { vehicleType }),
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
    // Update URL params
    const newParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    window.history.pushState(
      {},
      {},
      `/listings/${category}${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    // Update URL params with page and filters
    const newParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      }
    });
    if (newPage > 1) {
      newParams.set("page", newPage.toString());
    }
    window.history.pushState(
      {},
      {},
      `/listings/${category}${newParams.toString() ? "?" + newParams.toString() : ""}`,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If no category specified, redirect to main listings
  if (!category || !categoryVehicleTypes[category]) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Category Not Found
          </h2>
          <Link
            to="/listings"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
          >
            Browse All Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const Icon = categoryIcons[category];
  const title = categoryTitles[category];
  const description = categoryDescriptions[category];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative min-h-[48vh] md:h-[48vh] bg-gradient-to-br from-primary-500 to-primary-500 text-white overflow-hidden"
        style={{
          backgroundImage: `url(${categoryBackgrounds[category] || "/assets/categories/carCat.svg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Content */}
        <div className="relative z-10 flex min-h-[48vh] md:h-[48vh] w-full flex-col justify-center items-center px-4 sm:px-6 py-6 sm:py-8 md:py-10 bg-black/50 backdrop-blur-[2px]">
          <Link
            to="/listings"
            className="absolute left-4 sm:left-6 top-6 sm:top-8 z-20 inline-flex flex-wrap items-center gap-2 text-white/80 hover:text-white transition max-w-full"
          >
            <HiOutlineArrowLeft className="flex-shrink-0" />
            <span className="break-words">Back to All Vehicles</span>
          </Link>

          {/* Main Content - glassmorphism card centered */}
          <div className="flex justify-center items-center w-full max-w-full">
            <div className="text-center w-full max-w-2xl mx-auto px-6 sm:px-8 py-5 sm:py-6 shrink-0">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl">
                  <Icon className="text-4xl text-white drop-shadow-md" />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white drop-shadow-lg">
                {title}
              </h2>

              <p className="text-base md:text-lg text-white/90 mb-5 max-w-xl mx-auto leading-relaxed drop-shadow-lg">
                {description}
              </p>

              {total > 0 && (
                <div className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full">
                  <span className="text-white font-semibold text-sm md:text-base">
                    {total} {total === 1 ? "Listing" : "Listings"} Available
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Advanced Filters</h2>
              <CategoryFilterForm
                vehicleType={vehicleType}
                onFilter={handleFilterChange}
              />
            </div>
          </div>

          {/* Listings */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                  Loading {title.toLowerCase()} listings...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">
                  Error loading listings. Please try again.
                </p>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Icon className="text-6xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No {title} Listings Found
                </h3>
                <p className="text-gray-600 mb-6">
                  No {title.toLowerCase()} listings match your filters.
                </p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  Post a {title} Listing
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    {title} Listings ({total})
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
                  className={`mb-8 ${
                    viewMode === "list"
                      ? "grid grid-cols-1 gap-4"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-primary-500 text-white border border-primary-500 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500 disabled:hover:shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          page === p
                            ? "bg-primary-500 text-white border-2 border-primary-500 shadow-lg transform scale-105"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-105"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pages}
                      className="px-4 py-2 bg-primary-500 text-white border border-primary-500 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-primary-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-500 disabled:hover:shadow-md flex items-center gap-2"
                    >
                      Next
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryListings;
