"use client";
import React, { useEffect, useRef } from "react";
import { FiX, FiSliders } from "react-icons/fi";
import SearchFilters from "./SearchFilters";

export function MobileFilterButton({ onClick, hasActiveFilters }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-full shadow-xl hover:bg-primary-dark transition-all active:scale-95"
    >
      <FiSliders className="w-4 h-4" />
      <span className="text-sm font-semibold">Filters</span>
      {hasActiveFilters && (
        <span className="w-2 h-2 rounded-full bg-red-400 absolute top-2 right-2" />
      )}
    </button>
  );
}

export default function MobileFilterSheet({
  isOpen,
  onClose,
  filtersMeta,
  activeCategory,
  activeMinPrice,
  activeMaxPrice,
  activeInStock,
  activeSortBy,
  activeSortOrder,
  onFilterChange,
  onClearAll,
  totalItems,
  totalBeforeFilters,
}) {
  const sheetRef = useRef(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on backdrop click
  const handleBackdropClick = (e) => {
    if (sheetRef.current && !sheetRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg bg-white rounded-t-2xl shadow-2xl animate-slideUp max-h-[85vh] flex flex-col"
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Filters & Sort</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <SearchFilters
            filtersMeta={filtersMeta}
            activeCategory={activeCategory}
            activeMinPrice={activeMinPrice}
            activeMaxPrice={activeMaxPrice}
            activeInStock={activeInStock}
            activeSortBy={activeSortBy}
            activeSortOrder={activeSortOrder}
            onFilterChange={(key, value) => {
              onFilterChange(key, value);
            }}
            onClearAll={onClearAll}
            totalItems={totalItems}
            totalBeforeFilters={totalBeforeFilters}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 flex gap-3">
          <button
            onClick={() => {
              onClearAll();
              onClose();
            }}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors"
          >
            Show {totalItems} Result{totalItems !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
