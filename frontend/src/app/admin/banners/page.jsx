"use client";
import React, { useState } from "react";
import {
  useAdminBanners,
  useCreateBanner,
  useUpdateBanner,
  useDeleteBanner,
  useToggleBanner,
  useAdminCategories,
  useAdminProducts,
} from "@/app/hooks/useAdmin";
import AdminTable from "@/app/admin/components/AdminTable";
import AdminButton from "@/app/admin/components/AdminButton";
import AdminModal from "@/app/admin/components/AdminModal";
import AdminInput from "@/app/admin/components/AdminInput";
import AdminTextarea from "@/app/admin/components/AdminTextarea";
import AdminToggle from "@/app/admin/components/AdminToggle";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import AdminSelect from "@/app/admin/components/AdminSelect";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { IoAdd, IoTrash, IoPencil, IoEye, IoEyeOff } from "react-icons/io5";

export default function BannersPage() {
  const { data, isLoading } = useAdminBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const toggleBanner = useToggleBanner();

  // For linking banners to products/categories
  const { data: categoriesData } = useAdminCategories();
  const { data: productsData } = useAdminProducts({ limit: 100 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    link: "",
    linkText: "Shop Now",
    productId: "",
    categoryId: "",
    sortOrder: 0,
    isActive: true,
    startDate: "",
    endDate: "",
  });
  const [image, setImage] = useState(null);

  const banners = data?.data || [];
  const categories = categoriesData?.data || [];
  const products = productsData?.data?.products || [];

  const resetForm = () => ({
    title: "",
    subtitle: "",
    link: "",
    linkText: "Shop Now",
    productId: "",
    categoryId: "",
    sortOrder: 0,
    isActive: true,
    startDate: "",
    endDate: "",
  });

  const openCreate = () => {
    setEditing(null);
    setForm(resetForm());
    setImage(null);
    setModalOpen(true);
  };

  const openEdit = (banner) => {
    setEditing(banner);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link: banner.link || "",
      linkText: banner.linkText || "Shop Now",
      productId: banner.productId || "",
      categoryId: banner.categoryId || "",
      sortOrder: banner.sortOrder || 0,
      isActive: banner.isActive ?? true,
      startDate: banner.startDate ? banner.startDate.split("T")[0] : "",
      endDate: banner.endDate ? banner.endDate.split("T")[0] : "",
    });
    setImage(null);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", form.title);
    if (form.subtitle) formData.append("subtitle", form.subtitle);
    if (form.link) formData.append("link", form.link);
    formData.append("linkText", form.linkText || "Shop Now");
    if (form.productId) formData.append("productId", form.productId);
    if (form.categoryId) formData.append("categoryId", form.categoryId);
    formData.append("sortOrder", form.sortOrder);
    formData.append("isActive", form.isActive);
    if (form.startDate) formData.append("startDate", form.startDate);
    if (form.endDate) formData.append("endDate", form.endDate);
    if (image) formData.append("image", image);

    if (editing) {
      updateBanner.mutate({ id: editing.id, formData }, { onSuccess: () => setModalOpen(false) });
    } else {
      if (!image) return alert("Please upload a banner image");
      createBanner.mutate(formData, { onSuccess: () => setModalOpen(false) });
    }
  };

  const columns = [
    {
      key: "image",
      label: "Preview",
      render: (row) => (
        <div className="w-32 h-16 rounded-lg overflow-hidden bg-gray-100">
          {row.image?.url ? (
            <img src={row.image.url} alt={row.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No image
            </div>
          )}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">{row.title}</p>
          {row.subtitle && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{row.subtitle}</p>
          )}
        </div>
      ),
    },
    {
      key: "link",
      label: "Link",
      render: (row) => {
        if (row.product) return <span className="text-xs text-blue-600">Product: {row.product.name}</span>;
        if (row.category) return <span className="text-xs text-emerald-600">Category: {row.category.name}</span>;
        if (row.link) return <span className="text-xs text-gray-500 truncate block max-w-[150px]">{row.link}</span>;
        return <span className="text-xs text-gray-300">No link</span>;
      },
    },
    {
      key: "sortOrder",
      label: "Order",
      render: (row) => <span className="text-gray-500">{row.sortOrder}</span>,
    },
    {
      key: "schedule",
      label: "Schedule",
      render: (row) => {
        if (!row.startDate && !row.endDate) return <span className="text-xs text-gray-300">Always</span>;
        return (
          <div className="text-xs text-gray-500">
            {row.startDate && <div>From: {new Date(row.startDate).toLocaleDateString()}</div>}
            {row.endDate && <div>Until: {new Date(row.endDate).toLocaleDateString()}</div>}
          </div>
        );
      },
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
          <button
            onClick={() => openEdit(row)}
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
            title="Edit"
          >
            <IoPencil size={16} />
          </button>
          <button
            onClick={() => toggleBanner.mutate(row.id)}
            className={`cursor-pointer ${row.isActive ? "text-amber-500 hover:text-amber-700" : "text-emerald-500 hover:text-emerald-700"}`}
            title={row.isActive ? "Deactivate" : "Activate"}
          >
            {row.isActive ? <IoEyeOff size={16} /> : <IoEye size={16} />}
          </button>
          <button
            onClick={() => { if (confirm("Delete this banner permanently?")) deleteBanner.mutate(row.id); }}
            className="text-red-500 hover:text-red-700 cursor-pointer"
            title="Delete"
          >
            <IoTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  // Build product options for select
  const productOptions = products.map((p) => ({ value: p.id, label: p.name }));
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Banners</h1>
          <p className="text-sm text-gray-400 mt-1">Manage homepage hero slider banners</p>
        </div>
        <AdminButton onClick={openCreate}>
          <IoAdd size={20} className="mr-2" /> Add Banner
        </AdminButton>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <AdminTable columns={columns} data={banners} emptyMessage="No banners yet. Create your first hero banner!" />
      )}

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Banner" : "Create Banner"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <AdminInput
            label="Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <AdminTextarea
            label="Subtitle"
            rows={2}
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />

          {editing?.image?.url && (
            <div>
              <p className="text-sm text-cyan-500 font-medium mb-1">Current Image</p>
              <div className="w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                <img src={editing.image.url} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          <AdminImageUpload
            onChange={setImage}
          />
          <p className="text-xs text-gray-400 -mt-2">
            Recommended: 1920×600px or wider. Use high-quality promotional banners.
          </p>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Link Destination</p>
            <p className="text-xs text-gray-400 mb-3">Choose one: custom URL, a product, or a category.</p>

            <AdminInput
              label="Custom Link URL"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-4 mt-3">
              <AdminSelect
                label="Link to Product"
                value={form.productId}
                onChange={(e) => setForm({ ...form, productId: e.target.value, categoryId: "" })}
                options={productOptions}
              />
              <AdminSelect
                label="Link to Category"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value, productId: "" })}
                options={categoryOptions}
              />
            </div>
          </div>

          <AdminInput
            label="Button Text"
            value={form.linkText}
            onChange={(e) => setForm({ ...form, linkText: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <AdminInput
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
            />
            <AdminToggle
              label="Active"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Schedule (Optional)</p>
            <div className="grid grid-cols-2 gap-4">
              <AdminInput
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <AdminInput
                label="End Date"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <AdminButton type="submit" loading={createBanner.isPending || updateBanner.isPending}>
              {editing ? "Update Banner" : "Create Banner"}
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
