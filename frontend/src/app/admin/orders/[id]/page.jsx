"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminOrder, useUpdateOrderStatus, useAdminCancelOrder } from "@/app/hooks/useAdmin";
import StatusBadge from "@/app/admin/components/StatusBadge";
import AdminButton from "@/app/admin/components/AdminButton";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminSelect from "@/app/admin/components/AdminSelect";
import AdminTextarea from "@/app/admin/components/AdminTextarea";
import { IoArrowBack } from "react-icons/io5";

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];

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
    updateStatus.mutate({ id, data: { status: newStatus } }, { onSuccess: () => setStatusModal(false) });
  };

  const handleCancel = () => {
    cancelOrder.mutate({ id, data: { reason: cancelReason } }, { onSuccess: () => setCancelModal(false) });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-gray-400 py-16">Order not found</p>;
  }

  return (
    <div className="animate-fadeIn">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 hover:underline mb-4 cursor-pointer">
        <IoArrowBack /> Back to Orders
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Order #{order.id?.slice(0, 8)}</h1>
          <p className="text-gray-400 text-sm mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-3">
          <AdminButton variant="primary" onClick={() => setStatusModal(true)}>
            Update Status
          </AdminButton>
          {!["cancelled", "delivered", "refunded"].includes(order.status) && (
            <AdminButton variant="danger" onClick={() => setCancelModal(true)}>
              Cancel Order
            </AdminButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Order Info</h3>
          <div className="space-y-3 text-sm">
            <Row label="Status"><StatusBadge status={order.status} /></Row>
            <Row label="Subtotal">Rs. {parseFloat(order.subtotal || 0).toFixed(2)}</Row>
            {parseFloat(order.discountAmount || 0) > 0 && <Row label="Discount">-Rs. {parseFloat(order.discountAmount).toFixed(2)}</Row>}
            {parseFloat(order.shippingAmount || 0) > 0 && <Row label="Shipping">Rs. {parseFloat(order.shippingAmount).toFixed(2)}</Row>}
            <Row label="Total">Rs. {(parseFloat(order.subtotal || 0) + parseFloat(order.shippingAmount || 0) - parseFloat(order.discountAmount || 0)).toFixed(2)}</Row>
            <Row label="Payment">{order.paymentMethod}</Row>
            <Row label="Payment Status">{order.paymentStatus}</Row>
            {order.shippedAt && <Row label="Shipped">{new Date(order.shippedAt).toLocaleDateString()}</Row>}
            {order.deliveredAt && <Row label="Delivered">{new Date(order.deliveredAt).toLocaleDateString()}</Row>}
            {order.cancelledAt && <Row label="Cancelled">{new Date(order.cancelledAt).toLocaleDateString()}</Row>}
            {order.cancellationReason && <Row label="Cancel Reason">{order.cancellationReason}</Row>}
            {order.notes && <Row label="Notes">{order.notes}</Row>}
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Customer</h3>
          <div className="space-y-3 text-sm">
            <Row label="Name">{order.user ? `${order.user.firstName} ${order.user.lastName}` : "—"}</Row>
            <Row label="Email">{order.user?.auth?.email || "—"}</Row>
            <Row label="Phone">{order.phone || order.user?.phone || "—"}</Row>
          </div>
          <h3 className="text-lg font-semibold text-blue-700 mt-6 mb-4">Shipping Address</h3>
          <div className="space-y-3 text-sm">
            <Row label="Province">{order.address?.province || "—"}</Row>
            <Row label="City">{order.address?.city || "—"}</Row>
            <Row label="Full Address">{order.address?.fullAddress || "—"}</Row>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Items ({order.items?.length || 0})</h3>
          <div className="space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex gap-3 border-b border-gray-100 pb-3 last:border-0">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.product?.images?.[0]?.url ? (
                    <img src={item.product.images[0].url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.product?.name || "Unknown Product"}</p>
                  {item.productVarient?.name && <p className="text-xs text-gray-400">{item.productVarient.name}</p>}
                  <p className="text-sm text-gray-500">
                    {item.quantity} × Rs. {parseFloat(item.price).toFixed(2)}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-800">Rs. {(item.quantity * parseFloat(item.price)).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <AdminModal isOpen={statusModal} onClose={() => setStatusModal(false)} title="Update Order Status" maxWidth="max-w-md">
        <div className="space-y-4">
          <AdminSelect
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={ALL_STATUSES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          />
          <div className="flex gap-4 pt-2">
            <AdminButton onClick={handleStatusUpdate} loading={updateStatus.isPending}>
              Update
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setStatusModal(false)}>
              Cancel
            </AdminButton>
          </div>
        </div>
      </AdminModal>

      {/* Cancel Modal */}
      <AdminModal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Order" maxWidth="max-w-md">
        <div className="space-y-4">
          <AdminTextarea
            label="Cancel Reason"
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
          <div className="flex gap-4 pt-2">
            <AdminButton variant="danger" onClick={handleCancel} loading={cancelOrder.isPending}>
              Confirm Cancel
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setCancelModal(false)}>
              Go Back
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-700 text-right">{children}</span>
    </div>
  );
}
