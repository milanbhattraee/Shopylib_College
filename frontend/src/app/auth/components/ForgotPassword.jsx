"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { IoMdClose } from "react-icons/io";
import { useForgotPassword } from "@/app/hooks/useAuth";

export default function ForgotPassword({ closePopup, openLoginPopup }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const forgot = useForgotPassword();

  const onSubmit = (data) => {
    forgot.mutate(data);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white relative rounded-2xl shadow-xl p-8 w-[500px]">
        <IoMdClose
          className="absolute right-8 top-8 text-3xl text-blue-600 cursor-pointer transform transition-transform duration-300 hover:rotate-90"
          onClick={closePopup}
        />
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Forgot Password
        </h2>

        {forgot.isSuccess && (
          <p className="text-green-600 text-center mb-4">
            If this email is registered, you will receive a password reset link.
          </p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-bold text-gray-600">
              Enter your email address
            </label>
            <input
              type="email"
              id="email"
              className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                errors?.email ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
              }`}
              placeholder="example@domain.com"
              {...register("email", { required: "Email is required" })}
            />
            {errors?.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          {forgot.isError && (
            <p className="text-red-500 text-sm text-center">
              {forgot.error?.response?.data?.message || "Something went wrong"}
            </p>
          )}

          <div className="w-full flex justify-center flex-col gap-y-4 items-center">
            <button
              type="submit"
              disabled={forgot.isPending}
              className="cursor-pointer w-full transition-all bg-blue-500 h-12 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
            >
              {forgot.isPending ? "Sending..." : "Send Reset Link"}
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <span
              onClick={openLoginPopup}
              className="text-sm font-bold text-blue-500 hover:underline cursor-pointer"
            >
              Back to Login
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
