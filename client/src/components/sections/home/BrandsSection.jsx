import React, { memo, useMemo, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { brandsCategory } from "../../../assets/assets";

// Lazy load BrandMarquee as it's not critical for initial paint
const BrandMarquee = React.lazy(() => import("../../BrandMarquee"));

const BrandsSection = () => {
  const navigate = useNavigate();

  const categoryMeta = useMemo(
    () => ({
      Car: {
        slug: "car",
        description: "Cars, sedans, SUVs, and other passenger vehicles",
      },
      Bus: {
        slug: "bus",
        description: "Buses and commercial passenger vehicles",
      },
      Truck: {
        slug: "truck",
        description: "Trucks and heavy-duty vehicles",
      },
      Van: {
        slug: "van",
        description: "Vans and utility vehicles",
      },
      Bike: {
        slug: "bike",
        description: "Motorcycles and bikes",
      },
      "E-Bike": {
        slug: "e-bike",
        description: "Electric bikes and scooters",
      },
      Farm: {
        slug: "farm",
        description: "Farm vehicles and agricultural equipment",
      },
    }),
    [],
  );

  const handleCategoryClick = (title) => {
    const meta = categoryMeta[title];
    if (meta?.slug) {
      const routeMap = {
        car: "/listings/car",
        cars: "/listings/car",
        bus: "/listings/bus",
        buses: "/listings/bus",
        truck: "/listings/truck",
        trucks: "/listings/truck",
        van: "/listings/van",
        vans: "/listings/van",
        bike: "/listings/bike",
        bikes: "/listings/bike",
        "e-bike": "/listings/e-bike",
        "e-bikes": "/listings/e-bike",
        farm: "/listings/farm",
      };
      const route = routeMap[meta.slug] || `/listings/${meta.slug}`;
      navigate(route);
    }
  };

  return (
    <section className="bg-[#EEEEEE] w-full md:py-8 md:rounded-tl-[80px]">
      <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-3xl font-semibold py-2">
            Explore Our Premium Brands
          </h2>
          <Link
            to={"/view-all-brands"}
            className="text-primary-600 text-sm md:text-md hover:underline hover:text-primary-700"
          >
            Show All Brands
          </Link>
        </div>

        {/* Marquee */}
        <div className="min-h-[100px]">
          <Suspense fallback={<div className="h-20 bg-gray-100 animate-pulse rounded-lg" />}>
            <BrandMarquee />
          </Suspense>
        </div>

        {/* Grid */}
        <div className="py-4 md:w-[70%]">
          <div className="grid md:grid-cols-4 grid-cols-2 gap-4 md:gap-5">
            {brandsCategory.map((brand, index) => {
              const isLastItem = index === brandsCategory.length - 1;
              const isOddNumberOfItems = brandsCategory.length % 2 !== 0;
              const meta = categoryMeta[brand.title];

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleCategoryClick(brand.title)}
                  disabled={!meta?.slug}
                  className={`
                    bg-white rounded-2xl 
                    flex flex-col items-center justify-start
                    px-3 py-4
                    min-h-[180px] md:min-h-[220px]
                    transition shadow-sm hover:shadow-md
                    ${isLastItem && isOddNumberOfItems ? "md:col-span-2 col-span-2" : ""}
                  `}
                >
                  {/* Image wrapper (FIXED CLS) */}
                  <div
                    className={`
                      w-20 md:w-24 aspect-square mb-2
                      flex items-center justify-center
                      ${isLastItem && isOddNumberOfItems ? "md:w-28" : ""}
                    `}
                  >
                    <img
                      src={brand.image}
                      alt={`${brand.title} brand logo`}
                      width="96"
                      height="96"
                      loading="lazy"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Title */}
                  <span className="text-base md:text-lg font-semibold text-gray-800 text-center">
                    {brand.title}
                  </span>

                  {/* Description (fixed height to prevent shift) */}
                  <span className="mt-1 text-xs md:text-sm text-gray-600 text-center leading-snug min-h-[40px]">
                    {meta?.description || ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ad placeholder (prevents CLS) */}
        <div className="min-h-[120px]"></div>
      </div>
    </section>
  );
};

export default memo(BrandsSection);
