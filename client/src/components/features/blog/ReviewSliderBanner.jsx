import React, { useMemo, useState } from "react";
import { customerReviews } from "../../../assets/blogs/blogAssets";
import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa";
import { HiLocationMarker } from "react-icons/hi";

const ReviewSliderBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = customerReviews?.length || 0;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const review = customerReviews?.[currentIndex];

  const dots = useMemo(() => {
    const maxDots = 6;
    if (!total) return [];
    if (total <= maxDots) return Array.from({ length: total }, (_, i) => i);
    // show first 5 + last
    return [0, 1, 2, 3, 4, total - 1];
  }, [total]);

  if (!review) return null;

  return (
    <section className="bg-gray-50 relative overflow-hidden">
      <div className="relative bg-white py-12 md:py-16 w-full rounded-tl-[60px] md:rounded-tl-[80px] shadow-lg">
        <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-14">
            <div className="inline-block mb-4">
              <span className="text-primary-500 font-bold text-xs md:text-sm uppercase tracking-widest px-4 py-2 bg-primary-100 rounded-full">
                Testimonials
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Trusted by Car Buyers & Sellers
            </h2>
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-24 h-1.5 bg-gradient-to-r from-primary-500 to-primary-500 rounded-full" />
              <div className="w-3 h-3 bg-primary-500 rounded-full" />
              <div className="w-24 h-1.5 bg-gradient-to-r from-primary-500 to-primary-500 rounded-full" />
            </div>
            <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
              A quick snapshot of what customers consistently highlight about
              their experience on Sello.
            </p>
          </div>

          <div className="max-w-full mx-auto">
            <div className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-shadow duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 to-transparent rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {review.image ? (
                      <img
                        src={review.image}
                        alt={review.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-semibold flex items-center justify-center shrink-0">
                        {(review.name || "U").slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {review.name}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5">
                        <HiLocationMarker
                          className="text-primary-500"
                          aria-hidden
                        />
                        <span className="truncate">{review.country}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} className="text-sm" aria-hidden />
                    ))}
                  </div>
                </div>

                <div className="mt-4 sm:mt-5">
                  <p
                    key={review.id ?? currentIndex}
                    className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed"
                  >
                    <span className="text-gray-400 font-semibold mr-1">“</span>
                    {review.review}
                    <span className="text-gray-400 font-semibold ml-1">”</span>
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    {dots.map((i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 rounded-full transition-[width,background-color] duration-200 ${
                          i === currentIndex
                            ? "bg-primary-500 w-7"
                            : "bg-gray-200 w-2 hover:bg-gray-300"
                        }`}
                        aria-label={`Go to review ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center sm:justify-end gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={prevSlide}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-md border border-gray-200 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors duration-200"
                      aria-label="Previous review"
                    >
                      <FaArrowLeft className="text-sm" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={nextSlide}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-gray-700 shadow-md border border-gray-200 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-colors duration-200"
                      aria-label="Next review"
                    >
                      <FaArrowRight className="text-sm" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewSliderBanner;
