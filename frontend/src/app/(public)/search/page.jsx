"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import ProductCard from "@/app/components/ui/ProductCard";
import Pagination from "@/app/components/ui/Pagination";
import { SkeletonGrid, Loader } from "@/app/components/ui/Loader";
import { useSearchProducts, useCategories } from "@/app/hooks/useProducts";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const minPriceParam = searchParams.get("minPrice") || "";
  const maxPriceParam = searchParams.get("maxPrice") || "";

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState(q);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];

  const params = {
    q,
    page,
    limit: 12,
    sortBy,
    sortOrder,
    ...(categoryParam && { category: categoryParam }),
    ...(minPriceParam && { minPrice: minPriceParam }),
    ...(maxPriceParam && { maxPrice: maxPriceParam }),
  };
  const { data, isLoading } = useSearchProducts(params);
  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
      setPage(1);
    }
  };

  const updateFilter = (key, value) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`/search?${sp.toString()}`);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Search</span>
      </nav>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex bg-white rounded-xl overflow-hidden border border-gray-200 mb-6 shadow-sm">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 px-5 py-3 outline-none text-sm"
          placeholder="Search products..."
        />
        <button type="submit" className="px-5 text-primary hover:text-primary-dark transition">
          <FaSearch className="w-5 h-5" />
        </button>
      </form>

      {q && <p className="text-sm text-gray-500 mb-4">Showing results for: <span className="font-semibold text-gray-700">&ldquo;{q}&rdquo;</span></p>}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-56 shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-5 lg:sticky lg:top-24">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
              <select
                value={categoryParam}
                onChange={(e) => updateFilter("category", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceParam}
                  onChange={(e) => updateFilter("minPrice", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceParam}
                  onChange={(e) => updateFilter("maxPrice", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
                />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Sort By</h3>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split("-");
                  setSortBy(sb);
                  setSortOrder(so);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none"
              >
                <option value="createdAt-DESC">Newest</option>
                <option value="price-ASC">Price: Low to High</option>
                <option value="price-DESC">Price: High to Low</option>
                <option value="name-ASC">Name: A-Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <SkeletonGrid count={12} />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {pagination && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{q ? "No products found matching your search." : "Enter a search term to find products."}</p>
            </div>
          )}
        </div>
      </div>
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
