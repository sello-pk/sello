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
      question:
        "What is the best way to check if a car at auction is authentic?",
      answer:
        "At all times of which it is reported at the Okara Auction Yard all vehicles go through a standard inspection. We ask that you do your research which may include mechanical checks or get in touch with an expert before you bid. Also we recommend you to do your due diligence.",
    },
    {
      question:
        "What happens when I am successful in an auction but then can't process the payment in time?",
      answer:
        "If within 24 to 48 hours we don't see full payment your token may be subject to forfeiture and at that time your account may be put on temporary or permanent hold. Also at that time the vehicle may be put back up for sale in the next auction.",
    },
    {
      question:
        "Can I get a refund for a vehicle which has issues that were not disclosed?",
      answer:
        "Once we have received your payment and you have picked up the vehicle, we do not issue refunds for any unknown issues. Also at the time of placing your bid we advise you to do a personal inspection and to go over the inspection report we have prepared.",
    },
    {
      question: "How do offline and online bids play out in an auction?",
      answer:
        "Offline and in the digital domain we combine your bids in real time. Our auctioneers enter all offline bids in the system and what you will see is that both offline and online bids' activity is out there in the open at the same time which gives you the true picture of competition.",
    },
    {
      question: "Is your deposit safe and refundable?",
      answer:
        "Yes. Your funds are secure and we will return them in full if you do not win any auctions. For those that do win, the deposit will go towards your total due. We process refunds within 5-7 business days back to the same payment method you used.",
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
