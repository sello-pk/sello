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
              url: `${baseUrl}/ai-car-estimator`,
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
};
