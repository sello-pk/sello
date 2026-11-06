import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
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
  PORTAL_LABELS,
  formatVerifiedDate,
  VEHICLE_VERIFICATION_GUIDES,
} from "./vehicleVerificationContent";

const stepVisuals = [
  { icon: enterDetailsIcon, circle: "bg-emerald-50" },
  { icon: recordIcon, circle: "bg-sky-50" },
  { icon: reportIcon, circle: "bg-violet-50" },
  { icon: confidenceIcon, circle: "bg-amber-50" },
];

const AccordionItem = ({ title, open, onToggle, children }) => (
  <div
    className={`rounded-2xl border bg-white overflow-hidden transition-colors ${
      open ? "border-primary-300 shadow-sm" : "border-slate-200 hover:border-slate-300"
    }`}
  >
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      aria-expanded={open}
    >
      <h3 className="text-sm sm:text-base font-semibold text-slate-900">
        {title}
      </h3>
      <ChevronDown
        className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
          open ? "rotate-180 text-primary-500" : ""
        }`}
      />
    </button>
    <div
      className={`grid transition-[grid-template-rows] duration-200 ease-out ${
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">
          {children}
        </div>
      </div>
    </div>
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
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-white pb-24 lg:pb-0">
      <SEO
        title={guide.seoTitle}
        description={guide.seoDescription}
        canonical={canonical}
        keywords={`${name} vehicle verification, Excise vehicle check, MTMIS, car registration verification Pakistan`}
      />
      <VehicleVerificationProvinceSchema guide={guide} />

      <section className="relative w-full overflow-hidden min-h-[56vh] sm:min-h-[58vh] bg-gray-200">
        <img
          src={listingHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchpriority="high"
          decoding="async"
          width="1200"
          height="600"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/45 to-slate-900/60" />
        <div className="relative z-10 flex min-h-[56vh] sm:min-h-[58vh] flex-col justify-center w-full min-w-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="text-center w-full min-w-0 max-w-3xl mx-auto">
            <nav
              className="mb-5 flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm text-white/75"
              aria-label="Breadcrumb"
            >
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                to="/vehicle-verification"
                className="hover:text-white transition-colors"
              >
                Vehicle Verification
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-white font-medium">{name}</span>
            </nav>

            {meta.icon ? (
              <div className="mx-auto mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-white/20">
                <img
                  src={meta.icon}
                  alt=""
                  className="max-h-[70%] max-w-[70%] object-contain"
                />
              </div>
            ) : null}

            <div className="inline-flex max-w-full items-center gap-2 bg-white text-primary-500 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-5 shadow-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">
                {PORTAL_LABELS[slug] || guide.authorityName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight text-balance">
              {name} Vehicle Verification
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-100 mb-6 sm:mb-8 text-pretty">
              {guide.shortDescription}. Read the steps below, then continue on
              the official government portal — Sello never asks for your CNIC or
              registration number here.
            </p>

            <div className="flex flex-col min-[420px]:flex-row flex-wrap justify-center items-stretch min-[420px]:items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
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
                href="#official-actions"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
              >
                Official actions
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

      {/* Province switcher */}
      <section className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {VEHICLE_VERIFICATION_GUIDES.map((item) => {
              const active = item.slug === slug;
              return (
                <Link
                  key={item.slug}
                  to={`/vehicle-verification/${item.slug}`}
                  className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-500 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {PROVINCE_META[item.slug]?.icon ? (
                    <img
                      src={PROVINCE_META[item.slug].icon}
                      alt=""
                      className="h-5 w-5 object-contain"
                    />
                  ) : null}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="official-actions"
        className="scroll-mt-24 py-12 sm:py-16 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Official Actions
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              These buttons leave Sello and open {name} government services.
              Vehicle checks happen only on official portals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {(guide.actionLinks || []).map((link, i) => (
              <a
                key={`${link.key}-${link.url}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 hover:border-primary-400 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${stepVisuals[i % stepVisuals.length].circle}`}
                >
                  <img
                    src={stepVisuals[i % stepVisuals.length].icon}
                    alt=""
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <p className="text-base font-bold text-slate-900 mb-1">
                  {link.label}
                </p>
                <p className="text-sm text-slate-500 mb-4 flex-1 leading-relaxed">
                  {link.note || "Opens official government site"}
                </p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 group-hover:gap-2 transition-all">
                  Continue <ExternalLink className="w-4 h-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-primary-500 font-semibold mb-2 tracking-wide uppercase">
            {guide.authorityName}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            About {name} verification
          </h2>
          <p className="text-slate-600 leading-relaxed text-pretty text-base sm:text-lg">
            {guide.introduction}
          </p>
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Last verified: {formatVerifiedDate(guide.lastVerifiedAt)}
          </p>
        </div>
      </section>

      <section
        id="how-to-verify"
        className="scroll-mt-24 py-12 sm:py-16 bg-slate-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              How {name} Verification Works
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Follow these steps, then open the official portal to complete the
              check.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {(guide.howToVerify || []).map((step, i) => (
              <div
                key={step}
                className="relative rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${stepVisuals[i % stepVisuals.length].circle}`}
                >
                  <img
                    src={stepVisuals[i % stepVisuals.length].icon}
                    alt=""
                    className="w-9 h-9 object-contain"
                  />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary-500 mb-2">
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

      <div className="bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSenseSlot
            slot="vehicleVerificationTop"
            format="auto"
            fullWidthResponsive
            minHeight={100}
          />
        </div>
      </div>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 sm:p-8 lg:p-10 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              Information You Can Verify
            </h2>
            <div className="grid lg:grid-cols-[1fr_1fr_minmax(220px,280px)] gap-8 items-start">
              <div className="space-y-3">
                {(guide.whatYouCanCheck || [])
                  .slice(0, checkHalf)
                  .map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="space-y-3">
                {(guide.whatYouCanCheck || []).slice(checkHalf).map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-600 leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-primary-500 px-6 py-8 text-center text-white shadow-lg shadow-primary-500/20">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/15 flex items-center justify-center">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Official only</h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  Enter vehicle details only on{" "}
                  {PORTAL_LABELS[slug] || "the government portal"} — never on
                  unofficial forms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-10">
            Before You Buy or Sell
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {(guide.tips || []).map((tip, i) => (
              <div
                key={tip}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-600">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 leading-relaxed pt-1">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {guide.faqs?.length ? (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
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

      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
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
                  className="group flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all"
                >
                  <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-slate-50 group-hover:bg-primary-50 transition-colors">
                    {itemMeta.icon ? (
                      <img
                        src={itemMeta.icon}
                        alt=""
                        className="max-w-[70%] max-h-[70%] object-contain"
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

      <section className="pb-10 pt-10 bg-white">
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
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              All verification guides
            </Link>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              Browse vehicles
            </Link>
            <Link
              to="/driving-licence"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              Driving licence guides
            </Link>
          </div>
        </div>
      </section>

      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <a
          href={guide.officialPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 text-white font-semibold px-4 py-3 shadow-lg shadow-primary-500/20"
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
