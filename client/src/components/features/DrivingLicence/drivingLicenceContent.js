import punjabIcon from "../../../assets/images/verification/punjab.png";
import sindhIcon from "../../../assets/images/verification/sindh.png";
import kpkIcon from "../../../assets/images/verification/kpk.png";
import islamabadIcon from "../../../assets/images/verification/islamabad.png";
import balochistanIcon from "../../../assets/images/verification/blochistan.png";
import howToApplyLearnerPunjabImg from "../../../assets/images/How to Apply for a Learner Driving Licence in Punjab.jpeg";
import howToGetRegularPunjabImg from "../../../assets/images/How to Get a Regular Driving Licence in Punjab.jpeg";
import howToApplyLearnerSindhImg from "../../../assets/images/How to Apply for a Learner Driving Licence in Sindh.jpeg";
import howToGetRegularSindhImg from "../../../assets/images/How to Get a Regular Driving Licence in Sindh.jpeg";
import howToApplyLearnerKpkImg from "../../../assets/images/How to Apply for a Learner Driving Licence in Khyber Pakhtunkhwa.jpeg";
import howToGetRegularKpkImg from "../../../assets/images/How to Get a Regular Driving Licence in Khyber Pakhtunkhwa.jpeg";

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
    question: "How can I verify my driving licence online in Pakistan?",
    answer:
      "You can verify your driving licence through the official online portal of the province or territory that issued it. Select the relevant licensing authority, enter the required information, such as your CNIC or licence number, and follow the verification instructions.",
    q: "How can I verify my driving licence online in Pakistan?",
    a: "You can verify your driving licence through the official online portal of the province or territory that issued it. Select the relevant licensing authority, enter the required information, such as your CNIC or licence number, and follow the verification instructions.",
  },
  {
    question:
      "Is there one driving licence verification website for all of Pakistan?",
    answer:
      "No. Pakistan does not currently have one universal public driving licence verification portal. Punjab, Sindh, Islamabad, Khyber Pakhtunkhwa, Balochistan, Azad Jammu & Kashmir and Gilgit-Baltistan have their own licensing systems and verification services.",
    q: "Is there one driving licence verification website for all of Pakistan?",
    a: "No. Pakistan does not currently have one universal public driving licence verification portal. Punjab, Sindh, Islamabad, Khyber Pakhtunkhwa, Balochistan, Azad Jammu & Kashmir and Gilgit-Baltistan have their own licensing systems and verification services.",
  },
  {
    question: "Can I check my driving licence using my CNIC number?",
    answer:
      "Yes. Several provincial and regional licensing portals offer CNIC-based verification. Depending on the issuing authority, you may also need your driving licence number or other details.",
    q: "Can I check my driving licence using my CNIC number?",
    a: "Yes. Several provincial and regional licensing portals offer CNIC-based verification. Depending on the issuing authority, you may also need your driving licence number or other details.",
  },
  {
    question:
      "What information can I find through online driving licence verification?",
    answer:
      "Depending on the official portal, available information may include the licence holder’s name, licence number, licence type, permitted vehicle categories, issue date, expiry date and current licence status.",
    q: "What information can I find through online driving licence verification?",
    a: "Depending on the official portal, available information may include the licence holder’s name, licence number, licence type, permitted vehicle categories, issue date, expiry date and current licence status.",
  },
  {
    question:
      "How can I check whether my Pakistani driving licence is valid or expired?",
    answer:
      "Visit the official verification portal of the authority that issued your licence. Enter the required information and check the displayed licence status and expiry date, where available.",
    q: "How can I check whether my Pakistani driving licence is valid or expired?",
    a: "Visit the official verification portal of the authority that issued your licence. Enter the required information and check the displayed licence status and expiry date, where available.",
  },
  {
    question: "Can I verify a learner driving licence online in Pakistan?",
    answer:
      "Some provincial licensing systems provide online information or verification facilities for learner permits. Availability depends on the issuing authority and its online services.",
    q: "Can I verify a learner driving licence online in Pakistan?",
    a: "Some provincial licensing systems provide online information or verification facilities for learner permits. Availability depends on the issuing authority and its online services.",
  },
  {
    question:
      "Can I verify an international driving licence issued in Pakistan?",
    answer:
      "Verification depends on the authority that issued your international driving permit. Contact the relevant licensing authority or use its official international licence verification service, where available.",
    q: "Can I verify an international driving licence issued in Pakistan?",
    a: "Verification depends on the authority that issued your international driving permit. Contact the relevant licensing authority or use its official international licence verification service, where available.",
  },
  {
    question:
      "What should I do if my driving licence details do not appear online?",
    answer:
      "First, confirm that you are using the correct provincial or regional portal. Check your CNIC and licence number for typing errors. If your record is still unavailable, contact the issuing traffic police or licensing office to confirm your record.",
    q: "What should I do if my driving licence details do not appear online?",
    a: "First, confirm that you are using the correct provincial or regional portal. Check your CNIC and licence number for typing errors. If your record is still unavailable, contact the issuing traffic police or licensing office to confirm your record.",
  },
  {
    question: "Is online driving licence verification free in Pakistan?",
    answer:
      "Many official government portals provide online licence verification without a search fee. However, charges may apply for other services, such as licence issuance, renewal, duplicate cards or international permits. Check the relevant official portal for current fees.",
    q: "Is online driving licence verification free in Pakistan?",
    a: "Many official government portals provide online licence verification without a search fee. However, charges may apply for other services, such as licence issuance, renewal, duplicate cards or international permits. Check the relevant official portal for current fees.",
  },
  {
    question: "Can I verify a Pakistani driving licence while living abroad?",
    answer:
      "Yes. You can generally access the relevant official online verification portal from outside Pakistan, including the UAE and other countries. You may need your Pakistani CNIC and driving licence details to complete the search.",
    q: "Can I verify a Pakistani driving licence while living abroad?",
    a: "Yes. You can generally access the relevant official online verification portal from outside Pakistan, including the UAE and other countries. You may need your Pakistani CNIC and driving licence details to complete the search.",
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
    overviewSections: [
      {
        title: "How to Apply for a Learner Driving Licence in Punjab",
        content:
          "If you are planning to drive a car or motorcycle in Punjab, Pakistan, the first step is to obtain a learner driving permit. Visit the official Punjab DLIMS or Dastak platform, create an account and complete the online application. Upload the required documents, generate your PSID and pay the applicable fee through an approved payment channel. Once your application is processed, you can download your learner permit and begin learning to drive according to traffic rules.",
        image: howToApplyLearnerPunjabImg,
      },
      {
        title: "How to Get a Regular Driving Licence in Punjab",
        content:
          "After completing the required learner period, you can apply for a regular driving licence in Punjab. Visit the relevant licensing centre and complete the required driving and traffic-rule tests for your selected vehicle category. Keep your original CNIC, valid learner permit and any other required documents ready. After successfully passing the required tests and completing the payment process, your regular driving licence will be processed by the licensing authority. Always check the latest requirements and fees through the official Punjab DLIMS platform.",
        image: howToGetRegularPunjabImg,
      },
    ],
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
    faqTitle: "Frequently Asked Questions About Punjab Driving Licence",
    faqs: [
      {
        question:
          "How can I apply for a driving licence in Punjab, Pakistan?",
        answer:
          "You can apply through the official Punjab Driving Licence Information Management System (DLIMS), which is integrated with the Dastak platform. Create an account, select the required licence service, complete the application, upload the necessary documents and pay the applicable fee.",
      },
      {
        question:
          "How can I apply for a learner driving licence online in Punjab?",
        answer:
          "Visit the official DLIMS or Dastak platform, create an account and complete the learner licence application. Upload your photograph and CNIC copies, generate your PSID and pay the required fee. After payment and processing, your digital learner permit will be available through your account.",
      },
      {
        question:
          "What is the minimum age for getting a driving licence in Punjab?",
        answer:
          "The minimum age for a motorcycle or motorcar learner permit is 18 years. For an LTV learner permit, the minimum age is 21 years. Additional age and eligibility requirements may apply to other commercial vehicle categories.",
      },
      {
        question:
          "What documents are required for a Punjab learner driving licence?",
        answer: `Generally, you need:

• Valid CNIC (front and back)
• Recent photograph with a white background
• Medical certificate, if required by the licensing authority

Applicants above 50 years and certain commercial licence applicants may need a medical certificate signed by an authorised government doctor.`,
      },
      {
        question:
          "How much does a learner driving licence cost in Punjab?",
        answer:
          "The online learner driving licence fee is PKR 500 per category according to the official DLIMS information. If you apply for more than one category, the applicable fee is charged for each category. Always check the latest fee before payment.",
      },
      {
        question: "How long is a learner driving permit valid in Punjab?",
        answer:
          "A learner driving permit is generally valid for 180 days from its issuance. Check the expiry date displayed on your permit and apply for renewal if required.",
      },
      {
        question:
          "How long must I wait before taking the regular driving licence test in Punjab?",
        answer:
          "You generally need to hold your learner permit for at least 42 days before appearing for the regular driving licence test. You must also meet the relevant eligibility requirements and pass the required tests.",
      },
      {
        question:
          "What tests are required to get a regular driving licence in Punjab?",
        answer:
          "Applicants generally need to pass a traffic signs or theoretical test and a practical driving test for their selected vehicle category. The licensing authority assesses your knowledge of traffic rules and ability to operate the vehicle safely.",
      },
      {
        question:
          "How can I renew or get a duplicate driving licence in Punjab?",
        answer:
          "You can apply for eligible driving licence services through the official Dastak platform. Select the renewal or duplicate licence service, provide the required information and documents, generate the applicable payment slip and complete the payment process.",
      },
      {
        question:
          "How can I check my Punjab driving licence application status?",
        answer:
          "Visit the official DLIMS or Dastak platform and log in to your account. Use the application tracking facility to check available updates about your application, payment, approval and licence card processing.",
      },
    ],
    actionLinks: [
      {
        key: "learner",
        label: "Apply for Learner Licence",
        url: "https://dastak.punjab.gov.pk/",
        note: "Apply on Dastak (Punjab DLIMS services)",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://dastak.punjab.gov.pk/",
        note: "Regular licence services via Dastak",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://dlims.punjab.gov.pk/verify",
        note: "Official DLIMS licence verification",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://dastak.punjab.gov.pk/",
        note: "Renew on Dastak (Punjab DLIMS services)",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://dlims.punjab.gov.pk/track",
        note: "Official DLIMS application tracking",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://dlims.punjab.gov.pk/",
        note: "Punjab DLIMS 2.0 hub",
      },
    ],
    officialPortalUrl: "https://dlims.punjab.gov.pk/",
    sourceUrls: [
      "https://dlims.punjab.gov.pk/",
      "https://dastak.punjab.gov.pk/",
      "https://dlims.punjab.gov.pk/verify",
      "https://dlims.punjab.gov.pk/track",
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
    overviewSections: [
      {
        title: "How to Apply for a Learner Driving Licence in Sindh",
        content:
          "If you want to drive a car or motorcycle in Sindh, Pakistan, the first step is to obtain a learner driving licence. Visit the official Sindh Police Driving Licence portal and create an online account using your CNIC and mobile number. Complete the learner licence application, select your required vehicle category and upload the necessary documents, including your CNIC and a recent photograph. Generate the payment bill and pay through an approved payment channel. Once your payment is confirmed and your application is processed, download and print your learner driving licence. Always follow the learner permit conditions and practise driving safely.",
        image: howToApplyLearnerSindhImg,
      },
      {
        title: "How to Get a Regular Driving Licence in Sindh",
        content:
          "After obtaining your learner driving licence and completing the mandatory waiting period, you can apply for a regular driving licence in Sindh. For a non-commercial licence, the required waiting period is generally 42 days. Visit the designated Driving Licence Branch with your original CNIC and learner permit, and complete the required medical fitness examination and driving licence tests. These may include a traffic signs or theoretical test and a practical driving test, depending on your selected vehicle category. After successfully completing the required tests and paying the applicable fee, your regular driving licence will be processed by the licensing authority. Always confirm the latest requirements and fees through the official Sindh Police driving licence service before visiting a branch.",
        image: howToGetRegularSindhImg,
      },
    ],
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
    faqTitle: "Frequently Asked Questions About Sindh Driving Licence",
    faqs: [
      {
        question:
          "How can I apply for a learner driving licence online in Sindh?",
        answer:
          "You can apply through the official Sindh Driving Licence online system. Create an account using your CNIC and mobile number, complete the application form, select your vehicle category, upload the required documents and generate a PSID for payment. After payment confirmation and application approval, download and print your learner driving permit.",
      },
      {
        question:
          "What is the minimum age to get a learner driving licence in Sindh?",
        answer:
          "The minimum age generally depends on the vehicle category. Applicants for a motorcycle or motorcar licence must meet the applicable minimum age requirement, generally 18 years. Commercial vehicle categories may have higher age and eligibility requirements. Check the latest requirements with Sindh Police before applying.",
      },
      {
        question:
          "What documents are required for a learner driving licence in Sindh?",
        answer:
          "Applicants generally need a valid CNIC, a recent passport-size photograph and the personal information requested in the online application. Additional documents may be required depending on the selected vehicle category.",
      },
      {
        question:
          "How much is the learner driving licence fee in Sindh?",
        answer:
          "The learner licence fee depends on the applicable government fee schedule and selected vehicle category. Generate the payment PSID through the official online system to see the amount payable. Always confirm the latest fee before making payment.",
      },
      {
        question:
          "Can I apply for a learner driving licence online in Karachi?",
        answer:
          "Yes. Residents of Karachi can use the Sindh Police online driving licence service to submit a learner licence application. Follow the online instructions, complete the required information and pay the generated fee.",
      },
      {
        question: "How long is a learner driving licence valid in Sindh?",
        answer:
          "A learner driving permit is generally valid for six months. Check the expiry date printed on your permit and follow the conditions mentioned by the licensing authority.",
      },
      {
        question:
          "How many days after getting a learner licence can I apply for a permanent driving licence in Sindh?",
        answer:
          "You must generally wait at least 42 days after obtaining your learner permit before appearing for the regular driving licence process. The Government of Sindh confirms this mandatory waiting period.",
      },
      {
        question:
          "What tests are required to get a permanent driving licence in Sindh?",
        answer:
          "Applicants may need to pass a theoretical or traffic-sign test and a practical driving test. The exact requirements depend on the selected vehicle category and instructions from the licensing authority.",
      },
      {
        question:
          "Can I renew or track my driving licence online in Sindh?",
        answer:
          "Sindh’s digital driving licence system provides online services, including application tracking. You can use your CNIC to check the progress of supported applications. Renewal options and requirements may depend on the service available through the official portal.",
      },
      {
        question:
          "Where can I check or verify my Sindh driving licence online?",
        answer:
          "You can use the official Sindh Driving Licence Information Management System (DLIMS) to access the licence verification service. Follow the portal instructions and enter the required information to check the available licence record.",
      },
    ],
    actionLinks: [
      {
        key: "learner",
        label: "Apply for Learner Licence",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "DLS Online learner application",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Permanent 3-year / 5-year on DLS Online",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://dls.gos.pk/",
        note: "Official Driving License Sindh verification",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Renewal services on DLS Online",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Sign in to track on DLS Online",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://dlsonline.sindhpolice.gov.pk/",
        note: "Sindh Police DLS Online",
      },
    ],
    officialPortalUrl: "https://dlsonline.sindhpolice.gov.pk/",
    sourceUrls: [
      "https://dlsonline.sindhpolice.gov.pk/",
      "https://dls.gos.pk/",
    ],
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
    overviewSections: [
      {
        title:
          "How to Apply for a Learner Driving Licence in Khyber Pakhtunkhwa",
        content:
          "If you want to drive a car or motorcycle in Khyber Pakhtunkhwa, Pakistan, the first step is to obtain a learner driving permit. You can apply through the official KP Dastak app by registering with your CNIC and mobile number. Select the Learner Permit service, complete the application form, upload a copy of your CNIC and pay the applicable fee online. After submitting your application and completing the required process, your learner permit will be issued. Applicants can also visit an authorised driving licence branch for assistance. Always check the latest eligibility requirements and learner permit conditions through the official KP Transport Department.",
        image: howToApplyLearnerKpkImg,
      },
      {
        title: "How to Get a Regular Driving Licence in Khyber Pakhtunkhwa",
        content:
          "After obtaining your learner driving permit and completing the required waiting period, you can apply for a regular driving licence in Khyber Pakhtunkhwa. According to the Peshawar Traffic Police procedure, the learner permit matures after 45 days. Apply for a permanent licence through the official KP Dastak app or visit your relevant driving licence branch. Complete the required documentation, medical examination where applicable, and driving licence tests. Applicants must pass the traffic signs test and practical driving test where required. After successfully completing the process and paying the applicable fee, your driving licence will be processed by the licensing authority. Always confirm the latest requirements and fees through the official government portal before applying.",
        image: howToGetRegularKpkImg,
      },
    ],
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
    faqTitle:
      "Frequently Asked Questions About Khyber Pakhtunkhwa Driving Licence",
    faqs: [
      {
        question:
          "How can I apply for a learner driving licence online in Khyber Pakhtunkhwa?",
        answer:
          "You can apply through the official KP Dastak app. Register using your CNIC and mobile number, select the Learner Permit service, complete the application form, upload the required CNIC copy and pay the applicable fee online. You can track your application through the available digital services.",
      },
      {
        question:
          "What is the minimum age to get a learner driving licence in Khyber Pakhtunkhwa?",
        answer:
          "The minimum age for a motorcycle or motorcar learner permit is generally 18 years. Commercial vehicle categories may have higher age requirements. Applicants should confirm the eligibility criteria for their selected vehicle category before applying.",
      },
      {
        question:
          "What documents are required for a learner driving licence in KP?",
        answer:
          "Applicants generally need a valid CNIC, a registered mobile number and the documents requested during the application process. A medical certificate from an authorised medical practitioner may also be required, depending on the licence category and applicable requirements.",
      },
      {
        question:
          "How much is the learner driving licence fee in Khyber Pakhtunkhwa?",
        answer:
          "The learner permit fee listed by Peshawar Traffic Police is PKR 1,000. Additional charges may apply for medical examinations, tests and licence cards. Fees can vary by service or location, so check the latest amount through the official KP Dastak app or your relevant licensing branch.",
      },
      {
        question:
          "How long does a learner driving permit take to mature in KP?",
        answer:
          "According to Peshawar Traffic Police, a learner permit matures after 45 days. Applicants can then visit the relevant driving licence branch and proceed with the regular driving licence process.",
      },
      {
        question:
          "How can I get a permanent driving licence in Khyber Pakhtunkhwa?",
        answer:
          "After completing the 45-day learner period, apply for a permanent driving licence through the KP Dastak app or the relevant licensing branch. Submit the required documents, complete the applicable medical and driving tests, and pay the prescribed fee. You must pass the required tests to obtain your licence.",
      },
      {
        question:
          "What tests are required for a permanent driving licence in KP?",
        answer:
          "Applicants generally need to pass a traffic signs test and a practical driving test. The licensing authority may also conduct the required medical or fitness examination before issuing the licence.",
      },
      {
        question:
          "Can I renew my driving licence online in Khyber Pakhtunkhwa?",
        answer:
          "Yes. The KP Transport Department lists existing driving licence renewal as an online service through the Dastak app. Follow the application instructions, upload the required documents and pay the applicable renewal fee.",
      },
      {
        question:
          "How can I check or verify my driving licence online in KP?",
        answer:
          "You can use the official KP digital driving licence services to check your application status and access licence verification. Follow the portal instructions and provide the required licence or CNIC information to view the available record.",
      },
      {
        question:
          "Can I apply for a duplicate driving licence in Khyber Pakhtunkhwa?",
        answer:
          "Yes. The KP Dastak app provides a duplicate driving licence application service. Follow the official instructions and submit the required documents. If your licence has been lost or stolen, you may also need to provide a police report or Roznamcha, as required by the licensing authority.",
      },
    ],
    actionLinks: [
      {
        key: "learner",
        label: "Apply for Learner Licence",
        url: "https://ecitizen.kp.gov.pk/",
        note: "Apply via KP Dastak / eCitizen",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://ecitizen.kp.gov.pk/",
        note: "Permanent licence via KP Dastak",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://ecitizen.kp.gov.pk/",
        note: "Verify Driving License on KP Dastak",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://ecitizen.kp.gov.pk/",
        note: "Renew via KP Dastak / eCitizen",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://ecitizen.kp.gov.pk/",
        note: "Track with Application ID + CNIC",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://www.transport.kp.gov.pk/DL.html",
        note: "Transport KP Driving License page",
      },
    ],
    officialPortalUrl: "https://www.transport.kp.gov.pk/DL.html",
    sourceUrls: [
      "https://www.transport.kp.gov.pk/DL.html",
      "https://ecitizen.kp.gov.pk/",
    ],
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
        url: "https://dlims.islamabadpolice.gov.pk/register",
        note: "Register then apply on ITP-DLIMS",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://dlims.islamabadpolice.gov.pk/login",
        note: "Sign in to ITP-DLIMS for licence services",
      },
      {
        key: "verify",
        label: "Verify Driving Licence",
        url: "https://dlims.islamabadpolice.gov.pk/verify-license-information",
        note: "Official ITP licence verification",
      },
      {
        key: "renew",
        label: "Renew Licence",
        url: "https://dlims.islamabadpolice.gov.pk/login",
        note: "Learner / License Renewal on ITP-DLIMS",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://dlims.islamabadpolice.gov.pk/login",
        note: "Sign in to track on ITP-DLIMS",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://dlims.islamabadpolice.gov.pk/",
        note: "Islamabad Traffic Police DLIMS",
      },
    ],
    officialPortalUrl: "https://dlims.islamabadpolice.gov.pk/",
    sourceUrls: [
      "https://dlims.islamabadpolice.gov.pk/",
      "https://dlims.islamabadpolice.gov.pk/verify-license-information",
      "https://dlims.islamabadpolice.gov.pk/register",
      "https://dlims.islamabadpolice.gov.pk/login",
    ],
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
        url: "https://qtp.gob.pk/onlineappointment",
        note: "Book Learners Driving License appointment",
      },
      {
        key: "permanent",
        label: "Apply for Permanent Licence",
        url: "https://qtp.gob.pk/onlineappointment",
        note: "Book Permanent Driving License appointment",
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
        url: "https://qtp.gob.pk/onlineappointment",
        note: "Book appointment / confirm at QTP counter",
      },
      {
        key: "track",
        label: "Track Application",
        url: "https://qtp.gob.pk/onlineappointment",
        note: "Download / check appointment confirmation",
      },
      {
        key: "portal",
        label: "Visit Official Portal",
        url: "https://qtp.gob.pk/",
        note: "Quetta Traffic Police",
      },
    ],
    officialPortalUrl: "https://qtp.gob.pk/",
    sourceUrls: [
      "https://qtp.gob.pk/",
      "https://qtp.gob.pk/driving",
      "https://qtp.gob.pk/onlineappointment",
    ],
    seoTitle: "Balochistan Driving Licence | Quetta Traffic Police Guide – Sello.pk",
    seoDescription:
      "Balochistan driving licence guide: book Quetta Traffic Police appointments, understand learner/permanent steps, and verify licences on official QTP channels.",
    lastVerifiedAt: VERIFIED_AT,
    isPublished: true,
  },
];

export const getGuideBySlug = (slug) =>
  DRIVING_LICENCE_GUIDES.find((g) => g.slug === slug) || null;

