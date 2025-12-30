import { productApi } from "./API/products/productApi"
import Categories from "./components/categories/Categories"
import Carousel from "./components/featuredCarousel/Carousel"
import FlashSale from "./components/flashSale/FlashSale"
import Footer from "./components/layout/Footer"
import Header from "./components/layout/Header"
import ProductDetails from "./components/productDetails/ProductDetails"
import ProductGrid from "./components/ProductGrid/ProductGrid"


export const metadata = {
  title: "Shopylib – Buy Everything Online",
  description: "Shop the best products online",
};

const Home = async () => {
  let products = [];

  try {
    products = await productApi.getProducts();
  } catch (error) {
    console.error("Failed to load products", error);
  }

  return (
    <>
      <Header />
      <ProductGrid products={products} />
    </>
  );
};

export default Home;