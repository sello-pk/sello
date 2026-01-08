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
              className="break-inside-avoid overflow-hidden rounded-xl shadow-md"
            >
              <img
                src={item.image}
                alt={item.type}
                className="w-full h-auto rounded-xl"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GridCars;
