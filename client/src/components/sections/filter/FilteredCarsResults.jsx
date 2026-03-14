import React from "react";
import CarCard from "../../common/CarCard";

// Skeleton loader (reused from GetAllCarsSection)
const CarCardSkeleton = () => (
  <div className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-lg animate-pulse hover:shadow-md transition-shadow bg-white">
    <div className="md:w-48 h-32 bg-gray-100 rounded-lg"></div>
    <div className="flex-1 flex flex-col justify-between py-2">
      <div>
        <div className="h-5 bg-gray-100 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-24 mb-3"></div>
        <div className="flex gap-6">
          <div className="h-4 bg-gray-100 rounded w-20"></div>
          <div className="h-4 bg-gray-100 rounded w-20"></div>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-gray-100 rounded w-24"></div>
        <div className="h-9 bg-gray-100 rounded-lg w-28"></div>
      </div>
    </div>
  </div>
);

const FilteredCarsResults = ({
  filteredCars,
  isLoading,
  viewMode = "grid",
}) => {
  // Normalize cars data - prioritizing the 'cars' property from the new normalized structure
  const cars = Array.isArray(filteredCars?.cars)
    ? filteredCars.cars
    : Array.isArray(filteredCars?.data)
      ? filteredCars.data
      : Array.isArray(filteredCars)
        ? filteredCars
        : [];

  const isGrid = viewMode === "grid";

  return (
    <section className="py-2 min-w-0 overflow-x-hidden">
      {/* Loading State */}
      {isLoading ? (
        <div
          className={
            isGrid
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "grid grid-cols-1 gap-6"
          }
        >
          {[...Array(6)].map((_, idx) => (
            <CarCardSkeleton key={idx} isGrid={isGrid} />
          ))}
        </div>
      ) : (
        cars.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 px-2">
              {cars.length} {cars.length === 1 ? "Car Found" : "Cars Found"}
            </h2>
            <div
              className={
                isGrid
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "grid grid-cols-1 gap-6"
              }
            >
              {cars.map((car, index) => (
                <CarCard
                  key={car?._id || index}
                  car={car}
                  variant={isGrid ? "grid" : "list"}
                />
              ))}
            </div>
          </>
        )
      )}
    </section>
  );
};

export default FilteredCarsResults;
