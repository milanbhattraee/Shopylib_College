import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import sequelize from "./db/db.js";

// import router
import userRouter from "./routes/user.route.js";
import cartRouter from "./routes/cart.route.js";
import categoryRouter from "./routes/category.route.js";
import couponRouter from "./routes/coupon.route.js";

import orderRouter from "./routes/order.route.js";
import productRouter from "./routes/product.route.js";
import reviewRouter from "./routes/review.route.js";
import searchRouter from "./routes/search.route.js";
import wishlistRouter from "./routes/wishlist.route.js";
import bannerRouter from "./routes/banner.route.js";
import authRouter from "./routes/auth.route.js";
import statsRouter from "./routes/stats.route.js";
import { authMiddleware } from "./middleware/auth.middleware.js";

const PORT = process.env.PORT || 8000;
const CORS = process.env.CORS || "http://localhost:3000";

const app = express();

// CORS configuration
app.use(
  cors({
    origin: CORS,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/test", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to the Admin API",
  });
});

// API routes

app.use("/api/v1/users", userRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);

app.use("/api/v1/coupons", authMiddleware, couponRouter);
app.use("/api/v1/carts", authMiddleware, cartRouter);

app.use("/api/v1/orders", authMiddleware, orderRouter);
app.use("/api/v1/reviews", authMiddleware, reviewRouter);

app.use("/api/v1/search", authMiddleware, searchRouter);
app.use("/api/v1/wishlists", authMiddleware, wishlistRouter);
app.use("/api/v1/banners", bannerRouter);
app.use("/api/v1/stats", statsRouter);

// Database connection and server startup
sequelize
  .sync({ force: false })
  .then(async () => {
    console.log("✅ Database tables synced successfully.");

    // Add return columns to orders table if they don't exist
    try {
      await sequelize.query(`
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_orders_returnStatus') THEN
            CREATE TYPE "enum_orders_returnStatus" AS ENUM('none', 'requested', 'approved', 'rejected');
          END IF;
        END$$;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS "returnStatus" "enum_orders_returnStatus" NOT NULL DEFAULT 'none';
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS "returnReason" TEXT;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS "returnRequestedAt" TIMESTAMPTZ;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS "returnApprovedAt" TIMESTAMPTZ;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS "returnRejectedAt" TIMESTAMPTZ;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS "returnRejectionReason" TEXT;
      `);
      console.log("✅ Return columns migration complete.");
    } catch (migrationErr) {
      console.log("ℹ️  Return columns migration skipped (may already exist):", migrationErr.message);
    }

    return sequelize.authenticate();
  })
  .then(() => {
    console.log("✅ Database connection authenticated successfully.");
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database error:", err);
    process.exit(1);
  });

export { app };
