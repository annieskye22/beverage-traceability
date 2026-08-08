import React from "react";

export const Select = ({ children, ...props }: any) => <div {...props}>{children}</div>;
export const SelectTrigger = ({ children, className = "", ...props }: any) => (
  <button className={`w-full px-3 py-2 border rounded-md flex justify-between items-center bg-white dark:bg-gray-800 ${className}`} {...props}>
    {children}
  </button>
);
export const SelectValue = ({ placeholder }: { placeholder?: string }) => <span>{placeholder || "Select option"}</span>;
export const SelectContent = ({ children }: any) => <div className="mt-1 border rounded-md shadow-lg bg-white dark:bg-gray-800 p-1">{children}</div>;
export const SelectItem = ({ children, value, ...props }: any) => (
  <div className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-sm text-sm" {...props}>
    {children}
  </div>
);