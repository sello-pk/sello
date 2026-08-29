import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Car,
  CheckCircle2,
  FileText,
  Headset,
  IdCard,
  Info,
  Lock,
  MapPin,
  Minus,
  Plus,
  Receipt,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import SEO from "../../common/SEO";
import NewsLatter from "../../utils/NewsLatter";
import listingHero from "../../../assets/images/listingHero.png";
import punjabIcon from "../../../assets/images/verification/punjab.png";
import islamabadIcon from "../../../assets/images/verification/islamabad.png";
import sindhIcon from "../../../assets/images/verification/sindh.png";
import kpkIcon from "../../../assets/images/verification/kpk.png";
import balochistanIcon from "../../../assets/images/verification/blochistan.png";
import serviceListingsImg from "../../../assets/images/verification/1.png";
import serviceAuctionsImg from "../../../assets/images/verification/2.png";
import serviceEstimatorImg from "../../../assets/images/verification/3.png";
import serviceGuidesImg from "../../../assets/images/verification/4.png";
import ownershipIcon from "../../../assets/images/verification/ownership.png";
import registrationIcon from "../../../assets/images/verification/registration.png";
import fraudIcon from "../../../assets/images/verification/fraud.png";
import buyerProtectionIcon from "../../../assets/images/verification/buyerProtection.png";

const provinces = [
  {
    name: "Punjab",
    desc: "Verify Punjab vehicle registration records",
    url: "https://mtmis.excise.punjab.gov.pk/",
    icon: punjabIcon,
  },
  {
    name: "Islamabad",
    desc: "Verify Islamabad vehicle ownership records",
    url: "https://islamabadexcise.gov.pk/",
    icon: islamabadIcon,
  },
  {
    name: "Sindh",
    desc: "Check Sindh vehicle registration details",
    url: "https://excise.gos.pk/vehicle/vehicle_search",
    icon: sindhIcon,
  },
  {
    name: "KPK",
    desc: "Access KPK vehicle verification services",
    url: "https://www.kpexcise.gov.pk/mvrecords/",
    icon: kpkIcon,
  },
  {
    name: "Balochistan",
    desc: "Open Balochistan Excise vehicle records",
    url: "https://excise.balochistan.gov.pk/home/online-vehicle-verification/",
    icon: balochistanIcon,
  },
];

const whyVerify = [
  {
    icon: ownershipIcon,
    title: "Ownership Verification",
    desc: "Ensure the seller is the registered owner before you pay.",
    circle: "bg-green-50",
  },
  {
    icon: registrationIcon,
    title: "Registration Confirmation",
    desc: "Confirm official registration records with the vehicle.",
    circle: "bg-sky-50",
  },
  {
    icon: fraudIcon,
    title: "Fraud Prevention",
    desc: "Avoid stolen, cloned, or fraudulent vehicles.",
    circle: "bg-green-50",
  },
  {
    icon: buyerProtectionIcon,
    title: "Buyer Protection",
    desc: "Make informed and secure purchasing decisions.",
    circle: "bg-sky-50",
  },
];

const steps = [
  {
    icon: IdCard,
    title: "Enter Details",
    desc: "Provide the vehicle registration number on the official portal.",
  },
  {
    icon: Search,
    title: "We Check Records",
    desc: "Information is verified from official government sources.",
  },
  {
    icon: FileText,
    title: "Get Report",
    desc: "Review the official verification result instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Buy with Confidence",
    desc: "Make a safe and informed buying decision.",
  },
];

const verifyInfo = [
  "Owner Name",
  "Registration Number",
  "Chassis Number",
  "Engine Number",
  "Make / Model",
  "Model Year",
  "Color",
  "Registration Date",
  "Token Tax Status",
  "Tax Payment History",
  "Transfer History",
  "Fitness Certificate",
  "Insurance Status",
  "Legal Record Check",
];

const documents = [
  { icon: FileText, title: "Registration Book", desc: "Original registration issued by Excise." },
  { icon: Receipt, title: "Token Tax Paid", desc: "Valid token tax receipt." },
  { icon: IdCard, title: "CNIC of Seller", desc: "Match CNIC with registration." },
  { icon: FileText, title: "Transfer Letter", desc: "Check transfer history and letters." },
  { icon: Car, title: "Chassis Plate", desc: "Verify chassis number." },
  { icon: Wrench, title: "Engine Number", desc: "Match engine number." },
  { icon: Shield, title: "Insurance (If Any)", desc: "Check valid insurance." },
  { icon: BadgeCheck, title: "Fitness Certificate", desc: "Ensure vehicle is fitness approved." },
];

