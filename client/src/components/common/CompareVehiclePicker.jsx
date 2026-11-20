import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { withMake, withModel } from "../../utils/carCatalog.js";

const control = "rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary-500";

function PickerStep({ title, visible, entries, selected, disabledText, query, getLabel, onSelect, children }) {
  const [search, setSearch] = useState("");
  const heading = useRef(null);
  const term = search.trim().toLowerCase();
  const shown = entries.filter((entry) => getLabel(entry).toLowerCase().includes(term));
  useEffect(() => {
    if (!visible) return;
    const frame = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [visible]);
  return (
    <section className={`${visible ? "flex" : "hidden"} min-h-0 min-w-0 flex-col p-4 md:flex`}>
      <h3 ref={heading} tabIndex={-1} className="mb-2 font-bold">{title}</h3>
      {children}
      {disabledText ? <p className="text-sm text-slate-600">{disabledText}</p> : <>
        <input className={`${control} mb-2 w-full bg-white/80 font-normal`} aria-label={`Search ${title.toLowerCase()}`} placeholder="Search…" value={search} onChange={(event) => setSearch(event.target.value)} />
        {query.isLoading && <p role="status" className="py-2 text-sm">Loading…</p>}
        {query.isError && <button type="button" className="self-start py-2 text-sm font-semibold underline" onClick={query.refetch}>Retry loading {title.toLowerCase()} options</button>}
        {!query.isFetching && !query.isError && !shown.length && <p className="py-2 text-sm text-slate-600">{search ? "No matches." : "No options available."}</p>}
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {shown.map((entry) => (
            <li key={entry._id}>
              <button type="button" aria-pressed={entry._id === selected?._id} className="flex min-h-11 w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500 aria-pressed:bg-primary-100 aria-pressed:font-semibold" onClick={() => onSelect(entry)}>
                <span className="break-words">{getLabel(entry)}</span>
                {entry._id === selected?._id ? <Check aria-hidden="true" size={16} className="shrink-0" /> : title !== "Year" && <ChevronRight aria-hidden="true" size={16} className="shrink-0 text-slate-500" />}
              </button>
            </li>
          ))}
        </ul>
      </>}
    </section>
  );
}

export default function CompareVehiclePicker({ value, onSave, onClose, vehicleCategories }) {
  const dialog = useRef(null);
  const [draft, setDraft] = useState(value);
  const [year, setYear] = useState(value.variant?.year || value.year || "");
  const [step, setStep] = useState(value.model ? 2 : value.make ? 1 : 0);
  const { makes, getModelsByMake, carCategoriesQuery: categories } = vehicleCategories;
  const currentYear = new Date().getFullYear();
  const configuredYears = vehicleCategories.years.map((item) => Number(item.name)).filter((n) => Number.isInteger(n) && n >= 1900 && n <= currentYear + 1);
  const yearOptions = [...new Set([...(configuredYears.length ? configuredYears : Array.from({ length: currentYear - 1900 + 1 }, (_, index) => currentYear - index)), ...(year ? [Number(year)] : [])])].sort((a,b) => b-a).map((n) => ({ _id: n, name: String(n) }));
  const models = getModelsByMake[draft.make?._id] || [];
  const selection = draft.model && year ? { ...draft, year: Number(year), variant: draft.variant?.year === Number(year) ? draft.variant : null } : null;

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog ref={dialog} aria-labelledby="compare-picker-title" className="fixed inset-0 m-auto w-[calc(100%-1.5rem)] max-w-4xl overflow-hidden rounded-2xl border border-white/70 bg-white/75 text-slate-950 shadow-2xl backdrop-blur-2xl backdrop:bg-slate-950/35" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
        <header className="flex items-center justify-between border-b border-white/60 bg-white/25 p-4">
          <h2 id="compare-picker-title" className="text-lg font-bold">Choose a car</h2>
          <button type="button" aria-label="Close car picker" className={control} onClick={onClose}><X size={18} aria-hidden="true" /></button>
        </header>
        <div className="grid grid-cols-3 gap-1 p-2 md:hidden" aria-label="Selection steps">
          {["Make", "Model", "Year"].map((label, index) => (
            <button key={label} type="button" aria-current={step === index ? "step" : undefined} disabled={(index === 1 && !draft.make) || (index === 2 && !draft.model)} className={`${control} px-1 disabled:opacity-50 ${step === index ? "bg-primary-100" : ""}`} onClick={() => setStep(index)}>{label}</button>
          ))}
        </div>
        <div className="grid h-[min(25rem,55dvh)] min-h-0 md:grid-cols-3 md:divide-x md:divide-white/60">
          <PickerStep title="Make" visible={step === 0} entries={makes} selected={draft.make} query={categories} getLabel={(entry) => entry.name} onSelect={(make) => { if (make._id !== draft.make?._id) { setDraft(withMake(make)); setYear(""); } setStep(1); }} />
          <PickerStep key={draft.make?._id ?? "model"} title="Model" visible={step === 1} entries={models} selected={draft.model} disabledText={!draft.make && "Choose a make first."} query={categories} getLabel={(entry) => entry.name} onSelect={(model) => { if (model._id !== draft.model?._id) { setDraft(withModel(draft, model)); setYear(""); } setStep(2); }} />
          <PickerStep key={draft.model?._id ?? "year"} title="Year" visible={step === 2} entries={yearOptions} selected={{ _id: Number(year) }} disabledText={!draft.model && "Choose a model first."} query={{}} getLabel={(entry) => entry.name} onSelect={(entry) => setYear(entry._id)} />
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/60 bg-white/25 p-4">
          <p role="status" className="text-sm text-slate-600">{[draft.make?.name, draft.model?.name, year].filter(Boolean).join(" · ") || "Choose a make and model."}</p>
          <button type="button" className={`${control} bg-primary-500 text-slate-950 disabled:opacity-50`} disabled={!selection} onClick={() => onSave(selection)}>Done</button>
        </footer>
      </div>
    </dialog>
  );
}
