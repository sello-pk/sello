import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FileWarning,
  IdCard,
  MapPinned,
  Shield,
  Sparkles,
} from "lucide-react";
import SEO from "../../common/SEO";
import { AdSenseSlot } from "../../ads";
import { DrivingLicenceLandingSchema } from "../../common/StructuredData";
import {
  DRIVING_LICENCE_GUIDES,
  HOW_IT_WORKS,
  WHAT_YOU_CAN_DO,
  PREPARATION_CHECKLIST,
  LANDING_FAQS,
  PORTAL_LABELS,
  PROVINCE_META,
  LAST_VERIFIED_AT,
  formatVerifiedDate,
} from "./drivingLicenceContent";

const scrollToId = (id) => (event) => {
  event.preventDefault();
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const DrivingLicenceLandingPage = () => {
  const [openFaq, setOpenFaq] = useState(0);
  const guides = DRIVING_LICENCE_GUIDES;

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-white text-slate-800">
      <SEO
        title="Driving Licence Information & Verification in Pakistan | Sello.pk"
        description="Official-province guides for Pakistan driving licences. Explore Punjab, Sindh, KPK, Islamabad and Balochistan processes, then continue to government portals to apply, renew or verify."
        canonical="https://sello.pk/driving-licence"
        keywords="driving licence Pakistan, DLIMS Punjab, DLS Sindh, Islamabad DLIMS, KPK driving licence, Balochistan driving licence, verify driving licence"
      />
      <DrivingLicenceLandingSchema />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(16,185,129,0.35), transparent 42%), radial-gradient(circle at 80% 10%, rgba(56,189,248,0.25), transparent 36%), radial-gradient(circle at 70% 80%, rgba(251,191,36,0.18), transparent 40%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <nav className="text-sm text-white/70 mb-6" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white">Driving Licence</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide mb-5 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                Pakistan DLIMS &amp; traffic police guides
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4 text-balance">
                Driving Licence Information &amp; Verification in Pakistan
              </h1>
              <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-7 text-pretty">
                Get clear, province-by-province guidance for learner permits,
                permanent licences, renewals and verification — then continue on
                the correct official government portal. Sello never asks for your
                CNIC or licence number on these pages.
              </p>
              <div className="flex flex-col min-[420px]:flex-row gap-3 mb-7">
                <a
                  href="#select-province"
                  onClick={scrollToId("select-province")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 text-slate-950 font-bold px-5 py-3 hover:opacity-90 transition-all hover:-translate-y-0.5"
                >
                  <MapPinned className="w-4 h-4" />
                  Choose province
                </a>
                <a
                  href="#how-it-works"
                  onClick={scrollToId("how-it-works")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 font-semibold px-5 py-3 hover:bg-slate-100 transition-all"
                >
                  How it works
                </a>
              </div>
              <ul className="flex flex-wrap gap-2 text-xs sm:text-sm text-white/80">
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <BadgeCheck className="w-4 h-4 text-emerald-300" />
                  Official portal links only
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <Shield className="w-4 h-4 text-sky-300" />
                  No CNIC collection
                </li>
                <li className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                  <IdCard className="w-4 h-4 text-amber-300" />
                  5 province guides
                </li>
              </ul>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-6 backdrop-blur-md shadow-2xl">
                <p className="text-sm font-semibold text-emerald-300 mb-3">
                  Quick start
                </p>
                <ol className="space-y-3">
                  {[
                    "Pick Punjab, Sindh, KPK, Islamabad or Balochistan",
                    "Read documents, steps and FAQs on Sello",
                    "Tap Apply / Renew / Verify to open the official site",
                  ].map((item, index) => (
                    <li
                      key={item}
                      className="flex gap-3 rounded-2xl bg-slate-950/40 border border-white/10 px-3.5 py-3"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-500 text-slate-950 text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-white/85 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-xs text-white/55">
                  Content verified against official portals as of{" "}
                  {formatVerifiedDate(LAST_VERIFIED_AT)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              What these guides help you do
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Each province page walks through the practical path citizens
              usually follow, then hands you off to the correct government
              system for the actual application.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_YOU_CAN_DO.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
              >
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="select-province"
        className="scroll-mt-24 py-14 sm:py-16 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Select your province / region
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Explore the Sello guide first. Official apply, renew, verify and
              track buttons appear on the next page for that province only.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => {
              const meta = PROVINCE_META[guide.slug] || {};
              return (
                <Link
                  key={guide.slug}
                  to={`/driving-licence/${guide.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all hover:-translate-y-1"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-sky-400 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div
                      className={`w-[4.5rem] h-[4.5rem] rounded-2xl ${meta.accent || "bg-slate-50"} flex items-center justify-center ring-1 ring-black/5`}
                    >
                      {meta.icon ? (
                        <img
                          src={meta.icon}
                          alt=""
                          className="max-w-[70%] max-h-[70%] object-contain"
                        />
                      ) : null}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      {PORTAL_LABELS[guide.slug] || "Official portal"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {guide.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-1">
                    {guide.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary-500 text-primary-600 text-sm font-semibold px-4 py-2 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    Explore guide
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-24 py-14 sm:py-16 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              How it works on Sello
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Stay on Sello while you understand the process, then move to the
              government portal only when you are ready to act.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6"
              >
                <span className="text-4xl font-black text-emerald-100 absolute top-4 right-5">
                  {item.step}
                </span>
                <h3 className="relative text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="relative text-sm text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 text-emerald-300 font-semibold mb-4">
              <ClipboardList className="w-5 h-5" />
              Prepare before you apply
            </div>
            <h2 className="text-2xl font-bold mb-4">
              Useful checklist for most provinces
            </h2>
            <ul className="space-y-3">
              {PREPARATION_CHECKLIST.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-white/85">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 text-amber-300 font-semibold mb-4">
              <FileWarning className="w-5 h-5" />
              Official services vs Sello information
            </div>
            <h2 className="text-2xl font-bold mb-4">
              We guide. Government portals issue.
            </h2>
            <p className="text-sm text-white/80 leading-relaxed mb-4">
              Licence applications, payments, tests, card printing and
              verification happen only on official systems such as Punjab DLIMS,
              Sindh DLS Online, Islamabad ITP-DLIMS, Transport KP / Dastak, and
              Quetta Traffic Police. Do not use one province&apos;s portal for
              another region.
            </p>
            <p className="text-xs text-white/60 leading-relaxed">
              Information last verified: {formatVerifiedDate(LAST_VERIFIED_AT)}.
              Always re-check live fees, ages and document lists on the
              government portal before paying or visiting a branch.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSenseSlot
            slot="vehicleVerificationTop"
            format="auto"
            fullWidthResponsive
            minHeight={90}
          />
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {LANDING_FAQS.map((faq, index) => {
              const open = openFaq === index;
              return (
                <button
                  key={faq.q}
                  type="button"
                  onClick={() => setOpenFaq(open ? null : index)}
                  className={`w-full text-left rounded-2xl border px-5 py-4 transition-colors ${
                    open
                      ? "border-emerald-300 bg-white shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="font-semibold text-slate-900">
                      {faq.q}
                    </span>
                    <span className="text-slate-400 text-xl leading-none">
                      {open ? "−" : "+"}
                    </span>
                  </div>
                  {open ? (
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      {faq.a}
                    </p>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-slate-900 mb-5">
            Related Sello services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                to: "/vehicle-verification",
                title: "Vehicle Verification",
                desc: "Check registration records before you buy.",
              },
              {
                to: "/listings",
                title: "Browse listings",
                desc: "Explore cars and bikes for sale across Pakistan.",
              },
              {
                to: "/car-estimator",
                title: "AI Car Estimator",
                desc: "Estimate market value before negotiating.",
              },
              {
                to: "/blog",
                title: "Automotive guides",
                desc: "Read buying tips and market insights.",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-2xl border border-slate-200 p-5 hover:border-primary-500 hover:shadow-md transition-all group"
              >
                <h3 className="font-bold text-slate-900 group-hover:text-primary-600 mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3">{item.desc}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-xs text-slate-500 inline-flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            Example official portal for Punjab residents:{" "}
            <a
              href="https://dlims.punjab.gov.pk/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary-600"
            >
              dlims.punjab.gov.pk
            </a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default DrivingLicenceLandingPage;
