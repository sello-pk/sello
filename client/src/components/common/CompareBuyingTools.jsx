import { useState } from "react";
import { useGetFuelPricesQuery } from "../../redux/services/api";
import { useCompareRecommendationMutation } from "../../redux/services/carCatalogApi.js";
import { catalogueTitle } from "../../utils/carCatalog.js";
import { runningCost } from "../../utils/compareRunningCost.js";
import { formatPrice } from "../../utils/formatters";

const shell = "grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6";
const control = "min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm focus-visible:ring-2 focus-visible:ring-primary-500";
const pkr = (value) => `PKR ${formatPrice(Math.round(value))}`;

export function RunningCost({ vehicles }) {
  const fuel = useGetFuelPricesQuery();
  const current = fuel.data?.prices?.find((item) => item.slug === "petrol");
  const [distance, setDistance] = useState("1000");
  const [petrol, setPetrol] = useState(null);
  const [electricity, setElectricity] = useState("");
  const [average, setAverage] = useState("combinedKmPerL");
  const petrolPrice = petrol ?? current?.price_pkr ?? "";
  return <section className={shell} aria-labelledby="compare-running-cost">
    <h2 id="compare-running-cost" className="text-xl font-bold">Fuel and electricity running cost</h2>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["Monthly distance (km)", distance, setDistance],
        ["Petrol price (PKR/L)", petrolPrice, setPetrol],
        ["Electricity tariff (PKR/kWh)", electricity, setElectricity],
      ].map(([label, value, update]) => <label className="grid gap-1 text-sm font-semibold" key={label}>{label}
        <input className={control} type="number" inputMode="decimal" min="0" max="1000000" step="any" value={value} onChange={(event) => update(event.target.value)} />
      </label>)}
      <label className="grid gap-1 text-sm font-semibold">Fuel average
        <select className={control} value={average} onChange={(event) => setAverage(event.target.value)}>
          <option value="combinedKmPerL">Combined</option><option value="cityKmPerL">City</option><option value="highwayKmPerL">Highway</option>
        </select>
      </label>
    </div>
    <p className="text-xs text-slate-600">{petrol === null && current?.effective_date ? `Petrol price effective ${current.effective_date}. ` : ""}Estimates cover petrol or electricity only and use approved efficiency figures.</p>
    <div className="grid gap-3 sm:grid-cols-3">
      {vehicles.map((entry) => {
        const specs = entry.variant?.specifications || {};
        const cost = runningCost({ distance, petrol: petrolPrice, electricity, fuelAverage: specs[average], energyUse: specs.consumptionKwhPer100Km, fuelType: specs.fuelType });
        return <div key={entry.token} className="min-w-0 rounded-lg bg-slate-50 p-3">
          <h3 className="text-sm font-semibold">{catalogueTitle(entry)}</h3>
          <p className="mt-1 text-sm">{cost ? `${pkr(cost.monthly)} monthly · ${pkr(cost.annual)} annually` : "Not available with the selected inputs"}</p>
        </div>;
      })}
    </div>
  </section>;
}

export function BuyingRecommendation({ vehicles }) {
  const [priority, setPriority] = useState("general");
  const [requested, setRequested] = useState(false);
  const [getRecommendation, result] = useCompareRecommendationMutation();
  return <section className={shell} aria-labelledby="compare-recommendation">
    <h2 id="compare-recommendation" className="text-xl font-bold">Sello AI buying recommendation</h2>
    <div className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-sm font-semibold">Buying priority (optional)
        <select className={control} value={priority} onChange={(event) => { setPriority(event.target.value); setRequested(false); }}>
          {Object.entries({ general: "General", fuel: "Fuel saving", maintenance: "Low maintenance", resale: "Resale value", comfort: "Comfort", performance: "Performance", family: "Family use" }).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <button type="button" className="min-h-10 rounded-lg bg-primary-500 px-4 text-sm font-bold disabled:opacity-50" disabled={result.isLoading} onClick={() => {
        setRequested(true);
        getRecommendation({ vehicles: vehicles.join(","), priority });
      }}>{result.isLoading ? "Generating…" : "Get recommendation"}</button>
    </div>
    {requested && !result.isLoading && <div aria-live="polite">
      {result.isError ? <p>Recommendation temporarily unavailable.</p> : result.data?.length ? <ul className="list-disc space-y-1 pl-5">
        {result.data.map((fact) => <li key={fact.unit}>{fact.vehicle} has the {fact.comparison.toLowerCase()} comparable figure ({formatPrice(fact.value)} {fact.unit}). {fact.reason}</li>)}
      </ul> : <p>There is not enough comparable approved data to make a recommendation.</p>}
      <p className="mt-2 text-xs text-slate-600">The recommendation considers approved metrics available for every selected car.</p>
    </div>}
  </section>;
}
