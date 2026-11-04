import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  ClipboardCheck,
  ExternalLink,
  FileText,
  GraduationCap,
  IdCard,
  Info,
  ListChecks,
  RefreshCw,
  Search,
  ShieldAlert,
  Timer,
} from "lucide-react";
import SEO from "../../common/SEO";
import { AdSenseSlot } from "../../ads";
import { DrivingLicenceProvinceSchema } from "../../common/StructuredData";
import {
  getGuideBySlug,
  PROVINCE_META,
  PROVINCE_ORDER,
  PORTAL_LABELS,
  formatVerifiedDate,
} from "./drivingLicenceContent";

const SECTION_CONFIG = [
  {
    key: "introduction",
    title: "Introduction",
    isText: true,
    icon: Info,
    tone: "bg-sky-50 text-sky-700",
  },
  {
    key: "learnerProcedure",
    title: "Learner licence application procedure",
    icon: GraduationCap,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "permanentProcedure",
    title: "Permanent driving licence procedure",
    icon: IdCard,
    tone: "bg-violet-50 text-violet-700",
  },
  {
    key: "renewalProcedure",
    title: "Licence renewal process",
    icon: RefreshCw,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    key: "verificationGuide",
    title: "Driving licence verification",
    icon: Search,
    tone: "bg-cyan-50 text-cyan-700",
  },
  {
    key: "requiredDocuments",
    title: "Required documents",
    icon: FileText,
    tone: "bg-rose-50 text-rose-700",
  },
  {
    key: "ageRequirements",
    title: "Minimum age requirements by vehicle category",
    icon: ListChecks,
    tone: "bg-indigo-50 text-indigo-700",
  },
  {
    key: "feesAndPayment",
    title: "Official fees and payment methods",
    icon: ClipboardCheck,
    tone: "bg-lime-50 text-lime-700",
  },
  {
    key: "drivingTestGuidelines",
    title: "Driving test guidelines",
    icon: Timer,
    tone: "bg-orange-50 text-orange-700",
  },
  {
    key: "trackingInstructions",
    title: "Application tracking instructions",
    icon: Search,
    tone: "bg-teal-50 text-teal-700",
  },
];

const ACTION_META = {
  learner: {
    icon: GraduationCap,
    className: "border-emerald-200 hover:border-emerald-500 hover:bg-emerald-50",
  },
  permanent: {
    icon: IdCard,
    className: "border-violet-200 hover:border-violet-500 hover:bg-violet-50",
  },
  verify: {
    icon: Search,
    className: "border-sky-200 hover:border-sky-500 hover:bg-sky-50",
  },
  renew: {
    icon: RefreshCw,
    className: "border-amber-200 hover:border-amber-500 hover:bg-amber-50",
  },
  track: {
    icon: Timer,
    className: "border-cyan-200 hover:border-cyan-500 hover:bg-cyan-50",
  },
  portal: {
    icon: ExternalLink,
    className: "border-slate-300 hover:border-primary-500 hover:bg-primary-50",
  },
};

const ACTION_ORDER = [
  "learner",
  "permanent",
  "verify",
  "renew",
  "track",
  "portal",
];

