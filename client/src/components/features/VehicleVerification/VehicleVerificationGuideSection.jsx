import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, User, ArrowRight, ShieldCheck } from "lucide-react";

import onlineVehicleVerfication from "../../../assets/images/onlineVehicleVerfication.webp";
import whyMTMISAndOnlineVehicleVerificationAreImportant from "../../../assets/images/whyMTMISAndOnlineVehicleVerificationAreImportant.webp";
import auctionSheetVerification from "../../../assets/blogs/auctionSheetVerification.webp";
import smartBuyingTips from "../../../assets/images/smartBuyingTips.webp";
import carCatBlog from "../../../assets/categories/catBlogs/carCatBlog.webp";
import howSelloHelpsWithVehicleVerification from "../../../assets/images/howSelloHelpsWithVehicleVerification.webp";
import vehicleVerificationHeroSection from "../../../assets/images/verification/vehicleVerificationHeroSection.jpeg";
import punjabVehicleVerification from "../../../assets/images/punjabVehicleVerification.webp";
import carRegistrationCheckBeforeBuyingAUsedCar from "../../../assets/images/carRegistrationCheckBeforeBuyingAUsedCar.webp";
import howCarCondition from "../../../assets/blogs/estimator/howCarCondition.webp";
import vehicleVerificationInLahoreAndOtherCities from "../../../assets/images/vehicleVerificationInLahoreAndOtherCities.webp";
import verificationPostImg from "../../../assets/images/verification/post.jpeg";
import bikeCatBlog from "../../../assets/categories/catBlogs/bikeCatBlog.webp";
import trustLegal from "../../../assets/images/trustLegal.webp";
import vehicleRegistrationAndSmartCardVerification from "../../../assets/images/vehicleRegistrationAndSmartCardVerification.jpeg";
import whyPhysicalInspectionIsAlsoImportant from "../../../assets/images/whyPhysicalInspectionIsAlsoImportant.jpeg";
import buyAndSellVehiclesWithMoreConfidence from "../../../assets/images/buyAndSellVehiclesWithMoreConfidence.jpeg";
import whyChooseSello from "../../../assets/images/whyChooseSello.jpeg";
import finalThoughts from "../../../assets/images/finalThoughts.jpeg";

/** Format markdown-like blog content to safe HTML */
export function formatBlogContent(text) {
  if (!text || typeof text !== "string") return "";
  const blocks = text.split(/\n\n+/);
  const out = [];
  const bold = (s) =>
    s.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-gray-900">$1</strong>',
    );

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n");
    const firstLine = lines[0] || "";

    // Table: multiple lines with pipes
    if (
      lines.length >= 2 &&
      firstLine.includes("|") &&
      lines.every((l) => l.includes("|"))
    ) {
      const rows = lines
        .map((l) =>
          l
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean),
        )
        .filter((cells) => cells.length > 0);
      const isSeparator = (cells) => cells.every((c) => /^[-:]+$/.test(c));
      const headerRow = rows[0] || [];
      const dataRows = rows.filter((_, i) => i > 0 && !isSeparator(rows[i]));
      out.push(
        '<div class="overflow-x-auto my-6 rounded-xl border border-gray-200"><table class="w-full text-left text-sm"><thead><tr class="bg-gray-50 border-b border-gray-200">',
      );
      headerRow.forEach((c) => {
        out.push(
          `<th class="px-4 py-3 font-semibold text-gray-900">${bold(c)}</th>`,
        );
      });
      out.push("</tr></thead><tbody>");
      dataRows.forEach((row, i) => {
        out.push(
          `<tr class="border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}">`,
        );
        row.forEach((c) => {
          out.push(`<td class="px-4 py-3 text-gray-700">${bold(c)}</td>`);
        });
        out.push("</tr>");
      });
      out.push("</tbody></table></div>");
      continue;
    }

    // ## Heading
    if (firstLine.startsWith("## ") && lines.length === 1) {
      out.push(
        `<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4 first:mt-0">${bold(firstLine.slice(3))}</h2>`,
      );
      continue;
    }
    // ### Heading
    if (firstLine.startsWith("### ") && lines.length === 1) {
      out.push(
        `<h3 class="text-xl font-bold text-gray-900 mt-8 mb-3">${bold(firstLine.slice(4))}</h3>`,
      );
      continue;
    }

    // Unordered list (lines starting with - )
    if (
      lines.every((l) => l.trimStart().startsWith("- ") || l.trimStart() === "")
    ) {
      out.push('<ul class="list-none space-y-2 my-4">');
      lines.forEach((l) => {
        const content = l.replace(/^\s*-\s*/, "").trim();
        if (content)
          out.push(
            `<li class="flex items-start gap-3"><span class="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2.5"></span><span class="text-gray-700">${bold(content)}</span></li>`,
          );
      });
      out.push("</ul>");
      continue;
    }

    // Paragraph(s)
    const para = trimmed.split(/\n/).join(" ");
    out.push(`<p class="mb-5 text-gray-700 leading-relaxed">${bold(para)}</p>`);
  }

  return out.join("");
}

