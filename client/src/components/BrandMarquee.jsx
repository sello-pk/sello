import React, { useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCarCategories } from "../hooks/useCarCategories";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

const BrandMarquee = ({ brands: propBrands = [] }) => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  // Fetch brands from admin categories - always prioritize admin data
  const { makes, isLoading } = useCarCategories();

  // Always use admin categories if available
  const brands = useMemo(() => {
    if (makes && makes.length > 0) {
      return makes
        .filter((brand) => brand.isActive && brand.image)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return propBrands || [];
  }, [makes, propBrands]);

  // For infinite scroll marquee, we need enough duplicates for seamless CSS animation
  const items = useMemo(() => {
    if (brands.length === 0) return [];
    if (brands.length === 1) return brands;
    
    // Repeat enough to fill screens and loop
    const repeatCount = brands.length < 10 ? 4 : 2;
    let result = [];
    for (let i = 0; i < repeatCount; i++) {
      result = [...result, ...brands];
    }
    return result;
  }, [brands]);

  // Handle brand click - navigate directly to search results
  const handleBrandClick = (brandName) => {
    navigate(`/search-results?make=${encodeURIComponent(brandName)}`);
  };

  // Scroll function for buttons
  const scroll = (direction) => {
    const container = sliderRef.current?.parentElement;
    if (container) {
      const scrollAmount = 400;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll animation
  useEffect(() => {
    const el = sliderRef.current;
    if (!el || items.length === 0 || brands.length === 1) return;

    const animationName = `marquee-${brands.length}-${Date.now()}`;
    const animationDuration = Math.max(25, brands.length * 6); // Slow, premium speed
    const repeatCount = brands.length < 10 ? 4 : 2;
    const translatePercent = (100 / repeatCount);

    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
      @keyframes ${animationName} {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${translatePercent}%); }
      }
      .${animationName} {
        display: flex;
        width: max-content;
        animation: ${animationName} ${animationDuration}s linear infinite;
        will-change: transform;
      }
      .${animationName}:hover {
        animation-play-state: paused;
      }
    `;
    document.head.appendChild(styleSheet);
    el.classList.add(animationName);

    return () => {
      if (el && el.classList.contains(animationName)) {
        el.classList.remove(animationName);
      }
      if (styleSheet.parentNode) {
        styleSheet.parentNode.removeChild(styleSheet);
      }
    };
  }, [items.length, brands.length]);

  return (
    <div className="w-full py-6 backdrop-blur-sm">
      <div className="relative rounded-xl px-1 sm:px-10 py-4 overflow-hidden">
        {/* Slider buttons */}
        {brands.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-primary-500 hover:text-black transition-all hover:scale-110 border border-gray-100"
              aria-label="Previous brands"
            >
              <MdOutlineKeyboardArrowLeft size={24} className="text-gray-700" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-primary-500 hover:text-black transition-all hover:scale-110 border border-gray-100"
              aria-label="Next brands"
            >
              <MdOutlineKeyboardArrowRight size={24} className="text-gray-700" />
            </button>
          </>
        )}

        {/* Slider track */}
        <div className="overflow-x-auto scrollbar-hide w-full" style={{ scrollBehavior: 'smooth' }}>
          <div ref={sliderRef} className="flex gap-8 md:gap-14">
            {isLoading ? (
              <div className="flex items-center justify-center w-full py-8 text-gray-400">Loading...</div>
            ) : items.length === 0 ? (
              <div className="flex items-center justify-center w-full py-8 text-gray-400">No brands</div>
            ) : (
              items.map((brand, index) => {
                const brandName = brand.name || brand.brandName || "Brand";
                const brandImage = brand.image || brand.img;
                return (
                  <div
                    key={`${brand._id || brandName}-${index}`}
                    onClick={() => handleBrandClick(brandName)}
                    className="bg-white rounded-xl p-4 flex flex-col items-center justify-center w-24 h-28 md:w-32 md:h-36 shadow-sm flex-shrink-0 cursor-pointer hover:shadow-md transition-shadow group border border-transparent hover:border-gray-100"
                  >
                    <div className="flex-1 flex items-center justify-center mb-2">
                      <img
                        src={brandImage}
                        alt={brandName}
                        className="object-contain w-full h-full max-h-16 md:max-h-20"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.parentElement) e.target.parentElement.innerHTML = '<div class="text-xs text-gray-300">No logo</div>';
                        }}
                      />
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-primary-500 transition-colors line-clamp-1">
                      {brandName}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandMarquee;
