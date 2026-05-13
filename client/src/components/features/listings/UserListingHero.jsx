import React from "react";
import { useNavigate } from "react-router-dom";
import { images } from "../../../assets/assets";

const UserListingHero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative bg-[#050B20] md:h-[80vh] overflow-hidden min-w-0">
      <div className="max-w-8xl mx-auto w-full min-w-0 h-full pl-3 pr-3 sm:pl-4 sm:pr-4 md:pl-6 md:pr-6 lg:pl-8 lg:pr-8">
        <div className="h-full flex flex-col md:flex-row items-center min-w-0">
          {/* Left Side */}
          <div className="w-full min-w-0 md:w-[60%] py-10 md:py-0 md:pr-6 lg:pr-10">
            <div>
              <h1 className="md:text-5xl mb-16 text-3xl font-bold text-white">
                My Listings
              </h1>
              <p className="text-lg text-gray-300 my-4">
                Manage all your vehicle listings in one place. Track views, edit
                details, and monitor the performance of your posted cars.
              </p>
              <p className="text-lg text-gray-300 my-4">
                Whether you're selling multiple vehicles or just one, our
                dashboard gives you complete control over your listings with
                real-time updates and insights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center flex-wrap my-7 gap-3 sm:gap-5">
              <button
                onClick={() => navigate("/create-post")}
                className="px-6 w-full sm:w-48 py-3 rounded-lg border-[1px] flex items-center justify-center gap-3 bg-primary text-white border-transparent hover:bg-white hover:text-black transition-all ease-in"
              >
                Add New Listing
              </button>
              <button
                onClick={() => navigate("/cars")}
                className="px-6 w-full sm:w-48 py-3 rounded-lg border-[1px] flex items-center justify-center gap-3 border-black text-black hover:bg-primary hover:text-white transition-all ease-in bg-white"
              >
                Browse Cars
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

export default UserListingHero;
