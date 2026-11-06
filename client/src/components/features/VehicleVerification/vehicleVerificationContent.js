import punjabIcon from "../../../assets/images/verification/punjab.png";
import islamabadIcon from "../../../assets/images/verification/islamabad.png";
import sindhIcon from "../../../assets/images/verification/sindh.png";
import kpkIcon from "../../../assets/images/verification/kpk.png";
import balochistanIcon from "../../../assets/images/verification/blochistan.png";
import gilgitBaltistanIcon from "../../../assets/images/verification/gilgitBaltistan.png";
import azadKashmirIcon from "../../../assets/images/verification/azadKashmir.png";

/** Hardcoded Vehicle Verification province guides — official portal URLs unchanged. */

export const LAST_VERIFIED_AT = "2026-11-04";

export const formatVerifiedDate = (value) => {
  if (!value) return "Not recorded";
  try {
    return new Date(value).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Not recorded";
  }
};

export const PROVINCE_META = {
  punjab: {
    icon: punjabIcon,
    accent: "bg-emerald-50",
    portalLabel: "Punjab Excise MTMIS",
  },
  islamabad: {
    icon: islamabadIcon,
    accent: "bg-violet-50",
    portalLabel: "Islamabad Excise",
  },
  sindh: {
    icon: sindhIcon,
    accent: "bg-sky-50",
    portalLabel: "Sindh Excise Vehicle Search",
  },
  kpk: {
    icon: kpkIcon,
    accent: "bg-amber-50",
    portalLabel: "KPK Excise MV Records",
  },
  balochistan: {
    icon: balochistanIcon,
    accent: "bg-rose-50",
    portalLabel: "ETANB / Balochistan Excise Verification",
  },
  "gilgit-baltistan": {
    icon: gilgitBaltistanIcon,
    accent: "bg-teal-50",
    portalLabel: "GB Excise Vehicle Search",
  },
  "azad-kashmir": {
    icon: azadKashmirIcon,
    accent: "bg-indigo-50",
    portalLabel: "AJK IRD Token Tax Verification",
  },
};

export const PROVINCE_ORDER = [
  "punjab",
  "islamabad",
  "sindh",
  "kpk",
  "balochistan",
  "gilgit-baltistan",
  "azad-kashmir",
];

export const PORTAL_LABELS = Object.fromEntries(
  Object.entries(PROVINCE_META).map(([slug, meta]) => [slug, meta.portalLabel]),
);

const sharedWhatYouCanCheck = [
  "Registration number and registration city or district",
  "Make, model and body type where published",
  "Engine and chassis details where published",
  "Registration date and available ownership information",
  "Token tax / fee status where the portal shows it",
];

const sharedBeforeYouBuy = [
  "Use only the official portal linked on this page — never enter CNIC or registration numbers on unofficial forms.",
  "Compare portal results with the registration book, chassis plate and engine number on the vehicle.",
  "Ask the seller for original documents and match CNIC details carefully before paying.",
  "If anything looks inconsistent, stop and verify at the relevant Excise office.",
];

const buildGuide = ({
  slug,
  name,
  shortDescription,
  authorityName,
  officialPortalUrl,
  portalHomeUrl,
  introduction,
  howToVerify,
  whatYouCanCheck = sharedWhatYouCanCheck,
  tips = sharedBeforeYouBuy,
  faqs,
  seoTitle,
  seoDescription,
  actionNotes = {},
}) => {
  const homeUrl = portalHomeUrl || officialPortalUrl;
  return {
    slug,
    name,
    shortDescription,
    authorityName,
    officialPortalUrl,
    portalHomeUrl: homeUrl,
    introduction,
    howToVerify,
    whatYouCanCheck,
    tips,
    actionLinks: [
      {
        key: "verify",
        label: "Verify Vehicle Online",
        url: officialPortalUrl,
        note:
          actionNotes.verify ||
          "Leaves Sello and opens the official verification form",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: homeUrl,
        note:
          actionNotes.portal ||
          "Official department website / services hub",
      },
    ],
    sourceUrls: [...new Set([officialPortalUrl, homeUrl])],
    faqs,
    seoTitle,
    seoDescription,
    lastVerifiedAt: LAST_VERIFIED_AT,
    isPublished: true,
  };
};

