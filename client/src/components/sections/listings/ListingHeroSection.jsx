import React from "react";
import HeroFilter from "../../utils/HeroFilter";

const ListingHeroSection = () => {
  return (
    <div className="bg-gray-200 w-full flex items-center gap-5 py-5 flex-col relative overflow-hidden">
      <div className="w-full">
        <div className=" md:h-[40vh] h-[80vh] relative w-full mx-auto flex items-center justify-center">
          <HeroFilter />
        </div>
      </div>
    </div>
  );
};

export default ListingHeroSection;
