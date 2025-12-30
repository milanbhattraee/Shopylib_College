import Image from "next/image";

const products = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Adjustable Ring For Men",
    slug: "adjustable-ring-for-men",
    price: 65.0,
    comparePrice: 150.0,
    stockQuantity: 45,
    description:
      "Premium quality adjustable ring made with high-grade materials",
    shortDescription: "Adjustable ring for men",
    images: [
      {
        url: "/images/banner1.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_1",
      },
    ],
    category: { id: "1", name: "Jewelry", slug: "jewelry" },
    tags: ["ring", "jewelry", "mens"],
    rating: 4.2,
    reviews: 224,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Shoe Rack with 12mm Pipes",
    slug: "shoe-rack-12mm",
    price: 860.0,
    comparePrice: 1500.0,
    stockQuantity: 20,
    description:
      "Durable shoe rack with 12mm pipes for organizing your footwear collection",
    shortDescription: "Shoe rack with 12mm pipes",
    images: [
      {
        url: "/images/product2.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_2",
      },
    ],
    category: { id: "2", name: "Home & Storage", slug: "home-storage" },
    tags: ["storage", "home", "organizer"],
    rating: 4.1,
    reviews: 18,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    name: "360 Degree Rotating Hook",
    slug: "360-rotating-hook",
    price: 70.0,
    comparePrice: 150.0,
    stockQuantity: 65,
    description: "360 degree rotating hook perfect for hanging items on walls",
    shortDescription: "360 rotating hook",
    images: [
      {
        url: "/images/product3.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_3",
      },
    ],
    category: { id: "2", name: "Home & Storage", slug: "home-storage" },
    tags: ["hook", "home", "wall-mounted"],
    rating: 4.5,
    reviews: 81,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    name: "Oversized Cat Eye Glasses",
    slug: "oversized-cat-eye-glasses",
    price: 300.0,
    comparePrice: 1300.0,
    stockQuantity: 30,
    description: "Trendy oversized cat eye sunglasses with UV protection",
    shortDescription: "Cat eye glasses",
    images: [
      {
        url: "/images/product4.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_4",
      },
    ],
    category: { id: "3", name: "Accessories", slug: "accessories" },
    tags: ["glasses", "sunglasses", "fashion"],
    rating: 4.8,
    reviews: 15,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    name: "Smartwatch with Bluetooth",
    slug: "smartwatch-bluetooth",
    price: 776.0,
    comparePrice: 2200.0,
    stockQuantity: 25,
    description:
      "Advanced smartwatch with Bluetooth connectivity and health monitoring",
    shortDescription: "Smartwatch with Bluetooth",
    images: [
      {
        url: "/images/product5.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_5",
      },
    ],
    category: { id: "4", name: "Electronics", slug: "electronics" },
    tags: ["smartwatch", "wearable", "tech"],
    rating: 4.3,
    reviews: 82,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    name: "Mini Hair Straightener",
    slug: "mini-hair-straightener",
    price: 260.0,
    comparePrice: 500.0,
    stockQuantity: 40,
    description:
      "Compact hair straightener with adjustable temperature settings",
    shortDescription: "Mini hair straightener",
    images: [
      {
        url: "/images/product6.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_6",
      },
    ],
    category: { id: "5", name: "Beauty", slug: "beauty" },
    tags: ["hair", "beauty", "styling"],
    rating: 4.4,
    reviews: 82,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440007",
    name: "Luxury Leather Watch Set",
    slug: "luxury-leather-watch-set",
    price: 527.0,
    comparePrice: 1500.0,
    stockQuantity: 15,
    description: "Premium leather watch set with elegant design and durability",
    shortDescription: "Luxury leather watch set",
    images: [
      {
        url: "/images/product7.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_7",
      },
    ],
    category: { id: "1", name: "Jewelry", slug: "jewelry" },
    tags: ["watch", "luxury", "leather"],
    rating: 4.5,
    reviews: 72,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440008",
    name: "Type C Cable Super Charging",
    slug: "type-c-cable-super-charging",
    price: 312.0,
    comparePrice: 1350.0,
    stockQuantity: 50,
    description: "Fast charging Type C cable with super charging capability",
    shortDescription: "Type C charging cable",
    images: [
      {
        url: "/images/product8.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_8",
      },
    ],
    category: { id: "4", name: "Electronics", slug: "electronics" },
    tags: ["cable", "charging", "tech"],
    rating: 4.8,
    reviews: 50,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440009",
    name: "Planter Stand for Home",
    slug: "planter-stand-home",
    price: 969.0,
    comparePrice: 1500.0,
    stockQuantity: 35,
    description:
      "Modern planter stand perfect for indoor and outdoor gardening",
    shortDescription: "Planter stand",
    images: [
      {
        url: "/images/product9.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_9",
      },
    ],
    category: { id: "6", name: "Garden", slug: "garden" },
    tags: ["planter", "garden", "home-decor"],
    rating: 4.9,
    reviews: 316,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440010",
    name: "3pcs LED Beads Light",
    slug: "3pcs-led-beads-light",
    price: 168.0,
    comparePrice: 900.0,
    stockQuantity: 60,
    description:
      "Set of 3 LED bead lights for decorative and functional lighting",
    shortDescription: "3pcs LED beads light",
    images: [
      {
        url: "/images/product10.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_10",
      },
    ],
    category: { id: "2", name: "Home & Storage", slug: "home-storage" },
    tags: ["lighting", "led", "decor"],
    rating: 4.1,
    reviews: 70,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440011",
    name: "Banana Silicone Teether",
    slug: "banana-silicone-teether",
    price: 72.0,
    comparePrice: 250.0,
    stockQuantity: 55,
    description: "Safe and soft banana-shaped silicone teether for babies",
    shortDescription: "Banana silicone teether",
    images: [
      {
        url: "/images/product11.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_11",
      },
    ],
    category: { id: "7", name: "Baby", slug: "baby" },
    tags: ["baby", "teether", "toys"],
    rating: 4.7,
    reviews: 70,
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440012",
    name: "Premium Phone Case",
    slug: "premium-phone-case",
    price: 150.0,
    comparePrice: 600.0,
    stockQuantity: 100,
    description: "Durable and stylish phone case with premium protection",
    shortDescription: "Premium phone case",
    images: [
      {
        url: "/images/product12.jpg",
        height: 400,
        width: 400,
        blurhash: "UeKUpNxuo2TP9aaefjed",
        public_id: "product_12",
      },
    ],
    category: { id: "4", name: "Electronics", slug: "electronics" },
    tags: ["phone", "case", "protection"],
    rating: 4.2,
    reviews: 100,
  },
];

