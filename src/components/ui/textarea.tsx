import React from "react";

export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none dark:bg-gray-800" {...props} />
);