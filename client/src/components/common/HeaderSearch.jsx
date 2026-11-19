import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CarFront, Clock3, Search, X } from "lucide-react";
import { useGetFilteredCarsQuery } from "../../redux/services/api";
import { formatPrice } from "../../utils/formatters";
import { buildCarUrl, buildListingsSearchUrl } from "../../utils/urlBuilders";
import { Image } from "../ui/Image";

const quickSearches = ["Honda Civic", "Toyota Corolla", "Suzuki Alto", "Honda City"];
const recentKey = "sello_recent_listing_searches";

function readRecentSearches() {
  try {
    const saved = JSON.parse(localStorage.getItem(recentKey));
    return Array.isArray(saved) ? saved.filter((entry) => typeof entry === "string" && entry.length >= 2 && entry.length <= 100).slice(0, 5) : [];
  } catch {
    return [];
  }
}

export default function HeaderSearch({ onClose }) {
  const navigate = useNavigate();
  const dialog = useRef(null);
  const input = useRef(null);
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [recent, setRecent] = useState(readRecentSearches);
  const term = value.trim();
  const ready = term.length >= 2 && term === debounced;
  const results = useGetFilteredCarsQuery({ search: debounced, page: 1, limit: 6 }, { skip: !ready });
  const cars = results.currentData?.cars ?? [];
  const searchUrl = buildListingsSearchUrl({ search: term });
  const total = Number(results.currentData?.total) || cars.length;

  const finishSearch = () => {
    try {
      localStorage.setItem(recentKey, JSON.stringify([term, ...recent.filter((entry) => entry.toLowerCase() !== term.toLowerCase())].slice(0, 5)));
    } catch {
      // Search still works when browser storage is unavailable.
    }
    onClose();
  };

  const suggest = (suggestion) => {
    setValue(suggestion);
    setDebounced(suggestion);
    input.current?.focus();
  };

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(term), 300);
    return () => clearTimeout(timeout);
  }, [term]);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    input.current?.focus();
    return () => element.close();
  }, []);

  const moveFocus = (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const controls = [input.current, ...dialog.current.querySelectorAll("[data-search-result]")];
    const index = controls.indexOf(event.target);
    if (index < 0 || controls.length < 2) return;
    event.preventDefault();
    const next = index + (event.key === "ArrowDown" ? 1 : -1);
    controls[(next + controls.length) % controls.length]?.focus();
  };

  return (
    <dialog ref={dialog} aria-labelledby="header-search-title" className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden overscroll-none bg-transparent p-0 backdrop:bg-slate-950/65" onCancel={(event) => {
      event.preventDefault();
      onClose();
    }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={moveFocus}>
      <div className="mx-auto flex h-dvh w-full max-w-xl flex-col bg-white text-slate-950 shadow-2xl sm:mt-[min(12vh,6rem)] sm:h-auto sm:max-h-[82dvh] sm:w-[calc(100%-2rem)] sm:rounded-2xl">
        <header className="flex items-center gap-2 border-b border-slate-200 p-3 sm:p-4">
          <h2 id="header-search-title" className="sr-only">Search listings</h2>
          <form role="search" className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-slate-100 px-3 focus-within:ring-2 focus-within:ring-primary-500" onSubmit={(event) => {
            event.preventDefault();
            if (term.length >= 2) {
              finishSearch();
              navigate(searchUrl);
            }
          }}>
            <button type="submit" aria-label="Submit search" className="shrink-0 rounded p-1 text-slate-600 focus-visible:ring-2 focus-visible:ring-primary-500"><Search size={20} aria-hidden="true" /></button>
            <input ref={input} type="search" autoComplete="off" maxLength={100} value={value} onChange={(event) => setValue(event.target.value)} aria-label="Search by make, model, or keyword" placeholder="Search by make or model" className="min-h-11 min-w-0 flex-1 bg-transparent text-base outline-none [&::-webkit-search-cancel-button]:hidden" />
            {value && <button type="button" aria-label="Clear search" className="rounded-md p-1.5 text-slate-600 hover:bg-white focus-visible:ring-2 focus-visible:ring-primary-500" onClick={() => { setValue(""); input.current?.focus(); }}><X size={16} aria-hidden="true" /></button>}
          </form>
          <button type="button" aria-label="Close search" className="rounded-lg p-2 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500" onClick={onClose}><X size={20} aria-hidden="true" /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {!term ? (
            <div className="space-y-5">
              {recent.length > 0 && <section aria-labelledby="recent-listing-searches">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h3 id="recent-listing-searches" className="text-sm font-semibold text-slate-700">Recent searches</h3>
                  <button type="button" className="rounded px-2 py-1.5 text-xs font-semibold underline focus-visible:ring-2 focus-visible:ring-primary-500" onClick={() => {
                    try { localStorage.removeItem(recentKey); } catch { /* Storage is optional. */ }
                    setRecent([]);
                    input.current?.focus();
                  }}>Clear history</button>
                </div>
                <ul>{recent.map((entry) => <li key={entry}>
                  <button type="button" data-search-result="" onClick={() => suggest(entry)} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-2 text-left text-sm hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500">
                    <Clock3 aria-hidden="true" size={16} className="shrink-0 text-slate-500" /><span className="min-w-0 break-words">{entry}</span>
                  </button>
                </li>)}</ul>
              </section>}
              <section aria-label="Quick searches">
              <h3 className="mb-2 text-sm font-semibold text-slate-700">Quick searches</h3>
              <ul className="flex flex-wrap gap-2">
                {quickSearches.map((suggestion) => <li key={suggestion}>
                  <button type="button" data-search-result="" className="min-h-10 rounded-lg border border-slate-200 px-3 text-sm font-medium hover:border-primary-500 hover:bg-primary-50 focus-visible:ring-2 focus-visible:ring-primary-500" onClick={() => suggest(suggestion)}>{suggestion}</button>
                </li>)}
              </ul>
              </section>
            </div>
          ) : term.length < 2 ? <p className="text-sm text-slate-600">Type one more character to search.</p>
            : !ready || (results.isFetching && !results.currentData) ? <p role="status" className="text-sm text-slate-600">Searching listings…</p>
              : results.isError ? <div role="status" className="flex flex-wrap items-center gap-3 text-sm">
                <p>Live results could not be loaded.</p>
                <button type="button" className="font-semibold underline" onClick={results.refetch}>Retry</button>
              </div> : cars.length ? (
                <>
                  <p role="status" className="mb-2 text-xs font-medium text-slate-600">{cars.length} of {formatPrice(total)} matching listings</p>
                  <ul className="space-y-1">
                    {cars.map((car) => (
                      <li key={car._id}>
                        <Link to={buildCarUrl(car)} onClick={finishSearch} data-search-result="" className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500">
                          <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-500">
                            {car.images?.[0] ? <Image src={car.images[0]} alt="" lazy className="h-full w-full object-cover" /> : <CarFront aria-hidden="true" size={20} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block break-words text-sm font-semibold">{car.title || [car.make, car.model, car.year].filter(Boolean).join(" ") || "Vehicle listing"}</span>
                            <span className="block text-xs text-slate-600">{[car.city, Number(car.price) > 0 && `PKR ${formatPrice(car.price)}`].filter(Boolean).join(" · ")}</span>
                          </span>
                          <ArrowRight size={16} aria-hidden="true" className="shrink-0 text-slate-500" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : <p role="status" className="text-sm text-slate-600">No matches. Try a shorter make or model name.</p>}
        </div>
        {term.length >= 2 && <footer className="border-t border-slate-200 p-4 sm:px-5">
          <Link data-search-result="" to={searchUrl} onClick={finishSearch} className="flex items-center justify-between gap-3 rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-primary-400 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2">
            View all results <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </footer>}
      </div>
    </dialog>
  );
}
