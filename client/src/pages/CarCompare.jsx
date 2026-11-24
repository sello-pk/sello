import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SEO from "../components/common/SEO";
import VehicleSelector, {
  emptyVehicle,
} from "../components/compare/VehicleSelector";
import {
  useCompareConfigQuery,
  useCompareResultsMutation,
  useCompareResearchMutation,
  useCompareRecommendationMutation,
} from "../redux/services/compareApi";
import { useCarCategories } from "../hooks/useCarCategories";
import {
  compareGroups,
  compareFields,
  defaultCompareContent,
  runningCost,
  fieldMap,
} from "../constants/carCompare.js";

const button =
  "rounded-lg bg-primary-500 px-5 py-3 font-semibold text-[#0A1025] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
const outlineButton =
  "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50";
const format = (value) =>
  typeof value === "boolean"
    ? value
      ? "Yes"
      : "No"
    : typeof value === "number"
      ? value.toLocaleString("en-PK")
      : value;
const money = (value) => `PKR ${Math.round(value).toLocaleString("en-PK")}`;
const name = (row) =>
  `${row.make} ${row.model} ${row.year} ${row.variant || "(variant unspecified)"}`;
const date = (value) =>
  value
    ? new Date(value).toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";
const selectionKey = (rows) =>
  JSON.stringify(
    rows.map((row) => [
      row.makeId,
      row.modelId,
      row.yearId,
      String(row.variant || "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase(),
    ]),
  );
function readSelection(search) {
  try {
    const rows = JSON.parse(new URLSearchParams(search).get("vehicles"));
    if (
      Array.isArray(rows) &&
      rows.length >= 2 &&
      rows.length <= 3 &&
      rows.every(
        (row) =>
          row &&
          ["makeId", "modelId", "yearId"].every(
            (key) => typeof row[key] === "string",
          ) &&
          (row.variant === undefined || typeof row.variant === "string"),
      )
    )
      return rows.map((row) => ({
        makeId: row.makeId,
        modelId: row.modelId,
        yearId: row.yearId,
        variant: row.variant || "",
      }));
  } catch {
    /* Invalid share URLs start with an empty form. */
  }
  return null;
}
const researchMessages = {
  waiting: "Searching the web for this vehicle…",
  not_configured:
    "Research service needs configuration. Please try again later.",
  ai_credentials:
    "Research service could not authenticate. Please try again later.",
  ai_capacity: "Research is temporarily limited. Please retry shortly.",
  ai_quota: "Live research is temporarily unavailable. Please try again later.",
  ai_unavailable: "Research service is temporarily unavailable.",
  timeout: "Research timed out. You can retry this vehicle.",
  failed: "Research could not finish. Please try again.",
  no_data:
    "Reliable information for this Pakistan-market selection could not be established.",
  ai_incomplete: "Research returned an incomplete response. Please retry.",
  search_unavailable: "Live search did not complete. Please retry.",
};
function friendlyError(error) {
  if (error?.status === 404)
    return "The comparison service has not been deployed to the connected API yet.";
  if (error?.status === 429)
    return "Too many research requests. Please wait a minute and retry.";
  return (
    error?.data?.message ||
    "The comparison service could not be reached. Please try again."
  );
}
export function SeoSections({ sections = defaultCompareContent }) {
  return (
    <section
      className="mt-14 grid gap-6 md:grid-cols-2"
      aria-label="Car buying guides"
    >
      {sections.map((section) => (
        <article
          key={section.title}
          className="overflow-hidden rounded-2xl border bg-white"
        >
          <img
            src={section.image}
            alt={section.alt}
            loading="lazy"
            width="640"
            height="320"
            className="h-40 w-full bg-slate-50 object-contain"
          />
          <div className="p-6">
            <h2 className="mb-3 text-xl font-bold">{section.title}</h2>
            <p className="leading-relaxed text-slate-600">
              {section.description}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
function Evidence({ entry, label = "Source" }) {
  if (!entry?.sourceUrl) return null;
  return (
    <a
      className="ml-2 inline-block rounded border border-primary-200 px-2 py-1 text-xs font-medium text-[#0A1025] underline decoration-primary-500 underline-offset-2 focus-visible:outline focus-visible:outline-2"
      href={entry.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label}, opens in a new tab`}
    >
      {label.startsWith("Source for ") ? "Source" : label}
    </a>
  );
}
function ValueCell({ entry, field, loading }) {
  if (!entry)
    return loading ? (
      <span
        className="inline-block h-4 w-20 animate-pulse rounded bg-slate-200"
        aria-label="Research in progress"
      />
    ) : (
      <span className="text-slate-500">Not Available</span>
    );
  return (
    <>
      <span>{format(entry.value)}</span>
      <Evidence entry={entry} label={`Source for ${field.label}`} />
      <span className="mt-1 block text-xs font-normal text-slate-600">
        {entry.status === "estimate" ? "Estimate" : "Web-researched"}
        {entry.priceKind && entry.priceKind !== "estimate"
          ? ` · ${entry.priceKind === "undated" ? "Price date unavailable" : `${entry.priceKind} price`}`
          : ""}
        {entry.asOf ? ` · as of ${entry.asOf}` : ""}
      </span>
    </>
  );
}
function Recommendation({ answer, rows }) {
  if (!answer) return null;
  return (
    <div className="mt-5 space-y-5">
      <p className="leading-relaxed">{answer.text}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {answer.choices?.map((choice, index) => {
          const row = rows.find((vehicle) => vehicle.key === choice.vehicleKey);
          if (!row) return null;
          return (
            <article
              key={`${choice.vehicleKey}-${index}`}
              className="rounded-xl border border-slate-200 p-4"
            >
              <h3 className="font-bold">{name(row)}</h3>
              <p className="mt-1 font-medium">{choice.purpose}</p>
              <p className="mt-3 text-slate-700">{choice.reason}</p>
              <p className="mt-3 text-sm text-slate-600">
                <strong>Trade-off. </strong>
                {choice.tradeOff}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {choice.evidence.map((key) => (
                  <Evidence
                    key={key}
                    entry={row.specs[key]}
                    label={fieldMap[key]?.label || key}
                  />
                ))}
              </div>
            </article>
          );
        })}
      </div>
      {answer.cautions?.length > 0 && (
        <div className="rounded-xl bg-slate-50 p-4">
          <h3 className="font-semibold">Information to check before buying</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {answer.cautions.map((text, index) => (
              <li key={index}>{text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
export default function CarCompare() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: config } = useCompareConfigQuery();
  const { makes, models, years } = useCarCategories("Car");
  const catalog = [...makes, ...models, ...years];
  const [vehicles, setVehicles] = useState(
    () => readSelection(location.search) || [emptyVehicle(), emptyVehicle()],
  );
  const [submitted, setSubmitted] = useState(() =>
    readSelection(location.search),
  );
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [researching, setResearching] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [retryIndex, setRetryIndex] = useState(null);
  const [differences, setDifferences] = useState(false);
  const [mobileVehicle, setMobileVehicle] = useState(0);
  const [costs, setCosts] = useState({
    distance: 1000,
    fuelPrice: "",
    tariff: "",
    mode: "combinedEconomy",
  });
  const [priorities, setPriorities] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [summaryError, setSummaryError] = useState("");
  const [summaryAttempt, setSummaryAttempt] = useState(0);
  const [answerBasis, setAnswerBasis] = useState("");
  const optionsRef = useRef({ costs, priorities });
  optionsRef.current = { costs, priorities };
  const resultRef = useRef(null);
  const [getResults, { isLoading: validating }] = useCompareResultsMutation();
  const [research] = useCompareResearchMutation();
  const [recommend, { isLoading: summarizing }] =
    useCompareRecommendationMutation();
  const stale = submitted && selectionKey(vehicles) !== selectionKey(submitted);
  const basis = JSON.stringify({ costs, priorities });
  const busy = validating || researching;
  useEffect(() => {
    if (config?.fuelPrice)
      setCosts((previous) => ({
        ...previous,
        fuelPrice: previous.fuelPrice || config.fuelPrice,
      }));
  }, [config?.fuelPrice]);
  useEffect(() => {
    const selected = readSelection(location.search);
    if (!selected) return;
    let active = true;
    const requests = [];
    const call = (promise) => {
      requests.push(promise);
      return promise.unwrap();
    };
    async function load() {
      setError("");
      setNotice("");
      setAnswer(null);
      setResearching(true);
      try {
        const rows = await call(getResults(selected));
        if (!active) return;
        setSubmitted(selected);
        setResults(rows);
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        await Promise.allSettled(
          selected.map(async (vehicle, index) => {
            try {
              const updated = await call(research(vehicle));
              if (active)
                setResults((previous) =>
                  previous.map((row, position) =>
                    position === index ? updated : row,
                  ),
                );
            } catch (failure) {
              if (active) {
                setError(friendlyError(failure));
                setResults((previous) =>
                  previous.map((row, position) =>
                    position === index
                      ? { ...row, research: { status: "failed" } }
                      : row,
                  ),
                );
              }
            }
          }),
        );
      } catch (failure) {
        if (active) setError(friendlyError(failure));
      } finally {
        if (active) setResearching(false);
      }
    }
    load();
    return () => {
      active = false;
      requests.forEach((request) => request.abort());
    };
  }, [location.search, attempt, getResults, research]);
  useEffect(() => {
    if (!results.length || researching || retryIndex !== null) return;
    const ids = results.map((row) => row.researchId);
    if (ids.some((id) => !id)) {
      setSummaryError(
        "Retry unavailable vehicles to prepare a recommendation.",
      );
      return;
    }
    let active = true;
    const options = optionsRef.current;
    const request = recommend({ researchIds: ids, ...options });
    setSummaryError("");
    request
      .unwrap()
      .then((response) => {
        if (!active) return;
        setAnswer(response.text ? response : null);
        setAnswerBasis(JSON.stringify(options));
        if (!response.text)
          setSummaryError(
            response.reason === "expired"
              ? "Research expired. Compare again to retrieve current specifications."
              : "There is insufficient reliable information for a recommendation.",
          );
      })
      .catch((failure) => {
        if (active) setSummaryError(friendlyError(failure));
      });
    return () => {
      active = false;
      request.abort();
    };
  }, [results, researching, retryIndex, recommend, summaryAttempt]);
  const submit = (event) => {
    event.preventDefault();
    if (
      vehicles.some(
        (vehicle) => !vehicle.makeId || !vehicle.modelId || !vehicle.yearId,
      )
    ) {
      setError(
        "Select a brand, model and year for each vehicle. Variant is optional.",
      );
      return;
    }
    if (
      new Set(vehicles.map((vehicle) => selectionKey([vehicle]))).size !==
      vehicles.length
    ) {
      setError("Choose different vehicles, years or variants.");
      return;
    }
    setError("");
    setNotice("");
    setResults([]);
    setAnswer(null);
    setSubmitted(vehicles);
    const slug = vehicles
      .map((vehicle) =>
        [
          catalog.find((row) => row._id === vehicle.makeId)?.name,
          catalog.find((row) => row._id === vehicle.modelId)?.name,
          catalog.find((row) => row._id === vehicle.yearId)?.name,
          vehicle.variant,
        ]
          .filter(Boolean)
          .join("-"),
      )
      .join("-vs-")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-");
    const target = `/cars/compare/${slug}?vehicles=${encodeURIComponent(JSON.stringify(vehicles))}`;
    if (`${location.pathname}${location.search}` === target)
      setAttempt((previous) => previous + 1);
    else navigate(target);
  };
  const retry = async (index) => {
    if (!submitted || stale || retryIndex !== null) return;
    setRetryIndex(index);
    setError("");
    try {
      const updated = await research(submitted[index]).unwrap();
      setResults((previous) =>
        previous.map((row, position) => (position === index ? updated : row)),
      );
    } catch (failure) {
      setError(friendlyError(failure));
    } finally {
      setRetryIndex(null);
    }
  };
  const title = results.length
    ? `${results.map(name).join(" vs ")} | SELLO`
    : "Car Compare in Pakistan | SELLO";
  const shownMobileVehicle = Math.min(
    mobileVehicle,
    Math.max(0, results.length - 1),
  );
  return (
    <main className="min-h-screen bg-slate-50 py-10 text-[#0A1025]">
      <SEO
        title={title}
        description="Compare Pakistan-market cars, prices, fuel averages, safety and running costs with cited live research."
        keywords="
car comparison Pakistan,compare cars in Pakistan,car comparison tool,compare car prices in Pakistan,car specifications comparison,car features comparison,compare two cars online,car price comparison Pakistan,new car comparison Pakistan,used car comparison Pakistan
"
        canonical="https://sello.pk/cars/compare"
        robots={location.search ? "noindex, follow" : "index, follow"}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <p className="mb-2 font-semibold">SELLO Car Compare</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Find the car that fits your life.
          </h1>
          <p className="mt-4 text-slate-600">
            Compare two or three Pakistan-market vehicles using live research.
            Add a variant for more specific equipment and prices, or leave it
            open.
          </p>
        </div>
        <form onSubmit={submit} aria-label="Choose comparison vehicles">
          <div className="grid gap-5 md:grid-cols-3">
            {vehicles.map((vehicle, index) => (
              <div key={index} className="rounded-2xl border bg-white p-5">
                <VehicleSelector
                  value={vehicle}
                  index={index + 1}
                  onChange={(value) =>
                    setVehicles((previous) =>
                      previous.map((row, position) =>
                        position === index ? value : row,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  className="mt-4 text-sm underline"
                  onClick={() =>
                    setVehicles((previous) =>
                      previous.length === 3
                        ? previous.filter((_, position) => position !== index)
                        : previous.map((row, position) =>
                            position === index ? emptyVehicle() : row,
                          ),
                    )
                  }
                >
                  Remove vehicle {index + 1}
                </button>
              </div>
            ))}
            {vehicles.length === 2 && (
              <button
                type="button"
                className="min-h-28 rounded-2xl border-2 border-dashed p-6 hover:bg-white"
                onClick={() =>
                  setVehicles((previous) => [...previous, emptyVehicle()])
                }
              >
                + Add a third car
              </button>
            )}
          </div>
          <button disabled={busy && !stale} className={`${button} mt-5`}>
            {busy && !stale
              ? "Researching vehicles…"
              : stale
                ? "Update comparison"
                : "Compare cars"}
          </button>
        </form>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800"
          >
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mt-4 text-sm text-slate-700">
            {notice}
          </p>
        )}
        {stale && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-primary-200 bg-primary-50 p-4"
          >
            Selections changed. Results below describe the previous selections.
            Click Update comparison to research your new choices.
          </p>
        )}
        <div ref={resultRef} className="scroll-mt-6" />
        {results.length > 0 && (
          <section
            className="mt-10"
            aria-label="Comparison results"
            aria-busy={busy}
          >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-bold">
                {stale ? "Previous comparison" : "Your comparison"}
              </h2>
              <div className="flex items-center gap-4">
                <label className="text-sm">
                  <input
                    type="checkbox"
                    checked={differences}
                    onChange={(event) => setDifferences(event.target.checked)}
                  />{" "}
                  Show differences only
                </label>
                <button
                  className={outlineButton}
                  disabled={stale}
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      setNotice(
                        "Comparison link copied. Shared links run fresh research.",
                      );
                    } catch {
                      setNotice(
                        "Copy the page URL from your address bar to share this comparison.",
                      );
                    }
                  }}
                >
                  Copy share link
                </button>
              </div>
            </div>
            {researching && (
              <p role="status" className="mb-4 text-sm">
                Researching each vehicle independently. Results appear as each
                search finishes.
              </p>
            )}
            <div className="mb-6 grid gap-4 md:grid-cols-3" aria-live="polite">
              {results.map((row, index) => {
                const loading =
                  row.research?.status === "waiting" || retryIndex === index;
                const count = Object.keys(row.specs).length;
                return (
                  <article
                    key={row.key}
                    className="rounded-xl border bg-white p-5"
                  >
                    <h3 className="font-bold">{name(row)}</h3>
                    <p className="mt-3 font-semibold">
                      {count} of {compareFields.length} specifications found
                    </p>
                    <div
                      role="progressbar"
                      aria-label={`Research completeness for ${name(row)}`}
                      aria-valuemin={0}
                      aria-valuemax={compareFields.length}
                      aria-valuenow={count}
                      className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
                    >
                      <div
                        className="h-full bg-primary-500"
                        style={{
                          width: `${(count / compareFields.length) * 100}%`,
                        }}
                      />
                    </div>
                    {row.research?.retrievedAt && (
                      <p className="mt-2 text-xs text-slate-600">
                        Researched {date(row.research.retrievedAt)}
                      </p>
                    )}
                    {!row.variant && (
                      <p className="mt-2 text-xs text-slate-600">
                        Shared model-year facts. Equipment that varies by trim
                        stays unavailable.
                      </p>
                    )}
                    {researchMessages[row.research?.status] && (
                      <p className="mt-2 text-sm text-slate-600">
                        {researchMessages[row.research.status]}
                      </p>
                    )}
                    {!loading &&
                      !busy &&
                      row.research?.status !== "complete" && (
                        <button
                          className={`${outlineButton} mt-3`}
                          disabled={stale || retryIndex !== null}
                          onClick={() => retry(index)}
                        >
                          Retry {row.make} {row.model}
                        </button>
                      )}
                  </article>
                );
              })}
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Values link to supporting sources. Estimates are marked
              separately. A current price requires a documented source date
              within 90 days; older prices are historical. Undated prices may be
              outdated.
            </p>
            <nav
              aria-label="Comparison sections"
              className="mb-5 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {compareGroups.map((group, index) => (
                <a
                  className="whitespace-nowrap rounded-full border bg-white px-4 py-2 text-sm"
                  key={group.title}
                  href={`#compare-group-${index}`}
                >
                  {group.title}
                </a>
              ))}
            </nav>
            <div className="mb-4 md:hidden">
              <label className="block text-sm font-semibold">
                Vehicle to view
                <select
                  aria-label="Vehicle to view on mobile"
                  className="mt-2 w-full rounded-lg border bg-white p-3"
                  value={shownMobileVehicle}
                  onChange={(event) =>
                    setMobileVehicle(Number(event.target.value))
                  }
                >
                  {results.map((row, index) => (
                    <option value={index} key={row.key}>
                      {name(row)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="rounded-xl border bg-white">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="sticky top-14 z-10 bg-slate-100">
                  <tr>
                    <th scope="col" className="w-[42%] p-3 md:w-1/4">
                      Specification
                    </th>
                    {results.map((row, index) => (
                      <th
                        scope="col"
                        key={row.key}
                        className={`${index !== shownMobileVehicle ? "hidden md:table-cell" : ""} break-words p-3`}
                      >
                        {name(row)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {compareGroups.map((group, groupIndex) => {
                    const fields = group.fields.filter(
                      (field) =>
                        !differences ||
                        new Set(
                          results.map((row) =>
                            JSON.stringify(row.specs[field.key]?.value ?? null),
                          ),
                        ).size > 1,
                    );
                    if (!fields.length) return null;
                    return (
                      <GroupRows
                        key={group.title}
                        group={group}
                        groupIndex={groupIndex}
                        fields={fields}
                        results={results}
                        mobileVehicle={shownMobileVehicle}
                        retryIndex={retryIndex}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
            <section className="mt-8 rounded-2xl border bg-white p-5 sm:p-6">
              <h2 className="text-2xl font-bold">Fuel and electricity costs</h2>
              <p className="mt-2 text-sm text-slate-600">
                Calculated from your distance, energy price and the selected
                consumption figure. Electricity costs exclude charging losses
                and other ownership expenses.
              </p>
              {config?.fuelDate && (
                <p className="mt-2 text-sm">
                  Configured petrol price effective{" "}
                  {new Date(config.fuelDate).toLocaleDateString("en-PK")}. You
                  can enter a different price.
                </p>
              )}
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["distance", "Monthly distance (km)"],
                  ["fuelPrice", "Fuel price (PKR/litre)"],
                  ["tariff", "Electricity tariff (PKR/kWh)"],
                ].map(([key, label]) => (
                  <label key={key} className="text-sm">
                    {label}
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="mt-1 block w-full rounded-lg border p-3"
                      value={costs[key]}
                      onChange={(event) =>
                        setCosts({ ...costs, [key]: event.target.value })
                      }
                    />
                  </label>
                ))}
                <label className="text-sm">
                  Fuel average
                  <select
                    className="mt-1 block w-full rounded-lg border bg-white p-3"
                    value={costs.mode}
                    onChange={(event) =>
                      setCosts({ ...costs, mode: event.target.value })
                    }
                  >
                    {[
                      ["cityEconomy", "City"],
                      ["highwayEconomy", "Highway"],
                      ["combinedEconomy", "Combined"],
                    ].map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {results.map((row) => {
                  const cost = runningCost(
                    row.specs,
                    costs.distance,
                    costs.fuelPrice,
                    costs.tariff,
                    costs.mode,
                  );
                  return (
                    <article
                      className="rounded-xl bg-slate-50 p-4"
                      key={row.key}
                    >
                      <h3 className="font-bold">{name(row)}</h3>
                      {cost ? (
                        <>
                          <p className="mt-2 text-xl">
                            {money(cost.monthly)} / month
                          </p>
                          <p>{money(cost.annual)} / year</p>
                          <Evidence
                            entry={
                              row.specs[
                                cost.electric ? "energyConsumption" : costs.mode
                              ]
                            }
                            label="Consumption source"
                          />
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-slate-600">
                          Not Available. Enter an energy price and select an
                          available consumption figure.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
            <section
              className="mt-8 rounded-2xl border bg-white p-5 sm:p-6"
              aria-label="AI buying recommendation"
            >
              <h2 className="text-2xl font-bold">
                SELLO AI buying recommendation
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Generated from the researched facts and your calculated costs.
                Select optional priorities, then update the recommendation.
              </p>
              <div className="my-5 flex flex-wrap gap-3">
                {[
                  "Fuel Saving",
                  "Low Maintenance",
                  "Resale Value",
                  "Comfort",
                  "Performance",
                  "Family Use",
                ].map((priority) => (
                  <label
                    key={priority}
                    className="rounded-lg border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={priorities.includes(priority)}
                      onChange={(event) =>
                        setPriorities((previous) =>
                          event.target.checked
                            ? [...previous, priority]
                            : previous.filter((item) => item !== priority),
                        )
                      }
                    />{" "}
                    {priority}
                  </label>
                ))}
              </div>
              {stale ? (
                <p>
                  Update the comparison to get advice for your new selections.
                </p>
              ) : (
                <>
                  <button
                    className={button}
                    disabled={busy || summarizing || retryIndex !== null}
                    onClick={() =>
                      setSummaryAttempt((previous) => previous + 1)
                    }
                  >
                    {summarizing
                      ? "Preparing recommendation…"
                      : "Update recommendation"}
                  </button>
                  {answer && answerBasis !== basis && (
                    <p role="status" className="mt-3 text-sm">
                      Your costs or priorities changed. Update the
                      recommendation to include them.
                    </p>
                  )}
                  {summaryError && (
                    <p role="alert" className="mt-4 text-sm text-red-800">
                      {summaryError}
                    </p>
                  )}
                  <Recommendation answer={answer} rows={results} />
                </>
              )}
            </section>
          </section>
        )}
        <SeoSections sections={config?.sections || defaultCompareContent} />
      </div>
    </main>
  );
}
function GroupRows({
  group,
  groupIndex,
  fields,
  results,
  mobileVehicle,
  retryIndex,
}) {
  return (
    <>
      <tr id={`compare-group-${groupIndex}`} className="scroll-mt-20">
        <th
          colSpan={results.length + 1}
          className="hidden bg-[#0A1025] p-4 text-base text-white md:table-cell"
        >
          {group.title}
        </th>
        <th
          colSpan={2}
          className="bg-[#0A1025] p-4 text-base text-white md:hidden"
        >
          {group.title}
        </th>
      </tr>
      {fields.map((field) => {
        const numeric = results
          .map((row) => row.specs[field.key]?.value)
          .filter((value) => typeof value === "number");
        const best =
          field.better === "higher"
            ? Math.max(...numeric)
            : Math.min(...numeric);
        return (
          <tr key={field.key} className="border-b">
            <th scope="row" className="break-words p-3 font-medium capitalize">
              {field.label}
              {field.unit && (
                <span className="block text-xs font-normal normal-case text-slate-500">
                  {field.unit}
                </span>
              )}
            </th>
            {results.map((row, index) => (
              <td
                key={row.key}
                className={`${index !== mobileVehicle ? "hidden md:table-cell" : ""} break-words p-3 align-top ${field.better && new Set(numeric).size > 1 && row.specs[field.key]?.value === best ? "bg-primary-50 font-semibold" : ""}`}
              >
                <ValueCell
                  entry={row.specs[field.key]}
                  field={field}
                  loading={
                    row.research?.status === "waiting" || retryIndex === index
                  }
                />
              </td>
            ))}
          </tr>
        );
      })}
    </>
  );
}
