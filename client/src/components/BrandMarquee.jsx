import React, {
  useRef,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useCarCategories } from "../hooks/useCarCategories";
import { fixImageUrl } from "../utils/imageUtils";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
} from "react-icons/md";

const KF_ID = "brand-marquee-keyframes";
const PX_PER_SEC = 38;

function injectMarqueeKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KF_ID)) return;
  const s = document.createElement("style");
  s.id = KF_ID;
  s.textContent = `
@keyframes brandMarqueeKF {
  from { transform: translate3d(0, 0, 0); }
  to { transform: translate3d(-50%, 0, 0); }
}
`;
  document.head.appendChild(s);
}

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
  const trackRef = useRef(null);
  const [durationSec, setDurationSec] = useState(45);
  const navigate = useNavigate();

  const { makes, isCarCategoriesLoading } = useCarCategories("Car");

  const brands = useMemo(() => {
    if (makes && makes.length > 0) {
      return makes
        .filter((brand) => brand.isActive && brand.image)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return propBrands || [];
  }, [makes, propBrands]);

  const brandsKey = useMemo(
    () => brands.map((b) => b._id || b.name).join(","),
    [brands],
  );

  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const row = useMemo(() => {
    if (brands.length === 0) return [];
    if (brands.length === 1) return [brands[0], brands[0]];
    return [...brands, ...brands];
  }, [brands]);

  useEffect(() => {
    injectMarqueeKeyframes();
  }, []);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el || row.length < 2 || reducedMotion) return;

    const update = () => {
      const w = el.scrollWidth;
      if (w < 16) return;
      const half = w / 2;
      const sec = Math.max(18, Math.min(100, half / PX_PER_SEC));
      setDurationSec(sec);
    };

    const ro = new ResizeObserver(() => requestAnimationFrame(update));
    ro.observe(el);
    update();
    return () => ro.disconnect();
  }, [brandsKey, row.length, reducedMotion]);

  const nudgeAnimation = useCallback(
    (dir) => {
      const el = trackRef.current;
      if (!el || reducedMotion) return;
      const anim = el.getAnimations?.()?.[0];
      if (!anim) return;
      try {
        anim.playbackRate = dir === "right" ? 5 : -4;
        window.setTimeout(() => {
          anim.playbackRate = 1;
        }, 420);
      } catch {
        /* Safari may not support negative rate for left */
      }
    },
    [reducedMotion],
  );

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

  const showNav =
    brands.length >= 1 && !isCarCategoriesLoading && row.length >= 2;

  return (
    <div className="w-full py-3 sm:py-4">
      <div className="relative rounded-xl sm:px-6 md:px-10 py-2 sm:py-3">
        {showNav && !reducedMotion && (
          <>
            <button
              type="button"
              onClick={() => nudgeAnimation("left")}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-md border border-gray-200 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200"
              aria-label="Previous brands"
            >
              <MdOutlineKeyboardArrowLeft size={22} className="shrink-0" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => nudgeAnimation("right")}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-md border border-gray-200 hover:bg-primary-500 hover:text-white hover:border-primary-500 transition-all duration-200"
              aria-label="Next brands"
            >
              <MdOutlineKeyboardArrowRight size={22} className="shrink-0" aria-hidden />
            </button>
          </>
        )}

        <div
          className={`w-full overflow-hidden px-1 md:px-2 ${!reducedMotion ? "group/marquee" : "overflow-x-auto scrollbar-hide"}`}
        >
          <div
            ref={trackRef}
            key={brandsKey}
            className="flex w-max gap-4 sm:gap-6 md:gap-8 py-1"
            style={
              reducedMotion || isCarCategoriesLoading
                ? undefined
                : {
                    animationName: "brandMarqueeKF",
                    animationDuration: `${durationSec}s`,
                    animationTimingFunction: "linear",
                    animationIterationCount: "infinite",
                    willChange: "transform",
                  }
            }
          >
            {isCarCategoriesLoading ? (
              <div className="flex items-center justify-center min-w-[200px] py-8 text-gray-400 shrink-0">
                Loading...
              </div>
            ) : brands.length === 0 ? (
              <div className="flex items-center justify-center min-w-[200px] py-8 text-gray-400 shrink-0">
                No brands
              </div>
            ) : reducedMotion ? (
              brands.map((brand) => (
                <BrandTile
                  key={brand._id || brand.name}
                  brand={brand}
                  onSelect={handleBrandClick}
                />
              ))
            ) : (
              row.map((brand, i) => (
                <BrandTile
                  key={`${brand._id || brand.name}-${i}`}
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
