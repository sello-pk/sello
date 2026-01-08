import React, { useState } from "react";
import { customerReviews } from "../../../assets/blogs/blogAssets";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ReviewSliderBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === customerReviews.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? customerReviews.length - 1 : prev - 1
    );
  };

  const review = customerReviews[currentIndex];

  return (
    <div className="h-[70vh] w-full px-3 sm:px-4 md:px-6 lg:px-8 py-5">
      <div className="bg-[#272525] w-full h-full flex flex-col md:flex-row items-center justify-center rounded-tr-[40px] rounded-bl-[40px] gap-8 p-6">
        {/* Left Section */}
        <div className="w-full md:w-[40%] md:border-r-[1px] border-gray-400 md:h-[80%] p-3 flex flex-col items-center justify-center text-gray-200 text-sm">
          <h3 className="uppercase tracking-[0.3rem] mb-3 text-xs md:text-sm">
            testimonials
          </h3>
          <h2 className="text-2xl md:text-4xl font-semibold text-center">
            What people say <br className="hidden md:block" /> about our blog
          </h2>
          <p className="my-4 hidden md:block max-w-[70%] text-lg text-center">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia,
            quaerat consequatur corporis harum quibusdam hic fuga impedit
            consequuntur!
          </p>
        </div>

        {/* Right Section (Slider) */}
        <div className="slider w-full md:w-[55%] md:h-[80%] flex flex-col justify-between text-white px-2 md:px-6 py-4">
          <p className="text-base md:text-2xl font-medium mb-6 leading-relaxed text-center md:text-left">
            {review.review}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <img
              src={review.image}
              alt={review.name}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white"
            />
            <div className="text-center md:text-left">
              <h4 className="font-semibold">{review.name}</h4>
              <p className="text-sm text-gray-400">{review.country}</p>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3 mt-6 justify-center md:justify-start">
            <button
              onClick={prevSlide}
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-300"
            >
              <FaArrowLeft />
            </button>
            <button
              onClick={nextSlide}
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-primary-500 text-white hover:opacity-90"
            >
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSliderBanner;
