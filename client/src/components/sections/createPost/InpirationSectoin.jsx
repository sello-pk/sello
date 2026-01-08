import React from "react";

const InpirationSectoin = () => {
  const inspiration = [
    "Automatics Cars",
    "SUVs",
    "Electric Cars",
    "New in Stock",
    "Petrol",
    "Diesel",
  ];
  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 bg-[#F5F5F5]">
      <h1 className="md:text-4xl text-2xl font-medium">
        Need Some Inspiration?
      </h1>
      <div className="flex items-center gap-5  my-4">
        {inspiration.map((item, index) => (
          <button
            key={index}
            className="md:text-base text-[#0B0C1E] hover:bg-primary-500 ease-out transition-all text-lg bg-white px-5 py-2 rounded-lg"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InpirationSectoin;
