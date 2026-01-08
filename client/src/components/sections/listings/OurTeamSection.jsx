import React from "react";
import { ourTeams } from "../../../assets/assets";

const OurTeamSection = () => {
  return (
    <section className="px-4 md:px-16 py-12 bg-[#F5F5F5]">
      <h1 className="md:text-4xl text-2xl font-medium mb-8">Our Team</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {ourTeams.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-center  text-center bg-white"
          >
            <h2 className="text-lg font-medium py-1">{item.name}</h2>
            <p className="text-sm text-gray-600 py-1">{item.role}</p>
            <div className="md:w-52 md:h-80 mb-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurTeamSection;
