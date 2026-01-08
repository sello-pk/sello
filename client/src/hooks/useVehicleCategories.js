import { useMemo } from "react";
import { useGetAllCategoriesQuery } from "../redux/services/adminApi";

/**
 * Custom hook to fetch and organize vehicle type categories (Car, Bus, Truck, Van, Bike, E-bike)
 */
export const useVehicleCategories = () => {
    const { data: allVehicleCategories, isLoading, error } = useGetAllCategoriesQuery({
        type: "vehicle",
        isActive: "true",
    }, {
        refetchOnMountOrArgChange: true,
    });

    const vehicleCategories = Array.isArray(allVehicleCategories) ? allVehicleCategories : [];

    const categories = useMemo(() => {
        return vehicleCategories
            .filter((cat) => cat.isActive)
            .sort((a, b) => {
                const orderA = a.order || 0;
                const orderB = b.order || 0;
                if (orderA !== orderB) return orderA - orderB;
                return (a.name || "").localeCompare(b.name || "");
            });
    }, [vehicleCategories]);

    const getCategoryBySlug = useMemo(() => {
        const map = {};
        categories.forEach(cat => {
            map[cat.slug] = cat;
        });
        return (slug) => map[slug] || null;
    }, [categories]);

    const getCategoryByName = useMemo(() => {
        const map = {};
        categories.forEach(cat => {
            map[cat.name] = cat;
        });
        return (name) => map[name] || null;
    }, [categories]);

    return {
        categories,
        isLoading,
        error,
        getCategoryBySlug,
        getCategoryByName,
    };
};

