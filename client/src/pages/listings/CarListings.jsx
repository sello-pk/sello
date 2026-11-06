import React from "react";
import GetAllCarsSection from "../../components/sections/listings/GetAllCarsSection";
import NeedInspiration from "../../components/sections/listings/NeedInspiration";
import BlogSection from "../../components/sections/home/BlogSection";
import ExploreBrands from "../../components/sections/listings/ExploreBrands";
import PartnerOffersSection from "../../components/sections/listings/PartnerOffersSection";
import SEO from "../../components/common/SEO";
import { AdSenseSlot } from "../../components/ads";

const LISTINGS_SEO = {
  title: "Cars for Sale in Pakistan | Browse Used & New Cars – Sello.pk",
  description:
    "Browse cars for sale in Pakistan on Sello.pk. Filter used and new cars by make, model, city, and price, then connect with trusted sellers nationwide.",
  keywords:
    "cars for sale in Pakistan, used cars Pakistan, new cars for sale, buy cars online, sell car Pakistan, car listings Pakistan, Sello.pk",
  canonical: "https://sello.pk/listings",
};

const CarListings = () => {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden">
      <SEO
        title={LISTINGS_SEO.title}
        description={LISTINGS_SEO.description}
        keywords={LISTINGS_SEO.keywords}
        canonical={LISTINGS_SEO.canonical}
      />
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0 pt-8 sm:pt-10">
        <header className="mb-2 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B0C1E] leading-tight text-balance">
            Cars for Sale in Pakistan
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-3xl text-pretty">
            Browse used and new car listings across Pakistan. Use filters to
            narrow by make, model, city, and price, then contact sellers on
            Sello.pk.
          </p>
        </header>
        <GetAllCarsSection />
        <AdSenseSlot slot="listingFeed" />
        <NeedInspiration />
        <BlogSection />
        <ExploreBrands />
        <PartnerOffersSection />
      </div>
    </div>
  );
};

export default CarListings;
