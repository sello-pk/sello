import React from "react";
import { filterGridCars } from "../../../assets/images/carDetails/types/bodyTypes";

const GridCars = () => {
  return (
    <div className="my-3">
      {/* Masonry layout using CSS columns */}
      <div className="columns-1 md:columns-2 gap-8 space-y-8">
        {filterGridCars.map((item) => {
          return (
            <div
              key={item.id}
              className="break-inside-avoid overflow-hidden rounded-xl shadow-md relative w-full aspect-[4/3] bg-gray-100"
            >
              <img
                src={item.image}
                alt=""
                width="1200"
                height="900"
                loading="lazy"
                decoding="async"
                className="h-full w-full rounded-xl object-cover"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GridCars;
