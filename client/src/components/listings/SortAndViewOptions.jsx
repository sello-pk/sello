import React, { useState, useCallback } from "react";
import { FiFilter, FiGrid, FiList, FiChevronDown } from "react-icons/fi";
import ListingsFilterDrawer from "./ListingsFilterDrawer";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "year-new", label: "Year: Newest" },
  { value: "year-old", label: "Year: Oldest" },
  { value: "mileage-low", label: "Mileage: Low to High" },
  { value: "mileage-high", label: "Mileage: High to Low" },
];

const SortAndViewOptions = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewChange,
  totalResults = 0,
  resultLabel = "cars",
  filterContent = null,
  activeFilterCount = 0,
  drawerTitle = "Filters",
}) => {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  const wrapFilterContent =
    typeof filterContent === "function"
      ? filterContent({ closeDrawer: close })
      : filterContent;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 mb-6 min-w-0 max-w-full overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 min-w-0 max-w-full">
          <div className="text-sm text-gray-600 min-w-0 shrink-0">
            <span className="font-semibold text-gray-900">{totalResults}</span>{" "}
            {totalResults === 1
              ? `${resultLabel.replace(/s$/, "")} found`
              : `${resultLabel} found`}
          </div>

          <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end sm:gap-3">
            <div className="relative w-full min-w-0 max-w-full sm:w-auto sm:min-w-[140px] sm:max-w-[240px]">
              <select
                value={sortBy}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-2 pr-8 text-sm font-medium text-gray-700 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer w-full min-w-0 box-border"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            {typeof onViewChange === "function" ? (
              <div className="flex items-center justify-center gap-0.5 border border-gray-300 rounded-lg p-1 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => onViewChange("grid")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="Grid View"
                >
                  <FiGrid size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onViewChange("list")}
                  className={`p-2 rounded transition-colors ${
                    viewMode === "list"
                      ? "bg-primary-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  title="List View"
                >
                  <FiList size={18} />
                </button>
              </div>
            ) : null}

            {wrapFilterContent ? (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 hover:border-primary-500 hover:text-primary-600 transition-colors shrink-0 self-start sm:self-auto"
                aria-haspopup="dialog"
                aria-expanded={open}
              >
                <FiFilter size={18} />
                <span>Filter</span>
                {activeFilterCount > 0 ? (
                  <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-500 px-1 text-[11px] font-bold text-white">
                    {activeFilterCount > 9 ? "9+" : activeFilterCount}
                  </span>
                ) : null}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {wrapFilterContent ? (
        <ListingsFilterDrawer open={open} onClose={close} title={drawerTitle}>
          <div className="pb-8">{wrapFilterContent}</div>
        </ListingsFilterDrawer>
      ) : null}
    </>
  );
};

export default SortAndViewOptions;
