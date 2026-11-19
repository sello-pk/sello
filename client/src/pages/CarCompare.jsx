import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowUpRight, CarFront, Columns2, Copy, Plus, Trash2 } from "lucide-react";
import { Image } from "../components/ui/Image.jsx";
import { trackCompare } from "../components/ads/loadMarketingScripts.js";
import { useGetCarComparisonQuery } from "../redux/services/api.js";
import { setComparisonCars, setComparisonReplacement } from "../redux/carCompareSlice.js";
import { buildCarUrl } from "../utils/urlBuilders.js";
import { formatPrice } from "../utils/formatters.js";
import {
  comparisonGroups, COMPARE_LIMIT_MESSAGE, getHighlights,
  hasDifference, MAX_COMPARE_CARS, parseCompareSearch, specNumber,
} from "../utils/carCompare.js";

const action = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold hover:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50";
const primary = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";
const carName = (car) => [car.make, car.model].filter(Boolean).join(" ") || car.title || "Car listing";
const shownNumber = (value, unit, before = false, minimum = 0) => {
  const number = specNumber(value, before ? "" : unit, minimum);
  return number === null ? "Not provided" : before ? `${unit} ${formatPrice(number)}` : `${formatPrice(number)} ${unit}`;
};

export default function CarCompare() {
  const { search } = useLocation();
  const [, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const stored = useSelector((state) => state.carCompare);
  const incoming = useMemo(() => parseCompareSearch(search), [search]);
  const ids = incoming && !incoming.error ? incoming.ids : stored.ids;
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const [manualLink, setManualLink] = useState("");
  const trackedView = useRef(false);

  useEffect(() => {
    if (incoming && !incoming.error) dispatch(setComparisonCars(incoming.ids));
  }, [dispatch, incoming]);

  useEffect(() => {
    if (!incoming && stored.ids.length) setSearchParams({ ids: stored.ids.join(",") }, { replace: true });
  }, [incoming, setSearchParams, stored.ids]);

  const { currentData, isError, isFetching, refetch } = useGetCarComparisonQuery(ids, {
    skip: !ids.length || !incoming,
    refetchOnMountOrArgChange: true,
  });
  const cars = useMemo(() => (currentData || []).flatMap((entry) => entry.status === "found" ? [entry.car] : []), [currentData]);
  const entries = useMemo(() => new Map((currentData || []).map((entry) => [entry.id, entry])), [currentData]);
  const highlights = useMemo(() => getHighlights(cars), [cars]);
  const groups = useMemo(() => comparisonGroups.map(([label, rows]) => [
    label,
    rows.map(([name, read, format = String]) => {
      const values = cars.map(read);
      return { name, values, format, different: hasDifference(values) };
    }).filter((row) => (label === "Basic information" || row.values.some((value) => value !== null)) && (!differencesOnly || row.different)),
  ]).filter(([, rows]) => rows.length), [cars, differencesOnly]);

  useEffect(() => {
    if (currentData && !trackedView.current) {
      trackedView.current = true;
      trackCompare("compare_view", { selection_count: currentData.length });
    }
  }, [currentData]);

  const writeSelection = (next) => {
    dispatch(setComparisonCars(next));
    setSearchParams({ ids: next.join(",") });
  };
  const remove = (id) => {
    const next = ids.filter((value) => value !== id);
    writeSelection(next);
    trackCompare("compare_remove", { listing_id: id, source: "compare", selection_count: next.length });
  };
  const copy = async () => {
    const link = new URL("/compare/listings", window.location.origin);
    link.searchParams.set("ids", ids.join(","));
    try {
      await navigator.clipboard.writeText(link.href);
      setManualLink("");
      setShareNotice("Comparison link copied.");
      trackCompare("compare_share", { selection_count: ids.length, source: "copy_link" });
    } catch {
      setManualLink(link.href);
      setShareNotice("Copy the comparison link from the field below.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-[#0A1025] text-white">
        <div className="mx-auto max-w-8xl px-3 py-9 sm:px-4 sm:py-12 md:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Compare Car Listings</h1>
          <p className="mt-3 text-slate-300">Compare asking prices, mileage, and details from individual listings.</p>
          <Link to="/compare" className="mt-4 inline-block text-sm font-semibold text-primary-300 underline underline-offset-4">Compare car models</Link>
        </div>
      </header>

      <div className="mx-auto grid min-w-0 max-w-8xl gap-6 px-3 py-8 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p aria-live="polite" className="text-sm font-semibold">{ids.length} of 4 cars selected</p>
          <div className="flex flex-wrap gap-2">
            {ids.length > 0 && ids.length < MAX_COMPARE_CARS && (
              <Link to="/listings" className={primary}><Plus aria-hidden="true" className="h-4 w-4" /> Add Another Car</Link>
            )}
            {ids.length > 0 && (
              <>
                <button type="button" className={action} onClick={copy}><Copy className="h-4 w-4" aria-hidden="true" /> Copy Comparison Link</button>
                <button type="button" className={action} onClick={() => {
                  writeSelection([]);
                  trackCompare("compare_clear", { selection_count: 0, source: "compare" });
                }}><Trash2 className="h-4 w-4" aria-hidden="true" /> Clear All</button>
              </>
            )}
          </div>
        </div>
        {ids.length === MAX_COMPARE_CARS && <p className="text-sm text-slate-600">{COMPARE_LIMIT_MESSAGE}</p>}
        {incoming?.error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">This comparison link is invalid. Your saved selections are shown below.</p>}
        {stored.storageUnavailable && <p role="status" className="text-sm text-slate-700">Browser storage is unavailable. Copy the comparison link to keep your selection.</p>}
        {shareNotice && <p role="status" className="text-sm text-slate-700">{shareNotice}</p>}
        {manualLink && <input aria-label="Comparison link" readOnly value={manualLink} onFocus={(event) => event.target.select()} className="w-full min-w-0 rounded-lg border border-slate-300 p-3 text-sm" />}

        {!ids.length ? (
          <section className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <Columns2 aria-hidden="true" className="mx-auto mb-4 h-9 w-9 text-primary-500" />
            <h2 className="text-2xl font-bold">Compare Cars</h2>
            <p className="mx-auto mt-2 max-w-xl text-slate-600">Select two or more cars to compare prices, specifications, features, and details side by side.</p>
            <Link to="/listings" className={`${primary} mt-5`}>Explore Cars <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
          </section>
        ) : (
          <>
            {isError && (
              <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-900">
                The selected cars could not be loaded.
                <button type="button" className={action} onClick={refetch}>Try again</button>
              </div>
            )}
            {isFetching && <p role="status" className="text-sm text-slate-600">Loading current listing details…</p>}
            <section aria-label="Selected cars" className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {ids.map((id, index) => {
                const entry = entries.get(id);
                const car = entry?.car;
                const title = car ? carName(car) : `Selection ${index + 1}`;
                const path = car && buildCarUrl(car);
                return (
                  <article key={id} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {car && <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                      {car.images?.[0] ? (
                        <Image src={car.images[0]} alt={title} lazy responsive sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
                          <CarFront aria-hidden="true" className="h-5 w-5" /> No image available
                        </div>
                      )}
                    </div>}
                    <div className="flex flex-1 flex-col gap-2 p-4">
                      <h2 className="break-words font-bold">{title}</h2>
                      {car ? (
                        <>
                          <p className="break-words text-sm text-slate-600">{[specNumber(car.year, "", 1), car.variant && !/^n\/?a$/i.test(car.variant) ? car.variant : null].filter(Boolean).join(" · ") || "Year and variant not provided"}</p>
                          <p className="font-bold text-slate-800">{shownNumber(car.price, "PKR", true, 1)}</p>
                          <p className="break-words text-sm text-slate-600">{[shownNumber(car.mileage, "km"), car.condition, car.city || car.location].filter(Boolean).join(" · ")}</p>
                          <ul className="flex flex-wrap gap-1">
                            {highlights.filter((item) => item.id === id).map((item) => (
                              <li key={item.label} className="rounded bg-primary-50 px-2 py-1 text-xs font-semibold text-slate-800">{item.label}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-sm text-slate-600">{entry ? (entry.status === "unavailable" ? "This listing is no longer available." : "This public listing could not be found.") : isError ? "Listing details could not be checked." : "Checking listing availability…"}</p>
                      )}
                      <div className="mt-auto flex flex-wrap gap-2 pt-2">
                        {path && (
                          <>
                            <Link className={action} to={path} onClick={() => trackCompare("compare_view_listing", { listing_id: id, source: "compare" })}>View Listing</Link>
                            <Link className={action} to={`${path}#seller-actions`} onClick={() => trackCompare("compare_contact_seller", { listing_id: id, source: "listing_contact_link" })}>Contact Seller</Link>
                          </>
                        )}
                        <Link className={action} to="/listings" aria-label={`Replace ${title}`} onClick={() => dispatch(setComparisonReplacement(id))}>Replace</Link>
                        <button type="button" className={action} aria-label={`Remove ${title}`} onClick={() => remove(id)}>Remove</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            {cars.length < 2 && currentData && (
              <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">Choose at least two available cars to see the side-by-side comparison.</p>
            )}
            {cars.length >= 2 && (
              <section className="min-w-0 rounded-2xl border border-slate-200 bg-white" aria-labelledby="compare-specifications">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
                  <h2 id="compare-specifications" className="text-xl font-bold">Specifications</h2>
                  <label className="flex min-h-10 cursor-pointer items-center gap-2 text-sm font-semibold">
                    <input type="checkbox" checked={differencesOnly} onChange={(event) => {
                      setDifferencesOnly(event.target.checked);
                      trackCompare("compare_show_differences", { enabled: event.target.checked, selection_count: cars.length });
                    }} className="h-5 w-5 accent-primary-500" />
                    Show only differences
                  </label>
                </div>
                {groups.length === 0 ? <p role="status" className="px-4 pb-6 text-sm text-slate-600">No differences among the reported specifications.</p> : (
                  <div className="overflow-x-auto overscroll-x-contain focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500" tabIndex={0} role="region" aria-label="Scrollable vehicle specifications">
                    <table className="w-full table-fixed border-collapse text-left text-sm" style={{ minWidth: 148 + 176 * cars.length }}>
                      <caption className="sr-only">Side-by-side car specifications. Missing values are marked Not provided.</caption>
                      <thead className="bg-slate-100 text-slate-900">
                        <tr>
                          <th scope="col" className="sticky left-0 z-10 w-36 bg-slate-100 p-3">Specification</th>
                          {cars.map((car) => <th key={car._id} scope="col" className="break-words p-3">{carName(car)}</th>)}
                        </tr>
                      </thead>
                      {groups.map(([label, rows]) => (
                        <tbody key={label}>
                          <tr><th colSpan={cars.length + 1} className="bg-slate-50 p-3 font-bold text-slate-900">{label}</th></tr>
                          {rows.map((row) => (
                            <tr className={row.different ? "bg-primary-50/60" : "bg-white"} key={row.name}>
                              <th scope="row" className={`sticky left-0 z-10 border-t border-slate-100 p-3 font-medium ${row.different ? "bg-primary-50" : "bg-white"}`}>
                                {row.name}
                                {row.different && <span className="mt-1 block text-xs text-slate-800">Differs</span>}
                              </th>
                              {row.values.map((value, index) => <td key={cars[index]._id} className="break-words border-t border-slate-100 p-3 text-slate-700">{value === null ? "Not provided" : row.format(value)}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      ))}
                    </table>
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}

