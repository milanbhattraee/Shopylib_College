"use client";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { FiCamera, FiEdit2, FiLogOut, FiMonitor, FiSmartphone } from "react-icons/fi";
import { useAuth } from "@/app/provider/AuthProvider";
import { useChangePassword } from "@/app/hooks/useAuth";
import { useActiveSessions, useLogoutDevice } from "@/app/hooks/useProtected";
import { userApi } from "@/app/lib/api";
import { Loader } from "@/app/components/ui/Loader";
import { toast } from "react-toastify";

const inputClass =
  "peer h-full w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0";

const labelClass =
  "before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500";

export default function ProfilePage() {
  const { user, isLoading, invalidateUser } = useAuth();
  const changePassword = useChangePassword();
  const { data: sessionsData, isLoading: sessionsLoading } = useActiveSessions();
  const logoutDevice = useLogoutDevice();

  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const fileRef = useRef(null);

  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm({
    values: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phone: user?.phone || "",
    },
  });

  const { register: registerPass, handleSubmit: handlePassSubmit, reset: resetPass, formState: { errors: passErrors } } = useForm();

  const sessions = sessionsData?.data || [];

  const handleProfileUpdate = async (data) => {
    try {
      await userApi.updateProfile(data);
      invalidateUser();
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      await userApi.updateAvatar(user.id, formData);
      invalidateUser();
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    }
  };

  const handleChangePassword = (data) => {
    changePassword.mutate(data, {
      onSuccess: () => {
        resetPass();
        setShowPasswordForm(false);
        toast.success("Password changed!");
      },
    });
  };

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border-2 border-gray-100">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-blue-600">{user?.firstName?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shadow hover:bg-blue-600 transition"
            >
              <FiCamera className="w-3.5 h-3.5" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-800">{user?.firstName} {user?.lastName}</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition font-medium"
              >
                <FiEdit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleProfileSubmit(handleProfileUpdate)} className="mt-6 space-y-6 pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="relative w-full h-10">
                  <input
                    {...registerProfile("firstName", { required: "Required" })}
                    className={inputClass}
                    placeholder=" "
                  />
                  <label className={labelClass}>First Name</label>
                </div>
                {profileErrors.firstName && <p className="text-red-500 text-xs px-3 mt-1">{profileErrors.firstName.message}</p>}
              </div>
              <div>
                <div className="relative w-full h-10">
                  <input
                    {...registerProfile("lastName", { required: "Required" })}
                    className={inputClass}
                    placeholder=" "
                  />
                  <label className={labelClass}>Last Name</label>
                </div>
              </div>
            </div>
            <div>
              <div className="relative w-full h-10">
                <input
                  {...registerProfile("phone")}
                  className={inputClass}
                  placeholder=" "
                />
                <label className={labelClass}>Phone</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="cursor-pointer flex items-center justify-center bg-blue-500 h-10 text-white px-6 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-sm font-semibold"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="cursor-pointer flex items-center justify-center bg-gray-200 h-10 text-gray-700 px-6 rounded-lg border-gray-400 border-b-[4px] hover:brightness-100 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-blue-700">Security</h2>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePassSubmit(handleChangePassword)} className="space-y-6">
            <div>
              <div className="relative w-full h-10">
                <input
                  type="password"
                  {...registerPass("currentPassword", { required: "Required" })}
                  className={inputClass}
                  placeholder=" "
                />
                <label className={labelClass}>Current Password</label>
              </div>
              {passErrors.currentPassword && <p className="text-red-500 text-xs px-3 mt-1">{passErrors.currentPassword.message}</p>}
            </div>
            <div>
              <div className="relative w-full h-10">
                <input
                  type="password"
                  {...registerPass("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 chars" } })}
                  className={inputClass}
                  placeholder=" "
                />
                <label className={labelClass}>New Password</label>
              </div>
              {passErrors.newPassword && <p className="text-red-500 text-xs px-3 mt-1">{passErrors.newPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="cursor-pointer flex items-center justify-center bg-blue-500 h-10 text-white px-6 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-sm font-semibold disabled:opacity-50"
            >
              {changePassword.isPending ? "Changing..." : "Update Password"}
            </button>
            {changePassword.isError && <p className="text-red-500 text-sm">{changePassword.error?.response?.data?.message || "Failed"}</p>}
          </form>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Active Sessions</h2>
        {sessionsLoading ? (
          <Loader />
        ) : sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  {session.deviceType === "mobile" ? <FiSmartphone className="w-5 h-5 text-blue-600" /> : <FiMonitor className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{session.browser || session.deviceType || "Unknown Device"}</p>
                  <p className="text-xs text-gray-500">
                    {session.ip} {"\u2022"} Last active: {new Date(session.lastUsed || session.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => logoutDevice.mutate({ tokenId: session.id })}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition font-medium"
                  >
                    <FiLogOut className="w-3 h-3" /> Logout
                  </button>
                )}
                {session.isCurrent && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">This device</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No active sessions found.</p>
        )}
      </div>
    </div>
  );
}
