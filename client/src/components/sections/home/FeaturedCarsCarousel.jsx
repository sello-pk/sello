import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../../redux/services/api";
import { images } from "../../../assets/assets";
import { IoIosArrowRoundUp } from "react-icons/io";
import { FiStar, FiZap } from "react-icons/fi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Image as LazyImage } from "../../ui/Image";
import {
  useSaveCarMutation,
  useUnsaveCarMutation,
  useGetSavedCarsQuery,
} from "../../../redux/services/api";
import toast from "react-hot-toast";
import { buildCarUrl } from "../../../utils/urlBuilders";

const FeaturedCarsCarousel = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const token = localStorage.getItem("token");

  // Fetch featured cars (paginated grid)
  const { data: carsData, isLoading } = useGetFilteredCarsQuery({
    page,
    limit: 36,
    featured: "true",
  });

  // Get saved cars if user is logged in
  const { data: savedCarsData } = useGetSavedCarsQuery(undefined, {
    skip: !token,
  });
  const [saveCar, { isLoading: isSaving }] = useSaveCarMutation();
  const [unsaveCar, { isLoading: isUnsaving }] = useUnsaveCarMutation();

  // Extract saved car IDs
  const savedCars = React.useMemo(() => {
    if (!savedCarsData || !Array.isArray(savedCarsData)) return [];
    return savedCarsData.map((car) => car._id || car.id).filter(Boolean);
  }, [savedCarsData]);

  // Filter featured cars
  const featuredCars = React.useMemo(() => {
    const cars = carsData?.cars || carsData?.data?.cars || [];
    if (!Array.isArray(cars)) {
      return [];
    }
    return cars
      .filter(
        (car) =>
          car.featured === true &&
          car.isApproved !== false &&
          car.status !== "sold" &&
          !car.isSold,
      );
  }, [carsData]);

  const totalPages = carsData?.pages || 1;

  const toggleSave = async (carId, e) => {
    e.stopPropagation();
    if (!token) {
      toast.error("Please login to save cars");
      navigate("/login");
      return;
    }

    try {
      if (savedCars.includes(carId)) {
        await unsaveCar(carId).unwrap();
        toast.success("Car removed from saved");
      } else {
        await saveCar(carId).unwrap();
        toast.success("Car saved successfully");
      }
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update saved cars");
    }
  };

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

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {featuredCars.map((car) => {
            const carId = car._id;
            const carImage = car?.images?.[0] || images.carPlaceholder;
            const carMake = car?.make || "Unknown";
            const carModel = car?.model || "Unknown";
            const carYear = car?.year || "N/A";
            const carPrice = car?.price?.toLocaleString() || "N/A";
            const carMileage = car?.mileage != null ? `${Number(car.mileage).toLocaleString()} km` : "—";
            const carFuelType = car?.fuelType || "—";
            const carTransmission = car?.transmission || "—";
            const carVehicleType = car?.vehicleType || "Car";
            const isSaved = savedCars.includes(carId);

            return (
              <div
                key={carId}
                onClick={() => navigate(buildCarUrl(car))}
                className="cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="relative">
                  <div className="relative h-44 overflow-hidden bg-gray-100 md:h-52">
                    <LazyImage
                      src={carImage}
                      alt={`${carMake} ${carModel}`}
                      className="h-full w-full object-cover"
                      width={400}
                      height={208}
                      cloudinaryOptions={{
                        width: 400,
                        height: 208,
                        crop: "fill",
                        quality: 85,
                        format: "auto",
                      }}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    <div className="absolute left-2 top-2 z-20 flex items-center gap-1.5 rounded-md bg-primary-500 px-2.5 py-1 text-white shadow-sm">
                      <FiStar size={12} />
                      <span className="text-xs font-semibold">FEATURED</span>
                    </div>

                    <div className="absolute bottom-2 left-2 z-20 rounded-md bg-gray-900/80 px-2 py-1 text-xs font-medium text-white">
                      {carVehicleType}
                    </div>

                    {car?.isBoosted && new Date(car?.boostExpiry) > new Date() && (
                      <div className="absolute bottom-2 left-16 flex items-center gap-1 rounded bg-primary-500 px-2 py-1 text-xs font-semibold text-white">
                        <FiZap size={10} />
                        BOOSTED
                      </div>
                    )}

                    <button
                      onClick={(e) => toggleSave(carId, e)}
                      disabled={isSaving || isUnsaving}
                      className="absolute right-2 top-2 z-20 rounded-full border border-gray-100 bg-white/95 p-1.5 shadow disabled:opacity-50 hover:bg-white"
                      title={isSaved ? "Remove from saved" : "Save car"}
                    >
                      {isSaved ? (
                        <AiFillHeart className="text-lg text-primary-500" />
                      ) : (
                        <AiOutlineHeart className="text-lg text-gray-500 transition-colors hover:text-primary-500" />
                      )}
                    </button>
                  </div>

                  <div className="bg-white p-4">
                    <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug text-gray-900">
                      {carMake} {carModel} {carYear}
                    </h3>

                    <div className="mb-3 flex items-center gap-3 text-xs text-gray-600">
                      {images?.milesIcon && (
                        <span className="flex items-center gap-1">
                          <img src={images.milesIcon} alt="" width={14} height={14} className="h-3.5 w-3.5 opacity-70" />
                          {carMileage}
                        </span>
                      )}
                      {images?.fuelTypeIcon && (
                        <span className="flex items-center gap-1">
                          <img src={images.fuelTypeIcon} alt="" width={14} height={14} className="h-3.5 w-3.5 opacity-70" />
                          {carFuelType}
                        </span>
                      )}
                      {images?.transmissionIcon && (
                        <span className="flex items-center gap-1">
                          <img src={images.transmissionIcon} alt="" width={14} height={14} className="h-3.5 w-3.5 opacity-70" />
                          {carTransmission}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <p className="text-lg font-bold text-primary-500">
                        PKR {carPrice}
                      </p>
                      <span className="flex items-center gap-0.5 text-sm font-semibold text-primary-500 hover:underline">
                        View
                        <IoIosArrowRoundUp className="rotate-[43deg] text-base" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
              {page < totalPages - 2 && <span className="px-1 text-gray-400">...</span>}
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
                className="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
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
