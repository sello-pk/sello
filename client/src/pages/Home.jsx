import { corePageSeo } from "../utils/corePageSeo.js";
import React, { Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/sections/home/Hero";
import SEO from "../components/common/SEO";
import StructuredData from "../components/common/StructuredData";
import { AdSenseSlot } from "../components/ads";
import { lazyImport } from "../utils/lazyImports.js";
import Faqs from "../components/utils/Faqs.jsx";

/** Below-fold sections — separate chunks so homepage initial JS stays smaller (LCP/TBT). */
const BrandsSection = lazyImport(
  () => import("../components/sections/home/BrandsSection.jsx"),
);
const ContentHome = lazyImport(
  () => import("../components/sections/home/ContentHome.jsx"),
);
const BannerCarousal = lazyImport(
  () => import("../components/utils/BannerCarousal.jsx"),
);
const FeaturedCarsCarousel = lazyImport(
  () => import("../components/sections/home/FeaturedCarsCarousel.jsx"),
);
const HowAuctionsWork = lazyImport(
  () => import("../components/auction/HowAuctionsWork.jsx"),
);
const CustomerReview = lazyImport(
  () => import("../components/sections/home/CustomerReview.jsx"),
);
const BlogSection = lazyImport(
  () => import("../components/sections/home/BlogSection.jsx"),
);
const BuySellCards = lazyImport(
  () => import("../components/utils/BuySellCards.jsx"),
);
const RecentlyViewedCars = lazyImport(
  () => import("../components/sections/home/RecentlyViewedCars.jsx"),
);
const NewsLatter = lazyImport(
  () => import("../components/utils/NewsLatter.jsx"),
);

const BelowFold = ({ children, minHeight = "8rem" }) => (
  <Suspense
    fallback={
      <div aria-hidden="true" className="w-full" style={{ minHeight }} />
    }
  >
    {children}
  </Suspense>
);

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  const faqs = [
    {
      q: "What is SELLO.?",
      a: "SELLO is a web based car market in Pakistan. Here, people can. Sell cars, bikes, electric bikes, trucks, vans and other vehicles.",
    },
    {
      q: "Can I sell my car for free on SELLO?",
      a: "Yes, you can put your vehicle on SELLO. Reach out to people who might want to buy it through the site.",
    },
    {
      q: "Can I find cars and bikes across Pakistan?",
      a: "Yes, SELLO has vehicle ads from cities in Pakistan. This makes it simpler to look through the cars and bikes that're out there.",
    },
    {
      q: "Does SELLO offer AI car price estimation?",
      a: "Yes, SELLO has an AI Car Price Estimator and Resale Value tool. These help you look into estimated vehicle prices and what your vehicle might be worth on.",
    },
    {
      q: "Does SELLO offer online vehicle auctions?",
      a: "Yes, approved registered dealers. Checked partners can look into and take part in vehicle auctions on SELLO. This depends on the rules of each auction.",
    },
  ];

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <SEO {...corePageSeo.home} />
      <StructuredData.HomePageSchema />
      <div className="w-full min-w-0">
        <Hero />
        <BelowFold minHeight="10rem">
          <BrandsSection />
        </BelowFold>
        <BelowFold minHeight="22rem">
          <FeaturedCarsCarousel />
        </BelowFold>
        <BelowFold minHeight="16rem">
          <ContentHome />
        </BelowFold>
        <BelowFold minHeight="14rem">
          <BannerCarousal />
        </BelowFold>
        <BelowFold minHeight="14rem">
          <HowAuctionsWork />
        </BelowFold>
        <BelowFold minHeight="18rem">
          <CustomerReview key="customer-review" />
        </BelowFold>
        <BelowFold minHeight="14rem">
          <BlogSection />
        </BelowFold>
        <BelowFold minHeight="16rem">
          <AdSenseSlot slot="homepageFeed" />
        </BelowFold>
        <BelowFold minHeight="12rem">
          <BuySellCards />
        </BelowFold>
        <BelowFold minHeight="12rem">
          <RecentlyViewedCars />
        </BelowFold>
        <BelowFold minHeight="12rem">
          <Faqs faqs={faqs} />
        </BelowFold>
        <BelowFold minHeight="10rem">
          <NewsLatter />
        </BelowFold>
      </div>
    </div>
  );
};

export default Home;
