import punjabIcon from "../../../assets/images/verification/punjab.png";
import sindhIcon from "../../../assets/images/verification/sindh.png";
import kpkIcon from "../../../assets/images/verification/kpk.png";
import islamabadIcon from "../../../assets/images/verification/islamabad.png";
import balochistanIcon from "../../../assets/images/verification/blochistan.png";

/** Hardcoded Driving Licence guides — no API/DB required. */

export const PROVINCE_META = {
  punjab: {
    icon: punjabIcon,
    accent: "bg-emerald-50",
    portalLabel: "Punjab DLIMS 2.0",
  },
  sindh: {
    icon: sindhIcon,
    accent: "bg-sky-50",
    portalLabel: "Sindh DLS Online",
  },
  kpk: {
    icon: kpkIcon,
    accent: "bg-amber-50",
    portalLabel: "Transport KP / Dastak",
  },
  islamabad: {
    icon: islamabadIcon,
    accent: "bg-violet-50",
    portalLabel: "ITP-DLIMS",
  },
  balochistan: {
    icon: balochistanIcon,
    accent: "bg-rose-50",
    portalLabel: "Quetta Traffic Police",
  },
};

export const PROVINCE_ORDER = [
  "punjab",
  "sindh",
  "kpk",
  "islamabad",
  "balochistan",
];

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

export const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Choose your province",
    desc: "Open the Sello guide for the province or territory where you will apply or verify your licence.",
  },
  {
    step: "02",
    title: "Read the process first",
    desc: "Review learner, permanent, renewal, documents, fees notes and FAQs before leaving Sello.",
  },
  {
    step: "03",
    title: "Continue on the official portal",
    desc: "Use the action buttons to apply, renew, track or verify only on that province's government site.",
  },
  {
    step: "04",
    title: "Keep records safe",
    desc: "Save payment references, appointment slips and digital copies. Never share CNIC details on unofficial forms.",
  },
];

export const WHAT_YOU_CAN_DO = [
  {
    title: "Apply for a learner licence",
    desc: "Follow province steps, then open the official portal or appointment system to submit your application.",
  },
  {
    title: "Apply for a permanent licence",
    desc: "Check eligibility after your learner period, prepare documents, and complete tests where required.",
  },
  {
    title: "Renew an existing licence",
    desc: "See renewal windows and payment guidance, then renew through the correct provincial channel.",
  },
  {
    title: "Verify or track status",
    desc: "Use official verification and tracking tools linked from each province guide — not third-party forms.",
  },
];

export const PREPARATION_CHECKLIST = [
  "Valid CNIC (original and clear scans/photos when applying online)",
  "Recent photograph meeting the portal's background/size rules",
  "Medical certificate if your province or age group requires it",
  "Registered mobile number and email for OTP / account recovery",
  "Banking or mobile-wallet access for official PSID / 1Bill payments",
  "Existing learner or permanent licence details for renewal or upgrade",
];

export const LANDING_FAQS = [
  {
    q: "Does Sello issue driving licences?",
    a: "No. Sello.pk is an automotive marketplace. These pages explain provincial processes and link to official government portals. Applications, payments and licence cards are handled only by government systems.",
  },
  {
    q: "Why are there separate guides for each province?",
    a: "Pakistan's driving licence systems differ by province and territory. Punjab uses DLIMS, Sindh uses DLS Online, Islamabad uses ITP-DLIMS, KPK uses Transport / Dastak channels, and Balochistan uses Quetta Traffic Police services. Using the wrong portal can delay or invalidate an application.",
  },
  {
    q: "Will Sello ask for my CNIC or licence number?",
    a: "No. Sello does not collect CNIC or licence numbers on these guide pages. Enter personal details only on the official government portal you open from the action buttons.",
  },
  {
    q: "Are fees on this page always final?",
    a: "No. Where an official portal publishes a fee (for example Punjab's online learner FAQ), we mention it with a verification date. Always confirm the live amount inside the government payment step before paying.",
  },
];

