"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAdminCoupons, useDeleteCoupon, useRestoreCoupon } from "@/app/hooks/useAdmin";
import AdminTable from "@/app/admin/components/AdminTable";
import AdminButton from "@/app/admin/components/AdminButton";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { IoAdd, IoTrash, IoRefresh } from "react-icons/io5";

export default function CouponsPage() {
  const { data, isLoading } = useAdminCoupons();
  const deleteCoupon = useDeleteCoupon();
  const restoreCoupon = useRestoreCoupon();

  const coupons = data?.data?.coupons || data?.data || [];

  const columns = [
    {
      key: "code",
      label: "Code",
      render: (row) => <span className="font-mono font-semibold text-blue-600">{row.code}</span>,
    },
    { key: "name", label: "Name" },
    {
      key: "type",
      label: "Type",
      render: (row) => <StatusBadge status={row.type} />,
    },
    {
      key: "value",
      label: "Value",
      render: (row) => (
        <span className="font-medium">
          {row.type === "percentage" ? `${row.value}%` : `Rs. ${row.value}`}
        </span>
      ),
    },
    {
      key: "usage",
      label: "Usage",
      render: (row) => `${row.usageCount || 0} / ${row.usageLimit || "∞"}`,
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} />,
    },
    {
      key: "endDate",
      label: "Expires",
      render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Link href={`/admin/coupons/${row.id}/edit`} className="text-blue-500 hover:underline text-sm font-medium">
            Edit
          </Link>
          <Link href={`/admin/coupons/${row.id}/usage`} className="text-cyan-500 hover:underline text-sm font-medium">
            Usage
          </Link>
          {row.deletedAt ? (
            <button onClick={() => restoreCoupon.mutate(row.id)} className="text-emerald-500 cursor-pointer">
              <IoRefresh size={16} />
            </button>
          ) : (
            <button
              onClick={() => { if (confirm("Delete this coupon?")) deleteCoupon.mutate(row.id); }}
              className="text-red-500 cursor-pointer"
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
        <h1 className="text-3xl font-bold text-blue-700">Coupons</h1>
        <Link href="/admin/coupons/create">
          <AdminButton>
            <IoAdd size={20} className="mr-2" /> Add Coupon
          </AdminButton>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <AdminTable columns={columns} data={coupons} emptyMessage="No coupons found" />
      )}
    </div>
  );
}
