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
  FaIdCard,
  FaReceipt,
  FaExchangeAlt,
  FaMedal,
  FaCarSide,
  FaFileContract,
  FaHandshake,
} from "react-icons/fa";
import { FiZap, FiShield, FiLock } from "react-icons/fi";
import { Link } from "react-router-dom";
import SEO from "../../common/SEO";
import NewsLatter from "../../utils/NewsLatter";

const provinces = [
  { name: "Punjab", desc: "Verify Punjab Vehicle Registration Records", url: "https://mtmis.excise.punjab.gov.pk/" },
  { name: "Islamabad", desc: "Verify Islamabad Vehicle Ownership Records", url: "https://islamabadexcise.gov.pk/" },
  { name: "Sindh", desc: "Check Sindh Vehicle Registration Details", url: "https://excise.gos.pk/vehicle/vehicle_search" },
  { name: "KPK", desc: "Access KPK Vehicle Verification Services", url: "https://www.kpexcise.gov.pk/mvrecords/" },
];

const whyVerify = [
  { icon: FaUserCheck, title: "Ownership Verification", desc: "Ensure the seller is the registered owner" },
  { icon: FaClipboardCheck, title: "Registration Confirmation", desc: "Confirm official registration records" },
  { icon: FaShieldAlt, title: "Fraud Prevention", desc: "Avoid stolen or fraudulent vehicles" },
  { icon: FaLock, title: "Buyer Protection", desc: "Make informed and secure purchasing decisions" },
];

const buyingTips = [
  "Always verify vehicle registration and ownership details",
  "Match chassis number, engine number and registration documents",
  "Check token tax, transfer history and tax payment status",
  "Meet the seller in a safe and public location",
  "Inspect the vehicle condition physically before payment",
  "Take a test drive and check all mechanical & electrical systems",
  "Use trusted platforms like Sello for safe transactions",
];

const steps = [
  { icon: FaSearch, title: "Enter Details", desc: "Provide vehicle registration number." },
  { icon: FaFileAlt, title: "We Check Records", desc: "We verify information from official sources." },
  { icon: FaCar, title: "Get Report", desc: "Receive complete verification report instantly." },
  { icon: FaShieldAlt, title: "Buy with Confidence", desc: "Make a safe and informed buying decision." },
];

const verifyInfo = [
  "Owner Name", "Registration Number", "Chassis Number", "Engine Number",
  "Make / Model", "Model Year", "Color", "Registration Date",
  "Token Tax Status", "Tax Payment History", "Transfer History",
  "Fitness Certificate", "Insurance Status", "Legal Record Check",
];

const documents = [
  { icon: FaFileContract, title: "Registration Book", desc: "Original registration issued by Excise." },
  { icon: FaReceipt, title: "Token Tax Paid", desc: "Valid token tax receipt." },
  { icon: FaIdCard, title: "CNIC of Seller", desc: "Match CNIC with registration." },
  { icon: FaExchangeAlt, title: "Transfer Letter", desc: "Check transfer history and letters." },
  { icon: FaCarSide, title: "Chassis Plate", desc: "Verify chassis number." },
  { icon: FaIndustry, title: "Engine Number", desc: "Match engine number." },
  { icon: FaMedal, title: "Insurance (If Any)", desc: "Check valid insurance." },
  { icon: FaCheckCircle, title: "Fitness Certificate", desc: "Ensure vehicle is fitness approved." },
];

const faqs = [
  { q: "How does vehicle verification work on Sello?", a: "Sello connects to official provincial databases (MTMIS/Excise) to retrieve vehicle registration, ownership, and tax records. Simply enter your vehicle's registration number and we fetch the verified data for you." },
  { q: "Is vehicle verification free?", a: "Basic vehicle verification on Sello is completely free. You can check registration status, ownership details, and token tax information at no cost." },
  { q: "Which provinces are currently supported?", a: "We currently support vehicle verification for Punjab, Islamabad, Sindh, and KPK. We are actively working on adding more provinces and regions." },
  { q: "Can I verify vehicle ownership details?", a: "Yes, our verification service provides ownership details including the registered owner's name, registration date, and transfer history where available from official sources." },
  { q: "What information do I need to verify a vehicle?", a: "You need the vehicle's registration number (e.g., LEA-1234) to start the verification. Additional details like chassis or engine number can provide more comprehensive results." },
  { q: "How accurate is the verification information?", a: "Our data comes directly from official government sources and MTMIS databases. While we strive for accuracy, we recommend using this as one of multiple verification steps before purchasing." },
  { q: "Can I get a printed verification report?", a: "Yes, you can download and print your verification report as a PDF document for your records or to share with potential buyers/sellers." },
  { q: "How long does it take to get the verification report?", a: "Most verification reports are generated instantly. In some cases where additional verification is needed, it may take up to 24 hours." },
];

