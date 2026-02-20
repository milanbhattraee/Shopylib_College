import React from "react";
import { serverFetch } from "@/app/lib/axios";
import CategoryClient from "./CategoryClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const data = await serverFetch(`/categories/${slug}?limit=1`);
    const category = data?.data?.category;
    return {
      title: `${category?.name || "Category"} – Shopylib`,
      description: category?.description || `Browse products in ${category?.name}`,
    };
  } catch {
    return { title: "Category Not Found" };
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  let category = null;
  let initialProducts = [];
  let pagination = null;

  try {
    const data = await serverFetch(`/categories/${slug}?limit=12`);
    category = data?.data?.category;
    initialProducts = data?.data?.products || [];
    pagination = data?.data?.pagination;
  } catch (e) {
    console.error("Category SSR error:", e);
  }

  if (!category) notFound();

  return (
    <CategoryClient
      category={category}
      initialProducts={initialProducts}
      initialPagination={pagination}
      slug={slug}
    />
  );
}
