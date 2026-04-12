import React, { useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/sections/home/Hero";
import HowAuctionsWork from "../components/auction/HowAuctionsWork";
import BrandsSection from "../components/sections/home/BrandsSection";
import FeaturedCarsCarousel from "../components/sections/home/FeaturedCarsCarousel";
import NewsLatter from "../components/utils/NewsLatter";
import BuySellCards from "../components/utils/BuySellCards";
import BannerCarousal from "../components/utils/BannerCarousal";
import SEO from "../components/common/SEO";
import StructuredData from "../components/common/StructuredData";
import RecentlyViewedCars from "../components/sections/home/RecentlyViewedCars";

// Lazy load non-critical components
const CustomerReview = React.lazy(() => import("../components/sections/home/CustomerReview"));
const BlogSection = React.lazy(() => import("../components/sections/home/BlogSection"));
const Video = React.lazy(() => import("../components/sections/home/Video"));

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Ensure we scroll to top when Home component renders
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="">
      <SEO
        title="Car for Sale in Pakistan | Buy & Sell Used Cars – Sello.pk"
        description="Find the best car for sale in Pakistan on Sello.pk. Buy or sell used cars in Karachi, Lahore, Islamabad & beyond with verified sellers and fair pricing."
        keywords="cars for sale, cars for sale in Pakistan"
        canonical="https://sello.pk/"
      />
      {/* Structured Data for SEO */}
      <StructuredData.OrganizationSchema />
      <StructuredData.WebSiteSchema />
      <div className="">
        <Hero />
        <BrandsSection />
        <Suspense fallback={<div style={{height: "400px"}} className="bg-gray-100 animate-pulse rounded-lg" />}>
          <Video />
        </Suspense>
        <BannerCarousal />
        <FeaturedCarsCarousel />
        <HowAuctionsWork />
        <Suspense fallback={<div style={{height: "400px"}} className="bg-gray-100 animate-pulse rounded-lg" />}>
          <CustomerReview key="customer-review" />
        </Suspense>
        <Suspense fallback={<div style={{height: "500px"}} className="bg-gray-100 animate-pulse rounded-lg" />}>
          <BlogSection />
        </Suspense>
        <BuySellCards />
        <RecentlyViewedCars />
        <NewsLatter />
      </div>
    </div>
  );
};

export default Home;
