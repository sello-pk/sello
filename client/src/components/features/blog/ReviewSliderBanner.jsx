import React, { useState } from "react";
import { customerReviews } from "../../../assets/blogs/blogAssets";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ReviewSliderBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === customerReviews.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? customerReviews.length - 1 : prev - 1,
    );
  };

  const review = customerReviews[currentIndex];

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-10 md:py-16">
      <div className="max-w-[86rem] mx-auto w-full">
        <div className="bg-[#050B20] w-full flex flex-col md:flex-row md:items-stretch rounded-tr-[40px] rounded-bl-[40px] gap-8 md:gap-10 p-6 md:p-10 lg:p-12">
          <div className="w-full md:w-[38%] md:min-w-[240px] md:border-r border-white/20 md:pr-8 flex flex-col items-center md:items-start justify-center text-gray-200">
            <h3 className="uppercase tracking-[0.3rem] mb-3 text-xs md:text-sm text-gray-400">
              testimonials
            </h3>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-center md:text-left text-white">
              What people say <br className="hidden md:block" /> about our blog
            </h2>
            <p className="mt-4 hidden md:block text-base text-gray-400 text-center md:text-left max-w-md leading-relaxed">
              Real feedback from readers who use Sello for cars, tips, and
              marketplace insights.
            </p>
          </div>

          <div className="w-full md:flex-1 flex flex-col justify-between gap-6 text-white min-w-0 py-2">
            <p className="text-base md:text-xl lg:text-2xl font-medium leading-relaxed text-center md:text-left break-words">
              {review.review}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white shrink-0 object-cover"
                />
                <div className="text-center md:text-left min-w-0">
                  <h4 className="font-semibold text-white">{review.name}</h4>
                  <p className="text-sm text-gray-400">{review.country}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-center md:justify-end shrink-0">
                <button
                  type="button"
                  onClick={prevSlide}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                  aria-label="Previous review"
                >
                  <FaArrowLeft />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-500 text-white hover:opacity-90 transition-opacity"
                  aria-label="Next review"
                >
                  <FaArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewSliderBanner;
