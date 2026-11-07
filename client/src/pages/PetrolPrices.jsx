import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Fuel, ExternalLink, TrendingDown, TrendingUp, Minus } from "lucide-react";
import SEO from "../components/common/SEO";
import { useGetFuelPricesQuery } from "../redux/services/api";

const formatPkr = (value) => {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return `Rs ${Number(value).toLocaleString("en-PK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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

const ChangePill = ({ amount }) => {
  if (amount == null || Number(amount) === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
        <Minus className="h-3.5 w-3.5" /> Unchanged
      </span>
    );
  }
  const up = Number(amount) > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${
        up ? "text-rose-600" : "text-emerald-600"
      }`}
    >
      {up ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      {up ? "+" : ""}
      {Number(amount).toFixed(2)}
    </span>
  );
};

const PetrolPrices = () => {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetFuelPricesQuery(undefined, {
      // Prefer showing last good data over a blank/error flash on refetch.
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
    });

  const current = data?.current || [];
  const history = data?.history || [];
  const meta = data?.meta || {};
  const hasPrices = current.length > 0;
  // Never hide verified prices because a later refetch hit 429/network blip.
  const showHardError = isError && !hasPrices;
  const errorStatus = error?.status || error?.originalStatus;
  const errorHint =
    errorStatus === 404
      ? "Fuel-price API route is missing on this API host. Use the local API (port 4002) or deploy the server update."
      : errorStatus === 429
        ? "API rate limit hit. Wait a minute and refresh."
        : "Check that the API server is running on port 4002.";

  const historyByDate = useMemo(() => {
    const map = new Map();
    for (const row of history) {
      const key = row.effective_date
        ? new Date(row.effective_date).toISOString().slice(0, 10)
        : "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [history]);

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-slate-900">
      <SEO
        title="Petrol & Diesel Prices in Pakistan | Live OGRA Rates – Sello.pk"
        description="Verified Pakistan petrol, diesel, kerosene and light diesel oil prices from official OGRA publications. See current rates, changes, effective dates and history on Sello.pk."
        keywords="petrol price Pakistan, diesel price Pakistan, OGRA fuel prices, petrol rate today, HSD price, kerosene price, Sello.pk"
        canonical="https://sello.pk/petrol-prices"
      />

      <section className="relative overflow-hidden border-b border-amber-900/10 bg-[#1A120B]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, rgba(245,158,11,0.28), transparent 40%), radial-gradient(circle at 90% 0%, rgba(16,185,129,0.12), transparent 35%)",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] font-semibold text-amber-300/90">
            <Fuel className="h-3.5 w-3.5" />
            Sello · Pakistan fuel rates
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-white text-balance">
            Petrol prices
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-white/70 leading-relaxed">
            Automatically updated from official OGRA price publications — not
            news estimates or crude-oil guesses.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs sm:text-sm text-white/65">
            <span>Effective: {formatDate(current[0]?.effective_date)}</span>
            <span className="text-white/30">·</span>
            <span>Last verified: {formatDate(meta.last_verified_at)}</span>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <p className="text-sm text-slate-600">
            Source:{" "}
            <a
              href={meta.source_portal || "https://price.ogra.org.pk/"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-amber-800 hover:underline"
            >
              OGRA Price Publications
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-slate-700 underline-offset-2 hover:underline"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {isError && hasPrices && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
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
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl bg-white/70 border border-stone-200"
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
            Verified OGRA prices are not published on Sello yet. The monitor
            checks OGRA every 30 minutes and will update this page automatically
            after validation.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {current.map((row) => (
              <article
                key={row.fuel_type}
                className="rounded-2xl border border-stone-200 bg-white px-5 py-5 shadow-[0_10px_30px_rgba(40,24,8,0.04)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
                  {row.label}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
                  {formatPkr(row.price)}
                  <span className="ml-2 text-sm font-medium text-stone-500">
                    / litre
                  </span>
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <ChangePill amount={row.change_amount} />
                  {row.previous_price != null && (
                    <span className="text-xs text-stone-500">
                      Prev {formatPkr(row.previous_price)}
                    </span>
                  )}
                </div>
                <p className="mt-4 text-xs text-stone-500">
                  Effective {formatDate(row.effective_date)} · Verified{" "}
                  {formatDate(row.verified_at)}
                </p>
              </article>
            ))}
          </div>
        )}

        <section className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">
            Price history
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Historical verified records from OGRA publications.
          </p>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Effective</th>
                  <th className="px-4 py-3 font-semibold">Fuel</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Change</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-stone-500"
                    >
                      No historical rows yet.
                    </td>
                  </tr>
                ) : (
                  historyByDate.flatMap(([dateKey, rows]) =>
                    rows.map((row) => (
                      <tr
                        key={`${dateKey}-${row._id || row.fuel_type}-${row.price}`}
                        className="border-t border-stone-100"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-stone-700">
                          {formatDate(row.effective_date)}
                        </td>
                        <td className="px-4 py-3 text-stone-800">{row.label}</td>
                        <td className="px-4 py-3 font-medium text-stone-900">
                          {formatPkr(row.price)}
                        </td>
                        <td className="px-4 py-3">
                          <ChangePill amount={row.change_amount} />
                        </td>
                        <td className="px-4 py-3">
                          {row.source_url ? (
                            <a
                              href={row.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-amber-800 hover:underline"
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
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-stone-200 bg-white px-5 py-5 text-sm text-stone-600 leading-relaxed">
          <h2 className="text-base font-semibold text-stone-900">About this data</h2>
          <p className="mt-2">
            Sello monitors OGRA’s official Price Publications portal and notified
            petroleum price documents, downloads new files, extracts and validates
            PKR/litre rates, then publishes only verified values. Failed
            extractions never overwrite the last verified prices.
          </p>
          <p className="mt-3">
            Looking for a car instead?{" "}
            <Link to="/listings" className="font-medium text-amber-800 hover:underline">
              Browse cars for sale
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default PetrolPrices;
