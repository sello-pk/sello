import React from "react";
import { FaSpinner } from "react-icons/fa";

/**
 * Unified Loading Component
 * Includes spinner and skeleton loaders
 */

// Main Loader Component
const Loading = ({
  fullScreen = false,
  className = "",
  size = 20,
  type = "spinner",
}) => {
  // Don't render full-screen loaders - use AppLoader in main.jsx instead
  if (fullScreen) {
    return null;
  }

  if (type === "spinner") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <FaSpinner className="animate-spin text-primary-500" size={size} />
      </div>
    );
  }

  return null;
};

// Skeleton Component
export const Skeleton = ({
  className = "",
  width,
  height,
  rounded = "rounded",
}) => {
  return (
    <div
      className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${rounded} ${className}`}
      style={{ width, height }}
    />
  );
};

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
};

// Card Skeleton
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
        >
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

// Re-export as Spinner for backward compatibility
export { Loading as Spinner };
export { TableRowSkeleton as TableSkeleton };
export default Loading;
