import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  HiOutlineArrowLeft,
  HiOutlineClock,
  HiOutlineHome,
} from "react-icons/hi2";
import {
  useGetBlogByIdQuery,
  useGetBlogBySlugQuery,
  useGetBlogsQuery,
} from "../../redux/services/api";
import { formatDate } from "../../utils";
import SEO from "../../components/common/SEO";
import { Spinner } from "../../components/ui/Loading";
import { buildBlogUrl } from "../../utils/urlBuilders";
import BlogCommentsSection from "../../components/features/blog/BlogCommentsSection";
import { hardcodedBlogPosts } from "../../assets/blogs/blogAssets";

const BlogDetails = () => {
  const { id } = useParams();

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(id ?? "");

  const {
    data: blogById,
    isLoading: isLoadingById,
    isError: isErrorById,
    error: errorById,
  } = useGetBlogByIdQuery(id, { skip: !isObjectId });
  const {
    data: blogBySlug,
    isLoading: isLoadingBySlug,
    isError: isErrorBySlug,
    error: errorBySlug,
  } = useGetBlogBySlugQuery(id, { skip: isObjectId });

  const blog = isObjectId ? blogById : blogBySlug;
  const isLoading = isObjectId ? isLoadingById : isLoadingBySlug;
  const isError = isObjectId ? isErrorById : isErrorBySlug;

  const is404 =
    errorById?.status === 404 || errorBySlug?.status === 404;
  const hardcodedBlog =
    !isLoadingById &&
    !isLoadingBySlug &&
    is404 &&
    (isErrorById || isErrorBySlug)
      ? hardcodedBlogPosts[id] ?? null
      : null;

  const { data: relatedBlogsData } = useGetBlogsQuery(
    {
      limit: 3,
      status: "published",
      category: blog?.category?._id || hardcodedBlog?.category?._id,
      ...(blog?._id && { exclude: blog._id }),
    },
    {
      skip:
        !(blog?.category?._id || hardcodedBlog?.category?._id) ||
        !(blog?._id || hardcodedBlog?._id),
    },
  );

  const relatedBlogs = React.useMemo(() => {
    if (!relatedBlogsData) return [];
    const blogsArray =
      relatedBlogsData?.blogs || relatedBlogsData?.data?.blogs || [];
    return blogsArray
      .filter((b) => b && b._id && b._id !== (blog?._id || hardcodedBlog?._id))
      .slice(0, 3);
  }, [relatedBlogsData, blog?._id, hardcodedBlog?._id]);

  const currentBlog = blog || hardcodedBlog;

  const normalizedTags = React.useMemo(() => {
    const raw = currentBlog?.tags;
    if (!raw) return [];
    if (Array.isArray(raw))
      return raw
        .map((t) => (typeof t === "string" ? t.trim() : String(t)))
        .filter(Boolean);
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
          ? parsed
              .map((t) => (typeof t === "string" ? t.trim() : String(t)))
              .filter(Boolean)
          : [raw.trim()].filter(Boolean);
      } catch {
        return raw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    return [];
  }, [currentBlog?.tags]);

  const [heroImgFailed, setHeroImgFailed] = React.useState(false);

  useEffect(() => {
    setHeroImgFailed(false);
  }, [blog?._id, hardcodedBlog?._id, id]);

  const isInitialLoad = isLoading && !blog && !hardcodedBlog;
  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Spinner fullScreen={false} />
      </div>
    );
  }

  if (isError && !hardcodedBlog && !currentBlog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Blog Post Not Found
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            The blog post you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-primary-500 font-medium hover:underline"
          >
            <HiOutlineArrowLeft className="w-5 h-5" /> Back to all blogs
          </Link>
        </div>
      </div>
    );
  }

  const authorName = currentBlog.author?.name || "Sello";
  const authorInitials =
    authorName
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SE";
  const displayDate = formatDate(
    currentBlog.publishedAt || currentBlog.createdAt,
  );
  const readLabel = `${currentBlog.readTime || 5} min read`;
  const categoryName = currentBlog.category?.name || "Blog";
  const hasFeaturedUrl = Boolean(currentBlog.featuredImage);
  const showHeroPhoto = hasFeaturedUrl && !heroImgFailed;
  const canUseComments =
    currentBlog._id && /^[0-9a-fA-F]{24}$/.test(String(currentBlog._id));

  return (
    <>
      <SEO
        title={currentBlog.metaTitle || currentBlog.title}
        description={
          currentBlog.metaDescription ||
          currentBlog.excerpt ||
          currentBlog.content?.replace(/<[^>]*>/g, "").substring(0, 160)
        }
        image={currentBlog.featuredImage}
        url={buildBlogUrl(currentBlog)}
        canonical={
          currentBlog
            ? `https://sello.pk${buildBlogUrl(currentBlog)}`
            : undefined
        }
        keywords={
          currentBlog.metaKeywords ||
          (normalizedTags.length > 0 ? normalizedTags.join(", ") : undefined)
        }
      />
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
              <li aria-hidden className="text-gray-300">
                /
              </li>
              <li>
                <Link
                  to="/blog"
                  className="hover:text-primary-500 transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">
                /
              </li>
              <li
                className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-xs"
                title={currentBlog.title}
              >
                {currentBlog.title}
              </li>
            </ol>
          </nav>

          <article className="bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <div className="relative w-full h-64 md:h-80 lg:h-[440px] overflow-hidden shrink-0">
              {showHeroPhoto ? (
                <img
                  src={currentBlog.featuredImage}
                  alt=""
                  className="absolute inset-0 size-full block object-cover object-center"
                  loading="eager"
                  onError={() => setHeroImgFailed(true)}
                />
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-[#050B20]"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0 bg-black/35" aria-hidden />
              <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
                {currentBlog.category?._id ? (
                  <Link
                    to={`/blog/all?category=${currentBlog.category._id}`}
                    className="inline-flex items-center gap-2 bg-white/95 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow hover:bg-white transition-colors"
                  >
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    {categoryName}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 bg-white/95 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                    {categoryName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-white/90 text-sm drop-shadow">
                  <HiOutlineClock className="w-4 h-4" /> {readLabel}
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">
                  {currentBlog.title}
                </h1>
              </div>
            </div>

            <div className="p-8 md:p-10 lg:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {currentBlog.author?.avatar ? (
                    <img
                      src={currentBlog.author.avatar}
                      alt={authorName}
                      className="w-11 h-11 rounded-full object-cover border border-primary-500/20"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                      <span className="text-sm font-bold text-primary-600">
                        {authorInitials}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {authorName}
                    </p>
                    <p className="text-sm text-gray-500">{displayDate}</p>
                  </div>
                </div>
                {currentBlog.views > 0 && (
                  <span className="text-sm text-gray-500">
                    {currentBlog.views} views
                  </span>
                )}
              </div>

              {currentBlog.excerpt && (
                <p className="text-lg text-gray-600 leading-relaxed mb-8 pl-1 border-l-4 border-primary-500/50">
                  {currentBlog.excerpt}
                </p>
              )}

              {currentBlog.content ? (
                <div
                  className="blog-detail-body estimator-blog-body prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: currentBlog.content }}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No content available for this blog post.</p>
                </div>
              )}

              {normalizedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-200">
                  {normalizedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {relatedBlogs.length > 0 && (
                <section className="mt-10 pt-8 border-t border-gray-200" aria-label="Related articles">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Related articles
                  </h2>
                  <ul className="space-y-3">
                    {relatedBlogs.map((relatedBlog) => (
                      <li key={relatedBlog._id}>
                        <Link
                          to={`/blog/${relatedBlog.slug || relatedBlog._id}`}
                          className="group flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all"
                        >
                          <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                          <div className="min-w-0 flex-1">
                            <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 block">
                              {relatedBlog.title}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(
                                relatedBlog.publishedAt ||
                                  relatedBlog.createdAt,
                              )}
                            </span>
                          </div>
                          <HiOutlineArrowLeft className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all rotate-180" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="mt-10 pt-8 border-t border-gray-200">
                <Link
                  to="/blog"
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-95 transition-opacity shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" /> Back to all blogs
                </Link>
              </div>
            </div>
          </article>

          {canUseComments && (
            <div className="mt-10 bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-lg border border-gray-100 p-8 md:p-10">
              <BlogCommentsSection blogId={currentBlog._id} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .blog-detail-body.prose > *:first-child { margin-top: 0 !important; }
        .blog-detail-body.prose > *:last-child { margin-bottom: 0 !important; }
        .blog-detail-body.prose h1, .blog-detail-body.prose h2, .blog-detail-body.prose h3 {
          line-height: 1.3; font-weight: 700; color: #111827; clear: both;
        }
        .blog-detail-body.prose p {
          margin-top: 1.25rem; margin-bottom: 1.25rem; line-height: 1.75; color: #374151;
        }
        .blog-detail-body.prose img {
          margin: 1.5rem auto; display: block; max-width: 100%; height: auto;
          border-radius: 0.5rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .blog-detail-body.prose a { color: #FFA602; font-weight: 500; }
        .blog-detail-body.prose a:hover { text-decoration: underline; }
        .blog-detail-body.prose blockquote {
          border-left: 4px solid #FFA602; padding-left: 1.25rem; font-style: italic; color: #4B5563;
        }
        .blog-detail-body.prose ul, .blog-detail-body.prose ol { padding-left: 1.5rem; }
      `}</style>
    </>
  );
};

export default BlogDetails;
