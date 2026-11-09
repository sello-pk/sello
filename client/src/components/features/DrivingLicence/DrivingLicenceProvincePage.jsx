import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Info,
  Lock,
  MapPinned,
  Shield,
  Sparkles,
} from "lucide-react";
import SEO from "../../common/SEO";
import NewsLatter from "../../utils/NewsLatter";
import { AdSenseSlot } from "../../ads";
import { DrivingLicenceProvinceSchema } from "../../common/StructuredData";
import listingHero from "../../../assets/images/driving_licence.jpg";
import enterDetailsIcon from "../../../assets/images/verification/enter_details.png";
import recordIcon from "../../../assets/images/verification/record.png";
import reportIcon from "../../../assets/images/verification/report.png";
import confidenceIcon from "../../../assets/images/verification/confidence.png";
import {
  getGuideBySlug,
  PROVINCE_META,
  PORTAL_LABELS,
  formatVerifiedDate,
  DRIVING_LICENCE_GUIDES,
} from "./drivingLicenceContent";
import { FaqAccordionItem } from "../../common/FaqAccordion";

const stepVisuals = [
  { icon: enterDetailsIcon, circle: "bg-emerald-50" },
  { icon: recordIcon, circle: "bg-sky-50" },
  { icon: reportIcon, circle: "bg-violet-50" },
  { icon: confidenceIcon, circle: "bg-amber-50" },
];

const CONTENT_SECTIONS = [
  { key: "learnerProcedure", title: "Learner licence procedure" },
  { key: "permanentProcedure", title: "Permanent licence procedure" },
  { key: "renewalProcedure", title: "Renewal process" },
  { key: "verificationGuide", title: "Licence verification" },
  { key: "requiredDocuments", title: "Required documents" },
  { key: "ageRequirements", title: "Age requirements" },
  { key: "feesAndPayment", title: "Fees and payment" },
  { key: "drivingTestGuidelines", title: "Driving test guidelines" },
  { key: "trackingInstructions", title: "Track your application" },
];

const provinceDisplayName = (slug, fallback) => {
  if (fallback) return fallback;
  if (slug === "kpk") return "Khyber Pakhtunkhwa";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
};

