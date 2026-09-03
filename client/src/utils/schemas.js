import { buildCarUrl } from "./urlBuilders";

export const generateItemListSchema = (cars, baseUrl) => {
  if (!cars || !Array.isArray(cars) || cars.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: cars.slice(0, 50).map((car, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}${buildCarUrl(car)}`,
    })),
  };
};

export const generateCollectionPageSchema = (name, description) => {
  if (!name) return null;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description: description || "",
  };
};

export const generateFAQSchema = (faqItems) => {
  if (!faqItems || !Array.isArray(faqItems) || faqItems.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
};

export const generateAuctionEventSchema = (auction, car, carUrl) => {
  if (!auction || !car) return null;

  const eventStatus = auction.status === "live"
    ? "https://schema.org/EventScheduled"
    : auction.status === "ended" || auction.status === "sold"
      ? "https://schema.org/EventEnded"
      : "https://schema.org/EventScheduled";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: auction.title || `${car.make || ""} ${car.model || ""} ${car.year || ""} Auction`,
    startDate: auction.startTime || auction.startDate || undefined,
    endDate: auction.endTime || auction.endDate || undefined,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus,
    location: {
      "@type": "VirtualLocation",
      url: carUrl,
    },
    organizer: {
      "@type": "Organization",
      name: "Sello.pk",
      url: "https://sello.pk",
    },
  };
};

export const generateAutoDealerSchema = (dealerInfo, profileUrl) => {
  if (!dealerInfo) return null;

  return {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: dealerInfo.businessName || "Dealer",
    image: dealerInfo.logo || undefined,
    telephone: dealerInfo.businessPhone || dealerInfo.phone || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: dealerInfo.city || undefined,
      addressRegion: dealerInfo.state || dealerInfo.region || undefined,
      addressCountry: "PK",
    },
    url: profileUrl,
  };
};

export const generateAggregateRatingSchema = (ratingValue, reviewCount) => {
  if (ratingValue == null || reviewCount == null) return null;

  return {
    "@type": "AggregateRating",
    ratingValue: String(ratingValue),
    reviewCount: reviewCount,
  };
};

export const generateBreadcrumbSchema = (car) => {
  if (!car) return null;

  const baseUrl = import.meta.env.VITE_FRONTEND_URL || "https://sello.pk";

  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: baseUrl,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Cars",
      item: `${baseUrl}/listings`,
    },
  ];

  let pos = 3;

  if (car.city) {
    items.push({
      "@type": "ListItem",
      position: pos++,
      name: car.city,
      item: `${baseUrl}/listings?city=${encodeURIComponent(car.city.toLowerCase())}`,
    });
  }

  if (car.make) {
    items.push({
      "@type": "ListItem",
      position: pos++,
      name: car.make,
      item: `${baseUrl}/listings?make=${encodeURIComponent(car.make.toLowerCase())}`,
    });
  }

  if (car.model) {
    const params = new URLSearchParams();
    if (car.make) params.set("make", car.make.toLowerCase());
    params.set("model", car.model.toLowerCase());
    items.push({
      "@type": "ListItem",
      position: pos++,
      name: car.model,
      item: `${baseUrl}/listings?${params.toString()}`,
    });
  }

  items.push({
    "@type": "ListItem",
    position: pos,
    name: car.title || `${car.make || ""} ${car.model || ""} ${car.year || ""}`.trim(),
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
};

export const generateBlogPostingSchema = (blog, blogUrl) => {
  if (!blog) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.metaDescription || blog.excerpt || "",
    image: blog.featuredImage ? [blog.featuredImage] : undefined,
    author: {
      "@type": "Organization",
      name: "Sello.pk",
    },
    publisher: {
      "@type": "Organization",
      name: "Sello.pk",
      logo: {
        "@type": "ImageObject",
        url: "https://sello.pk/logo.png",
      },
    },
    datePublished: blog.publishedAt || blog.createdAt || undefined,
    dateModified: blog.updatedAt || blog.publishedAt || blog.createdAt || undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": blogUrl,
    },
    articleSection: blog.category?.name || undefined,
  };
};

export const generateVehicleSchema = (car, carUrl) => {
  if (!car || !car._id) return null;

  const itemCondition =
    car.condition === "New"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition";

  const availability = car.isSold || car.status === "sold"
    ? "https://schema.org/SoldOut"
    : "https://schema.org/InStock";

  const additionalProperty = [];

  if (car.model) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Model",
      value: car.model,
    });
  }
  if (car.variant && car.variant !== "N/A") {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Variant",
      value: car.variant,
    });
  }
  if (car.mileage != null) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Mileage",
      value: `${car.mileage.toLocaleString()} KM`,
    });
  }
  if (car.transmission) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Transmission",
      value: car.transmission,
    });
  }
  if (car.fuelType) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Fuel Type",
      value: car.fuelType,
    });
  }
  if (car.bodyType) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Body Type",
      value: car.bodyType,
    });
  }
  if (car.carDoors) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Doors",
      value: String(car.carDoors),
    });
  }
  if (car.numberOfCylinders) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Cylinders",
      value: String(car.numberOfCylinders),
    });
  }
  if (car.colorExterior && car.colorExterior !== "N/A") {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Exterior Color",
      value: car.colorExterior,
    });
  }
  if (car.engineCapacity) {
    additionalProperty.push({
      "@type": "PropertyValue",
      name: "Engine Capacity",
      value: `${car.engineCapacity} CC`,
    });
  }

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

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: schemaTitle,
    description: schemaDescription,
    image: car.images && car.images.length > 0 ? car.images : undefined,
    sku: car._id,
    brand: {
      "@type": "Brand",
      name: car.make || "Unknown",
    },
    category: car.bodyType || "Car",
    itemCondition,
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: car.price,
      availability,
      url: carUrl,
      seller: {
        "@type": "Organization",
        name: "Sello.pk",
      },
    },
    vehicleModelDate: car.year ? String(car.year) : undefined,
    manufacturer: car.make
      ? {
          "@type": "Organization",
          name: car.make,
        }
      : undefined,
    additionalProperty:
      additionalProperty.length > 0 ? additionalProperty : undefined,
  };
};
