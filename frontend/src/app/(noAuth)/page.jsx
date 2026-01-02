import Categories from "./components/categories/Categories"
import Carousel from "./components/featuredCarousel/Carousel"
import FlashSale from "./components/flashSale/FlashSale"
import Footer from "./components/layout/Footer"
import Header from "./components/layout/Header"
import ProductDetails from "./components/productDetails/ProductDetails"
import ProductGrid from "./components/ProductGrid/ProductGrid"
import { getAllProducts } from "./productApi"


export const metadata = {
  title: "Shopylib – Buy Everything Online",
  description: "Shop the best products online",
};

const Home = async () => {
  let products = [];

  try {
    const products = await getAllProducts()
    console.log("Products fetched successfully:", products);
  } catch (error) {
    console.error("Failed to load products", error);
  }

  return (
    <>
      <ProductGrid products={products} />
    </>
  );
};

export default Home;