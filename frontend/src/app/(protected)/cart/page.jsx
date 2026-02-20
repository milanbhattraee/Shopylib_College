"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FiTrash2, FiShoppingBag } from "react-icons/fi";
import { useCart, useUpdateCart, useRemoveFromCart, useApplyCoupon } from "@/app/hooks/useProtected";
import QuantitySelector from "@/app/components/ui/QuantitySelector";
import { Loader } from "@/app/components/ui/Loader";

export default function CartPage() {
  const { data, isLoading } = useCart();
  const updateCart = useUpdateCart();
  const removeFromCart = useRemoveFromCart();
  const applyCoupon = useApplyCoupon();
  const [couponCode, setCouponCode] = useState("");

  const items = data?.data || [];

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.price || 0;
    return sum + parseFloat(price) * item.quantity;
  }, 0);

  const shippingAmount = 180;

  const handleQuantityChange = (cartItemId, quantity) => {
    updateCart.mutate({ cartItemId, quantity });
  };

  const handleRemove = (cartItemId) => {
    removeFromCart.mutate(cartItemId);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    applyCoupon.mutate({
      couponCodes: [couponCode.trim().toUpperCase()],
      cartItems: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        product: item.product,
        variant: item.variant,
      })),
    });
  };

  const discount = applyCoupon.data?.totalDiscountAmount || 0;
  const total = subtotal + shippingAmount - discount;

  if (isLoading) return <Loader />;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <FiShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">Your cart is empty</p>
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center justify-center bg-blue-500 h-12 text-white px-8 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div>
          {/* Cart Items */}
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const product = item.product || {};
              const variant = item.variant;
              const image = product.images?.[0]?.url || variant?.images?.[0]?.url || "/placeholder.png";
              const price = parseFloat(variant?.price || product.price || 0);

              return (
                <div key={item.id} className="flex gap-4 py-5">
                  <Link href={`/products/${product.slug || product.id}`} className="shrink-0">
                    <img src={image} alt={product.name} className="w-20 h-20 object-cover rounded-lg border" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.slug || product.id}`}>
                      <h3 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    {variant?.name && <p className="text-xs text-gray-500 mt-0.5">Variant: {variant.name}</p>}
                    <p className="text-sm font-bold text-blue-600 mt-1">Rs. {price}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <QuantitySelector
                        quantity={item.quantity}
                        onChange={(qty) => handleQuantityChange(item.id, qty)}
                        max={variant?.stockQuantity || product.stockQuantity || 99}
                      />
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-red-400 hover:text-red-600 transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gray-800">Rs. {(price * item.quantity).toFixed(0)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon & Summary */}
          <div className="border-t border-gray-100 pt-6 mt-2">
            <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-5">
              {/* Floating label coupon input */}
              <div className="relative flex-1 h-10">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0"
                  placeholder=" "
                />
                <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500">
                  Coupon Code
                </label>
              </div>
              <button
                type="submit"
                disabled={applyCoupon.isPending}
                className="cursor-pointer flex items-center justify-center bg-blue-500 h-10 text-white px-5 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-sm font-semibold disabled:opacity-50"
              >
                Apply
              </button>
            </form>

            {applyCoupon.isSuccess && applyCoupon.data?.success && (
              <p className="text-green-600 text-sm mb-3">
                {applyCoupon.data?.message || "Coupon applied!"} — Discount: Rs. {applyCoupon.data?.totalDiscountAmount}
              </p>
            )}
            {applyCoupon.isSuccess && !applyCoupon.data?.success && (
              <p className="text-red-500 text-sm mb-3">{applyCoupon.data?.message || "Coupon not valid"}</p>
            )}
            {applyCoupon.isError && (
              <p className="text-red-500 text-sm mb-3">{applyCoupon.error?.response?.data?.message || "Invalid coupon"}</p>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-semibold text-gray-800">Rs. {subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-700">Rs. {shippingAmount}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="text-green-600 font-medium">- Rs. {discount}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total</span>
              <span className="text-xl font-bold text-blue-600">Rs. {total.toFixed(0)}</span>
            </div>

            <Link
              href="/checkout"
              className="cursor-pointer w-full mt-5 flex justify-center items-center bg-blue-500 h-12 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
