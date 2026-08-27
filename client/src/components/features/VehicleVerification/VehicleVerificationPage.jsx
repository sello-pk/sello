import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Car,
  Castle,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ExternalLink,
  FileText,
  IdCard,
  Landmark,
  Lock,
  MapPin,
  Mountain,
  Receipt,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import SEO from "../../common/SEO";
import NewsLatter from "../../utils/NewsLatter";
import listingHero from "../../../assets/images/listingHero.png";

const provinces = [
  {
    name: "Punjab",
    desc: "Verify Punjab vehicle registration records",
    portal: "MTMIS Punjab",
    url: "https://mtmis.excise.punjab.gov.pk/",
    Icon: Landmark,
  },
  {
    name: "Islamabad",
    desc: "Verify Islamabad vehicle ownership records",
    portal: "Islamabad Excise",
    url: "https://islamabadexcise.gov.pk/",
    Icon: Building2,
  },
  {
    name: "Sindh",
    desc: "Check Sindh vehicle registration details",
    portal: "Sindh Excise",
    url: "https://excise.gos.pk/vehicle/vehicle_search",
    Icon: Castle,
  },
  {
    name: "KPK",
    desc: "Access KPK vehicle verification services",
    portal: "KPK Excise",
    url: "https://www.kpexcise.gov.pk/mvrecords/",
    Icon: Mountain,
  },
];

const whyVerify = [
  {
    icon: ShieldCheck,
    title: "Ownership verification",
    desc: "Confirm the seller matches the registered owner before you pay.",
  },
  {
    icon: ClipboardCheck,
    title: "Registration check",
    desc: "Match make, model, engine, and chassis with official records.",
  },
  {
    icon: Shield,
    title: "Fraud prevention",
    desc: "Spot stolen, cloned, or mismatched vehicles early.",
  },
  {
    icon: Lock,
    title: "Buyer protection",
    desc: "Decide with documents and records, not just listing photos.",
  },
];

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Choose province",
    desc: "Open the official portal for where the vehicle is registered.",
  },
  {
    step: "02",
    icon: FileText,
    title: "Enter details",
    desc: "Submit the registration number and any required vehicle info.",
  },
  {
    step: "03",
    icon: ClipboardCheck,
    title: "Compare records",
    desc: "Check owner, chassis, engine, and tax status against the car.",
  },
  {
    step: "04",
    icon: ShieldCheck,
    title: "Buy with confidence",
    desc: "Inspect in person, then complete a legal ownership transfer.",
  },
];

const verifyInfo = [
  "Owner name",
  "Registration number",
  "Chassis number",
  "Engine number",
  "Make / model / year",
  "Color",
  "Registration date & city",
  "Token tax status",
  "Transfer history",
  "Fitness certificate",
  "Insurance status",
  "Legal record check",
];

const documents = [
  { icon: FileText, title: "Registration book", desc: "Original book issued by Excise." },
  { icon: Receipt, title: "Token tax receipt", desc: "Valid token tax payment proof." },
  { icon: IdCard, title: "Seller CNIC", desc: "Must match the registered owner." },
  { icon: FileText, title: "Transfer letter", desc: "Check transfer history and letters." },
  { icon: Car, title: "Chassis plate", desc: "Match the number on the vehicle." },
  { icon: Wrench, title: "Engine number", desc: "Confirm it matches the documents." },
  { icon: Shield, title: "Insurance", desc: "Check if a policy is still valid." },
  { icon: CheckCircle2, title: "Fitness certificate", desc: "Required where applicable." },
];

const buyingTips = [
  "Verify registration and ownership on the official provincial portal",
  "Match chassis number, engine number, and registration documents in person",
  "Check token tax, transfer history, and tax payment status",
  "Inspect the vehicle physically and take a test drive before payment",
  "Meet in a public place and complete a proper ownership transfer",
];

const inspectItems = [
  "Engine performance",
  "Transmission",
  "Suspension",
  "AC and electrics",
  "Paint and body",
  "Tires",
  "Accident repairs",
  "Interior",
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
    q: "What is vehicle online verification?",
    a: "It is a check against authorized databases for registration and history details before you buy, sell, or transfer a vehicle.",
  },
  {
    q: "How do I check my car registration in Pakistan?",
    a: "Each province has its own portal. Use the official service for the province where the vehicle is registered, then compare the result with the physical documents.",
  },
  {
    q: "Is online verification enough before buying a used car?",
    a: "No. Online verification is the first step. Also inspect the car in person and match engine and chassis numbers with the original documents.",
  },
  {
    q: "Is it possible to do bike registration online?",
    a: "Some provinces publish bike records online. Always use authorized sources, then confirm numbers on the bike itself.",
  },
  {
    q: "Why do I need to verify a car before purchase?",
    a: "It lets you compare the seller's claims with official records and catch ownership, tax, or identity issues before you pay.",
  },
  {
    q: "Which provinces are currently supported?",
    a: "Punjab, Islamabad, Sindh, and KPK. Each card above opens that province's official verification service.",
  },
  {
    q: "Can I verify vehicle ownership details?",
    a: "Where the authority publishes them, you can review owner name, registration date, and transfer history through official sources.",
  },
  {
    q: "How long does a verification check take?",
    a: "Most official portals return results immediately. If a record is missing or delayed, confirm with the relevant Excise office.",
  },
];

const stats = [
  { value: "150K+", label: "Verified listings" },
  { value: "80K+", label: "Real sellers" },
  { value: "1M+", label: "Happy users" },
  { value: "25+", label: "Cities covered" },
  { value: "4.8/5", label: "Rated" },
];