export const vehicleVerificationGuidePosts = [
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
    image: whyMTMISAndOnlineVehicleVerificationAreImportant,
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
  {
    id: 3,
    stepNumber: "03",
    title: "What information can be checked through vehicle verification?",
    category: "Registration Records",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: auctionSheetVerification,
    excerpt:
      "Depending on the provincial system and what authorized channels publish, records may include vehicle registration number, make and model, engine and chassis information, and token status.",
    body: [
      "Depending on the provincial system and what authorized channels publish, records may include the items listed below. Use this information to catch issues before you buy. Engine and chassis numbers in the records should match the vehicle and its registration documents.",
    ],
    items: [
      "Vehicle registration number",
      "Registration date",
      "Vehicle make and model",
      "Manufacturing or model year",
      "Engine information",
      "Chassis information",
      "Vehicle body type",
      "Available ownership-related information",
      "Token fees or other related listing details",
      "Other information provided by the relevant authority",
    ],
    fullContent: `Depending on the provincial system and what authorized channels publish, records may include the items listed below. Use this information to catch issues before you buy. Engine and chassis numbers in the records should match the vehicle and its registration documents.

## Detailed Breakdown of Records

- **Vehicle Registration Number:** The official registration identifier allocated by the provincial excise authority.
- **Registration Date:** The exact date when the vehicle was first registered in Pakistan.
- **Vehicle Make and Model:** The verified brand (Toyota, Honda, Suzuki, etc.) and model variant.
- **Manufacturing or Model Year:** The actual production year, which may differ from the registration year for imported vehicles.
- **Engine Information:** The serial number stamped on the vehicle's engine block.
- **Chassis Information:** The Vehicle Identification Number (VIN) stamped on the frame.
- **Vehicle Body Type:** Sedan, hatchback, SUV, commercial carrier, etc.
- **Ownership Details:** The registered owner's name and authorized transfer status.
- **Token Tax Details:** Active payment status, arrears, and penalties if applicable.`,
  },
  {
    id: 4,
    stepNumber: "04",
    title: "Why MTMIS and online vehicle verification are important",
    category: "Transparency & Security",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: smartBuyingTips,
    excerpt:
      "When you buy a used car or motorcycle, it is a risk to rely only on what the seller says. A vehicle may pass a visual inspection and still have registration issues. Online tools like MTMIS add transparency.",
    body: [
      "When you buy a used car or motorcycle, it is a risk to rely only on what the seller says. A vehicle may pass a visual inspection and still have registration issues. Online tools like MTMIS add transparency so you can review available information before you proceed.",
      "Online checks are a useful tool when buying cars in Pakistan, but they are only one step. Also inspect the car in person, review documents, compare market prices, and complete a legal ownership transfer.",
    ],
    items: [
      "Display vehicle registration information",
      "Compare records with vehicle documents",
      "Help identify possible inconsistencies",
      "Add transparency during vehicle transactions",
      "Give buyers access to tax and registration information",
      "Reduce time spent searching basic registration details",
    ],
    fullContent: `When you buy a used car or motorcycle, it is a risk to rely only on what the seller says. A vehicle may pass a visual inspection and still have registration issues. Online tools like MTMIS add transparency so you can review available information before you proceed.

Online checks are a useful tool when buying cars in Pakistan, but they are only one step. Also inspect the car in person, review documents, compare market prices, and complete a legal ownership transfer.

## Key Advantages for Buyers

- **Eliminates Surprises:** Avoid purchasing vehicles with thousands of rupees in overdue token taxes.
- **Prevents Document Tampering:** Verify if registration cards or books have been altered.
- **Guarantees Smooth Transfer:** Ensure the vehicle has no legal or police holds preventing biometric transfer.`,
  },
  {
    id: 5,
    stepNumber: "05",
    title: "Why is car verification important before buying?",
    category: "Buyer Protection",
    readTime: "6 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: carCatBlog,
    excerpt:
      "The used-car market offers a wide choice, but every buyer should review the car carefully before finalizing a deal. Verification can surface issues that do not match what the seller reported.",
    body: [
      "The used-car market offers a wide choice, but every buyer should review the car carefully before finalizing a deal. Verification can surface issues that do not match what the seller reported, including chassis number, engine details, registration history, and other available records.",
      "Online records are a useful resource. They do not replace a physical inspection of the vehicle itself.",
    ],
    items: [
      "Vehicle registration details",
      "Registration city or province",
      "Vehicle make and model",
      "Engine and chassis information",
      "Available ownership details through authorized sources",
      "Token tax or related vehicle charges",
      "Registration documents",
      "Smart card or registration book details",
    ],
    fullContent: `The used-car market offers a wide choice, but every buyer should review the car carefully before finalizing a deal. Verification can surface issues that do not match what the seller reported, including chassis number, engine details, registration history, and other available records.

Online records are a useful resource. They do not replace a physical inspection of the vehicle itself.

## How Verification Protects Your Investment

Buying a vehicle is one of the largest financial investments most people make. A thorough verification ensures:

1. **You are paying a fair market price** based on the actual model year and spec level.
2. **You do not inherit legal penalties** or unpaid toll/traffic violations.
3. **The engine has not been illegally swapped** without Excise Department clearance.`,
  },
  {
    id: 6,
    stepNumber: "06",
    title: "How Sello helps with vehicle verification",
    category: "Sello Platform",
    readTime: "4 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: howSelloHelpsWithVehicleVerification,
    excerpt:
      "Sello makes buying and selling vehicles clearer by providing tools, vehicle information, and resources so you can make a more informed decision before you buy a used car in Pakistan.",
    body: [
      "Sello makes buying and selling vehicles clearer by providing tools, vehicle information, and resources so you can make a more informed decision. Before you buy a used car, use listings, buying guides, and pricing tools together with official registration checks.",
      "Choosing a car is about more than photos and price. Slow down and think through registration information, inspection, and comparison. Browse used cars for sale in Pakistan on Sello and compare options before you decide.",
    ],
    items: [
      "One-click direct links to provincial verification portals",
      "Comprehensive buyer guides for all 7 regions of Pakistan",
      "AI-driven car price estimates to prevent overpaying",
      "Integrated checklists for physical inspections and document checks",
    ],
    fullContent: `Sello makes buying and selling vehicles clearer by providing tools, vehicle information, and resources so you can make a more informed decision. Before you buy a used car, use listings, buying guides, and pricing tools together with official registration checks.

Choosing a car is about more than photos and price. Slow down and think through registration information, inspection, and comparison. Browse used cars for sale in Pakistan on Sello and compare options before you decide.

## Sello's Verification Toolkit

- **Direct Provincial Gateway:** Instant access to Punjab MTMIS, Sindh Excise, Islamabad ICT, KPK Excise, Balochistan, GB, and AJK official portals.
- **Valuation Benchmarks:** Accurate data-backed price checks to identify undervalued or suspiciously cheap listings.
- **Community Safety First:** We curate verified seller profiles and provide end-to-end guidance from verification to biometric transfer.`,
  },
  {
    id: 7,
    stepNumber: "07",
    title: "What information should you check during vehicle verification?",
    category: "Verification Checklist",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: vehicleVerificationHeroSection,
    excerpt:
      "A proper vehicle verification in Pakistan differs by province and by what the relevant authorities publish. Always compare official information with what the seller is offering.",
    body: [
      "A proper vehicle verification in Pakistan differs by province and by what the relevant authorities publish. Always compare official information with what the seller is offering.",
      "Pay close attention that engine and chassis serial numbers on the vehicle match the official documentation. If anything is inconsistent, look into it before you pay.",
    ],
    items: [
      "Vehicle registration number",
      "Make and model",
      "Manufacturing year",
      "Engine number",
      "Chassis number",
      "Registration date",
      "Registration city",
      "Available ownership information",
      "Applicable tax or token status",
      "Registration document details",
    ],
    fullContent: `A proper vehicle verification in Pakistan differs by province and by what the relevant authorities publish. Always compare official information with what the seller is offering.

Pay close attention that engine and chassis serial numbers on the vehicle match the official documentation. If anything is inconsistent, look into it before you pay.

## Essential Checklist for Buyers

- **Registration Number:** Ensure the plate format matches the official provincial standards.
- **Engine Serial:** Clean off grease and inspect the engine block stamping for grinding marks.
- **Chassis Plate:** Check the firewall or door jamb plate for factory rivets.
- **Token Tax Status:** Confirm taxes are paid for the current fiscal year.`,
  },
  {
    id: 8,
    stepNumber: "08",
    title: "Punjab vehicle verification",
    category: "Punjab Excise",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: punjabVehicleVerification,
    excerpt:
      "For Punjab-registered vehicles, use official government vehicle verification services. Punjab vehicle verification helps confirm a vehicle's details across all 36 districts.",
    body: [
      "For Punjab-registered vehicles, use official government vehicle verification services. Punjab vehicle verification helps confirm a vehicle's details. Use only authorized official sources for registration information.",
      "Government database information can change. Verify key details with the right authority when needed. Sello helps you know what to check, but official registration information should still come from the authorized government channel.",
    ],
    items: [
      "Access via Punjab Excise & Taxation official MTMIS portal",
      "Verifies vehicles registered in Lahore, Rawalpindi, Faisalabad, and more",
      "Live tracking of token tax status and automated smart card dispatch",
    ],
    fullContent: `For Punjab-registered vehicles, use official government vehicle verification services. Punjab vehicle verification helps confirm a vehicle's details. Use only authorized official sources for registration information.

Government database information can change. Verify key details with the right authority when needed. Sello helps you know what to check, but official registration information should still come from the authorized government channel.

## Punjab MTMIS Highlights

Punjab boasts one of the most mature digitized transport databases in Pakistan.
- **Portal URL:** \`mtmis.excise.punjab.gov.pk\`
- **Coverage:** Covers all motor cars, motorcycles, commercial vehicles, and tractors registered in Punjab.
- **Search Key:** Enter the vehicle registration number (e.g. \`LEA-12-1234\` or \`ICT-99-9999\`).`,
  },
  {
    id: 9,
    stepNumber: "09",
    title: "Car registration check before buying a used car",
    category: "Used Car Due Diligence",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: carRegistrationCheckBeforeBuyingAUsedCar,
    excerpt:
      "A used-car registration check should be near the top of your list. Before you pay or finalize the deal, compare the seller's documents with the vehicle information in front of you.",
    body: [
      "A used-car registration check should be near the top of your list. Before you pay or finalize the deal, compare the seller's documents with the vehicle information in front of you.",
      "Check registration information against the vehicle at inspection, including chassis and engine numbers. In Punjab, a proper registration check through the relevant provincial authority adds extra assurance.",
      "Records are only part of the picture. Also look at mechanical condition, bodywork, maintenance history, and available ownership documents.",
    ],
    items: [
      "Verify seller documents with physical vehicle badges",
      "Cross-check original invoice and sales tax receipts",
      "Inspect maintenance history and mileage consistency",
    ],
    fullContent: `A used-car registration check should be near the top of your list. Before you pay or finalize the deal, compare the seller's documents with the vehicle information in front of you.

Check registration information against the vehicle at inspection, including chassis and engine numbers. In Punjab, a proper registration check through the relevant provincial authority adds extra assurance.

Records are only part of the picture. Also look at mechanical condition, bodywork, maintenance history, and available ownership documents.

## Critical Verification Steps

1. Verify that the registration certificate is original, not a duplicate.
2. Confirm that previous owner transfers were formally logged.
3. Check for any customs auction history or amnesty scheme notations.`,
  },
  {
    id: 10,
    stepNumber: "10",
    title: "How to check car details before buying",
    category: "Step-by-Step Check",
    readTime: "6 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: howCarCondition,
    excerpt:
      "Start with the information the seller has. Ask for the registration number and go over the registration documents, then run the authorized provincial check.",
    body: [
      "Start with the information the seller has. Ask for the registration number and go over the registration documents. Then use the authorized vehicle check for the province where the car is registered, and compare the result with the car and its paperwork.",
      "Also inspect the car in person. Look for accident damage, paint retouches, engine issues, suspension problems, or chassis changes. Taking these related steps together reduces the chance of a bad purchase.",
    ],
    items: [
      "Checking available registration information",
      "Matching the engine and chassis details",
      "Inspecting the original documents",
      "Reviewing the vehicle's physical condition",
      "Checking maintenance records, if available",
      "Asking about accident or repair history",
      "Comparing the asking price with similar models",
    ],
    fullContent: `Start with the information the seller has. Ask for the registration number and go over the registration documents. Then use the authorized vehicle check for the province where the car is registered, and compare the result with the car and its paperwork.

Also inspect the car in person. Look for accident damage, paint retouches, engine issues, suspension problems, or chassis changes. Taking these related steps together reduces the chance of a bad purchase.

## Detailed Procedure

1. **Digital Search:** Run the registration number on the official MTMIS portal.
2. **Document Inspection:** Inspect the smart card or registration book under good light.
3. **Physical Inspection:** Verify serial numbers on the car match the paperwork exactly.
4. **Market Comparison:** Use Sello's AI estimator to verify if the asking price aligns with real market values.`,
  },
  {
    id: 11,
    stepNumber: "11",
    title: "Vehicle verification in Lahore and other cities",
    category: "City Guides",
    readTime: "4 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: vehicleVerificationInLahoreAndOtherCities,
    excerpt:
      "For vehicle verification in Lahore, the process follows where the vehicle is registered, not where it currently sits. A car registered in Lahore should be checked through Punjab records.",
    body: [
      "For vehicle verification in Lahore, the process follows where the vehicle is registered, not where it currently sits. A car registered in Lahore should be checked through the relevant Punjab records even if it is now in another city.",
      "The same rule applies to vehicles in Karachi, Islamabad, Rawalpindi, Faisalabad, and other cities in Pakistan. Always review the registration information and use the correct official portal for that registration.",
    ],
    items: [
      "Verification depends on city of registration, not physical location",
      "Punjab MTMIS covers Lahore, Faisalabad, Multan, and Rawalpindi",
      "Sindh Excise covers Karachi, Hyderabad, and Sukkur",
      "ICT Excise covers Islamabad Capital Territory",
    ],
    fullContent: `For vehicle verification in Lahore, the process follows where the vehicle is registered, not where it currently sits. A car registered in Lahore should be checked through the relevant Punjab records even if it is now in another city.

The same rule applies to vehicles in Karachi, Islamabad, Rawalpindi, Faisalabad, and other cities in Pakistan. Always review the registration information and use the correct official portal for that registration.

## Regional Guidelines

- **Vehicles in Lahore:** If registered with a \`LE\` or \`LEA\` series, check via Punjab MTMIS. If registered in Islamabad (\`ICT\` or \`IDN\`), use the Islamabad Excise portal.
- **Vehicles in Karachi:** Check Sindh Excise vehicle search for \`K\` series plates.
- **Vehicles in Peshawar:** Use KPK Excise MV records.`,
  },
  {
    id: 12,
    stepNumber: "12",
    title: "Punjab Excise vehicle verification",
    category: "Excise & Taxation",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: verificationPostImg,
    excerpt:
      "Many buyers looking at a car or bike in Punjab use Punjab Excise vehicle verification. Registration information is held by the appropriate government bodies, so use official sources.",
    body: [
      "Many buyers looking at a car or bike in Punjab use Punjab Excise vehicle verification. Registration information is held by the appropriate government bodies, so use official sources.",
      "If you have questions about a document's authenticity or title status, contact the relevant Excise and Taxation authority before you purchase.",
    ],
    items: [
      "The registration document",
      "The vehicle number",
      "Engine details",
      "Chassis details",
      "Available registration information",
    ],
    fullContent: `Many buyers looking at a car or bike in Punjab use Punjab Excise vehicle verification. Registration information is held by the appropriate government bodies, so use official sources.

If you have questions about a document's authenticity or title status, contact the relevant Excise and Taxation authority before you purchase.

## What Punjab Excise Records Show

- **Engine and Chassis Number:** To compare with the metal stampings.
- **CPLC / Stolen Verification:** Confirms no police records or FIR holds.
- **Tax Clearance Certificate:** Details of lifetime or annual token tax payments.`,
  },
  {
    id: 13,
    stepNumber: "13",
    title: "Online bike registration check",
    category: "Motorcycle Verification",
    readTime: "4 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: bikeCatBlog,
    excerpt:
      "Vehicle checks go beyond cars. An online bike registration check is useful when you buy or sell a used motorcycle to avoid stolen or clone vehicles.",
    body: [
      "Vehicle checks go beyond cars. An online bike registration check is useful when you buy or sell a used motorcycle. Before you buy, check registration information, engine and frame numbers, and the registration documents in person.",
      "Also review the bike's physical condition. Mechanical issues, accident damage, and missing documentation can affect value and how well it runs. A bike registration check is especially important when buying from an individual seller.",
    ],
    items: [
      "Motorcycle frame and engine number verification",
      "Cross-check against police 15 / CPLC stolen bike database",
      "Smart card verification for Honda, Yamaha, Suzuki, and Chinese bikes",
    ],
    fullContent: `Vehicle checks go beyond cars. An online bike registration check is useful when you buy or sell a used motorcycle. Before you buy, check registration information, engine and frame numbers, and the registration documents in person.

Also review the bike's physical condition. Mechanical issues, accident damage, and missing documentation can affect value and how well it runs. A bike registration check is especially important when buying from an individual seller.

## Bike Check Guidelines

1. **Inspect the Frame Neck:** Look for the chassis number stamped near the handlebar column. Ensure it has no welding or grinding marks.
2. **Check the Crankcase:** Compare the engine number stamped on the left crankcase with the registration card.
3. **Verify Token Tax:** In Punjab and Sindh, most 70cc-125cc motorcycles have lifetime token taxes paid. Verify that this status is reflected online.`,
  },
  {
    id: 14,
    stepNumber: "14",
    title: "Can you check the vehicle owner?",
    category: "Ownership Records",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: trustLegal,
    excerpt:
      "Many users want to check the vehicle owner before buying a car or bike. What is available to the public varies by law, privacy rules, and provincial policies.",
    body: [
      "Many users want to check the vehicle owner before buying a car or bike. What is available to the public varies by law, privacy rules, and what official registration authorities publish.",
      "Use authorized channels only, and only for genuine purchase or transfer needs. The most important step is confirming the seller has the right to sell and that ownership transfer is completed correctly. Never rely on verbal claims alone.",
    ],
    items: [
      "Understand public privacy regulations across provinces",
      "Verify seller CNIC against the registered owner name",
      "Ensure an active biometric transfer can be executed immediately",
    ],
    fullContent: `Many users want to check the vehicle owner before buying a car or bike. What is available to the public varies by law, privacy rules, and what official registration authorities publish.

Use authorized channels only, and only for genuine purchase or transfer needs. The most important step is confirming the seller has the right to sell and that ownership transfer is completed correctly. Never rely on verbal claims alone.

## Privacy & Ownership Verification

Due to citizen privacy laws, some provincial portals mask the owner's full father name or CNIC digits. However, you can always:
- Verify the first name / initial of the registered owner.
- Confirm whether the vehicle is registered to an individual or a company/bank.
- Verify the seller's original CNIC matches the registered name prior to transferring funds.`,
  },
  {
    id: 15,
    stepNumber: "15",
    title: "Vehicle registration and smart card verification",
    category: "Smart Card Verification",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: vehicleRegistrationAndSmartCardVerification,
    excerpt:
      "Registration may be an Excise book, smart card, or official document depending on the vehicle and province. Check documents against the physical vehicle.",
    body: [
      "Registration may be a book, smart card, or another government-recognized document, depending on the vehicle and authority. Before you buy, check the documents against the physical vehicle.",
      "For a bike smart-card check or a car document review, verify the registration number, engine number, and chassis number. If details do not add up, do not complete the transaction. It is easier to resolve issues before payment than after.",
    ],
    items: [
      "Verify microchip features and holographic security marks",
      "Distinguish between original smart cards and duplicate issuances",
      "Check engine and chassis numbers against registration books",
    ],
    fullContent: `Registration may be a book, smart card, or another government-recognized document, depending on the vehicle and authority. Before you buy, check the documents against the physical vehicle.

For a bike smart-card check or a car document review, verify the registration number, engine number, and chassis number. If details do not add up, do not complete the transaction. It is easier to resolve issues before payment than after.

## Smart Card Security Features

- **Embedded RFID Microchip:** Stores encrypted vehicle and owner data.
- **Holographic Overlay:** Government seal visible under direct light.
- **UV Watermark:** Official provincial insignia reactive to ultraviolet lamps.`,
  },
  {
    id: 16,
    stepNumber: "16",
    title: "Why physical inspection is also important",
    category: "Physical Inspection",
    readTime: "6 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: whyPhysicalInspectionIsAlsoImportant,
    excerpt:
      "Online vehicle verification gives registration information, not mechanical condition. A car may have a clean registration history and still have accident repairs.",
    body: [
      "Online vehicle verification usually gives registration information, not mechanical condition. A car may have a clean registration history and still have accident repairs or other problems that only show up at inspection. For higher-value cars, a professional inspection is a smart extra step.",
    ],
    items: [
      "Engine performance",
      "Suspension condition",
      "Transmission operation",
      "AC and electrical systems",
      "Paint and body panels",
      "Tire condition",
      "Signs of accident repairs",
      "Interior condition",
    ],
    fullContent: `Online vehicle verification usually gives registration information, not mechanical condition. A car may have a clean registration history and still have accident repairs or other problems that only show up at inspection. For higher-value cars, a professional inspection is a smart extra step.

## Key Inspection Areas

- **Engine Health:** Check for abnormal smoke (blue or white), oil leaks, blow-by, and cold-start rattle.
- **Structural Integrity:** Inspect the radiator core support, apron pillars, and trunk floor for rework or welding.
- **Transmission Functionality:** Smooth engagement in all gears without slipping, jerking, or delay.
- **Electrical Diagnostics:** Check OBD-II codes, ABS lights, airbag sensors, and infotainment systems.`,
  },
  {
    id: 17,
    stepNumber: "17",
    title: "Buy and sell vehicles with more confidence",
    category: "Confident Transactions",
    readTime: "5 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: buyAndSellVehiclesWithMoreConfidence,
    excerpt:
      "Vehicle checks are one piece of a smart purchase. Also look at market prices, inspect the vehicle, review documents, and research ownership transfer.",
    body: [
      "Vehicle checks are one piece of a smart purchase. Also look at market prices, inspect the vehicle, review documents, and research ownership transfer.",
      "Sello lets you browse used cars for sale in Pakistan and use resources to buy and sell with more confidence. Take time to compare cars and what they are worth in the market. If you are buying or selling, Sello's AI car estimator can give a market range before you agree on a price.",
    ],
    items: [
      "Real-time market valuation benchmarks",
      "Biometric transfer compliance support",
      "Protection from fraudulent middlemen and unregistered dealers",
    ],
    fullContent: `Vehicle checks are one piece of a smart purchase. Also look at market prices, inspect the vehicle, review documents, and research ownership transfer.

Sello lets you browse used cars for sale in Pakistan and use resources to buy and sell with more confidence. Take time to compare cars and what they are worth in the market. If you are buying or selling, Sello's AI car estimator can give a market range before you agree on a price.

## Sello's Smart Buying Principles

1. Never finalize a deal without checking the vehicle's online registration records.
2. Complete the physical inspection during daylight hours.
3. Process the biometric ownership transfer simultaneously with payment.`,
  },
  {
    id: 18,
    stepNumber: "18",
    title: "Why choose Sello?",
    category: "Why Sello",
    readTime: "4 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: whyChooseSello,
    excerpt:
      "Buying or selling a car is more than connecting a buyer and seller. You need to understand the car, review records, check its condition, and verify its market price.",
    body: [
      "Buying or selling a car is more than connecting a buyer and a seller. You need to understand the car, review available information, check its condition, and see its price. Sello brings together vehicle tools that support that process.",
      "Whether you are buying your first car or trading in your current one, research and due diligence make the process safer and easier.",
    ],
    items: [
      "Vehicle listings",
      "Used-car buying resources",
      "Vehicle comparison guides",
      "Car pricing insights",
      "AI car estimation tools",
      "Information about buying and selling vehicles",
    ],
    fullContent: `Buying or selling a car is more than connecting a buyer and a seller. You need to understand the car, review available information, check its condition, and see its price. Sello brings together vehicle tools that support that process.

Whether you are buying your first car or trading in your current one, research and due diligence make the process safer and easier.

## Platform Features

- **Transparent Valuation:** Eliminates dealer markups and guesswork.
- **Verified Sellers:** Direct communication with registered car owners.
- **National Reach:** Connect with buyers and sellers across Lahore, Karachi, Islamabad, Peshawar, Quetta, and beyond.`,
  },
  {
    id: 19,
    stepNumber: "19",
    title: "Final thoughts",
    category: "Expert Advice",
    readTime: "4 min read",
    author: "Sello Verification Team",
    date: "November 2026",
    image: finalThoughts,
    excerpt:
      "Online vehicle verification is a key step when you buy a used car or bike in Pakistan. Review registration information, compare documents, and inspect thoroughly.",
    body: [
      "Online vehicle verification is a key step when you buy a used car or bike in Pakistan. Review registration information, compare documents with the vehicle, and do a thorough physical inspection so you can decide with more confidence.",
      "For official checks and registration, use only authorized sources. Online verification supports a physical inspection and document review; it does not replace them. Before you finalize a deal, verify the information, inspect the vehicle, and complete ownership transfer correctly.",
      "Sello provides tools, information, resources, and listings that make buying and selling vehicles clearer so you can make a better decision.",
    ],
    items: [
      "Always verify before paying any deposit or advance",
      "Inspect chassis and engine serial stampings physically",
      "Ensure biometric transfer takes place without open-letter delays",
    ],
    fullContent: `Online vehicle verification is a key step when you buy a used car or bike in Pakistan. Review registration information, compare documents with the vehicle, and do a thorough physical inspection so you can decide with more confidence.

For official checks and registration, use only authorized sources. Online verification supports a physical inspection and document review; it does not replace them. Before you finalize a deal, verify the information, inspect the vehicle, and complete ownership transfer correctly.

Sello provides tools, information, resources, and listings that make buying and selling vehicles clearer so you can make a better decision.

## Summary Checklist Before You Pay

- [ ] Online MTMIS check matches vehicle make, model, and year.
- [ ] Engine and chassis numbers on paperwork match the physical car.
- [ ] Token tax is fully cleared up to date.
- [ ] Seller is the registered owner or holds a legal biometric transfer authority.
- [ ] Mechanical condition is verified by an experienced inspector.`,
  },
];

