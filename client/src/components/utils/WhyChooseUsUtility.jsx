import React from "react";
import { whyUs } from "../../assets/assets";

const WhyChooseUsUtility = () => {
  return (
    <div className="bg-gray-50 relative overflow-hidden">
      <div className="relative bg-white py-16 md:py-20 w-full rounded-tl-[60px] md:rounded-tl-[80px] shadow-lg border border-gray-100">
        <div className="max-w-8xl mx-auto w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <div className="inline-block mb-4">
              <span className="text-primary-500 font-bold text-xs md:text-sm uppercase tracking-widest px-4 py-2 bg-primary-100 rounded-full">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
              Trusted for Better Car Deals
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              A simple, transparent experience for buyers and sellers across Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {whyUs.whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-lg border border-gray-100 hover:border-primary-200 hover:shadow-2xl transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/60 to-transparent rounded-2xl md:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-5 mx-auto md:mx-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-8 h-8 object-contain"
                    />
                  </div>

                  <h3 className="text-sm md:text-base font-bold text-primary-500 tracking-wide uppercase text-center md:text-left">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-gray-600 font-medium leading-relaxed text-center md:text-left">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUsUtility;
