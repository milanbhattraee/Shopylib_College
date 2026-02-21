import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi, bannerApi } from "@/app/lib/api";
import { toast } from "react-toastify";

// ─── Products ───
export const useAdminProducts = (params) =>
  useQuery({
    queryKey: ["admin-products", params],
    queryFn: () => adminApi.getProducts(params),
  });

export const useAdminProduct = (id) =>
  useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => adminApi.getProduct(id),
    enabled: !!id,
  });

export const useCreateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => adminApi.createProduct(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created successfully");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create product"),
  });
};

export const useUpdateProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => adminApi.updateProduct(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["admin-product"] });
      toast.success("Product updated successfully");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update product"),
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete product"),
  });
};

export const useRestoreProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.restoreProduct(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product restored");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to restore product"),
  });
};

// ─── Categories ───
export const useAdminCategories = () =>
  useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => adminApi.getCategories(),
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => adminApi.createCategory(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created successfully");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create category"),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => adminApi.updateCategory(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update category"),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete category"),
  });
};

export const useRestoreCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.restoreCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category restored");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to restore category"),
  });
};

// ─── Orders ───
export const useAdminOrders = (params) =>
  useQuery({
    queryKey: ["admin-orders", params],
    queryFn: () => adminApi.getOrders(params),
  });

export const useAdminOrder = (id) =>
  useQuery({
    queryKey: ["admin-order", id],
    queryFn: () => adminApi.getOrder(id),
    enabled: !!id,
  });

export const useUpdateOrderStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminApi.updateOrderStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order"] });
      toast.success("Order status updated");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update order status"),
  });
};

export const useAdminCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminApi.cancelOrder(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order"] });
      toast.success("Order cancelled");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to cancel order"),
  });
};

export const useApproveReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.approveReturn(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order"] });
      toast.success("Return approved");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to approve return"),
  });
};

export const useRejectReturn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminApi.rejectReturn(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-order"] });
      toast.success("Return rejected");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to reject return"),
  });
};

// ─── Coupons ───
export const useAdminCoupons = (params) =>
  useQuery({
    queryKey: ["admin-coupons", params],
    queryFn: () => adminApi.getCoupons(params),
  });

export const useCreateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminApi.createCoupon(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon created");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create coupon"),
  });
};

export const useUpdateCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminApi.updateCoupon(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon updated");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update coupon"),
  });
};

export const useDeleteCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete coupon"),
  });
};

export const useRestoreCoupon = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.restoreCoupon(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon restored");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to restore coupon"),
  });
};

export const useCouponUsage = (couponId, params) =>
  useQuery({
    queryKey: ["admin-coupon-usage", couponId, params],
    queryFn: () => adminApi.getCouponUsage(couponId, params),
    enabled: !!couponId,
  });

// ─── Users ───
export const useAdminUsers = () =>
  useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers(),
  });

export const useAdminUser = (userId) =>
  useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminApi.getUser(userId),
    enabled: !!userId,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => adminApi.createUser(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User created — credentials sent via email");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create user"),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, formData }) => adminApi.updateUser(userId, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-user"] });
      toast.success("User updated");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update user"),
  });
};

export const useUpdatePermissions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }) => adminApi.updatePermissions(userId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-user"] });
      toast.success("Permissions updated");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update permissions"),
  });
};

// ─── Reviews ───
export const useAdminReviews = (params) =>
  useQuery({
    queryKey: ["admin-reviews", params],
    queryFn: () => adminApi.getReviews(params),
  });

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review deleted");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete review"),
  });
};

// ─── Search ───
export const useSearchUsers = (q) =>
  useQuery({
    queryKey: ["admin-search-users", q],
    queryFn: () => adminApi.searchUsers({ q }),
    enabled: !!q && q.length >= 2,
  });

export const useSearchOrders = (q) =>
  useQuery({
    queryKey: ["admin-search-orders", q],
    queryFn: () => adminApi.searchOrders({ q }),
    enabled: !!q && q.length >= 2,
  });

export const useSearchCoupons = (q) =>
  useQuery({
    queryKey: ["admin-search-coupons", q],
    queryFn: () => adminApi.searchCoupons({ q }),
    enabled: !!q && q.length >= 2,
  });

export const useSearchReviews = (q) =>
  useQuery({
    queryKey: ["admin-search-reviews", q],
    queryFn: () => adminApi.searchReviews({ q }),
    enabled: !!q && q.length >= 2,
  });

// ─── Banners ───
export const useAdminBanners = () =>
  useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => adminApi.getBanners(),
  });

export const useCreateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => adminApi.createBanner(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner created successfully");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to create banner"),
  });
};

export const useUpdateBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => adminApi.updateBanner(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner updated successfully");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to update banner"),
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.deleteBanner(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to delete banner"),
  });
};

export const useToggleBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminApi.toggleBanner(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner status updated");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed to toggle banner"),
  });
};