const calculateDiscount = (price, comparePrice) => {
  if (!comparePrice || comparePrice <= 0) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

const ProductGrid = ({  }) => {
  return (
    <section className="bg-secondary p-6 rounded-xl shadow-lg px-3 sm:px-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Just For You</h2>
        <button className="text-sm font-semibold text-primary hover:text-primary-dark transition">
          See More →
        </button>
      </div>

      {/* ✅ Responsive server-side grid */}
      <div className="
        grid gap-4
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
      ">
        {products.map((product) => {
          const discount = calculateDiscount(
            product.price,
            product.comparePrice
          );

          const imageUrl =
            product.images?.[0]?.url || "/images/placeholder.jpg";

          return (
            <div
              key={product.id}
              className="glass-secondary h-72 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden rounded-lg"
            >
              {/* Image */}
              <div className="h-40 bg-gray-100 overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="px-4 py-2">
                <h3 className="text-[0.8rem] font-semibold line-clamp-2">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mt-1">
                  <p className="text-red-500 text-[0.8rem] font-bold">
                    Rs. {product.price.toFixed(2)}
                  </p>

                  {product.comparePrice > product.price && (
                    <p className="text-gray-500 text-[0.7rem] line-through">
                      Rs. {product.comparePrice.toFixed(2)}
                    </p>
                  )}
                </div>

                {discount > 0 && (
                  <p className="text-green-600 text-[0.7rem] font-semibold">
                    -{discount}% OFF
                  </p>
                )}

                <p className="text-[0.65rem] mt-1">
                  {product.stockQuantity > 0 ? (
                    <span className="text-green-600">
                      In Stock ({product.stockQuantity})
                    </span>
                  ) : (
                    <span className="text-red-600">Out of Stock</span>
                  )}
                </p>

                <p className="text-[0.65rem] text-gray-500">
                  Category: {product.category?.name}
                </p>

                <div className="flex items-center mt-1">
                  <span className="text-yellow-400 text-sm">
                    {"★".repeat(Math.floor(product.rating))}
                    {"☆".repeat(5 - Math.floor(product.rating))}
                  </span>
                  <span className="ml-1 text-gray-500 text-[0.6rem]">
                    ({product.reviews})
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more can be client later */}
      <div className="flex justify-center mt-6">
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg border-b-4 border-blue-600 hover:-translate-y-px active:translate-y-0 transition">
          Load More
        </button>
      </div>
    </section>
  );
};

export default ProductGrid;
