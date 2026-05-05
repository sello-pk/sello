import React, { useState, useEffect } from "react";
import {
  IoBookmarkOutline as Bookmark,
  IoTrashOutline as Trash,
  IoPlayOutline as Play,
} from "react-icons/io5";

const STORAGE_KEY = "sello_auction_saved_searches_v1";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSaved(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/**
 * Inspiration: SavedSearches — persist filter presets for live auction.
 */
export default function AuctionSavedSearches({
  filters,
  searchQuery,
  onApply,
  className = "",
}) {
  const [saved, setSaved] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    setSaved(loadSaved());
  }, []);

  const persist = (next) => {
    setSaved(next);
    saveSaved(next);
  };

  const handleSave = () => {
    const label = name.trim() || `Saved ${saved.length + 1}`;
    const entry = {
      id: `s_${Date.now()}`,
      name: label,
      filters: { ...filters },
      searchQuery: searchQuery || "",
      createdAt: Date.now(),
    };
    persist([entry, ...saved].slice(0, 12));
    setName("");
  };

  const handleApply = (entry) => {
    onApply?.(entry.filters, entry.searchQuery || "");
  };

  const handleDelete = (id) => {
    persist(saved.filter((s) => s.id !== id));
  };

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Bookmark className="w-5 h-5 text-[#FFA602]" />
        <h3 className="font-semibold text-slate-900 text-sm">Saved searches</h3>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          type="text"
          placeholder="Name this search…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
        />
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800"
        >
          Save current
        </button>
      </div>
      {saved.length === 0 ? (
        <p className="text-xs text-slate-500">No saved searches yet.</p>
      ) : (
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {saved.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-2 text-sm border border-slate-100 rounded-lg px-3 py-2"
            >
              <span className="font-medium text-slate-800 truncate min-w-0">{s.name}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleApply(s)}
                  className="p-1.5 rounded-lg text-[#FFA602] hover:bg-amber-50"
                  title="Apply"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                  title="Remove"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
