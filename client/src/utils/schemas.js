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

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name:
      car.title ||
      `${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim(),
    description:
      car.description ||
      `${car.make || ""} ${car.model || ""} ${car.year || ""} ${car.condition || ""} car for sale${car.city ? ` in ${car.city}` : ""}`,
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
