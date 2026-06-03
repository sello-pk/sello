import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetBlogsQuery } from "../../../redux/services/api";
import { formatDate } from "../../../utils";
import { buildBlogUrl } from "../../../utils/urlBuilders";

const LatestBlogsSection = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetBlogsQuery({
    page,
    limit: 12,
    status: "published",
  });

  // Robust blog data access
  const blogs =
    data?.blogs || data?.data?.blogs || (Array.isArray(data) ? data : []);
  const pagination = data?.pagination || {};

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto w-full">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto w-full text-center py-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Blog Posts
          </h2>
          <p className="text-gray-500 mb-6">No blog posts available yet.</p>
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Browse Blog Archive
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Blog Posts
            </h2>
            <p className="text-gray-600">
              Stay updated with our latest articles and insights
            </p>
          </div>
          <Link
            to="/blog/all"
            className="text-primary-900 hover:text-neutral-950 font-semibold flex items-center gap-2 transition-colors"
          >
            View All
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogs.map((blog, blogIdx) => (
            <Link
              key={blog._id}
              to={buildBlogUrl(blog)}
              className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Blog Image - fit inside box like categories (no crop) */}
              <div className="w-full h-48 md:h-60 overflow-hidden rounded-t-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                <img
                  src={
                    blog.featuredImage ||
                    "https://via.placeholder.com/600x400?text=No+Image"
                  }
                  alt={blog.title}
                  width={600}
                  height={400}
                  loading={blogIdx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="max-h-full max-w-full w-auto h-auto object-cover object-center group-hover:scale-110 scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/600x400?text=Blog";
                  }}
                />
              </div>

              {/* Blog Content */}
              <div className="p-6 flex-1 flex flex-col min-w-0">
                {/* Category - inline, won't clip */}
                {blog.category && (
                  <span className="inline-block w-fit px-2.5 py-1 text-xs font-semibold text-primary-600 mb-3 uppercase tracking-wide bg-primary-50 rounded-full flex-shrink-0">
                    {blog.category.name}
                  </span>
                )}

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-primary-500 transition-colors leading-tight">
                  {blog.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4 line-clamp-3 flex-1">
                  {blog.excerpt ||
                    blog.content?.replace(/<[^>]*>/g, "").substring(0, 150) +
                      "..."}
                </p>

                {/* Author and Date Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    {blog.author?.avatar ? (
                      <img
                        src={blog.author.avatar}
                        alt={blog.author.name || "Author"}
                        width={32}
                        height={32}
                        decoding="async"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold">
                        {(blog.author?.name || "A")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {blog.author?.name || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(blog.publishedAt || blog.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {blog.readTime || 5} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-12 pt-8 border-t border-gray-200">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Go to previous page"
            >
              Previous
            </button>
            <div className="flex items-center gap-2">
              {[...Array(pagination.pages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === pagination.pages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        page === pageNum
                          ? "bg-primary-500 text-white"
                          : "border border-gray-300 hover:bg-gray-50 hover:border-primary-500"
                      }`}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={page === pageNum ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === page - 2 || pageNum === page + 2) {
                  return (
                    <span key={pageNum} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <span className="px-4 py-2 text-gray-600 text-sm">
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.pages, p + 1))
              }
              disabled={page >= pagination.pages}
              className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary-500 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Go to next page"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestBlogsSection;
