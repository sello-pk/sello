import React, { Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/sections/home/Hero";
import SEO from "../components/common/SEO";
import StructuredData from "../components/common/StructuredData";
import { lazyImport } from "../utils/lazyImports.js";

/** Below-fold sections — separate chunks so homepage initial JS stays smaller (LCP/TBT). */
const BrandsSection = lazyImport(
  () => import("../components/sections/home/BrandsSection.jsx"),
);
const Video = lazyImport(() => import("../components/sections/home/Video.jsx"));
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
      <div
        aria-hidden="true"
        className="w-full"
        style={{ minHeight }}
      />
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

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <SEO
        title="Car for Sale in Pakistan | Buy & Sell Used Cars – Sello.pk"
        description="Find the best car for sale in Pakistan on Sello.pk. Buy or sell used cars in Karachi, Lahore, Islamabad & beyond with verified sellers and fair pricing."
        keywords="cars for sale, cars for sale in Pakistan"
        canonical="https://sello.pk/"
      />
      <StructuredData.OrganizationSchema />
      <StructuredData.WebSiteSchema />
      <div className="w-full min-w-0">
        <Hero />
        <BelowFold minHeight="6rem">
          <BrandsSection />
        </BelowFold>
        <BelowFold minHeight="12rem">
          <Video />
        </BelowFold>
        <BelowFold minHeight="10rem">
          <BannerCarousal />
        </BelowFold>
        <BelowFold minHeight="14rem">
          <FeaturedCarsCarousel />
        </BelowFold>
        <BelowFold minHeight="10rem">
          <HowAuctionsWork />
        </BelowFold>
        <BelowFold minHeight="12rem">
          <CustomerReview key="customer-review" />
        </BelowFold>
        <BelowFold minHeight="10rem">
          <BlogSection />
        </BelowFold>
        <BelowFold minHeight="8rem">
          <BuySellCards />
        </BelowFold>
        <BelowFold minHeight="8rem">
          <RecentlyViewedCars />
        </BelowFold>
        <BelowFold minHeight="6rem">
          <NewsLatter />
        </BelowFold>
      </div>
    </div>
  );
};

export default Home;
