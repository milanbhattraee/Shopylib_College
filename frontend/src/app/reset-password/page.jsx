"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { useResetPassword } from "@/app/hooks/useAuth";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const reset = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    reset.mutate({ token, newPassword: password });
  };

  if (reset.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px] text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-blue-700 mb-4">Password Reset!</h2>
          <p className="text-gray-600 mb-6">Your password has been reset successfully. You can now log in with your new password.</p>
          <Link
            href="/?login=true"
            className="inline-block cursor-pointer w-full transition-all bg-blue-500 h-12 text-white px-6 py-3 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[500px]">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-700">
          Reset Password
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-bold text-gray-600">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                  error ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
                }`}
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {!showPassword ? (
                <IoEye
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-500"
                  size={22}
                  onClick={() => setShowPassword(true)}
                />
              ) : (
                <IoEyeOff
                  className="absolute right-3 top-3.5 cursor-pointer text-gray-500"
                  size={22}
                  onClick={() => setShowPassword(false)}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-sm font-bold text-gray-600">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              className={`w-full p-3 border-2 rounded-lg focus:outline-none focus:ring-2 ${
                error ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-blue-300"
              }`}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {reset.isError && (
            <p className="text-red-500 text-sm text-center">
              {reset.error?.response?.data?.message || "Password reset failed"}
            </p>
          )}

          <div className="w-full flex justify-center flex-col gap-y-4 items-center">
            <button
              type="submit"
              disabled={reset.isPending}
              className="cursor-pointer w-full transition-all bg-blue-500 h-12 text-white px-6 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
            >
              {reset.isPending ? "Resetting..." : "Reset Password"}
            </button>
          </div>

          <div className="flex justify-center mt-4">
            <Link href="/?login=true" className="text-sm font-bold text-blue-500 hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
