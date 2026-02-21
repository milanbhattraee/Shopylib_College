"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { FiArrowRight, FiChevronRight, FiPackage, FiZap, FiTrendingUp, FiGrid, FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiUsers, FiBox, FiCheckCircle } from "react-icons/fi";
import ProductCard from "@/app/components/ui/ProductCard";
import { useProducts } from "@/app/hooks/useProducts";
import { SkeletonGrid } from "@/app/components/ui/Loader";
import PaginationComponent from "@/app/components/ui/Pagination";

/* ─── tiny hook: fade-in on scroll ─── */
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { e.target.classList.add("in-view"); obs.unobserve(e.target); } },
      { threshold: 0.08 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Marquee trust-bar ─── */
const TRUST_ITEMS = [
  { icon: <FiTruck className="w-4 h-4" />, text: "Free Delivery above Rs. 999" },
  { icon: <FiShield className="w-4 h-4" />, text: "100% Secure Payments" },
  { icon: <FiRefreshCw className="w-4 h-4" />, text: "Easy 7-Day Returns" },
  { icon: <FiCheckCircle className="w-4 h-4" />, text: "Genuine Products Only" },
  { icon: <FiBox className="w-4 h-4" />, text: "Gift Wrapping Available" },
  { icon: <FiHeadphones className="w-4 h-4" />, text: "24/7 Customer Support" },
];

function TrustBar() {
  return (
    <div className="bg-white border-b border-gray-100 overflow-hidden py-2.5">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...TRUST_ITEMS, ...TRUST_ITEMS].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 mx-8 text-xs font-semibold text-gray-500 uppercase tracking-wide flex-shrink-0">
            <span className="text-primary">{item.icon}</span>
            {item.text}
            <span className="text-gray-200 ml-8">|</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Animated counter ─── */
function Counter({ to, suffix = "" }) {
  const [val, setVal] = useState(to);
  const ref = useRef();
  const animated = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const step = to / 50;
        const t = setInterval(() => {
          start += step;
          if (start >= to) { setVal(to); clearInterval(t); } else { setVal(Math.floor(start)); }
        }, 25);
        obs.unobserve(e.target);
      }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ─── Section wrapper with scroll reveal ─── */
function Section({ children, className = "" }) {
  const ref = useFadeIn();
  return (
    <section ref={ref} className={`reveal-section ${className}`}>
      {children}
    </section>
  );
}

/* ─── SectionHeading ─── */
function SectionHeading({ icon, title, sub, action, accent = "blue" }) {
  const accents = {
    blue:   "from-blue-500 to-blue-600",
    amber:  "from-amber-400 to-orange-500",
    violet: "from-violet-500 to-purple-600",
    emerald:"from-emerald-400 to-teal-500",
  };
  return (
    <div className="flex items-start justify-between mb-5 gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center shadow-sm flex-shrink-0`}>
          <span className="text-white text-base">{icon}</span>
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-none tracking-tight">{title}</h2>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ─── Category pill ─── */
function CategoryCard({ cat, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 border-2 focus:outline-none ${
        active
          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
          : "border-transparent hover:border-gray-200 hover:bg-gray-50"
      }`}
    >
      <div className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${active ? "ring-2 ring-blue-400 ring-offset-1" : "bg-gray-100"}`}>
        {cat.image?.url ? (
          <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <FiGrid className="w-6 h-6 text-gray-400" />
        )}
      </div>
      <span className={`text-[11px] font-semibold leading-tight text-center line-clamp-2 w-full transition-colors ${active ? "text-blue-600" : "text-gray-600 group-hover:text-gray-900"}`}>
        {cat.name}
      </span>
    </button>
  );
}

/* ─── Skeleton category ─── */
function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="w-14 h-14 rounded-xl bg-gray-100 animate-pulse" />
      <div className="w-12 h-2.5 rounded bg-gray-100 animate-pulse" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function HomeClient({ featured = [], categories = [], latestProducts = [], banners = [], stats = {} }) {
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState(null);

  const { data: paginatedData, isLoading } = useProducts({
    page,
    limit: 12,
    ...(activeCategory && { category: activeCategory }),
  });

  const products = page === 1 && !activeCategory && latestProducts.length > 0
    ? latestProducts
    : (paginatedData?.data?.products || []);
  const pagination = paginatedData?.data?.pagination;

  const activeCategoryName = useMemo(() => {
    if (!activeCategory) return null;
    return categories.find((c) => c.id === activeCategory)?.name || null;
  }, [activeCategory, categories]);

  const getBannerLink = useCallback((banner) => {
    if (banner.link) return banner.link;
    if (banner.product) return `/products/${banner.product.slug}`;
    if (banner.category) return `/categories/${banner.category.slug}`;
    return null;
  }, []);

  const activeCategories = categories.filter((c) => c.isActive !== false);

  return (
    <>
      {/* ── Global styles (injected once) ─────────────────── */}
      <style>{`
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .animate-marquee { animation: marquee 28s linear infinite; }
        .reveal-section { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .reveal-section.in-view { opacity: 1; transform: translateY(0); }
        .swiper-button-next::after, .swiper-button-prev::after { font-size: 13px !important; font-weight: 900; }
      `}</style>

      <div className="min-h-screen bg-[#f1f3f6]">

        {/* ── Trust Bar ───────────────────────────────────── */}
        <TrustBar />

        {/* ── Hero Banner ─────────────────────────────────── */}
        {banners.length > 0 && (
          <section className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-4">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200/60">
              <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                effect="fade"
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5500, disableOnInteraction: false }}
                loop={banners.length > 1}
                className={[
                  "w-full aspect-[2.2/1] sm:aspect-[3/1] lg:aspect-[3.5/1]",
                  /* nav buttons — frosted glass pill */
                  "[&_.swiper-button-next]:text-white [&_.swiper-button-prev]:text-white",
                  "[&_.swiper-button-next]:bg-white/15 [&_.swiper-button-prev]:bg-white/15",
                  "[&_.swiper-button-next]:backdrop-blur-md [&_.swiper-button-prev]:backdrop-blur-md",
                  "[&_.swiper-button-next]:rounded-full [&_.swiper-button-prev]:rounded-full",
                  "[&_.swiper-button-next]:w-10 [&_.swiper-button-prev]:w-10",
                  "[&_.swiper-button-next]:h-10 [&_.swiper-button-prev]:h-10",
                  "[&_.swiper-button-next]:border [&_.swiper-button-prev]:border",
                  "[&_.swiper-button-next]:border-white/20 [&_.swiper-button-prev]:border-white/20",
                  "[&_.swiper-button-next]:hover:bg-white/30 [&_.swiper-button-prev]:hover:bg-white/30",
                  "[&_.swiper-button-next]:transition-all [&_.swiper-button-prev]:transition-all",
                  "[&_.swiper-button-next]:shadow-lg [&_.swiper-button-prev]:shadow-lg",
                  "[&_.swiper-button-next]:right-4 [&_.swiper-button-prev]:left-4",
                  /* pagination dots — pill style */
                  "[&_.swiper-pagination-bullet]:bg-white/40 [&_.swiper-pagination-bullet]:w-2.5 [&_.swiper-pagination-bullet]:h-2.5",
                  "[&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-pagination-bullet-active]:w-7 [&_.swiper-pagination-bullet-active]:rounded-full",
                  "[&_.swiper-pagination-bullet-active]:shadow-md",
                  "[&_.swiper-pagination]:bottom-5",
                  "[&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300",
                  "[&_.swiper-pagination-bullet]:rounded-full",
                ].join(" ")}
              >
                {banners.map((banner) => {
                  const link = getBannerLink(banner);
                  const Wrapper = link ? Link : "div";
                  const wrapperProps = link ? { href: link } : {};
                  return (
                    <SwiperSlide key={banner.id}>
                      <Wrapper {...wrapperProps} className="relative block w-full h-full group overflow-hidden cursor-pointer">
                        <img
                          src={banner.image?.url}
                          alt={banner.title}
                          className="w-full h-full object-cover transition-transform duration-[8000ms] ease-out group-hover:scale-[1.04]"
                        />
                        {/* Premium multi-layer gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center px-6 sm:px-12 lg:px-16">
                          <div className="max-w-xl">
                            {banner.tag && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-bold tracking-wide uppercase mb-3">
                                <FiZap className="w-3 h-3" /> {banner.tag}
                              </span>
                            )}
                            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.15] tracking-tight drop-shadow-lg">
                              {banner.title}
                            </h2>
                            {banner.subtitle && (
                              <p className="mt-2.5 text-sm sm:text-base text-white/70 max-w-md leading-relaxed line-clamp-2">
                                {banner.subtitle}
                              </p>
                            )}
                            {link && (
                              <div className="mt-5">
                                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-full text-sm font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 group-hover:gap-3">
                                  {banner.linkText || "Shop Now"}
                                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Wrapper>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>
          </section>
        )}

        {/* ── Metrics strip ────────────────────────────────── */}
        <Section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Happy Customers", value: stats.customers || 0, suffix: "+", icon: <FiUsers className="w-5 h-5" />, color: "text-blue-500 bg-blue-50 border-blue-100" },
              { label: "Products Listed", value: stats.products || 0, suffix: "+", icon: <FiBox className="w-5 h-5" />, color: "text-violet-500 bg-violet-50 border-violet-100" },
              { label: "Orders Delivered", value: stats.deliveredOrders || 0, suffix: "+", icon: <FiTruck className="w-5 h-5" />, color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 border ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className="text-xl sm:text-2xl font-black text-gray-900 leading-none">
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] sm:text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Categories ───────────────────────────────────── */}
        {activeCategories.length > 0 && (
          <Section className={`max-w-7xl mx-auto px-4 sm:px-6 ${banners.length > 0 ? "mt-4" : "mt-6"} relative z-20`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <SectionHeading
                icon={<FiGrid />}
                title="Shop by Category"
                sub={`${activeCategories.length} categories`}
                accent="blue"
                action={
                  <Link href="/categories" className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors flex-shrink-0">
                    See All <FiChevronRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />

              {/* Desktop: Swiper, Mobile: scrollable row */}
              <div className="hidden sm:block">
                <Swiper
                  modules={[Navigation]}
                  spaceBetween={8}
                  slidesPerView="auto"
                  navigation
                  className={[
                    "[&_.swiper-button-next]:text-gray-700 [&_.swiper-button-prev]:text-gray-700",
                    "[&_.swiper-button-next]:bg-white [&_.swiper-button-prev]:bg-white",
                    "[&_.swiper-button-next]:shadow-md [&_.swiper-button-prev]:shadow-md",
                    "[&_.swiper-button-next]:rounded-full [&_.swiper-button-prev]:rounded-full",
                    "[&_.swiper-button-next]:w-8 [&_.swiper-button-prev]:w-8",
                    "[&_.swiper-button-next]:h-8 [&_.swiper-button-prev]:h-8",
                    "[&_.swiper-button-next]:border [&_.swiper-button-prev]:border",
                    "[&_.swiper-button-next]:border-gray-100 [&_.swiper-button-prev]:border-gray-100",
                  ].join(" ")}
                >
                  {activeCategories.slice(0, 20).map((cat) => (
                    <SwiperSlide key={cat.id} style={{ width: "auto" }}>
                      <Link href={`/categories/${cat.slug}`}>
                        <CategoryCard cat={cat} active={false} onClick={() => {}} />
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {/* Mobile: 4-col grid */}
              <div className="sm:hidden grid grid-cols-4 gap-1">
                {activeCategories.slice(0, 8).map((cat) => (
                  <Link key={cat.id} href={`/categories/${cat.slug}`}>
                    <CategoryCard cat={cat} active={false} onClick={() => {}} />
                  </Link>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* ── Featured Products Carousel ───────────────────── */}
        {featured.length > 0 && (
          <Section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 overflow-hidden relative">
              {/* decorative top-right glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-50 blur-2xl pointer-events-none" />

              <SectionHeading
                icon={<FiZap />}
                title="Featured Products"
                sub="Handpicked just for you"
                accent="amber"
                action={
                  <Link href="/search?featured=true" className="text-xs text-amber-600 hover:text-amber-800 font-semibold flex items-center gap-1 transition-colors flex-shrink-0">
                    View All <FiChevronRight className="w-3.5 h-3.5" />
                  </Link>
                }
              />

              <Swiper
                modules={[Autoplay, Navigation]}
                spaceBetween={12}
                slidesPerView={2}
                navigation
                autoplay={{ delay: 4200, disableOnInteraction: false, pauseOnMouseEnter: true }}
                breakpoints={{
                  480: { slidesPerView: 2, spaceBetween: 12 },
                  640: { slidesPerView: 3, spaceBetween: 14 },
                  1024: { slidesPerView: 4, spaceBetween: 14 },
                  1280: { slidesPerView: 5, spaceBetween: 14 },
                }}
                className={[
                  "[&_.swiper-button-next]:text-gray-800 [&_.swiper-button-prev]:text-gray-800",
                  "[&_.swiper-button-next]:bg-white [&_.swiper-button-prev]:bg-white",
                  "[&_.swiper-button-next]:shadow-lg [&_.swiper-button-prev]:shadow-lg",
                  "[&_.swiper-button-next]:rounded-full [&_.swiper-button-prev]:rounded-full",
                  "[&_.swiper-button-next]:border [&_.swiper-button-prev]:border",
                  "[&_.swiper-button-next]:border-gray-100 [&_.swiper-button-prev]:border-gray-100",
                  "[&_.swiper-button-next]:w-9 [&_.swiper-button-prev]:w-9",
                  "[&_.swiper-button-next]:h-9 [&_.swiper-button-prev]:h-9",
                ].join(" ")}
              >
                {featured.map((product, i) => (
                  <SwiperSlide key={product.id}>
                    <div style={{ animationDelay: `${i * 60}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </Section>
        )}

        {/* ── Promotional Banner Strip (if ≥3 banners) ─────── */}
        {banners.length >= 3 && (
          <Section className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {banners.slice(1, 3).map((banner) => {
                const link = getBannerLink(banner);
                const Wrapper = link ? Link : "div";
                const wrapperProps = link ? { href: link } : {};
                return (
                  <Wrapper key={banner.id} {...wrapperProps} className="relative block rounded-2xl overflow-hidden aspect-[2/1] group shadow-sm border border-gray-100">
                    <img src={banner.image?.url} alt={banner.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <h3 className="text-base font-bold text-white leading-tight">{banner.title}</h3>
                      {link && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 font-semibold group-hover:text-white transition-colors">
                          Shop Now <FiArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Products Grid + Category Filter ─────────────── */}
        <Section className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">

            <SectionHeading
              icon={<FiTrendingUp />}
              title={activeCategoryName || "Latest Products"}
              sub={pagination ? `${pagination.total || pagination.totalItems || ""} products available` : undefined}
              accent="violet"
              action={
                !activeCategory && (
                  <Link href="/search" className="text-xs text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-1 transition-colors flex-shrink-0">
                    Browse All <FiChevronRight className="w-3.5 h-3.5" />
                  </Link>
                )
              }
            />

            {/* Category filter chips */}
            {activeCategories.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-6 pb-1">
                <button
                  onClick={() => { setActiveCategory(null); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                    !activeCategory
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800"
                  }`}
                >
                  All
                </button>
                {activeCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(activeCategory === cat.id ? null : cat.id); setPage(1); }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                      activeCategory === cat.id
                        ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Grid */}
            {isLoading ? (
              <SkeletonGrid count={12} />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((product, i) => (
                    <div
                      key={product.id}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${(i % 12) * 40}ms`, animationFillMode: "both" }}
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <PaginationComponent
                      currentPage={pagination.currentPage}
                      totalPages={pagination.totalPages}
                      onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-4 shadow-inner">
                  <FiPackage className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-base font-bold text-gray-700">No products found</p>
                <p className="text-sm text-gray-400 mt-1">Try a different category or check back later.</p>
                {activeCategory && (
                  <button
                    onClick={() => { setActiveCategory(null); setPage(1); }}
                    className="mt-4 px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-gray-700 transition-colors"
                  >
                    View All Products
                  </button>
                )}
              </div>
            )}
          </div>
        </Section>

        {/* ── Footer trust strip ───────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: <FiTruck className="w-5 h-5" />, title: "Fast Delivery", desc: "Across Nepal in 2–5 days", color: "text-blue-500 bg-blue-50 border-blue-100" },
              { icon: <FiShield className="w-5 h-5" />, title: "Secure Payments", desc: "Your data is always safe", color: "text-emerald-500 bg-emerald-50 border-emerald-100" },
              { icon: <FiRefreshCw className="w-5 h-5" />, title: "Easy Returns", desc: "No questions asked", color: "text-amber-500 bg-amber-50 border-amber-100" },
              { icon: <FiHeadphones className="w-5 h-5" />, title: "24/7 Support", desc: "We're always here", color: "text-violet-500 bg-violet-50 border-violet-100" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${item.color}`}>
                  {item.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}