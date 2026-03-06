import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronUp,
  FiMail,
  FiPhone,
  FiMessageCircle,
} from "react-icons/fi";

const FAQs = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How to create a login for Sello?",
      answer:
        "To get started sign up by clicking the Register button at the top right of the home page, put in your email or mobile number, and we'll walk you through the verification process. Upon verification you will have access to all of the Sello features which include auctions, listings, and AI tools.",
    },
    {
      question: "Do I have to pay to list my car on Sello?",
      answer:
        "Sure! Put up your free car on Sello by going into the proper listing section, upload the car info and photos, and hit submit for your car to be looked at. Once your listing is approved your car will go live for buyers in Pakistan.",
    },
    {
      question: "How do I get involved in an auction?",
      answer:
        "To enter an auction you must go through identity verification using your CNIC and also pay the refundable token deposit. Once in the system you may place bids in live auctions which may be online or offline. The highest bid at auction end stands if it meets the reserve price.",
    },
    {
      question: "May I edit my live listing?",
      answer:
        "Yes that you may change some listing info before we publish it. But once your vehicle is live in the auction and out to go we may put restrictions on those changes. For listing update requests go to support.",
    },
    {
      question: "How soon can I expect to be paid after selling my car?",
      answer:
        "Once a car sale is confirmed and all paperwork is completed payment processing usually takes 3-7 business days which may vary by payout method and verification status.",
    },
    {
      question:
        "If I don't win the auction, will my token deposit be returned?",
      answer:
        "Yes. If you do not win a vehicle in an auction your token deposit will be returned to you. We'll get back to you within 5-7 business days which also will be through the original means of payment.",
    },
    {
      question: "What does the Sello AI Car Price Estimator do?",
      answer:
        "AI Car Price Estimate we put together which is based on what you input like make, model, year, mileage, and condition. The price we present is a foray which may change with inspection, documentation, and market demand.",
    },
    {
      question: "May I check out the vehicle before I place my bid?",
      answer:
        "Yes. All auction cars are present at the auction yard. We recommend that you go see them in person, take a look, read the reports and also do your due diligence before you bid.",
    },
    {
      question:
        "What is the set of documents needed for collection of a vehicle post auction?",
      answer:
        "To retrieve your vehicle, you must present:\nOriginal CNIC\nPayment receipt\nAuction win confirmation\nVehicle pick up is to be completed within the specified time of full payment.",
    },
    {
      question: "What has happened in the case of a buyer and seller dispute?",
      answer:
        "All issues to be brought to our attention within 48 hours of the auction or transaction. We may ask for supporting documentation. We will look into the case and report back to you in accordance with our policies.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <FiChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <FiChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 whitespace-pre-line">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <button
                onClick={() => navigate("/contact")}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors"
              >
                <FiMessageCircle className="text-xl" />
                Contact Support
              </button>
              <a
                href="tel:+923134211023"
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiPhone className="text-xl" />
                +923 134 211 023
              </a>
              <a
                href="mailto:info@sello.pk"
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiMail className="text-xl" />
                info@sello.pk
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQs;
