/**
 * Structured Data (JSON-LD) Component
 * Adds structured data for SEO and rich snippets
 */

import { useEffect } from "react";
import {
  generateVehicleSchema,
  generateBreadcrumbSchema,
  generateBlogPostingSchema,
  generateItemListSchema,
  generateCollectionPageSchema,
  generateFAQSchema,
  generateAuctionEventSchema,
  generateAutoDealerSchema,
  generateAggregateRatingSchema,
} from "../../utils/schemas";
import { buildCarUrl } from "../../utils/urlBuilders";
import { teamMembers } from "../sections/about/teamData";

/**
 * Add structured data script to document head
 */
const addStructuredData = (data) => {
  // Remove existing script if any
  const existingScript = document.getElementById("structured-data");
  if (existingScript) {
    existingScript.remove();
  }

  // Create new script
  const script = document.createElement("script");
  script.id = "structured-data";
  script.type = "application/ld+json";
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Product Schema for Car Listing
 */
export const ProductSchema = ({ car }) => {
  useEffect(() => {
    if (!car || !car._id) return;

    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const carUrl = `${baseUrl}${buildCarUrl(car)}`;
    const imageUrl = car.images?.[0] || `${baseUrl}/logo.png`;

    const make = car.make || "";
    const model = car.model || "";
    const year = car.year || "";
    const city = car.city || "";
    const variant = car.variant && car.variant !== "N/A" ? car.variant : "";
    const titleParts = [year, make, model, variant].filter(Boolean);
    titleParts.push("for sale");
    if (city) titleParts.push("in", city);
    const schemaTitle = car.title || titleParts.join(" ");

    const descParts = [year, make, model];
    if (city) descParts.push("Used for sale in", city);
    else descParts.push("Used for sale");
    descParts.push(`for PKR ${car.price?.toLocaleString() || "0"}.`);
    const specs = [];
    if (car.engineCapacity) specs.push(`${car.engineCapacity} cc`);
    if (car.colorExterior) specs.push(car.colorExterior);
    specs.push(`${car.mileage?.toLocaleString() || "N/A"} KM Driven`);
    if (car.transmission) specs.push(car.transmission);
    if (car.vehicleType) specs.push(car.vehicleType);
    if (specs.length) descParts.push(`Buy this ${specs.join(", ")}.`);
    descParts.push("Contact Seller Now!");
    const schemaDescription = car.description || descParts.join(" ");

    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: schemaTitle,
      description: schemaDescription,
      image: car.images || [imageUrl],
      brand: {
        "@type": "Brand",
        name: car.make || "Unknown",
      },
      offers: {
        "@type": "Offer",
        url: carUrl,
        priceCurrency: "PKR",
        price: car.price,
        priceValidUntil:
          car.expiryDate ||
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        availability:
          car.status === "active"
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
        seller: {
          "@type":
            car.ownerType === "Dealer" || car.ownerType === "Dealership"
              ? "AutoDealer"
              : "Person",
          name: car.postedBy?.name || "Seller",
        },
      },
      vehicleIdentificationNumber: car._id.toString(),
      model: car.model,
      productionDate: `${car.year}-01-01`,
      vehicleConfiguration: {
        "@type": "VehicleConfiguration",
        fuelType: car.fuelType,
        transmission: car.transmission,
        bodyType: car.bodyType || "Car",
      },
      mileageFromOdometer: {
        "@type": "QuantitativeValue",
        value: car.mileage || 0,
        unitCode: "KMT",
      },
    };

    addStructuredData(schema);
  }, [car]);

  return null;
};

/**
 * Enhanced Vehicle Schema (Product + Vehicle + Offer)
 */
export const VehicleSchema = ({ car }) => {
  useEffect(() => {
    if (!car || !car._id) return;

    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const carUrl = `${baseUrl}${buildCarUrl(car)}`;
    const schema = generateVehicleSchema(car, carUrl);

    if (schema) {
      addStructuredData(schema);
    }
  }, [car]);

  return null;
};

/**
 * BlogPosting Schema
 */
export const BlogPostingSchema = ({ blog }) => {
  useEffect(() => {
    if (!blog) return;

    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const blogUrl = blog.slug
      ? `${baseUrl}/blog/${blog.slug}`
      : window.location.href;
    const schema = generateBlogPostingSchema(blog, blogUrl);

    if (schema) {
      addStructuredData(schema);
    }
  }, [blog]);

  return null;
};

/**
 * ItemList Schema
 */
export const ItemListSchema = ({ cars }) => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const schema = generateItemListSchema(cars, baseUrl);
    if (schema) addStructuredData(schema);
  }, [cars]);

  return null;
};

/**
 * CollectionPage Schema
 */
export const CollectionPageSchema = ({ name, description }) => {
  useEffect(() => {
    const schema = generateCollectionPageSchema(name, description);
    if (schema) addStructuredData(schema);
  }, [name, description]);

  return null;
};

/**
 * FAQ Schema
 */
export const FAQSchema = ({ items }) => {
  useEffect(() => {
    const schema = generateFAQSchema(items);
    if (schema) addStructuredData(schema);
  }, [items]);

  return null;
};

/**
 * Auction Event Schema
 */
