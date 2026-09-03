import React, { useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGetSingleCarQuery, useGetLiveAuctionByCarIdQuery } from "../../redux/services/api";
import { useRecentlyViewedCars } from "../../hooks/useRecentlyViewedCars";
import CarDetailsHeroSection from "../../components/sections/carDetails/CarDetailsHeroSection";
import CarDetailsGallerySection from "../../components/sections/carDetails/CarDetailsGallerySection";
import Btns from "../../components/sections/carDetails/Btns";
import CarDetailsEtc from "../../components/sections/carDetails/CarDetailsEtc";
import BrandMarquee from "../../components/BrandMarquee";
import { Link } from "react-router-dom";
import Ads from "../../components/utils/Ads";
import BlogSection from "../../components/sections/home/BlogSection";
import CustomerReviews from "../../components/sections/carDetails/CustomerReviews";
import Breadcrumb from "../../components/common/Breadcrumb";
import SimilarListings from "../../components/sections/carDetails/SimilarListings";
import RecentlyViewed from "../../components/sections/carDetails/RecentlyViewed";
import UserReviewSection from "../../components/reviews/UserReviewSection";
import SEO from "../../components/common/SEO";
import StructuredData from "../../components/common/StructuredData";
import { extractCarIdFromSlug, buildCarUrl } from "../../utils/urlBuilders";
import AuctionBidBlock from "../../components/auction/AuctionBidBlock";
import { trackViewContent } from "../../utils/metaPixel.js";

