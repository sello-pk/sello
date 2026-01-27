import { useNavigate } from "react-router-dom";
import { images } from "../../../assets/assets";

const AboutHeroSection = () => {
  const navigate = useNavigate();
  return (
    <div className="md:h-[80vh] bg-[#272525] flex flex-col md:flex-row items-center justify-between">
      {/* Left Side */}
      <div className="w-full md:w-[60%]  px-3 sm:px-4 md:px-6 lg:px-8 py-10 md:py-0 ">
        <div className="">
          <h1 className="md:text-5xl mb-16 text-3xl font-bold text-white">
            About Us
          </h1>
          <p className="text-lg text-gray-300 my-4">
            Sello has created a platform which makes it easy for Pakistan to buy
            and sell cars. We aim to present a very trusted and transparent
            online marketplace in which to find your perfect car or to sell the
            one you have.
          </p>
          <p className="text-lg text-gray-300 my-4">
            As for used cars in Pakistan that you’re looking to purchase or new
            vehicles you’re in the market for, at Sello we connect you with the
            seller through our verified listings and transparent info. We at
            Sello focus on fair prices, in depth car info, and user friendly
            tools which in turn helps our customers make sure footed decisions
            free from stress and sales pressure.
          </p>
        </div>
        <div className="flex items-center flex-start my-7 gap-5">
          <button
            onClick={() => navigate("/create-post")}
            className="px-6 w-48 py-3 rounded-lg border-[1px] flex items-center justify-center gap-3 bg-black text-white border-transparent hover:bg-white hover:text-black transition-all ease-in "
          >
            Sale Your Car
          </button>
          <button
            onClick={() => navigate("/cars")}
            className="px-6 w-48 py-3 rounded-lg border-[1px] flex items-center justify-center gap-3 border-black text-black hover:bg-black hover:text-white transition-all ease-in bg-white"
          >
            Find Your Next Car
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

export default AboutHeroSection;
