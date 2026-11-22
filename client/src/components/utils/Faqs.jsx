import { useState } from "react";
import { FaqAccordionItem } from "../common/FaqAccordion";

export default function Faqs({ faqs }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FaqAccordionItem
              key={faq.q}
              title={faq.q}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              headingAs="h3"
            >
              <p>{faq.a}</p>
            </FaqAccordionItem>
          ))}
        </div>
      </div>
    </section>
  );
}