export const AuctionEventSchema = ({ auction, car }) => {
  useEffect(() => {
    if (!auction || !car) return;
    const carUrl = window.location.href;
    const schema = generateAuctionEventSchema(auction, car, carUrl);
    if (schema) addStructuredData(schema);
  }, [auction, car]);

  return null;
};

/**
 * AutoDealer Schema
 */
export const AutoDealerSchema = ({ dealerInfo }) => {
  useEffect(() => {
    if (!dealerInfo) return;
    const profileUrl = window.location.href;
    const schema = generateAutoDealerSchema(dealerInfo, profileUrl);
    if (schema) addStructuredData(schema);
  }, [dealerInfo]);

  return null;
};

/**
 * AggregateRating Schema — attach to a parent schema object or use standalone
 */
export const AggregateRatingSchema = ({ ratingValue, reviewCount }) => {
  useEffect(() => {
    const schema = generateAggregateRatingSchema(ratingValue, reviewCount);
    if (schema) addStructuredData(schema);
  }, [ratingValue, reviewCount]);

  return null;
};

/**
 * Organization Schema
 */
export const OrganizationSchema = () => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const siteName = "Sello";
    const supportEmail =
      import.meta.env.VITE_SUPPORT_EMAIL || "support@example.com";

    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Service",
        email: supportEmail,
      },
      sameAs: [
        // Add social media links if available
      ],
    };

    addStructuredData(schema);
  }, []);

  return null;
};

/**
 * BreadcrumbList Schema
 */
export const BreadcrumbSchema = ({ items, car }) => {
  useEffect(() => {
    if (car) {
      const schema = generateBreadcrumbSchema(car);
      if (schema) {
        addStructuredData(schema);
      }
      return;
    }

    if (!items || items.length === 0) return;

    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url
          ? item.url.startsWith("http")
            ? item.url
            : `${baseUrl}${item.url}`
          : baseUrl,
      })),
    };

    addStructuredData(schema);
  }, [items, car]);

  return null;
};

/**
 * WebSite Schema with SearchAction
 */
export const WebSiteSchema = () => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Sello",
      url: baseUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/search-results?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };

    addStructuredData(schema);
  }, []);

  return null;
};

/**
 * Home Page Schema — single @graph combining Organization (AutoDealer),
 * WebSite, WebPage and key-features ItemList. Injects the full home page
 * JSON-LD in one script tag so nothing is left out.
 */
export const HomePageSchema = () => {
  useEffect(() => {
    const baseUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": ["AutomotiveBusiness", "AutoDealer"],
          "@id": `${baseUrl}/#organization`,
          name: "Sello.pk",
          legalName: "Sello Group",
          url: baseUrl,
          logo: {
            "@type": "ImageObject",
            "@id": `${baseUrl}/#logo`,
            url: `${baseUrl}/assets/logo.png`,
            caption: "Sello.pk Logo",
          },
          image: {
            "@id": `${baseUrl}/#logo`,
          },
          description:
            "Find the best car for sale in Pakistan on Sello.pk. Buy or sell used cars in Karachi, Lahore, Islamabad & beyond with verified sellers and fair pricing.  .",
          email: "info@sello.pk",
          priceRange: "PKR",
          address: {
            "@type": "PostalAddress",
            streetAddress: "Sello Head Office, Gulberg",
            addressLocality: "Lahore",
            addressRegion: "Punjab",
            addressCountry: "PK",
          },
          areaServed: {
            "@type": "Country",
            name: "Pakistan",
          },
          sameAs: [
            "https://www.facebook.com/people/Sello/61584930269294/",
            "https://www.instagram.com/sello.pk",
            "https://www.youtube.com/@sello.pakistan",
            "https://www.tiktok.com/@sello.pk",
          ],
        },
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Sello.pk - Buy & Sell Cars in Pakistan",
          description:
            "Buy, sell, or bid on verified cars in Pakistan. Explore AI Car Estimator, Vehicle Verification, and hybrid auctions on Sello.pk.",
          publisher: {
            "@id": `${baseUrl}/#organization`,
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/listings/car?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "WebPage",
          "@id": `${baseUrl}/#webpage`,
          url: baseUrl,
          name: "Sello.pk | Buy, Sell & Auction Cars in Pakistan",
          isPartOf: {
            "@id": `${baseUrl}/#website`,
          },
          about: {
            "@id": `${baseUrl}/#organization`,
          },
          inLanguage: "en-PK",
        },
        {
          "@type": "ItemList",
          "@id": `${baseUrl}/#key-features`,
          name: "Sello Core Features & Services",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Cars for Sale",
              url: `${baseUrl}/listings/car`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Sell Your Car",
              url: `${baseUrl}/sell-car`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Online & Live Hybrid Car Auctions",
              url: `${baseUrl}/auctions`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "AI Car Estimator",
              url: `${baseUrl}/car-estimator`,
            },
            {
              "@type": "ListItem",
              position: 5,
              name: "Vehicle Verification",
              url: `${baseUrl}/vehicle-verification`,
            },
          ],
        },
      ],
    };

    addStructuredData(schema);
  }, []);

  return null;
};

const toAbsoluteMediaUrl = (value, baseUrl) => {
  if (!value || typeof value !== "string") return undefined;
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
};

