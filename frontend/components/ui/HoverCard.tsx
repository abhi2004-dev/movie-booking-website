import React from "react";

export function HoverCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer ${className}`}>
      {children}
    </div>
  );
}