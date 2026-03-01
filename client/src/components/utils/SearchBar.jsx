import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetFilteredCarsQuery, api } from "../../redux/services/api";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { images } from "../../assets/assets";

const SearchBar = ({
  compact = false,
  placeholder = "Search by title, make, or model...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [triggerSearch, setTriggerSearch] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Trigger API query only when triggerSearch is set
  const {
    data: filteredCars,
    isLoading,
    isFetching,
  } = useGetFilteredCarsQuery(triggerSearch, {
    skip: !triggerSearch,
    refetchOnMountOrArgChange: true, // Force refetch to avoid caching
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    // Clear cache for 'Cars' tag
    dispatch(api.util.invalidateTags(["Cars"]));
    const queryParams = { search: searchTerm.trim() }; // Simplified to only 'search'
    setTriggerSearch(queryParams);
  };

  // Navigate to search results when fresh data is received
  useEffect(() => {
    if (filteredCars && !isLoading && !isFetching && triggerSearch) {
      // Navigate with URL parameters instead of state
      const params = new URLSearchParams();
      params.set("search", searchTerm.trim());

      navigate(`/search-results?${params.toString()}`);
      setTriggerSearch(null); // Reset to prevent re-navigation

      // Clear search input after successful navigation
      setTimeout(() => setSearchTerm(""), 100);
    }
  }, [
    filteredCars,
    isLoading,
    isFetching,
    navigate,
    searchTerm,
    triggerSearch,
  ]);

  return (
    <form
      onSubmit={handleSearch}
      className={`flex items-center gap-2 bg-white text-black ${
        compact
          ? "border border-gray-500 rounded-lg px-4 py-1.5 shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]"
          : "border border-gray-200 rounded-lg px-3 py-2"
      }`}
    >
      <input
        className="outline-none flex-1 text-sm bg-transparent"
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        type="submit"
        className={`focus:outline-none flex items-center justify-center ${
          compact
            ? "w-6 h-6 text-gray-500 hover:text-gray-700"
            : "bg-primary-500 hover:opacity-90 w-8 h-8 rounded-md"
        }`}
      >
        <img
          className={`w-4 ${compact ? "opacity-70" : "brightness-0 invert"}`}
          src={images.searchIcon}
          alt="search"
        />
      </button>
    </form>
  );
};

export default SearchBar;
