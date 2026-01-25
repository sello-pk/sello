import React from "react";
import BlogsHeroSection from "../../components/sections/blogs/BlogsHeroSection";
import { GoArrowUpRight } from "react-icons/go";
import BrandMarquee from "../../components/BrandMarquee";
import { Link } from "react-router-dom";
import LatestBlogsSection from "../../components/sections/blogs/LatestBlogsSection";
import NewTechnology from "../../components/sections/blogs/NewTechnology";
import ReviewSliderBanner from "../../components/sections/blogs/ReviewSliderBanner";
import BottomReviews from "../../components/sections/blogs/BottomReviews";
import NewsLatter from "../../components/utils/NewsLatter";
import SEO from "../../components/common/SEO";

const Blog = () => {
  return (
    <div>
      <SEO
        title="Blog | Sello"
        description="Read our latest blog posts about cars, automotive news, buying guides, maintenance tips, and more."
      />
      <BlogsHeroSection />
      <div className="py-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className=" flex items-center justify-between w-full">
          <h2 className="md:text-3xl text-xl font-semibold">
            Explore Our Premium Brands
          </h2>
          <Link
            to={"/view-all-brands"}
            className="flex items-center gap-2 text-lg"
          >
            Show All Brands <GoArrowUpRight />{" "}
          </Link>
        </div>
        {/* BrandMarquee will fetch brands from admin categories automatically */}
        <BrandMarquee />
      </div>
      <LatestBlogsSection />
      {/* Blog Categories section (uses NewTechnology layout but shows dynamic categories) */}
      <NewTechnology />
      <ReviewSliderBanner />
      {/* <BottomReviews /> */}
      <NewsLatter />
    </div>
  );
};

export default Blog;
