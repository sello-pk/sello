import React from "react";
import UserListingHero from "../../components/features/listings/UserListingHero";
import BrandMarquee from "../../components/BrandMarquee";
import { Link } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import UserListings from "../../components/features/listings/UsreListings";
import BannerInUesrListings from "../../components/features/listings/BannerInUesrListings";
import ReviewSectionInUser from "../../components/features/listings/ReviewSectionInUser";
import ContactMap from "../../components/features/listings/ContactMap";
import NewsLatter from "../../components/utils/NewsLatter";

const UserListingPage = () => {
  return (
    <div className="bg-gray-100">
      <UserListingHero />

      {/* Constrained Width Sections - Like Header */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between w-full">
          <h1 className="md:text-3xl text-xl font-semibold">
            Explore Our Premium Brands
          </h1>
          <Link
            to={"/view-all-brands"}
            className="flex items-center gap-2 text-lg"
          >
            Show All Brands <GoArrowUpRight />
          </Link>
        </div>
        {/* BrandMarquee will fetch brands from admin categories automatically */}
        <div className="mt-8">
          <BrandMarquee />
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserListings />
      </div>

      {/* Full Width Sections */}
      <div className="w-full">
        <BannerInUesrListings />
      </div>

      <ReviewSectionInUser />

      <div className="w-full">
        <ContactMap />
      </div>

      <NewsLatter />
    </div>
  );
};

export default UserListingPage;
