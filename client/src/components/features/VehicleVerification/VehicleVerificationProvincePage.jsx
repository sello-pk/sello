import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  Info,
  Lock,
  Search,
  Shield,
  Sparkles,
} from "lucide-react";
import SEO from "../../common/SEO";
import NewsLatter from "../../utils/NewsLatter";
import { AdSenseSlot } from "../../ads";
import { VehicleVerificationProvinceSchema } from "../../common/StructuredData";
import listingHero from "../../../assets/images/verification/vehicleVerificationHeroSection.jpeg";
import enterDetailsIcon from "../../../assets/images/verification/enter_details.png";
import recordIcon from "../../../assets/images/verification/record.png";
import reportIcon from "../../../assets/images/verification/report.png";
import confidenceIcon from "../../../assets/images/verification/confidence.png";
import {
  getGuideBySlug,
  PROVINCE_META,
  PROVINCE_ORDER,
  PORTAL_LABELS,
  formatVerifiedDate,
  VEHICLE_VERIFICATION_GUIDES,
} from "./vehicleVerificationContent";

const stepVisuals = [
  { icon: enterDetailsIcon, circle: "bg-green-50" },
  { icon: recordIcon, circle: "bg-sky-50" },
  { icon: reportIcon, circle: "bg-violet-50" },
  { icon: confidenceIcon, circle: "bg-green-50" },
];

