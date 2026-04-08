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
import { images } from "../../../assets/assets";
import SEO from "../../../components/common/SEO";

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
      className={`px-4 pb-3 text-slate-500 ${isOpen ? "block" : "hidden"} ${className}`}
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
    <>
      <SEO
        title="Auction Terms, Trust & Legal Information | Sello.pk"
        description="Read auction terms, buyer guidelines, legal disclaimers, refunds, payment rules, and support information for Sello.pk car auctions in Pakistan."
        canonical="https://sello.pk/auctions/trust-legal"
      />
      <div className="min-h-screen bg-slate-50">
      {/* Hero header — responsive height, type scale, safe padding */}
      <header className="relative w-full overflow-hidden">
        <div className="relative flex min-h-[200px] h-[28vh] sm:min-h-[240px] sm:h-[32vh] md:h-[34vh] lg:h-[38vh] max-h-[420px] md:max-h-none items-center justify-center">
          <img
            src={images.trustLegal}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[#050B20]/70" aria-hidden />
          <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 flex flex-col items-center text-center gap-2 sm:gap-3">
            <div className="bg-primary-500 p-2.5 sm:p-3 rounded-full shadow-lg ring-4 ring-white/10">
              <FileText
                className="h-6 w-6 sm:h-7 sm:w-7 text-white shrink-0"
                aria-hidden
              />
            </div>
            <h1 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Trust &amp; Legal
            </h1>
            <p className="text-white/90 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Understanding our platform policies, terms of service, and your
              rights as a buyer or seller
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary-500 to-primary-400 rounded-2xl p-6 mb-8 text-white"
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
                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary-500" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-slate-500 whitespace-pre-line leading-relaxed">
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
                  <HelpCircle className="w-5 h-5 text-blue-500" />
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
                    <AccordionContent className="text-slate-500">
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
          className="mt-8 rounded-2xl p-6 sm:p-8 text-center border border-primary-200/80 bg-gradient-to-br from-primary-50 via-white to-primary-100 shadow-sm"
        >
          <h3 className="text-xl font-bold text-black mb-4">Have Questions?</h3>
          <p className="text-slate-600 mb-6">
            Our support team is here to help with any questions about our
            policies or platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+923134211023"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary rounded-xl text-white hover:bg-opacity-80 transition-colors"
            >
              <Phone className="w-5 h-5" />
              +923134211023
            </a>
            <a
              href="mailto:info@sello.pk"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-primary rounded-xl text-white hover:opacity-80 transition-colors"
            >
              <Mail className="w-5 h-5" />
              info@sello.pk
            </a>
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
}
