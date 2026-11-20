import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, CarFront, ChevronRight, Columns2, Plus } from "lucide-react";
import CompareVehiclePicker from "../components/common/CompareVehiclePicker.jsx";
import { Image } from "../components/ui/Image.jsx";
import { trackCompare } from "../components/ads/loadMarketingScripts.js";
import { useCarCategories } from "../hooks/useCarCategories.js";
import { useGetFilteredCarsQuery } from "../redux/services/api.js";
import SEO from "../components/common/SEO.jsx";
import { comparisonArticles } from "../utils/compareEditorial.js";
import CompareEditorial from "../components/common/CompareEditorial.jsx";
import { BuyingRecommendation, RunningCost } from "../components/common/CompareBuyingTools.jsx";
import { useCatalogComparisonQuery, useCatalogVariantsQuery, useCompareExperienceQuery, useCompareOverlayQuery, usePopularCatalogComparisonsQuery, useResolveCatalogListingQuery } from "../redux/services/carCatalogApi.js";
import { hasDifference, isComparableCar, specNumber } from "../utils/carCompare.js";
import { buildCarUrl, buildListingsSearchUrl } from "../utils/urlBuilders.js";
import { formatPrice } from "../utils/formatters.js";
import { CATALOG_LIMIT, CATALOG_STORAGE, catalogGroups, catalogueTitle, catalogResultUrl, parseCatalogSelection, readCatalogSelection, tokenFor, versionLabel, withMake } from "../utils/carCatalog.js";

const container = "mx-auto w-full max-w-6xl min-w-0 px-4 sm:px-6 lg:px-8";
const panel = "min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6";
const button = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:border-primary-500 focus-visible:ring-2 focus-visible:ring-primary-500";
const primary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50";
const formatPkr = (amount) => `PKR ${formatPrice(amount)}`;
const verifiedDate = (value) => value?.slice(0, 10);

function VehicleImage({ entry }) {
  const src = entry.variant?.image || entry.model.image;
  return (
    <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-100">
      {src ? <Image src={src} alt={catalogueTitle(entry)} lazy responsive sizes="(max-width: 640px) 100vw, 33vw" className="h-full w-full object-contain" /> : <CarFront aria-hidden="true" className="h-10 w-10 text-slate-400" />}
    </div>
  );
}

function Price({ entry }) {
  const price = entry.variant?.price;
  if (!price?.amount) return <p className="text-sm text-slate-600">Price information not available.</p>;
  const types = { manufacturer: "Manufacturer reference", ex_factory: "Official ex-factory", dealer: "Dealer reference", sello_new: "Sello new-car price" };
  return (
    <div className="space-y-1">
      <p className="break-words font-bold">{formatPkr(price.amount)}{price.upperAmount && price.upperAmount !== price.amount ? ` – ${formatPkr(price.upperAmount)}` : ""}</p>
      <p className="text-xs text-slate-600">{types[price.type]}{entry.variant.year ? ` · ${entry.variant.year}` : ""}</p>
      {price.effectiveDate ? <p className="text-xs text-slate-600">Effective {verifiedDate(price.effectiveDate)}</p> : price.verifiedAt && <p className="text-xs text-slate-600">Price verified {verifiedDate(price.verifiedAt)}</p>}
    </div>
  );
}

function ResultVersion({ entry, selectedTokens, onChange }) {
  const versions = useCatalogVariantsQuery({ modelId: entry.model._id, year: entry.year });
  const options = versions.currentData || [];
  const selected = entry.variant?._id || "";
  const modelToken = tokenFor({ model: entry.model, year: entry.year || entry.variant?.year });
  if (versions.isError && !selected) return <button type="button" onClick={versions.refetch} className={button}>Retry versions</button>;
  if (!selected && !options.length) {
    return <p className="text-sm text-slate-600">{versions.isFetching ? "Loading versions…" : versions.isError ? "Version data unavailable" : "No published versions"}</p>;
  }
  const groups = new Map();
  for (const option of options) {
    const group = option.generation || (option.year ? String(option.year) : "Other versions");
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(option);
  }
  return (
    <div>
      <select aria-label={`Version for ${catalogueTitle(entry)}`} className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm font-normal focus-visible:ring-2 focus-visible:ring-primary-500" value={selected} onChange={(event) => onChange(event.target.value ? `v-${event.target.value}` : modelToken)}>
        <option value="" disabled={Boolean(selected) && selectedTokens.includes(modelToken)}>Model only</option>
        {selected && !options.some((option) => option._id === selected) && <option value={selected}>{versionLabel(entry.variant)}</option>}
        {Array.from(groups, ([group, entries]) => <optgroup key={group} label={group}>
          {entries.map((option) => <option key={option._id} value={option._id} disabled={option._id !== selected && selectedTokens.includes(`v-${option._id}`)}>{option.generation && option.year ? `${option.name} · ${option.year}` : option.name}</option>)}
        </optgroup>)}
      </select>
    </div>
  );
}

