"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAdminOrders } from "@/app/hooks/useAdmin";
import AdminTable from "@/app/admin/components/AdminTable";
import AdminSearch from "@/app/admin/components/AdminSearch";
import AdminPagination from "@/app/admin/components/AdminPagination";
import StatusBadge from "@/app/admin/components/StatusBadge";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminOrders({
    page,
    limit: 10,
    status: status !== "all" ? status : undefined,
  });

  const orders = data?.data?.orders || data?.data || [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      key: "id",
      label: "Order ID",
      render: (row) => <span className="font-mono text-xs">#{row.id?.slice(0, 8)}</span>,
    },
    {
      key: "user",
      label: "Customer",
      render: (row) => row.user ? `${row.user.firstName} ${row.user.lastName}` : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "total",
      label: "Total",
      render: (row) => {
        const total = parseFloat(row.subtotal || 0) + parseFloat(row.shippingAmount || 0) - parseFloat(row.discountAmount || 0);
        return <span className="font-medium">Rs. {total.toFixed(2)}</span>;
      },
    },
    {
      key: "itemCount",
      label: "Items",
      render: (row) => row.items?.length || "—",
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="text-blue-500 hover:underline text-sm font-medium">
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Orders</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <AdminSearch value={search} onChange={setSearch} placeholder="Search orders..." className="max-w-md" />
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors cursor-pointer ${
                status === s ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <AdminTable columns={columns} data={orders} emptyMessage="No orders found" />
          {pagination && (
            <AdminPagination currentPage={pagination.page || page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
