import React from "react";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
