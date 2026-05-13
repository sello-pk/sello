import UserListingHero from "../../components/features/listings/UserListingHero";
import BrandMarquee from "../../components/BrandMarquee";
import { Link } from "react-router-dom";
import { GoArrowUpRight } from "react-icons/go";
import UserListings from "../../components/features/listings/UsreListings";
import BannerInUesrListings from "../../components/features/listings/BannerInUesrListings";
import ReviewSectionInUser from "../../components/features/listings/ReviewSectionInUser";
import ContactMap from "../../components/features/listings/ContactMap";
import NewsLatter from "../../components/utils/NewsLatter";
import CustomerReview from "../../components/sections/home/CustomerReview";

const UserListingPage = () => {
  return (
    <div className="bg-gray-100 min-w-0">
      <UserListingHero />

      {/* Constrained Width Sections - Like Header */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full min-w-0">
          <h1 className="md:text-3xl text-xl font-semibold min-w-0">
            Explore Our Premium Brands
          </h1>
          <Link
            to={"/view-all-brands"}
            className="flex items-center gap-2 text-lg shrink-0"
          >
            Show All Brands <GoArrowUpRight />
          </Link>
        </div>
        {/* BrandMarquee will fetch brands from admin categories automatically */}
        <div className="mt-8">
          <BrandMarquee />
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
        <UserListings />
      </div>

      {/* Full Width Sections */}
      <div className="w-full">
        <BannerInUesrListings />
      </div>

      <CustomerReview key="customer-review" />

      <div className="w-full">
        <ContactMap />
      </div>

      <NewsLatter />
    </div>
  );
};

export default UserListingPage;
