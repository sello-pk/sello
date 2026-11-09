import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

export const FaqAccordionItem = ({
  title,
  children,
  open,
  onToggle,
  headingAs = "h3",
  className = "",
  contentClassName = "",
  buttonClassName = "",
}) => {
  const Heading = headingAs || "h3";

  return (
    <div
      className={`rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-md ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className={`w-full px-5 sm:px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer group ${buttonClassName}`}
        aria-expanded={open}
      >
        <Heading className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
          {title}
        </Heading>
        <span
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            open
              ? "bg-slate-100 text-slate-700"
              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-700"
          }`}
          aria-hidden="true"
        >
          {open ? (
            <Minus className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <Plus className="w-4 h-4 stroke-[2.2]" />
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div
              className={`px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 text-sm leading-relaxed space-y-3 ${contentClassName}`}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FaqAccordion = ({
  items = [],
  openIndex,
  onToggle,
  headingAs = "h3",
  className = "space-y-3",
  renderAnswer,
}) => {
  return (
    <div className={className}>
      {items.map((item, index) => {
        const title = item.q || item.question || item.title;
        const answer = item.a || item.answer || item.desc || item.content;
        const isOpen = openIndex === index;

        return (
          <FaqAccordionItem
            key={index}
            title={title}
            open={isOpen}
            onToggle={() => onToggle(index)}
            headingAs={headingAs}
          >
            {renderAnswer ? renderAnswer(item, index) : <p>{answer}</p>}
          </FaqAccordionItem>
        );
      })}
    </div>
  );
};

export default FaqAccordion;
