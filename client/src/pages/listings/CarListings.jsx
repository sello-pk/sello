import React from "react";
import { ShieldCheck, SlidersHorizontal, MapPin } from "lucide-react";
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

      <header className="relative overflow-hidden border-b border-slate-200/80 bg-[#0B0C1E]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, rgba(255,138,0,0.35), transparent 42%), radial-gradient(circle at 88% 10%, rgba(56,189,248,0.18), transparent 36%), linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-12deg, transparent, transparent 10px, rgba(255,255,255,0.06) 10px, rgba(255,255,255,0.06) 11px)",
          }}
          aria-hidden
        />

        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
          <div className="flex flex-col gap-3 sm:gap-4 max-w-3xl">
            <p className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] text-primary-400">
              Sello listings
            </p>

            <h1 className="text-sm sm:text-base lg:text-lg font-semibold text-white leading-snug tracking-tight text-balance">
              Find the Best Cars for Sale in Pakistan with{" "}
              <span className="text-primary-400">Verified Listings</span> & Great
              Details
            </h1>

            <p className="text-xs sm:text-sm text-white/70 max-w-xl text-pretty leading-relaxed">
              Filter by make, model, city, and price — then contact sellers
              directly.
            </p>

            <ul className="mt-1 flex flex-wrap gap-2">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white/90">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                Verified listings
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white/90">
                <SlidersHorizontal className="h-3.5 w-3.5 text-sky-300 shrink-0" />
                Smart filters
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white/90">
                <MapPin className="h-3.5 w-3.5 text-primary-400 shrink-0" />
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