const DrivingLicenceProvincePage = () => {
  const { provinceSlug } = useParams();
  const slug = String(provinceSlug || "").toLowerCase();
  const guide = getGuideBySlug(slug);
  const [openFaq, setOpenFaq] = useState(null);
  const [openSection, setOpenSection] = useState(0);

  const visibleSections = useMemo(() => {
    if (!guide) return [];
    return CONTENT_SECTIONS.filter((section) => {
      const value = guide[section.key];
      return value && !(Array.isArray(value) && value.length === 0);
    });
  }, [guide]);

  const primaryActions = useMemo(() => {
    if (!guide?.actionLinks?.length) return [];
    const preferred = [
      "learner",
      "permanent",
      "verify",
      "renew",
      "track",
      "portal",
    ];
    return [...guide.actionLinks].sort(
      (a, b) => preferred.indexOf(a.key) - preferred.indexOf(b.key),
    );
  }, [guide]);

  if (!guide) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <SEO
          title="Driving Licence Guide Not Found | Sello.pk"
          description="The requested driving licence province guide was not found."
          canonical="https://sello.pk/driving-licence"
          robots="noindex, follow"
        />
        <h1 className="text-2xl font-bold mb-3">Guide not found</h1>
        <p className="text-slate-600 mb-6">
          Choose a province from the driving licence hub.
        </p>
        <Link
          to="/driving-licence"
          className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold"
        >
          Back to Driving Licence <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const meta = PROVINCE_META[slug] || {};
  const name = provinceDisplayName(slug, guide.name);
  const canonical = `https://sello.pk/driving-licence/${slug}`;
  const otherGuides = DRIVING_LICENCE_GUIDES.filter((g) => g.slug !== slug);

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-white pb-24 lg:pb-0">
      <SEO
        title={guide.seoTitle}
        description={guide.seoDescription}
        canonical={canonical}
        keywords={`${name} driving licence, DLIMS, apply renew verify driving licence Pakistan`}
      />
      <DrivingLicenceProvinceSchema guide={guide} />

      <section className="relative w-full overflow-hidden min-h-[56vh] sm:min-h-[58vh] bg-gray-200">
        <img
          src={listingHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-right"
          fetchpriority="high"
          decoding="async"
          width="1600"
          height="400"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-slate-900/25 to-transparent sm:from-slate-950/40 sm:via-slate-900/15" />
        <div className="relative z-10 flex min-h-[56vh] sm:min-h-[58vh] flex-col justify-start w-full min-w-0 max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-6 sm:pt-8 pb-12 sm:pb-14">
          <div className="text-left w-full min-w-0 max-w-xl lg:max-w-2xl">
            <nav
              className="mb-5 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-white/75"
              aria-label="Breadcrumb"
            >
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                to="/driving-licence"
                className="hover:text-white transition-colors"
              >
                Driving Licence
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-white font-medium">{name}</span>
            </nav>

            {meta.icon ? (
              <div className="mb-5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-white/20">
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
              {name} Driving Licence Guide
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-100 mb-6 sm:mb-8 text-pretty">
              {guide.shortDescription} Continue to the official portal when you
              are ready — Sello never asks for your CNIC or licence number here.
            </p>

            <div className="flex flex-col min-[420px]:flex-row flex-wrap justify-start items-stretch min-[420px]:items-center gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <a
                href={guide.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary-500/25"
              >
                <MapPinned className="w-4 h-4 shrink-0" />
                Visit official portal
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
              <a
                href="#official-actions"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
              >
                View actions
              </a>
            </div>

            <ul className="flex flex-wrap justify-start gap-1.5 sm:gap-3 text-[10px] sm:text-sm text-gray-100">
              <li className="inline-flex items-center gap-1 sm:gap-2 whitespace-nowrap rounded-full bg-white/10 px-2 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-sm">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-primary-500 shrink-0" />
                Secure
              </li>
              <li className="inline-flex items-center gap-1 sm:gap-2 whitespace-nowrap rounded-full bg-white/10 px-2 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-sm">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 shrink-0" />
                Official portals
              </li>
              <li className="inline-flex items-center gap-1 sm:gap-2 whitespace-nowrap rounded-full bg-white/10 px-2 sm:px-3.5 py-1 sm:py-1.5 backdrop-blur-sm">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300 shrink-0" />
                No CNIC collected
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {DRIVING_LICENCE_GUIDES.map((item) => {
              const active = item.slug === slug;
              return (
                <Link
                  key={item.slug}
                  to={`/driving-licence/${item.slug}`}
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
              Applications and payments happen only on official portals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {primaryActions.map((link, i) => (
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(240px,0.7fr)] gap-8 lg:gap-12 items-start">
            <div className="text-left">
              <p className="inline-flex max-w-full items-center rounded-full bg-primary-50 px-3 py-1 text-xs sm:text-sm font-semibold text-primary-600 mb-4">
                <span className="truncate">{guide.authorityName}</span>
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight">
                About {name} driving licences
              </h2>
              <p className="text-slate-600 leading-relaxed text-pretty text-base sm:text-[1.05rem]">
                {guide.introduction}
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                Last verified: {formatVerifiedDate(guide.lastVerifiedAt)}
              </p>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200">
                  {meta.icon ? (
                    <img
                      src={meta.icon}
                      alt=""
                      className="max-h-[65%] max-w-[65%] object-contain"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Official channel
                  </p>
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {PORTAL_LABELS[slug] || guide.authorityName}
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <Shield className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                  Guidance on Sello, applications on government portals
                </li>
                <li className="flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  No CNIC or licence number collected here
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPinned className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  Confirm fees and documents on the live official site
                </li>
              </ul>
              <a
                href={guide.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              >
                Open official portal
                <ExternalLink className="w-4 h-4" />
              </a>
            </aside>
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

      {visibleSections.length ? (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Process Guide
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Expand each section for step-by-step {name} licence guidance.
              </p>
            </div>
            <div className="space-y-3">
              {visibleSections.map((section, i) => {
                const value = guide[section.key];
                const open = openSection === i;
                return (
                  <FaqAccordionItem
                    key={section.key}
                    title={section.title}
                    open={open}
                    onToggle={() => setOpenSection(open ? null : i)}
                  >
                    {Array.isArray(value) ? (
                      <ol className="space-y-3">
                        {value.map((item, index) => (
                          <li
                            key={`${section.key}-${index}`}
                            className="flex gap-3"
                          >
                            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-bold text-primary-600">
                              {index + 1}
                            </span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="leading-relaxed">{value}</p>
                    )}
                  </FaqAccordionItem>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {guide.faqs?.length ? (
        <section className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-3">
              {guide.faqs.map((faq, i) => (
                <FaqAccordionItem
                  key={faq.question}
                  title={faq.question}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <p>{faq.answer}</p>
                </FaqAccordionItem>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
              Other Provinces
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Open another province guide, then continue to that region&apos;s
              official portal.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherGuides.map((item) => {
              const itemMeta = PROVINCE_META[item.slug] || {};
              return (
                <Link
                  key={item.slug}
                  to={`/driving-licence/${item.slug}`}
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
                  Sello.pk publishes guidance only. Licence applications,
                  payments and verification happen on official government
                  portals. Confirm fees and documents on the live site before
                  paying.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/driving-licence"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              All licence guides
            </Link>
            <Link
              to="/vehicle-verification"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              Vehicle verification
            </Link>
            <Link
              to="/listings"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              Browse vehicles
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
          Visit official portal
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <NewsLatter />
    </div>
  );
};

export default DrivingLicenceProvincePage;
