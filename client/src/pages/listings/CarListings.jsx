import React from "react";
import ListingHeroSection from "../../components/sections/listings/ListingHeroSection";
import BrowsByTypeSection from "../../components/sections/listings/BrowsByTypeSection";
import GetAllCarsSection from "../../components/sections/listings/GetAllCarsSection";
import NeedInspiration from "../../components/sections/listings/NeedInspiration";
import BlogSection from "../../components/sections/home/BlogSection";
import ExploreBrands from "../../components/sections/listings/ExploreBrands";
import PartnerOffersSection from "../../components/sections/listings/PartnerOffersSection";
import SEO from "../../components/common/SEO";

const CarListings = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Buy and Sell cars in Pakistan | Trusted Brands - Sello.pk"
        description="Buy and sell cars in Pakistan with Confidence. Explore premium brands, buy used cars, compare models and sell your car through trusted sellers on sello.pk"
        keywords="buy and sell cars, buy and sell cars in Pakistan"
        canonical="https://sello.pk/cars"
      />
      <ListingHeroSection />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <BrowsByTypeSection />
        <GetAllCarsSection />
        <NeedInspiration />
        <BlogSection />
        <ExploreBrands />
        <PartnerOffersSection />
      </div>
    </div>
  );
};

export default CarListings;
