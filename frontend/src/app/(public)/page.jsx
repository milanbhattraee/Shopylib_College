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
  let banners = [];
  let stats = { customers: 0, products: 0, deliveredOrders: 0 };

  try {
    const [featuredRes, categoriesRes, latestRes, bannersRes, statsRes] = await Promise.allSettled([
      serverFetch("/products/featured?limit=10"),
      serverFetch("/categories"),
      serverFetch("/products?limit=12&sortBy=createdAt&sortOrder=DESC"),
      serverFetch("/banners/active"),
      serverFetch("/stats"),
    ]);

    if (featuredRes.status === "fulfilled") featured = featuredRes.value?.data?.products || [];
    if (categoriesRes.status === "fulfilled") categories = categoriesRes.value?.data || [];
    if (latestRes.status === "fulfilled") latestProducts = latestRes.value?.data?.products || [];
    if (bannersRes.status === "fulfilled") banners = bannersRes.value?.data || [];
    if (statsRes.status === "fulfilled") stats = statsRes.value?.data || stats;
  } catch (e) {
    console.error("Home SSR fetch error:", e);
  }

  return <HomeClient featured={featured} categories={categories} latestProducts={latestProducts} banners={banners} stats={stats} />;
}
