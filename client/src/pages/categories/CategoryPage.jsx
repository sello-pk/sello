import React, { useState } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { useVehicleCategories } from "../../hooks/useVehicleCategories";
import CarCard from "../../components/common/CarCard";
import FilterForm from "../../components/sections/filter/FilterForm";
import LatestBlogsSection from "../../components/features/blog/LatestBlogsSection";
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
import { Link } from "react-router-dom";

const categoryIcons = {
  Car: FaCar,
  Bus: FaBus,
  Truck: FaTruck,
  Van: FaShuttleVan,
  Bike: FaMotorcycle,
  "E-bike": FaBolt,
  Farm: FaTractor,
};

const categoryBackgrounds = {
  Car: "/assets/categories/carCat.svg",
  Bus: "/assets/categories/busCat.svg",
  Truck: "/assets/categories/truckCat.svg",
  Van: "/assets/categories/vanCat.svg",
  Bike: "/assets/categories/bikeCat.svg",
  "E-bike": "/assets/categories/ebikeCat.svg",
  Farm: "/assets/categories/farmCat.svg",
};

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getCategoryBySlug } = useVehicleCategories();
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [filters, setFilters] = useState(() => {
    const params = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  });

  // All categories data
  const allCategories = [
    {
      name: "Car",
      slug: "cars",
      description: "Cars, sedans, SUVs, and other passenger vehicles",
    },
    {
      name: "Bus",
      slug: "buses",
      description: "Buses and commercial passenger vehicles",
    },
    {
      name: "Truck",
      slug: "trucks",
      description: "Trucks and heavy-duty vehicles",
    },
    { name: "Van", slug: "vans", description: "Vans and utility vehicles" },
    { name: "Bike", slug: "bikes", description: "Motorcycles and bikes" },
    {
      name: "E-bike",
      slug: "e-bikes",
      description: "Electric bikes and scooters",
    },
    {
      name: "Farm",
      slug: "farm",
      description: "Farm vehicles and agricultural equipment",
    },
  ];

  // Check if showing specific category or all categories
  const isShowingAllCategories = !slug;
  const currentCategory = slug
    ? allCategories.find((cat) => cat.slug === slug)
    : null;

  // Determine query params
  const queryParams = isShowingAllCategories
    ? { page, limit: 12, ...filters }
    : { page, limit: 12, vehicleType: currentCategory?.name, ...filters };

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
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-primary-500 to-primary-600 text-white py-20"
        style={{
          backgroundImage: `url(${isShowingAllCategories ? "/assets/categories/carCat.svg" : categoryBackgrounds[currentCategory?.name] || "/assets/categories/carCat.svg"})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Background Image Overlay */}
        <div className="absolute inset-0 bg-black/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 via-primary-600/70 to-primary-700/50"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <Link
            to="/listings"
            className="inline-flex items-center gap-2 mb-8 text-white/80 hover:text-white transition transform hover:scale-105"
          >
            <HiOutlineArrowLeft /> Back to All Listings
          </Link>
          <div className="text-center max-w-4xl mx-auto">
            {/* Icon */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/20 shadow-2xl">
                {isShowingAllCategories ? (
                  <FaCar className="text-5xl text-white" />
                ) : (
                  React.createElement(
                    categoryIcons[currentCategory?.name] || FaCar,
                    { className: "text-5xl text-white" },
                  )
                )}
              </div>
            </div>

            {/* Title */}
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              {isShowingAllCategories
                ? "All Vehicle Categories"
                : `${currentCategory?.name}s`}
            </h2>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              {isShowingAllCategories
                ? "Browse vehicles by category or view all listings"
                : `Browse all ${currentCategory?.name?.toLowerCase()} listings`}
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

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        {isShowingAllCategories ? (
          // Show all categories grid
          <>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {allCategories.map((category) => {
                const Icon = categoryIcons[category.name];
                const BackgroundImage = categoryBackgrounds[category.name];
                return (
                  <Link
                    key={category.slug}
                    to={`/category/${category.slug}`}
                    className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-white"
                  >
                    {/* Category Background */}
                    <div
                      className="h-48 relative"
                      style={{
                        backgroundImage: `url(${BackgroundImage})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/70 group-hover:from-black/30 group-hover:to-black/50 transition-all duration-300">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                              <Icon className="text-3xl text-primary-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              {category.name}
                            </h3>
                            <p className="text-white/90 text-sm">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {category.description}
                      </p>
                      <Link
                        to={`/category/${category.slug}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                      >
                        Browse {category.name}s
                        <HiOutlineArrowLeft className="rotate-180" />
                      </Link>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* All Listings Preview */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Latest Listings
                </h2>
                <p className="text-gray-600 mb-6">
                  Browse all available vehicles
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  <div className="col-span-full text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading listings...</p>
                  </div>
                ) : error ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-red-600">
                      Error loading listings. Please try again.
                    </p>
                  </div>
                ) : cars.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-md">
                    <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No Listings Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No listings match your filters.
                    </p>
                    <Link
                      to="/create-post"
                      className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:opacity-90 transition"
                    >
                      Post a Listing
                    </Link>
                  </div>
                ) : (
                  cars
                    .slice(0, 8)
                    .map((car) => <CarCard key={car._id} car={car} />)
                )}
              </div>

              {/* View All Button */}
              {cars.length > 0 && (
                <div className="text-center mt-8">
                  <Link
                    to="/listings"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    View All Listings ({total})
                    <HiOutlineArrowLeft className="rotate-180" />
                  </Link>
                </div>
              )}
            </div>

            {/* Detailed Blogs Section */}
            <div className="mt-16 bg-gray-50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Latest{" "}
                  {isShowingAllCategories
                    ? "Automotive"
                    : `${currentCategory?.name}`}{" "}
                  Blogs
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  {isShowingAllCategories
                    ? "Stay updated with the latest automotive news, tips, and insights from our experts"
                    : `Discover the best tips, guides, and news about ${currentCategory?.name?.toLowerCase()}s`}
                </p>
              </div>
              <LatestBlogsSection />
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
          </>
        ) : (
          // Show individual category listings
          <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                  <h2 className="text-xl font-semibold mb-4">Filters</h2>
                  <FilterForm onFilter={handleFilterChange} />
                </div>
              </div>

              {/* Category Listings */}
              <div className="lg:col-span-3">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      Loading {currentCategory?.name?.toLowerCase()} listings...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-red-600">
                      Error loading {currentCategory?.name?.toLowerCase()}{" "}
                      listings. Please try again.
                    </p>
                  </div>
                ) : cars.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    {React.createElement(
                      categoryIcons[currentCategory?.name] || FaCar,
                      { className: "text-6xl text-gray-300 mx-auto mb-4" },
                    )}
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No {currentCategory?.name} Listings Found
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No {currentCategory?.name?.toLowerCase()} listings match
                      your filters.
                    </p>
                    <Link
                      to="/create-post"
                      className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:opacity-90 transition"
                    >
                      Post a {currentCategory?.name} Listing
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {currentCategory?.name} Listings ({total})
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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
                        {Array.from({ length: pages }, (_, i) => i + 1).map(
                          (p) => (
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
                          ),
                        )}
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

            {/* Detailed Blogs Section for Individual Category */}
            <div className="mt-16 bg-gray-50 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Latest {currentCategory?.name} Blogs & Guides
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Discover expert tips, maintenance guides, and latest news
                  about {currentCategory?.name?.toLowerCase()}s
                </p>
              </div>
              <LatestBlogsSection />
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
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