const buyingTips = [
  "Verify registration and ownership on the official provincial portal",
  "Match chassis number and engine number with the original documents",
  "Check token tax, transfer history, and tax payment status",
  "Meet the seller in a public, safe location",
  "Inspect the vehicle physically before any payment",
  "Take a test drive and review mechanical condition",
  "Complete the transfer through a trusted, legal process",
];

const guideSections = [
  {
    title: "What is online vehicle verification?",
    body: [
      "Online vehicle verification checks registration details through authorized provincial sources. Records can include registration info, vehicle specs, tax status, and other key data that varies by province.",
      "A car can look fine in photos and still have mismatched papers. Use an official registration check to confirm the seller's claims before you buy, sell, or transfer a vehicle in Pakistan.",
    ],
  },
  {
    title: "Why is car verification important before buying?",
    body: [
      "Used-car listings are easy to browse, but each deal still needs a records check. Verification helps you catch issues the seller did not mention, including mismatched engine or chassis numbers and unclear ownership history.",
      "Online records are a starting point. They do not replace a physical inspection or original document review.",
    ],
  },
  {
    title: "Punjab vehicle verification & Excise records",
    body: [
      "For Punjab-registered vehicles, use official Punjab Excise / MTMIS services to confirm registration details. Sello helps you know what to check, but official records still come from the authorized government portal.",
      "Compare the registration document, vehicle number, engine details, chassis details, and available ownership information before you pay. If anything looks off, contact Excise and Taxation first.",
    ],
  },
  {
    title: "Vehicle verification in Lahore and other cities",
    body: [
      "Verification follows where the vehicle is registered, not where it is currently parked. A Lahore-registered car should be checked through Punjab records even if it is now in another city.",
      "The same rule applies in Karachi, Islamabad, Rawalpindi, Faisalabad, and other cities. Always use the correct provincial portal for that registration.",
    ],
  },
  {
    title: "Online bike registration check",
    body: [
      "The same process applies to motorcycles. Before buying a used bike, check registration online where available, then match engine and frame numbers with the documents in person.",
      "Mechanical condition, accident damage, and missing paperwork can change both value and safety. A bike registration check is especially important when buying from an individual seller.",
    ],
  },
  {
    title: "Can you check the vehicle owner?",
    body: [
      "Public owner details vary by province, privacy rules, and what each authority publishes. Only use authorized channels for genuine purchase or transfer needs.",
      "The key step is confirming the seller has the right to sell and that ownership transfer will be completed legally. Do not rely on verbal claims alone.",
    ],
  },
  {
    title: "Registration book and smart card verification",
    body: [
      "Registration may be a book, smart card, or another government document. Before you buy, match the registration number, engine number, and chassis number on the document with the vehicle.",
      "If details do not add up, stop the transaction until they are cleared. It is easier to resolve issues before payment than after.",
    ],
  },
  {
    title: "Why physical inspection still matters",
    body: [
      "A clean registration history does not mean the car is mechanically sound. Inspect engine performance, suspension, transmission, electrics, paint, tires, accident repairs, and interior condition.",
      "For higher-value cars, a professional inspection is a smart extra step.",
    ],
  },
];

const faqs = [
  {
    q: "How does vehicle verification work on Sello?",
    a: "Choose the province where the vehicle is registered. Sello opens that province's official Excise / MTMIS portal so you can check records, then compare them with the car and documents in person.",
  },
  {
    q: "Is vehicle verification free?",
    a: "Yes. Sello does not charge for this guide. Official provincial portals are also free to use, though some offices may charge for extra printed copies or in-person services.",
  },
  {
    q: "Which provinces are currently supported?",
    a: "Punjab, Islamabad, Sindh, KPK, and Balochistan. Each card above opens that region's official verification service.",
  },
  {
    q: "Can I verify vehicle ownership details?",
    a: "Where the authority publishes them, you can review owner name, registration date, and transfer history through official sources.",
  },
  {
    q: "What information do I need to verify a vehicle?",
    a: "At minimum, the registration number. Some portals also ask for chassis or engine number. Have the original registration book or smart card with you.",
  },
  {
    q: "How accurate is the verification information?",
    a: "Records come from official provincial databases. Availability and detail vary by province, and updates may not be instant. Always confirm numbers on the vehicle itself.",
  },
  {
    q: "Can I get a printed verification report?",
    a: "Sello does not generate a separate report. If the official portal allows it, you can print or screenshot the result from that site.",
  },
  {
    q: "How long does it take to get the verification report?",
    a: "Most official portals return results immediately. If a record is missing or delayed, confirm with the relevant Excise office.",
  },
];

