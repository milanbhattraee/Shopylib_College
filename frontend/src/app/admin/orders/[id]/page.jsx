"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAdminOrder, useUpdateOrderStatus, useAdminCancelOrder } from "@/app/hooks/useAdmin";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminButton from "@/app/admin/components/AdminButton";
import AdminTextarea from "@/app/admin/components/AdminTextarea";
import { IoArrowBack } from "react-icons/io5";

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

const STATUS_META = {
  pending:    { color: "text-amber-600",    bg: "bg-amber-50",    border: "border-amber-200",  dot: "bg-amber-400",    step: 0, label: "Pending"    },
  confirmed:  { color: "text-blue-600",     bg: "bg-blue-50",     border: "border-blue-200",   dot: "bg-blue-500",     step: 1, label: "Confirmed"  },
  processing: { color: "text-violet-600",   bg: "bg-violet-50",   border: "border-violet-200", dot: "bg-violet-500",   step: 2, label: "Processing" },
  shipped:    { color: "text-cyan-600",     bg: "bg-cyan-50",     border: "border-cyan-200",   dot: "bg-cyan-500",     step: 3, label: "Shipped"    },
  delivered:  { color: "text-emerald-600",  bg: "bg-emerald-50",  border: "border-emerald-200",dot: "bg-emerald-500",  step: 4, label: "Delivered"  },
  cancelled:  { color: "text-red-600",      bg: "bg-red-50",      border: "border-red-200",    dot: "bg-red-500",      step: -1, label: "Cancelled" },
  refunded:   { color: "text-gray-600",     bg: "bg-gray-50",     border: "border-gray-200",   dot: "bg-gray-400",     step: -1, label: "Refunded"  },
};

const TIMELINE_STEPS = [
  { key: "pending",    icon: "🛒", label: "Order Placed",  dateKey: "createdAt"   },
  { key: "confirmed",  icon: "✅", label: "Confirmed",     dateKey: "updatedAt"   },
  { key: "processing", icon: "⚙️", label: "Processing",    dateKey: "updatedAt"   },
  { key: "shipped",    icon: "🚚", label: "Shipped",       dateKey: "shippedAt"   },
  { key: "delivered",  icon: "📦", label: "Delivered",     dateKey: "deliveredAt" },
];

function PremiumStatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${meta.bg} ${meta.color} ${meta.border}`}>
      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function OrderTimeline({ order }) {
  const currentMeta = STATUS_META[order.status];
  const currentStep = currentMeta?.step ?? 0;
  const isCancelled = order.status === "cancelled" || order.status === "refunded";

  if (isCancelled) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Order Timeline</h3>
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg flex-shrink-0">✕</div>
          <div>
            <p className="font-semibold text-red-700">{order.status === "refunded" ? "Order Refunded" : "Order Cancelled"}</p>
            {order.cancelledAt && (
              <p className="text-xs text-red-400 mt-0.5">{new Date(order.cancelledAt).toLocaleString()}</p>
            )}
            {order.cancellationReason && (
              <p className="text-sm text-red-600 mt-1">"{order.cancellationReason}"</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">Order Timeline</h3>
      <div className="relative">
        {/* Track line */}
        <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
        <div
          className="absolute left-5 top-5 w-0.5 bg-blue-500 transition-all duration-700"
          style={{ height: `${Math.max(0, (currentStep / (TIMELINE_STEPS.length - 1))) * 100}%` }}
        />
        <div className="space-y-6 relative">
          {TIMELINE_STEPS.map((step, i) => {
            const isCompleted = i <= currentStep;
            const isCurrent = i === currentStep;
            const date = order[step.dateKey];
            return (
              <div key={step.key} className={`flex items-start gap-4 ${!isCompleted ? "opacity-40" : ""}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm flex-shrink-0 relative z-10 transition-all ${
                  isCurrent ? "bg-blue-500 shadow-lg shadow-blue-200 scale-110" :
                  isCompleted ? "bg-emerald-500" : "bg-gray-200"
                }`}>
                  <span className={isCompleted ? "text-white" : ""}>{step.icon}</span>
                </div>
                <div className="flex-1 min-w-0 pt-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${isCurrent ? "text-blue-600" : isCompleted ? "text-gray-800" : "text-gray-400"}`}>
                      {step.label}
                      {isCurrent && <span className="ml-2 text-xs font-normal text-blue-400">● Current</span>}
                    </p>
                    {isCompleted && date && (
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </p>
                    )}
                  </div>
                  {isCurrent && (
                    <p className="text-xs text-blue-400 mt-0.5">
                      {date ? new Date(date).toLocaleString() : "In progress..."}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function Row({ label, children, highlight }) {
  return (
    <div className={`flex items-start justify-between gap-4 py-2 ${highlight ? "border-t border-gray-100 mt-2 pt-3" : ""}`}>
      <span className="text-sm text-gray-400 flex-shrink-0">{label}</span>
      <span className={`text-sm text-right ${highlight ? "font-bold text-gray-900" : "text-gray-700"}`}>{children}</span>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useAdminCancelOrder();

  const [statusModal, setStatusModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  const order = data?.data?.order || data?.data;

  const handleStatusUpdate = () => {
    if (!newStatus) return;
    updateStatus.mutate({ id, data: { status: newStatus } }, { onSuccess: () => { setStatusModal(false); setNewStatus(""); } });
  };

  const handleCancel = () => {
    cancelOrder.mutate({ id, data: { reason: cancelReason } }, { onSuccess: () => { setCancelModal(false); setCancelReason(""); } });
  };

  const isFinal = order && ["cancelled", "delivered", "refunded"].includes(order.status);

  const subtotal = parseFloat(order?.subtotal || 0);
  const shipping = parseFloat(order?.shippingAmount || 0);
  const discount = parseFloat(order?.discountAmount || 0);
  const total = subtotal + shipping - discount;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        <p className="text-sm text-gray-400">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🔍</div>
        <p className="text-xl font-semibold text-gray-700">Order not found</p>
        <button onClick={() => router.back()} className="text-blue-500 hover:underline text-sm">← Go back</button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      {/* Top Nav */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
      >
        <IoArrowBack className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back to Orders</span>
      </button>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold text-blue-700 tracking-tight">
              Order #{order.id?.slice(0, 8).toUpperCase()}
            </h1>
            <PremiumStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-sm text-gray-400">
              Placed {new Date(order.createdAt).toLocaleString("en-IN", { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <CopyButton text={order.id} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isFinal && (
            <>
              <button
                onClick={() => { setNewStatus(order.status); setStatusModal(true); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <span>↻</span> Update Status
              </button>
              <button
                onClick={() => setCancelModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-200 transition-colors"
              >
                <span>✕</span> Cancel Order
              </button>
            </>
          )}
        </div>
      </div>

      {/* Timeline */}
      <OrderTimeline order={order} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Items - spans 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          <InfoCard title={`Items (${order.items?.length || 0})`}>
            <div className="divide-y divide-gray-50">
              {order.items?.map((item, idx) => {
                const itemTotal = item.quantity * parseFloat(item.price || 0);
                return (
                  <div key={item.id || idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0 relative">
                      {item.product?.images?.[0]?.url ? (
                        <img src={item.product.images[0].url} alt={item.product?.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">📦</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                        {item.product?.name || "Unknown Product"}
                      </p>
                      {item.productVarient?.name && (
                        <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-md">
                          <span className="text-xs text-gray-500">Variant:</span>
                          <span className="text-xs font-medium text-gray-700">{item.productVarient.name}</span>
                        </div>
                      )}
                      {item.productVarient?.attributes && (
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {Object.entries(item.productVarient.attributes || {}).map(([k, v]) => (
                            <span key={k} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">Qty:</span>
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">{item.quantity}</span>
                        <span className="text-gray-300">×</span>
                        <span className="text-sm text-gray-700">Rs. {parseFloat(item.price).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">Rs. {itemTotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Breakdown */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
              <Row label="Subtotal">Rs. {subtotal.toFixed(2)}</Row>
              {shipping > 0 && <Row label="Shipping">Rs. {shipping.toFixed(2)}</Row>}
              {discount > 0 && (
                <Row label="Discount">
                  <span className="text-emerald-600">−Rs. {discount.toFixed(2)}</span>
                </Row>
              )}
              <Row label="Order Total" highlight>Rs. {total.toFixed(2)}</Row>
            </div>
          </InfoCard>

          {/* Coupon Info */}
          {order.coupons?.length > 0 && (
            <InfoCard title="Applied Coupons">
              <div className="space-y-2">
                {order.coupons.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-600">🏷</span>
                      <div>
                        <p className="text-sm font-bold text-emerald-700">{c.code}</p>
                        {c.name && <p className="text-xs text-emerald-500">{c.name}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-700">
                        {c.type === "percentage" ? `${c.value}% off` : `Rs. ${c.value} off`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </InfoCard>
          )}

          {/* Notes */}
          {order.notes && (
            <InfoCard title="Order Notes">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-sm text-amber-700">💬 {order.notes}</p>
              </div>
            </InfoCard>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Info */}
          <InfoCard title="Payment">
            <div className="space-y-1">
              <Row label="Method">
                <span className="capitalize font-medium">
                  {order.paymentMethod === "cashOnDelivery" ? "Cash on Delivery" : order.paymentMethod}
                </span>
              </Row>
              <Row label="Status">
                <span className={`font-semibold capitalize ${
                  order.paymentStatus === "paid" ? "text-emerald-600" :
                  order.paymentStatus === "pending" ? "text-amber-600" : "text-red-600"
                }`}>
                  {order.paymentStatus}
                </span>
              </Row>
            </div>
          </InfoCard>

          {/* Customer Info */}
          <InfoCard title="Customer">
            {order.user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {order.user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{order.user.firstName} {order.user.lastName}</p>
                    <p className="text-xs text-gray-400">{order.user?.auth?.email || "—"}</p>
                  </div>
                </div>
                {(order.phone || order.user.phone) && (
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                    <span className="text-sm">📞</span>
                    <span className="text-sm text-gray-700">{order.phone || order.user.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No customer info</p>
            )}
          </InfoCard>

          {/* Shipping Address */}
          <InfoCard title="Shipping Address">
            {order.address ? (
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5">
                  {order.address.fullAddress && (
                    <p className="text-sm text-gray-700 leading-relaxed">{order.address.fullAddress}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span>🏙</span>
                    <span>{[order.address.city, order.address.province].filter(Boolean).join(", ")}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400">No address info</p>
            )}
          </InfoCard>

          {/* Key Dates */}
          <InfoCard title="Key Dates">
            <div className="space-y-1">
              <Row label="Placed">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Row>
              {order.shippedAt && <Row label="Shipped">{new Date(order.shippedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Row>}
              {order.deliveredAt && <Row label="Delivered">{new Date(order.deliveredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Row>}
              {order.cancelledAt && <Row label="Cancelled">{new Date(order.cancelledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</Row>}
            </div>
          </InfoCard>

          {/* Danger Zone */}
          {!isFinal && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider">Danger Zone</h3>
              <button
                onClick={() => setCancelModal(true)}
                className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 transition-colors"
              >
                ✕ Cancel This Order
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <AdminModal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Order Status" maxWidth="max-w-md">
        <div className="space-y-5">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Order</p>
              <p className="text-sm font-mono font-bold text-gray-800">#{order.id?.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">Current</p>
              <PremiumStatusBadge status={order.status} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Select new status</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_STATUSES.map((s) => {
                const meta = STATUS_META[s];
                const isSelected = newStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setNewStatus(s)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                      isSelected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${meta?.dot}`} />
                    {s}
                    {isSelected && <span className="ml-auto text-blue-500">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <AdminButton onClick={handleStatusUpdate} loading={updateStatus.isPending} disabled={!newStatus || newStatus === order.status}>
              Update Status
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setStatusModal(false)}>Cancel</AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Cancel Modal */}
      <AdminModal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Order" maxWidth="max-w-md">
        <div className="space-y-5">
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-1">
            <p className="text-sm font-semibold text-red-700">⚠️ This action cannot be undone</p>
            <p className="text-xs text-red-500">
              Order #{order.id?.slice(0, 8).toUpperCase()} • {order.items?.length} item(s) • Rs. {total.toFixed(2)}
            </p>
          </div>
          <AdminTextarea
            label="Cancellation Reason (optional)"
            rows={3}
            placeholder="Enter reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="flex gap-3">
            <AdminButton variant="danger" onClick={handleCancel} loading={cancelOrder.isPending}>
              Confirm Cancellation
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setCancelModal(false)}>Go Back</AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}