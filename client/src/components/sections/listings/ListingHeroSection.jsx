import React from "react";
import HeroFilter from "../../utils/HeroFilter";
import listingHero from "../../../assets/images/listingHero.png";

const ListingHeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden md:min-h-[50vh]">
      <img
        src={listingHero}
        alt="listing hero image"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-900/70" />
      <div className="relative z-10 flex min-h-[50vh] w-full items-center justify-center py-8 sm:py-10 md:py-14">
        <div className="w-full">
          <HeroFilter />
        </div>
      </div>
    </section>
  );
};

export default ListingHeroSection;
