"use client";
import React, { useState, useEffect, useCallback } from "react";
import { FiX, FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";

// ── Price Range Slider (dual-thumb, CSS-only) ──
function DualRangeSlider({ min, max, valueMin, valueMax, onChange }) {
  const [localMin, setLocalMin] = useState(valueMin ?? min);
  const [localMax, setLocalMax] = useState(valueMax ?? max);

  useEffect(() => {
    setLocalMin(valueMin ?? min);
    setLocalMax(valueMax ?? max);
  }, [valueMin, valueMax, min, max]);

  const range = max - min || 1;
  const leftPercent = ((localMin - min) / range) * 100;
  const rightPercent = ((localMax - min) / range) * 100;

  const handleMinChange = (e) => {
    const v = Math.min(Number(e.target.value), localMax - 1);
    setLocalMin(v);
  };
  const handleMaxChange = (e) => {
    const v = Math.max(Number(e.target.value), localMin + 1);
    setLocalMax(v);
  };

  const applyRange = () => {
    onChange(localMin, localMax);
  };

  if (min === max) return null;

  return (
    <div className="space-y-4">
      {/* Track */}
      <div className="relative h-1.5 bg-gray-200 rounded-full mt-2">
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{ left: `${leftPercent}%`, width: `${rightPercent - leftPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMin}
          onChange={handleMinChange}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{ top: 0 }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={localMax}
          onChange={handleMaxChange}
          className="absolute w-full h-1.5 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer"
          style={{ top: 0 }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-medium tabular-nums">Rs. {localMin.toLocaleString()}</span>
        <span className="font-medium tabular-nums">Rs. {localMax.toLocaleString()}</span>
      </div>

      {/* Apply button */}
      {(localMin !== (valueMin ?? min) || localMax !== (valueMax ?? max)) && (
        <button
          onClick={applyRange}
          className="w-full py-1.5 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
        >
          Apply Price Range
        </button>
      )}
    </div>
  );
}

// ── Toggle Switch ──
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

// ── Section Wrapper (collapsible) ──
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-1 text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors"
      >
        {title}
        {open ? <FiChevronUp className="w-4 h-4 text-gray-400" /> : <FiChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          open ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ── Main SearchFilters Component ──
export default function SearchFilters({
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
  const categories = filtersMeta?.categories || [];
  const priceRange = filtersMeta?.priceRange || { min: 0, max: 0 };

  const hasActiveFilters = activeCategory || activeMinPrice || activeMaxPrice || activeInStock;

  const sortOptions = [
    { label: "Relevance", sortBy: "relevance", sortOrder: "DESC" },
    { label: "Price: Low → High", sortBy: "price", sortOrder: "ASC" },
    { label: "Price: High → Low", sortBy: "price", sortOrder: "DESC" },
    { label: "Newest First", sortBy: "createdAt", sortOrder: "DESC" },
    { label: "Name: A → Z", sortBy: "name", sortOrder: "ASC" },
  ];

  const currentSort = `${activeSortBy || "relevance"}-${activeSortOrder || "DESC"}`;

  return (
    <div className="space-y-4">
      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          <FiX className="w-3.5 h-3.5" />
          Clear all filters
        </button>
      )}

      {/* Category Chips */}
      {categories.length > 0 && (
        <FilterSection title="Category">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onFilterChange("category", "")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                !activeCategory
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onFilterChange("category", activeCategory === cat.id ? "" : cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.name}
                <span className="ml-1 opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      {priceRange.max > 0 && (
        <FilterSection title="Price Range">
          <DualRangeSlider
            min={priceRange.min}
            max={priceRange.max}
            valueMin={activeMinPrice ? parseInt(activeMinPrice) : priceRange.min}
            valueMax={activeMaxPrice ? parseInt(activeMaxPrice) : priceRange.max}
            onChange={(min, max) => {
              onFilterChange("priceRange", { min, max });
            }}
          />
        </FilterSection>
      )}

      {/* In Stock */}
      <FilterSection title="Availability">
        <ToggleSwitch
          checked={activeInStock === "true"}
          onChange={(val) => onFilterChange("inStock", val ? "true" : "")}
          label="In Stock Only"
        />
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Sort By">
        <div className="space-y-1">
          {sortOptions.map((opt) => {
            const key = `${opt.sortBy}-${opt.sortOrder}`;
            const isActive = currentSort === key;
            return (
              <button
                key={key}
                onClick={() => onFilterChange("sort", { sortBy: opt.sortBy, sortOrder: opt.sortOrder })}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  isActive ? "border-primary bg-primary" : "border-gray-300"
                }`}>
                  {isActive && <FiCheck className="w-2.5 h-2.5 text-white" />}
                </span>
                {opt.label}
              </button>
            );
          })}
        </div>
      </FilterSection>
    </div>
  );
}
