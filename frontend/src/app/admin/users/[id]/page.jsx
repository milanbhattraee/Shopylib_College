"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAdminUser, useUpdateUser, useUpdatePermissions } from "@/app/hooks/useAdmin";
import AdminButton from "@/app/admin/components/AdminButton";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminInput from "@/app/admin/components/AdminInput";
import AdminSelect from "@/app/admin/components/AdminSelect";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { IoArrowBack, IoPencil, IoShieldCheckmark } from "react-icons/io5";

const ALL_PERMISSIONS = [
  "manageUsers",
  "manageCategories",
  "manageCoupons",
  "manageProducts",
  "manageOrders",
  "manageStore",
  "manageReviews",
];

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useAdminUser(id);
  const updateUser = useUpdateUser();
  const updatePermissions = useUpdatePermissions();

  const [editModal, setEditModal] = useState(false);
  const [permModal, setPermModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [avatar, setAvatar] = useState(null);
  const [perms, setPerms] = useState([]);

  const user = data?.data?.user || data?.data;

  const openEdit = () => {
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",
      gender: user.gender || "",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "",
      province: user.province || "",
      city: user.city || "",
      fullAddress: user.fullAddress || "",
    });
    setAvatar(null);
    setEditModal(true);
  };

  const openPerms = () => {
    setPerms(user.permissions || []);
    setPermModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(editForm).forEach(([k, v]) => {
      if (v !== undefined && v !== "") formData.append(k, v);
    });
    if (avatar) formData.append("avatar", avatar);
    updateUser.mutate({ userId: id, formData }, { onSuccess: () => setEditModal(false) });
  };

  const handlePermSubmit = () => {
    updatePermissions.mutate({ userId: id, data: { permissions: perms } }, { onSuccess: () => setPermModal(false) });
  };

  const togglePerm = (perm) => {
    setPerms((p) => (p.includes(perm) ? p.filter((x) => x !== perm) : [...p, perm]));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <p className="text-center text-gray-400 py-16">User not found</p>;
  }

  return (
    <div className="animate-fadeIn">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 hover:underline mb-4 cursor-pointer">
        <IoArrowBack /> Back to Users
      </button>

      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
            {user.avatar?.url ? (
              <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-blue-600 font-bold text-xl">
                {(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-blue-700">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-400">{user.auth?.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <AdminButton variant="primary" onClick={openEdit}>
            <IoPencil size={16} className="mr-2" /> Edit
          </AdminButton>
          {user.role === "admin" && (
            <AdminButton variant="ghost" onClick={openPerms}>
              <IoShieldCheckmark size={16} className="mr-2" /> Permissions
            </AdminButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Profile</h3>
          <div className="space-y-3 text-sm">
            <Row label="Role"><StatusBadge status={user.role} /></Row>
            <Row label="Phone">{user.phone || "—"}</Row>
            <Row label="Gender">{user.gender || "—"}</Row>
            <Row label="DOB">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "—"}</Row>
            <Row label="Province">{user.province || "—"}</Row>
            <Row label="City">{user.city || "—"}</Row>
            <Row label="Address">{user.fullAddress || "—"}</Row>
            <Row label="Joined">{new Date(user.createdAt).toLocaleDateString()}</Row>
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Permissions</h3>
          <div className="flex flex-wrap gap-2">
            {(user.permissions || []).length > 0 ? (
              user.permissions.map((p) => (
                <span key={p} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {p}
                </span>
              ))
            ) : (
              <p className="text-gray-400">No permissions assigned</p>
            )}
          </div>

          <h3 className="text-lg font-semibold text-blue-700 mt-8 mb-4">Auth Info</h3>
          <div className="space-y-3 text-sm">
            <Row label="Email Verified">{user.auth?.emailVerified ? "Yes" : "No"}</Row>
            <Row label="Provider">{user.auth?.provider || "—"}</Row>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">Activity</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBlock label="Orders" value={user.orders?.length || 0} />
            <StatBlock label="Cart Items" value={user.cartItems?.length || 0} />
            <StatBlock label="Reviews" value={user.reviews?.length || 0} />
            <StatBlock label="Wishlist" value={user.wishlistItems?.length || 0} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AdminModal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit User">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <AdminInput label="First Name" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
            <AdminInput label="Last Name" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
            <AdminInput label="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            <AdminSelect
              label="Gender"
              value={editForm.gender}
              onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
            />
            <AdminInput label="Date of Birth" type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
            <AdminInput label="Province" value={editForm.province} onChange={(e) => setEditForm({ ...editForm, province: e.target.value })} />
            <AdminInput label="City" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
          </div>
          <AdminInput label="Full Address" value={editForm.fullAddress} onChange={(e) => setEditForm({ ...editForm, fullAddress: e.target.value })} />
          <AdminImageUpload label="Avatar" onChange={setAvatar} />
          <div className="flex gap-4 pt-4">
            <AdminButton type="submit" loading={updateUser.isPending}>Update</AdminButton>
            <AdminButton type="button" variant="secondary" onClick={() => setEditModal(false)}>Cancel</AdminButton>
          </div>
        </form>
      </AdminModal>

      {/* Permissions Modal */}
      <AdminModal isOpen={permModal} onClose={() => setPermModal(false)} title="Update Permissions" maxWidth="max-w-md">
        <div className="space-y-3">
          {ALL_PERMISSIONS.map((perm) => (
            <label key={perm} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-blue-50">
              <input
                type="checkbox"
                checked={perms.includes(perm)}
                onChange={() => togglePerm(perm)}
                className="w-4 h-4 text-blue-500 rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">{perm}</span>
            </label>
          ))}
          <div className="flex gap-4 pt-4">
            <AdminButton onClick={handlePermSubmit} loading={updatePermissions.isPending}>Save</AdminButton>
            <AdminButton variant="secondary" onClick={() => setPermModal(false)}>Cancel</AdminButton>
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

function StatBlock({ label, value }) {
  return (
    <div className="text-center p-4 bg-blue-50 rounded-xl">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
