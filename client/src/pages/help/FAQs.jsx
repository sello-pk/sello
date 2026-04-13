import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../../components/common/SEO";
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
    // Account & Registration
    {
      question: "How to create a login for Sello?",
      answer:
        "To get started sign up by clicking the Register button at the top right of the home page, put in your email or mobile number, and we'll walk you through the verification process. Upon verification you will have access to all of the Sello features which include auctions, listings, and AI tools.",
    },
    {
      question: "Do I have to have an account to place an order?",
      answer:
        "Now you can check out as a guest, we also find that creating an account is better for tracking your orders and managing details.",
    },
    {
      question: "How do I reset my password?",
      answer:
        "Go to 'Forgot Password' on the login page and follow the instructions.",
    },
    {
      question: "Is my personal information secure?",
      answer:
        "We do have strict privacy policies in place and do not share your data with third parties.",
    },
    
    // Service & Availability
    {
      question: "Is Sello.pk available all over Pakistan?",
      answer:
        "Yes, Sello.pk serves most cities in Pakistan. May not have delivery in some remote areas.",
    },
    {
      question: "How can I contact customer support?",
      answer:
        "We have support teams for email, WhatsApp, and our website.",
    },
    {
      question: "Are all products on Sello.pk authentic?",
      answer:
        "We can assure you that every product on Sello.pk is real.",
    },
    
    // Ordering & Payment
    {
      question: "Can I place orders through WhatsApp or by phone?",
      answer:
        "Presently, we only accept online orders for accuracy and tracking.",
    },
    {
      question: "What happens after I place an order?",
      answer:
        "You will get an email or SMS with your order info.",
    },
    {
      question: "Can I change my order after you place it?",
      answer:
        "Before an order ships out you can request changes by reaching out to support.",
    },
    {
      question: "Why was my order cancelled?",
      answer:
        "Orders will be canceled for several reasons which may include out of stock products, inaccurate info, or verification issues.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept cash in advance at the time of delivery, bank transfer, and also online payment.",
    },
    {
      question: "Is it safe to use Sello.pk for online payment?",
      answer:
        "We do use secure payment gateways to protect your data.",
    },
    {
      question: "Can I pay for some of it online and some on delivery?",
      answer:
        "Currently, partial payments are not supported.",
    },
    
    // Car Selling & Listings
    {
      question: "Do I have to pay to list my car on Sello?",
      answer:
        "Sure! Put up your free car on Sello by going into the proper listing section, upload the car info and photos, and hit submit for your car to be looked at. Once your listing is approved your car will go live for buyers in Pakistan.",
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
    
    // Auctions
    {
      question: "How do I get involved in an auction?",
      answer:
        "To enter an auction you must go through identity verification using your CNIC and also pay the refundable token deposit. Once in the system you may place bids in live auctions which may be online or offline. The highest bid at auction end stands if it meets the reserve price.",
    },
    {
      question:
        "If I don't win the auction, will my token deposit be returned?",
      answer:
        "Yes. If you do not win a vehicle in an auction your token deposit will be returned to you. We'll get back to you within 5-7 business days which also will be through the original means of payment.",
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
    
    // Tools & Features
    {
      question: "What does the Sello AI Car Price Estimator do?",
      answer:
        "AI Car Price Estimate we put together which is based on what you input like make, model, year, mileage, and condition. The price we present is a foray which may change with inspection, documentation, and market demand.",
    },
    
    // Delivery & Tracking
    {
      question: "How long does delivery take?",
      answer:
        "Delivery time is 2 to 5 business days by location.",
    },
    {
      question: "Do you offer same-day delivery?",
      answer:
        "At present same day delivery is not available.",
    },
    {
      question: "How can I track my order?",
      answer:
        "Once your package has shipped you will find the tracking info at the bottom of your shipping confirmation email.",
    },
    {
      question: "What if my order is delayed?",
      answer:
        "Delays will be experienced at times due to weather and logistics which is beyond our control. Please check in with us for the latest info.",
    },
    
    // Returns & Refunds
    {
      question: "May I return a product that I don't like?",
      answer:
        "Yes, we accept returns during the policy time frame if the product is as is presented.",
    },
    {
      question: "How do I request a refund?",
      answer:
        "You may file a request for refund from your account or contact support.",
    },
    {
      question: "How long do you wait for a refund?",
      answer:
        "Refunds are issued within 5 to 10 workdays after approval.",
    },
  ];

  return (
    <>
      <SEO
        title="FAQs - Common Questions About Buying & Selling Cars | Sello.pk"
        description="Find answers to frequently asked questions about buying cars, selling vehicles, auctions, payments, and account management on Sello.pk."
        keywords="FAQs, car buying questions, selling cars help, auction FAQs, payment questions"
        canonical="https://sello.pk/help/faqs"
      />
      <div className="min-h-screen bg-gray-50">
        {/* H1 for SEO */}
        <h1 className="sr-only">Frequently Asked Questions - Sello.pk Help Center</h1>
        {/* Main Content */}
        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
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
                  <div
                    id={`faq-answer-${index}`}
                    className="px-6 py-4 bg-gray-50 border-t border-gray-200"
                  >
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
    </>
  );
};

export default FAQs;
