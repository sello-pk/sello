import React from "react";
import { useSearchParams } from "react-router-dom";
import GuideCards from "../../common/GuideCards";
import { vehicleCategoryConfig } from "../../../config/vehicleCategoryConfig";

const CATEGORY_ORDER = ["car", "bus", "truck", "van", "bike", "e-bike", "farm"];

const dummyBlogBySlug = {
  car: {
    title: "How to Choose the Right Used Car in Pakistan (2026 Guide)",
    excerpt:
      "Let's face it—buying a used car in Pakistan isn't just about saving money. It's about dodging headaches and finding a reliable ride.",
    fullContent:
      "Let's face it—buying a used car in Pakistan isn't just about saving money. It's about dodging headaches and finding a reliable ride. Here's your guide to making a smart choice.\n\n**Set a budget** — Decide how much you can spend and stick to it. Include registration, insurance, and a buffer for repairs.\n\n**Check history** — Get the vehicle's history, verify ownership, and look for accident or flood damage.\n\n**Inspect thoroughly** — Take a trusted mechanic or do a thorough test drive. Check engine, brakes, suspension, and electricals.\n\n**Compare listings** — Use Sello to compare similar cars by price, condition, and location so you don't overpay.",
    author: "Sello Expert",
    date: "Jan 18, 2026",
    readTime: "15 min",
  },
  bus: {
    title: "How to Buy the Right Bus in Pakistan – 2026 Guide",
    excerpt:
      "Buying a bus in Pakistan isn't a small decision. Whether you're running a transport business or adding to your fleet, here's what you need to know.",
    fullContent:
      "Buying a bus in Pakistan isn't a small decision. Whether you're running a transport business or adding to your fleet, here's what you need to know.\n\n**Define your use** — Passenger, school, or tourism? Capacity and comfort requirements will narrow your options.\n\n**Budget and financing** — Buses are a large investment. Explore financing options and total cost of ownership.\n\n**Condition and compliance** — Check fitness, route permits, and maintenance records. Non-compliant buses can cost you later.\n\n**Where to buy** — Use Sello to browse verified bus listings and connect with sellers who can provide documentation.",
    author: "Sello Expert",
    date: "Jan 18, 2026",
    readTime: "12 min",
  },
  truck: {
    title: "Truck Buying Guide: What to Look For in Pakistan",
    excerpt:
      "From payload capacity to fuel efficiency, learn how to pick the right truck for your business and avoid common pitfalls in the Pakistani market.",
    fullContent:
      "From payload capacity to fuel efficiency, learn how to pick the right truck for your business and avoid common pitfalls in the Pakistani market.\n\n**Payload and usage** — Match the truck to your typical load and terrain. Overloading or underusing both cost money.\n\n**Engine and fuel** — Diesel is common for heavy use. Check fuel efficiency and availability of parts and service.\n\n**Legal and papers** — Verify registration, fitness, and any route or weight restrictions.\n\n**Inspection** — Have a mechanic check the chassis, brakes, and transmission. Repair costs on trucks can be high.",
    author: "Sello Expert",
    date: "Jan 15, 2026",
    readTime: "10 min",
  },
  van: {
    title: "Van Buying Guide – Passenger & Cargo Vans in Pakistan",
    excerpt:
      "Vans are versatile. Whether you need one for passengers or cargo, this guide helps you compare options and find the best value in Pakistan.",
    fullContent:
      "Vans are versatile. Whether you need one for passengers or cargo, this guide helps you compare options and find the best value in Pakistan.\n\n**Passenger vs cargo** — Passenger vans need seating and safety features; cargo vans need load space and durability. Don't mix requirements.\n\n**Engine and mileage** — Consider fuel type and typical mileage. Well-maintained engines last longer and resell better.\n\n**Documentation** — Verify ownership, registration, and any commercial permits if you're using it for business.\n\n**Inspect and test drive** — Check AC, doors, and suspension. Use Sello to compare similar vans before you buy.",
    author: "Sello Expert",
    date: "Jan 12, 2026",
    readTime: "8 min",
  },
  bike: {
    title: "Motorcycle Buying Tips for Pakistani Riders",
    excerpt:
      "From commuter bikes to performance machines, here's how to choose a motorcycle that fits your needs and budget in Pakistan.",
    fullContent:
      "From commuter bikes to performance machines, here's how to choose a motorcycle that fits your needs and budget in Pakistan.\n\n**Purpose** — Daily commute, delivery, or leisure? This decides engine size, fuel economy, and features.\n\n**New vs used** — Used bikes can save money but check for accidents and engine condition. Service history matters.\n\n**Spare parts** — Choose brands and models with good parts availability in your city.\n\n**Papers and test ride** — Verify registration and take a test ride. Check brakes, lights, and handling.",
    author: "Sello Expert",
    date: "Jan 10, 2026",
    readTime: "8 min",
  },
  "e-bike": {
    title: "E-Bikes in Pakistan: A Complete Buying Guide",
    excerpt:
      "Electric bikes and scooters are growing in Pakistan. Learn about range, charging, and which model suits your daily commute or delivery needs.",
    fullContent:
      "Electric bikes and scooters are growing in Pakistan. Learn about range, charging, and which model suits your daily commute or delivery needs.\n\n**Range and battery** — Check real-world range, not just claims. Battery warranty and replacement cost matter.\n\n**Charging** — Where will you charge? Home, office, or public points? Charging time affects daily use.\n\n**Build and warranty** — Prefer brands with service networks and clear warranty terms.\n\n**Compare on Sello** — Filter by type, range, and price to find e-bikes and scooters that fit your needs.",
    author: "Sello Expert",
    date: "Jan 8, 2026",
    readTime: "9 min",
  },
  farm: {
    title: "Farm Vehicles & Equipment: Buying Guide for Pakistan",
    excerpt:
      "Tractors, harvesters, and agricultural equipment—what to consider when buying farm vehicles in Pakistan for reliability and resale value.",
    fullContent:
      "Tractors, harvesters, and agricultural equipment—what to consider when buying farm vehicles in Pakistan for reliability and resale value.\n\n**Farm size and crops** — Match horsepower and attachments to your land and crop type. Over- or under-specing both hurt.\n\n**Condition and hours** — Check engine hours, hydraulic systems, and tires. Repairs on farm equipment are expensive.\n\n**Brand and parts** — Stick to brands with dealer and parts support in your region.\n\n**Papers and price** — Verify ownership and any liens. Use Sello to compare similar equipment and negotiate fairly.",
    author: "Sello Expert",
    date: "Jan 5, 2026",
    readTime: "11 min",
  },
};

