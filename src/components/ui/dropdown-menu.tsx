import React, { useState } from "react";

export const DropdownMenu = ({ children }: any) => {
  return <div className="relative inline-block text-left">{children}</div>;
};

export const DropdownMenuTrigger = ({ children, asChild, ...props }: any) => {
  return (
    <div className="cursor-pointer inline-block" {...props}>
      {children}
    </div>
  );
};

export const DropdownMenuContent = ({ children, align = "right" }: any) => {
  return (
    <div
      className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50 p-1`}
    >
      {children}
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, className = "", ...props }: any) => {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};