import React from "react";
import { images } from "../../../assets/assets";
import { LuArrowUpRight } from "react-icons/lu";
import { useNavigate } from "react-router-dom";

const BlogsHeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#050B20] md:h-[80vh] overflow-hidden min-h-[20rem] md:min-h-0">
      <div className="max-w-8xl mx-auto w-full h-full pl-3 pr-3 sm:pl-4 sm:pr-4 md:pl-6 md:pr-6 lg:pl-8 lg:pr-8">
        <div className="h-full flex flex-col md:flex-row items-center">
          {/* Left Side */}
          <div className="w-full md:w-[60%] py-10 md:py-0 md:pr-6 lg:pr-10">
            <div>
              <h1 className="md:text-5xl mb-16 text-3xl font-bold text-white">
                Insights, Reviews & Automotive Updates
              </h1>
              <p className="text-lg text-gray-300 my-4">
                Explore practical car buying guides, ownership tips, industry
                trends, and expert comparisons crafted for drivers across
                Pakistan.
              </p>
              <p className="text-lg text-gray-300 my-4">
                From understanding total ownership costs to choosing the right
                model for your needs, our blog helps you make informed decisions
                with confidence.
              </p>
            </div>
            <div className="flex items-center flex-wrap my-7 gap-5">
              <button
                onClick={() => navigate("/blog/all")}
                className="px-6 w-48 py-3 rounded-lg border-[1px] flex items-center justify-center gap-3 bg-primary text-white border-transparent hover:bg-white hover:text-black transition-all ease-in"
              >
                Browse Blogs
                <LuArrowUpRight size={20} />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="px-6 w-48 py-3 rounded-lg border-[1px] flex items-center justify-center gap-3 border-black text-black hover:bg-primary hover:text-white transition-all ease-in bg-white"
              >
                Contact
                <LuArrowUpRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - hard pinned to right edge */}
      <div className="w-full h-64 md:absolute md:top-0 md:right-0 md:h-full md:w-[40%] bg-gray-800 shrink-0">
        <img
          src={images.userHeroSectionImg}
          alt="Blog hero section image"
          width="960"
          height="720"
          fetchPriority="high"
          decoding="async"
          className="h-full rounded-bl-[155px] w-full object-cover"
        />
      </div>
    </section>
  );
};

export default BlogsHeroSection;
