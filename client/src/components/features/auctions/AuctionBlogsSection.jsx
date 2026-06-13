import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, User } from "lucide-react";
import carAuctionImg from "../../../assets/blogs/carAuction.svg";
import auctionSheetVerificationImg from "../../../assets/blogs/auctionSheetVerification.svg";

/** True if the line is ONLY # / ＃ characters (broken markdown), no title text. */
function isHashOnlyLine(line) {
  const t = line.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (!t) return false;
  return /^[#＃]+$/.test(t);
}

/** Format markdown-like blog content to safe HTML (paragraphs, headings, bold, lists, tables). */
export function formatBlogContent(text) {
  if (!text || typeof text !== "string") return "";
  // Strip every line that is nothing but hashes (fixes stray "#" before sections)
  const withoutHashLines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => (isHashOnlyLine(line) ? "" : line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");

  const normalized = withoutHashLines
    // put headings on new lines if they appear mid-line
    .replace(/([^\n])\s*(##\s+)/g, "$1\n\n$2")
    .replace(/([^\n])\s*(###\s+)/g, "$1\n\n$2")
    // put list items on new lines if they appear inline like: "Process - A - B"
    .replace(/([^\n])\s(-\s+)/g, "$1\n$2")
    // split chained bullets on one line: "- A - B - C" -> "- A\n- B\n- C"
    .replace(/-\s+([^-\n][^\n]*?)\s+-\s+/g, "- $1\n- ");

  const blocks = normalized.split(/\n\n+/);
  const out = [];
  const bold = (s) =>
    s.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-gray-900">$1</strong>',
    );

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    // Skip whole block if it's only hashes (e.g. "###" alone)
    if (isHashOnlyLine(trimmed)) continue;

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
          `<tr class=\"border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}\">`,
        );
        row.forEach((c) => {
          out.push(`<td class="px-4 py-3 text-gray-700">${bold(c)}</td>`);
        });
        out.push("</tr>");
      });
      out.push("</tbody></table></div>");
      continue;
    }

    // Headings (support trailing text in same block too)
    if (firstLine.startsWith("## ")) {
      const title = firstLine.slice(3).trim();
      out.push(
        `<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-4 first:mt-0">${bold(title)}</h2>`,
      );
      if (lines.length > 1) {
        const rest = lines.slice(1).join(" ").trim();
        if (rest)
          out.push(
            `<p class="mb-5 text-gray-700 leading-relaxed">${bold(rest)}</p>`,
          );
      }
      continue;
    }
    if (firstLine.startsWith("### ")) {
      const title = firstLine.slice(4).trim();
      out.push(
        `<h3 class="text-xl font-bold text-gray-900 mt-8 mb-3">${bold(title)}</h3>`,
      );
      if (lines.length > 1) {
        const rest = lines.slice(1).join(" ").trim();
        if (rest)
          out.push(
            `<p class="mb-5 text-gray-700 leading-relaxed">${bold(rest)}</p>`,
          );
      }
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
            `<li class="flex items-start gap-3"><span class=\"w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2.5\"></span><span class=\"text-gray-700\">${bold(content)}</span></li>`,
          );
      });
      out.push("</ul>");
      continue;
    }

    const para = trimmed.split(/\n/).join(" ").trim();
    if (!para || isHashOnlyLine(para)) continue;
    out.push(`<p class="mb-5 text-gray-700 leading-relaxed">${bold(para)}</p>`);
  }

  let html = out.join("");
  // Remove any paragraph that is only hashes (broken markdown leftovers)
  html = html.replace(
    /<p class="mb-5 text-gray-700 leading-relaxed">\s*[#＃\s]*<\/p>/g,
    "",
  );
  return html;
}

