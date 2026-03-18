import React from "react";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../../../redux/services/api";
import { Spinner } from "../../ui/Loading";

const NewTechnology = () => {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery({
    type: "blog",
    isActive: true,
  });

  const categories = categoriesData || [];

  if (isLoading) {
    return (
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto w-full flex justify-center items-center py-24">
          <Spinner fullScreen={false} />
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Blog Categories
            <span className="w-16 rounded-xl ml-3 sm:ml-5 h-1 bg-gray-400 inline-block align-middle" />
          </h2>
          <Link
            to="/blog/all"
            className="text-sm sm:text-base text-primary-600 font-medium hover:text-primary-500 shrink-0"
          >
            see all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {categories.map((cate) => (
            <Link
              key={cate._id}
              to={`/blog/all?category=${cate._id}`}
              className="bg-[#D9D9D9] rounded-xl flex flex-col p-5 hover:bg-[#C0C0C0] transition-colors group h-full min-h-0"
            >
              <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
                  <span className="text-4xl font-light text-gray-300 mb-1">
                    {cate.name?.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-400">Category</span>
                </div>
                {cate.image && (
                  <img
                    src={cate.image}
                    className="relative z-10 max-h-full max-w-full w-auto h-auto object-contain object-center group-hover:scale-105 transition-transform duration-300"
                    alt={cate.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </div>
              <h4 className="mt-4 mb-3 text-lg sm:text-xl font-medium text-center text-gray-900 group-hover:text-primary-600 break-words">
                {cate.name}
              </h4>
              <div className="flex gap-3 items-start min-w-0 flex-1 mt-auto">
                <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 font-semibold text-sm border border-primary-100">
                  {cate.name?.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words min-w-0">
                  {cate.description?.trim() ||
                    `Browse all ${cate.name} articles`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewTechnology;
