import React from "react";
import { blogAssets } from "../../../assets/blogs/blogAssets";

const BottomReviews = () => {
  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-12">
      {/* Review 1 */}
      <div className="flex flex-col md:flex-row p-5 w-full gap-6 md:gap-10">
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <img
            src={blogAssets.bottomRevCar}
            className="w-full h-[250px] md:h-[80%] object-cover rounded-lg"
            alt="Car Review"
          />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h2 className="capitalize text-2xl md:text-4xl font-semibold mb-4 md:mb-5 leading-snug">
            A Review Of cars with advanced infotainment systems
          </h2>

          <div className="flex items-center gap-3 my-5">
            <img
              src={blogAssets.person}
              alt="customer"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <span className="font-medium">Dasteen</span>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>Jan 10 2025</span> • <span>5 min read</span>
              </div>
            </div>
          </div>

          <p className="my-6 md:my-10 text-base md:text-lg text-gray-700 pr-0 md:pr-10">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat
            dolore incidunt nulla, rem totam corporis facilis sed culpa natus
            laborum nesciunt rerum quae, ullam laboriosam. Quae, veritatis
            illum. Recusandae atque quos distinctio? Nostrum dolores, deserunt
            sed praesentium ducimus nobis aliquam. Lorem ipsum dolor sit amet
            consectetur adipisicing elit. Doloribus, magnam.
          </p>
          <button className="w-max px-6 md:px-8 py-2 md:py-2.5 rounded-lg text-white bg-primary-500 hover:opacity-90 transition mt-8">
            Read full article...
          </button>
        </div>
      </div>

      {/* Review 2 */}
      <div className="flex flex-col md:flex-row p-5 w-full gap-6 md:gap-10">
        {/* Image Section */}
        <div className="w-full md:w-1/2">
          <img
            src={blogAssets.bottomRevCar2}
            className="w-full h-[250px] md:h-[80%] object-cover rounded-lg"
            alt="Car Review"
          />
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 flex flex-col">
          <h2 className="capitalize text-2xl md:text-4xl font-semibold mb-4 md:mb-5 leading-snug">
            A Review Of cars with advanced infotainment systems
          </h2>

          <div className="flex items-center gap-3 my-5">
            <img
              src={blogAssets.person}
              alt="customer"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <span className="font-medium">Dasteen</span>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span>Jan 10 2025</span> • <span>5 min read</span>
              </div>
            </div>
          </div>

          <p className="my-6 md:my-10 text-base md:text-lg text-gray-700 pr-0 md:pr-10">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat
            dolore incidunt nulla, rem totam corporis facilis sed culpa natus
            laborum nesciunt rerum quae, ullam laboriosam. Quae, veritatis
            illum. Recusandae atque quos distinctio?
          </p>

          <button className="w-max px-6 md:px-8 py-2 md:py-2.5 rounded-lg text-white bg-primary-500 hover:opacity-90 transition">
            Read full article...
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomReviews;