const stats = [
  { value: "150K+", label: "Verified Listings" },
  { value: "80K+", label: "Real Sellers" },
  { value: "1M+", label: "Happy Users" },
  { value: "25+", label: "Cities Covered" },
  { value: "4.8/5", label: "Rated" },
];

const VehicleVerificationPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <SEO
        title="Vehicle Verification Pakistan - MTMIS | Sello"
        description="Verify vehicle ownership, registration details and records before making a purchase. Stay protected from fraud and buy with confidence on Sello.pk."
        keywords="vehicle verification, MTMIS, car verification Pakistan, vehicle registration check, ownership verification"
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
                <span className="text-xs text-gray-300 font-medium">Official MTMIS Data Sources</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1]">
                Vehicle <br />
                <span className="text-[#FFA602]">Verification</span>
              </h1>
              <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-md">
                Verify vehicle ownership, registration details and records before making a purchase. Stay protected from fraud.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="bg-[#FFA602] text-white px-7 py-3.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-[#e69500] transition-all shadow-lg shadow-[#FFA602]/25 hover:shadow-[#FFA602]/40 hover:-translate-y-0.5">
                  <FaSearch /> Verify Vehicle
                </button>
                <button className="bg-white/5 backdrop-blur-sm border border-white/10 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-all hover:-translate-y-0.5">
                  Learn More
                </button>
              </div>
            </div>
            <div className="hidden md:flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-56 bg-gradient-to-br from-white/[0.07] to-transparent rounded-3xl border border-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                  <FaCar className="text-8xl text-white/10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1437]/50 to-transparent" />
                </div>
                <div className="absolute -right-6 top-10 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-2xl shadow-black/20 border border-gray-100">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Verification Status</div>
                  <div className="space-y-2.5">
                    {["Owner Verified", "Registration Confirmed", "Clear Legal History"].map((t) => (
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
              <div className="flex items-center gap-2"><FiShield className="text-green-400" /> <span className="text-gray-300">Secure</span></div>
              <div className="flex items-center gap-2"><FaIndustry className="text-green-400" /> <span className="text-gray-300">Official Data Sources</span></div>
              <div className="flex items-center gap-2"><FiLock className="text-green-400" /> <span className="text-gray-300">100% Confidential</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Province Selection */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Select Your Province</h2>
            <p className="text-gray-500 text-sm sm:text-base">Choose your province to verify vehicle details and ownership records</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {provinces.map((p) => (
              <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="group relative bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#FFA602]/40 hover:shadow-xl hover:shadow-[#FFA602]/10 transition-all duration-300 overflow-hidden block">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FFA602]/5 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#FFF8E7] to-[#FFF3D6] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
                      {p.name === "Punjab" && <><rect x="14" y="6" width="20" height="34" rx="3" fill="#FFA602" opacity="0.8" /><rect x="10" y="37" width="28" height="5" rx="2" fill="#FFA602" opacity="0.5" /></>}
                      {p.name === "Islamabad" && <><polygon points="24,4 38,42 10,42" fill="#FFA602" opacity="0.8" /><rect x="21" y="18" width="6" height="24" rx="1" fill="white" opacity="0.6" /></>}
                      {p.name === "Sindh" && <><rect x="8" y="20" width="32" height="22" rx="3" fill="#FFA602" opacity="0.7" /><rect x="12" y="10" width="24" height="14" rx="2" fill="#FFA602" opacity="0.5" /><rect x="18" y="26" width="5" height="10" rx="1" fill="white" opacity="0.5" /><rect x="25" y="26" width="5" height="10" rx="1" fill="white" opacity="0.5" /></>}
                      {p.name === "KPK" && <><path d="M6,42 L18,10 L24,26 L30,8 L42,42 Z" fill="#FFA602" opacity="0.7" /></>}
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">Verify {p.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-4">{p.desc}</p>
                  <span className="text-xs font-semibold text-[#FFA602] flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Verify Vehicle <FaArrowRight size={10} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Verify */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Why Vehicle Verification Matters</h2>
            <p className="text-gray-500 text-sm sm:text-base">Protect yourself from fraud and make informed decisions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyVerify.map((item) => (
              <div key={item.title} className="group relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 text-center hover:from-[#FFF8E7] hover:to-white border border-gray-100 hover:border-[#FFA602]/20 hover:shadow-lg transition-all duration-300">
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

      {/* Smart Buying Tips */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Smart Buying Tips</h2>
              <div className="space-y-4">
                {buyingTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B1437] to-[#1a2a5e] flex items-center justify-center shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                      <span className="text-white text-[11px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                    </div>
                    <span className="text-sm text-gray-600 leading-relaxed pt-1">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative rounded-3xl overflow-hidden bg-[#0B1437] aspect-[4/3] shadow-2xl shadow-black/10">
                <img
                  src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80"
                  alt="Car"
                  className="w-full h-full object-cover opacity-40"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1437] via-[#0B1437]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FFA602]/20 rounded-xl flex items-center justify-center">
                        <FaShieldAlt className="text-[#FFA602]" />
                      </div>
                      <div>
                        <div className="text-white font-semibold text-sm">Trusted Verification</div>
                        <div className="text-gray-400 text-xs">Official government sources</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">How Vehicle Verification Works?</h2>
            <p className="text-gray-500 text-sm sm:text-base">Four simple steps to verify any vehicle</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative group">
                <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 text-center border border-gray-100 group-hover:border-[#FFA602]/30 group-hover:from-[#FFF8E7] group-hover:to-white group-hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FFF8E7] to-[#FFF3D6] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <step.icon className="text-xl text-[#FFA602]" />
                  </div>
                  <div className="absolute -top-3 -right-3 w-7 h-7 bg-[#0B1437] rounded-lg flex items-center justify-center shadow-md">
                    <span className="text-white text-[10px] font-bold">{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 w-6 h-6 text-gray-300 items-center justify-center z-10">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-10">
            {["Fast", "Secure", "Accurate", "Official"].map((t, i) => (
              <div key={t} className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <FaCheckCircle size={10} className="text-green-600" />
                </div>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Information You Can Verify */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">Information You Can Verify</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {verifyInfo.map((item) => (
                  <div key={item} className="flex items-center gap-3 py-2 group">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0 group-hover:bg-green-500 transition-colors">
                      <FaCheckCircle className="text-green-600 group-hover:text-white transition-colors" size={10} />
                    </div>
                    <span className="text-sm text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 text-center border border-green-100/50">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm mx-auto">
                  <FaShieldAlt className="text-2xl text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">100% Confidential</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Your information is safe with us. We never share your data with anyone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Documents You Should Check</h2>
            <p className="text-gray-500 text-sm sm:text-base">Always review these documents before finalizing any vehicle purchase.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {documents.map((doc) => (
              <div key={doc.title} className="group bg-gradient-to-b from-gray-50 to-white rounded-2xl p-5 hover:from-blue-50 hover:to-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <doc.icon className="text-base text-blue-500" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">{doc.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{doc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
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

      {/* Stats */}
      <section className="py-16 bg-[#0B1437]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Why Millions Trust Sello</h2>
            <p className="text-gray-500 text-sm mt-2">Pakistan&apos;s #1 Automotive Marketplace</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#FFA602]">{s.value}</div>
                <div className="text-white font-medium text-sm mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore More */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Explore More Services on Sello</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { to: "/car-estimator", icon: FiZap, title: "AI Car Estimator", desc: "Get instant market value of your car using AI technology.", cta: "Try Estimator" },
              { to: "/listings", icon: FaCar, title: "Car Listings", desc: "Browse thousands of verified cars for sale across Pakistan.", cta: "Browse Cars" },
              { to: "/blog", icon: FaFileAlt, title: "Car Buying Guides", desc: "Expert tips, checks and guides to help you buy smarter.", cta: "Read Guides" },
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
                  Vehicle verification information is provided through official provincial data sources where available. Sello does not guarantee the accuracy, completeness, or real-time availability of third-party records. Users should independently verify all vehicle information before making any purchase decisions.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs text-gray-400">
            {[
              { icon: FaCheckCircle, text: "Official & Verified Data Sources" },
              { icon: FaShieldAlt, text: "Bank-level Data Security" },
              { icon: FaLock, text: "100% Confidential Information" },
              { icon: FaHandshake, text: "Dedicated 24/7 Support" },
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

export default VehicleVerificationPage;
