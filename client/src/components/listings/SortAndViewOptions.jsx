import React from "react";
import { FiGrid, FiList, FiChevronDown } from "react-icons/fi";

const SortAndViewOptions = ({
  sortBy,
  onSortChange,
  viewMode,
  onViewChange,
  totalResults = 0,
  resultLabel = "cars",
}) => {
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "year-new", label: "Year: Newest" },
    { value: "year-old", label: "Year: Oldest" },
    { value: "mileage-low", label: "Mileage: Low to High" },
    { value: "mileage-high", label: "Mileage: High to Low" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6 min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 min-w-0">
        {/* Results Count */}
        <div className="text-sm text-gray-600 min-w-0 shrink-0">
          <span className="font-semibold text-gray-900">{totalResults}</span>{" "}
          {totalResults === 1
            ? `${resultLabel.replace(/s$/, "")} found`
            : `${resultLabel} found`}
        </div>

        {/* Sort and View Options */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto min-w-0">
          {/* Sort Dropdown */}
          <div className="relative flex-1 min-w-0 sm:flex-initial sm:min-w-[140px]">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-3 sm:px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer w-full min-w-0"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-0.5 border border-gray-300 rounded-lg p-1 shrink-0">
            <button
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
        </div>
      </div>
    </div>
  );
};

export default SortAndViewOptions;

