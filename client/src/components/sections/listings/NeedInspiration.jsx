import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NeedInspiration = () => {
  const navigate = useNavigate();

  const handleInspirationClick = (searchTerm) => {
    // Navigate to listings page with search term
    navigate(`/listings?search=${encodeURIComponent(searchTerm)}`);
    toast.success(`Searching for ${searchTerm}...`);
  };

  return (
    <div className="bg-[#F5F5F5] px-3 sm:px-4 md:px-6 lg:px-8 py-12">
      <h1 className="md:text-4xl text-2xl font-medium">Or Browse By Types</h1>
      <div className="mt-4 flex gap-4 flex-wrap">
        {[
          {
            name: "Automatic Cars",
            action: () => handleInspirationClick("automatic"),
          },
          { name: "SUVs", action: () => handleInspirationClick("suv") },
          {
            name: "Electric Cars",
            action: () => handleInspirationClick("electric"),
          },
          { name: "New Arrivals", action: () => handleInspirationClick("new") },
          { name: "Petrol", action: () => handleInspirationClick("petrol") },
          { name: "Diesel", action: () => handleInspirationClick("diesel") },
        ].map((item, index) => (
          <button
            key={index}
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
