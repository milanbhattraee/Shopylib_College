"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FiPackage, FiChevronRight } from "react-icons/fi";
import { useOrders } from "@/app/hooks/useProtected";
import Pagination from "@/app/components/ui/Pagination";
import { Loader } from "@/app/components/ui/Loader";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useOrders({ page, limit: 10 });

  const orders = data?.data?.orders || [];
  const pagination = data?.data?.pagination;

  if (isLoading) return <Loader />;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">You haven&apos;t placed any orders yet</p>
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center justify-center bg-blue-500 h-12 text-white px-8 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {orders.map((order) => {
            const orderTotal =
              parseFloat(order.subtotal || 0) +
              parseFloat(order.shippingAmount || 0) -
              parseFloat(order.discountAmount || 0);
            const itemCount = order.items?.length || 0;

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-4 py-4 hover:bg-gray-50 transition rounded-lg px-2"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-gray-800">
                      Order #{order.orderNumber || order.id?.slice(0, 8)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                    {itemCount > 0 && ` \u2022 ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-blue-600">Rs. {orderTotal.toFixed(0)}</p>
                  <FiChevronRight className="w-4 h-4 text-gray-400 ml-auto mt-1" />
                </div>
              </Link>
            );
          })}

          {pagination && pagination.totalPages > 1 && (
            <div className="pt-4">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
