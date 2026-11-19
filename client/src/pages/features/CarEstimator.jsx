import { corePageSeo } from "../../utils/corePageSeo.js";
import React from "react";
import { useParams } from "react-router-dom";
import CarEstimatorPage from "../../components/features/CarEstimator/CarEstimatorPage";
import SEO from "../../components/common/SEO";
import StructuredData from "../../components/common/StructuredData";
import { estimatorBlogPosts } from "../../components/features/CarEstimator/EstimatorBlogsSection";

const CarEstimator = () => {
  const { blogId } = useParams();
  const guide = estimatorBlogPosts.find((post) => String(post.id) === blogId);
  return (
    <>
      {guide ? (
        <SEO
          title={`${guide.title} | AI Car Estimator | Sello`}
          description={guide.excerpt}
        />
      ) : (
        <SEO {...corePageSeo.estimator} />
      )}
      <StructuredData.CarEstimatorPageSchema />
      <CarEstimatorPage initialGuideId={guide?.id} />
    </>
  );
};

export default CarEstimator;
