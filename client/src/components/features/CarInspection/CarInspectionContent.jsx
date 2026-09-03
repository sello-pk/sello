import React, { useState } from "react";
import {
  FaCheckCircle,
  FaCar,
  FaSearch,
  FaArrowRight,
  FaChevronDown,
  FaTools,
  FaWrench,
  FaCarCrash,
  FaCogs,
  FaEye,
  FaTachometerAlt,
  FaUserGraduate,
  FaStore,
  FaTruck,
  FaPhoneAlt,
  FaClipboardCheck,
  FaFileAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

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
  { icon: FaUserGraduate, title: "Individual Buyers", desc: "Buy with confidence." },
  { icon: FaStore, title: "Used Car Dealers", desc: "Verify before resale." },
  { icon: FaTruck, title: "Fleet Owners", desc: "Maintain quality standards." },
  { icon: FaUserGraduate, title: "First-Time Buyers", desc: "Get expert advice." },
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
  { q: "Do I have to book a car inspection prior to purchase?", a: "Absolutely. Our pre purchase service is for buyers of used cars." },
  { q: "What makes Sello a good choice for vehicle inspection?", a: "Sello does thorough inspections, we present you with clear reports, we have experienced evaluators, and we give you unbiased recommendations." },
];

const inspectionServices = [
  { icon: FaSearch, title: "Pre-Purchase", desc: "Complete assessment before you buy." },
  { icon: FaWrench, title: "Mechanical", desc: "Engine, transmission, drivetrain deep dive." },
  { icon: FaCarCrash, title: "Accident Check", desc: "Detect previous accident damage." },
  { icon: FaCogs, title: "Full Assessment", desc: "Bumper-to-bumper evaluation." },
];

