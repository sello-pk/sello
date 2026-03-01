import { useNavigate } from "react-router-dom";
import { images } from "../../../assets/assets";

const AboutHeroSection = () => {
  const navigate = useNavigate();
  return (
    <section className="relative bg-[#272525] md:h-[80vh] overflow-hidden">
      <div className="max-w-8xl mx-auto w-full h-full pl-3 pr-3 sm:pl-4 sm:pr-4 md:pl-6 md:pr-6 lg:pl-8 lg:pr-8">
        <div className="h-full flex flex-col md:flex-row items-center">
          {/* Left Side */}
          <div className="w-full md:w-[60%] py-10 md:py-0 md:pr-6 lg:pr-10">
            <div>
              <h1 className="md:text-5xl mb-16 text-3xl font-bold text-white">
                About Us
              </h1>
              <p className="text-lg text-gray-300 my-4">
                Sello has created a platform which makes it easy for Pakistan to
                buy and sell cars. We aim to present a very trusted and
                transparent online marketplace in which to find your perfect car
                or to sell the one you have.
              </p>
              <p className="text-lg text-gray-300 my-4">
                As for used cars in Pakistan that you’re looking to purchase or
                new vehicles you’re in the market for, at Sello we connect you
                with the seller through our verified listings and transparent
                info. We at Sello focus on fair prices, in depth car info, and
                user friendly tools which in turn helps our customers make sure
                footed decisions free from stress and sales pressure.
              </p>
            </div>
            <div className="flex items-center flex-wrap my-7 gap-5">
              <button
                onClick={() => navigate("/create-post")}
                className="px-6 w-48 py-3 rounded-lg border-[1px] flex items-center justify-center gap-3 bg-black text-white border-transparent hover:bg-white hover:text-black transition-all ease-in"
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

        </div>
      </div>

      {/* Right Side - hard pinned to right edge */}
      <div className="w-full h-64 md:absolute md:top-0 md:right-0 md:h-full md:w-[40%]">
        <img
          src={images.userHeroSectionImg}
          alt="userHero section image"
          className="h-full rounded-bl-[155px] w-full object-cover"
        />
      </div>
    </section>
  );
};

export default AboutHeroSection;
