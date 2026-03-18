import React, { useRef, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCarCategories } from "../hooks/useCarCategories";
import { fixImageUrl } from "../utils/imageUtils";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

function BrandTile({ brand, onSelect }) {
  const brandName = brand.name || brand.brandName || "Brand";
  const [imgFailed, setImgFailed] = useState(false);
  const fixedImage = fixImageUrl(brand.image || brand.img);

  return (
    <button
      type="button"
      onClick={() => onSelect(brandName)}
      className="bg-white rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center w-[5.25rem] h-28 sm:w-24 sm:h-28 md:w-28 md:h-32 shadow-sm shrink-0 cursor-pointer border border-gray-100 hover:border-primary-300 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex-1 w-full min-h-0 rounded-xl bg-gray-50 flex items-center justify-center mb-1 p-1.5 sm:p-2 overflow-hidden">
        {!imgFailed && fixedImage ? (
          <img
            src={fixedImage}
            alt=""
            width={112}
            height={64}
            decoding="async"
            draggable={false}
            className="object-contain max-w-full max-h-12 sm:max-h-14 md:max-h-16 w-auto h-auto pointer-events-none"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span
            className="text-xl font-semibold text-gray-400 select-none"
            aria-hidden
          >
            {brandName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-gray-700 text-center w-full truncate mt-0.5">
        {brandName}
      </p>
    </button>
  );
}

const BrandMarquee = ({ brands: propBrands = [] }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const { makes, isLoading } = useCarCategories("Car");

  const brands = useMemo(() => {
    if (makes && makes.length > 0) {
      return makes
        .filter((brand) => brand.isActive && brand.image)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return propBrands || [];
  }, [makes, propBrands]);

  const handleBrandClick = useCallback(
    (brandName) => {
      const params = new URLSearchParams({
        make: brandName,
        vehicleType: "Car",
      });
      navigate(`/search-results?${params.toString()}`);
    },
    [navigate],
  );

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.min(320, el.clientWidth * 0.85);
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="w-full py-3 sm:py-4">
      <div className="relative rounded-xl sm:px-6 md:px-10 py-2 sm:py-3">
        {brands.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-white shadow-md hover:bg-primary-500 hover:text-white transition-colors border border-gray-200"
              aria-label="Previous brands"
            >
              <MdOutlineKeyboardArrowLeft size={24} className="text-gray-700 hover:text-white" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-md hover:opacity-90 transition-opacity border border-primary-600"
              aria-label="Next brands"
            >
              <MdOutlineKeyboardArrowRight size={24} className="text-white" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className="overflow-x-auto scrollbar-hide w-full scroll-smooth overscroll-x-contain px-1 md:px-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex gap-4 sm:gap-6 md:gap-8 w-max py-1">
            {isLoading ? (
              <div className="flex items-center justify-center min-w-[200px] py-8 text-gray-400">
                Loading...
              </div>
            ) : brands.length === 0 ? (
              <div className="flex items-center justify-center min-w-[200px] py-8 text-gray-400">
                No brands
              </div>
            ) : (
              brands.map((brand) => (
                <BrandTile
                  key={brand._id || brand.name}
                  brand={brand}
                  onSelect={handleBrandClick}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandMarquee;
