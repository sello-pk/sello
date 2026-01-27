import React, { useMemo } from "react";
import { IoIosArrowRoundUp } from "react-icons/io";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { buildCarUrl } from "../../../utils/urlBuilders";
import { formatPrice } from "../../../utils";
import { images } from "../../../assets/assets";
import { Image as LazyImage } from "../../ui/Image";
import {
  useGetMeQuery,
  useGetSavedCarsQuery,
  useSaveCarMutation,
  useUnsaveCarMutation,
} from "../../../redux/services/api";
import toast from "react-hot-toast";

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
  const navigate = useNavigate();

  // Get user data and saved cars
  const token = localStorage.getItem("token");
  const { data: userData, isLoading: isLoadingUser } = useGetMeQuery(
    undefined,
    {
      skip: !token, // Skip if no token
    },
  );
  const { data: savedCarsData } = useGetSavedCarsQuery(undefined, {
    skip: !userData || isLoadingUser || !token, // Only fetch if user is logged in
  });
  const [saveCar] = useSaveCarMutation();
  const [unsaveCar] = useUnsaveCarMutation();

  // Extract saved car IDs
  const savedCars = useMemo(() => {
    if (!savedCarsData || !Array.isArray(savedCarsData)) return [];
    return savedCarsData.map((car) => car._id || car.id).filter(Boolean);
  }, [savedCarsData]);

  const toggleSave = async (carId, e) => {
    e?.stopPropagation();

    // Check token first - this is the most reliable check
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to save cars");
      navigate("/login");
      return;
    }

    const isSaved = savedCars.includes(carId);

    try {
      if (isSaved) {
        await unsaveCar(carId).unwrap();
        toast.success("Car removed from saved list");
      } else {
        await saveCar(carId).unwrap();
        toast.success("Car saved successfully");
      }
    } catch (error) {
      // Check if it's an authentication error
      const errorStatus = error?.status || error?.data?.status;
      const errorMessage = error?.data?.message || error?.message || "";

      if (
        errorStatus === 401 ||
        errorStatus === 403 ||
        errorMessage.toLowerCase().includes("auth") ||
        errorMessage.toLowerCase().includes("login") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        toast.error("Your session has expired. Please login again.");
        // Only clear token and redirect if it's actually an auth error
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
        }, 1000);
      } else {
        toast.error(errorMessage || "Failed to update saved cars");
      }
    }
  };

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
    <section className="py-2">
      {/* Loading State */}
      {isLoading ? (
        <div
          className={
            isGrid
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-3"
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
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {cars.map((car, index) => {
                const carId = car?._id || index;
                const carImage = car?.images?.[0] || images.carPlaceholder;
                const carMake = car?.make || "Unknown Make";
                const carModel = car?.model || "Unknown Model";
                const carYear = car?.year || "N/A";
                const carPrice = formatPrice(car?.price);

                return (
                  <div
                    key={carId}
                    className={`group border border-gray-100 rounded-xl hover:shadow-xl transition-all duration-300 bg-white overflow-hidden flex ${
                      isGrid ? "flex-col" : "flex-col md:flex-row gap-6 p-5"
                    }`}
                  >
                    {/* Car Image container */}
                    <div
                      className={`relative flex items-center justify-center bg-gray-50 shrink-0 ${
                        isGrid
                          ? "h-52 w-full"
                          : "md:w-64 h-44 rounded-lg overflow-hidden"
                      }`}
                    >
                      <LazyImage
                        src={carImage}
                        alt={`${carMake} ${carModel}`}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105`}
                        width={isGrid ? 400 : 256}
                        height={isGrid ? 208 : 176}
                      />
                      {/* Badges and Save button (keep existing positions) */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        {car?.isBoosted &&
                          new Date(car?.boostExpiry) > new Date() && (
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-lg">
                              <FiZap size={10} /> BOOSTED
                            </div>
                          )}
                        {car?.featured && (
                          <div className="bg-primary-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-lg text-center">
                            FEATURED
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => toggleSave(carId, e)}
                        className="absolute top-3 right-3 bg-white/95 p-2 rounded-full shadow-md hover:bg-white hover:scale-110 transition-all z-10"
                      >
                        {savedCars.includes(carId) ? (
                          <BsBookmarkFill className="text-primary-500 text-lg" />
                        ) : (
                          <BsBookmark className="text-gray-400 text-lg" />
                        )}
                      </button>
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 flex flex-col ${
                        isGrid ? "p-5" : "justify-between"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-500 transition-colors">
                              {carMake} {carModel}
                            </h3>
                            <p className="text-gray-500 text-sm font-medium">
                              {carYear}
                            </p>
                          </div>
                          {isGrid && (
                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${
                                  car?.isSold
                                    ? "text-gray-400 line-through"
                                    : "text-primary-500"
                                }`}
                              >
                                {carPrice}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Stats Row */}
                        <div
                          className={`grid grid-cols-3 gap-2 mt-4 pb-4 ${
                            !isGrid ? "max-w-md" : ""
                          }`}
                        >
                          {[
                            {
                              icon: images.milesIcon,
                              val: car?.mileage
                                ? `${car.mileage.toLocaleString()} km`
                                : "N/A",
                              label: "Mileage",
                            },
                            {
                              icon: images.fuelTypeIcon,
                              val: car?.fuelType || "N/A",
                              label: "Fuel",
                            },
                            {
                              icon: images.transmissionIcon,
                              val: car?.transmission || "N/A",
                              label: "Trans",
                            },
                          ].map((stat, i) => (
                            <div
                              key={i}
                              className="flex flex-col items-center gap-1 p-2 bg-gray-50 rounded-lg"
                            >
                              <img
                                src={stat.icon}
                                alt=""
                                className="w-3.5 h-3.5 opacity-60"
                              />
                              <span className="text-[10px] font-bold text-gray-700 whitespace-nowrap">
                                {stat.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Footer / CTA Group */}
                      <div
                        className={`flex items-center justify-between mt-auto pt-4 border-t border-gray-100 ${
                          !isGrid ? "w-full" : ""
                        }`}
                      >
                        {!isGrid && (
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-400 font-medium">
                              Starting from
                            </span>
                            <span
                              className={`text-xl font-black text-primary-500`}
                            >
                              {carPrice}
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => navigate(buildCarUrl(car))}
                          className={`flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-lg transition-all bg-gray-900 text-white hover:bg-primary-500 shadow-sm hover:shadow-lg`}
                        >
                          VIEW DETAILS
                          <IoIosArrowRoundUp className="text-xl rotate-45" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )
      )}
    </section>
  );
};

export default FilteredCarsResults;
