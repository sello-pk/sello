import { Link } from "react-router-dom";
import { ChevronRight, Fuel } from "lucide-react";
import { images } from "../assets/assets";
import GuideCards from "../components/common/GuideCards";
import SEO from "../components/common/SEO";
import { FAQSchema } from "../components/common/StructuredData";
import { fuelPricesSeo, fuelPricesHeading, fuelPriceFaqs } from "../utils/fuelPricesContent.js";
import { fuelVerificationPosts } from "../components/features/VehicleVerification/fuelVerificationPosts.js";
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
        <Fuel aria-hidden="true" className="h-5 w-5 text-primary-500" />
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
      {price.price_updated_at && /^\d{4}-\d{2}-\d{2}/.test(price.price_updated_at) && (
        <p className="mt-1 text-xs text-stone-500">
          Source record updated {price.price_updated_at.slice(0, 10)}
        </p>
      )}
    </article>
  );
}

export default function FuelPrices() {
  const { data, isFetching, isError, fulfilledTimeStamp, refetch } = useGetFuelPricesQuery(undefined, {
    pollingInterval: 300000,
    refetchOnMountOrArgChange: 300,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const prices = Array.isArray(data?.prices)
    ? data.prices.filter(
        (price) =>
          price &&
          (price.slug === "petrol" || price.slug === "diesel") &&
          Number.isFinite(price.price_pkr) &&
          price.price_pkr > 0 &&
          /^\d{4}-\d{2}-\d{2}$/.test(price.effective_date || "") &&
          !Number.isNaN(Date.parse(price.effective_date)) &&
          price.effective_date <= today,
      )
    : [];

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-stone-900">
      <SEO {...fuelPricesSeo} />
      <FAQSchema items={fuelPriceFaqs} />
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
            {fuelPricesHeading}
          </h1>
          <p className="mt-3 max-w-xl text-white/85">
            Check the latest published petrol price in Pakistan today and diesel rates per litre. Review the effective date before using a rate to plan your fuel budget.
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8" aria-labelledby="current-fuel-prices">
        <h2 id="current-fuel-prices" className="text-xl font-semibold sm:text-2xl">
          Latest published petrol and diesel prices
        </h2>
        {fulfilledTimeStamp && <p className="mt-2 text-xs text-stone-500">Price information checked {new Date(fulfilledTimeStamp).toLocaleString("en-PK", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" })} (Pakistan time).</p>}
        {isError && prices.length > 0 && <p role="status" className="mt-3 text-sm text-amber-800">The latest refresh failed. These are previously retrieved rates; verify the effective dates against the latest official notification. <button type="button" onClick={refetch} className="underline">Retry update</button></p>}
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
          Rates are supplied by the existing fuel price feed and include their published effective dates. A retrieved rate is not a guarantee that no newer notification exists. Check the <a href="https://www.ogra.org.pk/notified-petroleum-prices" target="_blank" rel="noopener noreferrer" className="underline decoration-primary-500 underline-offset-2">latest official OGRA notification</a> before relying on a rate.
        </p>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 sm:pb-12 lg:px-8" aria-labelledby="fuel-verification-guides">
        <h2 id="fuel-verification-guides" className="mb-3 text-2xl font-semibold">Fuel price updates and guides</h2>
        <p className="mb-8 text-sm leading-relaxed text-stone-600">The live cards currently show petrol and diesel only. The guides below also discuss HSD, LDO, LPG, CNG and kerosene; separate live rates for those products are not provided on this page. Confirm product grades and local supplier prices before purchasing.</p>
        <GuideCards posts={fuelVerificationPosts} checklistTitle="Fuel price highlights" />
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8" aria-labelledby="fuel-price-faqs">
        <h2 id="fuel-price-faqs" className="mb-6 text-2xl font-semibold">Fuel prices in Pakistan: frequently asked questions</h2>
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">{fuelPriceFaqs.map(item => <details key={item.question} className="border-b border-stone-200 last:border-0"><summary className="cursor-pointer px-5 py-4 font-medium marker:text-primary-500">{item.question}</summary><p className="px-5 pb-5 text-sm leading-relaxed text-stone-600">{item.answer}</p></details>)}</div>
      </section>
    </div>
  );
}
