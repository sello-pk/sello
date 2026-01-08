import React from "react";
import { categoriesBlogs } from "../../../assets/blogs/blogAssets";

const BlogsCates = () => {
  return (
    <div className="md:h-[50vh] w-full px-3 sm:px-4 md:px-6 lg:px-8 py-5">
      <div className="">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          All Categories
          <span className="w-16 rounded-xl mb-2 ml-5 h-1 bg-gray-500 inline-block "></span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-14 mt-5">
          {categoriesBlogs.map((cate) => {
            return (
              <div
                key={cate.id}
                className="bg-[#D0D0D0] flex items-center  flex-col p-5 rounded-xl"
              >
                <div className="">
                  <img src={cate.img} alt={cate.title} />
                </div>
                <h4 className="text-2xl my-4">{cate.title}</h4>
                <p className="">{cate.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BlogsCates;