export const PORTAL_LABELS = {
  punjab: "Punjab DLIMS 2.0",
  sindh: "Sindh DLS Online",
  kpk: "Transport KP / Dastak",
  islamabad: "ITP-DLIMS",
  balochistan: "Quetta Traffic Police",
};


export const LAST_VERIFIED_AT = "2026-11-04";
const VERIFIED_AT = LAST_VERIFIED_AT;

const disclaimer =
  "Sello.pk publishes guidance only. Applications, payments, tests and licence records are handled exclusively on official government portals. Always confirm current fees, ages and document lists on the official site before applying.";

export const DRIVING_LICENCE_GUIDES = [
  {
    slug: "punjab",
    name: "Punjab",
    order: 1,
    shortDescription:
      "Apply, renew and verify driving licences through Punjab DLIMS 2.0 / Dastak.",
    authorityName: "Punjab DLIMS (Driving License Information Management System)",
    introduction: `Punjab residents use the official Driving License Information Management System (DLIMS 2.0) for learner permits, permanent licences, renewals, payments and tracking. Services are delivered through the Government of Punjab Dastak one-window platform. ${disclaimer}`,
    learnerProcedure: [
      "Open the official Punjab DLIMS portal and create an account or sign in.",
      "Start a learner licence application and complete the online form carefully.",
      "Upload the documents requested by the portal (typically a clear face photo and CNIC front/back scans).",
      "Generate a PSID and pay through supported banking / mobile banking channels.",
      "After successful payment, download or view the digital learner licence from your DLIMS account.",
    ],
    permanentProcedure: [
      "Complete the learner validity / practice period required by Punjab traffic rules before applying for a permanent licence.",
      "Sign in to Punjab DLIMS and choose the permanent licence service.",
      "Submit the application, required documents and fee payment through the portal.",
      "Attend any biometric, medical or driving test appointments instructed by DLIMS / the licensing authority.",
      "Track card printing and delivery status from your DLIMS dashboard.",
    ],
    renewalProcedure: [
      "Sign in to Punjab DLIMS before your licence expires when possible.",
      "Select the renewal service for your licence category.",
      "Upload or confirm documents requested by the portal.",
      "Pay the renewal fee via PSID / ePay channels shown in DLIMS.",
      "Download confirmation and track the renewed card status in your account.",
    ],
    verificationGuide: [
      "Use only the official Punjab DLIMS portal for licence-related verification services.",
      "Do not share CNIC or licence details on unofficial websites or social media forms.",
      "Sello does not store or process your CNIC or licence number for verification.",
    ],
    requiredDocuments: [
      "Clear face photograph (as required by the portal).",
      "Scanned / photographed CNIC front.",
      "Scanned / photographed CNIC back.",
      "Medical certificate signed by a government doctor when the portal requires it (commonly for applicants aged above 50 for online learner applications).",
      "Any additional documents listed inside your live DLIMS application form.",
    ],
    ageRequirements: [
      "Minimum age and eligible vehicle categories are defined by Punjab licensing rules and shown during the DLIMS application.",
      "Confirm the exact age requirement for motorcycle, car, LTV, HTV or other categories on the official portal before applying.",
    ],
    feesAndPayment: [
      "Punjab DLIMS FAQ (verified): online learner driving licence fee is PKR 500 for each category (for example bike or car).",
      "Permanent licence, renewal and other service fees are shown as PSID amounts inside DLIMS at the time of application.",
      "Payments are processed through the official ePay / banking channels linked from DLIMS.",
      "Confirm the live fee on the portal — amounts can change without notice on third-party sites.",
    ],
    drivingTestGuidelines: [
      "Follow the test instructions and appointment slots issued inside DLIMS / Dastak after you apply for a permanent licence.",
      "Bring original CNIC and any documents listed on your appointment slip.",
      "Test format and eligibility can differ by licence category — confirm details on the official portal.",
    ],
    trackingInstructions: [
      "Sign in to your Punjab DLIMS dashboard for real-time application and card-tracking updates.",
      "Keep your PSID / application reference safe for payment and support queries.",
      "Official contact published on DLIMS: info@dlims.punjab.gov.pk · 042-99202892 · emergency 15.",
    ],
    faqs: [
      {
        question: "Where do I apply for a Punjab driving licence online?",
        answer:
          "Use the official portal https://dlims.punjab.gov.pk/ (DLIMS 2.0 / Dastak). Sello only provides guidance and links — applications are completed on the government site.",
      },
      {
        question: "What is the published online learner fee in Punjab?",
        answer:
          "According to the official DLIMS FAQ, the online learner driving licence fee is PKR 500 per category. Always re-check the live PSID amount in your application.",
      },
      {
        question: "What documents does Punjab DLIMS commonly ask for online?",
        answer:
          "The official FAQ lists a clear face photo, CNIC front and back scans, and a medical certificate signed by a government doctor when age is above 50 for online learner applications. Always follow the checklist inside your live application.",
      },
      {
        question: "How do I track a Punjab DLIMS application?",
        answer:
          "Sign in to your DLIMS dashboard for real-time updates. Keep your PSID / application reference for payment and support queries. Published contact: info@dlims.punjab.gov.pk · 042-99202892.",
      },
      {
        question: "Does Sello issue or print driving licences?",
        answer:
          "No. Sello is an automotive marketplace. All licence issuance, renewal and verification are handled by official government systems.",
      },
    ],
    actionLinks: [
      {
        key: "learner",
        label: "Apply for Learner Licence",
        url: "https://dlims.punjab.gov.pk/",
        note: "Official Punjab DLIMS portal",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://dlims.punjab.gov.pk/",
        note: "Official Punjab DLIMS portal",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://dlims.punjab.gov.pk/",
        note: "Use official DLIMS services only",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://dlims.punjab.gov.pk/",
        note: "Official Punjab DLIMS portal",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://dlims.punjab.gov.pk/",
        note: "Sign in to your DLIMS dashboard",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://dlims.punjab.gov.pk/",
        note: "Punjab DLIMS 2.0",
      },
    ],
    officialPortalUrl: "https://dlims.punjab.gov.pk/",
    sourceUrls: [
      "https://dlims.punjab.gov.pk/",
    ],
    seoTitle: "Punjab Driving Licence Online | DLIMS Apply, Renew & Verify – Sello.pk",
    seoDescription:
      "Step-by-step Punjab driving licence guide for learner, permanent, renewal and tracking via official DLIMS 2.0. Confirm fees and documents on the government portal.",
    lastVerifiedAt: VERIFIED_AT,
    isPublished: true,
  },
  {
    slug: "sindh",
    name: "Sindh",
    order: 2,
    shortDescription:
      "Learner, permanent, renewal and IDP services through Sindh Police DLS Online.",
    authorityName: "Sindh Police — Driving License Sindh (DLS Online)",
    introduction: `Sindh driving licence services are provided through the official DLS Online portal operated with Sindh Police. Citizens can apply for learner licences, permanent licences, renewals and related services online. ${disclaimer}`,
    learnerProcedure: [
      "Create an account or log in on the official DLS Online portal.",
      "Select the learner licence service and fill the application form.",
      "Upload the documents requested by the portal.",
      "Generate the payment bill ID and pay through supported 1Bill / internet banking / mobile wallet channels.",
      "After payment confirmation, print or save the learner licence from the system as instructed.",
    ],
    permanentProcedure: [
      "Apply for a permanent licence through DLS Online after meeting learner / eligibility rules shown on the portal.",
      "Select the permanent licence duration option offered on the site (for example 3-year or 5-year where available).",
      "Upload required documents and complete payment.",
      "Follow any in-person test or biometrics instructions issued by Driving License Sindh.",
      "Track delivery / courier status from the portal when the service provides it.",
    ],
    renewalProcedure: [
      "Open DLS Online and choose the matching renewal option (within or after the grace window shown on the portal).",
      "Confirm licence category and personal details.",
      "Pay the bill generated by DLS Online.",
      "Use courier / download options provided after successful payment.",
    ],
    verificationGuide: [
      "Use the official DLS Online portal for Sindh licence services.",
      "Do not submit CNIC or licence numbers on unofficial verification sites.",
      "Sello does not collect licence or CNIC data for this guide.",
    ],
    requiredDocuments: [
      "Documents listed inside the live DLS Online form for your selected service.",
      "For International Driving Permit applications, the portal lists: clear face photo with white background, CNIC front & back, valid Sindh permanent licence scan, and valid passport scan.",
      "Always follow the checklist shown for your specific application type.",
    ],
    ageRequirements: [
      "Age eligibility depends on the vehicle category selected in DLS Online.",
      "Confirm the minimum age for motorcycle, car, LTV, HTV and other categories on the official portal before applying.",
    ],
    feesAndPayment: [
      "DLS Online displays required fee components such as lamination, NADRA and medical charges inside the application flow (amounts shown on the portal at the time of use).",
      "Optional portal-listed components may include correction, duplicate, PSV and courier charges.",
      "Pay only through the official bill ID generated by DLS Online.",
      "Re-check live amounts on the government site — do not rely on outdated third-party fee tables.",
    ],
    drivingTestGuidelines: [
      "Complete any driving test requirements instructed by Driving License Sindh for permanent licence categories that need a test.",
      "Carry original CNIC and documents listed on your appointment or portal instructions.",
    ],
    trackingInstructions: [
      "Track application and payment status from your DLS Online account.",
      "Keep the generated bill ID for banking support and portal follow-up.",
      "For courier deliveries, use the tracking details provided after issuance.",
    ],
    faqs: [
      {
        question: "What is the official Sindh driving licence portal?",
        answer:
          "Use https://dlsonline.sindhpolice.gov.pk/ — the official DLS Online service. Do not use Punjab DLIMS links for Sindh applications.",
      },
      {
        question: "Can I get a learner licence instantly online in Sindh?",
        answer:
          "According to DLS Online guidance, learner licences can be available after form completion and successful payment. Permanent renewals / IDP may be delivered by courier.",
      },
      {
        question: "What payment channels does Sindh DLS Online support?",
        answer:
          "DLS Online instructs applicants to generate a bill ID and pay through internet banking / mobile apps with 1Bill facility, including channels such as EasyPaisa and JazzCash where available. Confirm options shown at payment time.",
      },
      {
        question: "Does Sello process Sindh licence payments?",
        answer:
          "No. Pay only through the official bill generated on DLS Online.",
      },
    ],
    actionLinks: [
      {
        key: "learner",
        label: "Apply for Learner Licence",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Official DLS Online",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Official DLS Online",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Official DLS Online services",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Official DLS Online",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Sign in to DLS Online",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Sindh Police DLS Online",
      },
    ],
    officialPortalUrl: "https://dlsonline.sindhpolice.gov.pk/",
    sourceUrls: ["https://dlsonline.sindhpolice.gov.pk/"],
    seoTitle: "Sindh Driving Licence Online | DLS Apply, Renew & Verify – Sello.pk",
    seoDescription:
      "Guide to Sindh driving licence services via official DLS Online: learner, permanent, renewal and tracking. Confirm live fees and documents on the government portal.",
    lastVerifiedAt: VERIFIED_AT,
    isPublished: true,
  },
  {
    slug: "kpk",
    name: "Khyber Pakhtunkhwa",
    order: 3,
    shortDescription:
      "Learner, permanent, renewal and tracking via Khyber Pakhtunkhwa Transport / Dastak services.",
    authorityName: "Transport & Mass Transit Department, Khyber Pakhtunkhwa",
    introduction: `Khyber Pakhtunkhwa provides online driving licence services through the provincial Transport department’s Driving License page and the Dastak app. Use KPK official channels only — do not submit KPK applications on Punjab or Sindh portals. ${disclaimer}`,
    learnerProcedure: [
      "Download the official Dastak app (or follow the Transport KP Driving License page instructions).",
      "Register with your CNIC and mobile number.",
      "Select the Learner Permit service.",
      "Fill the required information and upload a CNIC copy as instructed.",
      "Pay the fee online and submit the application.",
    ],
    permanentProcedure: [
      "Apply after completing the learner validity period required by KPK rules.",
      "Select the New Permanent License service in Dastak / the official channel.",
      "Upload required documents and pay the fee online.",
      "Visit the branch for a test if the system requires it.",
      "Submit and follow branch / app instructions until issuance.",
    ],
    renewalProcedure: [
      "Open the Renew Existing License service in the official Dastak / Transport KP channel.",
      "Confirm personal and licence details.",
      "Pay the renewal fee online.",
      "Complete any branch visit instructed by the system.",
    ],
    verificationGuide: [
      "Use official KPK Transport / Dastak channels for licence services.",
      "Do not use another province’s DLIMS portal for KPK licences.",
      "Sello does not collect CNIC or licence numbers for verification.",
    ],
    requiredDocuments: [
      "CNIC copy (as required during online submission).",
      "Additional documents listed inside the selected Dastak / Transport KP service form.",
      "Original CNIC when visiting a branch for tests or biometrics.",
    ],
    ageRequirements: [
      "Minimum ages depend on the licence category selected in the official service.",
      "Confirm motorcycle, car and commercial category ages on the Transport KP / Dastak flow before applying.",
    ],
    feesAndPayment: [
      "Pay only the fee amount shown inside the official Dastak / Transport KP payment step.",
      "Sello does not publish an unofficial KPK fee table — confirm live charges in the app or portal.",
    ],
    drivingTestGuidelines: [
      "If the permanent licence service requires a test, visit the branch when instructed.",
      "Bring original CNIC and documents listed in your application / appointment.",
    ],
    trackingInstructions: [
      "Use the Track Application Status service listed on the Transport KP Driving License page / Dastak app.",
      "Keep your application reference and registered mobile number available.",
    ],
    faqs: [
      {
        question: "Where are official KPK driving licence services listed?",
        answer:
          "See https://www.transport.kp.gov.pk/DL.html and complete services through the official Dastak app channels linked by Transport KP.",
      },
      {
        question: "Can I apply on Punjab DLIMS for a KPK licence?",
        answer:
          "No. Each province/territory uses its own official system. Use KPK Transport / Dastak services for Khyber Pakhtunkhwa.",
      },
    ],
    actionLinks: [
      {
        key: "learner",
        label: "Apply for Learner Licence",
        url: "https://www.transport.kp.gov.pk/DL.html",
        note: "Transport KP / Dastak services",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://www.transport.kp.gov.pk/DL.html",
        note: "Transport KP / Dastak services",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://www.transport.kp.gov.pk/DL.html",
        note: "Use official KPK channels only",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://www.transport.kp.gov.pk/DL.html",
        note: "Transport KP / Dastak services",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://www.transport.kp.gov.pk/DL.html",
        note: "Track Application Status service",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://www.transport.kp.gov.pk/DL.html",
        note: "Transport KP Driving License page",
      },
    ],
    officialPortalUrl: "https://www.transport.kp.gov.pk/DL.html",
    sourceUrls: ["https://www.transport.kp.gov.pk/DL.html"],
    seoTitle: "KPK Driving Licence Online | Apply & Renew via Dastak – Sello.pk",
    seoDescription:
      "Khyber Pakhtunkhwa driving licence guide: learner permit, permanent licence, renewal and tracking via official Transport KP / Dastak services.",
    lastVerifiedAt: VERIFIED_AT,
    isPublished: true,
  },
  {
    slug: "islamabad",
    name: "Islamabad",
    order: 4,
    shortDescription:
      "Islamabad Traffic Police DLIMS for online driving licence services in ICT.",
    authorityName: "Islamabad Traffic Police — ITP-DLIMS",
    introduction: `Islamabad Capital Territory driving licence services are offered through Islamabad Traffic Police DLIMS (ITP-DLIMS). The portal is designed to streamline online licence applications for ICT residents. ${disclaimer}`,
    learnerProcedure: [
      "Open the official ITP-DLIMS portal.",
      "Create an account or sign in as instructed.",
      "Select the learner licence service and complete the online form.",
      "Upload documents and complete payment steps shown in the portal.",
      "Follow ITP instructions for collection or digital download.",
    ],
    permanentProcedure: [
      "After meeting learner / eligibility requirements, apply for a permanent licence on ITP-DLIMS.",
      "Submit documents and fees through the official portal.",
      "Attend tests or biometrics if scheduled by Islamabad Traffic Police.",
      "Track issuance status in your ITP-DLIMS account.",
    ],
    renewalProcedure: [
      "Sign in to ITP-DLIMS and choose the renewal service.",
      "Confirm details, upload any requested documents and pay through official channels.",
      "Follow portal guidance for card delivery or collection.",
    ],
    verificationGuide: [
      "Use https://dlims.islamabadpolice.gov.pk/ for Islamabad licence services.",
      "Do not confuse ICT DLIMS with Punjab DLIMS — they are separate systems.",
      "Sello never asks for your CNIC or licence number on this guide.",
    ],
    requiredDocuments: [
      "Documents listed inside the live ITP-DLIMS application for your service type.",
      "Original CNIC for any in-person verification or test appointments.",
    ],
    ageRequirements: [
      "Minimum ages are set by Islamabad Traffic Police for each vehicle category.",
      "Confirm eligibility on ITP-DLIMS before starting an application.",
    ],
    feesAndPayment: [
      "Pay only the amounts generated inside ITP-DLIMS.",
      "Sello does not publish an unofficial ICT fee schedule — confirm live fees on the official portal.",
    ],
    drivingTestGuidelines: [
      "Attend driving tests only at locations / times instructed by Islamabad Traffic Police.",
      "Carry original CNIC and appointment details.",
    ],
    trackingInstructions: [
      "Track applications from your ITP-DLIMS account dashboard.",
      "Official helpline published on ITP-DLIMS: 051-9001541.",
    ],
    faqs: [
      {
        question: "What is the official Islamabad driving licence portal?",
        answer:
          "https://dlims.islamabadpolice.gov.pk/ — Islamabad Traffic Police DLIMS.",
      },
      {
        question: "Is Islamabad the same as Punjab DLIMS?",
        answer:
          "No. Islamabad uses ITP-DLIMS. Punjab uses dlims.punjab.gov.pk. Apply on the portal that matches where you are licensed.",
      },
    ],
    actionLinks: [
      {
        key: "learner",
        label: "Apply for Learner Licence",
        url: "https://dlims.islamabadpolice.gov.pk/",
        note: "Official ITP-DLIMS",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://dlims.islamabadpolice.gov.pk/",
        note: "Official ITP-DLIMS",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://dlims.islamabadpolice.gov.pk/",
        note: "Official ITP-DLIMS",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://dlims.islamabadpolice.gov.pk/",
        note: "Official ITP-DLIMS",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://dlims.islamabadpolice.gov.pk/",
        note: "Sign in to ITP-DLIMS",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://dlims.islamabadpolice.gov.pk/",
        note: "Islamabad Traffic Police DLIMS",
      },
    ],
    officialPortalUrl: "https://dlims.islamabadpolice.gov.pk/",
    sourceUrls: ["https://dlims.islamabadpolice.gov.pk/"],
    seoTitle: "Islamabad Driving Licence Online | ITP-DLIMS Guide – Sello.pk",
    seoDescription:
      "Islamabad driving licence guide for learner, permanent, renewal and tracking via official Islamabad Traffic Police DLIMS. Confirm fees on the government portal.",
    lastVerifiedAt: VERIFIED_AT,
    isPublished: true,
  },
  {
    slug: "balochistan",
    name: "Balochistan",
    order: 5,
    shortDescription:
      "Book appointments and verify licences through Quetta / Balochistan Traffic Police services.",
    authorityName: "Quetta Traffic Police / Balochistan Traffic Police",
    introduction: `Balochistan driving licence services are handled through Quetta Traffic Police digital channels, including online appointment booking and licence verification on the official QTP website. Online coverage can differ from other provinces — many steps still require an in-person visit after booking. ${disclaimer}`,
    learnerProcedure: [
      "Open the official Quetta Traffic Police website and choose Online Appointment.",
      "Enter your name, mobile number and CNIC as requested by the booking form.",
      "Select the branch and Learners Driving License appointment type.",
      "Choose an available time slot and download / save the appointment confirmation.",
      "Visit the licensing office with the documents and fee ticket required for learner applications.",
    ],
    permanentProcedure: [
      "Book a Permanent Driving License appointment on qtp.gob.pk when eligible.",
      "If a driving test is required, also book the Test Driving appointment type.",
      "Attend the office with the documents listed for permanent licence applications.",
      "Complete test / biometrics steps instructed by Quetta Traffic Police staff.",
    ],
    renewalProcedure: [
      "Use the official QTP appointment / licence services to start renewal where available.",
      "Confirm renewal requirements and fee tickets at the licensing counter if not fully listed online.",
      "Bring original CNIC and existing licence documents to your appointment.",
    ],
    verificationGuide: [
      "Licence verification is offered on the Quetta Traffic Police site (including CNIC-based verification where published).",
      "Use https://qtp.gob.pk/driving for the official verification page when available.",
      "Sello does not collect or store CNIC numbers for Balochistan verification.",
    ],
    requiredDocuments: [
      "Follow the document list shown for your appointment type on qtp.gob.pk / at the licensing counter.",
      "Typically prepare CNIC, medical certificate and fee ticket as instructed by Quetta Traffic Police for learner applications.",
      "For permanent applications, bring documents listed by the authority for Form A / learner / photos / test result as applicable.",
    ],
    ageRequirements: [
      "Minimum ages are set by Balochistan / Quetta Traffic Police for each vehicle category.",
      "Confirm current age eligibility for motorcycle, car, LTV and HTV at the official QTP service or licensing counter before applying.",
    ],
    feesAndPayment: [
      "Pay only official fee tickets / amounts instructed by Quetta Traffic Police.",
      "Where a full public fee schedule is not published online, confirm the current amount at the counter or inside the official booking flow.",
      "Do not pay licence fees through unofficial agents claiming government status.",
    ],
    drivingTestGuidelines: [
      "Book the Test Driving appointment type on the official QTP site when a test is required.",
      "Arrive on time with original CNIC and documents listed for the test.",
    ],
    trackingInstructions: [
      "Keep your downloaded appointment confirmation with counter and dealing time.",
      "For digital services and history features, Quetta / Balochistan Traffic Police also publish a public mobile app — confirm features inside the official store listing.",
      "Contact published on QTP: info@qtp.gob.pk · +92-819213316.",
    ],
    faqs: [
      {
        question: "What is the official Balochistan / Quetta licence website?",
        answer:
          "Use https://qtp.gob.pk/ for appointments and related traffic police services. Verification is available via the official driving / verification pages on that site.",
      },
      {
        question: "Can I use Punjab DLIMS for a Balochistan licence?",
        answer:
          "No. Punjab DLIMS is only for Punjab. Balochistan applications and verification go through Quetta / Balochistan Traffic Police channels.",
      },
    ],
    actionLinks: [
      {
        key: "learner",
        label: "Apply for Learner Licence",
        url: "https://qtp.gob.pk/",
        note: "Book Online Appointment on QTP",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://qtp.gob.pk/",
        note: "Book Online Appointment on QTP",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://qtp.gob.pk/driving",
        note: "Official QTP licence verification",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://qtp.gob.pk/",
        note: "Use official QTP appointment / counter process",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://qtp.gob.pk/",
        note: "Use appointment confirmation / official QTP channels",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://qtp.gob.pk/",
        note: "Quetta Traffic Police",
      },
    ],
    officialPortalUrl: "https://qtp.gob.pk/",
    sourceUrls: ["https://qtp.gob.pk/", "https://qtp.gob.pk/driving"],
    seoTitle: "Balochistan Driving Licence | Quetta Traffic Police Guide – Sello.pk",
    seoDescription:
      "Balochistan driving licence guide: book Quetta Traffic Police appointments, understand learner/permanent steps, and verify licences on official QTP channels.",
    lastVerifiedAt: VERIFIED_AT,
    isPublished: true,
  },
];

export const getGuideBySlug = (slug) =>
  DRIVING_LICENCE_GUIDES.find((g) => g.slug === slug) || null;

