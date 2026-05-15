import React from 'react';

/**
 * Lightweight route loader for Suspense fallbacks
 * Shows a minimal loading indicator without full page overlay
 */
const RouteLoader = () => {
  return (
    <div
      className="w-full px-4 py-10 sm:py-12"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
        </div>
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
};

export default RouteLoader;

