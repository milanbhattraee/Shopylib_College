"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCreateCoupon } from "@/app/hooks/useAdmin";
import AdminInput from "@/app/admin/components/AdminInput";
import AdminTextarea from "@/app/admin/components/AdminTextarea";
import AdminSelect from "@/app/admin/components/AdminSelect";
import AdminToggle from "@/app/admin/components/AdminToggle";
import AdminButton from "@/app/admin/components/AdminButton";

export default function CreateCouponPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { type: "percentage", isActive: true, isGlobal: true, usageLimitPerUser: 1 },
  });
  const createCoupon = useCreateCoupon();

  const onSubmit = (data) => {
    const payload = {
      ...data,
      value: Number(data.value),
      maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : undefined,
      minimumAmount: data.minimumAmount ? Number(data.minimumAmount) : undefined,
      usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      usageLimitPerUser: data.usageLimitPerUser ? Number(data.usageLimitPerUser) : 1,
    };
    createCoupon.mutate(payload, { onSuccess: () => router.push("/admin/coupons") });
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Create Coupon</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <AdminInput label="Coupon Code" error={errors.code?.message} {...register("code", { required: "Code is required" })} />
          <AdminInput label="Name" error={errors.name?.message} {...register("name", { required: "Name is required" })} />
          <AdminSelect
            label="Type"
            options={[
              { value: "percentage", label: "Percentage" },
              { value: "fixed", label: "Fixed Amount" },
            ]}
            {...register("type")}
          />
          <AdminInput label="Value" type="number" error={errors.value?.message} {...register("value", { required: "Value is required" })} />
          <AdminInput label="Max Discount Amount" type="number" {...register("maxDiscountAmount")} />
          <AdminInput label="Minimum Order Amount" type="number" {...register("minimumAmount")} />
          <AdminInput label="Usage Limit" type="number" {...register("usageLimit")} />
          <AdminInput label="Per User Limit" type="number" {...register("usageLimitPerUser")} />
          <AdminInput label="Start Date" type="date" {...register("startDate")} />
          <AdminInput label="End Date" type="date" {...register("endDate")} />
        </div>

        <div className="mt-6">
          <AdminTextarea label="Description" rows={3} {...register("description")} />
        </div>

        <div className="flex gap-6 mt-6">
          <AdminToggle label="Active" checked={watch("isActive")} onChange={(e) => setValue("isActive", e.target.checked)} />
          <AdminToggle label="Global" checked={watch("isGlobal")} onChange={(e) => setValue("isGlobal", e.target.checked)} />
        </div>

        <div className="flex gap-4 mt-8">
          <AdminButton type="submit" loading={createCoupon.isPending}>
            Create Coupon
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
