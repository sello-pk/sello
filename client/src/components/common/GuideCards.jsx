import { useEffect, useId, useState } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, ShieldCheck, User } from "lucide-react";

/** Format markdown-like blog content to safe HTML */
function formatBlogContent(text) {
  if (!text || typeof text !== "string") return "";
  const blocks = text.split(/\n\n+/);
  const out = [];
  const bold = (s) =>
    s.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-gray-900">$1</strong>',
    );

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    const firstLine = lines[0] || "";

    // Table: multiple lines with pipes
    if (
      lines.length >= 2 &&
      firstLine.includes("|") &&
      lines.every((l) => l.includes("|"))
    ) {
      const rows = lines
        .map((l) =>
          l
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean),
        )
        .filter((cells) => cells.length > 0);
      const isSeparator = (cells) => cells.every((c) => /^[-:]+$/.test(c));
      const headerRow = rows[0] || [];
      const dataRows = rows.filter((_, i) => i > 0 && !isSeparator(rows[i]));
      out.push(
        '<div class="overflow-x-auto my-6 rounded-xl border border-gray-200"><table class="w-full text-left text-sm"><thead><tr class="bg-gray-50 border-b border-gray-200">',
      );
      headerRow.forEach((c) => {
        out.push(
          `<th class="px-4 py-3 font-semibold text-gray-900">${bold(c)}</th>`,
        );
      });
      out.push("</tr></thead><tbody>");
      dataRows.forEach((row, i) => {
        out.push(
          `<tr class="border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}">`,
        );
        row.forEach((c) => {
          out.push(`<td class="px-4 py-3 text-gray-700">${bold(c)}</td>`);
        });
        out.push("</tr>");
      });
      out.push("</tbody></table></div>");
      continue;
    }

    // ## Heading
    if (firstLine.startsWith("## ") && lines.length === 1) {
      out.push(
        `<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4 first:mt-0">${bold(firstLine.slice(3))}</h2>`,
      );
      continue;
    }
    // ### Heading
    if (firstLine.startsWith("### ") && lines.length === 1) {
      out.push(
        `<h3 class="text-xl font-bold text-gray-900 mt-8 mb-3">${bold(firstLine.slice(4))}</h3>`,
      );
      continue;
    }

    // Unordered list (lines starting with - )
    if (
      lines.every((l) => l.trimStart().startsWith("- ") || l.trimStart() === "")
    ) {
      out.push('<ul class="list-none space-y-2 my-4">');
      lines.forEach((l) => {
        const content = l.replace(/^\s*-\s*/, "").trim();
        if (content)
          out.push(
            `<li class="flex items-start gap-3"><span class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2.5"></span><span class="text-gray-700">${bold(content)}</span></li>`,
          );
      });
      out.push("</ul>");
      continue;
    }

    // Paragraph(s)
    const para = trimmed.split(/\n/).join(" ");
    out.push(`<p class="mb-5 text-gray-700 leading-relaxed">${bold(para)}</p>`);
  }

  return out.join("");
}

