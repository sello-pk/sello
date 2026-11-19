import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/features/admin/AdminLayout";
import { useCompareImageUpload } from "../../hooks/useCompareImageUpload.js";
import { CompareReviews, CompareSettings } from "../../components/features/admin/CarCompareManagement.jsx";
import CatalogSelector from "../../components/common/CatalogSelector.jsx";
import { useAdminCatalogVariantsQuery, useArchiveCatalogVariantMutation, useSaveCatalogVariantMutation } from "../../redux/services/carCatalogApi.js";
import { versionLabel, withMake } from "../../utils/carCatalog.js";

const inputClass = "w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-950";
const action = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-950";
const empty = { name: "", generation: "", year: "", sourceUrl: "", verifiedAt: "", image: "", comparisonGroup: "", published: false, specifications: "{}", features: "{}", amount: "", upperAmount: "", priceType: "manufacturer", priceSource: "", priceDate: "", effectiveDate: "" };
const shortDate = (value) => value?.slice(0, 10) || "";
const textFields = [
  ["name", "Version name"], ["generation", "Generation"], ["year", "Model year", "number"], ["image", "Vehicle image URL", "url"],
  ["sourceUrl", "Specification source URL", "url"], ["verifiedAt", "Specifications verified on", "date"],
  ["comparisonGroup", "Curated comparison group"], ["amount", "Reference price (PKR)", "number"],
  ["upperAmount", "Upper price (optional, PKR)", "number"], ["priceSource", "Price source URL", "url"], ["priceDate", "Price verified on", "date"],
  ["effectiveDate", "Price effective date", "date"],
];

function fromVariant(record) {
  return {
    ...empty,
    name: record.name, generation: record.generation || "", year: record.year ?? "", image: record.image || "",
    sourceUrl: record.sourceUrl, verifiedAt: shortDate(record.verifiedAt), comparisonGroup: record.comparisonGroup || "",
    published: record.published, specifications: JSON.stringify(record.specifications || {}, null, 2),
    features: JSON.stringify(record.features || {}, null, 2), amount: record.price?.amount ?? "",
    upperAmount: record.price?.upperAmount ?? "", priceType: record.price?.type || "manufacturer",
    priceSource: record.price?.sourceUrl || "", priceDate: shortDate(record.price?.verifiedAt), effectiveDate: shortDate(record.price?.effectiveDate),
  };
}

