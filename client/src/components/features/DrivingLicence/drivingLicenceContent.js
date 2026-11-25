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
import howToApplyLearnerIslamabadImg from "../../../assets/images/How to Apply for a Learner Driving Licence in Islamabad.jpeg";
import howToGetRegularIslamabadImg from "../../../assets/images/How to Get a Regular Driving Licence in Islamabad.jpeg";
import howToGetRegularBalochistanImg from "../../../assets/images/How to Get a Regular Driving Licence in Balochistan.jpeg";

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
    title: "Choose Your Province",
    desc: "Open up the Sello guide for the province or territory in which you are applying.",
  },
  {
    step: "02",
    title: "Read the Process First",
    desc: "Understand the processes for learner and permanent licenses, renewal procedures, document requirements, fee structures and also the common questions.",
  },
  {
    step: "03",
    title: "Continue on the Official Portal",
    desc: "Use the action buttons present in the related provincial guide to apply, renew, track or verify your licence through the government website.",
  },
  {
    step: "04",
    title: "Keep Your Records Safe",
    desc: "Save your payment records, appointment slips and digital versions of your documents. Also do not share your CNIC or license details via unofficial forms.",
  },
];

export const WHAT_YOU_CAN_DO = [
  {
    title: "Apply for a Learner Licence",
    desc: "In your province’s case study the learner permit requirements, get your documents in order and then on to the application or appointment system.",
  },
  {
    title: "Apply for a Permanent Licence",
    desc: "Check your eligibility once the required learner period is complete. As for the documentation and which test to take, follow the appropriate procedure.",
  },
  {
    title: "Renew an Existing Licence",
    desc: "Find out how online renewal of driving licenses in Punjab and in other regions works. Before you go to the relevant government portal do a review of the renewal requirements.",
  },
  {
    title: "Verify or Track Your Licence",
    desc: "Use of official verification and application tracking tools for licence info. Sello takes you to the right portal which doesn’t collect your personal details.",
  },
];

export const PREPARATION_CHECKLIST = [
  "Valid CNIC: Keep your original CNIC and digital copies of them available for online applications.",
  "Recent Photograph: Prepare a recent photo that is in the proper background, size and format for the given portal.",
  "Payment Access: Prepare to use online banking or supported mobile banking services for official PSID and 1Bill payments as required.",
  "Registered mobile number and email for OTP / account recovery",
  "Banking or mobile-wallet access for official PSID / 1Bill payments",
  "Existing learner or permanent licence details for renewal or upgrade",
];

export const OFFICIAL_VERIFICATION_SECTION = {
  title: "Access Official Driving Licence Verification Services in Pakistan",
  summary:
    "Check your driving licence through the official portal for the province or territory that issued it. Sello helps you find the right authority and never asks for your CNIC or licence number.",
  points: [
    "Each province runs its own licensing and verification system.",
    "Use the issuing authority’s website for licence checks, payments and tracking.",
    "Punjab drivers use DLIMS; Sindh drivers use the DLS verification service.",
  ],
  details:
    "Choose a province above to see its official portal, document checklist and step-by-step guide. Sello currently covers Punjab, Sindh, Khyber Pakhtunkhwa, Islamabad and Balochistan. For Azad Jammu and Kashmir or Gilgit-Baltistan, use the licensing service listed by your regional government. Enter personal details only on the official government website, and keep your application or payment reference for follow-up.",
};

export const VERIFY_ONLINE_SECTION = {
  title: "How to Check and Verify Your Driving Licence Online in Pakistan",
  summary:
    "An online check shows the record held by the authority that issued your licence. The exact steps vary by region, but the process is usually the same.",
  points: [
    "Confirm which province or territory issued your licence.",
    "Open the matching Sello guide to find the official portal.",
    "Enter your CNIC, licence number or application reference only on the government website.",
    "Review the licence details and validity shown by the authority.",
  ],
  details:
    "Online Punjab driving licence checks, KPK licence verification and Islamabad driving licence checks are handled on separate government systems. Follow the instructions on the official portal and save your reference number in case you need to contact the issuing office.",
};

