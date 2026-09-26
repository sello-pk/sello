import React from "react";
import AboutHeroSection from "../../components/sections/about/AboutHeroSection";
import OutStorySection from "../../components/sections/about/OutStorySection";
import JoinUsSection from "../../components/sections/about/JoinUsSection";
import OurTeam from "../../components/sections/about/OurTeam";
import ReviewsAnalysis from "../../components/sections/about/ReviewsAnalysis";
import CustomerReviews from "../../components/sections/about/CustomerReviews";
import SEO from "../../components/common/SEO";
import StructuredData from "../../components/common/StructuredData";

const About = () => {
  return (
    <div>
      <StructuredData.AboutPageSchema />
      <SEO
        title="About Us | Buy & Sell Cars Online in Pakistan – Sello.pk"
        description="Sello.pk is a secure and transparent platform to buy and sell cars in Pakistan. Discover our mission, values, and commitment to trusted car trading."
        canonical="https://sello.pk/about"
      />
      <AboutHeroSection />
      <OutStorySection />
      <JoinUsSection />
      <OurTeam />
      <ReviewsAnalysis />
      <CustomerReviews />
    </div>
  );
};

export default About;
