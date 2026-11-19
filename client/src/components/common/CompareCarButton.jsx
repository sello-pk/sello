import { useDispatch, useSelector, useStore } from "react-redux";
import { Link } from "react-router-dom";
import { Check, Columns2 } from "lucide-react";
import toast from "react-hot-toast";
import { addComparisonCar, removeComparisonCar, setComparisonReplacement } from "../../redux/carCompareSlice.js";
import { COMPARE_LIMIT_MESSAGE, isComparableCar, listingId, MAX_COMPARE_CARS } from "../../utils/carCompare.js";
import { trackCompare } from "../ads/loadMarketingScripts.js";
import { modelCompareLink } from "../../utils/carCatalog.js";

export function CompareCarButton({ car, source }) {
  const dispatch = useDispatch();
  const store = useStore();
  const id = listingId(car?._id);
  const selected = useSelector((state) => state.carCompare.ids.includes(id));
  const replacing = useSelector((state) => state.carCompare.replacementId !== null);
  const full = useSelector((state) => state.carCompare.ids.length >= MAX_COMPARE_CARS);
  if (!isComparableCar(car) && !selected) return null;

  const label = selected ? "Added" : replacing ? "Use as replacement" : "Add to Compare";
  const Icon = selected ? Check : Columns2;

  return (
    <span className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1">
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={full && !selected && !replacing}
      aria-label={selected ? `Added, remove ${car.make || "car"} ${car.model || ""} from comparison` : label}
      className={`inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs font-semibold focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${selected ? "border-primary-300 bg-primary-50 text-slate-800" : "border-slate-200 bg-white text-slate-800 hover:border-primary-400"}`}
      onKeyDown={(event) => event.stopPropagation()}
      onClick={(event) => {
        event.stopPropagation();
        const before = store.getState().carCompare;
        const wasSelected = before.ids.includes(id);
        dispatch(wasSelected ? removeComparisonCar(id) : addComparisonCar(id));
        const after = store.getState().carCompare;
        if (before.ids === after.ids) {
          if (!wasSelected) toast.error(COMPARE_LIMIT_MESSAGE);
          return;
        }
        if (!wasSelected && before.replacementId) {
          trackCompare("compare_remove", { listing_id: before.replacementId, source: "replacement", selection_count: after.ids.length });
        }
        trackCompare(wasSelected ? "compare_remove" : "compare_add", {
          listing_id: id, make: car.make, model: car.model, source, selection_count: after.ids.length,
        });
      }}
    >
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
      {label}
    </button>
    {isComparableCar(car) && car.make && car.model && (
      <Link to={modelCompareLink(car)} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}
        className="inline-flex min-h-9 items-center rounded text-xs font-semibold text-slate-800 underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-primary-500">
        Compare model
      </Link>
    )}
    </span>
  );
}

export function CompareTray() {
  const { ids, replacementId } = useSelector((state) => state.carCompare);
  const dispatch = useDispatch();
  if (!ids.length) return null;
  return (
    <aside aria-label="Car comparison selection" className="fixed bottom-4 left-3 z-40 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-1 rounded-xl bg-slate-950 p-1 text-white shadow-xl sm:left-6">
      <Link to="/compare/listings" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-primary-400">
        <Columns2 aria-hidden="true" className="h-4 w-4" />
        Compare cars <span className="text-primary-300">({ids.length})</span>
      </Link>
      {replacementId && (
        <button className="min-h-10 rounded-lg px-2 text-xs underline" type="button" onClick={() => dispatch(setComparisonReplacement(null))}>
          Cancel replacement
        </button>
      )}
    </aside>
  );
}
