"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCouponUsage } from "@/app/hooks/useAdmin";
import AdminTable from "@/app/admin/components/AdminTable";
import AdminPagination from "@/app/admin/components/AdminPagination";
import { IoArrowBack } from "react-icons/io5";

export default function CouponUsagePage() {
  const { id } = useParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCouponUsage(id, { page, limit: 20 });

  const usage = data?.data?.usage || [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      key: "user",
      label: "User",
      render: (row) => row.User ? `${row.User.firstName} ${row.User.lastName}` : "—",
    },
    {
      key: "orderId",
      label: "Order",
      render: (row) => <span className="font-mono text-xs">#{row.orderId?.slice(0, 8)}</span>,
    },
    {
      key: "discountAmount",
      label: "Discount",
      render: (row) => <span className="font-medium text-emerald-600">Rs. {row.discountAmount}</span>,
    },
    {
      key: "createdAt",
      label: "Used At",
      render: (row) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="animate-fadeIn">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 hover:underline mb-4 cursor-pointer">
        <IoArrowBack /> Back to Coupons
      </button>

      <h1 className="text-3xl font-bold text-blue-700 mb-6">Coupon Usage</h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <AdminTable columns={columns} data={usage} emptyMessage="No usage records found" />
          {pagination && (
            <AdminPagination currentPage={pagination.currentPage || page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
