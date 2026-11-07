import React, { useMemo, useState } from "react";
import AdminLayout from "../../components/features/admin/AdminLayout";
import {
  useGetAdminFuelPricesQuery,
  useRunFuelPriceCheckMutation,
  useCorrectFuelPriceMutation,
} from "../../redux/services/adminApi";

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-PK");
};

const FuelPricesAdmin = () => {
  const { data, isLoading, refetch, isFetching } = useGetAdminFuelPricesQuery();
  const [runCheck, { isLoading: isRunning }] = useRunFuelPriceCheckMutation();
  const [correctPrice, { isLoading: isSaving }] = useCorrectFuelPriceMutation();

  const [form, setForm] = useState({
    fuel_type: "motor_spirit",
    price: "",
    effective_date: "",
    reason: "",
    source_url: "https://price.ogra.org.pk/",
  });
  const [message, setMessage] = useState("");

  const current = data?.current || [];
  const logs = data?.logs || [];
  const publications = data?.publications || [];
  const labels = data?.labels || {};
  const fuelTypes = data?.fuel_types || [];

  const statusTone = useMemo(
    () => ({
      published: "bg-emerald-100 text-emerald-800",
      needs_review: "bg-amber-100 text-amber-900",
      failed: "bg-rose-100 text-rose-800",
      duplicate: "bg-slate-100 text-slate-700",
      detected: "bg-sky-100 text-sky-800",
      downloaded: "bg-indigo-100 text-indigo-800",
      validated: "bg-teal-100 text-teal-800",
    }),
    []
  );

  const onRunCheck = async () => {
    setMessage("");
    try {
      const summary = await runCheck().unwrap();
      setMessage(
        `Check finished · discovered ${summary.discovered || 0}, published ${
          summary.published || 0
        }, needs review ${summary.needs_review || 0}`
      );
      refetch();
    } catch (error) {
      setMessage(error?.data?.message || error?.message || "Check failed");
    }
  };

  const onSubmitCorrection = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await correctPrice({
        ...form,
        price: Number(form.price),
      }).unwrap();
      setMessage("Manual correction published.");
      setForm((prev) => ({ ...prev, price: "", reason: "" }));
      refetch();
    } catch (error) {
      setMessage(error?.data?.message || error?.message || "Save failed");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Fuel Prices
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              OGRA automation status, validation, and manual approval
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium"
              disabled={isFetching}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={onRunCheck}
              disabled={isRunning}
              className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold disabled:opacity-60"
            >
              {isRunning ? "Running…" : "Run check now"}
            </button>
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="text-gray-500">Loading dashboard…</div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Last check
                </p>
                <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {formatDateTime(data?.last_successful_check?.createdAt)}
                </p>
              </div>
              <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Last successful update
                </p>
                <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {formatDateTime(data?.last_successful_update?.createdAt)}
                </p>
              </div>
              <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Latest OGRA notification
                </p>
                <p className="mt-2 font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {data?.latest_publication?.title || "—"}
                </p>
              </div>
              <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Validation status
                </p>
                <p className="mt-2 font-semibold text-gray-900 dark:text-white">
                  {data?.latest_publication?.validation?.passed
                    ? "Passed"
                    : data?.latest_publication?.status || "—"}
                </p>
              </div>
            </div>

            <section className="rounded-xl border bg-white dark:bg-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Current published prices
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-3">Fuel</th>
                      <th className="py-2 pr-3">Price</th>
                      <th className="py-2 pr-3">Effective</th>
                      <th className="py-2 pr-3">Verified</th>
                      <th className="py-2 pr-3">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {current.map((row) => (
                      <tr key={row.fuel_type} className="border-b border-gray-100">
                        <td className="py-2 pr-3">{row.label}</td>
                        <td className="py-2 pr-3 font-semibold">
                          Rs {Number(row.price).toFixed(2)}
                        </td>
                        <td className="py-2 pr-3">
                          {formatDateTime(row.effective_date)}
                        </td>
                        <td className="py-2 pr-3">
                          {formatDateTime(row.verified_at)}
                        </td>
                        <td className="py-2 pr-3">
                          {row.source_url ? (
                            <a
                              href={row.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:underline"
                            >
                              Open
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border bg-white dark:bg-gray-800 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Detected publications
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {publications.map((pub) => (
                    <div
                      key={pub._id}
                      className="rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {pub.title}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            statusTone[pub.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {pub.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Detected {formatDateTime(pub.detected_at)}
                      </p>
                      {pub.error_message && (
                        <p className="mt-2 text-xs text-rose-600">
                          {pub.error_message}
                        </p>
                      )}
                      {pub.source_url && (
                        <a
                          href={pub.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-primary-600 hover:underline"
                        >
                          Source document
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border bg-white dark:bg-gray-800 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Manual correction / approval
                </h3>
                <form onSubmit={onSubmitCorrection} className="space-y-3">
                  <label className="block text-sm">
                    <span className="text-gray-600">Fuel type</span>
                    <select
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      value={form.fuel_type}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          fuel_type: e.target.value,
                        }))
                      }
                    >
                      {fuelTypes.map((type) => (
                        <option key={type} value={type}>
                          {labels[type] || type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Price (PKR / litre)</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      value={form.price}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, price: e.target.value }))
                      }
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Effective date</span>
                    <input
                      type="date"
                      required
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      value={form.effective_date}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          effective_date: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="text-gray-600">Reason</span>
                    <textarea
                      required
                      minLength={5}
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                      rows={3}
                      value={form.reason}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, reason: e.target.value }))
                      }
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full rounded-lg bg-gray-900 text-white py-2.5 text-sm font-semibold disabled:opacity-60"
                  >
                    {isSaving ? "Saving…" : "Publish correction"}
                  </button>
                </form>
              </section>
            </div>

            <section className="rounded-xl border bg-white dark:bg-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Automation logs
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto text-sm">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="flex items-start justify-between gap-3 border-b border-gray-100 py-2"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {log.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(log.createdAt)} · {log.level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default FuelPricesAdmin;
