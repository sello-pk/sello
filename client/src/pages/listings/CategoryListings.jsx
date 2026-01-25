import React, { useState } from "react";
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
        className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white"
        style={{
          backgroundImage: `url(${categoryBackgrounds[category] || "/assets/categories/carCat.svg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 bg-black/30 backdrop-blur-[2px]">
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 mb-8 text-white/80 hover:text-white transition transform hover:scale-105"
          >
            <HiOutlineArrowLeft /> Back to All Vehicles
          </Link>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 shadow-2xl">
                <Icon className="text-5xl text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              {title}
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>

            {/* Stats */}
            {total > 0 && (
              <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-white font-semibold">
                  {total} {total === 1 ? "Listing" : "Listings"} Available
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="container mx-auto px-4 py-8">
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
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {title} Listings ({total})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {cars.map((car) => (
                    <CarCard key={car._id} car={car} />
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`px-4 py-2 rounded-lg transition ${
                          page === p
                            ? "bg-primary-500 text-white"
                            : "bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === pages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Blogs Section */}
      <div className="mt-16 bg-gray-50 rounded-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Latest {title} Blogs & Guides
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover expert tips, maintenance guides, and latest news about {title.toLowerCase()}s
          </p>
        </div>

        {/* Hardcoded Blogs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Blog 1 */}
          <Link
            to="/blog/tips-for-buying-your-first-vehicle"
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Blog Image */}
            <div className="w-full h-48 md:h-56 overflow-hidden bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1549924231-f129b911e442?w=800&h=600&fit=crop"
                alt="Tips for Buying Your First Vehicle"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Blog Content */}
            <div className="p-6 flex-1 flex flex-col">
              {/* Category */}
              <span className="inline-block text-xs font-semibold text-primary-500 mb-3 uppercase tracking-wide">
                Buying Guide
              </span>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors leading-tight">
                Essential Tips for Buying Your First {title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 line-clamp-4 flex-1">
                Discover comprehensive tips and expert advice for purchasing your first {title.toLowerCase()}. This detailed guide covers everything from 
                understanding financing options and loan pre-approval to conducting thorough inspections and negotiating the best price. Learn about 
                essential documentation, insurance requirements, warranty considerations, and maintenance schedules. We also explore common mistakes 
                buyers make and how to avoid them, plus expert recommendations on finding reliable dealers and private sellers.
              </p>

              {/* Author and Date Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">Jan 15, 2024</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">5 min</span>
              </div>
            </div>
          </Link>

          {/* Blog 2 */}
          <Link
            to="/blog/maintenance-guide-for-vehicle-owners"
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Blog Image */}
            <div className="w-full h-48 md:h-56 overflow-hidden bg-gray-200">
              <img
                src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&h=600&fit=crop"
                alt="Maintenance Guide for Vehicle Owners"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Blog Content */}
            <div className="p-6 flex-1 flex flex-col">
              {/* Category */}
              <span className="inline-block text-xs font-semibold text-primary-500 mb-3 uppercase tracking-wide">
                Maintenance
              </span>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors leading-tight">
                Complete {title} Maintenance Guide for 2024
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 line-clamp-4 flex-1">
                Keep your {title.toLowerCase()} running smoothly with our comprehensive maintenance guide for 2024. This in-depth resource covers 
                everything from daily checks and weekly inspections to monthly and annual service schedules. Learn about engine oil changes, 
                tire rotation, brake system maintenance, battery care, and fluid replacements. We provide detailed seasonal maintenance tips 
                for winter preparation and summer care, plus troubleshooting common issues and when to seek professional help.
              </p>

              {/* Author and Date Info */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
                    E
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Expert</p>
                    <p className="text-xs text-gray-500">Jan 10, 2024</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">7 min</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-500 border-2 border-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
          >
            View All Blogs
            <HiOutlineArrowLeft className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CategoryListings;
