import React, { useState } from "react";
import {
  FaShieldAlt,
  FaCheckCircle,
  FaFileAlt,
  FaCar,
  FaUserCheck,
  FaClipboardCheck,
  FaLock,
  FaSearch,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaIndustry,
  FaTools,
  FaWrench,
  FaCarCrash,
  FaCogs,
  FaBolt,
  FaTachometerAlt,
  FaEye,
  FaClipboardList,
  FaUsers,
  FaStore,
  FaTruck,
  FaUserGraduate,
  FaHandshake,
  FaPhoneAlt,
  FaStar,
} from "react-icons/fa";
import { FiZap, FiShield, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import SEO from "../../common/SEO";
import NewsLatter from "../../utils/NewsLatter";

const benefits = [
  "Detailed vehicle condition assessment",
  "Professional mechanical inspection",
  "Body and paint verification",
  "Accident and damage detection",
  "Engine and transmission evaluation",
  "Suspension and braking system checks",
  "Electrical system inspection",
  "Road test evaluation",
  "Comprehensive car inspection report",
  "Peace of mind before purchase",
];

const exteriorChecks = [
  "Body panels and alignment",
  "Paint condition and repaint detection",
  "Signs of accident repairs",
  "Rust and corrosion",
  "Windshield and glass condition",
  "Headlights and taillights",
];

const interiorChecks = [
  "Dashboard functionality",
  "Air conditioning performance",
  "Seats and upholstery condition",
  "Power windows and locks",
  "Infotainment system",
  "Safety features",
];

const mechanicalChecks = [
  "Engine condition",
  "Transmission performance",
  "Suspension system",
  "Steering components",
  "Braking system",
  "Battery health",
  "Fluid levels and leaks",
];

const tireChecks = [
  "Tire tread depth",
  "Tire wear patterns",
  "Wheel condition",
  "Alignment indicators",
];

const usedCarIssues = [
  "Previous accident damage",
  "Flood damage indicators",
  "Engine performance concerns",
  "Chassis issues",
  "Odometer inconsistencies",
  "Costly repair requirements",
];

const prePurchaseChecks = [
  "Vehicle condition",
  "Safety concerns",
  "Repair recommendations",
  "Estimated maintenance needs",
  "Market-value considerations",
];

const reportIncludes = [
  "Overall vehicle condition",
  "Mechanical assessment",
  "Exterior and interior observations",
  "Safety concerns",
  "Recommended repairs",
  "Inspection photographs",
  "Expert recommendations",
];

const whoNeeds = [
  { icon: FaUserGraduate, title: "Individual Car Buyers", desc: "Stay away from issues and buy with confidence." },
  { icon: FaStore, title: "Used Car Dealers", desc: "Verify vehicle condition before resale." },
  { icon: FaTruck, title: "Fleet Owners", desc: "Maintain vehicle quality and safety standards." },
  { icon: FaUserGraduate, title: "First-Time Buyers", desc: "Get professional advice on that first car." },
];

const whySello = [
  "Experienced inspectors",
  "Comprehensive evaluations",
  "Fast turnaround times",
  "Detailed reporting",
  "Honest recommendations",
  "Reliable customer support",
];

const faqs = [
  { q: "What is the duration of a car inspection?", a: "Most of the time we finish the inspections within 1 to 2 hours, based on the car's condition and what is required by the inspection." },
  { q: "What is included in a car inspection report?", a: "The report contains mechanical issues, body condition, accident signs, safety checks, and expert recommendations." },
  { q: "Is your pre-purchase car inspection worth it?", a: "Yes. Before you buy, a pre purchase inspection will bring to light issues which may end up costing you thousands in repairs." },
  { q: "Do I have to book a car inspection prior to purchase of a used car?", a: "Absolutely. Our pre purchase service is for buyers of used cars." },
  { q: "What makes Sello a good choice for my vehicle inspection?", a: "Sello does thorough inspections, we present you with clear reports, we have experienced evaluators, and we give you unbiased recommendations which in turn will aid you in making informed buying decisions." },
];

const inspectionServices = [
  { icon: FaSearch, title: "Pre-Purchase Inspection", desc: "Complete assessment before you buy any used vehicle." },
  { icon: FaWrench, title: "Mechanical Inspection", desc: "Deep dive into engine, transmission, and drivetrain." },
  { icon: FaCarCrash, title: "Accident History Check", desc: "Detect previous accident damage and repairs." },
  { icon: FaCogs, title: "Full Vehicle Assessment", desc: "Comprehensive bumper-to-bumper evaluation." },
];

const CarInspectionPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <SEO
        title="Professional Car Inspection Service in Pakistan | Sello"
        description="Buy with confidence through Sello car inspection. Get in-depth vehicle condition assessment, mechanical inspection, and detailed reports before purchasing any used car in Pakistan."
        keywords="car inspection Pakistan, vehicle inspection service, pre-purchase car inspection, used car inspection, car inspection near me"
      />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#0B1437] via-[#111d45] to-[#0B1437] overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-gray-300 font-medium">Professional Inspectors</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-[1.15]">
                Professional Car <br />
                <span className="text-[#FFA602]">Inspection Service</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md">
                Buy with confidence through Sello car inspection. Get in-depth vehicle condition assessment before you purchase any used car in Pakistan.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-[#FFA602] text-white px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#e69500] transition-all shadow-lg shadow-[#FFA602]/25 hover:shadow-[#FFA602]/40 hover:-translate-y-0.5">
                  <FaSearch /> Book Inspection
                </button>
                <button className="bg-white/5 backdrop-blur-sm border border-white/10 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all hover:-translate-y-0.5">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden md:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-56 bg-gradient-to-br from-white/[0.07] to-transparent rounded-3xl border border-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <FaTools className="text-8xl text-white/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1437]/50 to-transparent" />
                </div>
                <div className="absolute -right-6 top-10 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-2xl shadow-black/20 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Inspection Report</div>
                  <div className="space-y-2.5">
                    {["Engine Verified", "Body Checked", "Clear History"].map((t) => (
                      <div key={t} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <FaCheckCircle size={10} className="text-green-600" />
                        </div>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2"><FiShield className="text-green-400" /> <span className="text-gray-300">Certified Inspectors</span></div>
              <div className="flex items-center gap-2"><FaIndustry className="text-green-400" /> <span className="text-gray-300">Detailed Reports</span></div>
              <div className="flex items-center gap-2"><FiClock className="text-green-400" /> <span className="text-gray-300">Fast Turnaround</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro Content */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gray-600 text-base leading-relaxed mb-5">
            Buying cars is a large investment and what is sometimes a great deal can end up being an expensive mistake. At Sello we offer a professional car inspection service which helps buyers make informed decisions by providing an in-depth assessment of a vehicle's condition prior to purchase.
          </p>
          <p className="text-gray-600 text-base leading-relaxed mb-5">
            We have what it takes to do a car inspection near me, we do in depth vehicle inspection services, also we can put at ease your pre purchase car inspection needs. Our experienced team goes over each and every part of the vehicle which we report back on fully.
          </p>
        </div>
      </section>

      {/* Why Choose Sello Car Inspection */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Why Choose Sello Car Inspection?</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            Buying a preowned car without a full inspection may result in getting some unseen mechanical issues, former accidents in its history, or high repair bills. Our team of experts will present an unbiased report so you know exactly what you are going for.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Benefits of Our Car Inspection Service</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {benefits.map((item) => (
              <div key={item} className="flex items-center gap-3 py-2 group">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors">
                  <FaCheckCircle className="text-green-600 group-hover:text-white transition-colors" size={11} />
                </div>
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspection Services */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Our Inspection Services</h2>
            <p className="text-gray-500 text-sm">Professional inspection for every type of buyer</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {inspectionServices.map((item) => (
              <div key={item.title} className="group relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-100 hover:border-[#FFA602]/30 hover:from-[#FFF8E7] hover:to-white hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#FFF8E7] to-[#FFF3D6] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="text-xl text-[#FFA602]" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Complete Vehicle Inspection Service */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Complete Vehicle Inspection Service</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Our vehicle inspection service covers all major components of the car to help identify potential issues before you finalize the purchase.
          </p>
        </div>
      </section>

      {/* Exterior Inspection */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
            <span className="flex items-center gap-2"><FaEye className="text-[#FFA602]" /> Exterior Inspection</span>
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">We thoroughly examine:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {exteriorChecks.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interior Inspection */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
            <span className="flex items-center gap-2"><FaCar className="text-[#FFA602]" /> Interior Inspection</span>
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">Our team checks:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {interiorChecks.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mechanical Inspection */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
            <span className="flex items-center gap-2"><FaWrench className="text-[#FFA602]" /> Mechanical Inspection</span>
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">A detailed inspection includes:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {mechanicalChecks.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tire and Wheel Assessment */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5">
            <span className="flex items-center gap-2"><FaTachometerAlt className="text-[#FFA602]" /> Tire and Wheel Assessment</span>
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">We inspect:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {tireChecks.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Used Car Inspection Before You Buy */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Used Car Inspection Before You Buy</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            A professional used car inspection will protect you from unexpected repair charges. Lots of cars present as perfect at first which only later present major mechanical and structural problems.
          </p>
          <p className="text-gray-700 text-sm font-semibold mb-3">Our inspectors identify:</p>
          <div className="grid sm:grid-cols-2 gap-2 mb-5">
            {usedCarIssues.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Sello's due diligence gives buyers the confidence and bargaining power before they buy.
          </p>
        </div>
      </section>

      {/* Pre Purchase Car Inspection */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Pre Purchase Car Inspection</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            We have a pre purchase car inspection that is for those looking to buy a used car. Before you part with your money we provide a full assessment of:
          </p>
          <div className="grid sm:grid-cols-2 gap-2 mb-5">
            {prePurchaseChecks.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            This will help buyers in avoiding risky purchases and to choose vehicles which provide the best value for money.
          </p>
        </div>
      </section>

      {/* Detailed Car Inspection Report */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Detailed Car Inspection Report</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            In each inspection we present to you a professional car inspection report of our findings in a very easy to read format.
          </p>
          <p className="text-gray-700 text-sm font-semibold mb-3">The report includes:</p>
          <div className="grid sm:grid-cols-2 gap-2 mb-5">
            {reportIncludes.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Our open report includes all info you'll need for a smart buy.
          </p>
        </div>
      </section>

      {/* Who Needs a Car Inspection */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Who Needs a Car Inspection?</h2>
            <p className="text-gray-500 text-sm">Our services are ideal for:</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whoNeeds.map((item) => (
              <div key={item.title} className="group relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-100 hover:border-[#FFA602]/30 hover:from-[#FFF8E7] hover:to-white hover:shadow-lg transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#FFF8E7] to-[#FFF3D6] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="text-xl text-[#FFA602]" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Sello */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Why Sello?</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            Sello is dedicated to bringing you safer and smarter car purchases in Pakistan. We have an independent, transparent and accurate inspection process which reports the true state of the vehicle.
          </p>
          <p className="text-gray-700 text-sm font-semibold mb-3">When you choose Sello, you receive:</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {whySello.map((item) => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <FaCheckCircle className="text-[#FFA602] shrink-0" size={11} />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book Inspection CTA */}
      <section className="py-14 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">Book Your Car Inspection Today</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Don't put yourself at risk when you buy a car. At Sello we provide professional car inspection services which will give you all the info you need before you decide to buy.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            Whether you require a vehicle inspection, used car evaluation, or pre-purchase car inspection, we have expert staff that will help you buy with confidence.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            Contact us at Sello today to get a detailed inspection report which will protect your investment.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="bg-[#FFA602] text-white px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#e69500] transition-all shadow-lg shadow-[#FFA602]/25 hover:shadow-[#FFA602]/40 hover:-translate-y-0.5">
              <FaPhoneAlt /> Contact Us
            </button>
            <Link to="/listings" className="bg-white/5 backdrop-blur-sm border border-gray-200 text-gray-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-all hover:-translate-y-0.5 flex items-center gap-2">
              <FaCar /> Browse Cars
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                >
                  <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${openFaq === i ? "bg-[#FFA602] rotate-180" : "bg-gray-100"}`}>
                    <FaChevronDown size={12} className={openFaq === i ? "text-white" : "text-gray-500"} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40" : "max-h-0"}`}>
                  <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore More */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Explore More Services on Sello</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { to: "/vehicle-verification", icon: FaSearch, title: "Vehicle Verification", desc: "Verify vehicle registration and ownership details online.", cta: "Verify Vehicle" },
              { to: "/car-estimator", icon: FiZap, title: "AI Car Estimator", desc: "Get instant market value of your car using AI technology.", cta: "Try Estimator" },
              { to: "/listings", icon: FaCar, title: "Car Listings", desc: "Browse thousands of verified cars for sale across Pakistan.", cta: "Browse Cars" },
            ].map((s) => (
              <Link key={s.title} to={s.to} className="group relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 hover:from-[#FFF8E7] hover:to-white border border-gray-200 hover:border-[#FFA602]/30 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FFF8E7] to-[#FFF3D6] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <s.icon className="text-xl text-[#FFA602]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[#FFA602] transition-colors">{s.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{s.desc}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#FFA602] flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  {s.cta} <FaArrowRight size={10} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-10 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-600 font-bold text-xs">i</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1.5 text-sm">Disclaimer</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Car inspection information is provided through Sello's professional inspection services. While we strive for accuracy, users should independently verify all vehicle information and use authorized government sources for official registration verification.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-gray-400">
            {[
              { icon: FaCheckCircle, text: "Professional Inspectors" },
              { icon: FaShieldAlt, text: "Detailed Reports" },
              { icon: FaLock, text: "Unbiased Recommendations" },
              { icon: FaHandshake, text: "Dedicated Support" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-1.5">
                <b.icon className="text-[#FFA602]" size={10} /> {b.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsLatter />
    </>
  );
};

export default CarInspectionPage;
