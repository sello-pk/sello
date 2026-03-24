import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllCategoriesQuery } from "../redux/services/adminApi";
import { useGetCarCountsByMakeQuery } from "../redux/services/api";
import { Spinner } from "../components/ui/Loading";

const VEHICLE_TYPE_TABS = [
  { value: null, label: "All Brands" },
  { value: "Car", label: "Car" },
  { value: "Bus", label: "Bus" },
  { value: "Truck", label: "Truck" },
  { value: "Van", label: "Van" },
  { value: "Bike", label: "Bike" },
  { value: "E-bike", label: "E-bike" },
  { value: "Farm", label: "Farm" },
];

const AllBrands = () => {
  const navigate = useNavigate();
  const [selectedVehicleType, setSelectedVehicleType] = useState(null); // null = All Brands

  // Fetch raw "make" categories and resolve by vehicleType in this page.
  // This avoids same-name make collisions across types (e.g., Honda car vs bike).
  const { data: allMakesRaw = [], isLoading: categoriesLoading } =
    useGetAllCategoriesQuery(
      { type: "car", subType: "make", isActive: "true" },
      { refetchOnMountOrArgChange: true },
    );

  const makes = React.useMemo(
    () => (Array.isArray(allMakesRaw) ? allMakesRaw : []),
    [allMakesRaw],
  );

  // Fetch counts by make; when a vehicle type tab is selected, scope counts to that type only
  const { data: carCountsByMake = {}, isLoading: countsLoading } =
    useGetCarCountsByMakeQuery(
      selectedVehicleType ? { vehicleType: selectedVehicleType } : {},
      { refetchOnMountOrArgChange: true },
    );

  // Filter active brands with images and sort by order; when a vehicle type tab is selected, show only that type
  const activeBrands = React.useMemo(() => {
    if (!makes || makes.length === 0) return [];

    const countsMapNormalized = {};
    Object.keys(carCountsByMake || {}).forEach((key) => {
      const normalizedKey = key.trim().toLowerCase();
      countsMapNormalized[normalizedKey] =
        (countsMapNormalized[normalizedKey] || 0) + carCountsByMake[key];
    });

    const filtered = makes.filter(
      (brand) =>
        brand?.isActive &&
        brand?.image &&
        (selectedVehicleType == null ||
          brand?.vehicleType === selectedVehicleType),
    );

    // Keep every make entry separate by vehicle type (no cross-type merge).
    return filtered
      .map((brand) => {
        const brandNameNormalized = (brand?.name || "").trim().toLowerCase();
        // In "All Brands", make names can repeat across vehicle types.
        // Avoid ambiguous count badges unless a specific type tab is selected.
        const postCount =
          selectedVehicleType == null
            ? 0
            : countsMapNormalized[brandNameNormalized] || 0;
        return { ...brand, postCount };
      })
      .sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [makes, carCountsByMake, selectedVehicleType]);

  const isLoading = categoriesLoading || countsLoading;

  const handleBrandClick = (brand) => {
    const params = new URLSearchParams({ make: brand.name || "" });
    // Always include vehicleType to avoid cross-type make collisions in results.
    const vehicleType = selectedVehicleType || brand?.vehicleType;
    if (vehicleType) params.set("vehicleType", vehicleType);
    navigate(`/search-results?${params.toString()}`);
  };

  const heading =
    selectedVehicleType == null
      ? "All Vehicle Brands"
      : `All ${selectedVehicleType} Brands`;
  const subtitle =
    selectedVehicleType == null
      ? "Explore our wide selection of vehicle brands — cars, bikes, trucks, and more."
      : `Explore our wide selection of ${selectedVehicleType.toLowerCase()} brands.`;

  return (
    <div className="min-h-screen bg-white pt-24 md:pt-28 pb-12">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 text-gray-900">
          {heading}
        </h1>
        <p className="text-center text-gray-600 mb-8 text-sm md:text-base">
          {subtitle}
        </p>

        {/* Vehicle type tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {VEHICLE_TYPE_TABS.map((tab) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setSelectedVehicleType(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedVehicleType === tab.value
                  ? "bg-primary-500 text-black shadow-md ring-2 ring-primary-500 ring-offset-2"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner fullScreen={false} />
          </div>
        ) : activeBrands.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              No brands available for this category.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Brands will appear here once uploaded by admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-6 place-items-center">
            {activeBrands.map((brand) => {
              const brandName = brand.name || "Unknown Brand";
              const brandImage = brand.image;

              return (
                <div
                  key={brand._id || brand.slug}
                  onClick={() => handleBrandClick(brand)}
                  className="flex flex-col items-center justify-center cursor-pointer group transition-all hover:scale-105"
                >
                  <div className="relative bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow w-full h-24 md:h-28 flex items-center justify-center mb-2">
                    {brandImage ? (
                      <img
                        src={brandImage}
                        alt={brandName}
                        className="h-12 md:h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div class="text-gray-400 text-xs text-center">No Image</div>';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-xs text-center">
                        No Image
                      </div>
                    )}
                    {brand.postCount > 0 ? (
                      <div className="absolute -top-2 -right-2 bg-primary-500 text-white rounded-full min-w-[20px] h-5 md:h-6 px-1.5 md:px-2 flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white z-10">
                        {brand.postCount > 99 ? "99+" : brand.postCount}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm font-medium text-gray-700 group-hover:text-primary-500 transition-colors line-clamp-2 max-w-[100px]">
                      {brandName}
                    </p>
                    {selectedVehicleType == null && brand?.vehicleType ? (
                      <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                        {brand.vehicleType}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBrands;