const stats = [
  {
    icon: ShieldCheck,
    value: "150K+",
    title: "Verified Listings",
    desc: "Every listing is checked for authenticity.",
  },
  {
    icon: Users,
    value: "80K+",
    title: "Real Sellers",
    desc: "Connect directly with genuine sellers.",
  },
  {
    icon: BadgeCheck,
    value: "1M+",
    title: "Happy Users",
    desc: "Thousands of buyers trust Sello every day.",
  },
  {
    icon: MapPin,
    value: "25+",
    title: "Cities Covered",
    desc: "From big cities to small towns across Pakistan.",
  },
];

const exploreLinks = [
  {
    to: "/car-estimator",
    title: "AI Car Estimator",
    desc: "Get an instant market range for a used car in Pakistan.",
    cta: "Try Estimator",
    image: serviceEstimatorImg,
  },
  {
    to: "/listings",
    title: "Car Listings",
    desc: "Browse cars for sale across major cities and brands.",
    cta: "Browse Cars",
    image: serviceListingsImg,
  },
  {
    to: "/auctions",
    title: "Live Auctions",
    desc: "Bid on inspected cars with a transparent, live process.",
    cta: "View Auctions",
    image: serviceAuctionsImg,
  },
  {
    to: "/blog",
    title: "Car Buying Guides",
    desc: "Checks, tips, and guides to help you buy with more confidence.",
    cta: "Read Guides",
    image: serviceGuidesImg,
  },
];

const trustBar = [
  { icon: BadgeCheck, label: "Official & Verified Data Sources" },
  { icon: ShieldCheck, label: "Bank-level Data Security" },
  { icon: Lock, label: "100% Confidential Information" },
  { icon: Headset, label: "Dedicated 24/7 Support" },
];

const AccordionItem = ({ title, children, open, onToggle, headingAs = "h3" }) => {
  const Heading = headingAs;
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
        aria-expanded={open}
      >
        <Heading className="text-base font-semibold text-slate-900">{title}</Heading>
        <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </span>
      </button>
      {open ? (
        <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed space-y-3">
          {children}
        </div>
      ) : null}
    </div>
  );
};

