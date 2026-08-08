import React from "react";

export const Label = ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1" {...props}>
      {children}
    </label>
  );
};