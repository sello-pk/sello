import React from "react";
import { images } from "../../../assets/assets";
import { useNavigate } from "react-router-dom";
import { MdArrowOutward } from "react-icons/md";

const FindOutMore = () => {
  const navigate = useNavigate();

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-12">
      <div
        style={{ backgroundImage: `url(${images.findOutMore})` }}
        className="h-[80vh] bg-no-repeat bg-center bg-cover relative rounded-2xl overflow-hidden"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col text-center px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-6xl lg:text-7xl max-w-3xl text-white font-bold leading-tight">
            We Make Finding The Right Car Simple
          </h2>

          {/* Button */}
          <button
            onClick={() => navigate("/cars")}
            className="group my-7 flex items-center gap-3 border-2 border-white px-6 py-3 rounded-lg text-lg md:text-xl text-white font-medium transition-all duration-300 hover:bg-white hover:text-black"
          >
            Find Out More
            <MdArrowOutward
              className="transition-transform duration-300 group-hover:translate-x-2"
              size={24}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindOutMore;
