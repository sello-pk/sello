import { Link } from "react-router-dom";
import { ChevronRight, Fuel } from "lucide-react";
import { images } from "../assets/assets";
import { useGetFuelPricesQuery } from "../redux/services/api";

const formatPrice = new Intl.NumberFormat("en-PK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatEffectiveDate = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function FuelPriceCard({ price }) {
  const effectiveDate = new Date(price.effective_date);
  const change = price.change_pkr;
  const changeText = !Number.isFinite(change)
    ? "Change unavailable"
    : change === 0
      ? "No change"
      : `PKR ${formatPrice.format(Math.abs(change))} ${change > 0 ? "increase" : "decrease"}`;

  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-7">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
        <Fuel aria-hidden="true" className="h-5 w-5 text-primary-600" />
        {price.fuel}
      </h3>
      <p className="mt-4 flex flex-wrap items-baseline gap-x-2">
        <span className="text-3xl font-bold tabular-nums sm:text-4xl">
          {formatPrice.format(price.price_pkr)}
        </span>
        <span className="text-sm text-stone-600">PKR per litre</span>
      </p>
      <p className="mt-3 text-sm text-stone-700">{changeText}</p>
      {price.effective_date && !Number.isNaN(effectiveDate.getTime()) && (
        <p className="mt-1 text-sm text-stone-600">
          Effective{" "}
          <time dateTime={price.effective_date}>
            {formatEffectiveDate.format(effectiveDate)}
          </time>
        </p>
      )}
    </article>
  );
}

export default function FuelPrices() {
  const { data, isFetching, refetch } = useGetFuelPricesQuery();
  const prices = Array.isArray(data?.prices)
    ? data.prices.filter(
        (price) =>
          price &&
          (price.slug === "petrol" || price.slug === "diesel") &&
          Number.isFinite(price.price_pkr) &&
          price.price_pkr > 0,
      )
    : [];

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-stone-900">
      <header className="relative isolate overflow-hidden bg-[#050B20] text-white">
        <img
          src={images.fuelPricesInPakistan}
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#050B20]/75" />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
            <span aria-current="page">Fuel prices</span>
          </nav>
          <h1 className="mt-6 text-3xl font-bold sm:text-4xl">
            Fuel prices in Pakistan
          </h1>
          <p className="mt-3 max-w-xl text-white/85">
            Current petrol and diesel prices in Pakistani rupees per litre.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8" aria-labelledby="current-fuel-prices">
        <h2 id="current-fuel-prices" className="text-xl font-semibold sm:text-2xl">
          Current prices
        </h2>
        {prices.length > 0 ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {prices.map((price) => <FuelPriceCard key={price.slug} price={price} />)}
          </div>
        ) : isFetching ? (
          <p role="status" className="mt-5 text-stone-600">Loading fuel prices…</p>
        ) : (
          <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-5">
            <p role="status">Current fuel prices are temporarily unavailable.</p>
            <button
              type="button"
              onClick={refetch}
              className="mt-3 rounded-lg bg-primary-500 px-4 py-2 font-semibold text-stone-950"
            >
              Try again
            </button>
          </div>
        )}
        <p className="mt-5 text-sm text-stone-600">
          Prices reflect OGRA-notified rates.
        </p>
      </section>
    </div>
  );
}