const AccordionItem = ({ title, open, onToggle, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
    >
      <h3 className="text-sm sm:text-base font-semibold text-slate-900">
        {title}
      </h3>
      <span className="text-slate-400 text-xl leading-none shrink-0">
        {open ? "−" : "+"}
      </span>
    </button>
    {open ? (
      <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed">
        {children}
      </div>
    ) : null}
  </div>
);

const provinceDisplayName = (slug, fallback) => {
  if (fallback) return fallback;
  if (slug === "kpk") return "Khyber Pakhtunkhwa";
  if (slug === "gilgit-baltistan") return "Gilgit-Baltistan";
  if (slug === "azad-kashmir") return "Azad Kashmir";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
};

const VehicleVerificationProvincePage = () => {
  const { provinceSlug } = useParams();
  const slug = String(provinceSlug || "").toLowerCase();
  const guide = getGuideBySlug(slug);
  const [openFaq, setOpenFaq] = useState(null);

  if (!guide) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <SEO
          title="Vehicle Verification Guide Not Found | Sello.pk"
          description="The requested vehicle verification province guide was not found."
          canonical="https://sello.pk/vehicle-verification"
          robots="noindex, follow"
        />
        <h1 className="text-2xl font-bold mb-3">Guide not found</h1>
        <p className="text-slate-600 mb-6">
          Choose a province from the vehicle verification hub.
        </p>
        <Link
          to="/vehicle-verification"
          className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Back to Vehicle Verification <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const meta = PROVINCE_META[slug] || {};
  const name = provinceDisplayName(slug, guide.name);
  const canonical = `https://sello.pk/vehicle-verification/${slug}`;
  const otherGuides = VEHICLE_VERIFICATION_GUIDES.filter((g) => g.slug !== slug);
  const checkHalf = Math.ceil((guide.whatYouCanCheck?.length || 0) / 2);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-white pb-20 lg:pb-0">
      <SEO
        title={guide.seoTitle}
        description={guide.seoDescription}
        canonical={canonical}
        keywords={`${name} vehicle verification, Excise vehicle check, MTMIS, car registration verification Pakistan`}
      />
      <VehicleVerificationProvinceSchema guide={guide} />

      {/* Hero — same language as landing */}
      <section className="relative w-full overflow-hidden min-h-[52vh] bg-gray-200">
        <img
          src={listingHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchpriority="high"
          decoding="async"
          width="1200"
          height="600"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/25 via-slate-900/40 to-slate-900/50" />
        <div className="relative z-10 flex min-h-[52vh] flex-col justify-center w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center w-full min-w-0 max-w-3xl mx-auto">
            <nav
              className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-white/75"
              aria-label="Breadcrumb"
            >
              <Link to="/" className="hover:text-white">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link to="/vehicle-verification" className="hover:text-white">
                Vehicle Verification
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-white">{name}</span>
            </nav>

            {meta.icon ? (
              <div className="mx-auto mb-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white shadow-sm">
                <img
                  src={meta.icon}
                  alt=""
                  className="max-h-[70%] max-w-[70%] object-contain"
                />
              </div>
            ) : null}

            <div className="inline-flex max-w-full items-center gap-2 bg-white text-primary-500 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-5 shadow-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {PORTAL_LABELS[slug] || guide.authorityName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight text-balance">
              {name} Vehicle Verification
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-100 mb-5 sm:mb-8 text-pretty">
              {guide.shortDescription}. Read the steps below, then continue on
              the official government portal — Sello never asks for your CNIC
              or registration number here.
            </p>

            <div className="flex flex-col min-[420px]:flex-row flex-wrap justify-center items-stretch min-[420px]:items-center gap-2.5 sm:gap-3 mb-5 sm:mb-8">
              <a
                href={guide.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary-500/25"
              >
                <Search className="w-4 h-4 shrink-0" />
                Verify on official portal
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <a
                href="#how-to-verify"
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
                No CNIC collected
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-primary-500 font-semibold mb-2">
            {guide.authorityName}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            About {name} verification
          </h2>
          <p className="text-slate-600 leading-relaxed text-pretty">
            {guide.introduction}
          </p>
          <p className="mt-4 text-xs text-slate-400">
            Last verified: {formatVerifiedDate(guide.lastVerifiedAt)}
          </p>
        </div>
      </section>

      {/* How to verify — 4 step grid like landing */}
      <section id="how-to-verify" className="scroll-mt-24 py-14 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            How {name} Verification Works?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {(guide.howToVerify || []).map((step, i) => (
              <div key={step} className="relative text-center px-2">
                {i < (guide.howToVerify?.length || 0) - 1 ? (
                  <ArrowRight
                    className="hidden lg:block absolute top-10 -right-3 w-6 h-6 text-slate-300"
                    aria-hidden
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${stepVisuals[i % stepVisuals.length].circle}`}
                >
                  <img
                    src={stepVisuals[i % stepVisuals.length].icon}
                    alt=""
                    className="w-12 h-12 object-contain"
                  />
                </div>
                <p className="text-xs font-semibold text-primary-500 mb-1">
                  Step {i + 1}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href={guide.officialPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-8 py-3.5 rounded-lg font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary-500/25"
            >
              Open {PORTAL_LABELS[slug] || "official portal"}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSenseSlot
            slot="vehicleVerificationTop"
            format="auto"
            fullWidthResponsive
            minHeight={100}
          />
        </div>
      </div>

      {/* What you can check */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              Information You Can Verify
            </h2>
            <div className="grid lg:grid-cols-[1fr_1fr_minmax(220px,280px)] gap-8 items-start">
              <div className="space-y-3">
                {(guide.whatYouCanCheck || []).slice(0, checkHalf).map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {(guide.whatYouCanCheck || []).slice(checkHalf).map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-primary-50 px-6 py-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                  <Shield className="w-7 h-7 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Official only
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Enter vehicle details only on{" "}
                  {PORTAL_LABELS[slug] || "the government portal"} — never on
                  unofficial forms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
            Before You Buy or Sell
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {(guide.tips || []).map((tip) => (
              <div
                key={tip}
                className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      {guide.faqs?.length ? (
        <section className="py-14 sm:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {guide.faqs.map((faq, i) => (
                <AccordionItem
                  key={faq.question}
                  title={faq.question}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <p>{faq.answer}</p>
                </AccordionItem>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Other provinces — same card UI as landing */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Other Regions
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Need a different province? Open another Sello guide, then continue
              to that region&apos;s official portal.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherGuides.map((item) => {
              const itemMeta = PROVINCE_META[item.slug] || {};
              return (
                <Link
                  key={item.slug}
                  to={`/vehicle-verification/${item.slug}`}
                  className="group flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow hover:bg-green-200"
                >
                  <div className="w-20 h-20 mb-4 flex items-center justify-center">
                    {itemMeta.icon ? (
                      <img
                        src={itemMeta.icon}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : null}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">
                    {item.shortDescription}
                  </p>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-500 text-primary-500 text-sm font-semibold px-4 py-2 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                    Explore guide <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="bg-white pt-2">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSenseSlot
            slot="vehicleVerificationBottom"
            format="auto"
            fullWidthResponsive
            minHeight={100}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <section className="pb-8 pt-10 bg-white">
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
                  Sello.pk publishes guidance only. Vehicle verification happens
                  on official government portals. Confirm results with the
                  vehicle and original documents before you buy or sell. Official
                  source:{" "}
                  <a
                    href={guide.officialPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline break-all"
                  >
                    {guide.officialPortalUrl}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/vehicle-verification"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600"
            >
              All verification guides
            </Link>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600"
            >
              Browse vehicles
            </Link>
            <Link
              to="/driving-licence"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600"
            >
              Driving licence guides
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3">
        <a
          href={guide.officialPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 text-white font-semibold px-4 py-3"
        >
          Verify on official portal
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <NewsLatter />
    </div>
  );
};

export default VehicleVerificationProvincePage;
