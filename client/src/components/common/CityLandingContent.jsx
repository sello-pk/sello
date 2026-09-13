import React, { useState } from "react";
import { ChevronDown, ListChecks, Sparkles } from "lucide-react";
import StructuredData from "./StructuredData";

const AccordionItem = ({ title, children, open, onToggle }) => (
  <div
    className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
      open
        ? "border-primary-500/30 bg-white shadow-lg shadow-primary-500/5"
        : "border-slate-100 bg-white shadow-sm hover:shadow-md"
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="w-full px-5 sm:px-6 py-5 text-left flex items-center justify-between gap-4 group"
      aria-expanded={open}
    >
      <h3
        className={`text-base sm:text-lg font-semibold transition-colors ${
          open ? "text-primary-500" : "text-slate-900 group-hover:text-primary-500"
        }`}
      >
        {title}
      </h3>
      <span
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
          open
            ? "bg-gradient-to-br from-[#FFA602] to-amber-500 text-white rotate-180"
            : "bg-slate-100 text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-500"
        }`}
      >
        <ChevronDown className="w-4 h-4" />
      </span>
    </button>
    <div
      className={`grid transition-all duration-300 ${
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="overflow-hidden">
        <div className="px-5 sm:px-6 pb-6 text-slate-600 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-4">
          {children}
        </div>
      </div>
    </div>
  </div>
);

const CityLandingContent = ({ content, cityName }) => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-primary-50/30 to-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[42rem] h-[42rem] bg-primary-500 blur-3xl opacity-[0.07] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-amber-300 blur-3xl opacity-[0.06] rounded-full" />
      </div>

      <StructuredData.FAQSchema
        items={(content?.faqs || []).map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {content?.priceTable?.rows?.length > 0 ? (
          <div className="mb-16 sm:mb-20">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 bg-white text-primary-500 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-primary-500/15 mb-5">
                <Sparkles className="w-4 h-4" />
                {cityName} Price Guide
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                {content.priceTable.title}
              </h2>
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="w-24 h-1.5 bg-primary-200 rounded-full" />
                <div className="w-3 h-3 bg-primary-500 rounded-full" />
                <div className="w-24 h-1.5 bg-primary-200 rounded-full" />
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 sm:px-8 py-3.5 font-semibold text-gray-900">
                      Car Model
                    </th>
                    <th className="text-left px-6 sm:px-8 py-3.5 font-semibold text-gray-900">
                      Price Range
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {content.priceTable.rows.map((row, i) => (
                    <tr
                      key={row.model}
                      className={`border-b border-gray-100 last:border-b-0 ${
                        i % 2 !== 0 ? "bg-gray-50/50" : ""
                      }`}
                    >
                      <td className="px-6 sm:px-8 py-4 font-medium text-gray-900">
                        {row.model}
                      </td>
                      <td className="px-6 sm:px-8 py-4 text-gray-600">
                        {row.priceRange}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {content.intro ? (
                <div className="px-6 sm:px-8 py-4 border-t border-gray-100">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {content.intro}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {content?.sections?.length > 0 ? (
          <div className="mb-16 sm:mb-20 space-y-6">
            {content.sections.map((section, idx) => (
              <article
                key={section.heading}
                className="relative overflow-hidden rounded-3xl border border-gray-100 bg-[#FDFBF7] shadow-lg shadow-gray-900/5"
              >
                <div className="pointer-events-none absolute -top-6 -right-6 font-bold text-[10rem] leading-none text-primary-500/[0.06] select-none">
                  {String(idx + 1).padStart(2, "0")}
                </div>
                <div className="relative p-6 sm:p-10 lg:p-12">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFA602] to-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/25">
                      <ListChecks className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      {section.heading}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {section.paragraphs?.map((paragraph) => (
                      <p
                        key={paragraph}
                        className="text-gray-600 leading-relaxed sm:text-base text-[15px]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {content?.faqs?.length > 0 ? (
          <div>
            <div className="text-center max-w-3xl mx-auto mb-10">
              <div className="inline-flex items-center gap-2 bg-white text-primary-500 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm border border-primary-500/15 mb-5">
                <Sparkles className="w-4 h-4" />
                Got Questions?
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                FAQs About{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFA602] to-amber-500">
                  Cars for Sale in {cityName}
                </span>
              </h2>
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="w-24 h-1.5 bg-primary-200 rounded-full" />
                <div className="w-3 h-3 bg-primary-500 rounded-full" />
                <div className="w-24 h-1.5 bg-primary-200 rounded-full" />
              </div>
            </div>
            <div className="space-y-3 max-w-3xl mx-auto">
              {content.faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.question}
                  title={faq.question}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <p>{faq.answer}</p>
                </AccordionItem>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default CityLandingContent;