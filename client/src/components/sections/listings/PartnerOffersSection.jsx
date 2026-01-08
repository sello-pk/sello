import React from "react";
import { Link } from "react-router-dom";
import { images } from "../../../assets/assets";
import { FaArrowRight } from "react-icons/fa6";

const PartnerOffersSection = () => {
  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-12 bg-white">
      {/* Exclusive Partner Offers */}
      <div className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          Exclusive partner offers for you:
        </h2>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {["https://amingarage.com", "https://wbdigitech.ae"].map(
            (link, index) => {
              return (
                <div
                  className="relative group border-2 border-gray-100 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 hover:border-primary hover:rotate-1 cursor-pointer"
                  key={link}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Link
                    to={link}
                    className="inline-block w-[140px] h-[90px] relative overflow-hidden"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={
                          index === 0
                            ? images.amingarageLogo
                            : images.wbDigitalLogo
                        }
                        alt="Partner Logo"
                        className="w-full h-full object-contain p-4 transition-all duration-500 group-hover:scale-125 group-hover:brightness-110 filter drop-shadow-sm"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="bg-primary text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                        Visit Partner
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                  </Link>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Partner Benefits Section */}
      <div className="mb-12">
        <div className="bg-gradient-to-r from-primary-100 via-primary-200 to-primary-100 rounded-3xl p-8 border border-primary/20">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Exclusive Offers */}
            <div className="group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                    Exclusive Partner Offers for You
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Enjoy our partner's exclusive deals and benefits. At
                    Sello.ae and Amin Garage, we present you with special offers
                    which add value to your car buying and ownership experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Expert Advice */}
            <div className="group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-6 h-6 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-300">
                    Expert Advice You Can Trust
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Get expert points of view, industry tips from leaders in the
                    field which also include features on top platforms, media
                    outlets and automotive forums.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-primary">
              <div className="w-8 h-0.5 bg-primary rounded-full"></div>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="w-8 h-0.5 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Sell Your Car Section */}
      <div>
        <div className="btn w-full items-center justify-center">
          <button className="px-6 py-2 flex items-center text-lg font-semibold hover:opacity-90 gap-2 bg-primary rounded mx-auto">
            <img src={images.electricSvg3} alt="electricSvg" className="h-14" />
            Sell your car <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerOffersSection;
