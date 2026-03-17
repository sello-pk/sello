import React from "react";
import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { IoCarSportSharp } from "react-icons/io5";
import { RiAuctionFill } from "react-icons/ri";
import { FaCircleCheck } from "react-icons/fa6";

const steps = [
  {
    step: "01",
    title: "Register",
    desc: "Complete verification & pay refundable token to bid",
    icon: <FaUser />,
  },
  {
    step: "02",
    title: "Browse",
    desc: "Explore cars in current or upcoming auctions",
    icon: <IoCarSportSharp />,
  },
  {
    step: "03",
    title: "Bid",
    desc: "Place bids online or visit Okara yard",
    icon: <RiAuctionFill />,
  },
  {
    step: "04",
    title: "Win & Collect",
    desc: "Pay within 48hrs & pickup from Okara",
    icon: <FaCircleCheck />,
  },
];

export default function HowAuctionsWork() {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background: gradient + decoration (behind content) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 via-white to-primary-50/30" aria-hidden />
      <div className="absolute inset-0 z-0 bg-grid-black/[0.02] bg-[size:50px_50px]" aria-hidden />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob z-0" aria-hidden />
      <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000 z-0" aria-hidden />
      <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000 z-0" aria-hidden />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            How Auctions Work
          </h2>
          <p className="text-base text-slate-600 max-w-2xl mx-auto">
            Simple, transparent, and secure bidding process
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item) => (
            <div key={item.step} className="relative text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#FFA602] to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg text-black text-2xl">
                {item.icon}
              </div>
              <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-5xl font-bold text-white/5">
                {item.step}
              </span>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/auctions/live"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-[#FFA602] to-amber-500 text-white hover:from-amber-500 hover:to-[#FFA602] transition-all"
          >
              View Live Auction
          </Link>
        </div>
      </div>
    </section>
  );
}
