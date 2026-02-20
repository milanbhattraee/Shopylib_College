import api from "./axios";

// ─── Auth API ───
export const authApi = {
  register: (data) => api.post("/auth/register", data).then((r) => r.data),
  login: (data) => api.post("/auth/login", data).then((r) => r.data),
  googleAuth: (data) => api.post("/auth/google", data).then((r) => r.data),
  refreshToken: () => api.post("/auth/refresh-token").then((r) => r.data),
  verifyEmail: (data) => api.post("/auth/verify-email", data).then((r) => r.data),
  sendVerification: () => api.post("/auth/send-verification").then((r) => r.data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data).then((r) => r.data),
  resetPassword: (data) => api.post("/auth/reset-password", data).then((r) => r.data),
  changePassword: (data) => api.patch("/auth/change-password", data).then((r) => r.data),
  getCurrentUser: () => api.get("/auth/me").then((r) => r.data),
  logout: () => api.post("/auth/logout").then((r) => r.data),
  getSessions: () => api.get("/auth/sessions").then((r) => r.data),
  logoutDevice: (data) => api.post("/auth/logout-device", data).then((r) => r.data),
};

// ─── Product API ───
export const productApi = {
  getAll: (params) => api.get("/products", { params }).then((r) => r.data),
  getById: (id) => api.get(`/products/${id}`).then((r) => r.data),
  getFeatured: (params) => api.get("/products/featured", { params }).then((r) => r.data),
  getRelated: (id, params) => api.get(`/products/related/${id}`, { params }).then((r) => r.data),
};

// ─── Category API ───
export const categoryApi = {
  getAll: () => api.get("/categories").then((r) => r.data),
  getBySlug: (slug, params) => api.get(`/categories/${slug}`, { params }).then((r) => r.data),
};

// ─── Cart API ───
export const cartApi = {
  getItems: () => api.get("/carts").then((r) => r.data),
  add: (data) => api.post("/carts/add", data).then((r) => r.data),
  update: (cartItemId, data) => api.put(`/carts/update/${cartItemId}`, data).then((r) => r.data),
  remove: (cartItemId) => api.delete(`/carts/${cartItemId}`).then((r) => r.data),
};

// ─── Wishlist API ───
export const wishlistApi = {
  getAll: (params) => api.get("/wishlists", { params }).then((r) => r.data),
  add: (data) => api.post("/wishlists/add", data).then((r) => r.data),
  remove: (id) => api.delete(`/wishlists/${id}`).then((r) => r.data),
  removeByProduct: (productId) => api.delete(`/wishlists/product/${productId}`).then((r) => r.data),
  clear: () => api.delete("/wishlists").then((r) => r.data),
  check: (productId) => api.get(`/wishlists/check/${productId}`).then((r) => r.data),
  count: () => api.get("/wishlists/count").then((r) => r.data),
  moveToCart: (id, data) => api.post(`/wishlists/${id}/move-to-cart`, data).then((r) => r.data),
};

// ─── Order API ───
export const orderApi = {
  create: (data) => api.post("/orders", data).then((r) => r.data),
  getAll: (params) => api.get("/orders", { params }).then((r) => r.data),
  getById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  cancel: (id, data) => api.patch(`/orders/${id}/cancel`, data).then((r) => r.data),
};

// ─── Review API ───
export const reviewApi = {
  create: (data) => api.post("/reviews", data).then((r) => r.data),
  update: (id, data) => api.put(`/reviews/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/reviews/${id}`).then((r) => r.data),
  getById: (id) => api.get(`/reviews/${id}`).then((r) => r.data),
  getUserReviews: (userId, params) => api.get(`/reviews/user/${userId}`, { params }).then((r) => r.data),
  getProductStats: (productId) => api.get(`/reviews/product/${productId}/stats`).then((r) => r.data),
};

