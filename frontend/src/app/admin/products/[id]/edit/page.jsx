"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAdminProduct, useUpdateProduct, useAdminCategories } from "@/app/hooks/useAdmin";
import AdminInput from "@/app/admin/components/AdminInput";
import AdminTextarea from "@/app/admin/components/AdminTextarea";
import AdminSelect from "@/app/admin/components/AdminSelect";
import AdminToggle from "@/app/admin/components/AdminToggle";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import AdminButton from "@/app/admin/components/AdminButton";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const { data: productData, isLoading } = useAdminProduct(id);
  const { data: catData } = useAdminCategories();
  const updateProduct = useUpdateProduct();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm();
  const [newImages, setNewImages] = useState([]);

  const product = productData?.data?.product || productData?.data;
  const categories = catData?.data || [];

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        slug: product.slug || "",
        sku: product.sku || "",
        categoryId: product.categoryId || "",
        price: product.price || "",
        comparePrice: product.comparePrice || "",
        costPrice: product.costPrice || "",
        stockQuantity: product.stockQuantity || "",
        lowStockThreshold: product.lowStockThreshold || "",
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        tags: product.tags?.join(", ") || "",
        metaTitle: product.metaTitle || "",
        metaDescription: product.metaDescription || "",
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
      });
    }
  }, [product, reset]);

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== "") formData.append(key, val);
    });

    // Keep existing images
    if (product?.images) {
      formData.append("imagesToKeep", JSON.stringify(product.images.map((img) => img.public_id)));
    }

    newImages.forEach((file) => formData.append("images", file));

    updateProduct.mutate(
      { id, formData },
      { onSuccess: () => router.push("/admin/products") }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Edit Product</h1>

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

        {/* Existing images */}
        {product?.images?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-cyan-500 font-medium mb-2">Current Images</p>
            <div className="flex flex-wrap gap-2">
              {product.images.map((img, i) => (
                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <AdminImageUpload
            label="Upload New Images"
            multiple
            onChange={(files) => setNewImages(Array.isArray(files) ? files : [files])}
          />
        </div>

        {/* Variants Display */}
        {product?.variants?.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-blue-700 mb-4">Variants</h3>
            <div className="space-y-3">
              {product.variants.map((v) => (
                <div key={v.id} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800">{v.name || v.sku}</p>
                    <p className="text-sm text-gray-400">SKU: {v.sku} | Price: Rs. {v.price} | Stock: {v.stockQuantity}</p>
                  </div>
                  <StatusBadgeInline active={v.isActive} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <AdminButton type="submit" loading={updateProduct.isPending}>
            Update Product
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </div>
  );
}

function StatusBadgeInline({ active }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
