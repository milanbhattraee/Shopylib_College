"use client";
import React from "react";
import Link from "next/link";
import { FiHeart, FiTrash2, FiShoppingCart } from "react-icons/fi";
import { useWishlist, useRemoveFromWishlist, useClearWishlist, useMoveToCart } from "@/app/hooks/useProtected";
import { Loader } from "@/app/components/ui/Loader";

export default function WishlistPage() {
  const { data, isLoading } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const clearWishlist = useClearWishlist();
  const moveToCart = useMoveToCart();

  const items = data?.data?.wishlistItems || data?.data || [];

  if (isLoading) return <Loader />;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700">My Wishlist</h1>
        {items.length > 0 && (
          <button
            onClick={() => clearWishlist.mutate()}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition"
          >
            Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">Your wishlist is empty</p>
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center justify-center bg-blue-500 h-12 text-white px-8 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const product = item.Product || item.product || item;
            const image = product.images?.[0]?.url || "/placeholder.png";
            const discount = product.comparePrice && product.comparePrice > product.price
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
              : 0;

            return (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
                <Link href={`/products/${product.slug || product.id}`} className="shrink-0">
                  <img src={image} alt={product.name} className="w-24 h-24 object-cover rounded-lg border" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${product.slug || product.id}`}>
                    <h3 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2">{product.name}</h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-blue-600">Rs. {product.price}</span>
                    {discount > 0 && (
                      <>
                        <span className="text-xs text-gray-400 line-through">Rs. {product.comparePrice}</span>
                        <span className="text-xs text-red-500 font-semibold">-{discount}%</span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => moveToCart.mutate({ wishlistItemId: item.id, quantity: 1 })}
                      disabled={moveToCart.isPending}
                      className="cursor-pointer flex items-center gap-1 bg-blue-500 h-8 text-white px-3 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-xs font-semibold disabled:opacity-50"
                    >
                      <FiShoppingCart className="w-3 h-3" /> Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist.mutate(item.id)}
                      className="cursor-pointer flex items-center gap-1 bg-gray-200 h-8 text-gray-700 px-3 rounded-lg border-gray-400 border-b-[4px] hover:brightness-100 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-xs font-semibold"
                    >
                      <FiTrash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
