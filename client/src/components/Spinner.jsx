// components/Spinner.jsx - DEPRECATED: Use LoadingButton for button loading states
// This component is kept for backward compatibility but should not be used for full-page loading
import React from "react";
import { FaSpinner } from "react-icons/fa";

/**
 * @deprecated Use LoadingButton component for button loading states instead
 * This component should only be used for minimal inline loading indicators
 */
const Spinner = ({ fullScreen = false, className = "", size = 20 }) => {
  // Don't render full-screen spinners - use AppLoader in main.jsx instead
  if (fullScreen) {
    return null;
  }
  
  // Minimal inline spinner for very specific cases
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <FaSpinner className="animate-spin text-primary-500" size={size} />
    </div>
  );
};

export default Spinner;
