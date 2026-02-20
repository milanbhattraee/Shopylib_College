import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi, wishlistApi, orderApi, reviewApi, couponApi } from "@/app/lib/api";
import { toast } from "react-toastify";
import { authApi } from "@/app/lib/api";

// ─── Cart Hooks ───
export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => cartApi.getItems(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useAddToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => cartApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add to cart"),
  });
};

export const useUpdateCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cartItemId, quantity }) => cartApi.update(cartItemId, { quantity }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update cart"),
  });
};

export const useRemoveFromCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cartItemId) => cartApi.remove(cartItemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to remove from cart"),
  });
};

// ─── Wishlist Hooks ───
export const useWishlist = (params = {}) => {
  return useQuery({
    queryKey: ["wishlist", params],
    queryFn: () => wishlistApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useWishlistCount = () => {
  return useQuery({
    queryKey: ["wishlistCount"],
    queryFn: () => wishlistApi.count(),
    staleTime: 60 * 1000,
  });
};

export const useCheckWishlist = (productId) => {
  return useQuery({
    queryKey: ["wishlistCheck", productId],
    queryFn: () => wishlistApi.check(productId),
    enabled: !!productId,
    staleTime: 60 * 1000,
  });
};

export const useAddToWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => wishlistApi.add(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      qc.invalidateQueries({ queryKey: ["wishlistCount"] });
      qc.invalidateQueries({ queryKey: ["wishlistCheck"] });
      toast.success("Added to wishlist!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add to wishlist"),
  });
};

export const useRemoveFromWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => wishlistApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      qc.invalidateQueries({ queryKey: ["wishlistCount"] });
      qc.invalidateQueries({ queryKey: ["wishlistCheck"] });
      toast.success("Removed from wishlist");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to remove"),
  });
};

export const useClearWishlist = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => wishlistApi.clear(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      qc.invalidateQueries({ queryKey: ["wishlistCount"] });
      toast.success("Wishlist cleared");
    },
  });
};

export const useMoveToCart = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ wishlistItemId, ...data }) => wishlistApi.moveToCart(wishlistItemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist"] });
      qc.invalidateQueries({ queryKey: ["wishlistCount"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Moved to cart!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to move to cart"),
  });
};

// ─── Order Hooks ───
export const useOrders = (params = {}) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderApi.getAll(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useOrder = (orderId) => {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderApi.getById(orderId),
    enabled: !!orderId,
  });
};

export const useCreateOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed successfully!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to place order"),
  });
};

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }) => orderApi.cancel(orderId, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to cancel order"),
  });
};

// ─── Review Hooks ───
export const useUserReviews = (userId, params = {}) => {
  return useQuery({
    queryKey: ["userReviews", userId, params],
    queryFn: () => reviewApi.getUserReviews(userId, params),
    enabled: !!userId,
  });
};

export const useProductStats = (productId) => {
  return useQuery({
    queryKey: ["productStats", productId],
    queryFn: () => reviewApi.getProductStats(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => reviewApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userReviews"] });
      qc.invalidateQueries({ queryKey: ["productStats"] });
      qc.invalidateQueries({ queryKey: ["product"] });
      toast.success("Review submitted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to submit review"),
  });
};

export const useUpdateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => reviewApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userReviews"] });
      qc.invalidateQueries({ queryKey: ["productStats"] });
      toast.success("Review updated!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update review"),
  });
};

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => reviewApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userReviews"] });
      qc.invalidateQueries({ queryKey: ["productStats"] });
      toast.success("Review deleted");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete review"),
  });
};

// ─── Coupon Hooks ───
export const useApplyCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => couponApi.apply(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to apply coupon"),
  });
};

export const useUserCoupons = (userId) => {
  return useQuery({
    queryKey: ["userCoupons", userId],
    queryFn: () => couponApi.getUserCoupons(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// ─── Sessions Hooks ───
export const useActiveSessions = () => {
  return useQuery({
    queryKey: ["activeSessions"],
    queryFn: () => authApi.getSessions(),
    staleTime: 60 * 1000,
  });
};

export const useLogoutDevice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.logoutDevice(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeSessions"] });
      toast.success("Device logged out");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });
};
