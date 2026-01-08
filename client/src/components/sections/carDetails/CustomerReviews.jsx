import React, { useState } from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { reviews } from "../../../assets/assets";

const CustomerReviews = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className="px-4 md:px-20 py-12 bg-[#F9FAFB] flex flex-col md:flex-row md:gap-28 gap-10">
      {/* Left Section */}
      <div className="flex-1">
        <h2 className="md:text-4xl text-2xl font-semibold leading-snug">
          What Our <br className="hidden md:block" /> Customers Say
        </h2>
        <div className="py-4 text-lg md:text-xl font-medium text-gray-700">
          Great
        </div>

        {/* Stars */}
        <div className="flex items-center gap-2 mb-2">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="text-white bg-green-500 w-7 h-7 flex items-center justify-center text-xl rounded"
            >
              ★
            </div>
          ))}
        </div>

        {/* Review Count */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
          <span>Based on</span>
          <span className="font-medium">5,801 reviews</span>
        </div>

        {/* Trustpilot */}
        <div className="flex gap-2 items-center text-xl mt-5 font-semibold text-gray-700">
          <div className="flex items-center justify-center bg-green-400 text-white h-7 w-7 rounded">
            ★
          </div>
          <span>Trustpilot</span>
        </div>
      </div>

      {/* Right Section (Review Box) */}
      <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
        {/* Stars + Verified */}
        <div className="flex items-center gap-2 mb-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="text-white bg-green-500 w-7 h-7 flex items-center justify-center text-xl rounded"
            >
              ★
            </div>
          ))}
          <div className="text-gray-400 flex items-center gap-2 ml-4">
            <IoCheckmarkCircle className="text-2xl text-green-500" />
            Verified
          </div>
        </div>

        {/* Selected Review */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {reviews[selectedIndex].name}
          </h3>
          <span className="text-sm text-gray-500">
            {reviews[selectedIndex].role}
          </span>
          <p className="text-gray-700 mt-2 leading-relaxed">
            "{reviews[selectedIndex].review}"
          </p>
        </div>

        {/* Image Thumbnails */}
        <div className="images flex items-center gap-4 mt-5 overflow-x-auto">
          {reviews.map((review, index) => (
            <div key={index} className="w-14 h-14 flex-shrink-0">
              <img
                src={review.image}
                alt={review.name}
                onClick={() => setSelectedIndex(index)}
                className={`rounded-full h-full w-full object-cover border-2 cursor-pointer transition duration-300 ${
                  selectedIndex === index
                    ? "opacity-100 border-green-500"
                    : "opacity-40 border-gray-300"
                }`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
