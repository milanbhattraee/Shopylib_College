"use client";
import React from "react";
import { useAdminProducts, useAdminOrders, useAdminReviews } from "@/app/hooks/useAdmin";
import { useAdminCategories } from "@/app/hooks/useAdmin";
import {
  IoCubeOutline,
  IoLayersOutline,
  IoCartOutline,
  IoStarOutline,
  IoPricetagOutline,
  IoPeopleOutline,
} from "react-icons/io5";
import Link from "next/link";

const StatCard = ({ icon: Icon, label, value, color, href }) => (
  <Link
    href={href}
    className="bg-white rounded-2xl shadow-xl p-6 flex items-center gap-4 hover:shadow-2xl transition-shadow cursor-pointer"
  >
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={28} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value ?? "—"}</p>
    </div>
  </Link>
);

export default function AdminDashboard() {
  const products = useAdminProducts({ limit: 1 });
  const categories = useAdminCategories();
  const orders = useAdminOrders({ limit: 1 });
  const reviews = useAdminReviews({ limit: 1 });

  const productCount = products.data?.data?.pagination?.totalItems ?? products.data?.data?.length ?? "—";
  const categoryCount = Array.isArray(categories.data?.data) ? categories.data.data.length : "—";
  const orderCount = orders.data?.data?.pagination?.totalItems ?? orders.data?.data?.length ?? "—";
  const reviewCount = reviews.data?.data?.pagination?.totalItems ?? reviews.data?.data?.length ?? "—";

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={IoCubeOutline} label="Products" value={productCount} color="bg-blue-500" href="/admin/products" />
        <StatCard icon={IoLayersOutline} label="Categories" value={categoryCount} color="bg-emerald-500" href="/admin/categories" />
        <StatCard icon={IoCartOutline} label="Orders" value={orderCount} color="bg-purple-500" href="/admin/orders" />
        <StatCard icon={IoStarOutline} label="Reviews" value={reviewCount} color="bg-amber-500" href="/admin/reviews" />
        <StatCard icon={IoPricetagOutline} label="Coupons" value="—" color="bg-cyan-500" href="/admin/coupons" />
        <StatCard icon={IoPeopleOutline} label="Users" value="—" color="bg-rose-500" href="/admin/users" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-700">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-blue-500 hover:underline">
            View All
          </Link>
        </div>
        {orders.isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : orders.data?.data?.orders?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50 border-b border-blue-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-blue-700 uppercase">Order ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-blue-700 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-blue-700 uppercase">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-blue-700 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.data.data.orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-blue-50/50">
                    <td className="px-4 py-3 text-sm text-gray-700 font-mono">#{order.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">Rs. {order.totalAmount}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
}
