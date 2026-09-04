import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Headset,
  Info,
  Lock,
  MapPin,
  Minus,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import SEO from "../../common/SEO";
import NewsLatter from "../../utils/NewsLatter";
import listingHero from "../../../assets/images/verification/vehicleVerificationHeroSection.jpeg";
import punjabIcon from "../../../assets/images/verification/punjab.png";
import islamabadIcon from "../../../assets/images/verification/islamabad.png";
import sindhIcon from "../../../assets/images/verification/sindh.png";
import kpkIcon from "../../../assets/images/verification/kpk.png";
import balochistanIcon from "../../../assets/images/verification/blochistan.png";
import gilgitBaltistan from "../../../assets/images/verification/gilgitBaltistan.png";
import azadKashmir from "../../../assets/images/verification/azadKashmir.png";
import serviceListingsImg from "../../../assets/images/verification/1.png";
import serviceAuctionsImg from "../../../assets/images/verification/2.png";
import serviceEstimatorImg from "../../../assets/images/verification/3.png";
import serviceGuidesImg from "../../../assets/images/verification/4.png";
import guestPostsImg from "../../../assets/images/verification/post.jpeg";
import ownershipIcon from "../../../assets/images/verification/ownership.png";
import registrationIcon from "../../../assets/images/verification/registration.png";
import fraudIcon from "../../../assets/images/verification/fraud.png";
import buyerProtectionIcon from "../../../assets/images/verification/buyerProtection.png";
import enterDetailsIcon from "../../../assets/images/verification/enter_details.png";
import recordIcon from "../../../assets/images/verification/record.png";
import reportIcon from "../../../assets/images/verification/report.png";
import confidenceIcon from "../../../assets/images/verification/confidence.png";
import registrationBookIcon from "../../../assets/images/verification/registerationBook.png";
import tokenIcon from "../../../assets/images/verification/token.png";
import cnicIcon from "../../../assets/images/verification/cnic.png";
import transferLetterIcon from "../../../assets/images/verification/tansferlater.png";
import chassisPlateIcon from "../../../assets/images/verification/chassisPlate.png";
import engineNumberIcon from "../../../assets/images/verification/engineNumber.png";
import insuranceIcon from "../../../assets/images/verification/insurance.png";
import fitnessCertificateIcon from "../../../assets/images/verification/fitnessCertificate.png";

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
  {
    name: "Gilgit-Baltistan",
    desc: "Check Gilgit-Baltistan vehicle registration details",
    url: "https://gbexcise.gov.pk/vehsearch/vehicle-search.php",
    icon: gilgitBaltistan,
  },
  {
    name: "Azad Kashmir",
    desc: "Access Azad Kashmir vehicle verification services",
    url: "https://ird.ajk.gov.pk/tokentax/verification.php",
    icon: azadKashmir,
  },
  {
    name: "Browse Vehicles",
    desc: "Explore a wide range of vehicles for sale",
    url: "https://sello.pk/listings",
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
    icon: enterDetailsIcon,
    title: "Enter Details",
    desc: "Provide the vehicle registration number on the official portal.",
    circle: "bg-green-50",
  },
  {
    icon: recordIcon,
    title: "We Check Records",
    desc: "Information is verified from official government sources.",
    circle: "bg-sky-50",
  },
  {
    icon: reportIcon,
    title: "Get Report",
    desc: "Review the official verification result instantly.",
    circle: "bg-violet-50",
  },
  {
    icon: confidenceIcon,
    title: "Buy with Confidence",
    desc: "Make a safe and informed buying decision.",
    circle: "bg-green-50",
  },
];

const verifyInfo = [
  "Vehicle registration number",
  "Registration date",
  "Vehicle make and model",
  "Manufacturing or model year",
  "Engine information",
  "Chassis information",
  "Vehicle body type",
  "Registration city",
  "Available ownership information",
  "Token fees or tax status",
  "Registration document details",
  "Color",
  "Fitness certificate",
  "Insurance status",
];

const documents = [
  {
    icon: registrationBookIcon,
    title: "Registration Book",
    desc: "Original registration issued by Excise.",
  },
  {
    icon: tokenIcon,
    title: "Token Tax Paid",
    desc: "Valid token tax receipt.",
  },
  {
    icon: cnicIcon,
    title: "CNIC of Seller",
    desc: "Match CNIC with registration.",
  },
  {
    icon: transferLetterIcon,
    title: "Transfer Letter",
    desc: "Check transfer history and letters.",
  },
  {
    icon: chassisPlateIcon,
    title: "Chassis Plate",
    desc: "Verify chassis number.",
  },
  {
    icon: engineNumberIcon,
    title: "Engine Number",
    desc: "Match engine number.",
  },
  {
    icon: insuranceIcon,
    title: "Insurance (If Any)",
    desc: "Check valid insurance.",
  },
  {
    icon: fitnessCertificateIcon,
    title: "Fitness Certificate",
    desc: "Ensure vehicle is fitness approved.",
  },
];

