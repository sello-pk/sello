import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Fuel,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Minus,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import SEO from "../components/common/SEO";
import { useGetFuelPricesQuery } from "../redux/services/api";

const FUEL_ORDER = [
  "motor_spirit",
  "hi_octane",
  "high_speed_diesel",
  "e10_gasoline",
  "kerosene_oil",
  "light_diesel_oil",
  "lpg",
  "lng",
  "biodiesel",
  "jet_fuel",
  "marine_fuel",
];

const unitSuffix = (unit) => {
  if (!unit) return "Rs / L";
  if (/kg/i.test(unit)) return "Rs / kg";
  if (/mmbtu/i.test(unit)) return "Rs / MMBtu";
  if (/tonne/i.test(unit)) return "Rs / t";
  return "Rs / L";
};

const shortFuelLabel = (label = "") =>
  label
    .replace(/^Premier Euro 5 \(Petrol \/ Motor Spirit\)$/i, "Premier Euro 5")
    .replace(/^Octane\+ Euro 5 \(Hi-Octane\)$/i, "Octane+")
    .replace(/^Hi-Cetane Diesel Euro 5 \(HSD\)$/i, "Diesel (HSD)")
    .replace(/^Superior Kerosene Oil \(SKO\)$/i, "Kerosene (SKO)")
    .replace(/^Light Diesel Oil \(LDO\)$/i, "LDO")
    .replace(/^Liquefied Petroleum Gas \(LPG\)$/i, "LPG");

const formatPkr = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const ChangeBadge = ({ amount, compact = false }) => {
  if (amount == null || Number(amount) === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-stone-100 text-stone-600 font-medium ${
          compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs"
        }`}
      >
        <Minus className="h-3 w-3" />
        Flat
      </span>
    );
  }
  const up = Number(amount) > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-semibold ${
        compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs"
      } ${
        up
          ? "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200/70"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70"
      }`}
    >
      {up ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {up ? "+" : ""}
      {Number(amount).toFixed(2)}
    </span>
  );
};

