import React from "react";
import { Provider } from "react-redux";
import { StaticRouter } from "react-router";
import { configureStore } from "@reduxjs/toolkit";
import { api } from "../src/redux/services/api";
import { adminApi } from "../src/redux/services/adminApi";
import App from "../src/App";

/**
 * Fresh store per rendered route so caching queries do not leak from one
 * page to the next. Mirrors src/redux/store.js exactly.
 */
export function createAppStore() {
  return configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      [adminApi.reducerPath]: adminApi.reducer,
    },
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().concat(api.middleware, adminApi.middleware);
    },
  });
}

export function createTree(store, location) {
  return (
    <Provider store={store}>
      <StaticRouter location={location}>
        <App />
      </StaticRouter>
    </Provider>
  );
}

/**
 * Seed the RTK Query cache before rendering so the initial HTML contains real
 * content even though globalThis.fetch is stubbed during render. Values must
 * match the transformResponse shape of each endpoint (see src/redux/services/api.js).
 */
export function seedBlogList(store, data) {
  store.dispatch(
    api.util.upsertQueryData(
      "getBlogs",
      { page: 1, limit: 12, status: "published" },
      data,
    ),
  );
}

export function seedCategories(store, categories) {
  store.dispatch(
    api.util.upsertQueryData(
      "getCategories",
      { type: "blog", isActive: true },
      categories,
    ),
  );
}

export function seedArticle(store, article) {
  if (!article || !article.slug) return;
  store.dispatch(
    api.util.upsertQueryData("getBlogBySlug", article.slug, article),
  );
}

export function seedRelatedBlogs(store, params, data) {
  store.dispatch(api.util.upsertQueryData("getBlogs", params, data));
}