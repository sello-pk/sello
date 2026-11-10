import punjabIcon from "../../../assets/images/verification/punjab.png";
import islamabadIcon from "../../../assets/images/verification/islamabad.png";
import sindhIcon from "../../../assets/images/verification/sindh.png";
import kpkIcon from "../../../assets/images/verification/kpk.png";
import balochistanIcon from "../../../assets/images/verification/blochistan.png";
import gilgitBaltistanIcon from "../../../assets/images/verification/gilgitBaltistan.png";
import azadKashmirIcon from "../../../assets/images/verification/azadKashmir.png";
import punjabHeroImg from "../../../assets/images/Access Punjab's Official Vehicle Verification Portal.jpeg";
import howToCheckPunjabImg from "../../../assets/images/How to Check Vehicle Registration Before Buying a Used Car.jpeg";
import islamabadHeroImg from "../../../assets/images/Access Islamabad's Official Vehicle Verification Portal.jpeg";
import howToCheckIslamabadImg from "../../../assets/images/How to Check Vehicle Ownership Before Buying a Used Car in Islamabad.jpeg";
import sindhHeroImg from "../../../assets/images/Access Sindh's Official Vehicle Verification Portal.jpeg";
import howToCheckSindhImg from "../../../assets/images/How to Check Vehicle Registration Before Buying a Used Car in Sindh.jpeg";

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
  heroTitle,
  heroDescription,
  heroImage,
  overviewTitle,
  overviewContent,
  overviewImage,
  faqTitle,
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
    heroTitle,
    heroDescription,
    heroImage,
    overviewTitle,
    overviewContent,
    overviewImage,
    faqTitle,
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
    heroTitle: "Access Punjab's Official Vehicle Verification Portal",
    heroDescription:
      "Looking to check vehicle registration details in Punjab, Pakistan? SELLO provides helpful guidance to understand the online vehicle verification process and access the official Punjab Government portal. Learn where to check vehicle records and what details may be available through the government system. Follow the steps below and continue directly to the official portal for verification.",
    heroImage: punjabHeroImg,
    overviewTitle:
      "How to Check Vehicle Registration Before Buying a Used Car",
    overviewContent:
      "Before purchasing a used car or motorcycle in Punjab, it is important to check its available registration records. Visit the official Punjab Excise, Taxation & Narcotics Control Department portal and follow the instructions to access vehicle information. Compare the details provided by the government portal with the vehicle and its original registration documents. Online verification is an important first step, but it should always be supported by a proper physical inspection before making your final purchase decision.",
    overviewImage: howToCheckPunjabImg,
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
    faqTitle: "Frequently Asked Questions About Punjab Vehicle Verification",
    faqs: [
      {
        question: "How can I check vehicle registration online in Punjab?",
        answer:
          "You can check vehicle registration through the official Punjab Excise MTMIS portal. Visit the website, enter the required vehicle information and follow the instructions to view available registration records.",
      },
      {
        question: "What is MTMIS Punjab?",
        answer:
          "MTMIS stands for Motor Transport Management Information System. It is used by Punjab's Excise, Taxation & Narcotics Control Department to maintain and provide access to vehicle registration records.",
      },
      {
        question: "Can I verify a car or motorcycle online in Punjab?",
        answer:
          "Yes. Punjab's online vehicle verification service covers registered motor vehicles, including cars and motorcycles. You can access the official portal to check available registration information.",
      },
      {
        question: "Is Punjab MTMIS vehicle verification free?",
        answer:
          "You can access the official online vehicle verification service through the Punjab Excise website. Check the official portal for any applicable charges associated with other services.",
      },
      {
        question: "What information can I find through Punjab vehicle verification?",
        answer:
          "Depending on the available government record, vehicle information may include registration number, make, model, engine number, chassis number, registration date, colour and ownership details.",
      },
      {
        question: "Can I check vehicle ownership before buying a used car?",
        answer:
          "Yes. You can use the official MTMIS portal to review available ownership and registration information. Compare the results with the seller's original documents before proceeding with the purchase.",
      },
      {
        question: "Can I check a vehicle's registration using its number plate?",
        answer:
          "The official Punjab MTMIS portal provides an online vehicle verification facility. Follow the current search form requirements, which may request additional information besides the registration number.",
      },
      {
        question:
          "Does MTMIS Punjab verification confirm that a vehicle is not stolen?",
        answer:
          "Not necessarily. MTMIS primarily provides vehicle registration information. For additional theft or criminal-record checks, contact the relevant Punjab Police or official vehicle verification service.",
      },
      {
        question:
          "What should I do if vehicle details do not match the official record?",
        answer:
          "Do not rush into purchasing the vehicle. Compare its registration documents, engine number and chassis number with the available official records. Contact the relevant Excise office if you find discrepancies.",
      },
      {
        question:
          "Can I verify a vehicle registered outside Punjab through MTMIS Punjab?",
        answer:
          "MTMIS Punjab is intended for vehicles registered in Punjab. For vehicles registered in Sindh, KPK, Balochistan or Islamabad, use the relevant official registration verification service.",
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
    heroTitle: "Access Islamabad's Official Vehicle Verification Portal",
    heroDescription:
      "Looking to check vehicle registration details in Islamabad, Pakistan? SELLO provides helpful guidance to understand the online vehicle verification process and access the official Islamabad government portal. Learn how to find available vehicle records and follow the steps to check registration information. Continue to the official government website for vehicle verification. SELLO does not collect your CNIC or vehicle registration number on this page.",
    heroImage: islamabadHeroImg,
    overviewTitle:
      "How to Check Vehicle Ownership Before Buying a Used Car in Islamabad",
    overviewContent:
      "Before buying a used car or motorcycle in Islamabad, it is important to review its available registration and ownership records. Visit the official Islamabad vehicle verification portal and follow the instructions to access the vehicle information. Compare the available details with the vehicle and its original registration documents. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    overviewImage: howToCheckIslamabadImg,
    shortDescription: "Verify Islamabad vehicle ownership records",
    authorityName: "Islamabad Excise & Taxation",
    officialPortalUrl: "https://islamabadexcise.gov.pk/",
    portalHomeUrl: "https://islamabadexcise.gov.pk/",
    actionNotes: {
      verify:
        "Official Islamabad Excise site — use Check Vehicle Detail / Vehicle Services",
      portal: "Islamabad Excise & Taxation department site",
    },
    introduction:
      "Before buying a used car or motorcycle in Islamabad, it is important to review its available registration and ownership records. Visit the official Islamabad vehicle verification portal and follow the instructions to access the vehicle information. Compare the available details with the vehicle and its original registration documents. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    howToVerify: [
      "Open the official Islamabad Excise website from the button on this page.",
      "Use Online Services / Check Vehicle Detail (Vehicle Services Portal may ask you to sign in with Gmail).",
      "Enter the registration details requested on the government form.",
      "Match results with the registration book / smart card and the vehicle before finalizing a deal.",
    ],
    faqTitle:
      "Frequently Asked Questions About Islamabad Vehicle Verification",
    faqs: [
      {
        question:
          "How can I check vehicle registration online in Islamabad?",
        answer:
          "You can check vehicle registration details through the official Islamabad Excise Department website or its designated online vehicle verification service. Follow the portal instructions to access available vehicle records.",
      },
      {
        question: "What is Islamabad Vehicle Verification?",
        answer:
          "Islamabad Vehicle Verification is an online service that allows users to check available registration and ownership information for vehicles registered in Islamabad.",
      },
      {
        question:
          "Can I check car and motorcycle registration online in Islamabad?",
        answer:
          "Yes. You can use the official Islamabad vehicle verification service to check available registration information for cars and motorcycles registered in Islamabad.",
      },
      {
        question: "Is Islamabad vehicle verification free?",
        answer:
          "Check the official Islamabad Excise portal for the latest service details and any applicable fees. Charges may vary depending on the service you use.",
      },
      {
        question:
          "What information can I find through Islamabad vehicle verification?",
        answer:
          "Depending on the available government records, information may include vehicle registration number, make, model, colour, engine number, chassis number, registration date and ownership details.",
      },
      {
        question:
          "Can I check vehicle ownership before buying a used car in Islamabad?",
        answer:
          "Yes. You can review available ownership and registration details through the official government portal. Always compare the information with the original vehicle documents before purchasing.",
      },
      {
        question:
          "Can I verify an Islamabad vehicle using its registration number?",
        answer:
          "The official verification service allows users to search vehicle records according to its current portal requirements. You may need to provide the registration number or other requested information.",
      },
      {
        question:
          "Does Islamabad vehicle verification confirm whether a vehicle is stolen?",
        answer:
          "Registration verification alone does not necessarily confirm that a vehicle has no theft or criminal record. For additional checks, contact the relevant Islamabad Police or government authority.",
      },
      {
        question:
          "What should I do if vehicle details do not match the official records?",
        answer:
          "Avoid proceeding with the purchase until the discrepancy is clarified. Compare the vehicle's engine and chassis numbers with its original documents and available government records. Contact Islamabad Excise for assistance.",
      },
      {
        question:
          "Can I verify vehicles registered in other provinces through Islamabad's vehicle verification portal?",
        answer:
          "Islamabad's vehicle verification service is intended for vehicles registered in Islamabad. For vehicles registered in Punjab, Sindh, KPK or Balochistan, use the relevant provincial government's official verification service.",
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
    heroTitle: "Access Sindh's Official Vehicle Verification Portal",
    heroDescription:
      "Looking to check vehicle registration details in Sindh, Pakistan? SELLO provides helpful guidance to understand the online vehicle verification process and access the official Sindh Excise portal. Learn how to check available registration records for cars and motorcycles by selecting the vehicle category and entering its registration number on the government website. Follow the steps below to view the available vehicle information. SELLO does not collect your CNIC or vehicle registration number on this page",
    heroImage: sindhHeroImg,
    overviewTitle:
      "How to Check Vehicle Registration Before Buying a Used Car in Sindh",
    overviewContent:
      "Before purchasing a used car or motorcycle in Sindh, it is important to check its available registration and ownership records. Visit the official Sindh Excise vehicle verification portal, select the vehicle category and enter its registration number as shown on the number plate. Compare the information displayed with the vehicle and its original registration documents. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    overviewImage: howToCheckSindhImg,
    shortDescription: "Check Sindh vehicle registration details",
    authorityName: "Sindh Excise, Taxation & Narcotics Control",
    officialPortalUrl: "https://excise.gos.pk/vehicle/vehicle_search",
    portalHomeUrl: "https://excise.gos.pk/",
    actionNotes: {
      verify: "Official Sindh Excise online vehicle search",
      portal: "Sindh Excise department website",
    },
    introduction:
      "Before purchasing a used car or motorcycle in Sindh, it is important to check its available registration and ownership records. Visit the official Sindh Excise vehicle verification portal, select the vehicle category and enter its registration number as shown on the number plate. Compare the information displayed with the vehicle and its original registration documents. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    howToVerify: [
      "Open the official Sindh Excise vehicle search page from this guide.",
      "Choose Four Wheelers or Two Wheelers, then enter the registration number exactly as on the plate.",
      "Review registration details returned by the portal.",
      "Cross-check engine and chassis numbers on the vehicle against the book and portal result.",
    ],
    faqTitle: "Frequently Asked Questions About Sindh Vehicle Verification",
    faqs: [
      {
        question:
          "How can I check vehicle registration online in Sindh?",
        answer:
          "You can check vehicle registration through the official Sindh Excise website. Select the vehicle category, enter the registration number exactly as shown on the number plate, complete the security check and view the available record.",
      },
      {
        question: "What is Sindh Vehicle Verification?",
        answer:
          "Sindh Vehicle Verification is an online service provided by the Excise, Taxation & Narcotics Control Department, Government of Sindh. It allows users to access available motor vehicle registration records.",
      },
      {
        question:
          "Can I check car and motorcycle registration online in Sindh?",
        answer:
          "Yes. The official portal provides separate options for Four Wheelers and Two Wheelers. Select the correct category before entering the vehicle registration number.",
      },
      {
        question: "Is Sindh online vehicle verification free?",
        answer:
          "The official portal provides an online vehicle record search facility. Check the government website for any charges associated with other services, such as registration, transfer or tax payments.",
      },
      {
        question:
          "What information can I find through Sindh vehicle verification?",
        answer:
          "Depending on the available government record, vehicle information may include registration number, make, model, engine number, chassis number and other registration details.",
      },
      {
        question:
          "Can I check vehicle ownership before buying a used car in Sindh?",
        answer:
          "Yes. You can review the available registration record through the official Sindh Excise portal. Compare the details with the original vehicle documents and check that the engine and chassis numbers match the physical vehicle before purchasing.",
      },
      {
        question:
          "Can I verify a Sindh vehicle using its number plate?",
        answer:
          "Yes. Select Four Wheelers or Two Wheelers on the official portal and enter the registration number exactly as printed on the number plate. Complete the security check to view the available record.",
      },
      {
        question:
          "Can I check vehicles registered against my CNIC in Sindh?",
        answer:
          "Yes. The Sindh Excise Department provides a separate Vehicle Verification by CNIC service. Use the official government portal and follow its instructions to check available vehicle records associated with your CNIC.",
      },
      {
        question:
          "What should I do if a vehicle's details do not match the official record?",
        answer:
          "Do not proceed with the purchase until the discrepancy is resolved. Compare the registration documents, engine number and chassis number with the available official records. Contact the Sindh Excise Department for further assistance.",
      },
      {
        question:
          "Can I verify vehicles registered in other provinces through Sindh's vehicle verification portal?",
        answer:
          "Sindh's vehicle verification service is intended for vehicles registered in Sindh. For vehicles registered in Punjab, Islamabad, Khyber Pakhtunkhwa or Balochistan, use the relevant government's official vehicle verification portal.",
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
