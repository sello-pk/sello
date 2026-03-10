import React from "react";
import { useParams, Link } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineClock, HiOutlineHome } from "react-icons/hi2";
import { vehicleCategoryConfig } from "../../config/vehicleCategoryConfig";
import SEO from "../../components/common/SEO";

/** Format markdown-like content (headings, bold, lists) - same as category section. */
function formatBlogContent(text) {
  if (!text || typeof text !== "string") return "";
  const blocks = text.split(/\n\n+/);
  const out = [];
  const bold = (s) =>
    s.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>');

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const lines = trimmed.split("\n");
    const firstLine = lines[0] || "";

    if (firstLine.startsWith("## ") && lines.length === 1) {
      out.push(
        `<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4 first:mt-0">${bold(firstLine.slice(3))}</h2>`
      );
      continue;
    }
    if (firstLine.startsWith("### ") && lines.length === 1) {
      out.push(
        `<h3 class="text-xl font-bold text-gray-900 mt-8 mb-3">${bold(firstLine.slice(4))}</h3>`
      );
      continue;
    }
    if (
      lines.every((l) => l.trimStart().startsWith("- ") || l.trimStart() === "")
    ) {
      out.push('<ul class="list-none space-y-2 my-4">');
      lines.forEach((l) => {
        const content = l.replace(/^\s*-\s*/, "").trim();
        if (content)
          out.push(
            `<li class="flex items-start gap-3"><span class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2.5"></span><span class="text-gray-700">${bold(content)}</span></li>`
          );
      });
      out.push("</ul>");
      continue;
    }
    const para = trimmed.split(/\n/).join(" ");
    out.push(`<p class="mb-5 text-gray-700 leading-relaxed">${bold(para)}</p>`);
  }
  return out.join("");
}

function getPlaceholderImage(slug, title) {
  const text = encodeURIComponent((title || slug).slice(0, 20));
  return `https://placehold.co/520x400/081C2B/94a3b8?text=${text}`;
}

const CategoryGuideDetail = () => {
  const { categorySlug, blogId } = useParams();
  const config = categorySlug ? vehicleCategoryConfig[categorySlug] : null;
  const blog = config?.blogs?.find((b) => String(b.id) === String(blogId));
  const relatedBlogs = config && blog
    ? config.blogs.filter((b) => String(b.id) !== String(blogId)).slice(0, 3)
    : [];

  if (!config || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Guide not found</h1>
          <Link
            to={config ? `/listings/${categorySlug}` : "/listings"}
            className="inline-flex items-center gap-2 text-primary-500 font-medium hover:underline"
          >
            <HiOutlineArrowLeft /> Back to {config?.title || "Listings"}
          </Link>
        </div>
      </div>
    );
  }

  const indexInCategory = config.blogs.findIndex((b) => String(b.id) === String(blogId));
  const rawImg = indexInCategory === 0 ? config.blogImage : config.blogImage2;
  const imageSrc =
    typeof rawImg === "string"
      ? rawImg
      : rawImg?.default ?? rawImg?.src ?? getPlaceholderImage(categorySlug, config.title);
  const fullContent = blog.fullContent || blog.content || "";
  const excerpt = blog.content || blog.title;

  return (
    <>
      <SEO
        title={`${blog.title} | ${config.title} Guides | Sello`}
        description={excerpt}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <li>
                <Link to="/" className="hover:text-primary-500 transition-colors inline-flex items-center gap-1">
                  <HiOutlineHome className="w-4 h-4" /> Home
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">/</li>
              <li>
                <Link to="/listings" className="hover:text-primary-500 transition-colors">
                  Listings
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">/</li>
              <li>
                <Link to={`/listings/${categorySlug}`} className="hover:text-primary-500 transition-colors">
                  {config.title}
                </Link>
              </li>
              <li aria-hidden className="text-gray-300">/</li>
              <li className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-xs" title={blog.title}>
                {blog.title}
              </li>
            </ol>
          </nav>

          <article className="bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            <div className="relative w-full h-64 md:h-80 lg:h-[440px] overflow-hidden shrink-0">
              <img
                src={imageSrc}
                alt=""
                className="absolute inset-0 size-full block object-cover object-center"
                onError={(e) => {
                  e.target.src = getPlaceholderImage(categorySlug, config.title);
                }}
              />
              <div className="absolute top-6 left-6 right-6 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 bg-white/95 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  {config.title}
                </span>
                <span className="inline-flex items-center gap-1.5 text-white/90 text-sm">
                  <HiOutlineClock className="w-4 h-4" /> {blog.readTime}
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg leading-tight">
                  {blog.title}
                </h1>
              </div>
            </div>

            <div className="p-8 md:p-10 lg:p-12">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                    <span className="text-sm font-bold text-primary-600">
                      {(blog.author || "Sello")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{blog.author || "Sello Expert"}</p>
                    <p className="text-sm text-gray-500">{blog.date}</p>
                  </div>
                </div>
              </div>

              {excerpt && excerpt !== blog.title && (
                <p className="text-lg text-gray-600 leading-relaxed mb-8 pl-1 border-l-4 border-primary-500/50">
                  {excerpt}
                </p>
              )}

              <div
                className="prose prose-lg max-w-none text-gray-700 leading-relaxed prose-headings:text-gray-900"
                dangerouslySetInnerHTML={{
                  __html: formatBlogContent(fullContent),
                }}
              />

              <div className="mt-12 pt-8 border-t border-gray-200">
                <Link
                  to={`/listings/${categorySlug}`}
                  className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-95 transition-opacity shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" /> Back to {config.title}
                </Link>
              </div>
            </div>
          </article>

          {relatedBlogs.length > 0 && (
            <section className="mt-12" aria-label="More guides">
              <h2 className="text-xl font-bold text-gray-900 mb-4">More {config.title} guides</h2>
              <ul className="space-y-3">
                {relatedBlogs.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={`/listings/${categorySlug}/guide/${b.id}`}
                      className="group flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-md transition-all"
                    >
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {b.title}
                        </span>
                        <span className="text-sm text-gray-500">{b.readTime}</span>
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
};

export default CategoryGuideDetail;
