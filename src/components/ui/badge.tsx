import React from "react";

export const Badge = ({ children, className = "", variant = "default", ...props }: any) => {
  const variants: Record<string, string> = {
    default: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    secondary: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    outline: "border border-gray-300 text-gray-700 dark:text-gray-300",
    destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};