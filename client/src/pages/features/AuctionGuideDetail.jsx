import React from "react";
import { useParams, Link } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineClock, HiOutlineHome } from "react-icons/hi2";
import SEO from "../../components/common/SEO";
import {
  auctionBlogPosts,
  formatBlogContent,
} from "../../components/features/auctions/AuctionBlogsSection";

export default function AuctionGuideDetail() {
  const { blogId } = useParams();
  const post = auctionBlogPosts.find((p) => String(p.id) === String(blogId));
  const relatedPosts = post
    ? auctionBlogPosts.filter((p) => String(p.id) !== String(blogId)).slice(0, 3)
    : [];

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Guide not found</h1>
          <Link
            to="/auctions"
            className="inline-flex items-center gap-2 text-primary-500 font-medium hover:underline"
          >
            <HiOutlineArrowLeft /> Back to Auctions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO title={`${post.title} | Auctions | Sello`} description={post.excerpt} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <li>
                <Link
                  to="/"
                  className="hover:text-primary-500 transition-colors inline-flex items-center gap-1"
                >
                  <HiOutlineHome className="w-4 h-4" /> Home
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">/</li>
              <li>
                <Link to="/auctions" className="hover:text-primary-500 transition-colors">
                  Auctions
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">/</li>
              <li
                className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-xs"
                title={post.title}
              >
                {post.title}
              </li>
            </ol>
          </nav>

          <article className="bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <div className="relative w-full h-64 md:h-80 lg:h-[440px] overflow-hidden shrink-0">
              <img
                src={post.image}
                alt=""
                className="absolute inset-0 size-full block object-cover object-center"
              />
              <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 bg-white/95 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-white/90 text-sm">
                  <HiOutlineClock className="w-4 h-4" /> {post.readTime}
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">
                  {post.title}
                </h1>
              </div>
            </div>

            <div className="p-8 md:p-10 lg:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                    <span className="text-sm font-bold text-primary-600">
                      {post.author?.slice(0, 2)?.toUpperCase() || "SE"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{post.author}</p>
                    <p className="text-sm text-gray-500">{post.date}</p>
                  </div>
                </div>
              </div>

              {post.metaDescription && (
                <p className="text-gray-600 leading-relaxed mb-6 pl-1 border-l-4 border-primary-500/50">
                  <span className="font-semibold text-gray-900">Meta Description:</span>{" "}
                  {post.metaDescription}
                </p>
              )}

              {post.h1 && (
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {post.h1}
                </h2>
              )}

              {post.excerpt && (
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  {post.excerpt}
                </p>
              )}

              <div
                className="auction-blog-body prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900"
                dangerouslySetInnerHTML={{ __html: formatBlogContent(post.fullContent) }}
              />

              <div className="mt-12 pt-8 border-t border-gray-200">
                <Link
                  to="/auctions"
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-95 transition-opacity shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" /> Back to Auctions
                </Link>
              </div>
            </div>
          </article>

          {relatedPosts.length > 0 && (
            <section className="mt-12" aria-label="More guides">
              <h2 className="text-xl font-bold text-gray-900 mb-4">More auction guides</h2>
              <ul className="space-y-3">
                {relatedPosts.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/auctions/guide/${p.id}`}
                      className="group flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {p.title}
                        </span>
                        <span className="text-sm text-gray-500">{p.readTime}</span>
                      </div>
                      <HiOutlineArrowLeft className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}

