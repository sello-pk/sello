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
import kpkHeroImg from "../../../assets/images/Access Khyber Pakhtunkhwa's Official Vehicle Verification Portal.jpeg";
import howToCheckKpkImg from "../../../assets/images/How to Check Vehicle Registration Before Buying a Used Car in Khyber Pakhtunkhwa.jpeg";
import balochistanHeroImg from "../../../assets/images/Access Balochistan's Official Vehicle Verification Portal.jpeg";
import howToCheckBalochistanImg from "../../../assets/images/How to Check Vehicle Registration Before Buying a Used Car in Balochistan.jpeg";
import gbHeroImg from "../../../assets/images/Access Gilgit-Baltistan's Official Vehicle Verification Portal.jpeg";
import howToCheckGbImg from "../../../assets/images/How to Check Vehicle Registration Before Buying a Used Car in Gilgit-Baltistan.jpeg";
import ajkHeroImg from "../../../assets/images/Access Azad Kashmir's Official Vehicle Verification Portal.jpeg";
import howToCheckAjkImg from "../../../assets/images/How to Check Vehicle Registration Before Buying a Used Car in Azad Kashmir.jpeg";

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
    heroTitle:
      "Access Khyber Pakhtunkhwa's Official Vehicle Verification Portal",
    heroDescription:
      "Looking to check vehicle registration details in Khyber Pakhtunkhwa, Pakistan? SELLO provides helpful guidance to understand the online vehicle verification process and access the official KP Excise Department website. Learn how to find available vehicle registration records for cars, motorcycles and other registered vehicles. Follow the steps below to continue to the official government portal and check the available information. SELLO does not collect your CNIC or vehicle registration number on this page.",
    heroImage: kpkHeroImg,
    overviewTitle:
      "How to Check Vehicle Registration Before Buying a Used Car in Khyber Pakhtunkhwa",
    overviewContent:
      "Before purchasing a used car or motorcycle in Khyber Pakhtunkhwa, it is important to check its available registration and ownership records. Visit the official KP Excise Department website and use its Online Vehicle Information service to check the available vehicle details. Compare the information with the vehicle and its original registration documents, including the engine and chassis numbers. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    overviewImage: howToCheckKpkImg,
    shortDescription: "Access KPK vehicle verification services",
    authorityName: "Khyber Pakhtunkhwa Excise & Taxation",
    officialPortalUrl: "https://www.kpexcise.gov.pk/mvrecords/",
    portalHomeUrl: "https://www.kpexcise.gov.pk/new/",
    actionNotes: {
      verify: "KP Excise MV records / Vehicle Verification service",
      portal: "KP Excise department website (e-Services)",
    },
    introduction:
      "Before purchasing a used car or motorcycle in Khyber Pakhtunkhwa, it is important to check its available registration and ownership records. Visit the official KP Excise Department website and use its Online Vehicle Information service to check the available vehicle details. Compare the information with the vehicle and its original registration documents, including the engine and chassis numbers. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    howToVerify: [
      "Open the official KP Excise MV records / Vehicle Verification link from the action button.",
      "If the form asks for a district, select the registration district, then enter the registration number.",
      "If the old MV records page redirects, use e-Services → Vehicle Verification on the KP Excise site.",
      "Compare portal data with documents and physical identification numbers on the vehicle.",
    ],
    faqTitle:
      "Frequently Asked Questions About Khyber Pakhtunkhwa Vehicle Verification",
    faqs: [
      {
        question:
          "How can I check vehicle registration online in Khyber Pakhtunkhwa?",
        answer:
          "You can check available vehicle registration information through the official Khyber Pakhtunkhwa Excise, Taxation & Narcotics Control Department website. Visit the Online Vehicle Info service and follow the instructions to search for vehicle records.",
      },
      {
        question: "What is KP Vehicle Verification?",
        answer:
          "KP Vehicle Verification is an online facility that helps users access available registration information for vehicles registered in Khyber Pakhtunkhwa, Pakistan.",
      },
      {
        question:
          "Can I check car and motorcycle registration online in KP?",
        answer:
          "Yes. The official KP Excise Department provides an Online Vehicle Info service for accessing vehicle information. Check the portal for the available vehicle categories and search options.",
      },
      {
        question: "Is Khyber Pakhtunkhwa vehicle verification free?",
        answer:
          "You can access the official government website to check the available online vehicle information service. Any applicable charges for other services, such as registration or transfer, should be confirmed through the official department.",
      },
      {
        question:
          "What information can I find through KP vehicle verification?",
        answer:
          "Depending on the available government records, information may include the vehicle registration number, make, model, engine number, chassis number and other registration details.",
      },
      {
        question:
          "Can I check vehicle ownership before buying a used car in KP?",
        answer:
          "Yes. You can review the available vehicle registration information through the official KP Excise portal. Compare the details with the original registration documents and physically check the engine and chassis numbers before purchasing.",
      },
      {
        question:
          "Can I verify a Khyber Pakhtunkhwa vehicle using its registration number?",
        answer:
          "The official Online Vehicle Info service provides access to vehicle records. Follow the current portal instructions and enter the required registration information in the requested format.",
      },
      {
        question:
          "Can I check token tax information for a vehicle registered in KP?",
        answer:
          "The KP Excise Department provides motor vehicle tax information and related services. Visit its official website to check the available tax details and applicable payment procedures.",
      },
      {
        question:
          "What should I do if vehicle details do not match the official records?",
        answer:
          "Do not proceed with the purchase until the discrepancy is clarified. Compare the vehicle’s registration documents, engine number and chassis number with the available government records. Contact the KP Excise Department for assistance.",
      },
      {
        question:
          "Can I verify vehicles registered in other provinces through the KP vehicle verification portal?",
        answer:
          "The KP Excise vehicle information service is intended for vehicles registered in Khyber Pakhtunkhwa. For vehicles registered in Punjab, Sindh, Islamabad or Balochistan, use the relevant government’s official verification portal.",
      },
    ],
    seoTitle: "KPK Vehicle Verification Online | Excise MV Records – Sello.pk",
    seoDescription:
      "Verify Khyber Pakhtunkhwa vehicle registration via official KP Excise MV records. Read the guide on Sello, then open the government portal.",
  }),
  buildGuide({
    slug: "balochistan",
    name: "Balochistan",
    heroTitle: "Access Balochistan's Official Vehicle Verification Portal",
    heroDescription:
      "Looking to check vehicle registration details in Balochistan, Pakistan? SELLO provides helpful guidance to understand the online vehicle verification process and access the official Balochistan Excise Department website. Learn how to check available registration information for cars, motorcycles and other registered vehicles. Follow the steps below to continue to the official government portal. SELLO does not collect your CNIC or vehicle registration number on this page.",
    heroImage: balochistanHeroImg,
    overviewTitle:
      "How to Check Vehicle Registration Before Buying a Used Car in Balochistan",
    overviewContent:
      "Before purchasing a used car or motorcycle in Balochistan, it is important to check its available registration and ownership records. Visit the official Balochistan Excise Department website and select its Online Vehicle Verification service. Follow the portal instructions and provide the required vehicle information to access available records. Compare the information with the vehicle and its original registration documents. Always arrange a proper physical inspection before making your final purchase decision.",
    overviewImage: howToCheckBalochistanImg,
    shortDescription: "Open Balochistan Excise vehicle records",
    authorityName: "Balochistan Excise & Taxation",
    officialPortalUrl: "https://www.etanb.com/vehicle-verification/",
    portalHomeUrl: "https://excise.balochistan.gov.pk/",
    actionNotes: {
      verify: "Official ETANB / Balochistan Excise vehicle verification form",
      portal: "Balochistan Excise department website",
    },
    introduction:
      "Before purchasing a used car or motorcycle in Balochistan, it is important to check its available registration and ownership records. Visit the official Balochistan Excise Department website and select its Online Vehicle Verification service. Follow the portal instructions and provide the required vehicle information to access available records. Compare the information with the vehicle and its original registration documents. Always arrange a proper physical inspection before making your final purchase decision.",
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
    heroTitle: "Access Gilgit-Baltistan's Official Vehicle Verification Portal",
    heroDescription:
      "Looking to check vehicle registration details in Gilgit-Baltistan, Pakistan? SELLO provides helpful guidance to understand the online vehicle verification process and access the official Gilgit-Baltistan Excise Department portal. Learn how to search available vehicle records using the registration district, vehicle number and registration date. Follow the steps below to access the government verification service and check the available information. SELLO does not collect your CNIC or vehicle registration number on this page.",
    heroImage: gbHeroImg,
    overviewTitle:
      "How to Check Vehicle Registration Before Buying a Used Car in Gilgit-Baltistan",
    overviewContent:
      "Before purchasing a used car or motorcycle in Gilgit-Baltistan, it is important to check its available registration records. Visit the official GB Excise vehicle verification portal, select the vehicle’s registration district and enter its registration number and original registration date as requested. Compare the available government record with the vehicle and its original registration documents, including the engine and chassis numbers. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    overviewImage: howToCheckGbImg,
    shortDescription: "Check Gilgit-Baltistan vehicle registration details",
    authorityName: "Gilgit-Baltistan Excise",
    officialPortalUrl: "https://gbexcise.gov.pk/vehsearch/vehicle-search.php",
    portalHomeUrl: "https://gbexcise.gov.pk/",
    actionNotes: {
      verify: "Official GB Excise vehicle search form",
      portal: "Gilgit-Baltistan Excise department website",
    },
    introduction:
      "Before purchasing a used car or motorcycle in Gilgit-Baltistan, it is important to check its available registration records. Visit the official GB Excise vehicle verification portal, select the vehicle’s registration district and enter its registration number and original registration date as requested. Compare the available government record with the vehicle and its original registration documents, including the engine and chassis numbers. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    howToVerify: [
      "Open the official GB Excise vehicle search from the action button.",
      "Select the registration district and enter the registration number and date from the book.",
      "Review available results from the government database.",
      "Match the result with chassis, engine and paperwork before paying.",
    ],
    faqTitle:
      "Frequently Asked Questions About Gilgit-Baltistan Vehicle Verification",
    faqs: [
      {
        question:
          "How can I check vehicle registration online in Gilgit-Baltistan?",
        answer:
          "You can check vehicle registration through the official Gilgit-Baltistan Excise and Taxation Department portal. Select the registration district, enter the vehicle registration number and registration date, then submit your search to view available records.",
      },
      {
        question: "What is Gilgit-Baltistan Vehicle Verification?",
        answer:
          "Gilgit-Baltistan Vehicle Verification is an online service provided by the Excise and Taxation Department, Government of Gilgit-Baltistan. It allows users to check available vehicle registration records through the department’s MVRTMS database.",
      },
      {
        question:
          "What information is required to verify a vehicle in Gilgit-Baltistan?",
        answer:
          "You generally need three details: Vehicle registration district, vehicle registration number, and original vehicle registration date. Make sure the information matches the vehicle’s registration documents.",
      },
      {
        question: "Is Gilgit-Baltistan vehicle verification free?",
        answer:
          "The official portal provides an online vehicle search facility. Check the government website or contact the Excise Department for confirmation of any applicable charges related to additional services.",
      },
      {
        question:
          "What information can I find through GB vehicle verification?",
        answer:
          "Depending on the available government records, the portal may display vehicle registration details, chassis number, engine information and token tax validity.",
      },
      {
        question:
          "Can I check vehicle ownership before buying a used car in Gilgit-Baltistan?",
        answer:
          "Yes. You can review available registration records through the official GB Excise portal. Compare the information with the original registration book and physically check the vehicle’s engine and chassis numbers before purchasing.",
      },
      {
        question:
          "Can I verify a Gilgit-Baltistan vehicle using only its registration number?",
        answer:
          "No. The official vehicle search requires additional information, including the registration district and registration date. Keep the original vehicle registration documents available before starting the search.",
      },
      {
        question:
          "Why does the GB vehicle verification portal show no vehicle record found?",
        answer:
          "This may happen if the registration district, vehicle number or registration date is incorrect. Check all three details against the original registration documents. If the problem continues, contact the relevant district Excise office for assistance.",
      },
      {
        question:
          "Can I check route permit details through the Gilgit-Baltistan Excise portal?",
        answer:
          "Yes. The official portal provides a separate Route Permit Verification service. You can search available permit information using the required district and vehicle or permit details.",
      },
      {
        question:
          "Can I verify vehicles registered in other provinces through the GB vehicle verification portal?",
        answer:
          "No. The Gilgit-Baltistan portal is intended for vehicles registered in the region. For vehicles registered in Punjab, Sindh, Islamabad, Khyber Pakhtunkhwa or Balochistan, use the relevant government’s official vehicle verification service.",
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
    heroTitle: "Access Azad Kashmir's Official Vehicle Verification Portal",
    heroDescription:
      "Looking to check vehicle registration details in Azad Jammu & Kashmir (AJK), Pakistan? SELLO provides helpful guidance to understand the online vehicle verification process and access official AJK government resources. Learn where to check available vehicle registration and ownership information through the relevant government portal. Follow the steps below to access the official verification service and review the available records. SELLO does not collect your CNIC or vehicle registration number on this page.",
    heroImage: ajkHeroImg,
    overviewTitle:
      "How to Check Vehicle Registration Before Buying a Used Car in Azad Kashmir",
    overviewContent:
      "Before purchasing a used car or motorcycle in Azad Jammu & Kashmir, it is important to check its available registration and ownership records. Visit the official AJK government vehicle verification service and follow the instructions to access available vehicle information. Compare the government record with the vehicle’s original registration documents, including its engine and chassis numbers. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    overviewImage: howToCheckAjkImg,
    shortDescription: "Access Azad Kashmir vehicle verification services",
    authorityName: "Azad Jammu & Kashmir IRD",
    officialPortalUrl: "https://ird.ajk.gov.pk/tokentax/verification.php",
    portalHomeUrl: "https://ird.ajk.gov.pk/",
    actionNotes: {
      verify: "Official AJK IRD online MV / token tax verification",
      portal: "AJK Inland Revenue Department website",
    },
    introduction:
      "Before purchasing a used car or motorcycle in Azad Jammu & Kashmir, it is important to check its available registration and ownership records. Visit the official AJK government vehicle verification service and follow the instructions to access available vehicle information. Compare the government record with the vehicle’s original registration documents, including its engine and chassis numbers. Online verification is an important first step, but always arrange a proper physical inspection before making your final purchase decision.",
    howToVerify: [
      "Open the official AJK IRD online MV verification page from this guide.",
      "Enter CNIC or MV registration number as requested on the government form.",
      "Review the verification response carefully.",
      "Confirm documents and vehicle identification numbers in person before purchase.",
    ],
    faqTitle:
      "Frequently Asked Questions About Azad Jammu & Kashmir (AJK) Vehicle Verification",
    faqs: [
      {
        question:
          "How can I check vehicle registration online in Azad Kashmir?",
        answer:
          "You can check vehicle registration through the official AJK Inland Revenue Department’s Online Motor Vehicle Verification portal. Select the registration number search option, enter the required details and submit your search to view available vehicle records.",
      },
      {
        question: "What is AJK Vehicle Verification?",
        answer:
          "AJK Vehicle Verification is an online service provided by the Department of Inland Revenue, Government of Azad Jammu & Kashmir. It allows users to access available vehicle registration records through the official government system.",
      },
      {
        question: "Can I check AJK vehicle ownership using a CNIC number?",
        answer:
          "Yes. The official AJK verification portal provides a CNIC-based search option. Enter the registered owner’s CNIC in the required format to check available vehicles associated with that CNIC. Only use someone else’s CNIC with their permission.",
      },
      {
        question: "Can I verify an AJK vehicle using its registration number?",
        answer:
          "Yes. Select the MV Reg. No. search option on the official portal and enter the vehicle registration number as shown on its registration documents. Submit the search to view the available vehicle information.",
      },
      {
        question: "Is AJK online vehicle verification free?",
        answer:
          "The official portal provides an online vehicle search facility. Check the government website for any applicable charges related to additional services, such as vehicle registration, transfer or documentation.",
      },
      {
        question:
          "What information can I find through AJK vehicle verification?",
        answer:
          "Depending on the available government records, vehicle information may include registration number, make, model, engine number, chassis number, ownership details and motor vehicle tax information.",
      },
      {
        question:
          "Can I check vehicle ownership before buying a used car in Azad Kashmir?",
        answer:
          "Yes. You can use the official AJK vehicle verification portal to review available registration and ownership information. Compare the results with the seller’s original registration documents and physically check the engine and chassis numbers before purchasing.",
      },
      {
        question:
          "What should I do if the AJK vehicle verification portal shows no record?",
        answer:
          "First, check that you selected the correct search option and entered the CNIC or registration number accurately. If the vehicle record still does not appear, contact the relevant AJK Inland Revenue or Excise office for assistance.",
      },
      {
        question: "Can I check AJK vehicle token tax information online?",
        answer:
          "You can use the official AJK Inland Revenue vehicle verification service to review available vehicle and tax-related information. For outstanding dues, payment procedures or updated tax details, consult the official department.",
      },
      {
        question:
          "Can I verify an AJK-registered vehicle from another city in Pakistan?",
        answer:
          "Yes. You can access the online AJK vehicle verification portal from anywhere with an internet connection. This is useful when checking an AJK-registered car or motorcycle before purchasing it in another city or province.",
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
