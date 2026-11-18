import onlineVehicleVerfication from "../../../assets/images/onlineVehicleVerfication.webp";
import smartBuyingTips from "../../../assets/images/smartBuyingTips.webp";

export const verificationPreviewPosts = [
  {
    id: 1,
    stepNumber: "01",
    title: "What is online vehicle verification?",
    category: "Online Verification",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: onlineVehicleVerfication,
    excerpt:
      "Online vehicle verification reviews official registration records, specs, and tax status before you buy. It lets buyers compare seller claims with government records to avoid fraud.",
    body: [
      "Online vehicle verification reviews available vehicle information through relevant, authorized sources. What is published may include registration info, vehicle specs, registration status, and other key records that vary by province.",
      "Before you buy a car, do not base your decision only on what the seller tells you. A car may look great in pictures or pass a brief inspection, but you should also check the registration and other details to rule out issues.",
      "An online car registration check is especially useful when you are buying a used car. It lets buyers compare what the seller says with what is on record.",
    ],
    items: [
      "Official verification of registration details",
      "Cross-referencing seller claims with state records",
      "Protection against fraudulent documents and duplicates",
      "Instant access to tax and token clearance records",
    ],
    fullContent: `Online vehicle verification reviews available vehicle information through relevant, authorized sources. What is published may include registration info, vehicle specs, registration status, and other key records that vary by province.

Before you buy a car, do not base your decision only on what the seller tells you. A car may look great in pictures or pass a brief inspection, but you should also check the registration and other details to rule out issues.

An online car registration check is especially useful when you are buying a used car. It lets buyers compare what the seller says with what is on record.

## Why Online Verification Matters

In Pakistan, the used automotive market involves thousands of daily private and commercial transactions. Without an official verification step, buyers risk purchasing vehicles with:

- **Unpaid token taxes or heavy fines**
- **Cloned or tampered registration numbers**
- **Bank-lease encumbrances or court disputes**
- **Discrepancies in engine or chassis serial numbers**

## How to Get Started

Always ask the seller for the vehicle's registration number and the province of registration. Using official government portals like Punjab MTMIS, Sindh Excise, or Islamabad ICT, you can cross-verify all vital parameters within minutes.`,
  },
  {
    id: 2,
    stepNumber: "02",
    title: "What is MTMIS and how does it relate to vehicle verification?",
    category: "MTMIS System",
    readTime: "6 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: smartBuyingTips,
    excerpt:
      "MTMIS (Motor Transport Management Information System) is an online database used to verify vehicle registration, engine and chassis numbers, and token tax status across provincial Excise boards.",
    body: [
      "MTMIS, which stands for Motor Transport Management Information System, is an online vehicle verification tool used to obtain vehicle registration and related information. Through provincial vehicle registration and Excise boards, users can check details of a registered car or motorcycle.",
      "The information published can vary by province and authority. A typical vehicle check may include make and model, registration date, engine information, chassis information, and tax or token status.",
      "For a used-car buyer, this is a research tool: compare the seller's claims with registration records before you buy. Online verification is only the start of the purchase process. A full picture also needs a physical inspection, document check, price comparison, and a proper ownership transfer.",
    ],
    items: [
      "Motor Transport Management Information System overview",
      "Provincial Excise & Taxation automated records",
      "Verification of engine number, chassis number, and make",
      "Clearance status of token taxes and historical fees",
    ],
    fullContent: `MTMIS, which stands for Motor Transport Management Information System, is an online vehicle verification tool used to obtain vehicle registration and related information. Through provincial vehicle registration and Excise boards, users can check details of a registered car or motorcycle.

The information published can vary by province and authority. A typical vehicle check may include make and model, registration date, engine information, chassis information, and tax or token status.

For a used-car buyer, this is a research tool: compare the seller's claims with registration records before you buy. Online verification is only the start of the purchase process. A full picture also needs a physical inspection, document check, price comparison, and a proper ownership transfer.

## Core Features of MTMIS

- **Comprehensive Vehicle Specs:** Year of manufacture, engine capacity (cc), body type, and official color code.
- **Tax Status Details:** Historical token tax records and the exact date up to which taxes have been cleared.
- **Ownership Transfer Trail:** Verification of whether the current seller is the legal registered owner.`,
  },
];

export function createVerificationPreviewPosts(overrides) {
  return verificationPreviewPosts.map((post) => ({
    ...post,
    ...overrides[post.id],
    id: post.id,
    stepNumber: post.stepNumber,
  }));
}
