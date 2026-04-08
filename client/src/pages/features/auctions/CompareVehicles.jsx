import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useGetAuctionCarDetailQuery } from "@redux/services/api";
import SEO from "../../../components/common/SEO";

function CompareCard({ id }) {
  const { data, isLoading } = useGetAuctionCarDetailQuery(id, { skip: !id });
  const car = data?.car || {};
  const amount = Number(data?.currentBid || data?.startingBid || 0);
  if (!id) return null;
  if (isLoading) return <div className="p-4 border rounded-xl">Loading {id}…</div>;
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <h3 className="font-semibold text-slate-900">
        {car.year} {car.make} {car.model}
      </h3>
      <p className="text-sm text-slate-500 mt-1">
        {car.mileage?.toLocaleString?.() || car.mileage || 0} km • {car.fuelType || "—"} •{" "}
        {car.transmission || "—"}
      </p>
      <p className="text-lg mt-3 font-bold text-[#FFA602]">PKR {amount.toLocaleString()}</p>
      <Link className="text-sm text-[#FFA602] mt-2 inline-block" to={`/auctions/car-detail?id=${id}`}>
        Open details →
      </Link>
    </div>
  );
}

export default function CompareVehicles() {
  const [params] = useSearchParams();
  const ids = (params.get("ids") || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      <SEO
        title="Compare Auction Cars in Pakistan | Sello.pk"
        description="Compare auction cars side by side on Sello.pk. Review pricing, mileage, fuel type, transmission, and other key details before bidding."
        canonical={`https://sello.pk/auctions/compare${params.toString() ? `?${params.toString()}` : ""}`}
      />
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900">Compare auction vehicles</h1>
        <p className="text-slate-500 text-sm mt-1">
          Pass ids in query: <code>?ids=carA,carB</code>
        </p>
        {ids.length === 0 ? (
          <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6 text-slate-600">
            No cars selected for comparison.
          </div>
        ) : (
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ids.map((id) => (
              <CompareCard key={id} id={id} />
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
}