const CarDetails = () => {
  const { id: routeParam } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const extractedCarId = extractCarIdFromSlug(routeParam);

  // Call all hooks at the top before any conditional logic
  const {
    data: car,
    isLoading,
    error,
  } = useGetSingleCarQuery(extractedCarId, {
    skip: !extractedCarId,
    refetchOnMountOrArgChange: true,
  });
  const { data: liveAuctionByCar } = useGetLiveAuctionByCarIdQuery(extractedCarId, {
    skip: !extractedCarId,
  });
  const { addRecentlyViewed } = useRecentlyViewedCars();
  const viewContentTrackedId = useRef(null);

  // Track car as recently viewed when it loads
  useEffect(() => {
    if (car && car._id) {
      addRecentlyViewed(car);
    }
  }, [car, addRecentlyViewed]);

  useEffect(() => {
    if (!car?._id) return;
    if (viewContentTrackedId.current === car._id) return;
    viewContentTrackedId.current = car._id;
    trackViewContent(car);
  }, [car]);

  // Scroll to top when component mounts or route changes
  useEffect(() => {
    // Scroll to top immediately when navigating to car details page
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [routeParam, location.pathname]);

  // Ensure body overflow is restored when leaving this page
  useEffect(() => {
    // Restore body styles on mount and when location changes
    if (document.body) {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [location.pathname]);

  // Cleanup function to restore body styles
  useEffect(() => {
    return () => {
      if (document.body) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }
    };
  }, []);

  const breadcrumbItems = [
    { label: "Cars", path: "/cars" },
    {
      label: car
        ? `${car.make || ""} ${car.model || ""}`.trim() || "Car Details"
        : "Car Details",
      path: `/cars/${routeParam}`,
    },
  ];

  if (error) {
    // Car details error
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Error loading car details</p>
          <p className="text-gray-600 text-sm mb-4">
            {error?.data?.message || error?.message || "Please try again later"}
          </p>
          <button
            onClick={() => navigate("/cars")}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  if (!extractedCarId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Invalid car URL</p>
          <p className="text-gray-600 text-sm mb-4">
            The car ID is missing or invalid.
          </p>
          <button
            onClick={() => navigate("/cars")}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Browse Cars
          </button>
        </div>
      </div>
    );
  }

  if (!car && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-2">Car not found</p>
          <p className="text-gray-600 text-sm mb-4">
            The car listing you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/cars")}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Browse Other Cars
          </button>
        </div>
      </div>
    );
  }

  // Wait for car data before rendering
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary-500 mx-auto mb-4"></div>
          <div className="text-gray-500 text-sm">Loading car details...</div>
        </div>
      </div>
    );
  }

  const carTitle = car
    ? (() => {
        const make = car.make || "";
        const model = car.model || "";
        const year = car.year || "";
        const city = car.city || "";
        const variant = car.variant && car.variant !== "N/A" ? car.variant : "";
        const condition = car.condition || "";
        const parts = [make, model, year].filter(Boolean);
        if (condition) parts.push(condition);
        parts.push("for sale");
        if (city) parts.push("in", city);
        return parts.join(" ");
      })()
    : "Car Details";
  const carDescription = car
    ? (() => {
        const make = car.make || "";
        const model = car.model || "";
        const year = car.year || "";
        const city = car.city || "";
        const price = car.price?.toLocaleString() || "0";
        const cc = car.engineCapacity || "";
        const color = car.colorExterior || "";
        const mileage = car.mileage?.toLocaleString() || "N/A";
        const transmission = car.transmission || "";
        const vehicleType = car.vehicleType || "Car";
        const parts = [year, make, model];
        if (city) parts.push("Used for sale in", city);
        else parts.push("Used for sale");
        parts.push(`for PKR ${price}.`);
        const specs = [];
        if (cc) specs.push(`${cc} cc`);
        if (color) specs.push(color);
        specs.push(`${mileage} KM Driven`);
        if (transmission) specs.push(transmission);
        if (vehicleType) specs.push(vehicleType);
        if (specs.length) parts.push(`Buy this ${specs.join(", ")}.`);
        parts.push("Contact Seller Now!");
        return parts.join(" ");
      })()
    : "View car details on Sello";
  const carKeywords = car
    ? (() => {
        const make = (car.make || "").toLowerCase();
        const model = (car.model || "").toLowerCase();
        const year = car.year || "";
        const city = (car.city || "").toLowerCase();
        const keywords = [
          `${make} ${model} ${year} for sale`,
          `${make} ${model} ${year}`,
          `${make} ${model} ${year} ${city}`,
          `${year} ${make} ${model}`,
          `${make} ${model} for sale`,
          `used ${make} ${model} ${year}`,
        ];
        return keywords.join(", ");
      })()
    : "cars, buy cars, sell cars, used cars, new cars, Pakistan";
  const carImage = car?.images?.[0] || "/logo.png";

  return (
    <div className="min-h-screen w-full min-w-0 max-w-full overflow-x-hidden bg-gray-50">
      <SEO
        title={carTitle}
        description={carDescription}
        image={carImage}
        type="product"
        keywords={carKeywords}
        canonical={
          car ? `https://sello.pk${buildCarUrl(car)}` : undefined
        }
      />
      {/* Structured Data for SEO */}
      {car && (
        <>
          <StructuredData.VehicleSchema car={car} />
          <StructuredData.BreadcrumbSchema car={car} />
        </>
      )}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumbItems} hideHome />
      </div>

      {/* Auction: banner + inline bidding when car is in live/upcoming auction */}
      {liveAuctionByCar?.auctionCarId && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 space-y-4">
          <Link
            to={`/auctions/car-detail?id=${liveAuctionByCar.auctionCarId}`}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg bg-amber-50 border border-amber-200 px-3 sm:px-4 py-3 text-amber-900 hover:bg-amber-100 transition-colors min-w-0"
          >
            <span className="font-medium min-w-0 break-words">
              {liveAuctionByCar.auction?.status === "live"
                ? "Also in Live Auction"
                : "In Upcoming Auction"}
              {liveAuctionByCar.auction?.title && ` — ${liveAuctionByCar.auction.title}`}
            </span>
            <span className="text-sm shrink-0">
              {liveAuctionByCar.currentBid != null
                ? `Current bid: PKR ${Number(liveAuctionByCar.currentBid).toLocaleString()}`
                : `Starting bid: PKR ${Number(liveAuctionByCar.startingBid || 0).toLocaleString()}`}
              {" · View full page →"}
            </span>
          </Link>
          {/* Inline bidding: countdown, current bid, bid history, place bid */}
          {liveAuctionByCar.auction?.status === "live" && (
            <div className="max-w-md">
              <AuctionBidBlock auctionCarId={liveAuctionByCar.auctionCarId} />
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <CarDetailsHeroSection key={`hero-${routeParam}`} />

      {/* Gallery Section */}
      <CarDetailsGallerySection key={`gallery-${routeParam}`} />

      {/* Action Buttons */}
      <Btns />

      {/* Main Content */}
      <CarDetailsEtc />

      {/* Seller Reviews */}
      {car?.postedBy && (
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserReviewSection
            userId={car.postedBy?._id || car.postedBy}
            carId={routeParam}
            sellerName={car.postedBy?.name}
          />
        </div>
      )}

      {/* Customer Reviews */}
      <div className="bg-white">
        <CustomerReviews />
      </div>

      {/* Similar Listings Section */}
      {extractedCarId && <SimilarListings carId={extractedCarId} />}

      {/* Recently Viewed Section */}
      <RecentlyViewed />

      {/* Brands Section */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Explore Our Premium Brands
            </h2>
            <p className="text-gray-600 mt-2">
              Discover trusted automotive brands
            </p>
          </div>
          <Link
            to="/view-all-brands"
            className="text-primary-500 hover:text-primary-500 font-semibold flex items-center gap-2 transition-colors"
          >
            Show All Brands
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
        <BrandMarquee />
      </div>

      {/* Ads Section */}
      <div className="bg-gray-50">
        <Ads />
      </div>

      {/* Blog Section */}
      <div className="bg-white">
        <BlogSection />
      </div>
    </div>
  );
};

export default CarDetails;
