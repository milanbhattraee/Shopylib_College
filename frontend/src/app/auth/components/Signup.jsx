"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { IoMdClose } from "react-icons/io";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useRegister } from "@/app/hooks/useAuth";

export default function SignupForm({ closePopup, openLoginPopup }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const signup = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState("form"); // "form" | "success"

  const onSubmit = (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
    };
    signup.mutate(payload, {
      onSuccess: () => setStep("success"),
    });
  };

  const handleGoogleSignup = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  // Show success message after registration
  if (step === "success") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
        <div className="bg-white relative rounded-2xl shadow-xl p-8 w-[500px] text-center">
          <IoMdClose
            className="absolute right-8 top-8 text-3xl text-blue-600 cursor-pointer transform transition-transform duration-300 hover:rotate-90"
            onClick={closePopup}
          />
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-blue-700 mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-2">
              We&apos;ve sent a verification link to your email address.
            </p>
            <p className="text-gray-500 text-sm">
              Please click the link in the email to verify your account. The link will expire in 24 hours.
            </p>
          </div>
          <button
            onClick={openLoginPopup}
            className="cursor-pointer w-full transition-all bg-blue-500 h-12 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
      <div className="bg-white relative rounded-2xl shadow-xl p-8 w-[500px] max-h-[90vh] overflow-y-auto">
        <IoMdClose
          className="absolute right-8 top-8 text-3xl text-blue-600 cursor-pointer transform transition-transform duration-300 hover:rotate-90"
          onClick={closePopup}
        />

        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Sign Up
        </h2>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div className="relative mb-3 w-full h-10">
              <input
                className="peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                placeholder=" "
                {...register("firstName", { required: "First Name is required" })}
              />
              <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-300">
                First Name
              </label>
              <p className="text-red-500 text-xs px-3">{errors?.firstName?.message}</p>
            </div>
            {/* Last Name */}
            <div className="relative mb-3 w-full h-10">
              <input
                className="peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                placeholder=" "
                {...register("lastName")}
              />
              <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-300">
                Last Name
              </label>
              <p className="text-red-500 text-xs px-3">{errors?.lastName?.message}</p>
            </div>
            {/* Password */}
            <div className="relative mb-3 w-full h-10">
              <input
                type={showPassword ? "text" : "password"}
                className="peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                placeholder=" "
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Password must be at least 8 characters" },
                })}
                autoComplete="new-password"
              />
              <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-300">
                Password
              </label>
              {!showPassword ? (
                <IoEye className="absolute right-1 top-2 cursor-pointer" size={25} onClick={() => setShowPassword(true)} />
              ) : (
                <IoEyeOff className="absolute right-1 top-2 cursor-pointer" size={25} onClick={() => setShowPassword(false)} />
              )}
              <p className="text-red-500 text-xs px-3">{errors?.password?.message}</p>
            </div>
            {/* Confirm Password */}
            <div className="relative mb-3 w-full h-10">
              <input
                type={showPassword ? "text" : "password"}
                className="peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
                placeholder=" "
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (value) => value === watch("password") || "Passwords don't match",
                })}
                autoComplete="new-password"
              />
              <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-300">
                Confirm Password
              </label>
              {!showPassword ? (
                <IoEye className="absolute right-1 top-2 cursor-pointer" size={25} onClick={() => setShowPassword(true)} />
              ) : (
                <IoEyeOff className="absolute right-1 top-2 cursor-pointer" size={25} onClick={() => setShowPassword(false)} />
              )}
              <p className="text-red-500 text-xs px-3">{errors?.confirmPassword?.message}</p>
            </div>
          </div>

          {/* Email */}
          <div className="relative mb-3 w-full h-10">
            <input
              className="peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
              placeholder=" "
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi,
                  message: "Invalid email format",
                },
              })}
              type="email"
              autoComplete="email"
            />
            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-300">
              Email Address
            </label>
            <p className="text-xs px-3 text-red-500">{errors?.email?.message}</p>
          </div>

          {/* Phone (optional) */}
          <div className="relative mb-3 w-full h-10">
            <input
              className="peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50"
              placeholder=" "
              {...register("phone")}
            />
            <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-300">
              Phone (optional)
            </label>
          </div>

          {/* Error Message */}
          {signup.isError && (
            <p className="text-red-500 text-sm text-center">
              {signup.error?.response?.data?.message || "Registration failed"}
            </p>
          )}

          <div className="flex items-center justify-center my-4">
            <span className="text-gray-500">or</span>
          </div>

          <div className="w-full flex justify-center flex-col gap-y-4 items-center">
            <button
              type="submit"
              disabled={signup.isPending}
              className="cursor-pointer w-full transition-all bg-blue-500 h-12 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
            >
              {signup.isPending && (
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin h-5 w-5 mr-3 text-white inline">
                  <circle strokeWidth="4" stroke="currentColor" r="10" cy="12" cx="12" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" className="opacity-75" />
                </svg>
              )}
              Sign Up
            </button>
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="cursor-pointer w-full h-12 flex justify-center items-center transition-all text-blue-600 bg-gray-200 px-6 py-2 rounded-lg border-gray-400 border-b-[4px] hover:brightness-100 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
            >
              <FcGoogle className="mr-3" size={24} />
              Sign Up with Google
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <span
              className="text-sm font-bold text-blue-500 hover:underline cursor-pointer"
              onClick={openLoginPopup}
            >
              Already have an account? Sign In
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