export default function VehicleVerificationGuideSection() {
  const handleScrollToProvinces = (e) => {
    e.preventDefault();
    const elem = document.getElementById("select-province");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="py-16 sm:py-24 bg-white relative overflow-hidden"
      id="complete-guide"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 text-primary-600 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 border border-primary-500/20">
            <ShieldCheck className="w-4 h-4 text-primary-500" />
            <span>The Complete 19-Step Guide</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            19 Steps to Verify Any Vehicle in{" "}
            <span className="text-primary-500">Pakistan</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Everything you need to know about checking registration, engine and
            chassis numbers, token taxes, smart cards, and avoiding common
            pitfalls before you buy.
          </p>
        </div>

        {/* Alternating Cards Grid */}
        <div className="space-y-8 lg:space-y-12">
          {vehicleVerificationGuidePosts.map((post, index) => {
            const isImageLeft = index % 2 === 1; // odd = image left, even = image right
            return (
              <motion.article
                key={post.id}
                id={`guide-step-${post.id}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.05 }}
                className={`group flex flex-col rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-[#FDFBF7] ${
                  isImageLeft ? "lg:flex-row-reverse" : "lg:flex-row"
                }`}
              >
                {/* Content area */}
                <div className="relative flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-10 min-h-[260px] lg:min-h-0 lg:min-w-0">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-8 h-8 rounded-full bg-gray-200/80 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {post.author}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{post.date}</span>
                    </div>

                    <h3 className="text-2xl lg:text-3xl font-bold text-primary-500 mb-4 leading-tight">
                      <span className="text-primary-500 mr-2">
                        {post.stepNumber}.
                      </span>
                      {post.title}
                    </h3>

                    <p className="text-base lg:text-lg leading-relaxed mb-6 text-gray-600">
                      {post.excerpt}
                    </p>

                    <Link
                      to={`/vehicle-verification/guide/${post.id}`}
                      className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-95 transition-opacity shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 group cursor-pointer"
                    >
                      Read More
                      <ArrowRight
                        className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </div>

                {/* Image area */}
                <div className="relative w-full lg:w-[500px] xl:w-[540px] lg:flex-shrink-0 h-72 sm:h-80 lg:h-[370px] xl:h-[390px] lg:self-stretch overflow-hidden bg-slate-900/5">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full block object-cover object-center opacity-90 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute top-5 left-5">
                    <span className="inline-flex items-center gap-2 bg-white/95 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 flex items-center gap-2 text-white text-sm bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow">
                    <Clock className="w-4 h-4 text-white" aria-hidden />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Enhanced Call to Action */}
        <div className="mt-12 sm:mt-20 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[320px] h-[320px] sm:w-[600px] sm:h-[600px] bg-primary-500 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <div className="bg-primary-500 rounded-3xl p-6 sm:p-10 lg:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Official Provincial Portals
                </div>
                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                  Ready to Verify Your
                  <span className="text-yellow-300"> Vehicle Records</span>?
                </h3>
                <p className="text-base sm:text-xl mb-8 sm:mb-10 text-white/90 max-w-2xl mx-auto leading-relaxed">
                  Select your province above or click below to check registration
                  details, token taxes, and ownership records via official MTMIS
                  portals.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleScrollToProvinces}
                    className="bg-white text-primary-500 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-500 cursor-pointer"
                  >
                    <span>Check Official Portals</span>
                    <ArrowRight className="w-5 h-5" aria-hidden />
                  </button>
                  <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-white/80 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Free to Use</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                      <span>All 7 Provinces</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
