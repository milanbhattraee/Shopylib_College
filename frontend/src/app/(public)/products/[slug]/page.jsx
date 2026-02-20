import React from "react";
import { serverFetch } from "@/app/lib/axios";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const data = await serverFetch(`/products/${slug}`);
    const product = data?.data;
    return {
      title: product?.metaTitle || product?.name || "Product",
      description: product?.metaDescription || product?.shortDescription || product?.description?.substring(0, 160),
      openGraph: {
        title: product?.name,
        description: product?.shortDescription,
        images: product?.images?.[0]?.url ? [{ url: product.images[0].url }] : [],
      },
    };
  } catch {
    return { title: "Product Not Found" };
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  let product = null;

  try {
    const data = await serverFetch(`/products/${slug}`);
    product = data?.data;
  } catch (e) {
    console.error("Product SSR error:", e);
  }

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
