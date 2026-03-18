import React from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import CreatePostForm from "../../components/sections/createPost/CreatePostForm";
import WhyChooseUsUtility from "../../components/utils/WhyChooseUsUtility";
import InpirationSectoin from "../../components/sections/createPost/InpirationSectoin";
import BannerInFilter from "../../components/sections/filter/BannerInFilter";
import BrandMarquee from "../../components/BrandMarquee";
import { Link } from "react-router-dom";
import { MdArrowOutward } from "react-icons/md";
import FindOutMore from "../../components/sections/createPost/FindOutMore";

const CreatePost = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const prefillFromEstimator =
    location.state?.fromEstimator && location.state?.prefill
      ? location.state.prefill
      : null;

  const prefillFromInspiration =
    location.state?.fromInspiration && location.state?.prefill
      ? location.state.prefill
      : null;

  // Prefer estimator prefill (used from /car-estimator flow)
  const inspirationKey = searchParams.get("inspiration");
  const prefillFromInspirationQuery = (() => {
    switch (inspirationKey) {
      case "Automatics Cars":
        return { transmission: "Automatic" };
      case "SUVs":
        return { bodyType: "SUV" };
      case "Electric Cars":
        return { fuelType: "Electric" };
      case "New in Stock":
        return { condition: "New" };
      case "Petrol":
        return { fuelType: "Petrol" };
      case "Diesel":
        return { fuelType: "Diesel" };
      default:
        return null;
    }
  })();

  // Prefer estimator prefill; then query param; then location state.
  const prefill =
    prefillFromEstimator ||
    prefillFromInspirationQuery ||
    prefillFromInspiration ||
    null;

  const formKey = prefill ? JSON.stringify(prefill) : "no-prefill";

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <CreatePostForm key={formKey} initialPrefill={prefill} />
      <WhyChooseUsUtility />
      <InpirationSectoin />
      <BannerInFilter />
      <div className="py-12 bg-[#F5F5F5]">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="md:text-4xl text-2xl font-semibold">
              Explore Our Premium Brands
            </h1>
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
      </div>
      <FindOutMore />
    </div>
  );
};

export default CreatePost;
