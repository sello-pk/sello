import React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  MapPin,
  Scale,
  AlertTriangle,
  Clock,
  Wallet,
  HelpCircle,
  Phone,
  Mail,
  Building2,
} from "lucide-react";

// ==================== CUSTOM COMPONENTS ====================

// Card Component
const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};

const CardContent = ({ children, className = "" }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

const CardHeader = ({ children, className = "" }) => {
  return <div className={`px-6 pt-6 pb-4 ${className}`}>{children}</div>;
};

const CardTitle = ({ children, className = "" }) => {
  return (
    <h2 className={`text-xl font-semibold text-slate-900 ${className}`}>
      {children}
    </h2>
  );
};

// Accordion Components
const Accordion = ({ children, className = "" }) => {
  const [openItem, setOpenItem] = React.useState(null);

  return (
    <div className={`space-y-2 ${className}`}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          openItem,
          setOpenItem,
        }),
      )}
    </div>
  );
};

const AccordionItem = ({ children, value, openItem, setOpenItem }) => {
  const isOpen = openItem === value;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isOpen,
          onToggle: () => setOpenItem(isOpen ? null : value),
        }),
      )}
    </div>
  );
};

const AccordionTrigger = ({ children, isOpen, onToggle, className = "" }) => {
  return (
    <button
      onClick={onToggle}
      className={`w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${className}`}
    >
      <span className="font-medium text-slate-900">{children}</span>
      <svg
        className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
};

const AccordionContent = ({ children, isOpen, className = "" }) => {
  return (
    <div
      className={`px-4 pb-3 text-slate-600 ${isOpen ? "block" : "hidden"} ${className}`}
    >
      {children}
    </div>
  );
};

export default function TrustLegal() {
  const sections = [
    {
      icon: Shield,
      title: "Platform Role & Disclaimer",
      content: `Okara Auto Auction operates as a facilitator and marketplace platform connecting vehicle sellers with buyers through an auction format. 

We are NOT the owners of the vehicles listed on our platform. Each vehicle is owned by individual sellers who choose to list their vehicles for auction through our yard.

The platform facilitates:
• Vehicle listing and inspection
• Real-time bidding (online and offline)
• Payment processing
• Documentation assistance

We do not guarantee the condition, history, or authenticity of any vehicle beyond our standard inspection. Buyers are encouraged to conduct their own due diligence.`,
    },
    {
      icon: Scale,
      title: "Auction Rules & Terms",
      content: `1. BIDDING ELIGIBILITY
- All bidders must complete identity verification (CNIC)
- A refundable token deposit of PKR 10,000 is required
- Both online and offline bids are combined in real-time

2. AUCTION SCHEDULE
- Auctions are held every second day
- Auction hours: 10:00 AM to 6:00 PM
- All times are Pakistan Standard Time (PST)

3. WINNING BIDS
- The highest bid at auction end wins the vehicle
- Reserve price must be met for the sale to be valid
- Winning bidder is notified immediately

4. PAYMENT TERMS
- Full payment must be completed within 24-48 hours
- Token deposit is applied to the winning amount
- Accepted methods: Bank Transfer, JazzCash, EasyPaisa

5. VEHICLE COLLECTION
- Vehicles must be collected from Okara Auction Yard
- Collection within 7 days of payment completion
- Required documents: Original CNIC, Payment Receipt, Win Confirmation`,
    },
    {
      icon: Wallet,
      title: "Refund & Cancellation Policy",
      content: `TOKEN DEPOSIT REFUNDS
- Full refund if you don't win any auction
- Refund processed within 5-7 business days
- Original payment method used for refund

NON-REFUNDABLE SCENARIOS
- Winning an auction but failing to complete payment
- Violation of platform terms and conditions
- Fraudulent bidding activity

CANCELLATION POLICY
- Bidders cannot cancel bids once placed
- Sellers may withdraw vehicles before auction start only
- Auction cancellation by platform: Full token refund

DISPUTES
- All disputes must be raised within 48 hours
- Platform decision is final in case of disputes
- Documentation required for all claims`,
    },
    {
      icon: AlertTriangle,
      title: "Liability Limitations",
      content: `Okara Auto Auction shall not be liable for:

1. Vehicle Condition: Beyond our standard inspection, we do not guarantee mechanical condition, accident history, or undisclosed defects.

2. Documentation: While we verify basic documents, buyers must ensure complete transfer requirements are met.

3. Third-Party Actions: We are not responsible for actions of sellers, buyers, or service providers.

4. Market Value: Auction prices are determined by bidding activity and may not reflect market value.

5. Technical Issues: While we strive for uninterrupted service, we are not liable for technical failures during auctions.

6. Force Majeure: Events beyond our control including natural disasters, government actions, or infrastructure failures.

By participating in our auctions, you acknowledge and accept these limitations.`,
    },
  ];

  const faqs = [
    {
      question: "How do I verify if a car is genuine?",
      answer:
        "All vehicles undergo our standard inspection at the Okara yard. You can also request the inspection report and view the vehicle in person before bidding. We recommend conducting your own due diligence for high-value purchases.",
    },
    {
      question: "What happens if I win but cannot pay within 48 hours?",
      answer:
        "Failure to complete payment within 48 hours may result in forfeiture of your token deposit, temporary or permanent ban from future auctions, and the vehicle being re-listed for the next auction.",
    },
    {
      question: "Can I get a refund if a vehicle has undisclosed issues?",
      answer:
        "Once payment is completed and the vehicle is collected, we cannot process refunds for previously undisclosed issues. We strongly recommend inspecting the vehicle before bidding and reviewing the inspection report.",
    },
    {
      question: "How are offline and online bids combined?",
      answer:
        "Our auctioneer enters offline bids in real-time into the system. All bids, whether online or from the floor, are displayed in the same bid history and compete equally.",
    },
    {
      question: "Is my token deposit safe?",
      answer:
        "Yes, your token deposit is held securely and is fully refundable if you do not win any auction. It is applied to your winning bid amount if you win.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-orange-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trust & Legal
            </h1>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Understanding our platform policies, terms of service, and your
              rights as a buyer or seller
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 mb-8 text-white"
        >
          <div className="flex items-start gap-4">
            <Building2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-xl mb-2">Physical Auction Yard</h3>
              <p className="text-white/80 mb-4">
                All vehicles are physically located at our auction yard. You are
                welcome to visit and inspect vehicles before bidding.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  RFJW+4XR Okara, Pakistan
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Mon-Sat: 9:00 AM - 6:00 PM
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Sections */}
        <div className="space-y-6 mb-12">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-orange-600" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-600 whitespace-pre-line leading-relaxed">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                </div>
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-slate-900 rounded-2xl p-8 text-center"
        >
          <h3 className="text-xl font-bold text-white mb-4">Have Questions?</h3>
          <p className="text-slate-400 mb-6">
            Our support team is here to help with any questions about our
            policies or platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+923134211023"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <Phone className="w-5 h-5" />
              +923134211023
            </a>
            <a
              href="mailto:info@sello.pk"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <Mail className="w-5 h-5" />
              info@sello.pk
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
