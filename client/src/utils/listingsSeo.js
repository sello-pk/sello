/**
 * Landing-page SEO copy for make- and model-filtered listings on FilteredResults.
 * Keyed by the normalized URL params so title/description stay in sync with the
 * footer links ("VIEW CARS BY MAKE", "VIEW CARS BY MODEL").
 */

const norm = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

 /** make + model landings — `/search-results?make=X&model=Y` */
export const modelSeo = {
  "toyota corolla": {
    title: "Toyota Corolla for Sale | New & Used Cars in Pakistan",
    description:
      "Browse Toyota Corolla for sale in Pakistan. Find new and used Corolla cars with prices, specifications, photos, and seller details in one place.",
  },
  "honda city": {
    title: "Honda City for Sale in Pakistan | Great Deals & Prices",
    description:
      "Explore Honda City for sale in Pakistan with updated listings, prices, photos, specifications, and seller details. Find your ideal Honda City today.",
  },
  "toyota raize": {
    title: "Toyota Raize for Sale Pakistan | Buy New & Used Cars",
    description:
      "Find Toyota Raize for sale in Pakistan. Browse new and used Raize cars, compare prices, check specifications, and connect with sellers easily.",
  },
  "toyota prado": {
    title: "Toyota Prado for Sale | Toyota Prado Prices in Pakistan",
    description:
      "Search Toyota Prado for sale in Pakistan. Discover available Prado SUVs, compare prices and features, check specifications, and find your ideal vehicle.",
  },
  "toyota passo": {
    title: "Toyota Passo for Sale in Pakistan | Prices & Models",
    description:
      "Search Toyota Passo for sale in Pakistan and explore different models, prices, specifications, photos, and seller information to make your car search easier.",
  },
  "suzuki mehran": {
    title: "Suzuki Mehran for Sale in Pakistan | Affordable Cars",
    description:
      "Find Suzuki Mehran for sale in Pakistan at affordable prices. Browse listings, compare model years, specifications, photos, and seller details with ease.",
  },
  "suzuki alto": {
    title: "Suzuki Alto for Sale in Pakistan | Used Alto Cars",
    description:
      "Suzuki Alto for sale in Pakistan and discover used Alto cars with detailed prices, specifications, model years, photos, and seller information.",
  },
  "suzuki swift": {
    title: "Suzuki Swift for Sale in Pakistan | Find Your Ideal Car",
    description:
      "Suzuki Swift for sale in Pakistan and find cars that fit your budget. Compare prices, model years, specifications, features, and seller details.",
  },
  "kia sportage": {
    title: "KIA Sportage for Sale in Pakistan | Latest Car Deals",
    description:
      "Discover KIA Sportage for sale in Pakistan with updated listings. Compare prices, model years, specifications, features, photos, and seller details.",
  },
  "toyota land cruiser": {
    title: "Toyota Land Cruiser for Sale in Pakistan | New & Used",
    description:
      "Find Toyota Land Cruiser for sale in Pakistan. Browse new and used Land Cruiser SUVs, compare prices, check specifications, photos, and seller details.",
  },
  "honda civic": {
    title: "Honda Civic for Sale in Pakistan | Find Your Ideal Car",
    description:
      "Search Honda Civic for sale in Pakistan and find cars that match your budget. Compare prices, model years, specifications, features, and seller details.",
  },
  "suzuki wagon r": {
    title: "Suzuki Wagon R for Sale | Best Prices in Pakistan",
    description:
      "Looking for Suzuki Wagon R for sale in Pakistan? Explore available cars, compare prices, model years, specifications, features, and seller details.",
  },
  "suzuki bolan": {
    title: "Suzuki Bolan for Sale in Pakistan | Best Car Deals",
    description:
      "Discover Suzuki Bolan for sale in Pakistan through detailed listings. Compare prices, specifications, model years, features, photos, and seller information.",
  },
  "daihatsu cuore": {
    title: "Daihatsu Cuore for Sale | Buy Used Cars in Pakistan",
    description:
      "Looking for Daihatsu Cuore for sale? Browse used Cuore cars in Pakistan, compare prices and specifications, and find the right car for your budget.",
  },
  "toyota yaris sedan": {
    title: "Toyota Yaris Sedan for Sale in Pakistan | Top Car Deals",
    description:
      "Discover Toyota Yaris Sedan for sale in Pakistan with updated listings, competitive prices, detailed features, photos, and seller information.",
  },
  "suzuki cultus": {
    title: "Suzuki Cultus for Sale in Pakistan | Car Prices & Models",
    description:
      "Explore Suzuki Cultus for sale in Pakistan with prices, model details, specifications, features, photos, and updated seller listings.",
  },
  "toyota vitz": {
    title: "Toyota Vitz for Sale in Pakistan | Best Deals & Latest Car",
    description:
      "Find Toyota Vitz for sale in Pakistan with updated listings and prices. Compare models, specifications, photos, features, and seller details.",
  },
  "daihatsu mira": {
    title: "Daihatsu Mira for Sale in Pakistan | Compare Car Prices",
    description:
      "Discover Daihatsu Mira for sale in Pakistan. Compare car prices, model years, features, specifications, photos, and available seller listings.",
  },
  "toyota hilux": {
    title: "Toyota Hilux for Sale in Pakistan | Buy & Sell in Pakistan",
    description:
      "Looking for Toyota Hilux for sale in Pakistan? Explore available listings, compare prices, check vehicle details, view photos, and connect with sellers.",
  },
  "honda vezel": {
    title: "Honda Vezel for Sale in Pakistan | Buy & Sell Cars",
    description:
      "Looking for Honda Vezel for sale in Pakistan? Explore listings, compare prices, view specifications and photos, and connect with sellers easily.",
  },
};