const buyingTips = [
  "Check available registration information on the official portal",
  "Match engine and chassis numbers with the original documents",
  "Inspect the original registration book or smart card",
  "Review the vehicle's physical condition before any payment",
  "Ask about accident, repair, and maintenance history",
  "Compare the asking price with similar models on Sello",
  "Complete a proper legal ownership transfer",
];

const guideSections = [
  {
    title: "What is online vehicle verification?",
    body: [
      "Online vehicle verification reviews available vehicle information through relevant, authorized sources. What is published may include registration info, vehicle specs, registration status, and other key records that vary by province.",
      "Before you buy a car, do not base your decision only on what the seller tells you. A car may look great in pictures or pass a brief inspection, but you should also check the registration and other details to rule out issues.",
      "An online car registration check is especially useful when you are buying a used car. It lets buyers compare what the seller says with what is on record.",
    ],
  },
  {
    title: "What is MTMIS and how does it relate to vehicle verification?",
    body: [
      "MTMIS, which stands for Motor Transport Management Information System, is an online vehicle verification tool used to obtain vehicle registration and related information. Through provincial vehicle registration and Excise boards, users can check details of a registered car or motorcycle.",
      "The information published can vary by province and authority. A typical vehicle check may include make and model, registration date, engine information, chassis information, and tax or token status.",
      "For a used-car buyer, this is a research tool: compare the seller's claims with registration records before you buy. Online verification is only the start of the purchase process. A full picture also needs a physical inspection, document check, price comparison, and a proper ownership transfer.",
    ],
  },
  {
    title: "What information can be checked through vehicle verification?",
    body: [
      "Depending on the provincial system and what authorized channels publish, records may include the items listed below. Use this information to catch issues before you buy. Engine and chassis numbers in the records should match the vehicle and its registration documents.",
    ],
    items: [
      "Vehicle registration number",
      "Registration date",
      "Vehicle make and model",
      "Manufacturing or model year",
      "Engine information",
      "Chassis information",
      "Vehicle body type",
      "Available ownership-related information",
      "Token fees or other related listing details",
      "Other information provided by the relevant authority",
    ],
  },
  {
    title: "Why MTMIS and online vehicle verification are important",
    body: [
      "When you buy a used car or motorcycle, it is a risk to rely only on what the seller says. A vehicle may pass a visual inspection and still have registration issues. Online tools like MTMIS add transparency so you can review available information before you proceed.",
      "Online checks are a useful tool when buying cars in Pakistan, but they are only one step. Also inspect the car in person, review documents, compare market prices, and complete a legal ownership transfer.",
    ],
    items: [
      "Display vehicle registration information",
      "Compare records with vehicle documents",
      "Help identify possible inconsistencies",
      "Add transparency during vehicle transactions",
      "Give buyers access to tax and registration information",
      "Reduce time spent searching basic registration details",
    ],
  },
  {
    title: "Why is car verification important before buying?",
    body: [
      "The used-car market offers a wide choice, but every buyer should review the car carefully before finalizing a deal. Verification can surface issues that do not match what the seller reported, including chassis number, engine details, registration history, and other available records.",
      "Online records are a useful resource. They do not replace a physical inspection of the vehicle itself.",
    ],
    items: [
      "Vehicle registration details",
      "Registration city or province",
      "Vehicle make and model",
      "Engine and chassis information",
      "Available ownership details through authorized sources",
      "Token tax or related vehicle charges",
      "Registration documents",
      "Smart card or registration book details",
    ],
  },
  {
    title: "How Sello helps with vehicle verification",
    body: [
      "Sello makes buying and selling vehicles clearer by providing tools, vehicle information, and resources so you can make a more informed decision. Before you buy a used car, use listings, buying guides, and pricing tools together with official registration checks.",
      "Choosing a car is about more than photos and price. Slow down and think through registration information, inspection, and comparison. Browse used cars for sale in Pakistan on Sello and compare options before you decide.",
    ],
  },
  {
    title: "What information should you check during vehicle verification?",
    body: [
      "A proper vehicle verification in Pakistan differs by province and by what the relevant authorities publish. Always compare official information with what the seller is offering.",
      "Pay close attention that engine and chassis serial numbers on the vehicle match the official documentation. If anything is inconsistent, look into it before you pay.",
    ],
    items: [
      "Vehicle registration number",
      "Make and model",
      "Manufacturing year",
      "Engine number",
      "Chassis number",
      "Registration date",
      "Registration city",
      "Available ownership information",
      "Applicable tax or token status",
      "Registration document details",
    ],
  },
  {
    title: "Punjab vehicle verification",
    body: [
      "For Punjab-registered vehicles, use official government vehicle verification services. Punjab vehicle verification helps confirm a vehicle's details. Use only authorized official sources for registration information.",
      "Government database information can change. Verify key details with the right authority when needed. Sello helps you know what to check, but official registration information should still come from the authorized government channel.",
    ],
  },
  {
    title: "Car registration check before buying a used car",
    body: [
      "A used-car registration check should be near the top of your list. Before you pay or finalize the deal, compare the seller's documents with the vehicle information in front of you.",
      "Check registration information against the vehicle at inspection, including chassis and engine numbers. In Punjab, a proper registration check through the relevant provincial authority adds extra assurance.",
      "Records are only part of the picture. Also look at mechanical condition, bodywork, maintenance history, and available ownership documents.",
    ],
  },
  {
    title: "How to check car details before buying",
    body: [
      "Start with the information the seller has. Ask for the registration number and go over the registration documents. Then use the authorized vehicle check for the province where the car is registered, and compare the result with the car and its paperwork.",
      "Also inspect the car in person. Look for accident damage, paint retouches, engine issues, suspension problems, or chassis changes. Taking these related steps together reduces the chance of a bad purchase.",
    ],
    items: [
      "Checking available registration information",
      "Matching the engine and chassis details",
      "Inspecting the original documents",
      "Reviewing the vehicle's physical condition",
      "Checking maintenance records, if available",
      "Asking about accident or repair history",
      "Comparing the asking price with similar models",
    ],
  },
  {
    title: "Vehicle verification in Lahore and other cities",
    body: [
      "For vehicle verification in Lahore, the process follows where the vehicle is registered, not where it currently sits. A car registered in Lahore should be checked through the relevant Punjab records even if it is now in another city.",
      "The same rule applies to vehicles in Karachi, Islamabad, Rawalpindi, Faisalabad, and other cities in Pakistan. Always review the registration information and use the correct official portal for that registration.",
    ],
  },
  {
    title: "Punjab Excise vehicle verification",
    body: [
      "Many buyers looking at a car or bike in Punjab use Punjab Excise vehicle verification. Registration information is held by the appropriate government bodies, so use official sources.",
      "If you have questions about a document's authenticity or title status, contact the relevant Excise and Taxation authority before you purchase.",
    ],
    items: [
      "The registration document",
      "The vehicle number",
      "Engine details",
      "Chassis details",
      "Available registration information",
    ],
  },
  {
    title: "Online bike registration check",
    body: [
      "Vehicle checks go beyond cars. An online bike registration check is useful when you buy or sell a used motorcycle. Before you buy, check registration information, engine and frame numbers, and the registration documents in person.",
      "Also review the bike's physical condition. Mechanical issues, accident damage, and missing documentation can affect value and how well it runs. A bike registration check is especially important when buying from an individual seller.",
    ],
  },
  {
    title: "Can you check the vehicle owner?",
    body: [
      "Many users want to check the vehicle owner before buying a car or bike. What is available to the public varies by law, privacy rules, and what official registration authorities publish.",
      "Use authorized channels only, and only for genuine purchase or transfer needs. The most important step is confirming the seller has the right to sell and that ownership transfer is completed correctly. Never rely on verbal claims alone.",
    ],
  },
  {
    title: "Vehicle registration and smart card verification",
    body: [
      "Registration may be a book, smart card, or another government-recognized document, depending on the vehicle and authority. Before you buy, check the documents against the physical vehicle.",
      "For a bike smart-card check or a car document review, verify the registration number, engine number, and chassis number. If details do not add up, do not complete the transaction. It is easier to resolve issues before payment than after.",
    ],
  },
  {
    title: "Why physical inspection is also important",
    body: [
      "Online vehicle verification usually gives registration information, not mechanical condition. A car may have a clean registration history and still have accident repairs or other problems that only show up at inspection. For higher-value cars, a professional inspection is a smart extra step.",
    ],
    items: [
      "Engine performance",
      "Suspension condition",
      "Transmission operation",
      "AC and electrical systems",
      "Paint and body panels",
      "Tire condition",
      "Signs of accident repairs",
      "Interior condition",
    ],
  },
  {
    title: "Buy and sell vehicles with more confidence",
    body: [
      "Vehicle checks are one piece of a smart purchase. Also look at market prices, inspect the vehicle, review documents, and research ownership transfer.",
      "Sello lets you browse used cars for sale in Pakistan and use resources to buy and sell with more confidence. Take time to compare cars and what they are worth in the market. If you are buying or selling, Sello's AI car estimator can give a market range before you agree on a price.",
    ],
  },
  {
    title: "Why choose Sello?",
    body: [
      "Buying or selling a car is more than connecting a buyer and a seller. You need to understand the car, review available information, check its condition, and see its price. Sello brings together vehicle tools that support that process.",
      "Whether you are buying your first car or trading in your current one, research and due diligence make the process safer and easier.",
    ],
    items: [
      "Vehicle listings",
      "Used-car buying resources",
      "Vehicle comparison guides",
      "Car pricing insights",
      "AI car estimation tools",
      "Information about buying and selling vehicles",
    ],
  },
  {
    title: "Final thoughts",
    body: [
      "Online vehicle verification is a key step when you buy a used car or bike in Pakistan. Review registration information, compare documents with the vehicle, and do a thorough physical inspection so you can decide with more confidence.",
      "For official checks and registration, use only authorized sources. Online verification supports a physical inspection and document review; it does not replace them. Before you finalize a deal, verify the information, inspect the vehicle, and complete ownership transfer correctly.",
      "Sello provides tools, information, resources, and listings that make buying and selling vehicles clearer so you can make a better decision.",
    ],
  },
];

