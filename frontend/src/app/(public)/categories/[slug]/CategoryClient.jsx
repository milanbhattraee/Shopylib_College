"use client";
import React, { useState } from "react";
import Link from "next/link";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary transition">Home</Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">{category?.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{category?.name}</h1>
          {category?.description && (
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split("-");
              setSortBy(sb);
              setSortOrder(so);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="price-ASC">Price: Low to High</option>
            <option value="price-DESC">Price: High to Low</option>
            <option value="name-ASC">Name: A-Z</option>
          </select>
        </div>
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
          {pagination && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <p className="text-gray-500 text-center py-16">No products found in this category.</p>
      )}
    </div>
  );
}
