"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCreateProduct, useAdminCategories } from "@/app/hooks/useAdmin";
import AdminInput from "@/app/admin/components/AdminInput";
import AdminTextarea from "@/app/admin/components/AdminTextarea";
import AdminSelect from "@/app/admin/components/AdminSelect";
import AdminToggle from "@/app/admin/components/AdminToggle";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import AdminButton from "@/app/admin/components/AdminButton";

export default function CreateProductPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { isActive: true, isFeatured: false },
  });
  const createProduct = useCreateProduct();
  const { data: catData } = useAdminCategories();
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);

  const categories = catData?.data || [];

  const addVariant = () => {
    setVariants((v) => [...v, { sku: "", name: "", price: "", comparePrice: "", stockQuantity: "", description: "" }]);
  };

  const updateVariant = (i, field, val) => {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, [field]: val } : v)));
  };

  const removeVariant = (i) => {
    setVariants((vs) => vs.filter((_, idx) => idx !== i));
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== "") {
        if (key === "tags") {
          formData.append(key, val);
        } else {
          formData.append(key, val);
        }
      }
    });

    images.forEach((file) => formData.append("images", file));

    if (variants.length > 0) {
      formData.append("variants", JSON.stringify(variants));
    }

    createProduct.mutate(formData, {
      onSuccess: () => router.push("/admin/products"),
    });
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Create Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <AdminInput label="Product Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
          <AdminInput label="Slug" error={errors.slug?.message} {...register("slug", { required: "Slug is required" })} />
          <AdminInput label="SKU" error={errors.sku?.message} {...register("sku", { required: "SKU is required" })} />
          <AdminSelect
            label="Category"
            error={errors.categoryId?.message}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            {...register("categoryId", { required: "Category is required" })}
          />
          <AdminInput label="Price" type="number" error={errors.price?.message} {...register("price", { required: "Price is required" })} />
          <AdminInput label="Compare Price" type="number" {...register("comparePrice")} />
          <AdminInput label="Cost Price" type="number" {...register("costPrice")} />
          <AdminInput label="Stock Quantity" type="number" error={errors.stockQuantity?.message} {...register("stockQuantity", { required: "Stock is required" })} />
          <AdminInput label="Low Stock Threshold" type="number" {...register("lowStockThreshold")} />
          <AdminInput label="Tags (comma separated)" {...register("tags")} />
        </div>

        <div className="mt-6 space-y-4">
          <AdminTextarea label="Short Description" rows={2} {...register("shortDescription")} />
          <AdminTextarea label="Description" rows={4} {...register("description")} />
          <AdminTextarea label="Meta Title" rows={1} {...register("metaTitle")} />
          <AdminTextarea label="Meta Description" rows={2} {...register("metaDescription")} />
        </div>

        <div className="flex gap-6 mt-6">
          <AdminToggle label="Active" checked={watch("isActive")} onChange={(e) => setValue("isActive", e.target.checked)} />
          <AdminToggle label="Featured" checked={watch("isFeatured")} onChange={(e) => setValue("isFeatured", e.target.checked)} />
        </div>

        <div className="mt-6">
          <AdminImageUpload label="Product Images" multiple onChange={(files) => setImages(Array.isArray(files) ? files : [files])} />
        </div>

        {/* Variants */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-700">Variants</h3>
            <AdminButton type="button" variant="ghost" onClick={addVariant} className="h-9 text-sm">
              + Add Variant
            </AdminButton>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-4 mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">Variant {i + 1}</span>
                <button type="button" onClick={() => removeVariant(i)} className="text-red-500 text-sm cursor-pointer hover:underline">
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <AdminInput label="SKU" value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} />
                <AdminInput label="Name" value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)} />
                <AdminInput label="Price" type="number" value={v.price} onChange={(e) => updateVariant(i, "price", e.target.value)} />
                <AdminInput label="Compare Price" type="number" value={v.comparePrice} onChange={(e) => updateVariant(i, "comparePrice", e.target.value)} />
                <AdminInput label="Stock" type="number" value={v.stockQuantity} onChange={(e) => updateVariant(i, "stockQuantity", e.target.value)} />
                <AdminInput label="Description" value={v.description} onChange={(e) => updateVariant(i, "description", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <AdminButton type="submit" loading={createProduct.isPending}>
            Create Product
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
