"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAdminUsers } from "@/app/hooks/useAdmin";
import AdminTable from "@/app/admin/components/AdminTable";
import AdminSearch from "@/app/admin/components/AdminSearch";
import AdminButton from "@/app/admin/components/AdminButton";
import StatusBadge from "@/app/admin/components/StatusBadge";
import { IoAdd } from "react-icons/io5";

export default function UsersPage() {
  const { data, isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");

  const allUsers = data?.data?.users || data?.data || [];
  const users = search
    ? allUsers.filter((u) =>
        `${u.firstName} ${u.lastName} ${u.phone || ""} ${u.role}`.toLowerCase().includes(search.toLowerCase())
      )
    : allUsers;

  const columns = [
    {
      key: "avatar",
      label: "",
      render: (row) => (
        <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
          {row.avatar?.url ? (
            <img src={row.avatar.url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-blue-600 font-semibold text-sm">
              {(row.firstName?.[0] || "") + (row.lastName?.[0] || "")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">{row.firstName} {row.lastName}</p>
          <p className="text-xs text-gray-400">{row.auth?.email || ""}</p>
        </div>
      ),
    },
    { key: "phone", label: "Phone", render: (row) => row.phone || "—" },
    {
      key: "role",
      label: "Role",
      render: (row) => <StatusBadge status={row.role} />,
    },
    {
      key: "permissions",
      label: "Permissions",
      render: (row) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {(row.permissions || []).slice(0, 3).map((p) => (
            <span key={p} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded font-medium">
              {p.replace("manage", "")}
            </span>
          ))}
          {(row.permissions || []).length > 3 && (
            <span className="text-[10px] text-gray-400">+{row.permissions.length - 3}</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Link href={`/admin/users/${row.id}`} className="text-blue-500 hover:underline text-sm font-medium">
          View
        </Link>
      ),
    },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Users</h1>
        <Link href="/admin/users/create">
          <AdminButton>
            <IoAdd size={20} className="mr-2" /> Add User
          </AdminButton>
        </Link>
      </div>

      <div className="mb-6">
        <AdminSearch value={search} onChange={setSearch} placeholder="Search users..." className="max-w-md" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <AdminTable columns={columns} data={users} emptyMessage="No users found" />
      )}
    </div>
  );
}
