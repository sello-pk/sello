import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { FiMapPin } from "react-icons/fi";

// Fix leaflet icon issues
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom marker icon for selected location
const createLocationIcon = (isCurrentLocation = false) => {
  return L.divIcon({
    className: "custom-location-marker",
    html: `
      <div style="position: relative;">
        <div style="width: 32px; height: 32px; background: ${
          isCurrentLocation ? "#3B82F6" : "#EF4444"
        }; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
        ${
          isCurrentLocation
            ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 12px; height: 12px; background: white; border-radius: 50%;"></div>'
            : ""
        }
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Component to handle map updates
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);

  return null;
};

// Component to handle map click events
const MapEvents = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e) => {
      onMapClick(e);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick]);

  return null;
};

const LocationPickerModal = ({
  isOpen,
  onClose,
  onSelect,
  initialLocation = null,
}) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [mapCenter, setMapCenter] = useState([25.276987, 55.296249]); // Dubai default
  const [mapZoom, setMapZoom] = useState(13);
  const [address, setAddress] = useState("");
  const [locationMode, setLocationMode] = useState("auto"); // "auto" or "manual"
  const watchIdRef = useRef(null);
  const searchInputRef = useRef(null);

  // Initialize with provided location
  useEffect(() => {
    if (initialLocation && isOpen) {
      if (Array.isArray(initialLocation)) {
        setSelectedLocation({
          lat: initialLocation[1],
          lng: initialLocation[0],
        });
        setMapCenter([initialLocation[1], initialLocation[0]]);
      } else if (initialLocation.lat && initialLocation.lng) {
        setSelectedLocation(initialLocation);
        setMapCenter([initialLocation.lat, initialLocation.lng]);
      }
    }
  }, [initialLocation, isOpen]);

  // Stop watching position
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Autofocus search input whenever modal opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Reverse geocode to get address
  const reverseGeocode = async (lat, lng) => {
    setIsResolvingAddress(true);
    try {
      try {
        // Try OpenStreetMap Nominatim first (free)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();

        if (data && data.display_name) {
          setAddress(data.display_name);
          return data.display_name;
        }
      } catch (error) {
        console.error("Reverse geocode error:", error);
      }

      // Fallback to Google Geocoding if available
      const googleApiKey =
        import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY ||
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (googleApiKey) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`
          );
          const data = await response.json();

          if (data.status === "OK" && data.results.length > 0) {
            setAddress(data.results[0].formatted_address);
            return data.results[0].formatted_address;
          }
        } catch (error) {
          console.error("Google geocode error:", error);
        }
      }

      return "";
    } finally {
      setIsResolvingAddress(false);
    }
  };

  // Search for locations
  const searchLocation = React.useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLocationMode("manual");

    try {
      // Try OpenStreetMap Nominatim first
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const results = data.map((item) => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
          address: item.display_name,
          backendFormat: {
            type: "Point",
            coordinates: [item.lon, item.lat],
          },
        }));
        setSearchResults(results);
      } else {
        // Fallback to Google Places API if available
        const googleApiKey =
          import.meta.env.VITE_REACT_APP_GOOGLE_MAPS_API_KEY ||
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (googleApiKey) {
          const googleResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
              query
            )}&key=${googleApiKey}`
          );
          const googleData = await googleResponse.json();

          if (googleData.status === "OK" && googleData.results.length > 0) {
            const results = googleData.results.map((item) => ({
              display_name: item.formatted_address,
              lat: item.geometry.location.lat,
              lon: item.geometry.location.lng,
              address: item.formatted_address,
              backendFormat: {
                type: "Point",
                coordinates: [
                  item.geometry.location.lng,
                  item.geometry.location.lat,
                ],
              },
            }));
            setSearchResults(results);
          } else {
            setSearchResults([]);
            toast.error("No locations found");
          }
        } else {
          setSearchResults([]);
          toast.error("No locations found");
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search location");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        searchLocation(searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchLocation]);

  // Handle map click - using event handlers in MapContainer
  const handleMapClick = React.useCallback((e) => {
    if (e && e.latlng) {
      const location = { lat: e.latlng.lat, lng: e.latlng.lng };
      setSelectedLocation(location);
      setLocationMode("manual");
      // Reverse geocode to get address
      reverseGeocode(location.lat, location.lng);
      toast.success("Location selected on map");
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        setSelectedLocation(location);
        setMapCenter([location.lat, location.lng]);
        setMapZoom(16);
        setLocationMode("auto");
        setSearchResults([]);

        await reverseGeocode(location.lat, location.lng);
        toast.success("Using your current location");
        setIsLocating(false);
      },
      (error) => {
        let msg = "Unable to get current location.";
        if (error?.code === 1) msg = "Location permission denied.";
        if (error?.code === 2) msg = "Location unavailable.";
        if (error?.code === 3) msg = "Location request timed out.";
        toast.error(msg);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );
  };

  // Handle search result selection
  const handleSelectResult = (result) => {
    const location = { lat: Number(result.lat), lng: Number(result.lon) };
    setSelectedLocation(location);
    setMapCenter([Number(result.lat), Number(result.lon)]);
    setMapZoom(15);
    setSearchQuery(result.display_name);
    setAddress(result.display_name);
    setSearchResults([]);
    setLocationMode("manual");
    toast.success("Location selected");
  };

  // Handle confirm
  const handleConfirm = async () => {
    if (selectedLocation) {
      // Get address if not already set
      if (!address) {
        await reverseGeocode(selectedLocation.lat, selectedLocation.lng);
      }

      const locationData = {
        coordinates: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
        },
        address:
          address ||
          selectedLocation.display_name ||
          `Location (${selectedLocation.lat.toFixed(
            6
          )}, ${selectedLocation.lng.toFixed(6)})`,
        formatted:
          address ||
          selectedLocation.display_name ||
          `Location (${selectedLocation.lat.toFixed(
            6
          )}, ${selectedLocation.lng.toFixed(6)})`,
        backendFormat: selectedLocation.backendFormat || {
          type: "Point",
          coordinates: [selectedLocation.lng, selectedLocation.lat],
        },
      };

      onSelect(locationData);

      // Stop watching position
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      onClose();
    } else {
      toast.error("Please select a location");
    }
  };

  // Handle close
  const handleClose = () => {
    // Stop watching position
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Reset state
    setSelectedLocation(null);
    setCurrentLocation(null);
    setSearchQuery("");
    setSearchResults([]);
    setAddress("");
    setLocationMode("auto");

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="location-picker-modal fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full max-w-4xl max-h-[92dvh] sm:max-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b flex items-center justify-between shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold">Enter Address</h2>
          <button
            onClick={handleClose}
            className="text-orange-500 hover:text-orange-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {/* Search and Controls */}
          <div className="p-3 sm:p-4 border-b space-y-3">
            <div className="flex items-center justify-stretch sm:justify-end">
              <button
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="w-full sm:w-auto px-3 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLocating && (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-b-transparent animate-spin" />
                )}
                {isLocating ? "Locating..." : "Use Current Location"}
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter text to search"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                </div>
              )}
              {isSearching && (
                <p className="text-xs text-gray-500 mt-2">
                  Searching location...
                </p>
              )}

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {searchResults.map((result, index) => (
                    <div
                      key={index}
                      onClick={() => handleSelectResult(result)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      <p className="text-sm text-gray-700">
                        {result.display_name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Location Info */}
            {selectedLocation && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Selected Location:
                </p>
                <p className="text-xs text-gray-600">
                  {address ||
                    `Lat: ${selectedLocation.lat.toFixed(
                      6
                    )}, Lng: ${selectedLocation.lng.toFixed(6)}`}
                </p>
                {isResolvingAddress && (
                  <p className="text-xs text-gray-500 mt-1">
                    Resolving address...
                  </p>
                )}
                {locationMode === "auto" && (
                  <p className="text-xs text-primary-600 mt-1 flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" /> Using current location
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Map */}
          <div className="relative h-[32vh] min-h-[200px] sm:h-[45vh] sm:min-h-[280px] md:h-[400px]">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
              key={`map-${mapCenter[0]}-${mapCenter[1]}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater center={mapCenter} zoom={mapZoom} />
              <MapEvents onMapClick={handleMapClick} />

              {/* Current location marker (if auto mode) */}
              {currentLocation && locationMode === "auto" && (
                <Marker
                  position={[currentLocation.lat, currentLocation.lng]}
                  icon={createLocationIcon(true)}
                />
              )}

              {/* Selected location marker */}
              {selectedLocation && (
                <Marker
                  position={[selectedLocation.lat, selectedLocation.lng]}
                  icon={createLocationIcon(false)}
                />
              )}
            </MapContainer>

            {/* Instructions overlay */}
            {!selectedLocation && searchResults.length === 0 && (
              <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto sm:max-w-sm bg-white/90 backdrop-blur-sm px-3 py-2 sm:px-4 rounded-lg shadow-lg border border-gray-200 z-10">
                <p className="text-xs sm:text-sm text-gray-700 flex items-start sm:items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5 sm:mt-0" />
                  <span>
                    <span className="font-semibold">Click on the map</span> to
                    select a location, or search above
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-6 border-t bg-gray-50 shrink-0">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation || isResolvingAddress || isLocating}
              className="w-full sm:w-auto px-8 py-2.5 sm:py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
            >
              {isResolvingAddress ? "Resolving..." : "Select Location"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
