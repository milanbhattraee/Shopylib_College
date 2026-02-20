"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import { FaUser, FaShoppingBag, FaHeart, FaStar, FaShoppingCart } from "react-icons/fa";

const sidebarLinks = [
  { href: "/profile", label: "My Profile", icon: FaUser },
  { href: "/orders", label: "Orders", icon: FaShoppingBag },
  { href: "/cart", label: "Cart", icon: FaShoppingCart },
  { href: "/wishlist", label: "Wishlist", icon: FaHeart },
  { href: "/reviews", label: "Reviews", icon: FaStar },
];

export default function ProtectedLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className="md:w-56 shrink-0">
              <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden md:sticky md:top-24">
                {sidebarLinks.map((link) => {
                  const active = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition border-b border-gray-50 last:border-0 ${
                        active
                          ? "bg-primary/5 text-primary border-l-3 border-l-primary"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }`}
                    >
                      <link.icon className="w-4 h-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
