import React from "react";
import { images } from "../../../assets/assets";
import { GoArrowUpRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";

const BannerInUesrListings = () => {
  const navigate = useNavigate();

  const searchWithVehicleType = (vehicleType) => {
    navigate(`/search-results?vehicleType=${encodeURIComponent(vehicleType)}`);
  };

  const browseByType = (filters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        params.set(key, String(value));
      }
    });

    const qs = params.toString();
    navigate(`/search-results${qs ? `?${qs}` : ""}`);
  };

  return (
    <div className="py-12 min-w-0">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        <div className="h-auto md:h-[55vh] flex flex-col justify-around bg-gradient-to-r from-primary-500 to-primary-400 rounded-2xl shadow-xl p-4 sm:p-8 md:p-10 border border-gray-100 min-w-0 max-w-full box-border">
          <div className="px-2 sm:px-6 lg:px-8 py-5 sm:py-7 min-w-0">
            {/* Top Section */}
            <div className="w-full flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-6 my-4 min-w-0">
              {/* Left Image */}
              <div className="flex justify-center md:justify-start">
                <img
                  src={images.searchSvg}
                  alt="search icon"
                  className="w-20 h-20 md:w-auto md:h-auto"
                />
              </div>

              {/* Center Text */}
              <div className="text-center md:text-left min-w-0">
                <h3 className="text-2xl md:text-4xl font-semibold mb-4 text-white">
                  Search Thousands of Vehicles
                </h3>
                <p className="text-white text-base md:text-lg leading-relaxed">
                  Explore a wide selection of trusted used cars and vans from a
                  nationwide network of verified dealers. Easily find vehicles
                  that match your needs, budget, and preferences all in one
                  place.
                </p>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-8 md:mt-0 text-center md:text-left">
              <p className="text-white mb-5">Or Browse By Types:</p>
              <div className="flex flex-wrap items-center justify-center md:justify-between gap-3 md:gap-4">
                {[
                  {
                    label: "Automatic Cars",
                    filters: { transmission: "Automatic" },
                  },
                  { label: "SUVs", filters: { bodyType: "SUV" } },
                  { label: "Electric Cars", filters: { fuelType: "Electric" } },
                  { label: "New Arrivals", filters: { condition: "New" } },
                  { label: "Petrol", filters: { fuelType: "Petrol" } },
                  { label: "Diesel", filters: { fuelType: "Diesel" } },
                ].map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => browseByType(item.filters)}
                    className="group relative overflow-hidden bg-white rounded-2xl md:rounded-lg px-5 py-2.5 shadow-lg border border-gray-100 hover:border-primary-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
                  >
                    <span className="absolute inset-0 bg-gradient-to-br from-primary-50/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <span className="relative z-10 text-sm font-semibold text-gray-800 group-hover:text-primary-500 transition-colors tracking-tight whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                ))}
                {/* Right Buttons */}
                <div className="btns flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 ">
                  <button
                    type="button"
                    onClick={() => searchWithVehicleType("Car")}
                    className="flex items-center justify-center px-6 md:px-8 hover:opacity-90 py-2.5 md:py-3 text-base md:text-lg bg-black rounded-lg text-white gap-2 w-full md:w-auto"
                  >
                    Search Cars <GoArrowUpRight />
                  </button>
                  <button
                    type="button"
                    onClick={() => searchWithVehicleType("Van")}
                    className="flex items-center justify-center px-6 md:px-8 hover:opacity-90 py-2.5 md:py-3 text-base md:text-lg bg-black rounded-lg text-white gap-2 w-full md:w-auto"
                  >
                    Search Vans <GoArrowUpRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerInUesrListings;
