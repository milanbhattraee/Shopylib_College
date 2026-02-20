"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAdminProducts, useDeleteProduct, useRestoreProduct } from "@/app/hooks/useAdmin";
import AdminTable from "@/app/admin/components/AdminTable";
import AdminSearch from "@/app/admin/components/AdminSearch";
import AdminPagination from "@/app/admin/components/AdminPagination";
import StatusBadge from "@/app/admin/components/StatusBadge";
import AdminButton from "@/app/admin/components/AdminButton";
import { IoAdd, IoTrash, IoRefresh } from "react-icons/io5";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminProducts({ page, limit: 10, search: search || undefined });
  const deleteProduct = useDeleteProduct();
  const restoreProduct = useRestoreProduct();

  const products = data?.data?.products || data?.data || [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (row) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          {row.images?.[0]?.url ? (
            <img src={row.images[0].url} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
          )}
        </div>
      ),
    },
    { key: "name", label: "Name" },
    { key: "sku", label: "SKU" },
    {
      key: "price",
      label: "Price",
      render: (row) => <span>Rs. {row.price}</span>,
    },
    {
      key: "stockQuantity",
      label: "Stock",
      render: (row) => (
        <span className={row.stockQuantity <= (row.lowStockThreshold || 5) ? "text-red-500 font-semibold" : ""}>
          {row.stockQuantity}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} />,
    },
    {
      key: "isFeatured",
      label: "Featured",
      render: (row) => row.isFeatured ? <StatusBadge status="active" label="Yes" /> : <span className="text-gray-400">No</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Link
            href={`/admin/products/${row.id}/edit`}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium hover:underline"
          >
            Edit
          </Link>
          {row.deletedAt ? (
            <button
              onClick={() => restoreProduct.mutate(row.id)}
              className="text-emerald-500 hover:text-emerald-700 text-sm font-medium cursor-pointer"
            >
              <IoRefresh size={16} />
            </button>
          ) : (
            <button
              onClick={() => {
                if (confirm("Delete this product?")) deleteProduct.mutate(row.id);
              }}
              className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
            >
              <IoTrash size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Products</h1>
        <Link href="/admin/products/create">
          <AdminButton>
            <IoAdd size={20} className="mr-2" /> Add Product
          </AdminButton>
        </Link>
      </div>

      <div className="mb-6">
        <AdminSearch value={search} onChange={setSearch} placeholder="Search products..." className="max-w-md" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <AdminTable columns={columns} data={products} />
          {pagination && (
            <AdminPagination
              currentPage={pagination.currentPage || page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </div>
  );
}
