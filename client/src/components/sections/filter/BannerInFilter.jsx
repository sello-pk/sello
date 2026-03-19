import React from "react";
import { useLocation, Link } from "react-router-dom";
import createPost from "../../../assets/createPost.gif";
import { MdArrowOutward } from "react-icons/md";

const BannerInFilter = ({ skipOuterGutter = false }) => {
  const location = useLocation();
  const isCreatePostPage = location.pathname === "/create-post";

  const inner = (
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8 py-6 px-5 sm:px-6 md:px-8 bg-[#F5F5F5] rounded-xl md:rounded-2xl text-gray-900 border border-gray-200/80">
        {/* Left: Content + Buttons */}
        <div className="flex-1 min-w-0 flex flex-col items-start text-left max-w-xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight text-gray-900">
            Sell Your Car in Just a Few Steps
          </h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600 md:text-gray-700 leading-relaxed">
            Posting your car on Sello.pk is fast and simple. Upload photos, add
            details, and publish your listing in minutes.
          </p>
          <div className="mt-4 sm:mt-5 flex flex-wrap gap-3">
            {!isCreatePostPage && (
              <Link
                to="/create-post"
                className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg bg-primary-500 text-white font-medium text-sm sm:text-base hover:opacity-90 transition-opacity"
              >
                Post your car
                <MdArrowOutward className="w-4 h-4 shrink-0" />
              </Link>
            )}
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-medium text-sm sm:text-base hover:border-primary-500 hover:text-primary-500 transition-colors"
            >
              Browse listings
              <MdArrowOutward className="w-4 h-4 shrink-0" />
            </Link>
          </div>
        </div>

        {/* Image - gap from right edge via banner padding */}
        <div className="flex-shrink-0 flex justify-center md:justify-end">
          <div className="w-[180px] h-[280px] sm:w-[200px] sm:h-[320px] md:w-[220px] md:h-[360px] lg:w-[240px] lg:h-[400px]">
            <img
              src={createPost}
              alt="Create listing preview"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
        </div>
      </div>
  );

  return (
    <div className="my-8 md:my-10 w-full overflow-hidden">
      {skipOuterGutter ? (
        inner
      ) : (
        <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
          {inner}
        </div>
      )}
    </div>
  );
};

export default BannerInFilter;
