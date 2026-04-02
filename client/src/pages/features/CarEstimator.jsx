import React from "react";
import CarEstimatorPage from "../../components/features/CarEstimator/CarEstimatorPage";
import SEO from "../../components/common/SEO";

const CarEstimator = () => {
  return (
    <>
      <SEO
        title="AI Car Estimator - Find Your Car's Real Value | Sello.pk"
        description="Get instant AI-powered car valuations for Pakistani market. Estimate your car's price based on make, model, year, condition, and location."
        keywords="car estimator, car value calculator, AI car price, used car valuation, car price Pakistan"
        canonical="https://sello.pk/car-estimator"
      />
      <CarEstimatorPage />
    </>
  );
};

export default CarEstimator;
