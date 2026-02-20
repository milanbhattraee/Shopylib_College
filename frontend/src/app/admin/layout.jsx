"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/provider/AuthProvider";
import {
  IoGridOutline,
  IoCubeOutline,
  IoLayersOutline,
  IoCartOutline,
  IoPricetagOutline,
  IoPeopleOutline,
  IoStarOutline,
  IoChevronBack,
  IoChevronForward,
  IoLogOutOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { useLogout } from "@/app/hooks/useAuth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: IoGridOutline },
  { href: "/admin/products", label: "Products", icon: IoCubeOutline },
  { href: "/admin/categories", label: "Categories", icon: IoLayersOutline },
  { href: "/admin/orders", label: "Orders", icon: IoCartOutline },
  { href: "/admin/coupons", label: "Coupons", icon: IoPricetagOutline },
  { href: "/admin/users", label: "Users", icon: IoPeopleOutline },
  { href: "/admin/reviews", label: "Reviews", icon: IoStarOutline },
];

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const logout = useLogout();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] text-center">
          <IoShieldCheckmarkOutline className="text-6xl text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-700 mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-6">You don&apos;t have permission to access the admin panel.</p>
          <button
            onClick={() => router.push("/")}
            className="cursor-pointer bg-blue-500 h-12 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white shadow-xl z-40 flex flex-col transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
          {!collapsed && (
            <Link href="/admin" className="text-xl font-bold text-blue-700">
              Shopylib
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors ml-auto"
          >
            {collapsed ? <IoChevronForward size={18} /> : <IoChevronBack size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(href)
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-100 p-3">
          {!collapsed && (
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={() => logout.mutate()}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <IoLogOutOutline size={20} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-20" : "ml-64"}`}>
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
