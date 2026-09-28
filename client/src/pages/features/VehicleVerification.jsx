import React, { lazy, Suspense } from "react";
import RouteLoader from "../../components/common/RouteLoader";
import StructuredData from "../../components/common/StructuredData";
import { AdSenseSlot } from "../../components/ads";

const VehicleVerificationPage = lazy(() =>
  import("../../components/features/VehicleVerification/VehicleVerificationPage")
);

const VehicleVerification = () => (
  <Suspense fallback={<RouteLoader />}>
    <StructuredData.VehicleVerificationPageSchema />
    <VehicleVerificationPage />
    <div className="px-4 sm:px-6 lg:px-8 pb-12">
      <AdSenseSlot slot="vehicleVerification" />
    </div>
  </Suspense>
);

export default VehicleVerification;