const normalizeFuelType = (value) => {
  const raw = (value || "").toString().trim().toLowerCase();
  if (!raw) return undefined;
  if (raw.includes("electric")) return "Electric";
  if (raw.includes("hybrid")) return "Hybrid";
  if (raw.includes("diesel")) return "Diesel";
  if (raw.includes("petrol") || raw.includes("gasoline")) return "Gasoline";
  return undefined;
};

const normalizeTransmission = (value) => {
  const raw = (value || "").toString().trim().toLowerCase();
  if (!raw) return undefined;
  if (raw.includes("auto")) return "Automatic";
  if (raw.includes("manual")) return "Manual";
  return undefined;
};

const toNumeric = (value) => {
  if (value == null || value === "") return undefined;
  const num = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) && num > 0 ? num : undefined;
};

/**
 * Listings Page Schema — single @graph combining WebSite (with publisher),
 * BreadcrumbList, SearchResultsPage and an ItemList of the real cars on the page.
 */
export const ListingsPageSchema = ({ cars = [] }) => {
  useEffect(() => {
    const baseUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const listUrl = `${baseUrl}/listings`;
    const listItems = (Array.isArray(cars) ? cars : [])
      .filter((car) => car && car._id)
      .slice(0, 10)
      .map((car, index) => {
        const carPath = buildCarUrl(car);
        const carUrl = `${baseUrl}${carPath}`;
        const titleParts = [car.year, car.make, car.model, car.variant].filter(
          Boolean,
        );
        const name =
          car.title || `${titleParts.join(" ")} for sale`.trim() || "Vehicle";
        const displacement = toNumeric(car.engineCapacity ?? car.engine);
        const power = toNumeric(car.horsepower);
        // Odometer readings are whole numbers; round away seller data-entry decimals.
        const mileageRaw = toNumeric(car.mileage);
        const mileage = mileageRaw ? Math.round(mileageRaw) : undefined;
        const priceValue = toNumeric(car.price);
        const vehicleType = (car.vehicleType || "").toString().trim();
        const isTwoWheeler =
          /e-?bike|scooter|motorcycle|cycle|rickshaw/i.test(vehicleType);
        const sellerRole = (car.postedBy?.role || car.ownerType || "")
          .toString()
          .trim()
          .toLowerCase();
        const isDealer = sellerRole === "dealer" || sellerRole === "dealership";

        return {
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": isTwoWheeler ? "Motorcycle" : "Car",
            "@id": `${carUrl}#car`,
            name,
            url: carUrl,
            image: toAbsoluteMediaUrl(car.images?.[0], baseUrl),
            brand: car.make
              ? { "@type": "Brand", name: car.make }
              : undefined,
            model: car.model || undefined,
            modelDate: car.year ? String(car.year) : undefined,
            vehicleConfiguration: car.variant || undefined,
            vehicleEngine: displacement || power
              ? {
                  "@type": "EngineSpecification",
                  ...(displacement
                    ? {
                        engineDisplacement: {
                          "@type": "QuantitativeValue",
                          value: displacement,
                          unitCode: "CMQ",
                        },
                      }
                    : {}),
                  ...(power
                    ? {
                        enginePower: {
                          "@type": "QuantitativeValue",
                          value: power,
                          unitCode: "BHP",
                        },
                      }
                    : {}),
                }
              : undefined,
            fuelType: normalizeFuelType(car.fuelType),
            vehicleTransmission: normalizeTransmission(car.transmission),
            mileageFromOdometer: mileage
              ? {
                  "@type": "QuantitativeValue",
                  value: mileage,
                  unitCode: "KMT",
                }
              : undefined,
            itemCondition:
              (car.condition || "").toString().trim().toLowerCase() === "new"
                ? "https://schema.org/NewCondition"
                : "https://schema.org/UsedCondition",
            offers: {
              "@type": "Offer",
              price:
                priceValue != null
                  ? String(priceValue)
                  : car.price != null
                    ? String(car.price)
                    : undefined,
              priceCurrency: "PKR",
              availability:
                car.isSold || car.status === "sold"
                  ? "https://schema.org/SoldOut"
                  : "https://schema.org/InStock",
              priceValidUntil:
                car.expiryDate ||
                new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
              areaServed: car.city
                ? { "@type": "AdministrativeArea", name: car.city }
                : undefined,
              seller: {
                "@type": isDealer ? "AutoDealer" : "Person",
                name:
                  car.postedBy?.name ||
                  (isDealer ? "Sello Verified Dealer" : "Direct Owner"),
              },
            },
          },
        };
      });

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Sello.pk",
          publisher: {
            "@type": "AutomotiveBusiness",
            "@id": `${baseUrl}/#organization`,
            name: "Sello.pk",
            url: baseUrl,
            logo: `${baseUrl}/assets/logo.png`,
            sameAs: [
              "https://www.facebook.com/people/Sello/61584930269294/",
              "https://www.instagram.com/sello.pk",
              "https://www.youtube.com/@sello.pakistan",
              "https://www.tiktok.com/@sello.pk",
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${listUrl}/#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Car Listings",
              item: listUrl,
            },
          ],
        },
        {
          "@type": "SearchResultsPage",
          "@id": `${listUrl}/#webpage`,
          url: listUrl,
          name: "Verified Used & New Cars for Sale in Pakistan | Sello.pk",
          description:
            "Browse verified used and new cars for sale across Pakistan. Compare prices, check AI valuations, verify vehicle history, or bid on live vehicle auctions.",
          isPartOf: {
            "@id": `${baseUrl}/#website`,
          },
          breadcrumb: {
            "@id": `${listUrl}/#breadcrumb`,
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}/listings?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
          inLanguage: "en-PK",
        },
        {
          "@type": "ItemList",
          "@id": `${listUrl}/#itemlist`,
          name: "Verified Vehicles for Sale in Pakistan",
          description: "Latest verified cars listed on Sello.pk",
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          numberOfItems: listItems.length,
          itemListElement: listItems,
        },
      ],
    };

    addStructuredData(schema);
  }, [cars]);

  return null;
};

