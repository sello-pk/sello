import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/sections/home/Hero";
import BrandsSection from "../components/sections/home/BrandsSection";
import FeaturedCarsCarousel from "../components/sections/home/FeaturedCarsCarousel";
import CustomerReview from "../components/sections/home/CustomerReview";
import BlogSection from "../components/sections/home/BlogSection";
import NewsLatter from "../components/utils/NewsLatter";
import BuySellCards from "../components/utils/BuySellCards";
import GetAllCarsSection from "../components/sections/listings/GetAllCarsSection";
import BannerCarousal from "../components/utils/BannerCarousal";
import SEO from "../components/common/SEO";
import StructuredData from "../components/common/StructuredData";
import Video from "../components/sections/home/Video";
import MainHeading from "../components/sections/home/MainHeading";

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
        <MainHeading />
        <Hero />
        <BrandsSection />
        <Video />
        <BannerCarousal />
        <FeaturedCarsCarousel />
        <GetAllCarsSection />
        <CustomerReview key="customer-review" />
        <BlogSection />
        <BuySellCards />
        <NewsLatter />
      </div>
    </div>
  );
};



export default Home;
