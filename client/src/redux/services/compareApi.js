import { api } from './api';
// During local development, comparison endpoints run in the local server checkout.
// Other marketplace requests continue using the project's configured API.
const comparisonPath = path => import.meta.env.DEV && typeof window !== 'undefined'
  ? new URL(`/api/compare${path}`, window.location.origin).href
  : `/compare${path}`;
export const compareApi = api.injectEndpoints({
  endpoints: builder => ({
    compareUpload: builder.mutation({ query: body => ({ url: '/utility/upload', method: 'POST', body }) }),
    compareCatalog: builder.query({ query: () => comparisonPath('/catalog'), transformResponse: r => r.data }),
    compareVariants: builder.query({ query: vehicle => comparisonPath(`/variants?${new URLSearchParams(vehicle)}`), transformResponse: r => r.data }),
    compareConfig: builder.query({ query: () => comparisonPath('/config'), transformResponse: r => r.data }),
    compareResults: builder.mutation({ query: vehicles => ({ url: comparisonPath('/results'), method: 'POST', body: { vehicles } }), transformResponse: r => r.data }),
    compareResearch: builder.mutation({ query: vehicle => ({ url: comparisonPath('/research'), method: 'POST', body: { vehicle }, timeout: 95000 }), transformResponse: r => r.data }),
    compareRecommendation: builder.mutation({ query: body => ({ url: comparisonPath('/recommendation'), method: 'POST', body, timeout: 45000 }), transformResponse: r => r.data }),
    compareMetrics: builder.query({ query: () => comparisonPath('/admin/metrics'), transformResponse: r => r.data }),
    compareAdminConfig: builder.query({ query: () => comparisonPath('/admin/config'), transformResponse: r => r.data }),
    saveCompareConfig: builder.mutation({ query: body => ({ url: comparisonPath('/admin/config'), method: 'PUT', body }), transformResponse: r => r.data }),
  }),
});
export const { useCompareCatalogQuery, useCompareVariantsQuery, useCompareConfigQuery, useCompareResultsMutation, useCompareResearchMutation, useCompareRecommendationMutation, useCompareAdminConfigQuery, useSaveCompareConfigMutation, useCompareMetricsQuery } = compareApi;