export const auctionBlogPosts = [
  {
    id: 1,
    title:
      "Car Auction in Pakistan: Online Car Auction & Japan Auction Cars Guide",
    excerpt:
      "Looking for a dependable car auction in Pakistan? See how online car auctions work, Japan auction imports, custom auction cars, and how to buy or sell easily.",
    metaDescription:
      "Explore the car auction scene in Pakistan which includes online car auctions, Japanese imported cars, custom cars up for auction, and cars for sale in Pakistan.",
    h1: "Car Auction in Pakistan – Buy & Sell Through Online Car Auctions",
    fullContent: `Live Auctions & Buy Cars in Pakistan the Smart Way
The auto market is transforming at great speed which is also seen in the rise of live auctions as a very reliable platform to buy cars in Pakistan. Whether you are in the market for an economy car, import, or high end SUV car auctions in Pakistan are the place to go for you to get the best prices and open bid options.

At present, if you wish to sale your cars with Sello, we help you connect with serious buyers right away which in turn shortens the wait time.

## What is a Car Auction in Pakistan?
A car auction in Pakistan is a market place which puts out cars for bid. Buyers put in their bids and the highest one takes home the car. Auctions also do which of the things:

- Physical yard auctions
- Bank repossession auctions
- Government auctions
- Online car auction platforms

Today what we see is that buyers favor online car auction systems which they find to be very convenient, transparent and which also happen to be accessible from anywhere.

## Online Car Auction – How It Works
An online car auction is a platform which you browse, bid, and buy cars from.

### Step-by-Step Process
- Register on auction platform
- Browse available vehicles
- Join live auctions
- Place your bid
- Complete payment & transfer

## Japan Car Auction – Why It’s Popular
In Pakistan there is great interest in the Japanese car auction market.

### Why Choose Japan Auction Cars?
- Well-maintained vehicles
- Verified auction grading system
- Competitive pricing
- Access to rare models

## Things to Consider Before Bidding
Before entering a car auction in Pakistan, always:
- Verify documentation
- Understand auction fees
- Inspect damage reports
- Confirm import duty (for Japan cars)

## FAQs – Car Auction in Pakistan
**In Pakistan what is a car auction?**
At an auto auction vehicles are sold to the highest bid.

**Is it safe to use online car auctions?**
If via trusted platforms which have open bidding and verified documentation.

**Can I purchase cars from Japan auctions in Pakistan?**
Yes many agents provide Japanese car auctions online for Pakistan which is for imports.

## Final Thoughts
A car auction in Pakistan is seeing a transformation of how people buy and sell vehicles. Online auctions are a game changer in terms of convenience, variety and price.`,
    image: carAuctionImg,
    author: "Sello Auctions Team",
    readTime: "9 min read",
    category: "Auction Guide",
    date: "March 2026",
  },
  {
    id: 2,
    title:
      "Auction Sheet Verification – Complete Guide to Reading Japanese Auction Sheets",
    excerpt:
      "Buying a foreign car? See how auction sheet verification is done, what an auction sheet is all about, and how to check out Japanese auction sheets online.",
    metaDescription:
      "Learn to verify auction sheets in Pakistan, how to read Japanese auction sheet grades, and to do it online for free before purchase.",
    h1: "Auction Sheet Verification – Complete Guide to Reading Japanese Auction Sheets",
    fullContent: `Live Auctions & Buy Cars in Pakistan with Confidence
Imported cars into live auctions are on the rise which includes Japanese imports. In Pakistan many buyers that are into car purchase are using online bidding platforms. But before you place a bid it is important to go over auction sheet verification.

## What is an Auction Sheet?
Auction sheets which are issued by Japanese auction houses are of an official nature. They include:
- Vehicle grade
- Mileage details
- Interior & exterior condition
- Accident history
- Repair marks
- Inspector notes

Until proper auction report verification is done by buyers’ side they are at risk of getting vehicles with hidden issues.

## Auction Sheet Verification – Why It Is Important
Auction sheet verification ensures:
- The document is original
- The mileage is authentic
- No grade tampering has occurred
- Accident history matches condition

## How to Read Auction Sheet (Step-by-Step Guide)
### Auction Grade
Grades usually range from:
- 5 (Excellent condition)
- 4 (Very good)
- 3 (Average)
- R / RA (Repaired vehicle)

### Interior Grade
Typically rated A to D:
- A = Excellent
- B = Good
- C = Average
- D = Poor

### Mileage Section
Always check the mileage reported at the car auction sheet against the vehicle’s odometer.

### Damage Map Diagram
The chart includes scratches, dents, and repairs which are indicated by coded symbols.

## Auction Sheet Verification Online Free – Is It Possible?
Many buyers turn to the internet for free auction sheet verification. Although some platforms provide a limited look, full verification is a paid service. Be aware of free identity verification scams.

## FAQs – Auction Sheet Verification
**What is the process of auction sheet verification?**
Auction document authentication is performed for that of a Japanese auction before purchase.

**Is there free online auction sheet verification?**
Some services are free, but full Japan auction sheet verification is usually a paid feature.

**What is the importance of the Japanese auction sheet?**
It gives out confirmed reports of condition, mileage, and accident history.

## Final Thoughts
Auction sheets protect you from cars with hidden damage, mileage fraud, and poor overall condition. Verified documentation brings transparency and trust to each transaction.`,
    image: auctionSheetVerificationImg,
    author: "Sello Verification Team",
    readTime: "10 min read",
    category: "Japan Auctions",
    date: "March 2026",
  },
];

export default function AuctionBlogsSection() {
  return (
    <section className="w-full bg-gradient-to-b from-gray-50 to-white py-12 sm:py-16">
      <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-500 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
              Auction Guides
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Car Auction <span className="text-primary-500">Insights</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Learn online bidding basics, Japan import checks, and verification
              steps before you place a bid.
            </p>
          </div>
        </div>

        <div className="space-y-8 lg:space-y-12">
          {auctionBlogPosts.map((post, index) => {
            const isImageLeft = index % 2 === 1;
            return (
              <article
                key={post.id}
                className={`group flex flex-col rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-[#FDFBF7] lg:items-start ${isImageLeft ? "lg:flex-row-reverse" : "lg:flex-row"}`}
              >
                <div className="relative flex-1 flex flex-col justify-between p-5 sm:p-8 lg:p-10 min-h-[260px] lg:min-h-0 lg:min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-200/80 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {post.author}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500">{post.date}</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-500 mb-4 leading-tight break-words">
                      {post.title}
                    </h3>

                    <p className="text-sm sm:text-base lg:text-lg leading-relaxed mb-6 text-gray-600">
                      {post.excerpt}
                    </p>

                    <Link
                      to={`/auctions/guide/${post.id}`}
                      className="inline-flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-95 transition-opacity shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 group"
                    >
                      Read More
                      <ArrowRight
                        className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </div>

                <div className="relative w-full lg:w-[520px] lg:flex-shrink-0 h-56 sm:h-72 lg:h-[400px] lg:min-h-[400px] lg:self-stretch overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="absolute inset-0 size-full block object-cover object-center opacity-90"
                    loading="lazy"
                  />
                  <div className="absolute top-5 left-5">
                    <span className="inline-flex items-center gap-2 bg-white/95 text-gray-800 px-3 py-1.5 rounded-full text-sm font-semibold shadow">
                      <span className="w-1.5 h-1.5 bg-primary-500 rounded-full" />
                      {post.category}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 flex items-center gap-2 text-gray-200 text-sm">
                    <Clock className="w-4 h-4" aria-hidden />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

