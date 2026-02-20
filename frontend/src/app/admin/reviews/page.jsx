"use client";
import React, { useState } from "react";
import { useAdminReviews, useDeleteReview } from "@/app/hooks/useAdmin";
import AdminTable from "@/app/admin/components/AdminTable";
import AdminPagination from "@/app/admin/components/AdminPagination";
import AdminSelect from "@/app/admin/components/AdminSelect";
import AdminButton from "@/app/admin/components/AdminButton";
import { IoTrash, IoStar } from "react-icons/io5";

export default function ReviewsPage() {
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const { data, isLoading } = useAdminReviews({
    page,
    limit: 15,
    rating: rating || undefined,
    sortBy,
    order: "DESC",
  });
  const deleteReview = useDeleteReview();

  const reviews = data?.data || [];
  const pagination = data?.pagination;

  const columns = [
    {
      key: "rating",
      label: "Rating",
      render: (row) => (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <IoStar key={s} size={14} className={s <= row.rating ? "text-amber-400" : "text-gray-200"} />
          ))}
        </div>
      ),
    },
    {
      key: "comment",
      label: "Comment",
      render: (row) => (
        <p className="max-w-[300px] truncate text-sm text-gray-700">{row.comment || "—"}</p>
      ),
    },
    {
      key: "user",
      label: "User",
      render: (row) => row.User ? `${row.User.firstName} ${row.User.lastName}` : "—",
    },
    {
      key: "product",
      label: "Product",
      render: (row) => row.Product?.name || "—",
    },
    {
      key: "createdAt",
      label: "Date",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this review?")) deleteReview.mutate(row.id);
          }}
          className="text-red-500 hover:text-red-700 cursor-pointer"
        >
          <IoTrash size={16} />
        </button>
      ),
    },
  ];

  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Reviews</h1>

      <div className="flex gap-4 mb-6">
        <AdminSelect
          label="Filter by Rating"
          value={rating}
          onChange={(e) => { setRating(e.target.value); setPage(1); }}
          options={[
            { value: "1", label: "1 Star" },
            { value: "2", label: "2 Stars" },
            { value: "3", label: "3 Stars" },
            { value: "4", label: "4 Stars" },
            { value: "5", label: "5 Stars" },
          ]}
          className="w-48"
        />
        <AdminSelect
          label="Sort By"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={[
            { value: "createdAt", label: "Date" },
            { value: "rating", label: "Rating" },
          ]}
          className="w-48"
        />
        {rating && (
          <AdminButton variant="ghost" onClick={() => setRating("")} className="h-10 text-sm">
            Clear Filter
          </AdminButton>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          <AdminTable columns={columns} data={reviews} emptyMessage="No reviews found" />
          {pagination && (
            <AdminPagination currentPage={pagination.currentPage || page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