const faqs = [
  {
    q: "What is vehicle online verification?",
    a: "Online vehicle verification checks authorized databases for registration and history details before you buy, sell, or transfer a vehicle.",
  },
  {
    q: "How do I check my car registration in Pakistan?",
    a: "Each province has its own process. Use the official government registration or verification service for the province where the vehicle is registered, then compare the result with your documents.",
  },
  {
    q: "Is online verification enough before buying a used car?",
    a: "No. Online verification is a starting point. Also inspect the car in person, review the documents, and match engine and chassis numbers.",
  },
  {
    q: "Is it possible to do bike registration online?",
    a: "In some provinces, bike registration information is available online through government services. Always use authorized sources, then confirm numbers on the bike itself.",
  },
  {
    q: "Why do I need to verify a car before purchase?",
    a: "Verification lets you compare the seller's claims with registration records and catch issues before you buy.",
  },
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
    title: "AI Car Price Estimator",
    cta: "Try Estimator",
    image: serviceEstimatorImg,
  },
  {
    to: "/listings",
    title: "Buy & Sell Cars",
    cta: "Browse Cars",
    image: serviceListingsImg,
  },
  {
    to: "/auctions",
    title: "Online Car Auctions",
    cta: "View Auctions",
    image: serviceAuctionsImg,
  },
  {
    to: "/blog",
    title: "Vehicle Inspection",
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

const AccordionItem = ({
  title,
  children,
  open,
  onToggle,
  headingAs = "h3",
}) => {
  const Heading = headingAs;
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 text-left flex items-center justify-between gap-4"
        aria-expanded={open}
      >
        <Heading className="text-base font-semibold text-slate-900">
          {title}
        </Heading>
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
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const VehicleVerificationPage = () => {
  const [openGuide, setOpenGuide] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-white">
      <SEO
        title="Online Vehicle Verification in Pakistan | Check Car Details"
        description="Verify your car or bike online through Sello. Check vehicle registration info and key details before you buy or sell a vehicle in Pakistan."
        keywords="online vehicle verification Pakistan, car verification Pakistan, vehicle registration check, MTMIS, Punjab vehicle verification, Punjab Excise, bike registration check, Lahore vehicle verification"
      />

      <section className="relative w-full overflow-hidden min-h-[52vh] bg-gray-200">
        <img
          src={listingHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchPriority="high"
          decoding="async"
          width="1200"
          height="600"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/25 via-slate-900/40 to-slate-900/50" />
        <div className="relative z-10 flex min-h-[52vh] flex-col justify-center w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center w-full min-w-0 max-w-3xl mx-auto">
            <div className="inline-flex max-w-full items-center gap-2 bg-white text-primary-500 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-5 shadow-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">Official MTMIS data sources</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight text-balance">
              Online Vehicle Verification in Pakistan – Check Your Car Details
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-100 mb-5 sm:mb-8 text-pretty">
              Check car or bike registration details before you buy or sell.
              Open the official portal for your province, then compare records
              with the vehicle in person.
            </p>
            <div className="flex flex-col min-[420px]:flex-row flex-wrap justify-center items-stretch min-[420px]:items-center gap-2.5 sm:gap-3 mb-5 sm:mb-8">
              <a
                href="#select-province"
                onClick={scrollToId("select-province")}
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary-500/25"
              >
                <Search className="w-4 h-4 shrink-0" />
                Verify vehicle
              </a>
              <a
                href="#how-it-works"
                onClick={scrollToId("how-it-works")}
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
              >
                How it works
              </a>
            </div>
            <ul className="flex flex-wrap justify-center gap-1.5 sm:gap-3 text-[10px] sm:text-sm text-gray-100">
              <li className="inline-flex items-center gap-1 sm:gap-2 whitespace-nowrap rounded-full bg-white/10 px-2 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 shrink-0" />
                Secure
              </li>
              <li className="inline-flex items-center gap-1 sm:gap-2 whitespace-nowrap rounded-full bg-white/10 px-2 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-sm">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 shrink-0" />
                Official sources
              </li>
              <li className="inline-flex items-center gap-1 sm:gap-2 whitespace-nowrap rounded-full bg-white/10 px-2 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-sm">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300 shrink-0" />
                Confidential
              </li>
            </ul>
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
              Choose your province to verify vehicle details and ownership
              records
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {provinces.map((province) => (
              <a
                key={province.name}
                href={province.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow hover:bg-green-200"
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
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
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
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${item.circle}`}
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
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
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
                {verifyInfo
                  .slice(0, Math.ceil(verifyInfo.length / 2))
                  .map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                      <span className="text-sm text-slate-600">{item}</span>
                    </div>
                  ))}
              </div>
              <div className="space-y-3">
                {verifyInfo
                  .slice(Math.ceil(verifyInfo.length / 2))
                  .map((item) => (
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
                  Your information is safe with us. We never share your data
                  with anyone.
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
            Always review these documents before finalizing any vehicle
            purchase.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.title}
                className="bg-white rounded-2xl border border-slate-200 p-4 flex items-start gap-3"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                  <img
                    src={doc.icon}
                    alt=""
                    className="w-7 h-7 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {doc.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="what-is-verification"
        className="scroll-mt-24 py-16 bg-white"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Check Vehicle Details Before You Buy or Sell
          </h2>
          <div className="space-y-4 text-slate-600 leading-relaxed mb-10">
            <p>
              Buying a used car or bike is a big decision, which is why it is
              best to do your due diligence before you complete a sale. Online
              vehicle verification helps buyers and sellers review important
              vehicle and registration information before they proceed.
            </p>
            <p>
              Whether you are purchasing a used car, trading in your present
              vehicle, or looking up registration information, car verification
              is a key step in the process.
            </p>
            <p>
              Sello makes buying and selling vehicles easier by providing useful
              tools, vehicle information, and resources that help you make a
              more informed decision.
            </p>
          </div>
          <div className="space-y-3">
            {guideSections.map((section, i) => (
              <AccordionItem
                key={section.title}
                title={section.title}
                open={openGuide === i}
                onToggle={() => setOpenGuide(openGuide === i ? null : i)}
                headingAs="h2"
              >
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.items ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
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
                  <div className="text-white font-semibold mt-1">
                    {stat.title}
                  </div>
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
          <div className="grid md:grid-cols-4 gap-5">
            {exploreLinks.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                aria-label={item.title}
                className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <img src={item.image} alt="" className="block w-full h-full" />
                <span className="absolute left-5 bottom-2 inline-flex items-center gap-1.5 bg-primary-500 text-white text-xs font-semibold rounded-lg px-3 py-2 group-hover:opacity-90 transition-opacity">
                  {item.cta} <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>

          <Link
            to="/blog/all"
            aria-label="Read guest posts"
            className="group relative mt-5 block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <img src={guestPostsImg} alt="" className="block w-full" />
            <span className="absolute left-20 bottom-8 inline-flex items-center gap-1.5 bg-primary-500 text-white text-sm font-semibold rounded-lg px-4 py-2.5 group-hover:opacity-90 transition-opacity">
              Read Posts <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
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
                  guarantee the accuracy, completeness, or real-time
                  availability of third-party records. Independently verify all
                  vehicle information before making a purchase.
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
