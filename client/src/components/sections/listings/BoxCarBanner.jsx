import React from "react";
import { boxCarsReviewImages } from "../../../assets/assets";

const BoxCarBanner = () => {
  return (
    <section className="py-12 bg-[#F5F5F5]">
      <div className="bg-primary-500 w-full px-4 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-8   ">
        {/* Text Content */}
        <div className="md:w-1/2 w-full">
          <h1 className="text-2xl md:text-4xl font-semibold mb-2">
            Who is BoxCar
          </h1>
          <p className="text-sm md:text-base leading-relaxed">
            BoxCar is a smart car marketplace offering trusted listings of new,
            used, and in-stock vehicles—making car buying simple and
            hassle-free.
          </p>
        </div>

        {/* Images */}
        <div className="flex flex-wrap justify-center gap-4 md:w-1/2 w-full">
          {boxCarsReviewImages.map((image, index) => (
            <div
              key={index}
              className="w-[90%] h-[90%] md:w-52 md:h-48 sm:w-28 sm:h-28"
            >
              <img
                src={image.image}
                alt="BoxCar"
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoxCarBanner;
