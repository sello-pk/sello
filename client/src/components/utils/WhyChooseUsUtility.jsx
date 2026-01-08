import React from "react";
import { whyUs } from "../../assets/assets";

const WhyChooseUsUtility = () => {
  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 bg-[#F5F5F5]">
      {" "}
      <h2 className="text-2xl md:text-3xl font-semibold my-6 text-center md:text-left">
        Why Choose Us
      </h2>
      <div className="flex flex-col md:flex-row md:gap-10 gap-6">
        {whyUs.whyChooseUs.map((item, index) => (
          <div key={index} className="flex-1 text-center md:text-left">
            <img
              src={item.image}
              alt={item.title}
              className="w-12 mx-auto md:mx-0 my-2"
            />
            {/* <h4 className="text-xl font-semibold py-2">{item.title}</h4> */}
            <p className="text-sm text-gray-700">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUsUtility;
