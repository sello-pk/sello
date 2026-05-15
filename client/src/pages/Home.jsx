import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/sections/home/Hero";
import NewsLatter from "../components/utils/NewsLatter";
import BuySellCards from "../components/utils/BuySellCards";
import SEO from "../components/common/SEO";
import StructuredData from "../components/common/StructuredData";
import RecentlyViewedCars from "../components/sections/home/RecentlyViewedCars";
import BrandsSection from "../components/sections/home/BrandsSection.jsx";
import Video from "../components/sections/home/Video.jsx";
import FeaturedCarsCarousel from "../components/sections/home/FeaturedCarsCarousel.jsx";
import BannerCarousal from "../components/utils/BannerCarousal.jsx";
import HowAuctionsWork from "../components/auction/HowAuctionsWork.jsx";
import CustomerReview from "../components/sections/home/CustomerReview.jsx";
import BlogSection from "../components/sections/home/BlogSection.jsx";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Ensure we scroll to top when Home component renders
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <SEO
        title="Car for Sale in Pakistan | Buy & Sell Used Cars – Sello.pk"
        description="Find the best car for sale in Pakistan on Sello.pk. Buy or sell used cars in Karachi, Lahore, Islamabad & beyond with verified sellers and fair pricing."
        keywords="cars for sale, cars for sale in Pakistan"
        canonical="https://sello.pk/"
      />
      {/* Structured Data for SEO */}
      <StructuredData.OrganizationSchema />
      <StructuredData.WebSiteSchema />
      <div className="w-full min-w-0">
        <Hero />
        <BrandsSection />
        <Video />
        <BannerCarousal />
        <FeaturedCarsCarousel />
        <HowAuctionsWork />
        <CustomerReview key="customer-review" />
        <BlogSection />
        <BuySellCards />
        <RecentlyViewedCars />
        <NewsLatter />
      </div>
    </div>
  );
};

export default Home;
