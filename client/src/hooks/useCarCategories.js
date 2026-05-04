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
    // Align with adminApi defaults — avoids waterfall refetches when Hero + BrandMarquee
    // (and other mounts) subscribe; subscribers still fetch in parallel on cold cache.
    refetchOnMountOrArgChange: false,
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
      refetchOnMountOrArgChange: false,
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
      refetchOnMountOrArgChange: false,
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
    const countryIdSet = new Set(
      countries.map((c) => String(c._id)),
    );

    const pushCity = (countryKey, city) => {
      if (countryKey == null || !city?._id) return;
      const k = String(countryKey);
      if (!map[k]) map[k] = [];
      if (map[k].some((x) => String(x._id) === String(city._id))) return;
      map[k].push(city);
    };

    // Cities linked directly to a country (legacy / flat hierarchy)
    cities.forEach((city) => {
      if (!city.parentCategory) return;
      const parentId =
        typeof city.parentCategory === "object" && city.parentCategory !== null
          ? city.parentCategory._id
          : city.parentCategory;
      const parentStr = String(parentId);
      if (countryIdSet.has(parentStr)) {
        pushCity(parentStr, city);
      }
    });

    // Cities under states — roll up into their parent country (fixes sparse lists
    // when admin uses Country → State → City in Categories)
    states.forEach((state) => {
      if (!state.parentCategory) return;
      const countryId =
        typeof state.parentCategory === "object" && state.parentCategory !== null
          ? state.parentCategory._id
          : state.parentCategory;
      const sid = state._id;
      cities.forEach((city) => {
        if (!city.parentCategory) return;
        const cityParent =
          typeof city.parentCategory === "object" && city.parentCategory !== null
            ? city.parentCategory._id
            : city.parentCategory;
        if (String(cityParent) === String(sid)) {
          pushCity(countryId, city);
        }
      });
    });

    Object.keys(map).forEach((countryId) => {
      map[countryId].sort((a, b) => {
        const orderA = a.order || 0;
        const orderB = b.order || 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
    });
    return map;
  }, [cities, states, countries]);

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
