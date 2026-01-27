import React from "react";
import { useLocation } from "react-router-dom";
import { images } from "../../../assets/assets";
import { FaApple } from "react-icons/fa";
import { IoLogoGooglePlaystore } from "react-icons/io5";

const BannerInFilter = () => {
  const location = useLocation();

  // Check if current location is create-post
  const isCreatePostPage = location.pathname === "/create-post";

  return (
    <div className="my-10">
      <div
        className={`w-full rounded-tl-[40px] rounded-br-[40px] flex flex-col md:flex-row items-center justify-between py-4 px-6 md:px-12 bg-primary-500
        `}
      >
        {/* Left Content */}
        <div className="max-w-xl text-center md:text-left">
          <h2
            className={`text-2xl md:text-4xl font-semibold py-2 ${
              isCreatePostPage ? "text-black" : "text-white"
            }`}
          >
            Shop Used Cars, Whether You're on The Lot or On The Go
          </h2>
          <p
            className={`py-2 text-sm md:text-base ${
              isCreatePostPage ? "text-black" : "text-white"
            }`}
          >
            Download our app to save cars and create alerts, scan window
            stickers on our lot for more details, and even call dibs on a car by
            holding for up to 7 days.
          </p>

          {/* Store Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mt-6">
            {/* Apple Button */}
            <button
              className={`flex items-center gap-3 shadow-md px-5 py-3 rounded-xl border hover:shadow-lg transition
              ${
                isCreatePostPage
                  ? "bg-black text-white border-black hover:bg-gray-900"
                  : "bg-white text-primary-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <FaApple
                className={`text-3xl md:text-4xl ${
                  isCreatePostPage ? "text-white" : "text-primary-500"
                }`}
              />
              <div className="flex flex-col items-start leading-tight text-left">
                <span className="text-xs md:text-sm">Download on the</span>
                <span className="text-sm md:text-lg font-semibold">
                  App Store
                </span>
              </div>
            </button>

            {/* Google Play Button */}
            <button
              className={`flex items-center gap-3 shadow-md px-5 py-3 rounded-xl border hover:shadow-lg transition
              ${
                isCreatePostPage
                  ? "bg-black text-white border-black hover:bg-gray-900"
                  : "bg-white text-primary-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <IoLogoGooglePlaystore
                className={`text-3xl md:text-4xl ${
                  isCreatePostPage ? "text-white" : "text-primary-500"
                }`}
              />
              <div className="flex flex-col items-start leading-tight text-left">
                <span className="text-xs md:text-sm">Get it on</span>
                <span className="text-sm md:text-lg font-semibold">
                  Google Play
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Image */}
        <div className="mt-8 md:mt-0 md:ml-8 w-[220px] sm:w-[300px] md:w-[350px]">
          <img
            src={images.app}
            alt="App Preview"
            className="w-full h-auto drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default BannerInFilter;
