import React, { lazy, Suspense } from "react";
import RouteLoader from "../../components/common/RouteLoader";
import StructuredData from "../../components/common/StructuredData";

const VehicleVerificationPage = lazy(() =>
  import("../../components/features/VehicleVerification/VehicleVerificationPage")
);

const VehicleVerification = () => (
  <Suspense fallback={<RouteLoader />}>
    <StructuredData.VehicleVerificationPageSchema />
    <VehicleVerificationPage />
  </Suspense>
);

export default VehicleVerification;
