import React from "react";
import { useNavigate } from "react-router-dom";

const InpirationSectoin = () => {
  const navigate = useNavigate();

  const getFiltersForItem = (item) => {
    switch (item) {
      case "Automatics Cars":
        return { transmission: "Automatic" };
      case "SUVs":
        return { bodyType: "SUV" };
      case "Electric Cars":
        return { fuelType: "Electric" };
      case "New in Stock":
        return { condition: "new" };
      case "Petrol":
        return { fuelType: "Petrol" };
      case "Diesel":
        return { fuelType: "Diesel" };
      default:
        return null;
    }
  };

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
      <h2 className="md:text-4xl text-2xl font-medium">
        Need Some Inspiration?
      </h2>
      <div className="flex items-center gap-5  my-4">
        {inspiration.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => {
              const filters = getFiltersForItem(item);
              if (!filters) return;

              const params = new URLSearchParams();
              Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && String(value).trim()) {
                  params.set(key, String(value));
                }
              });

              const qs = params.toString();
              navigate(`/search-results${qs ? `?${qs}` : ""}`);
            }}
            className="md:text-base text-[#0B0C1E] hover:bg-primary-500 hover:text-white ease-out transition-all text-lg bg-white px-5 py-2 rounded-lg shadow-md border border-gray-100 hover:shadow-lg"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default InpirationSectoin;
