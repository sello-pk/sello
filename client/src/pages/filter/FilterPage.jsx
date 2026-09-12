import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FilterForm from "../../components/sections/filter/FilterForm";
import GridCars from "../../components/sections/filter/GridCars";
import BannerInFilter from "../../components/sections/filter/BannerInFilter";
import BlogSection from "../../components/sections/home/BlogSection";
import SEO from "../../components/common/SEO";
import { buildListingsSearchUrl, getListingsPageCopy } from "../../utils/urlBuilders";
import { getListingsSeoForParams } from "../../utils/listingsSeo";

const EMPTY_STATE_SEO = {
  title: "Filter Cars for Sale in Pakistan | Refine Your Search – Sello.pk",
  description:
    "Use advanced filters on Sello.pk to narrow down cars for sale in Pakistan by city, make, model, year, and price.",
};

const FilterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const make = searchParams.get("make") || "";
  const model = searchParams.get("model") || "";
  const city = searchParams.get("city") || "";
  const hasFilters = Boolean(make || model || city);

  const curatedSeo = getListingsSeoForParams({ make, model, city });
  const pageCopy = getListingsPageCopy({ city, make, model });
  const seoTitle = hasFilters
    ? curatedSeo?.seoTitle || pageCopy.title
    : EMPTY_STATE_SEO.title;
  const seoDescription = hasFilters
    ? curatedSeo?.seoDescription || pageCopy.description
    : EMPTY_STATE_SEO.description;

  const handleFilter = (filters) => {
    if (filters && Object.keys(filters).length > 0) {
      navigate(buildListingsSearchUrl(filters));
    }
  };

  return (
    <div className="max-w-8xl mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
      <SEO title={seoTitle} description={seoDescription} />
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
