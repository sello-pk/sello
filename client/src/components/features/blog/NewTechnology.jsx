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
      <div className="md:h-[80vh] w-full px-3 sm:px-4 md:px-6 lg:px-8 py-5">
        <div className="flex justify-center items-center h-64">
          <Spinner fullScreen={false} />
        </div>
      </div>
    );
  }

  if (!categories.length) {
    return null;
  }

  return (
    <div className="md:h-[80vh] w-full px-3 sm:px-4 md:px-6 lg:px-8 py-5">
      <div className="md:flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Blog Categories
          <span className="w-16 rounded-xl mb-2 ml-5 h-1 bg-gray-500 inline-block "></span>
        </h2>
        <Link to={"/blog/all"} className="text-sm sm:text-base">
          see all
        </Link>
      </div>

      {/* Grid fixed for tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
        {categories.map((cate) => {
          return (
            <Link
              key={cate._id}
              to={`/blog/all?category=${cate._id}`}
              className="bg-[#D9D9D9] rounded-xl flex items-center flex-col p-5 hover:bg-[#C0C0C0] transition-colors group"
            >
              <div className="w-full h-40 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                {cate.image ? (
                  <img
                    src={cate.image}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    alt={cate.name}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-3xl font-semibold text-gray-500">
                      {cate.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <h4 className="my-5 text-lg sm:text-xl font-medium text-center group-hover:text-primary-600">
                {cate.name}
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-primary-600 font-semibold">
                  {cate.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {cate.description || `Browse all ${cate.name} articles`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NewTechnology;