const scrollToId = (id) => (event) => {
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const VehicleVerificationPage = () => {
  const [openGuide, setOpenGuide] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-white">
      <SEO
        title="Online Vehicle Verification in Pakistan | Check Car Details"
        description="Verify your car or bike online through Sello. Check vehicle registration info and key details before you buy or sell a vehicle in Pakistan."
        keywords="online vehicle verification Pakistan, car verification Pakistan, vehicle registration check, MTMIS, bike registration check"
      />

      <section className="relative w-full overflow-hidden min-h-[52vh] md:h-[52vh] bg-gray-200">
        <img
          src={listingHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
          decoding="async"
          width="1200"
          height="600"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/55 via-slate-900/70 to-slate-900/80" />
        <div className="relative z-10 flex min-h-[52vh] md:h-[52vh] flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white text-primary-500 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-5 shadow-sm">
              <Sparkles className="w-4 h-4" />
              Official MTMIS data sources
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              Online Vehicle Verification in Pakistan
            </h1>
            <p className="text-base sm:text-lg text-gray-100 mb-8">
              Check car or bike registration details before you buy or sell.
              Open the official portal for your province, then compare records
              with the vehicle in person.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <a
                href="#select-province"
                onClick={scrollToId("select-province")}
                className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary-500/25"
              >
                <Search className="w-4 h-4" />
                Verify vehicle
              </a>
              <a
                href="#how-it-works"
                onClick={scrollToId("how-it-works")}
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
              >
                How it works
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-primary-500" /> Secure
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Building2 className="w-4 h-4 text-green-400" /> Official sources
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                <Lock className="w-4 h-4 text-blue-300" /> Confidential
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="select-province" className="scroll-mt-24 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Select Your Province
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Choose your province to verify vehicle details and ownership records
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {provinces.map((province) => (
              <a
                key={province.name}
                href={province.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-24 h-24 mb-5 flex items-center justify-center">
                  <img
                    src={province.icon}
                    alt=""
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                  {province.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">
                  {province.desc}
                </p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-500 text-primary-500 text-sm font-semibold px-4 py-2 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  Verify Vehicle <ArrowRight className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Why Vehicle Verification Matters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyVerify.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 text-center"
              >
                <div
                  className={`w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center ${item.circle}`}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                Smart Buying Tips
              </h2>
              <div className="space-y-4">
                {buyingTips.map((tip) => (
                  <div key={tip} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-slate-600 leading-relaxed">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-50 min-h-[280px] lg:min-h-[360px]">
              <img
                src={serviceGuidesImg}
                alt=""
                className="w-full h-full object-cover min-h-[280px] lg:min-h-[360px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            How Vehicle Verification Works?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((item, i) => (
              <div key={item.title} className="relative text-center px-2">
                {i < steps.length - 1 ? (
                  <ArrowRight
                    className="hidden lg:block absolute top-10 -right-3 w-6 h-6 text-slate-300"
                    aria-hidden
                  />
                ) : null}
                <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-9 h-9 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              Information You Can Verify
            </h2>
            <div className="grid lg:grid-cols-[1fr_1fr_minmax(220px,280px)] gap-8 items-start">
              <div className="space-y-3">
                {verifyInfo.slice(0, 7).map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {verifyInfo.slice(7).map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-primary-50 px-6 py-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  100% Confidential
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Your information is safe with us. We never share your data with
                  anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Documents You Should Check
          </h2>
          <p className="text-base text-slate-500 mb-8">
            Always review these documents before finalizing any vehicle purchase.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.title}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                  <doc.icon className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{doc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="what-is-verification" className="scroll-mt-24 py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Vehicle Verification Guide
          </h2>
          <div className="space-y-3">
            {guideSections.map((section, i) => (
              <AccordionItem
                key={section.title}
                title={section.title}
                open={openGuide === i}
                onToggle={() => setOpenGuide(openGuide === i ? null : i)}
                headingAs="h3"
              >
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={faq.q}
                title={faq.q}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                headingAs="h3"
              >
                <p>{faq.a}</p>
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#050B20] px-6 py-12 sm:px-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white">
                Why Millions Trust Sello
              </h2>
              <p className="text-slate-300 text-base mt-2">
                Pakistan's #1 Automotive Marketplace
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-stretch">
              {stats.map((stat) => (
                <div key={stat.title} className="text-center lg:text-left">
                  <div className="w-12 h-12 mx-auto lg:mx-0 mb-3 rounded-full bg-white/10 flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-primary-500">
                    {stat.value}
                  </div>
                  <div className="text-white font-semibold mt-1">{stat.title}</div>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              ))}
              <div className="rounded-2xl border border-white/20 px-5 py-6 text-center flex flex-col items-center justify-center">
                <div className="text-3xl font-bold text-white mb-2">4.8/5</div>
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Based on 10,000+ reviews from our users
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
            Explore More Services on Sello
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {exploreLinks.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group flex items-stretch bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[170px] hover:shadow-md transition-shadow"
              >
                <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4">
                    {item.desc}
                  </p>
                  <span className="inline-flex items-center gap-1.5 self-start bg-primary-500 text-white text-sm font-semibold rounded-lg px-4 py-2 group-hover:opacity-90 transition-opacity">
                    {item.cta} <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="w-[42%] sm:w-[46%] bg-slate-50 relative">
                  <img
                    src={item.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-slate-100 px-5 sm:px-8 py-6">
            <Lock
              className="hidden sm:block absolute right-8 top-1/2 -translate-y-1/2 w-24 h-24 text-slate-300/70"
              aria-hidden
            />
            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-slate-600" />
              </div>
              <div className="pr-0 sm:pr-24">
                <h3 className="font-bold text-slate-900 mb-1">Disclaimer</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Vehicle verification information is provided through official
                  provincial data sources where available. Sello does not
                  guarantee the accuracy, completeness, or real-time availability
                  of third-party records. Independently verify all vehicle
                  information before making a purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6 text-slate-500 text-xs sm:text-sm">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {trustBar.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <p className="lg:text-right whitespace-nowrap">
              © {new Date().getFullYear()} Sello. All Rights Reserved.
            </p>
          </div>
        </div>
      </section>

      <NewsLatter />
    </div>
  );
};

export default VehicleVerificationPage;