function MarketplacePreview({ entry, onSelect, selectedId }) {
  const { make, model } = entry;
  const filters = { make: make.name, model: model.name, vehicleType: "Car" };
  const { currentData, isFetching, isError, refetch } = useGetFilteredCarsQuery({ ...filters, page: 1, limit: 12 });
  const normalized = (value) => String(value ?? "").trim().toLowerCase();
  const listings = (currentData?.cars || []).filter((car) => isComparableCar(car) &&
    normalized(car.make) === normalized(make.name) && normalized(car.model) === normalized(model.name));
  const listing = listings.find((car) => car._id === selectedId) || listings[0];
  const price = listing && specNumber(listing.price, "", 1);
  return (
    <div className="grid gap-2">
      <h3 className="font-semibold">{make.name} {model.name}</h3>
      {listings.length > 0 && <label className="grid gap-1 text-sm">Listing to compare
        <select className="min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2" aria-label={`Choose a ${make.name} ${model.name} listing`}
          value={selectedId || ""} onChange={(event) => onSelect(event.target.value)}>
          <option value="">Choose a listing</option>
          {listings.map((car) => <option key={car._id} value={car._id}>{[car.year, car.variant || car.title, car.city, specNumber(car.price, "", 1) && formatPkr(specNumber(car.price, "", 1))].filter(Boolean).join(" · ") || "View listing"}</option>)}
        </select>
      </label>}
      {listing ? (
        <Link to={buildCarUrl(listing)} className="flex min-w-0 items-center gap-3 rounded-lg bg-slate-50 p-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500">
          {listing.images?.[0] && <Image src={listing.images[0]} alt="" lazy className="h-14 w-20 shrink-0 rounded-md object-cover" />}
          <span className="grid min-w-0 gap-0.5 text-sm">
            <span className="break-words">{[listing.year, listing.variant, listing.city].filter(Boolean).join(" · ") || "View example listing"}</span>
            <span className="font-semibold">{price != null ? `${formatPkr(price)} asking price` : "View asking price on listing"}</span>
          </span>
          <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0" />
        </Link>
      ) : isFetching ? <p role="status" className="text-sm text-slate-600">Checking listings…</p>
        : isError ? <button type="button" className="justify-self-start text-sm underline" onClick={refetch}>Retry loading listings</button>
          : <p className="text-sm text-slate-600">No matching public listings found.</p>}
      <Link className="justify-self-start text-sm font-semibold underline underline-offset-2" to={buildListingsSearchUrl(filters)} onClick={() => trackCompare("car_compare_view_listing", { catalogue_id: entry.token })}>
        Browse {make.name} {model.name} listings
      </Link>
    </div>
  );
}

function MarketplaceListings({ vehicles }) {
  const [choices, setChoices] = useState({});
  const ids = [...new Set(vehicles.map((entry) => choices[entry.token]).filter(Boolean))];
  return <section className={panel} aria-label="Relevant Sello marketplace listings">
    <h2 className="text-xl font-bold">Compare cars for sale</h2>
    <p className="my-3 text-sm text-slate-600">Choose a seller’s listing for each car to compare asking prices, mileage and equipment.</p>
    <div className={vehicles.length === 3 ? "grid gap-4 md:grid-cols-3" : "grid gap-4 sm:grid-cols-2"}>
      {vehicles.map((entry) => <MarketplacePreview key={entry.token} entry={entry} selectedId={choices[entry.token]} onSelect={(id) => setChoices((previous) => ({ ...previous, [entry.token]: id }))} />)}
    </div>
    {ids.length >= 2 && <Link to={"/compare/listings?" + new URLSearchParams({ ids: ids.join(",") })} className={primary + " mt-4"}>Compare {ids.length} listings <ArrowRight size={16} aria-hidden="true" /></Link>}
  </section>;
}

