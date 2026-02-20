import React from "react";
import { serverFetch } from "@/app/lib/axios";
import HomeClient from "./HomeClient";

export const metadata = {
  title: "Shopylib – Shop Quality Products",
  description: "Discover quality products at competitive prices. Browse featured products, categories, and more.",
};

export default async function HomePage() {
  let featured = [];
  let categories = [];
  let latestProducts = [];

  try {
    const [featuredRes, categoriesRes, latestRes] = await Promise.allSettled([
      serverFetch("/products/featured?limit=10"),
      serverFetch("/categories"),
      serverFetch("/products?limit=12&sortBy=createdAt&sortOrder=DESC"),
    ]);

    if (featuredRes.status === "fulfilled") featured = featuredRes.value?.data?.products || [];
    if (categoriesRes.status === "fulfilled") categories = categoriesRes.value?.data || [];
    if (latestRes.status === "fulfilled") latestProducts = latestRes.value?.data?.products || [];
  } catch (e) {
    console.error("Home SSR fetch error:", e);
  }

  return <HomeClient featured={featured} categories={categories} latestProducts={latestProducts} />;
}
