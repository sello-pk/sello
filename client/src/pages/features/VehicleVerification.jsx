import React, { lazy, Suspense } from "react";
import RouteLoader from "../../components/common/RouteLoader";

const VehicleVerificationPage = lazy(() =>
  import("../../components/features/VehicleVerification/VehicleVerificationPage")
);

const VehicleVerification = () => (
  <Suspense fallback={<RouteLoader />}>
    <VehicleVerificationPage />
  </Suspense>
);

export default VehicleVerification;
