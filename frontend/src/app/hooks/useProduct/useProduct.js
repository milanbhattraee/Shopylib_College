import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useProduct = () => {
    
    return useQuery({
      queryKey: ["products"],
      queryFn: async () => {
        const data = productApi.getAllProducts();
        return data;
      },
      staleTime: 24 * 60 * 60 * 1000,
    });
}

export const useCreateProduct = () =>{
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return await productApi.createProduct(data);
    },

    onSuccess: () => {
      toast.success("Product created successfully");

      queryClient.invalidateQueries({
        queryKey: ["product"],
      });
    },

    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    },
  });
}