export default function CarCatalogAdmin() {
  const [selection, setSelection] = useState(() => withMake(null));
  const [draft, setDraft] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQuery] = useState("");
  const modelId = selection.model?._id;
  const query = useAdminCatalogVariantsQuery({ modelId, q }, { skip: !modelId, refetchOnMountOrArgChange: true });
  const [save, saveState] = useSaveCatalogVariantMutation();
  const [archive, archiveState] = useArchiveCatalogVariantMutation();
  const [uploadImage, uploading] = useCompareImageUpload();
  const reset = () => { setDraft(empty); setEditing(null); setMessage(""); };
  const update = (key, value) => setDraft((previous) => ({ ...previous, [key]: value }));

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(searchInput.trim()), 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      const { name, generation, year, sourceUrl, verifiedAt, image, comparisonGroup, published, specifications, features, amount, upperAmount, priceType, priceSource, priceDate, effectiveDate } = draft;
      const body = {
        modelId, name, generation, year: year === "" ? null : Number(year), sourceUrl, verifiedAt, image, comparisonGroup, published,
        specifications: JSON.parse(specifications), features: JSON.parse(features),
        price: amount === "" ? null : { amount: Number(amount), upperAmount: upperAmount === "" ? null : Number(upperAmount), type: priceType, sourceUrl: priceSource, verifiedAt: priceDate, effectiveDate },
      };
      await save({ id: editing, body }).unwrap();
      reset();
      setMessage("Catalogue version saved.");
    } catch (error) {
      setMessage(error instanceof SyntaxError ? "Enter valid JSON for specifications and features." : error?.data?.message || "The version could not be saved.");
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto grid max-w-5xl gap-5 p-4 text-slate-950">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-bold">Car comparison catalogue</h1>
          <p className="my-3 text-sm">Select a model to manage its sourced versions. Manage makes and models through <Link className="underline" to="/admin/categories">Categories</Link>.</p>
          <CatalogSelector id="admin-catalogue" value={selection} onChange={(next) => { setSelection(next); reset(); }} showVariant={false} analytics={false} />
          {modelId && <label className="mt-4 grid gap-1 text-sm font-semibold">Search versions
            <input className={inputClass} value={searchInput} maxLength={80} onChange={(event) => setSearchInput(event.target.value)} />
          </label>}
          {query.isFetching && <p role="status" className="mt-3">Loading versions…</p>}
          {query.isError && <button className={action} type="button" onClick={query.refetch}>Retry loading versions</button>}
          {modelId && query.currentData?.length === 0 && <p className="mt-3 text-sm">This model has no catalogue versions.</p>}
          <ul className="mt-3 divide-y">
            {(query.currentData || []).map((version) => (
              <li key={version._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>{versionLabel(version)} · {version.published ? "Published" : "Draft"}</span>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={action} onClick={() => { setDraft(fromVariant(version)); setEditing(version._id); setMessage(""); }}>Edit</button>
                  {version.published && <button type="button" className={action} disabled={archiveState.isLoading} onClick={async () => {
                    try { await archive(version._id).unwrap(); reset(); setMessage("Version archived."); }
                    catch { setMessage("The version could not be archived."); }
                  }}>Archive</button>}
                </div>
              </li>
            ))}
          </ul>
        </section>
        {message && <p role="status" className="rounded-xl bg-white p-4">{message}</p>}
        {modelId && (
          <form onSubmit={submit} className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">{editing ? "Edit version" : "Add version"}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {textFields.map(([key, label, type = "text"]) => (
                <label key={key} className="grid gap-1 text-sm font-semibold">{label}
                  <input className={inputClass} type={type} value={draft[key]} onChange={(event) => update(key, event.target.value)}
                    step={key === "amount" || key === "upperAmount" ? "any" : undefined}
                    required={["name", "sourceUrl", "verifiedAt"].includes(key) || Boolean(draft.amount && ["priceSource", "priceDate"].includes(key))} />
                </label>
              ))}
              <label className="grid gap-1 text-sm font-semibold">Upload vehicle image
                <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading.isLoading} onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try { update("image", await uploadImage(file)); }
                  catch { setMessage("Vehicle image upload failed."); }
                }} />
              </label>
              <label className="grid gap-1 text-sm font-semibold">Price type
                <select className={inputClass} value={draft.priceType} onChange={(event) => update("priceType", event.target.value)}>
                  <option value="manufacturer">Manufacturer reference</option><option value="ex_factory">Official ex-factory</option><option value="dealer">Dealer reference</option><option value="sello_new">Sello new-car price</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" checked={draft.published} onChange={(event) => update("published", event.target.checked)} /> Publish version
              </label>
            </div>
            <p className="mt-4 text-sm">Use the same comparison group name on two or three published versions to display them together in Hot Car Comparisons.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">Specifications (JSON)
                <textarea className={`${inputClass} font-mono`} rows={6} value={draft.specifications} placeholder={'{"engineCapacityCc": 1498}'} onChange={(event) => update("specifications", event.target.value)} />
                <span className="text-xs font-normal">Use normalized units in field names, such as engineCapacityCc, lengthMm, and batteryKwh.</span>
              </label>
              <label className="grid gap-1 text-sm font-semibold">Features (JSON)
                <textarea className={`${inputClass} font-mono`} rows={6} value={draft.features} placeholder={'{"abs": "standard", "sunroof": "optional"}'} onChange={(event) => update("features", event.target.value)} />
                <span className="text-xs font-normal">Values are standard, optional, unavailable, or notApplicable. Omit unknown features.</span>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" disabled={saveState.isLoading || uploading.isLoading} className="rounded-lg bg-primary-500 px-4 py-2 font-semibold">{saveState.isLoading ? "Saving…" : "Save version"}</button>
              {editing && <button type="button" className={action} onClick={reset}>Cancel</button>}
            </div>
          </form>
        )}
        <CompareReviews variantId={editing} />
        <CompareSettings />
      </div>
    </AdminLayout>
  );
}
