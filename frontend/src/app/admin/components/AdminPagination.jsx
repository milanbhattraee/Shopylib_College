"use client";
import React from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

export default function AdminPagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed text-blue-600 transition-colors"
      >
        <IoChevronBack size={18} />
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className="w-9 h-9 rounded-lg text-sm hover:bg-blue-50 text-gray-600">1</button>
          {start > 2 && <span className="text-gray-400 px-1">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            p === currentPage ? "bg-blue-500 text-white shadow" : "hover:bg-blue-50 text-gray-600"
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-gray-400 px-1">...</span>}
          <button onClick={() => onPageChange(totalPages)} className="w-9 h-9 rounded-lg text-sm hover:bg-blue-50 text-gray-600">{totalPages}</button>
        </>
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed text-blue-600 transition-colors"
      >
        <IoChevronForward size={18} />
      </button>
    </div>
  );
}