/**
 * AI Car Estimator Page Schema — single @graph combining WebSite (with publisher),
 * BreadcrumbList, WebApplication, WebPage and FAQPage.
 */
export const CarEstimatorPageSchema = () => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const pageUrl = `${baseUrl}/car-estimator`;

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Sello.pk",
          publisher: {
            "@type": "AutomotiveBusiness",
            "@id": `${baseUrl}/#organization`,
            name: "Sello.pk",
            url: baseUrl,
            logo: `${baseUrl}/assets/logo.png`,
            sameAs: [
              "https://www.facebook.com/people/Sello/61584930269294/",
              "https://www.instagram.com/sello.pk",
              "https://www.youtube.com/@sello.pakistan",
              "https://www.tiktok.com/@sello.pk",
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}/#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "AI Car Estimator",
              item: pageUrl,
            },
          ],
        },
        {
          "@type": "WebApplication",
          "@id": `${pageUrl}/#webapp`,
          name: "Sello.pk AI Car Estimator",
          url: pageUrl,
          applicationCategory: "BusinessApplication",
          operatingSystem: "All",
          browserRequirements: "Requires JavaScript. Requires HTML5.",
          description:
            "AI-powered used car price estimator tool for Pakistan. Instantly calculate accurate market resale values for cars based on make, model, year, mileage, city, and vehicle condition.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "PKR",
            availability: "https://schema.org/InStock",
          },
          provider: {
            "@id": `${baseUrl}/#organization`,
          },
          featureList: [
            "Instant AI Market Valuation",
            "Pakistan Local Market Data Analysis",
            "Condition & Mileage Adjustment",
            "City-Wise Registration Valuation",
          ],
        },
        {
          "@type": "WebPage",
          "@id": `${pageUrl}/#webpage`,
          url: pageUrl,
          name: "AI Car Estimator | Free Used Car Valuation Tool in Pakistan - Sello.pk",
          description:
            "Calculate accurate resale values for any car in Pakistan with Sello's AI Estimator. Instant valuation based on real-time market trends, mileage, and condition.",
          isPartOf: {
            "@id": `${baseUrl}/#website`,
          },
          breadcrumb: {
            "@id": `${pageUrl}/#breadcrumb`,
          },
          about: {
            "@id": `${pageUrl}/#webapp`,
          },
          inLanguage: "en-PK",
        },
        {
          "@type": "FAQPage",
          "@id": `${pageUrl}/#faq`,
          mainEntity: [
            {
              "@type": "Question",
              name: "How does the Sello AI Car Estimator calculate vehicle prices?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "The AI Car Estimator analyzes live Pakistani market data, recent sales, dealer trade trends, vehicle mileage, year, city registration, and physical condition to generate an accurate valuation range.",
              },
            },
            {
              "@type": "Question",
              name: "Is the car price valuation free on Sello.pk?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, Sello.pk provides 100% free car valuations for buyers and sellers across Pakistan.",
              },
            },
            {
              "@type": "Question",
              name: "Which factors reduce a used car's value in Pakistan?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Factors such as high mileage, repaint/accident history, missing service records, unverified documentation, and out-of-city registration can reduce a vehicle's estimated market value.",
              },
            },
          ],
        },
      ],
    };

    addStructuredData(schema);
  }, []);

  return null;
};

/**
 * Vehicle Verification Page Schema — single @graph combining WebSite (with publisher),
 * BreadcrumbList, Service, WebPage and FAQPage.
 */
