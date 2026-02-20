import dotenv from "dotenv";
dotenv.config();

import sequelize from "./db/db.js";
import { Auth, User, Category, Product, Coupon } from "./models/index.model.js";

const ALL_PERMISSIONS = [
  "manageUsers",
  "manageCategories",
  "manageCoupons",
  "manageProducts",
  "manageOrders",
  "manageStore",
  "manageReviews",
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Add manageReviews to the enum safely (no-op if already exists)
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum
          WHERE enumlabel = 'manageReviews'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_users_permissions'
          )
        ) THEN
          ALTER TYPE "enum_users_permissions" ADD VALUE 'manageReviews';
        END IF;
      END
      $$;
    `);
    console.log("✅ Enum updated");

    // ─── 1. Create Admin User ───
    const existingAdmin = await Auth.findOne({ where: { email: "admin@shopylib.com" } });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists, skipping admin creation");
    } else {
      const adminAuth = await Auth.create({
        email: "admin@shopylib.com",
        password: "Admin@1234",
        provider: "email",
        emailVerified: true,
        emailVerifiedAt: new Date(),
      });

      await User.create({
        authId: adminAuth.id,
        firstName: "Admin",
        lastName: "Shopylib",
        role: "admin",
        permissions: ALL_PERMISSIONS,
        gender: "other",
      });

      console.log("✅ Admin user created (admin@shopylib.com / Admin@1234)");
    }

    // ─── 2. Create Categories ───
    const categoryData = [
      { name: "Electronics", slug: "electronics", description: "Gadgets, phones, laptops and more", sortOrder: 1 },
      { name: "Clothing", slug: "clothing", description: "Men and women fashion apparel", sortOrder: 2 },
      { name: "Shoes", slug: "shoes", description: "Footwear for all occasions", sortOrder: 3 },
      { name: "Accessories", slug: "accessories", description: "Watches, bags, jewelry and more", sortOrder: 4 },
      { name: "Home & Living", slug: "home-living", description: "Furniture, decor and kitchen essentials", sortOrder: 5 },
    ];

    const categories = {};
    for (const cat of categoryData) {
      const [category] = await Category.findOrCreate({
        where: { slug: cat.slug },
        defaults: cat,
      });
      categories[cat.slug] = category;
    }
    console.log("✅ Categories created");

    // ─── 3. Create Products ───
    const productData = [
      // Electronics
      { name: "Wireless Bluetooth Headphones", slug: "wireless-bluetooth-headphones", sku: "ELEC-001", categoryId: categories["electronics"].id, price: 2499, comparePrice: 3999, stockQuantity: 50, isFeatured: true, description: "Premium wireless headphones with active noise cancellation and 30-hour battery life.", shortDescription: "ANC headphones with 30hr battery", tags: ["headphones", "wireless", "bluetooth"] },
      { name: "Smart Watch Pro", slug: "smart-watch-pro", sku: "ELEC-002", categoryId: categories["electronics"].id, price: 4999, comparePrice: 6999, stockQuantity: 30, isFeatured: true, description: "Feature-packed smartwatch with heart rate monitor, GPS, and 7-day battery life.", shortDescription: "Advanced smartwatch with GPS", tags: ["watch", "smart", "fitness"] },
      { name: "USB-C Fast Charger 65W", slug: "usb-c-fast-charger-65w", sku: "ELEC-003", categoryId: categories["electronics"].id, price: 899, comparePrice: 1299, stockQuantity: 100, description: "Compact 65W GaN charger with dual USB-C ports.", shortDescription: "65W dual-port GaN charger", tags: ["charger", "usb-c", "fast-charging"] },
      { name: "Portable Bluetooth Speaker", slug: "portable-bluetooth-speaker", sku: "ELEC-004", categoryId: categories["electronics"].id, price: 1799, comparePrice: 2499, stockQuantity: 45, isFeatured: true, description: "Waterproof portable speaker with 360° sound and 12-hour playtime.", shortDescription: "Waterproof speaker, 12hr playtime", tags: ["speaker", "bluetooth", "portable"] },

      // Clothing
      { name: "Classic Cotton T-Shirt", slug: "classic-cotton-tshirt", sku: "CLO-001", categoryId: categories["clothing"].id, price: 599, comparePrice: 899, stockQuantity: 200, description: "Comfortable 100% cotton t-shirt available in multiple colors.", shortDescription: "100% cotton everyday tee", tags: ["tshirt", "cotton", "casual"] },
      { name: "Slim Fit Denim Jeans", slug: "slim-fit-denim-jeans", sku: "CLO-002", categoryId: categories["clothing"].id, price: 1499, comparePrice: 2199, stockQuantity: 80, isFeatured: true, description: "Modern slim fit jeans with stretch denim for ultimate comfort.", shortDescription: "Stretch denim slim fit jeans", tags: ["jeans", "denim", "slim-fit"] },
      { name: "Hooded Windbreaker Jacket", slug: "hooded-windbreaker-jacket", sku: "CLO-003", categoryId: categories["clothing"].id, price: 2299, comparePrice: 3499, stockQuantity: 35, description: "Lightweight water-resistant windbreaker with adjustable hood.", shortDescription: "Water-resistant windbreaker", tags: ["jacket", "windbreaker", "outdoor"] },
      { name: "Formal Dress Shirt", slug: "formal-dress-shirt", sku: "CLO-004", categoryId: categories["clothing"].id, price: 1199, comparePrice: 1799, stockQuantity: 60, description: "Premium wrinkle-free formal shirt perfect for office and events.", shortDescription: "Wrinkle-free formal shirt", tags: ["shirt", "formal", "office"] },

      // Shoes
      { name: "Running Sports Shoes", slug: "running-sports-shoes", sku: "SHO-001", categoryId: categories["shoes"].id, price: 2999, comparePrice: 4499, stockQuantity: 40, isFeatured: true, description: "Lightweight running shoes with responsive cushioning and breathable mesh upper.", shortDescription: "Lightweight running shoes", tags: ["running", "sports", "shoes"] },
      { name: "Casual Leather Sneakers", slug: "casual-leather-sneakers", sku: "SHO-002", categoryId: categories["shoes"].id, price: 1999, comparePrice: 2999, stockQuantity: 55, description: "Classic white leather sneakers for everyday casual wear.", shortDescription: "White leather casual sneakers", tags: ["sneakers", "leather", "casual"] },
      { name: "Formal Oxford Shoes", slug: "formal-oxford-shoes", sku: "SHO-003", categoryId: categories["shoes"].id, price: 3499, comparePrice: 4999, stockQuantity: 25, description: "Handcrafted genuine leather Oxford shoes for formal occasions.", shortDescription: "Genuine leather Oxford shoes", tags: ["formal", "oxford", "leather"] },
      { name: "Hiking Boots", slug: "hiking-boots", sku: "SHO-004", categoryId: categories["shoes"].id, price: 3999, comparePrice: 5499, stockQuantity: 20, description: "Durable waterproof hiking boots with ankle support and rugged sole.", shortDescription: "Waterproof hiking boots", tags: ["hiking", "boots", "outdoor"] },

      // Accessories
      { name: "Leather Wallet", slug: "leather-wallet", sku: "ACC-001", categoryId: categories["accessories"].id, price: 799, comparePrice: 1299, stockQuantity: 90, description: "Genuine leather bi-fold wallet with RFID blocking technology.", shortDescription: "RFID blocking leather wallet", tags: ["wallet", "leather", "rfid"] },
      { name: "Aviator Sunglasses", slug: "aviator-sunglasses", sku: "ACC-002", categoryId: categories["accessories"].id, price: 999, comparePrice: 1799, stockQuantity: 70, description: "Classic aviator sunglasses with UV400 protection and polarized lenses.", shortDescription: "UV400 polarized aviator sunglasses", tags: ["sunglasses", "aviator", "uv-protection"] },
      { name: "Canvas Backpack", slug: "canvas-backpack", sku: "ACC-003", categoryId: categories["accessories"].id, price: 1299, comparePrice: 1999, stockQuantity: 45, description: "Durable canvas backpack with laptop compartment and multiple pockets.", shortDescription: "Canvas backpack with laptop pocket", tags: ["backpack", "canvas", "laptop"] },
      { name: "Digital Wrist Watch", slug: "digital-wrist-watch", sku: "ACC-004", categoryId: categories["accessories"].id, price: 1599, comparePrice: 2499, stockQuantity: 35, description: "Stylish digital watch with stopwatch, alarm, and water resistance.", shortDescription: "Water-resistant digital watch", tags: ["watch", "digital", "waterproof"] },

      // Home & Living
      { name: "Memory Foam Pillow", slug: "memory-foam-pillow", sku: "HOME-001", categoryId: categories["home-living"].id, price: 999, comparePrice: 1599, stockQuantity: 60, description: "Ergonomic memory foam pillow for neck support and restful sleep.", shortDescription: "Ergonomic memory foam pillow", tags: ["pillow", "memory-foam", "sleep"] },
      { name: "Stainless Steel Water Bottle", slug: "stainless-steel-water-bottle", sku: "HOME-002", categoryId: categories["home-living"].id, price: 499, comparePrice: 799, stockQuantity: 120, description: "Double-walled vacuum insulated steel bottle keeps drinks hot/cold for 24hrs.", shortDescription: "Insulated steel water bottle", tags: ["bottle", "steel", "insulated"] },
      { name: "LED Desk Lamp", slug: "led-desk-lamp", sku: "HOME-003", categoryId: categories["home-living"].id, price: 1299, comparePrice: 1999, stockQuantity: 40, description: "Adjustable LED desk lamp with 5 brightness levels and USB charging port.", shortDescription: "Adjustable LED lamp with USB port", tags: ["lamp", "led", "desk"] },
      { name: "Ceramic Coffee Mug Set", slug: "ceramic-coffee-mug-set", sku: "HOME-004", categoryId: categories["home-living"].id, price: 699, comparePrice: 999, stockQuantity: 75, description: "Set of 4 handcrafted ceramic mugs in assorted colors.", shortDescription: "Set of 4 ceramic mugs", tags: ["mug", "ceramic", "coffee"] },
    ];

    for (const prod of productData) {
      await Product.findOrCreate({
        where: { sku: prod.sku },
        defaults: prod,
      });
    }
    console.log("✅ Products created (20 items)");

    // ─── 4. Create Coupons ───
    const couponData = [
      {
        code: "WELCOME10",
        name: "Welcome Discount",
        description: "10% off on your first order",
        type: "percentage",
        value: 10,
        maxDiscountAmount: 500,
        minimumAmount: 500,
        usageLimit: 1000,
        usageLimitPerUser: 1,
        startDate: new Date("2025-01-01"),
        endDate: new Date("2027-12-31"),
        isActive: true,
        isGlobal: true,
      },
      {
        code: "FLAT200",
        name: "Flat 200 Off",
        description: "Flat Rs.200 off on orders above Rs.1500",
        type: "fixed",
        value: 200,
        maxDiscountAmount: 200,
        minimumAmount: 1500,
        usageLimit: 500,
        usageLimitPerUser: 3,
        startDate: new Date("2025-06-01"),
        endDate: new Date("2027-06-30"),
        isActive: true,
        isGlobal: true,
      },
      {
        code: "SUMMER25",
        name: "Summer Sale",
        description: "25% off summer collection items",
        type: "percentage",
        value: 25,
        maxDiscountAmount: 1000,
        minimumAmount: 1000,
        usageLimit: 200,
        usageLimitPerUser: 2,
        startDate: new Date("2026-04-01"),
        endDate: new Date("2026-08-31"),
        isActive: true,
        isGlobal: true,
      },
    ];

    for (const coupon of couponData) {
      await Coupon.findOrCreate({
        where: { code: coupon.code },
        defaults: coupon,
      });
    }
    console.log("✅ Coupons created (3 items)");

    console.log("\n🎉 Seed completed successfully!");
    console.log("─────────────────────────────────");
    console.log("Admin Login:");
    console.log("  Email:    admin@shopylib.com");
    console.log("  Password: Admin@1234");
    console.log("─────────────────────────────────\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

seed();
