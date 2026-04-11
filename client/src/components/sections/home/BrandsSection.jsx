import React, { memo, useMemo } from "react";
import BrandMarquee from "../../BrandMarquee";
import { Link, useNavigate } from "react-router-dom";
import { brandsCategory } from "../../../assets/assets";
// import brands from "../../../assets/carLogos/brands";

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
      // Map to correct route for each category
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
    <section className="bg-[#F5F5F5] w-full md:py-8 md:rounded-tl-[80px]">
      <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-3xl font-semibold py-2">
            Explore Our Premium Brands
          </h2>
          <Link
            to={"/view-all-brands"}
            className="text-primary-500 text-sm md:text-md hover:underline"
          >
            Show All Brands
          </Link>
        </div>
        {/* BrandMarquee will fetch brands from admin categories automatically */}
        <BrandMarquee />

        {/* Recently Viewed Cars and Brand Categories Grid */}
        <div className="py-4 md:w-[70%]">
          <div className="grid md:grid-cols-4 grid-cols-2 gap-4 md:gap-5">
            {/* Brand Categories */}
            {brandsCategory.map((brand, index) => {
              const isLastItem = index === brandsCategory.length - 1;
              const isOddNumberOfItems = brandsCategory.length % 2 !== 0;
              const meta = categoryMeta[brand.title];

              return (
                <button
                  type="button"
                  className={`
          bg-white shadow-xl shadow-gray-200 flex flex-col items-center justify-center rounded-2xl py-2
          ${isLastItem && isOddNumberOfItems ? "md:col-span-2 col-span-2" : ""}
          transition shadow-sm hover:shadow-md
        `}
                  key={index}
                  onClick={() => handleCategoryClick(brand.title)}
                  disabled={!meta?.slug}
                >
                  <img
                    className={`h-20 w-auto object-contain ${isLastItem && isOddNumberOfItems ? "md:h-28 md:w-32" : "md:h-24 md:w-24"}`}
                    src={brand.image}
                    alt={`${brand.title} brand logo`}
                    loading="lazy"
                  />
                  <span className="pb-1 text-lg md:text-xl font-semibold text-gray-800">
                    {brand.title}
                  </span>
                  {meta?.description && (
                    <span className="pb-2 px-3 text-xs md:text-sm text-gray-600 text-center leading-snug">
                      {meta.description}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ad */}
        <div className="ad"></div>
      </div>
    </section>
  );
};

export default memo(BrandsSection);