export const VehicleVerificationPageSchema = () => {
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const pageUrl = `${baseUrl}/vehicle-verification`;

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Sello.pk",
          publisher: {
            "@type": "AutomotiveBusiness",
            "@id": `${baseUrl}/#organization`,
            name: "Sello.pk",
            url: baseUrl,
            logo: `${baseUrl}/assets/logo.png`,
            sameAs: [
              "https://www.facebook.com/people/Sello/61584930269294/",
              "https://www.instagram.com/sello.pk",
              "https://www.youtube.com/@sello.pakistan",
              "https://www.tiktok.com/@sello.pk",
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}/#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Vehicle Verification",
              item: pageUrl,
            },
          ],
        },
        {
          "@type": "Service",
          "@id": `${pageUrl}/#service`,
          name: "Online Vehicle & Registration Verification Pakistan",
          serviceType: "Vehicle Verification Service",
          provider: {
            "@id": `${baseUrl}/#organization`,
          },
          areaServed: [
            { "@type": "AdministrativeArea", name: "Punjab" },
            { "@type": "AdministrativeArea", name: "Sindh" },
            { "@type": "AdministrativeArea", name: "Islamabad Capital Territory" },
            { "@type": "AdministrativeArea", name: "Khyber Pakhtunkhwa" },
          ],
          description:
            "Instant online vehicle verification in Pakistan. Verify MTMIS vehicle registration details, owner records, engine/chassis numbers, tax payment status, and CPLC clearance across Punjab, Sindh, Islamabad, and KPK.",
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Verification Checks",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "MTMIS Registration Record Check",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Token Tax Clearance Verification",
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "CPLC & Stolen Vehicle Record Check",
                },
              },
            ],
          },
        },
        {
          "@type": "WebPage",
          "@id": `${pageUrl}/#webpage`,
          url: pageUrl,
          name: "Online Vehicle Verification Pakistan | MTMIS Car Check - Sello.pk",
          description:
            "Verify any car or motorcycle registration online in Pakistan. Check Excise tax records, owner details, engine number, and CPLC clearance for Punjab, Sindh, Islamabad & KPK.",
          isPartOf: {
            "@id": `${baseUrl}/#website`,
          },
          breadcrumb: {
            "@id": `${pageUrl}/#breadcrumb`,
          },
          mainEntity: {
            "@id": `${pageUrl}/#service`,
          },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${pageUrl}?reg_no={registration_number}`,
            },
            "query-input": "required name=registration_number",
          },
          inLanguage: "en-PK",
        },
        {
          "@type": "FAQPage",
          "@id": `${pageUrl}/#faq`,
          mainEntity: [
            {
              "@type": "Question",
              name: "How can I verify car ownership online in Pakistan?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "You can verify car ownership online on Sello.pk by entering the vehicle's registration number. The lookup checks official MTMIS Excise databases for Punjab, Sindh, Islamabad, and KPK to display the current owner name, registration date, and vehicle specs.",
              },
            },
            {
              "@type": "Question",
              name: "What details are displayed in an MTMIS vehicle check?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "An MTMIS online check displays the vehicle owner name, make/model, engine and chassis numbers, vehicle body type, registration date, token tax payment status, and CPLC clearance status (for Sindh).",
              },
            },
            {
              "@type": "Question",
              name: "Can I check token tax payment history on Sello.pk?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, Sello.pk vehicle verification provides token tax payment status directly from provincial Excise and Taxation databases to verify if any tax dues remain unpaid.",
              },
            },
          ],
        },
      ],
    };

    addStructuredData(schema);
  }, []);

  return null;
};

// Fallback window for the weekly live auction when the API has no upcoming
// auction (or the only "live" auction has already finished).
const AUCTION_EVENT_FALLBACK = {
  startDate: "2026-09-25T10:00:00+05:00",
  endDate: "2026-09-28T22:00:00+05:00",
};

// Same idea for the /auctions/live broadcast session.
const LIVE_EVENT_FALLBACK = {
  startDate: "2026-09-21T15:00:00+05:00",
  endDate: "2026-09-21T21:00:00+05:00",
};

/**
 * Resolve an Event window: prefer the real auction times, but only while that
 * auction is still ahead of us. A stale "live" auction would otherwise publish
 * an Event for a session that ended months ago.
 */
const resolveEventWindow = (auction, fallback) => {
  const end = auction?.endTime ? new Date(auction.endTime) : null;
  const start = auction?.startTime ? new Date(auction.startTime) : null;
  if (end && !Number.isNaN(end.getTime()) && end.getTime() > Date.now()) {
    return {
      startDate: (
        start && !Number.isNaN(start.getTime()) ? start : new Date()
      ).toISOString(),
      endDate: end.toISOString(),
    };
  }
  return fallback;
};

const AUCTION_HOW_TO_STEPS = [
  {
    "@type": "HowToStep",
    position: 1,
    name: "Create an Account & Verify Identity",
    text: "Register on Sello.pk and complete basic CNIC phone verification to become an eligible bidder.",
  },
  {
    "@type": "HowToStep",
    position: 2,
    name: "Review Vehicle Inspection Report",
    text: "Examine physical evaluation scores, photos, and verified auction sheet details attached to each lot.",
  },
  {
    "@type": "HowToStep",
    position: 3,
    name: "Place Your Bids Live",
    text: "Submit competitive increments above the reserve price before the timer expires.",
  },
  {
    "@type": "HowToStep",
    position: 4,
    name: "Win & Complete Payment",
    text: "If yours is the highest winning bid, clear the balance and schedule doorstep delivery or regional pickup.",
  },
];

/**
 * Auctions Landing Page Schema — single @graph with WebSite (publisher),
 * BreadcrumbList, CollectionPage, the live Event, an ItemList of the real
 * cars currently in that auction, and the bidding HowTo.
 */
