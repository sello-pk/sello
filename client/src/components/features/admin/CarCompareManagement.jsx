import { useState } from "react";
import { useCompareImageUpload } from "../../../hooks/useCompareImageUpload.js";
import { comparisonArticles } from "../../../utils/compareEditorial.js";
import CompareEditorial from "../../common/CompareEditorial.jsx";
import { useCompareExperienceQuery, useCompareReviewsQuery, useSaveCompareExperienceMutation, useSaveCompareReviewMutation } from "../../../redux/services/carCatalogApi.js";

const panel = "grid gap-3 rounded-xl bg-white p-5 shadow-sm";
const button = "min-h-10 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold disabled:opacity-50";
const input = "min-h-10 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm";

function CompareSettingsEditor({ initial, aiOnly }) {
  const [research, setResearch] = useState(initial.research);
  const [summary, setSummary] = useState(initial.summary);
  const [articles, setArticles] = useState(initial.articles?.length === 4 ? initial.articles : comparisonArticles);
  const [preview, setPreview] = useState(false);
  const [notice, setNotice] = useState("");
  const [save, state] = useSaveCompareExperienceMutation();
  const [uploadImage, uploadState] = useCompareImageUpload();
  const update = (index, key, value) => setArticles((previous) => previous.map((article, position) => position === index ? { ...article, [key]: value } : article));
  const persist = async (publish) => {
    try {
      await save({ research, summary, ...(publish ? { articles } : {}) }).unwrap();
      setNotice(publish ? "Buying guides published." : "AI settings saved.");
    } catch (error) {
      setNotice(error?.data?.message || "The comparison settings could not be saved.");
    }
  };
  return <section className={panel} aria-label="Car Compare settings">
    <h2 className="text-xl font-bold">Car Compare settings</h2>
    <div className="flex flex-wrap gap-4 text-sm">
      <label><input type="checkbox" checked={research} onChange={(event) => setResearch(event.target.checked)} /> AI research</label>
      <label><input type="checkbox" checked={summary} onChange={(event) => setSummary(event.target.checked)} /> AI summary</label>
      <button className={button} type="button" disabled={state.isLoading} onClick={() => persist(false)}>Save AI settings</button>
    </div>
    {notice && <p role="status" className="text-sm">{notice}</p>}
    {!aiOnly && <details>
      <summary className="cursor-pointer font-semibold">Manage the four buying guides</summary>
      <form className="mt-3 grid gap-3" onSubmit={(event) => { event.preventDefault(); persist(true); }}>
        {articles.map((article, index) => <fieldset key={index} className="grid gap-2 rounded-lg border border-slate-200 p-3">
          <legend className="px-1 font-semibold">Guide {index + 1}</legend>
          <label>Title<input required maxLength={120} className={input} value={article.title} onChange={(event) => update(index, "title", event.target.value)} /></label>
          <label>Description<textarea required maxLength={1800} className={input} value={article.description} onChange={(event) => update(index, "description", event.target.value)} /></label>
          <label>Image alt text<input required maxLength={200} className={input} value={article.alt} onChange={(event) => update(index, "alt", event.target.value)} /></label>
          <label>Image URL<input required className={input} value={article.image} onChange={(event) => update(index, "image", event.target.value)} /></label>
          <label className="text-sm">Replace image<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadState.isLoading} className="block" onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try { update(index, "image", await uploadImage(file)); }
            catch { setNotice("Image upload failed."); }
          }} /></label>
        </fieldset>)}
        <div className="flex flex-wrap gap-2">
          <button className={button} type="button" onClick={() => setPreview(!preview)}>{preview ? "Hide preview" : "Preview guides"}</button>
          <button className={button + " bg-primary-500"} type="submit" disabled={state.isLoading || uploadState.isLoading}>Publish guides</button>
        </div>
        {preview && <CompareEditorial articles={articles.map((article, index) => ({ ...article, title: article.title || `Guide ${index + 1}` }))} />}
      </form>
    </details>}
  </section>;
}

