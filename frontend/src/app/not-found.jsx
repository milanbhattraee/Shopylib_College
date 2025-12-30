import Link from "next/link";
import React from "react";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-white to-gray-200 px-4">
      
      {/* Glass Card */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/30 p-8 md:p-12 text-center">
        
        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-2xl bg-indigo-500/10 blur-2xl -z-10" />

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center shadow-inner">
            <span className="text-4xl">🛒</span>
          </div>
        </div>

        {/* 404 */}
        <h1 className="text-7xl md:text-8xl font-extrabold text-indigo-600 tracking-tight select-none">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-800">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-4 text-gray-600 leading-relaxed">
          The page you’re looking for doesn’t exist or may have been moved.
          Let’s get you back to shopping.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow-md hover:bg-indigo-700 transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Go to Homepage
          </Link>

          <Link
            href="/products"
            className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium shadow-sm hover:bg-gray-50 transition transform hover:scale-105"
          >
            Browse Products
          </Link>
        </div>

        {/* Search hint */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Looking for something specific?
          </p>
          <div className="h-10 flex items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 text-sm">
            Search bar component goes here
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
