"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useCreateUser } from "@/app/hooks/useAdmin";
import AdminInput from "@/app/admin/components/AdminInput";
import AdminSelect from "@/app/admin/components/AdminSelect";
import AdminImageUpload from "@/app/admin/components/AdminImageUpload";
import AdminButton from "@/app/admin/components/AdminButton";

export default function CreateUserPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const createUser = useCreateUser();
  const [avatar, setAvatar] = React.useState(null);

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, val]) => {
      if (val !== undefined && val !== "") formData.append(key, val);
    });
    if (avatar) formData.append("avatar", avatar);

    createUser.mutate(formData, { onSuccess: () => router.push("/admin/users") });
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">Create User</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl">
        <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg">
          A password will be auto-generated and sent to the user&apos;s email address.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <AdminInput label="First Name" error={errors.firstName?.message} {...register("firstName", { required: "First name is required" })} />
          <AdminInput label="Last Name" error={errors.lastName?.message} {...register("lastName", { required: "Last name is required" })} />
          <AdminInput label="Email" type="email" error={errors.email?.message} {...register("email", { required: "Email is required" })} />
          <AdminInput label="Phone" {...register("phone")} />
          <AdminSelect
            label="Gender"
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other" },
            ]}
            {...register("gender")}
          />
          <AdminInput label="Date of Birth" type="date" {...register("dateOfBirth")} />
          <AdminSelect
            label="Role"
            options={[
              { value: "customer", label: "Customer" },
              { value: "admin", label: "Admin" },
            ]}
            {...register("role")}
          />
          <AdminInput label="Province" {...register("province")} />
          <AdminInput label="City" {...register("city")} />
        </div>

        <div className="mt-4">
          <AdminInput label="Full Address" {...register("fullAddress")} className="w-full" />
        </div>

        <div className="mt-4">
          <AdminImageUpload label="User Avatar" onChange={setAvatar} />
        </div>

        <div className="flex gap-4 mt-8">
          <AdminButton type="submit" loading={createUser.isPending}>
            Create User
          </AdminButton>
          <AdminButton type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </AdminButton>
        </div>
      </form>
    </div>
  );
}
