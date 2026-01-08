import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useRecentlyViewedCars } from "../../../hooks/useRecentlyViewedCars";
import LazyImage from "../../common/LazyImage";
import { images } from "../../../assets/assets";
import { FaCar } from "react-icons/fa6";
import { formatPrice } from "../../../utils/format";

const RecentlyViewedCars = () => {
  const navigate = useNavigate();
  const { recentCars } = useRecentlyViewedCars();

  const VISIBLE_COUNT = 4; // show 4 cards at a time for better layout
  const [startIndex, setStartIndex] = useState(0);

  const total = recentCars.length;

  // Auto-slider: advance every 4 seconds if more than VISIBLE_COUNT
  useEffect(() => {
    if (total <= VISIBLE_COUNT) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % total);
    }, 4000);

    return () => clearInterval(interval);
  }, [total]);

  // Compute currently visible cars (wrap around the list)
  let visibleCars = recentCars;
  if (total > VISIBLE_COUNT) {
    visibleCars = [];
    for (let i = 0; i < VISIBLE_COUNT; i += 1) {
      const idx = (startIndex + i) % total;
      visibleCars.push(recentCars[idx]);
    }
  }

  if (recentCars.length === 0) {
    return null; // Don't show section if no recently viewed cars
  }

  return (
    <section className="py-16 bg-gray-50 w-full">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Recently Looked Cars
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pick up where you left off with cars you've recently viewed
          </p>
        </div>

        {/* Navigation Controls */}
        {total > VISIBLE_COUNT && (
          <div className="flex justify-center items-center gap-4 mb-8">
            <button
              onClick={() =>
                setStartIndex((prev) => (prev - 1 + total) % total)
              }
              className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-200"
              aria-label="Previous cars"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(total, 5) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setStartIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === startIndex % total
                      ? "bg-primary-500 w-8"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to car set ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setStartIndex((prev) => (prev + 1) % total)}
              className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:shadow-lg transition-shadow border border-gray-200"
              aria-label="Next cars"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Cars Grid */}
        {visibleCars.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCar className="text-3xl text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg">No recently viewed cars</p>
            <p className="text-gray-400 text-sm mt-2">
              Start browsing to see your recently viewed cars here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleCars.map((car) => {
              const carId = car._id;
              const carImage =
                (Array.isArray(car.images) && car.images[0]) ||
                (typeof car.images === "string" ? car.images : null) ||
                images.carPlaceholder;
              const carTitle =
                car.title ||
                `${car.make || ""} ${car.model || ""}`.trim() ||
                "Car";
              const carPrice = car.price
                ? formatPrice(car.price)
                : "Price on request";

              return (
                <div
                  key={carId}
                  onClick={() => navigate(`/cars/${carId}`)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary-300 hover:-translate-y-1"
                >
                  {/* Car Image */}
                  <div className="relative h-48 overflow-hidden">
                    {carImage && carImage !== images.carPlaceholder ? (
                      <LazyImage
                        src={carImage}
                        alt={carTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <FaCar className="text-4xl text-gray-400" />
                      </div>
                    )}

                    {/* Vehicle Type Badge */}
                    {car.vehicleType && (
                      <div className="absolute top-3 left-3 bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {car.vehicleType}
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex gap-2">
                        <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        </button>
                        <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632 3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Car Details */}
                  <div className="p-5">
                    <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1 text-lg group-hover:text-primary-600 transition-colors">
                      {carTitle}
                    </h4>

                    <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                      {car.year && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {car.year}
                        </span>
                      )}
                      {car.mileage && (
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                            />
                          </svg>
                          {car.mileage.toLocaleString()} km
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-primary-600">
                        {carPrice}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>{car.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/cars")}
            className=" text-primary-500 px-8 py-3 rounded font-semibold transition-all duration-200 hover:opacity-80"
          >
            View All Cars
          </button>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewedCars;
