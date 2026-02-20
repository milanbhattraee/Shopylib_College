"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { FiArrowRight, FiChevronRight } from "react-icons/fi";
import ProductCard from "@/app/components/ui/ProductCard";
import { useProducts, useCategories } from "@/app/hooks/useProducts";
import { SkeletonGrid } from "@/app/components/ui/Loader";
import PaginationComponent from "@/app/components/ui/Pagination";

export default function HomeClient({ featured = [], categories = [], latestProducts = [] }) {
  const [page, setPage] = useState(1);
  const { data: paginatedData, isLoading } = useProducts({ page, limit: 12 });

  const products = page === 1 && latestProducts.length > 0 ? latestProducts : (paginatedData?.data?.products || []);
  const pagination = paginatedData?.data?.pagination;

  return (
    <>
      {/* Hero / Featured Carousel */}
      {featured.length > 0 && (
        <section className="bg-gradient-to-br from-primary via-primary-dark to-blue-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Link href="/search?featured=true" className="text-sm flex items-center gap-1 text-white/80 hover:text-white transition">
                View All <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              spaceBetween={16}
              slidesPerView={2}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="pb-10"
            >
              {featured.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group relative bg-white rounded-xl border border-gray-100 p-5 text-center hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                {cat.image?.url && (
                  <img src={cat.image.url} alt={cat.name} className="w-16 h-16 mx-auto mb-3 object-contain group-hover:scale-110 transition-transform" />
                )}
                <h3 className="text-sm font-semibold text-gray-700 group-hover:text-primary transition">{cat.name}</h3>
                {cat.productCount > 0 && <p className="text-xs text-gray-400 mt-1">{cat.productCount} items</p>}
                <FiChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Latest Products</h2>
        {isLoading && page > 1 ? (
          <SkeletonGrid count={12} />
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {pagination && (
              <PaginationComponent
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500 text-center py-12">No products found.</p>
        )}
      </section>
    </>
  );
}
