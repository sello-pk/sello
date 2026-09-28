import React from "react";
import CarEstimatorPage from "../../components/features/CarEstimator/CarEstimatorPage";
import SEO from "../../components/common/SEO";
import StructuredData from "../../components/common/StructuredData";
import { AdSenseSlot } from "../../components/ads";

const CarEstimator = () => {
  return (
    <>
      <SEO
        title="AI Car Estimator - Find Your Car's Real Value | Sello.pk"
        description="Get instant AI-powered car valuations for Pakistani market. Estimate your car's price based on make, model, year, condition, and location."
        keywords="car estimator, car value calculator, AI car price, used car valuation, car price Pakistan"
        canonical="https://sello.pk/car-estimator"
      />
      <StructuredData.CarEstimatorPageSchema />
      <CarEstimatorPage />
      <div className="px-4 sm:px-6 lg:px-8">
        <AdSenseSlot slot="estimator" />
      </div>
    </>
  );
};

export default CarEstimator;