const exploreLinks = [
  {
    to: "/car-estimator",
    icon: Zap,
    title: "AI Car Estimator",
    desc: "Get an instant market range for a used car in Pakistan.",
    cta: "Try estimator",
  },
  {
    to: "/listings",
    icon: Car,
    title: "Car listings",
    desc: "Browse cars for sale across major cities and brands.",
    cta: "Browse cars",
  },
  {
    to: "/blog",
    icon: BookOpen,
    title: "Buying guides",
    desc: "Checks, tips, and guides to help you buy with more confidence.",
    cta: "Read guides",
  },
];

const SectionHeader = ({ eyebrow, title, subtitle, id }) => (
  <div id={id} className="text-center mb-12 scroll-mt-24">
    {eyebrow ? (
      <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary-500 mb-3">
        {eyebrow}
      </p>
    ) : null}
    <h2 className="text-3xl font-bold text-slate-900 mb-3">{title}</h2>
    {subtitle ? (
      <p className="text-base text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
    ) : null}
  </div>
);

const AccordionItem = ({ title, children, open, onToggle, headingAs = "h3" }) => {
  const Heading = headingAs;
  return (
    <div
      className={`rounded-xl bg-white overflow-hidden border transition-all ${
        open
          ? "border-primary-500 shadow-sm"
          : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
        aria-expanded={open}
      >
        <Heading className="text-base sm:text-lg font-semibold text-slate-900">
          {title}
        </Heading>
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
            open ? "bg-primary-500 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open ? (
        <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed space-y-3 border-t border-slate-100 pt-4">
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
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-gray-50">
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

      <section
        id="select-province"
        className="scroll-mt-24 py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Start here"
            title="Select your province"
            subtitle="Choose the province where the vehicle is registered to open the official verification portal."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {provinces.map((province) => (
              <a
                key={province.name}
                href={province.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                    <province.Icon className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" strokeWidth={1.75} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                    {province.portal}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1.5">
                  Verify {province.name}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-5 flex-1">
                  {province.desc}
                </p>
                <span className="text-sm font-semibold text-primary-500 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Open official portal <ExternalLink className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-primary-50/30" aria-hidden />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Process"
            title="How vehicle verification works"
            subtitle="Four simple steps before you finalize a used car or bike deal."
          />
          <div className="relative">
            <div
              className="hidden lg:block absolute top-7 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent"
              aria-hidden
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/20 text-white relative z-10">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold tracking-wide uppercase text-primary-500 mb-2">
                    Step {item.step}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Why it matters"
            title="Why vehicle verification matters"
            subtitle="Protect yourself from fraud and make a clearer buying decision."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyVerify.map((item) => (
              <div
                key={item.title}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center hover:-translate-y-1 hover:shadow-lg hover:border-primary-300 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-50 rounded-xl flex items-center justify-center group-hover:bg-primary-500 transition-colors">
                  <item.icon className="w-6 h-6 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Records"
            title="What you can verify"
            subtitle="Compare official records with the vehicle and the seller's documents."
          />
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Information from official records
              </h3>
              <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                <Lock className="w-4 h-4 text-green-600" />
                Checks stay on official provincial portals
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {verifyInfo.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="text-sm text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 mt-12 mb-6">
            Documents you should check
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.title}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:-translate-y-0.5 hover:shadow-md hover:border-primary-300 transition-all"
              >
                <div className="w-11 h-11 bg-primary-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-primary-500 transition-colors">
                  <doc.icon className="w-5 h-5 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">
                  {doc.title}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary-500 mb-3">
                Before you pay
              </p>
              <h2 className="text-3xl font-bold text-slate-900 mb-3">
                Smart buying checklist
              </h2>
              <p className="text-base text-slate-600 mb-8">
                Use this list with the official portal check. Online records do
                not replace seeing the vehicle.
              </p>
              <div className="space-y-4">
                {buyingTips.map((tip, i) => (
                  <div key={tip} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-[#050B20] flex items-center justify-center shrink-0">
                      <span className="text-white text-[11px] font-bold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <span className="text-sm text-slate-600 leading-relaxed pt-1">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#050B20] rounded-xl p-6 sm:p-8 text-white">
              <div className="flex items-center gap-2 mb-5">
                <Wrench className="w-5 h-5 text-primary-500" />
                <h3 className="text-lg font-semibold">
                  Inspect in person
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {inspectItems.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                    <span className="text-sm text-slate-200">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-400 mt-6">
                For higher-value cars, get a professional inspection before you
                transfer ownership.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="what-is-verification" className="scroll-mt-24 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Learn more"
            title="Vehicle verification guide"
            subtitle="How registration checks work across provinces, cities, cars, and bikes."
          />
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Help" title="Frequently asked questions" />
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

      <section className="py-16 bg-[#050B20]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Why people use Sello</h2>
            <p className="text-slate-400 text-base mt-2">
              Pakistan's automotive marketplace
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-white/20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center pt-4 md:pt-0 md:px-2">
                <div className="text-2xl sm:text-3xl font-bold text-primary-500">
                  {stat.value}
                </div>
                <div className="text-white text-sm mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="More from Sello" title="Explore more on Sello" />
          <div className="grid md:grid-cols-3 gap-6">
            {exploreLinks.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:-translate-y-1 hover:shadow-lg hover:border-primary-300 transition-all"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-500 transition-colors">
                    <item.icon className="w-5 h-5 text-primary-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary-500 inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  {item.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 bg-white rounded-xl border border-slate-200 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 mb-1 text-sm">
                  Disclaimer
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Vehicle verification information is provided through official
                  provincial data sources where available. Sello does not
                  guarantee the accuracy, completeness, or real-time
                  availability of third-party records. Independently verify all
                  vehicle information before making a purchase.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsLatter />
    </div>
  );
};

export default VehicleVerificationPage;
