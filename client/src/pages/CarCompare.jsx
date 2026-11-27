import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { CarFront, Check, ChevronRight, LoaderCircle, Minus, Plus, X } from 'lucide-react';
import SEO from '../components/common/SEO';
import VehicleSelector from '../components/compare/VehicleSelector';
import {
  useCompareCatalogQuery, useCompareConfigQuery, useCompareResultsMutation,
  useCompareResearchMutation, useCompareRecommendationMutation,
} from '../redux/services/compareApi';
import {
  basicFields, featureFields, fuelFields, electricFields, priceFields, defaultCompareContent,
} from '../constants/carCompare.js';

const emptyVehicle = () => ({ makeId: '', modelId: '', yearId: '', variant: '', fuelType: '', transmission: '' });
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
      row.fuelType,
      row.transmission,
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
          (row.variant === undefined || typeof row.variant === "string") &&
          typeof row.fuelType === 'string' &&
          typeof row.transmission === 'string',
      )
    )
      return rows.map((row) => ({
        makeId: row.makeId,
        modelId: row.modelId,
        yearId: row.yearId,
        variant: row.variant || "",
        fuelType: row.fuelType,
        transmission: row.transmission,
      }));
  } catch {
    /* Invalid share URLs start with an empty form. */
  }
  return null;
}
const researchMessages = {
  waiting: "Collecting Pakistan-market sources and extracting specs…",
  not_configured:
    "JAG9 research is not configured on the server. Set JAG9_API_KEY, JAG9_BASE_URL and JAG9_MODEL.",
  ai_credentials:
    "Research provider authentication failed. Provider calls are paused until credentials are fixed.",
  ai_capacity: "Research is temporarily limited. Please retry shortly.",
  ai_quota: "Research provider quota is exhausted. Provider calls are paused.",
  ai_unavailable: "Research provider is temporarily unavailable.",
  timeout: "Research timed out. You can retry this vehicle.",
  failed: "Research could not finish. Please try again.",
  no_data:
    "Reliable information for this Pakistan-market selection could not be established.",
  ai_incomplete: "Research returned an incomplete response. Please retry.",
  search_unavailable:
    "No usable Pakistan-market source pages could be fetched for this selection.",
};
function friendlyError(error) {
  if (error?.status === 404 || error?.originalStatus === 404)
    return "The comparison service has not been deployed to the connected API yet.";
  if (error?.status === 429)
    return "Too many research requests. Please wait a minute and retry.";
  if (error?.status === 'TIMEOUT_ERROR')
    return 'The comparison request timed out. Please try again.';
  const apiMessage = typeof error?.data?.message === 'string' ? error.data.message.trim() : '';
  if (apiMessage) return apiMessage;
  if (import.meta.env.DEV && (error?.status === 'FETCH_ERROR' || error?.status >= 500 || error?.originalStatus >= 500))
    return 'The local comparison API is unavailable. Check that the SELLO server is running and reachable, then try again.';
  return "The comparison service could not be reached. Please try again.";
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

const action = 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 py-3 font-bold text-[#0A1025] hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60';
const number = value => value.toLocaleString('en-PK');
const vehicleName = ({ make, model, year }) => `${make} ${model} ${year}`;
const isElectric = vehicle => vehicle.fuelType === 'Electric (EV)';
const isElectrified = vehicle => isElectric(vehicle) || vehicle.fuelType === 'Plug-in Hybrid (PHEV)';
const sourceName = url => new URL(url).hostname.replace(/^www\./, '');

function Value({ entry, type, unit, loading, applicable = true }) {
  if (!applicable) return <span className="text-slate-500">Not applicable</span>;
  if (loading) return <span className="text-slate-500">Researching…</span>;
  if (!entry?.sourceUrl || entry.value === 'NOT_VERIFIED') {
    return <span className="inline-flex items-center gap-1.5 text-slate-500"><Minus size={14} aria-hidden="true" />Not Verified</span>;
  }
  const { value } = entry;
  const priceLabel = { current: 'Current', historical: 'Historical', undated: 'Date unverified', estimate: 'Estimated' }[entry.priceKind];
  return (
    <div>
      {type === 'feature' ? (
        value === 'YES'
          ? <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700"><Check size={16} aria-hidden="true" />Yes</span>
          : <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700"><X size={16} aria-hidden="true" />No</span>
      ) : (
        <span className="font-medium">
          {type === 'range' ? `PKR ${value.map(number).join('–')}`
            : type === 'price' ? `PKR ${number(value)}`
            : typeof value === 'number' ? `${number(value)} ${unit || ''}` : value}
        </span>
      )}
      {entry.basis && <div className="text-xs text-slate-600">{entry.basis === 'manufacturer' ? 'Manufacturer claimed' : 'Real-world'}</div>}
      {priceLabel && <div className="text-xs text-slate-600">{priceLabel}{entry.asOf ? ` · ${entry.asOf}` : ''}</div>}
      <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Source from ${sourceName(entry.sourceUrl)}`} className="text-xs font-medium text-slate-600 underline decoration-[#E5B100] underline-offset-2">Source</a>
    </div>
  );
}

function ResultTable({ title, fields, rows, selected, economy = false }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <h2 className="px-4 py-4 text-lg font-bold sm:px-6">{title}</h2>
      <table className="w-full table-fixed border-collapse text-left text-sm">
        <caption className="sr-only">{title}</caption>
        <thead className="bg-[#0A1025] text-white">
          <tr>
            <th scope="col" className="w-[46%] px-4 py-3 sm:w-1/4 sm:px-6">{economy ? 'Metric' : 'Specification'}</th>
            {rows.map((row, index) => <th key={row.key} scope="col" className={`break-words px-3 py-3 sm:table-cell ${index === selected ? '' : 'hidden'}`}>{vehicleName(row)}{row.variant && <span className="block text-xs font-normal text-slate-300">{row.variant}</span>}</th>)}
          </tr>
        </thead>
        <tbody>
          {fields.map(([key, label, type, unit]) => (
            <tr key={key} className="border-b border-slate-100 last:border-0 even:bg-slate-50">
              <th scope="row" className="break-words px-4 py-3 font-medium sm:px-6">{label}{economy && <span className="block text-xs text-slate-500">{unit}</span>}</th>
              {rows.map((row, index) => (
                <td key={row.key} className={`break-words px-3 py-3 align-top sm:table-cell ${index === selected ? '' : 'hidden'}`}>
                  <Value entry={type === 'feature' ? row.features?.[key] : row.specs?.[key]} type={type} unit={unit} loading={row.research.status === 'waiting'}
                    applicable={
                      key === 'engineCc' ? !isElectric(row)
                        : key === 'batteryCapacity' ? isElectrified(row)
                        : !economy || (unit === 'km/L' ? !isElectric(row) : isElectrified(row))
                    } />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function CarCompare() {
  const location = useLocation();
  // Same local compare API as validation — avoids prod-/api vs local-:4000 catalog ID drift.
  const catalogQuery = useCompareCatalogQuery();
  const catalogRows = Array.isArray(catalogQuery.data) ? catalogQuery.data : [];
  const makes = useMemo(
    () => catalogRows.filter((row) => row.subType === 'make'),
    [catalogRows],
  );
  const years = useMemo(
    () => catalogRows.filter((row) => row.subType === 'year'),
    [catalogRows],
  );
  const getModelsByMake = useMemo(() => {
    const map = {};
    for (const row of catalogRows) {
      if (row.subType !== 'model') continue;
      const parent = String(row.parentCategory || '');
      if (!map[parent]) map[parent] = [];
      map[parent].push(row);
    }
    return map;
  }, [catalogRows]);
  const catalogLoading = catalogQuery.isLoading;
  const catalogError = catalogQuery.isError;
  const retryCatalog = () => catalogQuery.refetch();
  const { data: config } = useCompareConfigQuery();
  const [vehicles, setVehicles] = useState(() => readSelection(location.search) || [emptyVehicle(), emptyVehicle()]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [shareStatus, setShareStatus] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const active = useRef(null);
  const resultsRef = useRef(null);
  const [getResults] = useCompareResultsMutation();
  const [research] = useCompareResearchMutation();
  const [recommend] = useCompareRecommendationMutation();

  useEffect(() => () => {
    active.current?.forEach(request => request.abort());
    active.current = null;
  }, []);

  const changeVehicles = next => {
    active.current?.forEach(request => request.abort());
    active.current = null;
    setVehicles(next);
    setShareUrl('');
    setShareStatus('');
    setRows([]);
    setAnswer(null);
    setError('');
    setBusy(false);
    setSummarizing(false);
  };

  const researchRow = async (vehicle, index, requests) => {
    const request = research(vehicle);
    requests.push(request);
    try {
      const result = await request.unwrap();
      if (active.current === requests) setRows(previous => previous.map((row, pos) => pos === index ? result : row));
      return result;
    } catch (failure) {
      if (active.current === requests) setRows(previous => previous.map((row, pos) => pos === index
        ? { ...row, research: { status: 'failed' }, error: friendlyError(failure) }
        : row));
      return null;
    }
  };

  const summarize = async (results, requests) => {
    if (active.current !== requests) return;
    setBusy(false);
    const researched = results.filter(row => row?.researchId);
    if (researched.filter(row => row.research.found > 0).length < 2) {
      setAnswer({ text: '', reason: 'no_data' });
      return;
    }
    setSummarizing(true);
    const request = recommend({ researchIds: researched.map(row => row.researchId) });
    requests.push(request);
    try {
      const response = await request.unwrap();
      if (active.current === requests) setAnswer(response);
    } catch (failure) {
      if (active.current === requests) setAnswer({ text: '', error: friendlyError(failure) });
    } finally {
      if (active.current === requests) setSummarizing(false);
    }
  };

  const submit = async event => {
    event.preventDefault();
    if (busy || summarizing) return;
    if (vehicles.some(row => !row.makeId || !row.modelId || !row.yearId || !row.fuelType || !row.transmission)) {
      setError('Select a brand, model, year, fuel type and transmission for each vehicle.');
      return;
    }
    if (new Set(vehicles.map(row => selectionKey([row]))).size !== vehicles.length) {
      setError('Choose different vehicles, years or variants.');
      return;
    }
    const requests = [];
    active.current = requests;
    setBusy(true);
    setSelected(0);
    setShareStatus('');
    setRows([]);
    setError('');
    setAnswer(null);
    try {
      const request = getResults(vehicles);
      requests.push(request);
      const validated = await request.unwrap();
      if (active.current !== requests) return;
      setRows(validated);
      const slug = validated.map(row => `${vehicleName(row)} ${row.variant}`.trim()).join('-vs-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setShareUrl(new URL(`/cars/compare/${slug}?vehicles=${encodeURIComponent(JSON.stringify(vehicles))}`, window.location.origin).href);
      resultsRef.current?.scrollIntoView({ block: 'start' });
      const found = await Promise.all(vehicles.map((vehicle, index) => researchRow(vehicle, index, requests)));
      await summarize(found, requests);
    } catch (failure) {
      if (active.current === requests) {
        setBusy(false);
        setError(friendlyError(failure));
      }
    }
  };

  const retry = async index => {
    const requests = [];
    active.current = requests;
    setBusy(true);
    setAnswer(null);
    let baseline = [];
    setRows(previous => {
      baseline = previous.map((row, pos) => (
        pos === index
          ? { ...row, error: '', research: { status: 'waiting', found: 0, total: row.research?.total || featureFields.length } }
          : row
      ));
      return baseline;
    });
    const result = await researchRow(vehicles[index], index, requests);
    const merged = baseline.map((row, pos) => (pos === index ? (result || { ...row, research: { status: 'failed' }, error: row.error || researchMessages.failed }) : row));
    await summarize(merged, requests);
  };

  const allElectric = rows.length > 0 && rows.every(isElectric);
  const hasElectrified = rows.some(isElectrified);
  const economyFields = allElectric ? electricFields : hasElectrified ? [...fuelFields, ...electricFields] : fuelFields;
  const sources = [...new Set(rows.flatMap(row => [...Object.values(row.specs || {}), ...Object.values(row.features || {})].map(entry => entry.sourceUrl).filter(Boolean)))];

  return (
    <main className="min-h-screen bg-slate-50 pb-12 text-[#0A1025]">
      <SEO title={rows.length ? rows.map(vehicleName).join(' vs ') : 'Car Compare in Pakistan'}
        description="Compare Pakistan-market car specifications, features, fuel averages and prices with live research."
        canonical="https://sello.pk/cars/compare" robots={location.search ? 'noindex, follow' : 'index, follow'} />
      <header className="border-b-4 border-[#E5B100] bg-[#0A1025] text-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Compare cars</h1>
          <p className="mt-4 max-w-xl text-slate-300">Compare the specs, features, fuel averages and prices of up to three cars in Pakistan.</p>
        </div>
      </header>
      <div className="mx-auto -mt-6 max-w-6xl px-4 sm:px-6">
        <form onSubmit={submit} aria-label="Choose comparison vehicles" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Choose vehicles</h2>
            {vehicles.length === 2 && <button type="button" onClick={() => changeVehicles([...vehicles, emptyVehicle()])} className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Plus size={16} aria-hidden="true" />Add third car</button>}
          </div>
          {catalogError && <p role="alert" className="mt-3 text-sm text-rose-700">Could not load vehicle options. <button type="button" className="underline" onClick={retryCatalog}>Try again</button></p>}
          <div className={`mt-4 grid gap-4 sm:grid-cols-2 ${vehicles.length === 3 ? 'lg:grid-cols-3' : ''}`}>
            {vehicles.map((vehicle, index) => (
              <div key={index} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <VehicleSelector value={vehicle} index={index + 1} makes={makes} models={getModelsByMake[vehicle.makeId]} years={years} loading={catalogLoading}
                  onChange={value => changeVehicles(vehicles.map((row, pos) => pos === index ? value : row))} />
                {vehicles.length === 3 && <button type="button" className="mt-3 text-sm underline" onClick={() => changeVehicles(vehicles.filter((_, pos) => pos !== index))}>Remove vehicle {index + 1}</button>}
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button className={action} type="submit" disabled={busy || summarizing || catalogLoading || catalogError}>Compare cars <ChevronRight size={18} aria-hidden="true" /></button>
            {busy && <span role="status" className="inline-flex items-center gap-2 text-sm text-slate-600"><LoaderCircle size={18} aria-hidden="true" className="motion-safe:animate-spin" />{rows.length ? 'Researching selected vehicles…' : 'Checking vehicle selections…'}</span>}
          </div>
          {rows.length > 0 && shareUrl && (
            <div className="mt-3">
              <button type="button" className="text-sm font-semibold underline" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  setShareStatus('copied');
                } catch {
                  setShareStatus('manual');
                }
              }}>Copy comparison link</button>
              {shareStatus === 'copied' && <span role="status" className="ml-2 text-sm text-slate-600">Link copied</span>}
              {shareStatus === 'manual' && <input aria-label="Comparison link" readOnly value={shareUrl} onFocus={event => event.target.select()} className="mt-2 w-full rounded-lg border p-2 text-sm" />}
            </div>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
        </form>

        <div ref={resultsRef} className="scroll-mt-24">
          {rows.length > 0 && (
            <div className="mt-8 space-y-5">
              <section aria-label="Selected vehicles" className="grid grid-cols-2 gap-2 sm:gap-4" style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}>
                {rows.map((row, index) => (
                  <article key={row.key} className="min-w-0 break-words rounded-xl border border-slate-200 bg-white p-2.5 sm:p-5">
                    <CarFront size={22} className="mb-2 text-[#0A1025]" aria-hidden="true" />
                    <h2 className="text-sm font-bold sm:text-xl">{row.make} {row.model}</h2>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">{row.year} · {row.variant || 'Variant unspecified'}</p>
                    <p className="mt-1 text-xs font-medium text-slate-700">
                      <span className="text-slate-500">Selected:</span> {row.fuelType} · {row.transmission}
                    </p>
                    <dl className="mt-3 space-y-2 text-xs sm:text-sm">
                      {basicFields.filter(([key]) => ['engineCc', 'transmission', 'fuelType'].includes(key)).map(([key, label, type, unit]) => (
                        <div key={key}>
                          <dt className="text-slate-600">{key === 'engineCc' ? 'Engine' : `Researched ${label}`}</dt>
                          <dd>
                            <Value
                              entry={row.specs?.[key]}
                              type={type}
                              unit={unit}
                              loading={row.research.status === 'waiting'}
                              applicable={key !== 'engineCc' || !isElectric(row)}
                            />
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {researchMessages[row.research.status] && (
                      <div className="mt-3 border-t pt-2 text-xs text-slate-600">
                        <p role="status">{row.error || researchMessages[row.research.status]}</p>
                        {!['waiting', 'no_data'].includes(row.research.status) && <button type="button" disabled={busy || summarizing} onClick={() => retry(index)} className="mt-2 font-semibold underline disabled:opacity-50">Retry research</button>}
                      </div>
                    )}
                    {row.research.mismatch && (
                      <p role="alert" className="mt-3 border-t pt-2 text-xs font-medium text-amber-800">
                        Fuel type or transmission from research does not match your selection. Treat these specs as unverified until you check the cited source.
                      </p>
                    )}
                  </article>
                ))}
              </section>
              <div className="sticky top-16 z-10 rounded-xl border bg-white p-2 shadow-sm sm:hidden" role="group" aria-label="Vehicle shown in comparison tables">
                <div className="flex gap-1">
                  {rows.map((row, index) => <button type="button" key={row.key} aria-pressed={selected === index} onClick={() => setSelected(index)}
                    className={`min-w-0 flex-1 break-words rounded-lg px-1 py-2 text-xs font-semibold ${selected === index ? 'bg-[#0A1025] text-white' : 'bg-slate-100'}`}>{row.make} {row.model} {row.year}{row.variant && <span className="block">{row.variant}</span>}</button>)}
                </div>
              </div>
              <ResultTable title="Basic specifications" fields={basicFields} rows={rows} selected={selected} />
              <ResultTable title="Features comparison" fields={featureFields} rows={rows} selected={selected} />
              <ResultTable
                title={allElectric ? 'EV battery and range' : hasElectrified ? 'Fuel and EV energy' : 'Fuel averages'}
                fields={economyFields}
                rows={rows}
                selected={selected}
                economy
              />
              <ResultTable title="Price comparison" fields={priceFields} rows={rows} selected={selected} />
              <section className="rounded-2xl border-l-4 border-[#E5B100] bg-[#0A1025] p-5 text-white sm:p-6">
                <h2 className="text-lg font-bold">AI buying recommendation</h2>
                <p aria-live="polite" className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-200">
                  {answer?.text || answer?.error || (answer?.reason === 'expired' ? 'Research expired. Compare again for a new recommendation.'
                    : answer?.reason === 'no_data' ? 'No sourced specifications were verified yet, so a recommendation cannot be made.'
                    : answer?.reason === 'partial' ? 'Some vehicles are still missing sourced research. Review the tables above.'
                    : answer ? 'A recommendation is temporarily unavailable.'
                    : summarizing ? 'Preparing a recommendation…' : 'A recommendation will appear after research finishes.')}
                </p>
              </section>
              {sources.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h2 className="font-bold">Sources</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {sources.map((url, index) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer" className="inline-block break-all rounded-full border px-3 py-1 text-sm underline decoration-[#E5B100] underline-offset-2" aria-label={`Source ${index + 1} from ${sourceName(url)}`}>{sourceName(url)}</a></li>)}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
        <SeoSections sections={config?.sections || defaultCompareContent} />
      </div>
    </main>
  );
}
