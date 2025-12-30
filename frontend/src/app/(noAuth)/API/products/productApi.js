class ProductApi {
  async getProducts() {
    const res = await fetch(
      `${process.env.API_URL}/products`,
      {
        next: { revalidate: 60 }, // or cache: "no-store"
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }

    return res.json();
  }
  
}

export const productApi = new ProductApi();
