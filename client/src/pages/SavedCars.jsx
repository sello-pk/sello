import React from "react";
import {
  useGetSavedCarsQuery,
  useUnsaveCarMutation,
} from "../redux/services/api";
import { useNavigate } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import { IoIosArrowRoundUp } from "react-icons/io";
import { Image as LazyImage } from "../components/ui/Image";
import { images } from "../assets/assets";
import toast from "react-hot-toast";
import { buildCarUrl } from "../utils/urlBuilders";
import { getErrorMessage } from "../utils/errorHandler";
import SEO from "../components/common/SEO";

const SavedCars = () => {
  const navigate = useNavigate();
  const { data: savedCars, isLoading, refetch } = useGetSavedCarsQuery();
  const [unsaveCar] = useUnsaveCarMutation();

  const handleUnsave = async (carId, e) => {
    e?.stopPropagation();
    try {
      await unsaveCar(carId).unwrap();
      toast.success("Car removed from saved list");
      refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const cars = savedCars || [];

  return (
    <>
      <SEO
        title="My Saved Cars - Track Your Favorite Listings | Sello.pk"
        description="View and manage all your saved cars. Compare prices, track favorites, and never miss a deal on Sello.pk."
        keywords="saved cars, favorite cars, car watchlist, compare cars, used cars Pakistan"
        canonical="https://sello.pk/saved-cars"
      />
      <div className="min-h-screen bg-[#F5F5F5] px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-8xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-8">Saved Cars</h1>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden animate-pulse"
              >
                <div className="h-44 md:h-52 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-10 bg-gray-100 rounded mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : cars.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center max-w-lg mx-auto">
            <AiFillHeart className="text-5xl text-primary-500/40 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              No Saved Cars
            </h2>
            <p className="text-gray-500 mb-6">
              You haven&apos;t saved any cars yet. Start exploring and save
              your favorites!
            </p>
            <button
              type="button"
              onClick={() => navigate("/cars")}
              className="bg-primary-500 hover:opacity-90 text-white px-6 py-3 rounded-lg font-medium transition-opacity"
            >
              Browse Cars
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {cars.map((car) => {
              const carId = car._id || car.id;
              const carImage =
                car?.images?.[0] ||
                images?.carPlaceholder ||
                "https://via.placeholder.com/400x300?text=No+Image";
              const carMake = car?.make || "Unknown";
              const carModel = car?.model || "Unknown";
              const carYear = car?.year || "N/A";
              const carPrice =
                car?.price != null
                  ? Number(car.price).toLocaleString()
                  : "N/A";
              const carMileage =
                car?.mileage != null
                  ? `${Number(car.mileage).toLocaleString()} km`
                  : "—";
              const carFuelType = car?.fuelType || "—";
              const carTransmission = car?.transmission || "—";
              const engineLabel = car?.engineCapacity
                ? `${car.engineCapacity} CC`
                : "CC N/A";

              return (
                <div
                  key={carId}
                  role="button"
                  tabIndex={0}
                  onClick={() => car && navigate(buildCarUrl(car))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      car && navigate(buildCarUrl(car));
                    }
                  }}
                  className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                >
                  <div className="relative h-44 md:h-52 overflow-hidden bg-gray-100">
                    <LazyImage
                      src={carImage}
                      alt={`${carMake} ${carModel}`}
                      className="w-full h-full object-cover"
                      width="100%"
                      height="100%"
                      onError={(e) => {
                        e.target.src =
                          images?.carPlaceholder ||
                          "https://via.placeholder.com/400x300?text=No+Image";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                    {car?.isSold && (
                      <div className="absolute top-2 left-2 z-20 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold uppercase shadow-sm">
                        SOLD
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleUnsave(carId, e)}
                      className="absolute top-2 right-2 z-20 bg-white/95 hover:bg-white p-1.5 rounded-full shadow border border-gray-100 transition-colors"
                      title="Remove from saved"
                      aria-label="Remove from saved"
                    >
                      <AiFillHeart className="text-primary-500 text-lg" />
                    </button>
                  </div>

                  <div className="p-4 bg-white flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 leading-snug">
                      {carMake} {carModel} - {carYear}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-xs text-gray-600 border-b border-gray-100">
                      {images?.milesIcon && (
                        <span className="flex items-center gap-1.5">
                          <img
                            src={images.milesIcon}
                            alt=""
                            className="w-3.5 h-3.5 opacity-70 object-contain"
                          />
                          {carMileage}
                        </span>
                      )}
                      {images?.fuelTypeIcon && (
                        <span className="flex items-center gap-1.5">
                          <img
                            src={images.fuelTypeIcon}
                            alt=""
                            className="w-3.5 h-3.5 opacity-70 object-contain"
                          />
                          {carFuelType}
                        </span>
                      )}
                      {images?.transmissionIcon && (
                        <span className="flex items-center gap-1.5">
                          <img
                            src={images.transmissionIcon}
                            alt=""
                            className="w-3.5 h-3.5 opacity-70 object-contain"
                          />
                          {carTransmission}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 py-3 text-xs text-gray-600 border-b border-gray-100">
                      <span className="flex items-center gap-1.5">
                        {images?.cc && (
                          <img
                            src={images.cc}
                            alt=""
                            className="w-3.5 h-3.5 opacity-70 object-contain"
                          />
                        )}
                        {engineLabel}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <p className="text-lg font-bold text-gray-900 truncate">
                        PKR {carPrice}
                      </p>
                      <span className="text-primary-500 font-semibold text-sm flex items-center gap-0.5 shrink-0">
                        View Details
                        <IoIosArrowRoundUp className="text-base rotate-[43deg]" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default SavedCars;