// ─── Coupon API ───
export const couponApi = {
  getAll: (params) => api.get("/coupons", { params }).then((r) => r.data),
  apply: (data) => api.post("/coupons/apply", data).then((r) => r.data),
  getUserCoupons: (userId) => api.get(`/coupons/user/${userId}`).then((r) => r.data),
};

// ─── Search API ───
export const searchApi = {
  products: (params) => api.get("/search/products", { params }).then((r) => r.data),
  suggestions: (params) => api.get("/search/products/suggestions", { params }).then((r) => r.data),
};

// ─── User API ───
export const userApi = {
  getProfile: (userId) => api.get(`/users/${userId}`).then((r) => r.data),
  updateProfile: (data) => api.patch("/users", data).then((r) => r.data),
  updateAvatar: (userId, formData) =>
    api.patch(`/users/${userId}/updateAvatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data),
};

// ─── Admin API ───
export const adminApi = {
  // Products
  getProducts: (params) => api.get("/products", { params }).then((r) => r.data),
  getProduct: (id) => api.get(`/products/${id}`).then((r) => r.data),
  createProduct: (formData) =>
    api.post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  updateProduct: (id, formData) =>
    api.put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  deleteProduct: (id) => api.delete(`/products/${id}`).then((r) => r.data),
  restoreProduct: (id) => api.patch(`/products/${id}/restore`).then((r) => r.data),
  updateVariant: (id, formData) =>
    api.put(`/products/${id}/variant`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  deleteVariant: (id) => api.delete(`/products/${id}/variant`).then((r) => r.data),
  restoreVariant: (id) => api.patch(`/products/${id}/variant/restore`).then((r) => r.data),

  // Categories
  getCategories: () => api.get("/categories").then((r) => r.data),
  getCategory: (slug) => api.get(`/categories/${slug}`).then((r) => r.data),
  createCategory: (formData) =>
    api.post("/categories", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  updateCategory: (id, formData) =>
    api.put(`/categories/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  deleteCategory: (id) => api.delete(`/categories/${id}`).then((r) => r.data),
  restoreCategory: (id) => api.patch(`/categories/${id}/restore`).then((r) => r.data),

  // Orders
  getOrders: (params) => api.get("/orders", { params }).then((r) => r.data),
  getOrder: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}/status`, data).then((r) => r.data),
  cancelOrder: (id, data) => api.patch(`/orders/${id}/cancel`, data).then((r) => r.data),

  // Coupons
  getCoupons: (params) => api.get("/coupons", { params }).then((r) => r.data),
  createCoupon: (data) => api.post("/coupons/create", data).then((r) => r.data),
  updateCoupon: (id, data) => api.put(`/coupons/${id}/update`, data).then((r) => r.data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`).then((r) => r.data),
  restoreCoupon: (id) => api.patch(`/coupons/${id}/restore`).then((r) => r.data),
  getCouponUsage: (couponId, params) => api.get(`/coupons/${couponId}/usage`, { params }).then((r) => r.data),

  // Users
  getUsers: () => api.get("/users").then((r) => r.data),
  getUser: (userId) => api.get(`/users/${userId}`).then((r) => r.data),
  createUser: (formData) =>
    api.post("/users/create", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  updateUser: (userId, formData) =>
    api.patch(`/users/${userId}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data),
  updatePermissions: (userId, data) => api.patch(`/users/${userId}/updatePermissions`, data).then((r) => r.data),

  // Reviews
  getReviews: (params) => api.get("/reviews", { params }).then((r) => r.data),
  deleteReview: (id) => api.delete(`/reviews/${id}/admin`).then((r) => r.data),

  // Search
  searchUsers: (params) => api.get("/search/users", { params }).then((r) => r.data),
  searchOrders: (params) => api.get("/search/orders", { params }).then((r) => r.data),
  searchCoupons: (params) => api.get("/search/coupons", { params }).then((r) => r.data),
  searchReviews: (params) => api.get("/search/reviews", { params }).then((r) => r.data),
};
