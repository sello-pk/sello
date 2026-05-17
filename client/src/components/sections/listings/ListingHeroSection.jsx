import React from "react";
import HeroFilter from "../../utils/HeroFilter";
import listingHero from "../../../assets/images/listingHero.png";
import listingHeroMobile from "../../../assets/images/listingHeroMobile.webp";

const ListingHeroSection = () => {
  return (
    <section className="sello-hero-shell relative w-full overflow-hidden min-h-[48vh] md:h-[48vh] bg-gray-200">
      <picture className="absolute inset-0 block h-full w-full">
        <source media="(min-width: 768px)" srcSet={listingHero} />
        <img
          src={listingHeroMobile}
          alt="listing hero image"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          width="768"
          height="600"
        />
      </picture>
      <div className="absolute inset-0 bg-slate-900/70" />
      <div className="relative z-10 flex min-h-[48vh] md:h-[48vh] w-full items-center justify-center py-6 sm:py-8 md:py-10">
        <div className="w-full">
          <HeroFilter />
        </div>
      </div>
    </section>
  );
};

export default ListingHeroSection;