function getPlaceholderImage(slug, title) {
  const text = encodeURIComponent((title || slug).slice(0, 20));
  return `https://placehold.co/520x400/081C2B/94a3b8?text=${text}`;
}

export default function ListingsCategoryBlogsSection({ categorySlug }) {
  const [searchParams] = useSearchParams();
  const config = categorySlug ? vehicleCategoryConfig[categorySlug] : null;
  const categories = config
    ? [categorySlug]
    : CATEGORY_ORDER.filter((slug) => vehicleCategoryConfig[slug]);

  if (categories.length === 0) return null;

  // Build flat list of { slug, blog, index } so we render ALL blogs per category
  const items = [];
  categories.forEach((slug) => {
    const catConfig = vehicleCategoryConfig[slug];
    const dummy = dummyBlogBySlug[slug] || {
      title: `${catConfig?.title || slug} – Buying Guide`,
      excerpt: `Explore our guide to buying and selling ${catConfig?.title?.toLowerCase() || slug} in Pakistan.`,
      author: "Sello Expert",
      date: "Jan 2026",
      readTime: "5 min",
    };
    const blogList = catConfig?.blogs?.length
      ? catConfig.blogs.map((b, i) => ({
          title: b.title,
          excerpt: b.content || dummy.excerpt,
          fullContent:
            b.fullContent ||
            dummyBlogBySlug[slug]?.fullContent ||
            b.content ||
            dummy.excerpt,
          author: b.author,
          date: b.date,
          readTime: b.readTime,
          id: b.id ?? i,
        }))
      : [{ ...dummy, fullContent: dummy.fullContent || dummy.excerpt, id: 0 }];
    blogList.forEach((blog, idx) => {
      items.push({
        slug,
        blog,
        index: items.length,
        isImageLeft: items.length % 2 === 1,
        indexInCategory: idx,
      });
    });
  });

  return (
    <section id="listing-guides" className="w-full scroll-mt-24 bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {config ? `${config.title} Guides` : "Guides by Category"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {config
              ? `Read our guides to buying and selling ${config.title.toLowerCase()} in Pakistan.`
              : "Quick reads per category to help you buy or sell with confidence."}
          </p>
        </div>

        <GuideCards
          key={`${categorySlug || "all"}-${searchParams.get("guide") || ""}`}
          posts={items.map(({ slug, blog, index, indexInCategory }) => {
            const catConfig = vehicleCategoryConfig[slug];
            const rawImg = indexInCategory === 0 ? catConfig?.blogImage : catConfig?.blogImage2;
            return {
              ...blog,
              id: `${slug}-${blog.id ?? index}`,
              category: catConfig?.title || slug,
              image: typeof rawImg === "string" ? rawImg : (rawImg?.default ?? rawImg?.src ?? getPlaceholderImage(slug, catConfig?.title)),
            };
          })}
          initialPostId={config && items.some(({ blog }) => String(blog.id) === searchParams.get("guide"))
            ? `${categorySlug}-${searchParams.get("guide")}` : null}
        />
      </div>
    </section>
  );
}
