"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
import ProductCard from "@/app/components/ui/ProductCard";
import Pagination from "@/app/components/ui/Pagination";
import { SkeletonGrid } from "@/app/components/ui/Loader";
import { useCategoryBySlug } from "@/app/hooks/useProducts";

export default function CategoryClient({ category, initialProducts, initialPagination, slug }) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");

  const { data, isLoading } = useCategoryBySlug(slug, { page, limit: 12, sortBy, sortOrder });

  const products = page === 1 && sortBy === "createdAt" && sortOrder === "DESC" && initialProducts.length > 0
    ? initialProducts
    : (data?.data?.products || []);
  const pagination = data?.data?.pagination || initialPagination;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3 text-gray-300" />
          <span className="text-gray-700 font-medium">{category?.name}</span>
        </nav>

        {/* Header with banner */}
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/5 via-blue-50 to-primary/10 p-6 sm:p-8">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{category?.name}</h1>
            {category?.description && (
              <p className="text-sm text-gray-500 mt-2 max-w-2xl">{category.description}</p>
            )}
            {pagination && (
              <p className="text-xs text-gray-400 mt-3">{pagination.totalItems} product{pagination.totalItems !== 1 ? "s" : ""} found</p>
            )}
          </div>
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5" />
          <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-blue-100/50" />
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {products.length > 0 && `Showing ${products.length} of ${pagination?.totalItems || products.length}`}
          </p>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split("-");
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary bg-white shadow-sm transition-colors"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="price-ASC">Price: Low to High</option>
            <option value="price-DESC">Price: High to Low</option>
            <option value="name-ASC">Name: A–Z</option>
          </select>
        </div>

        {isLoading ? (
          <SkeletonGrid count={12} />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛍️</span>
            </div>
            <p className="text-gray-500 font-medium">No products found in this category.</p>
            <Link href="/" className="inline-block mt-4 text-sm text-primary hover:underline">Browse all products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
