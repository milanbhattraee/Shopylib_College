"use client";
import React, { useState } from "react";
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useRestoreCategory } from "@/app/hooks/useAdmin";
import AdminTable from "@/app/admin/components/AdminTable";
import AdminButton from "@/app/admin/components/AdminButton";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminInput from "@/app/admin/components/AdminInput";
import AdminTextarea from "@/app/admin/components/AdminTextarea";
import AdminToggle from "@/app/admin/components/AdminToggle";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { IoAdd, IoTrash, IoRefresh, IoPencil } from "react-icons/io5";

export default function CategoriesPage() {
  const { data, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const restoreCategory = useRestoreCategory();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", isActive: true, sortOrder: 0 });
  const [image, setImage] = useState(null);

  const categories = data?.data || [];

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", isActive: true, sortOrder: 0 });
    setImage(null);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      isActive: cat.isActive ?? true,
      sortOrder: cat.sortOrder || 0,
    });
    setImage(null);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== undefined && v !== "") formData.append(k, v);
    });
    if (image) formData.append("image", image);

    if (editing) {
      updateCategory.mutate({ id: editing.id, formData }, { onSuccess: () => setModalOpen(false) });
    } else {
      createCategory.mutate(formData, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (row) => (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
          {row.image?.url ? (
            <img src={row.image.url} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
          )}
        </div>
      ),
    },
    { key: "name", label: "Name" },
    { key: "slug", label: "Slug" },
    {
      key: "sortOrder",
      label: "Order",
      render: (row) => <span className="text-gray-500">{row.sortOrder}</span>,
    },
    {
      key: "isActive",
      label: "Status",
      render: (row) => <StatusBadge status={row.isActive ? "active" : "inactive"} />,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(row)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
            <IoPencil size={16} />
          </button>
          {row.deletedAt ? (
            <button onClick={() => restoreCategory.mutate(row.id)} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">
              <IoRefresh size={16} />
            </button>
          ) : (
            <button
              onClick={() => { if (confirm("Delete this category?")) deleteCategory.mutate(row.id); }}
              className="text-red-500 hover:text-red-700 cursor-pointer"
            >
              <IoTrash size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Categories</h1>
        <AdminButton onClick={openCreate}>
          <IoAdd size={20} className="mr-2" /> Add Category
        </AdminButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <AdminTable columns={columns} data={categories} emptyMessage="No categories found" />
      )}

      <AdminModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "Create Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <AdminInput label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <AdminTextarea label="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <AdminInput label="Sort Order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          <AdminToggle label="Active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />

          {editing?.image?.url && (
            <div className="mt-2">
              <p className="text-sm text-cyan-500 font-medium mb-1">Current Image</p>
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={editing.image.url} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <AdminImageUpload label="Category Image" onChange={setImage} />

          <div className="flex gap-4 pt-4">
            <AdminButton type="submit" loading={createCategory.isPending || updateCategory.isPending}>
              {editing ? "Update" : "Create"}
            </AdminButton>
            <AdminButton type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </AdminButton>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