export default function GuideCards({
  posts,
  checklistTitle = "Key points",
  initialPostId = null,
  showStepNumber = true,
}) {
  const [expandedId, setExpandedId] = useState(initialPostId);
  const idPrefix = useId();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (initialPostId === null) return undefined;
    const frame = requestAnimationFrame(() => {
      document
        .getElementById(`${idPrefix}-card-${initialPostId}`)
        ?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [idPrefix, initialPostId]);

  const toggleStep = (id, returnFocus = false) => {
    setExpandedId((previous) => (previous === id ? null : id));
    const trigger = document.getElementById(`${idPrefix}-trigger-${id}`);
    if (returnFocus) trigger?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      trigger?.scrollIntoView({
        block: returnFocus ? "center" : "nearest",
        behavior: "auto",
      });
    });
  };
  return (
    <div className="space-y-8 lg:space-y-12">
      {posts.map((post, index) => {
        const isImageLeft = index % 2 === 1; // odd = image left, even = image right
        const isExpanded = expandedId === post.id;

        return (
          <article
            key={post.id}
            id={`${idPrefix}-card-${post.id}`}
            className={`group flex scroll-mt-24 flex-col rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-[#FDFBF7] border border-stone-200/60 ${
              isImageLeft ? "lg:flex-row-reverse" : "lg:flex-row"
            }`}
          >
            {/* Content area */}
            <div className="relative flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 min-h-[260px] lg:min-h-0 lg:min-w-0">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-200/80 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {post.author}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{post.date}</span>
                </div>

                <h3 className="mb-4 break-words text-2xl font-bold leading-tight text-primary-500 lg:text-3xl">
                  {showStepNumber && post.stepNumber && (
                    <span className="text-primary-500 mr-2">
                      {post.stepNumber}.
                    </span>
                  )}
                  {post.title}
                </h3>

                <p className="text-base lg:text-lg leading-relaxed mb-6 text-gray-600">
                  {post.excerpt}
                </p>

                <button
                  type="button"
                  id={`${idPrefix}-trigger-${post.id}`}
                  onClick={() => toggleStep(post.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`${idPrefix}-content-${post.id}`}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 cursor-pointer min-h-11 scroll-mt-24 scroll-mb-8 ${
                    isExpanded
                      ? "bg-primary-50 text-primary-800"
                      : "bg-primary-500 text-white shadow-md hover:shadow-lg hover:opacity-95"
                  }`}
                >
                  <span>{isExpanded ? "Read Less" : "Read More"}</span>
                  {isExpanded ? (
                    <ChevronUp
                      className="w-5 h-5 transition-transform"
                      aria-hidden
                    />
                  ) : (
                    <ChevronDown
                      className="w-5 h-5 transition-transform"
                      aria-hidden
                    />
                  )}
                </button>

                <div id={`${idPrefix}-content-${post.id}`} hidden={!isExpanded}>
                  {isExpanded && (
                    <Motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: reduceMotion ? 0 : 0.18,
                        ease: "easeInOut",
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-8 pt-8 border-t border-stone-200/80">
                        {/* Formatted markdown content */}
                        <div
                          className="prose prose-lg max-w-none break-words font-normal leading-relaxed text-gray-700"
                          dangerouslySetInnerHTML={{
                            __html: formatBlogContent(post.fullContent),
                          }}
                        />

                        {/* Key Checklist & Verification Points */}
                        {post.items && post.items.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-stone-200/80">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-primary-500" />
                              <span>{checklistTitle}</span>
                            </h4>
                            <ul className="grid gap-3 sm:grid-cols-2">
                              {post.items.map((item) => (
                                <li
                                  key={item}
                                  className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm"
                                >
                                  <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-2" />
                                  <span className="text-sm font-medium text-gray-800">
                                    {item}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Return focus to the primary toggle when closing here. */}
                        <div className="mt-8 pt-4 border-t border-stone-200/60 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleStep(post.id, true)}
                            className="inline-flex items-center gap-2 text-primary-500 font-semibold hover:text-primary-600 transition-colors py-2 cursor-pointer text-sm sm:text-base"
                          >
                            <ChevronUp className="w-4 h-4" />
                            <span>Read Less</span>
                          </button>
                        </div>
                      </div>
                    </Motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Image area */}
            <div className="relative h-72 w-full overflow-hidden bg-slate-900/5 sm:h-80 lg:h-auto lg:min-h-[360px] lg:w-[480px] lg:flex-shrink-0 lg:self-stretch xl:w-[520px]">
              <img
                src={post.image}
                alt={post.imageAlt || post.title}
                className="absolute inset-0 block h-full w-full object-cover object-center opacity-90"
                loading="lazy"
              />
              <div className="absolute top-5 left-5">
                <span className="inline-flex items-center gap-2 bg-white/95 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow">
                  <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                  {post.category}
                </span>
              </div>
              <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white text-sm bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow">
                <Clock className="w-4 h-4 text-white" aria-hidden />
                <span>{post.readTime}</span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
