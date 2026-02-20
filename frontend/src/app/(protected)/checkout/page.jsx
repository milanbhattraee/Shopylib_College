"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCart, useCreateOrder, useApplyCoupon } from "@/app/hooks/useProtected";
import { Loader } from "@/app/components/ui/Loader";

const inputClass =
  "peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0";

const labelClass =
  "before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500";

function FloatingInput({ label, error, register, ...props }) {
  return (
    <div>
      <div className="relative w-full h-10">
        <input className={inputClass} placeholder=" " {...register} {...props} />
        <label className={labelClass}>{label}</label>
      </div>
      {error && <p className="text-red-500 text-xs px-3 mt-1">{error}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cartData, isLoading } = useCart();
  const createOrder = useCreateOrder();
  const applyCoupon = useApplyCoupon();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [paymentMethod, setPaymentMethod] = useState("cashOnDelivery");
  const [couponCode, setCouponCode] = useState("");

  const items = cartData?.data || [];

  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.price || 0;
    return sum + parseFloat(price) * item.quantity;
  }, 0);

  const shippingAmount = 180;
  const discount = applyCoupon.data?.totalDiscountAmount || 0;
  const total = subtotal + shippingAmount - discount;

  const handleApplyCoupon = () => {
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

  const onSubmit = (data) => {
    const orderData = {
      items: items.map((item) => item.id),
      phone: data.phone,
      address: {
        province: data.province,
        city: data.city,
        fullAddress: data.fullAddress,
      },
      paymentMethod,
      notes: data.notes || undefined,
      couponCodes:
        applyCoupon.data?.success && applyCoupon.data?.appliedCoupons?.length > 0
          ? applyCoupon.data.appliedCoupons.map((c) => c.couponCode)
          : undefined,
    };

    createOrder.mutate(orderData, {
      onSuccess: (res) => {
        router.push(`/orders/${res?.data?.id || ""}`);
      },
    });
  };

  if (isLoading) return <Loader />;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <p className="text-gray-500 mb-6">Your cart is empty. Add items before checkout.</p>
        <a
          href="/"
          className="cursor-pointer inline-flex items-center justify-center bg-blue-500 h-12 text-white px-8 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Shipping Form */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">Checkout</h1>
        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-7">
          <h2 className="text-base font-semibold text-gray-700">Shipping Address</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FloatingInput
              label="Phone Number"
              register={register("phone", {
                required: "Phone is required",
                pattern: { value: /^[\+]?[1-9][\d]{0,15}$/, message: "Invalid phone format" },
              })}
              error={errors.phone?.message}
            />
            <FloatingInput
              label="Province"
              register={register("province", {
                required: "Province is required",
                minLength: { value: 2, message: "Min 2 characters" },
              })}
              error={errors.province?.message}
            />
          </div>

          <FloatingInput
            label="City"
            register={register("city", {
              required: "City is required",
              minLength: { value: 2, message: "Min 2 characters" },
            })}
            error={errors.city?.message}
          />

          <div>
            <div className="relative w-full">
              <textarea
                className="peer w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0"
                placeholder=" "
                rows={2}
                {...register("fullAddress", {
                  required: "Full address is required",
                  minLength: { value: 5, message: "Min 5 characters" },
                  maxLength: { value: 255, message: "Max 255 characters" },
                })}
              />
              <label className={labelClass}>Full Address</label>
            </div>
            {errors.fullAddress && (
              <p className="text-red-500 text-xs px-3 mt-1">{errors.fullAddress.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h2 className="text-base font-semibold text-gray-700 mb-3">Payment Method</h2>
            <div className="flex gap-3 flex-wrap">
              {[
                { value: "cashOnDelivery", label: "Cash on Delivery" },
                { value: "stripe", label: "Card (Stripe)" },
                { value: "qrBank", label: "QR / Bank" },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
                    paymentMethod === method.value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="relative w-full">
              <textarea
                className="peer w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0"
                placeholder=" "
                rows={2}
                {...register("notes")}
              />
              <label className={labelClass}>Notes (optional)</label>
            </div>
          </div>
        </form>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-6 h-fit lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Order Summary</h2>
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {items.map((item) => {
            const product = item.product || {};
            const price = parseFloat(item.variant?.price || product.price || 0);
            return (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={product.images?.[0]?.url || "/placeholder.png"}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-lg border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-xs font-semibold">Rs. {(price * item.quantity).toFixed(0)}</span>
              </div>
            );
          })}
        </div>

        {/* Coupon */}
        <div className="border-t pt-3 mb-3">
          <div className="flex gap-2">
            <div className="relative flex-1 h-10">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className={inputClass}
                placeholder=" "
              />
              <label className={labelClass}>Coupon Code</label>
            </div>
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={applyCoupon.isPending}
              className="cursor-pointer flex items-center justify-center bg-blue-500 h-10 text-white px-4 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-xs font-semibold disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          {applyCoupon.isSuccess && applyCoupon.data?.success && (
            <p className="text-green-600 text-xs mt-2">
              {applyCoupon.data.message} — Rs. {applyCoupon.data.totalDiscountAmount} off
            </p>
          )}
          {applyCoupon.isSuccess && !applyCoupon.data?.success && (
            <p className="text-red-500 text-xs mt-2">{applyCoupon.data?.message}</p>
          )}
          {applyCoupon.isError && (
            <p className="text-red-500 text-xs mt-2">
              {applyCoupon.error?.response?.data?.message || "Failed"}
            </p>
          )}
        </div>

        <div className="border-t pt-3 space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">Rs. {subtotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Shipping</span>
            <span className="text-gray-700">Rs. {shippingAmount}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount</span>
              <span>- Rs. {discount}</span>
            </div>
          )}
        </div>
        <div className="border-t pt-3 flex justify-between">
          <span className="text-lg font-bold">Total</span>
          <span className="text-lg font-bold text-blue-600">Rs. {total.toFixed(0)}</span>
        </div>

        <button
          type="submit"
          form="checkout-form"
          disabled={createOrder.isPending}
          className="cursor-pointer w-full mt-5 flex justify-center items-center bg-blue-500 h-12 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold disabled:opacity-50"
        >
          {createOrder.isPending ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin h-5 w-5 mr-3 text-white">
                <circle strokeWidth="4" stroke="currentColor" r="10" cy="12" cx="12" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" className="opacity-75" />
              </svg>
              Placing Order...
            </>
          ) : (
            "Place Order"
          )}
        </button>

        {createOrder.isError && (
          <p className="text-red-500 text-sm text-center mt-2">
            {createOrder.error?.response?.data?.message || "Failed to place order"}
          </p>
        )}
      </div>
    </div>
  );
}
