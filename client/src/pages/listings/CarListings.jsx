import { corePageSeo } from "../../utils/corePageSeo.js";
import React from "react";
import { ShieldCheck, SlidersHorizontal, MapPin } from "lucide-react";
import GetAllCarsSection from "../../components/sections/listings/GetAllCarsSection";
import NeedInspiration from "../../components/sections/listings/NeedInspiration";
import BlogSection from "../../components/sections/home/BlogSection";
import ExploreBrands from "../../components/sections/listings/ExploreBrands";
import PartnerOffersSection from "../../components/sections/listings/PartnerOffersSection";
import SEO from "../../components/common/SEO";
import { AdSenseSlot } from "../../components/ads";

import { images } from "../../assets/assets.js";

const CarListings = () => {
  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden">
      <SEO {...corePageSeo.listings} />

      <header
        className={`relative overflow-hidden border-b border-slate-200/80 md:h-[375px] `}
      >
        <div className="cover-image absolute">
          <img
            src={images.PakistanCarListingsBanner}
            alt="Pakistan Car Listings Banner"
          />
        </div>

        <div className="overlay inset-0 bg-[#050B20]/50 absolute"></div>

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-5xl">
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-primary-500">
              Sello listings
            </p>

            <h1 className="text-lg sm:text-xl lg:text-2xl md:text-2xl font-semibold text-white leading-snug tracking-tight text-balance pt-2.5">
              Find the Best Cars for Sale in Pakistan with{" "}
              <span className="text-primary-500">Verified Listings</span> &
              Great Details
            </h1>

            <p className="text-xs sm:text-xl text-gray-100 max-w-3xl text-pretty leading-relaxed">
              Filter by make, model, city, and price — then contact sellers
              directly.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                Verified listings
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white">
                <SlidersHorizontal className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                Smart filters
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white">
                <MapPin className="h-3.5 w-3.5 text-white shrink-0" />
                Cities nationwide
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
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
