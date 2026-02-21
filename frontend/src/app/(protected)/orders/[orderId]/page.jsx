"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiPackage, FiRotateCcw } from "react-icons/fi";
import { useOrder, useCancelOrder, useRequestReturn } from "@/app/hooks/useProtected";
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

const returnStatusColors = {
  requested: "bg-orange-100 text-orange-700 border-orange-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const { data, isLoading } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const requestReturn = useRequestReturn();

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const order = data?.data;

  if (isLoading) return <Loader />;
  if (!order) return <p className="text-center text-gray-500 py-16">Order not found</p>;

  const currentStep = statusSteps.indexOf(order.status);
  const items = order.items || [];
  const address = order.address;

  const orderSubtotal = parseFloat(order.subtotal || 0);
  const orderShipping = parseFloat(order.shippingAmount || 0);
  const orderDiscount = parseFloat(order.discountAmount || 0);
  const orderTotal = orderSubtotal + orderShipping - orderDiscount;

  const canCancel = ["pending", "confirmed"].includes(order.status);

  // Return eligibility
  const returnWindowDays = 15;
  const isDelivered = order.status === "delivered";
  const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt) : null;
  const daysSinceDelivery = deliveredAt ? Math.floor((new Date() - deliveredAt) / (1000 * 60 * 60 * 24)) : null;
  const canReturn = isDelivered && daysSinceDelivery !== null && daysSinceDelivery <= returnWindowDays && (!order.returnStatus || order.returnStatus === "none");
  const daysLeft = returnWindowDays - (daysSinceDelivery || 0);

  const handleReturnSubmit = () => {
    if (!returnReason.trim() || returnReason.trim().length < 5) return;
    requestReturn.mutate(
      { orderId, reason: returnReason.trim() },
      { onSuccess: () => { setShowReturnModal(false); setReturnReason(""); } }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition mb-4"
        >
          <FiArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-blue-700">
              Order #{order.orderNumber || order.id?.slice(0, 8)}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Placed on{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}
            >
              {order.status}
            </span>
            {canCancel && (
              <button
                onClick={() => cancelOrder.mutate({ orderId, reason: "Changed my mind" })}
                disabled={cancelOrder.isPending}
                className="cursor-pointer text-sm px-4 py-1.5 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50 font-medium"
              >
                {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
              </button>
            )}
            {canReturn && (
              <button
                onClick={() => setShowReturnModal(true)}
                className="cursor-pointer text-sm px-4 py-1.5 border-2 border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition font-medium inline-flex items-center gap-1.5"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
                Return Order
              </button>
            )}
          </div>
        </div>

        {/* Progress */}
        {order.status !== "cancelled" && order.status !== "refunded" && (
          <div className="mt-6 flex items-center">
            {statusSteps.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentStep ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-gray-500 mt-1 capitalize">{step}</span>
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? "bg-blue-500" : "bg-gray-200"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Order Items</h2>
        <div className="divide-y divide-gray-100">
          {items.map((item) => {
            const product = item.product || {};
            const variant = item.productVarient;
            return (
              <div key={item.id} className="flex gap-4 py-3">
                <img
                  src={product.images?.[0]?.url || "/placeholder.png"}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{product.name || "Product"}</p>
                  {variant?.name && <p className="text-xs text-gray-500">Variant: {variant.name}</p>}
                  <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold text-gray-800 shrink-0">
                  Rs. {(parseFloat(item.price) * item.quantity).toFixed(0)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-base font-bold text-blue-700 mb-3">Shipping Address</h2>
          {address ? (
            <div className="text-sm text-gray-600 space-y-1">
              <p>{address.fullAddress}</p>
              <p>
                {address.city}
                {address.province ? `, ${address.province}` : ""}
              </p>
              {order.phone && <p>Phone: {order.phone}</p>}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No shipping address available</p>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-base font-bold text-blue-700 mb-3">Payment Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium capitalize">{order.paymentMethod || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status</span>
              <span className="font-medium capitalize">{order.paymentStatus || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>Rs. {orderSubtotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>Rs. {orderShipping.toFixed(0)}</span>
            </div>
            {orderDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- Rs. {orderDiscount.toFixed(0)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-blue-600">Rs. {orderTotal.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-base font-bold text-blue-700 mb-2">Order Notes</h2>
          <p className="text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      {/* Return Status Banner */}
      {order.returnStatus && order.returnStatus !== "none" && (
        <div className={`rounded-2xl shadow-xl p-8 border ${returnStatusColors[order.returnStatus] || "bg-gray-50"}`}>
          <h2 className="text-base font-bold mb-3 flex items-center gap-2">
            <FiRotateCcw className="w-5 h-5" />
            Return {order.returnStatus === "requested" ? "Requested" : order.returnStatus === "approved" ? "Approved" : "Rejected"}
          </h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Reason:</span> {order.returnReason}</p>
            {order.returnRequestedAt && (
              <p><span className="font-medium">Requested:</span> {new Date(order.returnRequestedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            )}
            {order.returnStatus === "approved" && order.returnApprovedAt && (
              <p><span className="font-medium">Approved:</span> {new Date(order.returnApprovedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            )}
            {order.returnStatus === "rejected" && (
              <>
                {order.returnRejectedAt && (
                  <p><span className="font-medium">Rejected:</span> {new Date(order.returnRejectedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                )}
                {order.returnRejectionReason && (
                  <p><span className="font-medium">Rejection Reason:</span> {order.returnRejectionReason}</p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Return eligibility notice */}
      {isDelivered && (!order.returnStatus || order.returnStatus === "none") && (
        <div className={`rounded-2xl shadow-xl p-6 border ${canReturn ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
          <p className={`text-sm ${canReturn ? "text-blue-700" : "text-gray-500"}`}>
            {canReturn
              ? `You have ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left to request a return for this order.`
              : "The return window for this order has expired."
            }
          </p>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowReturnModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Request Return</h3>
              <p className="text-sm text-gray-500 mt-1">
                Order #{order.orderNumber || order.id?.slice(0, 8)} &middot; {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
              <p className="text-sm text-orange-700">Please provide a reason for your return. Our team will review your request and get back to you.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Return Reason *</label>
              <textarea
                rows={4}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Tell us why you'd like to return this order..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300 resize-none"
              />
              {returnReason.length > 0 && returnReason.trim().length < 5 && (
                <p className="text-xs text-red-500 mt-1">Reason must be at least 5 characters</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReturnSubmit}
                disabled={requestReturn.isPending || returnReason.trim().length < 5}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestReturn.isPending ? "Submitting..." : "Submit Return Request"}
              </button>
              <button
                onClick={() => { setShowReturnModal(false); setReturnReason(""); }}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