/** version/variant landings — `/filter?model=X` */
export const versionSeo = {
  "mehran vxr": {
    title: "Used Suzuki Mehran VXR for Sale in Pakistan | Top Best Deals",
    description:
      "Every used Mehran VXR in our Pakistan showroom passes a strict quality check before listing. Browse the stock now and book your test drive today.",
  },
  gli: {
    title: "Buy Used Corolla GLi in Pakistan | Best Prices Guaranteed",
    description:
      "Each used Corolla GLi listed here has been carefully inspected for safety and reliability. Contact us now to schedule a viewing at your convenience.",
  },
  "civic exi": {
    title: "Used Civic EXi for Sale in Pakistan | Reliable & Affordable",
    description:
      "Choose from a curated selection of used Civic EXi cars for sale in Pakistan, each one road tested and quality approved. Drive home this weekend enjoy.",
  },
  "corolla altis x": {
    title: "Used Corolla Altis X for Sale in Pakistan | Book Test Drive",
    description:
      "Looking for a reliable sedan? Our used Corolla Altis X cars for sale in Pakistan offer comfort and dependable performance. Visit our showroom today.",
  },
  "swift dlx": {
    title: "Buy Certified Used Swift DLX Cars in Excellent Condition Today",
    description:
      "Looking for a sporty hatchback? Our used Swift DLX cars for sale in Pakistan offer style and dependable performance. Visit our showroom today!",
  },
  "mehran vx": {
    title: "Mehran VX for Sale in Pakistan | Best Value Deals at Sello",
    description:
      "Trusted Mehran VX cars for sale in Pakistan are waiting for you at our showroom. Reliable, affordable, and ready for the road. Schedule a visit now!",
  },
  altis: {
    title: "Toyota Altis for Sale in Pakistan | Best Prices & Deals",
    description:
      "Each used Corolla Altis listed here has been carefully inspected for safety and reliability. Contact us now to schedule a viewing at your convenience!",
  },
  "vitz f": {
    title: "Toyota Vitz F Price in Pakistan | Used Cars & Best Deals",
    description:
      "Check Toyota Vitz F prices in Pakistan and explore used cars available for sale. Compare features, models, and prices to find your ideal Vitz F.",
  },
  "city prosmatec": {
    title: "Honda City Prosmatec Cars for Sale in Pakistan | Best Deals",
    description:
      "Explore used Honda City Prosmatec cars for sale in Pakistan. Compare prices, models, features, and available options to find your ideal car.",
  },
  "cuore cx": {
    title: "Buy Daihatsu Cuore CX Price in Pakistan | Cars for Sale",
    description:
      "Explore Daihatsu Cuore CX prices in Pakistan and find cars available for sale. Compare models and features to make an informed buying decision.",
  },
  "civic 1.8": {
    title: "Buy Honda Civic 1.8 in Pakistan | Used Car Prices & Deals",
    description:
      "Looking for a Honda Civic 1.8 in Pakistan? Browse used cars, compare prices and features, and discover suitable options for your next purchase.",
  },
  "civic vti": {
    title: "Honda Civic VTi for Sale | Used Cars & Prices in Pakistan",
    description:
      "Browse Honda Civic VTi cars for sale in Pakistan. Compare used car prices, features, and available models to find an option that fits your budget.",
  },
  "passo x": {
    title: "Toyota Passo X in Pakistan | Used Cars at Best Prices",
    description:
      "Explore Toyota Passo X used cars in Pakistan with competitive prices. Compare available models, features, and options to find the right Passo X.",
  },
  "city aspire i-vtec": {
    title: "Honda City Aspire i-VTEC for Sale in Pakistan | Car Deals",
    description:
      "Explore Honda City Aspire i-VTEC cars for sale in Pakistan. Compare used models, prices, features, and available options to find your next car.",
  },
  "cultus vxl": {
    title: "Suzuki Cultus VXL Price & Used Cars for Sale in Pakistan",
    description:
      "Check Suzuki Cultus VXL prices in Pakistan and browse used cars for sale. Compare available models, features, and prices to find the right car.",
  },
  "civic vti oriel": {
    title: "Honda Civic VTi Oriel Cars for Sale | Pakistan Prices",
    description:
      "Discover Honda Civic VTi Oriel cars for sale in Pakistan. Explore used models, compare prices and features, and find a car that suits your needs.",
  },
  xli: {
    title: "Toyota Corolla XLi for Sale in Pakistan | Find Your Ideal Car",
    description:
      "Find Toyota Corolla XLi cars for sale in Pakistan. Explore used models, compare prices and features, and discover great options for your next car.",
  },
  "city idsi": {
    title: "Honda City iDSI Price in Pakistan | Used Cars & Deals",
    description:
      "Check Honda City iDSI prices in Pakistan and explore used cars for sale. Compare models, features, and prices to find a great deal.",
  },
  "cultus vxri": {
    title: "Used Suzuki Cultus VXRi for Sale | Used Cars Deals in Pakistan",
    description:
      "Looking for a used Suzuki Cultus VXRi in Pakistan? Browse cars for sale, compare prices and features, and find a suitable option for your needs.",
  },
};

