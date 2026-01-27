import React from "react";
import { FaSpinner } from "react-icons/fa";

/**
 * Unified Button Component
 * Includes all button variants and loading states
 */
const Button = ({
  children,
  isLoading = false,
  disabled = false,
  className = "",
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  ...props
}) => {
  const baseClasses =
    "transition-all duration-200 flex items-center justify-center gap-2";

  const variantClasses = {
    primary: "bg-primary-500 hover:bg-primary-600 text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    outline: "border border-primary-500 text-primary-500 hover:bg-primary-50",
    ghost: "text-primary-500 hover:bg-primary-50",
    danger: "bg-red-500 hover:bg-red-600 text-white",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseClasses}
        ${variantClasses[variant] || variantClasses.primary}
        ${sizeClasses[size] || sizeClasses.md}
        ${disabled || isLoading ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {isLoading && <FaSpinner className="animate-spin" size={16} />}
      {children}
    </button>
  );
};

// Re-export as LoadingButton for backward compatibility
export { Button as LoadingButton };
export default Button;
