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
      question: "How do I create an account?",
      answer:
        "Click on 'Sign Up' in the top right corner, enter your email and password, verify your email, and complete your profile setup.",
    },
    {
      question: "How do I post a car for sale?",
      answer:
        "Log in to your account, click 'Post Ad' or 'Create Post', fill in all vehicle details, upload photos, and publish your listing.",
    },
    {
      question: "What payment methods are accepted?",
      answer:
        "We accept credit/debit cards (Visa, Mastercard) and bank transfers for subscriptions and premium features.",
    },
    {
      question: "How do I contact a seller?",
      answer:
        "Click on any listing to view details, then use the 'Call', 'Chat', or 'Message' buttons to contact the seller directly.",
    },
    {
      question: "Can I edit my listing after posting?",
      answer:
        "Yes, you can edit your listing anytime from the 'My Listings' section in your profile. Click on the listing and select 'Edit'.",
    },
    {
      question: "How do I boost my listing?",
      answer:
        "Go to your listing, click 'Boost' or 'Promote', choose a boost package, and complete the payment. Boosted listings appear at the top of search results.",
    },
    {
      question: "What should I do if I find a suspicious listing?",
      answer:
        "Report it immediately using the 'Report' button on the listing page, or contact our support team at info@sello.pk.",
    },
    {
      question: "How do I cancel my subscription?",
      answer:
        "Go to your Profile → Subscription section, click 'Cancel Auto-Renewal'. Your subscription will remain active until the end of the billing period.",
    },
    {
      question: "Can I save listings to view later?",
      answer:
        "Yes, click the heart icon on any listing to save it. View all saved listings in the 'Saved Cars' section of your profile.",
    },
    {
      question: "How do I delete my account?",
      answer:
        "Contact our support team at info@sello.pk with your account details, and we'll assist you with account deletion.",
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
                    <p className="text-gray-700">{faq.answer}</p>
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
