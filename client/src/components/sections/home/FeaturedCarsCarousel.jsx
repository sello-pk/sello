import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetFilteredCarsQuery } from "../../../redux/services/api";
import { images } from "../../../assets/assets";
import {
  IoIosArrowRoundUp,
  IoIosArrowBack,
  IoIosArrowForward,
} from "react-icons/io";
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
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const token = localStorage.getItem("token");

  // Fetch featured cars
  const { data: carsData, isLoading } = useGetFilteredCarsQuery({
    page: 1,
    limit: 20,
    featured: "true", // Send as string to ensure URLSearchParams converts it correctly
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
    // RTK Query extracts the 'data' field from backend response
    // Backend returns { success: true, data: { cars: [...] } }
    // RTK Query returns { cars: [...], total: ..., ... }
    const cars = carsData?.cars || carsData?.data?.cars || [];
    if (!Array.isArray(cars)) {
      return [];
    }
    const filtered = cars
      .filter(
        (car) =>
          car.featured === true &&
          car.isApproved !== false &&
          car.status !== "sold" &&
          !car.isSold,
      )
      .slice(0, 12); // Show max 12 featured cars
    return filtered;
  }, [carsData]);

  // Auto-scroll carousel
  useEffect(() => {
    if (featuredCars.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredCars.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [featuredCars.length]);

  // Scroll to current slide
  useEffect(() => {
    if (sliderRef.current) {
      const cardWidth = sliderRef.current.children[0]?.offsetWidth || 400;
      const gap = 24;
      const scrollPosition = currentIndex * (cardWidth + gap);
      sliderRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + featuredCars.length) % featuredCars.length,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredCars.length);
  };

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
      <section className="relative py-14 bg-gray-50">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  if (featuredCars.length === 0) {
    return null;
  }

  return (
    <section className="relative py-12 md:py-14 bg-gray-100 overflow-hidden">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - OLX/PakWheels style: clean and simple */}
        <div className="flex items-center justify-between mb-8">
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

        {/* Carousel Container */}
        <div className="relative">
          {featuredCars.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 z-20 bg-white border border-gray-200 hover:border-primary-500 hover:bg-primary-50 p-2.5 rounded-lg shadow-md transition-all"
                aria-label="Previous"
              >
                <IoIosArrowBack className="text-xl text-gray-700 hover:text-primary-500" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 z-20 bg-white border border-gray-200 hover:border-primary-500 hover:bg-primary-50 p-2.5 rounded-lg shadow-md transition-all"
                aria-label="Next"
              >
                <IoIosArrowForward className="text-xl text-gray-700 hover:text-primary-500" />
              </button>
            </>
          )}

          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitScrollbar: { display: "none" },
            }}
          >
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
                  className="min-w-[280px] sm:min-w-[300px] md:min-w-[320px] flex-shrink-0 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer overflow-hidden"
                >
                  <div className="relative">
                    {/* Car Image - all image overlays inside here so they don't overlap card body */}
                    <div className="relative h-44 md:h-52 overflow-hidden bg-gray-100">
                      <LazyImage
                        src={carImage}
                        alt={`${carMake} ${carModel}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

                      {/* Featured badge - primary-500, top-left */}
                      <div className="absolute top-2 left-2 z-20 bg-primary-500 text-white px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                        <FiStar size={12} />
                        <span className="font-semibold text-xs">FEATURED</span>
                      </div>

                      {/* Vehicle type - bottom-left of image only (keeps it off the "View" button below) */}
                      <div className="absolute bottom-2 left-2 z-20 bg-gray-900/80 text-white px-2 py-1 rounded-md text-xs font-medium">
                        {carVehicleType}
                      </div>

                      {car?.isBoosted && new Date(car?.boostExpiry) > new Date() && (
                        <div className="absolute bottom-2 left-16 bg-primary-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                          <FiZap size={10} />
                          BOOSTED
                        </div>
                      )}

                      {/* Heart (save) icon - top-right only */}
                      <button
                        onClick={(e) => toggleSave(carId, e)}
                        disabled={isSaving || isUnsaving}
                        className="absolute top-2 right-2 z-20 bg-white/95 hover:bg-white p-1.5 rounded-full shadow border border-gray-100 disabled:opacity-50"
                        title={isSaved ? "Remove from saved" : "Save car"}
                      >
                        {isSaved ? (
                          <AiFillHeart className="text-primary-500 text-lg" />
                        ) : (
                          <AiOutlineHeart className="text-gray-500 hover:text-primary-500 text-lg transition-colors" />
                        )}
                      </button>
                    </div>

                    {/* Card body - white bg, clear hierarchy */}
                    <div className="p-4 bg-white">
                      <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2 leading-snug">
                        {carMake} {carModel} {carYear}
                      </h3>

                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                        {images?.milesIcon && (
                          <span className="flex items-center gap-1">
                            <img src={images.milesIcon} alt="" className="w-3.5 h-3.5 opacity-70" />
                            {carMileage}
                          </span>
                        )}
                        {images?.fuelTypeIcon && (
                          <span className="flex items-center gap-1">
                            <img src={images.fuelTypeIcon} alt="" className="w-3.5 h-3.5 opacity-70" />
                            {carFuelType}
                          </span>
                        )}
                        {images?.transmissionIcon && (
                          <span className="flex items-center gap-1">
                            <img src={images.transmissionIcon} alt="" className="w-3.5 h-3.5 opacity-70" />
                            {carTransmission}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="text-lg font-bold text-primary-500">
                          PKR {carPrice}
                        </p>
                        <span className="text-primary-500 font-semibold text-sm hover:underline flex items-center gap-0.5">
                          View
                          <IoIosArrowRoundUp className="text-base rotate-[43deg]" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {featuredCars.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-5">
              {featuredCars.slice(0, Math.min(5, featuredCars.length)).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex ? "bg-primary-500 w-6" : "bg-gray-300 w-1.5 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default FeaturedCarsCarousel;
