"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaHeart, FaRegHeart, FaShoppingCart, FaBolt } from "react-icons/fa";
import { FiTruck, FiShield, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "@/app/provider/AuthProvider";
import { useRelatedProducts } from "@/app/hooks/useProducts";
import { useAddToCart, useCheckWishlist, useAddToWishlist, useRemoveFromWishlist, useCreateReview } from "@/app/hooks/useProtected";
import ProductCard from "@/app/components/ui/ProductCard";
import StarRating from "@/app/components/ui/StarRating";
import QuantitySelector from "@/app/components/ui/QuantitySelector";

const btnClass =
  "cursor-pointer flex items-center justify-center gap-2 bg-blue-500 h-12 text-white px-8 rounded-lg border-blue-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px] font-semibold transition-all disabled:opacity-50";
const inputClass =
  "peer w-full rounded-[7px] border border-cyan-500 border-t-transparent bg-transparent px-3 py-2.5 font-sans text-sm font-normal text-blue-gray-700 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-300 placeholder-shown:border-t-gray-300 focus:border-2 focus:border-cyan-500 focus:border-t-transparent focus:outline-0";
const labelClass =
  "before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none text-[11px] font-normal leading-tight text-cyan-500 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-cyan-500 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:grow after:rounded-tr-md after:border-t after:border-r after:border-cyan-500 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-gray-800 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-cyan-500 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:border-cyan-500 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:border-cyan-500";

export default function ProductDetailClient({ product }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  const { data: relatedData } = useRelatedProducts(product?.id);
  const addToCart = useAddToCart();
  const { data: wishlistCheck } = useCheckWishlist(product?.id);
  const addWishlist = useAddToWishlist();
  const removeWishlist = useRemoveFromWishlist();
  const createReview = useCreateReview();

  const isWishlisted = wishlistCheck?.data?.isInWishlist;
  const relatedProducts = relatedData?.data?.products || relatedData?.data || [];

  const images = product?.images || [];
  const variants = product?.variants || [];
  const reviews = product?.reviews || [];

  const currentVariant = selectedVariant !== null ? variants[selectedVariant] : null;
  const displayPrice = currentVariant?.price || product?.price || 0;
  const comparePrice = currentVariant?.comparePrice || product?.comparePrice;
  const discount = comparePrice ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100) : 0;
  const inStock = currentVariant ? currentVariant.stockQuantity > 0 : product?.stockQuantity > 0;

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const handleAddToCart = () => {
    if (!isAuthenticated) return;
    addToCart.mutate({
      productId: product.id,
      quantity,
      ...(currentVariant && { variantId: currentVariant.id }),
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    setIsBuyingNow(true);
    addToCart.mutate(
      {
        productId: product.id,
        quantity,
        ...(currentVariant && { variantId: currentVariant.id }),
      },
      {
        onSuccess: () => {
          router.push("/checkout");
        },
        onError: () => {
          setIsBuyingNow(false);
        },
      }
    );
  };

  const handleWishlist = () => {
    if (!isAuthenticated) return;
    if (isWishlisted) removeWishlist.mutate(product.id);
    else addWishlist.mutate({ productId: product.id });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewRating) return;
    createReview.mutate(
      { productId: product.id, rating: reviewRating, comment: reviewText },
      {
        onSuccess: () => {
          setReviewText("");
          setReviewRating(0);
          setShowReviewForm(false);
        },
      }
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600 transition">Home</Link>
        <span>/</span>
        {product?.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-blue-600 transition">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-800 font-medium truncate">{product?.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative bg-gray-50 rounded-xl overflow-hidden border border-gray-100 aspect-square mb-4">
              <img
                src={images[selectedImage]?.url || "/placeholder.png"}
                alt={product?.name}
                className="w-full h-full object-contain p-4"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition ${
                      selectedImage === i ? "border-blue-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-blue-700 mb-2">{product?.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <StarRating rating={Number(avgRating)} size="md" />
              <span className="text-sm text-gray-500">
                {avgRating} ({reviews.length} reviews)
              </span>
            </div>

            {/* Category */}
            {product?.category && (
              <p className="text-sm text-gray-500 mb-4">
                Category:{" "}
                <Link href={`/categories/${product.category.slug}`} className="text-blue-600 hover:underline">
                  {product.category.name}
                </Link>
              </p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-blue-600">Rs. {parseFloat(displayPrice).toLocaleString()}</span>
              {comparePrice > displayPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through">Rs. {parseFloat(comparePrice).toLocaleString()}</span>
                  <span className="text-sm font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">-{discount}%</span>
                </>
              )}
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {product?.shortDescription || product?.description}
            </p>

            {/* Variants */}
            {variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(selectedVariant === i ? null : i)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition ${
                        selectedVariant === i
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      } ${v.stockQuantity <= 0 ? "opacity-50 line-through" : ""}`}
                      disabled={v.stockQuantity <= 0}
                    >
                      {v.name}
                      {v.stockQuantity <= 0 && " (Out of Stock)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Actions */}
            <div className="flex items-center gap-4 mb-6">
              <QuantitySelector quantity={quantity} onChange={setQuantity} max={currentVariant?.stockQuantity || product?.stockQuantity || 99} />
              <span className={`text-sm font-medium ${inStock ? "text-green-600" : "text-red-500"}`}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || addToCart.isPending || !isAuthenticated}
                className={`${btnClass} flex-1`}
              >
                <FaShoppingCart className="w-4 h-4" />
                {addToCart.isPending && !isBuyingNow ? "Adding..." : "Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!inStock || isBuyingNow}
                className="cursor-pointer flex items-center justify-center gap-2 flex-1 h-12 text-white px-8 rounded-lg font-semibold transition-all disabled:opacity-50 bg-orange-500 border-orange-600 border-b-[4px] hover:brightness-110 hover:-translate-y-[1px] hover:border-b-[6px] active:border-b-[2px] active:brightness-90 active:translate-y-[2px]"
              >
                <FaBolt className="w-4 h-4" />
                {isBuyingNow ? "Redirecting..." : "Buy Now"}
              </button>
              {isAuthenticated && (
                <button
                  onClick={handleWishlist}
                  className="cursor-pointer w-12 h-12 rounded-lg border-2 border-gray-200 flex items-center justify-center hover:border-red-300 transition"
                >
                  {isWishlisted ? <FaHeart className="w-5 h-5 text-red-500" /> : <FaRegHeart className="w-5 h-5 text-gray-400" />}
                </button>
              )}
            </div>

            {/* Tags */}
            {product?.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center text-center gap-1">
                <FiTruck className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <FiShield className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <FiRefreshCw className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product?.description && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-blue-700 mb-4">Description</h2>
          <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-blue-700">Reviews ({reviews.length})</h2>
          {isAuthenticated && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="cursor-pointer text-sm text-blue-600 font-semibold hover:underline"
            >
              {showReviewForm ? "Cancel" : "Write a Review"}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleReviewSubmit} className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Rating</label>
              <StarRating rating={reviewRating} interactive onChange={setReviewRating} size="lg" />
            </div>
            <div className="relative w-full">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder=" "
                className={inputClass}
              />
              <label className={labelClass}>Share your experience...</label>
            </div>
            <button
              type="submit"
              disabled={createReview.isPending || !reviewRating}
              className={`${btnClass} h-10 text-sm`}
            >
              {createReview.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                      {review.user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {review.user?.firstName} {review.user?.lastName}
                      </p>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-sm text-gray-600 ml-10">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {relatedProducts.slice(0, 5).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
