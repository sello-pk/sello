

import React from "react";
import { profileAssets } from "../../../assets/profilePageAssets/profileAssets";
import { GoArrowUpRight } from "react-icons/go";

const ReachUsSection = () => {
  return (
    <div className="md:h-[90vh] w-full flex items-center justify-center px-4">
      <div className="md:w-[90%] h-auto md:h-[80%] bg-[#FFFFFF] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-14 rounded-xl shadow-sm">
        {/* Left Image Section */}
        <div className="w-full md:w-[45%]">
          <img
            src={profileAssets.girlImage}
            className="h-[250px] md:h-full w-full object-cover rounded-xl"
            alt="girl image"
          />
        </div>

        {/* Right Content Section */}
        <div className="w-full md:w-[55%] text-center md:text-left">
          <h2 className="text-2xl md:text-3xl my-6 md:my-10 font-semibold leading-snug">
            Have More Questions? Don&apos;t <br className="hidden md:block" />
            Hesitate To Reach Us
          </h2>

          <p className="text-gray-700 text-sm md:text-base">
            123 Queensberry Street, North <br className="hidden md:block" />
            Melborun VIC3051, Australia
          </p>

          {/* Contact Buttons */}
          <div className="my-8 md:my-10 w-full md:w-[65%] flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
            <div className="flex items-center gap-3 border-[1px] border-black px-5 py-2 cursor-pointer rounded-full">
              <img
                src={profileAssets.phoneIcon}
                alt="phone"
                className="w-5 h-5"
              />
              <p className="text-sm md:text-base">+971524847862</p>
            </div>
            <div className="flex items-center gap-3 border-[1px] border-black px-5 py-2 cursor-pointer rounded-full">
              <img
                src={profileAssets.mailIcon}
                alt="mail"
                className="w-5 h-5"
              />
              <p className="text-sm md:text-base">info@sello.com</p>
            </div>
          </div>

          {/* CTA Button */}
          <button className="flex items-center justify-center gap-3 border-[1px] border-black rounded-xl px-5 py-3 my-4 text-white bg-black w-full sm:w-auto">
            Get Started <GoArrowUpRight className="text-xl md:text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReachUsSection;
