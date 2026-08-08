import React, { useState, createContext, useContext } from "react";

const SheetContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ open: false, setOpen: () => {} });

export const Sheet = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      <div className="relative">{children}</div>
    </SheetContext.Provider>
  );
};

export const SheetTrigger = ({ children, asChild, ...props }: any) => {
  const { setOpen } = useContext(SheetContext);
  return (
    <div
      className="inline-block cursor-pointer md:hidden"
      onClick={() => setOpen((prev) => !prev)}
      {...props}
    >
      {children}
    </div>
  );
};

export const SheetContent = ({ children, className = "" }: any) => {
  const { open, setOpen } = useContext(SheetContext);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 md:hidden">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={() => setOpen(false)} />
      
      <div className={`relative z-10 bg-white dark:bg-gray-900 h-full w-3/4 max-w-xs p-6 shadow-xl flex flex-col gap-4 ${className}`}>
        <button
          onClick={() => setOpen(false)}
          className="self-end text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-semibold"
        >
          ✕ Close
        </button>
        {children}
      </div>
    </div>
  );
};

export const SheetHeader = ({ children }: any) => <div className="mb-2">{children}</div>;
export const SheetTitle = ({ children }: any) => <h2 className="text-lg font-semibold">{children}</h2>;
export const SheetDescription = ({ children }: any) => <p className="text-sm text-gray-500">{children}</p>;