const CarInspectionContent = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <section className="bg-white">
      {/* Hero */}
      <div className="bg-[#0B1437]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-gray-300 font-medium">Professional Inspectors Available</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Professional Car<br /> Inspection Service
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Buy with confidence through Sello car inspection. Get in-depth vehicle condition assessment before you purchase any used car in Pakistan.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <button className="bg-[#FFA602] text-white px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#e69500] transition-all shadow-lg shadow-[#FFA602]/20 text-sm">
                  <FaSearch /> Book Inspection
                </button>
                <Link to="/car-inspection" className="border border-white/15 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/5 transition-all text-sm flex items-center gap-2">
                  Learn More <FaArrowRight size={12} />
                </Link>
              </div>
            </div>
            <div className="hidden md:flex justify-end">
              <div className="relative w-80">
                {/* Main card */}
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[#FFA602]/20 rounded-2xl flex items-center justify-center">
                      <FaTools className="text-3xl text-[#FFA602]" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg">Sello</div>
                      <div className="text-gray-400 text-xs">Inspection Service</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Engine", status: "Verified", color: "text-green-400" },
                      { label: "Body", status: "Checked", color: "text-green-400" },
                      { label: "History", status: "Clear", color: "text-green-400" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <span className="text-gray-300 text-sm">{item.label}</span>
                        <span className={`${item.color} text-xs font-medium flex items-center gap-1.5`}>
                          <FaCheckCircle size={10} /> {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-[#FFA602] text-white px-4 py-2 rounded-xl shadow-lg shadow-[#FFA602]/30 text-xs font-bold">
                  100% Trusted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Why Choose + Benefits */}
        <div className="py-16 grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Choose Sello?</h3>
            <p className="text-gray-500 text-sm mb-5">Trusted by thousands of car buyers across Pakistan</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Buying a preowned car without a full inspection may result in getting some unseen mechanical issues, former accidents in its history, or high repair bills. Our team of experts will present an unbiased report so you know exactly what you are going for.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: FaShieldAlt, text: "Trusted Service", bg: "bg-green-50", textc: "text-green-700" },
                { icon: FaClipboardCheck, text: "Certified Inspectors", bg: "bg-blue-50", textc: "text-blue-700" },
                { icon: FaFileAlt, text: "Detailed Reports", bg: "bg-purple-50", textc: "text-purple-700" },
              ].map((b) => (
                <span key={b.text} className={`inline-flex items-center gap-1.5 ${b.bg} ${b.textc} px-3 py-1.5 rounded-lg text-xs font-medium`}>
                  <b.icon size={11} /> {b.text}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Key Benefits</h3>
            <p className="text-gray-500 text-sm mb-5">What our inspection service covers</p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {benefits.map((item) => (
                <div key={item} className="flex items-center gap-2.5 py-1.5">
                  <FaCheckCircle className="text-green-500 shrink-0" size={12} />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inspection Services */}
        <div className="pb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Our Inspection Services</h3>
            <p className="text-gray-500 text-sm">Professional inspection for every type of buyer</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {inspectionServices.map((item) => (
              <div key={item.title} className="group text-center p-6 rounded-2xl border border-gray-100 hover:border-[#FFA602]/30 hover:shadow-lg hover:shadow-[#FFA602]/5 transition-all duration-300">
                <div className="w-14 h-14 mx-auto mb-4 bg-[#FFF8E7] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className="text-xl text-[#FFA602]" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Complete Vehicle Inspection */}
        <div className="pb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Vehicle Inspection</h3>
            <p className="text-gray-500 text-sm">Our inspection covers all major components</p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { icon: FaEye, title: "Exterior Inspection", subtitle: "We thoroughly examine", items: exteriorChecks },
              { icon: FaCar, title: "Interior Inspection", subtitle: "Our team checks", items: interiorChecks },
              { icon: FaWrench, title: "Mechanical Inspection", subtitle: "A detailed inspection includes", items: mechanicalChecks },
              { icon: FaTachometerAlt, title: "Tire & Wheel", subtitle: "We inspect", items: tireChecks },
            ].map((section) => (
              <div key={section.title} className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-[#FFF8E7] rounded-xl flex items-center justify-center">
                    <section.icon className="text-base text-[#FFA602]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{section.title}</h4>
                    <p className="text-[11px] text-gray-400">{section.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-2 ml-[52px]">
                  {section.items.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#FFA602] rounded-full shrink-0" />
                      <span className="text-xs text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Used Car + Pre Purchase */}
        <div className="pb-16 grid lg:grid-cols-2 gap-6">
          <div className="p-7 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Used Car Inspection</h3>
            <p className="text-gray-500 text-xs mb-4">Protect yourself from unexpected repair charges</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              A professional used car inspection will protect you from unexpected repair charges. Lots of cars present as perfect at first which only later present major mechanical and structural problems.
            </p>
            <p className="text-gray-700 text-[11px] font-semibold uppercase tracking-wider mb-3">Our inspectors identify:</p>
            <div className="space-y-1.5">
              {usedCarIssues.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-7 rounded-2xl border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pre Purchase Inspection</h3>
            <p className="text-gray-500 text-xs mb-4">Full assessment before you buy</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              We have a pre purchase car inspection that is for those looking to buy a used car. Before you part with your money we provide a full assessment of:
            </p>
            <div className="space-y-1.5">
              {prePurchaseChecks.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-green-500 shrink-0" size={11} />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Report */}
        <div className="pb-16 bg-[#0B1437] rounded-3xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l2 3-2 3z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Detailed Inspection Report</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                In each inspection we present to you a professional car inspection report of our findings in a very easy to read format.
              </p>
              <div className="flex flex-wrap gap-2">
                {["PDF Format", "Photo Evidence", "Expert Analysis", "Action Items"].map((tag) => (
                  <span key={tag} className="bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-[11px] font-medium">{tag}</span>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {reportIncludes.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-[#FFA602]/20 rounded-lg flex items-center justify-center shrink-0">
                    <FaCheckCircle size={11} className="text-[#FFA602]" />
                  </div>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Who Needs + Why Sello */}
        <div className="py-16 grid lg:grid-cols-2 gap-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Who Needs This?</h3>
            <p className="text-gray-500 text-sm mb-6">Our services are ideal for</p>
            <div className="grid grid-cols-2 gap-4">
              {whoNeeds.map((item) => (
                <div key={item.title} className="text-center p-5 rounded-xl border border-gray-100 hover:border-[#FFA602]/30 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 mx-auto mb-3 bg-[#FFF8E7] rounded-xl flex items-center justify-center">
                    <item.icon className="text-lg text-[#FFA602]" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-[11px] text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Sello?</h3>
            <p className="text-gray-500 text-sm mb-5">Dedicated to safer car purchases</p>
            <p className="text-gray-600 text-sm leading-relaxed mb-5">
              Sello is dedicated to bringing you safer and smarter car purchases in Pakistan. We have an independent, transparent and accurate inspection process which reports the true state of the vehicle.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
              {whySello.map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <FaCheckCircle className="text-[#FFA602] shrink-0" size={11} />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pb-16">
          <div className="bg-gradient-to-r from-[#FFF8E7] to-[#FFF3D6] rounded-3xl p-8 md:p-10">
            <div className="max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Book Your Car Inspection Today</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Don't put yourself at risk when you buy a car. At Sello we provide professional car inspection services which will give you all the info you need before you decide to buy.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-[#FFA602] text-white px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#e69500] transition-all shadow-lg shadow-[#FFA602]/20 text-sm">
                  <FaPhoneAlt /> Contact Us
                </button>
                <Link to="/listings" className="bg-white border border-gray-200 text-gray-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition-all text-sm flex items-center gap-2 shadow-sm">
                  <FaCar /> Browse Cars
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="pb-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h3>
            <p className="text-gray-500 text-sm">Got questions? We've got answers.</p>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left gap-4"
                >
                  <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 ${openFaq === i ? "bg-[#FFA602]" : "bg-gray-100"}`}>
                    <FaChevronDown size={12} className={`transition-all duration-200 ${openFaq === i ? "text-white rotate-180" : "text-gray-500"}`} />
                  </div>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-5 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CarInspectionContent;
