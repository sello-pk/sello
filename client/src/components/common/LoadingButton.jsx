import React from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Loading Button Component
 * Shows loading state on buttons instead of full-page loaders
 */
const LoadingButton = ({ 
  children, 
  isLoading = false, 
  disabled = false,
  className = "",
  type = "button",
  onClick,
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${className}
        ${(disabled || isLoading) ? 'opacity-60 cursor-not-allowed' : ''}
        transition-all duration-200
        flex items-center justify-center gap-2
      `}
      {...props}
    >
      {isLoading && (
        <FaSpinner className="animate-spin" size={16} />
      )}
      {children}
    </button>
  );
};

export default LoadingButton;

