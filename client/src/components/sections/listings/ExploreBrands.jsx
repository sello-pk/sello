import React from "react";
import { images } from "../../../assets/assets";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundUp } from "react-icons/io";

const ExploreBrands = () => {
  const navigate = useNavigate();

  return (
    <section className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 bg-[#F5F5F5]">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-8">
        {/* Text Content */}
        <div className="w-full md:w-1/2">
          <h2 className="md:text-4xl text-2xl font-semibold mb-4">
            Explore Our Premium Brands
          </h2>
          <p className="text-base text-gray-700 leading-relaxed">
            Explore a curated collection of top automotive brands which present
            you with reliable cars for sale in Pakistan. As you compare models,
            check out premium features, or look for dependable used cars for
            sale in Pakistan, our brand selection is here to help you make sure
            footed decisions.
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            From compact cars that are great for the whole family to large SUVs
            and luxury models, we have what you are looking for in terms of cars
            for sale in Karachi, Islamabad, Lahore and all over Pakistan and we
            only feature trusted sellers.
          </p>
          <button
            onClick={() => navigate("/view-all-brands")}
            className="mt-6 md:text-lg bg-primary-500 px-7 py-2.5 hover:opacity-90 rounded-md flex items-center gap-3 text-white transition-colors"
          >
            Show All Brands
            <IoIosArrowRoundUp className="text-2xl rotate-[43deg]" />
          </button>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <img
            src={images.mutlipleBrandsLogo}
            alt="Multiple Brands"
            className="w-full max-w-[500px] object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default ExploreBrands;