function ResultOverview({ entries, tokens, onVersionChange }) {
  const imagesAvailable = entries.some((entry) => entry.variant?.image || entry.model?.image);
  const hasVersion = entries.some((entry) => entry.variant);
  const rows = [
    ["Version", (entry, index) => <ResultVersion entry={entry} selectedTokens={tokens} onChange={(token) => onVersionChange(index, token)} />],
    ["New-car reference price", (entry) => <Price entry={entry} />],
    ["Used market estimate", ({ variant }) => {
      const { usedMinPkr, usedMaxPkr } = variant?.specifications || {};
      return usedMinPkr > 0 && usedMaxPkr >= usedMinPkr ? <p className="text-sm">{formatPkr(usedMinPkr)} – {formatPkr(usedMaxPkr)} <span className="block text-xs text-slate-600">Estimated range</span></p> : <p className="text-sm text-slate-600">Not available</p>;
    }],
  ];
  const label = "sticky left-0 z-10 w-24 break-words border-r border-slate-200 bg-slate-50 p-2 text-left text-xs font-semibold text-slate-700 sm:w-32 sm:p-4 sm:text-sm";
  return (
    <div role="region" aria-label="Side-by-side vehicle overview" tabIndex={0} className="overflow-x-auto overscroll-x-contain rounded-xl border border-slate-200 focus-visible:ring-2 focus-visible:ring-primary-500">
      <table className="w-full table-fixed text-left" style={{ minWidth: 96 + entries.length * 176 }}>
        <caption className="sr-only">Vehicle versions, reference prices, and marketplace listings</caption>
        <thead><tr>
          <th scope="col" className={label}>Vehicle</th>
          {entries.map((entry) => <th key={entry.token} scope="col" className="break-words border-l border-slate-100 p-3 align-bottom sm:p-4">
            {entry.unavailable ? "Unavailable vehicle" : <>
              {imagesAvailable && <VehicleImage entry={entry} />}
              <span className={imagesAvailable ? "mt-3 block" : "block"}>{entry.year || entry.variant?.year} {entry.make.name} {entry.model.name}</span>
            </>}
          </th>)}
        </tr></thead>
        <tbody>{(hasVersion ? rows : rows.slice(0, 1)).map(([name, render]) => <tr key={name} className="border-t border-slate-200">
          <th scope="row" className={label}>{name}</th>
          {entries.map((entry, index) => <td key={entry.token} className="border-l border-slate-100 p-3 align-top sm:p-4">
            {entry.unavailable ? (name === "Version" ? <p className="text-sm">Unavailable. Use Change cars to replace it.</p> : "—") : render(entry, index)}
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function SelectionEditor({ entries = [], results = false }) {
  const navigate = useNavigate();
  const vehicleCategories = useCarCategories("Car");
  const [storageError, setStorageError] = useState(false);
  const [editing, setEditing] = useState(null);
  const nextId = useRef(Math.max(2, entries.length));
  const [slots, setSlots] = useState(() => Array.from({ length: Math.max(2, entries.length) }, (_, id) => ({
    id,
    selection: entries[id] && !entries[id].unavailable ? entries[id] : withMake(null),
  })));
  const tokens = slots.map((slot) => tokenFor(slot.selection)).filter(Boolean);
  const valid = parseCatalogSelection(tokens.join(","));
  const duplicate = tokens.length !== new Set(tokens).size;
  const incomplete = slots.some(({ selection }) => selection.make && !selection.model);
  const canClear = slots.some(({ selection }) => selection.make) || slots.length > 2 || results;

  const save = (tokens) => {
    try {
      if (tokens.length) window.localStorage.setItem(CATALOG_STORAGE, tokens.join(","));
      else window.localStorage.removeItem(CATALOG_STORAGE);
      return true;
    } catch {
      setStorageError(true);
      return false;
    }
  };

  return (
    <>
    <form className={panel} onSubmit={(event) => {
      event.preventDefault();
      if (!valid || incomplete) return;
      const persisted = save(valid);
      trackCompare(results ? "car_compare_change_variant" : "car_compare_submit", { selection_count: valid.length });
      navigate(catalogResultUrl(valid, slots.filter(({ selection }) => tokenFor(selection)).map(({ selection }) => selection)), { state: { storageError: !persisted } });
    }}>
      <h2 className="text-xl font-bold">{results ? "Change your comparison" : "Choose your cars"}</h2>
      <p className="mt-1 text-sm text-slate-600">Choose a make, model and year for each car.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map(({ id, selection }, index) => (
          <fieldset key={id} aria-label={`Car ${index + 1}`} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div aria-hidden="true" className="mb-3 flex items-center gap-2 font-bold">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-100 text-slate-800"><CarFront size={19} /></span>
              Car {index + 1}
            </div>
            <button type="button" aria-haspopup="dialog" aria-label={`Select car ${index + 1}`} className={`${button} w-full justify-between text-left`} onClick={() => setEditing(id)}>
              <span className="break-words">{selection.model ? catalogueTitle(selection) : "Select make and model"}</span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0" />
            </button>
            {selection.model && !selection.year && !selection.variant && <p className="mt-2 text-xs text-slate-600">Model only · No version selected</p>}
            {(slots.length > 2 || selection.make) && <button type="button" className="mt-3 min-h-9 text-sm font-semibold text-slate-700 underline" onClick={() => {
              setSlots((previous) => previous.length > 2 ? previous.filter((slot) => slot.id !== id) : previous.map((slot) => slot.id === id ? { id, selection: withMake(null) } : slot));
              trackCompare("car_compare_remove_vehicle", { catalogue_id: tokenFor(selection) || undefined });
            }}>{slots.length > 2 ? "Remove car" : "Clear car"}</button>}
          </fieldset>
        ))}
        {slots.length < CATALOG_LIMIT && <button type="button" className="bg-white flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-4 text-sm font-semibold text-slate-800 hover:border-primary-500 hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500 sm:col-span-2 lg:col-span-1" onClick={() => {
          const id = nextId.current++;
          setSlots((previous) => previous.length < CATALOG_LIMIT ? [...previous, { id, selection: withMake(null) }] : previous);
          setEditing(id);
          trackCompare("car_compare_add_vehicle", { selection_count: slots.length + 1 });
        }}><Plus aria-hidden="true" className="h-5 w-5 text-primary-500" /> Add Another Car</button>}
      </div>
      {duplicate && <p role="alert" className="mt-3 text-sm text-red-700">Choose distinct models or different versions of the same model.</p>}
      {storageError && <p role="status" className="mt-3 text-sm text-slate-700">Browser storage is unavailable. Keep your comparison with a share link.</p>}
      <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
        <button type="submit" className={`${primary} min-h-11 sm:px-6`} disabled={!valid || incomplete}>{results ? "Update comparison" : "Compare Cars"} <ArrowRight aria-hidden="true" size={16} /></button>
        {canClear && <button type="button" className={button + " text-slate-950"} onClick={() => {
          save([]);
          if (results) navigate("/cars/compare");
          else setSlots([{ id: 0, selection: withMake(null) }, { id: 1, selection: withMake(null) }]);
        }}>Clear All</button>}
        <p aria-live="polite" className="text-sm text-slate-600 sm:ml-auto">{tokens.length < 2 ? "Select at least two cars to compare." : `${tokens.length} cars selected`}</p>
      </div>
    </form>
    {editing !== null && <CompareVehiclePicker
      vehicleCategories={vehicleCategories}
      value={slots.find((slot) => slot.id === editing).selection}
      onClose={() => setEditing(null)}
      onSave={(selection) => {
        setSlots((previous) => previous.map((slot) => slot.id === editing ? { ...slot, selection } : slot));
        trackCompare("car_compare_select_vehicle", { catalogue_id: tokenFor(selection) });
        setEditing(null);
      }}
    />}
    </>
  );
}

function CuratedComparisons() {
  const query = usePopularCatalogComparisonsQuery();
  if (query.data?.length === 0) return null;
  return (
    <section className={panel} aria-labelledby="hot-car-comparisons">
      <h2 id="hot-car-comparisons" className="text-xl font-bold">Hot Car Comparisons</h2>
      {query.isFetching && <p role="status" className="mt-4 text-sm">Loading comparisons…</p>}
      {query.isError && <button type="button" className={`${button} mt-4`} onClick={query.refetch}>Retry curated comparisons</button>}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {(query.data || []).map(({ name, vehicles }) => (
          <article key={name} className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-bold">{name}</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {vehicles.map((entry) => (
                <div key={entry.token} className="min-w-0">
                  <VehicleImage entry={entry} />
                  <p className="my-2 text-sm font-semibold">{catalogueTitle(entry)}</p>
                  <Price entry={entry} />
                </div>
              ))}
            </div>
            <Link className={`${primary} mt-3`} to={catalogResultUrl(vehicles.map((entry) => entry.token), vehicles)}>Compare Now</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparisonTable({ vehicles }) {
  const [differences, setDifferences] = useState(false);
  const groups = useMemo(() => catalogGroups(vehicles).map(([name, rows]) => [
    name,
    rows.map(([label, values, key]) => {
      const normalized = values.map((value) => {
        if (typeof value !== "string") return value;
        return specNumber(value) ?? value.trim().replace(/\s+/g, " ");
      });
      return { label, values, key, different: hasDifference(normalized) };
    }).filter((row) => !differences || row.different),
  ]).filter(([, rows]) => rows.length), [vehicles, differences]);

  return (
    <section className={panel} aria-labelledby="catalogue-specifications">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 id="catalogue-specifications" className="text-xl font-bold">Specifications and features</h2>
        <label className="flex min-h-10 items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="h-5 w-5 accent-primary-500" checked={differences} onChange={(event) => {
            setDifferences(event.target.checked);
            trackCompare("car_compare_show_differences", { enabled: event.target.checked });
          }} /> Show Only Differences
        </label>
      </div>
      {!groups.length && <p className="text-sm text-slate-600">{differences ? "No differences among the reported values." : "Select published versions to see available specifications and features."}</p>}
      {groups.map(([name, rows]) => (
        <details key={name} open className="mb-3 rounded-lg border border-slate-200">
          <summary className="cursor-pointer bg-slate-50 px-4 py-3 font-semibold">{name}</summary>
          <div role="region" aria-label={name+" comparison"} tabIndex={0} className="overflow-x-auto focus-visible:ring-2 focus-visible:ring-primary-500">
            <table className="w-full table-fixed text-left text-sm" style={{ minWidth: 132 + 160 * vehicles.length }}>
              <caption className="sr-only">{name} comparison</caption>
              <thead><tr className="bg-slate-100">
                <th scope="col" className="sticky left-0 w-32 bg-slate-100 p-3">Specification</th>
                {vehicles.map((entry) => <th key={entry.token} scope="col" className="break-words p-3">{catalogueTitle(entry)}</th>)}
              </tr></thead>
              <tbody>{rows.map((row) => (
                <tr key={row.label} className={row.different ? "bg-primary-50" : "bg-white"}>
                  <th scope="row" className={`sticky left-0 border-t border-slate-200 p-3 ${row.different ? "bg-primary-50" : "bg-white"}`}>
                    {row.label}{row.different && <span className="block text-xs font-medium text-slate-800">Differs</span>}
                  </th>
                  {row.values.map((value, index) => <td key={vehicles[index].token} className="break-words border-t border-slate-200 p-3">
                    {value == null || value === "" ? "Not Available" : value}
                    {vehicles[index].pending?.includes(row.key) && <span className="block text-xs text-amber-900">AI · Pending review</span>}
                  </td>)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </details>
      ))}
    </section>
  );
}

export default function CarModelCompare({ results = false }) {
  const navigate = useNavigate();
  const editor = useRef(null);
  const { search, state } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const tokens = useMemo(() => params.getAll("vehicles").length === 1 ? parseCatalogSelection(params.get("vehicles")) : null, [params]);
  const experience = useCompareExperienceQuery();
  const variantSelection = results && tokens?.some((token) => token.startsWith("v-"));
  const overlay = useCompareOverlayQuery({ vehicles: tokens?.join(",") }, { skip: !variantSelection });
  const research = useCompareOverlayQuery({ vehicles: tokens?.join(","), research: true }, { skip: !variantSelection || !experience.data?.research || !overlay.currentData });
  const [saved] = useState(() => {
    if (results || typeof window === "undefined") return [];
    try { return readCatalogSelection(window.localStorage); } catch { return []; }
  });
  const fromListing = !results && params.has("make") && params.has("model");
  const selection = useCatalogComparisonQuery(results ? tokens?.join(",") : saved.join(","), {
    skip: results ? !tokens : !saved.length,
    refetchOnMountOrArgChange: true,
  });
  const resolve = useResolveCatalogListingQuery({
    make: params.get("make"), model: params.get("model"), variant: params.get("variant"), year: params.get("year"),
  }, { skip: !fromListing });
  const enrich = (entry, includePending) => {
    if (!entry.variant) return entry;
    const data = overlay.currentData?.[entry.token];
    const approved = Object.entries(data?.approved || {});
    const pending = includePending ? Object.fromEntries(Object.entries(research.currentData?.[entry.token]?.pending || {}).filter(([key]) =>
      data?.approved?.[key] == null && entry.variant.specifications?.[key] == null)) : {};
    const feature = (value) => ["standard", "optional", "unavailable", "notApplicable"].includes(value);
    return { ...entry, pending: Object.keys(pending), variant: {
      ...entry.variant,
      specifications: { ...entry.variant.specifications, ...Object.fromEntries(approved.filter(([, value]) => !feature(value))), ...pending },
      features: { ...entry.variant.features, ...Object.fromEntries(approved.filter(([, value]) => feature(value))) },
    } };
  };
  const resultEntries = (selection.currentData || []).map((entry) => enrich(entry, false));
  const vehicles = resultEntries.filter((entry) => !entry.unavailable);
  const preselected = fromListing ? resolve.data : null;
  const alreadySelected = preselected && vehicles.some((entry) => tokenFor(entry) === tokenFor(preselected));
  const full = preselected && !alreadySelected && vehicles.length >= CATALOG_LIMIT;
  const editorEntries = preselected && !alreadySelected && !full ? [...vehicles, preselected] : vehicles;
  const loadingEditor = selection.isLoading || (fromListing && resolve.isLoading);
  const [shareState, setShareState] = useState("");
  const [manualLink, setManualLink] = useState("");
  const tracked = useRef(null);

  useEffect(() => {
    trackCompare("car_compare_page_view", { page: results ? "results" : "builder" });
  }, [results]);
  useEffect(() => {
    if (results && selection.currentData && tracked.current !== tokens.join(",")) {
      tracked.current = tokens.join(",");
      trackCompare("car_compare_view", { selection_count: selection.currentData.length });
      try { window.localStorage.setItem(CATALOG_STORAGE, tokens.join(",")); } catch { /* URL keeps the selection */ }
    }
  }, [results, selection.currentData, tokens]);

  const copy = async () => {
    const link = new URL(catalogResultUrl(tokens, vehicles), window.location.origin).href;
    try {
      await navigator.clipboard.writeText(link);
      setManualLink("");
      setShareState("Comparison link copied.");
      trackCompare("car_compare_share", { selection_count: tokens.length });
    } catch {
      setManualLink(link);
      setShareState("Copy the link from the field below.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {!results && <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org", "@type": "WebPage", name: "Compare Cars in Pakistan",
        url: "https://sello.pk/cars/compare", inLanguage: "en-PK",
      })}</script>}
      {results && vehicles.length >= 2 && <SEO title={`${vehicles.map(catalogueTitle).join(" vs. ")} | Sello.pk`} description={`Compare ${vehicles.map(catalogueTitle).join(", ")} on Sello.pk, including available prices, specifications and running costs.`} canonical="https://sello.pk/cars/compare" robots="noindex, follow" />}
      <header className="border-b border-slate-200 bg-white">
        <div className={`${container} py-5 sm:py-7`}>
          <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-2 text-xs text-slate-600">
            <Link to="/" className="hover:underline">Home</Link><ChevronRight aria-hidden="true" size={13} />
            {results ? <><Link to="/cars/compare" className="hover:underline">Car Compare</Link><ChevronRight aria-hidden="true" size={13} /><span aria-current="page">Results</span></> : <span aria-current="page">Car Compare</span>}
          </nav>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{results ? (vehicles.length >= 2 ? vehicles.map(catalogueTitle).join(" vs. ") : "Car Comparison Results") : "Compare Cars in Pakistan"}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">Compare models side by side to see prices, specifications, and features.</p>
        </div>
      </header>
      <div className={`${container} grid gap-5 py-5 sm:py-7`}>
        {results && !tokens && <div role="alert" className={panel}>This comparison link is invalid. <Link className="font-semibold underline" to="/cars/compare">Choose cars again</Link></div>}
        {state?.storageError && <p role="status" className="text-sm">Browser storage is unavailable. This URL keeps your selection.</p>}
        {(selection.isError || resolve.isError) && <div role="alert" className={panel}>Catalogue data could not be loaded. <button type="button" className={button} onClick={resolve.isError ? resolve.refetch : selection.refetch}>Try again</button></div>}
        {loadingEditor && <p role="status" className={panel}>Loading catalogue selections…</p>}
        {fromListing && resolve.isSuccess && !resolve.data && <p className={panel}>This listing could not be mapped to a catalogue model. Select a make and model below.</p>}
        {full && <p className={panel}>Your saved comparison already has three cars. Clear a slot to select {catalogueTitle(preselected)}.</p>}
        {preselected && !full && !preselected.variant && <p className={panel}>The matching model is selected. Choose a version if its exact catalogue record is available.</p>}
        {results && selection.currentData && (
          <>
            {vehicles.length >= 2 && experience.data?.summary && <BuyingRecommendation key={tokens.join(",")} vehicles={vehicles.map((entry) => entry.token)} />}
            <section className={panel} aria-labelledby="catalogue-prices">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 id="catalogue-prices" className="text-xl font-bold">Vehicles and prices</h2>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={button} onClick={() => {
                    const section = editor.current;
                    if (!section) return;
                    section.open = true;
                    section.scrollIntoView({ block: "start" });
                    section.querySelector("summary")?.focus({ preventScroll: true });
                  }}>Change cars</button>
                  <button type="button" className={button} onClick={copy}>Copy Comparison Link</button>
                </div>
              </div>
              {shareState && <p role="status" className="mb-3 text-sm">{shareState}</p>}
              {manualLink && <input aria-label="Comparison link" readOnly value={manualLink} onFocus={(event) => event.target.select()} className="mb-3 w-full rounded border border-slate-300 p-2 text-sm" />}
              {vehicles.some((entry) => !entry.variant) && (
                <p className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">You selected {vehicles.filter((entry) => !entry.variant).map(catalogueTitle).join(" and ")}. Exact specifications depend on the trim. To compare individual cars and their asking prices, choose seller listings below.</p>
              )}
              <p className="mb-2 text-xs text-slate-600 sm:hidden">Swipe the table to see all cars.</p>
              <ResultOverview entries={resultEntries} tokens={tokens} onVersionChange={(index, token) => {
                const next = parseCatalogSelection(tokens.map((value, position) => position === index ? token : value).join(","));
                if (!next) return;
                setShareState("");
                setManualLink("");
                trackCompare("car_compare_change_variant", { catalogue_id: token });
                navigate(catalogResultUrl(next, vehicles));
              }} />
            </section>
            {research.isFetching && <p role="status" className="text-sm text-slate-600">Checking missing specifications. Your comparison is ready below.</p>}
            {vehicles.length >= 2 && <>
              {vehicles.some((entry) => entry.variant) && <ComparisonTable vehicles={vehicles.map((entry) => enrich(entry, true))} />}
              {vehicles.some((entry) => entry.variant) && <RunningCost vehicles={vehicles} />}
              <MarketplaceListings key={tokens.join(",")} vehicles={vehicles} />
            </>}
          </>
        )}
        {!loadingEditor && !results && <SelectionEditor entries={editorEntries} />}
        {!loadingEditor && results && selection.currentData && (
          <details key={tokens.join(",")} ref={editor} className="min-w-0 scroll-mt-32 rounded-2xl border border-slate-200 bg-white">
            <summary className="cursor-pointer px-4 py-3 font-semibold focus-visible:ring-2 focus-visible:ring-primary-500">Edit compared cars</summary>
            <SelectionEditor entries={selection.currentData} results />
          </details>
        )}
        {!results && <>
          <CuratedComparisons />
          <section className={`${panel} flex flex-wrap items-center gap-3`}>
            <Columns2 aria-hidden="true" className="h-5 w-5 text-primary-500" />
            <div className="min-w-0 grow">
              <h2 className="font-bold">Shopping for specific cars?</h2>
              <p className="text-sm text-slate-600">Compare asking prices and mileage from individual Sello listings.</p>
            </div>
            <Link to="/compare/listings" className={button}>Compare listings <ArrowRight aria-hidden="true" size={16} /></Link>
          </section>
        </>}
        <CompareEditorial articles={experience.data?.articles?.length === 4 ? experience.data.articles : comparisonArticles} />
      </div>
    </div>
  );
}