export const AuctionsPageSchema = ({ auction, cars = [] }) => {
  useEffect(() => {
    const baseUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const pageUrl = `${baseUrl}/auctions`;

    // Only trust API dates when that auction has not already finished,
    // otherwise the Event would advertise a window that has already passed.
    const eventDates = resolveEventWindow(auction, AUCTION_EVENT_FALLBACK);

    // Auction lots are returned as { car, startingBid, currentBid, ... } rows.
    const lots = (Array.isArray(cars) ? cars : [])
      .filter((lot) => lot && (lot.car?._id || lot._id))
      .slice(0, 10);

    const itemListElement = lots.map((lot, index) => {
      const car = lot.car || lot;
      const carUrl = `${baseUrl}${buildCarUrl(car)}`;
      const startingBid = toNumeric(lot.startingBid);
      const currentBid = toNumeric(lot.currentBid);
      const buyNowPrice = toNumeric(lot.buyNowPrice);
      const offerCount = toNumeric(lot.bidCount);
      // Spread of the bidding range: opening bid up to the best live bid,
      // falling back to the buy-now ceiling when nobody has bid yet.
      const lowPrice = startingBid ?? toNumeric(car.price);
      const highPrice = currentBid ?? buyNowPrice ?? lowPrice;
      const nameParts = [car.year, car.make, car.model].filter(Boolean);
      const name =
        car.title || nameParts.join(" ") || "Auction vehicle";

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Car",
          "@id": `${carUrl}#car`,
          name,
          url: carUrl,
          image: toAbsoluteMediaUrl(car.images?.[0], baseUrl),
          ...(car.make ? { brand: { "@type": "Brand", name: car.make } } : {}),
          ...(car.model ? { model: car.model } : {}),
          ...(car.year ? { modelDate: String(car.year) } : {}),
          ...(car.transmission
            ? { vehicleTransmission: normalizeTransmission(car.transmission) }
            : {}),
          itemCondition: "https://schema.org/UsedCondition",
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "PKR",
            ...(lowPrice ? { lowPrice: String(Math.round(lowPrice)) } : {}),
            ...(highPrice ? { highPrice: String(Math.round(highPrice)) } : {}),
            ...(offerCount ? { offerCount } : {}),
            availability: "https://schema.org/InStock",
            priceValidThrough: eventDates.endDate,
            seller: { "@id": `${baseUrl}/#organization` },
          },
        },
      };
    });

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Sello.pk",
          publisher: {
            "@type": "AutomotiveBusiness",
            "@id": `${baseUrl}/#organization`,
            name: "Sello.pk",
            url: baseUrl,
            logo: `${baseUrl}/assets/logo.png`,
            sameAs: [
              "https://www.facebook.com/people/Sello/61584930269294/",
              "https://www.instagram.com/sello.pk",
              "https://www.youtube.com/@sello.pakistan",
              "https://www.tiktok.com/@sello.pk",
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}/#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Live Car Auctions",
              item: pageUrl,
            },
          ],
        },
        {
          "@type": "CollectionPage",
          "@id": `${pageUrl}/#webpage`,
          url: pageUrl,
          name: "Live Car Auctions in Pakistan | Bid & Buy Verified Used Cars - Sello.pk",
          description:
            "Participate in live online vehicle auctions across Pakistan. Bid on verified used cars, inspected Japanese imports, and bank-leased vehicles with real-time price updates.",
          isPartOf: { "@id": `${baseUrl}/#website` },
          breadcrumb: { "@id": `${pageUrl}/#breadcrumb` },
          inLanguage: "en-PK",
        },
        {
          "@type": "Event",
          "@id": `${pageUrl}/#live-auction-event`,
          name: "Sello.pk Weekly Live Vehicle Auction",
          description:
            "Pakistan's verified digital car auction featuring inspected sedan, SUV, and hatchback listings open for live competitive bidding.",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          startDate: eventDates.startDate,
          endDate: eventDates.endDate,
          location: {
            "@type": "VirtualLocation",
            url: pageUrl,
          },
          organizer: { "@id": `${baseUrl}/#organization` },
        },
        ...(itemListElement.length
          ? [
              {
                "@type": "ItemList",
                "@id": `${pageUrl}/#itemlist`,
                name: "Active Auction Vehicle Listings",
                description: "Cars currently open for live bidding on Sello.pk",
                itemListOrder:
                  "https://schema.org/ItemListOrderDescending",
                numberOfItems: itemListElement.length,
                itemListElement,
              },
            ]
          : []),
        {
          "@type": "HowTo",
          "@id": `${pageUrl}/#howto`,
          name: "How to Participate in Sello.pk Online Car Auctions",
          description:
            "Step-by-step guide to register, place live bids, and complete payment for auctioned cars in Pakistan.",
          step: AUCTION_HOW_TO_STEPS,
        },
      ],
    };

    addStructuredData(schema);
  }, [auction, cars]);

  return null;
};

/**
 * Live Auction Page Schema — single @graph with WebSite (publisher),
 * BreadcrumbList, WebPage, the live Event (plus its BroadcastEvent) and an
 * ItemList of the lots currently on the bidding block.
 */
