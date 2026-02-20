"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FiStar, FiEdit2, FiTrash2 } from "react-icons/fi";
import { useAuth } from "@/app/provider/AuthProvider";
import { useUserReviews, useDeleteReview, useUpdateReview } from "@/app/hooks/useProtected";
import StarRating from "@/app/components/ui/StarRating";
import { Loader } from "@/app/components/ui/Loader";

export default function ReviewsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useUserReviews(user?.id);
  const deleteReview = useDeleteReview();
  const updateReview = useUpdateReview();
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const reviews = data?.data?.reviews || data?.data || [];

  const startEdit = (review) => {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateReview.mutate(
      { id: editingId, data: { rating: editRating, comment: editComment } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditRating(0);
          setEditComment("");
        },
      }
    );
  };

  if (isLoading) return <Loader />;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">My Reviews</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <FiStar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-6">You haven&apos;t written any reviews yet</p>
          <Link
            href="/"
            className="cursor-pointer inline-flex items-center justify-center bg-blue-500 h-12 text-white px-8 py-2 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => {
            const product = review.Product || review.product || {};
            const isEditing = editingId === review.id;

            return (
              <div key={review.id} className="py-4">
                <div className="flex gap-4">
                  <Link href={`/products/${product.slug || product.id}`} className="shrink-0">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.png"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.slug || product.id}`}>
                      <h3 className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition">{product.name}</h3>
                    </Link>

                    {isEditing ? (
                      <form onSubmit={handleUpdate} className="mt-2 space-y-3">
                        <StarRating rating={editRating} interactive onChange={setEditRating} size="md" />
                        <div className="relative w-full">
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            rows={2}
                            className="peer w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0"
                            placeholder=" "
                          />
                          <label className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500">
                            Your Review
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={updateReview.isPending}
                            className="cursor-pointer flex items-center justify-center bg-blue-500 h-9 text-white px-5 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-xs font-semibold disabled:opacity-50"
                          >
                            {updateReview.isPending ? "Saving..." : "Save"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="cursor-pointer flex items-center justify-center bg-gray-200 h-9 text-gray-700 px-5 rounded-lg border-gray-400 border-b-[4px] hover:brightness-100 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] text-xs font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mt-1">
                          <StarRating rating={review.rating} size="sm" />
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && <p className="text-sm text-gray-600 mt-1">{review.comment}</p>}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => startEdit(review)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition font-medium"
                          >
                            <FiEdit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => deleteReview.mutate(review.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition font-medium"
                          >
                            <FiTrash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