export const VEHICLE_VERIFICATION_GUIDES = [
  buildGuide({
    slug: "punjab",
    name: "Punjab",
    shortDescription: "Verify Punjab vehicle registration records",
    authorityName: "Punjab Excise & Taxation — MTMIS",
    officialPortalUrl: "https://mtmis.excise.punjab.gov.pk/",
    portalHomeUrl: "https://excise.punjab.gov.pk/",
    actionNotes: {
      verify: "Official Punjab MTMIS vehicle verification",
      portal: "Punjab Excise & Taxation department site",
    },
    introduction:
      "Punjab vehicle verification is handled through the Motor Transport Management Information System (MTMIS) run by Punjab Excise & Taxation. Use this guide first, then continue on the official portal to check registration details before you buy or sell.",
    howToVerify: [
      "Open the official Punjab MTMIS portal from the action button on this page.",
      "Enter the vehicle registration number exactly as shown on the registration book or plate.",
      "Enter the registration date from the registration book / smart card when the form asks for it, then complete the captcha.",
      "Compare the online result with the physical vehicle and documents before you pay.",
    ],
    faqs: [
      {
        question: "Is Punjab MTMIS free to use?",
        answer:
          "Public verification tools provided by Punjab Excise are generally free to query. Always confirm fee notices on the live portal and never pay third-party “agents” for the same check.",
      },
      {
        question: "What if the Punjab record does not match the car?",
        answer:
          "Do not proceed with payment. Recheck the registration number, inspect chassis and engine stamps, and contact the relevant Excise office or the seller for clarification.",
      },
    ],
    seoTitle:
      "Punjab Vehicle Verification Online | MTMIS Excise Check – Sello.pk",
    seoDescription:
      "Verify Punjab vehicle registration and ownership records via official MTMIS. Read the Sello guide, then open Punjab Excise for the live check.",
  }),
  buildGuide({
    slug: "islamabad",
    name: "Islamabad",
    shortDescription: "Verify Islamabad vehicle ownership records",
    authorityName: "Islamabad Excise & Taxation",
    officialPortalUrl: "https://islamabadexcise.gov.pk/",
    portalHomeUrl: "https://islamabadexcise.gov.pk/",
    actionNotes: {
      verify: "Official Islamabad Excise site — use Check Vehicle Detail / Vehicle Services",
      portal: "Islamabad Excise & Taxation department site",
    },
    introduction:
      "Islamabad Capital Territory vehicle records are managed by Islamabad Excise & Taxation. This page explains what to prepare, then links you to the official Islamabad Excise site for verification.",
    howToVerify: [
      "Open the official Islamabad Excise website from the button on this page.",
      "Use Online Services / Check Vehicle Detail (Vehicle Services Portal may ask you to sign in with Gmail).",
      "Enter the registration details requested on the government form.",
      "Match results with the registration book / smart card and the vehicle before finalizing a deal.",
    ],
    faqs: [
      {
        question: "Can I verify ICT-registered cars from outside Islamabad?",
        answer:
          "Yes. Use the official Islamabad Excise online services. Online checks support due diligence but do not replace in-person document and vehicle inspection.",
      },
      {
        question: "Does Sello store my Islamabad registration search?",
        answer:
          "No. Sello does not collect registration numbers on these guide pages. Searches happen only on the official government portal.",
      },
    ],
    seoTitle:
      "Islamabad Vehicle Verification Online | Excise Check – Sello.pk",
    seoDescription:
      "Check Islamabad (ICT) vehicle ownership and registration through official Excise services. Guide on Sello, verification on the government portal.",
  }),
  buildGuide({
    slug: "sindh",
    name: "Sindh",
    shortDescription: "Check Sindh vehicle registration details",
    authorityName: "Sindh Excise, Taxation & Narcotics Control",
    officialPortalUrl: "https://excise.gos.pk/vehicle/vehicle_search",
    portalHomeUrl: "https://excise.gos.pk/",
    actionNotes: {
      verify: "Official Sindh Excise online vehicle search",
      portal: "Sindh Excise department website",
    },
    introduction:
      "Sindh vehicle registration checks are available through the Sindh Excise vehicle search service. Read this guide, then open the official Sindh portal to verify a car or bike registered in Sindh.",
    howToVerify: [
      "Open the official Sindh Excise vehicle search page from this guide.",
      "Choose Four Wheelers or Two Wheelers, then enter the registration number exactly as on the plate.",
      "Review registration details returned by the portal.",
      "Cross-check engine and chassis numbers on the vehicle against the book and portal result.",
    ],
    faqs: [
      {
        question: "Does Sindh verification cover Karachi bikes and cars?",
        answer:
          "Sindh Excise services cover vehicles registered under Sindh. Always use the official vehicle search page linked here for current availability.",
      },
      {
        question: "Why is my Sindh record missing?",
        answer:
          "Records can be incomplete or delayed. Confirm the number, try again later, or visit the Excise office associated with the registration.",
      },
    ],
    seoTitle: "Sindh Vehicle Verification Online | Excise Search – Sello.pk",
    seoDescription:
      "Verify Sindh vehicle registration details on the official Excise vehicle search. Follow the Sello guide, then continue to the government portal.",
  }),
  buildGuide({
    slug: "kpk",
    name: "Khyber Pakhtunkhwa",
    shortDescription: "Access KPK vehicle verification services",
    authorityName: "Khyber Pakhtunkhwa Excise & Taxation",
    officialPortalUrl: "https://www.kpexcise.gov.pk/mvrecords/",
    portalHomeUrl: "https://www.kpexcise.gov.pk/new/",
    actionNotes: {
      verify: "KP Excise MV records / Vehicle Verification service",
      portal: "KP Excise department website (e-Services)",
    },
    introduction:
      "Khyber Pakhtunkhwa publishes motor vehicle records through KP Excise online services. Use this page to understand the check, then open the official MV records portal.",
    howToVerify: [
      "Open the official KP Excise MV records / Vehicle Verification link from the action button.",
      "If the form asks for a district, select the registration district, then enter the registration number.",
      "If the old MV records page redirects, use e-Services → Vehicle Verification on the KP Excise site.",
      "Compare portal data with documents and physical identification numbers on the vehicle.",
    ],
    faqs: [
      {
        question: "Is KP Excise MV records the correct site for KPK cars?",
        answer:
          "Yes for KPK-registered vehicles. Do not use another province’s portal for a KPK registration number.",
      },
      {
        question: "Can online verification replace a physical inspection?",
        answer:
          "No. Online checks support buying decisions. Always inspect the vehicle and original paperwork in person.",
      },
    ],
    seoTitle: "KPK Vehicle Verification Online | Excise MV Records – Sello.pk",
    seoDescription:
      "Verify Khyber Pakhtunkhwa vehicle registration via official KP Excise MV records. Read the guide on Sello, then open the government portal.",
  }),
  buildGuide({
    slug: "balochistan",
    name: "Balochistan",
    shortDescription: "Open Balochistan Excise vehicle records",
    authorityName: "Balochistan Excise & Taxation",
    officialPortalUrl: "https://www.etanb.com/vehicle-verification/",
    portalHomeUrl: "https://excise.balochistan.gov.pk/",
    actionNotes: {
      verify: "Official ETANB / Balochistan Excise vehicle verification form",
      portal: "Balochistan Excise department website",
    },
    introduction:
      "Balochistan Excise provides online vehicle verification for vehicles registered in the province. This Sello guide explains the safe process and links to the official verification page.",
    howToVerify: [
      "Open the official Balochistan / ETANB vehicle verification form from this page.",
      "Enter the registration number exactly as on the plate; select the registration district if asked.",
      "Review published registration information.",
      "Confirm numbers on the vehicle and documents match before purchase.",
    ],
    faqs: [
      {
        question: "Where should I verify a Balochistan-registered car?",
        answer:
          "Use the official ETANB vehicle verification form linked from this guide (also reached via Balochistan Excise online services).",
      },
      {
        question: "Will Sello ask for my CNIC to verify?",
        answer:
          "No. Enter personal or vehicle details only on the official government portal.",
      },
    ],
    seoTitle:
      "Balochistan Vehicle Verification Online | Excise Check – Sello.pk",
    seoDescription:
      "Check Balochistan vehicle registration through official Excise online verification. Guide on Sello, live check on the government portal.",
  }),
  buildGuide({
    slug: "gilgit-baltistan",
    name: "Gilgit-Baltistan",
    shortDescription: "Check Gilgit-Baltistan vehicle registration details",
    authorityName: "Gilgit-Baltistan Excise",
    officialPortalUrl: "https://gbexcise.gov.pk/vehsearch/vehicle-search.php",
    portalHomeUrl: "https://gbexcise.gov.pk/",
    actionNotes: {
      verify: "Official GB Excise vehicle search form",
      portal: "Gilgit-Baltistan Excise department website",
    },
    introduction:
      "Gilgit-Baltistan vehicle search is available through GB Excise. Follow this guide, then continue to the official GB vehicle search page to verify registration details.",
    howToVerify: [
      "Open the official GB Excise vehicle search from the action button.",
      "Select the registration district and enter the registration number and date from the book.",
      "Review available results from the government database.",
      "Match the result with chassis, engine and paperwork before paying.",
    ],
    faqs: [
      {
        question: "Does GB verification work for all Gilgit-Baltistan plates?",
        answer:
          "Coverage depends on what GB Excise has published online. If a record is missing, contact the relevant Excise office.",
      },
      {
        question: "Are third-party GB verification apps safe?",
        answer:
          "Prefer the official GB Excise URL linked here. Avoid apps or forms that ask for CNIC or payment outside government channels.",
      },
    ],
    seoTitle:
      "Gilgit-Baltistan Vehicle Verification | GB Excise Search – Sello.pk",
    seoDescription:
      "Verify Gilgit-Baltistan vehicle registration via official GB Excise vehicle search. Read the Sello guide, then open the government portal.",
  }),
  buildGuide({
    slug: "azad-kashmir",
    name: "Azad Kashmir",
    shortDescription: "Access Azad Kashmir vehicle verification services",
    authorityName: "Azad Jammu & Kashmir IRD",
    officialPortalUrl: "https://ird.ajk.gov.pk/tokentax/verification.php",
    portalHomeUrl: "https://ird.ajk.gov.pk/",
    actionNotes: {
      verify: "Official AJK IRD online MV / token tax verification",
      portal: "AJK Inland Revenue Department website",
    },
    introduction:
      "Azad Kashmir vehicle-related checks are provided through AJK IRD services, including token tax verification. Use this guide for context, then open the official AJK portal.",
    howToVerify: [
      "Open the official AJK IRD online MV verification page from this guide.",
      "Enter CNIC or MV registration number as requested on the government form.",
      "Review the verification response carefully.",
      "Confirm documents and vehicle identification numbers in person before purchase.",
    ],
    faqs: [
      {
        question: "Is AJK token tax verification the same as full ownership history?",
        answer:
          "Published fields vary. Treat the portal result as one check among documents, physical inspection and seller due diligence.",
      },
      {
        question: "Which portal should I use for Azad Kashmir vehicles?",
        answer:
          "Use the official AJK IRD verification URL linked on this page — not another province’s Excise site.",
      },
    ],
    seoTitle:
      "Azad Kashmir Vehicle Verification Online | AJK IRD – Sello.pk",
    seoDescription:
      "Verify Azad Kashmir vehicle token tax / registration-related details via official AJK IRD. Guide on Sello, verification on the government portal.",
  }),
];

export const getGuideBySlug = (slug) =>
  VEHICLE_VERIFICATION_GUIDES.find((g) => g.slug === slug) || null;

export const LANDING_PROVINCES = [
  ...VEHICLE_VERIFICATION_GUIDES.map((guide) => ({
    slug: guide.slug,
    name: guide.name,
    desc: guide.shortDescription,
    icon: PROVINCE_META[guide.slug]?.icon,
    to: `/vehicle-verification/${guide.slug}`,
    external: false,
  })),
  {
    slug: "listings",
    name: "Browse Vehicles",
    desc: "Explore a wide range of vehicles for sale",
    icon: null,
    to: "/listings",
    external: false,
  },
];