/** make-only landings — `/search-results?make=X` */
export const makeSeo = {
  suzuki: {
    title: "Buy Certified Used Suzuki Cars in Excellent Condition Today",
    description:
      "Looking for used Suzuki cars? Browse our inspected, reliable, budget friendly vehicles. Book a test drive today or visit our showroom now.",
  },
  toyota: {
    title: "Used Toyota Cars in Pakistan | Best Prices & Great Car Deals",
    description:
      "Our used Toyota cars are inspected for quality, priced to fit your budget, ready for the road. Visit our showroom or call us today.",
  },
  honda: {
    title: "Find Used Honda Cars in Pakistan | Trusted Dealers & Great Deals",
    description:
      "Explore our collection of used Honda cars for sale in Pakistan, built for reliability, comfort, performance. Book your visit now.",
  },
  daihatsu: {
    title: "Used Daihatsu Cars in Pakistan | Best Prices & Test Drive Deals",
    description:
      "Shop used Daihatsu cars for sale in Pakistan at our trusted showroom. Inspected, affordable, ready to drive. Book your visit today.",
  },
  nissan: {
    title: "Used Nissan Cars in Pakistan | Reliable & Affordable Prices",
    description:
      "Our showroom offers used Nissan cars for sale in Pakistan, all inspected for quality and priced to fit your budget. Visit us today.",
  },
  hyundai: {
    title: "Used Hyundai Cars for Sale in Pakistan | Great Deals With Sello",
    description:
      "Find your perfect used Hyundai car in Pakistan at unbeatable prices. Reliable, budget friendly, ready for the road. Book your visit or call us now.",
  },
  kia: {
    title: "Used KIA Cars Pakistan | Explore Models, Prices & Great Deals",
    description:
      "We verify mileage, engine health, and documents on every used KIA car we sell in Pakistan. Reach out to our team for a hassle free buying experience!",
  },
  mitsubishi: {
    title: "Buy Used Mitsubishi Cars in Pakistan | Best Value Used Cars",
    description:
      "Each used Mitsubishi car listed here has been carefully inspected for safety and reliability. Contact us now to schedule a viewing at your convenience.",
  },
  changan: {
    title: "Used Changan Cars for Sale in Pakistan | Drive Home Today",
    description:
      "Every used Changan car in our Pakistan showroom passes a strict quality check before listing. Browse the stock now and book your test drive today.",
  },
  haval: {
    title: "Find Used Haval Cars in Pakistan | Best Deals & Latest Prices",
    description:
      "Looking to upgrade your ride? Our used Haval cars for sale in Pakistan offer great value and dependable performance. Visit our showroom today.",
  },
  "mercedes benz": {
    title: "Buy Used Mercedes Benz Cars in Pakistan | Best Deals & Prices",
    description:
      "Each used Mercedes Benz car listed here has been carefully inspected for safety and reliability. Contact us now to schedule a viewing at your convenience.",
  },
  mg: {
    title: "Used MG Cars for Sale in Pakistan | Buy Used Cars in Pakistan",
    description:
      "Compare models, check prices, and find your ideal used MG car in Pakistan all in one place. Our sales team is ready to help you decide today.",
  },
  faw: {
    title: "Buy Quality Used FAW Cars at in Pakistan Best Prices at Sello",
    description:
      "Explore our wide range of used FAW cars for sale in Pakistan, all inspected for quality and priced to fit your budget. Find the perfect ride and visit us today.",
  },
  audi: {
    title: "Used Audi Cars for Sale in Pakistan | Best Prices & Great Deals",
    description:
      "Each used Audi car listed here has been carefully inspected for safety and reliability. Contact us now to schedule a viewing at your convenience.",
  },
  bmw: {
    title: "Used BMW Cars in Pakistan | Reliable and Affordable Prices",
    description:
      "Get exceptional value with our used BMW cars for sale in Pakistan, all backed by thorough inspections and fair pricing. Visit our showroom or call us today.",
  },
  mazda: {
    title: "Used Mazda Cars for Sale in Pakistan | Book a Test Drive",
    description:
      "Looking to upgrade your ride? Our used Mazda cars for sale in Pakistan offer great value and dependable performance. Visit our showroom today.",
  },
  lexus: {
    title: "Buy Used Lexus Cars in Pakistan | Used Cars Deals in Pakistan",
    description:
      "Each used Lexus car listed here has been carefully inspected for safety and reliability. Contact us now to schedule a viewing at your convenience.",
  },
  dfsk: {
    title: "Used DFSK Cars for Sale in Pakistan | Best Deals & Prices",
    description:
      "Every used DFSK car in our Pakistan showroom passes a strict quality check before listing. Browse the stock now and book your test drive today.",
  },
  chevrolet: {
    title: "Buy Used Chevrolet Cars in Pakistan | Top Best Deals at Sello",
    description:
      "Get exceptional value with our used Chevrolet cars for sale in Pakistan, all backed by thorough inspections and fair pricing. Visit us today!",
  },
  peugeot: {
    title: "Used Peugeot Cars for Sale in Pakistan | Find Your Ideal Car",
    description:
      "Looking to upgrade your ride? Our used Peugeot cars for sale in Pakistan offer great value and dependable performance. Visit our showroom today.",
  },
};