export const LiveAuctionPageSchema = ({ auction, cars = [] }) => {
  useEffect(() => {
    const baseUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const pageUrl = `${baseUrl}/auctions/live`;

    const eventDates = resolveEventWindow(auction, LIVE_EVENT_FALLBACK);

    // Only advertise the stream as live while the session window is open.
    const startMs = new Date(eventDates.startDate).getTime();
    const endMs = new Date(eventDates.endDate).getTime();
    const isLiveBroadcast =
      !Number.isNaN(startMs) && !Number.isNaN(endMs) && Date.now() >= startMs && Date.now() <= endMs;

    const lots = (Array.isArray(cars) ? cars : [])
      .filter((lot) => lot && (lot.car?._id || lot._id))
      .slice(0, 10);

    const itemListElement = lots.map((lot, index) => {
      const car = lot.car || lot;
      const carUrl = `${baseUrl}${buildCarUrl(car)}`;
      const currentBid = toNumeric(lot.currentBid);
      const startingBid = toNumeric(lot.startingBid);
      const price = currentBid ?? startingBid ?? toNumeric(car.price);
      const nameParts = [car.year, car.make, car.model].filter(Boolean);
      const name = car.title || nameParts.join(" ") || "Auction vehicle";

      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Car",
          "@id": `${carUrl}#car`,
          name,
          url: carUrl,
          image: toAbsoluteMediaUrl(car.images?.[0], baseUrl),
          ...(car.make ? { brand: { "@type": "Brand", name: car.make } } : {}),
          ...(car.model ? { model: car.model } : {}),
          ...(car.year ? { modelDate: String(car.year) } : {}),
          ...(car.transmission
            ? { vehicleTransmission: normalizeTransmission(car.transmission) }
            : {}),
          itemCondition: "https://schema.org/UsedCondition",
          offers: {
            "@type": "Offer",
            ...(price ? { price: String(Math.round(price)) } : {}),
            priceCurrency: "PKR",
            priceValidUntil: eventDates.endDate,
            availability: "https://schema.org/InStock",
            seller: { "@id": `${baseUrl}/#organization` },
          },
        },
      };
    });

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Sello.pk",
          publisher: {
            "@type": "AutomotiveBusiness",
            "@id": `${baseUrl}/#organization`,
            name: "Sello.pk",
            url: baseUrl,
            logo: `${baseUrl}/assets/logo.png`,
            sameAs: [
              "https://www.facebook.com/people/Sello/61584930269294/",
              "https://www.instagram.com/sello.pk",
              "https://www.youtube.com/@sello.pakistan",
              "https://www.tiktok.com/@sello.pk",
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}/#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Auctions",
              item: `${baseUrl}/auctions`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Live Streaming Bidding",
              item: pageUrl,
            },
          ],
        },
        {
          "@type": "WebPage",
          "@id": `${pageUrl}/#webpage`,
          url: pageUrl,
          name: "Live Online Car Bidding Arena | Sello.pk Digital Auctions",
          description:
            "Join Sello's live car auction broadcast. Watch real-time inspection walkthroughs, submit live bids on verified Pakistani cars, and track real-time price increments.",
          isPartOf: { "@id": `${baseUrl}/#website` },
          breadcrumb: { "@id": `${pageUrl}/#breadcrumb` },
          inLanguage: "en-PK",
        },
        {
          "@type": "Event",
          "@id": `${pageUrl}/#live-event`,
          name: "Sello Live Online Car Bidding Session",
          description:
            "Real-time car bidding arena for verified vehicles in Pakistan. Watch live stream, check real-time bidding updates, and place bids.",
          // schema.org has no "EventLive" member; EventScheduled is the valid
          // enumeration value and the dates below convey the live window.
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          startDate: eventDates.startDate,
          endDate: eventDates.endDate,
          location: {
            "@type": "VirtualLocation",
            url: pageUrl,
          },
          organizer: { "@id": `${baseUrl}/#organization` },
          workFeatured: {
            "@type": "BroadcastEvent",
            name: "Sello Live Bidding Video Stream",
            isLiveBroadcast,
            startDate: eventDates.startDate,
          },
        },
        ...(itemListElement.length
          ? [
              {
                "@type": "ItemList",
                "@id": `${pageUrl}/#live-lots`,
                name: "Cars Currently on Live Bidding Block",
                description:
                  "Vehicles receiving real-time bids right now on Sello.pk",
                itemListOrder: "https://schema.org/ItemListOrderDescending",
                numberOfItems: itemListElement.length,
                itemListElement,
              },
            ]
          : []),
      ],
    };

    addStructuredData(schema);
  }, [auction, cars]);

  return null;
};

/**
 * About Page Schema — single @graph with WebSite, the full AutomotiveBusiness
 * organization (founder + team as real Person nodes), BreadcrumbList and the
 * AboutPage itself.
 */
