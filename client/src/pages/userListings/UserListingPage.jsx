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
    <div>
      <UserListingHero />
      <div className="py-5 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className=" flex items-center justify-between w-full">
          <h1 className="md:text-3xl text-xl font-semibold">
            Explore Our Premium Brands
          </h1>
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
      <UserListings />
      <BannerInUesrListings />
      <ReviewSectionInUser />
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 bg-[#F5F5F5]">
        <ContactMap />
      </div>
      <NewsLatter />
    </div>
  );
};

export default UserListingPage;
