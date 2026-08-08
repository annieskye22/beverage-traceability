import React from "react";

export const Dialog = ({ children }: any) => <div>{children}</div>;
export const DialogTrigger = ({ children, ...props }: any) => <div className="inline-block" {...props}>{children}</div>;
export const DialogContent = ({ children, className = "" }: any) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4`}>
    <div className={`bg-white dark:bg-gray-900 rounded-lg p-6 max-w-lg w-full shadow-xl ${className}`}>{children}</div>
  </div>
);
export const DialogHeader = ({ children }: any) => <div className="mb-4">{children}</div>;
export const DialogTitle = ({ children }: any) => <h3 className="text-lg font-semibold">{children}</h3>;