import { useMemo } from "react";
import { useGetAllCategoriesQuery } from "../redux/services/adminApi";

/**
 * Custom hook to fetch and organize car categories (makes, models, years, countries, cities)
 * @param {string} vehicleType - Optional vehicle type filter (Car, Bus, Truck, Van, Bike, E-bike)
 */
export const useCarCategories = (vehicleType = null) => {
  // Build query params
  const carQueryParams = {
    type: "car",
    isActive: "true",
  };
  if (vehicleType) {
    carQueryParams.vehicleType = vehicleType;
  }

  // Execute all queries in parallel for better performance
  const {
    data: allCarCategories,
    isLoading: carLoading,
  } = useGetAllCategoriesQuery(carQueryParams, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: yearCategories,
    isLoading: yearLoading,
  } = useGetAllCategoriesQuery(
    {
      type: "car",
      subType: "year",
      isActive: "true",
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const {
    data: allLocationCategories,
    isLoading: locationLoading,
  } = useGetAllCategoriesQuery(
    {
      type: "location",
      isActive: "true",
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const carCategories = useMemo(
    () => (Array.isArray(allCarCategories) ? allCarCategories : []),
    [allCarCategories],
  );
  const yearCategoriesArray = useMemo(
    () => (Array.isArray(yearCategories) ? yearCategories : []),
    [yearCategories],
  );
  const locationCategories = useMemo(
    () => (Array.isArray(allLocationCategories) ? allLocationCategories : []),
    [allLocationCategories],
  );
  const isLoading = useMemo(
    () => carLoading || locationLoading || yearLoading,
    [carLoading, locationLoading, yearLoading],
  );

  const makes = useMemo(() => {
    let makesList = carCategories
      .filter((cat) => cat.subType === "make" && cat.isActive)
      .sort((a, b) => {
        // Sort by order field first, then alphabetically
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });

    // When vehicleType is set: only include makes for that type (strict — no mixing Car/Bike)
    if (vehicleType) {
      makesList = makesList.filter((cat) => cat.vehicleType === vehicleType);
      // Dedupe by name (e.g. one Suzuki per type)
      const seen = new Set();
      makesList = makesList.filter((m) => {
        const key = String(m.name || "").trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } else {
      // No vehicle type (e.g. "All Brands"): dedupe by name so we don't show Car Suzuki + Bike Suzuki as two cards
      const seen = new Set();
      makesList = makesList.filter((m) => {
        const key = String(m.name || "").trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return makesList;
  }, [carCategories, vehicleType]);

  const models = useMemo(() => {
    let modelList = carCategories
      .filter((cat) => cat.subType === "model" && cat.isActive)
      .sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });

    // Strict: when vehicleType is set, only models for that type (no fallback to null)
    if (vehicleType) {
      modelList = modelList.filter((cat) => cat.vehicleType === vehicleType);
    }

    return modelList;
  }, [carCategories, vehicleType]);

  const years = useMemo(() => {
    return yearCategoriesArray
      .filter((cat) => cat.subType === "year" && cat.isActive)
      .sort((a, b) => {
        // Sort years in descending order (newest first)
        const yearA = parseInt(a.name) || 0;
        const yearB = parseInt(b.name) || 0;
        return yearB - yearA;
      });
  }, [yearCategoriesArray]); // Removed 'years' dependency as it's derived from yearCategoriesArray

  const countries = useMemo(() => {
    return locationCategories
      .filter((cat) => cat.subType === "country" && cat.isActive)
      .sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
  }, [locationCategories]);

  const states = useMemo(() => {
    return locationCategories.filter(
      (cat) => cat.subType === "state" && cat.isActive,
    );
  }, [locationCategories]);

  const cities = useMemo(() => {
    return locationCategories.filter(
      (cat) => cat.subType === "city" && cat.isActive,
    );
  }, [locationCategories]);

  const getModelsByMake = useMemo(() => {
    const map = {};
    models.forEach((model) => {
      // Skip if no parentCategory
      if (!model.parentCategory) {
        return;
      }
      const makeId =
        typeof model.parentCategory === "object" &&
        model.parentCategory !== null
          ? model.parentCategory._id
          : model.parentCategory;
      if (makeId) {
        if (!map[makeId]) {
          map[makeId] = [];
        }
        map[makeId].push(model);
      }
    });

    return map;
  }, [models]);

  const getYearsByModel = useMemo(() => {
    // Years are now independent - return empty map since years don't belong to models
    return {};
  }, []); // No dependencies needed - returns empty object

  const getStatesByCountry = useMemo(() => {
    const map = {};
    states.forEach((state) => {
      if (!state.parentCategory) return;
      const countryId =
        typeof state.parentCategory === "object" &&
        state.parentCategory !== null
          ? state.parentCategory._id
          : state.parentCategory;
      if (countryId) {
        if (!map[countryId]) {
          map[countryId] = [];
        }
        map[countryId].push(state);
      }
    });
    return map;
  }, [states]);

  const getCitiesByCountry = useMemo(() => {
    const map = {};
    cities.forEach((city) => {
      // Skip if no parentCategory
      if (!city.parentCategory) {
        return;
      }
      const countryId =
        typeof city.parentCategory === "object" && city.parentCategory !== null
          ? city.parentCategory._id
          : city.parentCategory;
      if (countryId) {
        if (!map[countryId]) {
          map[countryId] = [];
        }
        map[countryId].push(city);
      }
    });
    // Sort cities within each country
    Object.keys(map).forEach((countryId) => {
      map[countryId].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
    });
    return map;
  }, [cities]);

  const getCitiesByState = useMemo(() => {
    const map = {};
    cities.forEach((city) => {
      if (!city.parentCategory) return;
      // Check if parent is a state (not country)
      const parentId =
        typeof city.parentCategory === "object" && city.parentCategory !== null
          ? city.parentCategory._id
          : city.parentCategory;
      // Check if parent is a state by checking if it exists in states
      const isStateParent = states.some(
        (s) =>
          (typeof s._id === "string" ? s._id : s._id?.toString()) ===
          (typeof parentId === "string" ? parentId : parentId?.toString()),
      );
      if (isStateParent && parentId) {
        if (!map[parentId]) {
          map[parentId] = [];
        }
        map[parentId].push(city);
      }
    });
    // Sort cities within each state
    Object.keys(map).forEach((stateId) => {
      map[stateId].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
    });
    return map;
  }, [cities, states]);

  return {
    makes,
    models,
    years,
    countries,
    states,
    cities,
    getModelsByMake,
    getYearsByModel,
    getStatesByCountry,
    getCitiesByCountry,
    getCitiesByState,
    isLoading,
    /** True only while car make/model categories are loading (not years/locations) */
    isCarCategoriesLoading: carLoading,
  };
};