const EXTRA_TIPS = [
  "Confirm you are using the portal for the same province where the licence will be issued.",
  "Take screenshots or download receipts after every successful payment.",
  "Arrive early for tests or appointments with original CNIC and printed confirmation.",
  "If a page looks unofficial or asks for payment outside the government bill flow, leave immediately.",
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
  const [openFaq, setOpenFaq] = useState(0);

  const actionLinks = useMemo(
    () =>
      [...(guide?.actionLinks || [])].sort(
        (a, b) => ACTION_ORDER.indexOf(a.key) - ACTION_ORDER.indexOf(b.key),
      ),
    [guide],
  );

  const visibleSections = useMemo(() => {
    if (!guide) return [];
    return SECTION_CONFIG.filter((section) => {
      const value = guide[section.key];
      return value && !(Array.isArray(value) && value.length === 0);
    });
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
          className="inline-flex items-center gap-2 text-primary-500 font-semibold"
        >
          Back to Driving Licence <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const meta = PROVINCE_META[slug] || {};
  const name = provinceDisplayName(slug, guide.name);
  const canonical = `https://sello.pk/driving-licence/${slug}`;

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-slate-50 text-slate-800 pb-24 lg:pb-0">
      <SEO
        title={guide.seoTitle}
        description={guide.seoDescription}
        canonical={canonical}
        keywords={`${name} driving licence, DLIMS, apply renew verify driving licence Pakistan`}
      />
      <DrivingLicenceProvinceSchema guide={guide} />

      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(16,185,129,0.35), transparent 40%), radial-gradient(circle at 85% 30%, rgba(56,189,248,0.22), transparent 35%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <nav className="text-sm text-white/70 mb-5" aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="hover:text-white">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link to="/driving-licence" className="hover:text-white">
                  Driving Licence
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white">{name}</li>
            </ol>
          </nav>

          <div className="flex flex-col xl:flex-row xl:items-end gap-8 justify-between">
            <div className="max-w-3xl">
              <div className="flex items-start gap-4 mb-4">
                {meta.icon ? (
                  <div
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${meta.accent || "bg-white/10"} flex items-center justify-center ring-1 ring-white/10 shrink-0`}
                  >
                    <img
                      src={meta.icon}
                      alt=""
                      className="max-w-[70%] max-h-[70%] object-contain"
                    />
                  </div>
                ) : null}
                <div>
                  <p className="text-sm text-emerald-300 font-medium mb-1">
                    {guide.authorityName}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                    {name} Driving Licence Guide
                  </h1>
                </div>
              </div>
              <p className="text-white/80 leading-relaxed text-pretty mb-4">
                {guide.shortDescription}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-white/70">
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  Last verified: {formatVerifiedDate(guide.lastVerifiedAt)}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  {PORTAL_LABELS[slug]}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1.5">
                  No CNIC collected on Sello
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row xl:flex-col gap-3 shrink-0">
              <a
                href={guide.officialPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 text-slate-950 font-bold px-5 py-3 hover:opacity-90"
              >
                Visit Official Portal <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href="#official-actions"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 font-semibold px-5 py-3 hover:bg-slate-100"
              >
                View action buttons
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
          <div
            id="official-actions"
            className="scroll-mt-28 lg:sticky lg:top-24 space-y-4"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-500" />
                Official actions
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                These buttons leave Sello and open government services. Sello
                does not process licence applications or CNIC data.
              </p>
              <div className="space-y-2.5">
                {actionLinks.map((link) => {
                  const action = ACTION_META[link.key] || ACTION_META.portal;
                  const Icon = action.icon;
                  return (
                    <a
                      key={`${link.key}-${link.url}`}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-start gap-3 rounded-2xl border bg-white px-3.5 py-3 text-sm font-semibold text-slate-800 transition-colors ${action.className}`}
                    >
                      <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="flex-1">
                        {link.label}
                        {link.note ? (
                          <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                            {link.note}
                          </span>
                        ) : null}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-1 text-slate-400" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-semibold inline-flex items-center gap-2 mb-1">
                <ShieldAlert className="w-4 h-4" />
                Important
              </p>
              <p className="leading-relaxed">
                Do not use another province&apos;s portal for {name}. Fees, ages
                and documents must be confirmed on the official site linked
                above.
              </p>
            </div>

            <div className="hidden lg:block rounded-3xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-semibold mb-2">On this page</p>
              <ul className="space-y-1.5">
                {visibleSections.map((section) => (
                  <li key={section.key}>
                    <a
                      href={`#${section.key}`}
                      className="text-slate-600 hover:text-primary-600"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
                {guide.faqs?.length ? (
                  <li>
                    <a
                      href="#faqs"
                      className="text-slate-600 hover:text-primary-600"
                    >
                      Frequently asked questions
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm">
              <p className="font-semibold mb-2">Other provinces</p>
              <ul className="space-y-1.5">
                {PROVINCE_ORDER.filter((s) => s !== slug).map((s) => (
                  <li key={s}>
                    <Link
                      to={`/driving-licence/${s}`}
                      className="text-primary-600 hover:underline"
                    >
                      {provinceDisplayName(s)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              How to use this {name} guide
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed mb-3">
              Read the sections below to understand learner, permanent, renewal,
              documents and tracking for {name}. When you are ready to act, use
              the official action buttons — they open{" "}
              {PORTAL_LABELS[slug] || "the provincial government portal"} in a
              new tab. Sello keeps you informed; the government system completes
              the service.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXTRA_TIPS.map((tip) => (
                <li
                  key={tip}
                  className="flex gap-2 text-sm text-slate-700 leading-relaxed"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {visibleSections.map((section) => {
            const value = guide[section.key];
            const Icon = section.icon;
            return (
              <section
                key={section.key}
                id={section.key}
                className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${section.tone}`}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 pt-1.5">
                    {section.title}
                  </h2>
                </div>
                {section.isText ? (
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                    {value}
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {value.map((item, index) => (
                      <li
                        key={`${section.key}-${index}`}
                        className="flex gap-3 text-slate-700 leading-relaxed"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            );
          })}

          {guide.faqs?.length ? (
            <section
              id="faqs"
              className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Frequently asked questions
              </h2>
              <div className="space-y-3">
                {guide.faqs.map((faq, index) => {
                  const open = openFaq === index;
                  return (
                    <button
                      key={`faq-${index}`}
                      type="button"
                      onClick={() => setOpenFaq(open ? null : index)}
                      className={`w-full text-left rounded-2xl border px-4 py-3.5 transition-colors ${
                        open
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-semibold text-slate-900">
                          {faq.question}
                        </span>
                        <span className="text-slate-400 text-xl leading-none">
                          {open ? "−" : "+"}
                        </span>
                      </div>
                      {open ? (
                        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {guide.sourceUrls?.length ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-600" />
                Official source URLs
              </h2>
              <p className="text-sm text-slate-600 mb-3">
                Cross-check process details on these government pages. Sello
                summaries are informational only.
              </p>
              <ul className="space-y-2">
                {guide.sourceUrls.map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-primary-600 hover:underline break-all"
                    >
                      {url}
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              After your licence — useful on Sello
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Once you can drive legally, explore verified listings, check
              vehicle records, or estimate a car&apos;s market value.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                to="/driving-licence"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium hover:border-primary-500 hover:bg-primary-50"
              >
                All province guides
              </Link>
              <Link
                to="/vehicle-verification"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium hover:border-primary-500 hover:bg-primary-50"
              >
                Vehicle verification
              </Link>
              <Link
                to="/listings"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium hover:border-primary-500 hover:bg-primary-50"
              >
                Cars for sale
              </Link>
            </div>
          </section>

          <AdSenseSlot
            slot="vehicleVerificationBottom"
            format="auto"
            fullWidthResponsive
            minHeight={90}
          />
        </main>
      </div>

      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3">
        <a
          href={guide.officialPortalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 text-slate-950 font-bold px-4 py-3"
        >
          Open {PORTAL_LABELS[slug] || "official portal"}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default DrivingLicenceProvincePage;
