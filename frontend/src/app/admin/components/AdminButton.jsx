"use client";
import React from "react";

export default function AdminButton({ children, variant = "primary", className = "", loading = false, ...props }) {
  const base = "cursor-pointer flex justify-center items-center h-12 px-6 py-2 rounded-lg font-medium transition-all duration-150";

  const variants = {
    primary:
      "bg-blue-500 text-white border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
    danger:
      "bg-red-500 text-white border-red-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
    success:
      "bg-emerald-500 text-white border-emerald-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
    secondary:
      "bg-gray-200 text-blue-600 border-gray-400 border-b-[4px] hover:brightness-100 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]",
    ghost:
      "bg-transparent text-blue-600 border border-blue-300 hover:bg-blue-50 active:bg-blue-100",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin h-5 w-5 mr-3 text-white">
          <circle strokeWidth="4" stroke="currentColor" r="10" cy="12" cx="12" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" className="opacity-75" />
        </svg>
      )}
      {children}
    </button>
  );
}
