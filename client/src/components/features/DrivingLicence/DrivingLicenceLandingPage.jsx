import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Info,
  Lock,
  MapPinned,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SEO from "../../common/SEO";
import NewsLatter from "../../utils/NewsLatter";
import { AdSenseSlot } from "../../ads";
import { DrivingLicenceLandingSchema } from "../../common/StructuredData";
import listingHero from "../../../assets/images/driving_licence.jpg";
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
import cnicIcon from "../../../assets/images/verification/cnic.png";
import tokenIcon from "../../../assets/images/verification/token.png";
import registrationBookIcon from "../../../assets/images/verification/registerationBook.png";
import fitnessCertificateIcon from "../../../assets/images/verification/fitnessCertificate.png";
import {
  DRIVING_LICENCE_GUIDES,
  HOW_IT_WORKS,
  WHAT_YOU_CAN_DO,
  PREPARATION_CHECKLIST,
  LANDING_FAQS,
  PROVINCE_META,
  LAST_VERIFIED_AT,
  formatVerifiedDate,
} from "./drivingLicenceContent";
import { FaqAccordionItem } from "../../common/FaqAccordion";

const scrollToId = (id) => (event) => {
  event.preventDefault();
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const whyLicence = [
  {
    icon: ownershipIcon,
    title: "Learner & permanent",
    desc: "Understand how to apply for learner and permanent licences in your province.",
    circle: "bg-green-50",
  },
  {
    icon: registrationIcon,
    title: "Renewal guidance",
    desc: "See renewal steps before you open the official government payment flow.",
    circle: "bg-sky-50",
  },
  {
    icon: fraudIcon,
    title: "Verify safely",
    desc: "Use only official provincial portals — never share CNIC on unofficial forms.",
    circle: "bg-green-50",
  },
  {
    icon: buyerProtectionIcon,
    title: "Buyer & seller trust",
    desc: "Licence clarity helps keep Pakistan’s automotive marketplace safer for everyone.",
    circle: "bg-sky-50",
  },
];

const stepIcons = [
  { icon: enterDetailsIcon, circle: "bg-green-50" },
  { icon: recordIcon, circle: "bg-sky-50" },
  { icon: reportIcon, circle: "bg-violet-50" },
  { icon: confidenceIcon, circle: "bg-green-50" },
];

const documents = [
  {
    icon: cnicIcon,
    title: "Valid CNIC",
    desc: "Original CNIC and clear scans for online forms.",
  },
  {
    icon: registrationBookIcon,
    title: "Photographs",
    desc: "Recent photos matching portal size rules.",
  },
  {
    icon: fitnessCertificateIcon,
    title: "Medical certificate",
    desc: "Required when your province or age group asks for it.",
  },
  {
    icon: tokenIcon,
    title: "Payment access",
    desc: "Bank or wallet ready for official PSID / 1Bill fees.",
  },
];

const exploreLinks = [
  {
    to: "/listings",
    title: "Listings",
    image: serviceListingsImg,
    cta: "Browse cars",
  },
  {
    to: "/auctions",
    title: "Auctions",
    image: serviceAuctionsImg,
    cta: "View auctions",
  },
  {
    to: "/car-estimator",
    title: "Estimator",
    image: serviceEstimatorImg,
    cta: "Estimate price",
  },
  {
    to: "/vehicle-verification",
    title: "Verification",
    image: serviceGuidesImg,
    cta: "Verify vehicle",
  },
];

const DrivingLicenceLandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const guides = DRIVING_LICENCE_GUIDES;

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden bg-white">
      <SEO
        title="Driving Licence Information & Verification in Pakistan | Sello.pk"
        description="Official-province guides for Pakistan driving licences. Explore Punjab, Sindh, KPK, Islamabad and Balochistan processes, then continue to government portals to apply, renew or verify."
        canonical="https://sello.pk/driving-licence"
        keywords="driving licence Pakistan, DLIMS Punjab, DLS Sindh, Islamabad DLIMS, KPK driving licence, Balochistan driving licence, verify driving licence"
      />
      <DrivingLicenceLandingSchema />

      <section className="relative w-full overflow-hidden min-h-[62vh] sm:min-h-[68vh] bg-gray-200">
        <img
          src={listingHero}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-right"
          fetchpriority="high"
          decoding="async"
          width="1600"
          height="400"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-900/10 to-transparent sm:from-slate-950/25 sm:via-transparent" />
        <div className="relative z-10 flex min-h-[62vh] sm:min-h-[68vh] flex-col justify-start w-full min-w-0 max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 sm:pb-14">
          <div className="text-left w-full min-w-0 max-w-xl lg:max-w-2xl">
            <div className="inline-flex max-w-full items-center gap-2 bg-white text-primary-500 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-5 shadow-sm">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="truncate">Official DLIMS &amp; traffic police guides</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight text-balance">
              Driving Licence Information &amp; Verification in Pakistan
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-100 mb-5 sm:mb-8 text-pretty">
              Read province-specific guidelines on Sello first, then open the
              official government portal to apply, renew, track or verify. We
              never ask for your CNIC or licence number here.
            </p>
            <div className="flex flex-col min-[420px]:flex-row flex-wrap justify-start items-stretch min-[420px]:items-center gap-2.5 sm:gap-3 mb-5 sm:mb-8">
              <a
                href="#select-province"
                onClick={scrollToId("select-province")}
                className="inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary-500/25"
              >
                <MapPinned className="w-4 h-4 shrink-0" />
                Choose province
              </a>
              <a
                href="#how-it-works"
                onClick={scrollToId("how-it-works")}
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 hover:-translate-y-0.5 transition-all"
              >
                How it works
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

      <section id="select-province" className="scroll-mt-24 py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Select Your Province
            </h2>
            <p className="text-base text-slate-600 max-w-2xl mx-auto">
              Choose your province to open the Sello guide. Official apply,
              renew, verify and track buttons are on the next page.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {guides.map((guide) => {
              const meta = PROVINCE_META[guide.slug] || {};
              return (
                <Link
                  key={guide.slug}
                  to={`/driving-licence/${guide.slug}`}
                  className="group flex flex-col items-center text-center bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow hover:bg-green-200"
                >
                  <div className="w-24 h-24 mb-5 flex items-center justify-center">
                    {meta.icon ? (
                      <img
                        src={meta.icon}
                        alt=""
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : null}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1.5">
                    {guide.name}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-5 flex-1">
                    {guide.shortDescription}
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

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Why Driving Licence Guidance Matters
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyLicence.map((item) => (
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
                What You Can Do
              </h2>
              <div className="space-y-4">
                {WHAT_YOU_CAN_DO.map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-slate-800">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
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
            How Driving Licence Guides Work?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="relative text-center px-2">
                {i < HOW_IT_WORKS.length - 1 ? (
                  <ArrowRight
                    className="hidden lg:block absolute top-10 -right-3 w-6 h-6 text-slate-300"
                    aria-hidden
                  />
                ) : null}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${stepIcons[i].circle}`}
                >
                  <img
                    src={stepIcons[i].icon}
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
              Prepare Before You Apply
            </h2>
            <div className="grid lg:grid-cols-[1fr_1fr_minmax(220px,280px)] gap-8 items-start">
              <div className="space-y-3">
                {PREPARATION_CHECKLIST.slice(
                  0,
                  Math.ceil(PREPARATION_CHECKLIST.length / 2),
                ).map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 shrink-0" />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {PREPARATION_CHECKLIST.slice(
                  Math.ceil(PREPARATION_CHECKLIST.length / 2),
                ).map((item) => (
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
                  Confirm on portal
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Fees, ages and document lists can change. Always re-check the
                  live government portal before paying.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Documents You Should Prepare
          </h2>
          <p className="text-base text-slate-500 mb-8">
            Keep these ready before you open the official provincial licence
            portal.
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

      <div className="bg-white pt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdSenseSlot
            slot="vehicleVerificationBottom"
            format="auto"
            fullWidthResponsive
            minHeight={100}
          />
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {LANDING_FAQS.map((faq, i) => (
              <FaqAccordionItem
                key={faq.q}
                title={faq.q}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <p>{faq.a}</p>
              </FaqAccordionItem>
            ))}
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
                  Sello.pk publishes guidance only. Licence applications,
                  payments, tests and verification happen exclusively on
                  official government portals. Confirm current fees, ages and
                  documents on the live portal. Information last verified:{" "}
                  {formatVerifiedDate(LAST_VERIFIED_AT)}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsLatter />
    </div>
  );
};

export default DrivingLicenceLandingPage;
