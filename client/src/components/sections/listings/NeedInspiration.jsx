import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NeedInspiration = () => {
  const navigate = useNavigate();

  const handleInspirationClick = (filters) => {
    const params = new URLSearchParams();

    // Only set supported filters to avoid sending unknown query params.
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "label") return;
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        params.set(key, String(value));
      }
    });

    const qs = params.toString();
    navigate(`/search-results${qs ? `?${qs}` : ""}`);
    toast.success(`Showing ${filters.label}...`);
  };

  return (
    <div className=" max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12">
      <h2 className="md:text-4xl text-2xl font-medium">Or Browse By Types</h2>
      <div className="mt-4 flex gap-4 flex-wrap">
        {[
          {
            name: "Automatic Cars",
            label: "Automatic Cars",
            action: () =>
              handleInspirationClick({ label: "Automatic Cars", transmission: "Automatic" }),
          },
          {
            name: "SUVs",
            label: "SUVs",
            action: () => handleInspirationClick({ label: "SUVs", bodyType: "SUV" }),
          },
          {
            name: "Electric Cars",
            label: "Electric Cars",
            action: () =>
              handleInspirationClick({ label: "Electric Cars", fuelType: "Electric" }),
          },
          {
            name: "New Arrivals",
            label: "New Arrivals",
            action: () => handleInspirationClick({ label: "New Arrivals", condition: "new" }),
          },
          {
            name: "Petrol",
            label: "Petrol",
            action: () => handleInspirationClick({ label: "Petrol", fuelType: "Petrol" }),
          },
          {
            name: "Diesel",
            label: "Diesel",
            action: () => handleInspirationClick({ label: "Diesel", fuelType: "Diesel" }),
          },
        ].map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={item.action}
            className="md:text-base text-[#0B0C1E] hover:bg-primary-500 hover:text-white ease-out transition-all text-lg bg-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg"
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NeedInspiration;
