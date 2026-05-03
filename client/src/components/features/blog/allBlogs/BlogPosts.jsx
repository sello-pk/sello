import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetBlogsQuery } from "../../../../redux/services/api";

const BlogPosts = ({ search = "", category = "", sortBy = "newest" }) => {
  const [page, setPage] = useState(1);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, sortBy]);

  const { data, isLoading, error } = useGetBlogsQuery({
    page,
    limit: 12,
    status: "published",
    ...(search && { search }),
    ...(category && { category }),
  });

  let blogs = data?.blogs || [];
  const pagination = data?.pagination || {};

  // Client-side sorting (since backend doesn't support sort parameter yet)
  const sortedBlogs = useMemo(() => {
    return [...blogs].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.publishedAt || b.createdAt) -
            new Date(a.publishedAt || a.createdAt)
          );
        case "oldest":
          return (
            new Date(a.publishedAt || a.createdAt) -
            new Date(b.publishedAt || b.createdAt)
          );
        case "mostViewed":
          return (b.views || 0) - (a.views || 0);
        case "titleAsc":
          return (a.title || "").localeCompare(b.title || "");
        case "titleDesc":
          return (b.title || "").localeCompare(b.title || "");
        default:
          return 0;
      }
    });
  }, [blogs, sortBy]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
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
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        <p className="text-red-500 text-center">
          Error loading blogs. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          All Posts
        </h2>
        <p className="text-gray-600">
          Discover our latest articles and insights
        </p>
      </div>

      {/* All Posts Grid */}
      {sortedBlogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No blog posts available yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {sortedBlogs.map((blog) => (
              <article
                key={blog._id}
                className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border border-gray-100"
              >
                <Link
                  to={`/blog/${blog.slug || blog._id}`}
                  className="block h-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-xl p-6"
                  aria-label={`Read blog post: ${blog.title}`}
                >
                {/* Blog Image - fit inside box like categories (no crop) */}
                  <div className="relative w-full h-48 md:h-56 overflow-hidden rounded-t-xl bg-gray-100 group flex items-center justify-center">
                    <img
                      src={
                        blog.featuredImage ||
                        "https://via.placeholder.com/600x400?text=No+Image"
                      }
                      alt={`${blog.title} - featured image`}
                      width={600}
                      height={400}
                      className="max-h-full max-w-full w-auto h-auto object-contain object-center transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/600x400?text=Blog";
                      }}
                    />
                  </div>

                {/* Blog Content */}
                  <div className="p-6 flex-1 flex flex-col min-w-0">
                  {/* Category - inline, won't clip */}
                  {blog.category && (
                    <span className="inline-block w-fit px-3 py-1 text-xs font-semibold text-primary-600 mb-4 uppercase tracking-wide bg-primary-50 rounded-full flex-shrink-0" aria-hidden="true">
                      {blog.category.name}
                    </span>
                  )}

                  {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-primary-600 transition-colors leading-tight">
                      {blog.title}
                    </h3>

                  {/* Description */}
                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6 line-clamp-4 flex-1" aria-hidden="true">
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
                            alt={`${blog.author?.name || 'Author'} avatar`}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-semibold" aria-hidden="true">
                            {(blog.author?.name || "A")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900" aria-hidden="true">
                            {blog.author?.name || "Admin"}
                          </p>
                          <p className="text-xs text-gray-500" aria-hidden="true">
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500" aria-hidden="true">
                        {blog.readTime || 5} min
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
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
                  // Show first page, last page, current page, and pages around current
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
        </>
      )}
    </div>
  );
};

export default BlogPosts;
