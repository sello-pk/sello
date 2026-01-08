import React from "react";
import { Link } from "react-router-dom";
import { newTechnology } from "../../../assets/blogs/blogAssets";

const NewTechnology = () => {
  return (
    <div className="md:h-[80vh] w-full px-3 sm:px-4 md:px-6 lg:px-8 py-5">
      <div className="md:flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          New Technology
          <span className="w-16 rounded-xl mb-2 ml-5 h-1 bg-gray-500 inline-block "></span>
        </h2>
        <Link to={"/"} className="text-sm sm:text-base">
          see all
        </Link>
      </div>

      {/* Grid fixed for tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-5">
        {newTechnology.map((blog) => {
          return (
            <div
              key={blog.id}
              className="bg-[#D9D9D9] rounded-xl flex items-center flex-col p-5"
            >
              <div className="w-full">
                <img
                  src={blog.newTechImg}
                  className="w-full h-full mx-auto"
                  alt={blog.title}
                />
              </div>
              <h4 className="my-5 text-lg sm:text-xl font-medium text-center">
                {blog.title}
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10">
                  <img
                    src={blog.reviewerImg}
                    alt="reviewer"
                    className="rounded-full w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <h6 className="text-sm sm:text-base">{blog.reviewerName}</h6>
                  <div className="flex gap-4 sm:gap-6 flex-wrap">
                    <p className="text-xs sm:text-sm text-gray-600">
                      {blog.reviewDate}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {blog.readTime}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NewTechnology;
