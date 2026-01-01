import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetchProducts();
      return response.data;
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

