import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../../redux/services/api";
import { IoIosArrowRoundUp } from "react-icons/io";
import { FiStar } from "react-icons/fi";
import CarCard from "../../common/CarCard";

const FeaturedCarsCarousel = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  // Fetch featured cars (paginated grid)
  const { data: carsData, isLoading } = useGetFilteredCarsQuery({
    page,
    limit: 36,
    featured: "true",
  });

  // Filter featured cars
  const featuredCars = React.useMemo(() => {
    const cars = carsData?.cars || carsData?.data?.cars || [];
    if (!Array.isArray(cars)) {
      return [];
    }
    return cars.filter(
      (car) =>
        car.featured === true &&
        car.isApproved !== false &&
        car.status !== "sold" &&
        !car.isSold,
    );
  }, [carsData]);

  const totalPages = carsData?.pages || 1;

  if (isLoading) {
    return (
      <section
        className="relative min-h-[420px] overflow-hidden bg-gray-100 py-12 md:py-14"
        aria-busy="true"
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-lg bg-gray-200 animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-48 sm:w-64 rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
            <div className="hidden md:block h-10 w-28 rounded-lg bg-gray-200 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, key) => (
              <div
                key={key}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="h-44 md:h-52 bg-gray-200 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-[85%] max-w-[220px] rounded bg-gray-200 animate-pulse" />
                  <div className="h-3 w-[60%] max-w-[160px] rounded bg-gray-200 animate-pulse" />
                  <div className="h-5 w-24 rounded bg-gray-200 animate-pulse mt-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredCars.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-gray-100 py-12 md:py-14">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm">
              <FiStar className="text-primary-500 text-2xl md:text-3xl" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Featured Cars
              </h2>
              <p className="text-gray-600 text-sm mt-0.5">
                Hand-picked premium vehicles
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/listings")}
            className="hidden md:flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-500 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            View All
            <IoIosArrowRoundUp className="text-lg rotate-[40deg]" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
          {featuredCars.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center gap-5 border-t border-[#e5e7eb] pt-8">
            <span className="text-sm font-medium text-gray-600">
              Page {page} of {totalPages}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              {page > 2 && (
                <button
                  onClick={() => setPage(1)}
                  className="min-w-10 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  1
                </button>
              )}
              {page > 3 && <span className="px-1 text-gray-400">...</span>}
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="min-w-10 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  {page - 1}
                </button>
              )}
              <span className="min-w-10 rounded-xl bg-primary-500 px-3 py-2.5 text-center text-sm font-semibold text-white">
                {page}
              </span>
              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="min-w-10 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  {page + 1}
                </button>
              )}
              {page < totalPages - 2 && (
                <span className="px-1 text-gray-400">...</span>
              )}
              {page < totalPages - 1 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className="min-w-10 rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium hover:bg-gray-50"
                >
                  {totalPages}
                </button>
              )}
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCarsCarousel;
