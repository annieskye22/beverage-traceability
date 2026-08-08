import React from "react";

export const AlertDialog = ({ children }: any) => <div>{children}</div>;
export const AlertDialogTrigger = ({ children, asChild, ...props }: any) => (
  <div className="inline-block cursor-pointer" {...props}>{children}</div>
);
export const AlertDialogContent = ({ children, className = "" }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className={`bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full shadow-xl ${className}`}>
      {children}
    </div>
  </div>
);
export const AlertDialogHeader = ({ children }: any) => <div className="mb-3">{children}</div>;
export const AlertDialogTitle = ({ children }: any) => <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{children}</h2>;
export const AlertDialogDescription = ({ children }: any) => <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{children}</p>;
export const AlertDialogFooter = ({ children }: any) => <div className="mt-6 flex justify-end gap-3">{children}</div>;
export const AlertDialogAction = ({ children, onClick, className = "", ...props }: any) => (
  <button onClick={onClick} className={`px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition ${className}`} {...props}>
    {children}
  </button>
);
export const AlertDialogCancel = ({ children, onClick, className = "", ...props }: any) => (
  <button onClick={onClick} className={`px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition dark:bg-gray-800 dark:text-gray-300 ${className}`} {...props}>
    {children}
  </button>
);