"use client";
import React, { useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiSearch, FiX, FiPackage } from "react-icons/fi";
import ProductCard from "@/app/components/ui/ProductCard";
import Pagination from "@/app/components/ui/Pagination";
import { SkeletonGrid, Loader } from "@/app/components/ui/Loader";
import { useSearchProducts } from "@/app/hooks/useProducts";
import SearchFilters from "./SearchFilters";
import MobileFilterSheet, { MobileFilterButton } from "./MobileFilterSheet";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── All state from URL (shareable / bookmarkable) ──
  const q = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";
  const inStockParam = searchParams.get("inStock") || "";
  const sortByParam = searchParams.get("sortBy") || "relevance";
  const sortOrderParam = searchParams.get("sortOrder") || "DESC";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── API call ──
  const params = {
    q,
    page: pageParam,
    limit: 12,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
    ...(categoryParam && { category: categoryParam }),
    ...(minPriceParam && { minPrice: minPriceParam }),
    ...(maxPriceParam && { maxPrice: maxPriceParam }),
    ...(inStockParam && { inStock: inStockParam }),
  };
  const { data, isLoading, isFetching } = useSearchProducts(params);
  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination;
  const filtersMeta = data?.data?.filters;

  // ── URL updater (preserves all existing params) ──
  const updateURL = useCallback(
    (updates) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) sp.delete(key);
        else sp.set(key, String(value));
      });
      // Reset page when filters change (except page itself)
      if (!("page" in updates)) sp.set("page", "1");
      router.push(`/search?${sp.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  // ── Filter change handler ──
  const handleFilterChange = useCallback(
    (key, value) => {
      if (key === "category") {
        updateURL({ category: value });
      } else if (key === "priceRange") {
        updateURL({ minPrice: value.min, maxPrice: value.max });
      } else if (key === "inStock") {
        updateURL({ inStock: value });
      } else if (key === "sort") {
        updateURL({ sortBy: value.sortBy, sortOrder: value.sortOrder });
      }
    },
    [updateURL]
  );

  const handleClearAll = useCallback(() => {
    router.push(`/search?q=${encodeURIComponent(q)}`, { scroll: false });
  }, [q, router]);

  const handlePageChange = useCallback(
    (newPage) => {
      updateURL({ page: newPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateURL]
  );

  // ── Active filter chips for results header ──
  const activeFilters = [];
  if (categoryParam && filtersMeta?.categories) {
    const cat = filtersMeta.categories.find((c) => c.id === categoryParam);
    if (cat) activeFilters.push({ key: "category", label: cat.name, clear: () => handleFilterChange("category", "") });
  }
  if (minPriceParam || maxPriceParam) {
    const label = `Rs. ${minPriceParam || 0} – Rs. ${maxPriceParam || "∞"}`;
    activeFilters.push({ key: "price", label, clear: () => updateURL({ minPrice: "", maxPrice: "" }) });
  }
  if (inStockParam === "true") {
    activeFilters.push({ key: "inStock", label: "In Stock", clear: () => handleFilterChange("inStock", "") });
  }

  const hasActiveFilters = activeFilters.length > 0;

  const filterProps = {
    filtersMeta,
    activeCategory: categoryParam,
    activeMinPrice: minPriceParam,
    activeMaxPrice: maxPriceParam,
    activeInStock: inStockParam,
    activeSortBy: sortByParam,
    activeSortOrder: sortOrderParam,
    onFilterChange: handleFilterChange,
    onClearAll: handleClearAll,
    totalItems: pagination?.totalItems || 0,
    totalBeforeFilters: filtersMeta?.totalBeforeFilters || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top loading bar */}
      {isFetching && !isLoading && (
        <div className="fixed top-16 left-0 right-0 z-30 h-0.5">
          <div className="h-full bg-primary animate-pulse rounded-full" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600 font-medium">Search</span>
        </nav>

        {/* Results header */}
        {q && (
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  {pagination?.totalItems || 0} result{(pagination?.totalItems || 0) !== 1 ? "s" : ""} for{" "}
                  <span className="text-primary">&ldquo;{q}&rdquo;</span>
                </>
              )}
            </h1>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {activeFilters.map((f) => (
                  <span key={f.key} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {f.label}
                    <button onClick={f.clear} className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors">
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleClearAll}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-6">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto shadow-sm">
              <SearchFilters {...filterProps} />
            </div>
          </aside>

          {/* ── Results Grid ── */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <SkeletonGrid count={12} />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                  {q ? (
                    <FiSearch className="w-8 h-8 text-gray-300" />
                  ) : (
                    <FiPackage className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {q ? "No products found" : "Start searching"}
                </h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  {q
                    ? hasActiveFilters
                      ? "Try removing some filters or searching for something else."
                      : "We couldn't find anything matching your search. Try different keywords."
                    : "Use the search bar above to find products."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="mt-4 px-5 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Sheet ── */}
      <MobileFilterButton
        onClick={() => setMobileFiltersOpen(true)}
        hasActiveFilters={hasActiveFilters}
      />
      <MobileFilterSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        {...filterProps}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SearchContent />
    </Suspense>
  );
}