/**
 * Resolve curated SEO copy for a make+model, version, or make-only landing.
 * Returns null when no curated copy matches (caller falls back to generic).
 */
export const getListingsSeo = ({ make, model } = {}) => {
  if (make && model) {
    const entry = modelSeo[norm(`${make} ${model}`)];
    if (entry) return { seoTitle: entry.title, seoDescription: entry.description };
  }
  if (model) {
    const entry = versionSeo[norm(model)];
    if (entry) return { seoTitle: entry.title, seoDescription: entry.description };
  }
  if (make) {
    const entry = makeSeo[norm(make)];
    if (entry) return { seoTitle: entry.title, seoDescription: entry.description };
  }
  return null;
};

const toTitleCase = (value) =>
  String(value || "")
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));

/** Layer a city into a curated title without rewriting the curated entries. */
const layerCityInTitle = (title, city) => {
  const cityName = toTitleCase(city);
  const forSaleInPakistan = /for\s+Sale\s+(?:in\s+)?Pakistan/i;
  if (forSaleInPakistan.test(title)) {
    return title.replace(forSaleInPakistan, `for Sale in ${cityName}`);
  }
  const forSale = /for\s+Sale/i;
  if (forSale.test(title)) {
    return title.replace(forSale, `for Sale in ${cityName}`);
  }
  return title;
};

const layerCityInDescription = (description, city) =>
  description.replace(/\bin Pakistan\b/i, `in ${toTitleCase(city)}`);

/**
 * Curated SEO for make/model landings, with the city layered in when present.
 * Used by both FilteredResults (/search-results, /used-cars/:citySlug) and
 * FilterPage (/filter) so the two stay consistent.
 */
export const getListingsSeoForParams = ({ make, model, city } = {}) => {
  const base = getListingsSeo({ make, model });
  if (!base) return null;
  if (!city) return base;
  return {
    seoTitle: layerCityInTitle(base.seoTitle, city),
    seoDescription: layerCityInDescription(base.seoDescription, city),
  };
};