const PetrolPrices = () => {
  const [fuelFilter, setFuelFilter] = useState("all");
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetFuelPricesQuery(undefined, {
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
    });

  const current = useMemo(() => {
    const rows = [...(data?.current || [])];
    rows.sort(
      (a, b) =>
        FUEL_ORDER.indexOf(a.fuel_type) - FUEL_ORDER.indexOf(b.fuel_type)
    );
    return rows;
  }, [data?.current]);

  const history = data?.history || [];
  const meta = data?.meta || {};
  const hasPrices = current.length > 0;
  const showHardError = isError && !hasPrices;
  const errorStatus = error?.status || error?.originalStatus;
  const errorHint =
    errorStatus === 404
      ? "Fuel-price API route is missing on this API host."
      : errorStatus === 429
        ? "API rate limit hit. Wait a minute and refresh."
        : "Check that the API server is running.";

  const petrol = current.find((r) => r.fuel_type === "motor_spirit");
  const effectiveDate =
    petrol?.effective_date || current[0]?.effective_date || null;

  const filterOptions = useMemo(() => {
    const types = new Set(history.map((r) => r.fuel_type));
    return [
      { id: "all", label: "All fuels" },
      ...FUEL_ORDER.filter((id) => types.has(id)).map((id) => ({
        id,
        label:
          history.find((r) => r.fuel_type === id)?.label ||
          meta.labels?.[id] ||
          id,
      })),
    ];
  }, [history, meta.labels]);

  const filteredHistory = useMemo(() => {
    const rows =
      fuelFilter === "all"
        ? history
        : history.filter((r) => r.fuel_type === fuelFilter);
    return [...rows].sort((a, b) => {
      const da = new Date(a.effective_date).getTime();
      const db = new Date(b.effective_date).getTime();
      if (db !== da) return db - da;
      return (
        FUEL_ORDER.indexOf(a.fuel_type) - FUEL_ORDER.indexOf(b.fuel_type)
      );
    });
  }, [history, fuelFilter]);

  const historyByDate = useMemo(() => {
    const map = new Map();
    for (const row of filteredHistory) {
      const key = row.effective_date
        ? new Date(row.effective_date).toISOString().slice(0, 10)
        : "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return [...map.entries()];
  }, [filteredHistory]);

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden bg-[#F6F7F9] text-stone-900">
      <SEO
        title="Petrol Prices in Pakistan Today | Latest Fuel Prices – Sello.pk"
        description="Check the latest verified petrol, diesel, kerosene and other fuel prices in Pakistan. View effective dates, historical prices and official OGRA notifications on Sello.pk."
        keywords="petrol price Pakistan, diesel price Pakistan, OGRA fuel prices, petrol rate today, HSD price, kerosene price, Sello.pk"
        canonical="https://sello.pk/petrol-prices"
      />

      <header className="relative overflow-hidden bg-[#0B0C1E] text-white">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 0% 0%, rgba(255,138,0,0.28), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 20%, rgba(56,189,248,0.12), transparent 50%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-14deg, transparent, transparent 12px, rgba(255,255,255,0.08) 12px, rgba(255,255,255,0.08) 13px)",
          }}
          aria-hidden
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 sm:pt-8 sm:pb-12">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex items-center gap-1.5 text-xs text-white/55"
          >
            <Link to="/" className="hover:text-white/90 transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-primary-400 font-medium">Petrol prices</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="fuel-hero-copy">
              <p className="text-[2rem] sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-primary-400 leading-none">
                Sello
              </p>
              <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white text-balance">
                Petrol prices in Pakistan
              </h1>
              <p className="mt-3 max-w-xl text-sm sm:text-[15px] text-white/65 leading-relaxed text-pretty">
                Verified OGRA rates, updated automatically — not news guesses
                or crude-oil math.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Verified only
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85">
                  <Fuel className="h-3.5 w-3.5 text-primary-400" />
                  Effective {formatDate(effectiveDate)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/85">
                  Checked {formatDate(meta.last_verified_at)}
                </span>
              </div>
            </div>

            {petrol && (
              <aside className="fuel-hero-spotlight rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm px-5 py-5 sm:px-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-400/90">
                  Premier Euro 5
                </p>
                <p className="mt-2 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-bold tracking-tight tabular-nums text-white">
                    {formatPkr(petrol.price)}
                  </span>
                  <span className="text-sm text-white/50">
                    {unitSuffix(petrol.unit)}
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ChangeBadge amount={petrol.change_amount} />
                  {petrol.previous_price != null && (
                    <span className="text-xs text-white/50">
                      was Rs {formatPkr(petrol.previous_price)}
                    </span>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <a
            href={meta.source_portal || "https://price.ogra.org.pk/"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 hover:text-primary-600 transition-colors"
          >
            Official OGRA source
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:border-stone-300 hover:bg-stone-50 disabled:opacity-60 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`}
            />
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {isError && hasPrices && (
          <div className="mb-5 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Showing last verified prices. Live refresh failed
            {errorStatus ? ` (${errorStatus})` : ""}.{" "}
            <button
              type="button"
              onClick={() => refetch()}
              className="font-semibold underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading && !hasPrices ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-40 animate-pulse rounded-2xl bg-white border border-stone-200/80"
              />
            ))}
          </div>
        ) : showHardError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-6 text-rose-800 space-y-2">
            <p className="font-medium">Could not load verified fuel prices.</p>
            <p className="text-sm text-rose-700/90">{errorHint}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="text-sm font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        ) : current.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-6 text-amber-950">
            Verified OGRA prices are not published yet. The monitor checks every
            30 minutes and will update this page after validation.
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {current.map((row, index) => {
                const isPetrol = row.fuel_type === "motor_spirit";
                const isTrackmate = row.source_channel === "trackmate";
                return (
                  <article
                    key={row.fuel_type}
                    className={`fuel-price-tile group relative overflow-hidden rounded-2xl border px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 ${
                      isPetrol
                        ? "border-primary-200/80 bg-gradient-to-br from-white to-orange-50/60 shadow-[0_12px_28px_rgba(255,138,0,0.08)]"
                        : "border-stone-200/90 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:border-stone-300"
                    }`}
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-500 line-clamp-2 min-h-[2.5rem]">
                      {row.label}
                    </p>
                    <p className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-[1.65rem] font-bold tracking-tight tabular-nums text-stone-900">
                        {formatPkr(row.price)}
                      </span>
                      <span className="text-xs font-medium text-stone-400">
                        {unitSuffix(row.unit)}
                      </span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <ChangeBadge amount={row.change_amount} compact />
                      {row.previous_price != null && (
                        <span className="text-[11px] text-stone-400 tabular-nums">
                          prev {formatPkr(row.previous_price)}
                        </span>
                      )}
                    </div>
                    {row.source_url && (
                      <a
                        href={row.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary-600"
                      >
                        {isTrackmate ? "Retail board" : "Source"}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>

            {Array.isArray(meta.catalog) && meta.catalog.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                  All fuel categories
                </h2>
                {meta.catalog.map((group) => {
                  const priced = new Set(current.map((r) => r.fuel_type));
                  return (
                    <div key={group.group}>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500 mb-2">
                        {group.group}
                      </p>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {(group.fuels || []).map((id) => {
                          const label = meta.labels?.[id] || id;
                          const has = priced.has(id);
                          return (
                            <li
                              key={id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-white px-3 py-2.5 text-sm"
                            >
                              <span className="text-stone-800 font-medium">
                                {label}
                              </span>
                              <span
                                className={`text-[11px] font-semibold ${
                                  has ? "text-emerald-700" : "text-stone-400"
                                }`}
                              >
                                {has ? "Live" : "Awaiting rate"}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        <section className="mt-12 sm:mt-14">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-stone-900">
                Price history
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Verified OGRA publications, newest first.
              </p>
            </div>
            <div
              className="flex flex-wrap gap-1.5 rounded-xl bg-stone-200/50 p-1"
              role="tablist"
              aria-label="Filter fuel history"
            >
              {filterOptions.map((opt) => {
                const active = fuelFilter === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setFuelFilter(opt.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                      active
                        ? "bg-white text-stone-900 shadow-sm"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    {shortFuelLabel(opt.label)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile: date-grouped list */}
          <div className="sm:hidden space-y-3">
            {historyByDate.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-500">
                No historical rows yet.
              </div>
            ) : (
              historyByDate.map(([dateKey, rows]) => (
                <div
                  key={dateKey}
                  className="rounded-2xl border border-stone-200 bg-white overflow-hidden"
                >
                  <div className="bg-stone-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-stone-500">
                    {formatDate(rows[0]?.effective_date)}
                  </div>
                  <ul className="divide-y divide-stone-100">
                    {rows.map((row) => (
                      <li
                        key={`${dateKey}-${row._id || row.fuel_type}`}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-800 truncate">
                            {row.label?.replace("Motor Spirit / ", "")}
                          </p>
                          <p className="text-base font-semibold tabular-nums text-stone-900">
                            Rs {formatPkr(row.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <ChangeBadge amount={row.change_amount} compact />
                          {row.source_url && (
                            <a
                              href={row.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600"
                            >
                              PDF
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/80 text-[11px] uppercase tracking-[0.08em] text-stone-500">
                    <th className="px-4 py-3.5 font-semibold">Effective</th>
                    <th className="px-4 py-3.5 font-semibold">Fuel</th>
                    <th className="px-4 py-3.5 font-semibold">Price</th>
                    <th className="px-4 py-3.5 font-semibold">Change</th>
                    <th className="px-4 py-3.5 font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-stone-500"
                      >
                        No historical rows for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((row, i) => (
                      <tr
                        key={`${row._id || row.fuel_type}-${row.effective_date}-${i}`}
                        className="border-t border-stone-100 hover:bg-stone-50/70 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                          {formatDate(row.effective_date)}
                        </td>
                        <td className="px-4 py-3 text-stone-800 font-medium">
                          {row.label}
                        </td>
                        <td className="px-4 py-3 font-semibold tabular-nums text-stone-900">
                          Rs {formatPkr(row.price)}
                        </td>
                        <td className="px-4 py-3">
                          <ChangeBadge amount={row.change_amount} compact />
                        </td>
                        <td className="px-4 py-3">
                          {row.source_url ? (
                            <a
                              href={row.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary-600 hover:underline font-medium"
                            >
                              OGRA
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-stone-200 bg-white px-5 py-5 text-sm text-stone-600 leading-relaxed">
            <h2 className="text-base font-semibold text-stone-900">
              About this data
            </h2>
            <p className="mt-2">
              Sello monitors official OGRA price publications, downloads new
              documents, extracts and validates PKR/litre rates, then publishes
              only verified values. Failed extractions never overwrite the last
              verified prices.
            </p>
          </div>
          <Link
            to="/listings"
            className="rounded-2xl border border-stone-900 bg-stone-900 px-5 py-5 text-white hover:bg-stone-800 transition-colors flex flex-col justify-center"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/55">
              Looking for a car?
            </span>
            <span className="mt-2 text-lg font-semibold tracking-tight">
              Browse cars for sale
            </span>
            <span className="mt-1 text-sm text-white/60">
              Verified listings across Pakistan →
            </span>
          </Link>
        </section>
      </div>

      <style>{`
        .fuel-hero-copy {
          animation: fuelFadeUp 0.55s ease-out both;
        }
        .fuel-hero-spotlight {
          animation: fuelFadeUp 0.65s ease-out 0.08s both;
        }
        .fuel-price-tile {
          animation: fuelFadeUp 0.45s ease-out both;
        }
        @keyframes fuelFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .fuel-hero-copy,
          .fuel-hero-spotlight,
          .fuel-price-tile {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PetrolPrices;
