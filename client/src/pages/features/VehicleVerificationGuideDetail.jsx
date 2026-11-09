import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineHome,
} from "react-icons/hi2";
import {
  vehicleVerificationGuidePosts,
  formatBlogContent,
} from "../../components/features/VehicleVerification/VehicleVerificationGuideSection";
import SEO from "../../components/common/SEO";
import { AdSenseSlot } from "../../components/ads";

export default function VehicleVerificationGuideDetail() {
  const { blogId } = useParams();
  const post = vehicleVerificationGuidePosts.find(
    (p) => String(p.id) === String(blogId),
  );
  const relatedPosts = post
    ? vehicleVerificationGuidePosts
        .filter((p) => String(p.id) !== String(blogId))
        .slice(0, 3)
    : [];

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Guide step not found
          </h1>
          <Link
            to="/vehicle-verification"
            className="inline-flex items-center gap-2 text-primary-500 font-medium hover:underline"
          >
            <HiOutlineArrowLeft /> Back to Vehicle Verification
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${post.stepNumber}. ${post.title} | Vehicle Verification Guide | Sello.pk`}
        description={post.excerpt}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb */}
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
              <li aria-hidden className="text-gray-300">
                /
              </li>
              <li>
                <Link
                  to="/vehicle-verification"
                  className="hover:text-primary-500 transition-colors"
                >
                  Vehicle Verification
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">
                /
              </li>
              <li
                className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs"
                title={post.title}
              >
                {post.stepNumber}. {post.title}
              </li>
            </ol>
          </nav>

          <article className="bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            {/* Hero Image */}
            <div className="relative w-full h-64 md:h-80 lg:h-[440px] overflow-hidden shrink-0">
              <img
                src={post.image}
                alt={post.title}
                className="absolute inset-0 size-full block object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
              <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 bg-white/95 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  {post.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-white/90 text-sm bg-black/40 backdrop-blur-sm px-3 py-1 rounded-md">
                  <HiOutlineClock className="w-4 h-4" /> {post.readTime}
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-primary-400 font-semibold text-sm sm:text-base uppercase tracking-wider mb-2">
                  Step {post.stepNumber} of 19
                </p>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">
                  {post.title}
                </h1>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 md:p-10 lg:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                    <span className="text-sm font-bold text-primary-600">
                      {post.author?.slice(0, 2)?.toUpperCase() || "SE"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {post.author}
                    </p>
                    <p className="text-sm text-gray-500">{post.date}</p>
                  </div>
                </div>
              </div>

              {/* Render Full Content */}
              <div
                className="prose prose-lg max-w-none text-gray-700 font-normal leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: formatBlogContent(post.fullContent),
                }}
              />

              {post.items && post.items.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Key Checklist & Verification Points:
                  </h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {post.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                        <span className="text-sm sm:text-base text-gray-800 font-medium">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Call to action inside detail */}
              <div className="mt-10 p-6 sm:p-8 bg-gradient-to-r from-primary-500 to-amber-500 rounded-2xl text-white shadow-lg">
                <h4 className="text-xl sm:text-2xl font-bold mb-2">
                  Check Vehicle Registration Records Online
                </h4>
                <p className="text-white/90 mb-6 text-sm sm:text-base leading-relaxed">
                  Avoid fraudulent documents and unpaid token taxes. Select your
                  province to verify the official MTMIS and Excise records now.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/vehicle-verification"
                    className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors shadow"
                  >
                    Select Province
                  </Link>
                  <Link
                    to="/car-estimator"
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                  >
                    Check Fair Car Value
                  </Link>
                </div>
              </div>
            </div>
          </article>

          {/* AdSense Slot */}
          <div className="my-8">
            <AdSenseSlot
              slot="vehicleVerificationDetailBottom"
              format="auto"
              fullWidthResponsive
              minHeight={90}
            />
          </div>

          {/* Related Guides */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                More Steps from The Complete Guide
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((r) => (
                  <Link
                    key={r.id}
                    to={`/vehicle-verification/guide/${r.id}`}
                    className="group bg-[#FDFBF7] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={r.image}
                        alt={r.title}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 bg-white/95 text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                        {r.category}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs text-primary-500 font-bold">
                          Step {r.stepNumber}
                        </span>
                        <h3 className="font-bold text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-2 mt-1 mb-2 text-base">
                          {r.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {r.excerpt}
                        </p>
                      </div>
                      <span className="text-xs text-primary-500 font-semibold mt-4 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read Step {r.stepNumber} →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              to="/vehicle-verification#complete-guide"
              className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:underline"
            >
              <HiOutlineArrowLeft /> Back to All 19 Steps
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
