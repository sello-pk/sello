import React from "react";
import CreatePostForm from "../../components/sections/createPost/CreatePostForm";
import WhyChooseUsUtility from "../../components/utils/WhyChooseUsUtility";
import InpirationSectoin from "../../components/sections/createPost/InpirationSectoin";
import BannerInFilter from "../../components/sections/filter/BannerInFilter";
import BrandMarquee from "../../components/BrandMarquee";
import { Link } from "react-router-dom";
import { MdArrowOutward } from "react-icons/md";
import FindOutMore from "../../components/sections/createPost/FindOutMore";

const CreatePost = () => {
  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8">
      <CreatePostForm />
      <WhyChooseUsUtility />
      <InpirationSectoin />
      <BannerInFilter />
      <div className="py-12 bg-[#F5F5F5]">
        <div className="flex items-center justify-between">
          <h2 className="md:text-4xl text-2xl font-semibold">
            Explore Our Premium Brands
          </h2>
          <Link
            to="/view-all-brands"
            className="flex items-center gap-2 text-primary-500"
          >
            Show All Brands <MdArrowOutward />
          </Link>
        </div>
        {/* BrandMarquee will fetch brands from admin categories automatically */}
        <BrandMarquee />
      </div>
      <FindOutMore />
    </div>
  );
};

export default CreatePost;
