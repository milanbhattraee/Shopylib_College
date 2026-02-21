"use client";
import React from "react";
import Link from "next/link";
import { FaHeart, FaRegHeart, FaStar, FaShoppingCart } from "react-icons/fa";
import { useAuth } from "@/app/provider/AuthProvider";
import { useCheckWishlist, useAddToWishlist, useRemoveFromWishlist } from "@/app/hooks/useProtected";
import { useAddToCart } from "@/app/hooks/useProtected";

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const { data: wishlistCheck } = useCheckWishlist(product?.id);
  const addWishlist = useAddToWishlist();
  const removeWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

  const isWishlisted = wishlistCheck?.data?.isInWishlist;

  const image = product?.images?.[0]?.url || product?.image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' fill='%23f3f4f6'%3E%3Crect width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";
  const discount = product?.discount || 0;
  const price = product?.price || 0;
  const discountedPrice = discount > 0 ? (price - (price * discount) / 100).toFixed(0) : price;
  const avgRating = product?.averageRating || product?.avgRating || 0;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isWishlisted) {
      removeWishlist.mutate(product.id);
    } else {
      addWishlist.mutate({ productId: product.id });
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  return (
    <Link href={`/products/${product?.slug || product?.id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={image}
            alt={product?.name || "Product"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{discount}%
            </span>
          )}
          {isAuthenticated && (
            <button
              onClick={handleWishlist}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow hover:scale-110 transition"
            >
              {isWishlisted ? (
                <FaHeart className="w-4 h-4 text-red-500" />
              ) : (
                <FaRegHeart className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          {isAuthenticated && (
            <button
              onClick={handleAddToCart}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary-dark"
            >
              <FaShoppingCart className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex-1 flex flex-col">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product?.Category?.name || product?.category?.name || (typeof product?.category === "string" ? product?.category : "") || ""}</p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 flex-1">{product?.name}</h3>
          <div className="flex items-center gap-1 mb-2">
            <FaStar className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-gray-600">{Number(avgRating).toFixed(1)}</span>
            {product?.reviewCount > 0 && <span className="text-xs text-gray-400">({product.reviewCount})</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">Rs. {discountedPrice}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">Rs. {price}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
