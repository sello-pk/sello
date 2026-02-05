import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGetSingleCarQuery } from "../../redux/services/api";
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
import { extractCarIdFromSlug } from "../../utils/urlBuilders";

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
    // Force refetch when the car ID changes
    refetchOnMountOrArgChange: true,
  });
  const { addRecentlyViewed } = useRecentlyViewedCars();

  // Track car as recently viewed when it loads
  useEffect(() => {
    if (car && car._id) {
      addRecentlyViewed(car);
    }
  }, [car, addRecentlyViewed]);

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
    { label: "Home", path: "/" },
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
    ? `${car.year || ""} ${car.make || ""} ${car.model || ""} - ${
        car.condition || ""
      } - PKR ${car.price?.toLocaleString() || "0"}`.trim()
    : "Car Details";
  const carDescription = car
    ? `View details for ${car.year || ""} ${car.make || ""} ${
        car.model || ""
      } in ${car.city || ""}. ${car.condition || ""} car with ${
        car.mileage?.toLocaleString() || "N/A"
      } km. Price: PKR ${car.price?.toLocaleString() || "0"}. ${
        car.description || ""
      }`
    : "View car details on Sello";
  const carImage = car?.images?.[0] || "/logo.png";

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title={carTitle}
        description={carDescription}
        image={carImage}
        type="product"
        keywords={`${car?.make || ""} ${car?.model || ""}, ${
          car?.year || ""
        }, ${car?.condition || ""} car, ${car?.city || ""}, car for sale`}
        canonical={
          car ? `https://sello.pk/car/${car._id}/${car.slug}` : undefined
        }
      />
      {/* Structured Data for SEO */}
      {car && (
        <>
          <StructuredData.ProductSchema car={car} />
          <StructuredData.BreadcrumbSchema
            items={breadcrumbItems.map((item) => ({
              name: item.label,
              url: item.path,
            }))}
          />
        </>
      )}
      <Breadcrumb items={breadcrumbItems} />

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
        <div className="max-w-7xl mx-auto px-4 md:px-20 py-8 bg-white">
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
      <div className="max-w-7xl mx-auto px-4 md:px-20 py-12 bg-white">
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
