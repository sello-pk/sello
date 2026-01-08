import React from "react";
import { images } from "../../assets/assets";
import { GoArrowUpRight } from "react-icons/go";

const BannerInUesrListings = () => {
  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 bg-[#F5F5F5]">
      <div className="w-full h-auto md:h-[55vh] flex flex-col justify-around mb-16 bg-primary rounded-tr-[60px] rounded-bl-[60px] p-7">
        {/* Top Section */}
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
          {/* Left Image */}
          <div className="flex justify-center md:justify-start">
            <img
              src={images.searchSvg}
              alt="search icon"
              className="w-20 h-20 md:w-auto md:h-auto"
            />
          </div>

          {/* Center Text */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl md:text-4xl font-semibold mb-4 text-white">
              Search Thousands of Vehicles
            </h3>
            <p className="text-white text-base md:text-lg leading-relaxed">
              Explore a wide selection of trusted used cars and vans from a
              nationwide network of verified dealers. Easily find vehicles that
              match your needs, budget, and preferences all in one place.
            </p>
          </div>

          {/* Right Buttons */}
          <div className="btns flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mt-6 md:mt-12">
            <button className="flex items-center justify-center px-6 md:px-8 hover:opacity-90 py-2.5 md:py-3 text-base md:text-lg bg-black rounded-lg text-white gap-2 w-full md:w-auto">
              Search Cars <GoArrowUpRight />
            </button>
            <button className="flex items-center justify-center px-6 md:px-8 hover:opacity-90 py-2.5 md:py-3 text-base md:text-lg bg-black rounded-lg text-white gap-2 w-full md:w-auto">
              Search Vans <GoArrowUpRight />
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 md:mt-0 text-center md:text-left">
          <p className="text-white mb-5">Or Browse By Types:</p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4">
            {[
              "Automatic Cars",
              "SUVs",
              "Eelctric Cars",
              "New Arrivals",
              "Petrol",
              "Diesel",
            ].map((item, index) => (
              <button
                key={index}
                className="px-4 md:px-5 py-1.5 text-sm md:text-lg shadow shadow-gray-700 rounded-lg text-gray-50"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerInUesrListings;