export const AboutPageSchema = () => {
  useEffect(() => {
    const baseUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const pageUrl = `${baseUrl}/about`;
    const orgId = `${baseUrl}/#organization`;

    // Founder is the first roster entry; the rest are employees. Keeping the
    // ids on /about/#<slug> matches the anchors used elsewhere on the site.
    const slugifyName = (name) =>
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const people = teamMembers.map((member) => ({
      "@type": "Person",
      "@id": `${pageUrl}/#${slugifyName(member.name)}`,
      name: member.name,
      jobTitle: member.position,
    }));

    const founder = people[0];
    const founderRef = founder ? { "@id": founder["@id"] } : undefined;

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Sello.pk",
          publisher: { "@id": orgId },
        },
        {
          "@type": "AutomotiveBusiness",
          "@id": orgId,
          name: "Sello.pk",
          legalName: "Sello Group",
          url: baseUrl,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/assets/logo.png`,
            caption: "Sello.pk Logo",
          },
          description:
            "Sello.pk is Pakistan's digital automotive marketplace providing verified car listings, AI price estimation, vehicle registration verification, and live online auctions.",
          foundingDate: "2024",
          areaServed: {
            "@type": "Country",
            name: "Pakistan",
          },
          sameAs: [
            "https://www.facebook.com/people/Sello/61584930269294/",
            "https://www.instagram.com/sello.pk",
            "https://www.youtube.com/@sello.pakistan",
            "https://www.tiktok.com/@sello.pk",
          ],
          ...(founderRef ? { founder: founderRef } : {}),
          ...(people.length
            ? { employee: people.map((person) => ({ "@id": person["@id"] })) }
            : {}),
          // NOTE: aggregateRating is intentionally omitted. The only ratings on
          // this page are hardcoded marketing copy plus three static
          // testimonials, so publishing ratingValue/ratingCount here would be
          // fabricated review data. See the comment on the component below.
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Automotive Services",
            itemListElement: [
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Verified Used Car Marketplace",
                  url: `${baseUrl}/listings`,
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "AI Car Price Estimator",
                  url: `${baseUrl}/car-estimator`,
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Online Vehicle Verification (MTMIS)",
                  url: `${baseUrl}/vehicle-verification`,
                },
              },
              {
                "@type": "Offer",
                itemOffered: {
                  "@type": "Service",
                  name: "Live Vehicle Auctions",
                  url: `${baseUrl}/auctions`,
                },
              },
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}/#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "About Us",
              item: pageUrl,
            },
          ],
        },
        {
          "@type": "AboutPage",
          "@id": `${pageUrl}/#webpage`,
          url: pageUrl,
          name: "About Us | Buy & Sell Cars Online in Pakistan - Sello.pk",
          description:
            "Learn about Sello.pk, Pakistan's trusted digital automotive portal. Discover our leadership team, vision for transparent car trading, verified listings, and auction platform.",
          isPartOf: { "@id": `${baseUrl}/#website` },
          breadcrumb: { "@id": `${pageUrl}/#breadcrumb` },
          mainEntity: { "@id": orgId },
          inLanguage: "en-PK",
        },
        // Top-level so the founder/employee @id references above resolve
        // within this graph rather than pointing at nothing.
        ...people.map((person) => ({
          ...person,
          ...(founder && person["@id"] === founder["@id"]
            ? { worksFor: { "@id": orgId } }
            : {}),
        })),
      ],
    };

    addStructuredData(schema);
  }, []);

  return null;
};

/**
 * Contact Page Schema — single @graph with WebSite, the AutomotiveBusiness
 * contact details, BreadcrumbList and the ContactPage.
 */
export const ContactPageSchema = () => {
  useEffect(() => {
    const baseUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    const pageUrl = `${baseUrl}/contact`;
    const orgId = `${baseUrl}/#organization`;

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${baseUrl}/#website`,
          url: baseUrl,
          name: "Sello.pk",
          publisher: { "@id": orgId },
        },
        {
          "@type": "AutomotiveBusiness",
          "@id": orgId,
          name: "Sello.pk",
          url: baseUrl,
          logo: `${baseUrl}/assets/logo.png`,
          telephone: "+923122221474",
          email: "info@sello.pk",
          sameAs: [
            "https://www.facebook.com/people/Sello/61584930269294/",
            "https://www.instagram.com/sello.pk",
            "https://www.youtube.com/@sello.pakistan",
            "https://www.tiktok.com/@sello.pk",
          ],
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: "+923122221474",
              contactType: "customer support",
              email: "support@sello.pk",
              areaServed: "PK",
              availableLanguage: ["en", "ur"],
            },
            {
              "@type": "ContactPoint",
              telephone: "+923134211023",
              contactType: "WhatsApp Support",
              // No contactOption: this is a regular mobile number, not a
              // toll-free line, so "TollFree" would be inaccurate.
              areaServed: "PK",
              availableLanguage: ["en", "ur"],
            },
          ],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Okara",
            addressRegion: "Punjab",
            addressCountry: "PK",
          },
          // Saturday is deliberately absent — the contact page states the
          // office is closed on Saturdays.
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
              ],
              opens: "09:00",
              closes: "18:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Friday",
              opens: "09:00",
              closes: "13:00",
            },
          ],
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${pageUrl}/#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Contact Us",
              item: pageUrl,
            },
          ],
        },
        {
          "@type": "ContactPage",
          "@id": `${pageUrl}/#webpage`,
          url: pageUrl,
          name: "Contact Us | 24/7 Car Marketplace Support - Sello.pk",
          description:
            "Get in touch with Sello.pk for support regarding used car listings, vehicle verification, live auctions, or AI price estimation. Phone, email, and WhatsApp help available.",
          isPartOf: { "@id": `${baseUrl}/#website` },
          breadcrumb: { "@id": `${pageUrl}/#breadcrumb` },
          mainEntity: { "@id": orgId },
          inLanguage: "en-PK",
        },
      ],
    };

    addStructuredData(schema);
  }, []);

  return null;
};

export default {
  ProductSchema,
  VehicleSchema,
  BlogPostingSchema,
  ItemListSchema,
  CollectionPageSchema,
  FAQSchema,
  AuctionEventSchema,
  AutoDealerSchema,
  AggregateRatingSchema,
  OrganizationSchema,
  BreadcrumbSchema,
  WebSiteSchema,
  HomePageSchema,
  ListingsPageSchema,
  CarEstimatorPageSchema,
  VehicleVerificationPageSchema,
  AuctionsPageSchema,
  LiveAuctionPageSchema,
  AboutPageSchema,
  ContactPageSchema,
};
