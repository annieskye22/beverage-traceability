import React from "react";

export const Table = ({ children, className = "" }: any) => (
  <div className="w-full overflow-auto"><table className={`w-full text-left border-collapse ${className}`}>{children}</table></div>
);
export const TableHeader = ({ children }: any) => <thead className="border-b bg-gray-50 dark:bg-gray-800">{children}</thead>;
export const TableBody = ({ children }: any) => <tbody className="divide-y">{children}</tbody>;
export const TableRow = ({ children, className = "" }: any) => <tr className={`hover:bg-gray-50/50 dark:hover:bg-gray-800/50 ${className}`}>{children}</tr>;
export const TableHead = ({ children }: any) => <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">{children}</th>;
export const TableCell = ({ children }: any) => <td className="px-4 py-3 text-sm">{children}</td>;