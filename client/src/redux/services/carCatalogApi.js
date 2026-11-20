import { api } from "./api.js";
import { adminApi } from "./adminApi.js";
import { parseCatalogSelection } from "../../utils/carCatalog.js";

function fromCategories(select) {
  return async (arg, context) => {
    const categories = await context.dispatch(adminApi.endpoints.getAllCategories.initiate(
      { type: "car", isActive: "true", vehicleType: "Car" },
      { subscribe: false },
    ));
    if (categories.error) return { error: categories.error };
    if (!Array.isArray(categories.data)) {
      return { error: { status: "CUSTOM_ERROR", error: "Invalid vehicle categories response." } };
    }
    const cars = categories.data.filter((entry) => entry.vehicleType === "Car" && entry.isActive === true)
      .map(({ _id, name, subType, image, parentCategory }) => ({
        _id, name, subType, image, parentCategory: parentCategory?._id ?? parentCategory,
      }));
    return { data: select(cars, arg) };
  };
}

function withCategoryFallback(query, fallback) {
  const readCategories = fromCategories(fallback);
  return async (arg, context, _options, baseQuery) => {
    const result = await baseQuery(query(arg));
    if (!result.error) return { data: result.data.data };
    if (result.error.status === 404 || result.error.originalStatus === 404) return readCategories(arg, context);
    return { error: result.error };
  };
}

const sortAndSearch = (entries, q = "") => entries
  .filter(({ name }) => name.toLowerCase().startsWith(q.trim().toLowerCase()))
  .sort((a, b) => a.name.localeCompare(b.name) || a._id.localeCompare(b._id))
  .slice(0, 40);

function modelEntry(cars, model) {
  const make = model && cars.find((entry) => entry.subType === "make" && entry._id === model.parentCategory);
  return make ? { token: `m-${model._id}`, make, model, variant: null } : null;
}

const activate = api.enhanceEndpoints({ addTagTypes: ["CarCatalogue"] }).injectEndpoints({
  endpoints: (builder) => ({
    compareExperience: builder.query({ query: () => "/car-catalog/experience", transformResponse: (response) => response.data, providesTags: ["CarCatalogue"] }),
    compareOverlay: builder.query({ query: (params) => ({ url: "/car-catalog/overlay", params }), transformResponse: (response) => response.data, providesTags: ["CarCatalogue"], keepUnusedDataFor: 30 }),
    compareRecommendation: builder.mutation({ query: (body) => ({ url: "/car-catalog/recommendation", method: "POST", body }), transformResponse: (response) => response.data }),
    compareAiOverview: builder.query({
      query: (body) => ({ url: "/car-catalog/recommendation", method: "POST", body: { ...body, mode: "overview" } }),
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 60,
    }),
    compareReviews: builder.query({ query: (params) => ({ url: "/admin/car-compare/reviews", params }), transformResponse: (response) => response.data, providesTags: ["CarCatalogue"] }),
    saveCompareReview: builder.mutation({ query: ({ id, ...body }) => ({ url: `/admin/car-compare/reviews/${id}`, method: "POST", body }), invalidatesTags: ["CarCatalogue"] }),
    saveCompareExperience: builder.mutation({ query: (body) => ({ url: "/admin/car-compare/settings", method: "PUT", body }), invalidatesTags: ["CarCatalogue"] }),
    uploadCompareImage: builder.mutation({ query: (body) => ({ url: "/admin/car-compare/images", method: "POST", body }) }),
    catalogMakes: builder.query({
      queryFn: fromCategories(
        (cars, q) => sortAndSearch(cars.filter((entry) => entry.subType === "make"), q),
      ),
    }),
    catalogModels: builder.query({
      queryFn: fromCategories(
        (cars, { makeId, q }) => sortAndSearch(cars.filter((entry) => entry.subType === "model" && entry.parentCategory === makeId), q),
      ),
    }),
    catalogVariants: builder.query({ query: ({ modelId, q = "", year }) => ({ url: "/car-catalog/variants", params: { modelId, q, ...(year ? { year } : {}) } }), transformResponse: (response) => response.data, providesTags: ["CarCatalogue"] }),
    catalogYears: builder.query({ query: (modelId) => ({ url: "/car-catalog/years", params: { modelId } }), transformResponse: (response) => response.data, providesTags: ["CarCatalogue"] }),
    catalogComparison: builder.query({
      queryFn: withCategoryFallback(
        (vehicles) => ({ url: "/car-catalog/compare", params: { vehicles } }),
        (cars, vehicles) => (parseCatalogSelection(vehicles) || []).map((token) => {
          if (token.startsWith("v-")) return { token, unavailable: true, needsCatalogue: true };
          const model = cars.find((entry) => entry.subType === "model" && entry._id === token.slice(2));
          return modelEntry(cars, model) || { token, unavailable: true };
        }),
      ),
      keepUnusedDataFor: 20,
      providesTags: ["CarCatalogue"],
    }),
    popularCatalogComparisons: builder.query({
      async queryFn(_arg, _context, _options, baseQuery) {
        const result = await baseQuery("/car-catalog/popular");
        if (result.error?.status === 404) return { data: [] };
        return result.error ? { error: result.error } : { data: result.data.data };
      },
      providesTags: ["CarCatalogue"],
    }),
    resolveCatalogListing: builder.query({
      queryFn: withCategoryFallback(
        (params) => ({ url: "/car-catalog/resolve", params }),
        (cars, { make, model }) => {
          const makes = cars.filter((entry) => entry.subType === "make" && entry.name.toLowerCase() === make.trim().toLowerCase());
          if (makes.length !== 1) return null;
          const models = cars.filter((entry) => entry.subType === "model" && entry.parentCategory === makes[0]._id && entry.name.toLowerCase() === model.trim().toLowerCase());
          return models.length === 1 ? modelEntry(cars, models[0]) : null;
        },
      ),
      providesTags: ["CarCatalogue"],
    }),
    adminCatalogVariants: builder.query({ query: (params) => ({ url: "/admin/car-catalog/variants", params }), transformResponse: (response) => response.data, providesTags: ["CarCatalogue"] }),
    saveCatalogVariant: builder.mutation({
      query: ({ id, body }) => ({ url: id ? `/admin/car-catalog/variants/${id}` : "/admin/car-catalog/variants", method: id ? "PUT" : "POST", body }),
      invalidatesTags: (_data, error) => error ? [] : ["CarCatalogue"],
    }),
    archiveCatalogVariant: builder.mutation({
      query: (id) => ({ url: `/admin/car-catalog/variants/${id}`, method: "DELETE" }),
      invalidatesTags: (_data, error) => error ? [] : ["CarCatalogue"],
    }),
  }),
});

export const { useCompareExperienceQuery, useCompareOverlayQuery, useCompareRecommendationMutation, useCompareAiOverviewQuery, useCompareReviewsQuery, useSaveCompareReviewMutation, useSaveCompareExperienceMutation, useCatalogYearsQuery, useUploadCompareImageMutation } = activate;

export const { useCatalogMakesQuery, useCatalogModelsQuery, useCatalogVariantsQuery, useCatalogComparisonQuery, usePopularCatalogComparisonsQuery, useResolveCatalogListingQuery, useAdminCatalogVariantsQuery, useSaveCatalogVariantMutation, useArchiveCatalogVariantMutation } = activate;
