import React, { useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/sections/home/Hero";
import NewsLatter from "../components/utils/NewsLatter";
import BuySellCards from "../components/utils/BuySellCards";
import SEO from "../components/common/SEO";
import StructuredData from "../components/common/StructuredData";
import RecentlyViewedCars from "../components/sections/home/RecentlyViewedCars";

// Lazy load non-critical components
const CustomerReview = React.lazy(() => import("../components/sections/home/CustomerReview"));
const BlogSection = React.lazy(() => import("../components/sections/home/BlogSection"));
const Video = React.lazy(() => import("../components/sections/home/Video"));
const BrandsSection = React.lazy(() =>
  import("../components/sections/home/BrandsSection"),
);
const FeaturedCarsCarousel = React.lazy(() =>
  import("../components/sections/home/FeaturedCarsCarousel"),
);
const BannerCarousal = React.lazy(() =>
  import("../components/utils/BannerCarousal"),
);
const HowAuctionsWork = React.lazy(() =>
  import("../components/auction/HowAuctionsWork"),
);

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    // Ensure we scroll to top when Home component renders
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
      {/* Structured Data for SEO */}
      <StructuredData.OrganizationSchema />
      <StructuredData.WebSiteSchema />
      <div className="w-full min-w-0">
        <Hero />
        <Suspense
          fallback={
            <section
              className="bg-[#EEEEEE] w-full md:py-8 min-h-[260px] md:min-h-[280px]"
              aria-hidden="true"
            >
              <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6">
                <div className="h-8 w-48 max-w-[70%] rounded bg-gray-200/80 animate-pulse mb-6" />
                <div className="min-h-[100px] rounded-lg bg-gray-200/60 animate-pulse" />
              </div>
            </section>
          }
        >
          <BrandsSection />
        </Suspense>
        <Suspense fallback={<div style={{height: "400px"}} className="bg-gray-100 animate-pulse rounded-lg" />}>
          <Video />
        </Suspense>
        <Suspense
          fallback={
            <section
              className="relative w-full min-h-[60vh] md:min-h-[350px] lg:min-h-[400px] overflow-hidden bg-gradient-to-r from-primary-500/30 to-gray-400/40 animate-pulse"
              aria-hidden="true"
            />
          }
        >
          <BannerCarousal />
        </Suspense>
        <Suspense
          fallback={
            <section
              className="relative min-h-[420px] overflow-hidden bg-gray-100 py-12 md:py-14"
              aria-busy="true"
              aria-label="Loading featured cars"
            >
              <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-14 w-14 rounded-lg bg-gray-200 animate-pulse" />
                  <div className="space-y-2 flex-1 max-w-xs">
                    <div className="h-8 rounded bg-gray-200 animate-pulse" />
                    <div className="h-4 rounded bg-gray-200 animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, key) => (
                    <div
                      key={key}
                      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="h-44 md:h-52 bg-gray-200 animate-pulse" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 w-[85%] rounded bg-gray-200 animate-pulse" />
                        <div className="h-3 w-[60%] rounded bg-gray-200 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          }
        >
          <FeaturedCarsCarousel />
        </Suspense>
        <Suspense
          fallback={
            <section
              className="py-16 min-h-[280px] bg-gradient-to-br from-slate-50 to-primary-50/20"
              aria-hidden="true"
            >
              <div className="max-w-5xl mx-auto px-4">
                <div className="h-10 w-64 max-w-[80%] mx-auto rounded-lg bg-gray-200/80 animate-pulse mb-10" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-36 rounded-xl bg-gray-200/60 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            </section>
          }
        >
          <HowAuctionsWork />
        </Suspense>
        <Suspense fallback={<div style={{height: "400px"}} className="bg-gray-100 animate-pulse rounded-lg" />}>
          <CustomerReview key="customer-review" />
        </Suspense>
        <Suspense fallback={<div style={{height: "500px"}} className="bg-gray-100 animate-pulse rounded-lg" />}>
          <BlogSection />
        </Suspense>
        <BuySellCards />
        <RecentlyViewedCars />
        <NewsLatter />
      </div>
    </div>
  );
};

export default Home;
