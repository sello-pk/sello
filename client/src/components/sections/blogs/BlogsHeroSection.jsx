import React from "react";
import { images } from "../../../assets/assets";
import { LuArrowUpRight } from "react-icons/lu";

const BlogsHeroSection = () => {
  return (
    <div className="md:h-[80vh] bg-[#272525] flex flex-col md:flex-row items-center justify-between">
      {/* Left Side */}
      <div className="w-full md:w-[60%]  px-3 sm:px-4 md:px-6 lg:px-8 py-10 md:py-0 ">
        <div className="">
          <h1 className="md:text-5xl mb-16 text-3xl font-bold text-white">
            Your Journey Your Car Your Way
          </h1>
          <p className="text-lg text-gray-100">
            We are a platform that connects you with the right car for you.
            Whether you are looking for a new car or a used car, we have the
            perfect car for you. We are a platform that connects you with the
            right car for you. Whether you are looking for a new car or a used
            car, we have the perfect car for you. We are a platform that
            connects you with the right car for you. Whether you are looking for
            a new car or a used car, we have the perfect car for you.
          </p>
        </div>
        <div className="flex items-center flex-start my-7 gap-5">
          <button className="px-6 py-3 rounded-lg border-[1px] flex items-center gap-3 bg-black text-white border-transparent hover:bg-white hover:text-black transition-all ease-in ">
            Add Post
            <LuArrowUpRight size={20} />
          </button>
          <button className="px-6 py-3 rounded-lg border-[1px] flex items-center gap-3 border-black text-black hover:bg-black hover:text-white transition-all ease-in bg-white">
            Contact <LuArrowUpRight size={20} />
          </button>
        </div>
      </div>
      {/* Right Side */}
      <div className="w-full md:w-[40%] h-64 md:h-full">
        <img
          src={images.userHeroSectionImg}
          alt="userHero section image"
          className="h-full rounded-bl-[155px] w-full object-cover"
        />
      </div>
    </div>
  );
};

export default BlogsHeroSection;
