import Categories from "./components/categories/Categories"
import Carousel from "./components/featuredCarousel/Carousel"
import FlashSale from "./components/flashSale/FlashSale"
import Footer from "./components/layout/Footer"
import Header from "./components/layout/Header"
import ProductDetails from "./components/productDetails/ProductDetails"
import ProductGrid from "./components/ProductGrid/ProductGrid"

const Home = () => {
  return (
    <>  
        <Header/>
      <Carousel/>
      <FlashSale />
      <Categories />
      <ProductGrid />
      <Footer />
      <ProductDetails />
    </>

    
  )
}

export default Home