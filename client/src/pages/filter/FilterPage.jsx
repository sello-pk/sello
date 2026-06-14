import React from "react";
import { useNavigate } from "react-router-dom";
import FilterForm from "../../components/sections/filter/FilterForm";
import GridCars from "../../components/sections/filter/GridCars";
import BannerInFilter from "../../components/sections/filter/BannerInFilter";
import BlogSection from "../../components/sections/home/BlogSection";

const FilterPage = () => {
  const navigate = useNavigate();

  const handleFilter = (filters) => {
    if (filters && Object.keys(filters).length > 0) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      navigate(`/search-results?${params.toString()}`);
    }
  };

  return (
    <div className="max-w-8xl mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-primary-500">
          Find the Right Vehicle
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1.5">
          Use smart filters to narrow down listings quickly.
        </p>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-3 sm:px-5 md:px-6 py-5 sm:py-6 my-4">
        <div className="w-full">
          <FilterForm onFilter={handleFilter} simplifiedFields />
        </div>
      </div>
      <GridCars />
      <BannerInFilter skipOuterGutter />
      <BlogSection />
    </div>
  );
};

export default FilterPage;