export const LANDING_FAQS = [
  {
    question: "How can I verify my driving licence online in Pakistan?",
    answer:
      "You can verify your driving licence through the official online portal of the province or territory that issued it. Select the relevant licensing authority, enter the required information, such as your CNIC or licence number, and follow the verification instructions.",
    q: "How can I verify my driving licence online in Pakistan?",
    a: "You can verify your driving licence through the official online portal of the province or territory that issued it. Select the relevant licensing authority, enter the required information, such as your CNIC or licence number, and follow the verification instructions.",
  },
  {
    question: "Is there one driving licence verification website for all of Pakistan?",
    answer:
      "No. Pakistan does not have one universal public driving licence verification portal. Punjab, Sindh, Islamabad, Khyber Pakhtunkhwa, Balochistan, Azad Jammu & Kashmir and Gilgit-Baltistan have separate systems, so use the portal for the authority that issued your licence.",
    q: "Is there one driving licence verification website for all of Pakistan?",
    a: "No. Pakistan does not have one universal public driving licence verification portal. Punjab, Sindh, Islamabad, Khyber Pakhtunkhwa, Balochistan, Azad Jammu & Kashmir and Gilgit-Baltistan have separate systems, so use the portal for the authority that issued your licence.",
  },
  {
    question: "Which portal should I use to verify my licence?",
    answer:
      "Use the official portal of the province or territory that issued your licence. A licence issued in Punjab, for example, is checked on the Punjab DLIMS service, while a Sindh licence is checked through the Sindh DLS service.",
    q: "Which portal should I use to verify my licence?",
    a: "Use the official portal of the province or territory that issued your licence. A licence issued in Punjab, for example, is checked on the Punjab DLIMS service, while a Sindh licence is checked through the Sindh DLS service.",
  },
  {
    question: "Can I check my driving licence using my CNIC number?",
    answer:
      "Yes in some provinces you can do CNIC based searches. In others you may also put in your licence or permit number. Follow the instructions on the relevant official site.",
    q: "Can I check my driving licence using my CNIC number?",
    a: "Yes in some provinces you can do CNIC based searches. In others you may also put in your licence or permit number. Follow the instructions on the relevant official site.",
  },
  {
    question: "How can I track my driving licence application?",
    answer:
      "Use the issuing authority’s application tracking service. For example in Punjab you can use DLIMS 2.0 and Dastak for tracking, other regions have different processes.",
    q: "How can I track my driving licence application?",
    a: "Use the issuing authority’s application tracking service. For example in Punjab you can use DLIMS 2.0 and Dastak for tracking, other regions have different processes.",
  },
  {
    question: "Can I check my driving licence by SMS?",
    answer:
      "SMS verification is at the discretion of the issuing authority. Go to your province’s website or reach out to the traffic police department to determine if SMS service is available.",
    q: "Can I check my driving licence by SMS?",
    a: "SMS verification is at the discretion of the issuing authority. Go to your province’s website or reach out to the traffic police department to determine if SMS service is available.",
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

// Content supplied specifically for the Punjab detail page.
const PUNJAB_DETAIL_GUIDE = {
    "slug": "punjab",
    "name": "Punjab",
    "order": 1,
    "seoTitle": "Punjab Driving Licence Check Online – DLIMS Verification & Tracking",
    "seoDescription": "Find out how to apply, renew, verify and track your driving licence in Punjab. You can also view your e-driving licence through DLIMS 2.0.",
    "exactTitle": true,
    "shortDescription": "If you need to check your driving licence in Punjab, Sello can help. Learn how to apply for a learner permit, permanent driving licence, renew your licence, verify and track your application via the Punjab DLIMS 2.0.\nThe services offered are linked to the Dastak portal run by the Government of Punjab. Please see below for instructions on Sello. When you're ready you can view the official government site.\nSello never asks for your CNIC or driving licence number on this page.",
    "heroCopyComplete": true,
    "authorityName": "Punjab DLIMS 2.0 / Dastak",
    "aboutTitle": "Punjab DLIMS 2.0 – Driving License Information Management System",
    "introduction": "Punjab residents can use the Driving License Information Management System (DLIMS 2.0) to apply for learner permits, permanent licences, renewals, payments, verification and track their application.\nThis service is linked to the Dastak one stop shop run by the Government of Punjab. Apply for your licence using the available online services. Create your payment reference and track your application.\nThe official site can also be used to check your licence online, verify and view your digital licence. If you've used DLIMS before, follow the official instructions to connect your previous records to Dastak.",
    "importantInformation": [
        "Sello only provides guidance. Applications must be made via government services.",
        "We will not collect any CNIC or Licence Numbers.",
        "Fees and documents vary depending on what service you apply for.",
        "Always check the latest requirements on the official site."
    ],
    "lastVerifiedAt": "2026-11-11",
    "officialPortalUrl": "https://dlims.punjab.gov.pk/",
    "sourceUrls": [
        "https://dlims.punjab.gov.pk/",
        "https://dastak.punjab.gov.pk/",
        "https://dlims.punjab.gov.pk/verify",
        "https://dlims.punjab.gov.pk/track"
    ],
    "isPublished": true,
    "actionsDescription": "These links will take you away from Sello to the official Punjab Government services. Here you can apply, pay, verify and view your licences.",
    "processTitle": "Punjab Driving Licence Process Guide",
    "processDescription": "Expand each section to see what you need to do. Then visit the official government service.",
    "faqTitle": "Frequently Asked Questions About Punjab Driving Licence",
    "otherProvincesDescription": "Looking for driving licence services outside Punjab? Open another province guide to find its relevant instructions and official government portal.",
    "disclaimer": "Sello.pk publishes driving licence information and guidance only. Licence applications, payments, driving tests, renewals and verification are handled exclusively through official government portals. Always confirm current fees, eligibility, ages and document requirements on the live official website before applying.",
    "overviewSections": [
        {
            "title": "How to Apply for a Learner Driving Licence in Punjab",
            "content": "If you plan on driving a car or motorbike in Punjab it is important to have a learners permit. To start this process online, use the official DLIMS services.\nCreate an account or login to the official site. Choose the learner licence service. Complete the form and upload your documents such as your photo and CNIC scans. Create your PSID and pay the required fee.\nOnce you have successfully applied and paid for your licence you will receive your digital learner licence. Whilst learning to drive, ensure you follow the conditions of your learner licence and traffic rules.",
            "ctaLabel": "Apply for Learner Licence",
            "ctaUrl": "https://dastak.punjab.gov.pk/",
            "image": howToApplyLearnerPunjabImg
        },
        {
            "title": "How to Get a Regular Driving Licence in Punjab",
            "content": "Once you have completed the required learners period, you can apply for your permanent licence.\nYou may need to attend a licensing centre to complete your driving and traffic tests. Once you have passed your tests and paid the required amount your application will be processed.\nAlways check the latest requirements for tests, fees and application process on the official Punjab DLIMS site.",
            "ctaLabel": "View Permanent Licence Services",
            "ctaUrl": "https://dastak.punjab.gov.pk/",
            "image": howToGetRegularPunjabImg
        }
    ],
    "learnerProcedure": [
        "Visit the official Punjab DLIMS or Dastak site.",
        "Create an account or login.",
        "Choose the learner licence application.",
        "Complete the form with accurate information.",
        "Upload your requested photo and CNIC documents.",
        "Create your PSID and pay using an approved payment method.",
        "Once processed you will receive your digital learner licence."
    ],
    "permanentProcedure": [
        "Complete your learners period.",
        "Ensure you meet the requirements for your vehicle type.",
        "Have your original CNIC and valid learner licence ready."
    ],
    "renewalProcedure": [
        "Use the official Dastak site to renew your licence online. Login and choose the permanent licence renewal. Enter the requested information and upload your supporting documents.",
        "Ensure you know when your licence expires and what the required fee is."
    ],
    "verificationGuide": [
        "To verify your licence using DLIMS Punjab visit the official DLIMS verification page. Follow the instructions and enter the requested information.",
        "Always complete the traffic police Punjab licence verification using an official service."
    ],
    "requiredDocuments": [
        "Common documents needed:",
        "Original CNIC with clear front and back scans.",
        "Recent photo or live photo.",
        "Existing learner licence.",
        "Medical certificate if required.",
        "Any additional documents requested."
    ],
    "ageRequirements": [
        "The minimum age will vary depending on the vehicle type. Commonly it is 18 for motorbike and motorcar learner licences and 21 for LTV. Always check the latest requirements to ensure you meet the criteria."
    ],
    "feesAndPayment": [
        "The driving licence fee will vary depending on the licence type. View the official DLIMS fee guide to see what the charge is for your category. The Dastak site will show you what the service and platform fee is.",
        "Create your PSID and pay using an approved payment method. Do not use outdated fees."
    ],
    "drivingTestGuidelines": [
        "If you are applying for a permanent licence you must follow the testing requirements.",
        "The exact process will vary depending on what licence you are applying for."
    ],
    "trackingInstructions": [
        "To check your licence status in Punjab use the official tracking service or your Dastak account.",
        "Login to the official Dastak or DLIMS site.",
        "Login using your account.",
        "Select the application tracking option.",
        "Enter the requested information.",
        "View your application status.",
        "Your driving licence tracking number Punjab or application number may be useful to refer back to. Ensure you keep your payment receipt safe."
    ],
    "actionLinks": [
        {
            "key": "learner",
            "label": "Apply for Learner Licence",
            "url": "https://dastak.punjab.gov.pk/",
            "note": "Start applying for your learner licence online via Punjab DLIMS services on the Dastak site. Fill out the application and upload the necessary documents.",
            "ctaLabel": "Continue to Dastak"
        },
        {
            "key": "permanent",
            "label": "Apply for Permanent Licence",
            "url": "https://dastak.punjab.gov.pk/",
            "note": "Find out what you need to do to obtain your permanent licence. Follow the official instructions for your vehicle type.",
            "ctaLabel": "Continue to Licence Services"
        },
        {
            "key": "verify",
            "label": "Verify Driving Licence",
            "url": "https://dlims.punjab.gov.pk/verify",
            "note": "Use the official verification service to check your licence.",
            "ctaLabel": "Continue to Verification"
        },
        {
            "key": "renew",
            "label": "Renew Licence",
            "url": "https://dastak.punjab.gov.pk/",
            "note": "Renew your licence using the official renewal service. Please ensure you have the correct documents and fees required.",
            "ctaLabel": "Continue to Renewal"
        },
        {
            "key": "track",
            "label": "Track Application",
            "url": "https://dlims.punjab.gov.pk/track",
            "note": "Check the status of your application using the official tracking service. View the latest updates.",
            "ctaLabel": "Continue to Tracking"
        },
        {
            "key": "portal",
            "label": "Visit Official Portal",
            "url": "https://dlims.punjab.gov.pk/",
            "note": "View the Punjab DLIMS 2.0 service to access the services available.",
            "ctaLabel": "Open Official Portal"
        }
    ],
    "faqs": [
        {
            "question": "How do I verify my driving licence on DLIMS Punjab?",
            "answer": "Go to the official DLIMS verification page and follow the prompts and add the required information. This will allow you to View your records."
        },
        {
            "question": "How can I track my driving licence in Punjab?",
            "answer": "Log in to your Dastak account . This will allow you to View your application."
        },
        {
            "question": "How do I download my e-licence?",
            "answer": "Go to the official Dastak/DLIMS website. Follow the prompts to verify your licence and add the required information."
        },
        {
            "question": "Can I renew my driving licence online in Punjab?",
            "answer": "Yes. Punjab residents can access online renewal services through Dastak. Sign in, select the renewal service, provide the required information and complete the official payment process."
        },
        {
            "question": "How long is a Punjab driving licence valid?",
            "answer": "Validity depends on the licence type and category. A learner permit is generally valid for six months (180 days). For a regular licence, check the expiry date printed on your licence or displayed through the official DLIMS record."
        }
    ],
    "otherProvinceCards": {
        "sindh": {
            "description": "Explore learner, permanent, renewal and International Driving Permit services through Sindh Police DLS Online.",
            "ctaLabel": "Explore Sindh Guide"
        },
        "kpk": {
            "description": "Find information about learner, permanent, renewal and verification services through the Khyber Pakhtunkhwa Transport Department and available digital platforms.",
            "ctaLabel": "Explore KPK Guide"
        },
        "islamabad": {
            "description": "Access Islamabad Traffic Police driving licence information, including online verification, learner permits and renewal services.",
            "ctaLabel": "Explore Islamabad Guide"
        },
        "balochistan": {
            "description": "Find guidance about driving licence appointments, verification and other licensing services through Balochistan Traffic Police.",
            "ctaLabel": "Explore Balochistan Guide"
        }
    }
};

export const DRIVING_LICENCE_GUIDES = [
  {
    slug: "punjab",
    name: "Punjab",
    order: 1,
    shortDescription:
      "Explore learner permits, permanent licences, renewals, application tracking and DLIMS license verification through the Punjab DLIMS 2.0 and Dastak.",
    authorityName:
      "Punjab DLIMS (Driving License Information Management System)",
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
        question: "How can I apply for a driving licence in Punjab, Pakistan?",
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
        question: "How much does a learner driving licence cost in Punjab?",
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
    seoTitle:
      "Punjab Driving Licence Online | DLIMS Apply, Renew & Verify – Sello.pk",
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
      "Find out what you can for learner, permanent and renewal services at Sindh Police Driving Licence Services (DLS Online). Get info on online driving license check Sindh and licence verification",
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
        question: "How much is the learner driving licence fee in Sindh?",
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
        question: "Can I renew or track my driving licence online in Sindh?",
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
    seoTitle:
      "Sindh Driving Licence Online | DLS Apply, Renew & Verify – Sello.pk",
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
      "Understand the learner, permanent, renewal and tracking processes through Khyber Pakhtunkhwa Transport Department and its digital services.",
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
        question: "How can I check or verify my driving licence online in KP?",
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
    seoTitle:
      "KPK Driving Licence Online | Apply & Renew via Dastak – Sello.pk",
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
      "Access to Islamabad Traffic Police info which includes issuance of learner permits, renewal processes and online application options. Also find out about driving license online check procedures.",
    authorityName: "Islamabad Traffic Police — ITP-DLIMS",
    overviewSections: [
      {
        title: "How to Apply for a Learner Driving Licence in Islamabad",
        content:
          "If you want to drive a car or motorcycle in Islamabad, Pakistan, the first step is to obtain a learner driving permit. Visit the official Islamabad Traffic Police Driving Licence portal and open the Online Learner Permit service. Register and complete the online application by providing the required personal information and uploading the necessary documents, including your CNIC and photograph. Follow the portal instructions to complete the payment process. Once your application is processed, download your learner permit from the official system. Always check the latest eligibility requirements and learner permit conditions before applying.",
        image: howToApplyLearnerIslamabadImg,
      },
      {
        title: "How to Get a Regular Driving Licence in Islamabad",
        content:
          "After obtaining your learner driving permit and completing the required waiting period, you can apply for a regular driving licence in Islamabad. Applicants for a motorcycle or motorcar licence generally need to be at least 18 years old. Visit the designated Islamabad Traffic Police licensing centre with your original CNIC and learner permit. Complete the required medical examination, traffic signs or theoretical test, and practical driving test. After successfully passing the required tests and paying the applicable fee, your driving licence will be processed by the licensing authority. Always confirm the latest requirements and fees through the official Islamabad Traffic Police website before visiting.",
        image: howToGetRegularIslamabadImg,
      },
    ],
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
    faqTitle: "Frequently Asked Questions About Islamabad Driving Licence",
    faqs: [
      {
        question:
          "How can I apply for a learner driving licence online in Islamabad?",
        answer:
          "You can apply through the official Islamabad Traffic Police Driving Licence portal. Register on the website, select the Online Learner Permit service, enter the required information, upload the requested documents and complete the payment process. Follow the portal instructions to download your learner permit after processing.",
      },
      {
        question:
          "What is the minimum age to get a learner driving licence in Islamabad?",
        answer:
          "The minimum age for a motorcycle or motorcar learner permit is 18 years. Applicants seeking an LTV licence generally need to be at least 21 years old. Other commercial categories may have additional age and experience requirements.",
      },
      {
        question:
          "What documents are required for a learner driving licence in Islamabad?",
        answer:
          "Applicants generally need a valid CNIC and a recent photograph. You should upload clear copies of the documents requested by the online portal. Additional medical documentation may be required depending on your age or vehicle category.",
      },
      {
        question: "How much is the learner driving licence fee in Islamabad?",
        answer:
          "The fee depends on the selected vehicle category and the current Islamabad Traffic Police fee schedule. Check the amount displayed on the official online application portal before making payment.",
      },
      {
        question: "How long is a learner driving permit valid in Islamabad?",
        answer:
          "A learner driving permit is generally valid for six months. Check the expiry date printed on your permit and complete the regular driving licence process within its validity period.",
      },
      {
        question:
          "How many days after getting a learner permit can I apply for a regular driving licence in Islamabad?",
        answer:
          "The normal waiting period is 42 days after the learner permit is issued. However, Islamabad Traffic Police guidance allows this period to be waived in certain cases for applicants who already hold a valid driving licence from another district of Pakistan or a foreign country, subject to approval.",
      },
      {
        question:
          "What tests are required to get a regular driving licence in Islamabad?",
        answer:
          "Applicants generally need to complete a medical or vision examination, a traffic signs or theoretical test and a practical driving test. The licensing authority must confirm that the applicant meets the required standards before issuing a regular licence.",
      },
      {
        question: "Can I renew my driving licence online in Islamabad?",
        answer:
          "Yes. Islamabad Traffic Police provides an online renewal facility through its official Driving Licence portal. Register or log in, submit the requested information and documents, pay the applicable fee and follow the delivery instructions. Renewed licences are delivered through courier service under the online service arrangement.",
      },
      {
        question: "How can I verify my driving licence online in Islamabad?",
        answer:
          "Visit the official Islamabad Police website and select Driving License Verification. Enter the required licence information according to the portal instructions to check the available record.",
      },
      {
        question:
          "Can I apply for a duplicate driving licence online in Islamabad?",
        answer:
          "Yes. Islamabad Traffic Police provides an online duplicate licence application facility. Submit the required information and documents through the official portal, pay the applicable fee and follow the courier delivery instructions. Make sure your name, residential address and mobile number are entered correctly.",
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
      "Find out about driving license appointments, verification and other services at the appropriate Balochistan Traffic Police licensing facilities.",
    authorityName: "Quetta Traffic Police / Balochistan Traffic Police",
    overviewSections: [
      {
        title: "How to Get a Regular Driving Licence in Balochistan",
        content:
          "After obtaining your learner driving licence and completing the required waiting period, you can apply for a regular driving licence in Balochistan. According to the published Quetta Traffic Police procedure, you must hold your learner permit for at least six weeks before applying for a permanent licence. Visit the relevant driving licence branch with your original learner permit, CNIC, recent passport-size photographs, required medical certificate and fee payment documents. Complete the prescribed driving test to demonstrate your knowledge of traffic rules and your ability to operate the selected vehicle safely. After successfully passing the test and completing the required formalities, your regular driving licence will be processed by the licensing authority.",
        image: howToGetRegularBalochistanImg,
      },
    ],
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
    faqTitle: "Frequently Asked Questions – Balochistan Driving Licence Guide",
    faqs: [
      {
        question: "How can I apply for a driving licence in Balochistan?",
        answer:
          "Visit the official Quetta Traffic Police website and use its online appointment service, where available. Select the relevant licence service and book an appointment. Visit the designated licensing branch with your required documents to complete the application process.",
      },
      {
        question:
          "What is the minimum age for a driving licence in Balochistan?",
        answer: `The general minimum age requirements are:

• Motorcycle and motorcar: 18 years
• Light Transport Vehicle (LTV): 21 years
• Heavy Transport Vehicle (HTV): 22 years

Always confirm the applicable category requirements with the licensing authority.`,
      },
      {
        question:
          "What documents are required for a driving licence in Balochistan?",
        answer: `Commonly required documents include:

• Original CNIC and an attested copy
• Recent passport-size photographs
• Medical fitness certificate, where required
• Valid learner permit for a regular licence
• Relevant application form and fee ticket

Additional documents may be required depending on the licence category.`,
      },
      {
        question: "How much is the learner driving licence fee in Balochistan?",
        answer:
          "Quetta Traffic Police information lists a Rs. 20 ticket for the learner application. Fees and requirements may change, so confirm the latest amount with the relevant licensing branch before applying.",
      },
      {
        question: "How long is a learner driving licence valid in Balochistan?",
        answer:
          "A learner driving licence is generally valid for six months. Check the expiry date printed on your permit and follow the licensing authority’s instructions.",
      },
      {
        question:
          "How long after getting a learner permit can I apply for a regular driving licence?",
        answer:
          "According to the Quetta Traffic Police guidance, applicants can apply for a regular driving licence after holding their learner permit for at least six weeks. Confirm the required waiting period with your local licensing branch.",
      },
      {
        question:
          "Is a driving test required for a regular licence in Balochistan?",
        answer:
          "Yes. Applicants are generally required to pass the applicable driving test and demonstrate knowledge of traffic signs and road rules. The exact test requirements depend on the vehicle category.",
      },
      {
        question:
          "Can I book a driving licence appointment online in Balochistan?",
        answer:
          "Quetta Traffic Police provides an online appointment facility through its official website. Applicants should check the available branches, appointment types and time slots before visiting.",
      },
      {
        question: "How can I verify my Balochistan driving licence online?",
        answer:
          "Visit the official Quetta Traffic Police website and open its Driving Licence Verification service. Follow the instructions and enter your CNIC details to check the available licence record.",
      },
      {
        question:
          "Can I renew or get a duplicate driving licence in Balochistan?",
        answer:
          "Yes. Quetta Traffic Police provides renewal and duplicate licence application services. Applicants should download or obtain the relevant form and confirm the required documents, fees and procedure with the licensing authority.",
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
    seoTitle:
      "Balochistan Driving Licence | Quetta Traffic Police Guide – Sello.pk",
    seoDescription:
      "Balochistan driving licence guide: book Quetta Traffic Police appointments, understand learner/permanent steps, and verify licences on official QTP channels.",
    lastVerifiedAt: VERIFIED_AT,
    isPublished: true,
  },
];

// KPK replacement copy is used only by its detail route, never the landing cards.
const KPK_BASE_GUIDE = DRIVING_LICENCE_GUIDES.find(guide => guide.slug === "kpk");
const KPK_DETAIL_GUIDE = {
  ...KPK_BASE_GUIDE,
  ...{
  "seoTitle": "KPK Driving License Verification Online | DLIMS KPK Guide",
  "seoDescription": "Verify your KPK driving license online, track applications and see how to apply for a license, renew or get a learner permit through official KP services.",
  "exactTitle": true,
  "shortDescription": "In Khyber Pakhtunkhwa get info for learner permits, permanent licenses, renewals and application tracking. Use the official KP Transport Department and Dastak services to apply and manage your driving licence.\n\nReady to go? Visit the government portal. Sello provides guidance only and we do not ask you to enter your CNIC or licence number on this page.",
  "heroCopyComplete": true,
  "actionsTitle": "Official KPK Driving Licence Actions",
  "actionsDescription": "These actions take you away from Sello to government offices. Applications, payments, verification and license records are managed by the relevant authorities.",
  "aboutTitle": "About KPK Driving Licences",
  "introduction": "The Khyber Pakhtunkhwa Transport Department is the body which provides digital driving license services via the provincial Dastak system. We have learner permits, new permanent licences, renewals, duplicate licences and application tracking available.\n\nFor driving license verification at KPK use the official verification which we recommend over the unofficial sites. The department has put in place a system which requests for your license or registration number and CNIC info.\n\nSello. Pk has put out guidance that goes so Applications, payments, tests and licence records are run through government services. Do not use Punjab or Sindh licence portals for KPK applications.",
  "lastVerifiedAt": "2026-11-13",
  "officialChannelLabel": "KP Transport Department / KP Dastak",
  "portalCtaLabel": "Open Official KP Driving Licence Portal",
  "processTitle": "KPK Driving Licence Process Guide",
  "processDescription": "Expand out each section on the published page for step by step guidance.",
  "faqTitle": "Frequently Asked Questions About KPK Driving Licences",
  "disclaimer": "Sello.pk reports general info and guidance only. For license applications, payments, tests, tracking and verification you must use government services. Requirements, fees and service availability may change. Before you apply or pay, check the latest info at the official KP Transport Department portal.",
  "learnerProcedure": [
    "Open the official KP Transport Department driver’s license page.",
    "Download and access the official KP Dastak app as per the instructions.",
    "Register with your CNIC and mobile number.",
    "Select the Learner Permit service.",
    "Fill out the required info and upload your CNIC copy.",
    "Pay through the available payment method.",
    "Submit your application and follow the portal’s instructions for the permit."
  ],
  "permanentProcedure": [
    "After completion of the required learner period, enroll in the permanent licence service through KP Dastak. Provide the requested information, upload supporting documents and complete any required biometric, medical or appointment based steps.",
    "Follow the traffic signs as you go and for the practical driving tests. Your licence will be issued once we have your payment and completed requirements."
  ],
  "renewalProcedure": [
    "To renew your KPK driving license go to the official KP Dastak service and choose the renewal option. Put in your present license info, provide the requested documents and finish the payment process.",
    "If your license has expired for a while see what the licensing authority has put in place for additional charges, tests or application requirements."
  ],
  "verificationGuide": [
    "Visit the official KP Transport licence verification page to check your driving licence.",
    "The service is asking for your license or tracking number and CNIC without dashes.",
    "Submit these details only at the official government site.",
    "For Peshawar driving license verification or LTV license check in KPK use the same official process which will have the relevant license info if it is available."
  ],
  "requiredDocuments": [
    "The KPK issue of driving licenses is a function of the type of license and stage of application. As for what is usually asked for include:",
    "Valid CNIC.",
    "CNIC copy or digital identity verification.",
    "Recent photograph, where requested.",
    "Present learner permit for permanent license.",
    "Medical report or health assessment where applicable.",
    "For past licence information related to renewal or duplicate applications.",
    "Check out the live application service for the full document list."
  ],
  "ageRequirements": [
    "The age requirement varies by vehicle type and license type. For motorcycle and private car licenses you are usually required to be at 18 years of age or over. For commercial licenses there may be greater age, experience and medical requirements. Check with the relevant licensing body to confirm your eligibility."
  ],
  "feesAndPayment": [
    "In KPK the driving license fee depends on the license category, service and validity period. For learner, permanent, renewal, duplicate and international permit services there may be different charges.",
    "Check the present amount as displayed by KP Dastak or the official Transport Department before making payment. Do not base it on old fee lists or pay to unofficial agents."
  ],
  "drivingTestGuidelines": [
    "Prepare for the traffic signs test by studying up on road signs, speed limits, road markings and right of way rules. Also spend time with a qualified instructor on the road practicing turning, reversing and parking.",
    "Follow the proctor’s instructions and before the test make sure to go over the safety rules."
  ],
  "trackingInstructions": [
    "Use the tracking feature in KP Dastak or the official government system. Fill out your application as requested to check progress.",
    "For your driving license application or tracking ID with KPK keep safe. In the case of delayed status or rejection of application, go over the reason and approach the relevant department for help."
  ],
  "faqs": [
    {
      "question": "How can I verify my driving licence online in KPK?",
      "answer": "Visit the KP Transport’s verification page. Fill in your license or tracking number and CNIC as asked to authenticate your license."
    },
    {
      "question": "What is the minimum age to get a learner driving licence in KPK?",
      "answer": "The age to get a private motorcycle or motorcar learner permit is at 18. For commercial categories this may be different."
    },
    {
      "question": "What documents do I need for a learner permit in KPK?",
      "answer": "A valid CNIC and CNIC copy are usually required. The official may also ask for a photo, health information or other documents based on your category."
    },
    {
      "question": "How long after a learner permit can I apply for a permanent driving licence?",
      "answer": "Learner permits usually mature at 45 days for the typical learner to permanent process. Check the exact period for your category with the licensing authority."
    },
    {
      "question": "How do I renew my driving licence in KPK?",
      "answer": "Go to the official KP Transport Department driving licence site and follow the KP Dastak renewal instructions. Input your present licence info, upload the required documents and pay the fee."
    }
  ],
  "otherProvincesDescription": "Visit another province page and go to that region’s site.",
  "otherProvinceCards": {
    "punjab": {
      "description": "Apply, renew and verify through DLIMS 2.0."
    },
    "sindh": {
      "description": "In Learner, permanent, renewal and IDP services through Sindh DLIMS 2.0."
    },
    "islamabad": {
      "description": "Get to Islamabad Traffic Police for driving license services."
    },
    "balochistan": {
      "description": "Find out local driver’s license and appointment info from the appropriate traffic police authority."
    }
  },
  "provinceNavigationDescriptions": {
    "Punjab": "Apply, renew and verify through Punjab DLIMS 2.0  Dastak.",
    "Sindh": "Access to learner, permanent, renewal and verification services provided by Sindh Police.",
    "Khyber Pakhtunkhwa": "Explore student, permanent, renewal and tracking services.",
    "Islamabad": "Get to Islamabad Traffic Police for driving license services.",
    "Balochistan": "Find out about provincial driver’s license and appointment info."
  }
},
  overviewSections: KPK_BASE_GUIDE.overviewSections.map((section, index) => ({
    ...section,
    content: ["In Khyber Pakhtunkhwa in order to drive a car or a motorcycle the first step is to get a learner permit. The KP Transport Department provides the online learner permit service through the Dastak app.\n\nRegister with your CNIC and mobile number, choose the learner permit service and fill out the required application information. Upload your CNIC copy and any other documents that the system requests of you. Pay the due fee via the online payment option provided and turn in your application.\n\nOnce the application is reviewed, we ask that you follow the official instructions which will grant you your learner permit. Also you may get in touch with the issues desk at the driving licence office if you have questions.", "After you get your learner permit you must wait the required time before you apply for a permanent license. For the typical learner to have a permanent license process that waiting period is 45 days.\n\nYou can start the process for permanent license through KP Dastak. Fill out the application, upload the required documents and we have also put in instructions for medical assessment, biometric verification and appointment scheduling where applicable.\n\nApplicants may have to complete a traffic signs test and a practical driving test, as per the licence category and applicable requirements. Once the required actions and payments are made the licensing authority processes the application.\nBefore you apply, check in with the official Transport Department."][index],
  })),
  actionLinks: KPK_BASE_GUIDE.actionLinks.map(link => ({
    ...link,
    note: {"Apply for Learner Licence": "Start a learner permit application through KP Dastak", "Apply for Permanent Licence": "Review the permanent licence application process", "Verify Driving Licence": "Verify an issued licence through the official KP system", "Renew Licence": "Check renewal options through KP Dastak", "Track Application": "Follow application progress using the available tracking service", "Visit Official Portal": "Open the KP Transport Department driving licence page"}[link.label] || link.note,
    ctaLabel: "Continue",
  })),
};

// Islamabad replacement copy is scoped to its detail page.
const ISLAMABAD_BASE_GUIDE = DRIVING_LICENCE_GUIDES.find(guide => guide.slug === "islamabad");
const ISLAMABAD_DETAIL_GUIDE = {
  ...ISLAMABAD_BASE_GUIDE,
  ...{
  "seoTitle": "Islamabad Driving Licence Verification Online | ITP-DLIMS",
  "seoDescription": "Check out your Islamabad driving license online at ITP-DLIMS. See how to verify, apply, renew, track your license and also check out official fees and requirements.",
  "exactTitle": true,
  "shortDescription": "In Islamabad Capital Territory use ITP-DLIMS to access online driving license services. \n\nReady to go? Head to the government site directly. Sello does not collect your CNIC, licence number or personal info.",
  "heroCopyComplete": true,
  "authorityName": "Islamabad Traffic Police — ITP-DLIMS",
  "actionsTitle": "Official Islamabad Driving Licence Actions",
  "actionsDescription": "These links will take you away from Sello to Islamabad Police or ITP-DLIMS. Only via the government services portal should you submit your personal information, documents and payments.",
  "aboutTitle": "About Islamabad Driving Licence Services",
  "introduction": "In Islamabad Capital Territory Driving license services are handled by Islamabad Traffic Police (ITP) which is a part of Islamabad Capital Territory Police. Also they have an online system named ITP-DLIMS which we use for licence related services.\n\nThe official portal is home to online learner permit applications and we also have license services and verification. Also to that report from Islamabad Police which said that from 19 October 2026 they will be going live with online applications for learner permits, license renewals and duplicate licenses. Also they have put forth that renewed and duplicate licenses will be made available via courier once the application process is completed.\n\nSello. PK provides a general overview which in turn helps users to understand the process and find the right government links. It does not issue licenses, process applications, collect payments or access private license records.",
  "lastVerifiedAt": "2026-11-13",
  "officialChannelLabel": "Islamabad Traffic Police / Islamabad Capital Territory Police",
  "processTitle": "Islamabad Driving Licence Process Guide",
  "processDescription": "Expand out each section to see the main steps in which you apply for, renew or verify your Islamabad driving license. Also always follow the latest instructions as displayed by ITP-DLIMS.",
  "faqTitle": "Frequently Asked Questions About Islamabad Driving Licence",
  "otherProvincesTitle": "Driving Licence Guides for Other Provinces",
  "otherProvincesDescription": "Looking for driving licence services outside Islamabad? Pick your province to see the related guide and go to the government portal.",
  "disclaimer": "Sello. PK is a separate entity and does not work with Islamabad Traffic Police or Islamabad Capital Territory Police. This site is for reference only. Licence issuance and updates, verification, renewals, payments, appointments and official records are handled exclusively by the relevant government authorities.\n\nGovernment policies, rules which pertain to fees structure and eligibility may change. We advise that you check the official Islamabad Police or ITP-DLIMS website for the latest info before you apply or pay. Sello does not ask for your CNIC, licence number or application details.",
  "learnerProcedure": [
    "Visit the official ITP-DLIMS portal.",
    "Register or sign in as instructed.",
    "Select the learner permit service.",
    "Fill out the application form with correct details.",
    "Submit the documents which the portal requested.",
    "Complete the payment process, if applicable.",
    "Submit your application and we’ll go over the instructions for your learner permit."
  ],
  "permanentProcedure": [
    "Get your learner permit and complete the required learner period.",
    "Check if you qualify for the given vehicle type.",
    "Review the permanent license instructions on ITP-DLIMS.",
    "Present your CNIC, learner permit and also any other required documents.",
    "Attend the required medical exam and theory or traffic sign test.",
    "When you are ready to take the test.",
    "Pay the due fee and follow the license issue instructions."
  ],
  "renewalProcedure": [
    "In Islamabad you can use the online facility for driving license renewal. First go to the official ITP-DLIMS site and choose the renewal option. Register or log in and put in the required information.",
    "Check your present licence details, upload the required documents and complete the official payment process. In a move by Islamabad Police to facilitate license renewal the renewed licences will now be delivered via TCS courier, also include your full residential address and active mobile number in your application.",
    "Do not use out of date fee lists or unofficial payment info. Go to the official portal for the current renewal fees and delivery details."
  ],
  "verificationGuide": [
    "You can check your driving licence or learner permit on the official ITP-DLIMS verification page.",
    "Open the official verification page.",
    "Select the appropriate verification type which may be learner or license.",
    "Fill out the details as requested.",
    "Complete all extra verification steps as they appear.",
    "Submit the data and see the results.",
    "The learner verification option will ask for a CNIC number without dashes and a permit number. For the fields that appear go by what is required for the selected verification type. Sello does not have access to or is able to retrieve your personal licence record."
  ],
  "requiredDocuments": [
    "The exact set of documents required depends on the service and licence category. Applicants may be asked for:",
    "Original or valid CNIC details.",
    "Recent photograph.",
    "Present learner permit for a regular licence.",
    "Existing driving licence for renewal.",
    "Medical information or certificate, where required.",
    "Any also included documents at the official portal.",
    "Check out the live application form before you submit. Also do not post personal documents to unofficial sites."
  ],
  "ageRequirements": [
    "The age to get a motorcycle or car license is 18 in most cases. For other vehicle types that may be available the rules are different. It is best that applicants check the age, experience and health requirements with Islamabad Traffic Police before applying."
  ],
  "feesAndPayment": [
    "In Islamabad the driving license fee is based on the service and license category. For learner permits, new licenses, renewals, duplicate licenses and other services the charges may differ.",
    "For the present driving license fees in Islamabad check the official ITP-DLIMS portal or the notice board at Islamabad Police. Use only the payment methods which the government system puts forth and do not forget to get your receipt or payment confirmation."
  ],
  "drivingTestGuidelines": [
    "Applicants for a full driving license may have to complete the required theoretical and traffic sign test and practical driving exam. Study up on road signs, traffic rules, lane discipline, road markings and safe driving practices.",
    "For the practical test you will do basic vehicle control, turning, reversing, parking and follow traffic instructions. What you will do at the test is based on the licence category and the instructions given out by Islamabad Traffic Police."
  ],
  "trackingInstructions": [
    "Log in to the ITP-DLIMS portal and check the application or service status with the account options at your disposal.",
    "Visit the Official Islamabad Police Portal",
    "Find out driving license verification, learner permit applications, renewal info and other Islamabad Police services for citizens.",
    "How to Apply for a Learner Driving Licence in Islamabad",
    "In Islamabad in order to drive a car or a motorcycle you will first get a learner permit. Islamabad Traffic Police has an online learner permit service which is available through the ITP-DLIMS portal.",
    "Visit the official site and go to the learner permit service. Register or log in as the instructions say, fill out the application form and put in the required info. You may have to upload your CNIC and photo. Go over the details carefully and follow the payment instructions given by the system.",
    "After you submit your application check the portal for updates and to access your learner permit. Also make a copy of the permit and follow all learner driver conditions while you practice.",
    "How to apply:",
    "Open the official ITP-DLIMS website.",
    "Log in to your account.",
    "Select the online learner permit service.",
    "Fill out the application and upload the requested documents.",
    "Follow the official payment and submission guidelines.",
    "Check out your application and download the permit if the portal has it.",
    "How to Get a Regular Driving Licence in Islamabad",
    "After you get your learner permit and complete the required learner period you may go ahead with the regular licensing process. To be eligible applicants must meet the age and other requirements for the vehicle category they wish to obtain. For a motorcycle or car license the minimum age is 18.",
    "Check out the latest instructions at the ITP-DLIMS portal before you visit the licensing centre. What you will bring depends on your application and license category. You may need your original CNIC, learner permit and other support documents.",
    "Regular licence process:",
    "Make sure your learner permit and eligibility requirements are filled out.",
    "Check out the permanent license instructions on the portal.",
    "Present your original CNIC, learner permit and other required documents.",
    "Attend the required medical and driving tests.",
    "Pass the appropriate tests and pay the official fee.",
    "Follow the authorities’ guidelines for licence issues.",
    "Requirements and procedures are subject to change. Check with Islamabad Traffic Police for the latest info before you visit the licensing centre.",
    "Islamabad Traffic Police — ITP-DLIMS",
    "About Islamabad Driving Licence Services",
    "In Islamabad Capital Territory Driving license services are handled by Islamabad Traffic Police (ITP) which is a part of Islamabad Capital Territory Police. Also they have an online system named ITP-DLIMS which we use for licence related services.",
    "The official portal is home to online learner permit applications and we also have license services and verification. Also to that report from Islamabad Police which said that from 19 October 2026 they will be going live with online applications for learner permits, license renewals and duplicate licenses. Also they have put forth that renewed and duplicate licenses will be made available via courier once the application process is completed.",
    "Sello. PK provides a general overview which in turn helps users to understand the process and find the right government links. It does not issue licenses, process applications, collect payments or access private license records.",
    "Last verified: 13 November 2026",
    "Official authority: Islamabad Traffic Police / Islamabad Capital Territory Police",
    "Online system: ITP-DLIMS",
    "Official portal: https://dlims.islamabadpolice.gov.pk/",
    "Verification portal: https://dlims.islamabadpolice.gov.pk/verify",
    "Islamabad Driving Licence Process Guide",
    "Expand out each section to see the main steps in which you apply for, renew or verify your Islamabad driving license. Also always follow the latest instructions as displayed by ITP-DLIMS.",
    "Learner Licence Procedure",
    "Visit the official ITP-DLIMS portal.",
    "Register or sign in as instructed.",
    "Select the learner permit service.",
    "Fill out the application form with correct details.",
    "Submit the documents which the portal requested.",
    "Complete the payment process, if applicable.",
    "Submit your application and we’ll go over the instructions for your learner permit.",
    "Permanent Licence Procedure",
    "Get your learner permit and complete the required learner period.",
    "Check if you qualify for the given vehicle type.",
    "Review the permanent license instructions on ITP-DLIMS.",
    "Present your CNIC, learner permit and also any other required documents.",
    "Attend the required medical exam and theory or traffic sign test.",
    "When you are ready to take the test.",
    "Pay the due fee and follow the license issue instructions.",
    "Renewal Process",
    "In Islamabad you can use the online facility for driving license renewal. First go to the official ITP-DLIMS site and choose the renewal option. Register or log in and put in the required information.",
    "Check your present licence details, upload the required documents and complete the official payment process. In a move by Islamabad Police to facilitate license renewal the renewed licences will now be delivered via TCS courier, also include your full residential address and active mobile number in your application.",
    "Do not use out of date fee lists or unofficial payment info. Go to the official portal for the current renewal fees and delivery details.",
    "Licence Verification",
    "You can check your driving licence or learner permit on the official ITP-DLIMS verification page.",
    "Open the official verification page.",
    "Select the appropriate verification type which may be learner or license.",
    "Fill out the details as requested.",
    "Complete all extra verification steps as they appear.",
    "Submit the data and see the results.",
    "The learner verification option will ask for a CNIC number without dashes and a permit number. For the fields that appear go by what is required for the selected verification type. Sello does not have access to or is able to retrieve your personal licence record.",
    "Required Documents",
    "The exact set of documents required depends on the service and licence category. Applicants may be asked for:",
    "Original or valid CNIC details.",
    "Recent photograph.",
    "Present learner permit for a regular licence.",
    "Existing driving licence for renewal.",
    "Medical information or certificate, where required.",
    "Any also included documents at the official portal.",
    "Check out the live application form before you submit. Also do not post personal documents to unofficial sites.",
    "Age Requirements",
    "The age to get a motorcycle or car license is 18 in most cases. For other vehicle types that may be available the rules are different. It is best that applicants check the age, experience and health requirements with Islamabad Traffic Police before applying.",
    "Fees and Payment",
    "In Islamabad the driving license fee is based on the service and license category. For learner permits, new licenses, renewals, duplicate licenses and other services the charges may differ.",
    "For the present driving license fees in Islamabad check the official ITP-DLIMS portal or the notice board at Islamabad Police. Use only the payment methods which the government system puts forth and do not forget to get your receipt or payment confirmation.",
    "Driving Test Guidelines",
    "Applicants for a full driving license may have to complete the required theoretical and traffic sign test and practical driving exam. Study up on road signs, traffic rules, lane discipline, road markings and safe driving practices.",
    "For the practical test you will do basic vehicle control, turning, reversing, parking and follow traffic instructions. What you will do at the test is based on the licence category and the instructions given out by Islamabad Traffic Police.",
    "Track Your Application",
    "To check your Islamabad driving license status go to the official ITP-DLIMS portal and sign in with your registered account. Look for the application status or service option and follow the instructions given.",
    "If your status is not out, check your submission confirmation and reach out to Islamabad Traffic Police through their support channels. Have your application reference or receipt at hand when you ask for help."
  ],
  "faqs": [
    {
      "question": "How do I verify a driving licence in Islamabad online?",
      "answer": "At dlims.islamabadpolice.gov.pk/verify. Choose the relevant option which applies to you, input the details as requested by the system and submit the form to see your results."
    },
    {
      "question": "What details does the Islamabad driving licence verification show?",
      "answer": "The verification results are based on what is put into the official system and which verification service you choose. We may display license or permit info. For exact field and record details see the official ITP-DLIMS verification page."
    },
    {
      "question": "Do I need an appointment to visit the Islamabad licence branch?",
      "answer": "Appointment needs may vary by service type. In Islamabad Police we have put in an online appointment feature to our website. Before you visit the licensing branch check that an appointment is required."
    },
    {
      "question": "What should I do if I can’t find my Islamabad driving licence record online?",
      "answer": "First check what you have entered, the CNIC, permit number etc. must be in the right format. If the record still doesn’t show up, get in touch with Islamabad Traffic Police or go to an authorized licensing center for help. Sello is not able to retrieve or change government license records."
    },
    {
      "question": "Can I renew my Islamabad driving licence online?",
      "answer": "Yes. ISB Police has introduced an online renewal feature via the ITP-DLIMS portal as of 19 October 2026. What is put forward is that applicants may now file for renewal online and to follow the step by step instructions for documents, payment and delivery."
    }
  ],
  "otherProvinceCards": {
    "punjab": {
      "description": "Apply for, renew and verify driving licenses through Punjab DLIMS 2.0 and Dastak.",
      "ctaLabel": "Explore Guide"
    },
    "sindh": {
      "description": "Find out more on learner permits, permanent licenses, renewals and verification at Sindh Police driving license offices.",
      "ctaLabel": "Explore Guide"
    },
    "kpk": {
      "description": "Into the world of learner permits, permanent licenses, renewals and application tracking which is brought to you by Khyber Pakhtunkwa Transport and Dastak services.",
      "ctaLabel": "Explore Guide"
    },
    "balochistan": {
      "description": "Find out from the proper Balochistan Traffic Police offices regarding driving license services, appointments and verification.",
      "ctaLabel": "Explore Guide"
    }
  }
},
  overviewSections: ISLAMABAD_BASE_GUIDE.overviewSections.map((section, index) => ({
    ...section,
    content: ["In Islamabad in order to drive a car or a motorcycle you will first get a learner permit. Islamabad Traffic Police has an online learner permit service which is available through the ITP-DLIMS portal.\n\nVisit the official site and go to the learner permit service. Register or log in as the instructions say, fill out the application form and put in the required info. You may have to upload your CNIC and photo. Go over the details carefully and follow the payment instructions given by the system.\n\nAfter you submit your application check the portal for updates and to access your learner permit. Also make a copy of the permit and follow all learner driver conditions while you practice.\nHow to apply:\nOpen the official ITP-DLIMS website.\nLog in to your account.\nSelect the online learner permit service.\nFill out the application and upload the requested documents.\nFollow the official payment and submission guidelines.\nCheck out your application and download the permit if the portal has it.", "After you get your learner permit and complete the required learner period you may go ahead with the regular licensing process. To be eligible applicants must meet the age and other requirements for the vehicle category they wish to obtain. For a motorcycle or car license the minimum age is 18.\n\nCheck out the latest instructions at the ITP-DLIMS portal before you visit the licensing centre. What you will bring depends on your application and license category. You may need your original CNIC, learner permit and other support documents. \nRegular licence process:\nMake sure your learner permit and eligibility requirements are filled out.\nCheck out the permanent license instructions on the portal.\nPresent your original CNIC, learner permit and other required documents.\nAttend the required medical and driving tests.\nPass the appropriate tests and pay the official fee.\nFollow the authorities’ guidelines for licence issues.\n\nRequirements and procedures are subject to change. Check with Islamabad Traffic Police for the latest info before you visit the licensing centre."][index],
  })),
  actionLinks: ISLAMABAD_BASE_GUIDE.actionLinks.map(link => ({
    ...link,
    ...{"learner": {"label": "Apply for a Learner Licence", "note": "Register into ITP-DLIMS and choose the online learner permit service. Follow the portal instructions to complete the application."}, "permanent": {"label": "Apply for a Permanent Licence", "note": "Access the official ITP-DLIMS site for info on regular driving license services, eligibility and required tests."}, "verify": {"label": "Verify Driving Licence", "note": "Go to the official verification page to check your learner permit or driving licence which the system requests."}, "renew": {"label": "Renew Your Licence", "note": "Use the online system which is official to check the available renewal service and to put in your application. Follow present instructions for documents, payment and delivery."}, "track": {"label": "Track Your Application", "note": "Log in to the ITP-DLIMS portal and check the application or service status with the account options at your disposal."}, "portal": {"label": "Visit the Official Islamabad Police Portal", "note": "Find out driving license verification, learner permit applications, renewal info and other Islamabad Police services for citizens."}}[link.key],
    ...(link.key === "verify" ? { url: "https://dlims.islamabadpolice.gov.pk/verify" } : {}),
    ctaLabel: "Continue",
  })),
};

// Balochistan replacement copy is scoped to its detail page.
const BALOCHISTAN_BASE_GUIDE = DRIVING_LICENCE_GUIDES.find(guide => guide.slug === "balochistan");
const BALOCHISTAN_DETAIL_GUIDE = {
  ...BALOCHISTAN_BASE_GUIDE,
  ...{
  "seoTitle": "Driving License Verification Balochistan Online | QTP DLIMS",
  "seoDescription": "Verify your Balochistan driving licence online through Quetta Traffic Police. Learn how to check by CNIC, book appointments, apply for a learner permit, renew or get a duplicate licence.",
  "exactTitle": true,
  "shortDescription": "Use Quetta Traffic Police (QTP) and Balochistan Police digital services to access driving licence verification and application guidance. You can check your licence online, find learner permit requirements and explore services for renewal, duplicate and international driving licences.\n\nReady to continue? Visit the official government service directly. Sello never asks for your CNIC or driving licence number on this page.",
  "heroCopyComplete": true,
  "actionsTitle": "Official Balochistan Driving Licence Actions",
  "actionsDescription": "These links take you away from Sello to official Quetta Traffic Police or Balochistan Police services. Applications, personal information and payments must be submitted through the relevant government channel.",
  "aboutTitle": "About Balochistan Driving Licence Services",
  "introduction": "Driving licence services in Balochistan are provided through the relevant traffic police and Balochistan Police channels. Quetta Traffic Police offers an online driving licence verification service, while Balochistan Police Khidmat Markaz provides several licensing-related services.\n\nThe Khidmat Markaz service list includes learner driving licences, licence renewals, international driving licences, duplicate licences and licence endorsements.\n\nSello.pk provides guidance to help users find the correct government channels. It does not issue licences, process applications, collect payments or access private licence records.",
  "processTitle": "Balochistan Driving Licence Process Guide",
  "processDescription": "Expand each section to understand the main steps for applying, renewing or verifying a driving licence in Balochistan. Always confirm the latest instructions with the relevant licensing office.",
  "faqTitle": "Frequently Asked Questions – Balochistan Driving Licence",
  "otherProvincesTitle": "Driving Licence Guides for Other Provinces",
  "otherProvincesDescription": "Looking for a driving licence service in another region? Open the relevant Sello guide and continue to the official government portal.",
  "disclaimer": "Sello.pk is an independent information platform and is not affiliated with Quetta Traffic Police or Balochistan Police. This page is provided for general guidance only. Licence applications, verification, renewals, appointments, payments and official records are managed by the relevant government authorities.\n\nGovernment procedures, fees, eligibility criteria and portal features may change. Always confirm the latest information through official Quetta Traffic Police or Balochistan Police channels before submitting an application or making a payment. Sello does not request or collect your CNIC, driving licence number or application credentials.",
  "learnerProcedure": [
    "Balochistan Police Khidmat Markaz lists learner driving licences among its public services. The published procedure includes the following steps:",
    "Open the official Balochistan Police Khidmat Markaz website.",
    "Review the learner driving licence service and its requirements.",
    "Prepare your original CNIC and a photocopy.",
    "Obtain the traffic rules and regulations codebook as instructed by Traffic Police.",
    "Visit the designated Khidmat Markaz or licensing centre.",
    "Submit the required documents and learner permit fee.",
    "Follow the instructions for receiving your learner permit.",
    "Applicants aged 50 or above may also be asked to provide a medical certificate, according to the published service information.",
    "Official information: https://pkm.balochistanpolice.gov.pk/public/home/services"
  ],
  "permanentProcedure": [
    "To obtain a permanent driving licence, you must first hold a learner permit and complete the required learner period. The published Quetta procedure specifies at least six weeks before applying.",
    "Prepare your original learner permit, CNIC, passport-size photographs, applicable fee documents and medical certificate if required."
  ],
  "renewalProcedure": [
    "Balochistan Police Khidmat Markaz lists driving licence renewal as an available service. Applicants should prepare the documents requested by the centre, which may include:",
    "Completed renewal application form.",
    "Original driving licence.",
    "Copy of CNIC.",
    "Two passport-size photographs.",
    "Medical report, where required.",
    "Applicable fee ticket.",
    "The published service information mentions courier delivery for renewed licences, but confirms the current delivery arrangements and processing time before applying."
  ],
  "verificationGuide": [
    "You can complete an online driving licence verification in Balochistan through the Quetta Traffic Police website.",
    "Open the official Quetta Traffic Police website.",
    "Navigate to the Driving Licence Verification service.",
    "Enter your CNIC details as requested by the verification form.",
    "Submit the information.",
    "Review the available licence record.",
    "The verification service is intended to help users check licence information against the official record. If your details do not appear, confirm that you entered the correct CNIC information and contact Quetta Traffic Police for assistance.",
    "Official verification: https://qtp.gob.pk/main/license-verification/"
  ],
  "requiredDocuments": [
    "The documents required depend on the service you are applying for. The published Khidmat Markaz information lists the following for common licence services:",
    "Learner licence: Original CNIC and photocopy; traffic rules codebook",
    "Permanent licence: Learner permit, CNIC, photographs and required fee documents",
    "Renewal: Original licence, CNIC copy, photographs, application form and medical report where required",
    "Duplicate licence: CNIC copy, photographs, lost licence report/FIR and other required records",
    "International licence: Valid local driving licence, CNIC, passport, visa and photographs",
    "Additional documents may be requested depending on your circumstances. Check the current official requirements before visiting."
  ],
  "ageRequirements": [
    "The published Balochistan Police Khidmat Markaz information lists these minimum ages for learner permits:",
    "Motorcycle and motorcar: 18 years.",
    "LTV (including rickshaw, taxi and commercial tractor): 21 years.",
    "Other vehicle categories may have different eligibility conditions. Confirm the applicable age and requirements with the licensing authority before applying."
  ],
  "feesAndPayment": [
    "The Balochistan driving licence fee depends on the service and vehicle category. Learner permits, permanent licences, renewals, duplicate licences and international driving permits may have different charges.",
    "The published Khidmat Markaz service information includes a learner permit ticket of Rs. 60, but applicants should confirm whether this amount is still current before making payment. Do not rely on old fee lists or unofficial payment instructions.",
    "For the latest learner permit fee in Balochistan or other licence charges, contact the relevant licensing centre or check the official government service information."
  ],
  "drivingTestGuidelines": [
    "Applicants for a regular driving licence must complete the prescribed driving test. Prepare by learning traffic signs, road markings, right-of-way rules, lane discipline and safe driving practices.",
    "Practise basic vehicle control, starting and stopping, turning, reversing and parking. Follow the instructions of the licensing staff during the test. The exact assessment requirements may depend on your vehicle category."
  ],
  "trackingInstructions": [
    "Check the application tracking facility and use your official receipt or reference number where required. Follow the instructions provided by the relevant Khidmat Markaz.",
    "Continue: https://pkm.balochistanpolice.gov.pk/",
    "Visit the Official Portal",
    "Open the Quetta Traffic Police website for driving licence verification and other traffic police services.",
    "Continue: https://qtp.gob.pk/",
    "How to Get a Regular Driving Licence in Balochistan",
    "After obtaining your learner driving permit and completing the required waiting period, you can apply for a regular driving licence in Balochistan.",
    "Prepare your original learner permit, CNIC, recent passport-size photographs and other documents required by the licensing authority. You may also need a medical certificate and the applicable fee ticket.",
    "Confirm the latest requirements with Quetta Traffic Police before visiting.",
    "Regular licence process:",
    "Obtain a learner driving permit.",
    "Complete the required learner period.",
    "Prepare your CNIC, learner permit and supporting documents.",
    "Visit the relevant licensing office.",
    "Complete the required driving test and other assessments.",
    "Pay the applicable fee and follow the licence issuance instructions.",
    "Quetta Traffic Police / Balochistan Traffic Police",
    "About Balochistan Driving Licence Services",
    "Driving licence services in Balochistan are provided through the relevant traffic police and Balochistan Police channels. Quetta Traffic Police offers an online driving licence verification service, while Balochistan Police Khidmat Markaz provides several licensing-related services.",
    "The Khidmat Markaz service list includes learner driving licences, licence renewals, international driving licences, duplicate licences and licence endorsements.",
    "Sello.pk provides guidance to help users find the correct government channels. It does not issue licences, process applications, collect payments or access private licence records.",
    "Balochistan Driving Licence Process Guide",
    "Expand each section to understand the main steps for applying, renewing or verifying a driving licence in Balochistan. Always confirm the latest instructions with the relevant licensing office.",
    "Learner Licence Procedure",
    "Balochistan Police Khidmat Markaz lists learner driving licences among its public services. The published procedure includes the following steps:",
    "Open the official Balochistan Police Khidmat Markaz website.",
    "Review the learner driving licence service and its requirements.",
    "Prepare your original CNIC and a photocopy.",
    "Obtain the traffic rules and regulations codebook as instructed by Traffic Police.",
    "Visit the designated Khidmat Markaz or licensing centre.",
    "Submit the required documents and learner permit fee.",
    "Follow the instructions for receiving your learner permit.",
    "Applicants aged 50 or above may also be asked to provide a medical certificate, according to the published service information.",
    "Official information: https://pkm.balochistanpolice.gov.pk/public/home/services",
    "Permanent Licence Procedure",
    "To obtain a permanent driving licence, you must first hold a learner permit and complete the required learner period. The published Quetta procedure specifies at least six weeks before applying.",
    "Prepare your original learner permit, CNIC, passport-size photographs, applicable fee documents and medical certificate if required.",
    "Renewal Process",
    "Balochistan Police Khidmat Markaz lists driving licence renewal as an available service. Applicants should prepare the documents requested by the centre, which may include:",
    "Completed renewal application form.",
    "Original driving licence.",
    "Copy of CNIC.",
    "Two passport-size photographs.",
    "Medical report, where required.",
    "Applicable fee ticket.",
    "The published service information mentions courier delivery for renewed licences, but confirms the current delivery arrangements and processing time before applying.",
    "Licence Verification",
    "You can complete an online driving licence verification in Balochistan through the Quetta Traffic Police website.",
    "Open the official Quetta Traffic Police website.",
    "Navigate to the Driving Licence Verification service.",
    "Enter your CNIC details as requested by the verification form.",
    "Submit the information.",
    "Review the available licence record.",
    "The verification service is intended to help users check licence information against the official record. If your details do not appear, confirm that you entered the correct CNIC information and contact Quetta Traffic Police for assistance.",
    "Official verification: https://qtp.gob.pk/main/license-verification/",
    "Required Documents",
    "The documents required depend on the service you are applying for. The published Khidmat Markaz information lists the following for common licence services:",
    "Service",
    "Commonly required documents",
    "Learner licence",
    "Original CNIC and photocopy; traffic rules codebook",
    "Permanent licence",
    "Learner permit, CNIC, photographs and required fee documents",
    "Renewal",
    "Original licence, CNIC copy, photographs, application form and medical report where required",
    "Duplicate licence",
    "CNIC copy, photographs, lost licence report/FIR and other required records",
    "International licence",
    "Valid local driving licence, CNIC, passport, visa and photographs",
    "Additional documents may be requested depending on your circumstances. Check the current official requirements before visiting.",
    "Age Requirements",
    "The published Balochistan Police Khidmat Markaz information lists these minimum ages for learner permits:",
    "Motorcycle and motorcar: 18 years.",
    "LTV (including rickshaw, taxi and commercial tractor): 21 years.",
    "Other vehicle categories may have different eligibility conditions. Confirm the applicable age and requirements with the licensing authority before applying.",
    "Fees and Payment",
    "The Balochistan driving licence fee depends on the service and vehicle category. Learner permits, permanent licences, renewals, duplicate licences and international driving permits may have different charges.",
    "The published Khidmat Markaz service information includes a learner permit ticket of Rs. 60, but applicants should confirm whether this amount is still current before making payment. Do not rely on old fee lists or unofficial payment instructions.",
    "For the latest learner permit fee in Balochistan or other licence charges, contact the relevant licensing centre or check the official government service information.",
    "Driving Test Guidelines",
    "Applicants for a regular driving licence must complete the prescribed driving test. Prepare by learning traffic signs, road markings, right-of-way rules, lane discipline and safe driving practices.",
    "Practise basic vehicle control, starting and stopping, turning, reversing and parking. Follow the instructions of the licensing staff during the test. The exact assessment requirements may depend on your vehicle category.",
    "Track Your Application",
    "If you have submitted a licence application through a Khidmat Markaz, keep your receipt or application reference number safe. Balochistan Police lists online application tracking among the features of its Police Mobile Khidmat Markaz service.",
    "Use the official Khidmat Markaz portal and follow the available tracking instructions. If you cannot find your application status online, contact the centre where you submitted your documents.",
    "Official portal: https://pkm.balochistanpolice.gov.pk/"
  ],
  "faqs": [
    {
      "question": "How can I verify my driving licence online in Balochistan?",
      "answer": "Visit the official Quetta Traffic Police verification page at https://qtp.gob.pk/main/license-verification/. Enter your CNIC details as requested by the system and submit the form to check the available licence record."
    },
    {
      "question": "How do I book a driving licence appointment in Balochistan?",
      "answer": "Visit the official Quetta Traffic Police website and check its online appointment facility for the service you need. If an appointment option is available, enter the requested details, select the relevant service and follow the booking instructions. If you cannot find an online slot, contact the relevant licensing office to confirm its current procedure."
    },
    {
      "question": "What is the minimum age for a learner permit in Balochistan?",
      "answer": "According to the published Balochistan Police Khidmat Markaz information, applicants must be at least 18 years old for a motorcycle or motorcar learner permit and 21 years old for an LTV learner permit."
    },
    {
      "question": "What documents do I need for a permanent driving licence in Balochistan?",
      "answer": "You should prepare your original learner permit, CNIC, recent passport-size photographs and applicable fee documents. A medical certificate may also be required. Confirm the complete document list with the licensing office before visiting."
    },
    {
      "question": "How do I renew my driving licence in Balochistan?",
      "answer": "Visit the official Balochistan Police Khidmat Markaz service page and check the renewal requirements. Prepare your existing licence, CNIC copy, photographs, application form, medical report where required and applicable fee. Submit the application through the designated centre and follow the official delivery instructions."
    }
  ],
  "otherProvinceCards": {
    "punjab": {
      "description": "Apply for, renew and verify driving licences through Punjab DLIMS 2.0 and Dastak services.",
      "ctaLabel": "Explore Guide"
    },
    "sindh": {
      "description": "Find guidance for learner permits, permanent licences, renewals and verification through Sindh Police driving licence services.",
      "ctaLabel": "Explore Guide"
    },
    "kpk": {
      "description": "Learn about learner permits, permanent licences, renewals and application tracking through Khyber Pakhtunkhwa Transport and Dastak services.",
      "ctaLabel": "Explore Guide"
    },
    "islamabad": {
      "description": "Find online driving licence guidance, verification and renewal information through Islamabad Traffic Police DLIMS.",
      "ctaLabel": "Explore Guide"
    }
  },
  "sourceUrls": [
    "https://pkm.balochistanpolice.gov.pk/public/home/services",
    "https://qtp.gob.pk/",
    "https://qtp.gob.pk/main/license-verification/",
    "https://pkm.balochistanpolice.gov.pk/"
  ]
},
  overviewSections: BALOCHISTAN_BASE_GUIDE.overviewSections.map(section => ({
    ...section,
    content: "After obtaining your learner driving permit and completing the required waiting period, you can apply for a regular driving licence in Balochistan. \n\nPrepare your original learner permit, CNIC, recent passport-size photographs and other documents required by the licensing authority. You may also need a medical certificate and the applicable fee ticket.\n\nConfirm the latest requirements with Quetta Traffic Police before visiting.\nRegular licence process:\nObtain a learner driving permit.\nComplete the required learner period.\nPrepare your CNIC, learner permit and supporting documents.\nVisit the relevant licensing office.\nComplete the required driving test and other assessments.\nPay the applicable fee and follow the licence issuance instructions.",
  })),
  actionLinks: BALOCHISTAN_BASE_GUIDE.actionLinks.map(link => ({
    ...link,
    ...{"learner": {"label": "Apply for a Learner Licence", "note": "Find learner driving licence services through Balochistan Police Khidmat Markaz.", "url": "https://pkm.balochistanpolice.gov.pk/public/home/services", "ctaLabel": "Continue"}, "permanent": {"label": "Apply for a Permanent Licence", "note": "Review the permanent licence requirements and driving test procedure through Quetta Traffic Police. Applicants must complete the required learner period before applying.", "url": "https://qtp.gob.pk/", "ctaLabel": "Continue"}, "verify": {"label": "Verify Driving Licence", "note": "Use the official Quetta Traffic Police verification service to check your Balochistan driving licence using the information requested by the portal.", "url": "https://qtp.gob.pk/main/license-verification/", "ctaLabel": "Continue"}, "renew": {"label": "Renew Your Licence", "note": "Balochistan Police Khidmat Markaz lists driving licence renewal as an available service. Check the documents, fee and centre instructions before visiting.", "url": "https://pkm.balochistanpolice.gov.pk/public/home/services", "ctaLabel": "Continue"}, "track": {"label": "Track Your Application", "note": "Check the application tracking facility and use your official receipt or reference number where required. Follow the instructions provided by the relevant Khidmat Markaz.", "url": "https://pkm.balochistanpolice.gov.pk/", "ctaLabel": "Continue"}, "portal": {"label": "Visit the Official Portal", "note": "Open the Quetta Traffic Police website for driving licence verification and other traffic police services.", "url": "https://qtp.gob.pk/", "ctaLabel": "Continue"}}[link.key],
  })),
};

// Karachi / Sindh article copy is used only on the Sindh detail route.
const SINDH_DETAIL_GUIDE = {
  ...DRIVING_LICENCE_GUIDES.find(guide => guide.slug === "sindh"),
  ...{
  "seoTitle": "How to Apply for a Driving License in Karachi | Step-by-Step Guide",
  "seoDescription": "Learn how to apply for a driving license in Karachi. Explore Sindh licence requirements, documents, fees, learner permits, driving tests and renewal.",
  "exactTitle": true,
  "pageTitle": "How to Apply for a Driving License in Karachi: Step-by-Step Guide",
  "shortDescription": "Getting a driving license in Karachi allows you to drive legally and confidently on the road. The Sindh Driving License system provides online services for learner permits, permanent licences, renewals and other related applications.\nBefore applying, you can use Sello to check driving license now and explore our learner driving license guide to understand the process, documents and requirements.",
  "heroCopyComplete": true,
  "overviewSections": [],
  "hideAboutSection": true,
  "processTitle": "Karachi Driving Licence Application Guide",
  "processDescription": "",
  "contentSections": [
    {
      "key": "ageRequirements",
      "title": "Step 1: Check Your Eligibility"
    },
    {
      "key": "requiredDocuments",
      "title": "Step 2: Prepare the Required Documents"
    },
    {
      "key": "learnerProcedure",
      "title": "Step 3: Apply for a Learner Driving Licence Online"
    },
    {
      "key": "drivingTestGuidelines",
      "title": "Step 4: Prepare for Your Driving Test"
    },
    {
      "key": "permanentProcedure",
      "title": "Step 5: Visit the Driving Licence Branch"
    },
    {
      "key": "feesAndPayment",
      "title": "Driving Licence Types and Fees in Karachi"
    },
    {
      "key": "renewalProcedure",
      "title": "Renewal, Validity and Appointments"
    },
    {
      "key": "exploreMoreContent",
      "title": "Explore More on Sello"
    }
  ],
  "faqTitle": "Frequently Asked Questions About Driving Licences in Karachi",
  "disclaimer": "Sello provides general information and guidance only. It does not issue driving licences or guarantee approvals. Applications, payments and tests are handled by official authorities. Always confirm current fees and requirements through Sindh Police before applying.",
  "ageRequirements": "Before starting the Sindh driving license process, make sure you meet the minimum age and eligibility requirements. For a motorcycle or motorcar learner licence, the general minimum age is 18 years. Commercial vehicle categories may have higher age and experience requirements.\nYou should also have a valid CNIC and meet the applicable medical fitness conditions.",
  "requiredDocuments": [
    "Having your documents ready can make the application process easier. The required documents may vary depending on the licence category and service.",
    "Valid CNIC: Identity verification",
    "Recent photograph: Applicant identification",
    "CNIC front and back copies: Online application",
    "Learner permit: Permanent licence application",
    "Previous driving licence: Renewal or relevant applications",
    "Medical certificate: Where required for the category",
    "Passport and visa details: International driving permit, where applicable",
    "Always check the official portal for the latest document requirements before submitting your application."
  ],
  "learnerProcedure": "To understand how to apply for driving license in Karachi, begin by visiting the official DLS Online portal or Sindh DLIMS 2.0.\nCreate an account using your CNIC and mobile number. Select the learner licence service, choose your vehicle category and complete the application form. Upload the requested documents, generate the payment reference and pay through an approved payment channel.\nAfter payment confirmation and application processing, follow the portal's instructions to download or print your learner permit.",
  "drivingTestGuidelines": "For a regular motorcycle or motorcar licence, applicants generally need to complete a 42-day learner period before attempting the practical test.\nIf you are looking for driving test preparation tips Karachi Traffic Police, start by learning traffic signs, road markings, lane discipline and right-of-way rules. Practise starting, stopping, reversing, turning and parking safely.\nTo improve your chances of passing, practise parallel parking between markers, use your indicators correctly and check your mirrors before changing direction. These basic habits can help you understand how to pass driving test in Karachi confidently.\nYou can also check local driving schools, including options in Gulshan-e-Iqbal, if you need professional practice. Confirm their training charges and availability directly. If you need a vehicle for your test, ask the relevant driving branch about vehicle arrangements and any applicable driving test car rental fees.",
  "permanentProcedure": "Once you complete the learner period, follow the official instructions for your permanent licence test. Carry your original CNIC, learner permit and any additional documents requested.\nDepending on your category, you may need to pass a theoretical or traffic-sign test and a practical driving test. After successfully completing the requirements and paying the applicable charges, your licence will be processed by the licensing authority.",
  "feesAndPayment": "Pakistan has different driving licence categories based on the vehicle being driven. These include motorcycle, motorcar, motorcycle rickshaw, commercial and international driving permits.\nThe motorcycle rickshaw driving license cost, urgent driving license Karachi fee and international driving license fee depend on the relevant category and official fee schedule. Check the DLS Sindh portal for current charges rather than relying on outdated fee information. You can also explore Sello's Driving license fee guide for related guidance.",
  "renewalProcedure": "Your driving licence must be renewed according to its expiry date and category. Visit the official portal to check the driving license renewal procedure validity, available renewal options and payment requirements.\nTo book a driving licence appointment in Sindh, use the official DLS Online or DLIMS services and follow the instructions displayed. If you need to reschedule your appointment, sign in and check the available appointment-management options. Contact the licensing authority if online rescheduling is unavailable.\nOverseas Pakistanis can check their eligibility for available online services using valid Pakistani identity documents. However, some verification or testing requirements may require an in-person visit. Confirm the procedure before travelling to Karachi.",
  "exploreMoreContent": "Whether you are applying for your first licence or renewing an existing one, Sello helps you find useful information. Read our learner driving license guide, explore the Driving license fee guide, and learn how to check Sindh driving license details through official resources.\nYou can also explore our guides to buy and sale cars in Pakistan when looking for your next vehicle.",
  "faqs": [
    {
      "question": "What is the official portal for booking a driving licence appointment in Karachi?",
      "answer": "Visit the official DLS Online portal or Sindh DLIMS 2.0 and follow the available appointment instructions for your service."
    },
    {
      "question": "How long do I have to wait after getting a learner's permit to attempt the practical test?",
      "answer": "For regular motorcycle and motorcar licences, applicants generally need to complete a 42-day learner period before attempting the practical test."
    },
    {
      "question": "What documents are required for a driving licence in Karachi?",
      "answer": "Common requirements include a valid CNIC, recent photograph and learner permit for a permanent licence application. Additional documents may be required depending on the category."
    },
    {
      "question": "Can overseas Pakistanis get a driving licence in Karachi?",
      "answer": "Overseas Pakistanis can check available online services using valid Pakistani identity documents. However, some testing and verification procedures may require an in-person visit."
    },
    {
      "question": "How can I renew my driving licence in Karachi?",
      "answer": "Visit the official Sindh driving licence portal, sign in and select the renewal service if available. Follow the instructions for documents, payment and licence delivery or collection."
    }
  ]
},
};

export const getGuideBySlug = (slug) =>
  slug === "punjab"
    ? PUNJAB_DETAIL_GUIDE
    : slug === "kpk"
      ? KPK_DETAIL_GUIDE
      : slug === "islamabad"
        ? ISLAMABAD_DETAIL_GUIDE
        : slug === "balochistan"
          ? BALOCHISTAN_DETAIL_GUIDE
          : slug === "sindh"
            ? SINDH_DETAIL_GUIDE
            : DRIVING_LICENCE_GUIDES.find((g) => g.slug === slug) || null;
