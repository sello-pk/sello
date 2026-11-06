import React from "react";
import { Link } from "react-router-dom";
import listingHero from "../../../assets/images/listingHero.webp";
import listingHeroMobile from "../../../assets/images/listingHeroMobile.webp";

const ListingHeroSection = () => {
  return (
    <section className="sello-hero-shell relative w-full overflow-hidden min-h-[36vh] md:min-h-[40vh] bg-gray-200">
      <picture className="absolute inset-0 block h-full w-full">
        <source media="(min-width: 768px)" srcSet={listingHero} />
        <img
          src={listingHeroMobile}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchpriority="high"
          loading="eager"
          decoding="async"
          width="768"
          height="600"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/45 to-slate-900/20" />
      <div className="relative z-10 flex min-h-[36vh] md:min-h-[40vh] w-full items-end sm:items-center">
        <div className="w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="max-w-xl text-left">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-primary-400 mb-2">
              Vehicle marketplace
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight text-balance">
              Browse cars for sale in Pakistan
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/85 text-pretty max-w-md">
              Explore verified listings, then use Filters on the results to
              narrow by make, model, city and more.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href="#explore-vehicles"
                className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Explore vehicles
              </a>
              <Link
                to="/create-post"
                className="inline-flex items-center justify-center rounded-lg bg-white/95 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-white transition-colors"
              >
                Sell your car
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListingHeroSection;
