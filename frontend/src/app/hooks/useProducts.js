import { useQuery } from "@tanstack/react-query";
import { productApi, categoryApi, searchApi } from "@/app/lib/api";

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productApi.getAll(params),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ["featuredProducts", limit],
    queryFn: () => productApi.getFeatured({ limit }),
    staleTime: 10 * 60 * 1000,
  });
};

export const useRelatedProducts = (productId, limit = 4) => {
  return useQuery({
    queryKey: ["relatedProducts", productId],
    queryFn: () => productApi.getRelated(productId, { limit }),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAll(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useCategoryBySlug = (slug, params = {}) => {
  return useQuery({
    queryKey: ["category", slug, params],
    queryFn: () => categoryApi.getBySlug(slug, params),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSearchProducts = (params = {}) => {
  const q = typeof params === "string" ? params : params?.q;
  return useQuery({
    queryKey: ["search", params],
    queryFn: () => searchApi.products(typeof params === "string" ? { q: params } : params),
    enabled: !!q && q.length > 1,
    staleTime: 2 * 60 * 1000,
  });
};

export const useSearchSuggestions = (q) => {
  return useQuery({
    queryKey: ["searchSuggestions", q],
    queryFn: () => searchApi.suggestions({ q }),
    enabled: !!q && q.length > 1,
    staleTime: 60 * 1000,
  });
};
