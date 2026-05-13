import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X, Search } from "lucide-react";

const SearchableSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  isLoading = false,
  grouped = false,
  className = "",
  required = false,
  compact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;

    const term = searchTerm.toLowerCase();
    if (grouped) {
      return options
        .map((group) => ({
          ...group,
          options: group.options.filter((option) =>
            option.label.toLowerCase().includes(term),
          ),
        }))
        .filter((group) => group.options.length > 0);
    } else {
      return options.filter((option) =>
        option.label.toLowerCase().includes(term),
      );
    }
  }, [options, searchTerm, grouped]);

  // Get flattened options for keyboard navigation
  const flatOptions = React.useMemo(() => {
    if (grouped) {
      return filteredOptions.flatMap((group) => group.options);
    }
    return filteredOptions;
  }, [filteredOptions, grouped]);

  // Find selected option for display
  const selectedOption = React.useMemo(() => {
    if (!value) return null;

    if (grouped) {
      for (const group of options) {
        const found = group.options.find((option) => option.value === value);
        if (found) return found;
      }
    } else {
      return options.find((option) => option.value === value);
    }
    return null;
  }, [value, options, grouped]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (option) => {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm("");
      setHighlightedIndex(-1);
    },
    [onChange],
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case "Escape":
          setIsOpen(false);
          setSearchTerm("");
          setHighlightedIndex(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev + 1;
            return next < flatOptions.length ? next : prev;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => {
            const next = prev - 1;
            return next >= 0 ? next : 0;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && flatOptions[highlightedIndex]) {
            handleSelect(flatOptions[highlightedIndex]);
          }
          break;
      }
    },
    [isOpen, highlightedIndex, flatOptions, handleSelect],
  );

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (!disabled && !isLoading) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
        setHighlightedIndex(-1);
      }
    }
  };

  const renderOption = (option, index, isGrouped = false) => {
    const globalIndex = isGrouped
      ? flatOptions.findIndex((opt) => opt.value === option.value)
      : index;
    const isHighlighted = globalIndex === highlightedIndex;

    return (
      <div
        key={option.value}
        className={`px-3 py-2 cursor-pointer transition-colors ${
          isHighlighted ? "bg-primary-50 text-primary-600" : "hover:bg-gray-50"
        } ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => !option.disabled && handleSelect(option)}
        onMouseEnter={() => setHighlightedIndex(globalIndex)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm">{option.label}</span>
          {option.description && (
            <span className="text-xs text-gray-500 ml-2">
              {option.description}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderGroupedOptions = () => {
    return filteredOptions.map((group) => (
      <div key={group.label}>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
          {group.label}
        </div>
        {group.options.map((option, optionIndex) =>
          renderOption(option, optionIndex, true),
        )}
      </div>
    ));
  };

  const renderFlatOptions = () => {
    return filteredOptions.map((option, index) =>
      renderOption(option, index, false),
    );
  };

  return (
    <div
      className={`relative min-w-0 max-w-full ${className}`}
      ref={dropdownRef}
      style={{ zIndex: isOpen ? 10 : "auto" }}
    >
      {label && (
        <label
          className={`block mb-1 text-sm font-medium text-gray-700 ${compact ? "text-xs" : ""}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`relative w-full min-w-0 max-w-full border border-gray-300 rounded-lg bg-white cursor-pointer transition-all ${
          disabled ? "bg-gray-100 cursor-not-allowed opacity-50" : ""
        } ${isOpen ? "ring-2 ring-primary-500 border-primary-500" : "hover:border-gray-400"} ${compact ? "px-2 py-1 h-9" : "px-3 py-2"}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center justify-between min-w-0 gap-2">
          <div className="flex-1 min-w-0 truncate">
            {selectedOption ? (
              <span
                className={`block truncate text-gray-900 ${compact ? "text-xs" : "text-sm"}`}
              >
                {selectedOption.label}
              </span>
            ) : (
              <span
                className={`block truncate text-gray-500 ${compact ? "text-xs" : "text-sm"}`}
              >
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            {value && !disabled && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                tabIndex={-1}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  isOpen ? "transform rotate-180" : ""
                }`}
              />
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className={`absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden ${compact ? "max-h-48" : "max-h-60"}`}
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1);
                }}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto" role="listbox">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                No results found
              </div>
            ) : grouped ? (
              renderGroupedOptions()
            ) : (
              renderFlatOptions()
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
