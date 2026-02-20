"use client";
import React from "react";

const statusColors = {
  // Order statuses
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-700 border-blue-300",
  processing: "bg-indigo-100 text-indigo-700 border-indigo-300",
  shipped: "bg-purple-100 text-purple-700 border-purple-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  cancelled: "bg-red-100 text-red-700 border-red-300",
  refunded: "bg-orange-100 text-orange-700 border-orange-300",
  // General
  active: "bg-emerald-100 text-emerald-700 border-emerald-300",
  inactive: "bg-gray-100 text-gray-600 border-gray-300",
  true: "bg-emerald-100 text-emerald-700 border-emerald-300",
  false: "bg-gray-100 text-gray-600 border-gray-300",
  admin: "bg-blue-100 text-blue-700 border-blue-300",
  customer: "bg-gray-100 text-gray-600 border-gray-300",
  // Coupon
  percentage: "bg-cyan-100 text-cyan-700 border-cyan-300",
  fixed: "bg-teal-100 text-teal-700 border-teal-300",
};

export default function StatusBadge({ status, label }) {
  const key = String(status).toLowerCase();
  const color = statusColors[key] || "bg-gray-100 text-gray-600 border-gray-300";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} capitalize`}>
      {label || status}
    </span>
  );
}
