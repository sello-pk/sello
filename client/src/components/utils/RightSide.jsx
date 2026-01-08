import React from "react";
import { images } from "../../assets/assets";
import { FaStar } from "react-icons/fa6";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { useNavigate } from "react-router-dom";
const RightSide = ({ rightPath, leftPath, text }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full h-full">
      <div
        style={{ backgroundImage: `url(${images.car1})` }}
        className="bg-cover bg-center h-full relative"
      >
        <div className="bottom-box bg-white/15 backdrop-blur-lg w-full  md:h-[39%] border-t-[1px] border-white px-4 py-1 md:px-6 md:py-4 absolute md:bottom-0 bottom-0">
          <p className="md:text-lg text-sm  text-gray-200">{text}</p>

          <div className="flex items-center justify-between py-2">
            <div className="">
              <h3 className="text-xl font-medium text-gray-200">Jim Bowden</h3>
              <span className="text-gray-200">UAE</span>
            </div>
            <div className="">
              <div className="flex  gap-2">
                {Array.from({ length: 4 }, (_, index) => (
                  <FaStar key={index} className="text-gray-200" />
                ))}
              </div>
              <div className="arrows flex my-3 gap-4">
                <button
                  onClick={() => navigate(leftPath)}
                  className="h-9 w-9 text-3xl text-white hover:bg-primary-500 transition-all ease-out rounded-full border-[1px] flex items-center justify-center border-white "
                >
                  <MdKeyboardArrowLeft />
                </button>
                <button
                  onClick={() => navigate(rightPath)}
                  className="h-9 w-9 text-3xl text-white hover:bg-primary-500 transition-all ease-out rounded-full border-[1px] flex items-center justify-center border-white "
                >
                  <MdKeyboardArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSide;
