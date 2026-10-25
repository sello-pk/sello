import { lazy } from "react";

/** One-shot reload after deploy when hashed chunks 404 / fail to fetch */
export const CHUNK_RETRY_KEY = "sello-chunk-retry-once";

export function clearChunkRetryFlag() {
  try {
    sessionStorage.removeItem(CHUNK_RETRY_KEY);
  } catch {
    /* private mode */
  }
}

export function isStaleChunkLoadError(err) {
  const msg = String(err?.message ?? err ?? "");
  const name = err?.name;
  return (
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /error loading dynamically imported module/i.test(msg) ||
    /Loading chunk \d+ failed/i.test(msg) ||
    /Importing a module script failed/i.test(msg) ||
    name === "ChunkLoadError"
  );
}

/** @returns {boolean} true if reload was initiated */
export function tryReloadOnceForStaleChunk(err) {
  if (!isStaleChunkLoadError(err)) return false;
  try {
    if (sessionStorage.getItem(CHUNK_RETRY_KEY) === "1") return false;
    sessionStorage.setItem(CHUNK_RETRY_KEY, "1");
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

/** React.lazy wrapper: soft-retry once, then one full reload on stale chunks */
export function lazyImport(factory) {
  return lazy(async () => {
    try {
      const mod = await factory();
      clearChunkRetryFlag();
      return mod;
    } catch (firstError) {
      // Transient network / race: retry the import once before a hard reload
      if (isStaleChunkLoadError(firstError)) {
        try {
          await new Promise((r) => setTimeout(r, 400));
          const mod = await factory();
          clearChunkRetryFlag();
          return mod;
        } catch (secondError) {
          if (tryReloadOnceForStaleChunk(secondError)) {
            return new Promise(() => {});
          }
          throw secondError;
        }
      }
      throw firstError;
    }
  });
}

// Lazy loading utilities for heavy libraries
export const lazyLoadTipTap = () =>
  import("@tiptap/react").then((module) => module.default);
export const lazyLoadGSAP = () =>
  import("gsap").then((module) => module.default);
export const lazyLoadLeaflet = () =>
  import("leaflet").then((module) => module.default);
export const lazyLoadPDF = () =>
  import("jspdf").then((module) => module.default);
export const lazyLoadXLSX = () =>
  import("xlsx").then((module) => module.default);
export const lazyLoadRecharts = () =>
  import("recharts").then((module) => module.default);
export const lazyLoadGoogleMaps = () =>
  import("@react-google-maps/api").then((module) => module.default);

// Default export for backward compatibility
export default {
  lazyLoadTipTap,
  lazyLoadGSAP,
  lazyLoadLeaflet,
  lazyLoadPDF,
  lazyLoadXLSX,
  lazyLoadRecharts,
  lazyLoadGoogleMaps,
};
