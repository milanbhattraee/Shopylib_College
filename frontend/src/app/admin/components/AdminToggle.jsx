"use client";
import React from "react";

export default function AdminToggle({ label, checked, onChange, className = "" }) {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${className}`}>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-blue-500" : "bg-gray-300"}`} />
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-sm text-gray-700 font-medium">{label}</span>
    </label>
  );
}
