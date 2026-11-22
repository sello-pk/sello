import { useState } from "react";
import { FaqAccordionItem } from "../common/FaqAccordion";

export default function Faqs() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "What is SELLO.?",
      a: "SELLO is a web based car market in Pakistan. Here, people can. Sell cars, bikes, electric bikes, trucks, vans and other vehicles.",
    },
    {
      q: "Can I sell my car for free on SELLO?",
      a: "Yes, you can put your vehicle on SELLO. Reach out to people who might want to buy it through the site.",
    },
    {
      q: "Can I find cars and bikes across Pakistan?",
      a: "Yes, SELLO has vehicle ads from cities in Pakistan. This makes it simpler to look through the cars and bikes that're out there.",
    },
    {
      q: "Does SELLO offer AI car price estimation?",
      a: "Yes, SELLO has an AI Car Price Estimator and Resale Value tool. These help you look into estimated vehicle prices and what your vehicle might be worth on.",
    },
    {
      q: "Does SELLO offer online vehicle auctions?",
      a: "Yes, approved registered dealers. Checked partners can look into and take part in vehicle auctions on SELLO. This depends on the rules of each auction.",
    },
  ];

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
