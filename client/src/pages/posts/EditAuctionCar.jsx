import React from "react";
import EditCarForm from "../../components/sections/createPost/EditCarForm";
import WhyChooseUsUtility from "../../components/utils/WhyChooseUsUtility";
import InpirationSectoin from "../../components/sections/createPost/InpirationSectoin";
import BannerInFilter from "../../components/sections/filter/BannerInFilter";
import BrandMarquee from "../../components/BrandMarquee";
import { Link } from "react-router-dom";
import { MdArrowOutward } from "react-icons/md";
import FindOutMore from "../../components/sections/createPost/FindOutMore";

const PAGE_GUTTER =
  "max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8";

const EditAuctionCar = () => {
  return (
    <div className="w-full min-w-0">
      <div className={PAGE_GUTTER}>
        <EditCarForm />
      </div>
      <WhyChooseUsUtility />
      <InpirationSectoin />
      <BannerInFilter />
      <div className="w-full bg-[#F5F5F5] py-12">
        <div className={PAGE_GUTTER}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="md:text-4xl text-2xl font-semibold">
              Explore Our Premium Brands
            </h1>
            <Link
              to="/view-all-brands"
              className="flex items-center gap-2 text-primary-500 shrink-0"
            >
              Show All Brands <MdArrowOutward />
            </Link>
          </div>
          <BrandMarquee />
        </div>
      </div>
      <FindOutMore />
    </div>
  );
};

export default EditAuctionCar;