function ReviewItem({ record, onReview, busy }) {
  const proposals = Object.fromEntries(Object.entries(record.proposals || {}).map(([key, field]) => [key, field.value]));
  const [json, setJson] = useState(() => JSON.stringify({ ...proposals, ...record.approved }, null, 2));
  const review = (action, values) => onReview(record.variantId, action, values, record.updatedAt);
  return <details className="rounded-lg border border-slate-200 p-3">
    <summary className="cursor-pointer font-semibold">{record.identity} · {record.status}</summary>
    <p className="mt-2 text-sm">Updated {record.updatedAt?.slice(0, 10)}{record.researchedAt && ` · Researched ${record.researchedAt.slice(0, 10)}`}</p>
    {record.requested?.length > 0 && <p className="text-sm">Still missing from research: {record.requested.filter((key) => !(key in proposals) && !(key in (record.approved || {}))).join(", ") || "None"}</p>}
    {Object.entries(record.proposals || {}).map(([key, field]) => <p key={key} className="break-all text-xs">{key}: {String(field.value)} · {field.origin} · {field.sourceUrl}</p>)}
    <label className="mt-2 block text-sm">Specifications and features (JSON)<textarea className={input + " font-mono"} rows={6} value={json} onChange={(event) => setJson(event.target.value)} /></label>
    <div className="my-2 flex flex-wrap gap-2">
      {record.status === "pending" && <>
        <button type="button" disabled={busy} className={button} onClick={() => review("approve")}>Approve</button>
        <button type="button" disabled={busy} className={button} onClick={() => review("reject")}>Reject</button>
      </>}
      <button type="button" disabled={busy} className={button} onClick={() => review("manual", json)}>Edit and save</button>
      {!Object.keys(record.approved || {}).length && <button type="button" disabled={busy} className={button} onClick={() => {
        if (window.confirm("Permanently delete this unapproved comparison review?")) review("delete");
      }}>Delete</button>}
    </div>
    {!!record.history?.length && <details><summary>Review history</summary>
      <ul className="text-xs">{record.history.map((item, index) => <li key={index}>{item.at?.slice(0, 10)} · {item.action} · {item.by} · {Object.keys(item.values || {}).join(", ")}</li>)}</ul>
    </details>}
  </details>;
}

export function CompareReviews({ variantId }) {
  const [status, setStatus] = useState("pending");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [manual, setManual] = useState("{}");
  const [notice, setNotice] = useState("");
  const reviews = useCompareReviewsQuery({ status, q: query });
  const [save, state] = useSaveCompareReviewMutation();
  const review = async (id, action, json, version) => {
    try {
      await save({ id, action, version, ...(json ? { values: JSON.parse(json) } : {}), ...(action === "delete" ? { confirm: true } : {}) }).unwrap();
      setNotice("Review saved.");
    } catch (error) {
      setNotice(error instanceof SyntaxError ? "Enter valid JSON." : error?.data?.message || "The review could not be saved.");
    }
  };
  return <section className={panel}>
    <h2 className="text-xl font-bold">Pending AI data and review history</h2>
    <form className="flex flex-wrap items-end gap-2" onSubmit={(event) => { event.preventDefault(); setQuery(search.trim()); }}>
      <label className="text-sm">Status<select className={input} value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="pending">Pending review</option><option value="approved">Approved</option><option value="manual">Manually updated</option><option value="rejected">Rejected</option><option value="">All</option>
      </select></label>
      <label className="text-sm">Brand, model, year or version<input className={input} maxLength={100} value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <button className={button} type="submit">Search</button>
    </form>
    {reviews.isFetching && <p role="status">Loading reviews…</p>}
    {reviews.isError && <button className={button} type="button" onClick={reviews.refetch}>Retry reviews</button>}
    {notice && <p role="status">{notice}</p>}
    {reviews.currentData?.length === 0 && <p>No reviews match this filter.</p>}
    {(reviews.currentData || []).map((record) => <ReviewItem key={`${record._id}:${record.updatedAt}`} record={record} onReview={review} busy={state.isLoading} />)}
    {variantId && <details>
      <summary>Manually add specifications to the version being edited</summary>
      <label className="mt-2 block text-sm">Field values (JSON)<textarea className={input + " font-mono"} value={manual} onChange={(event) => setManual(event.target.value)} /></label>
      <button className={button} disabled={state.isLoading} type="button" onClick={() => review(variantId, "manual", manual)}>Save approved specifications</button>
    </details>}
  </section>;
}

export function CompareSettings({ aiOnly = false }) {
  const settings = useCompareExperienceQuery();
  if (settings.isError) return <button className={button} type="button" onClick={settings.refetch}>Retry Car Compare settings</button>;
  if (!settings.data) return <p role="status">Loading Car Compare settings…</p>;
  return <CompareSettingsEditor initial={settings.data} aiOnly={aiOnly} />;
}
