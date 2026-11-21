import React from "react";
import { FaCheck } from "react-icons/fa6";
import { images } from "../../../assets/assets";

const Video = () => {
  return (
    <div className="max-w-8xl mx-auto py-8 md:py-16">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 mx-auto flex flex-col lg:flex-row lg:items-stretch gap-10">
        {/* Image: stretches to match the text height on desktop */}
        <div className="video relative w-full lg:w-[40%] aspect-[16/10] lg:aspect-auto lg:min-h-[22rem] border-2 border-primary/70 rounded overflow-hidden">
          <img
            src={images.selloVideo}
            alt="A Smarter Way to Sell Your Car with Sello"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <div className="content w-full lg:w-[60%]">
          <h2 className="md:text-4xl text-3xl font-semibold max-w-4xl pb-5">
            A Smarter Way to Sell Your Car in Pakistan
          </h2>
          <p className="py-4 text-gray-600">
            In Pakistan if you are looking to put your car for sale or reach out
            to the buyers that are actively in the market for a used car, we
            connect you with true buying prospects from across the nation. We
            have designed our platform to get a fair price for your car quickly
            and in a transparent way.
          </p>
          <ul>
            {[
              "Post your car for sale in Karachi, Islamabad, Lahore, Okara and outlying areas.",
              "Reach out to a large audience of car buyers which includes both new and used cars for sale in Pakistan.",
              "Get quick inspections at great prices and also have transparent and reliable valuations.",
            ].map((list, index) => (
              <li key={index} className="flex items-center gap-2 my-2">
                <FaCheck className="md:w-7 w-5 md:h-7 h-5 shrink-0 rounded-full bg-white text-green-400 p-1 shadow-md" />
                {list}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Video;
